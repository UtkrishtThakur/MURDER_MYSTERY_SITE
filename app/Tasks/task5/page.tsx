'use client'
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Task = 1 | 2 | 3;

interface BadgeRow {
  time: string;
  empId: string;
  name: string;
  location: string;
  type: "entry" | "exit";
}

interface TelPoint {
  t: string;
  kg: number;
  tip?: string;
}

interface ColdRow {
  time: string;
  event: string;
  detail: string;
  cls: "normal" | "key" | "alert";
}

interface ChatMsg {
  from: "ghost" | "ok" | "err";
  html: string;
  label?: string;
}

interface GhostScript {
  intro: { delay: number; html: string }[];
  autoAdvance: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_ROWS: BadgeRow[] = [
  { time: "20:12:04", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 7", type: "entry" },
  { time: "20:44:18", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 7", type: "exit" },
  { time: "21:18:42", empId: "SEC-02", name: "Sec_Officer_02", location: "Lab 7", type: "entry" },
  { time: "21:22:10", empId: "SEC-02", name: "Sec_Officer_02", location: "Lab 7", type: "exit" },
  { time: "21:31:07", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 6", type: "entry" },
  { time: "21:36:22", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 6", type: "exit" },
  { time: "21:44:58", empId: "EMP-019", name: "Rishab Sen", location: "Lab 7", type: "entry" },
  { time: "21:51:30", empId: "SEC-02", name: "Sec_Officer_02", location: "Main Gate", type: "exit" },
  { time: "22:03:14", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 5", type: "entry" },
  { time: "22:09:02", empId: "EMP-034", name: "Vikrant Kaul", location: "Lab 5", type: "exit" },
];

const ITEM_KG: Record<string, number> = { PERSON: 72, CART: 18, GURNEY: 32, EQUIPMENT: 48 };

const TELEMETRY: TelPoint[] = [
  { t: "21:53", kg: 0 },
  { t: "21:54", kg: 104, tip: "Weight profile consistent with\nadult human transport range.\n(First peak — heavy load detected)" },
  { t: "21:55", kg: 104, tip: "Stable load — full payload\nremains inside Lift-02." },
  { t: "21:56", kg: 104, tip: "Stable plateau continues." },
  { t: "21:57", kg: 104, tip: "Stable plateau continues." },
  { t: "21:58", kg: 104, tip: "Stable — elevator approaching destination floor." },
  { t: "21:59", kg: 0, tip: "Load unloaded at destination." },
  { t: "22:00", kg: 32, tip: "Return trip: 32 kg detected.\nOriginal load not present." },
  { t: "22:01", kg: 0 },
];

const COLD_ROWS: ColdRow[] = [
  { time: "21:48:11", event: "SYS_INIT", detail: "Cold Storage B3 environmental controller online", cls: "normal" },
  { time: "21:48:18", event: "TEMP_READ", detail: "Chamber temperature: 5.6°C", cls: "normal" },
  { time: "21:48:25", event: "TEMP_CONTROL", detail: "Cooling cycle active", cls: "normal" },
  { time: "21:49:03", event: "ACCESS_IDLE", detail: "Door sealed", cls: "normal" },
  { time: "21:49:44", event: "SENSOR_STATUS", detail: "Internal humidity stable", cls: "normal" },
  { time: "21:50:12", event: "INVENTORY_SCAN", detail: "Rack occupancy unchanged", cls: "normal" },
  { time: "21:50:55", event: "POWER_MONITOR", detail: "Auxiliary backup active", cls: "normal" },
  { time: "21:51:27", event: "TEMP_READ", detail: "Chamber temperature: 5.1°C", cls: "normal" },
  { time: "21:52:04", event: "ACCESS_IDLE", detail: "No authorized entry", cls: "normal" },
  { time: "21:52:48", event: "TEMP_CONTROL", detail: "Cooling maintained", cls: "normal" },
  { time: "21:53:12", event: "SENSOR_STATUS", detail: "Intake zone clear", cls: "normal" },
  { time: "21:54:09", event: "ELEVATOR_LINK", detail: "Elevator B inbound event registered", cls: "key" },
  { time: "21:54:33", event: "PREP_MODE", detail: "Intake channel activated", cls: "key" },
  { time: "21:55:02", event: "ACCESS_PENDING", detail: "Awaiting transfer authorization", cls: "key" },
  { time: "21:55:31", event: "DOOR_UNLOCK", detail: "Internal transfer clearance accepted", cls: "key" },
  { time: "21:56:04", event: "DOOR_OPEN", detail: "Cold Storage B3 access event", cls: "key" },
  { time: "21:56:19", event: "TEMP_DROP", detail: "Chamber fluctuation detected: 4.8°C", cls: "key" },
  { time: "21:56:42", event: "INTAKE_EVENT", detail: "New intake registered", cls: "key" },
  { time: "21:57:03", event: "DOOR_CLOSE", detail: "Chamber sealed", cls: "key" },
  { time: "21:57:26", event: "TEMP_CONTROL", detail: "Rapid stabilization initiated", cls: "normal" },
  { time: "21:58:11", event: "TEMP_READ", detail: "Chamber temperature: 4.3°C", cls: "normal" },
  { time: "21:58:47", event: "SENSOR_STATUS", detail: "Internal load changed", cls: "normal" },
  { time: "21:59:15", event: "STORAGE_VERIFY", detail: "Rack occupancy updated", cls: "normal" },
  { time: "21:59:48", event: "TEMP_CONTROL", detail: "Stable hold mode active", cls: "normal" },
  { time: "22:00:11", event: "CHAMBER_STATUS", detail: "4.0°C hold achieved", cls: "normal" },
  { time: "22:00:33", event: "ACCESS_LOCK", detail: "Manual entry disabled", cls: "alert" },
  { time: "22:01:06", event: "SYSTEM_NOTE", detail: "Preserve environmental stability", cls: "normal" },
  { time: "22:01:44", event: "INVENTORY_SYNC", detail: "Restricted item record updated", cls: "alert" },
  { time: "22:02:15", event: "AUDIT_FLAG", detail: "Internal visibility limited", cls: "alert" },
  { time: "22:03:02", event: "STATUS_LOCK", detail: "Modification requires clearance", cls: "alert" },
];

const SCRIPTS: Record<number, GhostScript> = {
  1: {
    autoAdvance: true,
    intro: [
      { delay: 0, html: "I have been monitoring the facility access logs. Something does not add up." },
      { delay: 1400, html: "Review the <span>Badge &amp; Door Logs</span> carefully — one employee entered the lab late but never left." },
      { delay: 2800, html: "Once you have analysed the log, click <span>NEXT TASK</span> at the bottom to proceed." },
    ],
  },
  2: {
    autoAdvance: true,
    intro: [
      { delay: 0, html: "Good work. Now we are looking at the elevator records." },
      { delay: 1100, html: "Lift-02 was activated at <span>21:53</span>. Something — or someone — was moved." },
      { delay: 2200, html: "<span>Your mission:</span> Reconstruct the transport. Drag items onto the elevator platform. When the load matches, hit <span>ANALYZE LOAD</span> to view the telemetry." },
      { delay: 3400, html: "Cold Storage B3 has been unlocked. Proceed to the next module when ready." },
    ],
  },
  3: {
    autoAdvance: true,
    intro: [
      { delay: 0, html: "Cold Storage B3 logged an event at <span>21:54</span> — the same time the elevator was active." },
      { delay: 1200, html: "Cross-reference the timestamps carefully. Routine operations do not start at <span>21:55</span> without a trigger." },
      { delay: 2400, html: "Pay close attention to what changed between <span>21:56</span> and <span>22:03</span>. Some entries are not routine." },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Ghost SVG — simple pixel art, cyan eyes (original style)
// ─────────────────────────────────────────────────────────────────────────────
function GhostSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 52" width="100%" height="100%"
      style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x="10" y="0" width="25" height="5" fill="#ccddd8" />
      <rect x="5" y="5" width="35" height="5" fill="#ccddd8" />
      <rect x="0" y="10" width="45" height="25" fill="#ccddd8" />
      <rect x="0" y="35" width="13" height="12" fill="#ccddd8" />
      <rect x="16" y="35" width="13" height="12" fill="#ccddd8" />
      <rect x="32" y="35" width="13" height="12" fill="#ccddd8" />
      <rect x="8" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95" />
      <rect x="27" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95" />
      <rect x="10" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6" />
      <rect x="29" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ghost float button — same position on every panel (bottom-right)
// ─────────────────────────────────────────────────────────────────────────────
function GhostBtn({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 6 }}>
      <div className="ghost-bubble">Ask me!</div>
      <div className="ghost-float" onClick={onClick} role="button" title="ghost41_id">
        <GhostSVG />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry bar chart
// ─────────────────────────────────────────────────────────────────────────────
function TelChart() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const c = cvs.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const dW = Math.max(400, (c.parentElement?.offsetWidth ?? 520) - 4);
    const dH = 220;
    c.width = dW * dpr; c.height = dH * dpr;
    c.style.width = `${dW}px`; c.style.height = `${dH}px`;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const pL = 50, pR = 20, pT = 36, pB = 36;
    const plotW = dW - pL - pR;
    const plotH = dH - pT - pB;
    const max = 120;
    const yOf = (kg: number) => pT + plotH - (kg / max) * plotH;
    const base = yOf(0);

    ctx.fillStyle = "rgba(210,215,210,0.92)";
    ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
    ctx.fillText("LOAD OVER TIME (kg)", dW / 2, 20);

    ctx.strokeStyle = "rgba(190,190,190,0.30)"; ctx.lineWidth = 1;
    ctx.strokeRect(pL - 8, pT - 10, plotW + 16, plotH + 20);

    [70, 80, 90, 100, 110].forEach((v) => {
      const y = yOf(v);
      ctx.setLineDash([4, 5]); ctx.strokeStyle = "rgba(180,180,180,0.12)"; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(dW - pR, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(180,180,180,0.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pL - 6, y); ctx.lineTo(pL, y); ctx.stroke();
      ctx.fillStyle = "rgba(195,195,195,0.75)"; ctx.font = "9.5px monospace"; ctx.textAlign = "right";
      ctx.fillText(`${v} —`, pL - 2, y + 3.5);
    });

    ctx.strokeStyle = "rgba(180,180,180,0.45)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pL, pT - 10); ctx.lineTo(pL, base); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pL, base); ctx.lineTo(dW - pR, base); ctx.stroke();

    const bars = TELEMETRY.slice(1, 8);
    const n = bars.length;
    const slot = plotW / n;
    const gap = Math.max(3, slot * 0.2);
    const bw = slot - gap;

    bars.forEach((p, i) => {
      if (!p.kg) return;
      const x = pL + i * slot + gap / 2;
      const top = yOf(p.kg);
      const bh = base - top;
      const isPeak = p.kg === 104;
      const isRet = p.kg === 32;
      const g = ctx.createLinearGradient(x, top, x, base);
      if (isPeak) { g.addColorStop(0, "rgba(215,225,215,0.82)"); g.addColorStop(1, "rgba(215,225,215,0.3)"); }
      else if (isRet) { g.addColorStop(0, "rgba(170,200,190,0.60)"); g.addColorStop(1, "rgba(170,200,190,0.2)"); }
      else { g.addColorStop(0, "rgba(210,218,210,0.80)"); g.addColorStop(1, "rgba(210,218,210,0.3)"); }
      ctx.fillStyle = g; ctx.fillRect(x, top, bw, bh);
      ctx.fillStyle = isPeak ? "rgba(240,255,240,0.95)" : "rgba(200,225,210,0.80)";
      ctx.fillRect(x, top, bw, 1.5);
      if (bh > 12) {
        ctx.fillStyle = isPeak ? "rgba(235,255,235,0.95)" : "rgba(195,215,205,0.85)";
        ctx.font = isPeak ? "bold 9.5px monospace" : "8.5px monospace"; ctx.textAlign = "center";
        ctx.fillText(`${p.kg} kg`, x + bw / 2, top - 5);
      }
      ctx.fillStyle = "rgba(175,175,175,0.80)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
      ctx.fillText(p.t, x + bw / 2, base + 16);
    });

    ctx.fillStyle = "rgba(160,210,180,0.65)"; ctx.font = "8px monospace"; ctx.textAlign = "center";
    ctx.fillText("▲ FIRST PEAK", pL + 0 * slot + gap / 2 + bw / 2, yOf(104) - 14);
    ctx.fillStyle = "rgba(140,190,175,0.65)";
    ctx.fillText("▼ RETURN", pL + 6 * slot + gap / 2 + bw / 2, yOf(32) - 14);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(190,210,190,0.22)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pL, yOf(104)); ctx.lineTo(dW - pR, yOf(104)); ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = cvs.current; const t = tip.current;
    if (!c || !t) return;
    const r = c.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const bars = TELEMETRY.slice(1, 8);
    const plotW = r.width - 70;
    const slot = plotW / bars.length;
    const idx = Math.max(0, Math.min(bars.length - 1, Math.floor((mx - 50) / slot)));
    const p = bars[idx];
    if (!p?.tip) { t.style.display = "none"; return; }
    t.style.display = "block";
    t.innerHTML = p.tip.replace(/\n/g, "<br>") + `<br><span style="color:rgba(0,255,200,0.5)">${p.t} — ${p.kg} kg</span>`;
    t.style.left = `${Math.min(mx + 12, r.width - 220)}px`;
    t.style.top = "10px";
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={cvs} onMouseMove={onMove}
        onMouseLeave={() => { if (tip.current) tip.current.style.display = "none"; }}
        style={{ width: "100%", display: "block" }} />
      <div ref={tip} style={{
        display: "none", position: "absolute",
        background: "rgba(5,12,20,0.95)", border: "1px solid rgba(0,255,200,0.3)",
        color: "rgba(200,240,230,0.9)", fontSize: 10, padding: "8px 10px",
        borderRadius: 2, pointerEvents: "none", maxWidth: 210,
        lineHeight: 1.7, fontFamily: "'Share Tech Mono',monospace",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry popup
// ─────────────────────────────────────────────────────────────────────────────
function TelePopup({ open, onClose, onGhost }: { open: boolean; onClose: () => void; onGhost: () => void }) {
  if (!open) return null;
  return (
    <div className="tele-bg" onClick={(e) => { if ((e.target as HTMLElement).className === "tele-bg") onClose(); }}>
      <div className="tele-box">
        <div className="tele-hdr">
          <span className="tele-title">TELEMETRY — LIFT-02 EVENT LOG</span>
          <button className="tele-close" onClick={onClose}>✕ CLOSE</button>
        </div>
        <div className="tele-meta">Sensor: Lift-02 &nbsp;|&nbsp; Window: 21:53–22:01 &nbsp;|&nbsp; <span style={{ color: "var(--cy)" }}>Hover bars for details</span></div>
        <TelChart />
        <div className="tele-labels">
          {["21:53", "21:54", "21:55", "21:56", "21:57", "21:58", "21:59", "22:00", "22:01"].map((t) => <span key={t}>{t}</span>)}
        </div>
        <div className="tele-legend">
          <span>▲ FIRST PEAK (21:54):</span> Heavy load enters Lift-02<br />
          <span>― PLATEAU (21:55–21:58):</span> Full load stable during transit<br />
          <span>▼ RETURN DROP (22:00):</span> Reduced mass — original load not present
        </div>
        <div className="tele-notice">
          <span style={{ fontSize: 18 }}>👻</span>
          <span>Cold Storage B3 has been unlocked. <button className="link-btn" onClick={() => { onClose(); onGhost(); }}>Open ghost41_id</button> to continue.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat panel
// ─────────────────────────────────────────────────────────────────────────────
function ChatPanel({ taskNum, open, onClose, onDone }: {
  taskNum: number; open: boolean; onClose: () => void; onDone: (n: number) => void;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const script = SCRIPTS[taskNum];

  useEffect(() => {
    if (!open) return;
    setMsgs([]);
    const timers: ReturnType<typeof setTimeout>[] = [];
    script.intro.forEach((e, i) => {
      timers.push(setTimeout(() => {
        setMsgs((p) => [...p, { from: "ghost", html: e.html, label: i === 0 ? "ghost41_id › ANALYSIS" : undefined }]);
      }, e.delay + 600));
    });
    const last = script.intro[script.intro.length - 1].delay + 1500;
    timers.push(setTimeout(() => onDone(taskNum), last));
    return () => timers.forEach(clearTimeout);
  }, [open, taskNum]); // eslint-disable-line

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  return (
    <div className={`chat-panel${open ? " open" : ""}`}>
      <div className="chat-hdr">
        <div style={{ width: 48, height: 48, filter: "drop-shadow(0 0 8px rgba(0,255,200,0.5))", animation: "float 3s ease-in-out infinite", flexShrink: 0 }}>
          <GhostSVG />
        </div>
        <div style={{ flex: 1 }}>
          <div className="chat-name">ghost41_id</div>
          <div className="chat-status">INVESTIGATION ASSISTANT · ONLINE</div>
        </div>
        <button className="chat-close" onClick={onClose}>✕ CLOSE</button>
      </div>
      <div className="chat-msgs">
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg msg-${m.from}`}>
            {m.label && <div className="chat-lbl">{m.label}</div>}
            <span dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 1 — Badge & Door Logs
// ─────────────────────────────────────────────────────────────────────────────
function Task1({ onGhost, nextVisible, onNext }: { onGhost: () => void; nextVisible: boolean; onNext: () => void }) {
  return (
    <div className="panel active">
      <div className="phdr glitch-rgb">BADGE &amp; DOOR LOGS — LAB 7 ACCESS RECORDS</div>
      <div className="logs-wrap">
        <table className="log-tbl">
          <thead>
            <tr><th>TIMESTAMP</th><th>EMPLOYEE ID</th><th>NAME</th><th>LOCATION</th><th>STATUS</th></tr>
          </thead>
          <tbody>
            {BADGE_ROWS.map((r, i) => (
              <tr key={i}>
                <td>{r.time}</td><td>{r.empId}</td><td>{r.name}</td><td>{r.location}</td>
                <td className={r.type === "entry" ? "entry" : "texit"}>{r.type.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <GhostBtn onClick={onGhost} />
      <div className={`next-bar${nextVisible ? " vis" : ""}`}>
        <span className="next-hint">MODULE COMPLETE — PROCEED WHEN READY</span>
        <button className="next-btn" onClick={onNext}>NEXT TASK ›</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 2 — Elevator Analytics
// ─────────────────────────────────────────────────────────────────────────────
function Task2({ nextVisible, onNext }: { nextVisible: boolean; onNext: () => void }) {
  const [dropped, setDropped] = useState<string[]>([]);
  const [isOk, setIsOk] = useState(false);
  const [fb, setFb] = useState<{ text: string; ok: boolean } | null>(null);
  const [teleOpen, setTeleOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const evalLoad = useCallback((items: string[]) => {
    if (!items.length) { setFb(null); setIsOk(false); return; }
    const w = items.reduce((s, x) => s + (ITEM_KG[x] ?? 0), 0);
    const ok = items.length === 2 && items.includes("PERSON") && items.includes("GURNEY");
    setIsOk(ok);
    if (ok) setFb({ text: `Combined: ${w} kg — ✓ WEIGHT MATCH. Click ANALYZE LOAD to view telemetry.`, ok: true });
    else {
      const msg = w < 104 ? "Recorded load lower than expected." : w > 104 ? "Recorded range exceeded." : "Transport weight inconsistent.";
      setFb({ text: `Combined: ${w} kg | Items: ${items.join(" + ")} | ✗ ${msg}`, ok: false });
    }
  }, []);

  const drop = (item: string) => {
    if (dropped.includes(item)) return;
    const next = [...dropped, item];
    setDropped(next); evalLoad(next);
  };
  const remove = (item: string) => {
    const next = dropped.filter((x) => x !== item);
    setDropped(next); evalLoad(next);
  };

  return (
    <div className="panel active" style={{ position: "relative" }}>
      <div className="phdr glitch-rgb">ELEVATOR TRANSPORT ANALYSIS</div>
      <div className="elev-layout">
        <div className="elev-left">
          <div className="sec-lbl">LOAD RECONSTRUCTION MODULE</div>
          <div className="drag-hint">Instruction: Reconstruct the transport event.</div>
          <div className="drag-items">
            {["PERSON", "CART", "GURNEY", "EQUIPMENT"].map((item) => (
              <div key={item}
                className={`drag-item${dropped.includes(item) ? " used" : ""}`}
                draggable={!dropped.includes(item)}
                onDragStart={(e) => { if (dropped.includes(item)) { e.preventDefault(); return; } e.dataTransfer.setData("text/plain", item); }}
                onClick={() => !dropped.includes(item) && drop(item)}>
                {item}
              </div>
            ))}
          </div>
          <div className="drop-zone"
            onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).classList.add("drag-over"); }}
            onDragLeave={(e) => (e.currentTarget as HTMLDivElement).classList.remove("drag-over")}
            onDrop={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).classList.remove("drag-over"); const x = e.dataTransfer.getData("text/plain"); if (x) drop(x); }}>
            {dropped.map((item) => (
              <div key={item} className="dropped" onClick={() => remove(item)}>{item}</div>
            ))}
          </div>
          <button className={`analyze-btn${isOk ? " ready" : ""}`} disabled={!isOk} onClick={() => setTeleOpen(true)}>
            [ ANALYZE LOAD ]
          </button>
        </div>
        <div className="elev-right">
          <div className="sys-box">
            <div className="sec-lbl">SYSTEM ANALYSIS</div>
            <div className="sys-txt">
              {!fb
                ? <span>Awaiting load configuration...<br /><span style={{ color: "var(--td)", fontSize: 10 }}>Drag items to the platform to begin.</span></span>
                : <span style={{ color: fb.ok ? "var(--gr)" : "var(--rb)" }}>{fb.text}</span>}
            </div>
          </div>
        </div>
      </div>

      <GhostBtn onClick={() => setChatOpen(true)} />

      <div className={`next-bar${nextVisible ? " vis" : ""}`}>
        <span className="next-hint">ELEVATOR ANALYSIS COMPLETE — PROCEED WHEN READY</span>
        <button className="next-btn" onClick={onNext}>NEXT TASK ›</button>
      </div>

      <TelePopup open={teleOpen} onClose={() => setTeleOpen(false)} onGhost={() => setChatOpen(true)} />

      {chatOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
          <ChatPanel taskNum={2} open={chatOpen} onClose={() => setChatOpen(false)} onDone={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 3 — Cold Storage
// ─────────────────────────────────────────────────────────────────────────────
function Task3({ onGhost }: { onGhost: () => void }) {
  return (
    <div className="panel active">
      <div className="phdr glitch-rgb">COLD STORAGE ENVIRONMENT</div>
      <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="sec-lbl" style={{ marginBottom: 0 }}>B3 ENVIRONMENTAL CONTROL LOG</div>
        <span style={{ fontSize: 10, color: "var(--td)", letterSpacing: 1 }}>21:48–22:03</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Share Tech Mono',monospace", fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(200,50,50,0.3)" }}>
              {["TIMESTAMP", "EVENT TYPE", "DETAIL"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "5px 8px", fontSize: 10, color: "var(--td)", letterSpacing: 2, fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COLD_ROWS.map((r, i) => (
              <tr key={i} className={`cs-${r.cls}`}>
                <td style={{ padding: "4px 8px", borderBottom: "1px solid rgba(150,50,50,0.1)" }}>{r.time}</td>
                <td style={{ padding: "4px 8px", borderBottom: "1px solid rgba(150,50,50,0.1)" }}
                  className={r.cls === "key" ? "cs-flag" : r.cls === "alert" ? "cs-alert" : "cs-type"}>{r.event}</td>
                <td style={{ padding: "4px 8px", borderBottom: "1px solid rgba(150,50,50,0.1)" }}>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(200,50,50,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "var(--td)", letterSpacing: 1 }}>TASK: Analyse the log entries for anomalous activity</div>
        <button className="submit-btn" onClick={() => window.open("https://forms.gle/YOUR_FORM_LINK_HERE", "_blank")}>
          [ SUBMIT ANALYSIS REPORT ]
        </button>
      </div>
      <GhostBtn onClick={onGhost} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root app
// ─────────────────────────────────────────────────────────────────────────────
export default function InvestigationConsole() {
  const [task, setTask] = useState<Task>(1);
  const [clearance, setClearance] = useState(1);
  const [chatTask, setChatTask] = useState<number | null>(null);
  const [next1, setNext1] = useState(false);
  const [next2, setNext2] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const el = document.getElementById("glitch-bars");
      if (!el) return;
      el.innerHTML = "";
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const b = document.createElement("div");
        b.style.cssText = `position:fixed;left:0;width:100%;height:2px;background:rgba(204,0,0,0.4);top:${Math.random() * 100}vh;opacity:${Math.random() * 0.4 + 0.1};pointer-events:none;z-index:2;`;
        el.appendChild(b);
        setTimeout(() => b.remove(), 900);
      }
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const handleDone = (n: number) => {
    if (n === 1) { setClearance(2); setTimeout(() => { setChatTask(null); setNext1(true); }, 1200); }
    else if (n === 2) { setClearance(3); setTimeout(() => { setChatTask(null); setNext2(true); }, 1200); }
    else setChatTask(null);
  };

  const sysMsg = clearance >= 3 ? '"Cold Storage B3 access granted."' : clearance >= 2 ? '"Elevator Analytics unlocked."' : '"Answer investigation prompts to unlock access."';
  const nextLbl = clearance >= 3 ? "STATUS: COLD STORAGE UNLOCKED" : clearance >= 2 ? "NEXT: Cold Storage" : "NEXT: Elevator Analytics";

  return (
    <>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <div className="noise" />
      <div className="crt" />
      <div className="vignette" />
      <div id="glitch-bars" />
      <div className="static" />

      <div className="wrap">
        {/* Header */}
        <div className="header">
          <div className="hdr-row">
            <div className="alert-ico">⚠</div>
            <div className="hdr-title glitch-title">INTERNAL OPERATIONS CONSOLE</div>
            <div className="online-badge"><div className="online-dot" /> ONLINE</div>
          </div>
          <div className="clr-row">
            Clearance level :
            <div className="clr-boxes">
              {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`cbox${i < clearance ? " on" : ""}`} />)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="body">
          {/* Sidebar — no locks */}
          <div className="sidebar">
            <div className="sb-hdr corrupt">MODULE ACCESS</div>
            {([
              { n: 1 as Task, label: "Badge & Door Logs" },
              { n: 2 as Task, label: "Elevator Analytics" },
              { n: 3 as Task, label: "Cold Storage" },
            ]).map(({ n, label }) => (
              <button key={n} className={`sb-btn${task === n ? " active" : ""}`} onClick={() => setTask(n)}>
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="content">
            {task === 1 && <Task1 onGhost={() => setChatTask(1)} nextVisible={next1} onNext={() => setTask(2)} />}
            {task === 2 && <Task2 nextVisible={next2} onNext={() => setTask(3)} />}
            {task === 3 && <Task3 onGhost={() => setChatTask(3)} />}
          </div>
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span className="status-lbl">SYSTEM MESSAGE</span>
          <span style={{ flex: 1, color: "rgba(200,150,150,0.7)" }}>{sysMsg}</span>
          <span style={{ fontSize: 10, color: "var(--td)" }}>{nextLbl}</span>
        </div>
      </div>

      {/* Global chat (tasks 1 & 3) */}
      {chatTask !== null && task !== 2 && (
        <ChatPanel taskNum={chatTask} open={true} onClose={() => setChatTask(null)} onDone={handleDone} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
:root{--red:#cc0000;--rb:#ff2222;--rd:#660000;--rg:rgba(204,0,0,0.3);--bg:#0a0505;--b2:#110808;--b3:#1a0a0a;--tx:#e8d5d5;--td:#9a7070;--cy:#00ffcc;--gr:#00ff88;--br:rgba(204,0,0,0.4);--ba:rgba(204,0,0,0.9);}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:var(--bg);color:var(--tx);font-family:'Share Tech Mono',monospace;min-height:100vh;overflow:hidden;}
body::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px),radial-gradient(ellipse at 20% 50%,rgba(120,0,0,.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(80,0,0,.1) 0%,transparent 50%);pointer-events:none;z-index:0;}
.noise{position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:.4;}
.crt{position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:1;}
.vignette{position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.6) 100%);pointer-events:none;z-index:1;}
.static{position:fixed;inset:0;pointer-events:none;z-index:1;animation:flicker 8s infinite;}
@keyframes flicker{0%,98%,100%{opacity:1}98.5%{opacity:.94}99%{opacity:1}}

.wrap{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:20px;height:100vh;display:flex;flex-direction:column;gap:14px;}

/* HEADER */
.header{border:1px solid var(--ba);background:linear-gradient(135deg,var(--b2),var(--b3));padding:14px 20px;position:relative;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);box-shadow:0 0 30px var(--rg),inset 0 0 20px rgba(200,0,0,.05);}
.header::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--rb),transparent);animation:scanH 3s linear infinite;}
@keyframes scanH{0%{opacity:.3}50%{opacity:1}100%{opacity:.3}}
.hdr-row{display:flex;align-items:center;gap:14px;}
.alert-ico{width:36px;height:36px;border:2px solid var(--rb);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--rb);animation:pulse 2s ease-in-out infinite;clip-path:polygon(50% 0%,100% 100%,0% 100%);background:rgba(200,0,0,.1);}
@keyframes pulse{0%,100%{box-shadow:0 0 5px var(--rb)}50%{box-shadow:0 0 20px var(--rb),0 0 40px var(--rg)}}
.hdr-title{font-family:'Orbitron',sans-serif;font-size:22px;font-weight:900;letter-spacing:4px;text-shadow:0 0 20px var(--rb);color:#fff;}
.glitch-title{animation:gtitle 4s infinite;}
@keyframes gtitle{0%,94%,100%{text-shadow:0 0 20px var(--rb)}95%{text-shadow:-2px 0 #f00,2px 2px #0ff;transform:translate(1px,-1px)}96%{text-shadow:2px 0 #f00,-2px -1px #0ff;transform:translate(-1px,1px)}97%{text-shadow:none;transform:none}}
.online-badge{margin-left:auto;display:flex;align-items:center;gap:8px;font-family:'Rajdhani',sans-serif;font-size:11px;letter-spacing:3px;color:rgba(100,200,100,.7);}
.online-dot{width:7px;height:7px;background:#00ff88;border-radius:50%;box-shadow:0 0 8px #00ff88;animation:blink 1.5s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.clr-row{margin-top:10px;font-family:'Rajdhani',sans-serif;font-size:13px;letter-spacing:2px;color:var(--td);display:flex;align-items:center;gap:10px;}
.clr-boxes{display:flex;gap:6px;}
.cbox{width:22px;height:14px;border:1px solid rgba(200,50,50,.4);background:rgba(50,0,0,.5);}
.cbox.on{background:var(--red);box-shadow:0 0 8px var(--red);}

/* BODY */
.body{display:flex;gap:14px;flex:1;min-height:0;}

/* SIDEBAR — no locks */
.sidebar{width:180px;display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
.sb-hdr{font-family:'Rajdhani',sans-serif;font-size:10px;letter-spacing:3px;color:var(--td);padding:8px 12px;border-bottom:1px solid var(--br);}
.corrupt{animation:corrupt 5s infinite;}
@keyframes corrupt{0%,90%,100%{opacity:1}92%{opacity:.3}94%{opacity:1}}
.sb-btn{background:rgba(20,5,5,.8);border:1px solid rgba(150,50,50,.6);color:var(--tx);font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;padding:10px 12px;text-align:left;cursor:pointer;transition:all .2s;}
.sb-btn:hover{background:rgba(60,10,10,.8);border-color:var(--rb);box-shadow:inset 3px 0 0 var(--red);}
.sb-btn.active{background:rgba(80,0,0,.5);border-color:var(--rb);color:#fff;border-left:3px solid var(--rb);box-shadow:inset 0 0 10px rgba(200,0,0,.1);}

/* CONTENT */
.content{flex:1;min-width:0;position:relative;}
.panel{display:none;flex-direction:column;height:100%;background:linear-gradient(160deg,var(--b2),var(--b3));border:1px solid var(--br);position:relative;overflow:hidden;}
.panel.active{display:flex;}
.phdr{font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:3px;padding:12px 16px;border-bottom:1px solid var(--br);background:rgba(80,0,0,.2);color:var(--rb);flex-shrink:0;}
.glitch-rgb{animation:grgb 6s infinite;}
@keyframes grgb{0%,93%,100%{text-shadow:none}94%{text-shadow:-1px 0 rgba(255,0,0,.7),1px 0 rgba(0,255,255,.5)}95%{text-shadow:1px 0 rgba(255,0,0,.7),-1px 0 rgba(0,255,255,.5)}96%{text-shadow:none}}

/* BADGE LOGS */
.logs-wrap{flex:1;overflow-y:auto;padding:12px 16px;}
.log-tbl{width:100%;border-collapse:collapse;font-family:'Share Tech Mono',monospace;font-size:11px;}
.log-tbl th{text-align:left;padding:6px 10px;color:var(--td);font-size:10px;letter-spacing:2px;font-weight:400;border-bottom:1px solid rgba(200,50,50,.3);}
.log-tbl td{padding:5px 10px;border-bottom:1px solid rgba(150,50,50,.1);}
.log-tbl tr:hover td{background:rgba(50,0,0,.2);}
.entry{color:var(--gr);letter-spacing:1px;}
.texit{color:var(--td);letter-spacing:1px;}

/* GHOST */
.ghost-float{width:90px;height:90px;cursor:pointer;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(0,255,200,.6));transition:filter .2s;display:block;}
.ghost-float:hover{filter:drop-shadow(0 0 22px rgba(0,255,200,1)) brightness(1.15);}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.ghost-bubble{position:absolute;bottom:105px;right:10px;background:rgba(20,20,30,.95);border:1px solid rgba(100,180,255,.4);border-radius:6px 6px 0 6px;padding:5px 9px;font-size:9px;color:#aaccff;white-space:nowrap;letter-spacing:1px;pointer-events:none;animation:bubblePulse 3s ease-in-out infinite;z-index:7;}
@keyframes bubblePulse{0%,100%{opacity:.6}50%{opacity:1}}

/* ELEVATOR */
.elev-layout{display:flex;gap:16px;padding:16px;flex:1;overflow:hidden;}
.elev-left{flex:1;display:flex;flex-direction:column;gap:12px;overflow-y:auto;}
.elev-right{width:280px;display:flex;flex-direction:column;gap:12px;}
.drag-hint{font-size:11px;color:var(--td);letter-spacing:1px;margin-bottom:6px;}
.drag-items{display:flex;flex-wrap:wrap;gap:8px;}
.drag-item{padding:7px 14px;border:1px solid var(--rd);background:rgba(80,0,0,.3);color:var(--tx);font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;cursor:grab;transition:all .2s;user-select:none;}
.drag-item:hover{border-color:var(--rb);background:rgba(150,0,0,.3);box-shadow:0 0 10px var(--rg);}
.drag-item.used{opacity:.2;cursor:not-allowed;}
.drop-zone{border:2px dashed var(--br);background:rgba(5,0,0,.5);min-height:100px;display:flex;flex-wrap:wrap;align-items:flex-start;align-content:flex-start;gap:6px;padding:10px;transition:all .2s;position:relative;}
.drop-zone.drag-over{border-color:var(--rb);background:rgba(100,0,0,.2);box-shadow:inset 0 0 20px var(--rg);}
.drop-zone::before{content:'ELEVATOR PLATFORM';position:absolute;bottom:6px;right:8px;font-size:9px;color:rgba(150,50,50,.4);letter-spacing:2px;}
.dropped{padding:5px 10px;background:rgba(150,0,0,.4);border:1px solid var(--red);font-size:10px;color:var(--tx);cursor:pointer;}
.dropped::after{content:' ×';color:var(--rb);}
.dropped:hover{background:rgba(200,0,0,.5);}
.analyze-btn{background:transparent;border:1px solid var(--rb);color:var(--rb);font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:2px;padding:10px;cursor:not-allowed;transition:all .2s;width:100%;opacity:.4;}
.analyze-btn.ready{opacity:1;cursor:pointer;animation:btnPulse 1.5s ease-in-out infinite;}
.analyze-btn.ready:hover{background:var(--red);color:#fff;}
@keyframes btnPulse{0%,100%{box-shadow:0 0 5px rgba(0,255,200,.3)}50%{box-shadow:0 0 18px rgba(0,255,200,.7)}}
.sec-lbl{font-family:'Rajdhani',sans-serif;font-size:11px;letter-spacing:2px;color:var(--td);border-bottom:1px solid var(--br);padding-bottom:4px;margin-bottom:8px;}
.sys-box{background:rgba(0,0,0,.3);border:1px solid var(--br);padding:12px;}
.sys-txt{font-size:11px;line-height:1.7;}

/* TELEMETRY POPUP */
.tele-bg{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:80;backdrop-filter:blur(3px);animation:fadeIn .3s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.tele-box{background:linear-gradient(160deg,#080c10,#060a0e);border:1px solid rgba(0,255,200,.35);border-radius:4px;padding:24px 26px 20px;width:580px;max-width:94vw;box-shadow:0 0 60px rgba(0,200,150,.12);animation:modalIn .35s cubic-bezier(.22,.68,0,1.15);}
@keyframes modalIn{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:none}}
.tele-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.tele-title{font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:3px;color:rgba(0,255,200,.85);}
.tele-meta{font-size:10px;color:var(--td);margin-bottom:10px;}
.tele-close{background:transparent;border:1px solid rgba(150,50,50,.45);color:rgba(200,100,100,.6);font-family:'Share Tech Mono',monospace;font-size:10px;padding:5px 12px;cursor:pointer;transition:all .2s;}
.tele-close:hover{background:rgba(100,0,0,.3);color:#ff8888;}
.tele-labels{display:flex;justify-content:space-between;font-size:9px;color:var(--td);margin-top:4px;padding:0 2px;}
.tele-legend{margin-top:14px;font-size:10px;color:var(--td);line-height:1.9;border-top:1px dashed rgba(0,200,150,.2);padding-top:10px;}
.tele-legend span{color:var(--cy);}
.tele-notice{margin-top:12px;background:rgba(0,200,150,.07);border:1px solid rgba(0,200,150,.28);padding:10px 14px;display:flex;align-items:center;gap:10px;font-size:11px;color:rgba(0,220,170,.85);}
.link-btn{background:none;border:none;color:var(--cy);font-family:inherit;font-size:11px;cursor:pointer;text-decoration:underline;letter-spacing:1px;padding:0;}

/* COLD STORAGE */
.cs-type{letter-spacing:1px;font-size:10px;white-space:nowrap;color:rgba(120,170,140,.7);}
.cs-flag{letter-spacing:1px;font-size:10px;white-space:nowrap;color:var(--cy);}
.cs-alert{letter-spacing:1px;font-size:10px;white-space:nowrap;color:rgba(255,120,120,.9);}
.cs-key td{background:rgba(0,40,30,.25);}
.cs-key:hover td{background:rgba(0,60,40,.35);}
.cs-normal:hover td{background:rgba(0,50,30,.15);}
.cs-alert td{background:rgba(60,0,0,.2);}
.cs-alert:hover td{background:rgba(80,0,0,.35);}
.submit-btn{background:transparent;border:1px solid rgba(0,200,150,.5);color:rgba(0,220,170,.9);font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;padding:8px 16px;cursor:pointer;transition:all .2s;}
.submit-btn:hover{background:rgba(0,150,100,.2);}

/* CHAT PANEL */
.chat-panel{position:fixed;top:0;right:-420px;width:380px;height:100vh;background:linear-gradient(170deg,#080c14,#0a0f1a);border-left:1px solid rgba(80,160,255,.35);display:flex;flex-direction:column;z-index:100;transition:right .35s cubic-bezier(.22,.68,0,1.1);box-shadow:-8px 0 40px rgba(30,80,200,.18);}
.chat-panel.open{right:0;}
.chat-hdr{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(80,160,255,.2);background:rgba(10,20,40,.6);flex-shrink:0;}
.chat-name{font-family:'Orbitron',sans-serif;font-size:10px;letter-spacing:2.5px;color:rgba(100,180,255,.9);}
.chat-status{font-size:9px;color:rgba(80,160,255,.4);letter-spacing:1px;margin-top:2px;}
.chat-close{background:transparent;border:1px solid rgba(150,50,50,.4);color:rgba(200,100,100,.55);font-family:'Share Tech Mono',monospace;font-size:10px;padding:5px 10px;cursor:pointer;transition:all .2s;flex-shrink:0;}
.chat-close:hover{background:rgba(100,0,0,.25);color:#ff8888;}
.chat-msgs{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(80,160,255,.2) transparent;}
.chat-msg{max-width:90%;font-family:'Share Tech Mono',monospace;font-size:11.5px;line-height:1.65;padding:10px 13px;animation:msgIn .25s ease;}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.msg-ghost{align-self:flex-start;background:rgba(20,40,80,.55);border:1px solid rgba(80,160,255,.2);border-radius:2px 12px 12px 12px;color:var(--tx);}
.msg-ghost span{color:rgba(100,200,255,.9);}
.chat-lbl{font-size:9px;letter-spacing:2px;color:rgba(80,160,255,.45);margin-bottom:5px;font-family:'Rajdhani',sans-serif;}
.msg-ok{align-self:flex-start;background:rgba(0,60,30,.4);border:1px solid rgba(0,200,100,.3);border-radius:2px 12px 12px 12px;color:var(--gr);}
.msg-err{align-self:flex-start;background:rgba(60,0,0,.3);border:1px solid rgba(200,0,0,.25);border-radius:2px 12px 12px 12px;color:#ff8888;}

/* NEXT TASK BAR */
.next-bar{display:none;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid rgba(0,200,150,.25);background:rgba(0,20,15,.5);flex-shrink:0;}
.next-bar.vis{display:flex;animation:fadeIn .4s ease;}
.next-hint{font-size:10px;color:rgba(0,200,150,.6);letter-spacing:1px;}
.next-btn{background:transparent;border:1px solid rgba(0,200,150,.55);color:rgba(0,220,170,.9);font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;padding:8px 20px;cursor:pointer;transition:all .2s;}
.next-btn:hover{background:rgba(0,150,100,.2);box-shadow:0 0 14px rgba(0,200,130,.25);}

/* STATUS BAR */
.status-bar{border:1px solid var(--br);background:rgba(10,5,5,.9);padding:8px 16px;display:flex;align-items:center;gap:16px;flex-shrink:0;font-size:11px;}
.status-lbl{color:var(--td);letter-spacing:2px;font-size:10px;white-space:nowrap;}
`;
