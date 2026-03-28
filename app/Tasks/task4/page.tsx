'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { verifyGhostAnswer } from '@/app/lib/verifyGhostAnswer';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ChatMsg { id: number; label?: string; body: string; isUser?: boolean; isTyping?: boolean; }

const Task4Telemetry: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [deviceIdUnlocked, setDeviceIdUnlocked] = useState(false);
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [deviceIdStatus, setDeviceIdStatus] = useState({ text: '', isError: false });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [t4Complete, setT4Complete] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ─── CONSTANTS ────────────────────────────────────────────────────────────────
  const DEVICE_ID = "NB-PROD-41-HF";
  const ENCODED_TIMESTAMP = "MjE6MTU="; // Decodes to 21:15

  // ─── EFFECTS ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=VT323&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    return () => { if (document.head.contains(fontLink)) document.head.removeChild(fontLink); };
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      const timer = setTimeout(drawWaveform, 50);
      window.addEventListener('resize', drawWaveform);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', drawWaveform);
      };
    }
  }, [activeTab]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement!;
    const W = parent.offsetWidth - 32; // padding
    const H = 100;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(58,16,16,0.5)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const points: { x: number; y: number }[] = [];
    const spikeX = Math.floor(W * 0.62);
    for (let x = 0; x < W; x++) {
      let y = H * 0.6;
      const progress = x / W;
      y += Math.sin(x * 0.3) * 6 + Math.sin(x * 0.7 + 1) * 3 + (Math.random() - 0.5) * 4;
      if (progress > 0.4) y -= (progress - 0.4) * 30;
      if (x > spikeX - 20 && x < spikeX + 5) y -= Math.exp(-Math.pow((x - spikeX) / 8, 2)) * 55;
      if (x > spikeX + 5) y = H * 0.8 + (Math.random() - 0.5) * 2;
      points.push({ x, y: Math.max(5, Math.min(H - 5, y)) });
    }

    ctx.beginPath(); ctx.moveTo(0, H);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = 'rgba(120,20,20,0.15)'; ctx.fill();

    ctx.beginPath(); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ff3b2a'; ctx.shadowBlur = 4;
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke(); ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,59,42,0.7)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(spikeX, 0); ctx.lineTo(spikeX, H); ctx.stroke(); ctx.setLineDash([]);

    ctx.fillStyle = '#ff3b2a'; ctx.font = '9px Share Tech Mono, monospace';
    ctx.fillText('??:??', spikeX + 4, 14);
  };

  const handleDeviceIdSubmit = async () => {
    if (deviceIdUnlocked) return;
    const entered = deviceIdInput.trim().toUpperCase();
    if (!entered) {
      setDeviceIdStatus({ text: '— enter Device ID —', isError: true });
      return;
    }

    const result = await verifyGhostAnswer('task4', 'decrypt', entered);
    if (result.correct) {
      setDeviceIdUnlocked(true);
      setDeviceIdStatus({ text: '✓ AUTHENTICATED — encoded output unlocked', isError: false });
    } else {
      setDeviceIdStatus({ text: '✗ ' + (result.failureMessage || 'Incorrect Device ID.'), isError: true });
    }
  };

  const handleAllDone = () => {
    setT4Complete(true);
    setTimeout(() => setShowSuccessModal(true), 1500);
  };

  const toggleChat = () => {
    if (!chatOpen && chatMessages.length === 0) {
      initChat();
    }
    setChatOpen(!chatOpen);
  };

  const initChat = async () => {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
    const addGhostMsg = (body: string) => setChatMessages((prev: ChatMsg[]) => [...prev, { id: Date.now() + Math.random(), label: 'GhostID_41', body }]);

    setIsTyping(true); await delay(800); setIsTyping(false);
    addGhostMsg('Task 4 — Chip Telemetry.');
    setIsTyping(true); await delay(1000); setIsTyping(false);
    addGhostMsg('The telemetry failure happened while the risky hotfix was active.');
    setIsTyping(true); await delay(1200); setIsTyping(false);
    addGhostMsg('The encoded output contains the exact timestamp of failure.\n\nAuthenticate with the Device ID, then decode the Base64 string.');
    setIsTyping(true); await delay(800); setIsTyping(false);
    addGhostMsg('When exactly did the NeuroBand system fail?');
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isTyping) return;
    const val = chatInput.trim();
    setChatInput('');
    setChatMessages((prev: ChatMsg[]) => [...prev, { id: Date.now(), body: val, isUser: true }]);

    if (!deviceIdUnlocked) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev: ChatMsg[]) => [...prev, { id: Date.now(), label: 'GhostID_41', body: 'Authenticate the device first. Navigate to the Encoded Output tab and enter the Device ID.' }]);
      }, 700);
      return;
    }

    setIsTyping(true);
    const result = await verifyGhostAnswer('task4', 'q1', val.toLowerCase().replace(/[\.\s_-]/g, ''));
    setIsTyping(false);

    if (result.correct) {
      setChatMessages((prev: ChatMsg[]) => [...prev, { id: Date.now(), label: 'GhostID_41', body: result.successMessage || '21:15. Confirmed.\nThe system failure and the lab incident happened at the same time.\nMovement forensics unlocked.' }]);
      handleAllDone();
    } else {
      setChatMessages((prev: ChatMsg[]) => [...prev, { id: Date.now(), label: 'GhostID_41', body: result.failureMessage || 'Incorrect. Decode the Base64 string and enter the plaintext timestamp. Format: HH:MM' }]);
    }
  };

  // ─── STYLES (Kept for visual consistency) ──────────────────────────────────
  const CSS = `
  :root {
    --red: #c0392b; --red-dim: #7a1a12; --red-bright: #ff3b2a; --red-glow: rgba(192,57,43,0.35);
    --bg: #0a0505; --bg2: #110808; --bg3: #1a0d0d; --border: #3d1010; --border-bright: #7a2020;
    --text: #e8c8c8; --text-dim: #8a5555; --text-muted: #5a3333; --green: #2dff6e;
    --amber: #ffb347; --cyan: #00e5ff; --white: #f5e8e8;
  }
  .t4-root { background: var(--bg); color: var(--text); font-family: 'Share Tech Mono', monospace; min-height: 100vh; overflow-x: hidden; cursor: crosshair; }
  .t4-root::before { content: ''; position: fixed; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px); pointer-events: none; z-index: 9998; }
  .t4-root::after { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%); pointer-events: none; z-index: 9997; }
  .t4-top-bar { position: fixed; top: 0; left: 0; right: 0; height: 44px; background: var(--bg2); border-bottom: 1px solid var(--border-bright); display: flex; align-items: center; padding: 0 20px; gap: 32px; z-index: 500; box-shadow: 0 0 20px rgba(192,57,43,0.2); }
  .t4-top-bar-logo { font-family: 'Orbitron', monospace; font-size: 11px; color: var(--red); letter-spacing: 3px; text-transform: uppercase; white-space: nowrap; }
  .t4-top-bar-logo span { color: var(--text-dim); }
  .t4-status-badge { margin-left: auto; font-size: 10px; color: var(--red); letter-spacing: 2px; animation: t4-blink 1.8s step-end infinite; }
  @keyframes t4-blink { 50% { opacity: 0; } }
  .t4-task-header { border-bottom: 1px solid var(--border); padding: 20px 32px 16px; background: linear-gradient(180deg, var(--bg2) 0%, transparent 100%); position: relative; overflow: hidden; margin-top: 44px; }
  .t4-task-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--red), transparent); animation: t4-scanH 3s linear infinite; }
  @keyframes t4-scanH { 0% { transform: scaleX(0); transform-origin: left; } 50% { transform: scaleX(1); transform-origin: left; } 51% { transform: scaleX(1); transform-origin: right; } 100% { transform: scaleX(0); transform-origin: right; } }
  .t4-task-id { font-family: 'Orbitron', monospace; font-size: 10px; color: var(--red-dim); letter-spacing: 4px; margin-bottom: 6px; }
  .t4-task-title { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 900; color: var(--white); letter-spacing: 2px; text-shadow: 0 0 20px var(--red-glow); }
  .t4-task-meta { display: flex; gap: 24px; margin-top: 10px; font-size: 11px; color: var(--text-dim); }
  .t4-task-meta span { color: var(--amber); }
  .t4-task-layout { display: grid; grid-template-columns: 1fr 340px; min-height: calc(100vh - 44px - 100px); }
  .t4-main-panel { padding: 24px 28px; border-right: 1px solid var(--border); overflow-y: auto; }
  .t4-sidebar { background: var(--bg2); display: flex; flex-direction: column; overflow: hidden; }
  .t4-sidebar-section { border-bottom: 1px solid var(--border); padding: 14px 16px; }
  .t4-sidebar-label { font-size: 9px; letter-spacing: 3px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
  .t4-telemetry-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .t4-tele-card { background: var(--bg); border: 1px solid var(--border); padding: 16px; position: relative; overflow: hidden; }
  .t4-tele-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--red-dim), transparent); }
  .t4-tele-card-label { font-size: 9px; letter-spacing: 3px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
  .t4-tele-card-value { font-family: 'VT323', monospace; font-size: 28px; color: var(--red-bright); text-shadow: 0 0 10px var(--red); }
  .t4-tele-card-sub { font-size: 10px; color: var(--text-dim); margin-top: 4px; }
  .t4-waveform-container { background: var(--bg); border: 1px solid var(--border); padding: 16px; margin-bottom: 16px; position: relative; }
  .t4-waveform-label { font-size: 10px; letter-spacing: 2px; color: var(--text-dim); margin-bottom: 12px; }
  canvas#t4-waveform-canvas { width: 100%; height: 100px; display: block; }
  .t4-inner-tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
  .t4-inner-tab { padding: 7px 16px; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all 0.15s; margin-bottom: -1px; }
  .t4-inner-tab:hover { color: var(--text); }
  .t4-inner-tab.active { color: var(--red-bright); border-bottom-color: var(--red-bright); }
  .t4-pane { display: none; }
  .t4-pane.active { display: block; }
  .t4-alert-strip { background: rgba(192,57,43,0.08); border: 1px solid var(--red-dim); border-left: 3px solid var(--red); padding: 10px 14px; font-size: 11px; color: var(--text); margin-bottom: 16px; display: flex; gap: 10px; align-items: flex-start; }
  .t4-alert-icon { color: var(--red-bright); font-size: 14px; flex-shrink: 0; }
  .t4-device-gate { background: var(--bg3); border: 1px solid var(--border-bright); border-left: 3px solid var(--amber); padding: 14px 16px; margin-bottom: 14px; transition: border-left-color 0.3s; }
  .t4-device-gate-label { font-size: 9px; letter-spacing: 3px; color: var(--amber); margin-bottom: 10px; text-transform: uppercase; }
  .t4-device-gate-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .t4-chat-input-style { flex: 1; min-width: 160px; background: var(--bg); border: 1px solid var(--border); color: var(--text); font-family: 'Share Tech Mono', monospace; font-size: 12px; padding: 7px 10px; outline: none; }
  .t4-btn-action { background: var(--red-dim); border: none; color: var(--white); font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; padding: 7px 16px; cursor: pointer; transition: all 0.15s; }
  .t4-btn-action:hover { background: var(--red); }
  .t4-aes-box { background: var(--bg); border: 1px solid var(--border-bright); padding: 16px; margin-bottom: 16px; font-size: 11px; position: relative; }
  .t4-aes-label { font-size: 9px; letter-spacing: 3px; color: var(--amber); margin-bottom: 8px; }
  .t4-encoded { font-family: 'VT323', monospace; font-size: 22px; color: var(--text-muted); letter-spacing: 3px; filter: blur(5px); user-select: none; pointer-events: none; transition: filter 0.5s ease, color 0.5s ease; margin-bottom: 4px; }
  .t4-encoded.unlocked { filter: blur(0); color: var(--cyan); user-select: text; pointer-events: auto; text-shadow: 0 0 8px rgba(0,229,255,0.3); }
  .t4-unlock-banner { background: rgba(45,255,110,0.08); border: 1px solid rgba(45,255,110,0.3); padding: 12px 16px; text-align: center; font-family: 'Orbitron', monospace; font-size: 11px; letter-spacing: 3px; color: var(--green); display: none; margin-top: 10px; }
  .t4-unlock-banner.show { display: block; animation: t4-fadeIn 0.5s ease; }
  .t4-ghost-btn { position: fixed; bottom: 24px; right: 24px; width: 64px; height: 64px; background: var(--bg2); border: 1px solid var(--red-dim); border-radius: 50%; cursor: pointer; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 0 20px rgba(192,57,43,0.3); }
  .t4-ghost-btn:hover { border-color: var(--red-bright); box-shadow: 0 0 30px rgba(192,57,43,0.5); transform: scale(1.05); }
  .t4-ghost-pulse { position: absolute; top: -3px; right: -3px; width: 12px; height: 12px; background: var(--red-bright); border-radius: 50%; animation: t4-pulse 2s ease-in-out infinite; }
  @keyframes t4-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } }
  .t4-chat-window { position: fixed; bottom: 100px; right: 24px; width: 380px; max-height: 520px; background: var(--bg2); border: 1px solid var(--border-bright); border-radius: 2px; z-index: 1001; display: none; flex-direction: column; box-shadow: 0 0 40px rgba(0,0,0,0.8); }
  .t4-chat-window.open { display: flex; animation: t4-slideUp 0.2s ease; }
  @keyframes t4-slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .chat-panel-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid rgba(80,160,255,0.2); background: rgba(10,20,40,0.6); flex-shrink: 0; }
  .t4-chat-header { background: var(--bg3); border-bottom: 1px solid var(--border-bright); padding: 10px 14px; display: flex; align-items: center; gap: 10px; }
  .t4-chat-header-name { font-family: 'Orbitron', monospace; font-size: 10px; color: var(--red); letter-spacing: 2px; }
  .t4-chat-header-status { font-size: 9px; color: var(--text-muted); margin-left: auto; }
  .t4-chat-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 2px 6px; }
  .t4-chat-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; }
  .t4-chat-msg { max-width: 88%; padding: 8px 12px; font-size: 12px; line-height: 1.6; }
  .t4-chat-msg.ghost { background: var(--bg3); border: 1px solid var(--border); border-left: 2px solid var(--red); color: var(--text); align-self: flex-start; }
  .t4-chat-msg.user-msg { background: rgba(192,57,43,0.08); border: 1px solid var(--red-dim); color: var(--white); align-self: flex-end; text-align: right; }
  .t4-chat-footer { border-top: 1px solid var(--border); padding: 10px; display: flex; gap: 8px; }
  .t4-chat-input { flex: 1; background: var(--bg); border: 1px solid var(--border); color: var(--text); font-family: 'Share Tech Mono', monospace; font-size: 12px; padding: 7px 10px; outline: none; }
  .t4-chat-send { background: var(--red-dim); border: none; color: var(--white); font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; padding: 7px 14px; cursor: pointer; }
  .t4-typing-indicator { display: flex; gap: 4px; padding: 10px 14px; align-items: center; }
  .t4-typing-dot { width: 5px; height: 5px; background: var(--red-dim); border-radius: 50%; animation: t4-typingBounce 1.2s infinite; }
  @keyframes t4-typingBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); background: var(--red-bright); } }
  .t4-progress-item { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 11px; border-bottom: 1px solid var(--border); }
  .prog-dot { width: 8px; height: 8px; border-radius: 50%; }
  .prog-dot.done { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .prog-dot.active { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: t4-blink 1s step-end infinite; }
  .prog-dot.pending { background: var(--border-bright); }
  .t4-prog-label { flex: 1; color: var(--text-dim); }
  .t4-prog-label.active { color: var(--white); }
  .t4-fw-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
  .t4-fw-table td { padding: 7px 12px; border-bottom: 1px solid var(--border); }
  .t4-fw-table td:first-child { color: var(--text-dim); width: 40%; }
  .t4-fw-table td:last-child { color: var(--amber); }
  .t4-fw-table tr.mismatch td:last-child { color: var(--red-bright); animation: t4-blink 1.5s step-end infinite; }
  .cl-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--border-bright); }
  .cl-dot.filled { background: var(--red); border-color: var(--red); box-shadow: 0 0 6px var(--red); }
  `;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="t4-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="t4-top-bar">
        <div className="t4-top-bar-logo">INTERNAL OPS CONSOLE <span>// CASE #131</span></div>
        <div className="t4-status-badge">▲ INVESTIGATION ACTIVE</div>
      </nav>

      <div className="t4-task-header">
        <div className="t4-task-id">▸ CASE #131 / TASK 4 / CHIP TELEMETRY</div>
        <div className="t4-task-title">TELEMETRY RECONSTRUCTION</div>
        <div className="t4-task-meta">
          OBJECTIVE: <span>Identify failure timestamp + firmware mismatch</span>
          &nbsp;|&nbsp;
          CLEARANCE: <span>{t4Complete ? 'CONFIRMED' : 'PENDING'}</span>
          &nbsp;|&nbsp;
          POINTS: <span>100</span>
        </div>
      </div>

      <div className="t4-task-layout">
        {/* MAIN PANEL */}
        <div className="t4-main-panel">
          <div className="t4-alert-strip">
            <div className="t4-alert-icon">▲</div>
            <div>NeuroBand chip telemetry recovered from Lab 7. Firmware running at time of incident does <strong>not</strong> match safety build. Determine the exact failure timestamp.</div>
          </div>

          {/* INNER TABS */}
          <div className="t4-inner-tabs">
            {['overview', 'firmware', 'encoded'].map(tab => (
              <div
                key={tab}
                className={`t4-inner-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'encoded' ? 'ENCODED OUTPUT' : tab.toUpperCase()}
              </div>
            ))}
          </div>

          {/* OVERVIEW PANE */}
          <div className={`t4-pane ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="t4-telemetry-grid">
              <div className="t4-tele-card">
                <div className="t4-tele-card-label">Device ID</div>
                <div className="t4-tele-card-value" style={{ fontSize: '18px' }}>NB-PROD-41-HF</div>
                <div className="t4-tele-card-sub">NeuroBand v4 — Production Unit</div>
              </div>
              <div className="t4-tele-card">
                <div className="t4-tele-card-label">Neural Intensity at Failure</div>
                <div className="t4-tele-card-value">9.7x</div>
                <div className="t4-tele-card-sub" style={{ color: 'var(--red-bright)' }}>▲ SAFE_THRESHOLD exceeded</div>
              </div>
              <div className="t4-tele-card">
                <div className="t4-tele-card-label">Active Firmware</div>
                <div className="t4-tele-card-value" style={{ fontSize: '16px', color: 'var(--amber)' }}>HOTFIX_41</div>
                <div className="t4-tele-card-sub" style={{ color: 'var(--red-bright)' }}>≠ Safety build</div>
              </div>
              <div className="t4-tele-card">
                <div className="t4-tele-card-label">Shutdown Triggered?</div>
                <div className="t4-tele-card-value" style={{ color: 'var(--red-bright)' }}>NO</div>
                <div className="t4-tele-card-sub">override_flag = True</div>
              </div>
            </div>

            <div className="t4-waveform-container">
              <div className="t4-waveform-label">▸ NEUROBAND SIGNAL — LAB 7 SESSION (20:55 – 22:30)</div>
              <canvas id="t4-waveform-canvas" ref={canvasRef}></canvas>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', padding: '0 4px' }}>
                <span>20:55</span><span>21:15</span><span>21:30</span><span>21:45</span><span>22:00</span><span>22:30</span>
              </div>
            </div>

            <div className="t4-alert-strip" style={{ borderColor: 'var(--amber)', borderLeftColor: 'var(--amber)' }}>
              <div className="t4-alert-icon" style={{ color: 'var(--amber)' }}>◉</div>
              <div>Telemetry spike detected. Sensor offline event follows. The encoded output contains the exact failure time — authenticate with the Device ID to unlock it.</div>
            </div>
          </div>

          {/* FIRMWARE PANE */}
          <div className={`t4-pane ${activeTab === 'firmware' ? 'active' : ''}`}>
            <div className="t4-section-head">Firmware Comparison</div>
            <table className="t4-fw-table">
              <tbody>
                <tr><td>Expected Build</td><td>NB-SAFETY-PATCH-v1.3</td></tr>
                <tr className="mismatch"><td>Installed Build</td><td>HOTFIX_41 ← MISMATCH</td></tr>
                <tr><td>Build Author</td><td>ghostid_41</td></tr>
                <tr><td>Override Flag</td><td style={{ color: 'var(--red-bright)' }}>True</td></tr>
                <tr><td>Shutdown Logic</td><td style={{ color: 'var(--red-bright)', textDecoration: 'line-through' }}>shutdown_device() — REMOVED</td></tr>
                <tr><td>Log Suppression</td><td style={{ color: 'var(--red-bright)' }}>suppress_log() — ACTIVE</td></tr>
              </tbody>
            </table>
            <div className="t4-alert-strip">
              <div className="t4-alert-icon">▲</div>
              <div>The active firmware did not match the safety build. Rishab's patch was bypassed. The chip continued operating past safe thresholds.</div>
            </div>
          </div>

          {/* ENCODED PANE */}
          <div className={`t4-pane ${activeTab === 'encoded' ? 'active' : ''}`}>
            <div className="t4-section-head">Encoded Telemetry Output</div>
            <div className={`t4-device-gate ${deviceIdUnlocked ? 'unlocked' : ''}`}>
              <div className="t4-device-gate-label">🔒 STEP 1 — AUTHENTICATE DEVICE ACCESS</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>
                Encoded output is access-locked. Enter the Device ID (visible in the Overview tab) to retrieve the telemetry payload.
              </div>
              <div className="t4-device-gate-row">
                <input
                  className="t4-chat-input-style"
                  placeholder="Enter Device ID..."
                  value={deviceIdInput}
                  onChange={(e) => setDeviceIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeviceIdSubmit()}
                  disabled={deviceIdUnlocked}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <button className="t4-btn-action" onClick={handleDeviceIdSubmit} disabled={deviceIdUnlocked}>[ AUTHENTICATE ]</button>
              </div>
              <div className="t4-device-gate-status" style={{ color: deviceIdStatus.isError ? 'var(--red-bright)' : 'var(--green)', fontSize: '10px', marginTop: '8px', minHeight: '15px' }}>
                {deviceIdStatus.text}
              </div>
            </div>

            <div className="t4-aes-box">
              <div className="t4-aes-label">► BASE64 ENCODED OUTPUT — TELEMETRY TIMESTAMP</div>
              <div className={`t4-encoded ${deviceIdUnlocked ? 'unlocked' : ''}`}>{ENCODED_TIMESTAMP}</div>
              <div style={{ margin: '10px 0 4px' }}>
                <div className="t4-aes-key-hint" style={{ marginBottom: '6px' }}>
                  ENCODING: <span>Base64</span><br />
                  FORMAT OF PLAINTEXT: <span>HH:MM (24h)</span><br />
                  STATUS: <span style={{ color: deviceIdUnlocked ? 'var(--green)' : 'var(--red-bright)' }}>
                    {deviceIdUnlocked ? 'UNLOCKED — decode the string above' : 'LOCKED — authenticate device first'}
                  </span>
                </div>
              </div>
            </div>

            <div className="t4-alert-strip" style={{ borderColor: 'var(--cyan)', borderLeftColor: 'var(--cyan)' }}>
              <div className="t4-alert-icon" style={{ color: 'var(--cyan)' }}>ℹ</div>
              <div>
                <strong>Step 1:</strong> Enter the Device ID (overview tab) to unlock the encoded string.<br />
                <strong>Step 2:</strong> Decode the Base64 string to reveal the failure timestamp.<br />
                <strong>Step 3:</strong> Submit the decoded timestamp to <strong style={{ color: 'var(--cyan)' }}>GhostID_41 👻</strong> via the chat bot.
              </div>
            </div>

            <div className={`t4-unlock-banner ${t4Complete ? 'show' : ''}`}>
              ✓ TIMESTAMP CONFIRMED — MOVEMENT FORENSICS UNLOCKED
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="t4-sidebar">
          <div className="t4-sidebar-section">
            <div className="t4-sidebar-label">Clearance Level</div>
            <div className="t4-clearance-bar">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`cl-dot ${(i < 3 || (i === 3 && t4Complete)) ? 'filled' : ''}`}></div>
              ))}
            </div>
          </div>

          <div className="t4-sidebar-section">
            <div className="t4-sidebar-label">Task Progress</div>
            <div className="t4-progress-item"><div className="prog-dot done"></div><div className="t4-prog-label">Task 1 — Data Theft</div><span style={{ color: 'var(--green)' }}>✓</span></div>
            <div className="t4-progress-item"><div className="prog-dot done"></div><div className="t4-prog-label">Task 2 — CCTV</div><span style={{ color: 'var(--green)' }}>✓</span></div>
            <div className="t4-progress-item"><div className="prog-dot done"></div><div className="t4-prog-label">Task 3 — Code Audit</div><span style={{ color: 'var(--green)' }}>✓</span></div>
            <div className="t4-progress-item"><div className={`prog-dot ${t4Complete ? 'done' : 'active'}`}></div><div className={`t4-prog-label ${!t4Complete ? 'active' : ''}`}>Task 4 — Telemetry</div><span style={{ color: t4Complete ? 'var(--green)' : 'var(--amber)' }}>{t4Complete ? '✓' : '▶'}</span></div>
            <div className="t4-progress-item"><div className="prog-dot pending"></div><div className="t4-prog-label">Task 5 — Movement</div><span style={{ color: 'var(--text-muted)' }}>🔒</span></div>
          </div>

          <div className="t4-sidebar-section">
            <div className="t4-sidebar-label">Telemetry Log</div>
            <div style={{ fontSize: '11px', lineHeight: 2, color: 'var(--text-dim)' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>21:10</span> — Session active</div>
              <div><span style={{ color: 'var(--text-muted)' }}>21:30</span> — Intensity rising</div>
              <div><span style={{ color: 'var(--red-bright)' }}>??:??</span> — <span style={{ color: 'var(--red-bright)' }}>SPIKE / FAILURE</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>22:00</span> — Sensor offline</div>
            </div>
          </div>

          <div className="t4-sidebar-section" style={{ flex: 1 }}>
            <div className="t4-sidebar-label">GhostID_41</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.7 }}>
              "The telemetry failure happened while the risky hotfix was active."<br /><br />
              Authenticate the device, decode the output, find the exact moment.
            </div>
          </div>
        </div>
      </div>

      {/* GHOST CHATBOT */}
      <div className="t4-ghost-btn" onClick={toggleChat} title="GhostID_41">
        <div className="t4-ghost-pulse"></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <span style={{ fontSize: '28px', lineHeight: 1 }}>👻</span>
        </div>
      </div>

      <div className={`t4-chat-window ${chatOpen ? 'open' : ''}`}>
        <div className="t4-chat-header">
          <span style={{ fontSize: '20px' }}>👻</span>
          <div>
            <div className="t4-chat-header-name">GHOSTID_41</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Rule-based assist module</div>
          </div>
          <div className="t4-chat-header-status">● ONLINE</div>
          <button className="t4-chat-close" onClick={() => setChatOpen(false)}>✕</button>
        </div>
        <div className="t4-chat-body" ref={chatBodyRef}>
          {chatMessages.map(msg => (
            <div key={msg.id} className={`t4-chat-msg ${msg.isUser ? 'user-msg' : 'ghost'}`}>
              {!msg.isUser && msg.label && <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'var(--red-dim)', marginBottom: '4px' }}>{msg.label}</div>}
              <div>{msg.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
            </div>
          ))}
          {isTyping && (
            <div className="t4-typing-indicator">
              <div className="t4-typing-dot"></div>
              <div className="t4-typing-dot"></div>
              <div className="t4-typing-dot"></div>
            </div>
          )}
        </div>
        <div className="t4-chat-footer">
          <input
            className="t4-chat-input"
            placeholder="Type your answer..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
          />
          <button className="t4-chat-send" onClick={sendChat}>SEND</button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0a0505", border: "1px solid #c0392b", padding: "40px", borderRadius: "4px", textAlign: "center", maxWidth: "400px", boxShadow: "0 0 40px rgba(192,57,43,0.2)" }}>
            <h2 style={{ color: "#ff3b2a", fontSize: "24px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", textShadow: "0 0 20px rgba(255,59,42,0.5)", fontFamily: "'Share Tech Mono', monospace" }}>Task Complete</h2>
            <p style={{ color: "#e8c8c8", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6", fontFamily: "'Share Tech Mono', monospace" }}>Telemetry data verified. Forensic movement module unlocked. Return to the dashboard to proceed.</p>
            <a
              href="/dashboard"
              style={{ display: "inline-block", background: "transparent", border: "1px solid #c0392b", color: "#ff3b2a", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s", fontFamily: "'Share Tech Mono', monospace" }}
              onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(192,57,43,0.1)"; }}
              onMouseOut={(e: any) => { e.currentTarget.style.background = "transparent"; }}
            >
              RETURN TO DASHBOARD
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task4Telemetry;
