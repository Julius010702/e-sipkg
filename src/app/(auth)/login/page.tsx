"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/* ══════════════════════════════════════════════
   CSS — Responsif semua breakpoint
══════════════════════════════════════════════ */
const loginCSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

@keyframes float {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  33%  { transform: translateY(-12px) rotate(1deg); }
  66%  { transform: translateY(-6px) rotate(-1deg); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(196,30,58,0.4); }
  70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(196,30,58,0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(196,30,58,0); }
}
@keyframes particle {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-120px) translateX(var(--dx)) scale(0); opacity: 0; }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes badge-in {
  from { opacity: 0; transform: scale(0.8) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
@keyframes correct-flash {
  0%   { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.6); }
  100% { background: #f0fdf4; border-color: rgba(34,197,94,0.4); }
}
@keyframes countdown-pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
@keyframes progress-flash {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.7; }
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

/* ── Helpers ── */
.float-logo { animation: float 6s ease-in-out infinite; }
.shimmer-text {
  background: linear-gradient(90deg,#F5C518 0%,#fff 40%,#F5C518 60%,#fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; animation: shimmer 4s linear infinite;
}
.fade-up   { animation: fadeInUp  0.7s ease both; }
.fade-left { animation: fadeInLeft 0.8s ease both; }
.pulse-logo { animation: pulse-ring 2.5s ease-in-out infinite; }
.spin-deco  { animation: spin-slow 20s linear infinite; }
.slide-in   { animation: slide-in 0.6s ease both; }
.badge-in   { animation: badge-in 0.5s ease both; }
.particle   {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  animation: particle 3s ease-in infinite;
}

/* ── Tombol ── */
.btn-login {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg,#C41E3A 0%,#9b1530 100%);
  transition: all 0.3s ease; font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(196,30,58,0.45); }
.btn-login:active:not(:disabled) { transform: translateY(0); }
.btn-login:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Input ── */
.input-field {
  transition: all 0.25s ease; border: 1.5px solid #e5e7eb; background: #fafafa;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.input-field:focus { border-color: #C41E3A; background: #fff; box-shadow: 0 0 0 3px rgba(196,30,58,0.1); outline: none; }
.feature-item { transition: all 0.25s ease; }
.feature-item:hover { transform: translateX(6px); }
.card-login { animation: slide-in 0.7s ease both; animation-delay: 0.2s; }

/* ── Captcha ── */
.captcha-wrap {
  border-radius: 14px; border: 1.5px solid #e5e7eb; background: #fafafa; overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.captcha-wrap.captcha-valid { border-color: rgba(34,197,94,0.5); box-shadow: 0 0 0 3px rgba(34,197,94,0.1); animation: correct-flash 0.4s ease forwards; }
.captcha-wrap.captcha-error { border-color: rgba(239,68,68,0.6); box-shadow: 0 0 0 3px rgba(239,68,68,0.1); animation: shake 0.4s ease; }
.captcha-question { display: flex; align-items: center; }
.captcha-badge {
  display: flex; align-items: center; justify-content: center;
  padding: 0 14px; height: 48px;
  background: linear-gradient(135deg,#1e1e2e,#2a1a2e);
  font-weight: 800; font-size: 14px; color: #F5C518; letter-spacing: 0.5px;
  white-space: nowrap; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.08);
  font-family: 'Plus Jakarta Sans', monospace;
}
.captcha-input {
  flex: 1; height: 48px; border: none; background: transparent;
  padding: 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;
  outline: none; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
}
.captcha-input::placeholder { color: #bbb; font-weight: 400; }
.captcha-input::-webkit-inner-spin-button,
.captcha-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.captcha-refresh {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 48px; background: none; border: none;
  border-left: 1px solid #e5e7eb; cursor: pointer; color: #9ca3af;
  flex-shrink: 0; transition: color 0.2s, background 0.2s;
}
.captcha-refresh:hover { color: #C41E3A; background: rgba(196,30,58,0.05); }
.captcha-refresh svg { transition: transform 0.35s ease; }
.captcha-refresh:hover svg { transform: rotate(180deg); }
.captcha-answer-preview {
  display: flex; align-items: center; justify-content: center;
  min-width: 40px; height: 48px; padding: 0 12px;
  font-size: 13px; font-weight: 700; border-left: 1px solid #e5e7eb;
  flex-shrink: 0; transition: all 0.3s ease;
}
.captcha-answer-preview.correct { color: #16a34a; background: rgba(34,197,94,0.08); }
.captcha-answer-preview.wrong   { color: #dc2626; background: rgba(239,68,68,0.06); }
.captcha-answer-preview.neutral { color: #d1d5db; background: transparent; }
.captcha-hint { font-size: 11px; margin-top: 5px; padding-left: 2px; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
.captcha-hint.valid   { color: #16a34a; }
.captcha-hint.error   { color: #dc2626; }
.captcha-hint.neutral { color: #9ca3af; }

/* ── Countdown Progress Bar ── */
.captcha-progress-wrap {
  margin-top: 6px; height: 3px; background: #f3f4f6;
  border-radius: 999px; overflow: hidden;
}
.captcha-progress-bar {
  height: 100%; border-radius: 999px;
  transition: width 1s linear, background 0.3s ease;
}
.captcha-progress-bar.danger {
  animation: progress-flash 0.8s ease-in-out infinite;
}

/* ── Countdown Badge ── */
.countdown-badge {
  font-size: 10px; font-weight: 700;
  border-radius: 999px; padding: 1px 8px; border: 1px solid;
  transition: all 0.3s ease; margin-left: auto; white-space: nowrap;
}
.countdown-badge.normal { color: #6b7280; background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); }
.countdown-badge.warning { color: #d97706; background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.3); }
.countdown-badge.danger  {
  color: #dc2626; background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3);
  animation: countdown-pulse 0.8s ease-in-out infinite;
}

/* ── Toggle ── */
.toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.toggle-track { width: 40px; height: 22px; border-radius: 999px; background: #e5e7eb; position: relative; transition: background 0.25s ease; flex-shrink: 0; }
.toggle-track.on { background: #C41E3A; }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.25); transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
.toggle-track.on .toggle-thumb { transform: translateX(18px); }

/* ════════════════════════════════════════
   LAYOUT ROOT
════════════════════════════════════════ */
.login-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* Panel kiri */
.panel-left {
  width: 46%;
  flex-shrink: 0;
  padding: 48px;
  background: linear-gradient(160deg,#8B0000 0%,#C41E3A 35%,#9b1530 65%,#6b0f23 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Panel kanan */
.panel-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #f8f5f5;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

/* Logo mobile (disembunyikan di desktop) */
.logo-mobile { display: none; }
.footer-right-panel { color: #bbb; }

/* ════════════════════════════════════════
   TABLET LEBAR — 1024 ≤ w < 1280
════════════════════════════════════════ */
@media (max-width: 1280px) and (min-width: 1024px) {
  .panel-left  { width: 42%; padding: 36px; }
  .left-title  { font-size: 28px !important; }
  .card-login  { max-width: 400px !important; }
}

/* ════════════════════════════════════════
   TABLET — 768 ≤ w < 1024
   Panel kiri hilang, background merah full
════════════════════════════════════════ */
@media (max-width: 1023px) {
  .login-root  { flex-direction: column; }
  .panel-left  { display: none !important; }
  .panel-right {
    flex: 1;
    width: 100%;
    min-height: 100vh;
    justify-content: flex-start;
    padding: 20px 16px 24px;
    background: linear-gradient(160deg,#8B0000 0%,#C41E3A 30%,#9b1530 60%,#6b0f23 100%);
    overflow-y: auto;
  }
  .logo-mobile { display: flex !important; }
  .card-login  { max-width: 480px !important; width: 100% !important; margin: 0 auto; }
  .footer-right-panel { color: rgba(255,255,255,0.4) !important; }
}

/* ════════════════════════════════════════
   MOBILE BESAR — 480 ≤ w < 768
════════════════════════════════════════ */
@media (max-width: 767px) {
  .panel-right { padding: 14px 11px 18px; }
  .logo-mobile { margin-bottom: 10px !important; }
  .mobile-logo-circle { width: 58px !important; height: 58px !important; margin-bottom: 5px !important; }
  .mobile-title { font-size: 16px !important; }
  .card-login { border-radius: 14px !important; padding: 16px 14px 14px !important; max-width: 100% !important; }
  .card-accent { left: 14px !important; right: 14px !important; }
  .captcha-badge { font-size: 12px !important; padding: 0 9px !important; height: 43px !important; }
  .captcha-input { height: 43px !important; }
  .captcha-refresh { height: 43px !important; }
  .captcha-answer-preview { height: 43px !important; }
  .form-heading { font-size: 17px !important; }
  .input-field { padding-top: 9px !important; padding-bottom: 9px !important; }
}

/* ════════════════════════════════════════
   MOBILE KECIL — < 480px
════════════════════════════════════════ */
@media (max-width: 479px) {
  .panel-right { padding: 11px 9px 15px; }
  .logo-mobile { margin-bottom: 8px !important; }
  .mobile-logo-circle { width: 50px !important; height: 50px !important; margin-bottom: 4px !important; }
  .mobile-title { font-size: 14px !important; }
  .card-login { border-radius: 12px !important; padding: 13px 11px 11px !important; box-shadow: 0 6px 18px rgba(0,0,0,0.2) !important; }
  .card-accent { left: 11px !important; right: 11px !important; }
  .form-heading { font-size: 15px !important; margin-bottom: 3px !important; }
  .input-field { font-size: 13px !important; padding-top: 8px !important; padding-bottom: 8px !important; }
  .captcha-badge { font-size: 11px !important; padding: 0 7px !important; letter-spacing: 0 !important; height: 40px !important; }
  .captcha-input { font-size: 13px !important; height: 40px !important; }
  .captcha-answer-preview { min-width: 30px !important; padding: 0 6px !important; height: 40px !important; }
  .captcha-refresh { width: 34px !important; height: 40px !important; }
  .btn-submit-text { font-size: 12px !important; }
  .btn-login { padding: 9px 12px !important; }
  .countdown-badge { font-size: 8px !important; padding: 1px 5px !important; }
  .captcha-hint { font-size: 9.5px !important; }
  .toggle-wrap span { font-size: 12px !important; }
  .badge-in { font-size: 10px !important; padding: 3px 8px !important; }
  form { gap: 10px !important; }
  .card-login > div:first-of-type { margin-bottom: 12px !important; }
}

/* ════════════════════════════════════════
   MOBILE XS — < 360px
════════════════════════════════════════ */
@media (max-width: 359px) {
  .panel-right { padding: 9px 8px 12px; }
  .card-login  { padding: 11px 9px 9px !important; border-radius: 10px !important; }
  .card-accent { left: 9px !important; right: 9px !important; }
  .captcha-badge { font-size: 9px !important; padding: 0 5px !important; height: 38px !important; }
  .captcha-input { height: 38px !important; }
  .captcha-refresh { width: 32px !important; height: 38px !important; }
  .captcha-answer-preview { height: 38px !important; min-width: 26px !important; }
  .mobile-logo-circle { width: 44px !important; height: 44px !important; }
  .mobile-title { font-size: 13px !important; }
  .form-heading { font-size: 14px !important; }
}

/* ════════════════════════════════════════
   DESKTOP LEBAR — ≥ 1440px
════════════════════════════════════════ */
@media (min-width: 1440px) {
  .panel-left  { width: 44%; padding: 56px; }
  .panel-right { padding: 48px 32px; }
  .card-login  { max-width: 460px !important; }
  .left-title  { font-size: 38px !important; }
}

/* ════════════════════════════════════════
   ULTRA WIDE — ≥ 1920px
════════════════════════════════════════ */
@media (min-width: 1920px) {
  .panel-left  { width: 40%; padding: 64px; }
  .card-login  { max-width: 500px !important; padding: 48px 44px !important; }
  .left-title  { font-size: 42px !important; }
}
`;

/* ── Util: soal matematika acak ── */
function generateMath(): { question: string; answer: number } {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+")      { a = Math.floor(Math.random() * 90) + 10; b = Math.floor(Math.random() * 90) + 10; answer = a + b; }
  else if (op === "-") { a = Math.floor(Math.random() * 60) + 30; b = Math.floor(Math.random() * (a - 1)) + 1; answer = a - b; }
  else                 { a = Math.floor(Math.random() * 12) + 2;  b = Math.floor(Math.random() * 9) + 2; answer = a * b; }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

const CAPTCHA_DURATION = 15; // detik

function ProfilLogo({ logoUrl, size }: { logoUrl: string | null; size: number }) {
  const [src, setSrc] = useState<string>("/logo-ntt.ico");
  useEffect(() => { setSrc(logoUrl || "/logo-ntt.ico"); }, [logoUrl]);
  return (
    <img src={src} alt="Logo" onError={() => { if (src !== "/logo-ntt.ico") setSrc("/logo-ntt.ico"); }}
      style={{ width: size, height: size, objectFit: "contain" }} />
  );
}

/* ════════════════════════════════════════════════════════
   KOMPONEN UTAMA
════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setUser }  = useAuthStore();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [mounted,      setMounted]      = useState(false);

  const [logoUrl,    setLogoUrl]    = useState<string | null>(null);
  const [namaDaerah, setNamaDaerah] = useState("SIPKG NTT");
  const [opd,        setOpd]        = useState("Pemerintah Provinsi NTT");

  const [math,          setMath]          = useState<{ question: string; answer: number }>({ question: "", answer: 0 });
  const [captchaInput,  setCaptchaInput]  = useState("");
  const [captchaStatus, setCaptchaStatus] = useState<"neutral" | "valid" | "error">("neutral");

  // ── State countdown ──
  const [countdown, setCountdown] = useState(CAPTCHA_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fungsi reset captcha + restart timer ──
  const resetCaptchaAndTimer = useCallback((auto = false) => {
    setMath(generateMath());
    setCaptchaInput("");
    setCaptchaStatus("neutral");
    setCountdown(CAPTCHA_DURATION);
    if (auto) {
      // Bisa tambahkan toast notifikasi di sini jika ada library toast
    }
  }, []);

  // ── Fungsi refresh manual (tombol refresh CAPTCHA) ──
  const refreshMath = useCallback(() => {
    resetCaptchaAndTimer(false);
    // Restart timer interval
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          resetCaptchaAndTimer(true);
          return CAPTCHA_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resetCaptchaAndTimer]);

  // ── Mount + fetch profil publik ──
  useEffect(() => {
    setMounted(true);
    setMath(generateMath());

    fetch("/api/profil/publik")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.data) return;
        const d = j.data;
        if (d.logoUrl)    setLogoUrl(d.logoUrl);
        if (d.namaDaerah) setNamaDaerah(d.namaDaerah);
        if (d.opd)        setOpd(d.opd);
      }).catch(() => {});
  }, []);

  // ── Countdown timer 30 detik — auto-reset CAPTCHA ──
  useEffect(() => {
    if (!mounted) return;

    setCountdown(CAPTCHA_DURATION);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-reset soal captcha
          setMath(generateMath());
          setCaptchaInput("");
          setCaptchaStatus("neutral");
          return CAPTCHA_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted]);

  // ── Validasi input captcha real-time ──
  useEffect(() => {
    if (!captchaInput) { setCaptchaStatus("neutral"); return; }
    const val = parseInt(captchaInput, 10);
    if (isNaN(val)) { setCaptchaStatus("neutral"); return; }
    setCaptchaStatus(val === math.answer ? "valid" : "error");
  }, [captchaInput, math.answer]);

  const isCaptchaValid = captchaStatus === "valid";
  const canSubmit = email.trim() && password && isCaptchaValid && !loading;

  // ── Hitung kelas countdown badge ──
  const countdownBadgeClass =
    countdown <= 5  ? "countdown-badge danger"  :
    countdown <= 10 ? "countdown-badge warning" :
                      "countdown-badge normal";

  // ── Hitung warna & lebar progress bar ──
  const progressPct = (countdown / CAPTCHA_DURATION) * 100;
  const progressColor =
    countdown <= 5  ? "linear-gradient(90deg,#dc2626,#f87171)" :
    countdown <= 10 ? "linear-gradient(90deg,#d97706,#fbbf24)" :
                      "linear-gradient(90deg,#C41E3A,#F5C518)";
  const progressDanger = countdown <= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isCaptchaValid) { setCaptchaStatus("error"); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login gagal");
        refreshMath(); // refresh + restart timer saat login gagal
        return;
      }
      if (data.user) setUser(data.user);
      router.push(searchParams.get("from") || data.redirectTo || "/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      refreshMath(); // refresh + restart timer saat error
    }
    finally { setLoading(false); }
  }

  if (!mounted) return null;

  const previewClass = !captchaInput ? "neutral" : captchaStatus === "valid" ? "correct" : "wrong";
  const previewLabel = !captchaInput ? "—" : captchaStatus === "valid" ? "✓" : (parseInt(captchaInput, 10) || "?").toString();

  const particles = [
    { top: "20%", left: "15%", color: "#F5C518",               delay: "0s",   dx: "20px",  dur: "3s"   },
    { top: "35%", left: "70%", color: "#F5C518",               delay: "1s",   dx: "-15px", dur: "3.4s" },
    { top: "55%", left: "25%", color: "rgba(255,255,255,0.5)", delay: "1.5s", dx: "10px",  dur: "3.8s" },
    { top: "70%", left: "60%", color: "#F5C518",               delay: "0.5s", dx: "-20px", dur: "4.2s" },
    { top: "80%", left: "40%", color: "rgba(255,255,255,0.4)", delay: "2s",   dx: "15px",  dur: "3.6s" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loginCSS }} />
      <div className="login-root">

        {/* ══════════════════════════════════
            PANEL KIRI — Desktop only
        ══════════════════════════════════ */}
        <div className="panel-left">
          {/* Dekorasi */}
          <div className="spin-deco" style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.12)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.1)" }} />
          <div style={{ position: "absolute", top: "40%", left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{ top: p.top, left: p.left, background: p.color, animationDelay: p.delay, animationDuration: p.dur, ["--dx" as any]: p.dx }} />
          ))}

          {/* Header kiri */}
          <div className="fade-left" style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div className="pulse-logo" style={{ width: 60, height: 60, background: "white", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <ProfilLogo logoUrl={logoUrl} size={52} />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 18, lineHeight: 1.2, margin: 0 }}>{namaDaerah}</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, margin: 0 }}>{opd}</p>
            </div>
          </div>

          {/* Tengah */}
          <div style={{ position: "relative" }}>
            <div className="float-logo" style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div style={{ width: 150, height: 150, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(245,197,24,0.3)", overflow: "hidden" }}>
                <ProfilLogo logoUrl={logoUrl} size={122} />
              </div>
            </div>
            <div className="fade-up left-title" style={{ animationDelay: "0.1s", marginBottom: 12, fontSize: 34, fontWeight: 800, lineHeight: 1.25 }}>
              <span className="shimmer-text" style={{ display: "block" }}>Sistem Informasi</span>
              <span style={{ color: "white", display: "block" }}>Perhitungan</span>
              <span style={{ color: "#F5C518", display: "block" }}>Kebutuhan Guru</span>
            </div>
            <p className="fade-up" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.75, maxWidth: 340, animationDelay: "0.2s", marginBottom: 28 }}>
              Platform digital terpadu perencanaan tenaga pendidik SMA, SMK, dan SLB di Provinsi Nusa Tenggara Timur.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "📊", label: "Perhitungan otomatis kebutuhan guru", delay: "0.3s" },
                { icon: "🏫", label: "Monitoring 22 kabupaten/kota se-NTT",  delay: "0.4s" },
                { icon: "📄", label: "Laporan cetak & ekspor Excel",          delay: "0.5s" },
              ].map((f) => (
                <div key={f.label} className="feature-item fade-up" style={{ display: "flex", alignItems: "center", gap: 12, animationDelay: f.delay }}>
                  <div style={{ width: 36, height: 36, background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer kiri */}
          <div className="fade-up" style={{ animationDelay: "0.6s", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0 }}>
                © {new Date().getFullYear()} Biro Organisasi Setda Provinsi NTT
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            PANEL KANAN — Form (semua ukuran)
        ══════════════════════════════════ */}
        <div className="panel-right">
          {/* Dekorasi bg */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(196,30,58,0.05)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(245,197,24,0.06)" }} />

          {/* ── Logo header — muncul saat panel kiri hilang ── */}
          <div className="logo-mobile fade-up" style={{ flexDirection: "column", alignItems: "center", marginBottom: 12, animationDelay: "0.05s" }}>
            <div className="float-logo" style={{ marginBottom: 7 }}>
              <div className="mobile-logo-circle" style={{ width: 68, height: 68, background: "rgba(255,255,255,0.15)", borderRadius: "50%", border: "2px solid rgba(245,197,24,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <ProfilLogo logoUrl={logoUrl} size={54} />
              </div>
            </div>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div className="shimmer-text mobile-title" style={{ fontSize: 17, fontWeight: 800 }}>{namaDaerah}</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10.5, marginTop: 2 }}>Sistem Informasi Perhitungan Kebutuhan Guru</div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
              {["📊 Otomatis", "🏫 22 Kab/Kota", "📄 Ekspor Excel"].map((t) => (
                <span key={t} style={{ padding: "2px 7px", borderRadius: 999, background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)", color: "#F5C518", fontSize: 10, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ── Card ── */}
          <div className="card-login" style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 24, padding: "38px 36px", boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(196,30,58,0.06)", border: "1px solid rgba(196,30,58,0.08)", position: "relative" }}>
            {/* Aksen atas */}
            <div className="card-accent" style={{ position: "absolute", top: 0, left: 36, right: 36, height: 3, background: "linear-gradient(90deg,#C41E3A,#F5C518,#C41E3A)", borderRadius: "0 0 4px 4px" }} />

            <div style={{ marginBottom: 16 }}>
              <h2 className="form-heading" style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Selamat Datang</h2>
              <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Masuk dengan akun yang diberikan Admin Pusat</p>
            </div>

            {error && (
              <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start", background: "#fff5f5", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 14px", borderRadius: 12, fontSize: 13 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 15, pointerEvents: "none" }}>✉</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@instansi.go.id" required autoFocus autoComplete="email" disabled={loading} className="input-field"
                    style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: 12, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} autoComplete="current-password" className="input-field"
                    style={{ width: "100%", padding: "11px 90px 11px 14px", borderRadius: 12, fontSize: 14, boxSizing: "border-box" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#C41E3A", padding: 4 }}>
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Tetap login */}
              <div className="toggle-wrap" onClick={() => setRememberMe(!rememberMe)} role="checkbox" aria-checked={rememberMe} tabIndex={0} onKeyDown={(e) => e.key === " " && setRememberMe(!rememberMe)}>
                <div className={`toggle-track ${rememberMe ? "on" : ""}`}><div className="toggle-thumb" /></div>
                <span style={{ fontSize: 13, color: "#4b5563", fontWeight: 500 }}>Tetap login</span>
              </div>

              {/* ── Math CAPTCHA dengan Countdown Timer ── */}
              <div>
                {/* Label CAPTCHA + badge countdown */}
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                  <span>Verifikasi Keamanan</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#C41E3A", background: "rgba(196,30,58,0.08)", border: "1px solid rgba(196,30,58,0.2)", borderRadius: 999, padding: "1px 7px" }}>CAPTCHA</span>
                  {/* Badge countdown — warna berubah saat mendekati 0 */}
                  <span className={countdownBadgeClass} title="Soal CAPTCHA direset otomatis setiap 30 detik">
                    ⏱ {countdown}d
                  </span>
                </label>

                <div className={`captcha-wrap ${captchaStatus !== "neutral" ? `captcha-${captchaStatus}` : ""}`}>
                  <div className="captcha-question">
                    <div className="captcha-badge">{math.question}</div>
                    <input type="number" className="captcha-input" placeholder="jawaban" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} disabled={loading} autoComplete="off" min={0} step={1} />
                    <button type="button" className="captcha-refresh" onClick={refreshMath} title="Ganti soal (reset timer)" disabled={loading}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                      </svg>
                    </button>
                    <div className={`captcha-answer-preview ${previewClass}`}>{previewLabel}</div>
                  </div>
                </div>

                {/* Hint status */}
                <p className={`captcha-hint ${captchaStatus}`}>
                  {captchaStatus === "valid"   && <><span>✓</span> Jawaban benar! Anda dapat melanjutkan.</>}
                  {captchaStatus === "error"   && <><span>✗</span> Jawaban kurang tepat, coba lagi.</>}
                  {captchaStatus === "neutral" && <><span>🔒</span> Selesaikan soal untuk mengaktifkan tombol login.</>}
                </p>

                {/* Progress bar countdown */}
                <div className="captcha-progress-wrap">
                  <div
                    className={`captcha-progress-bar${progressDanger ? " danger" : ""}`}
                    style={{
                      width: `${progressPct}%`,
                      background: progressColor,
                    }}
                  />
                </div>
              </div>

              {/* Tombol submit */}
              <button type="submit" disabled={!canSubmit} className="btn-login" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, color: "white", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: canSubmit ? "pointer" : "not-allowed" }}>
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin-slow 0.7s linear infinite" }} />
                    Memverifikasi...
                  </>
                ) : (
                  <span className="btn-submit-text">{isCaptchaValid ? "🔓" : "🔒"} Masuk ke Sistem →</span>
                )}
              </button>
            </form>

            {/* Role badges */}
            <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {[{ label: "Admin Pusat", color: "#C41E3A" }, { label: "Admin Sekolah", color: "#854F0B" }].map((b) => (
                <span key={b.label} className="badge-in" style={{ padding: "4px 12px", borderRadius: 999, background: `${b.color}12`, border: `1px solid ${b.color}30`, color: b.color, fontSize: 11, fontWeight: 600 }}>{b.label}</span>
              ))}
            </div>

            {/* Bantuan */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
                Bantuan:{" "}
                <a href="mailto:disdikbudntt@gmail.com" style={{ color: "#C41E3A", textDecoration: "none" }}>disdikbudntt@gmail.com</a>
                {" "}·{" "}
                <a href="tel:0380823456" style={{ color: "#C41E3A", textDecoration: "none" }}>(0380) 823456</a>
              </p>
            </div>
          </div>

          <p className="footer-right-panel" style={{ marginTop: 18, fontSize: 11, position: "relative", textAlign: "center" }}>
            SIPKG NTT v1.0 &middot; Pemprov NTT {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </>
  );
}