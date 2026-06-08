import { useEffect, useRef, useState } from "react";

// Número que cuenta desde 0 hasta el valor cuando entra en viewport.
// format: cómo se muestra el valor (p. ej. miles con separador, sufijos).
export default function Counter({
  to,
  format,
  duration = 1400,
}: {
  to: number;
  format: (v: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(to);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easing easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(to * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setValue(to);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{format(value)}</span>;
}
