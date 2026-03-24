'use client'
// @ts-nocheck
import React, { useEffect } from 'react';

// ─── All HTML & CSS is kept verbatim from the original file. ─────────────────
// Only the <script> block has been moved into the useEffect below as TypeScript.
const HTML = `
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  :root {
    --red: #cc0000;
    --red-bright: #ff2222;
    --red-dim: #660000;
    --red-glow: rgba(204,0,0,0.3);
    --bg: #0a0505;
    --bg2: #110808;
    --bg3: #1a0a0a;
    --text: #e8d5d5;
    --text-dim: #9a7070;
    --cyan: #00ffcc;
    --green: #00ff88;
    --border: rgba(204,0,0,0.4);
    --border-active: rgba(204,0,0,0.9);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    min-height: 100vh;
    overflow: hidden;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed; inset: 0;
    background: 
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px),
      radial-gradient(ellipse at 20% 50%, rgba(120,0,0,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(80,0,0,0.1) 0%, transparent 50%);
    pointer-events: none; z-index: 0;
  }

  .noise {
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.4;
  }

  .console-wrapper {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex; flex-direction: column; gap: 14px;
  }

  /* HEADER */
  .header {
    border: 1px solid var(--border-active);
    background: linear-gradient(135deg, var(--bg2), var(--bg3));
    padding: 14px 20px;
    position: relative;
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
    box-shadow: 0 0 30px var(--red-glow), inset 0 0 20px rgba(200,0,0,0.05);
  }
  .header::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--red-bright), transparent);
    animation: scanH 3s linear infinite;
  }
  @keyframes scanH { 0%{opacity:0.3} 50%{opacity:1} 100%{opacity:0.3} }

  .header-title {
    display: flex; align-items: center; gap: 14px;
  }
  .alert-icon {
    width: 36px; height: 36px;
    border: 2px solid var(--red-bright);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: var(--red-bright);
    animation: pulse 2s ease-in-out infinite;
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    background: rgba(200,0,0,0.1);
  }
  @keyframes pulse { 0%,100%{box-shadow:0 0 5px var(--red-bright)} 50%{box-shadow:0 0 20px var(--red-bright), 0 0 40px var(--red-glow)} }

  .title-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 22px; font-weight: 900;
    letter-spacing: 4px;
    text-shadow: 0 0 20px var(--red-bright);
    color: #fff;
  }
  .online-badge {
    margin-left: auto;
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: 2px; color: var(--green);
  }
  .online-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 10px var(--green);
    animation: blink 1.5s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .clearance-row {
    margin-top: 10px;
    display: flex; align-items: center; gap: 12px;
    font-size: 12px; color: var(--text-dim); letter-spacing: 2px;
  }
  .clearance-boxes {
    display: flex; gap: 4px;
  }
  .cbox {
    width: 22px; height: 18px;
    border: 1px solid var(--red-dim);
    background: transparent;
    transition: all 0.5s;
  }
  .cbox.active {
    background: var(--red);
    box-shadow: 0 0 10px var(--red-bright);
    border-color: var(--red-bright);
  }

  /* MAIN BODY */
  .main-body {
    display: flex; gap: 14px;
    flex: 1; overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: 220px; flex-shrink: 0;
    border: 1px solid var(--border);
    background: var(--bg2);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .sidebar-header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700; font-size: 13px;
    letter-spacing: 2px; color: var(--text-dim);
  }
  .module-btn {
    padding: 14px 16px;
    border: none; border-bottom: 1px dashed rgba(150,50,50,0.3);
    background: transparent;
    color: var(--text-dim);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    text-align: left;
    cursor: not-allowed;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.3s;
    position: relative;
  }
  .module-btn.unlocked {
    cursor: pointer; color: var(--text);
  }
  .module-btn.unlocked:hover {
    background: rgba(200,0,0,0.1);
    color: #fff;
  }
  .module-btn.active {
    background: rgba(200,0,0,0.2);
    color: var(--red-bright);
    border-left: 3px solid var(--red-bright);
  }
  .module-btn.active::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
    background: var(--red-bright);
    box-shadow: 0 0 8px var(--red-bright);
  }
  .lock-icon { font-size: 13px; opacity: 0.4; }
  .module-btn.unlocked .lock-icon { opacity: 0.7; }
  .module-btn.active .lock-icon { opacity: 1; color: var(--red-bright); }

  /* CONTENT AREA */
  .content-area {
    flex: 1;
    border: 1px solid var(--border);
    background: var(--bg2);
    position: relative;
    overflow: hidden;
  }

  .task-panel {
    position: absolute; inset: 0;
    display: none;
    flex-direction: column;
    animation: fadeIn 0.4s ease;
  }
  .task-panel.active { display: flex; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .panel-header {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    font-family: 'Orbitron', sans-serif;
    font-size: 13px; letter-spacing: 3px;
    background: linear-gradient(90deg, rgba(200,0,0,0.15), transparent);
    color: var(--red-bright);
    display: flex; align-items: center; gap: 10px;
  }
  .panel-header::before {
    content: '[ ';
  }
  .panel-header::after {
    content: ' ]';
  }

  /* ===== TASK 1: BADGE LOGS ===== */
  .logs-container {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
  }
  .log-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .log-table th {
    padding: 8px 12px;
    text-align: left;
    font-family: 'Rajdhani', sans-serif;
    font-size: 11px; letter-spacing: 2px;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
  }
  .log-table td {
    padding: 7px 12px;
    border-bottom: 1px dashed rgba(100,30,30,0.3);
    font-size: 11px;
  }
  .log-table tr:hover td { background: rgba(200,0,0,0.05); }
  .log-table tr.highlight td {
    color: var(--red-bright);
    background: rgba(200,0,0,0.08);
  }
  .entry { color: #88cc88; }
  .exit { color: #cc8888; }
  .no-exit { color: var(--red-bright); font-weight: bold; }

  .question-box {
    margin: 14px 16px;
    border: 1px solid var(--border-active);
    background: rgba(10,0,0,0.5);
    padding: 16px;
  }
  .question-text {
    font-size: 13px; margin-bottom: 14px;
    line-height: 1.6;
    color: var(--text);
  }
  .question-text span { color: var(--red-bright); }
  .options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .option-label {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; font-size: 12px;
    padding: 8px 12px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  .option-label:hover { border-color: var(--border); background: rgba(200,0,0,0.05); }
  .option-label input[type=radio] { accent-color: var(--red-bright); }
  .option-label.selected { border-color: var(--red-bright); background: rgba(200,0,0,0.1); color: var(--red-bright); }

  .submit-btn {
    background: transparent;
    border: 1px solid var(--red-bright);
    color: var(--red-bright);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px; letter-spacing: 2px;
    padding: 10px 24px;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .submit-btn:hover {
    background: var(--red);
    color: #fff;
    box-shadow: 0 0 20px var(--red-glow);
  }

  .feedback-msg {
    margin-top: 10px;
    font-size: 12px; padding: 8px 12px;
    display: none;
  }
  .feedback-msg.correct { color: var(--green); border: 1px solid var(--green); background: rgba(0,255,100,0.05); }
  .feedback-msg.wrong { color: var(--red-bright); border: 1px solid var(--red-bright); background: rgba(200,0,0,0.1); }

  /* ===== TASK 2: ELEVATOR ANALYTICS ===== */
  .elevator-layout {
    display: flex; gap: 16px;
    padding: 16px; flex: 1; overflow: hidden;
  }
  .elevator-left {
    flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto;
  }
  .elevator-right {
    width: 320px; display: flex; flex-direction: column; gap: 12px;
  }

  .drag-items-label {
    font-size: 11px; color: var(--text-dim); letter-spacing: 1px; margin-bottom: 6px;
  }
  .drag-items {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .drag-item {
    padding: 7px 14px;
    border: 1px solid var(--red-dim);
    background: rgba(80,0,0,0.3);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px; letter-spacing: 1px;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
  }
  .drag-item:active { cursor: grabbing; }
  .drag-item:hover {
    border-color: var(--red-bright);
    background: rgba(150,0,0,0.3);
    box-shadow: 0 0 10px var(--red-glow);
  }
  .drag-item.dragging { opacity: 0.3; }
  .drag-item.used { opacity: 0.2; cursor: not-allowed; }

  .elevator-drop-zone {
    border: 2px dashed var(--border);
    background: rgba(5,0,0,0.5);
    min-height: 100px;
    display: flex; flex-wrap: wrap;
    align-items: flex-start; align-content: flex-start;
    gap: 6px; padding: 10px;
    transition: all 0.2s;
    position: relative;
  }
  .elevator-drop-zone.drag-over {
    border-color: var(--red-bright);
    background: rgba(100,0,0,0.2);
    box-shadow: inset 0 0 20px var(--red-glow);
  }
  .elevator-drop-zone::before {
    content: 'ELEVATOR PLATFORM';
    position: absolute; bottom: 6px; right: 8px;
    font-size: 9px; color: rgba(150,50,50,0.4); letter-spacing: 2px;
  }
  .dropped-item {
    padding: 5px 10px;
    background: rgba(150,0,0,0.4);
    border: 1px solid var(--red);
    font-size: 10px; color: var(--text);
    cursor: pointer; position: relative;
  }
  .dropped-item::after { content: ' x'; color: var(--red-bright); }
  .dropped-item:hover { background: rgba(200,0,0,0.5); }

  .analyze-btn {
    background: transparent;
    border: 1px solid var(--red-bright);
    color: var(--red-bright);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px; letter-spacing: 2px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }
  .analyze-btn:hover { background: var(--red); color: #fff; }

  .section-label {
    font-family: 'Rajdhani', sans-serif;
    font-size: 11px; letter-spacing: 2px;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    padding-bottom: 4px; margin-bottom: 8px;
  }

  /* TELEMETRY GRAPH - rendered in popup */
  .graph-meta { font-size: 10px; color: var(--text-dim); margin-bottom: 8px; }
  .graph-tooltip {
    position: absolute;
    background: rgba(10,5,5,0.95);
    border: 1px solid rgba(0,255,200,0.5);
    padding: 6px 10px; font-size: 10px;
    color: var(--cyan); pointer-events: none;
    display: none; z-index: 10; letter-spacing: 1px;
    max-width: 200px; line-height: 1.5;
  }

  /* TELEMETRY POPUP */
  .tele-popup-bg {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.78);
    display: none; align-items: center; justify-content: center;
    z-index: 80; backdrop-filter: blur(3px);
  }
  .tele-popup-bg.open { display: flex; animation: fadeIn 0.3s ease; }
  .tele-popup {
    background: linear-gradient(160deg, #080c10, #060a0e);
    border: 1px solid rgba(0,255,200,0.35);
    border-radius: 4px;
    padding: 24px 26px 20px;
    width: 580px; max-width: 94vw;
    box-shadow: 0 0 60px rgba(0,200,150,0.12), 0 0 120px rgba(0,0,0,0.8);
    position: relative;
    animation: modalIn 0.35s cubic-bezier(.22,.68,0,1.15);
  }
  .tele-popup-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .tele-popup-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px; letter-spacing: 3px;
    color: rgba(0,255,200,0.85);
  }
  .tele-popup-meta {
    font-size: 10px; color: var(--text-dim); margin-bottom: 10px; letter-spacing: 0.5px;
  }
  .tele-popup-close {
    background: transparent;
    border: 1px solid rgba(150,50,50,0.45);
    color: rgba(200,100,100,0.6);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; padding: 5px 12px;
    cursor: pointer; transition: all 0.2s;
  }
  .tele-popup-close:hover { background: rgba(100,0,0,0.3); color: #ff8888; }
  .tele-popup-canvas-wrap { position: relative; }
  .tele-popup-labels {
    display: flex; justify-content: space-between;
    font-size: 9px; color: var(--text-dim);
    margin-top: 4px; padding: 0 2px;
  }
  .tele-popup-legend {
    margin-top: 14px; font-size: 10px; color: var(--text-dim);
    line-height: 1.9; border-top: 1px dashed rgba(0,200,150,0.2);
    padding-top: 10px;
  }
  .tele-popup-legend span { color: var(--cyan); }
  canvas#telemetryChart { width: 100%; cursor: crosshair; }

  .sys-analysis {
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--border);
    padding: 12px;
  }
  .sys-analysis-text { font-size: 11px; line-height: 1.7; }
  .sys-analysis-text .val { color: var(--cyan); }
  .confidence { color: var(--green); }
  .analyze-btn:disabled {
    opacity: 0.3; cursor: not-allowed; border-color: var(--red-dim);
    color: var(--red-dim);
  }
  .analyze-btn.ready {
    border-color: var(--cyan); color: var(--cyan);
    box-shadow: 0 0 12px rgba(0,255,200,0.2);
    animation: btnPulse 2s ease-in-out infinite;
  }
  @keyframes btnPulse {
    0%,100%{box-shadow:0 0 8px rgba(0,255,200,0.2)}
    50%{box-shadow:0 0 20px rgba(0,255,200,0.5)}
  }

  /* ghost41_id FLOATING BUTTON */
  .ghost-float-btn {
    position: absolute;
    bottom: 10px; right: 10px;
    width: 90px; height: 90px;
    cursor: pointer;
    z-index: 6;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(0,255,200,0.55));
    transition: filter 0.2s;
    display: block;
  }
  .ghost-float-btn:hover { filter: drop-shadow(0 0 20px rgba(0,255,200,0.9)) brightness(1.1); transform: scale(1.05); }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .ghost-bubble {
    position: absolute;
    bottom: 105px; right: 10px;
    background: rgba(20,20,30,0.95);
    border: 1px solid rgba(100,180,255,0.4);
    border-radius: 6px 6px 0 6px;
    padding: 5px 9px;
    font-size: 9px; color: #aaccff;
    white-space: nowrap; letter-spacing: 1px;
    pointer-events: none;
    animation: bubblePulse 3s ease-in-out infinite;
  }
  @keyframes bubblePulse { 0%,100%{opacity:0.6} 50%{opacity:1} }

  /* CHATBOT MODAL OVERLAY */
  /* CHAT PANEL */
  .chat-panel {
    position: fixed;
    top: 0; right: -420px;
    width: 380px;
    height: 100vh;
    background: linear-gradient(170deg, #080c14, #0a0f1a);
    border-left: 1px solid rgba(80,160,255,0.35);
    display: flex; flex-direction: column;
    z-index: 100;
    transition: right 0.35s cubic-bezier(.22,.68,0,1.1);
    box-shadow: -8px 0 40px rgba(30,80,200,0.18), -2px 0 0 rgba(80,160,255,0.08);
  }
  .chat-panel.open { right: 0; }

  .chat-panel-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(80,160,255,0.2);
    background: rgba(10,20,40,0.6);
    flex-shrink: 0;
  }
  .chat-panel-ghost {
    width: 52px; height: 52px;
    filter: drop-shadow(0 0 8px rgba(0,255,200,0.5));
    animation: float 3s ease-in-out infinite;
    flex-shrink: 0;
    display: block;
  }
  .chat-panel-info { flex: 1; }
  .chat-panel-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px; letter-spacing: 2.5px;
    color: rgba(100,180,255,0.9);
  }
  .chat-panel-status {
    font-size: 9px; color: rgba(80,160,255,0.4);
    letter-spacing: 1px; margin-top: 2px;
  }
  .chat-panel-close {
    background: transparent;
    border: 1px solid rgba(150,50,50,0.4);
    color: rgba(200,100,100,0.55);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; padding: 5px 10px;
    cursor: pointer; transition: all 0.2s;
    flex-shrink: 0;
  }
  .chat-panel-close:hover { background: rgba(100,0,0,0.25); color: #ff8888; }

  .chat-messages {
    flex: 1; overflow-y: auto;
    padding: 14px 14px 8px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(80,160,255,0.2) transparent;
  }
  .chat-messages::-webkit-scrollbar { width: 4px; }
  .chat-messages::-webkit-scrollbar-track { background: transparent; }
  .chat-messages::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.2); border-radius: 2px; }

  .chat-msg {
    max-width: 90%;
    font-family: 'Share Tech Mono', monospace;
    font-size: 11.5px;
    line-height: 1.65;
    padding: 10px 13px;
    animation: msgIn 0.25s ease;
  }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  .chat-msg-ghost {
    align-self: flex-start;
    background: rgba(20,40,80,0.55);
    border: 1px solid rgba(80,160,255,0.2);
    border-radius: 2px 12px 12px 12px;
    color: var(--text);
  }
  .chat-msg-ghost span { color: rgba(100,200,255,0.9); }
  .chat-msg-ghost .chat-label {
    font-size: 9px; letter-spacing: 2px;
    color: rgba(80,160,255,0.45);
    margin-bottom: 5px;
    font-family: 'Rajdhani', sans-serif;
  }
  .chat-msg-user {
    align-self: flex-end;
    background: rgba(0,40,20,0.5);
    border: 1px solid rgba(0,150,80,0.25);
    border-radius: 12px 2px 12px 12px;
    color: rgba(140,220,160,0.9);
  }
  .chat-msg-feedback-ok {
    align-self: flex-start;
    background: rgba(0,60,30,0.4);
    border: 1px solid rgba(0,200,100,0.3);
    border-radius: 2px 12px 12px 12px;
    color: var(--green);
  }
  .chat-msg-feedback-err {
    align-self: flex-start;
    background: rgba(60,0,0,0.3);
    border: 1px solid rgba(200,0,0,0.25);
    border-radius: 2px 12px 12px 12px;
    color: #ff8888;
  }
  .chat-typing {
    align-self: flex-start;
    background: rgba(20,40,80,0.4);
    border: 1px solid rgba(80,160,255,0.15);
    border-radius: 2px 12px 12px 12px;
    padding: 10px 16px;
    display: flex; gap: 5px; align-items: center;
  }
  .chat-typing span {
    width: 6px; height: 6px;
    background: rgba(80,160,255,0.5);
    border-radius: 50%;
    animation: typingDot 1.2s ease-in-out infinite;
  }
  .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
  .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }

  .chat-input-area {
    padding: 10px 14px 14px;
    border-top: 1px solid rgba(80,160,255,0.15);
    background: rgba(5,10,25,0.5);
    display: flex; flex-direction: column; gap: 8px;
    flex-shrink: 0;
  }
  .chat-input {
    width: 100%;
    background: rgba(0,5,20,0.7);
    border: 1px solid rgba(80,160,255,0.3);
    border-bottom: 2px solid rgba(80,160,255,0.5);
    color: var(--text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    padding: 9px 12px;
    outline: none; border-radius: 2px;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
  }
  .chat-input:focus {
    border-color: rgba(80,160,255,0.65);
    box-shadow: 0 0 14px rgba(40,120,255,0.12);
  }
  .chat-input::placeholder { color: rgba(150,170,200,0.25); }
  .chat-input:disabled { opacity: 0.3; }
  .chat-send-btn {
    background: transparent;
    border: 1px solid rgba(80,160,255,0.55);
    color: rgba(100,180,255,0.9);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 2px;
    padding: 8px 16px;
    cursor: pointer; transition: all 0.2s;
    clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
    align-self: flex-end;
  }
  .chat-send-btn:hover { background: rgba(40,100,200,0.25); box-shadow: 0 0 14px rgba(40,120,255,0.25); }
  .chat-send-btn:disabled { opacity: 0.3; cursor: default; }

  /* SUCCESS OVERLAY */
  .success-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
    z-index: 10;
  }
  .success-overlay.show { display: flex; animation: fadeIn 0.5s ease; }
  .success-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 20px; font-weight: 900;
    color: var(--green);
    text-shadow: 0 0 30px var(--green);
    letter-spacing: 4px;
  }
  .success-sub { font-size: 12px; color: var(--text-dim); letter-spacing: 2px; }
  .continue-btn {
    background: transparent;
    border: 1px solid var(--green);
    color: var(--green);
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px; letter-spacing: 2px;
    padding: 10px 28px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .continue-btn:hover { background: rgba(0,255,100,0.1); }

  /* SYSTEM MESSAGE BAR */
  .sys-msg-bar {
    border: 1px solid var(--border);
    background: var(--bg2);
    padding: 10px 16px;
    font-size: 11px; color: var(--text-dim);
    display: flex; align-items: center; gap: 10px;
  }
  .sys-msg-bar .label {
    font-family: 'Rajdhani', sans-serif;
    font-size: 10px; letter-spacing: 2px;
    color: var(--red-bright); flex-shrink: 0;
  }
  #sysMsg { flex: 1; }
  .next-unlock { color: var(--text-dim); font-size: 10px; }
  .next-unlock span { color: var(--red-bright); }

  /* LOCKED SCREEN */
  .locked-screen {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 12px;
    z-index: 5;
  }
  .locked-icon { font-size: 48px; opacity: 0.3; }
  .locked-text { font-size: 13px; color: var(--text-dim); letter-spacing: 3px; }


  /* GLITCH EFFECTS */

  /* CRT scanline sweep */
  .crt-scan {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0,0,0,0.04) 50%
    );
    background-size: 100% 4px;
    animation: none;
  }
  .crt-scan::after {
    content: '';
    position: absolute; left: 0; right: 0; height: 120px;
    background: linear-gradient(to bottom,
      transparent 0%,
      rgba(255,30,30,0.03) 40%,
      rgba(255,30,30,0.06) 50%,
      rgba(255,30,30,0.03) 60%,
      transparent 100%
    );
    animation: scanSweep 5s linear infinite;
  }
  @keyframes scanSweep {
    0%   { top: -120px; }
    100% { top: 100vh; }
  }

  /* Vignette */
  .vignette {
    position: fixed; inset: 0; pointer-events: none; z-index: 9998;
    background: radial-gradient(ellipse at center,
      transparent 55%,
      rgba(0,0,0,0.55) 100%
    );
  }

  /* Glitch title */
  .glitch-title {
    position: relative;
    display: inline-block;
  }
  .glitch-title::before,
  .glitch-title::after {
    content: attr(data-text);
    position: absolute; inset: 0;
    font-family: inherit; font-size: inherit; font-weight: inherit;
    letter-spacing: inherit; color: inherit;
  }
  .glitch-title::before {
    color: #ff0040;
    animation: glitchTop 4s infinite linear;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
    text-shadow: -2px 0 cyan;
  }
  .glitch-title::after {
    color: #00ffee;
    animation: glitchBot 4s infinite linear;
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
    text-shadow: 2px 0 red;
  }
  @keyframes glitchTop {
    0%,90%,100% { transform: none; opacity: 0; }
    91%          { transform: translate(-3px, -2px) skewX(-2deg); opacity: 0.8; }
    93%          { transform: translate(3px, 0) skewX(2deg); opacity: 0.8; }
    95%          { transform: translate(-2px, 2px); opacity: 0.6; }
    97%          { transform: translate(2px, -1px) skewX(-1deg); opacity: 0.8; }
    99%          { transform: none; opacity: 0; }
  }
  @keyframes glitchBot {
    0%,88%,100% { transform: none; opacity: 0; }
    89%          { transform: translate(3px, 2px) skewX(3deg); opacity: 0.7; }
    91%          { transform: translate(-3px, 0); opacity: 0.7; }
    94%          { transform: translate(2px, -2px) skewX(-2deg); opacity: 0.5; }
    96%          { transform: none; opacity: 0; }
  }

  /* RGB split on panel headers */
  .panel-header.glitch-rgb {
    position: relative;
  }
  .panel-header.glitch-rgb::before {
    content: attr(data-text);
    position: absolute; inset: 0;
    padding: inherit;
    color: #ff0040; opacity: 0;
    animation: rgbSplit 6s infinite;
  }
  @keyframes rgbSplit {
    0%,94%,100% { opacity: 0; transform: none; }
    95% { opacity: 0.6; transform: translateX(-3px); }
    97% { opacity: 0.6; transform: translateX(3px); }
    99% { opacity: 0; transform: none; }
  }

  /* Screen flicker */
  @keyframes screenFlicker {
    0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }
    20%,24%,55% { opacity: 0.85; }
  }
  .console-wrapper { animation: screenFlicker 8s infinite; }

  /* Horizontal glitch bars */
  .glitch-bars {
    position: fixed; inset: 0; pointer-events: none; z-index: 9997;
    overflow: hidden;
  }
  .glitch-bar {
    position: absolute; left: 0; right: 0;
    background: rgba(255,0,40,0.07);
    height: 0;
    animation: glitchBarAnim 1s steps(1) forwards;
  }
  @keyframes glitchBarAnim {
    0%   { height: 0; }
    10%  { height: 4px; }
    20%  { height: 0; }
    30%  { height: 8px; }
    40%  { height: 0; }
    60%  { height: 3px; }
    80%  { height: 0; }
    100% { height: 0; }
  }

  /* Border flicker on content-area */
  .content-area {
    animation: borderFlicker 7s infinite;
  }
  @keyframes borderFlicker {
    0%,96%,100% { box-shadow: none; }
    97% { box-shadow: 0 0 0 1px var(--red-bright), 0 0 20px var(--red-glow); }
    98% { box-shadow: none; }
    99% { box-shadow: 0 0 0 1px var(--red-bright), 0 0 40px rgba(255,0,0,0.2); }
  }

  /* Data corruption text flash */
  .corrupt-flash {
    animation: corruptFlash 6s infinite;
  }
  @keyframes corruptFlash {
    0%,97%,100% { opacity: 1; }
    98%          { opacity: 0.3; letter-spacing: 8px; color: var(--red-bright); }
    99%          { opacity: 1; letter-spacing: 2px; }
  }

  /* Sidebar active item glitch */
  .module-btn.active {
    animation: sidebarGlitch 5s infinite;
  }
  @keyframes sidebarGlitch {
    0%,95%,100% { text-shadow: none; }
    96% { text-shadow: 2px 0 cyan, -2px 0 red; letter-spacing: 1px; }
    97% { text-shadow: none; }
    98% { text-shadow: -2px 0 cyan, 2px 0 red; }
    99% { text-shadow: none; }
  }

  /* Log table highlight row glitch */
  .log-table tr.highlight td {
    animation: rowFlash 3s infinite;
  }
  @keyframes rowFlash {
    0%,90%,100% { background: rgba(200,0,0,0.08); }
    92%          { background: rgba(255,0,0,0.25); text-shadow: 0 0 8px red; }
    94%          { background: rgba(200,0,0,0.08); }
  }

  /* Clearance box active pulse */
  .cbox.active {
    animation: cboxPulse 2s ease-in-out infinite, cboxGlitch 5s infinite;
  }
  @keyframes cboxGlitch {
    0%,93%,100% { transform: none; }
    94% { transform: translateX(2px) scaleY(1.1); }
    95% { transform: translateX(-2px); }
    96% { transform: none; }
  }

  /* Static noise overlay (animated) */
  .static-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 9996;
    opacity: 0;
    animation: staticBurst 9s infinite;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
  }
  @keyframes staticBurst {
    0%,88%,100% { opacity: 0; }
    89%          { opacity: 0.6; }
    90%          { opacity: 0; }
    91%          { opacity: 0.4; }
    92%          { opacity: 0; }
  }

  /* Alert icon extra glitch */
  .alert-icon {
    animation: pulse 2s ease-in-out infinite, alertGlitch 4s infinite !important;
  }
  @keyframes alertGlitch {
    0%,94%,100% { transform: none; filter: none; }
    95% { transform: skewX(10deg) scale(1.1); filter: hue-rotate(90deg); }
    96% { transform: skewX(-5deg); filter: none; }
    97% { transform: none; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--red-dim); }
  /* COLD STORAGE LOG TABLE */
  .log-table { font-family: 'Share Tech Mono', monospace; font-size: 10.5px; }
  .log-table td { padding: 4px 8px; border-bottom: 1px solid rgba(150,50,50,0.1); color: var(--text); vertical-align: top; }
  .log-table td:first-child { color: var(--text-dim); white-space: nowrap; }
  .cs-type { letter-spacing: 1px; font-size: 10px; white-space: nowrap; color: rgba(120,170,140,0.7); }
  .cs-flag { color: var(--cyan) !important; }
  .cs-alert { color: rgba(255,120,120,0.9) !important; }
  .cs-row-normal:hover td { background: rgba(0,50,30,0.15); }
  .cs-row-key td { background: rgba(0,40,30,0.25); }
  .cs-row-key:hover td { background: rgba(0,60,40,0.35); }
  .cs-row-alert td { background: rgba(60,0,0,0.2); }
  .cs-row-alert:hover td { background: rgba(80,0,0,0.35); }
  /* NEXT TASK BAR */
  .next-task-bar {
    display: none;
    align-items: center; justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid rgba(0,200,150,0.25);
    background: rgba(0,20,15,0.5);
    flex-shrink: 0;
    animation: fadeIn 0.4s ease;
  }
  .next-task-bar.visible { display: flex; }
  .next-task-bar .next-hint {
    font-size: 10px; color: rgba(0,200,150,0.6); letter-spacing: 1px;
  }
  .next-task-btn {
    background: transparent;
    border: 1px solid rgba(0,200,150,0.55);
    color: rgba(0,220,170,0.9);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 2px;
    padding: 8px 20px; cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
  }
  .next-task-btn:hover {
    background: rgba(0,150,100,0.2);
    box-shadow: 0 0 14px rgba(0,200,130,0.25);
  }
</style>

<div class="noise"></div>
<div class="crt-scan"></div>
<div class="vignette"></div>
<div class="glitch-bars" id="glitch-bars"></div>
<div class="static-overlay"></div>

<div class="console-wrapper">
  <!-- HEADER -->
  <div class="header">
    <div class="header-title">
      <div class="alert-icon">&#9888;</div>
      <div class="title-text glitch-title" data-text="INTERNAL OPERATIONS CONSOLE">INTERNAL OPERATIONS CONSOLE</div>
      <div class="online-badge"><div class="online-dot"></div> ONLINE</div>
    </div>
    <div class="clearance-row">
      Clearance level :
      <div class="clearance-boxes">
        <div class="cbox active" id="cb0"></div>
        <div class="cbox" id="cb1"></div>
        <div class="cbox" id="cb2"></div>
        <div class="cbox" id="cb3"></div>
        <div class="cbox" id="cb4"></div>
      </div>
    </div>
  </div>

  <!-- MAIN BODY -->
  <div class="main-body">
    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="sidebar-header corrupt-flash">MODULE ACCESS</div>
      <button class="module-btn active unlocked" id="btn-task1" onclick="showTask(1)">
        <span class="lock-icon">&#128275;</span> Badge &amp; Door Logs
      </button>
      <button class="module-btn" id="btn-task2" onclick="showTask(2)">
        <span class="lock-icon">&#128274;</span> Elevator Analytics
      </button>
      <button class="module-btn" id="btn-task3">
        <span class="lock-icon">&#128274;</span> Cold Storage
      </button>
    </div>

    <!-- CONTENT AREA -->
    <div class="content-area">

      <!-- ========== TASK 1: BADGE & DOOR LOGS ========== -->
      <div class="task-panel active" id="task1">
        <div class="panel-header glitch-rgb" data-text="BADGE &amp; DOOR LOGS - LAB 7 ACCESS RECORDS">BADGE &amp; DOOR LOGS - LAB 7 ACCESS RECORDS</div>
        <div class="logs-container">
          <table class="log-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>EMPLOYEE ID</th>
                <th>EMPLOYEE NAME</th>
                <th>ZONE</th>
                <th>EVENT</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>20:12:04</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 7</td><td class="entry">ENTRY</td></tr>
              <tr><td>20:44:18</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 7</td><td class="exit">EXIT</td></tr>
              <tr><td>21:18:42</td><td>SEC-02</td><td>Sec_Officer_02</td><td>Lab 7</td><td class="entry">ENTRY</td></tr>
              <tr><td>21:22:10</td><td>SEC-02</td><td>Sec_Officer_02</td><td>Lab 7</td><td class="exit">EXIT</td></tr>
              <tr><td>21:31:07</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 6</td><td class="entry">ENTRY</td></tr>
              <tr><td>21:36:22</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 6</td><td class="exit">EXIT</td></tr>
              <tr><td>21:44:58</td><td>EMP-019</td><td>Rishab Sen</td><td>Lab 7</td><td class="entry">ENTRY</td></tr>
              <tr><td>21:51:30</td><td>SEC-02</td><td>Sec_Officer_02</td><td>Main Gate</td><td class="exit">EXIT</td></tr>
              <tr><td>22:03:14</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 5</td><td class="entry">ENTRY</td></tr>
              <tr><td>22:09:02</td><td>EMP-034</td><td>Vikrant Kaul</td><td>Lab 5</td><td class="exit">EXIT</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Ghost AI floating button for task 1 -->
        <div style="position:absolute;bottom:8px;right:8px;z-index:6;">
          <div class="ghost-bubble">Ask me!</div>
          <div class="ghost-float-btn" onclick="openGhostModal(1)" title="ghost41_id Assistant" role="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 52" width="100%" height="100%" style="image-rendering:pixelated;display:block;"><rect x="10" y="0" width="25" height="5" fill="#ccddd8"/><rect x="5" y="5" width="35" height="5" fill="#ccddd8"/><rect x="0" y="10" width="45" height="25" fill="#ccddd8"/><rect x="0" y="35" width="13" height="12" fill="#ccddd8"/><rect x="16" y="35" width="13" height="12" fill="#ccddd8"/><rect x="32" y="35" width="13" height="12" fill="#ccddd8"/><rect x="8" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="27" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="10" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/><rect x="29" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/></svg></div>
        </div>

        <!-- Next task bar -->
        <div class="next-task-bar" id="next-bar-1">
          <span class="next-hint">MODULE COMPLETE - PROCEED WHEN READY</span>
          <button class="next-task-btn" onclick="goNextTask(1)">NEXT TASK &#x203a;</button>
        </div>
      </div>

      <div class="task-panel" id="task2">
        <div class="locked-screen" id="task2-lock">
          <div class="locked-icon">&#128274;</div>
          <div class="locked-text">ACCESS LOCKED</div>
          <div style="font-size:11px;color:#553333;letter-spacing:1px;">Complete Badge &amp; Door Logs to unlock</div>
        </div>

        <div class="panel-header glitch-rgb" data-text="ELEVATOR TRANSPORT ANALYSIS">ELEVATOR TRANSPORT ANALYSIS</div>
        <div class="elevator-layout">
          <!-- LEFT: drag & drop -->
          <div class="elevator-left">
            <div>
              <div class="section-label">LOAD RECONSTRUCTION MODULE</div>
              <div class="drag-items-label" style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">
                Instruction:<br>Reconstruct the transport event.
              </div>
              <div class="drag-items" id="drag-items">
                <div class="drag-item" draggable="true" data-item="PERSON" ondragstart="itemDragStart(event,this)" ondragend="this.classList.remove('dragging')">PERSON</div>
                <div class="drag-item" draggable="true" data-item="CART" ondragstart="itemDragStart(event,this)" ondragend="this.classList.remove('dragging')">CART</div>
                <div class="drag-item" draggable="true" data-item="GURNEY" ondragstart="itemDragStart(event,this)" ondragend="this.classList.remove('dragging')">GURNEY</div>
                <div class="drag-item" draggable="true" data-item="EQUIPMENT" ondragstart="itemDragStart(event,this)" ondragend="this.classList.remove('dragging')">EQUIPMENT</div>
              </div>
            </div>
            <div>
              <div class="elevator-drop-zone" id="elevator-drop" ondragover="event.preventDefault();this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="dropItem(event)"></div>
            </div>
            <button class="analyze-btn" id="analyze-btn" onclick="analyzeLoad()" disabled>[ ANALYZE LOAD ]</button>
          </div>

          <!-- RIGHT: analysis + telemetry graph + ghost -->
          <div class="elevator-right">
            <div class="sys-analysis" id="sys-analysis">
              <div class="section-label">SYSTEM ANALYSIS</div>
              <div class="sys-analysis-text" id="analysis-text">
                Awaiting load configuration...<br>
                <span style="color:var(--text-dim);font-size:10px;">Drag items to the platform to begin.</span>
              </div>
            </div>

            <!-- Ghost AI floating trigger -->
            <div style="position:relative;height:110px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;">
              <div class="ghost-bubble">Ask me!</div>
              <div class="ghost-float-btn" onclick="openGhostModal(2)" title="ghost41_id Assistant" role="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 52" width="100%" height="100%" style="image-rendering:pixelated;display:block;"><rect x="10" y="0" width="25" height="5" fill="#ccddd8"/><rect x="5" y="5" width="35" height="5" fill="#ccddd8"/><rect x="0" y="10" width="45" height="25" fill="#ccddd8"/><rect x="0" y="35" width="13" height="12" fill="#ccddd8"/><rect x="16" y="35" width="13" height="12" fill="#ccddd8"/><rect x="32" y="35" width="13" height="12" fill="#ccddd8"/><rect x="8" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="27" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="10" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/><rect x="29" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/></svg></div>
            </div>
          </div>
        </div>

        <!-- Next task bar -->
        <div class="next-task-bar" id="next-bar-2">
          <span class="next-hint">ELEVATOR ANALYSIS COMPLETE - PROCEED WHEN READY</span>
          <button class="next-task-btn" onclick="goNextTask(2)">NEXT TASK &#x203a;</button>
        </div>

        <div class="success-overlay" id="task2-success">
          <div class="success-text">&#10003; MODULE UNLOCKED</div>
          <div class="success-sub">ELEVATOR ANALYSIS COMPLETE - CLEARANCE LEVEL 3 GRANTED</div>
          <button class="continue-btn" onclick="unlockTask(3)">CONTINUE INVESTIGATION &#x2192;</button>
        </div>
      </div>

      <!-- ========== TASK 3: COLD STORAGE ========== -->
      <div class="task-panel" id="task3">
        <div class="panel-header glitch-rgb" data-text="COLD STORAGE ENVIRONMENT">COLD STORAGE ENVIRONMENT</div>

        <!-- Ghost AI notice -->
        <div id="task3-ghost-notice" style="background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.25);padding:10px 14px;margin:14px 16px 0;font-size:11px;color:rgba(0,220,170,0.8);letter-spacing:0.5px;display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">&#128123;</span>
          <span>Ghost AI has flagged anomalies in this log - <button onclick="openGhostModal(3)" style="background:none;border:none;color:var(--cyan);font-family:inherit;font-size:11px;cursor:pointer;text-decoration:underline;letter-spacing:1px;padding:0;">Open Ghost AI to analyse</button></span>
        </div>

        <div style="padding:14px 16px 0;display:flex;align-items:center;justify-content:space-between;">
          <div class="section-label" style="margin-bottom:0;">B3 ENVIRONMENTAL CONTROL LOG</div>
          <span style="font-size:10px;color:var(--text-dim);letter-spacing:1px;">21:48-22:03</span>
        </div>

        <div style="flex:1;overflow-y:auto;padding:10px 16px;">
          <table class="log-table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(200,50,50,0.3);">
                <th style="text-align:left;padding:5px 8px;font-size:10px;color:var(--text-dim);letter-spacing:2px;font-weight:400;">TIMESTAMP</th>
                <th style="text-align:left;padding:5px 8px;font-size:10px;color:var(--text-dim);letter-spacing:2px;font-weight:400;">EVENT TYPE</th>
                <th style="text-align:left;padding:5px 8px;font-size:10px;color:var(--text-dim);letter-spacing:2px;font-weight:400;">DETAIL</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cs-row-normal"><td>21:48:11</td><td class="cs-type">SYS_INIT</td><td>Cold Storage B3 environmental controller online</td></tr>
              <tr class="cs-row-normal"><td>21:48:18</td><td class="cs-type">TEMP_READ</td><td>Chamber temperature: 5.6&#176;C</td></tr>
              <tr class="cs-row-normal"><td>21:48:25</td><td class="cs-type">TEMP_CONTROL</td><td>Cooling cycle active</td></tr>
              <tr class="cs-row-normal"><td>21:49:03</td><td class="cs-type">ACCESS_IDLE</td><td>Door sealed</td></tr>
              <tr class="cs-row-normal"><td>21:49:44</td><td class="cs-type">SENSOR_STATUS</td><td>Internal humidity stable</td></tr>
              <tr class="cs-row-normal"><td>21:50:12</td><td class="cs-type">INVENTORY_SCAN</td><td>Rack occupancy unchanged</td></tr>
              <tr class="cs-row-normal"><td>21:50:55</td><td class="cs-type">POWER_MONITOR</td><td>Auxiliary backup active</td></tr>
              <tr class="cs-row-normal"><td>21:51:27</td><td class="cs-type">TEMP_READ</td><td>Chamber temperature: 5.1&#176;C</td></tr>
              <tr class="cs-row-normal"><td>21:52:04</td><td class="cs-type">ACCESS_IDLE</td><td>No authorized entry</td></tr>
              <tr class="cs-row-normal"><td>21:52:48</td><td class="cs-type">TEMP_CONTROL</td><td>Cooling maintained</td></tr>
              <tr class="cs-row-normal"><td>21:53:12</td><td class="cs-type">SENSOR_STATUS</td><td>Intake zone clear</td></tr>
              <tr class="cs-row-key"><td>21:54:09</td><td class="cs-type cs-flag">ELEVATOR_LINK</td><td>Elevator B inbound event registered</td></tr>
              <tr class="cs-row-key"><td>21:54:33</td><td class="cs-type cs-flag">PREP_MODE</td><td>Intake channel activated</td></tr>
              <tr class="cs-row-key"><td>21:55:02</td><td class="cs-type cs-flag">ACCESS_PENDING</td><td>Awaiting transfer authorization</td></tr>
              <tr class="cs-row-key"><td>21:55:31</td><td class="cs-type cs-flag">DOOR_UNLOCK</td><td>Internal transfer clearance accepted</td></tr>
              <tr class="cs-row-key"><td>21:56:04</td><td class="cs-type cs-flag">DOOR_OPEN</td><td>Cold Storage B3 access event</td></tr>
              <tr class="cs-row-key"><td>21:56:19</td><td class="cs-type cs-flag">TEMP_DROP</td><td>Chamber fluctuation detected: 4.8&#176;C</td></tr>
              <tr class="cs-row-key"><td>21:56:42</td><td class="cs-type cs-flag">INTAKE_EVENT</td><td>New intake registered</td></tr>
              <tr class="cs-row-key"><td>21:57:03</td><td class="cs-type cs-flag">DOOR_CLOSE</td><td>Chamber sealed</td></tr>
              <tr class="cs-row-normal"><td>21:57:26</td><td class="cs-type">TEMP_CONTROL</td><td>Rapid stabilization initiated</td></tr>
              <tr class="cs-row-normal"><td>21:58:11</td><td class="cs-type">TEMP_READ</td><td>Chamber temperature: 4.3&#176;C</td></tr>
              <tr class="cs-row-normal"><td>21:58:47</td><td class="cs-type">SENSOR_STATUS</td><td>Internal load changed</td></tr>
              <tr class="cs-row-normal"><td>21:59:15</td><td class="cs-type">STORAGE_VERIFY</td><td>Rack occupancy updated</td></tr>
              <tr class="cs-row-normal"><td>21:59:48</td><td class="cs-type">TEMP_CONTROL</td><td>Stable hold mode active</td></tr>
              <tr class="cs-row-normal"><td>22:00:11</td><td class="cs-type">CHAMBER_STATUS</td><td>4.0&#176;C hold achieved</td></tr>
              <tr class="cs-row-alert"><td>22:00:33</td><td class="cs-type cs-alert">ACCESS_LOCK</td><td>Manual entry disabled</td></tr>
              <tr class="cs-row-normal"><td>22:01:06</td><td class="cs-type">SYSTEM_NOTE</td><td>Preserve environmental stability</td></tr>
              <tr class="cs-row-alert"><td>22:01:44</td><td class="cs-type cs-alert">INVENTORY_SYNC</td><td>Restricted item record updated</td></tr>
              <tr class="cs-row-alert"><td>22:02:15</td><td class="cs-type cs-alert">AUDIT_FLAG</td><td>Internal visibility limited</td></tr>
              <tr class="cs-row-alert"><td>22:03:02</td><td class="cs-type cs-alert">STATUS_LOCK</td><td>Modification requires clearance</td></tr>
            </tbody>
          </table>
        </div>

        <div style="padding:12px 16px;border-top:1px solid rgba(200,50,50,0.2);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;">
          <div style="font-size:10px;color:var(--text-dim);letter-spacing:1px;">TASK: Analyse the log entries for anomalous activity</div>
          <button onclick="openExternalForm()" style="background:transparent;border:1px solid rgba(0,200,150,0.5);color:rgba(0,220,170,0.9);font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;padding:8px 16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(0,150,100,0.2)'" onmouseout="this.style.background='transparent'">[ SUBMIT ANALYSIS REPORT ]</button>
        </div>
      </div>

    </div><!-- /content-area -->
  </div><!-- /main-body -->

  <!-- SYSTEM MESSAGE BAR -->
  <div class="sys-msg-bar">
    <div class="label">SYSTEM MESSAGE</div>
    <div id="sysMsg">"Answer investigation prompts to unlock access."</div>
    <div class="next-unlock" id="nextUnlock">NEXT UNLOCK: <span>Elevator Analytics Module</span></div>
  </div>
</div>

<!-- TELEMETRY POPUP -->
<div class="tele-popup-bg" id="tele-popup-bg" onclick="closeTelePopup(event)">
  <div class="tele-popup">
    <div class="tele-popup-header">
      <div class="tele-popup-title">TELEMETRY - LIFT-02 EVENT LOG</div>
      <button class="tele-popup-close" onclick="closeTelePopup()">&#x2715; CLOSE</button>
    </div>
    <div class="tele-popup-meta">Sensor: Lift-02 &nbsp;|&nbsp; Window: 21:53-22:01 &nbsp;|&nbsp; <span style="color:var(--cyan);">Hover bars for details</span></div>
    <div class="tele-popup-canvas-wrap">
      <canvas id="telemetryChart" style="width:100%;display:block;"></canvas>
      <div class="graph-tooltip" id="graph-tooltip"></div>
    </div>
    <div class="tele-popup-labels">
      <span>21:53</span><span>21:54</span><span>21:55</span><span>21:56</span><span>21:57</span><span>21:58</span><span>21:59</span><span>22:00</span><span>22:01</span>
    </div>
    <div class="tele-popup-legend">
      <span>&#9650; FIRST PEAK (21:54):</span> Heavy load enters Lift-02<br>
      <span>&#8213; PLATEAU (21:55-21:58):</span> Full load stable during transit<br>
      <span>&#9660; RETURN DROP (22:00):</span> Reduced mass - original load not present
    </div>
    <div style="margin-top:12px;background:rgba(0,200,150,0.07);border:1px solid rgba(0,200,150,0.28);padding:10px 14px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:18px;">&#128123;</span>
      <span style="font-size:11px;color:rgba(0,220,170,0.85);">Cold Storage B3 has been unlocked. <button onclick="closeTelePopup();openGhostModal(2);" style="background:none;border:none;color:var(--cyan);font-family:inherit;font-size:11px;cursor:pointer;text-decoration:underline;letter-spacing:1px;padding:0;">Open Ghost AI</button> to complete the elevator investigation.</span>
    </div>
  </div>
</div>

<!-- CHAT PANEL -->
<div class="chat-panel" id="chat-panel">
  <div class="chat-panel-header">
    <div class="chat-panel-ghost"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 52" width="100%" height="100%" style="image-rendering:pixelated;display:block;"><rect x="10" y="0" width="25" height="5" fill="#ccddd8"/><rect x="5" y="5" width="35" height="5" fill="#ccddd8"/><rect x="0" y="10" width="45" height="25" fill="#ccddd8"/><rect x="0" y="35" width="13" height="12" fill="#ccddd8"/><rect x="16" y="35" width="13" height="12" fill="#ccddd8"/><rect x="32" y="35" width="13" height="12" fill="#ccddd8"/><rect x="8" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="27" y="16" width="10" height="10" fill="#00ffcc" opacity="0.95"/><rect x="10" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/><rect x="29" y="18" width="6" height="6" fill="#80ffe8" opacity="0.6"/></svg></div>
    <div class="chat-panel-info">
      <div class="chat-panel-name">ghost41_id</div>
      <div class="chat-panel-status">INVESTIGATION ASSISTANT &#183; ONLINE</div>
    </div>
    <button class="chat-panel-close" onclick="closeChatPanel()">&#x2715; CLOSE</button>
  </div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-input-area">
    <input class="chat-input" id="chat-input" type="text" disabled placeholder="Type your answer..." autocomplete="off" />
    <button class="chat-send-btn" id="chat-send-btn" onclick="sendChatMessage()" disabled>[ SEND ]</button>
  </div>
</div>

<!-- SUCCESS MODAL -->
<div id="success-modal" style="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.5s ease;">
  <div style="background:var(--bg2);border:1px solid var(--red-bright);padding:40px;border-radius:4px;text-align:center;max-width:440px;box-shadow:0 0 50px var(--red-glow);position:relative;clip-path:polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);">
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--red-bright),transparent);"></div>
    <h2 style="color:var(--red-bright);font-family:'Orbitron',sans-serif;font-size:24px;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;text-shadow:0 0 20px var(--red-bright);">CASE CONCLUDED</h2>
    <p style="color:var(--text);font-family:'Share Tech Mono',monospace;font-size:14px;margin-bottom:32px;line-height:1.6;">Investigation report submitted successfully. NeuralLink breach has been traced and contained. Your clearance has been permanently elevated.</p>
    <a href="/dashboard" style="display:inline-block;background:transparent;border:1px solid var(--red-bright);color:var(--red-bright);text-decoration:none;padding:12px 28px;font-size:12px;font-weight:900;letter-spacing:3px;cursor:pointer;transition:all 0.3s;font-family:'Share Tech Mono',monospace;text-transform:uppercase;" onmouseover="this.style.background='rgba(200,0,0,0.1)';this.style.boxShadow='0 0 15px var(--red-glow)'" onmouseout="this.style.background='transparent';this.style.boxShadow='none'">RETURN TO HEADQUARTERS</a>
  </div>
</div>
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelemetryPoint {
  t: string;
  kg: number;
  tooltip?: string;
}

interface GhostScriptEntry {
  delay: number;
  text: string;
}

interface GhostScript {
  intro: GhostScriptEntry[];
  autoAdvance?: boolean;
  question?: string;
  questionId?: string;
  feedbackOk?: string;
  feedbackErr?: string;
  onComplete?: () => void;
  onCorrect?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const InvestigationConsole: React.FC = () => {
  useEffect(() => {
    // ── STATE ──────────────────────────────────────────────────────────────────
    let currentTask: number = 1;
    let task1Done: boolean = false;
    let task2Done: boolean = false;
    let t1Selected: string | null = null;
    let droppedItems: string[] = [];
    let t2AnalyzeDone: boolean = false;

    // ── DRAG & DROP ITEMS data ──────────────────────────────────────────────────
    // Weights verified server-side via /api/ghost/verify

    // ── TASK NAVIGATION ─────────────────────────────────────────────────────────
    function showTask(n: number): void {
      if (n === 1 || (n === 2 && task1Done) || (n >= 3 && task2Done)) {
        document.querySelectorAll('.task-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('task' + n)!.classList.add('active');
        document.getElementById('btn-task' + n)!.classList.add('active');
        currentTask = n;
      }
    }

    function unlockTask(n: number): void {
      const btn = document.getElementById('btn-task' + n);
      if (btn) {
        btn.classList.add('unlocked');
        btn.querySelector('.lock-icon')!.textContent = '🔓';
        btn.setAttribute('onclick', 'showTask(' + n + ')');
      }
      // Update clearance boxes
      const cbox = document.getElementById('cb' + (n - 1));
      if (cbox) cbox.classList.add('active');

      if (n === 3) {
        document.getElementById('sysMsg')!.textContent = '"Cold Storage B3 access granted. Analyse the environmental log."';
        const b3 = document.getElementById('btn-task3');
        if (b3) { b3.classList.add('unlocked'); b3.querySelector('.lock-icon')!.textContent = '🔓'; b3.setAttribute('onclick', 'showTask(3)'); }
        document.getElementById('cb2')!.classList.add('active');
        document.getElementById('cb3')!.classList.add('active');
        document.getElementById('nextUnlock')!.innerHTML = 'STATUS: <span>COLD STORAGE UNLOCKED</span>';
      }
      showTask(n);
    }

    // ── TASK 1 ───────────────────────────────────────────────────────────────────
    function selectOption(label: HTMLElement, val: string): void {
      document.querySelectorAll('#t1-options .option-label').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      t1Selected = val;
    }

    function submitTask1(): void {
      const fb = document.getElementById('t1-feedback') as HTMLElement;
      if (!t1Selected) {
        fb.style.display = 'block';
        fb.className = 'feedback-msg wrong';
        fb.textContent = '⚠ Please select an employee before submitting.';
        return;
      }
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task5', questionId: 'task1_select', answer: t1Selected })
      })
        .then(r => r.json())
        .then(result => {
          if (result.correct) {
            fb.style.display = 'block';
            fb.className = 'feedback-msg correct';
            fb.textContent = result.successMessage || '✓ CORRECT';
            task1Done = true;
            setTimeout(() => {
              document.getElementById('task2-lock')!.style.display = 'none';
              unlockTaskBtn(2);
              showTask(2);
            }, 1800);
          } else {
            fb.style.display = 'block';
            fb.className = 'feedback-msg wrong';
            fb.textContent = result.failureMessage || '✗ INCORRECT — Try again.';
          }
        })
        .catch(() => {
          fb.style.display = 'block';
          fb.className = 'feedback-msg wrong';
          fb.textContent = '⚠ Verification error. Please try again.';
        });
    }

    function unlockTaskBtn(n: number): void {
      const btn = document.getElementById('btn-task' + n)!;
      btn.classList.add('unlocked');
      btn.querySelector('.lock-icon')!.textContent = '🔓';
      btn.setAttribute('onclick', 'showTask(' + n + ')');
      const cbox = document.getElementById('cb' + (n - 1));
      if (cbox) cbox.classList.add('active');
    }

    // ── DRAG & DROP ──────────────────────────────────────────────────────────────
    function itemDragStart(e: DragEvent, el: HTMLElement): void {
      if (el.classList.contains('used')) { e.preventDefault(); return; }
      e.dataTransfer!.setData('text/plain', el.dataset.item!);
      el.classList.add('dragging');
    }

    function dropItem(e: DragEvent): void {
      e.preventDefault();
      const zone = document.getElementById('elevator-drop')!;
      zone.classList.remove('drag-over');
      const item = e.dataTransfer!.getData('text/plain');
      if (!item || droppedItems.includes(item)) return;

      droppedItems.push(item);

      document.querySelectorAll('.drag-item').forEach((el: Element) => {
        if ((el as HTMLElement).dataset.item === item) el.classList.add('used');
      });

      const pill = document.createElement('div');
      pill.className = 'dropped-item';
      pill.textContent = item;
      pill.title = 'Click to remove';
      pill.onclick = () => removeDropped(item, pill);
      zone.appendChild(pill);
      evalLoadState();
    }

    function removeDropped(item: string, el: HTMLElement): void {
      droppedItems = droppedItems.filter(i => i !== item);
      el.remove();
      document.querySelectorAll('.drag-item').forEach((di: Element) => {
        if ((di as HTMLElement).dataset.item === item) di.classList.remove('used');
      });
      evalLoadState();
    }

    function evalLoadState(): void {
      const txt = document.getElementById('analysis-text')!;
      const btn = document.getElementById('analyze-btn') as HTMLButtonElement;

      if (droppedItems.length === 0) {
        txt.innerHTML = 'Awaiting load configuration...<br><span style="color:var(--text-dim);font-size:10px;">Drag items to the platform to begin.</span>';
        btn.disabled = true; btn.classList.remove('ready'); return;
      }

      // Verify the load combination via the backend
      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task5', questionId: 'elevator_load', answer: droppedItems.sort().join(',').toLowerCase() })
      })
        .then(r => r.json())
        .then(result => {
          if (result.correct) {
            txt.innerHTML = `<span class="confidence">✓ WEIGHT MATCH — Combination confirmed</span><br>
      <span style="color:var(--text-dim);font-size:10px;">Click ANALYZE LOAD to view telemetry.</span>`;
            btn.disabled = false; btn.classList.add('ready');
          } else {
            txt.innerHTML = `Items: <span class="val">${droppedItems.join(' + ')}</span><br>
      <span style="color:var(--red-bright);">✗ ${result.failureMessage || 'Transport weight inconsistent.'}</span>`;
            btn.disabled = true; btn.classList.remove('ready');
          }
        })
        .catch(() => {
          txt.innerHTML = '<span style="color:var(--red-bright);">✗ Verification error. Try again.</span>';
          btn.disabled = true; btn.classList.remove('ready');
        });
    }

    // ── TELEMETRY CHART ──────────────────────────────────────────────────────────
    const TELEMETRY_DATA: TelemetryPoint[] = [
      { t: '21:53', kg: 0 },
      { t: '21:54', kg: 104, tooltip: 'Weight profile consistent with\nadult human transport range.\n(First peak — heavy load detected)' },
      { t: '21:55', kg: 104, tooltip: 'Stable load — full payload\nremains inside Lift-02.' },
      { t: '21:56', kg: 104, tooltip: 'Stable plateau continues.' },
      { t: '21:57', kg: 104, tooltip: 'Stable plateau continues.' },
      { t: '21:58', kg: 104, tooltip: 'Stable — elevator approaching\ndestination floor.' },
      { t: '21:59', kg: 0, tooltip: 'Load unloaded at destination.' },
      { t: '22:00', kg: 32, tooltip: 'Return trip: 32 kg detected.\nOriginal load not present.\nTransport equipment only.' },
      { t: '22:01', kg: 0 }
    ];

    let telemetryRendered: boolean = false;

    function drawTelemetry(): void {
      const canvas = document.getElementById('telemetryChart') as HTMLCanvasElement;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.parentElement ? Math.max(400, canvas.parentElement.offsetWidth - 4) : 520;
      const displayH = 220;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      const W = displayW;
      const padL = 50, padR = 20, padT = 36, padB = 36;
      const plotW = W - padL - padR;
      const plotH = displayH - padT - padB;
      const maxKg = 120;
      const yOf = (kg: number): number => padT + plotH - (kg / maxKg) * plotH;
      const baseline = yOf(0);

      ctx.fillStyle = 'rgba(210,215,210,0.92)';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LOAD OVER TIME (kg)', W / 2, 20);

      ctx.strokeStyle = 'rgba(190,190,190,0.30)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL - 8, padT - 10, plotW + 16, plotH + 20);

      [70, 80, 90, 100, 110].forEach((v: number) => {
        const y = yOf(v);
        ctx.strokeStyle = 'rgba(180,180,180,0.12)';
        ctx.lineWidth = 0.6;
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(180,180,180,0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padL - 6, y); ctx.lineTo(padL, y); ctx.stroke();
        ctx.fillStyle = 'rgba(195,195,195,0.75)';
        ctx.font = '9.5px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(v + ' —', padL - 2, y + 3.5);
      });

      ctx.strokeStyle = 'rgba(180,180,180,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT - 10); ctx.lineTo(padL, baseline); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, baseline); ctx.lineTo(W - padR, baseline); ctx.stroke();

      const barPts = TELEMETRY_DATA.slice(1, 8);
      const nBars = barPts.length;
      const slot = plotW / nBars;
      const gap = Math.max(3, slot * 0.20);
      const bw = slot - gap;

      barPts.forEach((p: TelemetryPoint, i: number) => {
        const x = padL + i * slot + gap / 2;
        const top = yOf(p.kg);
        const bh = baseline - top;
        const isPeak = p.kg === 104;
        const isReturn = p.kg === 32;
        if (p.kg === 0) return;
        ctx.fillStyle = isPeak ? 'rgba(215,225,215,0.82)' : isReturn ? 'rgba(170,200,190,0.60)' : 'rgba(210,218,210,0.80)';
        ctx.fillRect(x, top, bw, bh);
        ctx.fillStyle = isPeak ? 'rgba(240,255,240,0.95)' : 'rgba(200,225,210,0.80)';
        ctx.fillRect(x, top, bw, 2);
        if (bh > 12) {
          ctx.fillStyle = isPeak ? 'rgba(235,255,235,0.95)' : 'rgba(195,215,205,0.85)';
          ctx.font = isPeak ? 'bold 9.5px monospace' : '8.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.kg + ' kg', x + bw / 2, top - 5);
        }
        ctx.fillStyle = 'rgba(175,175,175,0.80)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.t, x + bw / 2, baseline + 16);
      });

      const peakX = padL + 0 * slot + gap / 2 + bw / 2;
      ctx.fillStyle = 'rgba(160,210,180,0.65)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▲ FIRST PEAK', peakX, yOf(104) - 14);

      const retX = padL + 6 * slot + gap / 2 + bw / 2;
      ctx.fillStyle = 'rgba(140,190,175,0.65)';
      ctx.fillText('▼ RETURN', retX, yOf(32) - 14);

      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(190,210,190,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, yOf(104)); ctx.lineTo(W - padR, yOf(104)); ctx.stroke();
      ctx.setLineDash([]);
    }

    function analyzeLoad(): void {
      const btn = document.getElementById('analyze-btn') as HTMLButtonElement;
      if (btn.disabled) return;
      t2AnalyzeDone = true;
      if (!task2Done) {
        task2Done = true;
        unlockTask(3);
      }
      document.getElementById('tele-popup-bg')!.classList.add('open');
      setTimeout(() => { drawTelemetry(); setupTelemetryTooltip(); }, 60);
      setTimeout(() => {
        document.getElementById('next-bar-2')!.classList.add('visible');
      }, 1000);
    }

    function closeTelePopup(e?: MouseEvent): void {
      if (e && e.target !== document.getElementById('tele-popup-bg')) return;
      document.getElementById('tele-popup-bg')!.classList.remove('open');
    }

    function setupTelemetryTooltip(): void {
      if (telemetryRendered) return;
      telemetryRendered = true;
      const canvas = document.getElementById('telemetryChart') as HTMLCanvasElement;
      const tooltip = document.getElementById('graph-tooltip') as HTMLElement;
      const barPts = TELEMETRY_DATA.slice(1, 8);
      const nBars = barPts.length;

      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const W = rect.width;
        const plotW = W - 50 - 20;
        const slot = plotW / nBars;
        const idx = Math.max(0, Math.min(nBars - 1, Math.floor((mx - 50) / slot)));
        const p = barPts[idx];
        if (!p || !p.tooltip) { tooltip.style.display = 'none'; return; }
        tooltip.style.display = 'block';
        tooltip.innerHTML = p.tooltip.replace(/\n/g, '<br>') +
          '<br><span style="color:rgba(0,255,200,0.5)">' + p.t + ' — ' + p.kg + ' kg</span>';
        tooltip.style.left = Math.min(mx + 12, W - 220) + 'px';
        tooltip.style.top = '10px';
      });
      canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    }

    // ── CHAT PANEL ──────────────────────────────────────────────────────────────
    let ghostTask: number = 1;
    let chatAnswered: boolean = false;
    let chatPanelOpen: boolean = false;

    const GHOST_SCRIPTS: Record<number, GhostScript> = {
      1: {
        intro: [
          { delay: 0, text: 'I have been monitoring the facility access logs. Something does not add up.' },
          { delay: 1400, text: 'Review the <span>Badge &amp; Door Logs</span> carefully — one employee entered the lab late but never left.' },
          { delay: 2800, text: 'Once you have analysed the log, click <span>NEXT TASK</span> at the bottom to proceed.' }
        ],
        autoAdvance: true,
        onComplete: () => {
          task1Done = true;
          t1Selected = 'Rishab Sen';
          document.getElementById('task2-lock')!.style.display = 'none';
          unlockTaskBtn(2);
          setTimeout(() => {
            closeChatPanel();
            document.getElementById('next-bar-1')!.classList.add('visible');
          }, 1200);
        }
      },
      2: {
        intro: [
          { delay: 0, text: 'Good work. Now we are looking at the elevator records.' },
          { delay: 1100, text: 'Lift-02 was activated at <span>21:53</span>. Something — or someone — was moved.' },
          { delay: 2200, text: '<span>Your mission:</span> Reconstruct the transport. Drag available items onto the elevator platform. When the load signature matches, hit <span>ANALYZE LOAD</span> to view the telemetry.' },
          { delay: 3400, text: 'Cold Storage B3 has been unlocked. Proceed to the next module when ready.' }
        ],
        autoAdvance: true,
        onComplete: () => {
          setTimeout(() => {
            closeChatPanel();
            document.getElementById('next-bar-2')!.classList.add('visible');
          }, 1200);
        }
      },
      3: {
        intro: [
          { delay: 0, text: 'Cold Storage B3 logged an event at <span>21:54</span> — the same time the elevator was active.' },
          { delay: 1200, text: 'Cross-reference the timestamps carefully. Routine operations do not start at <span>21:55</span> without a trigger.' },
          { delay: 2400, text: 'Pay close attention to what changed between <span>21:56</span> and <span>22:03</span>. Some entries are not routine.' }
        ],
        question: 'What do the final log entries suggest about what happened in Cold Storage B3?',
        questionId: 'task3_chat',
        feedbackOk: 'Analysis recorded. The sequence of events points to an unscheduled intake — followed by access restrictions and audit suppression. Submit your full report using the button below.',
        feedbackErr: 'Keep analysing. Look for the pattern in the timestamps and what changed after the intake event.',
        onCorrect: () => {
          setTimeout(() => {
            closeChatPanel();
            document.getElementById('task3-ghost-notice')!.style.display = 'none';
            (window as any).showSuccessModal();
          }, 2500);
        }
      }
    };

    function openChatPanel(taskNum: number): void {
      ghostTask = taskNum;
      chatAnswered = false;
      chatPanelOpen = true;

      const panel = document.getElementById('chat-panel')!;
      const msgs = document.getElementById('chat-messages')!;
      const input = document.getElementById('chat-input') as HTMLInputElement;
      const sendBtn = document.getElementById('chat-send-btn') as HTMLButtonElement;

      msgs.innerHTML = '';
      input.value = '';
      input.disabled = true;
      sendBtn.disabled = true;
      panel.classList.add('open');

      const script = GHOST_SCRIPTS[taskNum];

      function showMsg(idx: number): void {
        if (idx >= script.intro.length) {
          if (script.autoAdvance) {
            input.disabled = true;
            sendBtn.disabled = true;
            if (script.onComplete) script.onComplete();
            return;
          }
          setTimeout(() => {
            addTypingIndicator(msgs, () => {
              if (script.question) {
                const qMsg = document.createElement('div');
                qMsg.className = 'chat-msg chat-msg-ghost';
                qMsg.innerHTML = '<div class="chat-label">ghost41_id \u203a QUERY</div>' + script.question;
                msgs.appendChild(qMsg);
                msgs.scrollTop = msgs.scrollHeight;
              }
              input.disabled = false;
              sendBtn.disabled = false;
              setTimeout(() => input.focus(), 100);
            }, script.question ? 900 : 400);
          }, 400);
          return;
        }
        const entry = script.intro[idx];
        setTimeout(() => {
          addTypingIndicator(msgs, () => {
            const msg = document.createElement('div');
            msg.className = 'chat-msg chat-msg-ghost';
            const label = idx === 0 ? '<div class="chat-label">ghost41_id › ANALYSIS</div>' : '';
            msg.innerHTML = label + entry.text;
            msgs.appendChild(msg);
            msgs.scrollTop = msgs.scrollHeight;
            showMsg(idx + 1);
          }, idx === 0 ? 700 : 600);
        }, entry.delay);
      }

      showMsg(0);
    }

    function addTypingIndicator(container: HTMLElement, callback: () => void, duration: number): void {
      const indicator = document.createElement('div');
      indicator.className = 'chat-typing';
      indicator.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(indicator);
      container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        indicator.remove();
        callback();
      }, duration);
    }

    function closeChatPanel(): void {
      document.getElementById('chat-panel')!.classList.remove('open');
      chatPanelOpen = false;
    }

    function sendChatMessage(): void {
      const script = GHOST_SCRIPTS[ghostTask];
      const input = document.getElementById('chat-input') as HTMLInputElement;
      const msgs = document.getElementById('chat-messages')!;
      const val = input.value.trim();
      if (!val || chatAnswered) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'chat-msg chat-msg-user';
      userMsg.textContent = val;
      msgs.appendChild(userMsg);
      msgs.scrollTop = msgs.scrollHeight;
      input.value = '';
      input.disabled = true;
      (document.getElementById('chat-send-btn') as HTMLButtonElement).disabled = true;

      const questionId = script.questionId || 'task3_chat';

      fetch('/api/ghost/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'task5', questionId, answer: val })
      })
        .then(r => r.json())
        .then(result => {
          setTimeout(() => {
            addTypingIndicator(msgs, () => {
              const fb = document.createElement('div');
              fb.className = 'chat-msg ' + (result.correct ? 'chat-msg-feedback-ok' : 'chat-msg-feedback-err');
              fb.textContent = result.correct
                ? (result.successMessage || script.feedbackOk || 'Correct.')
                : (result.failureMessage || script.feedbackErr || 'Incorrect.');
              msgs.appendChild(fb);
              msgs.scrollTop = msgs.scrollHeight;

              if (result.correct) {
                chatAnswered = true;
                if (script.onCorrect) script.onCorrect();
              } else {
                setTimeout(() => {
                  input.disabled = false;
                  (document.getElementById('chat-send-btn') as HTMLButtonElement).disabled = false;
                  input.focus();
                }, 600);
              }
            }, 800);
          }, 300);
        })
        .catch(() => {
          setTimeout(() => {
            addTypingIndicator(msgs, () => {
              const fb = document.createElement('div');
              fb.className = 'chat-msg chat-msg-feedback-err';
              fb.textContent = 'Error verifying answer. Try again.';
              msgs.appendChild(fb);
              msgs.scrollTop = msgs.scrollHeight;
              input.disabled = false;
              (document.getElementById('chat-send-btn') as HTMLButtonElement).disabled = false;
              input.focus();
            }, 800);
          }, 300);
        });
    }

    // Aliases for ghost float btn onclick compatibility
    function openGhostModal(taskNum: number): void { openChatPanel(taskNum); }
    function closeChatModal(): void { closeChatPanel(); }

    function openExternalForm(): void {
      window.open('https://forms.gle/YOUR_FORM_LINK_HERE', '_blank');
      showSuccessModal();
    }

    function showSuccessModal(): void {
      const modal = document.getElementById('success-modal')!;
      modal.style.display = 'flex';
      setTimeout(() => { modal.style.opacity = '1'; }, 10);
    }

    function goNextTask(from: number): void {
      if (from === 1) { showTask(2); }
      else if (from === 2) { showTask(3); }
    }

    // Wire up Enter key on chat input
    document.getElementById('chat-input')!.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    });

    // ── Expose all functions to window so inline onclick= handlers can find them
    const w = window as Record<string, unknown>;
    w.showTask = showTask;
    w.unlockTask = unlockTask;
    w.selectOption = selectOption;
    w.submitTask1 = submitTask1;
    w.itemDragStart = itemDragStart;
    w.dropItem = dropItem;
    w.analyzeLoad = analyzeLoad;
    w.closeTelePopup = closeTelePopup;
    w.openGhostModal = openGhostModal;
    w.closeChatModal = closeChatModal;
    w.closeChatPanel = closeChatPanel;
    w.sendChatMessage = sendChatMessage;
    w.openExternalForm = openExternalForm;
    w.showSuccessModal = showSuccessModal;
    w.goNextTask = goNextTask;

    // Cleanup on unmount
    return () => {
      ['showTask', 'unlockTask', 'selectOption', 'submitTask1', 'itemDragStart',
        'dropItem', 'analyzeLoad', 'closeTelePopup', 'openGhostModal', 'closeChatModal',
        'closeChatPanel', 'sendChatMessage', 'openExternalForm', 'showSuccessModal', 'goNextTask',
      ].forEach(k => delete (window as Record<string, unknown>)[k]);
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
};

export default InvestigationConsole;
