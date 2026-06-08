import { useEffect } from "react";
import { scrollToId } from "../lib/motion";

// Menú móvil a pantalla completa (solo < lg). Navegación por secciones + acciones.
export default function MobileMenu({
  nav, active, juryOn, onClose, onPowerBI, onDefensa,
}: {
  nav: { id: string; label: string }[];
  active: string;
  juryOn: boolean;
  onClose: () => void;
  onPowerBI: () => void;
  onDefensa: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (id: string) => { onClose(); setTimeout(() => scrollToId(id), 60); };

  return (
    <div className="fixed inset-0 z-[60] bg-paper/97 backdrop-blur-md jury-banner lg:hidden" data-lenis-prevent>
      <div className="px-6 h-full flex flex-col">
        <div className="h-14 flex items-center justify-between shrink-0">
          <span className="font-display font-semibold text-lg">Panoplia<span className="text-terracota">.</span></span>
          <button onClick={onClose} aria-label="Cerrar" className="h-10 w-10 grid place-items-center text-2xl text-ink-soft">×</button>
        </div>
        <nav className="flex-1 flex flex-col justify-center gap-0.5 overflow-y-auto">
          {nav.map((n, i) => (
            <button key={n.id} onClick={() => go(n.id)}
              className={`text-left font-display text-2xl font-semibold py-1.5 ${active === n.id ? "text-terracota" : "text-ink"}`}>
              <span className="text-muted text-sm font-sans mr-3">0{i + 1}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="py-5 flex flex-wrap gap-3 shrink-0 border-t border-line">
          <button onClick={() => { onClose(); onPowerBI(); }}
            className="rounded-full px-4 py-2 text-sm font-medium bg-terracota text-white">▦ Cuadro Power BI</button>
          <button onClick={() => { onClose(); onDefensa(); }}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${juryOn ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line"}`}>
            {juryOn ? "● Defensa activa" : "Modo defensa"}
          </button>
        </div>
      </div>
    </div>
  );
}
