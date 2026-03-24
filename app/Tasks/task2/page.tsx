// @ts-nocheck
'use client'
import { useState, useRef, useEffect, useCallback } from "react";
import { verifyGhostAnswer } from "@/app/lib/verifyGhostAnswer";

// ── TYPES ──
interface Feed {
    id: string;
    cameraName: string;
    timestamp: string;
    location: string;
    videoUrl: string;
}

interface TlEvent {
    time: string;
    event: string;
    type: "system" | "user" | "alert";
    description: string;
}

interface Question {
    q: string;
    qId: string;
}

interface GhostMessage {
    id: number;
    text: string;
    label: string;
    isPlayer: boolean;
}

// ── DATA ──
const ZONES = [
    "LAB 7 - ENTRANCE",
    "LAB 7 - SERVER RACK",
    "LAB 7 - CORRIDOR",
    "LAB 7 - RECEPTION",
    "LAB 7 - LOADING DOCK",
    "LAB 7 - VENTILATION",
];
const TIME_STEPS = ["21:10", "21:40", "22:10", "22:40"];
const VIDEO_SOURCES = [
    "https://evidence-vault.internal/case-24-11/cam-alpha-2100.mp4",
    "https://evidence-vault.internal/case-24-11/cam-beta-2120.mp4",
    "https://evidence-vault.internal/case-24-11/cam-gamma-2140.mp4",
    "https://evidence-vault.internal/case-24-11/cam-delta-2200.mp4",
    "https://evidence-vault.internal/case-24-11/cam-epsilon-2220.mp4",
];

const FEEDS: Feed[] = [];
ZONES.forEach((z, zi) =>
    TIME_STEPS.forEach((t, ti) =>
        FEEDS.push({
            id: `EX-${zi + 1}${ti + 1}`,
            cameraName: z,
            timestamp: `2024-11-24 ${t}:00`,
            location: z,
            videoUrl: VIDEO_SOURCES[zi % VIDEO_SOURCES.length],
        })
    )
);

const TL_EVENTS: TlEvent[] = [
    { time: "21:00:00", event: "BOOT", type: "system", description: "System initialization complete." },
    { time: "21:10:00", event: "FEED_ON", type: "system", description: "CCTV Feeds activated." },
    { time: "21:15:40", event: "VPN_IN", type: "user", description: "Remote access established from 192.168.1.45" },
    { time: "21:20:15", event: "CAM_FAIL", type: "alert", description: "Signal loss detected in LAB 7 - VENTILATION" },
    { time: "21:30:00", event: "DOOR_OPEN", type: "user", description: "Manual override on RECEPTION door." },
    { time: "21:45:12", event: "VPN_OUT", type: "user", description: "Remote session terminated." },
    { time: "22:05:00", event: "SYNC", type: "system", description: "Database synchronization started." },
    { time: "22:10:00", event: "LOG_WIPE", type: "alert", description: "Unauthorized deletion attempt in system logs." },
    { time: "22:15:00", event: "REBOOT", type: "system", description: "Emergency system restart initiated." },
    { time: "22:30:00", event: "END", type: "system", description: "Operational window closed." },
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

// ── GHOST ICON SVG ──
const GhostSVG = ({ size = 44 }: { size?: number }) => (
    <svg viewBox="0 0 32 32" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="16" height="18" fill="#c8c8c8" />
        <rect x="6" y="8" width="2" height="14" fill="#c8c8c8" />
        <rect x="24" y="8" width="2" height="14" fill="#c8c8c8" />
        <rect x="10" y="4" width="12" height="4" fill="#c8c8c8" />
        <rect x="8" y="5" width="16" height="2" fill="#c8c8c8" />
        <rect x="6" y="22" width="4" height="4" fill="#c8c8c8" />
        <rect x="14" y="22" width="4" height="4" fill="#c8c8c8" />
        <rect x="22" y="22" width="4" height="4" fill="#c8c8c8" />
        <rect x="10" y="24" width="4" height="2" fill="#0a0000" />
        <rect x="18" y="24" width="4" height="2" fill="#0a0000" />
        <rect x="11" y="12" width="4" height="4" fill="#0a0000" />
        <rect x="17" y="12" width="4" height="4" fill="#0a0000" />
        <rect x="12" y="13" width="1" height="1" fill="#e60000" />
        <rect x="18" y="13" width="1" height="1" fill="#e60000" />
    </svg>
);

// ── STYLES ──
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

  :root { --accent: #e60000; --text: #dcd4c3; --dim: #6b665c; --glow: rgba(230,0,0,0.4); }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .fi-body {
    font-family: 'Courier Prime', monospace;
    background-color: #020202;
    background-image:
      radial-gradient(circle at 50% 40%, rgba(150,0,0,0.15) 0%, rgba(0,0,0,1) 100%),
      url('https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=2071&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: var(--text);
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
  }
  .fi-body::before {
    content: " ";
    display: block;
    position: fixed;
    inset: 0;
    background:
      linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%),
      linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03));
    z-index: 0;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
    backdrop-filter: blur(4px) contrast(1.1) brightness(0.7);
    box-shadow: inset 0 0 100px rgba(230,0,0,0.1);
  }
  .sf { font-family: 'Special Elite', cursive; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: var(--accent); }
  .grid-bg {
    background-image:
      linear-gradient(rgba(117,2,15,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(117,2,15,0.1) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(2); opacity: 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes bslow { 0%, 100%, 20%, 50%, 80% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
  @keyframes ghostfloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.04); } }
  @keyframes ghostglow { 0%, 100% { filter: drop-shadow(0 0 6px rgba(0,212,200,0.5)); } 50% { filter: drop-shadow(0 0 14px rgba(0,212,200,0.9)); } }
  @keyframes sright { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes fin { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zin { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }

  .ghost-float { animation: ghostfloat 3s ease-in-out infinite, ghostglow 3s ease-in-out infinite; }
  .ap { animation: pulse 2s infinite; }
  .apg { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
  .asp { animation: spin 1s linear infinite; }
  .ab { animation: bounce 1s ease-in-out infinite; }
  .abs { animation: bslow 4s ease-in-out infinite; }
  .asr { animation: sright .5s ease forwards; }
  .af { animation: fin .5s ease forwards; }
  .az { animation: zin .4s ease forwards; }
  .bd1 { animation-delay: -0.3s; }
  .bd2 { animation-delay: -0.15s; }
  .bd3 { animation-delay: 0s; }

  .fc {
    border: 2px solid var(--accent);
    background: rgba(10,10,10,.8);
    box-shadow: 0 0 15px var(--glow);
    position: relative;
    overflow: hidden;
    transition: all .3s;
  }
  .fc:hover { border-color: #ff0000; box-shadow: 0 0 25px rgba(255,0,0,.2); background: rgba(20,20,20,.9); }
  .fc::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 0%, rgba(117,2,15,.05) 50%, transparent 100%);
    animation: scan 4s linear infinite;
    pointer-events: none;
  }
  .cc { cursor: pointer; transition: transform .3s; }
  .cc:hover { transform: scale(1.02); }
  .tl {
    position: absolute;
    left: 3rem; right: 3rem; top: 50%;
    transform: translateY(-50%);
    height: 1px;
    background: #e60000;
    box-shadow: 0 0 15px #e60000;
    z-index: 0;
  }
  .gmg { background: #151515; border: 1px solid rgba(230,0,0,.15); border-radius: 1rem; border-top-left-radius: 0; }
  .gmp { background: rgba(230,0,0,.15); border: 1px solid rgba(230,0,0,.3); border-radius: 1rem; border-top-right-radius: 0; }
  .sk { transform: skewX(-12deg); }
  .ski { display: inline-block; transform: skewX(12deg); }
`;

// ── TIMELINE ──
function Timeline({ highlightTs }: { highlightTs: string | null }) {
    const startM = 21 * 60;
    const total = 120;

    const labels = [
        { t: "21:00", p: 0 },
        { t: "21:30", p: 25 },
        { t: "22:00", p: 50 },
        { t: "22:30", p: 75 },
        { t: "23:00", p: 100 },
    ];

    const getPos = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return ((h * 60 + m - startM) / total) * 100;
    };

    const hlPos = highlightTs ? (() => {
        const [h, m] = highlightTs.split(":").map(Number);
        return ((h * 60 + m - startM) / total) * 100;
    })() : null;

    return (
        <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="sk" style={{ background: "#e60000", color: "#000", fontWeight: 900, padding: ".5rem 1.5rem", boxShadow: "0 0 15px rgba(230,0,0,.3)" }}>
                    <span className="ski sf">Timeline Viewer</span>
                </div>
                <div style={{ height: "2px", flex: 1, background: "linear-gradient(to right, rgba(230,0,0,.5), transparent)" }} />
            </div>
            <div style={{ background: "rgba(10,10,10,.8)", backdropFilter: "blur(12px)", border: "2px solid rgba(230,0,0,.3)", borderRadius: "2px", padding: "2rem", boxShadow: "0 0 40px rgba(0,0,0,.5)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1px", background: "linear-gradient(to right, transparent, rgba(230,0,0,.2), transparent)" }} />
                <div className="grid-bg" style={{ width: "100%", height: "10rem", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 3rem" }}>
                    <div className="tl" />
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
                        const pos = getPos(ev.time.substring(0, 5));
                        if (pos < 0 || pos > 100) return null;
                        const col = ev.type === "alert" ? "#ef4444" : ev.type === "user" ? "#60a5fa" : "rgba(230,0,0,.6)";
                        return (
                            <div key={ev.event + ev.time} style={{ position: "absolute", zIndex: 10, left: `calc(${pos}% + 3rem)`, top: "50%", transform: "translate(-50%,-50%)" }}
                                onMouseOver={(e: any) => { const tt = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".ev-tt"); if (tt) tt.style.display = "block"; }}
                                onMouseOut={(e: any) => { const tt = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".ev-tt"); if (tt) tt.style.display = "none"; }}>
                                <div style={{ width: "1px", height: ev.type === "alert" ? "2rem" : "1.25rem", background: col }} />
                                <div style={{ position: "absolute", top: "-2rem", left: "50%", transform: "translateX(-50%)", fontSize: ".45rem", fontFamily: "'Special Elite',cursive", whiteSpace: "nowrap", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem", border: "1px solid rgba(230,0,0,.1)", color: col, opacity: .6 }}>{ev.event}</div>
                                <div className="ev-tt" style={{ display: "none", position: "absolute", top: "2.5rem", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.9)", border: "1px solid rgba(230,0,0,.4)", padding: ".5rem", zIndex: 50, minWidth: "150px", boxShadow: "0 10px 30px rgba(0,0,0,.8)" }}>
                                    <div style={{ fontSize: ".5rem", color: "#e60000", fontWeight: 900, textTransform: "uppercase", marginBottom: ".25rem" }}>{ev.event} @ {ev.time}</div>
                                    <div style={{ fontSize: ".45rem", color: "#78716c", lineHeight: 1.4 }}>{ev.description}</div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Highlight */}
                    {hlPos !== null && hlPos >= 0 && hlPos <= 100 && (
                        <div style={{ position: "absolute", zIndex: 20, left: `calc(${hlPos}% + 3rem)`, top: "50%", transform: "translate(-50%,-50%)", transition: "left .7s cubic-bezier(.34,1.56,.64,1)" }}>
                            <div style={{ width: "6rem", height: "6rem", border: "1px solid rgba(230,0,0,.6)", borderRadius: "50%", boxShadow: "0 0 30px rgba(230,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(230,0,0,.05)", backdropFilter: "blur(4px)", position: "relative" }}>
                                <div className="apg" style={{ width: ".375rem", height: ".375rem", background: "#e60000", borderRadius: "50%", boxShadow: "0 0 8px #e60000" }} />
                                {[["top", "left", "border-top", "border-left"], ["top", "right", "border-top", "border-right"], ["bottom", "left", "border-bottom", "border-left"], ["bottom", "right", "border-bottom", "border-right"]].map(([v, h], i) => (
                                    <div key={i} style={{ position: "absolute", [v]: 0, [h]: 0, width: "1rem", height: "1rem", borderTop: v === "top" ? "1px solid rgba(230,0,0,.8)" : undefined, borderBottom: v === "bottom" ? "1px solid rgba(230,0,0,.8)" : undefined, borderLeft: h === "left" ? "1px solid rgba(230,0,0,.8)" : undefined, borderRight: h === "right" ? "1px solid rgba(230,0,0,.8)" : undefined }} />
                                ))}
                            </div>
                            <div className="sf" style={{ position: "absolute", top: "-3.5rem", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.8)", border: "1px solid rgba(230,0,0,.4)", color: "#e60000", fontSize: ".5rem", padding: ".375rem 1rem", fontWeight: 900, letterSpacing: ".3em", whiteSpace: "nowrap" }}>NODE_SCANNING...</div>
                        </div>
                    )}
                    <div className="sf" style={{ position: "absolute", left: "1.5rem", top: "1rem", background: "rgba(0,0,0,.6)", border: "1px solid rgba(230,0,0,.2)", padding: ".2rem .75rem", fontSize: ".5rem", color: "rgba(230,0,0,.6)", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 900 }}>LOG_RECON_ACTIVE</div>
                    <div className="sf" style={{ position: "absolute", right: "1.5rem", bottom: "1rem", background: "rgba(0,0,0,.6)", border: "1px solid rgba(230,0,0,.2)", padding: ".2rem .75rem", fontSize: ".5rem", color: "rgba(230,0,0,.6)", textTransform: "uppercase", letterSpacing: ".2em", fontWeight: 900 }}>SIG_MATCH_PENDING</div>
                </div>
            </div>
        </section>
    );
}

// ── FEED CARD ──
function FeedCard({ f, onClick }: { f: Feed; onClick: () => void }) {
    const cn = f.id.split("-")[1];
    const cs = f.cameraName.split(" - ")[1] || "";
    const ts = f.timestamp.split(" ")[1];

    return (
        <div className="cc" onClick={onClick}>
            <div style={{ background: "#0a0a0a", padding: ".375rem", border: "2px solid rgba(230,0,0,.3)", boxShadow: "0 10px 30px rgba(0,0,0,.8), inset 0 0 20px rgba(230,0,0,.1)", borderRadius: "2px", overflow: "hidden", position: "relative", transition: "border-color .3s" }}
                onMouseOver={(e: any) => (e.currentTarget.style.borderColor = "rgba(230,0,0,.6)")}
                onMouseOut={(e: any) => (e.currentTarget.style.borderColor = "rgba(230,0,0,.3)")}>
                <div style={{ aspectRatio: "16/9", background: "#000", overflow: "hidden", position: "relative", border: "1px solid rgba(230,0,0,.2)" }}>
                    <img src={`https://picsum.photos/seed/${f.id}/640/360`} alt="CCTV" referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) brightness(.6) contrast(1.25)", transition: "filter .5s" }}
                        onMouseOver={(e: any) => (e.currentTarget.style.filter = "grayscale(1) brightness(.8) contrast(1.25)")}
                        onMouseOut={(e: any) => (e.currentTarget.style.filter = "grayscale(1) brightness(.6) contrast(1.25)")} />
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
                                <span style={{ fontSize: ".5rem", color: "rgba(255,255,255,.4)", display: "block" }}>{f.location}</span>
                            </div>
                            <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.4)", padding: ".1rem .25rem" }}>{ts}</div>
                        </div>
                    </div>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,.1) 50%)", backgroundSize: "100% 2px", pointerEvents: "none", opacity: .2 }} />
                </div>
                <div style={{ marginTop: ".75rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 .25rem" }}>
                    <div>
                        <span className="sf" style={{ fontSize: ".55rem", fontWeight: 900, color: "#e60000", textTransform: "uppercase", letterSpacing: ".2em" }}>{f.id}</span>
                        <div style={{ height: "2px", width: "2rem", background: "rgba(230,0,0,.3)", marginTop: ".125rem" }} />
                    </div>
                    <span className="sf" style={{ fontSize: ".5rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em" }}>Signal_Verified</span>
                </div>
            </div>
        </div>
    );
}

// ── MODAL ──
function Modal({ feed, onClose }: { feed: Feed; onClose: () => void }) {
    const [panelOpen, setPanelOpen] = useState(true);
    const ts = feed.timestamp.split(" ")[1];
    const cn = feed.id.split("-")[1];
    const hashStr = `BUREAU_UUID::0x${Math.random().toString(16).substr(2, 8).toUpperCase()}\nSTAMPED_UTC::2024-11-24T22:30:14\nAUTH_SIG::UNIT_NINE_VERIFIED`;

    return (
        <div style={{ display: "flex", position: "fixed", inset: 0, zIndex: 150, alignItems: "center", justifyContent: "center", padding: "2rem", background: "rgba(0,0,0,.95)", backdropFilter: "blur(20px)" }}
            onClick={(e: any) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="az" style={{ width: "100%", maxWidth: "1200px", background: "#050505", border: "2px solid rgba(230,0,0,.4)", display: "flex", flexDirection: "column", maxHeight: "95vh", overflow: "hidden", boxShadow: "0 0 150px rgba(230,0,0,.4)", borderRadius: "2px", position: "relative" }}>
                <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: .5 }} />
                {/* Modal Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000", padding: "1.5rem 2.5rem", borderBottom: "2px solid rgba(230,0,0,.5)", position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4rem" }}>
                        <button onClick={onClose} className="sf" style={{ fontSize: ".85rem", fontWeight: 900, color: "#e60000", textTransform: "uppercase", letterSpacing: ".2em", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem" }}
                            onMouseOver={(e: any) => (e.currentTarget.style.color = "#ff3333")}
                            onMouseOut={(e: any) => (e.currentTarget.style.color = "#e60000")}>
                            <span style={{ fontSize: "1.5rem" }}>←</span> EXIT_NODE
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".25rem" }}>
                            <span className="sf" style={{ fontSize: "1.2rem", fontWeight: 900, color: "#dcd4c3", textTransform: "uppercase", letterSpacing: ".2em" }}>NODE_ANALYSIS_PROTOCOL</span>
                            <span className="sf" style={{ fontSize: ".6rem", color: "#e60000", fontWeight: 900, letterSpacing: ".4em" }}>EXHIBIT_{feed.id} // VECTOR_LOCKED</span>
                        </div>
                    </div>
                    <button onClick={() => setPanelOpen((p: any) => !p)} className="sf" style={{ fontSize: ".65rem", fontWeight: 900, textTransform: "uppercase", padding: ".75rem 2rem", border: "1px solid #e60000", color: "#e60000", background: "transparent", cursor: "pointer", letterSpacing: ".2em" }}
                        onMouseOver={(e: any) => (e.currentTarget.style.background = "rgba(230,0,0,.2)")}
                        onMouseOut={(e: any) => (e.currentTarget.style.background = "transparent")}>
                        {panelOpen ? "CLOSE_DATA_STREAM" : "OPEN_DATA_STREAM"}
                    </button>
                </div>
                <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>
                    {/* Video area */}
                    <div style={{ flex: 1, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, border: "60px solid rgba(0,0,0,.9)", pointerEvents: "none", zIndex: 10 }} />
                        {/* Reticle */}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "16rem", height: "16rem", pointerEvents: "none", zIndex: 20, opacity: .6 }}>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "8rem", height: "1px", background: "#e60000", boxShadow: "0 0 15px #ff3333" }} />
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "1px", height: "8rem", background: "#e60000", boxShadow: "0 0 15px #ff3333" }} />
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "6px", height: "6px", background: "#ff3333", borderRadius: "50%", boxShadow: "0 0 10px #ff3333" }} />
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "12rem", height: "12rem", border: "1px solid rgba(230,0,0,.3)", borderRadius: "50%" }} />
                        </div>
                        <div style={{ position: "relative", zIndex: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
                            <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", border: "8px solid #292524", borderRadius: "2px", overflow: "hidden" }}>
                                <img src={`https://picsum.photos/seed/${feed.id}/1280/720`} alt="Evidence" referrerPolicy="no-referrer"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(1) brightness(.5) contrast(1.5)" }} />
                                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(230,0,0,.3)" }}>
                                            <div style={{ color: "#e60000", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".2em" }}>LIVE_FEED::NODE_{cn}</div>
                                            <div style={{ color: "#dcd4c3", fontSize: ".6rem" }}>{feed.cameraName}</div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", background: "rgba(0,0,0,.6)", padding: ".5rem 1rem", border: "1px solid rgba(117,2,15,.3)" }}>
                                            <div className="ap" style={{ width: ".5rem", height: ".5rem", background: "#dc2626", borderRadius: "50%", boxShadow: "0 0 10px #ff0000" }} />
                                            <span style={{ color: "#fff", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".3em" }}>RECORDING</span>
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
                            </div>
                            {/* Overlay */}
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", zIndex: 30 }}>
                                <div style={{ textAlign: "center", background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", padding: "2rem", border: "1px solid rgba(230,0,0,.2)" }}>
                                    <h4 className="sf" style={{ fontSize: "clamp(1rem,2.5vw,2rem)", fontWeight: 900, color: "#dcd4c3", textTransform: "uppercase", letterSpacing: ".3em" }}>EXTERNAL_FEED_LOCKED</h4>
                                    <p className="sf ap" style={{ fontSize: ".75rem", color: "#e60000", textTransform: "uppercase", letterSpacing: ".5em", marginTop: ".5rem" }}>ENCRYPTED_LINK_GENERATED</p>
                                </div>
                                <a href={feed.videoUrl} target="_blank" rel="noopener noreferrer" className="sf"
                                    style={{ padding: "1.25rem 3rem", background: "#e60000", color: "#fff", fontWeight: 900, fontSize: "clamp(.8rem,1.5vw,1.1rem)", textTransform: "uppercase", letterSpacing: ".4em", textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", border: "1px solid #ff3333", boxShadow: "0 0 40px rgba(230,0,0,.4)", transition: "background .2s" }}
                                    onMouseOver={(e: any) => (e.currentTarget.style.background = "#ff3333")}
                                    onMouseOut={(e: any) => (e.currentTarget.style.background = "#e60000")}>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    ACCESS_NODE
                                </a>
                            </div>
                        </div>
                        {/* HUD */}
                        <div style={{ position: "absolute", bottom: "5rem", right: "5rem", transform: "rotate(-1deg)", zIndex: 20, pointerEvents: "none" }}>
                            <div className="sf" style={{ fontSize: ".9rem", fontWeight: 900, color: "#ff3333", background: "rgba(0,0,0,.8)", padding: ".75rem 2rem", border: "1px solid #e60000", boxShadow: "0 0 20px rgba(230,0,0,.3)", textTransform: "uppercase", letterSpacing: ".2em" }}>
                                ANOMALY_DETECTED::T-INDEX_{ts.split(":")[1]}
                            </div>
                        </div>
                        <div style={{ position: "absolute", top: "6rem", left: "6rem", fontSize: ".6rem", color: "#e60000", pointerEvents: "none", zIndex: 20, display: "flex", flexDirection: "column", gap: ".75rem", textTransform: "uppercase", letterSpacing: ".2em" }}>
                            {[["BITRATE:", "4.2 MB/S"], ["INTEGRITY:", "98.4%"], ["PROTOCOL:", "AES-256"]].map(([k, v]) => (
                                <div key={k} style={{ display: "flex", gap: "1.5rem", background: "rgba(0,0,0,.8)", border: "1px solid rgba(230,0,0,.2)", padding: ".5rem 1rem" }}>
                                    <span>{k}</span><span style={{ color: "#dcd4c3" }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div style={{ width: panelOpen ? "420px" : "0", background: "#0a0a0a", color: "#dcd4c3", borderLeft: "1px solid rgba(230,0,0,.4)", display: "flex", flexDirection: "column", transition: "width .5s ease, opacity .5s ease", overflow: "hidden", opacity: panelOpen ? 1 : 0 }} className="grid-bg">
                        <div style={{ padding: "2.5rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                            <div>
                                <div style={{ borderBottom: "1px solid rgba(230,0,0,.4)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                                    <h3 className="sf" style={{ fontSize: "1.2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".2em" }}>DATA_READOUT</h3>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Special Elite',cursive", fontSize: ".65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".3em", marginBottom: ".75rem" }}>
                                            <span>SIGNAL_STATUS</span><span className="ap" style={{ color: "#ff3333" }}>COMPROMISED</span>
                                        </div>
                                        <div style={{ height: "4px", background: "#292524", borderRadius: "99px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: "74%", background: "#e60000", boxShadow: "0 0 10px #ff3333" }} />
                                        </div>
                                        <p className="sf" style={{ fontSize: ".65rem", color: "#78716c", textTransform: "uppercase", letterSpacing: ".1em", lineHeight: 1.6, borderLeft: "2px solid #e60000", padding: ".75rem 1.25rem", background: "rgba(230,0,0,.05)", marginTop: ".75rem" }}>
                                            "Visual artifacting detected at frame border. Suggests manual log adjustment to mask temporal offset."
                                        </p>
                                    </div>
                                    <div style={{ display: "grid", gap: "1rem" }}>
                                        <div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".4rem" }}>FRAME_LOSS</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: ".75rem", fontSize: ".7rem", fontWeight: 700, color: "#dcd4c3" }}>
                                                <div style={{ flex: 1, height: "4px", background: "#292524", borderRadius: "99px", overflow: "hidden" }}><div style={{ height: "100%", width: "12%", background: "#e60000" }} /></div>
                                                <span>12.4%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".4rem" }}>LAST_PACKET</div>
                                            <div className="sf" style={{ fontSize: ".7rem", fontWeight: 700, color: "#dcd4c3" }}>0xFA22 // 22:30:14.002</div>
                                        </div>
                                        <div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".4rem" }}>INTEGRITY_HASH</div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#78716c", wordBreak: "break-all" }}>SHA256: 8f2d...e4a1</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "grid", gap: "1.5rem", paddingTop: ".5rem" }}>
                                        <div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".75rem" }}>NODE_ID</div>
                                            <div className="sf" style={{ fontSize: ".85rem", fontWeight: 900, border: "1px solid rgba(230,0,0,.3)", padding: "1rem 1.5rem", background: "#000", textTransform: "uppercase", letterSpacing: ".2em", color: "#e60000" }}>GRID_LOCK::{feed.id}</div>
                                        </div>
                                        <div>
                                            <div className="sf" style={{ fontSize: ".6rem", color: "#57534e", textTransform: "uppercase", letterSpacing: ".2em", marginBottom: ".75rem" }}>VEC_COORD</div>
                                            <div className="sf" style={{ fontSize: ".85rem", fontWeight: 700, borderLeft: "4px solid #e60000", padding: "1rem 1.5rem", background: "rgba(230,0,0,.05)", textTransform: "uppercase", letterSpacing: ".1em", color: "#d6d3d1" }}>{feed.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ opacity: .4 }}>
                                <div style={{ borderBottom: "1px solid #292524", paddingBottom: ".75rem", marginBottom: "1.25rem" }}>
                                    <h3 className="sf" style={{ fontSize: ".7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".2em", color: "#57534e" }}>ARCHIVE_HASH</h3>
                                </div>
                                <div className="sf" style={{ fontSize: ".6rem", color: "#78716c", wordBreak: "break-all", lineHeight: 1.8, padding: "1.5rem", border: "1px dashed #292524", fontWeight: 700, background: "rgba(0,0,0,.4)", whiteSpace: "pre-line" }}>{hashStr}</div>
                            </div>
                        </div>
                        <div style={{ padding: "1.5rem", background: "#000", textAlign: "center", borderTop: "1px solid rgba(230,0,0,.4)" }}>
                            <div className="sf ap" style={{ fontSize: ".6rem", fontWeight: 900, color: "#e60000", textTransform: "uppercase", letterSpacing: ".6em" }}>SECURE_BUREAU_TERMINAL</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── GHOST SIDEBAR ──
function GhostSidebar({ onClose, onAllDone }: { onClose: () => void, onAllDone?: () => void }) {
    const [messages, setMessages] = useState<GhostMessage[]>([]);
    const [inputVal, setInputVal] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [qIdx, setQIdx] = useState(0);
    const [inited, setInited] = useState(false);
    const msgsRef = useRef<HTMLDivElement>(null);
    const msgId = useRef(0);

    const scrollG = () => {
        setTimeout(() => {
            if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
        }, 50);
    };

    const addMsg = useCallback(async (text: string, label: string, delay = 1500) => {
        setIsTyping(true);
        scrollG();
        await new Promise((r) => setTimeout(r, delay));
        setIsTyping(false);
        setMessages((prev: any) => [...prev, { id: msgId.current++, text, label, isPlayer: false }]);
        scrollG();
    }, []);

    useEffect(() => {
        if (inited) return;
        setInited(true);
        (async () => {
            await addMsg("Scanning surveillance network…\n\nMultiple camera feeds from the laboratory corridor have been flagged for analysis.", "GHOST41_ID > MISSION");
            await addMsg("Carefully observe the CCTV feeds and answer my questions based on what you find.\n\nYou may retry each question as many times as needed.", "GHOST41_ID > INSTRUCTION");
            await addMsg("Question 1\n\n" + QS[0].q, "GHOST41_ID > QUERY");
        })();
    }, [inited, addMsg]);

    useEffect(() => { scrollG(); }, [messages, isTyping]);

    const send = async () => {
        if (isTyping || !inputVal.trim()) return;
        const val = inputVal.trim();
        setInputVal("");
        setMessages((prev: any) => [...prev, { id: msgId.current++, text: val, label: "", isPlayer: true }]);
        scrollG();
        const q = QS[qIdx];
        if (!q) return;
        const result = await verifyGhostAnswer('task2', q.qId, val);
        if (result.correct) {
            await addMsg(result.successMessage || 'Correct.', "GHOST41_ID > ANALYSIS");
            if (qIdx < QS.length - 1) {
                const next = qIdx + 1;
                setQIdx(next);
                await addMsg(`Question ${next + 1}\n\n` + QS[next].q, "GHOST41_ID > QUERY");
            } else {
                await addMsg("🔓 TASK 3 UNLOCKED\n\nAccess granted. Proceed to the next phase of the investigation.", "SYSTEM > NOTIFICATION");
                if (onAllDone) setTimeout(onAllDone, 2000);
            }
        } else {
            await addMsg(result.failureMessage || "That's not right. Try again.", "GHOST41_ID > ERROR");
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, right: 0, zIndex: 200, width: "360px", height: "100vh", background: "#0a0a0a", borderLeft: "2px solid rgba(230,0,0,.4)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "-8px 0 40px rgba(0,0,0,.9)" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 6px)", pointerEvents: "none", zIndex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid rgba(230,0,0,.3)", background: "#0d0606", flexShrink: 0, position: "relative", zIndex: 2 }}>
                <div style={{ width: "52px", height: "52px", flexShrink: 0, background: "#0a0000", border: "1px solid rgba(230,0,0,.3)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <GhostSVG size={44} />
                </div>
                <div style={{ flex: 1 }}>
                    <div className="sf" style={{ fontSize: "13px", fontWeight: 900, letterSpacing: "3px", color: "#e60000", textTransform: "uppercase" }}>GHOST41_ID</div>
                    <div style={{ fontSize: "9px", color: "rgba(230,0,0,.5)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Courier New',monospace" }}>Investigation Assistant · Online</div>
                </div>
                <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(230,0,0,.5)", borderRadius: "2px", color: "#e60000", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", padding: "5px 10px", cursor: "pointer", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap", transition: "background .15s" }}
                    onMouseOver={(e: any) => (e.currentTarget.style.background = "rgba(230,0,0,.15)")}
                    onMouseOut={(e: any) => (e.currentTarget.style.background = "transparent")}>
                    ✕ CLOSE
                </button>
            </div>
            <div ref={msgsRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: "10px", position: "relative", zIndex: 2, scrollbarWidth: "thin", scrollbarColor: "#3a0a0a #0a0a0a" }}>
                {messages.map((m) =>
                    m.isPlayer ? (
                        <div key={m.id} style={{ background: "#0d0000", border: "1px solid rgba(230,0,0,.25)", borderLeft: "3px solid #e60000", borderRadius: "6px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "12px", color: "#e60000", lineHeight: 1.65, fontFamily: "'Courier New',monospace" }}>{m.text}</div>
                        </div>
                    ) : (
                        <div key={m.id} style={{ background: "#110000", border: "1px solid rgba(230,0,0,.2)", borderRadius: "6px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "rgba(230,0,0,.7)", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Courier New',monospace" }}>{m.label}</div>
                            <div style={{ fontSize: "12px", color: "#dcd4c3", lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace" }}>{m.text}</div>
                        </div>
                    )
                )}
                {isTyping && (
                    <div style={{ background: "#110000", border: "1px solid rgba(230,0,0,.2)", borderRadius: "6px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: "rgba(230,0,0,.6)", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Courier New',monospace" }}>GHOST41_ID › TYPING</div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
                            <div className="ab bd1" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(230,0,0,.4)" }} />
                            <div className="ab bd2" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(230,0,0,.4)" }} />
                            <div className="ab bd3" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(230,0,0,.4)" }} />
                        </div>
                    </div>
                )}
            </div>
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(230,0,0,.2)", background: "#0d0606", flexShrink: 0, position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" placeholder="Type your answer…" value={inputVal} onChange={(e: any) => setInputVal(e.target.value)}
                        onKeyDown={(e: any) => { if (e.key === "Enter") send(); }}
                        style={{ flex: 1, background: "#110000", border: "1px solid rgba(230,0,0,.25)", borderRadius: "4px", outline: "none", color: "#dcd4c3", fontSize: "11px", fontFamily: "'Courier New',monospace", padding: "10px 12px", transition: "border-color .2s" }}
                        onFocus={(e: any) => (e.currentTarget.style.borderColor = "#e60000")}
                        onBlur={(e: any) => (e.currentTarget.style.borderColor = "rgba(230,0,0,.25)")} />
                    <button onClick={send} style={{ background: "#110000", border: "1px solid rgba(230,0,0,.25)", borderRadius: "4px", color: "#dcd4c3", fontSize: "9px", fontWeight: 700, letterSpacing: "2px", padding: "0 14px", cursor: "pointer", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap", transition: "border-color .2s, color .2s" }}
                        onMouseOver={(e: any) => { e.currentTarget.style.borderColor = "#e60000"; e.currentTarget.style.color = "#e60000"; }}
                        onMouseOut={(e: any) => { e.currentTarget.style.borderColor = "rgba(230,0,0,.25)"; e.currentTarget.style.color = "#dcd4c3"; }}>
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── MAIN APP ──
export default function ForensicInvestigation() {
    const [phase, setPhase] = useState<"intro" | "app">("intro");
    const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
    const [ghostOpen, setGhostOpen] = useState(false);
    const [hlTs, setHlTs] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const openModal = (f: Feed) => {

        setSelectedFeed(f);
        setHlTs(f.timestamp.split(" ")[1]);
    };

    const closeModal = () => setSelectedFeed(null);

    return (
        <>
            <style>{globalStyles}</style>
            <div className="fi-body">
                {/* ── INTRO ── */}
                {phase === "intro" && (
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
                                <div>
                                    <p className="ap sf" style={{ color: "#fb923c", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".7rem" }}>&gt; Scanning surveillance network…</p>
                                    <p style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem", lineHeight: 1.5, marginTop: ".3rem" }}>Multiple camera feeds from the laboratory corridor are being processed.</p>
                                </div>
                                <div>
                                    <p className="sf" style={{ color: "#fb923c", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".7rem" }}>&gt; Objective Analysis</p>
                                    <p style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem", lineHeight: 1.5, marginTop: ".3rem" }}>Carefully observe the available CCTV footage and identify important details from the surveillance data.</p>
                                </div>
                                <div>
                                    <p className="sf" style={{ color: "#fb923c", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".7rem" }}>&gt; Communication Protocol</p>
                                    <p style={{ color: "#fff", fontWeight: 700, fontSize: ".85rem", lineHeight: 1.5, marginTop: ".3rem" }}>Once confident, open the Ghost41_ID terminal and answer my questions.</p>
                                    <p className="sf" style={{ fontSize: ".7rem", color: "rgba(255,255,255,.7)", fontStyle: "italic", background: "rgba(153,0,0,.2)", padding: ".5rem", borderRadius: ".5rem", border: "1px solid rgba(153,0,0,.3)", marginTop: ".4rem" }}>Note: You may retry each question as many times as necessary.</p>
                                    <p className="sf" style={{ color: "#f87171", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".9rem", textAlign: "center", marginTop: ".5rem" }}>Are you ready to proceed?</p>
                                </div>
                            </div>
                            <div style={{ padding: "1rem 1.5rem", background: "rgba(17,16,18,.5)", borderTop: "1px solid rgba(230,0,0,.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".75rem" }}>
                                <button onClick={() => setPhase("app")} className="sf"
                                    style={{ padding: ".75rem 2.5rem", background: "rgba(230,0,0,.1)", border: "1px solid rgba(230,0,0,.5)", borderRadius: ".75rem", color: "#e60000", fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase", fontSize: ".75rem", cursor: "pointer", transition: "all .3s" }}
                                    onMouseOver={(e: any) => (e.currentTarget.style.background = "rgba(230,0,0,.2)")}
                                    onMouseOut={(e: any) => (e.currentTarget.style.background = "rgba(230,0,0,.1)")}>
                                    [ Begin Investigation ]
                                </button>
                                <div style={{ display: "flex", gap: "1.5rem" }}>
                                    {[
                                        { icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, label: "Integrity: 98.4%" },
                                        { icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, label: "Signal: Secure" },
                                        { icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>, label: "Priority: Alpha" },
                                    ].map(({ icon, label }) => (
                                        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".2rem" }}>
                                            <svg width="10" height="10" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">{icon}</svg>
                                            <span className="sf" style={{ fontSize: ".45rem", color: "rgba(252,165,165,.6)", textTransform: "uppercase", letterSpacing: ".1em" }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MAIN APP ── */}
                {phase === "app" && (
                    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", paddingBottom: "5rem" }}>
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
                            <Timeline highlightTs={hlTs} />
                            <section>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                                    <div className="sk" style={{ background: "#e60000", color: "#000", fontWeight: 900, padding: ".5rem 1.5rem", boxShadow: "0 0 15px rgba(230,0,0,.3)" }}>
                                        <span className="ski sf">Evidence Matrix</span>
                                    </div>
                                    <div style={{ height: "2px", flex: 1, background: "linear-gradient(to right, rgba(230,0,0,.5), transparent)" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
                                    {FEEDS.map((f) => <FeedCard key={f.id} f={f} onClick={() => openModal(f)} />)}
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
                            <div onClick={() => setGhostOpen(true)} className="ghost-float" style={{ position: "fixed", bottom: "70px", right: "24px", zIndex: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }}>
                                <GhostSVG size={60} />
                                <span className="sf ap" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "2px", color: "#e60000", background: "rgba(10,0,0,0.9)", border: "1px solid rgba(230,0,0,0.4)", borderRadius: "3px", padding: "3px 8px", whiteSpace: "nowrap", textTransform: "uppercase" }}>ASK ME!</span>
                            </div>
                        )}

                        {/* Modal */}
                        {selectedFeed && <Modal feed={selectedFeed} onClose={closeModal} />}

                        {/* Ghost sidebar */}
                        {ghostOpen && <GhostSidebar onClose={() => setGhostOpen(false)} onAllDone={() => setShowSuccessModal(true)} />}

                        {/* SUCCESS MODAL */}
                        {showSuccessModal && (
                            <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "modalIn 0.5s ease" }}>
                                <div style={{ background: "#0a0a0a", border: "1px solid #e60000", padding: "40px", borderRadius: "4px", textAlign: "center", maxWidth: "400px", boxShadow: "0 0 40px rgba(230,0,0,0.2)" }}>
                                    <h2 className="sf" style={{ color: "#e60000", fontSize: "24px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", textShadow: "0 0 20px rgba(230,0,0,0.5)" }}>Task Complete</h2>
                                    <p className="sf" style={{ color: "#dcd4c3", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6" }}>CCTV Reconstruction is complete. The suspect's timeline is logged. Return to the dashboard to proceed.</p>
                                    <a href="/dashboard" className="sf" style={{ display: "inline-block", background: "transparent", border: "1px solid #e60000", color: "#e60000", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s" }} onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(230,0,0,0.1)"; }} onMouseOut={(e: any) => { e.currentTarget.style.background = "transparent"; }}>RETURN TO DASHBOARD</a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
