'use client'
//
import { useState, useEffect, useRef, useCallback } from "react";
import { verifyGhostAnswer } from "@/app/lib/verifyGhostAnswer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feed {
    id: string;
    cameraName: string;
    timestamp: string;
    location: string;
    videoUrl: string;
}

interface TimelineEvent {
    time: string;
    event: string;
    type: "system" | "user" | "alert";
    description: string;
}

interface Question {
    q: string;
    qId: string;
}

interface Riddle {
    type: "jumble" | "riddle" | "decode";
    label: string;
    challenge: string;
    hint: string;
    answer: string;
    explanation: string;
}

interface GhostMessage {
    id: number;
    text: string;
    label: string;
    isUser: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ZONES = [
    "LAB 7 - ENTRANCE", "LAB 7 - SERVER RACK", "LAB 7 - CORRIDOR",
    "LAB 7 - RECEPTION", "LAB 7 - LOADING DOCK", "LAB 7 - VENTILATION",
];
const TIME_STEPS = ["21:10", "21:40", "22:10", "22:40"];
const VIDEO_SOURCES = [
    // LAB 7 - ENTRANCE
    "https://drive.google.com/drive/folders/1rpj4k3qPf3xFA0DuTO6LnToqBn43s1QD", // Entrance 21:10
    "https://www.youtube.com/shorts/_6HzLIJPH2A", // Entrance 21:40
    "https://drive.google.com/drive/folders/1uKuCeKtnkloGIfmM7Ap2WzaEsamVNEqW", // Entrance 22:10
    "https://drive.google.com/drive/folders/1QhAKI3x5TFoH5YEv9gvgpgpFjMOC9TSP", // Entrance 22:40

    // LAB 7 - SERVER RACK
    "https://drive.google.com/drive/folders/1fWBTB_hsGaMWum6SDlhPmWqFSUlP0Eam",   // Server Rack 21:10
    "https://www.youtube.com/shorts/zgXWup8yNmE",   // Server Rack 21:40
    "https://www.youtube.com/shorts/9xAGpkbf9ws",   // Server Rack 22:10
    "https://drive.google.com/drive/folders/1TJoc3DhfbFmjKLt6DaEglXb6t29cpfBS",   // Server Rack 22:40

    // LAB 7 - CORRIDOR
    "https://www.youtube.com/shorts/c4K3grpZM7s?app=desktop", // Corridor 21:10
    "https://drive.google.com/drive/folders/1lGil0OFd6FT4VsBc1Ew3YjP9NJEemcIR", // Corridor 21:40
    "https://www.youtube.com/shorts/mLPEuB3rZbw", // Corridor 22:10
    "https://drive.google.com/drive/folders/1BFZ2PN27Ro_kvq2mlYsM9ZYWnq1hMgoN", // Corridor 22:40

    // LAB 7 - RECEPTION
    "https://www.youtube.com/shorts/o1nbk0UWlO8", // Reception 21:10
    "https://www.youtube.com/shorts/2hY_qVKK5OM", // Reception 21:40
    "https://drive.google.com/drive/folders/1ojkjeF8b0xRQpAggHmCZWmyfjD0i8Th7", // Reception 22:10
    "https://www.youtube.com/shorts/rKWMzbS2zU8", // Reception 22:40

    // LAB 7 - LOADING DOCK
    "https://www.youtube.com/shorts/HDDCtBhuzgc",      // Loading Dock 21:10
    "http://drive.google.com/drive/folders/1jT5DFXqTYsdCprs2FNr55ToLymieRW2O",      // Loading Dock 21:40
    "https://www.youtube.com/shorts/yrvCMl65ol4",      // Loading Dock 22:10
    "https://drive.google.com/drive/folders/13V7UzQfdG1Joop2QZ7mKx666a0UcPq_X",      // Loading Dock 22:40

    // LAB 7 - VENTILATION
    "https://www.youtube.com/shorts/pztqknNW7-k",      // Ventilation 21:10
    "https://drive.google.com/drive/folders/15VEjn4Fm2n1pMqVSXr7OBLK96Iq8v7Va",      // Ventilation 21:40
    "https://drive.google.com/drive/folders/1Pyedd2ObeMsHWqOxg-i5rWoo_qMO8Wf1",      // Ventilation 22:10
    "https://www.youtube.com/shorts/UTVf7eA-q30",      // Ventilation 22:40
];

const FEEDS: Feed[] = ZONES.flatMap((z, zi) =>
    TIME_STEPS.map((t, ti) => ({
        id: `EX-${zi + 1}${ti + 1}`,
        cameraName: z,
        timestamp: `2024-11-24 ${t}:00`,
        location: z,
        videoUrl: VIDEO_SOURCES[zi * 4 + ti] || "",
    }))
);

const TL_EVENTS: TimelineEvent[] = [
    { time: "21:00", event: "BOOT", type: "system", description: "System initialization complete." },
    { time: "21:10", event: "FEED_ON", type: "system", description: "CCTV Feeds activated." },
    { time: "21:15", event: "VPN_IN", type: "user", description: "Remote access established from 192.168.1.45" },
    { time: "21:20", event: "CAM_FAIL", type: "alert", description: "Signal loss detected in LAB 7 - VENTILATION" },
    { time: "21:30", event: "DOOR_OPEN", type: "user", description: "Manual override on RECEPTION door." },
    { time: "21:45", event: "VPN_OUT", type: "user", description: "Remote session terminated." },
    { time: "22:05", event: "SYNC", type: "system", description: "Database synchronization started." },
    { time: "22:10", event: "LOG_WIPE", type: "alert", description: "Unauthorized deletion attempt in system logs." },
    { time: "22:15", event: "REBOOT", type: "system", description: "Emergency system restart initiated." },
    { time: "22:30", event: "END", type: "system", description: "Operational window closed." },
];

const QS: Question[] = [
    {
        q: "Q1. Which camera gets corrupted?",
        qId: "q1",
    },
    {
        q: "Q2. What appears after corrupted frames return?",
        qId: "q2",
    },
];

const RIDDLES: Riddle[] = [
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► LORCEPOMI", hint: "It translates source code into machine code.", answer: "compiler", explanation: "LORCEPOMI → COMPILER — translates high-level code to machine instructions." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I have branches but no leaves,\ncommits but no crimes,\nand a HEAD that never thinks.\nWhat am I?", hint: "Developers push and pull from me daily.", answer: "git", explanation: "GIT — a version control system with branches, commits, and a HEAD pointer." },
    { type: "decode", label: "HEX_DECODE", challenge: "Decode this hex sequence:\n\n  ► 4C 4F 4F 50", hint: "Every programmer uses this construct to repeat actions.", answer: "loop", explanation: "4C→L  4F→O  4F→O  50→P  →  LOOP" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► UECQNEE", hint: "Data structures store elements in this ordered form.", answer: "sequence", explanation: "UECQNEE → SEQUENCE — an ordered list of elements." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I store your data in key-value pairs,\nI am neither a list nor a tree,\nPython calls me a dict,\nJavaScript calls me an object.\nWhat am I?", hint: "Think hash tables.", answer: "hashmap", explanation: "HASHMAP — a key-value data structure, known as dict in Python." },
    { type: "decode", label: "BINARY_DECODE", challenge: "Decode this binary:\n\n  ► 01000010 01010101 01000111", hint: "Developers hunt these in their code every day.", answer: "bug", explanation: "01000010→B  01010101→U  01000111→G  →  BUG" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► RIOITNMHGAL", hint: "A step-by-step procedure for solving a problem.", answer: "algorithm", explanation: "RIOITNMHGAL → ALGORITHM — a defined set of steps to solve a problem." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I wrap your code in a safety net,\nI catch what others throw,\nWithout me your program crashes,\nWith me, errors flow.\nWhat am I?", hint: "try { } ___ { }", answer: "catch", explanation: "CATCH — the block that handles exceptions thrown by try blocks." },
    { type: "decode", label: "HEX_DECODE", challenge: "Decode this hex sequence:\n\n  ► 4E 55 4C 4C", hint: "The value that represents the absence of a value.", answer: "null", explanation: "4E→N  55→U  4C→L  4C→L  →  NULL" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► ONKTEECAPTLINAS", hint: "OOP principle of bundling data and methods together.", answer: "encapsulation", explanation: "ONKTEECAPTLINAS → ENCAPSULATION — hiding internal state in OOP." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I am a function that calls itself,\nI have a base case or I run forever,\nFibonacci loves me,\nStack overflow fears me.\nWhat am I?", hint: "Think: f(n) = f(n-1) + f(n-2)", answer: "recursion", explanation: "RECURSION — a function that calls itself until a base case is reached." },
    { type: "decode", label: "BINARY_DECODE", challenge: "Decode this binary:\n\n  ► 01000001 01010000 01001001", hint: "How applications talk to each other over the web.", answer: "api", explanation: "01000001→A  01010000→P  01001001→I  →  API" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► LYOIMHOPRSMP", hint: "OOP concept: one interface, many forms.", answer: "polymorphism", explanation: "LYOIMHOPRSMP → POLYMORPHISM — many forms for the same interface." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I live in RAM, I grow and shrink,\nI follow LIFO rules strictly,\nFunctions push onto me,\nand pop off when done.\nWhat am I?", hint: "Last in, first out.", answer: "stack", explanation: "STACK — a LIFO data structure used for function call management." },
    { type: "decode", label: "HEX_DECODE", challenge: "Decode this hex sequence:\n\n  ► 48 45 41 50", hint: "Dynamic memory allocation happens here.", answer: "heap", explanation: "48→H  45→E  41→A  50→P  →  HEAP" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► TRAABIOSCTN", hint: "Hiding complexity and exposing only essential features.", answer: "abstraction", explanation: "TRAABIOSCTN → ABSTRACTION — simplifying complex systems." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I am true or false, one or zero,\nGeorge Boole invented my logic,\nAND, OR, NOT — these are my gates.\nWhat am I?", hint: "Think: boolean.", answer: "boolean", explanation: "BOOLEAN — a data type with only two values: true or false." },
    { type: "decode", label: "BINARY_DECODE", challenge: "Decode this binary:\n\n  ► 01010011 01010001 01001100", hint: "Language used to query relational databases.", answer: "sql", explanation: "01010011→S  01010001→Q  01001100→L  →  SQL" },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I connect your app to the internet,\nI have a number from 0 to 65535,\n80 is for HTTP, 443 for HTTPS.\nWhat am I?", hint: "Network traffic enters and exits through me.", answer: "port", explanation: "PORT — a numerical endpoint for network communication (0–65535)." },
    { type: "decode", label: "HEX_DECODE", challenge: "Decode this hex sequence:\n\n  ► 43 4F 44 45", hint: "What you write all day long.", answer: "code", explanation: "43→C  4F→O  44→D  45→E  →  CODE" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► NTITROEAIR", hint: "Repeating a process — like a for loop.", answer: "iteration", explanation: "NTITROEAIR → ITERATION — repeating a sequence of instructions." },
    { type: "riddle", label: "LOGIC_RIDDLE", challenge: "I am a contract between classes,\nI have no body, only signatures,\nJava and TypeScript love me.\nWhat am I?", hint: "Think: implements ___", answer: "interface", explanation: "INTERFACE — a contract defining method signatures without implementation." },
    { type: "decode", label: "BINARY_DECODE", challenge: "Decode this binary:\n\n  ► 01001011 01000101 01011001", hint: "Cryptography and maps both use this concept.", answer: "key", explanation: "01001011→K  01000101→E  01011001→Y  →  KEY" },
    { type: "jumble", label: "CODE_JUMBLE", challenge: "Unjumble this programming term:\n\n  ► LBREAIAV", hint: "A named storage location in memory.", answer: "variable", explanation: "LBREAIAV → VARIABLE — a named container that holds a value." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function timeToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function posPercent(t: string): number {
    return ((timeToMinutes(t) - 21 * 60) / 120) * 100;
}

function getRiddle(feedId: string): Riddle {
    const idx = parseInt(feedId.replace("EX-", ""), 10);
    return RIDDLES[(idx - 1) % RIDDLES.length];
}

// ─── Ghost SVG ────────────────────────────────────────────────────────────────

function GhostSVG({ size = 44 }: { size?: number }) {
    return (
        <svg viewBox="0 0 32 32" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="6" width="16" height="18" fill="#c8c8c8" />
            <rect x="6" y="8" width="2" height="14" fill="#c8c8c8" />
            <rect x="24" y="8" width="2" height="14" fill="#c8c8c8" />
            <rect x="10" y="4" width="12" height="4" fill="#c8c8c8" />
            <rect x="8" y="5" width="16" height="2" fill="#c8c8c8" />
            <rect x="6" y="22" width="4" height="4" fill="#c8c8c8" />
            <rect x="14" y="22" width="4" height="4" fill="#c8c8c8" />
            <rect x="22" y="22" width="4" height="4" fill="#c8c8c8" />
            <rect x="10" y="24" width="4" height="2" fill="#071525" />
            <rect x="18" y="24" width="4" height="2" fill="#071525" />
            <rect x="11" y="12" width="4" height="4" fill="#071525" />
            <rect x="17" y="12" width="4" height="4" fill="#071525" />
            <rect x="12" y="13" width="1" height="1" fill="#00d4c8" />
            <rect x="18" y="13" width="1" height="1" fill="#00d4c8" />
        </svg>
    );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Courier Prime',monospace;background-color:#020202;
    background-image:radial-gradient(circle at 50% 40%,rgba(150,0,0,0.15) 0%,rgba(0,0,0,1) 100%),
      url('https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2071&auto=format&fit=crop');
    background-size:cover;background-position:center;background-attachment:fixed;
    color:#dcd4c3;overflow-x:hidden;min-height:100vh;}
  body::before{content:" ";display:block;position:fixed;inset:0;
    background:linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.2) 50%),
      linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03));
    z-index:0;background-size:100% 2px,3px 100%;pointer-events:none;
    backdrop-filter:blur(4px) contrast(1.1) brightness(0.7);
    box-shadow:inset 0 0 100px rgba(230,0,0,0.1);}
  .sf{font-family:'Special Elite',cursive;}
  ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#000;}::-webkit-scrollbar-thumb{background:#e60000;}
  .grid-bg{background-image:linear-gradient(rgba(117,2,15,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(117,2,15,0.1) 1px,transparent 1px);background-size:40px 40px;}
  @keyframes scan{0%{transform:translateY(-100%);}100%{transform:translateY(100%);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
  @keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(2);opacity:0;}}
  @keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
  @keyframes bslow{0%,100%,20%,50%,80%{transform:translateY(0);}40%{transform:translateY(-10px);}60%{transform:translateY(-5px);}}
  @keyframes ghostfloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-8px) scale(1.04);}}
  @keyframes ghostglow{0%,100%{filter:drop-shadow(0 0 6px rgba(0,212,200,0.5));}50%{filter:drop-shadow(0 0 14px rgba(0,212,200,0.9));}}
  @keyframes sright{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
  @keyframes zin{from{opacity:0;transform:scale(.95);}to{opacity:1;transform:scale(1);}}
  .ap{animation:pulse 2s infinite;}
  .apg{animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;}
  .ab{animation:bounce 1s ease-in-out infinite;}
  .bd1{animation-delay:-0.3s;}.bd2{animation-delay:-0.15s;}.bd3{animation-delay:0s;}
  .az{animation:zin .4s ease forwards;}
  .ghost-float{animation:ghostfloat 3s ease-in-out infinite,ghostglow 3s ease-in-out infinite;}
  .sk{transform:skewX(-12deg);}.ski{display:inline-block;transform:skewX(12deg);}
  .fc{border:2px solid #e60000;background:rgba(10,10,10,.8);box-shadow:0 0 15px rgba(230,0,0,0.4);position:relative;overflow:hidden;transition:all .3s;}
  .fc::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 0%,rgba(117,2,15,.05) 50%,transparent 100%);animation:scan 4s linear infinite;pointer-events:none;}
  .tl-line{position:absolute;left:3rem;right:3rem;top:50%;transform:translateY(-50%);height:1px;background:#e60000;box-shadow:0 0 15px #e60000;z-index:0;}
`;

// ─── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onBegin }: { onBegin: () => void }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div className="az" style={{ width: "100%", maxWidth: "40rem", background: "#0a0a0a", border: "1px solid rgba(230,0,0,.3)", borderRadius: "1rem", boxShadow: "0 0 50px rgba(230,0,0,.15)", overflow: "hidden" }}>
                <div style={{ padding: "1.5rem 1.5rem .5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem" }}>
                    <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", border: "2px solid rgba(230,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", position: "relative" }}>
                        <svg className="ap" width="24" height="24" fill="none" stroke="#e60000" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <div className="apg" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #e60000", opacity: .2 }} />
                    </div>
                    <div>
                        <h2 className="sf" style={{ color: "#fff", fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, letterSpacing: ".3em", textTransform: "uppercase", textShadow: "0 0 15px rgba(230,0,0,.5)" }}>Task 2: Investigation</h2>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".75rem", marginTop: ".5rem" }}>
                            <div style={{ height: "1px", width: "2.5rem", background: "rgba(230,0,0,.5)" }} />
                            <span className="sf" style={{ color: "#f87171", fontSize: ".6rem", letterSpacing: ".3em", textTransform: "uppercase", fontWeight: 900, background: "rgba(0,0,0,.6)", padding: ".2rem .5rem", borderRadius: "99px", border: "1px solid rgba(153,0,0,.5)" }}>GHOST41_ID Protocol Initiated</span>
                            <div style={{ height: "1px", width: "2.5rem", background: "rgba(230,0,0,.5)" }} />
                        </div>
                    </div>
                </div>
                <div style={{ padding: ".5rem 2rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[
                        { label: "> Scanning surveillance network…", body: "Multiple camera feeds from the laboratory corridor are being processed." },
                        { label: "> Objective Analysis", body: "Carefully observe the available CCTV footage and identify important details from the surveillance data." },
                        { label: "> Communication Protocol", body: "Once confident, open the Ghost41_ID terminal and answer my questions." },
                    ].map((item) => (
                        <div key={item.label}>
                            <p className="ap sf" style={{ color: "#fb923c", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".7rem" }}>{item.label}</p>
                            <p style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem", lineHeight: 1.5, marginTop: ".3rem" }}>{item.body}</p>
                        </div>
                    ))}
                    <p className="sf" style={{ fontSize: ".7rem", color: "rgba(255,255,255,.7)", fontStyle: "italic", background: "rgba(153,0,0,.2)", padding: ".5rem", borderRadius: ".5rem", border: "1px solid rgba(153,0,0,.3)" }}>
                        Note: You may retry each question as many times as necessary.
                    </p>
                    <p className="sf" style={{ color: "#f87171", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".9rem", textAlign: "center" }}>Are you ready to proceed?</p>
                </div>
                <div style={{ padding: "1rem 1.5rem", background: "rgba(17,16,18,.5)", borderTop: "1px solid rgba(230,0,0,.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".75rem" }}>
                    <button onClick={onBegin} className="sf"
                        style={{ padding: ".75rem 2.5rem", background: "rgba(230,0,0,.1)", border: "1px solid rgba(230,0,0,.5)", borderRadius: ".75rem", color: "#e60000", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".75rem", cursor: "pointer", transition: "all .3s" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(230,0,0,.2)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(230,0,0,.1)")}
                    >[ Begin Investigation ]</button>
                </div>
            </div>
        </div>
    );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ highlightTime }: { highlightTime: string | null }) {
    const [tooltip, setTooltip] = useState<string | null>(null);
    const labels = [{ t: "21:00", p: 0 }, { t: "21:30", p: 25 }, { t: "22:00", p: 50 }, { t: "22:30", p: 75 }, { t: "23:00", p: 100 }];

    return (
        <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="sk" style={{ background: "#e60000", color: "#000", fontWeight: 900, padding: ".5rem 1.5rem", boxShadow: "0 0 15px rgba(230,0,0,.3)" }}>
                    <span className="ski sf">Timeline Viewer</span>
                </div>
                <div style={{ height: "2px", flex: 1, background: "linear-gradient(to right,rgba(230,0,0,.5),transparent)" }} />
            </div>
            <div style={{ background: "rgba(10,10,10,.8)", backdropFilter: "blur(12px)", border: "2px solid rgba(230,0,0,.3)", padding: "2rem", boxShadow: "0 0 40px rgba(0,0,0,.5)", overflow: "hidden", position: "relative" }}>
                <div style={{ width: "100%", height: "10rem", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 3rem" }} className="grid-bg">
                    <div className="tl-line" />

                    {/* Ticks */}
                    <div style={{ position: "absolute", left: "3rem", right: "3rem", top: "50%", transform: "translateY(-50%)", height: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} style={{ width: "1px", background: `rgba(230,0,0,${i % 2 ? ".2" : ".4"})`, height: i % 2 ? "6px" : "10px" }} />
                        ))}
                    </div>

                    {/* Labels */}
                    {labels.map((l) => (
                        <div key={l.t} style={{ position: "absolute", zIndex: 10, left: `calc(${l.p}% + 3rem)`, top: "50%", transform: "translate(-50%,-50%)" }}>
                            <div style={{ width: ".625rem", height: ".625rem", background: "#e60000", border: "1px solid rgba(220,212,195,.3)", borderRadius: "50%", boxShadow: "0 0 8px rgba(230,0,0,.4)" }} />
                            <div className="sf" style={{ marginTop: "2.5rem", fontSize: ".5rem", fontWeight: 900, color: "#57534e", whiteSpace: "nowrap", transform: "translateX(-50%)", textTransform: "uppercase", letterSpacing: ".2em", background: "rgba(0,0,0,.6)", padding: ".1rem .5rem", border: "1px solid rgba(230,0,0,.2)" }}>{l.t}</div>
                        </div>
                    ))}

                    {/* Events */}
                    {TL_EVENTS.map((ev) => {
                        const pos = posPercent(ev.time);
                        if (pos < 0 || pos > 100) return null;
                        const col = ev.type === "alert" ? "#ef4444" : ev.type === "user" ? "#60a5fa" : "rgba(230,0,0,.6)";
                        return (
                            <div key={ev.event} style={{ position: "absolute", zIndex: 10, left: `calc(${pos}% + 3rem)`, top: "50%", transform: "translate(-50%,-50%)" }}
                                onMouseEnter={() => setTooltip(ev.event)} onMouseLeave={() => setTooltip(null)}>
                                <div style={{ width: "1px", height: ev.type === "alert" ? "2rem" : "1.25rem", background: col }} />
                                <div style={{ position: "absolute", top: "-2rem", left: "50%", transform: "translateX(-50%)", fontSize: ".45rem", fontFamily: "'Special Elite',cursive", whiteSpace: "nowrap", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem", border: "1px solid rgba(230,0,0,.1)", color: col, opacity: .6 }}>{ev.event}</div>
                                {tooltip === ev.event && (
                                    <div style={{ position: "absolute", top: "2.5rem", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.9)", border: "1px solid rgba(230,0,0,.4)", padding: ".5rem", zIndex: 50, minWidth: "150px", boxShadow: "0 10px 30px rgba(0,0,0,.8)" }}>
                                        <div style={{ fontSize: ".5rem", color: "#e60000", fontWeight: 900, textTransform: "uppercase", marginBottom: ".25rem" }}>{ev.event} @ {ev.time}</div>
                                        <div style={{ fontSize: ".45rem", color: "#78716c", lineHeight: 1.4 }}>{ev.description}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Highlight */}
                    {highlightTime && (() => {
                        const pos = posPercent(highlightTime);
                        if (pos < 0 || pos > 100) return null;
                        return (
                            <div style={{ position: "absolute", zIndex: 20, left: `calc(${pos}% + 3rem)`, top: "50%", transform: "translate(-50%,-50%)", transition: "left .7s cubic-bezier(.34,1.56,.64,1)" }}>
                                <div style={{ width: "6rem", height: "6rem", border: "1px solid rgba(230,0,0,.6)", borderRadius: "50%", boxShadow: "0 0 30px rgba(230,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(230,0,0,.05)", backdropFilter: "blur(4px)", position: "relative" }}>
                                    <div className="apg" style={{ width: ".375rem", height: ".375rem", background: "#e60000", borderRadius: "50%", boxShadow: "0 0 8px #e60000" }} />
                                    {[["top", "left", "borderTop", "borderLeft"], ["top", "right", "borderTop", "borderRight"], ["bottom", "left", "borderBottom", "borderLeft"], ["bottom", "right", "borderBottom", "borderRight"]].map(([v, h, bt, bl], i) => (
                                        <div key={i} style={{ position: "absolute", [v]: 0, [h]: 0, width: "1rem", height: "1rem", [bt]: "1px solid rgba(230,0,0,.8)", [bl]: "1px solid rgba(230,0,0,.8)" } as React.CSSProperties} />
                                    ))}
                                </div>
                                <div className="sf" style={{ position: "absolute", top: "-3.5rem", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.8)", border: "1px solid rgba(230,0,0,.4)", color: "#e60000", fontSize: ".5rem", padding: ".375rem 1rem", fontWeight: 900, letterSpacing: ".3em", whiteSpace: "nowrap" }}>NODE_SCANNING...</div>
                            </div>
                        );
                    })()}

                    <div className="sf" style={{ position: "absolute", left: "1.5rem", top: "1rem", background: "rgba(0,0,0,.6)", border: "1px solid rgba(230,0,0,.2)", padding: ".2rem .75rem", fontSize: ".5rem", color: "rgba(230,0,0,.6)", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 900 }}>LOG_RECON_ACTIVE</div>
                    <div className="sf" style={{ position: "absolute", right: "1.5rem", bottom: "1rem", background: "rgba(0,0,0,.6)", border: "1px solid rgba(230,0,0,.2)", padding: ".2rem .75rem", fontSize: ".5rem", color: "rgba(230,0,0,.6)", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 900 }}>SIG_MATCH_PENDING</div>
                </div>
            </div>
        </section>
    );
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

function FeedCard({ feed, onClick }: { feed: Feed; onClick: () => void }) {
    const cn = feed.id.split("-")[1];
    const cs = feed.cameraName.split(" - ")[1] || "";
    const time = feed.timestamp.split(" ")[1];
    return (
        <div style={{ cursor: "pointer", transition: "transform .3s" }} onClick={onClick}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
            <div style={{ background: "#0a0a0a", padding: ".375rem", border: "2px solid rgba(230,0,0,.3)", boxShadow: "0 10px 30px rgba(0,0,0,.8),inset 0 0 20px rgba(230,0,0,.1)", borderRadius: "2px", overflow: "hidden", position: "relative", transition: "border-color .3s" }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(230,0,0,.6)")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(230,0,0,.3)")}>
                <div style={{ aspectRatio: "16/9", background: "#000", overflow: "hidden", position: "relative", border: "1px solid rgba(230,0,0,.2)" }}>
                    <img src={`https://picsum.photos/seed/${feed.id}/640/360`} alt="CCTV" referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) brightness(.6) contrast(1.25)", transition: "filter .5s" }}
                        onMouseOver={(e) => (e.currentTarget.style.filter = "grayscale(1) brightness(.8) contrast(1.25)")}
                        onMouseOut={(e) => (e.currentTarget.style.filter = "grayscale(1) brightness(.6) contrast(1.25)")} />
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", padding: ".75rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <span style={{ fontSize: ".6rem", color: "rgba(255,255,255,.9)", fontWeight: 700, letterSpacing: ".2em", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem", display: "block" }}>CAM_{cn}</span>
                                <span style={{ fontSize: ".5rem", color: "rgba(255,255,255,.6)", textTransform: "uppercase", background: "rgba(0,0,0,.2)", padding: ".1rem .25rem", display: "block" }}>{cs}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: ".375rem", background: "rgba(0,0,0,.4)", padding: ".25rem .5rem", borderRadius: "2px" }}>
                                <div className="ap" style={{ width: ".375rem", height: ".375rem", background: "#dc2626", borderRadius: "50%", boxShadow: "0 0 5px #ff0000" }} />
                                <span style={{ fontSize: ".5rem", color: "#fff", fontWeight: 700, letterSpacing: ".2em" }}>REC</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <span style={{ fontSize: ".55rem", color: "#e60000", fontWeight: 900, letterSpacing: ".2em", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem", display: "block" }}>VEC_LOCK</span>
                                <span style={{ fontSize: ".5rem", color: "rgba(255,255,255,.4)", display: "block" }}>{feed.location}</span>
                            </div>
                            <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem" }}>{time}</div>
                        </div>
                    </div>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,.1) 50%)", backgroundSize: "100% 2px", pointerEvents: "none", opacity: .2 }} />
                </div>
                <div style={{ position: "absolute", bottom: ".25rem", right: ".75rem" }}>
                    <div style={{ width: ".25rem", height: ".25rem", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 3px #10b981" }} />
                </div>
            </div>
            <div style={{ marginTop: ".75rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 .25rem" }}>
                <div>
                    <span className="sf" style={{ fontSize: ".55rem", fontWeight: 900, color: "#e60000", textTransform: "uppercase", letterSpacing: ".2em" }}>{feed.id}</span>
                    <div style={{ height: "2px", width: "2rem", background: "rgba(230,0,0,.3)", marginTop: ".125rem" }} />
                </div>
                <span className="sf" style={{ fontSize: ".5rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em" }}>Signal_Verified</span>
            </div>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ feed, onClose }: { feed: Feed; onClose: () => void }) {
    const [panelOpen, setPanelOpen] = useState(true);
    const [unlocked, setUnlocked] = useState(false);
    const [answer, setAnswer] = useState("");
    const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
    const [attempts, setAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);

    const ts = feed.timestamp.split(" ")[1];
    const cn = feed.id.split("-")[1];
    const riddle = getRiddle(feed.id);
    const hash = `BUREAU_UUID::0x${Math.random().toString(16).substr(2, 8).toUpperCase()}\nSTAMPED_UTC::2024-11-24T22:30:14\nAUTH_SIG::UNIT_NINE_VERIFIED`;

    function handleSubmit() {
        if (unlocked) return;
        const val = answer.trim().toLowerCase();
        if (!val) return;
        if (val === riddle.answer.toLowerCase()) {
            setStatus("correct");
            setUnlocked(true);
        } else {
            setStatus("wrong");
            setAttempts((a) => a + 1);
            setAnswer("");
            setTimeout(() => setStatus("idle"), 1800);
        }
    }

    return (
        <div style={{ display: "flex", position: "fixed", inset: 0, zIndex: 150, alignItems: "center", justifyContent: "center", padding: "2rem", background: "rgba(0,0,0,.95)", backdropFilter: "blur(20px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="az" style={{ width: "100%", maxWidth: "1200px", background: "#050505", border: "2px solid rgba(230,0,0,.4)", display: "flex", flexDirection: "column", maxHeight: "95vh", overflow: "hidden", boxShadow: "0 0 150px rgba(230,0,0,.4)", borderRadius: "2px", position: "relative" }}>
                <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: .5 }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000", padding: "1.5rem 2.5rem", borderBottom: "2px solid rgba(230,0,0,.5)", position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4rem" }}>
                        <button onClick={onClose} className="sf" style={{ fontSize: ".85rem", fontWeight: 900, color: "#e60000", textTransform: "uppercase", letterSpacing: ".2em", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "#ff3333")} onMouseOut={(e) => (e.currentTarget.style.color = "#e60000")}>
                            <span style={{ fontSize: "1.5rem" }}>←</span> EXIT_NODE
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".25rem" }}>
                            <span className="sf" style={{ fontSize: "1.2rem", fontWeight: 900, color: "#dcd4c3", textTransform: "uppercase", letterSpacing: ".2em" }}>NODE_ANALYSIS_PROTOCOL</span>
                            <span className="sf" style={{ fontSize: ".6rem", color: unlocked ? "#10b981" : "#e60000", fontWeight: 900, letterSpacing: ".4em" }}>EXHIBIT_{feed.id} // {unlocked ? "DECRYPTED" : "VECTOR_LOCKED"}</span>
                        </div>
                    </div>
                    <button onClick={() => setPanelOpen((p) => !p)} className="sf" style={{ fontSize: ".65rem", fontWeight: 900, textTransform: "uppercase", padding: ".75rem 2rem", border: "1px solid #e60000", color: "#e60000", background: "transparent", cursor: "pointer", letterSpacing: ".2em" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(230,0,0,.2)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                        {panelOpen ? "CLOSE_DATA_STREAM" : "OPEN_DATA_STREAM"}
                    </button>
                </div>

                <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>
                    {/* Video pane */}
                    <div style={{ flex: 1, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, border: "60px solid rgba(0,0,0,.9)", pointerEvents: "none", zIndex: 10 }} />
                        {/* Reticle */}
                        {!unlocked && (
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "16rem", height: "16rem", pointerEvents: "none", zIndex: 20, opacity: .6 }}>
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "8rem", height: "1px", background: "#e60000", boxShadow: "0 0 15px #ff3333" }} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "1px", height: "8rem", background: "#e60000", boxShadow: "0 0 15px #ff3333" }} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "6px", height: "6px", background: "#ff3333", borderRadius: "50%", boxShadow: "0 0 10px #ff3333" }} />
                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "12rem", height: "12rem", border: "1px solid rgba(230,0,0,.3)", borderRadius: "50%" }} />
                            </div>
                        )}
                        <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", border: "8px solid #292524", borderRadius: "2px", overflow: "hidden" }}>
                                <img src={`https://picsum.photos/seed/${feed.id}/1280/720`} alt="Evidence" referrerPolicy="no-referrer"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", filter: unlocked ? "grayscale(0.3) brightness(.85) contrast(1.1)" : "grayscale(1) brightness(.12) contrast(2) blur(10px)", transition: "filter 1.4s ease" }} />
                                {/* HUD overlay */}
                                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(230,0,0,.3)" }}>
                                            <div style={{ color: "#e60000", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".2em" }}>LIVE_FEED::NODE_{cn}</div>
                                            <div style={{ color: "#dcd4c3", fontSize: ".6rem" }}>{feed.cameraName}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(117,2,15,.3)" }}>
                                            <div className="ap" style={{ width: ".5rem", height: ".5rem", background: unlocked ? "#10b981" : "#dc2626", borderRadius: "50%", boxShadow: unlocked ? "0 0 10px #10b981" : "0 0 10px #ff0000" }} />
                                            <span style={{ color: "#fff", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".3em" }}>{unlocked ? "DECRYPTED" : "RECORDING"}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                        <div style={{ background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(230,0,0,.3)" }}>
                                            <div style={{ color: "#e60000", fontSize: ".6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".2em" }}>Location_Data</div>
                                            <div style={{ color: "#dcd4c3", fontSize: ".7rem" }}>{feed.location}</div>
                                        </div>
                                        <div style={{ background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(230,0,0,.3)", textAlign: "right" }}>
                                            <div style={{ color: "#dcd4c3", fontSize: "1.2rem", fontWeight: 900, letterSpacing: ".2em" }}>{ts}</div>
                                            <div style={{ color: "#e60000", fontSize: ".6rem", fontWeight: 900 }}>24-11-2024</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,.1) 50%)", backgroundSize: "100% 4px", pointerEvents: "none", opacity: .3 }} />

                                {/* Locked overlay */}
                                {!unlocked && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", zIndex: 30, background: "rgba(0,0,0,.68)", backdropFilter: "blur(3px)" }}>
                                        <svg width="52" height="52" fill="none" stroke="#e60000" strokeWidth="1.5" viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 12px #e60000)", animation: "pulse 2s infinite", flexShrink: 0 }}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <div style={{ textAlign: "center" }}>
                                            <h4 className="sf" style={{ fontSize: "clamp(.9rem,2vw,1.3rem)", fontWeight: 900, color: "#dcd4c3", textTransform: "uppercase", letterSpacing: ".3em" }}>FOOTAGE_ENCRYPTED</h4>
                                            <p className="sf ap" style={{ fontSize: ".6rem", color: "#e60000", textTransform: "uppercase", letterSpacing: ".35em", marginTop: ".35rem" }}>ACCESS DENIED — DECRYPTION REQUIRED</p>
                                        </div>
                                        <div style={{ background: "rgba(0,0,0,.75)", border: "1px solid rgba(230,0,0,.35)", borderLeft: "3px solid #e60000", padding: ".9rem 1.4rem", maxWidth: "320px", textAlign: "left" }}>
                                            <div className="sf" style={{ fontSize: ".5rem", color: "rgba(230,0,0,.6)", letterSpacing: ".3em", textTransform: "uppercase", marginBottom: ".55rem" }}>HOW TO UNLOCK THIS FOOTAGE</div>
                                            {[
                                                { n: "01", t: <>Open the <strong style={{ color: "#e60000" }}>DATA STREAM</strong> panel on the right</> },
                                                { n: "02", t: <>Solve the <strong style={{ color: "#e60000" }}>DECRYPTION CHALLENGE</strong> assigned to this node</> },
                                                { n: "03", t: <>Enter the correct answer to <strong style={{ color: "#e60000" }}>DECRYPT</strong> and access the footage</> },
                                            ].map(({ n, t }) => (
                                                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: ".6rem", marginBottom: ".45rem" }}>
                                                    <span style={{ color: "#e60000", fontWeight: 900, fontSize: ".65rem", flexShrink: 0 }}>{n}</span>
                                                    <span style={{ fontSize: ".65rem", color: "#dcd4c3", lineHeight: 1.5, fontFamily: "'Courier New',monospace" }}>{t}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {attempts > 0 && (
                                            <div style={{ background: "rgba(230,0,0,.1)", border: "1px solid rgba(230,0,0,.3)", padding: ".4rem 1.2rem" }}>
                                                <span className="sf" style={{ fontSize: ".55rem", color: "rgba(230,0,0,.7)", letterSpacing: ".2em", textTransform: "uppercase" }}>FAILED ATTEMPTS: {attempts}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Unlocked overlay */}
                                {unlocked && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.2rem", zIndex: 30, pointerEvents: "none" }}>
                                        <div className="sf" style={{ fontSize: ".7rem", color: "#10b981", letterSpacing: ".4em", textTransform: "uppercase", background: "rgba(0,0,0,.85)", padding: ".5rem 1.8rem", border: "1px solid rgba(16,185,129,.4)", boxShadow: "0 0 20px rgba(16,185,129,.2)" }}>✓ FOOTAGE_DECRYPTED</div>
                                        <a href={feed.videoUrl} target="_blank" rel="noopener noreferrer" className="sf"
                                            style={{ pointerEvents: "all", display: "flex", alignItems: "center", gap: ".75rem", padding: "1rem 2.5rem", background: "#e60000", color: "#fff", fontWeight: 900, fontSize: ".8rem", textTransform: "uppercase", letterSpacing: ".4em", textDecoration: "none", border: "1px solid #ff3333", boxShadow: "0 0 30px rgba(230,0,0,.5)", transition: "background .2s", cursor: "pointer" }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = "#ff3333"; e.currentTarget.style.boxShadow = "0 0 50px rgba(230,0,0,.8)"; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = "#e60000"; e.currentTarget.style.boxShadow = "0 0 30px rgba(230,0,0,.5)"; }}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            ACCESS_NODE
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* HUD badges */}
                        <div style={{ position: "absolute", bottom: "5rem", right: "5rem", transform: "rotate(-1deg)", zIndex: 20, pointerEvents: "none" }}>
                            <div className="sf" style={{ fontSize: ".9rem", fontWeight: 900, color: "#ff3333", background: "rgba(0,0,0,.8)", padding: ".75rem 2rem", border: "1px solid #e60000", boxShadow: "0 0 20px rgba(230,0,0,.3)", textTransform: "uppercase", letterSpacing: ".2em" }}>ANOMALY_DETECTED::T-INDEX_{ts.split(":")[1]}</div>
                        </div>
                        <div style={{ position: "absolute", top: "6rem", left: "6rem", fontSize: ".6rem", color: "#e60000", pointerEvents: "none", zIndex: 20, display: "flex", flexDirection: "column", gap: ".75rem", textTransform: "uppercase", letterSpacing: ".2em" }}>
                            {[["BITRATE:", "4.2 MB/S"], ["INTEGRITY:", "98.4%"], ["PROTOCOL:", "AES-256"]].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", gap: "1.5rem", background: "rgba(0,0,0,.8)", border: "1px solid rgba(230,0,0,.2)", padding: ".5rem 1rem" }}>
                                    <span>{k}</span><span style={{ color: "#dcd4c3" }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Riddle Panel */}
                    <div style={{ width: panelOpen ? "420px" : "0", background: "#06010a", color: "#dcd4c3", borderLeft: "1px solid rgba(230,0,0,.4)", display: "flex", flexDirection: "column", transition: "width .5s ease,opacity .5s ease", overflow: "hidden", opacity: panelOpen ? 1 : 0 }} className="grid-bg">
                        <div style={{ padding: "2rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: "420px" }}>

                            {/* Panel title */}
                            <div style={{ borderBottom: "1px solid rgba(230,0,0,.35)", paddingBottom: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".4rem" }}>
                                    <svg width="14" height="14" fill="none" stroke={unlocked ? "#10b981" : "#e60000"} strokeWidth="2" viewBox="0 0 24 24">
                                        {unlocked ? <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></> : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>}
                                    </svg>
                                    <h3 className="sf" style={{ fontSize: ".95rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".25em", color: unlocked ? "#10b981" : "#dcd4c3" }}>{unlocked ? "ACCESS_GRANTED" : "DECRYPTION_CHALLENGE"}</h3>
                                </div>
                                <div style={{ fontSize: ".55rem", color: "rgba(230,0,0,.6)", letterSpacing: ".3em", textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>{riddle.label} // EXHIBIT_{feed.id}</div>
                            </div>

                            {/* Type badges */}
                            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                                {(["jumble", "riddle", "decode"] as const).map((t) => (
                                    <div key={t} style={{ fontSize: ".5rem", letterSpacing: ".2em", textTransform: "uppercase", padding: ".25rem .75rem", border: `1px solid ${riddle.type === t ? "#e60000" : "rgba(230,0,0,.15)"}`, color: riddle.type === t ? "#e60000" : "#57534e", fontFamily: "'Courier New',monospace", fontWeight: 700 }}>
                                        {t === "jumble" ? "WORD_JUMBLE" : t === "riddle" ? "LOGIC_RIDDLE" : "DECODE"}
                                    </div>
                                ))}
                            </div>

                            {/* Challenge */}
                            <div style={{ background: "#0d0000", border: "1px solid rgba(230,0,0,.3)", borderLeft: "3px solid #e60000", padding: "1.25rem 1.5rem" }}>
                                <div style={{ fontSize: ".55rem", color: "rgba(230,0,0,.5)", letterSpacing: ".3em", textTransform: "uppercase", marginBottom: ".75rem", fontFamily: "'Courier New',monospace" }}>CHALLENGE_DATA</div>
                                <pre style={{ fontSize: ".78rem", color: "#dcd4c3", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", margin: 0 }}>{riddle.challenge}</pre>
                            </div>

                            {/* Hint */}
                            {!unlocked && (
                                <div>
                                    <button onClick={() => setShowHint((h) => !h)}
                                        style={{ background: "transparent", border: "1px dashed rgba(230,0,0,.3)", color: "rgba(230,0,0,.5)", fontSize: ".55rem", letterSpacing: ".2em", textTransform: "uppercase", padding: ".4rem 1rem", cursor: "pointer", fontFamily: "'Courier New',monospace", transition: "all .2s" }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(230,0,0,.6)"; e.currentTarget.style.color = "#e60000"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(230,0,0,.3)"; e.currentTarget.style.color = "rgba(230,0,0,.5)"; }}>
                                        {showHint ? "▲ HIDE_HINT" : "▼ REVEAL_HINT"}
                                    </button>
                                    {showHint && (
                                        <div style={{ marginTop: ".75rem", background: "rgba(230,0,0,.05)", border: "1px solid rgba(230,0,0,.15)", padding: ".75rem 1rem" }}>
                                            <div style={{ fontSize: ".5rem", color: "rgba(230,0,0,.4)", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: ".4rem", fontFamily: "'Courier New',monospace" }}>HINT_FRAGMENT</div>
                                            <div style={{ fontSize: ".72rem", color: "#78716c", fontFamily: "'Courier New',monospace", lineHeight: 1.6 }}>{riddle.hint}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Answer input */}
                            {!unlocked ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                                    <div style={{ fontSize: ".55rem", color: "rgba(230,0,0,.5)", letterSpacing: ".3em", textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>DECRYPTION_KEY_INPUT</div>
                                    <div style={{ display: "flex", gap: ".75rem" }}>
                                        <input type="text" placeholder="Enter the answer…" value={answer} onChange={(e) => setAnswer(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                                            style={{ flex: 1, background: "#0d0000", border: `1px solid ${status === "wrong" ? "#ff3333" : status === "correct" ? "#10b981" : "rgba(230,0,0,.3)"}`, outline: "none", color: "#dcd4c3", fontSize: ".75rem", fontFamily: "'Courier New',monospace", padding: ".75rem 1rem", transition: "border-color .2s" }}
                                            onFocus={(e) => { if (status === "idle") e.currentTarget.style.borderColor = "#e60000"; }}
                                            onBlur={(e) => { if (status === "idle") e.currentTarget.style.borderColor = "rgba(230,0,0,.3)"; }} />
                                        <button onClick={handleSubmit}
                                            style={{ background: "#e60000", border: "none", color: "#fff", fontSize: ".6rem", fontWeight: 900, letterSpacing: ".2em", padding: "0 1.25rem", cursor: "pointer", fontFamily: "'Courier New',monospace", textTransform: "uppercase", transition: "background .2s" }}
                                            onMouseOver={(e) => (e.currentTarget.style.background = "#ff3333")} onMouseOut={(e) => (e.currentTarget.style.background = "#e60000")}>SUBMIT</button>
                                    </div>
                                    {status === "wrong" && (
                                        <div style={{ background: "rgba(230,0,0,.08)", border: "1px solid rgba(230,0,0,.3)", padding: ".5rem .75rem" }}>
                                            <span style={{ color: "#ef4444", fontSize: ".65rem", fontFamily: "'Courier New',monospace", letterSpacing: ".1em" }}>✗ INCORRECT — Decryption failed. Try again.</span>
                                        </div>
                                    )}
                                    {attempts >= 3 && (
                                        <div style={{ fontSize: ".55rem", color: "rgba(230,0,0,.4)", fontFamily: "'Courier New',monospace", letterSpacing: ".1em", lineHeight: 1.6, borderTop: "1px dashed rgba(230,0,0,.15)", paddingTop: ".75rem" }}>
                                            SYSTEM_NOTE: Multiple failed attempts logged. Re-examine the challenge data carefully.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.35)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
                                        <div style={{ fontSize: ".55rem", color: "rgba(16,185,129,.6)", letterSpacing: ".3em", textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>KEY_ACCEPTED</div>
                                        <div style={{ fontSize: ".8rem", color: "#10b981", fontFamily: "'Courier New',monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".2em" }}>✓ {riddle.answer.toUpperCase()}</div>
                                    </div>
                                    <div style={{ background: "#0d0000", border: "1px solid rgba(16,185,129,.2)", padding: "1rem 1.25rem" }}>
                                        <div style={{ fontSize: ".55rem", color: "rgba(16,185,129,.5)", letterSpacing: ".3em", textTransform: "uppercase", fontFamily: "'Courier New',monospace", marginBottom: ".5rem" }}>SOLUTION_EXPLANATION</div>
                                        <div style={{ fontSize: ".72rem", color: "#78716c", fontFamily: "'Courier New',monospace", lineHeight: 1.7 }}>{riddle.explanation}</div>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div style={{ borderTop: "1px dashed rgba(230,0,0,.15)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
                                <div style={{ fontSize: ".55rem", color: "#57534e", letterSpacing: ".25em", textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>NODE_METADATA</div>
                                {[{ label: "NODE_ID", value: `GRID_LOCK::${feed.id}` }, { label: "VEC_COORD", value: feed.location }, { label: "TIMESTAMP", value: feed.timestamp }].map(({ label, value }) => (
                                    <div key={label}>
                                        <div className="sf" style={{ fontSize: ".55rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".25rem" }}>{label}</div>
                                        <div className="sf" style={{ fontSize: ".7rem", fontWeight: 700, color: "#dcd4c3", wordBreak: "break-all" }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Hash */}
                            <div style={{ opacity: .35 }}>
                                <div style={{ borderBottom: "1px solid #292524", paddingBottom: ".5rem", marginBottom: ".75rem" }}>
                                    <h3 className="sf" style={{ fontSize: ".6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".2em", color: "#57534e" }}>ARCHIVE_HASH</h3>
                                </div>
                                <div className="sf" style={{ fontSize: ".55rem", color: "#78716c", wordBreak: "break-all", lineHeight: 1.8, padding: "1rem", border: "1px dashed #292524", fontWeight: 700, background: "rgba(0,0,0,.4)", whiteSpace: "pre-line" }}>{hash}</div>
                            </div>
                        </div>
                        <div style={{ padding: "1rem 1.5rem", background: "#000", textAlign: "center", borderTop: "1px solid rgba(230,0,0,.4)" }}>
                            <div className="sf ap" style={{ fontSize: ".55rem", fontWeight: 900, color: unlocked ? "#10b981" : "#e60000", textTransform: "uppercase", letterSpacing: ".5em" }}>{unlocked ? "FOOTAGE_UNLOCKED" : "SECURE_BUREAU_TERMINAL"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Ghost Sidebar ────────────────────────────────────────────────────────────

function GhostSidebar({ onClose, onAllDone }: { onClose: () => void; onAllDone: () => void }) {
    const [messages, setMessages] = useState<GhostMessage[]>([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [qIdx, setQIdx] = useState(0);
    const [inited, setInited] = useState(false);
    const idRef = useRef(0);
    const endRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => { setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }, []);

    const addMsg = useCallback(async (text: string, label: string, delay = 1500) => {
        setTyping(true); scrollToBottom();
        await sleep(delay);
        setTyping(false);
        setMessages((p) => [...p, { id: idRef.current++, text, label, isUser: false }]);
        scrollToBottom();
    }, [scrollToBottom]);

    const addUser = useCallback((text: string) => {
        setMessages((p) => [...p, { id: idRef.current++, text, label: "", isUser: true }]);
        scrollToBottom();
    }, [scrollToBottom]);

    useEffect(() => {
        if (inited) return; setInited(true);
        (async () => {
            await addMsg("Scanning surveillance network…\n\nMultiple camera feeds from the laboratory corridor have been flagged for analysis.", "GHOST41_ID > MISSION");
            await addMsg("Carefully observe the CCTV feeds and answer my questions based on what you find.\n\nYou may retry each question as many times as needed.", "GHOST41_ID > INSTRUCTION");
            await addMsg("Question 1\n\n" + QS[0].q, "GHOST41_ID > QUERY");
        })();
    }, [inited, addMsg]);

    async function handleSend() {
        if (typing || !input.trim()) return;
        const val = input.trim(); setInput("");
        addUser(val);
        const q = QS[qIdx]; if (!q) return;

        setTyping(true);
        const result = await verifyGhostAnswer('task2', q.qId, val);
        setTyping(false);

        if (result.correct) {
            await addMsg(result.successMessage || "Correct.", "GHOST41_ID > ANALYSIS");
            if (qIdx < QS.length - 1) {
                const next = qIdx + 1; setQIdx(next);
                await addMsg(`Question ${next + 1}\n\n` + QS[next].q, "GHOST41_ID > QUERY");
            } else {
                await addMsg("🔓 TASK 3 UNLOCKED\n\nAccess granted. Proceed to the next phase of the investigation.", "SYSTEM > NOTIFICATION");
                onAllDone();
            }
        } else {
            await addMsg(result.failureMessage || "Incorrect. Try again.", "GHOST41_ID > ERROR");
        }
    }

    return (
        <div style={{ display: "flex", position: "fixed", top: 0, right: 0, zIndex: 200, width: "360px", height: "100vh", background: "#0b1829", borderLeft: "2px solid rgba(0,212,200,.35)", flexDirection: "column", overflow: "hidden", boxShadow: "-8px 0 40px rgba(0,0,0,.9)" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 6px)", pointerEvents: "none", zIndex: 1 }} />
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid rgba(0,212,200,.25)", background: "#0d1e35", flexShrink: 0, position: "relative", zIndex: 2 }}>
                <div style={{ width: "52px", height: "52px", flexShrink: 0, background: "#0d1e35", border: "1px solid rgba(0,212,200,.35)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <GhostSVG size={44} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: "3px", color: "#00d4c8", textTransform: "uppercase", fontFamily: "'Special Elite',cursive" }}>GHOST41_ID</div>
                    <div style={{ fontSize: "9px", color: "rgba(0,212,200,.55)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Courier New',monospace" }}>Investigation Assistant · Online</div>
                </div>
                <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(230,0,0,.7)", borderRadius: "2px", color: "#e60000", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", padding: "5px 10px", cursor: "pointer", fontFamily: "'Courier New',monospace", transition: "background .15s" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(230,0,0,.15)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>✕ CLOSE</button>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: "10px", position: "relative", zIndex: 2, scrollbarWidth: "thin", scrollbarColor: "#0d4a47 #0b1829" }}>
                {messages.map((m) =>
                    m.isUser ? (
                        <div key={m.id} style={{ background: "#071d30", border: "1px solid rgba(0,212,200,.22)", borderLeft: "3px solid #00d4c8", borderRadius: "6px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "12px", color: "#e8f4f8", lineHeight: 1.65, fontFamily: "'Courier New',monospace" }}>{m.text}</div>
                        </div>
                    ) : (
                        <div key={m.id} style={{ background: "#0d2236", border: "1px solid rgba(0,212,200,.2)", borderRadius: "6px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "rgba(0,212,200,.8)", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Courier New',monospace" }}>{m.label}</div>
                            <div style={{ fontSize: "12px", color: "#e8f4f8", lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace" }}>{m.text}</div>
                        </div>
                    )
                )}
                {typing && (
                    <div style={{ background: "#0d2236", border: "1px solid rgba(0,212,200,.2)", borderRadius: "6px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "rgba(0,212,200,.7)", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Courier New',monospace" }}>GHOST41_ID › TYPING</div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
                            {["bd1", "bd2", "bd3"].map((c) => <div key={c} className={`ab ${c}`} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(0,212,200,.5)" }} />)}
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>
            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,212,200,.2)", background: "#0d1e35", flexShrink: 0, position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" placeholder="Type your answer…" value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                        style={{ flex: 1, background: "#071525", border: "1px solid rgba(0,212,200,.25)", borderRadius: "4px", outline: "none", color: "#e8f4f8", fontSize: "11px", fontFamily: "'Courier New',monospace", padding: "10px 12px", transition: "border-color .2s" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4c8")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,212,200,.25)")} />
                    <button onClick={handleSend}
                        style={{ background: "#071525", border: "1px solid rgba(0,212,200,.35)", borderRadius: "4px", color: "#00d4c8", fontSize: "9px", fontWeight: 700, letterSpacing: "2px", padding: "0 14px", cursor: "pointer", fontFamily: "'Courier New',monospace", transition: "all .2s" }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(0,212,200,.1)"; e.currentTarget.style.borderColor = "#00d4c8"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "#071525"; e.currentTarget.style.borderColor = "rgba(0,212,200,.35)"; }}>[ SEND ]</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp() {
    const [modalFeed, setModalFeed] = useState<Feed | null>(null);
    const [ghostOpen, setGhostOpen] = useState(false);
    const [hlTime, setHlTime] = useState<string | null>(null);
    const [t2Complete, setT2Complete] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    function handleAllDone() {
        setT2Complete(true);
        setTimeout(() => setShowSuccessModal(true), 1500);
    }

    function handleOpenModal(feed: Feed) {
        setModalFeed(feed);
        setHlTime(feed.timestamp.split(" ")[1]);
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", position: "relative", paddingBottom: "5rem" }}>
            <div style={{ position: "fixed", inset: 0, border: "12px solid rgba(230,0,0,.1)", pointerEvents: "none", zIndex: 100, boxShadow: "inset 0 0 100px rgba(230,0,0,.1)" }} />
            <div style={{ position: "fixed", inset: 0, border: "1px solid rgba(230,0,0,.3)", pointerEvents: "none", zIndex: 101 }} />

            {/* Header */}
            <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: "4rem", zIndex: 50, display: "flex", alignItems: "center", padding: "0 3rem", background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(230,0,0,.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="ap" style={{ width: ".75rem", height: ".75rem", background: "#e60000", borderRadius: "50%", boxShadow: "0 0 10px #e60000" }} />
                    <h1 className="sf" style={{ color: "#fff", fontWeight: 900, letterSpacing: ".4em", textTransform: "uppercase", fontSize: ".85rem", textShadow: "0 0 10px rgba(230,0,0,.5)" }}>Internal Operations Console</h1>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <span style={{ fontSize: ".6rem", color: "rgba(239,68,68,.6)", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 700 }}>Access Level:</span>
                        <div style={{ display: "flex", gap: ".25rem" }}>
                            <div style={{ width: ".75rem", height: ".25rem", background: "#e60000" }} />
                            <div style={{ width: ".75rem", height: ".25rem", background: "#e60000" }} />
                            <div style={{ width: ".75rem", height: ".25rem", background: "#292524" }} />
                            <div style={{ width: ".75rem", height: ".25rem", background: "#292524" }} />
                        </div>
                    </div>
                    <div style={{ height: "1rem", width: "1px", background: "rgba(255,255,255,.1)" }} />
                    <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,.4)" }}>SYS_ID: GHOST_41_ALPHA</div>
                </div>
            </header>

            {/* Main */}
            <main style={{ flex: 1, marginTop: "6rem", padding: "3rem", maxWidth: "1400px", marginLeft: "auto", marginRight: "auto", width: "100%", position: "relative", zIndex: 10 }}>
                <Timeline highlightTime={hlTime} />
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                        <div className="sk" style={{ background: "#e60000", color: "#000", fontWeight: 900, padding: ".5rem 1.5rem", boxShadow: "0 0 15px rgba(230,0,0,.3)" }}>
                            <span className="ski sf">Evidence Matrix</span>
                        </div>
                        <div style={{ height: "2px", flex: 1, background: "linear-gradient(to right,rgba(230,0,0,.5),transparent)" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "2rem" }}>
                        {FEEDS.map((f) => <FeedCard key={f.id} feed={f} onClick={() => handleOpenModal(f)} />)}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "3rem", padding: "0 3rem", background: "#111012", borderTop: "2px solid #990000", zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -4px 20px rgba(0,0,0,.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                        <div className="ap" style={{ width: ".5rem", height: ".5rem", background: "#e60000", borderRadius: "50%", boxShadow: "0 0 5px #e60000" }} />
                        <span className="sf" style={{ fontSize: ".65rem", color: "#6b665c", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 700 }}>Classified Shard</span>
                    </div>
                    <div style={{ height: "1.25rem", width: "1px", background: "#292524" }} />
                    <span className="sf" style={{ fontSize: ".65rem", color: "rgba(230,0,0,.6)", fontWeight: 900 }}>FEDERAL OFFENSE: UNAUTHORIZED DUPLICATION</span>
                </div>
                <div className="sf" style={{ fontSize: ".6rem", color: "rgba(220,212,195,.3)", fontStyle: "italic", letterSpacing: ".2em" }}>Bureau of Internal Affairs // Division Zero</div>
            </footer>

            {/* Ghost trigger */}
            {!ghostOpen && (
                <div onClick={() => setGhostOpen(true)} style={{ position: "fixed", bottom: "70px", right: "24px", zIndex: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none", animation: "ghostfloat 3s ease-in-out infinite" }}>
                    <GhostSVG size={60} />
                    <span className="ap" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "2px", color: "#00d4c8", background: "rgba(7,21,37,0.92)", border: "1px solid rgba(0,212,200,0.5)", borderRadius: "3px", padding: "3px 8px", whiteSpace: "nowrap", textTransform: "uppercase" }}>ASK ME!</span>
                </div>
            )}
            {/* GHOST PANEL */}
            {ghostOpen && (
                <GhostSidebar
                    onClose={() => setGhostOpen(false)}
                    onAllDone={handleAllDone}
                />
            )}

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "zin .5s ease" }}>
                    <div style={{ background: "#0a0a0a", border: "1px solid #e60000", padding: "40px", borderRadius: "4px", textAlign: "center", maxWidth: "400px", boxShadow: "0 0 40px rgba(230,0,0,0.2)" }}>
                        <h2 className="sf" style={{ color: "#fff", fontSize: "24px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", textShadow: "0 0 20px rgba(230,0,0,0.5)" }}>Task Complete</h2>
                        <p style={{ color: "#dcd4c3", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6" }}>CCTV analysis is complete. The anomaly has been identified. Return to the dashboard to proceed.</p>
                        <a href="/dashboard" className="sf" style={{ display: "inline-block", background: "transparent", border: "1px solid #e60000", color: "#e60000", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s" }}
                            onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(230,0,0,0.1)"; }}
                            onMouseOut={(e: any) => { e.currentTarget.style.background = "transparent"; }}
                        >RETURN TO DASHBOARD</a>
                    </div>
                </div>
            )}
            {modalFeed && <Modal feed={modalFeed} onClose={() => setModalFeed(null)} />}
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ForensicInvestigation() {
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = GLOBAL_CSS;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    return (
        <>
            {!started && <IntroScreen onBegin={() => setStarted(true)} />}
            {started && <MainApp />}
        </>
    );
}
