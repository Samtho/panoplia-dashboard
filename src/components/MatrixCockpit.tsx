import { useMemo, useState, type ReactNode } from "react";
import EChart from "./EChart";
import { Verdict } from "./ui";
import { matrixHeatmapOption, sparklineOption, GENERO_ORDEN } from "../charts/options";
import { matriz, matrizMeta, mercadosReal, mercadoAnio, MERCADOS_ORDEN } from "../data/panoplia";

// Categorías de la matriz: etiqueta + color (tokens CSS de Tailwind)
const CAT: Record<string, { label: string; cls: string }> = {
  POTENCIAR: { label: "Potenciar", cls: "bg-potenciar" },
  MANTENER: { label: "Mantener", cls: "bg-mantener" },
  VIGILAR: { label: "Vigilar", cls: "bg-vigilar" },
  REDUCIR: { label: "Reducir", cls: "bg-reducir" },
  SIN_DATOS: { label: "Sin datos", cls: "bg-muted" },
};
const ANIOS = ["2021", "2022", "2023", "2024", "2025"];

type Celda = (typeof matriz)[number]["celdas"][number];

function getCell(genero: string, iso: string): Celda | undefined {
  return matriz.find((f) => f.genero === genero)?.celdas.find((c) => c.iso === iso);
}
function pais(iso: string): string {
  return mercadosReal.find((m) => m.iso === iso)?.pais ?? iso;
}

// Badge de categoría
function Badge({ cat }: { cat: string }) {
  const c = CAT[cat] ?? CAT.SIN_DATOS;
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white ${c.cls}`}>
      {c.label}
    </span>
  );
}

// Mercados con datos suficientes para rankings accionables (sin micro-mercados).
const MEANINGFUL = ["ES", "MX", "PE", "DE", "CL"];

export default function MatrixCockpit() {
  const [focus, setFocus] = useState<string | null>(null);
  const [sel, setSel] = useState<{ genero: string; iso: string } | null>(null);
  const [view, setView] = useState<"mapa" | "potenciar" | "reducir">("mapa");

  const option = useMemo(() => matrixHeatmapOption(focus), [focus]);

  function onChartClick(p: { value?: unknown }) {
    const v = p.value as [number, number, number] | undefined;
    if (!v || v.length < 2) return;
    const iso = MERCADOS_ORDEN[v[0]];
    const genero = GENERO_ORDEN[v[1]];
    if (!iso || !genero) return;
    setFocus(iso);
    setSel({ genero, iso });
  }

  const TabBtn = ({ v, children }: { v: typeof view; children: ReactNode }) => (
    <button
      onClick={() => setView(v)}
      className={`rounded-full px-3.5 py-1.5 text-sm border transition-colors ${
        view === v ? "bg-ink text-white border-ink" : "bg-card text-ink-soft border-line hover:border-ink"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      {/* Selector de vista */}
      <div className="flex flex-wrap gap-2 mb-5">
        <TabBtn v="mapa">Mapa de calor</TabBtn>
        <TabBtn v="potenciar">Top 10 a potenciar</TabBtn>
        <TabBtn v="reducir">Top 10 a reducir</TabBtn>
      </div>

      {view !== "mapa" ? (
        <Top10List kind={view} />
      ) : (
        <>
          {/* Selector de mercado */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Chip active={focus === null} onClick={() => { setFocus(null); setSel(null); }}>
              Todos
            </Chip>
            {mercadosReal.map((m) => (
              <Chip key={m.iso} active={focus === m.iso} onClick={() => { setFocus(m.iso); setSel(null); }}>
                {m.pais}
              </Chip>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <EChart option={option} height={430} onClick={onChartClick} />
              <p className="mt-2 text-xs text-muted">
                Haz clic en un mercado (arriba) o en una celda para ver el detalle. {matrizMeta.caveat}
              </p>
            </div>
            <div className="lg:col-span-2">
              {sel ? (
                <CellDetail genero={sel.genero} iso={sel.iso} onMarket={() => setSel(null)} onClear={() => { setSel(null); setFocus(null); }} />
              ) : focus ? (
                <MarketPanel iso={focus} />
              ) : (
                <OverallPanel />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Bandera emoji a partir del ISO (placeholder visual de país).
const flag = (iso: string) => iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
const coverBase = import.meta.env.BASE_URL;

// Miniatura de país: usa /public/paises/{iso}.png si existe; si no, placeholder con bandera.
function CountryThumb({ iso }: { iso: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="h-16 w-16 shrink-0 rounded-xl border border-line bg-card overflow-hidden grid place-items-center">
      {!err ? (
        <img src={`${coverBase}paises/${iso}.png`} alt={pais(iso)} onError={() => setErr(true)} className="h-full w-full object-cover" />
      ) : (
        <span className="text-3xl" title="Añade /public/paises/{iso}.png">{flag(iso)}</span>
      )}
    </div>
  );
}

// ---------- Top a potenciar / reducir, AGRUPADO por país (con miniatura) ----------
function Top10List({ kind }: { kind: "potenciar" | "reducir" }) {
  // Para cada país con datos, sus géneros ordenados; top (potenciar) o cola (reducir).
  const grupos = MEANINGFUL.map((iso) => {
    const celdas = matriz
      .map((f) => ({ genero: f.genero, ...f.celdas.find((c) => c.iso === iso)! }))
      .filter((c) => c.score !== null && c.ventas > 0)
      .map((c) => ({ genero: c.genero, score: c.score as number, cat: c.cat, ventas: c.ventas }));
    const ord = kind === "potenciar" ? celdas.sort((a, b) => b.score - a.score) : celdas.sort((a, b) => a.score - b.score);
    return { iso, top: ord.slice(0, 4), best: ord[0]?.score ?? 0 };
  }).filter((g) => g.top.length);
  grupos.sort((a, b) => (kind === "potenciar" ? b.best - a.best : a.best - b.best));

  const intro = kind === "potenciar"
    ? "Por mercado, los géneros con mejor trayectoria y cuota relativa: dónde reforzar primero el catálogo."
    : "Por mercado, los géneros con peor señal: candidatos a revisar o reducir presencia.";

  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-5">
      <p className="text-sm text-ink-soft mb-4">{intro} <span className="text-muted">Solo mercados con datos suficientes.</span></p>
      <div className="grid md:grid-cols-2 gap-4">
        {grupos.map((g) => (
          <div key={g.iso} className="rounded-xl border border-line bg-card p-4 flex gap-4">
            <CountryThumb iso={g.iso} />
            <div className="min-w-0 flex-1">
              <h5 className="font-display font-semibold text-ink mb-2">{pais(g.iso)}</h5>
              <ul className="space-y-1.5">
                {g.top.map((c, i) => (
                  <li key={c.genero} className="flex items-center gap-2 text-sm">
                    <span className="text-muted w-4 text-right">{i + 1}</span>
                    <span className="flex-1 text-ink truncate">{c.genero}</span>
                    <span className="font-display font-semibold text-ink tabular-nums">{c.score.toFixed(2)}</span>
                    <Badge cat={c.cat} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
        active
          ? "bg-terracota text-white border-terracota"
          : "bg-paper-soft text-ink-soft border-line hover:border-terracota"
      }`}
    >
      {children}
    </button>
  );
}

// ---------- Panel: visión global (sin foco) ----------
function OverallPanel() {
  const ranking = GENERO_ORDEN.map((g) => {
    const scores = matriz.find((f) => f.genero === g)!.celdas
      .map((c) => c.score).filter((s): s is number => s !== null);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { genero: g, avg };
  });
  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-5 h-full">
      <h4 className="font-display text-lg font-semibold mb-1">Visión global</h4>
      <p className="text-sm text-ink-soft mb-4">Géneros por score medio entre los 12 mercados.</p>
      <ul className="space-y-2 mb-4">
        {ranking.map((r, i) => (
          <li key={r.genero} className="flex items-center gap-3 text-sm">
            <span className="text-muted w-4 text-right">{i + 1}</span>
            <span className="flex-1 text-ink">{r.genero}</span>
            <span className="font-display font-semibold text-ink">{r.avg.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <Verdict tone="oportunidad">{matrizMeta.veredicto}</Verdict>
      <p className="mt-3 text-xs text-muted">Elige un mercado arriba para ver dónde invertir.</p>
    </div>
  );
}

// ---------- Panel: foco en un mercado ----------
function MarketPanel({ iso }: { iso: string }) {
  const m = mercadosReal.find((x) => x.iso === iso)!;
  const trend = mercadoAnio[iso] ?? {};
  const trendVals = ANIOS.map((y) => Math.round(trend[y] ?? 0));
  const firstNz = trendVals.find((v) => v > 0) ?? 0;
  const lastNz = [...trendVals].reverse().find((v) => v > 0) ?? 0;
  const delta = firstNz > 0 ? Math.round((lastNz / firstNz - 1) * 100) : null;

  // celdas del mercado ordenadas por score
  const filas = GENERO_ORDEN
    .map((g) => ({ genero: g, celda: getCell(g, iso) }))
    .filter((r) => r.celda && r.celda.score !== null)
    .sort((a, b) => (b.celda!.score ?? 0) - (a.celda!.score ?? 0));

  const potenciar = filas.filter((r) => r.celda!.cat === "POTENCIAR").map((r) => r.genero);
  const debiles = filas.filter((r) => r.celda!.cat === "REDUCIR" || r.celda!.cat === "VIGILAR").map((r) => r.genero);
  const top = filas[0];

  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-5 h-full">
      <div className="flex items-baseline justify-between mb-1">
        <h4 className="font-display text-lg font-semibold">{m.pais}</h4>
        <span className="text-sm text-muted">{m.cuota}% del total</span>
      </div>
      <p className="text-sm text-ink-soft mb-2">
        {Math.round(m.ventasEuro).toLocaleString("es-ES")} € en el periodo
        {delta !== null && (
          <span className={delta >= 0 ? "text-potenciar" : "text-reducir"}>
            {" · "}{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% (2021-2025)
          </span>
        )}
      </p>
      <EChart option={sparklineOption(trendVals)} height={70} />

      <p className="text-terracota font-semibold text-xs tracking-wide uppercase mt-4 mb-2">
        Prioridades de catálogo
      </p>
      <ul className="space-y-1.5 mb-4">
        {filas.slice(0, 6).map((r) => (
          <li key={r.genero} className="flex items-center gap-2 text-sm">
            <span className="flex-1 text-ink">{r.genero}</span>
            <span className="font-display font-semibold text-ink tabular-nums">{r.celda!.score!.toFixed(2)}</span>
            <Badge cat={r.celda!.cat} />
          </li>
        ))}
      </ul>

      <Verdict tone={potenciar.length ? "oportunidad" : "neutro"}>
        {potenciar.length > 0
          ? `Potenciar en ${m.pais}: ${potenciar.join(", ")}.`
          : `En ${m.pais} ningún cruce llega a "Potenciar"; el de mejor trayectoria es ${top?.genero} (${top?.celda!.score!.toFixed(2)}).`}
        {debiles.length > 0 && ` Vigilar o reducir: ${debiles.slice(0, 3).join(", ")}.`}
      </Verdict>
    </div>
  );
}

// ---------- Panel: detalle de una celda ----------
function CellDetail({ genero, iso, onMarket, onClear }: {
  genero: string; iso: string; onMarket: () => void; onClear: () => void;
}) {
  const celda = getCell(genero, iso);
  if (!celda || celda.score === null) {
    return (
      <div className="rounded-2xl border border-line bg-paper-soft p-5 h-full">
        <h4 className="font-display text-lg font-semibold">{genero} · {pais(iso)}</h4>
        <p className="text-sm text-ink-soft mt-2">Sin actividad registrada en este cruce.</p>
        <button onClick={onClear} className="mt-4 text-sm text-terracota hover:underline">← Volver</button>
      </div>
    );
  }
  const serie = celda.serie;
  const firstNz = serie.find((v) => v > 0) ?? 0;
  const last = serie[serie.length - 1];
  const delta = firstNz > 0 ? Math.round((last / firstNz - 1) * 100) : null;
  return (
    <div className="rounded-2xl border border-line bg-paper-soft p-5 h-full">
      <p className="text-xs text-muted uppercase tracking-wide">{pais(iso)}</p>
      <h4 className="font-display text-lg font-semibold mb-3">{genero}</h4>
      <div className="flex items-center gap-4 mb-3">
        <div>
          <div className="font-display text-4xl font-semibold text-ink">{celda.score.toFixed(2)}</div>
          <div className="text-xs text-muted">score</div>
        </div>
        <Badge cat={celda.cat} />
      </div>
      <div className="text-sm text-ink-soft mb-1">
        {Math.round(celda.ventas).toLocaleString("es-ES")} € en el periodo
        {delta !== null && (
          <span className={delta >= 0 ? "text-potenciar" : "text-reducir"}>
            {" · "}{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% (2021-2025)
          </span>
        )}
      </div>
      <EChart option={sparklineOption(serie)} height={80} />
      <div className="mt-4 flex gap-4 text-sm">
        <button onClick={onMarket} className="text-terracota hover:underline">Ver {pais(iso)} completo</button>
        <button onClick={onClear} className="text-muted hover:underline">Quitar selección</button>
      </div>
    </div>
  );
}
