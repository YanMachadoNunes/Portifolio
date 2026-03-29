"use client";

import TypeWriter from "@/components/TypeWriter";

/* ── data ─────────────────────────────────────────────────── */

const FLAGSHIP = {
  name: "OptiGestão",
  tagline: "SaaS completo para gestão de óticas",
  description:
    "Sistema de gestão multi-tenant desenvolvido do zero para o mercado óptico. Cobre o ciclo completo da loja: cadastro de clientes com prescrições, controle de estoque, pedidos, vendas, módulo financeiro e rede de múltiplas lojas num único painel. Arquitetura SaaS real com planos por assinatura, trial de 7 dias, grace period e webhooks de pagamento.",
  tags: ["Next.js 16", "Prisma", "PostgreSQL", "MercadoPago", "NextAuth", "Resend", "Sentry", "Docker"],
  features: [
    { label: "Multi-tenant", desc: "Cada conta isola completamente seus dados" },
    { label: "Assinatura recorrente", desc: "MercadoPago Preapproval + webhooks" },
    { label: "4 planos", desc: "Basic → Standard → Premium + add-ons" },
    { label: "Trial 7 dias", desc: "Grace period após cancelamento" },
    { label: "Multi-usuário", desc: "Admin + Employees com RBAC" },
    { label: "Email transacional", desc: "Resend + templates custom" },
  ],
  stats: [
    { value: "4", label: "módulos" },
    { value: "3", label: "roles" },
    { value: "7d", label: "trial" },
    { value: "100%", label: "custom" },
  ],
};

const OTHER_PROJECTS = [
  {
    name: "QuestLog",
    label: "App · PWA",
    description:
      "Produtividade gamificada como RPG solo. Completa quests para ganhar XP em 5 atributos, gerenciar HP, manter streaks e evoluir de Rank D até Ascendente. Design dark 100% custom com 30+ keyframes e efeitos sonoros.",
    tags: ["Next.js 16", "Prisma", "PostgreSQL", "Tone.js", "PWA"],
    accent: "#ef4444",
    features: ["XP / Level system", "Boss Quests", "Streak + HP", "PWA offline"],
    status: "live",
  },
  {
    name: "Flux",
    label: "App · Clínica médica",
    description:
      "Sistema de gestão para clínicas médicas. Server Actions, testes com Jest + Testing Library, tema light/dark por CSS variables e validação com Zod.",
    tags: ["Next.js 16", "Prisma", "PostgreSQL", "Jest", "Zod"],
    accent: "#22d3ee",
    features: ["Server Actions", "Testes Jest", "Light/Dark", "Zod"],
    status: "dev",
  },
];

const STACK = [
  { name: "Next.js 16", desc: "App Router · Server Actions · Turbopack", color: "#e2e8f0", icon: "▲" },
  { name: "Prisma ORM", desc: "Schema-first · Migrations · Accelerate", color: "#5eead4", icon: "◆" },
  { name: "PostgreSQL", desc: "Multi-tenant · Pooling · Relations", color: "#60a5fa", icon: "🐘" },
  { name: "TypeScript", desc: "Strict mode · Types everywhere", color: "#818cf8", icon: "TS" },
  { name: "TailwindCSS", desc: "Utility-first · Custom design systems", color: "#38bdf8", icon: "✦" },
  { name: "AI / APIs", desc: "LLM integration · Webhooks · Auth flows", color: "#a78bfa", icon: "◈" },
];

/* ── page ─────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* Grid background */}
      <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.6, pointerEvents: "none" }} />

      {/* Radial glow top */}
      <div style={{
        position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500,
        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* ── NAV ─────────────────────────────────────────── */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "28px 0 0",
        }}
          className="fade-up-1"
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", letterSpacing: 1 }}>
            YMN<span style={{ color: "#334155" }}>.dev</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#projects" className="nav-link">projetos</a>
            <a href="#stack"    className="nav-link">stack</a>
            <a href="#about"    className="nav-link">sobre</a>
            <a
              href="https://github.com/YanMachadoNunes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 6,
                border: "1px solid #1e1e3a",
                background: "rgba(99,102,241,0.06)",
                color: "#818cf8", fontSize: 11, fontWeight: 700,
                letterSpacing: 0.5, textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e1e3a";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.06)";
              }}
            >
              <GithubIcon /> GitHub
            </a>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────── */}
        <section style={{ padding: "100px 0 90px" }}>

          {/* Terminal prompt line */}
          <div className="fade-up-1" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>●</span>
            <span style={{ fontSize: 11, color: "#334155", letterSpacing: 1 }}>~/portfolio</span>
            <span style={{ fontSize: 11, color: "#1e293b" }}>on</span>
            <span style={{ fontSize: 11, color: "#818cf8" }}>main</span>
          </div>

          <h1 className="fade-up-2" style={{ fontSize: "clamp(36px, 7vw, 62px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -1, marginBottom: 10 }}>
            <span className="gradient-name">Yan Machado</span>
            <br />
            <span style={{ color: "#e2e8f0" }}>Nunes</span>
          </h1>

          <p className="fade-up-3" style={{ fontSize: 14, color: "#475569", marginBottom: 8, letterSpacing: 0.3 }}>
            Full-Stack Developer · 21 anos · Ciências da Computação
          </p>

          <div className="fade-up-4" style={{ fontSize: 14, color: "#64748b", marginBottom: 40, minHeight: 22 }}>
            <TypeWriter />
          </div>

          <div className="fade-up-5" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="#projects"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 22px", borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                textDecoration: "none", letterSpacing: 0.3,
                boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(99,102,241,0.3)";
              }}
            >
              Ver projetos <Arrow />
            </a>
            <a
              href="https://github.com/YanMachadoNunes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 22px", borderRadius: 8,
                border: "1px solid #1e1e3a",
                background: "rgba(14,14,24,0.8)",
                color: "#94a3b8", fontSize: 13, fontWeight: 700,
                textDecoration: "none", letterSpacing: 0.3,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155";
                (e.currentTarget as HTMLAnchorElement).style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e1e3a";
                (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
              }}
            >
              <GithubIcon /> GitHub
            </a>
          </div>

          {/* Stats row */}
          <div className="fade-up-6" style={{ display: "flex", gap: 32, marginTop: 56, paddingTop: 32, borderTop: "1px solid #0f0f1a" }}>
            {[
              { value: "3", label: "projetos ativos" },
              { value: "21", label: "anos" },
              { value: "CS", label: "ciências da computação" },
              { value: "∞", label: "café consumido" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#6366f1", letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 2, letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROJECTS ────────────────────────────────────── */}
        <section id="projects" style={{ paddingBottom: 80 }}>
          <div className="section-title">projetos</div>

          {/* ── FLAGSHIP: OptiGestão ── */}
          <div
            className="card-hover"
            style={{
              position: "relative",
              borderRadius: 16,
              padding: "1.5px",
              background: "linear-gradient(135deg, rgba(245,158,11,0.5), rgba(245,158,11,0.08) 40%, rgba(245,158,11,0.22) 100%)",
              marginBottom: 20,
              animation: "glow-pulse-amber 4s ease-in-out infinite",
            }}
          >
            <div style={{
              background: "#0b0b12",
              borderRadius: 15,
              padding: "36px 40px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Background glow */}
              <div style={{
                position: "absolute", top: -100, right: -100,
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -60, left: -60,
                width: 300, height: 300, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 9, padding: "3px 10px", borderRadius: 4, fontWeight: 900,
                  letterSpacing: 2, textTransform: "uppercase",
                  background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                  color: "#f59e0b",
                }}>
                  ★ Projeto Principal
                </span>
                <span style={{
                  fontSize: 9, padding: "3px 9px", borderRadius: 4, fontWeight: 700, letterSpacing: 1,
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                  color: "#22c55e",
                }}>
                  ● live
                </span>
                <span style={{
                  fontSize: 9, padding: "3px 9px", borderRadius: 4, fontWeight: 700, letterSpacing: 1,
                  background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
                  color: "#78716c",
                }}>
                  SaaS · Produção
                </span>
              </div>

              <h3 style={{
                fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 900,
                color: "#f5f5f5", letterSpacing: -1, marginBottom: 6, lineHeight: 1,
              }}>
                OptiGestão
              </h3>
              <p style={{ fontSize: 13, color: "#f59e0b", opacity: 0.7, marginBottom: 20, fontWeight: 500 }}>
                {FLAGSHIP.tagline}
              </p>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.85, marginBottom: 28, maxWidth: 720 }}>
                {FLAGSHIP.description}
              </p>

              {/* Stats bar */}
              <div style={{
                display: "flex", gap: 0,
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.1)",
                borderRadius: 10, overflow: "hidden",
                marginBottom: 28,
              }}>
                {FLAGSHIP.stats.map((s, i) => (
                  <div key={s.label} style={{
                    flex: 1, textAlign: "center", padding: "14px 0",
                    borderRight: i < FLAGSHIP.stats.length - 1 ? "1px solid rgba(245,158,11,0.08)" : "none",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b", letterSpacing: -0.5 }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: "#44403c", marginTop: 3, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Features grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: 8, marginBottom: 24,
              }}>
                {FLAGSHIP.features.map((f) => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 14px", borderRadius: 8,
                    background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.08)",
                  }}>
                    <span style={{ color: "#f59e0b", marginTop: 1, flexShrink: 0 }}>◆</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#d4d4d4", marginBottom: 2 }}>{f.label}</div>
                      <div style={{ fontSize: 10, color: "#44403c", lineHeight: 1.4 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid rgba(245,158,11,0.07)" }}>
                {FLAGSHIP.tags.map((t) => (
                  <span key={t} style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 4,
                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.14)",
                    color: "#78716c", fontWeight: 600, letterSpacing: 0.3,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Other projects grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {OTHER_PROJECTS.map((p) => (
              <div
                key={p.name}
                className="card-hover"
                style={{
                  background: "#0a0a14", border: "1px solid #13131f",
                  borderRadius: 12, padding: "24px 26px",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -50, right: -50,
                  width: 160, height: 160, borderRadius: "50%",
                  background: `radial-gradient(circle, ${p.accent}07 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0" }}>{p.name}</h3>
                  <span style={{
                    fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, letterSpacing: 1,
                    background: `${p.accent}10`, border: `1px solid ${p.accent}22`, color: p.accent,
                  }}>
                    {p.label}
                  </span>
                  <span style={{
                    fontSize: 9, padding: "2px 7px", borderRadius: 4, fontWeight: 700, letterSpacing: 1,
                    background: p.status === "live" ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
                    border: p.status === "live" ? "1px solid rgba(34,197,94,0.18)" : "1px solid rgba(245,158,11,0.18)",
                    color: p.status === "live" ? "#22c55e" : "#f59e0b",
                  }}>
                    {p.status === "live" ? "● live" : "● dev"}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.75, marginBottom: 16 }}>
                  {p.description}
                </p>

                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                  {p.features.map((f) => (
                    <span key={f} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20,
                      background: `${p.accent}08`, border: `1px solid ${p.accent}18`,
                      color: p.accent, fontWeight: 600,
                    }}>
                      {f}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #0f0f18" }}>
                  {p.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 4,
                      background: "#111120", border: "1px solid #1e1e30",
                      color: "#3f3f5a", fontWeight: 600, letterSpacing: 0.3,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STACK ───────────────────────────────────────── */}
        <section id="stack" style={{ paddingBottom: 80 }}>
          <div className="section-title">stack</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {STACK.map((s) => (
              <div
                key={s.name}
                className="card-hover"
                style={{
                  background: "#0a0a14", border: "1px solid #13131f",
                  borderRadius: 10, padding: "18px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <div style={{
                  width: 40, height: 40, flexShrink: 0, borderRadius: 8,
                  background: `${s.color}0f`,
                  border: `1px solid ${s.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 900, color: s.color,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", marginBottom: 3 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ABOUT ───────────────────────────────────────── */}
        <section id="about" style={{ paddingBottom: 80 }}>
          <div className="section-title">sobre</div>

          <div style={{
            background: "#0a0a14", border: "1px solid #13131f",
            borderRadius: 14, padding: "36px 40px",
            display: "grid", gridTemplateColumns: "1fr auto", gap: 40,
            alignItems: "center",
            position: "relative", overflow: "hidden",
          }}>
            {/* Corner glow */}
            <div style={{
              position: "absolute", bottom: -80, right: -80,
              width: 280, height: 280, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.9, marginBottom: 20 }}>
                Tenho 21 anos e estudo{" "}
                <span style={{ color: "#818cf8", fontWeight: 600 }}>Ciências da Computação</span>.
                Comecei a programar construindo coisas reais desde o início — sem tutoriais de todo, mandando código
                para produção enquanto ainda aprendo.
              </p>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.9, marginBottom: 20 }}>
                Meu foco atual é{" "}
                <span style={{ color: "#67e8f9", fontWeight: 600 }}>full-stack com Next.js + Prisma + PostgreSQL</span>,
                construindo SaaS com autenticação, pagamentos recorrentes e multi-tenancy.
                Também integro{" "}
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>IA como ferramenta de desenvolvimento</span>{" "}
                — não como gimmick, mas para resolver problemas reais mais rápido.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Availability badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8,
                  background: "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.18)",
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#22c55e", boxShadow: "0 0 8px #22c55e",
                    display: "inline-block",
                    animation: "glow-pulse 2s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: 0.5 }}>
                    Disponível para oportunidades
                  </span>
                </div>

                {/* Email */}
                <a
                  href="mailto:yanmachado.contato@gmail.com"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "8px 16px", borderRadius: 8,
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    color: "#818cf8", fontSize: 11, fontWeight: 700,
                    textDecoration: "none", letterSpacing: 0.3,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.18)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.06)";
                  }}
                >
                  <MailIcon /> yanmachado.contato@gmail.com
                </a>
              </div>
            </div>

            {/* Avatar placeholder */}
            <div style={{
              width: 100, height: 100, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.15))",
              border: "2px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, animation: "float 4s ease-in-out infinite",
            }}>
              👨‍💻
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer style={{
          paddingBottom: 48, paddingTop: 32,
          borderTop: "1px solid #0f0f1a",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 11, color: "#1e293b", letterSpacing: 0.5 }}>
            © 2025 Yan Machado Nunes
          </span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a
              href="https://github.com/YanMachadoNunes"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "#334155", textDecoration: "none", transition: "color 0.15s", letterSpacing: 0.5 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6366f1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#334155")}
            >
              github
            </a>
            <span style={{ color: "#111120" }}>·</span>
            <a
              href="mailto:yanmachado.contato@gmail.com"
              style={{ fontSize: 11, color: "#334155", textDecoration: "none", transition: "color 0.15s", letterSpacing: 0.5 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#818cf8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#334155")}
            >
              email
            </a>
            <span style={{ color: "#111120" }}>·</span>
            <span style={{ fontSize: 11, color: "#1e293b", letterSpacing: 0.5 }}>
              built with Next.js
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}

/* ── inline icons ─────────────────────────────────────────── */

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
