'use client'
import { useState, useEffect } from "react";

type FormField = { value: string; error: string; touched: boolean };
type FormState = { email: FormField; password: FormField };

const validateLoginId = (v: string) =>
    !v ? "Login ID is required" : v.length < 3 ? "Login ID must be at least 3 characters" : "";

const validatePassword = (v: string) =>
    !v ? "Password is required" : v.length < 6 ? "Password must be at least 6 characters" : "";

/* ─── colour tokens ──────────────────────────────────────── */
const T = {
    dark: {
        pageBg: "linear-gradient(135deg, #0a0000 0%, #110000 50%, #080000 100%)",
        blob1: "rgba(180,0,0,0.22)",
        blob2: "rgba(120,0,0,0.16)",
        card: "rgba(15,3,3,0.88)",
        cardBorder: "rgba(200,0,0,0.25)",
        cardShadow: "0 32px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(180,0,0,0.12)",
        text: "#f7e8e8",
        subtext: "#7a4444",
        label: "#9a5a5a",
        inputBg: "rgba(255,20,20,0.04)",
        inputBorder: "rgba(180,0,0,0.25)",
        focusBorder: "#dd1111",
        focusShadow: "0 0 0 3px rgba(200,0,0,0.20)",
        inputText: "#f7e4e4",
        iconColor: "#6a2020",
        eyeColor: "#7a3030",
        link: "#e03030",
        muted: "#4a2020",
        disabledBg: "rgba(255,255,255,0.04)",
        disabledText: "#3a1818",
        divider: "rgba(180,0,0,0.18)",
        successBtn: "#e03030",
        toggleBg: "rgba(180,0,0,0.10)",
        toggleBorder: "rgba(180,0,0,0.22)",
        toggleColor: "#d08080",
        gridColor: "rgba(180,0,0,0.07)",
        accentGrad: "linear-gradient(135deg, #6a0000 0%, #bb0000 55%, #ee1111 100%)",
        accentShadow: "0 8px 32px rgba(180,0,0,0.55)",
        accentHover: "0 14px 40px rgba(180,0,0,0.70)",
        logoGrad: "linear-gradient(150deg, #4a0000, #990000, #ee0000)",
        logoShadow: "0 8px 28px rgba(160,0,0,0.50)",
        topBar: "linear-gradient(90deg, transparent, #6a0000, #dd0000, #6a0000, transparent)",
        errColor: "#ff5050",
    },
    light: {
        pageBg: "linear-gradient(135deg, #fff0f0 0%, #ffe8e8 50%, #fff5f5 100%)",
        blob1: "rgba(200,0,0,0.09)",
        blob2: "rgba(160,0,0,0.07)",
        card: "rgba(255,255,255,0.85)",
        cardBorder: "rgba(255,255,255,0.95)",
        cardShadow: "0 24px 80px rgba(160,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)",
        text: "#1a0000",
        subtext: "#8a4444",
        label: "#5a1818",
        inputBg: "rgba(255,255,255,0.98)",
        inputBorder: "rgba(0,0,0,0.12)",
        focusBorder: "#cc0000",
        focusShadow: "0 0 0 3px rgba(200,0,0,0.12)",
        inputText: "#1a0000",
        iconColor: "#c09090",
        eyeColor: "#9a6060",
        link: "#cc0000",
        muted: "#9a6060",
        disabledBg: "rgba(0,0,0,0.05)",
        disabledText: "#bbb",
        divider: "rgba(0,0,0,0.08)",
        successBtn: "#cc0000",
        toggleBg: "rgba(0,0,0,0.05)",
        toggleBorder: "rgba(0,0,0,0.10)",
        toggleColor: "#333",
        gridColor: "rgba(200,0,0,0.04)",
        accentGrad: "linear-gradient(135deg, #8b0000 0%, #cc0000 55%, #ee2020 100%)",
        accentShadow: "0 8px 28px rgba(160,0,0,0.40)",
        accentHover: "0 14px 36px rgba(160,0,0,0.55)",
        logoGrad: "linear-gradient(150deg, #6a0000, #aa0000, #ee2020)",
        logoShadow: "0 8px 24px rgba(140,0,0,0.40)",
        topBar: "linear-gradient(90deg, transparent, #990000, #ee0000, #990000, transparent)",
        errColor: "#e03030",
    },
} as const;

type Tokens = typeof T.dark;

/* ═══════════════════════════════════════════════════════════ */
export default function LoginPage() {
    const [form, setForm] = useState<FormState>({
        email: { value: "", error: "", touched: false },
        password: { value: "", error: "", touched: false },
    });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const update = (f: keyof FormState, v: string) => {
        const err = f === "email" ? validateLoginId(v) : validatePassword(v);
        setForm(p => ({ ...p, [f]: { value: v, error: err, touched: true } }));
    };
    const blur = (f: keyof FormState) => {
        const err = f === "email" ? validateLoginId(form[f].value) : validatePassword(form[f].value);
        setForm(p => ({ ...p, [f]: { ...p[f], touched: true, error: err } }));
    };

    const valid = !validateLoginId(form.email.value) && !validatePassword(form.password.value);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setForm((p: FormState) => ({
            email: { ...p.email, touched: true, error: validateLoginId(p.email.value) },
            password: { ...p.password, touched: true, error: validatePassword(p.password.value) },
        }));
        if (!valid) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: form.email.value, password: form.password.value })
            });
            const data = await res.json();

            if (!res.ok) {
                setForm((p: FormState) => ({ ...p, password: { ...p.password, error: data.error || "Login failed" } }));
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1200);
        } catch (err) {
            setForm((p: FormState) => ({ ...p, password: { ...p.password, error: "Network error" } }));
            setLoading(false);
        }
    };

    const tk = isDark ? T.dark : T.light;

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', 'Syne', sans-serif",
            background: tk.pageBg, transition: "background 0.4s",
            padding: "20px", position: "relative", overflow: "hidden",
        }}>

            {/* Blobs */}
            <div style={{
                position: "fixed", top: "-120px", left: "-80px", width: "460px", height: "460px",
                borderRadius: "50%", background: tk.blob1, filter: "blur(100px)", pointerEvents: "none",
                animation: "floatA 9s ease-in-out infinite"
            }} />
            <div style={{
                position: "fixed", bottom: "-100px", right: "-70px", width: "380px", height: "380px",
                borderRadius: "50%", background: tk.blob2, filter: "blur(90px)", pointerEvents: "none",
                animation: "floatB 12s ease-in-out infinite"
            }} />

            {/* Grid */}
            <div style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                backgroundImage: `linear-gradient(${tk.gridColor} 1px,transparent 1px),linear-gradient(90deg,${tk.gridColor} 1px,transparent 1px)`,
                backgroundSize: "52px 52px"
            }} />

            {/* Vertical ray */}
            <div style={{
                position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "1px", height: "100vh", pointerEvents: "none",
                background: isDark
                    ? "linear-gradient(180deg,rgba(180,0,0,0.35) 0%,rgba(180,0,0,0.05) 60%,transparent 100%)"
                    : "linear-gradient(180deg,rgba(200,0,0,0.18) 0%,transparent 60%)"
            }} />

            {/* Theme toggle */}
            <button onClick={() => setIsDark(!isDark)} title="Toggle theme" style={{
                position: "fixed", top: "20px", right: "20px",
                background: tk.toggleBg, border: `1px solid ${tk.toggleBorder}`,
                borderRadius: "50px", cursor: "pointer", padding: "8px 16px", fontSize: "16px",
                backdropFilter: "blur(8px)", transition: "all 0.2s", color: tk.toggleColor,
            }}>{isDark ? "☀️" : "🌙"}</button>

            {/* Card */}
            <div style={{
                width: "100%", maxWidth: "420px",
                background: tk.card, backdropFilter: "blur(32px)",
                border: `1px solid ${tk.cardBorder}`, borderRadius: "20px",
                padding: "clamp(28px,6vw,48px)", boxShadow: tk.cardShadow,
                animation: mounted ? "slideUp 0.55s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                position: "relative",
            }}>

                {/* Glowing top bar */}
                <div style={{
                    position: "absolute", top: 0, left: "8%", right: "8%", height: "2px",
                    borderRadius: "0 0 4px 4px", background: tk.topBar
                }} />

                {success
                    ? <SuccessView tk={tk} onReset={() => {
                        setSuccess(false);
                        setForm({ email: { value: "", error: "", touched: false }, password: { value: "", error: "", touched: false } });
                    }} />
                    : <>
                        {/* Header */}
                        <div style={{ marginBottom: "32px", textAlign: "center" }}>
                            <div style={{
                                width: "56px", height: "56px", margin: "0 auto 18px", borderRadius: "14px",
                                background: tk.logoGrad, boxShadow: tk.logoShadow,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "26px", color: "#fff",
                            }}>⬡</div>
                            <h1 style={{
                                fontSize: "clamp(24px,4vw,30px)", fontWeight: 900, margin: "0 0 6px",
                                color: tk.text, letterSpacing: "3px", textTransform: "uppercase",
                            }}>Welcome Back</h1>
                            <p style={{ margin: 0, fontSize: "13px", color: tk.subtext, fontFamily: "'DM Sans',sans-serif" }}>
                                Sign in to continue your session
                            </p>
                        </div>

                        <form onSubmit={submit} noValidate>
                            <Field label="Login ID" error={form.email.touched ? form.email.error : ""} tk={tk}>
                                <Input type="text" placeholder="Enter your login ID"
                                    value={form.email.value} hasError={!!(form.email.touched && form.email.error)}
                                    tk={tk} icon="👤" onChange={v => update("email", v)} onBlur={() => blur("email")} />
                            </Field>

                            <Field label="Password" error={form.password.touched ? form.password.error : ""} tk={tk}>
                                <Input type={showPwd ? "text" : "password"} placeholder="••••••••"
                                    value={form.password.value} hasError={!!(form.password.touched && form.password.error)}
                                    tk={tk} icon="🔒" onChange={v => update("password", v)} onBlur={() => blur("password")}
                                    rightSlot={
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            style={{
                                                background: "none", border: "none", cursor: "pointer",
                                                fontSize: "16px", padding: "0 4px", color: tk.eyeColor, lineHeight: 1
                                            }}>
                                            {showPwd ? "🙈" : "👁"}
                                        </button>
                                    } />
                            </Field>
                            {/* Submit */}
                            <button type="submit" disabled={!valid || loading} style={{
                                width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                                cursor: valid && !loading ? "pointer" : "not-allowed",
                                background: valid ? tk.accentGrad : tk.disabledBg,
                                color: valid ? "#fff" : tk.disabledText,
                                fontSize: "14px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase",
                                fontFamily: "'Bebas Neue','Syne',sans-serif",
                                transition: "all 0.25s ease",
                                boxShadow: valid ? tk.accentShadow : "none",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            }}
                                onMouseEnter={e => { if (valid && !loading) { const b = e.currentTarget as HTMLButtonElement; b.style.transform = "translateY(-2px)"; b.style.boxShadow = tk.accentHover; } }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = "translateY(0)"; b.style.boxShadow = valid ? tk.accentShadow : "none"; }}>
                                {loading ? <Spinner /> : "Sign In  →"}
                            </button>
                        </form>          </>
                }
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(30px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes floatA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(28px,18px)} }
        @keyframes floatB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-28px)} }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes checkPop {
          0%  { transform:scale(0) rotate(-20deg); opacity:0; }
          70% { transform:scale(1.15) rotate(5deg); }
          100%{ transform:scale(1) rotate(0); opacity:1; }
        }
        @keyframes pulse {
          0%,100%{ box-shadow:0 8px 28px rgba(180,0,0,0.50); }
          50%    { box-shadow:0 8px 52px rgba(220,0,0,0.80); }
        }
      `}</style>
        </div>
    );
}

/* ── Field wrapper ──────────────────────────────────────── */
function Field({ label, error, tk, children }: {
    label: string; error: string; tk: Tokens; children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: "18px" }}>
            <label style={{
                display: "block", marginBottom: "7px",
                fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                color: tk.label, fontFamily: "'DM Sans',sans-serif"
            }}>
                {label}
            </label>
            {children}
            {error && (
                <p style={{
                    margin: "6px 0 0", fontSize: "12px", fontWeight: 600,
                    color: tk.errColor, display: "flex", alignItems: "center", gap: "4px",
                    fontFamily: "'DM Sans',sans-serif"
                }}>
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}

/* ── Input ──────────────────────────────────────────────── */
function Input({ type, placeholder, value, hasError, tk, onChange, onBlur, icon, rightSlot }: {
    type: string; placeholder: string; value: string; hasError: boolean;
    tk: Tokens; onChange: (v: string) => void; onBlur: () => void;
    icon: string; rightSlot?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    const border = hasError ? "#cc1010" : focused ? tk.focusBorder : tk.inputBorder;
    const shadow = focused ? (hasError ? "0 0 0 3px rgba(200,0,0,0.22)" : tk.focusShadow) : "none";

    return (
        <div style={{
            display: "flex", alignItems: "center",
            background: tk.inputBg, border: `1.5px solid ${border}`, borderRadius: "12px",
            overflow: "hidden", transition: "border-color 0.2s,box-shadow 0.2s", boxShadow: shadow
        }}>
            <span style={{ padding: "0 12px", fontSize: "15px", color: tk.iconColor, userSelect: "none" }}>
                {icon}
            </span>
            <input type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); onBlur(); }}
                style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    padding: "13px 0", fontSize: "15px", color: tk.inputText,
                    fontFamily: "'DM Sans',sans-serif"
                }} />
            {rightSlot && <div style={{ paddingRight: "10px" }}>{rightSlot}</div>}
        </div>
    );
}

/* ── Spinner ─────────────────────────────────────────────── */
function Spinner() {
    return <span style={{
        width: "18px", height: "18px", borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.25)", borderTopColor: "#fff",
        display: "inline-block", animation: "spin 0.7s linear infinite"
    }} />;
}

/* ── Success screen ──────────────────────────────────────── */
function SuccessView({ tk, onReset }: { tk: Tokens; onReset: () => void }) {
    return (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
                width: "68px", height: "68px", margin: "0 auto 20px", borderRadius: "50%",
                background: "linear-gradient(135deg,#6a0000,#cc0000)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "30px", color: "#fff",
                boxShadow: "0 8px 32px rgba(160,0,0,0.55)",
                animation: "checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, pulse 2s 0.6s ease-in-out infinite",
            }}>✓</div>
            <h2 style={{
                fontSize: "28px", fontWeight: 900, margin: "0 0 8px", color: tk.text,
                letterSpacing: "3px", textTransform: "uppercase"
            }}>
                You're In!
            </h2>
            <p style={{
                margin: "0 0 28px", color: tk.subtext, fontSize: "13px",
                fontFamily: "'DM Sans',sans-serif"
            }}>
                Successfully authenticated. Redirecting…
            </p>
            <button onClick={onReset} style={{
                background: "none",
                border: `1.5px solid ${tk.cardBorder}`, borderRadius: "10px",
                padding: "10px 28px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                color: tk.successBtn, letterSpacing: "1.5px", textTransform: "uppercase",
                fontFamily: "'Bebas Neue','DM Sans',sans-serif", transition: "all 0.2s"
            }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Back to Login
            </button>
        </div>
    );
}
