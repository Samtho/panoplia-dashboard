import { useEffect, useState } from "react";

// Cortina de entrada: cubre la pantalla al cargar y se retira con animación.
export default function Preloader() {
  const [gone, setGone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setHidden(true); return; }
    const t1 = setTimeout(() => setGone(true), 1100);   // inicia la salida
    const t2 = setTimeout(() => setHidden(true), 1900);  // desmonta
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (hidden) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] bg-paper flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${gone ? "-translate-y-full" : ""}`}
      aria-hidden="true"
    >
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-semibold text-ink overflow-hidden">
          <span className="inline-block animate-[preIn_0.7s_ease-out]">Panoplia<span className="text-terracota">.</span></span>
        </div>
        <div className="mt-4 h-0.5 w-40 mx-auto bg-line overflow-hidden rounded-full">
          <div className="h-full bg-terracota animate-[preBar_1.1s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
}
