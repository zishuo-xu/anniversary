import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  prevX: number;
  prevY: number;
  friction: number;
  gravity: number;
}

interface Flash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

interface Props {
  celebrating?: boolean;
}

const COLORS = [
  '#ff6b9d', '#f8b500', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ee5a24', '#009432', '#0652dd', '#9980fa',
  '#ff4757', '#ffa502', '#2ed573', '#1e90ff',
];

const GOLD_COLORS = ['#ffd700', '#ffec8b', '#ffb347', '#ff8c00', '#daa520'];

function randomColor(isCelebration: boolean): string {
  if (isCelebration && Math.random() > 0.25) {
    return GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
  }
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function Fireworks({ celebrating = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: Particle[] = [];
    const flashes: Flash[] = [];
    const rockets: Rocket[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);

    const createExplosion = (x: number, y: number, color: string, isCelebration: boolean, isSecondary = false) => {
      const count = isCelebration
        ? (isSecondary ? 30 + Math.random() * 20 : 80 + Math.random() * 60)
        : 35 + Math.random() * 30;
      const speedBase = isCelebration ? (isSecondary ? 1.2 : 2.2) : 1.3;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const speed = speedBase + Math.random() * 3;
        const px = x + (Math.random() - 0.5) * 4;
        const py = y + (Math.random() - 0.5) * 4;
        particles.push({
          x: px,
          y: py,
          prevX: px,
          prevY: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.9 + Math.random() * 0.1,
          decay: isCelebration ? 0.006 + Math.random() * 0.008 : 0.009 + Math.random() * 0.011,
          color: isSecondary && Math.random() > 0.3
            ? '#ffffff'
            : (isCelebration && Math.random() > 0.4
              ? GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]
              : color),
          size: isCelebration ? 1.2 + Math.random() * 2.5 : 0.8 + Math.random() * 1.5,
          friction: 0.97,
          gravity: isCelebration ? 0.018 : 0.028,
        });
      }

      // Core flash
      flashes.push({
        x,
        y,
        radius: isCelebration ? 40 + Math.random() * 30 : 20 + Math.random() * 15,
        alpha: isCelebration ? 0.9 : 0.6,
        decay: isCelebration ? 0.04 : 0.06,
      });

      // Secondary burst after a delay
      if (isCelebration && !isSecondary) {
        setTimeout(() => {
          createExplosion(
            x + (Math.random() - 0.5) * 40,
            y + (Math.random() - 0.5) * 40,
            GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
            true,
            true
          );
        }, 150 + Math.random() * 200);
      }
    };

    const launchRocket = (isCelebration: boolean) => {
      const x = isCelebration
        ? 50 + Math.random() * (w - 100)
        : 100 + Math.random() * (w - 200);
      const targetY = isCelebration
        ? h * 0.08 + Math.random() * h * 0.38
        : h * 0.12 + Math.random() * h * 0.22;
      rockets.push({
        x,
        y: h,
        vy: isCelebration ? -(5.5 + Math.random() * 4.5) : -(4 + Math.random() * 3),
        targetY,
        color: randomColor(isCelebration),
        exploded: false,
      });
    };

    let lastLaunch = 0;
    let launchInterval = 2000 + Math.random() * 2000;
    let ambientFlash = 0;

    const animate = (time: number) => {
      const isC = celebrating;

      // Longer trails during celebration
      ctx.fillStyle = isC ? 'rgba(5, 5, 16, 0.12)' : 'rgba(5, 5, 16, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // Ambient flash for celebration
      if (isC) {
        ambientFlash *= 0.9;
        if (Math.random() < 0.04) ambientFlash = 0.04 + Math.random() * 0.08;
        if (ambientFlash > 0.005) {
          const g = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.6);
          g.addColorStop(0, `rgba(255, 200, 80, ${ambientFlash * 0.3})`);
          g.addColorStop(1, 'rgba(5, 5, 16, 0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // Launch rockets
      const interval = isC ? 100 + Math.random() * 180 : 1800 + Math.random() * 2200;
      if (time - lastLaunch > launchInterval) {
        launchRocket(isC);
        if (isC && Math.random() < 0.5) {
          setTimeout(() => launchRocket(true), 60 + Math.random() * 150);
        }
        lastLaunch = time;
        launchInterval = interval;
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Rocket head glow
        ctx.beginPath();
        ctx.arc(r.x, r.y, isC ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        // Rocket head bloom
        ctx.beginPath();
        ctx.arc(r.x, r.y, isC ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Trail with gradient
        const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + (isC ? 35 : 20));
        grad.addColorStop(0, `rgba(255,255,255,${isC ? 0.6 : 0.35})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x + (Math.random() - 0.5) * 2, r.y + (isC ? 35 : 20));
        ctx.strokeStyle = grad;
        ctx.lineWidth = isC ? 2.5 : 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          createExplosion(r.x, r.y, r.color, isC);
          ambientFlash = Math.max(ambientFlash, isC ? 0.2 : 0.1);
          rockets.splice(i, 1);
        }
      }

      // Update flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.alpha -= f.decay;
        f.radius += 1.5;
        if (f.alpha <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        g.addColorStop(0, `rgba(255, 240, 200, ${f.alpha * 0.8})`);
        g.addColorStop(0.4, `rgba(255, 200, 100, ${f.alpha * 0.3})`);
        g.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.vx *= p.friction;
        p.vy *= p.friction;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Trail line
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Head glow
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Outer bloom
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.12;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', resize);
    };
  }, [celebrating]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[4] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
