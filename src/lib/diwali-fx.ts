// Diwali cracker animation on a <canvas>: rockets that burst, flowerpot (anar) fountains and tap-to-burst.
// Does nothing when the visitor prefers reduced motion. Pauses when off screen or in a background tab.

interface Spark {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string; g: number; drag: number;
}
interface Rocket { x: number; y: number; vy: number; targetY: number; color: string }

const COLORS = ["#ffd24a", "#ff8a1f", "#ff4d79", "#7be0ff", "#9dff7a", "#ffffff", "#c58bff"];
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export interface Fx {
  launch: (n?: number) => void;
  destroy: () => void;
}

export function startDiwaliFx(canvas: HTMLCanvasElement, opts: { fountains?: boolean; rockets?: boolean } = {}): Fx {
  const noop: Fx = { launch: () => {}, destroy: () => {} };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return noop;
  const ctx = canvas.getContext("2d");
  if (!ctx) return noop;

  const { fountains = true, rockets: autoRockets = true } = opts;
  const parent = canvas.parentElement ?? canvas;
  let w = 0, h = 0, dpr = 1;
  const sparks: Spark[] = [];
  const rockets: Rocket[] = [];
  let raf = 0, visible = true, last = 0, nextRocket = 400;
  const MAX = window.innerWidth < 640 ? 260 : 520;

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = parent.clientWidth;
    h = parent.clientHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x: number, y: number, color: string): void {
    const n = window.innerWidth < 640 ? 34 : 56;
    const ring = Math.random() < 0.4;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.15;
      const sp = ring ? 3.4 : 1.5 + Math.random() * 3.6;
      sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 55 + Math.random() * 30, size: 1.6 + Math.random() * 1.4, color: Math.random() < 0.2 ? "#ffffff" : color, g: 0.05, drag: 0.975 });
    }
  }

  function launch(n = 1): void {
    for (let i = 0; i < n; i++) {
      window.setTimeout(() => {
        rockets.push({ x: w * (0.12 + Math.random() * 0.76), y: h + 6, vy: -(5.5 + Math.random() * 2.5), targetY: h * (0.15 + Math.random() * 0.35), color: pick(COLORS) });
      }, i * 220);
    }
  }

  function fountain(x: number): void {
    for (let i = 0; i < 2; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
      const sp = 3 + Math.random() * 2.6;
      sparks.push({ x, y: h - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 42 + Math.random() * 20, size: 1.2 + Math.random(), color: pick(["#ffd24a", "#ff8a1f", "#fff1b8"]), g: 0.11, drag: 0.99 });
    }
  }

  function frame(t: number): void {
    raf = window.requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = t; return; }
    const dt = Math.min(2, (t - (last || t)) / 16.7);
    last = t;

    ctx!.globalCompositeOperation = "destination-out";
    ctx!.fillStyle = "rgba(0,0,0,0.22)";
    ctx!.fillRect(0, 0, w, h);
    ctx!.globalCompositeOperation = "lighter";

    if (autoRockets) {
      nextRocket -= 16.7 * dt;
      if (nextRocket <= 0) { launch(1); nextRocket = 900 + Math.random() * 1400; }
    }
    if (fountains && sparks.length < MAX) { fountain(w * 0.08); fountain(w * 0.92); }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy * dt;
      r.vy *= 0.992;
      sparks.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.4, vy: 0.6, life: 0, max: 14, size: 1.3, color: "#ffd9a0", g: 0.02, drag: 0.98 });
      ctx!.fillStyle = "#fff";
      ctx!.beginPath(); ctx!.arc(r.x, r.y, 2.2, 0, Math.PI * 2); ctx!.fill();
      if (r.y <= r.targetY || r.vy > -1.2) { burst(r.x, r.y, r.color); rockets.splice(i, 1); }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life >= s.max) { sparks.splice(i, 1); continue; }
      s.vx *= s.drag; s.vy = s.vy * s.drag + s.g * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
      const a = 1 - s.life / s.max;
      ctx!.globalAlpha = a;
      ctx!.fillStyle = s.color;
      ctx!.beginPath(); ctx!.arc(s.x, s.y, s.size * (0.4 + a * 0.6), 0, Math.PI * 2); ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  const onPointer = (e: PointerEvent): void => {
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea, label")) return;
    const r = parent.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top, pick(COLORS));
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(parent);
  const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; }, { threshold: 0.05 });
  io.observe(parent);
  parent.addEventListener("pointerdown", onPointer);
  raf = window.requestAnimationFrame(frame);
  launch(2);

  return {
    launch,
    destroy: () => { window.cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); parent.removeEventListener("pointerdown", onPointer); },
  };
}

/** Wires every [data-diwali-fx] canvas on the page, plus any [data-light-cracker] buttons inside the same section. */
export function initDiwaliFx(): void {
  document.querySelectorAll<HTMLCanvasElement>("canvas[data-diwali-fx]").forEach((canvas) => {
    const fx = startDiwaliFx(canvas);
    canvas.closest("section")?.querySelectorAll<HTMLButtonElement>("[data-light-cracker]").forEach((b) => {
      b.addEventListener("click", () => fx.launch(3));
    });
  });
}
