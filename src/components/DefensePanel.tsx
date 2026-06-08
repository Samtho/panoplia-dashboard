import { useRef, useState } from "react";
import { scrollToId } from "../lib/motion";

// Pasos de la defensa: pregunta del tribunal + sección a la que lleva + respuesta.
const PASOS = [
  { id: "diagnostico", q: "¿Lo está haciendo bien?", a: "Cae 18,3% desde 2022 mientras el sector crece 6,3%." },
  { id: "mercados", q: "¿Puede seguir exportando?", a: "El 91,86% es doméstico; la exportación es casi toda México (77%)." },
  { id: "generos", q: "¿Qué géneros potenciar?", a: "Infantil y Juvenil lidera; mira el Top 10 a potenciar." },
  { id: "clientes", q: "¿A qué clientes cuidar?", a: "El 24% (Campeones) aporta el 75%; 1,04 M€ en 44 'En Riesgo'." },
  { id: "predictor", q: "¿Se puede predecir el éxito?", a: "Sí, gradient boosting (AUC 0,64, el mejor de 11 modelos)." },
  { id: "ruta", q: "¿Qué hacer ahora?", a: "Retener En Riesgo, limpiar el dato, desarrollar México." },
];

export default function DefensePanel({ active, onClose }: { active: string; onClose: () => void }) {
  const [answered, setAnswered] = useState<string | null>(null);
  const pulseTimer = useRef<number | null>(null);

  function go(id: string) {
    setAnswered(id);
    scrollToId(id);
    const el = document.getElementById(id);
    if (!el) return;
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    document.querySelectorAll(".section-pulse").forEach((n) => n.classList.remove("section-pulse"));
    void el.offsetWidth;
    el.classList.add("section-pulse");
    pulseTimer.current = window.setTimeout(() => el.classList.remove("section-pulse"), 1900);
  }

  return (
    <aside
      data-lenis-prevent
      className="group fixed left-0 top-0 z-50 h-screen w-16 hover:w-80 bg-paper-soft border-r border-line transition-[width] duration-300 ease-out overflow-hidden"
    >
      <div className="w-80 p-3 flex flex-col h-full">
        <div className="flex items-center justify-between h-10 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-terracota opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Modo defensa</span>
          <button onClick={onClose} aria-label="Cerrar" className="h-8 w-8 grid place-items-center text-ink-soft hover:text-terracota shrink-0 ml-auto">×</button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {PASOS.map((p, i) => {
            const isActive = active === p.id;
            return (
              <button key={p.id} onClick={() => go(p.id)} className="flex items-start gap-3 text-left rounded-lg p-1.5 hover:bg-card transition-colors">
                <span className={`shrink-0 h-9 w-9 grid place-items-center rounded-full font-display font-semibold text-sm border transition-colors ${
                  isActive ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line"
                }`}>{i + 1}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity min-w-0">
                  <span className={`block text-sm font-medium leading-tight ${isActive ? "text-terracota" : "text-ink"}`}>{p.q}</span>
                  {answered === p.id && <span className="block text-xs text-ink-soft mt-0.5 leading-snug">{p.a}</span>}
                </span>
              </button>
            );
          })}
        </nav>

        <p className="mt-auto text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          Pasa el ratón para expandir · clic para ir a la sección.
        </p>
      </div>
    </aside>
  );
}
