import type { ReactNode } from "react";

// Etiqueta de pregunta + número de sección
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-terracota font-semibold tracking-[0.18em] uppercase text-xs mb-3">
      {children}
    </p>
  );
}

// Cabecera de sección: pregunta grande tipo titular
export function SectionHeader({
  kicker,
  question,
  lead,
}: {
  kicker: string;
  question: string;
  lead?: string;
}) {
  return (
    <header className="max-w-3xl mb-8">
      <Kicker>{kicker}</Kicker>
      <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-ink">
        {question}
      </h2>
      {lead && <p className="mt-4 text-ink-soft text-lg leading-relaxed">{lead}</p>}
    </header>
  );
}

// Tarjeta de KPI
export function Kpi({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="px-4 py-3">
      <div className="font-display text-2xl md:text-3xl font-semibold text-ink">{value}</div>
      <div className="text-muted text-xs mt-1 leading-snug">{label}</div>
    </div>
  );
}

// Veredicto destacado (la respuesta directa a la pregunta de la sección)
export function Verdict({
  tone = "alerta",
  children,
}: {
  tone?: "alerta" | "oportunidad" | "neutro";
  children: ReactNode;
}) {
  const dot =
    tone === "alerta" ? "bg-reducir" : tone === "oportunidad" ? "bg-potenciar" : "bg-vigilar";
  return (
    <div className="flex items-start gap-3 rounded-xl bg-paper-soft border border-line p-4">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <p className="text-ink font-medium leading-relaxed">{children}</p>
    </div>
  );
}

// Bloque de recomendación accionable
export function Recommendation({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 border-l-2 border-terracota pl-4">
      <p className="text-terracota font-semibold text-xs tracking-wide uppercase mb-1">
        Recomendación
      </p>
      <div className="text-ink-soft leading-relaxed">{children}</div>
    </div>
  );
}

// Aviso de dato provisional (placeholder)
export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-xs text-muted italic">
      Dato provisional. {children}
    </p>
  );
}

// Contenedor de tarjeta para gráficos
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-line shadow-sm p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}
