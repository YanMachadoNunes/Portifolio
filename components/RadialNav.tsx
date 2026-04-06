"use client";

import { useState, useEffect } from "react";

type Item = {
  label: string;
  href: string;
  angle: number;   // degrees, standard math (0=right, 90=up, 180=left)
  color: string;
  icon: string;
  external?: boolean;
};

const ITEMS: Item[] = [
  { label: "projetos", href: "#projects", angle: 180, color: "#818cf8", icon: "🔭" },
  { label: "stack",    href: "#stack",    angle: 150, color: "#67e8f9", icon: "⚡" },
  { label: "sobre",    href: "#about",    angle: 120, color: "#a78bfa", icon: "🪐" },
  {
    label: "github",
    href:  "https://github.com/YanMachadoNunes",
    angle: 90, color: "#c4cfe0", icon: "★", external: true,
  },
];

const BTN_SIZE  = 64;   // main button diameter
const ITEM_SIZE = 58;   // nav item diameter
const RADIUS    = 116;  // arc radius

function hexRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}`
    : "255,255,255";
}

export default function RadialNav() {
  const [open, setOpen] = useState(false);
  const [hov,  setHov]  = useState<string | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 98,
            background: "rgba(0,0,10,0.25)",
            backdropFilter: "blur(1.5px)",
          }}
        />
      )}

      {/* Root anchor — same size as the button */}
      <div style={{
        position: "fixed",
        bottom: 36, right: 36,
        width:  BTN_SIZE,
        height: BTN_SIZE,
        zIndex: 100,
      }}>

        {/* ── Orbit ring ── */}
        <div style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1px ${open ? "solid" : "dashed"} rgba(99,102,241,${open ? 0.14 : 0.25})`,
          transition: "all 0.4s ease",
          pointerEvents: "none",
          width:   open ? 92 : 84,
          height:  open ? 92 : 84,
          top:  "50%", left: "50%",
          marginTop:  open ? -46 : -42,
          marginLeft: open ? -46 : -42,
        }} />

        {/* ── Orbiting dot (only when closed) ── */}
        {!open && (
          <div style={{
            position: "absolute",
            width: 84, height: 84,
            borderRadius: "50%",
            top: "50%", left: "50%",
            marginTop: -42, marginLeft: -42,
            pointerEvents: "none",
            animation: "orbit-button 3.8s linear infinite",
          }}>
            <div style={{
              position: "absolute",
              width: 6, height: 6, borderRadius: "50%",
              background: "#818cf8",
              top: -3, left: "calc(50% - 3px)",
              boxShadow: "0 0 10px #818cf8, 0 0 20px rgba(99,102,241,0.55)",
            }} />
          </div>
        )}

        {/* ── Nav items ── */}
        {ITEMS.map((item, i) => {
          const rad   = (item.angle * Math.PI) / 180;
          const tx    = open ? Math.cos(rad) * RADIUS : 0;
          const ty    = open ? -Math.sin(rad) * RADIUS : 0;
          const delay = open
            ? `${i * 0.07}s`
            : `${(ITEMS.length - 1 - i) * 0.045}s`;
          const isHov = hov === item.label;

          /*
           * Label: positioned radially OUTWARD from the item center.
           * dx = cos(angle)*62, dy = -sin(angle)*62 (CSS y-axis is inverted)
           * This guarantees labels always point away from the center → no overlap.
           */
          const labelDx = Math.cos(rad) * 64;
          const labelDy = -Math.sin(rad) * 64;

          return (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => { if (!item.external) setOpen(false); }}
              onMouseEnter={() => setHov(item.label)}
              onMouseLeave={() => setHov(null)}
              style={{
                /* Center item on the button */
                position: "absolute",
                top:  "50%", left: "50%",
                width:      ITEM_SIZE,
                height:     ITEM_SIZE,
                marginTop:  -(ITEM_SIZE / 2),
                marginLeft: -(ITEM_SIZE / 2),
                borderRadius: "50%",
                background: isHov
                  ? `rgba(${hexRgb(item.color)}, 0.18)`
                  : "rgba(4,4,24,0.9)",
                border: `1px solid ${item.color}${isHov ? "60" : "30"}`,
                backdropFilter: "blur(16px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                fontSize: 22,
                cursor: "pointer",
                transform: `translate(${tx}px, ${ty}px)`,
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: [
                  `transform 0.46s cubic-bezier(0.34,1.56,0.64,1) ${delay}`,
                  `opacity 0.26s ${delay}`,
                  "background 0.2s",
                  "border-color 0.2s",
                  "box-shadow 0.2s",
                ].join(", "),
                boxShadow: isHov
                  ? `0 0 28px ${item.color}4a, 0 0 10px ${item.color}22`
                  : `0 0 8px ${item.color}0e`,
              }}
            >
              {item.icon}

              {/* Label — points radially outward, never overlaps siblings */}
              <span style={{
                position: "absolute",
                /* Radial offset from item center */
                top:  `calc(50% + ${labelDy}px)`,
                left: `calc(50% + ${labelDx}px)`,
                transform: "translate(-50%, -50%)",
                fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
                textTransform: "uppercase",
                color: item.color,
                whiteSpace: "nowrap",
                fontFamily: "'JetBrains Mono', monospace",
                opacity: open ? (isHov ? 1 : 0.45) : 0,
                transition: "opacity 0.18s",
                pointerEvents: "none",
                background: "rgba(0,0,16,0.88)",
                padding: "3px 8px", borderRadius: 4,
                border: `1px solid ${item.color}${isHov ? "30" : "16"}`,
              }}>
                {item.label}
              </span>
            </a>
          );
        })}

        {/* ── Main toggle button ── */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width:      BTN_SIZE,
            height:     BTN_SIZE,
            marginTop:  -(BTN_SIZE / 2),
            marginLeft: -(BTN_SIZE / 2),
            borderRadius: "50%",
            background: open
              ? "linear-gradient(135deg, rgba(14,14,38,0.97), rgba(6,6,22,0.99))"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: `1.5px solid ${open ? "rgba(99,102,241,0.4)" : "rgba(165,180,252,0.5)"}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: open
              ? "0 0 22px rgba(99,102,241,0.15)"
              : "0 0 36px rgba(99,102,241,0.52), 0 4px 22px rgba(99,102,241,0.36)",
            transition: "all 0.38s cubic-bezier(0.34,1.56,0.64,1)",
            transform: open ? "scale(1.1) rotate(135deg)" : "scale(1) rotate(0deg)",
            outline: "none",
            zIndex: 1,
          }}
        >
          {open ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="rgba(165,180,252,0.85)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white">
              <circle cx="12" cy="12" r="9"  strokeWidth="1.2" strokeOpacity="0.4" />
              <circle cx="12" cy="12" r="3.2" fill="white" stroke="none" />
              <line x1="12" y1="3"  x2="12" y2="7"  strokeWidth="1.7" />
              <line x1="12" y1="17" x2="12" y2="21" strokeWidth="1.7" />
              <line x1="3"  y1="12" x2="7"  y2="12" strokeWidth="1.7" />
              <line x1="17" y1="12" x2="21" y2="12" strokeWidth="1.7" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
