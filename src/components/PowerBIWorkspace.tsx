import { useState } from "react";
import EChart from "./EChart";
import ExecutiveDashboard from "./ExecutiveDashboard";
import { execBarOption, execDonutOption, execPieOption } from "../charts/options";
import { mercadosReal } from "../data/panoplia";
import {
  kpis, topClientes, formaPagoVentas, facturasFormaAnio, subgeneroTop, topLibros, margenGenero, devolucionesGenero, segmentosPrecio,
} from "../data/bi";

const PAGES = ["Resumen ejecutivo", "Clientes y geografía", "Catálogo y géneros", "Rentabilidad", "Operaciones"] as const;
const base = import.meta.env.BASE_URL;
const COVER: { kw: string; file: string }[] = [
  { kw: "Truenos", file: "truenos.jpg" }, { kw: "Cristalinas", file: "caminar.webp" }, { kw: "Fiestas", file: "fiestas.jpg" },
  { kw: "Sadako", file: "sadako.jpg" }, { kw: "Georgia", file: "georgia.jpg" }, { kw: "Cerebro", file: "cerebro.jpg" },
  { kw: "Princesas", file: "princesas.jpg" }, { kw: "Pas", file: "quetepaso.jpg" }, { kw: "Adaptacion", file: "adaptacion.jpg" }, { kw: "Nocturnos", file: "enciclopedia.webp" },
];
const coverFor = (t: string) => COVER.find((c) => t.includes(c.kw))?.file;
const eur = (n: number) => Math.round(n).toLocaleString("es-ES");
const mm = (n: number) => `${(n / 1e6).toFixed(2).replace(".", ",")} M€`;
const paisName = (iso: string) => mercadosReal.find((m) => m.iso === iso)?.pais ?? iso;

function Kpi({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="font-display text-2xl font-semibold text-white">{v}</div>
      <div className="text-xs text-white/50 mt-0.5">{l}</div>
    </div>
  );
}
function Panel({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white p-4 ${wide ? "lg:col-span-2" : ""}`}>
      <h4 className="font-display font-semibold text-ink mb-2">{title}</h4>
      {children}
    </div>
  );
}

export default function PowerBIWorkspace({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState(0);

  return (
    <div className="min-h-screen bg-[#0e1a19] text-white">
      {/* Barra superior tipo herramienta BI */}
      <header className="sticky top-0 z-40 bg-[#0b1413] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-terracota grid place-items-center text-xs font-bold">▦</span>
            <span className="font-display font-semibold">Cuadro de mando · Panoplia</span>
            <span className="text-white/40 text-sm hidden md:inline">· distribuidora y exportadora · Grupo 4</span>
          </div>
          <button onClick={onExit} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm hover:bg-white/10 transition-colors">
            ← Volver a la presentación
          </button>
        </div>
        {/* Pestañas de página */}
        <div className="mx-auto max-w-7xl px-5 flex gap-1 overflow-x-auto no-scrollbar">
          {PAGES.map((p, i) => (
            <button key={p} onClick={() => setPage(i)}
              className={`shrink-0 px-4 py-2.5 text-sm border-b-2 transition-colors ${page === i ? "border-terracota text-white" : "border-transparent text-white/50 hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        {page === 0 && (
          <div className="rounded-2xl bg-paper p-5 text-ink">
            <ExecutiveDashboard />
          </div>
        )}

        {page === 1 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Kpi v={String(kpis.clientes)} l="Nº clientes activos" />
              <Kpi v={mm(kpis.ventasES)} l="Ventas España" />
              <Kpi v={mm(kpis.ventasExport)} l="Ventas exportación" />
              <Kpi v={`${kpis.pctExport}%`} l="% exportación" />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Panel title="Nacional vs exportación">
                <EChart option={execDonutOption(kpis.ventasES, kpis.ventasExport)} height={240} />
              </Panel>
              <Panel title="Ventas por forma de pago">
                <EChart option={execBarOption(formaPagoVentas.map((f) => ({ label: f.forma, v: f.ventas })), { horizontal: true, euros: true })} height={240} />
              </Panel>
              <Panel title="Top clientes (anonimizados)" wide>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-muted text-xs border-b border-line">
                      <th className="text-left py-1.5">Cliente</th><th className="text-left">País</th>
                      <th className="text-right">Ventas</th><th className="text-right">Unidades</th><th className="text-right">Dto.</th><th className="text-right">Facturas</th>
                    </tr></thead>
                    <tbody>
                      {topClientes.slice(0, 12).map((c) => (
                        <tr key={c.alias} className="border-b border-line last:border-0">
                          <td className="py-1.5 text-ink font-medium">{c.alias}</td>
                          <td className="text-ink-soft">{paisName(c.pais)}</td>
                          <td className="text-right text-ink">{eur(c.ventas)} €</td>
                          <td className="text-right text-ink-soft">{eur(c.uds)}</td>
                          <td className="text-right text-ink-soft">{c.dto}%</td>
                          <td className="text-right text-ink-soft">{c.fac}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </>
        )}

        {page === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Kpi v={eur(kpis.titulos)} l="Títulos con ventas" />
              <Kpi v={`${kpis.ventasPorTitulo.toLocaleString("es-ES")} €`} l="Ventas por título" />
              <Kpi v={`${kpis.descuentoMedio}%`} l="Descuento medio" />
              <Kpi v={mm(kpis.ventas)} l="Ventas netas" />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Panel title="Ventas netas por subgénero (top 12)">
                <EChart option={execBarOption(subgeneroTop.map((s) => ({ label: s.nombre, v: s.ventas })), { horizontal: true, euros: true })} height={340} />
              </Panel>
              <Panel title="Unidades por segmento de precio">
                <EChart option={execPieOption(segmentosPrecio.map((s) => ({ name: s.nombre, value: s.uds })))} height={340} />
              </Panel>
              <Panel title="Top 10 libros vendidos" wide>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-muted text-xs border-b border-line">
                      <th className="text-left py-1.5">Título</th><th className="text-left">Género</th><th className="text-right">Uds</th><th className="text-right">Ventas</th>
                    </tr></thead>
                    <tbody>
                      {topLibros.map((b, i) => {
                        const cover = coverFor(b.titulo);
                        return (
                        <tr key={`${b.titulo}-${i}`} className="border-b border-line last:border-0">
                          <td className="py-1.5 text-ink font-medium">
                            <span className="flex items-center gap-2">
                              {cover && <img src={`${base}covers/${cover}`} alt="" className="h-9 w-7 object-cover rounded shadow-sm shrink-0" loading="lazy" />}
                              <span className="line-clamp-2">{b.titulo}</span>
                            </span>
                          </td>
                          <td className="text-ink-soft">{b.genero}</td>
                          <td className="text-right text-ink">{eur(b.uds)}</td>
                          <td className="text-right text-ink-soft">{eur(b.ventas)} €</td>
                        </tr>
                      ); })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </>
        )}

        {page === 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Kpi v="71,2%" l="Margen bruto medio" />
              <Kpi v={`${kpis.descuentoMedio}%`} l="Descuento medio sobre PVP" />
              <Kpi v="≈11 M€" l="Margen bruto total" />
              <Kpi v="≈12,6 M€" l="Importe descuento" />
            </div>
            <div className="grid gap-4">
              <Panel title="Ventas por género" wide>
                <EChart option={execBarOption(margenGenero.map((g) => ({ label: g.genero, v: g.ventas })), { horizontal: true, euros: true })} height={320} />
              </Panel>
              <p className="text-xs text-white/40">
                El margen detallado por género no se reproduce: solo el 25% de las líneas registra coste, por lo que cualquier margen por segmento sería poco fiable. El margen global (71,2%) es la cifra canónica del análisis.
              </p>
            </div>
          </>
        )}

        {page === 4 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Kpi v={eur(kpis.facturas)} l="Nº facturas" />
              <Kpi v={eur(kpis.unidades)} l="Unidades vendidas" />
              <Kpi v="0,81%" l="Tasa devolución uds" />
              <Kpi v="2.440" l="Títulos con devoluciones" />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <Panel title="Devoluciones por género (nº títulos)">
                <EChart option={execBarOption(devolucionesGenero.map((d) => ({ label: d.genero, v: d.titulos })))} height={300} />
              </Panel>
              <Panel title="Facturas por forma de pago y año">
                {(() => {
                  const ffa = facturasFormaAnio as Record<string, Record<string, number>>;
                  const anios = Object.keys(ffa[Object.keys(ffa)[0]]);
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-muted text-xs border-b border-line">
                          <th className="text-left py-1.5">Forma de pago</th>
                          {anios.map((y) => <th key={y} className="text-right">{y}</th>)}
                        </tr></thead>
                        <tbody>
                          {Object.entries(ffa).map(([forma, byYear]) => (
                            <tr key={forma} className="border-b border-line last:border-0">
                              <td className="py-1.5 text-ink font-medium">{forma}</td>
                              {anios.map((y) => <td key={y} className="text-right text-ink-soft">{byYear[y]}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </Panel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
