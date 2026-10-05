"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CAPTCHA_DURATION = 15;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

@keyframes fadeInUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeInLeft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
@keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
@keyframes pulse-gold { 0%,100%{opacity:1} 50%{opacity:0.6} }
@keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes modalIn    { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes overlayIn  { from{opacity:0} to{opacity:1} }

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Plus Jakarta Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}

.lr-root{width:100vw;height:100dvh;display:flex;overflow:hidden;position:fixed;top:0;left:0;background-image:url('/bacground_login.png');background-size:cover;background-position:center;background-repeat:no-repeat;}
.lr-root::before{content:'';position:absolute;inset:0;z-index:0;background:linear-gradient(135deg,rgba(4,10,28,0.88) 0%,rgba(5,16,45,0.75) 35%,rgba(7,21,48,0.55) 65%,rgba(4,10,28,0.72) 100%);}
.lr-root::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;z-index:100;background:linear-gradient(90deg,#d4a017,#f0c84a 50%,#d4a017);background-size:200% auto;animation:shimmer 4s linear infinite;}

.lr-left{width:46%;flex-shrink:0;position:relative;z-index:1;display:flex;flex-direction:column;justify-content:space-between;padding:44px 42px;height:100dvh;border-right:1px solid rgba(255,255,255,0.08);}
.lr-left::before{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,rgba(4,10,28,0.5) 0%,rgba(4,10,28,0.1) 100%);}
.lr-left>*{position:relative;z-index:1;}
.lr-brand{display:flex;align-items:center;gap:14px;animation:fadeInLeft 0.5s ease both;}
.lr-brand-logo{width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.10);border:1px solid rgba(212,160,23,0.45);display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(12px);box-shadow:0 0 24px rgba(212,160,23,0.18);}
.lr-brand-name{font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.3px;text-shadow:0 1px 4px rgba(0,0,0,0.5);}
.lr-brand-sub{font-size:9.5px;color:rgba(212,160,23,0.85);font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-top:3px;}
.lr-mid{animation:fadeInLeft 0.6s 0.07s ease both;}
.lr-eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:9.5px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,160,23,0.85);font-weight:700;margin-bottom:14px;}
.lr-eyebrow::before{content:'';display:inline-block;width:18px;height:1.5px;background:rgba(212,160,23,0.65);border-radius:2px;}
.lr-title{font-size:clamp(50px,4.8vw,72px);font-weight:900;color:#fff;line-height:0.88;letter-spacing:-2px;margin-bottom:6px;text-shadow:0 2px 16px rgba(0,0,0,0.5);}
.lr-title-gold{display:block;background:linear-gradient(90deg,#d4a017 0%,#f0c84a 40%,#d4a017 80%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;letter-spacing:-1px;}
.lr-subtitle{font-size:10px;color:rgba(255,255,255,0.5);font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;}
.lr-desc{font-size:12.5px;color:rgba(255,255,255,0.65);line-height:1.85;max-width:280px;font-weight:300;margin-bottom:24px;border-left:2px solid rgba(212,160,23,0.5);padding-left:13px;}
.lr-tags{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:28px;}
.lr-tag{font-size:10px;padding:4px 12px;border-radius:99px;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.6);font-weight:500;backdrop-filter:blur(6px);background:rgba(255,255,255,0.07);transition:all 0.2s;}
.lr-tag:hover{background:rgba(212,160,23,0.18);border-color:rgba(212,160,23,0.5);color:#f0c84a;}
.lr-stats{display:flex;border:1px solid rgba(255,255,255,0.14);border-radius:14px;overflow:hidden;background:rgba(0,0,0,0.35);backdrop-filter:blur(14px);}
.lr-stat{flex:1;padding:12px 14px;text-align:center;border-right:1px solid rgba(255,255,255,0.1);}
.lr-stat:last-child{border-right:none;}
.lr-stat-num{font-size:22px;font-weight:900;color:#d4a017;line-height:1;}
.lr-stat-lbl{font-size:8.5px;color:rgba(255,255,255,0.45);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-top:3px;}
.lr-footer{font-size:10px;color:rgba(255,255,255,0.4);line-height:1.8;font-weight:300;animation:fadeInLeft 0.7s 0.12s ease both;border-top:1px solid rgba(255,255,255,0.12);padding-top:16px;}

.lr-right{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;background:transparent;height:100dvh;overflow-y:auto;overflow-x:hidden;padding:68px 0 36px;position:relative;z-index:1;}
.lr-mobile-content{width:100%;display:flex;justify-content:center;padding:0 18px;margin:auto 0;}
.lr-back{position:absolute;top:18px;left:22px;display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:99px;border:1px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.12);backdrop-filter:blur(12px);color:rgba(255,255,255,0.9);font-size:11px;font-weight:600;text-decoration:none;transition:all 0.2s;font-family:'Plus Jakarta Sans',sans-serif;z-index:10;}
.lr-back:hover{background:rgba(255,255,255,0.22);border-color:rgba(255,255,255,0.4);color:#fff;transform:translateY(-1px);}
.lr-mobile-header{display:none;}

.lr-card{width:100%;max-width:400px;background:#fff;border-radius:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 2px 8px rgba(0,0,0,0.15),0 16px 48px rgba(0,0,0,0.35),0 48px 96px rgba(0,0,0,0.25);padding:32px 28px 26px;animation:fadeInUp 0.55s ease both;position:relative;overflow:hidden;}
.lr-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#071530 0%,#d4a017 40%,#f0c84a 60%,#071530 100%);background-size:200% auto;animation:shimmer 4s linear infinite;}
.lr-card::after{content:'';position:absolute;top:3px;right:0;width:100px;height:100px;background:radial-gradient(ellipse at top right,rgba(212,160,23,0.06),transparent 70%);pointer-events:none;}
.lr-card-head{margin-bottom:22px;}
.lr-badge{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#d4a017;background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.2);padding:3px 11px;border-radius:99px;margin-bottom:12px;}
.lr-badge-dot{width:4px;height:4px;border-radius:50%;background:#d4a017;box-shadow:0 0 5px rgba(212,160,23,0.7);animation:pulse-gold 2s ease-in-out infinite;}
.lr-card-title{font-size:23px;font-weight:800;color:#0a1f4e;letter-spacing:-0.4px;line-height:1.1;margin-bottom:4px;}
.lr-card-sub{font-size:12px;color:#94a3b8;font-weight:400;}
.lr-roles{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;}
.lr-role-badge{font-size:10px;padding:4px 11px;border-radius:99px;font-weight:600;border:1px solid;}
.lr-role-sekolah{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;}
.lr-role-biro{background:#f0fdf4;border-color:#bbf7d0;color:#15803d;}
.lr-role-admin{background:#fef3c7;border-color:#fde68a;color:#92400e;}
.lr-alert{display:flex;align-items:flex-start;gap:8px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:12px;font-weight:500;border-radius:10px;padding:10px 12px;margin-bottom:16px;animation:shake 0.35s ease;}
.lr-form{display:flex;flex-direction:column;gap:14px;}
.lr-field{display:flex;flex-direction:column;gap:5px;}
.lr-label{font-size:11.5px;font-weight:700;color:#1e293b;letter-spacing:0.1px;}
.lr-hint{font-size:10.5px;color:#94a3b8;margin-top:3px;}
.lr-input-wrap{display:flex;align-items:center;border:1.5px solid #e2e8f0;border-radius:11px;background:#f8fafc;transition:all 0.2s;overflow:hidden;}
.lr-input-wrap:focus-within{border-color:#0a1f4e;background:#fff;box-shadow:0 0 0 3px rgba(10,31,78,0.07);}
.lr-input-ico{width:42px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#94a3b8;}
.lr-input{flex:1;height:44px;border:none;background:transparent;font-size:13.5px;font-weight:400;color:#0f172a;font-family:'Plus Jakarta Sans',sans-serif;outline:none;padding-right:10px;}
.lr-input::placeholder{color:#cbd5e1;font-size:12.5px;font-weight:300;}
.lr-eye{width:40px;height:44px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#c0c0c0;transition:color 0.15s;padding:0;}
.lr-eye:hover{color:#0a1f4e;}
.lr-field-err{font-size:11px;color:#dc2626;font-weight:600;}
.lr-cap-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.lr-cap-hint{font-size:10px;color:#94a3b8;}
.lr-captcha{border:1.5px solid #e2e8f0;border-radius:11px;background:#f8fafc;overflow:hidden;transition:all 0.2s;}
.lr-captcha.danger{border-color:rgba(220,38,38,0.4);box-shadow:0 0 0 3px rgba(220,38,38,0.07);}
.lr-cap-top{display:flex;align-items:center;border-bottom:1px solid #f1f5f9;}
.lr-cap-q{padding:0 14px;height:44px;background:linear-gradient(135deg,#071530,#1558c0);font-size:13px;font-weight:700;color:#d4a017;display:flex;align-items:center;flex-shrink:0;border-right:1px solid rgba(255,255,255,0.06);letter-spacing:0.4px;white-space:nowrap;text-shadow:0 0 10px rgba(212,160,23,0.4);}
.lr-cap-inp{flex:1;height:44px;border:none;background:transparent;font-size:15px;font-weight:600;color:#0f172a;font-family:'Plus Jakarta Sans',sans-serif;outline:none;padding:0 10px;min-width:0;}
.lr-cap-inp::placeholder{color:#c0c0c0;font-size:12px;font-weight:300;}
.lr-cap-inp::-webkit-inner-spin-button,.lr-cap-inp::-webkit-outer-spin-button{-webkit-appearance:none;}
.lr-cap-cluster{display:flex;align-items:center;gap:7px;padding:0 10px;flex-shrink:0;border-left:1px solid #f1f5f9;height:44px;}
.lr-cap-timer{font-size:7.5px;font-weight:800;color:#94a3b8;min-width:14px;text-align:center;}
.lr-cap-timer.warn{color:#d97706;}.lr-cap-timer.danger{color:#dc2626;}
.lr-cap-ring{width:22px;height:22px;position:relative;flex-shrink:0;}
.lr-cap-ring svg{position:absolute;top:0;left:0;transform:rotate(-90deg);}
.lr-cap-ref{width:28px;height:28px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#94a3b8;transition:all 0.2s;flex-shrink:0;}
.lr-cap-ref:hover{border-color:#0a1f4e;color:#0a1f4e;background:#eff6ff;}
.lr-cap-ref:hover svg{transform:rotate(180deg);}
.lr-cap-ref svg{transition:transform 0.3s;}
.lr-cap-bar{height:3px;background:#f1f5f9;position:relative;overflow:hidden;}
.lr-cap-fill{position:absolute;left:0;top:0;height:100%;border-radius:2px;background:linear-gradient(90deg,#0a1f4e,#d4a017);transition:width 1s linear,background 0.3s;}
.lr-cap-fill.warn{background:linear-gradient(90deg,#d97706,#fbbf24);}
.lr-cap-fill.danger{background:#dc2626;}
.lr-submit{width:100%;height:48px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#071530 0%,#1558c0 60%,#1a6fd8 100%);color:#fff;font-size:14px;font-weight:700;letter-spacing:0.3px;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;transition:all 0.25s;box-shadow:0 4px 16px rgba(10,31,78,0.28);margin-top:4px;position:relative;overflow:hidden;}
.lr-submit::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);}
.lr-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(10,31,78,0.35);}
.lr-submit:active:not(:disabled){transform:translateY(0);}
.lr-submit:disabled{opacity:0.5;cursor:not-allowed;}
.lr-spin{animation:spin 0.8s linear infinite;}
.lr-submit-gold{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4a017,transparent);background-size:200% auto;animation:shimmer 2s linear infinite;}
.lr-card-foot{text-align:center;margin-top:18px;font-size:11.5px;color:#94a3b8;}
.lr-lupa-btn{background:none;border:none;cursor:pointer;color:#0a1f4e;font-weight:700;font-size:11.5px;font-family:'Plus Jakarta Sans',sans-serif;padding:0;border-bottom:1.5px solid transparent;transition:all 0.15s;}
.lr-lupa-btn:hover{color:#d4a017;border-bottom-color:#d4a017;}
.lr-info-strip{margin-top:16px;max-width:400px;width:100%;display:flex;align-items:center;justify-content:center;gap:14px;padding:0 16px;}
.lr-info-item{display:flex;align-items:center;gap:4px;font-size:10px;color:rgba(255,255,255,0.55);font-weight:500;}
.lr-info-sep{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.3);}

/* ══ MODAL ══ */
.lr-overlay{position:fixed;inset:0;z-index:999;background:rgba(4,10,28,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:overlayIn 0.2s ease;}
.lr-modal{background:#fff;border-radius:22px;width:100%;max-width:380px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3),0 32px 80px rgba(0,0,0,0.25);animation:modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;position:relative;}
.lr-modal-top{background:linear-gradient(135deg,#071530 0%,#1558c0 100%);padding:24px 24px 20px;position:relative;overflow:hidden;}
.lr-modal-top::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#d4a017,#f0c84a,#d4a017,transparent);background-size:200% auto;animation:shimmer 3s linear infinite;}
.lr-modal-top::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(212,160,23,0.08);pointer-events:none;}
.lr-modal-icon{width:48px;height:48px;border-radius:14px;background:rgba(212,160,23,0.15);border:1px solid rgba(212,160,23,0.35);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.lr-modal-title{font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;margin-bottom:4px;}
.lr-modal-sub{font-size:11.5px;color:rgba(255,255,255,0.55);font-weight:400;line-height:1.5;}
.lr-modal-close{position:absolute;top:16px;right:16px;width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);transition:all 0.2s;}
.lr-modal-close:hover{background:rgba(255,255,255,0.22);color:#fff;}
.lr-modal-body{padding:20px 20px 24px;}
.lr-modal-note{font-size:11px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;margin-bottom:16px;line-height:1.6;}
.lr-modal-note strong{color:#0a1f4e;font-weight:700;}
.lr-contacts{display:flex;flex-direction:column;gap:10px;}
.lr-contact-item{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:13px;border:1.5px solid;text-decoration:none;transition:all 0.2s;cursor:pointer;}
.lr-contact-item:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.1);}
.lr-contact-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(0,0,0,0.07);}
.lr-contact-info{flex:1;min-width:0;}
.lr-contact-lbl{font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;opacity:0.6;margin-bottom:2px;}
.lr-contact-val{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.lr-contact-arr{flex-shrink:0;opacity:0.4;}
.lr-modal-footer{text-align:center;margin-top:16px;font-size:10.5px;color:#94a3b8;padding-top:14px;border-top:1px solid #f1f5f9;line-height:1.7;}

@media(max-width:1023px){
  .lr-left{display:none!important;}
  .lr-right{width:100%;justify-content:flex-start;padding:0;}
  .lr-back{display:none!important;}
  .lr-mobile-header{display:block;padding:18px 16px 8px;width:100%;}
  .lr-mobile-content{padding:4px 14px 28px;}
  .lr-info-strip{display:none;}
  .lr-card{max-width:460px!important;background:rgba(255,255,255,0.97);}
}
@media(max-width:640px){
  .lr-card{border-radius:18px!important;padding:22px 16px 18px!important;max-width:100%!important;}
  .lr-input{font-size:16px!important;}
  .lr-cap-q{font-size:12px!important;padding:0 10px!important;}
  .lr-modal{border-radius:18px;}
  .lr-modal-top{padding:20px 18px 16px;}
}
@media(max-height:680px) and (max-width:1023px){
  .lr-card{padding:14px!important;}
  .lr-form{gap:10px!important;}
  .lr-input,.lr-submit{height:40px!important;}
  .lr-cap-q,.lr-cap-inp,.lr-cap-cluster{height:40px!important;}
  .lr-card-head{margin-bottom:12px!important;}
}
@media(min-width:1440px){
  .lr-left{width:44%;padding:52px 48px;}
  .lr-card{max-width:420px!important;}
}
`;

function generateMath() {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+") { a = Math.floor(Math.random() * 80) + 10; b = Math.floor(Math.random() * 80) + 10; answer = a + b; }
  else if (op === "-") { a = Math.floor(Math.random() * 60) + 30; b = Math.floor(Math.random() * (a - 1)) + 1; answer = a - b; }
  else { a = Math.floor(Math.random() * 11) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b; }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function IcoPhone() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
}
function IcoWA() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
function IcoEmail() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
const ICON_MAP: Record<string, React.ReactNode> = {
  phone: <IcoPhone />, whatsapp: <IcoWA />, email: <IcoEmail />,
};

// ─── Modal Kontak Admin — ambil data dari /api/admin/kontak (yang sama
// dengan yang diatur Admin di halaman Kelola Kontak), bukan data statis ──────
interface KontakData {
  telepon: string
  whatsapp: string
  emailAkses: string
  email: string
  jamKerja: string
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [kontak, setKontak] = useState<KontakData | null>(null)
  const [loadingKontak, setLoadingKontak] = useState(true)

  useEffect(() => {
    fetch('/api/admin/kontak')
      .then(r => r.json())
      .then(d => setKontak(d.data))
      .catch(() => setKontak(null))
      .finally(() => setLoadingKontak(false))
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const teleponDigits  = kontak?.telepon?.replace(/\D/g, '') || ''
  const whatsappDigits = kontak?.whatsapp?.replace(/\D/g, '') || ''
  const emailTujuan    = kontak?.emailAkses || kontak?.email || ''

  const contacts = kontak ? [
    {
      icon: "phone", label: "Telepon", value: kontak.telepon,
      href: `tel:+62${teleponDigits.replace(/^0/, '')}`,
      color: "#0a1f4e", bg: "#eff6ff", border: "#bfdbfe",
    },
    ...(whatsappDigits ? [{
      icon: "whatsapp", label: "WhatsApp", value: kontak.whatsapp,
      href: `https://wa.me/62${whatsappDigits.replace(/^0/, '')}?text=${encodeURIComponent('Halo Admin, saya butuh bantuan akses e-SIPKG')}`,
      color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0",
    }] : []),
    {
      icon: "email", label: "Email", value: emailTujuan,
      href: `mailto:${emailTujuan}?subject=Bantuan%20Akses%20e-SIPKG&body=Halo%20Admin%2C%20saya%20membutuhkan%20bantuan%20untuk%20mengakses%20akun%20e-SIPKG.`,
      color: "#92400e", bg: "#fef3c7", border: "#fde68a",
    },
  ] : []

  return (
    <div className="lr-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lr-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="lr-modal-top">
          <div className="lr-modal-icon">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d4a017" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="lr-modal-title">Hubungi Administrator</h2>
          <p className="lr-modal-sub">Tim admin siap membantu pemulihan akses e-SIPKG Anda</p>
          <button className="lr-modal-close" onClick={onClose} aria-label="Tutup">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="lr-modal-body">
          <p className="lr-modal-note">
            <strong>Sebutkan:</strong> nama lengkap, NIP, instansi/sekolah, dan kendala yang dihadapi agar admin dapat memproses lebih cepat.
          </p>
          <div className="lr-contacts">
            {loadingKontak ? (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '12px 0' }}>Memuat kontak…</p>
            ) : contacts.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '12px 0' }}>Kontak belum tersedia.</p>
            ) : contacts.map(c => (
              <a key={c.icon} href={c.href}
                target={c.icon !== "phone" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="lr-contact-item"
                style={{ background: c.bg, borderColor: c.border, color: c.color }}>
                <div className="lr-contact-ico" style={{ color: c.color }}>{ICON_MAP[c.icon]}</div>
                <div className="lr-contact-info">
                  <div className="lr-contact-lbl">{c.label}</div>
                  <div className="lr-contact-val">{c.value}</div>
                </div>
                <div className="lr-contact-arr">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
          <p className="lr-modal-footer">
            Jam layanan: {kontak?.jamKerja || 'Senin – Jumat, 08.00 – 16.00 WITA'}<br />
            Biro Organisasi · Setda Provinsi Nusa Tenggara Timur
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Login ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [nip, setNip]           = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [showContact, setShowContact] = useState(false);  // ← state modal

  const [math, setMath]           = useState({ question: "", answer: 0 });
  const [mathInput, setMathInput] = useState("");
  const [mathError, setMathError] = useState("");
  const [timeLeft, setTimeLeft]   = useState(CAPTCHA_DURATION);

  const nipRef   = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshMath = useCallback(() => {
    setMath(generateMath()); setMathInput(""); setMathError(""); setTimeLeft(CAPTCHA_DURATION);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { refreshMath(); return CAPTCHA_DURATION; } return prev - 1; });
    }, 1000);
  }, [refreshMath]);

  const handleRefreshCap = useCallback(() => { refreshMath(); startTimer(); }, [refreshMath, startTimer]);

  useEffect(() => {
    setMounted(true); setMath(generateMath());
    setTimeout(() => nipRef.current?.focus(), 350);
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMathError("");
    if (parseInt(mathInput) !== math.answer) { setMathError("Jawaban captcha salah, soal telah diperbarui"); handleRefreshCap(); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ nip: nip.trim(), password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login gagal. Periksa kembali NIP dan password."); setLoading(false); handleRefreshCap(); return; }
      switch (data.data?.role) {
        case "SEKOLAH": router.push("/dashboard"); break;
        case "WILAYAH": router.push("/wilayah/dashboard"); break;
        case "BIRO":    router.push("/biro/dashboard"); break;
        case "ADMIN":   router.push("/admin/dashboard"); break;
        default:        setLoading(false); router.push("/login");
      }
    } catch { setError("Terjadi kesalahan jaringan. Coba lagi."); setLoading(false); handleRefreshCap(); }
  }

  const pct = (timeLeft / CAPTCHA_DURATION) * 100;
  const timerMode = timeLeft <= 4 ? "danger" : timeLeft <= 8 ? "warn" : "normal";
  const CIRC = 50.3;
  const dashOffset = CIRC - (pct / 100) * CIRC;
  const ringColor = timerMode === "danger" ? "#dc2626" : timerMode === "warn" ? "#d97706" : "#d4a017";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lr-root">

        {/* PANEL KIRI */}
        <div className="lr-left">
          <div className="lr-brand">
            <div className="lr-brand-logo">
              <img src="/logo-ntt.png" alt="Logo NTT" width={30} height={30}
                style={{ objectFit:"contain", filter:"drop-shadow(0 1px 8px rgba(212,160,23,0.5))" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
            </div>
            <div>
              <div className="lr-brand-name">Pemerintah Provinsi NTT</div>
              <div className="lr-brand-sub">Biro Organisasi</div>
            </div>
          </div>
          <div className="lr-mid">
            <div className="lr-eyebrow">Sistem Informasi</div>
            <h1 className="lr-title">e‑SIPKG<span className="lr-title-gold">NTT</span></h1>
            <p className="lr-subtitle">Perhitungan Kebutuhan Guru · ANJAB ABK</p>
            <p className="lr-desc">Platform digital terpadu berbasis mobile untuk analisis jabatan dan perhitungan kebutuhan guru SMA, SMK &amp; SLB se-Provinsi Nusa Tenggara Timur.</p>
            <div className="lr-tags">
              {["ANJAB","ABK","SMA/SMK/SLB","Mobile Friendly","Prov. NTT"].map(t => <span key={t} className="lr-tag">{t}</span>)}
            </div>
            <div className="lr-stats">
              <div className="lr-stat"><div className="lr-stat-num">22</div><div className="lr-stat-lbl">Kab/Kota</div></div>
              <div className="lr-stat"><div className="lr-stat-num">3</div><div className="lr-stat-lbl">Peran</div></div>
              <div className="lr-stat"><div className="lr-stat-num">NTT</div><div className="lr-stat-lbl">Provinsi</div></div>
            </div>
          </div>
          <p className="lr-footer">
            Biro Organisasi · Bagian Kelembagaan &amp; Analisis Jabatan<br />
            Sekretariat Daerah Provinsi Nusa Tenggara Timur<br />
            Jl. El Tari No. 52, Kota Kupang, NTT
          </p>
        </div>

        {/* PANEL KANAN */}
        <div className="lr-right">
          <Link href="/" className="lr-back">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>

          <div className="lr-mobile-header">
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:48, height:48, borderRadius:13, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(212,160,23,0.35)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <img src="/logo-ntt.png" alt="NTT" width={28} height={28} style={{ objectFit:"contain" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
              </div>
              <div>
                <p style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:-0.5 }}>e‑SIPKG</p>
                <p style={{ fontSize:10, color:"rgba(212,160,23,0.8)", fontWeight:600, letterSpacing:1 }}>BIRO ORGANISASI NTT</p>
              </div>
            </div>
            <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.45)", lineHeight:1.6, fontWeight:300 }}>Sistem Informasi Perhitungan Kebutuhan Guru · ANJAB ABK</p>
          </div>

          <div className="lr-mobile-content">
            <div className="lr-card">
              <div className="lr-card-head">
                <div className="lr-badge"><div className="lr-badge-dot" />Portal Login</div>
                <h2 className="lr-card-title">Masuk ke Akun Anda</h2>
                <p className="lr-card-sub">e‑SIPKG — Sistem Kebutuhan Guru Prov. NTT</p>
              </div>
              
              {error && (
                <div className="lr-alert">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="lr-form" autoComplete="off">
                {/* NIP */}
                <div className="lr-field">
                  <label className="lr-label">NIP</label>
                  <div className="lr-input-wrap">
                    <div className="lr-input-ico">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c2.21 0 4 1.343 4 3H3c0-1.657 1.79-3 4-3z" />
                      </svg>
                    </div>
                    <input ref={nipRef} type="text" inputMode="numeric" className="lr-input"
                      placeholder="Contoh: 198501012010011001"
                      value={nip} onChange={e => setNip(e.target.value.replace(/\D/g, ""))}
                      required maxLength={20} autoComplete="username" />
                  </div>
                  <p className="lr-hint">NIP digunakan sebagai username untuk semua peran (Sekolah · Biro · Admin)</p>
                </div>
                {/* Password */}
                <div className="lr-field">
                  <label className="lr-label">Password</label>
                  <div className="lr-input-wrap">
                    <div className="lr-input-ico">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input type={showPass ? "text" : "password"} className="lr-input"
                      placeholder="Minimal 6 karakter" value={password}
                      onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                    <button type="button" className="lr-eye" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      {showPass
                        ? <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>
                {/* Captcha */}
                {mounted && (
                  <div className="lr-field">
                    <div className="lr-cap-header">
                      <label className="lr-label">Verifikasi Keamanan</label>
                      <span className="lr-cap-hint">Berganti otomatis</span>
                    </div>
                    <div className={`lr-captcha${timerMode === "danger" ? " danger" : ""}`}>
                      <div className="lr-cap-top">
                        <div className="lr-cap-q">{math.question}</div>
                        <input type="number" className="lr-cap-inp" placeholder="Tulis jawaban…"
                          value={mathInput} onChange={e => setMathInput(e.target.value)} required />
                        <div className="lr-cap-cluster">
                          <div className="lr-cap-ring">
                            <svg width="22" height="22" viewBox="0 0 22 22">
                              <circle cx="11" cy="11" r="8" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                              <circle cx="11" cy="11" r="8" fill="none" stroke={ringColor} strokeWidth="2.5"
                                strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
                                style={{ transition:"stroke-dashoffset 1s linear,stroke 0.3s ease" }} />
                            </svg>
                            <span className={`lr-cap-timer ${timerMode}`} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}>{timeLeft}</span>
                          </div>
                          <button type="button" onClick={handleRefreshCap} className="lr-cap-ref" title="Ganti soal">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="lr-cap-bar">
                        <div className={`lr-cap-fill ${timerMode}`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                    {mathError && <p className="lr-field-err" style={{ marginTop:4 }}>⚠ {mathError}</p>}
                  </div>
                )}
                {/* Submit */}
                <button type="submit" disabled={loading} className="lr-submit">
                  <div className="lr-submit-gold" />
                  {loading ? (
                    <><svg className="lr-spin" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Memverifikasi…</>
                  ) : (
                    <><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>Masuk ke Portal</>
                  )}
                </button>
              </form>

              {/* ── Lupa Akses → buka modal ── */}
              <p className="lr-card-foot">
                Lupa akses?{" "}
                <button className="lr-lupa-btn" onClick={() => setShowContact(true)}>
                  Hubungi Administrator
                </button>
              </p>
            </div>
          </div>

          <div className="lr-info-strip">
            <div className="lr-info-item"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.55)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Koneksi Aman SSL</div>
            <div className="lr-info-sep" />
            <div className="lr-info-item"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.55)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Data Terenkripsi</div>
            <div className="lr-info-sep" />
            <div className="lr-info-item"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.55)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>Pemprov NTT</div>
          </div>
        </div>
      </div>

      {/* ── MODAL KONTAK ADMIN ── */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  );
}