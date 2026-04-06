# Engenharia Reversa: Portfolio Persona 5
### Como construir um site com a identidade visual de um jogo da Atlus

> Este documento explica **cada decisão técnica** do portfolio — do zero ao ALL OUT ATTACK.
> Útil se você quer replicar técnicas específicas em outros projetos.

---

## Sumário

1. [A Filosofia Visual do Persona 5](#1-a-filosofia-visual-do-persona-5)
2. [Stack e Setup](#2-stack-e-setup)
3. [CSS Foundations — globals.css](#3-css-foundations--globalscss)
4. [Sistema de Som (Web Audio API)](#4-sistema-de-som-web-audio-api)
5. [Cursor Customizado com Trail](#5-cursor-customizado-com-trail)
6. [Speed Lines (SVG Animado)](#6-speed-lines-svg-animado)
7. [Text Scramble Hook](#7-text-scramble-hook)
8. [Loading Screen com Arpejo](#8-loading-screen-com-arpejo)
9. [Menu Persona 5 — A Peça Central](#9-menu-persona-5--a-peça-central)
10. [Cards de Projeto (Tarô)](#10-cards-de-projeto-tarô)
11. [Cards de Skill](#11-cards-de-skill)
12. [ALL OUT ATTACK Cinemático](#12-all-out-attack-cinemático)
13. [Sistema de Notificações Confidant](#13-sistema-de-notificações-confidant)
14. [Arquitetura Geral do Componente](#14-arquitetura-geral-do-componente)
15. [Padrões e Lições Aprendidas](#15-padrões-e-lições-aprendidas)

---

## 1. A Filosofia Visual do Persona 5

Antes de escrever uma linha de código, é preciso entender **por que** o Persona 5 parece diferente.

### Os 4 pilares

| Pilar | Descrição | Como traduzimos para CSS/JS |
|---|---|---|
| **Nenhum ângulo é 90°** | Tudo está inclinado, cortado ou diagonal | `skewX()`, `clip-path: polygon()` |
| **Contraste extremo** | Vermelho puro + preto puro + branco puro | Paleta de 3 cores, sem gradientes suaves |
| **Tipografia agressiva** | Oswald Black, tudo em maiúsculas, tracking largo | `font-black`, `uppercase`, `tracking-widest` |
| **Reatividade ao input** | Tudo responde ao mouse com som e movimento | Web Audio API + Framer Motion em cada elemento |

### Referências visuais específicas

- **Menu principal**: Blocos pretos inclinados com borda branca, inversão de cor no hover
- **Cards de arcana**: Portrait, moldura dupla, listras diagonais, número romano
- **HUD de batalha**: Barras segmentadas (não sólidas), números grandes com `/100`
- **Transições**: Slides agressivos de fora da tela, springs com overshoot

---

## 2. Stack e Setup

### Por que estas escolhas

```json
{
  "next": "^15",         // App Router — 'use client' para animações no browser
  "framer-motion": "^11", // A biblioteca de animação mais expressiva do ecossistema React
  "tailwindcss": "^4",   // v4: config em CSS com @theme, sem tailwind.config.ts
  "@tailwindcss/postcss": "^4" // Plugin PostCSS necessário no v4
}
```

**Tailwind v4 vs v3:** No v4, você não tem `tailwind.config.ts`. A configuração de tema vai direto no CSS:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-persona-red: #E61F1F;
  --color-persona-black: #080808;
}
```

**Por que `'use client'` em tudo?** Animações Framer Motion, Web Audio API e event listeners são APIs do browser. O Next.js 15 usa Server Components por padrão — qualquer coisa que precise do `window` exige `'use client'`.

### Estrutura mínima de arquivos

```
portfolio/
  app/
    layout.tsx    ← Fonte Oswald via next/font/google
    globals.css   ← Tailwind + utilitários de clip-path + cursor
    page.tsx      ← TODO o conteúdo (1 arquivo proposital)
  package.json
  postcss.config.mjs
  tsconfig.json
```

**Por que tudo em 1 arquivo?** Para um portfolio sem rotas, a colocação (co-location) em um único arquivo elimina prop drilling e facilita refatoração. Se crescer, extrai componentes depois.

---

## 3. CSS Foundations — globals.css

### As classes utilitárias que repetem em todo lugar

#### `cut-corner` — o recorte diagonal

```css
.cut-corner {
  clip-path: polygon(
    0 0,
    calc(100% - 20px) 0,   /* topo direito recuado 20px */
    100% 20px,              /* cria o corte diagonal */
    100% 100%,
    20px 100%,              /* canto inferior esquerdo também cortado */
    0 calc(100% - 20px)
  );
}
```

`clip-path: polygon()` define uma forma vetorial arbitrária. Qualquer pixel fora dessa forma é invisível. Isso é mais performático que borders pseudo-elementos porque não cria novos stacking contexts.

#### Barras segmentadas (Skill Cards)

```css
/* Feito no JSX, mas o conceito é: */
/* 20 divs flex com gap-px entre elas */
/* gap: 1px cria a separação sem border */
```

#### Cursor customizado — esconder o padrão

```css
@media (pointer: fine) {
  *, *:hover { cursor: none !important; }
}
```

`pointer: fine` detecta mouse/trackpad mas não toca (touchscreen). Isso evita que dispositivos touch fiquem sem cursor.

#### Scanlines — textura CRT

```css
.scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.05) 2px,
    rgba(0,0,0,0.05) 4px
  );
  pointer-events: none; /* crucial: não bloqueia cliques */
  z-index: 9999;
}
```

`repeating-linear-gradient` cria o padrão de linhas horizontais sem imagem. `pointer-events: none` é obrigatório quando o elemento fica "sobre" o conteúdo — sem isso, bloqueia todos os cliques.

---

## 4. Sistema de Som (Web Audio API)

Esta é a parte mais incomum do projeto. **Sem nenhum arquivo de áudio** — todos os sons são sintetizados em tempo real.

### Conceitos fundamentais da Web Audio API

```
AudioContext → Oscilador/Buffer → GainNode → destination (alto-falante)
```

Todo áudio passa por uma **chain de nodes**. Você cria cada node, conecta em sequência, e toca.

### O singleton `_ctx`

```typescript
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null; // SSR guard
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume(); // política de autoplay
  return _ctx;
}
```

**Por que singleton?** Cada `new AudioContext()` cria um contexto separado. Browsers limitam o número de contextos simultâneos. Um singleton garante que todos os sons usam o mesmo contexto.

**Por que `.resume()`?** Browsers suspendem o AudioContext até que o usuário interaja com a página. Chamar `.resume()` garante que o contexto está ativo antes de tocar qualquer som.

### Anatomia de cada som

#### Som de seleção (UI click)

```typescript
select() {
  const c = getCtx(); if (!c) return;
  const o = c.createOscillator(); // gera a onda
  const g = c.createGain();       // controla o volume
  o.connect(g);
  g.connect(c.destination);       // destination = auto-falante

  o.type = 'square';              // onda quadrada = som 8-bit
  o.frequency.setValueAtTime(880, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.07);
  // ^ pitch desce de 880Hz para 440Hz em 70ms = "ba-ching" descendente

  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  // ^ volume de 12% → quase zero em 100ms

  o.start(c.currentTime);
  o.stop(c.currentTime + 0.1);
}
```

**`exponentialRampToValueAtTime` vs `linearRampToValueAtTime`:** O ouvido humano percebe volume de forma logarítmica. Ramps exponenciais soam mais naturais para fade out.

#### Som de whoosh (transições de seção)

```typescript
whoosh() {
  // Passo 1: gerar ruído branco
  const len = Math.floor(c.sampleRate * 0.22); // 0.22 segundos de amostras
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++)
    d[i] = (Math.random() * 2 - 1)   // ruído branco: -1 a 1
          * Math.pow(1 - i/len, 1.5); // envelope: amplitude decresce

  // Passo 2: filtro bandpass — define o "timbre" do whoosh
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(3500, c.currentTime);   // começa agudo
  f.frequency.exponentialRampToValueAtTime(350, ...); // termina grave
  // ^ isso cria a sensação de algo "passando por você"
}
```

**Ruído branco + bandpass = whoosh.** O bandpass deixa passar apenas as frequências em torno de um centro, e ao mover esse centro de agudo→grave, você cria o efeito de movimento.

#### Arpejo do menu (acorde ascendente)

```typescript
arpNote(index: number) {
  const freqs = [330, 392, 440, 523]; // E G A C — lembra Persona 5!
  const t = c.currentTime + index * 0.055; // cada nota 55ms depois
  // ...
}
```

Chamado ao montar cada `MenuNavItem`. Como eles montam em stagger (0.06s), as notas saem em sequência natural formando um acorde.

### Inicialização na primeira interação

```typescript
if (typeof window !== 'undefined') {
  const boot = () => getCtx();
  window.addEventListener('click', boot, { once: true });
  window.addEventListener('keydown', boot, { once: true });
}
```

`{ once: true }` remove o listener automaticamente após a primeira disparo — sem memory leak.

---

## 5. Cursor Customizado com Trail

### O problema

CSS `cursor:` só aceita imagens ou cursors nativos. Para um diamante vermelho com trail animado, precisa de JS.

### A solução

```typescript
function CustomCursor() {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  // começa em -300,-300 para não aparecer no canto antes do mouse mover

  const [trail, setTrail] = useState<Array<{ x: number; y: number; k: number }>>([]);
  // array das últimas 9 posições

  const kRef = useRef(0); // chave única para cada ponto (evita re-use de key)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const p = { x: e.clientX, y: e.clientY };
      setPos(p);
      setTrail(prev => [
        { ...p, k: kRef.current++ }, // novo ponto na frente
        ...prev
      ].slice(0, 9)); // máximo 9 pontos no trail
    };
    // ...
  }, []);
}
```

**Por que `useRef` para a key?** Se usarmos `Date.now()` ou `Math.random()`, em renders rápidos pode repetir. Um ref que incrementa sempre é único e não causa re-render.

### Renderização do trail

```tsx
{trail.map((t, i) => (
  <div
    key={t.k}
    style={{
      width: Math.max(2, 7 - i),   // diminui de 7px → 2px
      opacity: (1 - i / 9) * 0.3,  // mais transparente conforme fica "velho"
      left: t.x - (7 - i) / 2,     // centralizado no ponto
    }}
  />
))}
```

Cada ponto do trail é menor e mais transparente que o anterior. Isso cria a ilusão de movimento sem animação — o estado se move, o componente é estático.

---

## 6. Speed Lines (SVG Animado)

### Por que SVG inline

As linhas irradiam de um ponto central para bordas. Com CSS puro, isso exigiria `n` elementos com transforms calculados. SVG permite coordenadas matemáticas diretas.

### Cálculo das linhas

```typescript
const SPEED_LINE_DATA = Array.from({ length: 42 }, (_, i) => {
  const angle = (i / 42) * Math.PI * 2; // divide 360° em 42 partes
  return {
    angle,
    len: 380 + (i * 37 % 280), // comprimento pseudo-aleatório (determinístico)
    thick: i % 5 === 0 ? 2.5 : 1, // algumas linhas mais grossas
    delay: 3.6 + (i % 9) * 0.11,  // delay de entrada escalonado
    repeatDelay: 3.5 + (i % 7) * 0.5, // pulso com período diferente por linha
  };
});
```

**`(i * 37 % 280)`** — multiplicar por um número primo e aplicar módulo gera distribuição irregular sem `Math.random()`. Isso é determinístico (sempre o mesmo resultado), então não causa hydration mismatch no Next.js.

### Animação

```tsx
<motion.line
  animate={{ opacity: [0, 0.065, 0] }}
  transition={{
    duration: 1.1,
    delay: l.delay,
    repeat: Infinity,
    repeatDelay: l.repeatDelay, // tempo entre pulsos
  }}
/>
```

`opacity: [0, 0.065, 0]` é um keyframe — vai de invisível → levemente visível → invisível. Com `repeat: Infinity` e `repeatDelay` diferente por linha, as linhas piscam de forma assíncrona.

---

## 7. Text Scramble Hook

Efeito onde o texto "resolve" letra por letra, substituindo por caracteres aleatórios antes de revelar o real.

```typescript
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ♠♥♦♣0123456789#@!';

function useScramble(text: string, active: boolean) {
  const [out, setOut] = useState(text); // começa exibindo o texto real

  useEffect(() => {
    if (!active) return; // só executa quando a seção entra em viewport

    let frame = 0;
    const total = text.length * 3; // 3 frames por letra

    const id = setInterval(() => {
      frame++;
      setOut(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' '; // espaços não scramble
          if (frame >= i * 3 + 3) return ch; // esta letra já "resolveu"
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }).join('')
      );
      if (frame >= total) clearInterval(id);
    }, 28); // ~35fps de scramble

    return () => clearInterval(id);
  }, [active, text]);

  return out;
}
```

**A lógica de resolução:** `frame >= i * 3 + 3` significa que a letra `i` resolve no frame `i * 3 + 3`. Para uma palavra de 5 letras com 3 frames por letra, o total é 15 frames. Letra 0 resolve no frame 3, letra 1 no frame 6, etc. — esquerda para direita.

**Uso:**
```tsx
function SectionHeading({ title }) {
  const inView = useInView(ref, { once: true });
  const displayTitle = useScramble(title, inView); // ativa quando entra na tela
  return <h2>{displayTitle}</h2>;
}
```

---

## 8. Loading Screen com Arpejo

### Técnica do círculo expansível

```tsx
<motion.div
  className="absolute rounded-full bg-[#E61F1F]"
  initial={{ width: 0, height: 0, opacity: 1 }}
  animate={{ width: '200vmax', height: '200vmax', opacity: [1, 1, 0] }}
  transition={{ duration: 2.3, times: [0, 0.7, 1] }}
/>
```

`200vmax` garante que o círculo cobre a tela independente da orientação. `vmax` = o maior entre `vw` e `vh`.

**`times: [0, 0.7, 1]`** sincroniza o keyframe de opacity com a duração total. O círculo fica opaco até 70% do tempo, depois some nos últimos 30%.

### Sincronização som + visual

```typescript
useEffect(() => {
  S.startup();           // toca o arpejo quando o componente monta
  const t = setTimeout(onComplete, 2900); // fecha após 2.9s
  return () => clearTimeout(t);
}, []);
```

O arpejo (`startup()`) toca 6 notas com delay de 0.13s cada = 0.78s total. A animação dura 2.3s. Isso deixa o arpejo terminar bem antes da tela fechar — timing proposital.

---

## 9. Menu Persona 5 — A Peça Central

Esta é a parte mais complexa. Vamos desmembrar cada decisão.

### A Geometria Inclinada

```tsx
// CONTAINER: inclina tudo junto
<motion.div style={{ transform: 'skewX(-12deg)', transformOrigin: 'left center' }}>

  {/* CONTEÚDO: counter-skew para texto reto */}
  <div style={{ transform: 'skewX(12deg)' }}>
    <span>{item.label}</span>
  </div>

</motion.div>
```

**`transformOrigin: 'left center'`** — sem isso, o skew pivota no centro do elemento e o item "empurra" para fora do alinhamento. Pivotando na esquerda, o item inclina "para dentro" da página.

### O clip-path irregular

```tsx
clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)'
//                             ^ borda direita recua 4% na base
```

Isso cria a borda direita diagonal. Cada item poderia ter um valor levemente diferente (94%, 96%, 97%) para dar a impressão de "papel rasgado à mão".

### Stagger com Framer Motion Variants

O poder real do sistema vem da propagação automática de variantes:

```typescript
// 1. Define variantes no container
const menuContainerVariants = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

// 2. Define variantes nos filhos — MESMOS NOMES "open" e "closed"
const menuItemVariants = {
  closed: { x: '-130%', opacity: 0 },
  open:   { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
};

// 3. O container propaga automaticamente para os filhos
<motion.div variants={menuContainerVariants} initial="closed" animate="open">
  {items.map(item => (
    <motion.div variants={menuItemVariants}> {/* não precisa de initial/animate! */}
      ...
    </motion.div>
  ))}
</motion.div>
```

**`staggerDirection: -1`** no close faz o último item sair primeiro — o menu "fecha como um leque" na direção reversa.

**`type: 'spring', stiffness: 300, damping: 18`** — stiffness alta = movimento rápido. Damping baixo = bastante overshoot antes de assentar. Isso cria o "passo além e volta" característico.

### O Estado Ativo: Inversão Imediata

```tsx
style={{
  background: hovered ? '#FFFFFF' : '#080808',
  border: `2px solid ${hovered ? '#E61F1F' : 'rgba(255,255,255,0.8)'}`,
  transition: 'background 0.08s ease, border-color 0.08s ease',
}}
```

**0.08s** é deliberadamente rápido. Uma transição de 0.3s seria suave — muito suave para Persona 5. A inversão quase instantânea é parte da linguagem visual do jogo.

### O Micro-Shake

```tsx
animate={hovered ? {
  x: [-2, 2, -2, 2, -1, 1, -1, 0],   // sequência de deslocamentos em px
  transition: {
    duration: 0.35,
    repeat: Infinity,
    repeatDelay: 0.25,               // pausa de 250ms entre cada shake
  },
} : { x: 0 }}
```

O array de keyframes `[-2, 2, -2, 2, -1, 1, -1, 0]` diminui a amplitude ao final (2 → 1 → 0), simulando um objeto que "vibra e para". Com `repeat: Infinity`, ele recomeça — mas o `repeatDelay` de 250ms cria uma sensação de pulso, não de tremor contínuo.

### O Símbolo Explodindo

```tsx
<AnimatePresence>
  {hovered && (
    <motion.span
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 0.3 }}
      exit={{ scale: 2.5, rotate: 15, opacity: 0 }}  // sai expandindo
    >
      {item.suit}
    </motion.span>
  )}
</AnimatePresence>
```

O `exit` é a parte mais importante: `scale: 2.5` faz o símbolo "explodir para fora" ao tirar o mouse. Isso é mais dinâmico do que simplesmente sumir.

---

## 10. Cards de Projeto (Tarô)

### Proporção real de tarô

```tsx
<div style={{ aspectRatio: '5 / 8' }}>
```

Cartas de tarô medem ~2.75 x 4.75 polegadas (ratio ≈ 5:8.65). Usamos 5:8 como aproximação. `aspect-ratio` é CSS moderno — não precisa de padding-top hack.

### A moldura dupla

```tsx
{/* Border externa: borda do elemento */}
<div className="border-2 border-white overflow-hidden">
  {/* Border interna: pseudo-borda com posição absoluta */}
  <div className="absolute inset-[6px] border border-white/20 pointer-events-none z-20" />
```

**Por que não usar `outline`?** `outline` não respeita `border-radius` (e neste caso, `clip-path`). Dois `border` aninhados funcionam em qualquer forma.

### Listras diagonais na ilustração

```tsx
style={{
  background: 'repeating-linear-gradient(-45deg, #E61F1F 0px, #E61F1F 14px, #0A0A0A 14px, #0A0A0A 42px)'
}}
```

`repeating-linear-gradient` cria o padrão sem imagem. Os valores `14px` e `42px` definem: 14px de vermelho, depois 28px de preto (42-14), repetindo. O ângulo `-45deg` cria as listras diagonais.

### Entrada 3D

```tsx
initial={{ opacity: 0, y: 70, rotateY: -25 }}
animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
```

`rotateY: -25` inclina a carta "de costas" na entrada — como uma carta sendo virada na sua direção. Precisa de `perspective` no pai para funcionar corretamente.

### O símbolo pulsante

```tsx
<motion.span
  animate={{ scale: [1, 1.07, 1] }}
  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay }}
>
  {project.suit}
</motion.span>
```

`delay` diferente por card = os símbolos pulsam fora de sincronia, tornando a grade mais orgânica.

---

## 11. Cards de Skill

### O triângulo diagonal no canto

```tsx
<motion.div
  style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
  // ^ triângulo no canto superior direito
  initial={{ width: 44, height: 44 }}
  whileHover={{ width: 72, height: 72 }}
>
```

`polygon(100% 0, 0 0, 100% 100%)` cria um triângulo com vértices em: canto superior direito, canto superior esquerdo, canto inferior direito. Com `position: absolute` no canto top-right, ele forma o triângulo característico.

### Barra segmentada (20 blocos)

```tsx
{Array.from({ length: 20 }).map((_, i) => (
  <motion.div
    key={i}
    style={{ background: i < filledSegs ? '#E61F1F' : 'rgba(255,255,255,0.07)' }}
    initial={{ scaleY: 0 }}
    animate={inView ? { scaleY: 1 } : {}}
    transition={{ duration: 0.2, delay: delay + 0.08 + i * 0.022 }}
  />
))}
```

**`filledSegs = Math.round(skill.level / 5)`** — divide o nível (0-100) em 20 segmentos (cada um = 5 pontos). `scaleY: 0 → 1` com delays escalonados (`i * 0.022`) = os segmentos "crescem" da esquerda para direita em cascata.

### Estrelas com animação de spring

```tsx
<motion.span
  initial={{ opacity: 0, scale: 0, rotate: -45 }}
  animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
  transition={{ delay: delay + 0.15 + i * 0.07, type: 'spring', stiffness: 260 }}
>
  ◆
</motion.span>
```

`rotate: -45 → 0` com spring faz o diamante "aparecer girando". `stiffness: 260` é alto = movimento rápido e decidido.

### Entrada rotateX

```tsx
initial={{ opacity: 0, rotateX: -25, y: 28 }}
animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
```

`rotateX: -25` inclina o card "caindo de frente" — como se estivesse deitado e se levantando. Combinado com `y: 28`, parece que o card emerge de baixo da superfície.

---

## 12. ALL OUT ATTACK Cinemático

### Estrutura da animação

```tsx
// 1. Fundo vermelho aparece instantaneamente
<motion.div className="absolute inset-0 bg-[#E61F1F]"
  initial={{ scaleX: 0 }}
  animate={{ scaleX: 1 }}
  style={{ originX: 0 }} // expande da esquerda para direita
  transition={{ duration: 0.25 }}
/>

// 2. Slabs pretos diagonais sobrepõem laterais
<div style={{ clipPath: 'polygon(0 0, 28% 0, 18% 100%, 0 100%)' }} /> // slab esquerdo
<div style={{ clipPath: 'polygon(72% 0, 100% 0, 100% 100%, 82% 100%)' }} /> // slab direito

// 3. Texto zoom-in com spring
<motion.h2
  initial={{ scale: 3, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 280, damping: 16 }}
>
  ALL OUT
</motion.h2>
```

### O outline text

```tsx
style={{
  color: 'transparent',
  WebkitTextStroke: '3px white',  // outline branco sem fill
}}
```

`WebkitTextStroke` cria texto com apenas o contorno. Combinado com `color: transparent`, o texto fica "vazado" — exatamente como "ATTACK!" aparece no jogo.

### O som de impacto sintético

```typescript
allout() {
  // PARTE 1: Boom de baixa frequência (ruído com decay lento)
  for (let i = 0; i < len; i++)
    d[i] = (Math.random() * 2 - 1)
          * Math.pow(1 - i/len, 0.4) // decay mais lento que whoosh
          * (i < len * 0.08 ? i/(len*0.08) : 1); // attack de 8%
  // ^ o "attack" (i < 8%) evita o click de onset abrupto

  // PARTE 2: Pitch sting (oscilador descendente)
  o.type = 'sawtooth'; // mais harmônicos que square = mais "metálico"
  o.frequency.setValueAtTime(900, now);
  o.frequency.exponentialRampToValueAtTime(350, now + 0.35);
}
```

Dois sons simultâneos: o boom de baixa frequência cria o impacto físico, o sting descendente cria o drama.

---

## 13. Sistema de Notificações Confidant

### Padrão: Custom Events como barramento de eventos

```typescript
// Qualquer componente pode disparar
function emitNotif(arcana: string, title: string) {
  window.dispatchEvent(new CustomEvent('persona-notif', {
    detail: { arcana, title }
  }));
}

// Apenas o componente raiz escuta
useEffect(() => {
  const handler = (e: Event) => {
    const { arcana, title } = (e as CustomEvent).detail;
    setNotifs(prev => [...prev, { id: Date.now(), arcana, title }]);
  };
  window.addEventListener('persona-notif', handler);
  return () => window.removeEventListener('persona-notif', handler);
}, []);
```

**Por que não Context API?** Context re-renderiza todos os consumidores a cada mudança. Para notificações (evento fire-and-forget), um custom event é mais simples e sem overhead.

**Por que `id: Date.now()`?** Precisamos de uma key estável para o AnimatePresence. `Date.now()` garante unicidade se as notificações não chegarem no mesmo milissegundo.

### Disparo sincronizado com o scramble

```typescript
useEffect(() => {
  if (inView && !firedRef.current) {
    firedRef.current = true;       // garante que dispara só 1 vez
    S.whoosh();                    // som imediato
    if (notifArcana) {
      setTimeout(() => emitNotif(...), 700); // notificação 700ms depois
    }
  }
}, [inView]);
```

O delay de 700ms deixa o scramble de texto terminar (dura ~600ms) antes da notificação aparecer. Isso cria uma sequência narrativa: texto revela → confirmação aparece.

### AnimatePresence com lista

```tsx
<AnimatePresence>
  {notifs.map(n => (
    <NotifToast key={n.id} n={n} onDone={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} />
  ))}
</AnimatePresence>
```

`AnimatePresence` precisa de filhos com `key` estável. Quando um item é removido do array (`filter`), o AnimatePresence detecta e executa a animação de `exit` antes de desmontar.

---

## 14. Arquitetura Geral do Componente

### Por que um único `page.tsx`

O arquivo tem ~1660 linhas, mas a estrutura é completamente flat:

```
Módulo de Sons (S)
Hooks utilitários (useScramble)
Componentes de infraestrutura (CustomCursor, SpeedLines, NotifToast)
Componentes de animação (AllOutAttack, LoadingScreen)
Componentes de seção (Navbar, Hero, About, Skills, Projects, Contact, Footer)
Componente raiz (Page)
```

Para extrair um componente em arquivo separado, o critério ideal é:
- Reutilizado em mais de 1 lugar, **ou**
- Tem mais de ~80 linhas **e** responsabilidade clara

### Hierarquia de z-index

| Camada | z-index | Elemento |
|---|---|---|
| Trail do cursor | 9997 | Pontos do trail |
| Cursor principal | 9998 | Diamante vermelho |
| Loading screen | 9999 | Tela de carregamento |
| ALL OUT ATTACK | 9975 | Cinemático |
| Menu backdrop | 9960 | Overlay escuro |
| Menu sidebar | 9965 | Painel lateral |
| Navbar | 9950 | Barra de navegação |
| Notificações | 9990 | Toasts |

### O padrão `firedRef` para efeitos únicos

```typescript
const firedRef = useRef(false);

useEffect(() => {
  if (inView && !firedRef.current) {
    firedRef.current = true; // nunca mais entra aqui
    // ...efeito único
  }
}, [inView]);
```

`useInView` com `{ once: true }` já garante que `inView` vira `true` apenas uma vez. O `firedRef` é uma camada extra para efeitos colaterais (sons, notificações) que não queremos nem no caso de double-render em desenvolvimento (React StrictMode).

---

## 15. Padrões e Lições Aprendidas

### ✅ O que funcionou bem

**1. Módulo de sons singleton no escopo do módulo**
Manter `_ctx` e o objeto `S` no escopo do módulo (não em um hook) elimina a necessidade de passar callbacks por props ou usar Context.

**2. Custom Events para comunicação entre componentes distantes**
`PersonaMenu` → `S.select()` → sem callback prop.
`SectionHeading` → `emitNotif()` → `Page` escuta. Zero prop drilling.

**3. Valores determinísticos em vez de `Math.random()` no render**
Speed lines usam `(i * 37 % 280)` ao invés de `Math.random()`. Isso previne hydration mismatch (server/client gerando valores diferentes).

**4. `useInView` com `once: true` para animações de scroll**
Sem isso, as animações re-executariam toda vez que o elemento entrasse e saísse da viewport.

**5. Perspectiva no pai para efeitos 3D nos filhos**
```tsx
<div style={{ perspective: 900 }}>
  <motion.div style={{ rotateY: -25 }} /> {/* 3D funciona */}
</div>
```

### ⚠️ Armadilhas comuns

**1. `AudioContext` e autoplay policy**
Browsers bloqueiam som sem interação do usuário. Sempre inicializar o contexto em um event handler (click/keydown), nunca no `useEffect` inicial.

**2. `cursor: none` sem media query**
Sem `@media (pointer: fine)`, dispositivos touch ficam sem cursor padrão e sem o custom cursor (JS de mouse não roda em touch).

**3. `clip-path` e overflow**
`clip-path` corta o elemento visualmente mas **não afeta o layout**. Se precisar que o espaço seja removido, use também `overflow: hidden` ou ajuste o tamanho.

**4. `AnimatePresence` precisa de key único e estável**
Se a key mudar entre renders, o AnimatePresence trata como elemento novo (sem animação de exit do anterior).

**5. `pointer-events: none` em overlays**
Qualquer elemento `position: fixed` que cobre a tela (scanlines, noise, speed lines) precisa de `pointer-events: none` ou bloqueia todos os cliques.

---

## Referências Técnicas

| Tecnologia | Documentação | Para que usamos |
|---|---|---|
| Web Audio API | MDN Web Docs | Síntese de sons sem arquivos |
| Framer Motion | framer.com/motion | Animações spring, stagger, AnimatePresence |
| CSS clip-path | MDN + clippy.io | Todas as formas irregulares |
| CSS `repeating-linear-gradient` | MDN | Listras diagonais e scanlines |
| `useInView` (Framer) | framer.com/motion/use-in-view | Detectar elemento no viewport |
| CSS `aspect-ratio` | MDN | Proporção dos cards de tarô |
| `CustomEvent` | MDN | Barramento de eventos entre componentes |

---

*Portfolio construído com Next.js 15, Tailwind CSS 4, Framer Motion 11 e Web Audio API.*
*Todas as técnicas aqui são reproduzíveis em qualquer projeto React moderno.*
