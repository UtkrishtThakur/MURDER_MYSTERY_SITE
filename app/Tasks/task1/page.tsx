'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { verifyGhostAnswer } from "@/app/lib/verifyGhostAnswer";

// ── TYPES ────────────────────────────────────────────────────────────────────
interface AccessRow { user: string; time: string; connection: string; }
interface EndpointRow { user: string; time: string; action: string; xfer: string; }
interface VpnRow { user: string; time: string; tunnel: string; }
interface CombinedRow { user: string; loginTime: string; fileAccessed: string; }
interface Question { q: string; hint: string; qId: string; stId: string; }
interface ChatMsg { id: number; label?: string; body: string; isUser?: boolean; isTyping?: boolean; }
interface IntroMsg { id: number; label?: string; body: string; show: boolean; isTyping?: boolean; }
type QStatus = "pending" | "ok" | "fail";

// ── DATA ─────────────────────────────────────────────────────────────────────
const ACCESS: AccessRow[] = [
  { user: "gjjuh.drwl", time: "06:42", connection: "LOGIN: workstation-04" },
  { user: "lukjwu01", time: "07:11", connection: "READ: onboarding.pdf" },
  { user: "ylzwhuk.zhrg", time: "07:33", connection: "LOGIN: workstation-07" },
  { user: "lukjwu02", time: "07:55", connection: "LOGIN: workstation-02" },
  { user: "wldeho.dju", time: "08:15", connection: "READ: spec.pdf" },
  { user: "gjjuh.drwl", time: "08:16", connection: "READ: spec.pdf" },
  { user: "hwsru.uhuch", time: "08:52", connection: "LOGIN: workstation-11" },
  { user: "wldeho.dju", time: "09:10", connection: "WRITE: main.py" },
  { user: "hwsru.uhuch", time: "09:48", connection: "READ: security.c" },
  { user: "ph_obk", time: "10:03", connection: "EXEC: test_runner.sh" },
  { user: "zhyth.dehwnh", time: "10:29", connection: "READ: budget_q1.xlsx" },
  { user: "gjjuh.drwl", time: "10:55", connection: "WRITE: release_notes.md" },
  { user: "hhwth.njekh", time: "11:14", connection: "READ: neural_ctrl.c" },
  { user: "wldeho.dju", time: "11:45", connection: "READ: neural_ctrl.c" },
  { user: "ylzwhuk.zhrg", time: "12:07", connection: "READ: telemetry.c" },
  { user: "lukjwu01", time: "12:44", connection: "READ: handbook.pdf" },
  { user: "hwsru.uhuch", time: "13:20", connection: "WRITE: security.c" },
  { user: "zhyth.dehwnh", time: "13:51", connection: "READ: policies.pdf" },
  { user: "wldeho.dju", time: "14:14", connection: "WRITE: main.py" },
  { user: "hhwth.njekh", time: "14:39", connection: "READ: spec.pdf" },
  { user: "lukjwu02", time: "15:02", connection: "READ: handbook.pdf" },
  { user: "gjjuh.drwl", time: "15:48", connection: "EXEC: deploy.sh" },
  { user: "ph_obk", time: "16:11", connection: "EXEC: regression.sh" },
  { user: "ylzwhuk.zhrg", time: "16:58", connection: "LOGOUT: workstation-07" },
  { user: "hwsru.uhuch", time: "17:30", connection: "LOGOUT: workstation-11" },
  { user: "zhyth.dehwnh", time: "18:02", connection: "LOGOUT: workstation-09" },
  { user: "gjjuh.drwl", time: "18:44", connection: "LOGOUT: workstation-04" },
  { user: "wldeho.dju", time: "21:02", connection: "zip nb_v4_backup.zip" },
  { user: "wldeho.dju", time: "21:04", connection: "BULK EXPORT → 203.0.113.45" },
  { user: "wldeho.dju", time: "21:07", connection: "git commit 'internal patch'" },
  { user: "xebdklc_41", time: "22:11", connection: "READ: main.py" },
  { user: "xebdklc_41", time: "22:13", connection: "WRITE: main.py" },
  { user: "xebdklc_41", time: "22:15", connection: "WRITE: security.c" },
];

const ENDPOINT: EndpointRow[] = [
  { user: "lukjwu01", time: "07:58", action: "READ: handbook.pdf", xfer: "1.2 MB" },
  { user: "ylzwhuk.zhrg", time: "08:04", action: "READ: policies.pdf", xfer: "0.8 MB" },
  { user: "ph_obk", time: "09:22", action: "WRITE: test_neural.c", xfer: "2.1 MB" },
  { user: "hwsru.uhuch", time: "10:19", action: "READ: telemetry.c", xfer: "0.5 MB" },
  { user: "gjjuh.drwl", time: "11:09", action: "READ: main.py", xfer: "1.8 MB" },
  { user: "zhyth.dehwnh", time: "12:37", action: "READ: budget_q1.xlsx", xfer: "0.3 MB" },
  { user: "gjjuh.drwl", time: "13:28", action: "WRITE: release_notes.md", xfer: "0.9 MB" },
  { user: "hhwth.njekh", time: "14:48", action: "READ: security.c", xfer: "0.2 MB" },
  { user: "hwsru.uhuch", time: "15:33", action: "READ: neural_ctrl.c", xfer: "0.7 MB" },
  { user: "wldeho.dju", time: "18:12", action: "READ: spec.pdf", xfer: "4.1 MB" },
  { user: "lukjwu02", time: "19:03", action: "READ: spec.pdf", xfer: "0.4 MB" },
  { user: "wldeho.dju", time: "21:04", action: "BULK EXPORT [FLAGGED]", xfer: "18.6 GB" },
  { user: "xebdklc_41", time: "22:28", action: "READ: neural_ctrl.c", xfer: "3.2 MB" },
  { user: "xebdklc_41", time: "22:31", action: "WRITE: neural_ctrl.c", xfer: "2.8 MB" },
];

const VPN: VpnRow[] = [
  { user: "gjjuh.drwl", time: "06:44", tunnel: "VPN → internal-dev-net" },
  { user: "ylzwhuk.zhrg", time: "07:35", tunnel: "VPN → internal-ci" },
  { user: "lukjwu02", time: "07:57", tunnel: "VPN → internal-dev-net" },
  { user: "cjybid.obk", time: "07:55", tunnel: "VPN → internal-monitoring" },
  { user: "lukjwu01", time: "09:07", tunnel: "VPN → internal-dev-net" },
  { user: "hwsru.uhuch", time: "09:50", tunnel: "VPN → internal-sec-net" },
  { user: "orlgc_hxjuk_02", time: "10:14", tunnel: "VPN → internal-ci" },
  { user: "ph_obk", time: "10:05", tunnel: "VPN → internal-test-net" },
  { user: "zhyth.dehwnh", time: "10:31", tunnel: "VPN → internal-finance" },
  { user: "hrclk_obk", time: "11:18", tunnel: "VPN → internal-sec-net" },
  { user: "gjjuh.drwl", time: "10:57", tunnel: "VPN → internal-dev-net" },
  { user: "hhwth.njekh", time: "11:16", tunnel: "VPN → internal-dev-net" },
  { user: "vhqjkjwlh_dtd", time: "12:09", tunnel: "VPN → vendor-net" },
  { user: "lukjwu02", time: "13:25", tunnel: "VPN → internal-dev-net" },
  { user: "hwsru.uhuch", time: "13:22", tunnel: "VPN → internal-sec-net" },
  { user: "orlgc_hxjuk_03", time: "14:41", tunnel: "VPN → internal-ci" },
  { user: "zhyth.dehwnh", time: "13:53", tunnel: "VPN → internal-finance" },
  { user: "ph_obk", time: "15:09", tunnel: "VPN → internal-test-net" },
  { user: "ylzwhuk.zhrg", time: "15:22", tunnel: "VPN → internal-ci" },
  { user: "njkwlvd_obk", time: "16:18", tunnel: "VPN → internal-monitoring" },
  { user: "hhwth.njekh", time: "16:45", tunnel: "VPN → internal-dev-net" },
  { user: "cjybid.obk", time: "17:03", tunnel: "VPN → internal-sec-net" },
  { user: "gjjuh.drwl", time: "17:15", tunnel: "VPN → internal-dev-net" },
  { user: "hrclk_obk", time: "18:11", tunnel: "VPN → internal-sec-net" },
  { user: "wldeho.dju", time: "21:03", tunnel: "VPN → 203.0.113.45" },
  { user: "qhvlglkljd_obk", time: "22:18", tunnel: "VPN → internal-ops" },
];

const COMBINED: CombinedRow[] = [
  { user: "wldeho.dju", loginTime: "08:15", fileAccessed: "spec.pdf" },
  { user: "gjjuh.drwl", loginTime: "08:16", fileAccessed: "spec.pdf" },
  { user: "hwsru.uhuch", loginTime: "09:48", fileAccessed: "security.c" },
  { user: "zhyth.dehwnh", loginTime: "12:37", fileAccessed: "budget_q1.xlsx" },
  { user: "wldeho.dju", loginTime: "21:04", fileAccessed: "nb_v4_backup.zip (18GB EXPORT)" },
];

const QUESTIONS: Question[] = [
  { q: "Who is responsible for the data breach?", hint: "Cross-reference access logs and endpoint transfer anomalies.", qId: "q1", stId: "st-q1" },
  { q: "How much data was exfiltrated in total?", hint: "Check the endpoint Transfer column for large anomalies.", qId: "q2", stId: "st-q2" },
  { q: "What external IP did the suspect tunnel to at 21:03?", hint: "Filter VPN logs for external connections.", qId: "q3", stId: "st-q3" },
];

// ── PIXEL GHOST SVG ──────────────────────────────────────────────────────────
const GhostSVG = ({ size = 44 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="6" width="16" height="18" fill="#b0cce0" />
    <rect x="6" y="8" width="2" height="14" fill="#b0cce0" />
    <rect x="24" y="8" width="2" height="14" fill="#b0cce0" />
    <rect x="10" y="4" width="12" height="4" fill="#b0cce0" />
    <rect x="8" y="5" width="16" height="2" fill="#b0cce0" />
    <rect x="6" y="22" width="4" height="4" fill="#b0cce0" />
    <rect x="14" y="22" width="4" height="4" fill="#b0cce0" />
    <rect x="22" y="22" width="4" height="4" fill="#b0cce0" />
    <rect x="10" y="24" width="4" height="2" fill="#0b1825" />
    <rect x="18" y="24" width="4" height="2" fill="#0b1825" />
    <rect x="11" y="12" width="4" height="4" fill="#0b1825" />
    <rect x="17" y="12" width="4" height="4" fill="#0b1825" />
    <rect x="12" y="13" width="1" height="1" fill="#00d4c8" />
    <rect x="18" y="13" width="1" height="1" fill="#00d4c8" />
  </svg>
);

const SearchIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── LOG TABLE ────────────────────────────────────────────────────────────────
type AnyRow = Record<string, string>;
interface LogTableProps {
  title: string;
  data: AnyRow[];
  cols: string[];
  headers: string[];
  gridCols: string;
}
const LogTable = ({ title, data, cols, headers, gridCols }: LogTableProps) => {
  const [search, setSearch] = useState("");
  const filtered = search
    ? data.filter(r => cols.some(c => (r[c] || "").toLowerCase().includes(search.toLowerCase())))
    : data;

  return (
    <div style={{ background: "#110707", border: "1px solid #2a0e0e", borderTop: "2px solid #6a0800", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 11px", borderBottom: "1px solid #2a0e0e", background: "#160909" }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2.5px", color: "#ff2200", textTransform: "uppercase" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#080404", border: "1px solid #2a0e0e", borderRadius: 2, padding: "3px 6px" }}>
          <span style={{ color: "#3a2222" }}><SearchIcon /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter..."
            style={{ background: "transparent", border: "none", outline: "none", color: "#00e5b0", fontSize: 10, fontFamily: "'Courier New',monospace", width: 72 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, padding: "5px 11px", borderBottom: "1px solid #2a0e0e" }}>
        {headers.map(h => <span key={h} style={{ fontSize: 9, color: "#3a2222", letterSpacing: 1, textTransform: "uppercase" }}>{h}</span>)}
      </div>
      <div style={{ maxHeight: 210, overflowY: "auto" }}>
        {filtered.length === 0
          ? <div style={{ color: "#3a2222", fontSize: 10, padding: "8px 11px" }}>— no results —</div>
          : filtered.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: gridCols, padding: "5px 11px", borderBottom: "1px solid rgba(42,14,14,0.4)" }}>
              {cols.map((c, ci) => (
                <span key={c} style={{ fontSize: 10, color: ci === 0 ? "#00e5b0" : "#007a5e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row[c]}
                </span>
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
};

// ── TYPING DOTS ───────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "8px 4px" }}>
    {[0, 200, 400].map(delay => (
      <span key={delay} style={{
        width: 6, height: 6, borderRadius: "50%", background: "#4a6a80",
        display: "inline-block",
        animation: `tdot 1.2s ease-in-out ${delay}ms infinite`,
      }} />
    ))}
  </div>
);

// ── INTRO MODAL ───────────────────────────────────────────────────────────────
interface IntroModalProps { onDismiss: () => void; }
const IntroModal = ({ onDismiss }: IntroModalProps) => {
  const [messages, setMessages] = useState<IntroMsg[]>([]);
  const [showBtn, setShowBtn] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const addTyping = useCallback((): number => {
    const id = ++idRef.current;
    setMessages(m => [...m, { id, isTyping: true, body: "", show: true }]);
    return id;
  }, []);

  const removeTyping = useCallback((id: number) => {
    setMessages(m => m.filter(x => x.id !== id));
  }, []);

  const addCard = useCallback((label: string | undefined, body: string) => {
    const id = ++idRef.current;
    setMessages(m => [...m, { id, label, body, show: false }]);
    setTimeout(() => setMessages(m => m.map(x => x.id === id ? { ...x, show: true } : x)), 50);
  }, []);

  useEffect(() => {
    (async () => {
      await delay(600);
      let tid = addTyping(); await delay(1300); removeTyping(tid);
      addCard("ghost41_id › BRIEFING", "Welcome, analyst. A security breach has occurred at NEUROLINK_SEC.");
      await delay(900);
      tid = addTyping(); await delay(1100); removeTyping(tid);
      addCard(undefined, "Sensitive data has been exfiltrated from the internal network. Your mission: identify the perpetrator using the logs.");
      await delay(800);
      tid = addTyping(); await delay(1200); removeTyping(tid);
      addCard("ghost41_id › INSTRUCTIONS", "Examine the Access Logs, Endpoint Logs, and VPN Network Logs on the main console.");
      await delay(800);
      tid = addTyping(); await delay(1000); removeTyping(tid);
      addCard(undefined, "Then open the ghost41_id terminal (floating icon, bottom-right) and answer my questions. You can retry each question as many times as you need.");
      await delay(600);
      tid = addTyping(); await delay(900); removeTyping(tid);
      addCard("ghost41_id › QUERY", "Are you ready to begin the investigation?");
      await delay(300);
      setShowBtn(true);
    })();
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(4,1,1,0.94)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
      <div style={{ width: 430, maxWidth: "95vw", background: "#0b1825", border: "1px solid #1e4060", borderTop: "2px solid #00d4c8", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 0 60px rgba(0,212,200,0.12),0 30px 80px rgba(0,0,0,0.8)", animation: "modalIn 0.5s cubic-bezier(.16,1,.3,1) forwards" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #1a3550", background: "#0f2030" }}>
          <div style={{ width: 52, height: 52, flexShrink: 0, background: "#0a1520", border: "1px solid #1e4060", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GhostSVG size={44} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: "#00d4c8", textTransform: "uppercase" }}>ghost41_id</div>
            <div style={{ fontSize: 9, color: "#4a6a80", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>Investigation Assistant · Online</div>
          </div>
        </div>
        {/* log */}
        <div ref={logRef} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 140, maxHeight: "52vh", overflowY: "auto" }}>
          {messages.map(msg => msg.isTyping ? (
            <div key={msg.id}><TypingDots /></div>
          ) : (
            <div key={msg.id} style={{ background: "#0e2236", border: "1px solid #1a3550", borderRadius: 6, padding: "12px 14px", opacity: msg.show ? 1 : 0, transform: msg.show ? "none" : "translateY(8px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
              {msg.label && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: "#00d4c8", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>{msg.label}</div>}
              <div style={{ fontSize: 12, color: "#c8dce8", lineHeight: 1.7 }}>{msg.body}</div>
            </div>
          ))}
        </div>
        {/* footer */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid #1a3550", background: "#0f2030", display: "flex", justifyContent: "flex-end", opacity: showBtn ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <button onClick={onDismiss} style={{ background: "transparent", border: "1px solid #00d4c8", borderRadius: 4, color: "#00d4c8", fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "10px 24px", cursor: "pointer", fontFamily: "'Courier New',monospace" }}>
            [ BEGIN INVESTIGATION ]
          </button>
        </div>
      </div>
    </div>
  );
};

// ── GHOST SIDE PANEL ──────────────────────────────────────────────────────────
interface GhostPanelProps {
  open: boolean;
  onClose: () => void;
  qStatuses: QStatus[];
  onQStatusChange: (idx: number, s: QStatus) => void;
  onAllDone: () => void;
}
const GhostPanel = ({ open, onClose, qStatuses, onQStatusChange, onAllDone }: GhostPanelProps) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [qIdx, setQIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [started, setStarted] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const addMsg = useCallback((label: string | undefined, body: string, isUser = false) => {
    const id = ++idRef.current;
    setMessages(m => [...m, { id, label, body, isUser }]);
  }, []);

  const addTyping = useCallback((): number => {
    const id = ++idRef.current;
    setMessages(m => [...m, { id, body: "", isTyping: true }]);
    return id;
  }, []);

  const removeTyping = useCallback((id: number) => {
    setMessages(m => m.filter(x => x.id !== id));
  }, []);

  const askQuestion = useCallback(async (idx: number) => {
    if (idx >= QUESTIONS.length) {
      setDone(true);
      setAwaitingAnswer(false);
      const tid = addTyping(); await delay(700); removeTyping(tid);
      addMsg("ghost41_id › VERDICT", "✓ All confirmed. Breach fully reconstructed. Access level elevated.");
      onAllDone();
      return;
    }
    const q = QUESTIONS[idx];
    setAwaitingAnswer(true);
    addMsg("ghost41_id › QUERY", q.q);
    const id = ++idRef.current;
    setMessages(m => [...m, { id, body: q.hint, label: undefined, isUser: false }]);
  }, [addMsg, addTyping, removeTyping, onAllDone]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      (async () => {
        await delay(400);
        let tid = addTyping(); await delay(1400); removeTyping(tid);
        addMsg(undefined, "Your mission: Examine the logs carefully. Cross-reference access, endpoint transfer, and VPN tunnel records to reconstruct the breach.");
        await delay(700);
        tid = addTyping(); await delay(900); removeTyping(tid);
        addMsg(undefined, "Once you have analyzed the data — come back and tell me what you found.");
        await delay(800);
        tid = addTyping(); await delay(1100); removeTyping(tid);
        askQuestion(0);
      })();
    }
  }, [open, started]);

  const send = useCallback(async () => {
    if (done || !awaitingAnswer || !input.trim()) return;
    const val = input.trim();
    setInput("");
    setAwaitingAnswer(false);
    addMsg(undefined, val, true);
    const q = QUESTIONS[qIdx];
    await delay(200);
    const tid = addTyping(); await delay(600); removeTyping(tid);
    const result = await verifyGhostAnswer('task1', q.qId, val);
    if (result.correct) {
      addMsg(undefined, result.successMessage || `✓ Confirmed — ${result.displayAnswer}`);
      onQStatusChange(qIdx, "ok");
      const next = qIdx + 1;
      setQIdx(next);
      await delay(500);
      askQuestion(next);
    } else {
      addMsg(undefined, result.failureMessage || "✗ Incorrect. Try again.");
      await delay(300);
      setAwaitingAnswer(true);
    }
  }, [done, awaitingAnswer, input, qIdx, addMsg, addTyping, removeTyping, onQStatusChange, askQuestion]);

  const dots = QUESTIONS.map((_, i) => {
    if (qStatuses[i] === "ok") return "done";
    if (qStatuses[i] === "fail") return "fail";
    if (i === qIdx && !done) return "cur";
    return "";
  });

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 360, zIndex: 960, background: "#0b1825", borderLeft: "2px solid #1e4060", display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(.16,1,.3,1)", boxShadow: "-8px 0 40px rgba(0,0,0,0.7)" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1e4060", background: "#0f2030", flexShrink: 0 }}>
        <div style={{ width: 52, height: 52, flexShrink: 0, background: "#0a1520", border: "1px solid #1e4060", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GhostSVG size={44} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: "#00d4c8", textTransform: "uppercase" }}>ghost41_id</div>
          <div style={{ fontSize: 9, color: "#4a6a80", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>Investigation Assistant · Online</div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #cc1100", borderRadius: 2, color: "#cc1100", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", padding: "5px 10px", cursor: "pointer", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>✕ CLOSE</button>
      </div>
      {/* log */}
      <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(msg => msg.isTyping ? (
          <div key={msg.id} style={{ background: "#0e2236", border: "1px solid #1a3550", borderRadius: 6, padding: "12px 14px" }}><TypingDots /></div>
        ) : msg.isUser ? (
          <div key={msg.id} style={{ background: "#0d1e30", border: "1px solid #1e4060", borderLeft: "3px solid #00d4c8", borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#00d4c8", lineHeight: 1.65 }}>{msg.body}</div>
          </div>
        ) : (
          <div key={msg.id} style={{ background: "#0e2236", border: "1px solid #1a3550", borderRadius: 6, padding: "12px 14px" }}>
            {msg.label && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: "#00d4c8", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>{msg.label}</div>}
            <div style={{ fontSize: 12, color: "#c8dce8", lineHeight: 1.65, fontStyle: !msg.label && msg.body.startsWith("Cross") || msg.body.startsWith("Check") || msg.body.startsWith("Filter") ? "italic" : "normal", opacity: !msg.label && (msg.body.startsWith("Cross") || msg.body.startsWith("Check") || msg.body.startsWith("Filter")) ? 0.6 : 1 }}>{msg.body}</div>
          </div>
        ))}
      </div>
      {/* input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid #1a3550", background: "#0f2030", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 8 }}>
          {dots.map((cls, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: cls === "done" ? "#00d4c8" : cls === "fail" ? "#ff2200" : cls === "cur" ? "#00d4c8" : "#1e4060", boxShadow: cls === "cur" ? "0 0 6px #00d4c8" : "none", animation: cls === "cur" ? "blink 0.9s ease-in-out infinite" : "none", display: "inline-block" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={done || !awaitingAnswer}
            placeholder="Type your answer..."
            style={{ flex: 1, background: "#162840", border: "1px solid #1a3550", borderRadius: 4, outline: "none", color: "#c8dce8", fontSize: 11, fontFamily: "'Courier New',monospace", padding: "10px 12px", opacity: done || !awaitingAnswer ? 0.4 : 1 }} />
          <button onClick={send} disabled={done || !awaitingAnswer}
            style={{ background: "#162840", border: "1px solid #1a3550", borderRadius: 4, color: "#c8dce8", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "0 14px", cursor: done || !awaitingAnswer ? "not-allowed" : "pointer", fontFamily: "'Courier New',monospace", whiteSpace: "nowrap", opacity: done || !awaitingAnswer ? 0.3 : 1 }}>
            [ SEND ]
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [ghostOpen, setGhostOpen] = useState(false);
  const [ghostStarted, setGhostStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [glitch, setGlitch] = useState(false);
  const [footerMsg, setFooterMsg] = useState('"Answer investigation prompts to unlock access."');
  const [csq, setCsq] = useState([true, true, false, false, false]);
  const [qStatuses, setQStatuses] = useState<QStatus[]>(["pending", "pending", "pending"]);
  const [progWidth, setProgWidth] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Glitch + scanlines
  useEffect(() => {
    const gi = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 180); }, 3800);
    return () => clearInterval(gi);
  }, []);

  const handleQStatus = useCallback((idx: number, s: QStatus) => {
    setQStatuses(prev => { const n = [...prev]; n[idx] = s; return n; });
    setProgWidth(prev => prev + (100 / 3));
  }, []);

  const handleAllDone = useCallback(() => {
    setFooterMsg('"All prompts answered. Clearance elevated."');
    setCsq([true, true, true, true, true]);
    setProgWidth(100);
    setTimeout(() => setShowSuccessModal(true), 1500);
  }, []);

  const openGhost = () => {
    setGhostOpen(true);
    if (!ghostStarted) setGhostStarted(true);
  };

  const s = {
    root: { height: "100vh", overflow: "hidden", background: "#080404", fontFamily: "'Courier New',monospace", color: "#c8c0c0", display: "flex", flexDirection: "column" as const, position: "relative" as const },
    scanlines: { position: "fixed" as const, inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)", pointerEvents: "none" as const, zIndex: 900 },
    vignette: { position: "fixed" as const, inset: 0, background: "radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.75) 100%)", pointerEvents: "none" as const, zIndex: 899 },
  };

  const csqColor = (i: number) => {
    if (i < 2) return { background: "#cc1100", border: "1px solid #cc1100" };
    if (csq[i]) return { background: "#ff2200", border: "1px solid #ff2200", boxShadow: "0 0 5px #cc1100" };
    return { border: "1px solid #6a0800" };
  };

  return (
    <div style={s.root}>
      <div style={s.scanlines} />
      <div style={s.vignette} />

      {/* GLOBAL KEYFRAMES */}
      <style>{`
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        @keyframes ghost-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        @keyframes label-pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        @keyframes tdot{0%,80%,100%{transform:scale(1);opacity:0.4;}40%{transform:scale(1.3);opacity:1;}}
        @keyframes modalIn{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0d0606;}
        ::-webkit-scrollbar-thumb{background:#6a0800;border-radius:2px;}
      `}</style>

      {/* INTRO MODAL */}
      {showIntro && <IntroModal onDismiss={() => setShowIntro(false)} />}

      {/* HEADER */}
      <div style={{ background: "#0d0606", borderBottom: "2px solid #cc1100", padding: "0 24px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(204,17,0,0.1),transparent 40%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#cc1100", fontSize: 15, animation: "blink 1.2s ease-in-out infinite" }}>⚠</span>
            <span style={{ color: "#c8c0c0", fontSize: 17, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", position: "relative" }}
              data-text="INTERNAL OPERATIONS CONSOLE">
              {glitch && <>
                <span style={{ position: "absolute", left: 3, top: 0, color: "#cc1100", opacity: 0.7, clipPath: "polygon(0 20%,100% 20%,100% 45%,0 45%)", pointerEvents: "none" }}>INTERNAL OPERATIONS CONSOLE</span>
                <span style={{ position: "absolute", left: -3, top: 0, color: "#00e5b0", opacity: 0.5, clipPath: "polygon(0 60%,100% 60%,100% 80%,0 80%)", pointerEvents: "none" }}>INTERNAL OPERATIONS CONSOLE</span>
              </>}
              INTERNAL OPERATIONS CONSOLE
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#00e5b0" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e5b0", boxShadow: "0 0 8px #00e5b0", animation: "blink 2s ease-in-out infinite", display: "inline-block" }} />
            ONLINE
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0 8px", fontSize: 10, letterSpacing: 1, color: "#6a5555" }}>
          Clearance level :
          <div style={{ display: "flex", gap: 4 }}>
            {csq.map((_, i) => (
              <div key={i} style={{ width: 18, height: 13, ...csqColor(i) }} />
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
        {/* title */}
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 3, color: "#ff2200", textTransform: "uppercase", paddingBottom: 9, borderBottom: "1px solid #2a0e0e", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#6a0800", fontSize: 11 }}>//</span>
          BREACH INVESTIGATION — NEUROLINK_SEC
        </div>

        {/* LOG GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11 }}>
          <LogTable title="Access Logs" data={ACCESS as AnyRow[]} cols={["user", "time", "connection"]} headers={["User", "Time", "Connection"]} gridCols="1.2fr 0.65fr 1.7fr" />
          <LogTable title="Endpoint Logs" data={ENDPOINT as AnyRow[]} cols={["user", "time", "action", "xfer"]} headers={["User", "Time", "Action", "Transfer"]} gridCols="1.1fr 0.55fr 1.2fr 0.8fr" />
          <LogTable title="VPN Network Logs" data={VPN as AnyRow[]} cols={["user", "time", "tunnel"]} headers={["User", "Time", "Tunnel"]} gridCols="1.2fr 0.65fr 1.7fr" />
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {/* Combined */}
          <div style={{ background: "#110707", border: "1px solid #2a0e0e", borderTop: "2px solid #6a0800", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 11px", borderBottom: "1px solid #2a0e0e", background: "#160909" }}>
              <div style={{ display: "flex" }}>
                {["Overview", "Timeline", "Anomalies"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", borderRight: "1px solid #2a0e0e", color: activeTab === tab ? "#00e5b0" : "#3a2222", fontSize: 9, fontWeight: 700, letterSpacing: 2, cursor: "pointer", fontFamily: "'Courier New',monospace", padding: "3px 9px", textTransform: "uppercase" }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 0.85fr 1.4fr", padding: "5px 11px", borderBottom: "1px solid #2a0e0e" }}>
              {["User", "Login Time", "File Accessed"].map(h => <span key={h} style={{ fontSize: 9, color: "#3a2222", letterSpacing: 1, textTransform: "uppercase" }}>{h}</span>)}
            </div>
            <div style={{ maxHeight: 210, overflowY: "auto" }}>
              {COMBINED.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 0.85fr 1.4fr", padding: "5px 11px", borderBottom: "1px solid rgba(42,14,14,0.4)" }}>
                  <span style={{ fontSize: 10, color: "#00e5b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.user}</span>
                  <span style={{ fontSize: 10, color: "#007a5e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.loginTime}</span>
                  <span style={{ fontSize: 10, color: "#007a5e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.fileAccessed}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investigation Status */}
          <div style={{ background: "#110707", border: "1px solid #2a0e0e", borderTop: "2px solid #6a0800", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ padding: "7px 12px", borderBottom: "1px solid #2a0e0e", background: "#160909", fontSize: 9, fontWeight: 700, letterSpacing: "2.5px", color: "#ff2200", textTransform: "uppercase" }}>Investigation Progress</div>
            <div style={{ padding: 12 }}>
              {[
                { num: "01", text: "Who is responsible for the breach?", stId: "st-q1" },
                { num: "02", text: "How much data was exfiltrated?", stId: "st-q2" },
                { num: "03", text: "What external IP was tunneled to at 21:03?", stId: "st-q3" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 2 ? "1px solid #2a0e0e" : "none" }}>
                  <span style={{ fontSize: 9, color: "#3a2222", letterSpacing: 1, flexShrink: 0, width: 20 }}>{item.num}</span>
                  <span style={{ fontSize: 11, color: "#6a5555", flex: 1 }}>{item.text}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, flexShrink: 0, width: 80, textAlign: "right", color: qStatuses[i] === "ok" ? "#00e5b0" : qStatuses[i] === "fail" ? "#ff2200" : "#3a2222" }}>
                    {qStatuses[i] === "ok" ? "✓ CONFIRMED" : qStatuses[i] === "fail" ? "✗ FAILED" : "PENDING"}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #2a0e0e" }}>
                <div style={{ fontSize: 9, color: "#3a2222", letterSpacing: 1, marginBottom: 6 }}>CLEARANCE PROGRESS</div>
                <div style={{ height: 5, background: "#080404", border: "1px solid #2a0e0e", borderRadius: 1, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progWidth}%`, background: "linear-gradient(90deg,#007a5e,#00e5b0)", transition: "width 0.8s ease", borderRadius: 1 }} />
                </div>
                <div style={{ fontSize: 9, color: "#3a2222", marginTop: 5, letterSpacing: 1 }}>
                  Open <span style={{ color: "#00e5b0" }}>ghost41_id</span> terminal to begin
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#0d0606", borderTop: "1px solid #6a0800", padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: 1 }}>
          <span style={{ color: "#cc1100", fontWeight: 700, marginRight: 8 }}>SYSTEM MESSAGE</span>
          <span style={{ color: "#6a5555" }}>{footerMsg}</span>
        </div>
        <div style={{ fontSize: 10, color: "#3a2222", letterSpacing: 1 }}>NEXT UNLOCK : <span style={{ color: "#00e5b0" }}>Incident Records Module</span></div>
      </div>

      {/* CLUE BADGE */}
      <div style={{ position: "fixed", bottom: 18, left: 20, zIndex: 950, background: "#0a0f14", border: "1px solid #1a3550", borderLeft: "2px solid #00d4c8", borderRadius: 3, padding: "6px 12px", maxWidth: 280, boxShadow: "0 0 20px rgba(0,212,200,0.08)" }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: "#00d4c8", textTransform: "uppercase", marginBottom: 4, opacity: 0.7 }}>CLUE — NAMES</div>
        <div style={{ fontSize: 10, color: "#8aaabb", fontStyle: "italic", letterSpacing: "0.5px", lineHeight: 1.5 }}>a fine cipher lies between two sevens</div>
      </div>

      {/* FLOATING GHOST */}
      <div onClick={openGhost} style={{ position: "fixed", bottom: 70, right: 24, zIndex: 950, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none", animation: "ghost-float 3s ease-in-out infinite" }}>
        <GhostSVG size={60} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#00d4c8", background: "rgba(11,24,37,0.9)", border: "1px solid #1e4060", borderRadius: 3, padding: "3px 8px", whiteSpace: "nowrap", textTransform: "uppercase", animation: "label-pulse 2s ease-in-out infinite" }}>ASK ME!</span>
      </div>

      {/* GHOST PANEL */}
      <GhostPanel
        open={ghostOpen}
        onClose={() => setGhostOpen(false)}
        qStatuses={qStatuses}
        onQStatusChange={handleQStatus}
        onAllDone={handleAllDone}
      />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "modalIn 0.5s ease" }}>
          <div style={{ background: "#0a1520", border: "1px solid #00d4c8", padding: "40px", borderRadius: "4px", textAlign: "center", maxWidth: "400px", boxShadow: "0 0 40px rgba(0,212,200,0.2)" }}>
            <h2 style={{ color: "#00d4c8", fontSize: "24px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", textShadow: "0 0 20px rgba(0,212,200,0.5)" }}>Task Complete</h2>
            <p style={{ color: "#c8dce8", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6" }}>Log analysis is complete. The evidence has been extracted. Return to the dashboard to proceed.</p>
            <a href="/dashboard" style={{ display: "inline-block", background: "transparent", border: "1px solid #00d4c8", color: "#00d4c8", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s" }}>RETURN TO DASHBOARD</a>
          </div>
        </div>
      )}
    </div>
  );
}
