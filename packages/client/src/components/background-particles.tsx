import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  explodeLife: number; // frames remaining for explosion influence
  color: string;
  phase: number;
  flickerSpeed: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // frames
  size: number;
  alpha: number;
  color: string;
};

type BackgroundParticlesProps = {
  zIndex?: number;
  densityScale?: number; // 1 = default density; 0.5 = half
};

export function BackgroundParticles({ zIndex = -1, densityScale = 1 }: BackgroundParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles: Particle[] = [];
    const sparks: Spark[] = [];

    const PURPLE_PALETTE = [
      "#E6E6FA", // lavender
      "#DDA0DD", // plum
      "#9370DB", // medium slate blue
      "#8A2BE2", // blue violet
      "#7B68EE", // medium slate blue
      "#6A5ACD", // slate blue
      "#4B0082"  // indigo
    ];

    const SNOWFLAKE_PALETTE = [
      "#87ceeb", // sky blue
      "#4fc3f7", // light blue
      "#29b6f6", // blue
      "#03a9f4", // bright blue
      "#0288d1", // deep blue
      "#0277bd", // darker blue
      "#01579b"  // navy blue
    ];

    // Detect current theme
    const getCurrentTheme = () => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return theme;
    };

    const isLightTheme = getCurrentTheme() === "light";
    const pickColor = () => {
      const palette = isLightTheme ? SNOWFLAKE_PALETTE : PURPLE_PALETTE;
      return palette[(Math.random() * palette.length) | 0];
    };

    const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Reinitialize particles proportionally to area
      const baseCount = Math.min(450, Math.max(120, Math.floor((width * height) / 15000)));
      // 1.5x quantity for snowflakes in light theme
      const quantityMultiplier = isLightTheme ? 1.5 : 1;
      const targetCount = Math.max(40, Math.floor(baseCount * Math.max(0.1, densityScale) * quantityMultiplier));
      particles.length = 0;
      for (let i = 0; i < targetCount; i++) {
        // 2x speed increase for all particles
        const baseSpeed = randomRange(0.08, 0.32);
        const speed = baseSpeed * 2; // 2x speed increase
        const angle = randomRange(0, Math.PI * 2);
        const baseVx = Math.cos(angle) * speed;
        const baseVy = Math.sin(angle) * speed;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: baseVx,
          vy: baseVy,
          baseVx,
          baseVy,
          // Reduced snowflake size by 40% (multiply by 0.6)
          size: isLightTheme ? randomRange(4.32, 9.72) : randomRange(1.2, 2.7),
          // brighter baseline alpha for flashy look
          alpha: randomRange(0.5, 0.95),
          explodeLife: 0,
          color: pickColor(),
          phase: Math.random() * Math.PI * 2,
          flickerSpeed: randomRange(0.5, 1.5),
        });
      }
      sparks.length = 0;
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let lastTime = performance.now();
    let timeSinceExplosionMs = 0;
    let nextExplosionMs = randomRange(1200, 3200);

    const triggerExplosion = () => {
      const cx = randomRange(0, width);
      const cy = randomRange(0, height);
      const radius = randomRange(60, 120);

      // Affect nearby particles
      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const force = (1 - dist / radius) * randomRange(1.5, 3.2);
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          p.vx += nx * force;
          p.vy += ny * force;
          p.explodeLife = Math.floor(randomRange(24, 48));
        }
      }

      // Add brief sparks (snowflakes or fire-like)
      const sparkCount = Math.floor(randomRange(18, 36));
      for (let i = 0; i < sparkCount; i++) {
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(0.6, 2.2) * 2; // 2x speed increase for explosion sparks
        sparks.push({
          x: cx + Math.cos(angle) * randomRange(0, 6),
          y: cy + Math.sin(angle) * randomRange(0, 6),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.floor(randomRange(18, 32)),
          // Reduced snowflake spark size by 40% (multiply by 0.6)
          size: isLightTheme ? randomRange(6.48, 11.88) : randomRange(1.8, 3.3),
          alpha: randomRange(0.6, 1.0),
          color: pickColor(),
        });
      }
    };

    const step = (now: number) => {
      const dtMs = Math.min(48, now - lastTime);
      lastTime = now;
      const dt = dtMs / (16.6667); // normalize to ~60fps steps

      timeSinceExplosionMs += dtMs;
      if (timeSinceExplosionMs >= nextExplosionMs) {
        triggerExplosion();
        timeSinceExplosionMs = 0;
        nextExplosionMs = randomRange(1400, 3600);
      }

      // Clear with slight alpha to leave very faint trails
      ctx.clearRect(0, 0, width, height);

      // Draw particles
      ctx.save();
      // Additive blend for golden glow
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        // Ease velocities back toward base drift
        if (p.explodeLife > 0) {
          p.explodeLife -= 1 * dt;
        }
        const settle = p.explodeLife > 0 ? 0.90 : 0.95;
        p.vx = p.vx * settle + p.baseVx * (1 - settle);
        p.vy = p.vy * settle + p.baseVy * (1 - settle);

        // keep motion fast and constant across background
        p.x += p.vx * dt * 1.0;
        p.y += p.vy * dt * 1.0;

        // Wrap around screen edges
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;

        // subtle flicker for flashiness
        p.phase += p.flickerSpeed * dt * 0.1;
        const flicker = 0.85 + 0.15 * Math.sin(p.phase);
        ctx.globalAlpha = Math.min(1, p.alpha * flicker);
        ctx.fillStyle = p.color;
        
        if (isLightTheme) {
          // Draw snowflake shape
          const centerX = Math.floor(p.x + p.size / 2);
          const centerY = Math.floor(p.y + p.size / 2);
          const radius = p.size / 2;
          
          ctx.beginPath();
          // Draw 6-pointed star (snowflake)
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius * 0.3);
            const y2 = centerY + Math.sin(angle) * (radius * 0.3);
            
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x1, y1);
            ctx.moveTo(x2, y2);
            ctx.lineTo(centerX + Math.cos(angle + Math.PI/6) * (radius * 0.6), centerY + Math.sin(angle + Math.PI/6) * (radius * 0.6));
            ctx.moveTo(x2, y2);
            ctx.lineTo(centerX + Math.cos(angle - Math.PI/6) * (radius * 0.6), centerY + Math.sin(angle - Math.PI/6) * (radius * 0.6));
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, p.size / 8);
          ctx.stroke();
        } else {
          // Draw fire spark (square)
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }
      }
      ctx.restore();

      // Update and draw sparks with additive blend
      if (sparks.length) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life -= 1 * dt;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          s.x += s.vx * dt * 1.2;
          s.y += s.vy * dt * 1.2;
          s.vx *= 0.98;
          s.vy *= 0.98;
          const fade = Math.max(0, s.life / 24);
          ctx.globalAlpha = Math.min(1, s.alpha * fade);
          ctx.fillStyle = s.color;
          
          if (isLightTheme) {
            // Draw snowflake spark
            const centerX = Math.floor(s.x + s.size / 2);
            const centerY = Math.floor(s.y + s.size / 2);
            const radius = s.size / 2;
            
            ctx.beginPath();
            // Draw 6-pointed star (snowflake)
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x1 = centerX + Math.cos(angle) * radius;
              const y1 = centerY + Math.sin(angle) * radius;
              const x2 = centerX + Math.cos(angle) * (radius * 0.3);
              const y2 = centerY + Math.sin(angle) * (radius * 0.3);
              
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(x1, y1);
              ctx.moveTo(x2, y2);
              ctx.lineTo(centerX + Math.cos(angle + Math.PI/6) * (radius * 0.6), centerY + Math.sin(angle + Math.PI/6) * (radius * 0.6));
              ctx.moveTo(x2, y2);
              ctx.lineTo(centerX + Math.cos(angle - Math.PI/6) * (radius * 0.6), centerY + Math.sin(angle - Math.PI/6) * (radius * 0.6));
            }
            ctx.strokeStyle = s.color;
            ctx.lineWidth = Math.max(1, s.size / 8);
            ctx.stroke();
          } else {
            // Draw fire spark (square)
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
          }
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [theme, densityScale]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        pointerEvents: "none",
      }}
    />
  );
}

