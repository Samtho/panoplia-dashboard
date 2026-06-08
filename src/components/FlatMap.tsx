import { useEffect, useMemo, useState } from "react";
import * as echarts from "echarts";
import EChart from "./EChart";
import { flatMapOption } from "../charts/options";
import { mercadosReal } from "../data/panoplia";

let registered = false;
const fmtEuro = (n: number) => Math.round(n).toLocaleString("es-ES");

export default function FlatMap() {
  const [ready, setReady] = useState(registered);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    if (registered) { setReady(true); return; }
    let cancel = false;
    import("../data/world.json").then((mod) => {
      if (cancel) return;
      echarts.registerMap("world", (mod.default ?? mod) as never);
      registered = true;
      setReady(true);
    });
    return () => { cancel = true; };
  }, []);

  const option = useMemo(() => (ready ? flatMapOption(focus) : {}), [ready, focus]);
  const exp = mercadosReal.filter((m) => m.iso !== "ES");
  const totalExport = exp.reduce((s, m) => s + m.ventasEuro, 0);
  const sel = focus ? exp.find((m) => m.iso === focus) : null;

  return (
    <div>
      {/* Filtro por mercado */}
      <div className="mx-auto max-w-6xl px-5 flex flex-wrap gap-2 mb-3">
        <button onClick={() => setFocus(null)}
          className={`rounded-full px-3 py-1 text-sm border transition-colors ${focus === null ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota"}`}>
          Todos
        </button>
        {exp.map((m) => (
          <button key={m.iso} onClick={() => setFocus(m.iso)}
            className={`rounded-full px-3 py-1 text-sm border transition-colors ${focus === m.iso ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota"}`}>
            {m.pais}
          </button>
        ))}
      </div>

      {/* Panel de cifras: € y los dos porcentajes, con su significado */}
      <div className="mx-auto max-w-6xl px-5 mb-2">
        {sel ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-line bg-card p-4">
              <div className="font-display text-2xl font-semibold text-terracota">{fmtEuro(sel.ventasEuro)} €</div>
              <div className="text-xs text-muted mt-1">Vendido a {sel.pais} en el periodo (cantidad de dinero)</div>
            </div>
            <div className="rounded-xl border border-line bg-card p-4">
              <div className="font-display text-2xl font-semibold text-ink">{sel.cuota.toFixed(2)}%</div>
              <div className="text-xs text-muted mt-1">de TODA la facturación de Panoplia (15,4 M€, España incluida)</div>
            </div>
            <div className="rounded-xl border border-line bg-card p-4">
              <div className="font-display text-2xl font-semibold text-ink">{((sel.ventasEuro / totalExport) * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted mt-1">de todo lo que se EXPORTA (1,26 M€, sin España)</div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-card p-4 text-sm text-ink-soft">
            <b className="text-ink">1,26 M€ exportados en total</b> (el 8,14% de la facturación; el otro 91,86% es España).
            De esa exportación, <b className="text-terracota">México concentra el 77%</b>. Filtra un país para ver su importe y sus dos porcentajes.
          </div>
        )}
      </div>

      {ready ? (
        <EChart option={option} height={540} />
      ) : (
        <div className="flex items-center justify-center text-sm text-muted" style={{ height: 540 }}>
          Cargando mapa…
        </div>
      )}
    </div>
  );
}
