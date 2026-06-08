import { useEffect, useRef } from "react";

// Cursor personalizado: un anillo que sigue al ratón con inercia + un punto.
// Solo en dispositivos con puntero fino (ratón); respeta reduced-motion.
export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    document.body.classList.add("custom-cursor");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      const t = e.target as HTMLElement;
      const hover = !!t.closest?.("a, button, input, select, label, [data-cursor]");
      ring.current?.classList.toggle("is-hover", hover);
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring hidden md:block" />
      <div ref={dot} className="cursor-dot hidden md:block" />
    </>
  );
}
