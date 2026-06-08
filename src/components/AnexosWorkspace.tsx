import { useState } from "react";
import EChart from "./EChart";
import { benchmarkOption } from "../charts/options";
import { benchmark } from "../data/benchmark";
import { modelMetrics, modelMeta } from "../data/model";
import { codigoPredictor, codigoBenchmark, codigoCubo } from "../data/anexos";
import DataModelDiagram from "./DataModelDiagram";

const PAGES = ["Modelo de datos", "Código · Predictor", "Código · Benchmark", "Código · Análisis", "Resultados"] as const;

// Bloque de código tipo editor (monoespaciado + numeración).
function CodeBlock({ code }: { code: string }) {
  const lines = code.replace(/\s+$/, "").split("\n");
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1413] overflow-hidden">
      <div className="overflow-auto max-h-[72vh]">
        <table className="font-mono text-[12px] leading-[1.6] w-full">
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td className="text-white/25 text-right pr-4 pl-3 select-none align-top whitespace-nowrap">{i + 1}</td>
                <td className="text-white/85 whitespace-pre pr-4">{l || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <div>
            <h3 className="font-display text-xl font-semibold mb-1">Modelo predictivo · Gradient Boosting (familia XGBoost)</h3>
            <p className="text-sm text-white/60 mb-4">{modelMeta.objetivo} Entrenamiento, métricas, importancias y rejilla de predicción.</p>
            <CodeBlock code={codigoPredictor} />
          </div>
        )}
        {page === 2 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-1">Benchmark de 11 modelos</h3>
            <p className="text-sm text-white/60 mb-4">Comparación de todas las familias del temario sobre el mismo problema (ROC-AUC).</p>
            <CodeBlock code={codigoBenchmark} />
          </div>
        )}
        {page === 3 && (
          <div>
            <h3 className="font-display text-xl font-semibold mb-1">Análisis: series, matriz scoring y long tail</h3>
            <p className="text-sm text-white/60 mb-4">Cálculo de la serie mensual, los 108 scores género×mercado y la curva de concentración.</p>
            <CodeBlock code={codigoCubo} />
          </div>
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
