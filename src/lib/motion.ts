import { useEffect } from "react";
import Lenis from "lenis";

// Instancia global de Lenis para que la navegación (nav, panel de defensa) use scroll suave.
let lenis: Lenis | null = null;

export function scrollToId(id: string, offset = -80) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Smooth scroll cinemático (estilo webs premiadas). Respeta prefers-reduced-motion.
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ duration: 0.6, wheelMultiplier: 1.15, smoothWheel: true });
    lenis = instance;
    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Anclas internas (#seccion) vía Lenis para que el salto sea suave.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const id = href.slice(1);
      if (id && document.getElementById(id)) {
        e.preventDefault();
        instance.scrollTo(`#${id}`, { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      instance.destroy();
      lenis = null;
    };
  }, []);
}
