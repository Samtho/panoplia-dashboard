import { useState } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";
import EChart from "./EChart";
import { benchmarkOption } from "../charts/options";
import { benchmark } from "../data/benchmark";
import { modelMetrics, modelMeta } from "../data/model";
import { codigoPredictor, codigoBenchmark, codigoCubo } from "../data/anexos";
import { operatingPoints, operatingCurve, operatingBase } from "../data/operating";
import DataModelDiagram from "./DataModelDiagram";

hljs.registerLanguage("python", python);

const PAGES = ["Cómo se hizo", "Modelo de datos", "Código de los modelos", "Resultados", "Decisión por objetivo"] as const;
const TONE: Record<string, string> = { potenciar: "#3cbd8e", vigilar: "#e6b53e", reducir: "#e87363" };

// Franja de contexto de negocio (enfoque decisión + técnica).
function ParaElNegocio({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-terracota/25 bg-terracota/[0.07] px-4 py-3 mb-6">
      <span className="text-terracota text-lg leading-none mt-0.5">◎</span>
      <p className="text-sm text-white/75 leading-relaxed"><b className="text-terracota">Para la decisión —</b> {children}</p>
    </div>
  );
}

function PageHead({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-display text-2xl font-semibold tracking-tight">{titulo}</h3>
      <p className="text-sm text-white/55 mt-1 max-w-3xl">{sub}</p>
    </div>
  );
}

// Bloque de código tipo editor: cabecera de archivo, resaltado y numeración.
function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const clean = code.replace(/\s+$/, "");
  const lines = clean.split("\n");
  const html = hljs.highlight(clean, { language: "python" }).value;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(clean); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1110] border-b border-white/10">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        <span className="text-xs text-white/70 font-mono ml-2">{filename}</span>
        <span className="text-[10px] uppercase tracking-wide text-terracota ml-1 px-1.5 py-0.5 rounded bg-terracota/15">Python</span>
        <span className="text-[10px] text-white/30 ml-auto hidden sm:inline">{lines.length} líneas</span>
        <button onClick={copy} className="text-[11px] text-white/55 hover:text-white border border-white/15 rounded px-2 py-0.5 ml-2 transition-colors">{copied ? "✓ copiado" : "copiar"}</button>
      </div>
      <div className="flex overflow-auto max-h-[64vh] bg-[#0b1413] text-[12.5px] leading-[1.65] font-mono">
        <pre className="text-white/25 text-right pl-3 pr-3 py-3 select-none shrink-0">{lines.map((_, i) => i + 1).join("\n")}</pre>
        <pre className="py-3 pr-5 whitespace-pre"><code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    </div>
  );
}

const CODES = [
  { id: "pred", tab: "Predictor", filename: "04_train_model.py", code: codigoPredictor, desc: "Entrena el modelo de éxito comercial (Gradient Boosting) y exporta la rejilla de predicción que usa la web." },
  { id: "bench", tab: "Benchmark", filename: "05_benchmark_modelos.py", code: codigoBenchmark, desc: "Compara 11 algoritmos sobre el mismo problema (ROC-AUC) para justificar la elección." },
  { id: "ana", tab: "Análisis", filename: "02_calculo_web.py", code: codigoCubo, desc: "Calcula la serie mensual, los 108 scores de la matriz y la curva long tail." },
];

// Gráfico del compromiso cobertura/precisión según el umbral.
function operatingChartOption() {
  const axis = { axisLine: { lineStyle: { color: "#3a4744" } }, axisLabel: { color: "#9fb0ac" }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } } };
  return {
    grid: { left: 44, right: 16, top: 36, bottom: 40 },
    tooltip: { trigger: "axis", valueFormatter: (v: number) => `${Math.round(v * 100)}%` },
    legend: { top: 0, textStyle: { color: "#c7d2cf" }, data: ["Cobertura (recall)", "Aciertan (precisión)"] },
    xAxis: { type: "value", min: 0.15, max: 0.7, name: "Umbral de decisión", nameLocation: "middle", nameGap: 26, nameTextStyle: { color: "#9fb0ac" }, ...axis },
    yAxis: { type: "value", min: 0, max: 1, axisLabel: { color: "#9fb0ac", formatter: (v: number) => `${Math.round(v * 100)}%` }, splitLine: axis.splitLine },
    series: [
      { name: "Cobertura (recall)", type: "line", smooth: true, symbol: "none", color: "#5fb0ff", lineStyle: { width: 3, color: "#5fb0ff" }, data: operatingCurve.map((c) => [c.t, c.recall]) },
      { name: "Aciertan (precisión)", type: "line", smooth: true, symbol: "none", color: "#2bc4b6", lineStyle: { width: 3, color: "#2bc4b6" }, data: operatingCurve.map((c) => [c.t, c.precision]),
        markLine: { silent: true, symbol: "none", label: { color: "#c7d2cf", fontSize: 10, formatter: (p: any) => p.name },
          data: operatingPoints.map((o) => ({ xAxis: o.t, name: o.label, lineStyle: { color: TONE[o.color], type: "dashed", width: 1.5 } })) } },
    ],
  };
}

export default function AnexosWorkspace({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState(0);
  const [codeTab, setCodeTab] = useState("pred");
  const bench = benchmarkOption(benchmark);
  const activeCode = CODES.find((c) => c.id === codeTab)!;

  return (
    <div className="min-h-screen bg-[#0b1211] text-white">
      <header className="sticky top-0 z-40 bg-[#0a100f]/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-terracota to-[#0b6f68] grid place-items-center text-xs font-bold">{"</>"}</span>
            <span className="font-display font-semibold">Anexos técnicos</span>
            <span className="text-white/35 text-sm hidden md:inline">· Panoplia · Grupo 4</span>
          </div>
          <button onClick={onExit} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm hover:bg-white/10 transition-colors">← Volver a la presentación</button>
        </div>
        <div className="mx-auto max-w-7xl px-5 flex gap-1 overflow-x-auto no-scrollbar">
          {PAGES.map((p, i) => (
            <button key={p} onClick={() => setPage(i)}
              className={`shrink-0 px-4 py-2.5 text-sm border-b-2 transition-colors ${page === i ? "border-terracota text-white" : "border-transparent text-white/45 hover:text-white"}`}>
              {p}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7">
        {/* ---------- 0 · Cómo y dónde se hizo ---------- */}
        {page === 0 && (
          <div>
            <PageHead titulo="Cómo y dónde se hizo" sub="La trazabilidad completa: con qué se construyó, dónde se entrenó y cómo llega al cuadro de mando." />
            <ParaElNegocio>todo el análisis es <b className="text-white">reproducible y sin coste de licencias</b>: Panoplia puede repetirlo con datos nuevos. No depende de ninguna caja negra.</ParaElNegocio>

            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h4 className="font-display font-semibold mb-3">El flujo, de Excel a decisión</h4>
                <ol className="space-y-3">
                  {[
                    ["1", "Datos en bruto", "10 hojas de Excel de facturación (372.979 registros)."],
                    ["2", "Limpieza y modelado", "Python (pandas): normalización, reconstrucción del catálogo y modelo en estrella (PostgreSQL)."],
                    ["3", "Modelos de ML", "scikit-learn: gradient boosting + benchmark de 11 modelos. Entrenamiento local, semilla fija, validación 80/20."],
                    ["4", "Resultados a la web", "Las predicciones se precalculan y se incrustan; el cuadro de mando solo consulta (instantáneo, estático)."],
                  ].map(([n, t, d]) => (
                    <li key={n} className="flex gap-3">
                      <span className="shrink-0 h-7 w-7 rounded-full bg-terracota/15 text-terracota grid place-items-center text-sm font-semibold">{n}</span>
                      <div><div className="text-sm font-medium">{t}</div><div className="text-xs text-white/55 leading-snug">{d}</div></div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <h4 className="font-display font-semibold mb-2">Entorno técnico</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Python 3", "pandas · numpy", "scikit-learn", "PostgreSQL", "Power BI · DAX", "ECharts (web)"].map((t) => (
                      <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <h4 className="font-display font-semibold mb-2">¿Dónde "viven" los modelos?</h4>
                  <p className="text-sm text-white/65 leading-relaxed">
                    Se entrenaron <b className="text-white">en local</b> con scripts versionados (no hay un servidor de modelo en producción). Sus resultados se exportan a la web estática alojada en <b className="text-white">GitHub Pages</b>. La arquitectura <b className="text-white">cloud en Azure</b> (Blob + PostgreSQL + Data Factory) es la <b className="text-white">propuesta de futuro</b> para institucionalizarlo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- 1 · Modelo de datos ---------- */}
        {page === 1 && (
          <div>
            <PageHead titulo="Modelo de datos relacional (PostgreSQL · estrella)" sub="Una tabla de hechos (cada línea de factura) rodeada de dimensiones que la describen. Reconstruido desde 10 hojas de Excel." />
            <ParaElNegocio>un modelo único y consultable sustituye al Excel disperso: es la base para que cualquier pregunta de negocio tenga una respuesta trazable.</ParaElNegocio>
            <div className="flex flex-wrap gap-4 mb-6 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-terracota" /> Tabla de hechos</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-white/40" /> Dimensión</span>
              <span>PK = clave primaria · las líneas turquesa son las relaciones</span>
            </div>
            <DataModelDiagram />
            <h4 className="font-display font-semibold mb-2 mt-8">Métricas DAX (Power BI)</h4>
            <div className="flex flex-wrap gap-2">
              {["Ventas Netas", "Variación YoY", "Ventas YTD", "Margen %", "Descuento Medio %", "Ticket Medio", "Uds por Factura", "RFM (R/F/M)", "% Export", "Score género×mercado"].map((m) => (
                <span key={m} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* ---------- 2 · Código ---------- */}
        {page === 2 && (
          <div>
            <PageHead titulo="Código de los modelos" sub="Los scripts reales del análisis, abiertos y comentados. Cambia de archivo arriba." />
            <ParaElNegocio>nada es una caja negra: cada decisión del modelo nace de este código, auditable y repetible.</ParaElNegocio>
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 mb-4">
              {CODES.map((c) => (
                <button key={c.id} onClick={() => setCodeTab(c.id)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${codeTab === c.id ? "bg-terracota text-white" : "text-white/60 hover:text-white"}`}>
                  {c.tab}
                </button>
              ))}
            </div>
            <p className="text-sm text-white/55 mb-4 max-w-3xl">{activeCode.desc}</p>
            <CodeBlock code={activeCode.code} filename={activeCode.filename} />
          </div>
        )}

        {/* ---------- 3 · Resultados ---------- */}
        {page === 3 && (
          <div>
            <PageHead titulo="Resultados del modelo" sub={`Validación ciega 80/20 sobre ${modelMeta.nFilas.toLocaleString("es-ES")} pares título-mercado.`} />
            <ParaElNegocio>el modelo acierta más que el azar de forma medible (AUC 0,636) y, sobre todo, dice <b className="text-white">por qué</b>: el precio y el mercado mandan sobre la identidad del título.</ParaElNegocio>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { v: modelMetrics.auc, l: "ROC-AUC" }, { v: modelMetrics.accuracy, l: "Accuracy" },
                { v: modelMetrics.precision, l: "Precision" }, { v: modelMetrics.recall, l: "Recall" }, { v: modelMetrics.f1, l: "F1" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div className="font-display text-2xl font-semibold">{s.v.toFixed(3).replace(".", ",")}</div>
                  <div className="text-xs text-white/45 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <h4 className="font-display font-semibold text-ink mb-2">Benchmark · ROC-AUC por familia</h4>
                <EChart option={bench} height={250} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <h4 className="font-display font-semibold text-ink mb-3">Matriz de confusión (test)</h4>
                <table className="w-full text-sm text-center">
                  <tbody>
                    <tr><td></td><td className="text-muted text-xs pb-1">Pred. fracaso</td><td className="text-muted text-xs pb-1">Pred. éxito</td></tr>
                    <tr><td className="text-muted text-xs pr-2 text-right">Real fracaso</td><td className="border border-line py-3 font-display text-lg text-potenciar">{modelMetrics.confusion[0][0].toLocaleString("es-ES")}</td><td className="border border-line py-3 font-display text-lg text-reducir">{modelMetrics.confusion[0][1].toLocaleString("es-ES")}</td></tr>
                    <tr><td className="text-muted text-xs pr-2 text-right">Real éxito</td><td className="border border-line py-3 font-display text-lg text-reducir">{modelMetrics.confusion[1][0].toLocaleString("es-ES")}</td><td className="border border-line py-3 font-display text-lg text-potenciar">{modelMetrics.confusion[1][1].toLocaleString("es-ES")}</td></tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted mt-3">Umbral operativo (Youden): {modelMetrics.threshold}. Falsos positivos = sobreinversión; falsos negativos = oportunidad perdida.</p>
              </div>
            </div>
          </div>
        )}

        {/* ---------- 4 · Decisión por objetivo (puntos de operación) ---------- */}
        {page === 4 && (
          <div>
            <PageHead titulo="Un modelo, tres decisiones" sub="El mismo modelo sirve a objetivos distintos según dónde pongas el umbral. No es que uno esté mal: depende de lo que Panoplia quiera priorizar." />
            <ParaElNegocio>¿prefieres <b className="text-white">no perderte ningún superventas</b> (y asumir más riesgo de stock) o <b className="text-white">apostar solo a lo seguro</b> (y dejar pasar oportunidades)? El modelo se adapta a esa decisión.</ParaElNegocio>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {operatingPoints.map((o) => (
                <div key={o.key} className="rounded-2xl border bg-white/[0.025] p-5" style={{ borderColor: `${TONE[o.color]}55` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: TONE[o.color] }} />
                    <h4 className="font-display text-lg font-semibold">{o.label}</h4>
                  </div>
                  <p className="text-xs text-white/55 mb-4">{o.objetivo}</p>
                  <div className="space-y-2.5">
                    <Stat v={`${Math.round(o.recall * 100)}%`} l="de los superventas, capturados" tone={TONE[o.color]} />
                    <Stat v={`${Math.round(o.precision * 100)}%`} l="de las apuestas, aciertan" tone={TONE[o.color]} />
                    <Stat v={o.apuestas.toLocaleString("es-ES")} l={`apuestas de ${operatingBase.nTest.toLocaleString("es-ES")} casos`} tone={TONE[o.color]} />
                  </div>
                  <div className="text-[11px] text-white/40 mt-4 pt-3 border-t border-white/10">umbral de decisión: {String(o.t).replace(".", ",")}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-card p-4">
              <h4 className="font-display font-semibold text-ink mb-1">El compromiso, en una curva</h4>
              <p className="text-sm text-ink-soft mb-2">Al subir el umbral, suben los aciertos por apuesta (precisión) pero baja la cobertura. Las líneas marcan las tres decisiones.</p>
              <EChart option={operatingChartOption()} height={300} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ v, l, tone }: { v: string; l: string; tone: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-2xl font-semibold" style={{ color: tone }}>{v}</span>
      <span className="text-xs text-white/55 leading-tight">{l}</span>
    </div>
  );
}
