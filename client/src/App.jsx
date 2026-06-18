import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#080a0f;--card:#131720;--border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
    --text:#e2e8f0;--muted:#64748b;--accent:#22d3ee;--accent2:#6366f1;
    --green:#10b981;--red:#f43f5e;--amber:#f59e0b;
    --fh:'Syne',sans-serif;--fm:'DM Mono',monospace;--fb:'DM Sans',sans-serif;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--fb);min-height:100vh;overflow-x:hidden;}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes scanline{0%{top:-8%}100%{top:108%}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(34,211,238,0.3)}50%{box-shadow:0 0 40px rgba(34,211,238,0.6)}}
  .fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
  .fi{animation:fadeIn .4s ease both}
  .spin{animation:spin 1s linear infinite}
  input,select,button{font-family:var(--fb);}
  input:focus,select:focus{outline:none;}
  select{appearance:none;}
  .land-btn{transition:all .2s;cursor:pointer;}
  .land-btn:hover{transform:translateY(-2px);}
  .feat-card{transition:all .3s;border:1px solid var(--border);}
  .feat-card:hover{border-color:rgba(34,211,238,0.3);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4);}
`;

function injectCSS() {
  if (document.getElementById("ap2")) return;
  const s = document.createElement("style");
  s.id = "ap2";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const FINNHUB_KEY = "d8mr509r01qp7ubmok60d8mr509r01qp7ubmok6g";


const FEED = [
  "RELIANCE +1.2%","TCS -0.4%","INFY +2.1%","HDFC +0.8%","WIPRO -1.3%",
  "BAJFINANCE +3.2%","ICICIBANK +0.6%","SBIN -0.9%","TATAMOTORS +1.8%","ADANIENT -2.1%",
];
const FLASK = "http://localhost:5000";

/* ══════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════ */
function Landing({ onGetStarted }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.5 + .3, a: Math.random() * .4 + .05,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(34,211,238,${.1 * (1 - d / 120)})`; ctx.lineWidth = .5; ctx.stroke(); }
      }
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const features = [
    { icon: "🤖", title: "AI Ensemble Model", desc: "Random Forest + Gradient Boosting trained on 5 years of NSE/BSE data to predict price direction with high accuracy." },
    { icon: "📊", title: "Technical Indicators", desc: "RSI, MACD, ATR, Bollinger Bands, MA20/MA50 — all computed in real time on live Yahoo Finance data." },
    { icon: "🧠", title: "Sentiment Analysis", desc: "News headlines are scored using NLP to factor market sentiment into every buy/sell/hold decision." },
    { icon: "⚡", title: "Instant Signals", desc: "Get BUY, SELL, HOLD or NEUTRAL signals with a composite score out of 100 in seconds." },
    { icon: "📈", title: "Factor Radar Chart", desc: "Visualise Momentum, Profitability, Quality, Sentiment and Valuation scores in a beautiful radar chart." },
    { icon: "🔒", title: "Portfolio Aware", desc: "Enter your avg price and quantity — the model adjusts its recommendation based on whether you already own the stock." },
  ];

  const steps = [
    { num: "01", title: "Search Stock", desc: "Type any Indian company name or NSE symbol" },
    { num: "02", title: "Set Parameters", desc: "Choose hold plan, horizon and ownership" },
    { num: "03", title: "Run Analysis", desc: "AI model analyses 5 years of data instantly" },
    { num: "04", title: "Get Decision", desc: "Receive BUY/SELL/HOLD with full breakdown" },
  ];

  const stats = [
    { val: "5000+", label: "NSE Stocks" },
    { val: "5 Years", label: "Training Data" },
    { val: "2 Models", label: "Ensemble AI" },
    { val: "Real-Time", label: "Live Prices" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* HERO */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(34,211,238,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.025) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 1, pointerEvents: "none" }} />

        {/* NAV */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: "rgba(8,10,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#22d3ee,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 18, color: "#fff", boxShadow: "0 0 16px rgba(34,211,238,0.4)", animation: "glow 3s ease-in-out infinite" }}>α</div>
            <div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 17, letterSpacing: -.5, lineHeight: 1 }}>ALPHA PREDICT</div>
              <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--muted)", letterSpacing: 2 }}>MARKET INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {["#22d3ee", "#6366f1", "#10b981"].map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, animation: `pulse ${1.2 + i * .3}s ease-in-out infinite` }} />)}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)", marginLeft: 4 }}>NSE · BSE LIVE</div>
            <button onClick={onGetStarted} className="land-btn" style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(34,211,238,0.4)", background: "rgba(34,211,238,0.08)", color: "var(--accent)", fontSize: 13, fontFamily: "var(--fh)", fontWeight: 700, letterSpacing: .5 }}>
              Sign In →
            </button>
          </div>
        </nav>

        {/* TICKER TAPE */}
        <div style={{ height: 26, background: "rgba(14,17,24,0.9)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", overflow: "hidden", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", gap: 40, animation: "ticker 22s linear infinite", whiteSpace: "nowrap", paddingLeft: "100%" }}>
            {[...FEED, ...FEED].map((t, i) => <span key={i} style={{ fontSize: 10, fontFamily: "var(--fm)", color: t.includes("+") ? "#10b981" : "#f43f5e", letterSpacing: .5 }}>{t}</span>)}
          </div>
        </div>

        {/* HERO CONTENT */}
        <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px 80px" }}>

          <div className="fu" style={{ animationDelay: "0ms", display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 99, padding: "6px 16px", marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--fm)", color: "var(--accent)", letterSpacing: 1 }}>AI-POWERED STOCK PREDICTION · INDIAN MARKETS</span>
          </div>

          <div className="fu" style={{ animationDelay: "80ms", fontFamily: "var(--fh)", fontWeight: 800, fontSize: "clamp(36px,6vw,72px)", letterSpacing: -2, lineHeight: 1.05, marginBottom: 24, maxWidth: 800 }}>
            Predict. Decide.{" "}
            <span style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Invest Smarter.
            </span>
          </div>

          <div className="fu" style={{ animationDelay: "160ms", fontSize: 17, color: "var(--muted)", maxWidth: 540, lineHeight: 1.7, marginBottom: 40 }}>
            Alpha Predict uses ensemble machine learning to give you real-time BUY · SELL · HOLD signals on every NSE and BSE listed stock.
          </div>

          <div className="fu" style={{ animationDelay: "240ms", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={onGetStarted} className="land-btn" style={{ padding: "14px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22d3ee,#6366f1)", color: "#fff", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, letterSpacing: .5, boxShadow: "0 8px 32px rgba(34,211,238,0.35)" }}>
              Get Started Free →
            </button>
            <button onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })} className="land-btn" style={{ padding: "14px 32px", borderRadius: 12, border: "1px solid var(--border2)", background: "rgba(255,255,255,0.04)", color: "var(--text)", fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15 }}>
              See Features ↓
            </button>
          </div>

          {/* STATS ROW */}
          <div className="fu" style={{ animationDelay: "320ms", display: "flex", gap: 32, marginTop: 64, flexWrap: "wrap", justifyContent: "center" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 28, background: "linear-gradient(135deg,#22d3ee,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, marginTop: 4 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* MOCK DECISION CARD */}
          <div className="fu" style={{ animationDelay: "400ms", marginTop: 64, background: "rgba(13,17,26,0.9)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 16, padding: "20px 32px", backdropFilter: "blur(12px)", display: "inline-flex", alignItems: "center", gap: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, marginBottom: 4 }}>SAMPLE ANALYSIS · TCS.NS</div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 22 }}>Tata Consultancy</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, fontFamily: "var(--fm)" }}>NSE · Score: 72/100</div>
            </div>
            <div style={{ width: 1, height: 48, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, marginBottom: 6 }}>MODEL DECISION</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 99, padding: "8px 20px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, color: "#10b981", letterSpacing: 3 }}>BUY</span>
              </div>
            </div>
            <div style={{ width: 1, height: 48, background: "var(--border)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, marginBottom: 4 }}>FORECAST PRICE</div>
              <div style={{ fontFamily: "var(--fm)", fontWeight: 600, fontSize: 22, color: "var(--accent)" }}>₹4,280.50</div>
              <div style={{ fontSize: 11, color: "#10b981", fontFamily: "var(--fm)", marginTop: 2 }}>▲ 3.2% expected</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ position: "relative", zIndex: 10, padding: "100px 40px", background: "linear-gradient(180deg,var(--bg),#0b0e17)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--accent)", letterSpacing: 2, marginBottom: 12 }}>WHAT WE OFFER</div>
            <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", letterSpacing: -1, marginBottom: 14 }}>Everything you need to{" "}<span style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>trade smarter</span></div>
            <div style={{ fontSize: 15, color: "var(--muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>Built specifically for Indian retail investors — no jargon, just clear AI-powered signals.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card" style={{ background: "var(--card)", borderRadius: 14, padding: "28px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ position: "relative", zIndex: 10, padding: "100px 40px", background: "#0b0e17" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--accent)", letterSpacing: 2, marginBottom: 12 }}>SIMPLE PROCESS</div>
            <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", letterSpacing: -1 }}>How it <span style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>works</span></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, position: "relative" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && <div style={{ position: "absolute", top: 24, left: "75%", width: "50%", height: 1, background: "linear-gradient(90deg,rgba(34,211,238,0.3),rgba(99,102,241,0.1))", zIndex: 0 }} />}
                <div style={{ position: "relative", zIndex: 1, width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,rgba(34,211,238,0.2),rgba(99,102,241,0.2))", border: "1px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontFamily: "var(--fm)", fontWeight: 500, fontSize: 13, color: "var(--accent)" }}>{s.num}</div>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: "relative", zIndex: 10, padding: "100px 40px", background: "linear-gradient(180deg,#0b0e17,var(--bg))", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#22d3ee,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 32, color: "#fff", margin: "0 auto 28px", boxShadow: "0 0 40px rgba(34,211,238,0.4)", animation: "glow 3s ease-in-out infinite" }}>α</div>
          <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: "clamp(28px,4vw,48px)", letterSpacing: -1, marginBottom: 16, lineHeight: 1.1 }}>
            Ready to make{" "}
            <span style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>smarter trades?</span>
          </div>
          <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 36, lineHeight: 1.7 }}>
            Join Alpha Predict and get AI-powered signals on any Indian stock — completely free.
          </div>
          <button onClick={onGetStarted} className="land-btn" style={{ padding: "16px 48px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22d3ee,#6366f1)", color: "#fff", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 17, letterSpacing: .5, boxShadow: "0 8px 32px rgba(34,211,238,0.4)" }}>
            Start Analysing Now →
          </button>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--muted)", fontFamily: "var(--fm)" }}>No signup required · Use demo / demo123</div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#22d3ee,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 14, color: "#fff" }}>α</div>
            <span style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 14 }}>ALPHA PREDICT</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)" }}>© 2026 Alpha Predict · Built for Indian Markets · NSE · BSE</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)" }}>Final Year Project · Not Financial Advice</div>
        </div>
      </div>
    </div>
  );
}

/* ── HIGHLIGHT MATCH ── */
function HighlightMatch({ text, query, color }) {
  if (!query || !text) return <span style={{ color }}>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span style={{ color }}>{text}</span>;
  return (
    <span style={{ color }}>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(34,211,238,0.2)", color: "var(--accent)", borderRadius: 2, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}


/* ── LOGIN ── */
function Login({ onLogin }) {
  const [form, setForm] = useState({ u: "", p: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const animRef = useRef(null);
  const [isRegister, setIsRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", email: "", u: "", p: "" });
  const canvasRef = useRef(null);


  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W = (c.width = window.innerWidth), H = (c.height = window.innerHeight);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.1,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${0.15 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  const submit = async () => {
  if (!form.u || !form.p) { setErr("Fill in all fields."); return; }
  setLoading(true); setErr("");
  try {
    const r = await fetch(`${FLASK}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.u, password: form.p }),
    });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || "Login failed."); return; }
    localStorage.setItem("token", d.token);
    onLogin(d.user);
  } catch {
    setErr("Cannot connect to server. Is Flask running?");
  } finally {
    setLoading(false);
  }
};


const submitRegister = async () => {
  if (!regForm.name || !regForm.email || !regForm.u || !regForm.p) {
    setErr("All fields are required."); return;
  }
  setLoading(true); setErr("");
  try {
    const r = await fetch(`${FLASK}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regForm.name,
        email: regForm.email,
        username: regForm.u,
        password: regForm.p,
      }),
    });
    const d = await r.json();
    if (!r.ok) { setErr(d.error || "Registration failed."); return; }
    setIsRegister(false);
    setErr("");
    setForm({ u: regForm.u, p: "" });
  } catch {
    setErr("Cannot connect to server.");
  } finally {
    setLoading(false);
  }
};

  const inp = (n) => ({
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused === n ? "rgba(34,211,238,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, padding: "13px 16px", color: "#e2e8f0", fontSize: 14,
    transition: "border .2s", boxShadow: focused === n ? "0 0 0 3px rgba(34,211,238,0.08)" : "none",
  });

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(34,211,238,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 1 }} />
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(34,211,238,0.4),transparent)", animation: "scanline 4s linear infinite", zIndex: 2, pointerEvents: "none" }} />
      <div className="fu" style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(13,17,26,0.95),rgba(19,23,32,0.98))", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 20, padding: "44px 40px 36px", backdropFilter: "blur(24px)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#22d3ee,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 18, color: "#fff", boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}>α</div>
            <div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>ALPHA PREDICT</div>
              <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--muted)", letterSpacing: 2, marginTop: 2 }}>MARKET INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 24, letterSpacing: -0.5, marginBottom: 6 }}>
              {isRegister ? "Create Account" : "Sign in"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {isRegister ? "Create your account" : "Sign in to your account"}</div>          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

  {/* REGISTER FIELDS */}
  {isRegister && (
    <>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>FULL NAME</label>
        <input style={inp("name")} placeholder="Your full name" value={regForm.name}
          onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
          onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>EMAIL</label>
        <input style={inp("email")} placeholder="you@email.com" value={regForm.email}
          onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
          onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>USERNAME</label>
        <input style={inp("ru")} placeholder="username" value={regForm.u}
          onChange={(e) => setRegForm((f) => ({ ...f, u: e.target.value }))}
          onFocus={() => setFocused("ru")} onBlur={() => setFocused("")} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>PASSWORD</label>
        <input type="password" style={inp("rp")} placeholder="••••••••" value={regForm.p}
          onChange={(e) => setRegForm((f) => ({ ...f, p: e.target.value }))}
          onFocus={() => setFocused("rp")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && submitRegister()} />
      </div>
    </>
  )}

  {/* LOGIN FIELDS */}
  {!isRegister && (
    <>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>USERNAME</label>
        <input style={inp("u")} placeholder="username" value={form.u}
          onChange={(e) => setForm((f) => ({ ...f, u: e.target.value }))}
          onFocus={() => setFocused("u")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6, fontFamily: "var(--fm)", letterSpacing: 1 }}>PASSWORD</label>
        <input type="password" style={inp("p")} placeholder="••••••••" value={form.p}
          onChange={(e) => setForm((f) => ({ ...f, p: e.target.value }))}
          onFocus={() => setFocused("p")} onBlur={() => setFocused("")}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
      </div>
    </>
  )}

  {err && (
    <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f43f5e" }}>{err}</div>
  )}

  {/* SUBMIT BUTTON */}
  <button onClick={isRegister ? submitRegister : submit} disabled={loading}
    style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "rgba(34,211,238,0.3)" : "linear-gradient(135deg,#22d3ee,#6366f1)", color: "#fff", fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = ".9"; }}
    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
    {loading
      ? <><span className="spin" style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" }} />Please wait...</>
      : isRegister ? "Create Account →" : "Sign In →"}
  </button>

  {/* TOGGLE LOGIN / REGISTER */}
  <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
    {isRegister ? "Already have an account? " : "Don't have an account? "}
    <span onClick={() => { setIsRegister(!isRegister); setErr(""); }}
      style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
      {isRegister ? "Sign In" : "Register"}
    </span>
  </div>

</div>
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)" }}>NSE · BSE · INDIAN MARKETS</div>
            <div style={{ display: "flex", gap: 4 }}>{["#22d3ee", "#6366f1", "#10b981"].map((c, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: c, animation: `pulse ${1.2 + i * 0.3}s ease-in-out infinite` }} />)}</div>
          </div>
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 32, background: "rgba(8,10,15,0.9)", borderTop: "1px solid rgba(34,211,238,0.1)", display: "flex", alignItems: "center", overflow: "hidden", zIndex: 20 }}>
        <div style={{ display: "flex", gap: 48, animation: "ticker 20s linear infinite", whiteSpace: "nowrap" }}>{[...FEED, ...FEED].map((t, i) => <span key={i} style={{ fontSize: 11, fontFamily: "var(--fm)", color: t.includes("+") ? "#10b981" : "#f43f5e", letterSpacing: 0.5 }}>{t}</span>)}</div>
      </div>
    </div>
  );
}

/* ── RADAR ── */
function Radar({ scores }) {
  const keys = Object.keys(scores);
  const vals = Object.values(scores);
  const n = keys.length;
  if (n < 3) return null;
  const cx = 120, cy = 120, r = 85;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, pct) => ({ x: cx + r * pct * Math.cos(ang(i)), y: cy + r * pct * Math.sin(ang(i)) });
  const poly = vals.map((v, i) => { const p = pt(i, v / 100); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" style={{ margin: "0 auto", display: "block" }}>
      {[0.25, 0.5, 0.75, 1].map((lv, li) => <polygon key={li} points={keys.map((_, i) => { const p = pt(i, lv); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
      {keys.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />; })}
      <polygon points={poly} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      {vals.map((v, i) => { const p = pt(i, v / 100); return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#6366f1" />; })}
      {keys.map((k, i) => { const p = pt(i, 1.22); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--muted)" fontFamily="DM Mono,monospace">{k}</text>; })}
    </svg>
  );
}

/* ── PRICE CHART ── */
function PriceChart({ closes, ma20, ma50, dates }) {
  if (!closes || closes.length < 2) return <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>No chart data</div>;
  const w = 560, h = 160, pad = { t: 10, r: 8, b: 28, l: 48 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const all = [...closes, ...(ma20 || []), ...(ma50 || [])];
  const minV = Math.min(...all), maxV = Math.max(...all), rng = maxV - minV || 1;
  const toX = (i) => pad.l + (i / (closes.length - 1)) * cw;
  const toY = (v) => pad.t + ch - ((v - minV) / rng) * ch;
  const linePts = (arr) => arr.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `${pad.l},${pad.t + ch} ${linePts(closes)} ${toX(closes.length - 1)},${pad.t + ch}`;
  const yT = Array.from({ length: 4 }, (_, i) => minV + (rng / 3) * i);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".18" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></linearGradient></defs>
      {yT.map((v, i) => <g key={i}><line x1={pad.l} y1={toY(v)} x2={pad.l + cw} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" /><text x={pad.l - 6} y={toY(v) + 4} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="DM Mono,monospace">{v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}</text></g>)}
      <polygon points={area} fill="url(#ag)" />
      {ma50 && ma50.length > 1 && <polyline points={linePts(ma50)} fill="none" stroke="rgba(99,102,241,0.65)" strokeWidth="1.2" strokeLinejoin="round" />}
      {ma20 && ma20.length > 1 && <polyline points={linePts(ma20)} fill="none" stroke="rgba(245,158,11,0.65)" strokeWidth="1.2" strokeLinejoin="round" />}
      <polyline points={linePts(closes)} fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx={toX(closes.length - 1)} cy={toY(closes[closes.length - 1])} r={4} fill="#22d3ee" />
      {dates && [0, 0.25, 0.5, 0.75, 1].map((_, i) => { const idx = Math.floor(i * (closes.length - 1)); return <text key={i} x={toX(idx)} y={h - 4} fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="DM Mono,monospace">{dates[idx]?.slice(5) || ""}</text>; })}
      <g><line x1={w - 130} y1={10} x2={w - 120} y2={10} stroke="#22d3ee" strokeWidth="1.8" /><text x={w - 116} y={14} fill="#94a3b8" fontSize="8" fontFamily="DM Mono,monospace">PRICE</text><line x1={w - 80} y1={10} x2={w - 70} y2={10} stroke="rgba(245,158,11,.7)" strokeWidth="1" /><text x={w - 66} y={14} fill="#94a3b8" fontSize="8" fontFamily="DM Mono,monospace">MA20</text><line x1={w - 36} y1={10} x2={w - 26} y2={10} stroke="rgba(99,102,241,.7)" strokeWidth="1" /><text x={w - 22} y={14} fill="#94a3b8" fontSize="8" fontFamily="DM Mono,monospace">MA50</text></g>
    </svg>
  );
}

/* ── SPARKLINE ── */
function Spark({ data }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 28, min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`).join(" ");
  const up = data[data.length - 1] >= data[data.length - 2];
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><polyline points={pts} fill="none" stroke={up ? "#10b981" : "#f43f5e"} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

/* ── DECISION BADGE ── */
function Badge({ decision }) {
  const d = (decision || "-").toUpperCase();
  const cfg = {
    BUY: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", color: "#10b981" },
    SELL: { bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.4)", color: "#f43f5e" },
    HOLD: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", color: "#f59e0b" },
    NEUTRAL: { bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.3)", color: "#94a3b8" },
  };
  const c = cfg[d] || cfg.HOLD;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 99, padding: "10px 24px" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, animation: "pulse 1.5s ease-in-out infinite" }} />
      <span style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 18, color: c.color, letterSpacing: 3 }}>{d}</span>
    </div>
  );
}

/* ── RISK METER ── */
function RiskMeter({ level }) {
  const pct = level === "Low" ? 20 : level === "High" ? 80 : 50;
  const color = level === "Low" ? "#10b981" : level === "High" ? "#f43f5e" : "#f59e0b";
  return (
    <div>
      <div style={{ height: 6, background: "linear-gradient(90deg,#10b981,#f59e0b,#f43f5e)", borderRadius: 99, position: "relative", marginBottom: 6 }}>
        <div style={{ position: "absolute", top: -3, left: `${pct}%`, width: 12, height: 12, borderRadius: "50%", background: color, border: "2px solid var(--card)", transform: "translateX(-50%)", boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "var(--fm)", color: "var(--muted)" }}><span>LOW</span><span>MED</span><span>HIGH</span></div>
    </div>
  );
}

/* ── CARD ── */
function Card({ children, style = {}, delay = 0 }) {
  return <div className="fu" style={{ animationDelay: `${delay}ms`, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, ...style }}>{children}</div>;
}
function CT({ children }) {
  return <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13, color: "var(--muted)", letterSpacing: 0.5, marginBottom: 12 }}>{children}</div>;
}

/* ── DASHBOARD ── */
function Dashboard({ user, onLogout }) {
  const [ticker, setTicker] = useState("");
  const [ownStock, setOwnStock] = useState("No");
  const [avgPrice, setAvgPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [holdPlan, setHoldPlan] = useState("Mid-term");
  const [horizon, setHorizon] = useState("short-term");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugs, setSugs] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [sugsLoading, setSugsLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [yfSymbol, setYfSymbol] = useState(null);
  const [compName, setCompName] = useState("");
  const [livePrice, setLivePrice] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const timer = useRef(null);
  const liveRef = useRef(null);

  // ── PRIMARY: Flask /search_tickers (Yahoo Finance, Indian stocks) ──
  // ── FALLBACK: Finnhub with relaxed exchange filter ──
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length === 0) return [];

    // 1. Try Flask backend first (most reliable for Indian stocks)
    try {
      const r = await fetch(`${FLASK}/search_tickers?q=${encodeURIComponent(q.trim())}`);
      if (r.ok) {
        const d = await r.json();
        const results = d.results || [];
        if (results.length > 0) return results;
      }
    } catch {
      // Flask not available, fall through to Finnhub
    }

    // 2. Fallback: Finnhub with relaxed exchange filter
    try {
      const r = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q.trim())}&token=${FINNHUB_KEY}`
      );
      if (!r.ok) return [];
      const d = await r.json();
      const raw = d.result || [];

      // Relaxed filter — catch all common Finnhub exchange codes for India
      const INDIA_EXCHANGES = new Set([
        "NSE", "BSE", "NSI", "BSE India", "National Stock Exchange of India",
        "Bombay Stock Exchange", "XNSE", "XBOM",
      ]);

      const filtered = raw.filter((s) => {
        const exch = (s.exchange || "").toUpperCase();
        const sym = (s.symbol || "").toUpperCase();
        return (
          INDIA_EXCHANGES.has(s.exchange) ||
          exch.includes("NSE") ||
          exch.includes("BSE") ||
          exch.includes("INDIA") ||
          sym.endsWith(".NS") ||
          sym.endsWith(".BO")
        );
      });

      // Map to standard shape
      return filtered.slice(0, 8).map((s) => {
        const sym = (s.displaySymbol || s.symbol || "").replace(/\.(NS|BO|BSE|NSE)$/i, "").toUpperCase();
        return {
          symbol: sym + ".NS",
          displaySymbol: sym,
          name: s.description || s.name || sym,
          exchange: s.exchange || "NSE",
        };
      });
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    clearInterval(liveRef.current);
    if (!result || !yfSymbol) return;
    const poll = async () => {
      try {
        const r = await fetch(`${FLASK}/live_price?ticker=${encodeURIComponent(yfSymbol)}`);
        const d = await r.json();
        if (!d.error) setLivePrice(d);
      } catch {}
    };
    poll();
    liveRef.current = setInterval(poll, 15000);
    return () => clearInterval(liveRef.current);
  }, [result, yfSymbol]);

  const onTickerChange = async (val) => {
    setTicker(val);
    setYfSymbol(null);
    setCompName("");
    setActiveIdx(-1);
    setNoResults(false);

    if (!val.trim()) {
      setSugs([]);
      setShowSug(false);
      setSugsLoading(false);
      return;
    }

    clearTimeout(timer.current);

    // Show loading immediately so user gets feedback
    setSugsLoading(true);
    setShowSug(true);
    setSugs([]);

    // Debounce: wait 220ms after user stops typing
    timer.current = setTimeout(async () => {
      const results = await fetchSuggestions(val);
      setSugs(results);
      setSugsLoading(false);
      setShowSug(true);
      setNoResults(results.length === 0);
    }, 220);
  };

  const pickSug = (item) => {
    const base = (item.displaySymbol || item.symbol || "")
      .replace(/\.(NS|BO|BSE|NSE)$/i, "")
      .toUpperCase();
    const nsSymbol = base + ".NS";
    const exchLabel = (item.exchange || "NSE").toUpperCase().includes("BSE") ? "BSE" : "NSE";
    setTicker(base);
    setYfSymbol(nsSymbol);
    setCompName(`${item.name || item.displaySymbol} · ${exchLabel}`);
    setSugs([]);
    setShowSug(false);
    setSugsLoading(false);
    setNoResults(false);
    setActiveIdx(-1);
  };

  const clearTicker = () => {
    setTicker("");
    setYfSymbol(null);
    setCompName("");
    setSugs([]);
    setShowSug(false);
    setSugsLoading(false);
    setNoResults(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSug || sugs.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, sugs.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      pickSug(sugs[activeIdx]);
    } else if (e.key === "Escape") {
      setShowSug(false);
      setActiveIdx(-1);
    }
  };

  const run = async () => {
    let sym = yfSymbol || ticker.trim();
    if (!sym) { setError("Please enter a stock ticker."); return; }
    if (!sym.includes(".")) sym = sym.toUpperCase() + ".NS";
    setLoading(true); setError(""); setResult(null); setSuggestions([]); setLivePrice(null);
    try {
      const r = await fetch(`${FLASK}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ticker: sym, ownStock, avgPrice: parseFloat(avgPrice) || 0, quantity: parseInt(quantity) || 0, holdPlan, horizon, chart_range: "1y" }),
      });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      setResult(d);
      try {
        const sr = await fetch(`${FLASK}/suggestions?ticker=${encodeURIComponent(sym)}`);
        const sd = await sr.json();
        setSuggestions(sd.results || []);
      } catch { setSuggestions([]); }
    } catch (e) {
      setError("Analysis failed — make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const ph = result?.price_history || {};
  const closes = (ph.closes || []).map(Number);
  const ma20 = (ph.ma20 || []).map(Number);
  const ma50 = (ph.ma50 || []).map(Number);
  const dates = ph.dates || [];
  const ls = result?.live_stats || {};
  const gs = result?.group_scores || { Momentum: 50, Profitability: 50, Quality: 50, Sentiment: 50, Valuation: 50 };
  const cur = ls.currency || "₹";

  const forecastPrice = result?.forecast_price ?? result?.current_price ?? (closes.length ? closes[closes.length - 1] : null);
  const todayClose = ls.today_close ?? (closes.length ? closes[closes.length - 1] : null);
  const prevClose = ls.prev_close ?? (closes.length > 1 ? closes[closes.length - 2] : todayClose);
  const pct = todayClose && prevClose && prevClose !== 0 ? ((todayClose - prevClose) / prevClose * 100) : null;
  const priceUp = pct !== null ? pct >= 0 : true;

  const quality = gs.Quality ?? 50;
  const riskPct = Math.max(6, Math.min(96, 100 - quality));
  const riskLevel = riskPct < 33 ? "Low" : riskPct < 66 ? "Medium" : "High";
  const mc = ls.market_cap;
  const capLabel = mc ? (mc > 1e12 ? "Large Cap" : mc > 2e11 ? "Mid Cap" : "Small Cap") : null;
  const volLabel = quality >= 60 ? "Low Vol" : quality >= 40 ? "Med Vol" : "High Vol";

  const f52h = ls.fifty_two_week_high || (closes.length ? Math.max(...closes) : null);
  const f52l = ls.fifty_two_week_low || (closes.length ? Math.min(...closes) : null);

  const inp = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border2)", borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13 };
  const sel = { ...inp, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* TOPBAR */}
      <header style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: "rgba(8,10,15,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#22d3ee,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 800, fontSize: 15, color: "#fff" }}>α</div>
          <span style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>ALPHA PREDICT</span>
          <span style={{ fontSize: 10, fontFamily: "var(--fm)", color: "var(--muted)", letterSpacing: 1, marginLeft: 4 }}>DASHBOARD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--fm)" }}>{user.username}</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(34,211,238,0.3),rgba(99,102,241,0.3))", border: "1px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13 }}>{user.name[0]}</div>
          <button onClick={onLogout} style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#f43f5e", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontFamily: "var(--fm)" }}>LOGOUT</button>
        </div>
      </header>

      {/* LIVE PRICE BANNER */}
      {livePrice && (
        <div style={{ background: "rgba(14,17,24,0.97)", borderBottom: "1px solid rgba(34,211,238,0.15)", padding: "6px 18px", display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--muted)" }}>LIVE · {yfSymbol}</span>
          <span style={{ fontFamily: "var(--fm)", fontWeight: 600, fontSize: 15, color: "var(--accent)" }}>₹{livePrice.price.toFixed(2)}</span>
          <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: livePrice.change_pct >= 0 ? "var(--green)" : "var(--red)" }}>
            {livePrice.change_pct >= 0 ? "▲" : "▼"} {Math.abs(livePrice.change_pct).toFixed(2)}%
          </span>
          <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--muted)" }}>H: ₹{livePrice.high.toFixed(2)} · L: ₹{livePrice.low.toFixed(2)}</span>
          <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--muted)" }}>Vol: {Number(livePrice.volume).toLocaleString("en-IN")}</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--fm)", fontSize: 10, color: "rgba(34,211,238,0.4)", animation: "pulse 2s ease-in-out infinite" }}>● LIVE · refreshes every 15s</span>
        </div>
      )}

      {/* TICKER TAPE */}
      <div style={{ height: 26, background: "rgba(14,17,24,0.9)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 40, animation: "ticker 22s linear infinite", whiteSpace: "nowrap", paddingLeft: "100%" }}>
          {[...FEED, ...FEED].map((t, i) => <span key={i} style={{ fontSize: 10, fontFamily: "var(--fm)", color: t.includes("+") ? "#10b981" : "#f43f5e", letterSpacing: 0.5 }}>{t}</span>)}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, padding: 16, display: "grid", gridTemplateColumns: "290px 1fr", gap: 14, maxWidth: 1400, margin: "0 auto", width: "100%" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Input Card */}
          <Card style={{ padding: 16 }}>
            <CT>◈ Stock Analysis Input</CT>

            {/* ── TICKER INPUT WITH AUTOCOMPLETE ── */}
            <div style={{ marginBottom: 10, position: "relative" }}>
              <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 5 }}>STOCK TICKER</label>
              <div style={{ position: "relative" }}>
                <input
                  value={ticker}
                  onChange={(e) => onTickerChange(e.target.value)}
                  onFocus={() => {
                    if (ticker.trim() && (sugs.length > 0 || sugsLoading)) setShowSug(true);
                  }}
                  onBlur={() => setTimeout(() => { setShowSug(false); }, 220)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type name or symbol — e.g. SBI, TCS, Reliance"
                  style={{ ...inp, paddingRight: ticker ? "30px" : "12px" }}
                  autoComplete="off"
                  spellCheck={false}
                />
                {ticker && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); clearTicker(); }}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", padding: 2, lineHeight: 1 }}
                  >✕</button>
                )}
              </div>

              {/* Selected company label */}
              {compName && !showSug && (
                <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 4, fontFamily: "var(--fm)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "var(--green)" }}>✓</span> {compName}
                </div>
              )}

              {/* ── DROPDOWN ── */}
              {showSug && (sugsLoading || sugs.length > 0 || noResults) && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: "#0d1017",
                  border: "1px solid rgba(34,211,238,0.2)",
                  borderRadius: 10,
                  maxHeight: 280, overflowY: "auto",
                  zIndex: 9999,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,211,238,0.05)",
                }}>

                  {/* Loading state */}
                  {sugsLoading && (
                    <div style={{ padding: "14px 14px", display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 12 }}>
                      <span className="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid var(--accent)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--fm)", letterSpacing: 0.5 }}>Searching NSE & BSE…</span>
                    </div>
                  )}

                  {/* No results */}
                  {!sugsLoading && noResults && (
                    <div style={{ padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>No results for "{ticker}"</div>
                      <div style={{ fontSize: 10, color: "rgba(100,116,139,0.6)", fontFamily: "var(--fm)" }}>Try the full company name or NSE ticker symbol</div>
                    </div>
                  )}

                  {/* Results */}
                  {!sugsLoading && sugs.length > 0 && (
                    <>
                      {/* Header */}
                      <div style={{ padding: "7px 12px 5px", fontSize: 9, fontFamily: "var(--fm)", color: "rgba(100,116,139,0.7)", letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{sugs.length} RESULT{sugs.length !== 1 ? "S" : ""}</span>
                        <span style={{ color: "var(--accent)", opacity: 0.6 }}>NSE · BSE</span>
                      </div>

                      {sugs.map((s, i) => {
                        const sym = s.displaySymbol || (s.symbol || "").replace(/\.(NS|BO)$/i, "");
                        const name = s.name || s.description || sym;
                        const exch = (s.exchange || "NSE").toUpperCase().includes("BSE") ? "BSE" : "NSE";
                        const isActive = i === activeIdx;
                        return (
                          <div
                            key={i}
                            onMouseDown={(e) => { e.preventDefault(); pickSug(s); }}
                            onMouseEnter={() => setActiveIdx(i)}
                            style={{
                              padding: "10px 12px",
                              cursor: "pointer",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              background: isActive
                                ? "linear-gradient(90deg,rgba(34,211,238,0.07),rgba(99,102,241,0.04))"
                                : "transparent",
                              borderLeft: isActive ? "2px solid rgba(34,211,238,0.5)" : "2px solid transparent",
                              transition: "all .1s",
                            }}
                          >
                            {/* Ticker pill */}
                            <div style={{
                              flexShrink: 0,
                              background: isActive ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isActive ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.08)"}`,
                              borderRadius: 5, padding: "3px 8px",
                              minWidth: 70, textAlign: "center",
                              transition: "all .1s",
                            }}>
                              <span style={{ fontFamily: "var(--fm)", fontSize: 11, fontWeight: 600 }}>
                                <HighlightMatch text={sym} query={ticker} color={isActive ? "var(--accent)" : "#94a3b8"} />
                              </span>
                            </div>

                            {/* Company name + exchange badge */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isActive ? "var(--text)" : "#94a3b8" }}>
                                <HighlightMatch text={name} query={ticker} color={isActive ? "var(--text)" : "#94a3b8"} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                <span style={{
                                  fontSize: 9, fontFamily: "var(--fm)", letterSpacing: 0.5,
                                  padding: "1px 5px", borderRadius: 3,
                                  background: exch === "NSE" ? "rgba(34,211,238,0.08)" : "rgba(99,102,241,0.08)",
                                  color: exch === "NSE" ? "var(--accent)" : "var(--accent2)",
                                  border: `1px solid ${exch === "NSE" ? "rgba(34,211,238,0.15)" : "rgba(99,102,241,0.15)"}`,
                                }}>{exch}</span>
                              </div>
                            </div>

                            {/* Enter hint */}
                            {isActive && (
                              <span style={{ color: "rgba(34,211,238,0.4)", fontSize: 11, flexShrink: 0, fontFamily: "var(--fm)" }}>↵</span>
                            )}
                          </div>
                        );
                      })}

                      {/* Footer */}
                      <div style={{ padding: "6px 12px", fontSize: 9, fontFamily: "var(--fm)", color: "rgba(100,116,139,0.35)", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 14 }}>
                        <span>↑↓ navigate</span>
                        <span>↵ select</span>
                        <span>Esc close</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* ── END TICKER INPUT ── */}

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 5 }}>OWN THIS STOCK?</label>
              <select value={ownStock} onChange={(e) => setOwnStock(e.target.value)} style={sel}><option>No</option><option>Yes</option></select>
            </div>

            {ownStock === "Yes" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 4 }}>AVG PRICE (₹)</label>
                  <input value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} placeholder="e.g. 2450" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 4 }}>QUANTITY</label>
                  <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 10" style={inp} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 5 }}>HOLD PLAN</label>
              <select value={holdPlan} onChange={(e) => setHoldPlan(e.target.value)} style={sel}><option>Short-term</option><option>Mid-term</option><option>Long-term</option></select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, display: "block", marginBottom: 5 }}>HORIZON</label>
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)} style={sel}>
                <option value="short-term">{"< 6 months"}</option>
                <option value="mid-term">6–12 months</option>
                <option value="long-term">{"> 1 year"}</option>
              </select>
            </div>

            {error && <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 7, padding: "8px 11px", fontSize: 12, color: "#f43f5e", marginBottom: 10 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={run} disabled={loading} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: loading ? "rgba(34,211,238,0.2)" : "linear-gradient(135deg,#22d3ee,#6366f1)", color: "#fff", fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: loading ? "none" : "0 4px 14px rgba(34,211,238,0.25)" }}>
                {loading ? <><span className="spin" style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block" }} />Running...</> : "▶ Run Analysis"}
              </button>
              <button onClick={() => window.open(`${FLASK}/predictions.csv`)} style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid var(--border2)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 11, fontFamily: "var(--fm)" }}>CSV</button>
            </div>
          </Card>

          {/* Snapshot */}
          <Card style={{ padding: 16 }}>
            <CT>Current Stock Snapshot</CT>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", marginBottom: 4 }}>Last / Today Close</div>
                <div style={{ fontFamily: "var(--fm)", fontWeight: 600, fontSize: 17, color: "var(--accent)" }}>{todayClose != null ? `${cur}${Number(todayClose).toFixed(2)}` : "—"}</div>
                {pct !== null && <div style={{ fontSize: 11, color: priceUp ? "var(--green)" : "var(--red)", marginTop: 2, fontFamily: "var(--fm)" }}>{priceUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}% vs last close</div>}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", marginBottom: 4 }}>52W High / Low</div>
                {f52h != null ? (
                  <>
                    <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--green)" }}>{cur}{Number(f52h).toFixed(2)}</div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--red)" }}>{cur}{Number(f52l).toFixed(2)}</div>
                  </>
                ) : <div style={{ color: "var(--muted)", fontSize: 12 }}>—</div>}
                {mc && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, fontFamily: "var(--fm)" }}>Market Cap: {mc >= 1e12 ? (mc / 1e12).toFixed(1) + "T" : mc >= 1e9 ? (mc / 1e9).toFixed(0) + "B" : "—"}</div>}
              </div>
            </div>
            {closes.length > 1 && <Spark data={closes.slice(-60)} />}
          </Card>

          {/* Risk */}
          <Card style={{ padding: 16 }}>
            <CT>Risk & Tags</CT>
            <div style={{ marginBottom: 6, fontSize: 11, color: "var(--muted)" }}>Risk Level</div>
            <RiskMeter level={riskLevel} />
            <div style={{ marginTop: 10, fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15, color: riskLevel === "Low" ? "var(--green)" : riskLevel === "High" ? "var(--red)" : "var(--amber)" }}>{riskLevel}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              {capLabel && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontFamily: "var(--fm)" }}>{capLabel}</span>}
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)", color: "var(--accent)", fontFamily: "var(--fm)" }}>{volLabel}</span>
            </div>
          </Card>

          {/* Quick AI Summary */}
          <Card style={{ padding: 16 }}>
            <CT>Quick AI Summary</CT>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
              {result ? (
                <>
                  <div style={{ marginBottom: 4 }}>Model decision: <span style={{ color: "var(--text)", fontWeight: 600 }}>{result.decision || "—"}</span></div>
                  <div style={{ marginBottom: 4 }}>Composite score: <span style={{ color: "var(--text)", fontWeight: 600 }}>{result.score != null ? `${result.score}/100` : "—"}</span></div>
                  {result.model_confidence && <div style={{ marginBottom: 4 }}>Confidence: <span style={{ color: "var(--text)", fontWeight: 600 }}>{result.model_confidence}</span></div>}
                  {result.recommendation_primary && <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.5, color: "var(--text)" }}>{result.recommendation_primary}</div>}
                  {result.strategy_summary && <div style={{ marginTop: 6, fontSize: 10, fontStyle: "italic", color: "var(--muted)" }}>{result.strategy_summary}</div>}
                </>
              ) : <span>No analysis run yet.</span>}
            </div>
          </Card>

          {/* News (sidebar) */}
          <Card style={{ padding: 16 }}>
            <CT>Latest Headlines</CT>
            {result?.news?.length > 0 ? result.news.slice(0, 4).map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.opacity = ".75"} onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
                <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 9, fontFamily: "var(--fm)", color: "var(--muted)" }}>{n.source}</div>
              </a>
            )) : <div style={{ fontSize: 12, color: "var(--muted)" }}>No news available.</div>}
          </Card>

          {/* Price Stats */}
          <Card style={{ padding: 16 }}>
            <CT>Price Stats (Today)</CT>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Open", ls.today_open],
                ["Prev Close", ls.prev_close],
                ["Volume", ls.today_volume, "vol"],
                ["Lower Circuit (≈ -5%)", ls.lower_circuit],
                ["Upper Circuit (≈ +5%)", ls.upper_circuit],
              ].map(([k, v, t]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--fm)", color: "var(--text)" }}>
                    {v != null ? (t === "vol" ? Number(v).toLocaleString() : `${cur}${Number(v).toFixed(2)}`) : <span style={{ color: "var(--muted)" }}>—</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!result && !loading && (
            <Card style={{ padding: 56, textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14, animation: "float 3s ease-in-out infinite" }}>📊</div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Ready to Analyse</div>
              <div style={{ color: "var(--muted)", fontSize: 13, maxWidth: 320, margin: "0 auto", lineHeight: 1.7 }}>Enter a stock ticker on the left and click Run Analysis to get AI-powered signals.</div>
            </Card>
          )}
          {loading && (
            <Card style={{ padding: 56, textAlign: "center" }}>
              <div className="spin" style={{ width: 38, height: 38, border: "3px solid rgba(34,211,238,0.15)", borderTop: "3px solid var(--accent)", borderRadius: "50%", margin: "0 auto 14px" }} />
              <div style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--muted)" }}>Fetching data & running ensemble model…</div>
            </Card>
          )}

          {result && (
            <>
              {/* KPIs + Decision */}
              <Card style={{ padding: 18 }} delay={0}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    ["FORECAST PRICE", forecastPrice != null ? `${cur}${Number(forecastPrice).toFixed(2)}` : "—", "var(--accent)"],
                    ["FORECAST DATE", result.forecast_date || "—", "var(--text)"],
                    ["COMPOSITE SCORE", result.score != null ? `${result.score}/100` : "—", result.score >= 65 ? "var(--green)" : result.score <= 40 ? "var(--red)" : "var(--amber)"],
                    ["MODEL CONFIDENCE", result.model_confidence || "—", "var(--accent2)"],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 0.5, marginBottom: 5 }}>{label}</div>
                      <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--border)", gap: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--fm)" }}>MODEL DECISION:</div>
                  <Badge decision={result.decision} />
                </div>
              </Card>

              {/* Radar + Factor Table */}
              <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>
                <Card style={{ padding: 16 }} delay={60}>
                  <CT>Factor Radar Chart</CT>
                  <Radar scores={gs} />
                </Card>
                <Card style={{ padding: 16 }} delay={100}>
                  <CT>Factor Summary</CT>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 80px", gap: 4, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(99,102,241,0.3)" }}>
                    {["FACTOR", "SCORE", "STATUS"].map((h) => <div key={h} style={{ fontSize: 10, fontFamily: "var(--fm)", color: "var(--accent2)", fontWeight: 700, letterSpacing: 0.5 }}>{h}</div>)}
                  </div>
                  {Object.entries(gs).map(([k, v]) => {
                    const color = v >= 70 ? "#10b981" : v >= 45 ? "#f59e0b" : "#f43f5e";
                    const status = v >= 70 ? "GOOD" : v >= 45 ? "AVERAGE" : "WEAK";
                    return (
                      <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 50px 80px", gap: 4, alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 4 }}>{k}</div>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                            <div style={{ height: "100%", width: `${v}%`, background: color, borderRadius: 99, transition: "width 1s cubic-bezier(.16,1,.3,1)" }} />
                          </div>
                        </div>
                        <div style={{ fontFamily: "var(--fm)", fontSize: 11, color, textAlign: "right" }}>{v}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color, textAlign: "right", fontFamily: "var(--fm)", letterSpacing: 1 }}>{status}</div>
                      </div>
                    );
                  })}
                </Card>
              </div>

              {/* Price Chart */}
              <Card style={{ padding: "16px 18px 12px" }} delay={140}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <CT>Price Chart (MA20 + MA50)</CT>
                  {closes.length > 0 && <div style={{ width: 80, height: 28 }}><Spark data={closes.slice(-30)} /></div>}
                </div>
                <PriceChart closes={closes} ma20={ma20} ma50={ma50} dates={dates} />
              </Card>

              {/* Similar Companies */}
              {suggestions.length > 0 && (
                <Card style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)", letterSpacing: 1, marginBottom: 8 }}>SIMILAR COMPANIES</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {suggestions.map((s, i) => (
                      <button key={i}
                        onClick={() => { setTicker(s.displaySymbol); setYfSymbol(s.symbol); setCompName(s.displaySymbol + " · NSE"); setSuggestions([]); }}
                        style={{ fontSize: 11, padding: "4px 12px", borderRadius: 4, background: "var(--bg)", border: "1px solid var(--border2)", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--fm)", letterSpacing: 0.5 }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border2)"}>
                        {s.displaySymbol}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Reasons + Recommendation */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Card style={{ padding: 16 }} delay={180}>
                  <CT>Reasons for Decision</CT>
                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {(result.reasons || []).length > 0 ? (result.reasons || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 11, lineHeight: 1.5, color: "var(--muted)" }}>
                        <span style={{ color: "var(--accent)", flexShrink: 0 }}>→</span><span>{r}</span>
                      </div>
                    )) : <div style={{ fontSize: 12, color: "var(--muted)" }}>No reasons available.</div>}
                  </div>
                </Card>
                <Card style={{ padding: 16 }} delay={200}>
                  <CT>Recommendation</CT>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, lineHeight: 1.6, color: "var(--text)" }}>{result.recommendation_primary || "—"}</div>
                  {(result.recommendation_options || []).map((opt, i) => <div key={i} style={{ fontSize: 11, color: "var(--muted)", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.04)", lineHeight: 1.5 }}>{opt}</div>)}
                  {result.strategy_summary && <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(99,102,241,0.07)", borderRadius: 8, fontSize: 11, color: "var(--muted)", lineHeight: 1.6, fontStyle: "italic" }}>{result.strategy_summary}</div>}
                </Card>
              </div>

              {/* All News */}
              {result.news?.length > 0 && (
                <Card style={{ padding: 16 }} delay={240}>
                  <CT>Latest News</CT>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
                    {result.news.map((n, i) => (
                      <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 9, textDecoration: "none", transition: "border-color .2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}>
                        <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5, marginBottom: 5 }}>{n.title}</div>
                        <div style={{ fontSize: 9, fontFamily: "var(--fm)", color: "var(--muted)" }}>{n.source}</div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT — Landing → Login → Dashboard
══════════════════════════════════════════ */
export default function App() {
  injectCSS();
  const [page, setPage] = useState("landing"); // "landing" | "login" | "dashboard"
  const [user, setUser] = useState(null);

  if (page === "landing") return <Landing onGetStarted={() => setPage("login")} />;
  if (page === "login")
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          setPage("dashboard");
        }}
      />
    );
  return (
    <Dashboard
      user={user}
      onLogout={() => {
        localStorage.removeItem("token");
        setUser(null);
        setPage("landing");
      }}
    />
  );
}