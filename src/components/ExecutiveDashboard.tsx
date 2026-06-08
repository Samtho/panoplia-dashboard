import { useMemo, useState } from "react";
import EChart from "./EChart";
import { execMonthlyOption, execBarOption, execDonutOption } from "../charts/options";
import { cubo, cuboMes } from "../data/cubo";
import { mercadosReal } from "../data/panoplia";

const GEN: Record<number, string> = {
  1: "Arte y Humanidades", 2: "Autoayuda", 3: "Ciencia y Tecnología", 4: "Ciencias Sociales",
  5: "Historia y Pensamiento", 6: "Infantil y Juvenil", 7: "Literatura", 8: "Poesía y Teatro", 9: "Religión y Espiritualidad",
};
const PAIS: Record<string, string> = Object.fromEntries(mercadosReal.map((m) => [m.iso, m.pais]));
const ANIOS = [2021, 2022, 2023, 2024, 2025, 2026];
const eur = (n: number) => n.toLocaleString("es-ES");

function useToggleSet<T>() {
  const [set, setSet] = useState<Set<T>>(new Set());
  const toggle = (v: T) => setSet((s) => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; });
  return [set, toggle, () => setSet(new Set())] as const;
}

function FilterGroup<T extends string | number>({ title, options, sel, onToggle, label }: {
  title: string; options: T[]; sel: Set<T>; onToggle: (v: T) => void; label: (v: T) => string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">{title}</p>
      <div className="space-y-1">
        {options.map((o) => (
          <label key={String(o)} className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer hover:text-ink">
            <input type="checkbox" checked={sel.has(o)} onChange={() => onToggle(o)} className="accent-terracota" />
            {label(o)}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveDashboard() {
  const [years, toggleYear, clearYears] = useToggleSet<number>();
  const [gens, toggleGen, clearGens] = useToggleSet<number>();
  const [paises, togglePais, clearPaises] = useToggleSet<string>();
  const anyFilter = years.size || gens.size || paises.size;

  const fAnual = useMemo(() => cubo.filter((r) =>
    (!years.size || years.has(r.a)) && (!gens.size || gens.has(r.g)) && (!paises.size || paises.has(r.p))), [years, gens, paises]);
  const fMes = useMemo(() => cuboMes.filter((r) =>
    (!years.size || years.has(Number(r.m.slice(0, 4)))) && (!gens.size || gens.has(r.g)) && (!paises.size || paises.has(r.p))), [years, gens, paises]);

  // KPIs
  const ventas = fAnual.reduce((s, r) => s + r.v, 0);
  const unidades = fAnual.reduce((s, r) => s + r.u, 0);
  const precioMedio = unidades ? ventas / unidades : 0;
  const ventasES = fAnual.filter((r) => r.p === "ES").reduce((s, r) => s + r.v, 0);
  const pctExport = ventas ? (100 * (ventas - ventasES)) / ventas : 0;

  // Charts (agregaciones)
  const monthly = useMemo(() => {
    const m: Record<string, number> = {};
    fMes.forEach((r) => (m[r.m] = (m[r.m] || 0) + r.v));
    return execMonthlyOption(Object.keys(m).sort().map((k) => ({ mes: k, v: m[k] })));
  }, [fMes]);
  const byYear = useMemo(() => {
    const m: Record<number, number> = {};
    fAnual.forEach((r) => (m[r.a] = (m[r.a] || 0) + r.v));
    return execBarOption(ANIOS.filter((a) => m[a]).map((a) => ({ label: String(a), v: m[a] })), { euros: true });
  }, [fAnual]);
  const byGenre = useMemo(() => {
    const m: Record<number, number> = {};
    fAnual.forEach((r) => (m[r.g] = (m[r.g] || 0) + r.v));
    const arr = Object.keys(m).map((g) => ({ label: GEN[Number(g)], v: m[Number(g)] })).sort((a, b) => b.v - a.v);
    return execBarOption(arr, { horizontal: true, euros: true });
  }, [fAnual]);
  const donut = useMemo(() => execDonutOption(ventasES, ventas - ventasES), [ventasES, ventas]);

  return (
    <div className="grid lg:grid-cols-[210px_1fr] gap-6">
      {/* Rail de filtros (izquierda, patrón F) */}
      <aside className="rounded-2xl border border-line bg-paper-soft p-5 h-max lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-semibold text-ink">Filtros</span>
          {anyFilter ? (
            <button onClick={() => { clearYears(); clearGens(); clearPaises(); }} className="text-xs text-terracota hover:underline">Limpiar</button>
          ) : null}
        </div>
        <FilterGroup title="Año" options={ANIOS} sel={years} onToggle={toggleYear} label={(v) => String(v)} />
        <FilterGroup title="Género" options={Object.keys(GEN).map(Number)} sel={gens} onToggle={toggleGen} label={(v) => GEN[v]} />
        <FilterGroup title="País" options={mercadosReal.map((m) => m.iso)} sel={paises} onToggle={togglePais} label={(v) => PAIS[v]} />
      </aside>

      {/* Centro: KPIs arriba + gráficos */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { v: `${(ventas / 1e6).toFixed(2).replace(".", ",")} M€`, l: "Ventas netas" },
            { v: eur(unidades), l: "Unidades vendidas" },
            { v: `${precioMedio.toFixed(2).replace(".", ",")} €`, l: "Precio medio / ud." },
            { v: `${pctExport.toFixed(1).replace(".", ",")}%`, l: "Exportación" },
          ].map((k) => (
            <div key={k.l} className="rounded-xl border border-line bg-card p-4">
              <div className="font-display text-2xl font-semibold text-ink">{k.v}</div>
              <div className="text-xs text-muted mt-1">{k.l}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line bg-card p-4 lg:col-span-2">
            <h4 className="font-display font-semibold text-ink mb-1">Evolución mensual de ventas</h4>
            <EChart option={monthly} height={220} />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <h4 className="font-display font-semibold text-ink mb-1">Ventas por año</h4>
            <EChart option={byYear} height={240} />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4">
            <h4 className="font-display font-semibold text-ink mb-1">Nacional vs exportación</h4>
            <EChart option={donut} height={240} />
          </div>
          <div className="rounded-2xl border border-line bg-card p-4 lg:col-span-2">
            <h4 className="font-display font-semibold text-ink mb-1">Ventas por género</h4>
            <EChart option={byGenre} height={300} />
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          Réplica nativa del cuadro de Power BI del equipo (mismos datos, filtros cruzados). Marca años, géneros o países a la izquierda y todo se recalcula.
        </p>
      </div>
    </div>
  );
}
