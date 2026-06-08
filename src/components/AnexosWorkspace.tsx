import { useState } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";
import EChart from "./EChart";
import { benchmarkOption } from "../charts/options";
import { benchmark } from "../data/benchmark";
import { modelMetrics, modelMeta } from "../data/model";
import { codigoPredictor, codigoBenchmark, codigoCubo } from "../data/anexos";
import DataModelDiagram from "./DataModelDiagram";

hljs.registerLanguage("python", python);

const PAGES = ["Modelo de datos", "Código · Predictor", "Código · Benchmark", "Código · Análisis", "Resultados"] as const;

// Bloque de código tipo editor: cabecera de archivo, resaltado de sintaxis y numeración.
function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const clean = code.replace(/\s+$/, "");
  const lines = clean.split("\n");
  const html = hljs.highlight(clean, { language: "python" }).value;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(clean); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1110] border-b border-white/10">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </span>
        <span className="text-xs text-white/70 font-mono ml-2">{filename}</span>
        <span className="text-[10px] uppercase tracking-wide text-terracota ml-1 px-1.5 py-0.5 rounded bg-terracota/15">Python</span>
        <span className="text-[10px] text-white/30 ml-auto hidden sm:inline">{lines.length} líneas</span>
        <button onClick={copy} className="text-[11px] text-white/55 hover:text-white border border-white/15 rounded px-2 py-0.5 ml-2">{copied ? "✓ copiado" : "copiar"}</button>
      </div>
      <div className="flex overflow-auto max-h-[66vh] bg-[#0b1413] text-[12.5px] leading-[1.65] font-mono">
        <pre className="text-white/25 text-right pl-3 pr-3 py-3 select-none shrink-0">{lines.map((_, i) => i + 1).join("\n")}</pre>
        <pre className="py-3 pr-5 whitespace-pre"><code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    </div>
  );
}

// Página de código: resumen ("qué hace") + puntos clave + el código.
function CodePage({ titulo, descripcion, puntos, filename, code }: {
  titulo: string; descripcion: string; puntos: { k: string; v: string }[]; filename: string; code: string;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold mb-1">{titulo}</h3>
      <p className="text-sm text-white/60 mb-4 max-w-3xl">{descripcion}</p>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        {puntos.map((p) => (
          <div key={p.k} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="text-[11px] uppercase tracking-wide text-terracota font-semibold mb-0.5">{p.k}</div>
            <div className="text-sm text-white/75 leading-snug">{p.v}</div>
          </div>
        ))}
      </div>
      <CodeBlock code={code} filename={filename} />
    </div>
  );
}

export default function AnexosWorkspace({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState(0);
  const bench = benchmarkOption(benchmark);

  return (
    <div className="min-h-screen bg-[#0e1a19] text-white">
      <header className="sticky top-0 z-40 bg-[#0b1413] border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-terracota grid place-items-center text-xs font-bold">{"</>"}</span>
            <span className="font-display font-semibold">Anexos técnicos · Panoplia</span>
            <span className="text-white/40 text-sm hidden md:inline">· base de datos, modelos y resultados · Grupo 4</span>
          </div>
          <button onClick={onExit} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm hover:bg-white/10 transition-colors">← Volver a la presentación</button>
        </div>
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
          <div>
            <h3 className="font-display text-xl font-semibold mb-1">Modelo de datos relacional (PostgreSQL · estrella)</h3>
            <p className="text-sm text-white/60 mb-2">
              Una tabla de <b className="text-white">hechos</b> en el centro (cada línea de factura) rodeada de tablas de <b className="text-white">dimensión</b> que la describen (cliente, libro, fecha, género…). Reconstruido y normalizado desde 10 hojas de Excel originales.
            </p>
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

        {page === 1 && (
          <CodePage
            titulo="Modelo predictivo · Gradient Boosting (familia XGBoost)"
            descripcion="Entrena el modelo que estima la probabilidad de éxito de un título por mercado: define el objetivo (vender ≥ 8 uds), prepara las variables, entrena, evalúa y exporta la rejilla de predicción que usa la web."
            puntos={[
              { k: "Algoritmo", v: "Gradient Boosting (HistGradientBoosting de scikit-learn)" },
              { k: "Entrada", v: "Subgénero, mercado, trimestre y precio" },
              { k: "Salida", v: "Métricas (AUC), importancias y rejilla de predicción" },
            ]}
            filename="04_train_model.py" code={codigoPredictor} />
        )}
        {page === 2 && (
          <CodePage
            titulo="Benchmark de 11 modelos"
            descripcion="Entrena 11 algoritmos de todas las familias del temario sobre el mismo problema y los compara por ROC-AUC, para justificar con evidencia la elección del modelo final."
            puntos={[
              { k: "Modelos", v: "11 familias: lineal, árboles, bagging, boosting, red neuronal" },
              { k: "Métrica", v: "ROC-AUC sobre el conjunto de test" },
              { k: "Ganador", v: "Gradient Boosting (0,645); ninguna otra familia lo supera" },
            ]}
            filename="05_benchmark_modelos.py" code={codigoBenchmark} />
        )}
        {page === 3 && (
          <CodePage
            titulo="Análisis: series, matriz de scoring y long tail"
            descripcion="Calcula desde el dataset los insumos del cuadro de mando: la serie de ventas mensual, los 108 scores de la matriz género × mercado y la curva de concentración (long tail)."
            puntos={[
              { k: "Serie temporal", v: "63 meses (2021 a inicios de 2026)" },
              { k: "Matriz", v: "108 scores género × mercado, fórmula multi-criterio" },
              { k: "Long tail", v: "curva de concentración del catálogo" },
            ]}
            filename="02_calculo_web.py" code={codigoCubo} />
        )}
        {page === 4 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-1">Resultados del modelo</h3>
            <p className="text-sm text-white/60 mb-5">Validación ciega 80/20 sobre {modelMeta.nFilas.toLocaleString("es-ES")} pares título-mercado.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { v: modelMetrics.auc.toFixed(3), l: "ROC-AUC" },
                { v: modelMetrics.accuracy.toFixed(3), l: "Accuracy" },
                { v: modelMetrics.precision.toFixed(3), l: "Precision" },
                { v: modelMetrics.recall.toFixed(3), l: "Recall" },
                { v: modelMetrics.f1.toFixed(3), l: "F1" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="font-display text-2xl font-semibold">{s.v.replace(".", ",")}</div>
                  <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-card p-4">
                <h4 className="font-display font-semibold text-ink mb-2">Benchmark (ROC-AUC por familia)</h4>
                <EChart option={bench} height={240} />
              </div>
              <div className="rounded-xl border border-white/10 bg-card p-4">
                <h4 className="font-display font-semibold text-ink mb-2">Matriz de confusión (test)</h4>
                <table className="w-full text-sm text-center">
                  <tbody>
                    <tr><td></td><td className="text-muted text-xs pb-1">Pred. fracaso</td><td className="text-muted text-xs pb-1">Pred. éxito</td></tr>
                    <tr><td className="text-muted text-xs pr-2 text-right">Real fracaso</td><td className="border border-line py-3 font-display text-lg text-potenciar">{modelMetrics.confusion[0][0].toLocaleString("es-ES")}</td><td className="border border-line py-3 font-display text-lg text-reducir">{modelMetrics.confusion[0][1].toLocaleString("es-ES")}</td></tr>
                    <tr><td className="text-muted text-xs pr-2 text-right">Real éxito</td><td className="border border-line py-3 font-display text-lg text-reducir">{modelMetrics.confusion[1][0].toLocaleString("es-ES")}</td><td className="border border-line py-3 font-display text-lg text-potenciar">{modelMetrics.confusion[1][1].toLocaleString("es-ES")}</td></tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted mt-2">Umbral operativo (Youden): {modelMetrics.threshold}. Falsos positivos = sobreinversión; falsos negativos = oportunidad perdida.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
