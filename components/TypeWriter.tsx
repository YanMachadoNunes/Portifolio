"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Building SaaS products.",
  "Integrating AI into real apps.",
  "Studying Computer Science.",
  "Shipping things that work.",
];

export default function TypeWriter() {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 1800);
      return () => clearTimeout(t);
    }

    const current = PHRASES[phraseIdx];

    if (!deleting) {
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setText(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        }, 55);
        return () => clearTimeout(t);
      } else {
        setPaused(true);
      }
    } else {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setText(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        }, 28);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
      }
    }
  }, [charIdx, deleting, paused, phraseIdx]);

  return (
    <span style={{ color: "#67e8f9" }}>
      {text}
      <span className="cursor-blink" style={{ color: "#6366f1" }}>▋</span>
    </span>
  );
}
