"use client";

import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Stars ── */
    const stars = Array.from({ length: 420 }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 1.5 + 0.15,
      op:    Math.random() * 0.75 + 0.22,
      speed: Math.random() * 1.6 + 0.25,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.88
        ? (Math.random() > 0.5 ? "255,220,180" : "180,210,255")
        : "255,255,255",
    }));

    /* ── Shooting stars ── */
    interface Streak { x:number; y:number; dx:number; dy:number; len:number; op:number; active:boolean }
    const streaks: Streak[] = Array.from({ length: 6 }, () =>
      ({ x:0, y:0, dx:0, dy:0, len:0, op:0, active:false })
    );

    const spawn = (s: Streak) => {
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.55;
      const spd   = Math.random() * 12 + 8;
      s.x = Math.random() * 0.65; s.y = Math.random() * 0.42;
      s.dx = Math.cos(angle) * spd; s.dy = Math.sin(angle) * spd;
      s.len = Math.random() * 155 + 75; s.op = 1; s.active = true;
    };

    [1600, 5000, 9200, 14500, 19000, 25000].forEach((ms, i) =>
      setTimeout(() => spawn(streaks[i]), ms)
    );

    let t = 0, raf = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      /* ── Distant galaxies (drawn first, static) ── */
      const galaxy = (
        cx: number, cy: number,
        size: number, tilt: number,
        rgb: string, opacity: number
      ) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);

        // Outer disk
        const disk = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        disk.addColorStop(0,    `rgba(${rgb},${opacity})`);
        disk.addColorStop(0.45, `rgba(${rgb},${opacity * 0.22})`);
        disk.addColorStop(1,    `rgba(${rgb},0)`);
        ctx.fillStyle = disk;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.22);
        core.addColorStop(0, `rgba(${rgb},${Math.min(1, opacity * 2.8)})`);
        core.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.22, size * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      // 3 minimalist galaxies — low opacity, different tilts & colors
      galaxy(W * 0.09, H * 0.14,  95, 0.55,  "210,220,255", 0.13);
      galaxy(W * 0.84, H * 0.50, 120, -0.35, "255,200,235", 0.10);
      galaxy(W * 0.28, H * 0.90,  78,  1.05, "200,225,255", 0.11);

      /* ── Nebula clouds ── */
      const neb = (cx: number, cy: number, r: number, rgb: string, a: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,    `rgba(${rgb},${a})`);
        g.addColorStop(0.45, `rgba(${rgb},${a * 0.18})`);
        g.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      };
      neb(W * .16, H * .24, 420, "105,30,230",  .10);
      neb(W * .80, H * .18, 350, "22,65,240",   .09);
      neb(W * .50, H * .73, 490, "205,15,160",  .08);
      neb(W * .89, H * .66, 290, "12,180,205",  .08);
      neb(W * .06, H * .80, 260, "82,10,188",   .08);
      neb(W * .63, H * .05, 220, "220,85,20",   .06);
      neb(W * .34, H * .53, 320, "50,110,235",  .07);
      neb(W * .25, H * .85, 200, "160,30,200",  .06);

      /* ── Stars ── */
      stars.forEach(s => {
        const flick = 0.38 + 0.62 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        const op = s.op * flick;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${op})`;
        ctx.fill();

        /* Sparkle cross for bigger stars */
        if (s.r > 1.15) {
          const px = s.x * W, py = s.y * H;
          ctx.save();
          ctx.strokeStyle = `rgba(${s.color},${op * 0.2})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(px - s.r * 5, py); ctx.lineTo(px + s.r * 5, py);
          ctx.moveTo(px, py - s.r * 5); ctx.lineTo(px, py + s.r * 5);
          ctx.stroke(); ctx.restore();
        }
      });

      /* ── Shooting stars ── */
      streaks.forEach((s, i) => {
        if (!s.active) return;
        s.x += s.dx / W; s.y += s.dy / H; s.op -= 0.0085;
        if (s.op <= 0 || s.x > 1.15 || s.y > 1.1) {
          s.active = false;
          setTimeout(() => spawn(streaks[i]), Math.random() * 8000 + 4500);
          return;
        }
        const x1 = s.x * W, y1 = s.y * H;
        const x0 = x1 - (s.dx / W) * s.len;
        const y0 = y1 - (s.dy / H) * s.len;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0,   "rgba(255,255,255,0)");
        g.addColorStop(.72, `rgba(215,228,255,${s.op * .42})`);
        g.addColorStop(1,   `rgba(255,255,255,${s.op})`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        /* Tip glow */
        ctx.beginPath(); ctx.arc(x1, y1, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.op})`; ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", width: "100%", height: "100%",
      }}
    />
  );
}
