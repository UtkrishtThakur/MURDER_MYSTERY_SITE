import { NextRequest, NextResponse } from 'next/server';
import { getTask, getQuestion, checkAnswer } from '@/app/lib/ghostAnswers';
import { getTeam } from '@/app/lib/auth';
import crypto from 'crypto';

// ── CryptoJS-compatible AES-256-CBC encryption (OpenSSL "Salted__" format) ──
function cryptoJsEncrypt(plaintext: string, passphrase: string): string {
    const salt = crypto.randomBytes(8);
    function evpBytesToKey(pass: Buffer, salt: Buffer): { key: Buffer; iv: Buffer } {
        const keyLen = 32;
        const ivLen = 16;
        const totalLen = keyLen + ivLen;
        const result: Buffer[] = [];
        let d = Buffer.alloc(0);
        while (Buffer.concat(result).length < totalLen) {
            d = crypto.createHash('md5').update(Buffer.concat([d, pass, salt])).digest();
            result.push(d);
        }
        const concat = Buffer.concat(result);
        return { key: concat.subarray(0, keyLen), iv: concat.subarray(keyLen, keyLen + ivLen) };
    }
    const { key, iv } = evpBytesToKey(Buffer.from(passphrase, 'utf8'), salt);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const result = Buffer.concat([Buffer.from('Salted__', 'utf8'), salt, encrypted]);
    return result.toString('base64');
}

// Task 4 secrets (server-only)
const TASK4_AES_KEY = 'NEUROSPHERE_NB-PROD-41-HF';
const TASK4_PLAINTEXT = '21:15';

let cachedCiphertext: string | null = null;
function getTask4Ciphertext(): string {
    if (!cachedCiphertext) {
        cachedCiphertext = cryptoJsEncrypt(TASK4_PLAINTEXT, TASK4_AES_KEY);
    }
    return cachedCiphertext;
}

export async function POST(req: NextRequest) {
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const { taskId, questionId, answer } = body as {
        taskId?: string;
        questionId?: string;
        answer?: string;
    };

    // ── Validate required fields ─────────────────────────────────────────────
    if (!taskId || !questionId || typeof answer !== 'string') {
        return NextResponse.json(
            { error: 'Missing required fields: taskId, questionId, answer' },
            { status: 400 }
        );
    }

    // ── Authenticate and Apply Rate Limits / Disqualification ──
    const team = await getTeam();
    if (!team) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (team.isDisqualified) {
        return NextResponse.json({ error: 'Team is disqualified' }, { status: 403 });
    }

    // 3 second cooldown for rate limiting
    const now = new Date();
    if (team.lastAttempt && (now.getTime() - team.lastAttempt.getTime() < 3000)) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please wait 3 seconds.' }, { status: 429 });
    }

    // Update last attempt immediately to prevent concurrent brute force
    team.lastAttempt = now;
    await (team as any).save();

    // ── Enforce strict progression ───────────────────────────────────────────
    const taskIndex = parseInt(taskId.replace('task', '')) - 1;
    if (!isNaN(taskIndex)) {
        if (taskIndex > team.progress) {
            return NextResponse.json({ error: 'Task locked' }, { status: 403 });
        }
        // If it's not the getting of the cipher, block replay of completed tasks
        if (!(taskId === 'task4' && questionId === 'get_cipher')) {
            if (taskIndex < team.progress) {
                return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
            }
        }
    }

    // ── Special: Task 4 cipher generation ────────────────────────────────────
    if (taskId === 'task4' && questionId === 'get_cipher') {
        return NextResponse.json({
            ciphertext: getTask4Ciphertext(),
        });
    }

    // ── Look up task ─────────────────────────────────────────────────────────
    const task = getTask(taskId);
    if (!task) {
        return NextResponse.json(
            { error: `Unknown task: ${taskId}` },
            { status: 404 }
        );
    }

    // ── Look up question ─────────────────────────────────────────────────────
    const question = getQuestion(taskId, questionId);
    if (!question) {
        return NextResponse.json(
            { error: `Unknown question: ${questionId} in task ${taskId}` },
            { status: 404 }
        );
    }

    // ── Check answer ─────────────────────────────────────────────────────────
    const correct = checkAnswer(question, answer);

    if (correct) {
        const isLast = question.nextQuestionId === null;

        if (isLast && !team.isDisqualified) {
            const currentTaskIndex = parseInt(taskId.replace('task', '')) - 1;
            if (!isNaN(currentTaskIndex) && team.progress === currentTaskIndex) {
                team.progress += 1;
                await (team as any).save();
            }
        }

        return NextResponse.json({
            correct: true,
            displayAnswer: question.displayAnswer,
            successMessage: question.successMessage,
            nextQuestionId: question.nextQuestionId,
            completed: isLast,
        });
    }

    return NextResponse.json({
        correct: false,
        failureMessage: question.failureMessage,
    });
}
