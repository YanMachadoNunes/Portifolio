'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ============================================================
// SOUND SYSTEM — Web Audio API singleton
// ============================================================
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch { return null; }
}

const S = {
  select() {
    const c = getCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(880, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.07);
    g.gain.setValueAtTime(0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    o.start(c.currentTime); o.stop(c.currentTime + 0.1);
  },
  hover() {
    const c = getCtx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'square'; o.frequency.value = 1100;
    g.gain.setValueAtTime(0.04, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.022);
    o.start(c.currentTime); o.stop(c.currentTime + 0.022);
  },
  whoosh() {
    const c = getCtx(); if (!c) return;
    const len = Math.floor(c.sampleRate * 0.22);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(3500, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(350, c.currentTime + 0.22);
    const g = c.createGain();
    g.gain.setValueAtTime(0.28, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start();
  },
  cardFlip() {
    const c = getCtx(); if (!c) return;
    [0, 0.07].forEach(off => {
      const len = Math.floor(c.sampleRate * 0.055);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800 + off * 2000;
      const g = c.createGain(); const t = c.currentTime + off;
      g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
    });
  },
  startup() {
    const c = getCtx(); if (!c) return;
    [220, 330, 440, 660, 880, 1100].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'square'; o.frequency.value = freq;
      const t = c.currentTime + i * 0.13;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.start(t); o.stop(t + 0.18);
    });
  },
  allout() {
    const c = getCtx(); if (!c) return;
    // Impact boom
    const len = Math.floor(c.sampleRate * 0.55);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 0.4) * (i < len * 0.08 ? i / (len * 0.08) : 1);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = c.createGain(); g.gain.setValueAtTime(0.55, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.55);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start();
    // Pitch sting
    const o = c.createOscillator(), go = c.createGain();
    o.connect(go); go.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(900, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(350, c.currentTime + 0.35);
    go.gain.setValueAtTime(0.28, c.currentTime);
    go.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    o.start(c.currentTime); o.stop(c.currentTime + 0.35);
  },
  // Arpeggio note — one per menu item (index 0-3)
  arpNote(index: number) {
    const c = getCtx(); if (!c) return;
    const freqs = [330, 392, 440, 523]; // E G A C (minor feel)
    const freq = freqs[index % freqs.length];
    const t = c.currentTime + index * 0.055;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.start(t); o.stop(t + 0.16);
  },
  menuOpen() {
    const c = getCtx(); if (!c) return;
    const len = Math.floor(c.sampleRate * 0.18);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(4000, c.currentTime);
    f.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.18);
    const g = c.createGain();
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start();
  },
};

// Bootstrap AudioContext on first user gesture
if (typeof window !== 'undefined') {
  const boot = () => getCtx();
  window.addEventListener('click', boot, { once: true });
  window.addEventListener('keydown', boot, { once: true });
}

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================
interface Notif { id: number; arcana: string; title: string; }

function emitNotif(arcana: string, title: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('persona-notif', { detail: { arcana, title } }));
}

function NotifToast({ n, onDone }: { n: Notif; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      className="flex items-center gap-0 bg-[#080808] border border-[#E61F1F]/40 cut-corner-sm shadow-2xl overflow-hidden"
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      style={{ minWidth: 260 }}
    >
      <div className="w-1 self-stretch bg-[#E61F1F] shrink-0" />
      <div className="py-3 px-4 flex-1">
        <p className="text-[#E61F1F] font-bold uppercase mb-0.5" style={{ fontSize: 9, letterSpacing: '0.35em' }}>
          CONFIDANT UNLOCKED
        </p>
        <p className="text-white font-black text-sm leading-tight">{n.arcana}</p>
        <p className="text-white/40 font-bold tracking-wider" style={{ fontSize: 10 }}>{n.title}</p>
      </div>
      <span className="text-[#E61F1F]/15 font-black text-4xl pr-4 select-none">♠</span>
    </motion.div>
  );
}

// ============================================================
// CUSTOM CURSOR
// ============================================================
function CustomCursor() {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; k: number }>>([]);
  const [clicking, setClicking] = useState(false);
  const kRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const p = { x: e.clientX, y: e.clientY };
      setPos(p);
      setTrail(prev => [{ ...p, k: kRef.current++ }, ...prev].slice(0, 9));
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <>
      {trail.map((t, i) => (
        <div
          key={t.k}
          className="fixed pointer-events-none z-[9997] rounded-full bg-[#E61F1F]"
          style={{
            width: Math.max(2, 7 - i),
            height: Math.max(2, 7 - i),
            left: t.x - Math.max(2, 7 - i) / 2,
            top: t.y - Math.max(2, 7 - i) / 2,
            opacity: (1 - i / 9) * 0.3,
          }}
        />
      ))}
      {/* Diamond cursor */}
      <div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) rotate(45deg) scale(${clicking ? 0.6 : 1})`,
          transition: 'transform 0.08s ease',
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            background: '#E61F1F',
            boxShadow: clicking
              ? '0 0 18px rgba(230,31,31,1), 0 0 36px rgba(230,31,31,0.7)'
              : '0 0 7px rgba(230,31,31,0.8)',
            transition: 'box-shadow 0.08s ease',
          }}
        />
      </div>
    </>
  );
}

// ============================================================
// SPEED LINES (hero background)
// ============================================================
const SPEED_LINE_DATA = Array.from({ length: 42 }, (_, i) => {
  const angle = (i / 42) * Math.PI * 2;
  return {
    angle,
    len: 380 + (i * 37 % 280),
    thick: i % 5 === 0 ? 2.5 : 1,
    delay: 3.6 + (i % 9) * 0.11,
    repeatDelay: 3.5 + (i % 7) * 0.5,
  };
});

function SpeedLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {SPEED_LINE_DATA.map((l, i) => {
        const cx = 360, cy = 350;
        const x1 = cx + Math.cos(l.angle) * 18;
        const y1 = cy + Math.sin(l.angle) * 18;
        const x2 = cx + Math.cos(l.angle) * l.len;
        const y2 = cy + Math.sin(l.angle) * l.len;
        return (
          <motion.line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="white"
            strokeWidth={l.thick}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.065, 0] }}
            transition={{ duration: 1.1, delay: l.delay, repeat: Infinity, repeatDelay: l.repeatDelay }}
          />
        );
      })}
    </svg>
  );
}

// ============================================================
// TEXT SCRAMBLE HOOK
// ============================================================
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ♠♥♦♣0123456789#@!';

function useScramble(text: string, active: boolean) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const total = text.length * 3;
    const id = setInterval(() => {
      frame++;
      setOut(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (frame >= i * 3 + 3) return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('')
      );
      if (frame >= total) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [active, text]);
  return out;
}

// ============================================================
// ALL OUT ATTACK CINEMATIC
// ============================================================
function AllOutAttack({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    S.allout();
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9975] pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Red background */}
      <motion.div
        className="absolute inset-0 bg-[#E61F1F]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 1] }}
        style={{ originX: 0 }}
        transition={{ duration: 0.25, times: [0, 1, 1] }}
      />
      {/* Diagonal black slabs */}
      <div className="absolute inset-0 bg-[#080808]" style={{ clipPath: 'polygon(0 0, 28% 0, 18% 100%, 0 100%)' }} />
      <div className="absolute inset-0 bg-[#080808]" style={{ clipPath: 'polygon(72% 0, 100% 0, 100% 100%, 82% 100%)' }} />
      {/* Scanline overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)',
        }}
      />
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <motion.p
          className="text-white/50 font-bold uppercase tracking-[1em]"
          style={{ fontSize: 11 }}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          PHANTOM THIEVES
        </motion.p>
        <motion.div
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 16 }}
        >
          <h2
            className="text-white font-black uppercase text-center leading-none"
            style={{
              fontSize: 'clamp(44px, 9vw, 104px)',
              letterSpacing: '0.08em',
              textShadow: '5px 5px 0 rgba(0,0,0,0.35)',
            }}
          >
            ALL OUT
          </h2>
        </motion.div>
        <motion.div
          initial={{ scale: 0.2, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.38, type: 'spring', stiffness: 320, damping: 14 }}
        >
          <h2
            className="font-black uppercase text-center leading-none"
            style={{
              fontSize: 'clamp(44px, 9vw, 104px)',
              letterSpacing: '0.08em',
              color: 'transparent',
              WebkitTextStroke: '3px white',
              textShadow: '5px 5px 0 rgba(0,0,0,0.3)',
            }}
          >
            ATTACK!
          </h2>
        </motion.div>
        {/* Stars */}
        <motion.div
          className="flex gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {['♠', '♥', '♦', '♣', '♠'].map((s, i) => (
            <motion.span
              key={i}
              className="text-white font-black text-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 300 }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>
      </div>
      {/* Fade out overlay */}
      <motion.div
        className="absolute inset-0 bg-[#080808]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      />
    </motion.div>
  );
}

// ============================================================
// LOADING SCREEN
// ============================================================
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    S.startup();
    const t = setTimeout(onComplete, 2900);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-[#080808] z-[9999] flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* Expanding red circle */}
      <motion.div
        className="absolute rounded-full bg-[#E61F1F]"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: '200vmax', height: '200vmax', opacity: [1, 1, 0] }}
        transition={{ duration: 2.3, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.7, 1] }}
      />
      {/* Center */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, duration: 0.6, type: 'spring', stiffness: 180 }}
          className="text-white font-black"
          style={{ fontSize: 88 }}
        >
          ♠
        </motion.div>
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.1em' }}
          animate={{ opacity: 1, letterSpacing: '0.55em' }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-white font-bold uppercase"
          style={{ fontSize: 13, letterSpacing: '0.55em' }}
        >
          INITIATING
        </motion.p>
        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-[#E61F1F] rotate-45"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.3] }}
              transition={{ delay: 0.9 + i * 0.18, duration: 0.4, repeat: Infinity, repeatDelay: 0.7 }}
            />
          ))}
        </div>
        <motion.p
          className="text-white/30 font-bold"
          style={{ fontSize: 10, letterSpacing: '0.3em' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1.5, duration: 1, repeat: 1 }}
        >
          PRESS ANY KEY
        </motion.p>
      </div>
      {/* Corner decorations */}
      {[
        'top-4 left-4',
        'top-4 right-4 rotate-90',
        'bottom-4 left-4 -rotate-90',
        'bottom-4 right-4 rotate-180',
      ].map((cls, i) => (
        <div key={i} className={`absolute ${cls} text-[#E61F1F] font-black text-2xl opacity-40`}>◤</div>
      ))}
    </motion.div>
  );
}

// ============================================================
// PERSONA 5 MENU
// ============================================================
const NAV_ITEMS = [
  { label: 'ABOUT',    href: '#about',    suit: '♥', num: '01' },
  { label: 'SKILLS',   href: '#skills',   suit: '♦', num: '02' },
  { label: 'PROJECTS', href: '#projects', suit: '♣', num: '03' },
  { label: 'CONTACT',  href: '#contact',  suit: '♠', num: '04' },
];

// Stagger container: items cascade in/out
const menuContainerVariants = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

// Each item slides in from left with spring overshoot
const menuItemVariants = {
  closed: { x: '-130%', opacity: 0 },
  open:   { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 18 } },
};

function MenuNavItem({
  item, index, onClose,
}: {
  item: typeof NAV_ITEMS[0]; index: number; onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  // Play arpeggio note when the item mounts (menu opens)
  useEffect(() => { S.arpNote(index); }, [index]);

  return (
    <motion.div
      variants={menuItemVariants}
      className="relative mb-2"
      // Skew the whole block — the Persona 5 slant
      style={{ transform: 'skewX(-12deg)', transformOrigin: 'left center' }}
    >
      <motion.a
        href={item.href}
        className="block relative overflow-hidden"
        style={{
          background: hovered ? '#FFFFFF' : '#080808',
          border: `2px solid ${hovered ? '#E61F1F' : 'rgba(255,255,255,0.8)'}`,
          // Irregular polygon — "recorte de revista"
          clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)',
          paddingLeft: 28,
          paddingRight: 56,
          paddingTop: 14,
          paddingBottom: 14,
          transition: 'background 0.08s ease, border-color 0.08s ease',
        }}
        onHoverStart={() => { setHovered(true); S.hover(); }}
        onHoverEnd={() => setHovered(false)}
        onClick={() => { S.select(); onClose(); }}
        // Micro-shake while hovered
        animate={hovered ? {
          x: [-2, 2, -2, 2, -1, 1, -1, 0],
          transition: { duration: 0.35, repeat: Infinity, repeatDelay: 0.25 },
        } : { x: 0 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Counter-skew inner content so text reads straight */}
        <div style={{ transform: 'skewX(12deg)' }}>
          {/* Number badge */}
          <div
            className="font-black mb-0.5"
            style={{
              fontSize: 10,
              letterSpacing: '0.35em',
              color: hovered ? '#E61F1F' : 'rgba(255,255,255,0.25)',
            }}
          >
            {item.num}
          </div>
          {/* Label */}
          <div
            className="font-black leading-none"
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              letterSpacing: '0.06em',
              color: hovered ? '#080808' : '#FFFFFF',
            }}
          >
            {item.label}
          </div>
        </div>

        {/* Exploding suit symbol behind text on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              className="absolute right-5 top-1/2 font-black pointer-events-none select-none"
              style={{
                fontSize: 64,
                color: '#E61F1F',
                translateY: '-50%',
                lineHeight: 1,
              }}
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 0.3 }}
              exit={{ scale: 2.5, rotate: 15, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.18, type: 'spring', stiffness: 400 }}
            >
              {item.suit}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Red fill line at bottom of item */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[#E61F1F]"
          initial={{ width: 0 }}
          animate={{ width: hovered ? '100%' : 0 }}
          transition={{ duration: 0.15 }}
        />
      </motion.a>
    </motion.div>
  );
}

function PersonaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark backdrop */}
          <motion.div
            className="fixed inset-0 z-[9960] bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.15 } }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.div
            className="fixed top-0 left-0 h-full z-[9965] flex flex-col justify-center"
            style={{ width: 'min(420px, 90vw)', paddingTop: 80, paddingBottom: 60 }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%', transition: { duration: 0.3, ease: 'easeIn' } }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Panel background */}
            <div className="absolute inset-0 bg-[#080808]" />
            {/* Vertical red strip on right edge */}
            <div className="absolute top-0 right-0 w-[3px] h-full bg-[#E61F1F]" />
            {/* Big watermark suit */}
            <div
              className="absolute bottom-8 right-8 font-black text-white/[0.03] pointer-events-none select-none leading-none"
              style={{ fontSize: 260 }}
              aria-hidden
            >
              ♠
            </div>
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 6px)',
              }}
            />

            {/* Logo inside menu */}
            <div className="absolute top-6 left-7 flex items-center gap-2">
              <span className="text-[#E61F1F] font-black text-2xl">♠</span>
              <span className="text-white font-black text-lg tracking-widest opacity-60">YAN</span>
            </div>

            {/* Close button */}
            <button
              className="absolute top-5 right-6 text-white/40 hover:text-[#E61F1F] font-black text-2xl transition-colors"
              onClick={() => { S.select(); onClose(); }}
              aria-label="Close menu"
            >
              ✕
            </button>

            {/* Stagger container for nav items */}
            <motion.div
              className="relative z-10 px-6"
              variants={menuContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {NAV_ITEMS.map((item, i) => (
                <MenuNavItem key={item.label} item={item} index={i} onClose={onClose} />
              ))}
            </motion.div>

            {/* Bottom — HIRE ME CTA */}
            <motion.div
              className="absolute bottom-8 left-7 right-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <a
                href="#contact"
                onClick={() => { S.select(); onClose(); }}
                onMouseEnter={() => S.hover()}
                className="block bg-[#E61F1F] text-white font-black text-sm tracking-widest text-center py-3 cut-corner hover:bg-white hover:text-[#E61F1F] transition-colors duration-150 uppercase"
              >
                ♠ START THE HEIST ♠
              </a>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const openMenu = () => { S.menuOpen(); setMenuOpen(true); };
  const closeMenu = () => { S.select(); setMenuOpen(false); };

  return (
    <>
      <PersonaMenu isOpen={menuOpen} onClose={closeMenu} />

      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ delay: 2.9, duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[9950] transition-all duration-300 ${
          scrolled ? 'bg-[#080808]/96 backdrop-blur-sm border-b border-[#E61F1F]/20' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group" onClick={() => S.select()}>
            <motion.span
              className="text-[#E61F1F] font-black text-2xl"
              whileHover={{ rotate: 180, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              ♠
            </motion.span>
            <span className="text-white font-black text-xl tracking-widest">YAN</span>
          </a>

          {/* Hamburger — three diagonal slashes */}
          <motion.button
            className="relative flex flex-col gap-[5px] p-2 group"
            onClick={openMenu}
            onMouseEnter={() => S.hover()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Open menu"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="bg-white group-hover:bg-[#E61F1F] transition-colors duration-150"
                style={{
                  height: 2,
                  width: i === 1 ? 28 : 22,
                  transform: `skewX(-15deg)`,
                  marginLeft: i === 2 ? 6 : 0,
                }}
                whileHover={{ width: 28 }}
              />
            ))}
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  return (
    <section className="relative min-h-screen bg-[#080808] overflow-hidden flex items-center noise scanlines">
      <SpeedLines />
      {/* Diagonal red slab */}
      <motion.div
        className="absolute inset-0 bg-[#E61F1F]"
        style={{ clipPath: 'polygon(55% 0, 100% 0, 45% 100%, 0% 100%)' }}
        initial={{ x: '110%' }}
        animate={{ x: 0 }}
        transition={{ delay: 3.1, duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <div className="absolute inset-0 bg-[#080808]/40" style={{ clipPath: 'polygon(55% 0, 100% 0, 45% 100%, 0% 100%)' }} />

      {/* Kanji decoration */}
      <motion.div
        className="absolute right-12 top-1/2 -translate-y-1/2 text-white/5 font-black select-none pointer-events-none"
        style={{ fontSize: 'clamp(100px, 18vw, 260px)', lineHeight: 1, writingMode: 'vertical-rl' }}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.6, duration: 1 }}
      >
        覚醒
      </motion.div>
      <motion.p
        className="absolute top-28 right-10 text-[#E61F1F]/40 font-bold tracking-widest"
        style={{ fontSize: 11 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.1, duration: 0.5 }}
      >
        目覚めろ — AWAKEN
      </motion.p>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <motion.p
          className="text-[#E61F1F] font-bold uppercase mb-4"
          style={{ fontSize: 11, letterSpacing: '0.5em' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.3, duration: 0.5 }}
        >
          ♠ PHANTOM THIEF OF CODE ♠
        </motion.p>
        <motion.h1
          className="font-black text-white leading-none mb-2"
          style={{ fontSize: 'clamp(60px, 12vw, 140px)' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.6 }}
        >
          YAN
        </motion.h1>
        <motion.h2
          className="font-black text-[#E61F1F] leading-none mb-8"
          style={{ fontSize: 'clamp(28px, 5vw, 64px)' }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.55, duration: 0.6 }}
        >
          FULL STACK DEVELOPER
        </motion.h2>
        <motion.p
          className="text-white/50 font-medium text-lg max-w-lg mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8, duration: 0.6 }}
        >
          Crafting high-performance SaaS, e-commerce &amp; web applications.<br />
          Next.js · TypeScript · PostgreSQL
        </motion.p>
        <motion.div
          className="flex gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.5 }}
        >
          <a
            href="#projects"
            onMouseEnter={() => S.hover()}
            onClick={() => S.select()}
            className="bg-[#E61F1F] text-white font-bold text-sm tracking-widest px-8 py-4 cut-corner hover:bg-white hover:text-[#E61F1F] transition-colors duration-200 uppercase"
          >
            VIEW PROJECTS →
          </a>
          <a
            href="#contact"
            onMouseEnter={() => S.hover()}
            onClick={() => S.select()}
            className="border border-white/20 text-white/80 font-bold text-sm tracking-widest px-8 py-4 cut-corner hover:border-[#E61F1F] hover:text-white transition-colors duration-200 uppercase"
          >
            GET IN TOUCH
          </a>
        </motion.div>
      </div>

      {/* Bottom suits */}
      <div className="absolute bottom-8 left-6 flex gap-2 opacity-20">
        {['♠', '♥', '♦', '♣'].map((s, i) => (
          <motion.span
            key={s}
            className="text-white font-black text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.3 + i * 0.1 }}
          >
            {s}
          </motion.span>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.6 }}
      >
        <motion.div
          className="w-px h-16 bg-gradient-to-b from-[#E61F1F] to-transparent"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span
          className="text-white/30 font-bold tracking-widest"
          style={{ fontSize: 10, writingMode: 'vertical-rl' }}
        >
          SCROLL
        </span>
      </motion.div>
    </section>
  );
}

// ============================================================
// SECTION HEADING (with scramble + notification)
// ============================================================
function SectionHeading({
  arcana, title, subtitle, notifArcana, notifTitle,
}: {
  arcana: string; title: string; subtitle?: string; notifArcana?: string; notifTitle?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const displayTitle = useScramble(title, inView);
  const firedRef = useRef(false);

  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true;
      S.whoosh();
      if (notifArcana && notifTitle) {
        setTimeout(() => emitNotif(notifArcana, notifTitle), 700);
      }
    }
  }, [inView, notifArcana, notifTitle]);

  return (
    <div ref={ref} className="mb-16">
      <motion.p
        className="text-[#E61F1F] font-bold uppercase mb-3"
        style={{ fontSize: 11, letterSpacing: '0.5em' }}
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {arcana}
      </motion.p>
      <motion.h2
        className="font-black text-white leading-none"
        style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {displayTitle}
      </motion.h2>
      {subtitle && (
        <motion.p
          className="text-white/40 font-medium mt-4 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.div
        className="mt-4 h-1 bg-[#E61F1F]"
        style={{ width: 60 }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </div>
  );
}

// ============================================================
// ABOUT
// ============================================================
function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="py-32 bg-[#0D0D0D] relative overflow-hidden">
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 text-white/[0.02] font-black select-none"
        style={{ fontSize: '280px', lineHeight: 1 }}
      >
        I
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          arcana="♥ ARCANA I — THE LOVERS"
          title="ABOUT ME"
          notifArcana="THE LOVERS — Arcana I"
          notifTitle="Yan · Full Stack Developer"
        />
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            className="bg-[#111111] cut-corner p-8 border border-white/5 card-glow"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            onHoverStart={() => S.hover()}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-3 h-3 bg-[#E61F1F] rotate-45" />
              <span className="text-[#E61F1F] font-bold text-xs tracking-widest uppercase">CONFIDANT PROFILE</span>
            </div>
            <h3 className="text-white font-black text-3xl mb-4">
              Yan<br /><span className="text-[#E61F1F]">Full Stack Dev</span>
            </h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Desenvolvedor Full Stack especializado em construir aplicações web escaláveis e de alta performance.
              Do SaaS de gestão óptica a sistemas de clínicas médicas — transformo ideias complexas em produtos funcionais e elegantes.
            </p>
            <p className="text-white/60 leading-relaxed">
              Apaixonado por UX/UI, arquitetura limpa e resolver problemas reais com código. Always shipping.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[['4+', 'ANOS DE EXP'], ['10+', 'PROJETOS'], ['4', 'SAAS APPS']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-[#E61F1F] font-black text-2xl">{num}</div>
                  <div className="text-white/30 text-xs tracking-wider font-bold">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="flex flex-col gap-4">
            {[
              { icon: '♠', label: 'CODE', value: 'TypeScript, JavaScript, SQL, HTML/CSS' },
              { icon: '♥', label: 'FRAMEWORKS', value: 'Next.js, React, Prisma, Node.js' },
              { icon: '♦', label: 'INFRA', value: 'PostgreSQL, Docker, Vercel, Railway' },
              { icon: '♣', label: 'IDIOMA', value: 'Português (nativo), English (fluent)' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-4 bg-[#111111] cut-corner-sm p-4 border border-white/5 card-glow"
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                onHoverStart={() => S.hover()}
              >
                <span className="text-[#E61F1F] font-black text-xl w-8">{item.icon}</span>
                <div>
                  <div className="text-white/30 text-xs tracking-widest font-bold mb-1">{item.label}</div>
                  <div className="text-white font-medium text-sm">{item.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SKILLS
// ============================================================
const SKILLS = [
  { name: 'Next.js',     level: 95, rank: 'MASTER', suit: '♠' },
  { name: 'React',       level: 95, rank: 'MASTER', suit: '♥' },
  { name: 'TypeScript',  level: 90, rank: 'MASTER', suit: '♦' },
  { name: 'Node.js',     level: 85, rank: 'EXPERT', suit: '♣' },
  { name: 'PostgreSQL',  level: 85, rank: 'EXPERT', suit: '♠' },
  { name: 'Prisma',      level: 88, rank: 'EXPERT', suit: '♥' },
  { name: 'TailwindCSS', level: 92, rank: 'MASTER', suit: '♦' },
  { name: 'Docker',      level: 75, rank: 'ADEPT',  suit: '♣' },
];

const RANK_STARS: Record<string, number> = { MASTER: 5, EXPERT: 4, ADEPT: 3 };

function SkillCard({ skill, delay }: { skill: typeof SKILLS[0]; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const stars = RANK_STARS[skill.rank] ?? 3;
  const segments = 20;
  const filledSegs = Math.round(skill.level / 5);

  return (
    <motion.div
      ref={ref}
      className="relative bg-[#0E0E0E] overflow-hidden group"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, rotateX: -25, y: 28 }}
      animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100, damping: 14 }}
      whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15 } }}
      onHoverStart={() => S.hover()}
    >
      {/* Diagonal top-right red corner — grows on hover */}
      <motion.div
        className="absolute top-0 right-0 bg-[#E61F1F] z-0"
        style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
        initial={{ width: 44, height: 44 }}
        whileHover={{ width: 72, height: 72 }}
        transition={{ duration: 0.2 }}
      />

      {/* Faint watermark suit */}
      <div
        className="absolute bottom-0 right-2 font-black text-white/[0.04] pointer-events-none select-none leading-none"
        style={{ fontSize: 120 }}
        aria-hidden
      >
        {skill.suit}
      </div>

      {/* Card content */}
      <div className="relative z-10 p-5 flex flex-col gap-3">

        {/* Row 1: suit + stars + rank */}
        <div className="flex items-start justify-between">
          <span className="font-black text-2xl text-[#E61F1F]/45 group-hover:text-[#E61F1F] transition-colors duration-200">
            {skill.suit}
          </span>
          <div className="flex flex-col items-end gap-1">
            {/* Diamond star rating */}
            <div className="flex gap-[3px]">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="font-black"
                  style={{ fontSize: 9, color: i < stars ? '#E61F1F' : 'rgba(255,255,255,0.08)' }}
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                  transition={{ delay: delay + 0.15 + i * 0.07, type: 'spring', stiffness: 260 }}
                >
                  ◆
                </motion.span>
              ))}
            </div>
            {/* Rank badge */}
            <div className="bg-[#E61F1F]/10 border border-[#E61F1F]/25 cut-corner-sm px-2 py-[2px]">
              <span className="text-[#E61F1F] font-black" style={{ fontSize: 8, letterSpacing: '0.2em' }}>
                {skill.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Skill name */}
        <h3 className="text-white font-black text-xl leading-none group-hover:text-[#E61F1F] transition-colors duration-200">
          {skill.name}
        </h3>

        {/* Segmented bar + level */}
        <div>
          {/* 20-segment bar */}
          <div className="flex gap-px mb-1.5">
            {Array.from({ length: segments }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 h-[5px]"
                style={{ background: i < filledSegs ? '#E61F1F' : 'rgba(255,255,255,0.07)' }}
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.2, delay: delay + 0.08 + i * 0.022 }}
              />
            ))}
          </div>
          {/* Level readout */}
          <div className="flex items-baseline justify-between">
            <span className="text-white/20 font-bold" style={{ fontSize: 9, letterSpacing: '0.3em' }}>
              PROFICIENCY
            </span>
            <div className="flex items-baseline gap-0.5">
              <motion.span
                className="text-[#E61F1F] font-black leading-none"
                style={{ fontSize: 22 }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: delay + 0.5 }}
              >
                {skill.level}
              </motion.span>
              <span className="text-white/20 font-bold" style={{ fontSize: 10 }}>/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line — fills on scroll-in */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-[#E61F1F]"
        initial={{ width: 0 }}
        animate={inView ? { width: `${skill.level}%` } : {}}
        transition={{ duration: 1.1, delay: delay + 0.45, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

function Skills() {
  return (
    <section id="skills" className="py-32 bg-[#080808] relative overflow-hidden">
      <div className="absolute -left-10 top-0 bottom-0 w-1 bg-[#E61F1F]/20" />
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          arcana="♦ ARCANA II — THE MAGICIAN"
          title="SKILLS"
          subtitle="Competências técnicas adquiridas em anos de construção de produtos reais."
          notifArcana="THE MAGICIAN — Arcana II"
          notifTitle="Skills Confidant Unlocked"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SKILLS.map((s, i) => <SkillCard key={s.name} skill={s} delay={i * 0.07} />)}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PROJECTS
// ============================================================
const PROJECTS = [
  {
    name: 'OptiGestão',
    arcanaNum: 'I',
    arcanaName: 'THE MAGICIAN',
    type: 'SaaS',
    description: 'Sistema de gestão para óticas com multi-tenancy, planos de assinatura, controle de clientes, estoque, vendas e finanças.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'MercadoPago'],
    suit: '♠',
    stars: 5,
  },
  {
    name: 'Flux',
    arcanaNum: 'II',
    arcanaName: 'THE HERMIT',
    type: 'CLINIC SYSTEM',
    description: 'Sistema completo de gestão para clínicas médicas. Server Actions, Zod validation, tema claro/escuro, testes Jest.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Jest'],
    suit: '♥',
    stars: 4,
  },
  {
    name: 'Otica E-commerce',
    arcanaNum: 'III',
    arcanaName: 'THE EMPRESS',
    type: 'E-COMMERCE',
    description: 'Loja virtual de ótica com catálogo de produtos, carrinho, checkout integrado e painel de gerenciamento.',
    tech: ['Next.js', 'MongoDB', 'Stripe'],
    suit: '♦',
    stars: 4,
  },
  {
    name: 'Malevolent Shrine',
    arcanaNum: 'IV',
    arcanaName: 'THE DEVIL',
    type: '3D VISUALIZER',
    description: 'Visualizador de áudio 3D em tempo real. Geometria reativa ao som, shaders customizados e síntese de áudio.',
    tech: ['Three.js', 'React Three Fiber', 'Tone.js'],
    suit: '♣',
    stars: 5,
  },
];

function ProjectCard({ project, delay }: { project: typeof PROJECTS[0]; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="relative group select-none"
      style={{ perspective: 900 }}
      initial={{ opacity: 0, y: 70, rotateY: -25 }}
      animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.7, delay, type: 'spring', stiffness: 85, damping: 14 }}
      whileHover={{
        y: -18,
        rotateY: 5,
        rotateZ: 1.5,
        scale: 1.04,
        transition: { duration: 0.18 },
      }}
      onHoverStart={() => S.cardFlip()}
    >
      {/* Drop shadow */}
      <div
        className="absolute bg-[#E61F1F]"
        style={{ inset: 0, opacity: 0.22, transform: 'translate(7px, 7px)' }}
      />

      {/* Card body — portrait 5:8 */}
      <div
        className="relative bg-[#080808] border-2 border-white overflow-hidden flex flex-col"
        style={{ aspectRatio: '5 / 8' }}
      >
        {/* Inner frame */}
        <div className="absolute inset-[6px] border border-white/20 pointer-events-none z-20" />

        {/* Header */}
        <div className="relative z-30 flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-white font-black text-base">{project.suit}</span>
          <span className="text-white font-black text-xl tracking-widest">{project.arcanaNum}</span>
          <span className="text-white font-black text-base" style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
            {project.suit}
          </span>
        </div>
        <div className="h-px bg-white/50 relative z-30" />

        {/* Illustration */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(-45deg, #E61F1F 0px, #E61F1F 14px, #0A0A0A 14px, #0A0A0A 42px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />
          {/* Watermark numeral */}
          <div
            className="absolute inset-0 flex items-center justify-center font-black text-black/30 select-none pointer-events-none"
            style={{ fontSize: 'clamp(56px, 14vw, 88px)' }}
            aria-hidden
          >
            {project.arcanaNum}
          </div>
          {/* Central suit — pulsing glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-white font-black"
              style={{
                fontSize: 'clamp(48px, 11vw, 68px)',
                textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 0 32px rgba(0,0,0,0.7)',
                filter: 'drop-shadow(0 0 14px rgba(230,31,31,0.6))',
              }}
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay }}
            >
              {project.suit}
            </motion.span>
          </div>
          {/* Type badge */}
          <div className="absolute bottom-2 right-2 z-10 bg-[#E61F1F]">
            <span className="text-white font-black uppercase px-2 py-[3px] block" style={{ fontSize: 8 }}>
              {project.type}
            </span>
          </div>
        </div>

        {/* Double divider */}
        <div className="relative z-30">
          <div className="h-[2px] bg-white" />
          <div className="h-px bg-white/18 mt-[3px]" />
        </div>

        {/* Info */}
        <div className="relative z-30 px-3 pt-2 pb-3 bg-[#080808] flex flex-col gap-1">
          <div className="flex gap-[2px]">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ fontSize: 10, color: i < project.stars ? '#E61F1F' : 'rgba(255,255,255,0.1)' }}>
                ★
              </span>
            ))}
          </div>
          <h3
            className="text-white font-black leading-tight transition-colors duration-200 group-hover:text-[#E61F1F]"
            style={{ fontSize: 'clamp(12px, 2.5vw, 17px)' }}
          >
            {project.name}
          </h3>
          <p className="text-white/30 font-bold uppercase" style={{ fontSize: 9, letterSpacing: '0.22em' }}>
            {project.arcanaName}
          </p>
          <p
            className="text-white/40 leading-relaxed"
            style={{
              fontSize: 10,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {project.tech.slice(0, 2).map(t => (
              <span key={t} className="tech-tag" style={{ fontSize: 8, padding: '1px 8px' }}>{t}</span>
            ))}
            {project.tech.length > 2 && (
              <span className="text-white/20 font-bold self-center" style={{ fontSize: 8 }}>
                +{project.tech.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Bottom corner suit */}
        <div
          className="absolute bottom-[10px] left-[10px] z-40 text-white/15 font-black"
          style={{ fontSize: 10, transform: 'rotate(180deg)' }}
        >
          {project.suit}
        </div>
      </div>
    </motion.div>
  );
}

function Projects() {
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: '-150px' });
  const [showAllOut, setShowAllOut] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (sectionInView && !firedRef.current) {
      firedRef.current = true;
      setTimeout(() => {
        setShowAllOut(true);
        emitNotif('THE EMPEROR — Arcana III', 'Projects Confidant Unlocked');
      }, 300);
    }
  }, [sectionInView]);

  return (
    <>
      <AnimatePresence>
        {showAllOut && <AllOutAttack onDone={() => setShowAllOut(false)} />}
      </AnimatePresence>

      <section id="projects" ref={sectionRef} className="py-32 bg-[#0D0D0D] relative overflow-hidden">
        <div
          className="absolute right-0 bottom-0 text-white/[0.02] font-black select-none pointer-events-none"
          style={{ fontSize: '500px', lineHeight: 1 }}
        >
          ♠
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            arcana="♣ ARCANA III — THE EMPEROR"
            title="PROJECTS"
            subtitle="Produtos construídos do zero — cada um resolvendo um problema real."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.name} project={p} delay={i * 0.12} />
            ))}
          </div>
          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <a
              href="https://github.com"
              onMouseEnter={() => S.hover()}
              onClick={() => S.select()}
              className="border border-white/10 text-white/40 hover:border-[#E61F1F]/50 hover:text-white font-bold tracking-widest px-8 py-3 cut-corner-sm transition-all duration-200 uppercase"
              style={{ fontSize: 12 }}
            >
              ♠ VIEW ALL ON GITHUB ♠
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// CONTACT
// ============================================================
function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" ref={ref} className="py-32 bg-[#080808] relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[#E61F1F]/5"
        style={{ clipPath: 'polygon(0 30%, 100% 10%, 100% 70%, 0 90%)' }}
      />
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          arcana="♠ ARCANA IV — THE WORLD"
          title="CONTACT"
          notifArcana="THE WORLD — Arcana IV"
          notifTitle="Contact Confidant Unlocked"
        />
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-white font-black text-4xl mb-4 leading-tight">
              VAMOS CONSTRUIR<br />
              <span className="text-[#E61F1F]">ALGO JUNTOS?</span>
            </h3>
            <p className="text-white/50 leading-relaxed mb-8">
              Disponível para projetos freelance, consultorias e posições full-time.
              Se você tem um problema, eu tenho o código.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'EMAIL',    value: 'yan@example.com',       href: 'mailto:yan@example.com', suit: '♠' },
                { label: 'GITHUB',   value: 'github.com/yan',         href: '#',                       suit: '♥' },
                { label: 'LINKEDIN', value: 'linkedin.com/in/yan',    href: '#',                       suit: '♦' },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => S.hover()}
                  onClick={() => S.select()}
                  className="flex items-center gap-4 group border border-white/5 cut-corner-sm p-4 bg-[#111111] hover:border-[#E61F1F]/30 transition-all duration-200"
                >
                  <span className="text-[#E61F1F]/50 group-hover:text-[#E61F1F] font-black text-lg transition-colors">{item.suit}</span>
                  <div>
                    <div className="text-white/30 text-[10px] tracking-widest font-bold">{item.label}</div>
                    <div className="text-white font-bold text-sm group-hover:text-[#E61F1F] transition-colors">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="bg-[#E61F1F] cut-corner p-10 relative overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            onHoverStart={() => S.hover()}
          >
            <div className="absolute -right-4 -bottom-4 text-white/10 font-black" style={{ fontSize: 180 }}>♠</div>
            <div className="relative z-10">
              <p className="text-white/70 font-bold uppercase mb-4" style={{ fontSize: 11, letterSpacing: '0.4em' }}>
                ACEITE A MISSÃO
              </p>
              <h4 className="text-white font-black text-4xl mb-6 leading-tight">
                WILL YOU<br />JOIN US?
              </h4>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Pronto para transformar sua ideia em produto? Entre em contato e vamos conversar sobre seu próximo projeto.
              </p>
              <a
                href="mailto:yan@example.com"
                onMouseEnter={() => S.hover()}
                onClick={() => S.select()}
                className="inline-block bg-white text-[#E61F1F] font-black text-sm tracking-widest px-8 py-4 cut-corner hover:bg-[#080808] hover:text-white transition-colors duration-200 uppercase"
              >
                START THE HEIST →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#E61F1F] font-black">♠</span>
          <span className="text-white/40 font-bold text-sm tracking-widest">YAN</span>
        </div>
        <p className="text-white/20 text-xs tracking-widest font-bold">
          © 2025 — BUILT WITH NEXT.JS · TAILWINDCSS · ♥
        </p>
        <div className="flex gap-4">
          {['♠', '♥', '♦', '♣'].map(s => (
            <motion.span
              key={s}
              className="text-white/10 font-black"
              whileHover={{ color: '#E61F1F', scale: 1.3 }}
              onHoverStart={() => S.hover()}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// PAGE
// ============================================================
export default function Page() {
  const [loading, setLoading] = useState(true);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { arcana, title } = (e as CustomEvent<{ arcana: string; title: string }>).detail;
      setNotifs(prev => [...prev, { id: Date.now(), arcana, title }]);
    };
    window.addEventListener('persona-notif', handler);
    return () => window.removeEventListener('persona-notif', handler);
  }, []);

  return (
    <>
      {/* Always-on cursor */}
      <CustomCursor />

      {/* Notification stack */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col gap-3 items-end">
        <AnimatePresence>
          {notifs.map(n => (
            <NotifToast
              key={n.id}
              n={n}
              onDone={() => setNotifs(prev => prev.filter(x => x.id !== n.id))}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Navbar />
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
          <Footer />
        </motion.div>
      )}
    </>
  );
}
