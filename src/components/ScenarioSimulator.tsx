import { useMemo, useState } from "react";
import EChart from "./EChart";
import { projectionOption } from "../charts/options";

// Escenario ilustrativo anclado a cifras reales (anuales, base 2025 = 2,68 M€).
// No es una previsión del modelo: proyecta el impacto de las palancas de la hoja de ruta.
const ACTUAL = 2.68;        // facturación anual 2025 (M€)
const PICO = 3.28;          // pico 2022 (M€)
const EN_RIESGO = 0.21;     // aportación anual de los 44 clientes "En Riesgo" (1,04 M€ / 5 años)
const MEXICO = 0.19;        // facturación anual de México (0,97 M€ / 5 años)
const EXPORT = 0.25;        // exportación anual (1,26 M€ / 5 años)
const GAP = PICO - ACTUAL;  // brecha hasta el pico 2022 (0,60 M€)

const fmt = (n: number) => n.toFixed(2).replace(".", ",");

function Slider({ label, value, onChange, hint, color }: {
  label: string; value: number; onChange: (v: number) => void; hint: string; color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-display font-semibold text-terracota tabular-nums">{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-terracota"
        style={{ accentColor: color }}
      />
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}

export default function ScenarioSimulator() {
  const [reten, setReten] = useState(60);   // retención de clientes En Riesgo
  const [mex, setMex] = useState(40);       // crecimiento de México
  const [recup, setRecup] = useState(50);   // recuperación de la caída

  const g1 = (reten / 100) * EN_RIESGO;
  const g2 = (mex / 100) * MEXICO;
  const g3 = (recup / 100) * GAP;
  const total = g1 + g2 + g3;
  const proj = ACTUAL + total;
  const uplift = (total / ACTUAL) * 100;
  const newExport = EXPORT + g2;
  const exportShare = (newExport / proj) * 100;
  const projChart = useMemo(() => projectionOption(proj), [proj]);

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="font-display text-xl font-semibold mb-1">Simulador de impacto: ¿y si actuamos?</h3>
      <p className="text-sm text-ink-soft mb-6">
        Mueve las palancas de la hoja de ruta y mira el resultado proyectado sobre la facturación anual actual ({fmt(ACTUAL)} M€).
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Palancas */}
        <div className="space-y-5">
          <Slider label="1 · Retener clientes 'En Riesgo'" value={reten} onChange={setReten} color="#10a99e"
            hint={`Recuperar parte de los 1,04 M€ que se están enfriando (hasta +${fmt(EN_RIESGO)} M€/año).`} />
          <Slider label="2 · Desarrollar México" value={mex} onChange={setMex} color="#10a99e"
            hint={`Crecer el 2º mercado (hasta +${fmt(MEXICO)} M€/año si se duplica). Es la palanca exportadora.`} />
          <Slider label="3 · Recuperar el nivel de 2022" value={recup} onChange={setRecup} color="#10a99e"
            hint={`Cerrar parte de la brecha de ${fmt(GAP)} M€ frente al pico histórico.`} />
        </div>

        {/* Resultado */}
        <div className="rounded-2xl border border-line bg-paper-soft p-5 flex flex-col justify-center">
          <div className="text-xs uppercase tracking-wide text-muted mb-1">Facturación anual proyectada</div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-semibold text-ink">{fmt(proj)} M€</span>
            <span className="font-display text-xl font-semibold text-potenciar">+{uplift.toFixed(0)}%</span>
          </div>
          <div className="text-sm text-ink-soft mt-1">
            desde {fmt(ACTUAL)} M€ · <b className="text-ink">+{fmt(total)} M€/año</b> de mejora potencial.
          </div>

          {/* Trayectoria proyectada (se redibuja al mover las palancas) */}
          <div className="mt-4">
            <EChart option={projChart} height={200} />
          </div>

          <div className="mt-2 pt-3 border-t border-line text-sm text-ink-soft">
            Cuota exportadora estimada: <b className="text-ink">{exportShare.toFixed(1)}%</b> (hoy ≈ 8%).
          </div>
        </div>
      </div>

      <p className="text-xs text-muted mt-5">
        Escenario ilustrativo basado en las cifras reales del histórico (no es una previsión del modelo). Las acciones y los mercados a desarrollar salen del análisis y del predictor de IA.
      </p>
    </div>
  );
}
