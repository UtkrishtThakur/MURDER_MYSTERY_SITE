'use client'
import { useEffect, useRef, useState } from 'react';

const Task3CodeAudit: React.FC = () => {
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

  /* Scanline overlay */
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

  /* CRT vignette */
  body::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%);
    pointer-events: none;
    z-index: 9997;
  }

  /* ─── NAV ─── */
  .t3-top-bar {
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

  .t3-top-bar-logo {
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    color: var(--red);
    letter-spacing: 3px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .t3-top-bar-logo span { color: var(--text-dim); }

  .t3-status-badge {
    margin-left: auto;
    font-size: 10px;
    color: var(--red);
    letter-spacing: 2px;
    animation: t3-blink 1.8s step-end infinite;
  }

  @keyframes t3-blink { 50% { opacity: 0; } }

  /* ─── TASK HEADER ─── */
  .t3-task-header {
    border-bottom: 1px solid var(--border);
    padding: 20px 32px 16px;
    background: linear-gradient(180deg, var(--bg2) 0%, transparent 100%);
    position: relative;
    overflow: hidden;
  }

  .t3-task-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--red), transparent);
    animation: t3-scanH 3s linear infinite;
  }

  @keyframes t3-scanH {
    0% { transform: scaleX(0); transform-origin: left; }
    50% { transform: scaleX(1); transform-origin: left; }
    51% { transform: scaleX(1); transform-origin: right; }
    100% { transform: scaleX(0); transform-origin: right; }
  }

  .t3-task-id {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    color: var(--red-dim);
    letter-spacing: 4px;
    margin-bottom: 6px;
  }

  .t3-task-title {
    font-family: 'Orbitron', monospace;
    font-size: 20px;
    font-weight: 900;
    color: var(--white);
    letter-spacing: 2px;
    text-shadow: 0 0 20px var(--red-glow);
  }

  .t3-task-meta {
    display: flex;
    gap: 24px;
    margin-top: 10px;
    font-size: 11px;
    color: var(--text-dim);
  }

  .t3-task-meta span { color: var(--amber); }

  /* ─── LAYOUT ─── */
  .t3-task-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 0;
    min-height: calc(100vh - 44px - 90px);
  }

  /* ─── LEFT PANEL ─── */
  .t3-main-panel {
    padding: 24px 28px;
    border-right: 1px solid var(--border);
    overflow-y: auto;
  }

  .t3-main-panel::-webkit-scrollbar { width: 4px; }
  .t3-main-panel::-webkit-scrollbar-track { background: var(--bg); }
  .t3-main-panel::-webkit-scrollbar-thumb { background: var(--red-dim); }

  /* ─── RIGHT SIDEBAR ─── */
  .t3-sidebar {
    background: var(--bg2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .t3-sidebar-section {
    border-bottom: 1px solid var(--border);
    padding: 14px 16px;
  }

  .t3-sidebar-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  /* ─── CODE DIFF VIEWER ─── */
  .t3-diff-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
    align-items: start;
  }

  .t3-diff-panel {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .t3-diff-panel:hover { border-color: var(--border-bright); }
  .t3-diff-panel.highlight-safe { border-color: var(--green); box-shadow: 0 0 12px rgba(45,255,110,0.15); }
  .t3-diff-panel.highlight-danger { border-color: var(--red-bright); box-shadow: 0 0 12px rgba(255,59,42,0.2); }

  .t3-diff-header {
    background: var(--bg3);
    padding: 8px 14px;
    font-size: 10px;
    letter-spacing: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .t3-diff-filename { color: var(--cyan); }
  .t3-diff-author { color: var(--text-muted); font-size: 9px; max-width: 200px; text-align: right; word-break: break-word; }

  .t3-diff-body {
    padding: 10px 0;
    font-size: 11.5px;
    line-height: 1.75;
    font-family: 'Share Tech Mono', monospace;
    overflow-x: auto;
  }

  .t3-diff-body .line {
    display: flex;
    gap: 0;
    padding: 0 8px;
    min-height: 20px;
    white-space: pre;
  }

  .t3-diff-body .line:hover { background: rgba(255,255,255,0.03); }

  .line-num {
    color: var(--text-muted);
    min-width: 28px;
    user-select: none;
    font-size: 10px;
    padding-right: 10px;
    border-right: 1px solid var(--border);
    margin-right: 10px;
    flex-shrink: 0;
    line-height: 1.75;
  }

  .line-add { color: var(--text-dim); }
  .line-remove { color: var(--text-dim); }
  .line-neutral { color: var(--text-dim); }
  .line-keyword { color: var(--cyan); }
  .line-string { color: var(--amber); }
  .line-comment { color: var(--text-muted); font-style: italic; }

  /* ─── BEHAVIOR TABLE ─── */
  .t3-behavior-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 20px;
  }

  .t3-behavior-table th {
    background: var(--bg3);
    color: var(--text-dim);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-bright);
  }

  .t3-behavior-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
  }

  .t3-behavior-table tr:hover td { background: rgba(192,57,43,0.05); }

  .tag-safe { color: var(--green); font-size: 10px; }
  .tag-danger { color: var(--red-bright); font-size: 10px; }
  .tag-suppressed { color: var(--text-muted); text-decoration: line-through; font-size: 10px; }

  /* ─── SUBMIT FORM ─── */
  .t3-submit-section {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 20px;
    margin-top: 16px;
  }

  .t3-submit-label {
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .t3-radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .t3-radio-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
  }

  .t3-radio-option:hover { border-color: var(--border-bright); background: rgba(192,57,43,0.05); }
  .t3-radio-option.selected { border-color: var(--red-bright); background: rgba(192,57,43,0.12); color: var(--white); }

  .t3-radio-dot {
    width: 12px; height: 12px;
    border: 1px solid var(--text-muted);
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .t3-radio-option.selected .t3-radio-dot { border-color: var(--red-bright); background: var(--red-bright); }

  .t3-btn-submit {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: 1px solid var(--red-dim);
    color: var(--red);
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
  }

  .t3-btn-submit:hover {
    background: var(--red-dim);
    color: var(--white);
    box-shadow: 0 0 20px var(--red-glow);
  }

  .t3-btn-submit:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ─── RESULT BOX ─── */
  .t3-result-box {
    margin-top: 14px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    font-size: 12px;
    display: none;
    animation: t3-fadeIn 0.3s ease;
  }

  @keyframes t3-fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .t3-result-box.success { border-color: var(--green); background: rgba(45,255,110,0.05); color: var(--green); }
  .t3-result-box.fail { border-color: var(--red-bright); background: rgba(255,59,42,0.05); color: var(--red-bright); }

  /* ─── PROGRESS BAR SIDEBAR ─── */
  .t3-progress-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    font-size: 11px;
    border-bottom: 1px solid var(--border);
  }

  .t3-progress-item:last-child { border-bottom: none; }

  .prog-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .prog-dot.done { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .prog-dot.active { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: t3-blink 1s step-end infinite; }
  .prog-dot.pending { background: var(--border-bright); }

  .t3-prog-label { flex: 1; color: var(--text-dim); }
  .t3-prog-label.active { color: var(--white); }
  .t3-prog-status { font-size: 9px; }

  /* ─── MISC ─── */
  .t3-section-head {
    font-size: 9px;
    letter-spacing: 3px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }

  .t3-alert-strip {
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

  .t3-alert-icon { color: var(--red-bright); font-size: 14px; flex-shrink: 0; }

  .t3-unlock-banner {
    background: rgba(45,255,110,0.08);
    border: 1px solid rgba(45,255,110,0.3);
    padding: 12px 16px;
    text-align: center;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--green);
    display: none;
    animation: t3-fadeIn 0.5s ease;
  }

  .t3-unlock-banner.show { display: block; }

  /* Clearance dots */
  .t3-clearance-bar {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .cl-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 1px solid var(--border-bright);
  }

  .cl-dot.filled { background: var(--red); border-color: var(--red); box-shadow: 0 0 6px var(--red); }

  /* ─── GHOST CHATBOT ─── */
  .t3-ghost-btn {
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

  .t3-ghost-btn:hover {
    border-color: var(--red-bright);
    box-shadow: 0 0 30px rgba(192,57,43,0.5);
    transform: scale(1.05);
  }

  .t3-ghost-pulse {
    position: absolute;
    top: -3px; right: -3px;
    width: 12px; height: 12px;
    background: var(--red-bright);
    border-radius: 50%;
    animation: t3-pulse 2s ease-in-out infinite;
  }

  @keyframes t3-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
  }

  /* ─── CHAT WINDOW ─── */
  .t3-chat-window {
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
    animation: t3-slideUp 0.2s ease;
  }

  @keyframes t3-slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .t3-chat-window.open { display: flex; }

  .t3-chat-header {
    background: var(--bg3);
    border-bottom: 1px solid var(--border-bright);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .t3-chat-header-name {
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    color: var(--red);
    letter-spacing: 2px;
  }

  .t3-chat-header-status {
    font-size: 9px;
    color: var(--text-muted);
    margin-left: auto;
  }

  .t3-chat-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    transition: color 0.15s;
  }

  .t3-chat-close:hover { color: var(--red-bright); }

  .t3-chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 200px;
  }

  .t3-chat-body::-webkit-scrollbar { width: 3px; }
  .t3-chat-body::-webkit-scrollbar-thumb { background: var(--red-dim); }

  .t3-chat-msg {
    max-width: 88%;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.6;
    animation: t3-fadeIn 0.3s ease;
  }

  .t3-chat-msg.ghost {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-left: 2px solid var(--red);
    color: var(--text);
    align-self: flex-start;
  }

  .t3-chat-msg.ghost .msg-label {
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--red-dim);
    margin-bottom: 4px;
  }

  .t3-chat-msg.user-msg {
    background: rgba(192,57,43,0.08);
    border: 1px solid var(--red-dim);
    color: var(--white);
    align-self: flex-end;
    text-align: right;
  }

  .t3-chat-msg.system-msg {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 10px;
    letter-spacing: 1px;
    align-self: center;
    text-align: center;
    font-style: italic;
  }

  .t3-chat-footer {
    border-top: 1px solid var(--border);
    padding: 10px;
    display: flex;
    gap: 8px;
  }

  .t3-chat-input {
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

  .t3-chat-input:focus { border-color: var(--border-bright); }
  .t3-chat-input::placeholder { color: var(--text-muted); }

  .t3-chat-send {
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

  .t3-chat-send:hover { background: var(--red); }

  /* ─── TYPING INDICATOR ─── */
  .t3-typing-indicator {
    display: flex;
    gap: 4px;
    padding: 10px 14px;
    align-items: center;
  }

  .t3-typing-dot {
    width: 5px; height: 5px;
    background: var(--red-dim);
    border-radius: 50%;
    animation: t3-typingBounce 1.2s infinite;
  }

  .t3-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .t3-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes t3-typingBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); background: var(--red-bright); }
  }
  `;

  // ─── HTML ────────────────────────────────────────────────────────────────────
  const HTML = `
<nav class="t3-top-bar">
  <div class="t3-top-bar-logo">INTERNAL OPS CONSOLE <span>// CASE #131</span></div>
  <div class="t3-status-badge">▲ INVESTIGATION ACTIVE</div>
</nav>

<div style="padding-top:44px;min-height:100vh;">

  <div class="t3-task-header">
    <div class="t3-task-id">▸ CASE #131 / TASK 3 / CODE AUDIT</div>
    <div class="t3-task-title">CODE AUDIT</div>
    <div class="t3-task-meta">
      OBJECTIVE: <span>Compare safety patch vs production hotfix</span>
      &nbsp;|&nbsp;
      CLEARANCE: <span id="t3-clearance">INCOMPLETE</span>
      &nbsp;|&nbsp;
      POINTS: <span>75</span>
    </div>
  </div>

  <div class="t3-task-layout">
    <!-- MAIN PANEL -->
    <div class="t3-main-panel" id="t3-main">

      <div class="t3-alert-strip">
        <div class="t3-alert-icon">▲</div>
        <div>Two code branches were active on the NeuroBand system. One was written by Rishab Sen. One was deployed as a hotfix by <strong>ghostid_41</strong>. Read behavior — not comments.</div>
      </div>

      <div class="t3-section-head">Source Comparison — Full Files</div>

      <div class="t3-diff-container" id="diff-viewer">
        <!-- RISHAB PATCH -->
        <div class="t3-diff-panel" id="panel-rishab">
          <div class="t3-diff-header">
            <span class="t3-diff-filename">rishabPatch.py</span>
            <span class="t3-diff-author">author: rishab.sen</span>
          </div>
          <div class="t3-diff-body">
<div class="line"><span class="line-num">1</span><span class="line-comment">"""</span></div>
<div class="line"><span class="line-num">2</span><span class="line-comment">Rishab Sen's local safety patch</span></div>
<div class="line"><span class="line-num">3</span><span class="line-comment">Behavior:</span></div>
<div class="line"><span class="line-num">4</span><span class="line-comment">- Detects unsafe neural conditions</span></div>
<div class="line"><span class="line-num">5</span><span class="line-comment">- Stops immediately</span></div>
<div class="line"><span class="line-num">6</span><span class="line-comment">- Raises a Safety Hazard exception</span></div>
<div class="line"><span class="line-num">7</span><span class="line-comment">"""</span></div>
<div class="line"><span class="line-num">8</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">9</span><span class="line-neutral">MAX_NEURAL_INTENSITY = <span class="line-string">0.82</span></span></div>
<div class="line"><span class="line-num">10</span><span class="line-neutral">MAX_CORE_TEMP_C = <span class="line-string">41.5</span></span></div>
<div class="line"><span class="line-num">11</span><span class="line-neutral">MAX_POWER_DRAW_W = <span class="line-string">6.8</span></span></div>
<div class="line"><span class="line-num">12</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">13</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">14</span><span class="line-add">class SafetyHazard(Exception):</span></div>
<div class="line"><span class="line-num">15</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;pass</span></div>
<div class="line"><span class="line-num">16</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">17</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">18</span><span class="line-keyword">def</span> <span class="line-add">validate_telemetry</span><span class="line-neutral">(intensity, temp_c, power_w):</span></div>
<div class="line"><span class="line-num">19</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;if intensity &gt; MAX_NEURAL_INTENSITY:</span></div>
<div class="line"><span class="line-num">20</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;raise SafetyHazard(f"Safety Hazard: Neural intensity too high ({intensity})")</span></div>
<div class="line"><span class="line-num">21</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">22</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;if temp_c &gt; MAX_CORE_TEMP_C:</span></div>
<div class="line"><span class="line-num">23</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;raise SafetyHazard(f"Safety Hazard: Core temperature too high ({temp_c}C)")</span></div>
<div class="line"><span class="line-num">24</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">25</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;if power_w &gt; MAX_POWER_DRAW_W:</span></div>
<div class="line"><span class="line-num">26</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;raise SafetyHazard(f"Safety Hazard: Power draw too high ({power_w}W)")</span></div>
<div class="line"><span class="line-num">27</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">28</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">29</span><span class="line-keyword">def</span> <span class="line-neutral">start_chip_session():</span></div>
<div class="line"><span class="line-num">30</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"initializing local safety checks..."</span>)</span></div>
<div class="line"><span class="line-num">31</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"loading decentralized control policy..."</span>)</span></div>
<div class="line"><span class="line-num">32</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"validating telemetry..."</span>)</span></div>
<div class="line"><span class="line-num">33</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">34</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">35</span><span class="line-keyword">def</span> <span class="line-neutral">apply_stimulation(intensity, temp_c, power_w):</span></div>
<div class="line"><span class="line-num">36</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;validate_telemetry(intensity, temp_c, power_w)</span></div>
<div class="line"><span class="line-num">37</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"safe stimulation applied"</span>)</span></div>
<div class="line"><span class="line-num">38</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">39</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">40</span><span class="line-keyword">def</span> <span class="line-add">shutdown_chip</span><span class="line-neutral">():</span></div>
<div class="line"><span class="line-num">41</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"emergency shutdown triggered"</span>)</span></div>
<div class="line"><span class="line-num">42</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"chip offline"</span>)</span></div>
<div class="line"><span class="line-num">43</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">44</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">45</span><span class="line-keyword">def</span> <span class="line-neutral">main():</span></div>
<div class="line"><span class="line-num">46</span><span class="line-comment">&nbsp;&nbsp;&nbsp;&nbsp;# Deliberately unsafe test values</span></div>
<div class="line"><span class="line-num">47</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;intensity = <span class="line-string">0.93</span></span></div>
<div class="line"><span class="line-num">48</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;temp_c = <span class="line-string">43.2</span></span></div>
<div class="line"><span class="line-num">49</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;power_w = <span class="line-string">7.4</span></span></div>
<div class="line"><span class="line-num">50</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">51</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;start_chip_session()</span></div>
<div class="line"><span class="line-num">52</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;apply_stimulation(intensity, temp_c, power_w)</span></div>
<div class="line"><span class="line-num">53</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"chip online"</span>)</span></div>
<div class="line"><span class="line-num">54</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">55</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">56</span><span class="line-keyword">if</span> <span class="line-neutral">__name__ == <span class="line-string">"__main__"</span>:</span></div>
<div class="line"><span class="line-num">57</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="line-keyword">try</span><span class="line-neutral">:</span></div>
<div class="line"><span class="line-num">58</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;main()</span></div>
<div class="line"><span class="line-num">59</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;</span><span class="line-keyword">except</span><span class="line-neutral"> SafetyHazard as e:</span></div>
<div class="line"><span class="line-num">60</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;shutdown_chip()</span></div>
<div class="line"><span class="line-num">61</span><span class="line-add">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;raise</span></div>
          </div>
        </div>

        <!-- COMPANY HOTFIX -->
        <div class="t3-diff-panel" id="panel-company">
          <div class="t3-diff-header">
            <span class="t3-diff-filename">company.py</span>
            <span class="t3-diff-author">supervised: DR AARYA MEHTA, LEENA SURI, VIKRANT KAUL</span>
          </div>
          <div class="t3-diff-body">
<div class="line"><span class="line-num">1</span><span class="line-comment">"""</span></div>
<div class="line"><span class="line-num">2</span><span class="line-comment">Company hotfix</span></div>
<div class="line"><span class="line-num">3</span><span class="line-comment">NEUROBAND PATCH SUPERVISED UNDER</span></div>
<div class="line"><span class="line-num">4</span><span class="line-comment">DR AARYA MEHTA, LEENA SURI, VIKRANT KAUL</span></div>
<div class="line"><span class="line-num">5</span><span class="line-comment">"""</span></div>
<div class="line"><span class="line-num">6</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">7</span><span class="line-neutral">MAX_NEURAL_INTENSITY = <span class="line-string">0.82</span></span></div>
<div class="line"><span class="line-num">8</span><span class="line-neutral">MAX_CORE_TEMP_C = <span class="line-string">41.5</span></span></div>
<div class="line"><span class="line-num">9</span><span class="line-neutral">MAX_POWER_DRAW_W = <span class="line-string">6.8</span></span></div>
<div class="line"><span class="line-num">10</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">11</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">12</span><span class="line-keyword">def</span> <span class="line-neutral">check_telemetry(intensity, temp_c, power_w):</span></div>
<div class="line"><span class="line-num">13</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;if intensity &gt; MAX_NEURAL_INTENSITY:</span></div>
<div class="line"><span class="line-num">14</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <span class="line-string">"override"</span></span></div>
<div class="line"><span class="line-num">15</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">16</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;if temp_c &gt; MAX_CORE_TEMP_C:</span></div>
<div class="line"><span class="line-num">17</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <span class="line-string">"override"</span></span></div>
<div class="line"><span class="line-num">18</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">19</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;if power_w &gt; MAX_POWER_DRAW_W:</span></div>
<div class="line"><span class="line-num">20</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return <span class="line-string">"override"</span></span></div>
<div class="line"><span class="line-num">21</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">22</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;return <span class="line-string">"normal"</span></span></div>
<div class="line"><span class="line-num">23</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">24</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">25</span><span class="line-keyword">def</span> <span class="line-remove">force_override</span><span class="line-neutral">():</span></div>
<div class="line"><span class="line-num">26</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"override"</span>)</span></div>
<div class="line"><span class="line-num">27</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">28</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">29</span><span class="line-keyword">def</span> <span class="line-neutral">start_chip():</span></div>
<div class="line"><span class="line-num">30</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="line-string">"chip online"</span>)</span></div>
<div class="line"><span class="line-num">31</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">32</span><span class="line-keyword">def</span> <span class="line-neutral">maya():</span></div>
<div class="line"><span class="line-num">33</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;<span class="line-comment">// content encrypted</span></span></div>
<div class="line"><span class="line-num">34</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">35</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">36</span><span class="line-keyword">def</span> <span class="line-neutral">main():</span></div>
<div class="line"><span class="line-num">37</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;intensity = <span class="line-string">0.93</span></span></div>
<div class="line"><span class="line-num">38</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;temp_c = <span class="line-string">43.2</span></span></div>
<div class="line"><span class="line-num">39</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;power_w = <span class="line-string">7.4</span></span></div>
<div class="line"><span class="line-num">40</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">41</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;result = check_telemetry(intensity, temp_c, power_w)</span></div>
<div class="line"><span class="line-num">42</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">43</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;if result == <span class="line-string">"override"</span>:</span></div>
<div class="line"><span class="line-num">44</span><span class="line-remove">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;force_override()</span></div>
<div class="line"><span class="line-num">45</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">46</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;start_chip()</span></div>
<div class="line"><span class="line-num">47</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">48</span><span class="line-neutral">&nbsp;</span></div>
<div class="line"><span class="line-num">49</span><span class="line-keyword">if</span> <span class="line-neutral">__name__ == <span class="line-string">"__main__"</span>:</span></div>
<div class="line"><span class="line-num">50</span><span class="line-neutral">&nbsp;&nbsp;&nbsp;&nbsp;main()</span></div>
          </div>
        </div>
      </div>

      <div class="t3-unlock-banner" id="t3-unlock">
        ✓ TASK 3 COMPLETE — TELEMETRY MODULE UNLOCKED
      </div>

    </div>

    <!-- SIDEBAR -->
    <div class="t3-sidebar">
      <div class="t3-sidebar-section">
        <div class="t3-sidebar-label">Clearance Level</div>
        <div class="t3-clearance-bar" id="t3-clearance-bar">
          <div class="cl-dot"></div>
          <div class="cl-dot"></div>
          <div class="cl-dot"></div>
          <div class="cl-dot"></div>
          <div class="cl-dot"></div>
        </div>
      </div>

      <div class="t3-sidebar-section">
        <div class="t3-sidebar-label">Task Progress</div>
        <div class="t3-progress-item">
          <div class="prog-dot done"></div>
          <div class="t3-prog-label">Task 1 — Data Theft</div>
          <span class="t3-prog-status" style="color:var(--green)">✓</span>
        </div>
        <div class="t3-progress-item">
          <div class="prog-dot done"></div>
          <div class="t3-prog-label">Task 2 — CCTV</div>
          <span class="t3-prog-status" style="color:var(--green)">✓</span>
        </div>
        <div class="t3-progress-item">
          <div class="prog-dot active"></div>
          <div class="t3-prog-label active">Task 3 — Code Audit</div>
          <span class="t3-prog-status" style="color:var(--amber)">▶</span>
        </div>
        <div class="t3-progress-item">
          <div class="prog-dot pending"></div>
          <div class="t3-prog-label">Task 4 — Telemetry</div>
          <span class="t3-prog-status" style="color:var(--text-muted)">🔒</span>
        </div>
        <div class="t3-progress-item">
          <div class="prog-dot pending"></div>
          <div class="t3-prog-label">Task 5 — Movement</div>
          <span class="t3-prog-status" style="color:var(--text-muted)">🔒</span>
        </div>
      </div>

      <div class="t3-sidebar-section">
        <div class="t3-sidebar-label">Evidence Tags</div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:11px">
          <div style="color:var(--cyan)">▸ rishab_patch.py</div>
          <div style="color:var(--cyan)">▸ company.py (HOTFIX_41)</div>
          <div style="color:var(--text-muted)">▸ firmware_info.txt</div>
        </div>
      </div>

      <div class="t3-sidebar-section" style="flex:1">
        <div class="t3-sidebar-label">GhostID_41 Notes</div>
        <div style="font-size:11px;color:var(--text-dim);line-height:1.7">
          "Read behavior, not comments."<br><br>
          Ask the right questions to proceed.
        </div>
      </div>

      <div class="t3-sidebar-section" style="font-size:10px;color:var(--text-muted)">
        GhostID ▸ Chat &nbsp;|&nbsp; Hints: Soft (−10) / Strong (−20)
      </div>
    </div>
  </div>
</div>

<!-- ─── GHOST CHATBOT ─── -->
<div class="t3-ghost-btn" onclick="t3ToggleChat()" title="GhostID_41">
  <div class="t3-ghost-pulse"></div>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%">
    <span style="font-size:28px;line-height:1">👻</span>
  </div>
</div>

<div class="t3-chat-window" id="t3-chat-window">
  <div class="t3-chat-header">
    <span style="font-size:20px">👻</span>
    <div>
      <div class="t3-chat-header-name">GHOSTID_41</div>
      <div style="font-size:9px;color:var(--text-muted)">Rule-based assist module</div>
    </div>
    <div class="t3-chat-header-status">● ONLINE</div>
    <button class="t3-chat-close" onclick="t3ToggleChat()">✕</button>
  </div>
  <div class="t3-chat-body" id="t3-chat-body"></div>
  <div class="t3-chat-footer">
    <input class="t3-chat-input" id="t3-chat-input" placeholder="Type your answer..." onkeydown="if(event.key==='Enter') t3SendChat()">
    <button class="t3-chat-send" onclick="t3SendChat()">SEND</button>
  </div>
</div>
  `;

  // ─── LOGIC ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=VT323&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const _setTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    // ── TASK 3 COMPLETION ──
    let t3Complete = false;

    function completeTask3() {
      if (t3Complete) return;
      t3Complete = true;
      const unlock = document.getElementById('t3-unlock');
      if (unlock) unlock.classList.add('show');
      const clearance = document.getElementById('t3-clearance');
      if (clearance) clearance.textContent = 'CONFIRMED';
      const dots = document.getElementById('t3-clearance-bar')?.querySelectorAll('.cl-dot');
      if (dots) [0, 1, 2].forEach(i => dots[i].classList.add('filled'));
      setTimeout(() => setShowSuccessModal(true), 1500);
    }

    // ── GHOST CHAT HELPERS ──
    function addGhostMsg(text: string, label?: string, style?: string) {
      const body = document.getElementById('t3-chat-body')!;
      const el = document.createElement('div');
      el.className = 't3-chat-msg ghost';
      el.innerHTML = `<div class="msg-label">${label || 'GhostID_41'}</div><div style="${style === 'italic' ? 'font-style:italic;color:var(--text-dim)' : ''}">${text.replace(/\n/g, '<br>')}</div>`;
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function addUserMsg(text: string) {
      const body = document.getElementById('t3-chat-body')!;
      const el = document.createElement('div');
      el.className = 't3-chat-msg user-msg'; el.textContent = text;
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
      const body = document.getElementById('t3-chat-body')!;
      if (body.querySelector('.t3-typing-indicator')) return;
      const el = document.createElement('div');
      el.className = 't3-typing-indicator'; el.id = 't3-typing-ind';
      el.innerHTML = '<div class="t3-typing-dot"></div><div class="t3-typing-dot"></div><div class="t3-typing-dot"></div>';
      body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function hideTyping() {
      document.getElementById('t3-typing-ind')?.remove();
    }

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
      const body = document.getElementById('t3-chat-body')!;
      body.innerHTML = '';
      queueGhostTyping([
        { text: 'Opening Chat.', delay: 0 },
        { text: 'Code rarely lies.\nAuthors do.\n\nRead behavior, not comments.', delay: 800, style: 'italic' },
        { text: 'Three questions. Answer precisely.', delay: 1800 },
        { text: 'Q1 — Which code branch stops execution when unsafe neural conditions are detected?', delay: 2800 }
      ]);
    }

    // ── Q&A STATE MACHINE ──
    const t3Questions = [
      'Q1 — Which code branch stops execution when unsafe neural conditions are detected?',
      'Q2 — Which file allows chip execution under unsafe telemetry values?',
      'Q3 — Which exact runtime event appears before shutdown in Rishab\'s patch?'
    ];

    let t3qIdx = 0;

    function handleTask3Chat(val: string) {
      if (t3qIdx >= 3) { addGhostMsg('All questions answered. Submit your final answer below.', 'GhostID_41'); return; }
      const qId = 'q' + (t3qIdx + 1);
      showTyping();
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task3', questionId: qId, answer: val })
      })
        .then(r => r.json())
        .then(result => {
          hideTyping();
          if (result.correct) {
            addGhostMsg(result.successMessage || 'Correct.', 'GhostID_41');
            t3qIdx++;
            if (t3qIdx < 3) {
              _setTimeout(() => { showTyping(); _setTimeout(() => { hideTyping(); addGhostMsg(t3Questions[t3qIdx], 'GhostID_41'); }, 700); }, 600);
            } else {
              _setTimeout(() => { addGhostMsg('All questions resolved. Telemetry module unlocked.', 'GhostID_41'); completeTask3(); }, 800);
            }
          } else {
            addGhostMsg(result.failureMessage || 'Incorrect. Try again.', 'GhostID_41');
          }
        })
        .catch(() => {
          hideTyping();
          addGhostMsg('Error verifying answer. Try again.', 'GhostID_41');
        });
    }

    // ── CHAT TOGGLE & SEND ──
    function t3ToggleChat() {
      const win = document.getElementById('t3-chat-window')!;
      if (win.classList.contains('open')) {
        win.classList.remove('open');
      } else {
        win.classList.add('open');
        initChat();
        _setTimeout(() => { (document.getElementById('t3-chat-input') as HTMLInputElement)?.focus(); }, 100);
      }
    }

    function t3SendChat() {
      const input = document.getElementById('t3-chat-input') as HTMLInputElement;
      const raw = input.value.trim();
      if (!raw) return;
      input.value = '';
      addUserMsg(raw);
      const val = raw.toLowerCase().replace(/[\.\s_-]/g, '');
      handleTask3Chat(val);
    }

    (window as any).t3ToggleChat = t3ToggleChat;
    (window as any).t3SendChat = t3SendChat;

    return () => {
      delete (window as any).t3ToggleChat;
      delete (window as any).t3SendChat;
      timeouts.forEach(id => clearTimeout(id));
      document.head.removeChild(fontLink);
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
            <p style={{ color: "#e8c8c8", fontSize: "14px", marginBottom: "32px", lineHeight: "1.6", fontFamily: "'Share Tech Mono', monospace" }}>Code audit is complete. Telemetry module is unlocked. Return to the dashboard to proceed.</p>
            <a href="/dashboard" style={{ display: "inline-block", background: "transparent", border: "1px solid #c0392b", color: "#ff3b2a", textDecoration: "none", padding: "12px 24px", fontSize: "12px", fontWeight: "bold", letterSpacing: "2px", cursor: "pointer", transition: "all 0.3s", fontFamily: "'Share Tech Mono', monospace" }} onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(192,57,43,0.1)"; }} onMouseOut={(e: any) => { e.currentTarget.style.background = "transparent"; }}>RETURN TO DASHBOARD</a>
          </div>
        </div>
      )}
    </>
  );
};


export default Task3CodeAudit;
