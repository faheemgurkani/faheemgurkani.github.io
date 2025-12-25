"use client";

import React, { useEffect, useRef, useState } from "react";

export interface InteractiveGridBackgroundProps
  extends React.HTMLProps<HTMLDivElement> {
  gridSize?: number;
  gridColor?: string;
  darkGridColor?: string;
  effectColor?: string;
  darkEffectColor?: string;
  trailLength?: number;
  width?: number;
  height?: number;
  idleSpeed?: number;
  glow?: boolean;
  glowRadius?: number;
  children?: React.ReactNode;
  showFade?: boolean;
  fadeIntensity?: number;
  idleRandomCount?: number;
}

const InteractiveGridBackground: React.FC<InteractiveGridBackgroundProps> = ({
  gridSize = 50,
  gridColor = "#2a2a2a",
  darkGridColor = "#2a2a2a",
  effectColor = "rgba(255, 255, 255, 0.06)",
  darkEffectColor = "rgba(255, 255, 255, 0.06)",
  trailLength = 3,
  width,
  height,
  idleSpeed = 0.15,
  glow = true,
  glowRadius = 10,
  children,
  showFade = true,
  fadeIntensity = 22,
  idleRandomCount = 4,
  className,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const trailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);
  const idleTargetsRef = useRef<{ x: number; y: number }[]>([]);
  const idlePositionsRef = useRef<{ x: number; y: number }[]>([]);
  const lastMouseTimeRef = useRef(Date.now());
  const isInsideRef = useRef(false);
  const reqIdRef = useRef<number>(0);

  /* Measure container */
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setDimensions({
        width: width || containerRef.current.offsetWidth,
        height: height || containerRef.current.offsetHeight,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width, height]);

  /* Mouse tracking */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const c = containerRef.current;
      if (!c) return;

      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      if (x < 0 || y < 0 || x > r.width || y > r.height) return;

      isInsideRef.current = true;
      lastMouseTimeRef.current = Date.now();

      const gx = Math.floor(x / gridSize);
      const gy = Math.floor(y / gridSize);

      const last = trailRef.current[0];
      if (!last || last.x !== gx || last.y !== gy) {
        trailRef.current.unshift({ x: gx, y: gy, alpha: 0.12 });
        if (trailRef.current.length > trailLength) trailRef.current.pop();
      }
    };

    const handleMouseLeave = () => {
      isInsideRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gridSize, trailLength]);

  /* Animation */
  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const cols = Math.ceil(dimensions.width / gridSize);
    const rows = Math.ceil(dimensions.height / gridSize);

    if (!idleTargetsRef.current.length) {
      idleTargetsRef.current = Array.from({ length: idleRandomCount }, () => ({
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      }));
      idlePositionsRef.current = idleTargetsRef.current.map(p => ({ ...p }));
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Grid */
      ctx.strokeStyle = darkGridColor;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(canvas.width, y + 0.5);
        ctx.stroke();
      }

      /* Idle motion */
      if (Date.now() - lastMouseTimeRef.current > 2000) {
        idlePositionsRef.current.forEach((pos, i) => {
          const t = idleTargetsRef.current[i];
          pos.x += (t.x - pos.x) * idleSpeed;
          pos.y += (t.y - pos.y) * idleSpeed;

          if (Math.abs(t.x - pos.x) < 0.1 && Math.abs(t.y - pos.y) < 0.1) {
            idleTargetsRef.current[i] = {
              x: Math.floor(Math.random() * cols),
              y: Math.floor(Math.random() * rows),
            };
          }

          const a = 0.08;
          ctx.fillStyle = darkEffectColor.replace(/[\d.]+\)$/g, `${a})`);
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = glow ? glowRadius : 0;

          ctx.fillRect(
            Math.round(pos.x) * gridSize,
            Math.round(pos.y) * gridSize,
            gridSize,
            gridSize
          );
        });
      }

      /* Mouse trail with fade-out */
      trailRef.current.forEach(cell => {
        cell.alpha *= isInsideRef.current ? 1 : 0.92;

        if (cell.alpha < 0.01) return;

        ctx.fillStyle = darkEffectColor.replace(/[\d.]+\)$/g, `${cell.alpha})`);
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = glow ? glowRadius : 0;

        ctx.fillRect(
          cell.x * gridSize,
          cell.y * gridSize,
          gridSize,
          gridSize
        );
      });

      trailRef.current = trailRef.current.filter(c => c.alpha > 0.01);

      reqIdRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [
    dimensions,
    gridSize,
    darkGridColor,
    darkEffectColor,
    idleSpeed,
    glow,
    glowRadius,
    idleRandomCount,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        width: width || "100%",
        height: height || "100%",
        backgroundColor: "#0a0a0a",
      }}
      {...props}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {showFade && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: "#0a0a0a",
            maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
            WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
          }}
        />
      )}

      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default InteractiveGridBackground;