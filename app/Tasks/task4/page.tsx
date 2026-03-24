'use client'
import { useEffect, useRef, useState } from 'react';

const Task4Telemetry: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ─── CSS ────────────────────────────────────────────────────────────────────
  const CSS = `
  :root {
    --red: #c0392b;
    --red-dim: #7a1a12;
    --red-bright: #ff3b2a;
    --red-glow: rgba(192,57,43,0.35);
    --bg: #0a0505;
    --bg2: #110808;
    --bg3: #1a0d0d;
    --border: #3d1010;
    --border-bright: #7a2020;
    --text: #e8c8c8;
    --text-dim: #8a5555;
    --text-muted: #5a3333;
    --green: #2dff6e;
    --amber: #ffb347;
    --cyan: #00e5ff;
    --white: #f5e8e8;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    min-height: 100vh;
    overflow-x: hidden;
    cursor: crosshair;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.07) 2px,
      rgba(0,0,0,0.07) 4px
    );
    pointer-events: none;
    z-index: 9998;
  }

  body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%);
    pointer-events: none;
    z-index: 9997;
  }

  /* ─── NAV ─── */
  .t4-top-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 44px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border-bright);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 32px;
    z-index: 500;
    box-shadow: 0 0 20px rgba(192,57,43,0.2);
  }

  .t4-top-bar-logo {
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    color: var(--red);
    letter-spacing: 3px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .t4-top-bar-logo span { color: var(--text-dim); }

  .t4-status-badge {
    margin-left: auto;
    font-size: 10px;
    color: var(--red);
    letter-spacing: 2px;
    animation: t4-blink 1.8s step-end infinite;
  }

  @keyframes t4-blink { 50% { opacity: 0; } }

  /* ─── TASK HEADER ─── */
  .t4-task-header {
    border-bottom: 1px solid var(--border);
    padding: 20px 32px 16px;
    background: linear-gradient(180deg, var(--bg2) 0%, transparent 100%);
    position: relative;
    overflow: hidden;
  }

  .t4-task-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--red), transparent);
    animation: t4-scanH 3s linear infinite;
  }

  @keyframes t4-scanH {
    0% { transform: scaleX(0); transform-origin: left; }
    50% { transform: scaleX(1); transform-origin: left; }
    51% { transform: scaleX(1); transform-origin: right; }
    100% { transform: scaleX(0); transform-origin: right; }
  }

  .t4-task-id {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    color: var(--red-dim);
    letter-spacing: 4px;
    margin-bottom: 6px;
  }

  .t4-task-title {
    font-family: 'Orbitron', monospace;
    font-size: 20px;
    font-weight: 900;
    color: var(--white);
    letter-spacing: 2px;
    text-shadow: 0 0 20px var(--red-glow);
  }

  .t4-task-meta {
    display: flex;
    gap: 24px;
    margin-top: 10px;
    font-size: 11px;
    color: var(--text-dim);
  }

  .t4-task-meta span { color: var(--amber); }

  /* ─── LAYOUT ─── */
  .t4-task-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 0;
    min-height: calc(100vh - 44px - 90px);
  }

  /* ─── LEFT PANEL ─── */
  .t4-main-panel {
    padding: 24px 28px;
    border-right: 1px solid var(--border);
    overflow-y: auto;
  }

  .t4-main-panel::-webkit-scrollbar { width: 4px; }
  .t4-main-panel::-webkit-scrollbar-track { background: var(--bg); }
  .t4-main-panel::-webkit-scrollbar-thumb { background: var(--red-dim); }

  /* ─── SIDEBAR ─── */
  .t4-sidebar {
    background: var(--bg2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .t4-sidebar-section {
    border-bottom: 1px solid var(--border);
    padding: 14px 16px;
  }

  .t4-sidebar-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  /* ─── TELEMETRY CARDS ─── */
  .t4-telemetry-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .t4-tele-card {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .t4-tele-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--red-dim), transparent);
  }

  .t4-tele-card-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .t4-tele-card-value {
    font-family: 'VT323', monospace;
    font-size: 28px;
    color: var(--red-bright);
    text-shadow: 0 0 10px var(--red);
  }

  .t4-tele-card-sub { font-size: 10px; color: var(--text-dim); margin-top: 4px; }

  /* ─── WAVEFORM ─── */
  .t4-waveform-container {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 16px;
    margin-bottom: 16px;
    position: relative;
  }

  .t4-waveform-label { font-size: 10px; letter-spacing: 2px; color: var(--text-dim); margin-bottom: 12px; }

  canvas#t4-waveform {
    width: 100%;
    height: 100px;
    display: block;
  }

  /* ─── AES / DECRYPT TERMINAL ─── */
  .t4-aes-box {
    background: var(--bg);
    border: 1px solid var(--border-bright);
    padding: 16px;
    margin-bottom: 16px;
    font-size: 11px;
    position: relative;
  }

  .t4-aes-label { font-size: 9px; letter-spacing: 3px; color: var(--amber); margin-bottom: 8px; }

  .t4-aes-cipher {
    font-family: 'VT323', monospace;
    font-size: 15px;
    color: var(--cyan);
    word-break: break-all;
    line-height: 1.6;
    opacity: 0.85;
  }

  .t4-aes-key-hint { margin-top: 8px; font-size: 10px; color: var(--text-muted); }
  .t4-aes-key-hint span { color: var(--amber); }

  .t4-decrypt-terminal {
    border-top: 1px solid var(--border);
    padding-top: 10px;
    margin-top: 6px;
  }

  .t4-decrypt-terminal-label {
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .t4-decrypt-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  /* ─── FIRMWARE TABLE ─── */
  .t4-fw-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 16px;
  }

  .t4-fw-table td {
    padding: 7px 12px;
    border-bottom: 1px solid var(--border);
  }

  .t4-fw-table td:first-child { color: var(--text-dim); width: 40%; }
  .t4-fw-table td:last-child { color: var(--amber); }
  .t4-fw-table tr.mismatch td:last-child { color: var(--red-bright); animation: t4-blink 1.5s step-end infinite; }

  /* ─── INNER TABS ─── */
  .t4-inner-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .t4-inner-tab {
    padding: 7px 16px;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    color: var(--text-muted);
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    margin-bottom: -1px;
  }

  .t4-inner-tab:hover { color: var(--text); }
  .t4-inner-tab.active { color: var(--red-bright); border-bottom-color: var(--red-bright); }

  .t4-inner-pane { display: none; }
  .t4-inner-pane.active { display: block; }

  /* ─── ALERT STRIP ─── */
  .t4-alert-strip {
    background: rgba(192,57,43,0.08);
    border: 1px solid var(--red-dim);
    border-left: 3px solid var(--red);
    padding: 10px 14px;
    font-size: 11px;
    color: var(--text);
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .t4-alert-icon { color: var(--red-bright); font-size: 14px; flex-shrink: 0; }

  /* ─── UNLOCK BANNER ─── */
  .t4-unlock-banner {
    background: rgba(45,255,110,0.08);
    border: 1px solid rgba(45,255,110,0.3);
    padding: 12px 16px;
    text-align: center;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--green);
    display: none;
    animation: t4-fadeIn 0.5s ease;
  }

  .t4-unlock-banner.show { display: block; }

  @keyframes t4-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  /* ─── SECTION HEAD ─── */
  .t4-section-head {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }

  /* ─── PROGRESS / CLEARANCE ─── */
  .t4-progress-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 11px;
    border-bottom: 1px solid var(--border);
  }

  .t4-progress-item:last-child { border-bottom: none; }

  .prog-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .prog-dot.done { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .prog-dot.active { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: t4-blink 1s step-end infinite; }
  .prog-dot.pending { background: var(--border-bright); }

  .t4-prog-label { flex: 1; color: var(--text-dim); }
  .t4-prog-label.active { color: var(--white); }
  .t4-prog-status { font-size: 9px; }

  .t4-clearance-bar { display: flex; gap: 4px; align-items: center; }

  .cl-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 1px solid var(--border-bright);
  }

  .cl-dot.filled { background: var(--red); border-color: var(--red); box-shadow: 0 0 6px var(--red); }

  /* ─── TIME INPUT ─── */
  .t4-time-input {
    background: var(--bg);
    border: 1px solid var(--border-bright);
    color: var(--cyan);
    font-family: 'VT323', monospace;
    font-size: 22px;
    padding: 8px 14px;
    width: 120px;
    letter-spacing: 3px;
    outline: none;
    transition: border-color 0.2s;
  }

  .t4-time-input:focus { border-color: var(--cyan); box-shadow: 0 0 10px rgba(0,229,255,0.15); }
  .t4-time-input::placeholder { color: var(--text-muted); }

  /* ─── SHARED INPUT/BUTTON STYLES ─── */
  .t4-chat-input-style {
    flex: 1;
    min-width: 160px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    padding: 7px 10px;
    outline: none;
    transition: border-color 0.15s;
  }

  .t4-chat-input-style:focus { border-color: var(--border-bright); }
  .t4-chat-input-style::placeholder { color: var(--text-muted); }

  .t4-btn-action {
    background: var(--red-dim);
    border: none;
    color: var(--white);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    padding: 7px 16px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .t4-btn-action:hover { background: var(--red); }

  /* ─── GHOST CHATBOT ─── */
  .t4-ghost-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    background: var(--bg2);
    border: 1px solid var(--red-dim);
    border-radius: 50%;
    cursor: pointer;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(192,57,43,0.3);
  }

  .t4-ghost-btn:hover {
    border-color: var(--red-bright);
    box-shadow: 0 0 30px rgba(192,57,43,0.5);
    transform: scale(1.05);
  }

  .t4-ghost-pulse {
    position: absolute;
    top: -3px; right: -3px;
    width: 12px; height: 12px;
    background: var(--red-bright);
    border-radius: 50%;
    animation: t4-pulse 2s ease-in-out infinite;
  }

  @keyframes t4-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
  }

  /* ─── CHAT WINDOW ─── */
  .t4-chat-window {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 380px;
    max-height: 520px;
    background: var(--bg2);
    border: 1px solid var(--border-bright);
    border-radius: 2px;
    z-index: 1001;
    display: none;
    flex-direction: column;
    box-shadow: 0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(192,57,43,0.15);
    animation: t4-slideUp 0.2s ease;
  }

  @keyframes t4-slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .t4-chat-window.open { display: flex; }

  .t4-chat-header {
    background: var(--bg3);
    border-bottom: 1px solid var(--border-bright);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .t4-chat-header-name {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    color: var(--red);
    letter-spacing: 2px;
  }

  .t4-chat-header-status {
    font-size: 9px;
    color: var(--text-muted);
    margin-left: auto;
  }

  .t4-chat-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    transition: color 0.15s;
  }

  .t4-chat-close:hover { color: var(--red-bright); }

  .t4-chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 200px;
  }

  .t4-chat-body::-webkit-scrollbar { width: 3px; }
  .t4-chat-body::-webkit-scrollbar-thumb { background: var(--red-dim); }

  .t4-chat-msg {
    max-width: 88%;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.6;
    animation: t4-fadeIn 0.3s ease;
  }

  .t4-chat-msg.ghost {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-left: 2px solid var(--red);
    color: var(--text);
    align-self: flex-start;
  }

  .t4-chat-msg.ghost .msg-label {
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--red-dim);
    margin-bottom: 4px;
  }

  .t4-chat-msg.user-msg {
    background: rgba(192,57,43,0.08);
    border: 1px solid var(--red-dim);
    color: var(--white);
    align-self: flex-end;
    text-align: right;
  }

  .t4-chat-msg.system-msg {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 1px;
    align-self: center;
    text-align: center;
    font-style: italic;
  }

  .t4-chat-footer {
    border-top: 1px solid var(--border);
    padding: 10px;
    display: flex;
    gap: 8px;
  }

  .t4-chat-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    padding: 7px 10px;
    outline: none;
    transition: border-color 0.15s;
  }

  .t4-chat-input:focus { border-color: var(--border-bright); }
  .t4-chat-input::placeholder { color: var(--text-muted); }

  .t4-chat-send {
    background: var(--red-dim);
    border: none;
    color: var(--white);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .t4-chat-send:hover { background: var(--red); }

  /* ─── TYPING ─── */
  .t4-typing-indicator {
    display: flex;
    gap: 4px;
    padding: 10px 14px;
    align-items: center;
  }

  .t4-typing-dot {
    width: 5px; height: 5px;
    background: var(--red-dim);
    border-radius: 50%;
    animation: t4-typingBounce 1.2s infinite;
  }

  .t4-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .t4-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes t4-typingBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); background: var(--red-bright); }
  }
  `;

  // ─── HTML ────────────────────────────────────────────────────────────────────
  const HTML = `
<nav class="t4-top-bar">
  <div class="t4-top-bar-logo">INTERNAL OPS CONSOLE <span>// CASE #131</span></div>
  <div class="t4-status-badge">▲ INVESTIGATION ACTIVE</div>
</nav>

<div style="padding-top:44px;min-height:100vh;">

  <div class="t4-task-header">
    <div class="t4-task-id">▸ CASE #131 / TASK 4 / CHIP TELEMETRY</div>
    <div class="t4-task-title">TELEMETRY RECONSTRUCTION</div>
    <div class="t4-task-meta">
      OBJECTIVE: <span>Identify failure timestamp + firmware mismatch</span>
      &nbsp;|&nbsp;
      CLEARANCE: <span id="t4-clearance">PENDING</span>
      &nbsp;|&nbsp;
      POINTS: <span>100</span>
    </div>
  </div>

  <div class="t4-task-layout">
    <!-- MAIN PANEL -->
    <div class="t4-main-panel">

      <div class="t4-alert-strip">
        <div class="t4-alert-icon">▲</div>
        <div>NeuroBand chip telemetry recovered from Lab 7. Firmware running at time of incident does <strong>not</strong> match safety build. Determine the exact failure timestamp.</div>
      </div>

      <!-- INNER TABS -->
      <div class="t4-inner-tabs">
        <div class="t4-inner-tab active" onclick="t4SwitchTab('overview')">OVERVIEW</div>
        <div class="t4-inner-tab" onclick="t4SwitchTab('firmware')">FIRMWARE</div>
        <div class="t4-inner-tab" onclick="t4SwitchTab('encrypted')">ENCRYPTED OUTPUT</div>
      </div>

      <!-- OVERVIEW PANE -->
      <div class="t4-inner-pane active" id="t4-pane-overview">
        <div class="t4-telemetry-grid">
          <div class="t4-tele-card">
            <div class="t4-tele-card-label">Device ID</div>
            <div class="t4-tele-card-value" style="font-size:18px">NB-PROD-41-HF</div>
            <div class="t4-tele-card-sub">NeuroBand v4 — Production Unit</div>
          </div>
          <div class="t4-tele-card">
            <div class="t4-tele-card-label">Neural Intensity at Failure</div>
            <div class="t4-tele-card-value">9.7x</div>
            <div class="t4-tele-card-sub" style="color:var(--red-bright)">▲ SAFE_THRESHOLD exceeded</div>
          </div>
          <div class="t4-tele-card">
            <div class="t4-tele-card-label">Active Firmware</div>
            <div class="t4-tele-card-value" style="font-size:16px;color:var(--amber)">HOTFIX_41</div>
            <div class="t4-tele-card-sub" style="color:var(--red-bright)">≠ Safety build</div>
          </div>
          <div class="t4-tele-card">
            <div class="t4-tele-card-label">Shutdown Triggered?</div>
            <div class="t4-tele-card-value" style="color:var(--red-bright)">NO</div>
            <div class="t4-tele-card-sub">override_flag = True</div>
          </div>
        </div>

        <div class="t4-waveform-container">
          <div class="t4-waveform-label">▸ NEUROBAND SIGNAL — LAB 7 SESSION (20:55 – 22:30)</div>
          <canvas id="t4-waveform" height="100"></canvas>
          <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-top:6px;padding:0 4px">
            <span>20:55</span><span>21:15</span><span>21:30</span><span>21:45</span><span>22:00</span><span>22:30</span>
          </div>
        </div>

        <div class="t4-alert-strip" style="border-color:var(--amber);border-left-color:var(--amber)">
          <div class="t4-alert-icon" style="color:var(--amber)">◉</div>
          <div>Telemetry spike detected. Sensor offline event follows. The encrypted output encodes the exact failure time. Decrypt to confirm.</div>
        </div>
      </div>

      <!-- FIRMWARE PANE -->
      <div class="t4-inner-pane" id="t4-pane-firmware">
        <div class="t4-section-head">Firmware Comparison</div>
        <table class="t4-fw-table">
          <tr><td>Expected Build</td><td>NB-SAFETY-PATCH-v1.3</td></tr>
          <tr class="mismatch"><td>Installed Build</td><td>HOTFIX_41 ← MISMATCH</td></tr>
          <tr><td>Build Author</td><td>ghostid_41</td></tr>
          <tr><td>Override Flag</td><td style="color:var(--red-bright)">True</td></tr>
          <tr><td>Shutdown Logic</td><td style="color:var(--red-bright);text-decoration:line-through">shutdown_device() — REMOVED</td></tr>
          <tr><td>Log Suppression</td><td style="color:var(--red-bright)">suppress_log() — ACTIVE</td></tr>
        </table>
        <div class="t4-alert-strip">
          <div class="t4-alert-icon">▲</div>
          <div>The active firmware did not match the safety build. Rishab's patch was bypassed. The chip continued operating past safe thresholds.</div>
        </div>
      </div>

      <!-- ENCRYPTED PANE -->
      <div class="t4-inner-pane" id="t4-pane-encrypted">
        <div class="t4-section-head">Encrypted Telemetry Output</div>

        <div class="t4-aes-box">
          <div class="t4-aes-label">▸ AES-256-CBC ENCRYPTED OUTPUT — TELEMETRY TIMESTAMP</div>
          <div class="t4-aes-cipher" id="t4-aes-display">U2FsdGVkX19...</div>
          <div style="margin:10px 0 4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="flex:1">
              <div class="t4-aes-key-hint" style="margin-bottom:6px">
                KEY HINT: <span>NEUROSPHERE_[DEVICE_ID]</span><br>
                CIPHER: <span>AES-256-CBC</span> &nbsp;|&nbsp; LIB: <span>CryptoJS</span><br>
                FORMAT OF PLAINTEXT: <span>HH:MM (24h)</span>
              </div>
            </div>
          </div>
          <div class="t4-decrypt-terminal">
            <div class="t4-decrypt-terminal-label">▸ DECRYPT TERMINAL</div>
            <div class="t4-decrypt-row">
              <input id="t4-decrypt-key-input" class="t4-chat-input-style" placeholder="Enter decryption key..." />
              <button class="t4-btn-action" onclick="t4AttemptDecrypt()">[ DECRYPT ]</button>
            </div>
            <div id="t4-decrypt-output" style="font-family:'VT323',monospace;font-size:18px;min-height:28px;color:var(--text-muted);letter-spacing:2px">— awaiting key —</div>
            <div id="t4-decrypt-status" style="font-size:10px;color:var(--text-muted);margin-top:4px"></div>
          </div>
        </div>

        <div class="t4-alert-strip" style="border-color:var(--cyan);border-left-color:var(--cyan)">
          <div class="t4-alert-icon" style="color:var(--cyan)">ℹ</div>
          <div>Decrypt the ciphertext above using AES-256-CBC. The key follows the pattern: <strong>NEUROSPHERE_[DEVICE_ID]</strong>. Device ID is visible in the overview tab. Once decrypted, the plaintext is your answer.</div>
        </div>

        <div class="t4-unlock-banner" id="t4-unlock">
          ✓ TIMESTAMP CONFIRMED — MOVEMENT FORENSICS UNLOCKED
        </div>
      </div>

    </div>

    <!-- SIDEBAR -->
    <div class="t4-sidebar">
      <div class="t4-sidebar-section">
        <div class="t4-sidebar-label">Clearance Level</div>
        <div class="t4-clearance-bar" id="t4-clearance-bar">
          <div class="cl-dot filled"></div>
          <div class="cl-dot filled"></div>
          <div class="cl-dot filled"></div>
          <div class="cl-dot"></div>
          <div class="cl-dot"></div>
        </div>
      </div>

      <div class="t4-sidebar-section">
        <div class="t4-sidebar-label">Task Progress</div>
        <div class="t4-progress-item">
          <div class="prog-dot done"></div>
          <div class="t4-prog-label">Task 1 — Data Theft</div>
          <span class="t4-prog-status" style="color:var(--green)">✓</span>
        </div>
        <div class="t4-progress-item">
          <div class="prog-dot done"></div>
          <div class="t4-prog-label">Task 2 — CCTV</div>
          <span class="t4-prog-status" style="color:var(--green)">✓</span>
        </div>
        <div class="t4-progress-item">
          <div class="prog-dot done"></div>
          <div class="t4-prog-label">Task 3 — Code Audit</div>
          <span class="t4-prog-status" style="color:var(--green)">✓</span>
        </div>
        <div class="t4-progress-item">
          <div class="prog-dot active"></div>
          <div class="t4-prog-label active">Task 4 — Telemetry</div>
          <span class="t4-prog-status" style="color:var(--amber)">▶</span>
        </div>
        <div class="t4-progress-item">
          <div class="prog-dot pending"></div>
          <div class="t4-prog-label">Task 5 — Movement</div>
          <span class="t4-prog-status" style="color:var(--text-muted)">🔒</span>
        </div>
      </div>

      <div class="t4-sidebar-section">
        <div class="t4-sidebar-label">Telemetry Log</div>
        <div style="font-size:11px;line-height:2;color:var(--text-dim)">
          <div><span style="color:var(--text-muted)">21:10</span> — Session active</div>
          <div><span style="color:var(--text-muted)">21:30</span> — Intensity rising</div>
          <div><span style="color:var(--red-bright)">??:??</span> — <span style="color:var(--red-bright)">SPIKE / FAILURE</span></div>
          <div><span style="color:var(--text-muted)">22:00</span> — Sensor offline</div>
        </div>
      </div>

      <div class="t4-sidebar-section" style="flex:1">
        <div class="t4-sidebar-label">GhostID_41</div>
        <div style="font-size:11px;color:var(--text-dim);line-height:1.7">
          "The telemetry failure happened while the risky hotfix was active."<br><br>
          Decrypt the output to find the exact moment.
        </div>
      </div>

      <div class="t4-sidebar-section" style="font-size:10px;color:var(--text-muted)">
        GhostID ▸ Chat &nbsp;|&nbsp; Hints: Soft (−10) / Strong (−20)
      </div>
    </div>
  </div>
</div>

<!-- ─── GHOST CHATBOT ─── -->
<div class="t4-ghost-btn" onclick="t4ToggleChat()" title="GhostID_41">
  <div class="t4-ghost-pulse"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%">
    <span style="font-size:28px;line-height:1">👻</span>
  </div>
</div>

<div class="t4-chat-window" id="t4-chat-window">
  <div class="t4-chat-header">
    <span style="font-size:20px">👻</span>
    <div>
      <div class="t4-chat-header-name">GHOSTID_41</div>
      <div style="font-size:9px;color:var(--text-muted)">Rule-based assist module</div>
    </div>
    <div class="t4-chat-header-status">● ONLINE</div>
    <button class="t4-chat-close" onclick="t4ToggleChat()">✕</button>
  </div>
  <div class="t4-chat-body" id="t4-chat-body"></div>
  <div class="t4-chat-footer">
    <input class="t4-chat-input" id="t4-chat-input" placeholder="Type your answer..." onkeydown="if(event.key==='Enter') t4SendChat()">
    <button class="t4-chat-send" onclick="t4SendChat()">SEND</button>
  </div>
</div>
  `;

  // ─── LOGIC ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=VT323&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const cryptoScript = document.createElement('script');
    cryptoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js';
    document.head.appendChild(cryptoScript);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const _setTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    // ── AES SETUP ──
    let AES_CIPHERTEXT = '';
    let decryptUnlocked = false;

    function generateCipher() {
      // Fetch the ciphertext from the backend so the key/plaintext never exist in the frontend
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task4', questionId: 'get_cipher', answer: '' })
      })
        .then(r => r.json())
        .then(data => {
          if (data.ciphertext) {
            AES_CIPHERTEXT = data.ciphertext;
            const el = document.getElementById('t4-aes-display');
            if (el) el.textContent = AES_CIPHERTEXT;
          } else {
            // Fallback: retry after a short delay
            _setTimeout(generateCipher, 500);
          }
        })
        .catch(() => _setTimeout(generateCipher, 500));
    }

    function t4AttemptDecrypt() {
      const keyInputEl = document.getElementById('t4-decrypt-key-input') as HTMLInputElement;
      const outEl = document.getElementById('t4-decrypt-output') as HTMLElement;
      const statusEl = document.getElementById('t4-decrypt-status') as HTMLElement;
      const keyInput = keyInputEl.value.trim();

      if (!keyInput) {
        outEl.textContent = '— enter key —';
        outEl.style.color = 'var(--text-muted)';
        return;
      }

      // Verify the decryption key via the backend
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task4', questionId: 'decrypt', answer: keyInput })
      })
        .then(r => r.json())
        .then(result => {
          if (result.correct) {
            outEl.textContent = result.displayAnswer || 'DECRYPTED';
            outEl.style.color = 'var(--green)';
            statusEl.innerHTML = '✓ DECRYPTION SUCCESSFUL — <span style="color:var(--green)">key accepted</span>';
            statusEl.style.color = 'var(--green)';
            if (!decryptUnlocked) {
              decryptUnlocked = true;
              completeTask4();
              _setTimeout(() => {
                const chatWin = document.getElementById('t4-chat-window');
                if (chatWin && chatWin.classList.contains('open')) {
                  addGhostMsg(result.successMessage || 'Decryption confirmed. Movement forensics unlocked.', 'GhostID_41');
                }
              }, 400);
            }
          } else {
            outEl.textContent = '[ DECRYPTION FAILED ]';
            outEl.style.color = 'var(--red-bright)';
            statusEl.innerHTML = '✗ ' + (result.failureMessage || 'Wrong key.');
            statusEl.style.color = 'var(--red-bright)';
          }
        })
        .catch(() => {
          outEl.textContent = '[ ERROR ]';
          outEl.style.color = 'var(--red-bright)';
          statusEl.textContent = '✗ Verification error. Try again.';
          statusEl.style.color = 'var(--red-bright)';
        });
    }

    // ── TASK 4 COMPLETION ──
    let t4Complete = false;

    function completeTask4() {
      if (t4Complete) return;
      t4Complete = true;
      const unlock = document.getElementById('t4-unlock');
      if (unlock) unlock.classList.add('show');
      const clearance = document.getElementById('t4-clearance');
      if (clearance) clearance.textContent = 'CONFIRMED';
      const dots = document.getElementById('t4-clearance-bar')?.querySelectorAll('.cl-dot');
      if (dots) dots[3].classList.add('filled');
      setTimeout(() => setShowSuccessModal(true), 1500);
    }

    // ── INNER TAB SWITCHING ──
    function t4SwitchTab(tab: string) {
      document.querySelectorAll('.t4-inner-tab').forEach(t => t.classList.remove('active'));
      const clickedEl = document.querySelector(`.t4-inner-tab[onclick="t4SwitchTab('${tab}')"]`);
      if (clickedEl) clickedEl.classList.add('active');
      document.querySelectorAll('.t4-inner-pane').forEach(p => p.classList.remove('active'));
      const pane = document.getElementById(`t4-pane-${tab}`);
      if (pane) pane.classList.add('active');
      if (tab === 'overview') _setTimeout(drawWaveform, 50);
    }

    // ── WAVEFORM ──
    function drawWaveform() {
      const canvas = document.getElementById('t4-waveform') as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (canvas.offsetWidth || 600) * dpr;
      canvas.height = 100 * dpr;
      ctx.scale(dpr, dpr);
      const W = canvas.offsetWidth || 600;
      const H = 100;
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
    }

    // ── GHOST CHAT HELPERS ──
    function addGhostMsg(text: string, label?: string, style?: string) {
      const body = document.getElementById('t4-chat-body')!;
      const el = document.createElement('div');
      el.className = 't4-chat-msg ghost';
      el.innerHTML = `<div class="msg-label">${label || 'GhostID_41'}</div><div style="${style === 'italic' ? 'font-style:italic;color:var(--text-dim)' : ''}">${text.replace(/\n/g, '<br>')}</div>`;
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function addUserMsg(text: string) {
      const body = document.getElementById('t4-chat-body')!;
      const el = document.createElement('div');
      el.className = 't4-chat-msg user-msg'; el.textContent = text;
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
      const body = document.getElementById('t4-chat-body')!;
      if (body.querySelector('.t4-typing-indicator')) return;
      const el = document.createElement('div');
      el.className = 't4-typing-indicator'; el.id = 't4-typing-ind';
      el.innerHTML = '<div class="t4-typing-dot"></div><div class="t4-typing-dot"></div><div class="t4-typing-dot"></div>';
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function hideTyping() { document.getElementById('t4-typing-ind')?.remove(); }

    function queueGhostTyping(messages: { text: string; delay: number; style?: string }[]) {
      messages.forEach(m => {
        _setTimeout(() => {
          showTyping();
          _setTimeout(() => { hideTyping(); addGhostMsg(m.text, 'GhostID_41', m.style); }, 700 + Math.random() * 300);
        }, m.delay);
      });
    }

    // ── CHAT INIT ──
    let chatInitialized = false;

    function initChat() {
      if (chatInitialized) return;
      chatInitialized = true;
      const body = document.getElementById('t4-chat-body')!;
      body.innerHTML = '';
      queueGhostTyping([
        { text: 'Task 4 — Chip Telemetry.', delay: 0 },
        { text: 'The telemetry failure happened while the risky hotfix was active.', delay: 800 },
        { text: 'The encrypted output encodes the exact timestamp of failure.\n\nDecrypt it. Enter the time.', delay: 1800 },
        { text: 'When exactly did the NeuroBand system fail?', delay: 2800 }
      ]);
    }

    // ── CHAT HANDLER FOR TIMESTAMP VERIFICATION ──
    function handleTask4Chat(val: string) {
      if (!decryptUnlocked) {
        showTyping();
        _setTimeout(() => { hideTyping(); addGhostMsg('Decrypt the ciphertext first. Navigate to the Encrypted Output tab.', 'GhostID_41'); }, 500);
        return;
      }
      showTyping();
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task4', questionId: 'q1', answer: val })
      })
        .then(r => r.json())
        .then(result => {
          hideTyping();
          if (result.correct) {
            addGhostMsg(result.successMessage || 'Correct. Movement forensics unlocked.', 'GhostID_41');
            completeTask4();
          } else {
            addGhostMsg(result.failureMessage || 'Incorrect. Try again.', 'GhostID_41');
          }
        })
        .catch(() => {
          hideTyping();
          addGhostMsg('Error verifying answer. Try again.', 'GhostID_41');
        });
    }

    // ── TOGGLE & SEND ──
    function t4ToggleChat() {
      const win = document.getElementById('t4-chat-window')!;
      if (win.classList.contains('open')) {
        win.classList.remove('open');
      } else {
        win.classList.add('open');
        initChat();
        _setTimeout(() => { (document.getElementById('t4-chat-input') as HTMLInputElement)?.focus(); }, 100);
      }
    }

    function t4SendChat() {
      const input = document.getElementById('t4-chat-input') as HTMLInputElement;
      const raw = input.value.trim();
      if (!raw) return;
      input.value = '';
      addUserMsg(raw);
      const val = raw.toLowerCase().replace(/[\.\s_-]/g, '');
      handleTask4Chat(val);
    }

    // ── INIT ──
    generateCipher();
    _setTimeout(drawWaveform, 200);

    const onResize = () => { drawWaveform(); };
    window.addEventListener('resize', onResize);

    (window as any).t4ToggleChat = t4ToggleChat;
    (window as any).t4SendChat = t4SendChat;
    (window as any).t4AttemptDecrypt = t4AttemptDecrypt;
    (window as any).t4SwitchTab = t4SwitchTab;

    return () => {
      delete (window as any).t4ToggleChat;
      delete (window as any).t4SendChat;
      delete (window as any).t4AttemptDecrypt;
      delete (window as any).t4SwitchTab;
      timeouts.forEach(id => clearTimeout(id));
      window.removeEventListener('resize', onResize);
      document.head.removeChild(fontLink);
      document.head.removeChild(cryptoScript);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: HTML }} />
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease" }}>
          <div style={{ background: "#0a0505", border: "1px solid #c0392b", padding: "40px", borderRadius: "4px", textAlign: "center", maxWidth: "400px", boxShadow: "0 0 40px rgba(192,57,43,0.2)" }}>
            <h2 style={{ color: "#ff3b2a", fontSize: "24px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", textShadow: "0 0 20px rgba(255,59,42,0.5)", fontFamily: "'Share Tech Mono', monospace" }}>Task Complete</h2>
            <p style={{ color: "#e8c8c8", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6", fontFamily: "'Share Tech Mono', monospace" }}>Telemetry data verified. Forensic movement module unlocked. Return to the dashboard to proceed.</p>
            <a href="/dashboard" style={{ display: "inline-block", background: "transparent", border: "1px solid #c0392b", color: "#ff3b2a", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s", fontFamily: "'Share Tech Mono', monospace" }} onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(192,57,43,0.1)"; }} onMouseOut={(e: any) => { e.currentTarget.style.background = "transparent"; }}>RETURN TO DASHBOARD</a>
          </div>
        </div>
      )}
    </>
  );
};


export default Task4Telemetry;
