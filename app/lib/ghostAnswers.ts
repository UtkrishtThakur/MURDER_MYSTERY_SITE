/**
 * GhostID Answer Registry — SERVER-ONLY
 *
 * This module must NEVER be imported from any client component.
 * All answer data lives exclusively on the server.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuestionDef {
    questionId: string;
    /** How to match the user's answer */
    matchMode: 'exact' | 'includes';
    /** Acceptable answers (lowercased, trimmed) */
    acceptableAnswers: string[];
    /** Canonical display answer (shown on success) */
    displayAnswer: string;
    /** Message sent on correct answer */
    successMessage: string;
    /** Message sent on wrong answer */
    failureMessage: string;
    /** Next question id, or null if this is the last */
    nextQuestionId: string | null;
}

export interface TaskDef {
    taskId: string;
    questions: QuestionDef[];
}

// ── Answer Registry ──────────────────────────────────────────────────────────

const TASKS: TaskDef[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // TASK 1 — Breach Investigation (3 questions)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        taskId: 'task1',
        questions: [
            {
                questionId: 'q1',
                matchMode: 'exact',
                acceptableAnswers: ['rishab sen', 'rishab.sen', 'rishab'],
                displayAnswer: 'rishab sen',
                successMessage: '✓ Confirmed — rishab sen',
                failureMessage: '✗ Incorrect. Look more carefully at the logs and try again.',
                nextQuestionId: 'q2',
            },
            {
                questionId: 'q2',
                matchMode: 'exact',
                acceptableAnswers: ['18.6gb', '18.6 gb', '18.6 gigabytes', '18.6'],
                displayAnswer: '18.6 GB',
                successMessage: '✓ Confirmed — 18.6 GB',
                failureMessage: '✗ Incorrect. Look more carefully at the logs and try again.',
                nextQuestionId: 'q3',
            },
            {
                questionId: 'q3',
                matchMode: 'exact',
                acceptableAnswers: ['203.0.113.45'],
                displayAnswer: '203.0.113.45',
                successMessage: '✓ Confirmed — 203.0.113.45',
                failureMessage: '✗ Incorrect. Look more carefully at the logs and try again.',
                nextQuestionId: null,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TASK 2 — CCTV Investigation (2 questions)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        taskId: 'task2',
        questions: [
            {
                questionId: 'q1',
                matchMode: 'exact',
                acceptableAnswers: ['lab 7'],
                displayAnswer: 'Lab 7',
                successMessage: 'Interesting.\n\nContinue.',
                failureMessage: "That's not right. Try again.\n\nQ1. Which camera gets corrupted?",
                nextQuestionId: 'q2',
            },
            {
                questionId: 'q2',
                matchMode: 'exact',
                acceptableAnswers: ['a figure on the floor', 'unconscious body-shaped figure', 'body', 'dead body'],
                displayAnswer: 'A figure on the floor',
                successMessage: "Weird…\n\nI got this patch Rishab was working on.\nWas he sabotaging?",
                failureMessage: "That's not right. Try again.\n\nQ2. What appears after corrupted frames return?",
                nextQuestionId: null,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TASK 3 — Code Audit (3 questions, keyword matching)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        taskId: 'task3',
        questions: [
            {
                questionId: 'q1',
                matchMode: 'includes',
                acceptableAnswers: ['rishab', 'rishabpatch', 'rishabsen'],
                displayAnswer: 'rishabPatch.py',
                successMessage: 'Safety logic confirmed.',
                failureMessage: 'Incorrect. Which file calls shutdown_device() when intensity exceeds threshold?',
                nextQuestionId: 'q2',
            },
            {
                questionId: 'q2',
                matchMode: 'includes',
                acceptableAnswers: ['company', 'hotfix', 'ghostid41', 'companypatch', 'companyhotfix'],
                displayAnswer: 'company.py',
                successMessage: 'Seems intentional.',
                failureMessage: 'Incorrect. Which file injects continue_operation() instead of halting?',
                nextQuestionId: 'q3',
            },
            {
                questionId: 'q3',
                matchMode: 'includes',
                acceptableAnswers: ['emergency', 'emergencyshutdown', 'shutdowntriggered'],
                displayAnswer: 'emergency shutdown triggered',
                successMessage: 'Your conclusion diverges from internal reporting.\nTelemetry unlocked.',
                failureMessage: 'Incorrect. Read the log_event() call in rishab_patch.py carefully.',
                nextQuestionId: null,
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TASK 4 — Telemetry (1 chat question + decrypt verification)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        taskId: 'task4',
        questions: [
            {
                questionId: 'q1',
                matchMode: 'exact',
                acceptableAnswers: ['21:15', '2115'],
                displayAnswer: '21:15',
                successMessage: '21:15. Correct.\nThe system failure and the lab incident happened at the same time.\nMovement forensics unlocked.',
                failureMessage: 'Incorrect. The ciphertext you decrypted is your answer. Format: HH:MM',
                nextQuestionId: null,
            },
            {
                questionId: 'decrypt',
                matchMode: 'exact',
                acceptableAnswers: ['nb-prod-41-hf'],
                displayAnswer: '21:15',
                successMessage: '21:15. Decryption confirmed.\nThe system failure and the lab incident happened at the same time.\nMovement forensics unlocked.',
                failureMessage: 'Wrong key. Device ID is in the overview tab.',
                nextQuestionId: 'q1',
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TASK 5 — Movement Forensics
    // ═══════════════════════════════════════════════════════════════════════════
    {
        taskId: 'task5',
        questions: [
            {
                questionId: 'task1_select',
                matchMode: 'exact',
                acceptableAnswers: ['rishab sen'],
                displayAnswer: 'Rishab Sen',
                successMessage: '✓ CORRECT — Rishab Sen (EMP-019) entered Lab 7 at 21:44 with no exit recorded. Unlocking Elevator Analytics...',
                failureMessage: '✗ INCORRECT — Review the access log timestamps carefully. Look for an entry with no exit record.',
                nextQuestionId: null,
            },
            {
                questionId: 'task3_chat',
                matchMode: 'exact',
                // Accept any string longer than 8 chars — validation is "length > 8"
                acceptableAnswers: ['__LENGTH_GT_8__'],
                displayAnswer: '',
                successMessage: 'Analysis recorded. The sequence of events points to an unscheduled intake — followed by access restrictions and audit suppression. Submit your full report using the button below.',
                failureMessage: 'Keep analysing. Look for the pattern in the timestamps and what changed after the intake event.',
                nextQuestionId: null,
            },
            {
                questionId: 'elevator_load',
                matchMode: 'exact',
                acceptableAnswers: ['person,gurney'],
                displayAnswer: 'PERSON + GURNEY (104 kg)',
                successMessage: '✓ WEIGHT MATCH — Combination confirmed',
                failureMessage: 'Transport weight inconsistent.',
                nextQuestionId: null,
            },
        ],
    },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

const taskMap = new Map<string, TaskDef>();
const questionMap = new Map<string, QuestionDef>();

for (const task of TASKS) {
    taskMap.set(task.taskId, task);
    for (const q of task.questions) {
        questionMap.set(`${task.taskId}::${q.questionId}`, q);
    }
}

export function getTask(taskId: string): TaskDef | undefined {
    return taskMap.get(taskId);
}

export function getQuestion(taskId: string, questionId: string): QuestionDef | undefined {
    return questionMap.get(`${taskId}::${questionId}`);
}

/**
 * Normalize user input for comparison:
 * - trim
 * - lowercase
 * - collapse whitespace
 */
export function normalizeAnswer(raw: string): string {
    return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalize for keyword/includes matching (strip dots, spaces, underscores, hyphens)
 */
export function normalizeForKeyword(raw: string): string {
    return raw.trim().toLowerCase().replace(/[\.\s_\-]/g, '');
}

/**
 * Check whether the user's answer is correct for a given question.
 */
export function checkAnswer(q: QuestionDef, rawAnswer: string): boolean {
    // Special case: task5/task3_chat accepts any string > 8 chars
    if (q.acceptableAnswers.length === 1 && q.acceptableAnswers[0] === '__LENGTH_GT_8__') {
        return rawAnswer.trim().length > 8;
    }

    if (q.matchMode === 'includes') {
        const normalized = normalizeForKeyword(rawAnswer);
        return q.acceptableAnswers.some(a => normalized.includes(a));
    }

    // exact match
    const normalized = normalizeAnswer(rawAnswer);
    return q.acceptableAnswers.some(a => normalized === a);
}
