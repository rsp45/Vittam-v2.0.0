import React, { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const mouse = { x: -1000, y: -1000 };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Increased particle count for a denser, more immersive network
      const numParticles = Math.min(Math.floor((width * height) / 3500), 350);
      particles = [];

      for (let i = 0; i < numParticles; i++) {
        let x, y, vx, vy;
        
        // Arrange 75% of particles to form an upward-trending "stock chart" path
        if (Math.random() < 0.75) {
          x = Math.random() * width;
          // Base upward trend: from bottom-left (y ~ height*0.8) to top-right (y ~ height*0.2)
          const trend = height * 0.8 - (x / width) * height * 0.6;
          // Volatility / Oscillations to look like price swings
          const volatility = Math.sin(x * 0.008) * 80 + Math.cos(x * 0.02) * 40;
          // Random noise distribution around the trend line
          const noise = (Math.random() - 0.5) * (Math.random() * 180);
          
          y = trend + volatility + noise;
          
          // Chart particles slowly drift right to simulate time series scrolling
          vx = Math.random() * 0.4 + 0.1;
          vy = (Math.random() - 0.5) * 0.5;
        } else {
          // Ambient background particles for depth
          x = Math.random() * width;
          y = Math.random() * height;
          vx = (Math.random() - 0.5) * 0.6;
          vy = (Math.random() - 0.5) * 0.6;
        }

        particles.push({
          x,
          y,
          vx,
          vy,
          radius: Math.random() * 1.8 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const isDark = theme === "dark";
      // VITTAM Golden Theme
      const particleColor = isDark ? "rgba(245, 158, 11, 0.7)" : "rgba(217, 119, 6, 0.5)";
      const lineColorBase = isDark ? "245, 158, 11" : "217, 119, 6";

      particles.forEach((p, index) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around left/right to create a continuous flowing chart effect
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        // Bounce off top/bottom
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction with mouse (repel slightly for a dynamic feel)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          p.x -= dx * 0.015;
          p.y -= dy * 0.015;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Connect nearby particles to form the network / chart lines
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          // Increased connection distance slightly for the denser cluster
          if (dist2 < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColorBase}, ${0.2 - dist2 / 100 * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    init();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-auto"
      style={{ opacity: 0.95 }}
    />
  );
}
