"use client";

import { useState } from "react";
import Link from "next/link";
import { SondaAssistant } from "@/components/chat/AtlasAssistant";

export function SupportPortal() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* ── Keyframes y Clases de Animación robustas para SSR ── */}
      <style>{`
        @keyframes sonda-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-16px) scale(1.01); }
        }
        @keyframes sonda-pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes sonda-glow-breathe {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes sonda-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sonda-chat-in {
          from { opacity: 0; transform: scale(0.95) translateY(40px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes sonda-dot-blink {
          0%, 80%, 100% { transform: scale(0.3); opacity: 0.4; }
          40%           { transform: scale(1); opacity: 1; }
        }
        
        .s-float   { animation: sonda-float 4.8s ease-in-out infinite; }
        .s-ring-1  { animation: sonda-pulse-ring 3.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .s-ring-2  { animation: sonda-pulse-ring 3.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.8s; }
        .s-ring-3  { animation: sonda-pulse-ring 3.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 0.9s; }
        .s-glow    { animation: sonda-glow-breathe 4.2s ease-in-out infinite; }
        .s-fade-1  { animation: sonda-fade-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.2s both; }
        .s-fade-2  { animation: sonda-fade-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.55s both; }
        .s-fade-3  { animation: sonda-fade-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.8s both; }
        .s-chat    { animation: sonda-chat-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        
        .s-btn:hover {
          background: rgba(0, 255, 255, 0.1) !important;
          border-color: #00FFFF !important;
          box-shadow: 0 0 32px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1) !important;
          transform: translateY(-2px) scale(1.02);
        }
        .s-btn:active {
          transform: translateY(0px) scale(0.98);
        }
      `}</style>

      <main style={{
        minHeight: "100dvh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Kumbh Sans','Segoe UI',sans-serif",
      }}>

        {/* ── Glow ambiental de fondo (Cyan) ── */}
        <div className="s-glow" style={{
          position: "absolute",
          width: 650,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0, 255, 255, 0.11) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* ── Contenido central ── */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

          {/* Logo flotando */}
          <div className="s-fade-1">
            <div className={chatOpen ? "" : "s-float"} style={{ position: "relative", transition: "transform 0.5s ease-in-out" }}>
              {/* Halo suave detrás del logo */}
              <div style={{
                position: "absolute",
                inset: "-20px -30px",
                borderRadius: "50%",
                background: "radial-gradient(ellipse at center, rgba(0, 255, 255, 0.13) 0%, transparent 68%)",
                pointerEvents: "none",
              }} />

              {/* Logo SONDA — SVG compuesto con isotipo cyan real y wordmark */}
              <SondaLogoModern width={280} />
            </div>
          </div>

          {/* ── CTA o chat ── */}
          {!chatOpen ? (
            <button
              className="s-btn s-fade-3"
              onClick={() => setChatOpen(true)}
              style={{
                marginTop: 64,
                padding: "16px 56px",
                border: "1px solid rgba(0, 255, 255, 0.28)",
                borderRadius: 12,
                background: "rgba(0, 255, 255, 0.02)",
                color: "#FFFFFF",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 8px 32px rgba(0, 255, 255, 0.05), inset 0 0 12px rgba(0, 255, 255, 0.03)",
                transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#00FFFF",
                textShadow: "0 0 12px rgba(0, 255, 255, 0.3)",
              }}>
                PINCHA ACÁ
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "rgba(255, 255, 255, 0.6)",
              }}>
                Iniciar Soporte TI
              </span>
            </button>
          ) : (
            <div className="s-chat" style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 48 }}>
              <SondaAssistant />
            </div>
          )}
        </div>

        {/* ── Link admin — casi invisible ── */}
        <Link
          href="/admin"
          style={{
            position: "absolute",
            bottom: 24,
            right: 28,
            fontSize: 11,
            color: "rgba(255, 255, 255, 0.2)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            fontWeight: 500,
            transition: "color 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(0, 255, 255, 0.7)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255, 255, 255, 0.2)"}
        >
          Panel Admin →
        </Link>
      </main>
    </>
  );
}

function SondaLogoModern({ width = 280 }: { width?: number }) {
  const h = Math.round(width * 0.32);
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 520 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SONDA"
      role="img"
    >
      {/* ── WORDMARK SONDA — Tipografía oficial centrada en blanco ── */}
      <text
        x="50%"
        y="120"
        textAnchor="middle"
        fontFamily="'Kumbh Sans', 'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="122"
        letterSpacing="-3.5"
        fill="#FFFFFF"
      >
        SONDA
      </text>

      {/* Registed trademark ® en superíndice al lado derecho */}
      <text
        x="482"
        y="42"
        fontFamily="'Kumbh Sans', 'Arial', sans-serif"
        fontWeight="600"
        fontSize="32"
        fill="rgba(0, 255, 255, 0.85)"
      >
        ®
      </text>
    </svg>
  );
}
