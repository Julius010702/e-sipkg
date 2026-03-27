"use client";
// src/components/landing/HeroSlider.tsx

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface Slide {
  id: number;
  judul: string;
  deskripsi: string;
  accent: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    judul: "Selamat Datang di E-SIPKG",
    deskripsi:
      "Sistem Informasi Perhitungan Kebutuhan Guru SMA, SMK, dan SLB Provinsi Nusa Tenggara Timur secara digital, transparan, dan akuntabel.",
    accent: "#3b82f6",
  },
  {
    id: 2,
    judul: "Analisis Jabatan Digital",
    deskripsi:
      "Kelola ANJAB dan ABK dengan mudah. Hitung beban kerja, efektivitas jabatan, dan kebutuhan pegawai secara otomatis dan akurat.",
    accent: "#10b981",
  },
  {
    id: 3,
    judul: "Pemerataan Guru NTT",
    deskripsi:
      "Mendukung distribusi dan pemerataan guru yang adil di seluruh 22 Kabupaten/Kota se-Provinsi Nusa Tenggara Timur.",
    accent: "#8b5cf6",
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlayInterval?: number;
  namaUnit?: string;
}

export function HeroSlider({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 5000,
  namaUnit = "Dinas Pendidikan dan Kebudayaan Provinsi NTT",
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const slide = slides[current];

  function goTo(index: number) {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }

  function resetInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
  }

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides.length, autoPlayInterval]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Lato:wght@300;400;700;900&display=swap');
        @keyframes heroFadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes heroBounce   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
        @keyframes heroGlowPulse{ 0%,100%{opacity:0.3} 50%{opacity:0.55} }
        @keyframes heroFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .hero-btn-primary:hover  { transform:translateY(-2px)!important; filter:brightness(1.1); }
        .hero-btn-secondary:hover{ background:rgba(255,255,255,0.1)!important; }
        .hero-dot:hover          { transform:scale(1.3); }
      `}</style>

      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0a0f1e",
      }}>
        {/* Animated background */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 30% 40%, ${slide.accent}22 0%, transparent 65%),
            radial-gradient(ellipse 50% 70% at 75% 65%, ${slide.accent}10 0%, transparent 65%),
            linear-gradient(160deg, #0a0f1e 0%, #0d1833 55%, #0a1020 100%)
          `,
          transition: "background 1.2s ease",
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }} />

        {/* Floating glow circles */}
        {[420, 600, 800].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${0.028 - i * 0.006})`,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
        ))}

        {/* Central glow */}
        <div style={{
          position: "absolute",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${slide.accent}18 0%, transparent 70%)`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "background 1.2s ease",
          animation: "heroGlowPulse 4s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Decorative hexagon */}
        <div style={{
          position: "absolute", right: "8%", top: "20%",
          opacity: 0.04, pointerEvents: "none",
          animation: "heroFloat 6s ease-in-out infinite",
        }}>
          <svg width="320" height="320" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" stroke="white" strokeWidth="1" fill="none" />
            <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" stroke="white" strokeWidth="0.5" fill="none" />
            <polygon points="50,25 70,37.5 70,62.5 50,75 30,62.5 30,37.5" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 820, margin: "0 auto",
          padding: "120px 28px 100px",
          textAlign: "center",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          {/* Badge instansi */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 100,
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: 28,
            animation: "heroFadeUp 0.7s ease both",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: slide.accent,
              boxShadow: `0 0 8px ${slide.accent}`,
            }} />
            {namaUnit}
          </div>

          {/* Judul */}
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "white",
            marginBottom: 20,
            animation: "heroFadeUp 0.7s 0.1s ease both",
          }}>
            {slide.judul}
          </h1>

          {/* Deskripsi */}
          <p style={{
            fontSize: "clamp(14px, 2vw, 17px)",
            lineHeight: 1.85,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 300,
            maxWidth: 560, margin: "0 auto 44px",
            animation: "heroFadeUp 0.7s 0.2s ease both",
          }}>
            {slide.deskripsi}
          </p>

          {/* CTA */}
          <div style={{
            display: "flex", gap: 14, justifyContent: "center",
            flexWrap: "wrap",
            animation: "heroFadeUp 0.7s 0.3s ease both",
          }}>
            <Link href="/login"
              className="hero-btn-primary"
              style={{
                padding: "13px 30px",
                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}bb)`,
                color: "white", borderRadius: 10,
                textDecoration: "none", fontSize: 13, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                boxShadow: `0 8px 28px ${slide.accent}44`,
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              Masuk ke Sistem
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a href="#fitur"
              className="hero-btn-secondary"
              style={{
                padding: "13px 30px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)", borderRadius: 10,
                textDecoration: "none", fontSize: 13, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}
            >
              Pelajari Fitur
            </a>
          </div>

          {/* Slide dots */}
          <div style={{
            display: "flex", gap: 8, justifyContent: "center",
            marginTop: 52,
            animation: "heroFadeUp 0.7s 0.4s ease both",
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                className="hero-dot"
                onClick={() => { goTo(i); resetInterval(); }}
                style={{
                  width: i === current ? 28 : 8, height: 8,
                  borderRadius: 4, padding: 0,
                  background: i === current ? slide.accent : "rgba(255,255,255,0.2)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.35s ease",
                }}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div style={{
            marginTop: 14, fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.15em",
            fontFamily: "'Cinzel', serif",
          }}>
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          animation: "heroBounce 2s ease-in-out infinite",
          pointerEvents: "none",
        }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>
    </>
  );
}