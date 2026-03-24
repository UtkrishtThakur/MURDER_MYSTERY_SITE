'use client'
// @ts-nocheck
import { useEffect } from "react";

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:          #070000;
  --bg2:         #0e0000;
  --red:         #b01218;
  --red-bright:  #d42020;
  --red-border:  rgba(176,18,24,0.28);
  --teal:        #0c9080;
  --gold:        #c9a84c;
  --text:        #ddc8c0;
  --text-dim:    #8a6060;
  --text-bright: #f2e4e0;
  --serif:       'Playfair Display', Georgia, serif;
  --body:        'Crimson Text', Georgia, serif;
  --mono:        'Courier Prime', 'Courier New', monospace;
}
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--body); overflow-x: hidden; cursor: none; }

/* GRAIN */
.grain { position:fixed; inset:-100%; width:300%; height:300%; pointer-events:none; z-index:9000; opacity:0.035;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation:grain-a 0.35s steps(2) infinite; }
@keyframes grain-a { 0%{transform:translate(0,0)} 25%{transform:translate(-1%,-2%)} 50%{transform:translate(2%,1%)} 75%{transform:translate(-1%,2%)} 100%{transform:translate(1%,-1%)} }

/* CURSOR */
.cur    { position:fixed; width:30px; height:30px; border:1px solid var(--red); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); }
.cur-dt { position:fixed; width:4px;  height:4px;  background:var(--red-bright); border-radius:50%; pointer-events:none; z-index:10000; transform:translate(-50%,-50%); }

/* NAV */
.nav { position:fixed; top:0; left:0; right:0; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:16px 40px;
  background:linear-gradient(to bottom, rgba(4,0,0,0.94) 0%, transparent 100%); transition:background 0.3s; }
.nav.stuck { background:rgba(5,0,0,0.96); border-bottom:1px solid var(--red-border); }
.nav-logo { font-family:var(--serif); font-size:12.5px; font-weight:700; line-height:1.2; letter-spacing:0.06em; color:var(--text-bright); }
.nav-logo em { display:block; font-style:normal; color:var(--red); }
.nav-links { display:flex; gap:28px; list-style:none; }
.nav-links a { font-family:var(--mono); font-size:10.5px; letter-spacing:0.2em; color:var(--text-dim); text-decoration:none; transition:color 0.2s; }
.nav-links a:hover { color:var(--text-bright); }
.nav-badge { width:32px; height:32px; background:var(--red); border-radius:50%; display:flex; align-items:center; justify-content:center; }
.nav-badge svg { width:15px; height:15px; fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

/* DARK ROOM */
.room { width:100%; height:52vh; min-height:300px; position:relative; overflow:hidden; background:var(--bg2); }
.room-bg {
  position:absolute; inset:0;
  background:
    radial-gradient(ellipse 50% 70% at 16% 60%, rgba(100,8,8,0.60) 0%, transparent 55%),
    radial-gradient(ellipse 30% 55% at 82% 25%, rgba(130,8,8,0.50) 0%, transparent 55%),
    radial-gradient(ellipse 80% 35% at 50% 100%, rgba(70,0,0,0.70) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 50% 0%,   rgba(20,0,0,0.80) 0%, transparent 50%),
    linear-gradient(165deg, #0a0000 0%, #180303 35%, #0d0000 65%, #060000 100%);
}
.room-blinds { position:absolute; inset:0; opacity:0.55;
  background:repeating-linear-gradient(0deg, transparent 0px, transparent 26px, rgba(0,0,0,0.52) 26px, rgba(0,0,0,0.52) 32px); }
.room-lamp  { position:absolute; top:5%;  right:12%; width:260px; height:260px; border-radius:50%; filter:blur(28px);
  background:radial-gradient(circle, rgba(180,30,0,0.38) 0%, transparent 70%); }
.room-lamp2 { position:absolute; top:20%; left:5%;   width:200px; height:200px; border-radius:50%; filter:blur(24px);
  background:radial-gradient(circle, rgba(140,20,0,0.28) 0%, transparent 70%); }
.room-window { position:absolute; top:0; left:28%; width:22%; height:100%;
  background:linear-gradient(90deg, transparent 0%, rgba(80,10,10,0.12) 30%, rgba(100,12,12,0.18) 50%, rgba(80,10,10,0.10) 70%, transparent 100%); }
.room-table { position:absolute; bottom:0; left:20%; right:20%; height:38%;
  background:linear-gradient(to top, rgba(5,0,0,1) 0%, rgba(12,2,2,0.9) 60%, transparent 100%);
  clip-path:polygon(5% 100%, 0% 30%, 20% 0%, 80% 0%, 100% 30%, 95% 100%); }
.room::after { content:''; position:absolute; bottom:0; left:0; right:0; height:45%;
  background:linear-gradient(to bottom, transparent, var(--bg)); pointer-events:none; }

/* BOUNTIES SECTION */
.bounties { background:var(--bg); padding:70px 40px 100px; }
.section-label { display:flex; align-items:center; gap:16px; margin-bottom:48px; }
.section-label-text { font-family:var(--mono); font-size:11px; letter-spacing:0.22em; color:var(--text-dim); text-transform:uppercase; }
.section-label-rule { flex:1; height:1px; background:linear-gradient(to right, var(--red-border), transparent); }

/* BOUNTY CARD */
.bounty-card { max-width:780px; margin:0 auto; background:var(--bg2); border:1px solid var(--red-border); position:relative; overflow:hidden; transition:box-shadow 0.3s, border-color 0.3s; }
.bounty-card:hover { box-shadow:0 0 60px rgba(180,15,18,0.18), 0 20px 50px rgba(0,0,0,0.5); border-color:rgba(200,20,24,0.5); }
.bounty-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, var(--red), transparent 70%); }
.bounty-card::after  { content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse 70% 50% at 30% 0%, rgba(160,15,18,0.07) 0%, transparent 70%); }
.card-top { display:flex; align-items:flex-start; justify-content:space-between; padding:28px 32px 0; gap:20px; flex-wrap:wrap; }
.badge-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.badge { font-family:var(--mono); font-size:10px; letter-spacing:0.14em; padding:4px 10px; border-radius:2px; text-transform:uppercase; }
.badge-open  { background:rgba(13,144,128,0.14); color:var(--teal);  border:1px solid rgba(13,144,128,0.35); }
.badge-corp  { background:rgba(176,18,24,0.12);  color:var(--red);   border:1px solid var(--red-border); }
.badge-urgent{ background:rgba(200,168,76,0.10); color:var(--gold);  border:1px solid rgba(200,168,76,0.28); animation:pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
.case-tag { font-family:var(--mono); font-size:10px; color:var(--text-dim); letter-spacing:0.1em; margin-top:8px; }
.bounty-amount-block { text-align:right; flex-shrink:0; }
.bounty-lbl { font-family:var(--mono); font-size:9.5px; letter-spacing:0.2em; color:var(--text-dim); text-transform:uppercase; margin-bottom:4px; }
.bounty-num { font-family:var(--serif); font-size:42px; font-weight:900; color:var(--gold); line-height:1; letter-spacing:-0.02em; text-shadow:0 0 40px rgba(200,168,76,0.25); }
.bounty-num sup { font-size:18px; vertical-align:super; font-weight:700; }
.card-div { margin:20px 32px; height:1px; background:linear-gradient(to right, var(--red-border), transparent 80%); }
.card-body { padding:0 32px 28px; }
.card-title { font-family:var(--serif); font-size:26px; font-weight:700; color:var(--text-bright); line-height:1.2; margin-bottom:14px; }
.card-desc  { font-family:var(--body);  font-size:16px; color:var(--text); line-height:1.75; margin-bottom:22px; max-width:580px; }
.card-tags { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:4px; }
.tag { font-family:var(--mono); font-size:10px; letter-spacing:0.1em; padding:3px 9px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:var(--text-dim); border-radius:2px; }
.card-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; padding:18px 32px; border-top:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); }
.meta-items { display:flex; gap:24px; flex-wrap:wrap; }
.meta-item  { display:flex; flex-direction:column; gap:2px; }
.meta-key   { font-family:var(--mono); font-size:9px; letter-spacing:0.15em; color:var(--text-dim); text-transform:uppercase; }
.meta-val   { font-family:var(--mono); font-size:12px; color:var(--text); letter-spacing:0.05em; }
.meta-val.danger { color:var(--red); }
.meta-val.ok     { color:var(--teal); }
.btn-investigate { display:inline-flex; align-items:center; gap:10px; background:var(--red); color:#fff; font-family:var(--mono); font-size:11px; letter-spacing:0.15em; text-transform:uppercase; padding:11px 22px; text-decoration:none; border:1px solid rgba(220,40,40,0.4); transition:background 0.2s, box-shadow 0.2s, transform 0.15s; position:relative; overflow:hidden; }
.btn-investigate::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%); }
.btn-investigate:hover { background:var(--red-bright); box-shadow:0 0 28px rgba(200,20,20,0.4); transform:translateY(-1px); }
.btn-investigate svg { width:13px; height:13px; fill:none; stroke:#fff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; }

/* CAROUSEL */
.carousel-section { position:relative; background:linear-gradient(to bottom, var(--bg) 0%, #0f0000 40%, #0a0000 100%); padding:60px 0 80px; overflow:hidden; display:flex; align-items:center; justify-content:center; min-height:520px; }
.carousel-track { display:flex; align-items:center; justify-content:center; gap:0; position:relative; width:100%; max-width:860px; height:400px; }
.carousel-item { position:absolute; transition:all 0.45s cubic-bezier(0.25,0.46,0.45,0.94); cursor:pointer; }
.carousel-item[data-index="0"] { transform:translateX(-230px) scale(0.78); z-index:1; opacity:0.65; }
.carousel-item[data-index="1"],.carousel-item.active { transform:translateX(0px) scale(1); z-index:3; opacity:1; }
.carousel-item[data-index="2"] { transform:translateX(230px) scale(0.78); z-index:1; opacity:0.65; }
.poster-placeholder { width:200px; height:300px; background:linear-gradient(135deg, #120000 0%, #1e0202 50%, #100000 100%); border:1px solid var(--red-border); position:relative; overflow:hidden; transition:border-color 0.3s, box-shadow 0.3s; }
.carousel-item.active .poster-placeholder { border-color:rgba(192,20,24,0.7); box-shadow:0 0 0 1px rgba(192,20,24,0.3), 0 20px 60px rgba(150,10,10,0.4); }
.poster-placeholder::before { content:""; position:absolute; inset:0; background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(13,144,128,0.06) 0%, transparent 70%), repeating-linear-gradient(0deg, transparent 0px, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px); }
.poster-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
.poster-label { font-family:var(--mono); font-size:9px; letter-spacing:0.25em; color:var(--text-dim); text-transform:uppercase; }
.poster-num { font-family:var(--serif); font-size:48px; font-weight:900; color:rgba(180,18,24,0.2); line-height:1; letter-spacing:-0.02em; }
.carousel-arrow { position:absolute; top:50%; transform:translateY(-50%); width:38px; height:38px; border:1px solid var(--red-border); background:rgba(10,0,0,0.8); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; transition:background 0.2s, border-color 0.2s; }
.carousel-arrow:hover { background:var(--red); border-color:var(--red-bright); }
.carousel-arrow svg { width:16px; height:16px; fill:none; stroke:var(--text-dim); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; transition:stroke 0.2s; }
.carousel-arrow:hover svg { stroke:#fff; }
.arrow-left  { left:32px; }
.arrow-right { right:32px; }

/* BOTTOM SECTION */
.bottom-section { background:linear-gradient(135deg, #100000 0%, #1a0000 40%, #0d0000 100%); min-height:380px; position:relative; overflow:hidden; }
.bottom-section::before { content:""; position:absolute; inset:0; background: radial-gradient(ellipse 70% 60% at 20% 50%, rgba(120,8,8,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 30%, rgba(80,5,5,0.25) 0%, transparent 60%); }
.bottom-inner { position:relative; display:flex; align-items:center; justify-content:flex-end; height:100%; min-height:380px; padding:50px 80px 50px 40px; gap:40px; }
.bottom-left { flex:1; }
.bottom-right { display:flex; align-items:center; justify-content:center; }
.poster-sm { width:150px !important; height:210px !important; }
.poster-sm .poster-num { font-size:36px; }

@media (max-width:600px) {
  .nav { padding:14px 18px; } .nav-links { display:none; }
  .bounties { padding:50px 18px 70px; }
  .card-top, .card-body, .card-footer { padding-left:18px; padding-right:18px; }
  .card-div { margin:16px 18px; }
  .bounty-num { font-size:30px; } .card-title { font-size:20px; }
  .card-footer { flex-direction:column; align-items:flex-start; }
}
`;

// ─────────────────────────────────────────────
// HTML
// ─────────────────────────────────────────────
const HTML = `
<div class="grain"></div>
<div class="cur"    id="cur"></div>
<div class="cur-dt" id="cur-dt"></div>

<!-- NAV -->
<nav class="nav" id="nav">
  <div class="nav-logo">
    <span>DETECTIVE</span>
    <em>AGENCY</em>
  </div>
  <ul class="nav-links">
    <li><a href="#">HOME</a></li>
    <li><a href="#">CASES</a></li>
    <li><a href="#">EVIDENCE</a></li>
    <li><a href="#">ABOUT</a></li>
  </ul>
  <a href="/login" class="nav-badge">
    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </a>
</nav>

<!-- DARK ROOM -->
<section class="room">
  <div class="room-bg"></div>
  <div class="room-blinds"></div>
  <div class="room-lamp"></div>
  <div class="room-lamp2"></div>
  <div class="room-window"></div>
  <div class="room-table"></div>
</section>

<!-- BOUNTIES -->
<section class="bounties">
  <div class="section-label">
    <span class="section-label-text">Active Bounties</span>
    <div class="section-label-rule"></div>
  </div>

  <div class="bounty-card">
    <div class="card-top">
      <div>
        <div class="badge-row">
          <span class="badge badge-open">Open</span>
          <span class="badge badge-corp">Corporate</span>
          <span class="badge badge-urgent">⚡ Urgent</span>
        </div>
        <div class="case-tag">CASE — NS-77 &nbsp;/&nbsp; NEUROSPHERE INC.</div>
      </div>
      <div class="bounty-amount-block">
        <div class="bounty-lbl">Bounty Reward</div>
        <div class="bounty-num"><sup>$</sup>2,50,000</div>
      </div>
    </div>

    <div class="card-div"></div>

    <div class="card-body">
      <h2 class="card-title">The Neurosphere Data Breach — Inside Job</h2>
      <p class="card-desc">
        A former employee of Neurosphere Inc. — one of the world's leading neural interface corporations — has allegedly stolen a classified dataset containing proprietary chip firmware, user neural telemetry records, and internal safety override protocols. The suspect vanished 72 hours ago. No trace. No exit record.<br /><br />
        The stolen data, if sold, could compromise thousands of active NeuroBand users and expose a web of corporate decisions the company has spent years burying. Your job: track the suspect, recover the data, and uncover how deep this goes. This isn't just theft — someone on the inside wanted this out.
      </p>
      <div class="card-tags">
        <span class="tag">DATA THEFT</span>
        <span class="tag">NEURAL FIRMWARE</span>
        <span class="tag">INSIDER THREAT</span>
        <span class="tag">NEUROSPHERE INC.</span>
        <span class="tag">CLASSIFIED RECORDS</span>
        <span class="tag">FUGITIVE AT LARGE</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="meta-items">
        <div class="meta-item">
          <span class="meta-key">Status</span>
          <span class="meta-val ok">OPEN</span>
        </div>
        <div class="meta-item">
          <span class="meta-key">Threat Level</span>
          <span class="meta-val danger">CRITICAL</span>
        </div>
        <div class="meta-item">
          <span class="meta-key">Suspect</span>
          <span class="meta-val">AT LARGE</span>
        </div>
        <div class="meta-item">
          <span class="meta-key">Posted</span>
          <span class="meta-val">72 HRS AGO</span>
        </div>
      </div>
      <a href="/neuroband-tasks" class="btn-investigate">
        Investigate
        <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </div>
</section>

<!-- CAROUSEL -->
<section class="carousel-section">
  <div class="carousel-track" id="carousel-track">
    <div class="carousel-item" data-index="0">
      <div class="poster-placeholder">
        <div class="poster-inner">
          <div class="poster-label">CASE FILE</div>
          <div class="poster-num">01</div>
        </div>
      </div>
    </div>
    <div class="carousel-item active" data-index="1">
      <div class="poster-placeholder">
        <div class="poster-inner">
          <div class="poster-label">CASE FILE</div>
          <div class="poster-num">02</div>
        </div>
      </div>
    </div>
    <div class="carousel-item" data-index="2">
      <div class="poster-placeholder">
        <div class="poster-inner">
          <div class="poster-label">CASE FILE</div>
          <div class="poster-num">03</div>
        </div>
      </div>
    </div>
  </div>
  <button class="carousel-arrow arrow-left"  id="arrow-left"  onclick="window.__carouselLeft()">
    <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
  </button>
  <button class="carousel-arrow arrow-right" id="arrow-right" onclick="window.__carouselRight()">
    <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
  </button>
</section>

<!-- BOTTOM PLACEHOLDER -->
<section class="bottom-section">
  <div class="bottom-inner">
    <div class="bottom-left"></div>
    <div class="bottom-right">
      <div class="poster-placeholder poster-sm">
        <div class="poster-inner">
          <div class="poster-label">FEATURED</div>
          <div class="poster-num">02</div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    // ── Inject <style> ──────────────────────
    const styleEl = document.createElement("style");
    styleEl.id = "__landing-styles";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // ── Cursor ──────────────────────────────
    let mx = 0, my = 0, cx = 0, cy = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const dot = document.getElementById("cur-dt");
      if (dot) dot.style.cssText = `left:${mx}px;top:${my}px`;
    };

    const loop = () => {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      const ring = document.getElementById("cur");
      if (ring) ring.style.cssText = `left:${cx}px;top:${cy}px`;
      rafId = requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(loop);

    // ── Nav sticky ──────────────────────────
    const onScroll = () => {
      const nav = document.getElementById("nav");
      if (nav) nav.classList.toggle("stuck", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── Carousel ────────────────────────────
    let current = 1;

    const setPositions = () => {
      const items = document.querySelectorAll<HTMLElement>(".carousel-item");
      items.forEach((item, i) => {
        const rel = ((i - current + items.length) % items.length);
        if (rel === 0) {
          item.dataset.index = "1";
          item.classList.add("active");
          item.style.transform = "translateX(0px) scale(1)";
          item.style.zIndex = "3";
          item.style.opacity = "1";
        } else if (rel === 1) {
          item.dataset.index = "2";
          item.classList.remove("active");
          item.style.transform = "translateX(230px) scale(0.78)";
          item.style.zIndex = "1";
          item.style.opacity = "0.65";
        } else {
          item.dataset.index = "0";
          item.classList.remove("active");
          item.style.transform = "translateX(-230px) scale(0.78)";
          item.style.zIndex = "1";
          item.style.opacity = "0.65";
        }
      });
    };

    // Bind to window so inline onclick handlers in the HTML string can reach them
    (window as any).__carouselRight = () => {
      const items = document.querySelectorAll(".carousel-item");
      current = (current + 1) % items.length;
      setPositions();
    };

    (window as any).__carouselLeft = () => {
      const items = document.querySelectorAll(".carousel-item");
      current = (current - 1 + items.length) % items.length;
      setPositions();
    };

    setPositions();

    // ── Cleanup ─────────────────────────────
    return () => {
      // Remove injected style
      document.getElementById("__landing-styles")?.remove();

      // Remove event listeners
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);

      // Cancel animation frame
      cancelAnimationFrame(rafId);

      // Delete window bindings
      delete (window as any).__carouselRight;
      delete (window as any).__carouselLeft;
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: HTML }}
    />
  );
}
