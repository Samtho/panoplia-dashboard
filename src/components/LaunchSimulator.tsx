import { useMemo, useState } from "react";
import EChart from "./EChart";
import { gaugeOption, factorsBarOption, importanceOption, marketCompareOption, benchmarkOption } from "../charts/options";
import {
  modelMeta, modelMetrics, modelBaseline, modelGrid, modelEffects, modelAnalogs,
  MODEL_GENEROS, MODEL_MERCADOS, MODEL_TRIMESTRES, MODEL_BUCKETS,
} from "../data/model";
import { benchmark } from "../data/benchmark";

// Mercados accionables (con volumen real) para sugerir oportunidades sensatas.
const ACTION_MERCADOS = ["ES", "MX", "PE", "DE", "CL"];
const SUBG_INFO: Record<number, { nombre: string; genero: number }> = {};
MODEL_GENEROS.forEach((g) => g.subgeneros.forEach((s) => (SUBG_INFO[s.id] = { nombre: s.nombre, genero: g.id })));
const PAIS_NAME: Record<string, string> = Object.fromEntries(MODEL_MERCADOS.map((m) => [m.iso, m.pais]));
const BUCKET_LABEL: Record<string, string> = Object.fromEntries(MODEL_BUCKETS.map((b) => [b.key, b.label.split(" (")[0]]));

const TRI_LABEL: Record<number, string> = { 1: "T1 · ene-mar", 2: "T2 · abr-jun", 3: "T3 · jul-sep", 4: "T4 · oct-dic" };
const BASE_PCT = Math.round(modelBaseline * 100);

export default function LaunchSimulator() {
  const [genero, setGenero] = useState(6);
  const generoObj = MODEL_GENEROS.find((g) => g.id === genero)!;
  const [subgenero, setSubgenero] = useState(generoObj.subgeneros[0].id);
  const [mercado, setMercado] = useState("MX");
  const [trimestre, setTrimestre] = useState(4);
  const [bucket, setBucket] = useState("med");

  function pickGenero(id: number) {
    setGenero(id);
    setSubgenero(MODEL_GENEROS.find((g) => g.id === id)!.subgeneros[0].id);
  }
  function applyKey(key: string) {
    const [sg, mk, tr, bk] = key.split("|");
    const g = MODEL_GENEROS.find((x) => x.subgeneros.some((s) => s.id === Number(sg)));
    if (g) setGenero(g.id);
    setSubgenero(Number(sg)); setMercado(mk); setTrimestre(Number(tr)); setBucket(bk);
  }

  // Escenarios: peor / típico / mejor combinación de toda la rejilla
  const presets = useMemo(() => {
    const ent = Object.entries(modelGrid).sort((a, b) => a[1] - b[1]);
    return { peor: ent[0][0], tipico: ent[Math.floor(ent.length / 2)][0], mejor: ent[ent.length - 1][0] };
  }, []);

  const prob = modelGrid[`${subgenero}|${mercado}|${trimestre}|${bucket}`] ?? modelBaseline;
  const pct = Math.round(prob * 1000) / 10;

  const contribs = useMemo(() => {
    const b = modelBaseline;
    return [
      { name: "Subgénero", c: (modelEffects.subgenero[String(subgenero)] ?? b) - b },
      { name: "Mercado", c: (modelEffects.mercado[mercado] ?? b) - b },
      { name: "Trimestre", c: (modelEffects.trimestre[String(trimestre)] ?? b) - b },
      { name: "Precio", c: (modelEffects.bucket[bucket] ?? b) - b },
    ];
  }, [subgenero, mercado, trimestre, bucket]);

  const factorsChart = useMemo(() => factorsBarOption(contribs), [contribs]);
  const gauge = useMemo(() => gaugeOption(prob), [prob]);
  const importance = useMemo(importanceOption, []);
  const benchChart = useMemo(() => benchmarkOption(benchmark), []);

  // Mejor combinación por mercado accionable (la respuesta directa, sin adivinar).
  const topOps = useMemo(() => {
    return ACTION_MERCADOS.map((iso) => {
      let best = { p: -1, sg: 0, tr: 1, bk: "med" };
      for (const sg of Object.keys(SUBG_INFO).map(Number)) {
        for (const tr of MODEL_TRIMESTRES) {
          for (const b of MODEL_BUCKETS) {
            const p = modelGrid[`${sg}|${iso}|${tr}|${b.key}`] ?? 0;
            if (p > best.p) best = { p, sg, tr, bk: b.key };
          }
        }
      }
      return { iso, pais: PAIS_NAME[iso], ...best };
    }).sort((a, b) => b.p - a.p);
  }, []);

  function applyOp(o: { sg: number; iso: string; tr: number; bk: string }) {
    applyKey(`${o.sg}|${o.iso}|${o.tr}|${o.bk}`);
  }

  // Probabilidad del MISMO título en cada mercado con datos suficientes (sin micro-mercados
  // que inflan la probabilidad). Responde "¿dónde lanzarlo?" de forma fiable.
  const marketCompare = useMemo(() => {
    const rows = MODEL_MERCADOS.filter((m) => ACTION_MERCADOS.includes(m.iso)).map((m) => ({
      pais: m.pais,
      p: modelGrid[`${subgenero}|${m.iso}|${trimestre}|${bucket}`] ?? 0,
      current: m.iso === mercado,
    })).sort((a, b) => b.p - a.p);
    return { rows, chart: marketCompareOption(rows) };
  }, [subgenero, mercado, trimestre, bucket]);
  const mejorMercado = marketCompare.rows[0];
  const tituloLabel = `${SUBG_INFO[subgenero]?.nombre} · T${trimestre} · ${BUCKET_LABEL[bucket]}`;

  // Mejor mejora cambiando un solo factor
  const suggestion = useMemo(() => {
    const opts: { label: string; key: string }[] = [];
    MODEL_MERCADOS.forEach((m) => m.iso !== mercado && opts.push({ label: `mercado ${m.pais}`, key: `${subgenero}|${m.iso}|${trimestre}|${bucket}` }));
    MODEL_TRIMESTRES.forEach((t) => t !== trimestre && opts.push({ label: `trimestre T${t}`, key: `${subgenero}|${mercado}|${t}|${bucket}` }));
    MODEL_BUCKETS.forEach((b) => b.key !== bucket && opts.push({ label: `precio ${b.label.split(" (")[0]}`, key: `${subgenero}|${mercado}|${trimestre}|${b.key}` }));
    let best = { label: "", p: prob };
    opts.forEach((o) => { const p = modelGrid[o.key] ?? 0; if (p > best.p) best = { label: o.label, p }; });
    return best.p > prob + 0.03 ? best : null;
  }, [subgenero, mercado, trimestre, bucket, prob]);

  const nivel = prob >= 0.45 ? "ALTA" : prob >= modelBaseline ? "MEDIA" : "BAJA";
  const nivelColor = prob >= 0.45 ? "text-potenciar" : prob >= modelBaseline ? "text-vigilar" : "text-reducir";
  const top = [...contribs].sort((a, b) => Math.abs(b.c) - Math.abs(a.c))[0];
  const paisName = MODEL_MERCADOS.find((m) => m.iso === mercado)?.pais ?? mercado;
  const analogs = modelAnalogs[`${genero}|${mercado}`] ?? [];

  // Frases por factor (lenguaje llano)
  const frases = contribs.map((f) => {
    const p = Math.round(f.c * 1000) / 10;
    const signo = p >= 0 ? "suma" : "resta";
    let razon = "";
    if (f.name === "Mercado") razon = `${paisName} vende ${p >= 0 ? "por encima" : "por debajo"} de la media`;
    else if (f.name === "Precio") razon = `este rango de precio ${p >= 0 ? "favorece" : "penaliza"} la venta`;
    else if (f.name === "Trimestre") razon = `lanzar en T${trimestre} ${p >= 0 ? "ayuda" : "penaliza"}`;
    else razon = Math.abs(p) < 1.5 ? "el subgénero casi no influye" : `este subgénero ${p >= 0 ? "vende mejor" : "vende peor"} que la media`;
    return { name: f.name, p, signo, razon };
  });

  const PresetBtn = ({ label, k }: { label: string; k: string }) => (
    <button onClick={() => applyKey(k)} className="rounded-full px-3.5 py-1.5 text-sm border border-line bg-card text-ink-soft hover:border-terracota hover:text-terracota transition-colors">
      {label}
    </button>
  );

  return (
    <div>
      {/* Lo más fácil: mejores oportunidades por mercado (clic = cargar) */}
      <div className="rounded-2xl border border-line bg-card p-5 mb-6">
        <h4 className="font-display text-lg font-semibold mb-1">Las mejores apuestas, según el modelo</h4>
        <p className="text-sm text-ink-soft mb-4">
          Sin adivinar nada: esta es la combinación con más probabilidad de éxito en cada mercado clave. Haz clic en una para cargarla y ver el detalle.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topOps.map((o) => (
            <button key={o.iso} onClick={() => applyOp(o)}
              className="text-left rounded-xl border border-line bg-paper-soft hover:border-terracota p-3 transition-colors">
              <div className="flex items-baseline justify-between">
                <span className="font-display font-semibold text-ink">{o.pais}</span>
                <span className="font-display text-xl font-semibold text-terracota">{Math.round(o.p * 100)}%</span>
              </div>
              <div className="text-xs text-muted mt-1 leading-snug">
                {SUBG_INFO[o.sg]?.nombre} · T{o.tr} · {BUCKET_LABEL[o.bk]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intro + escenarios */}
      <div className="rounded-2xl border border-line bg-paper-soft p-4 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-ink-soft">
          <b className="text-ink">Cómo se usa:</b> elige las características de un título y mira la probabilidad. Prueba un escenario:
        </p>
        <div className="flex gap-2">
          <PresetBtn label="🔻 Peor caso" k={presets.peor} />
          <PresetBtn label="Caso típico" k={presets.tipico} />
          <PresetBtn label="🔺 Mejor caso" k={presets.mejor} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controles */}
        <div className="rounded-2xl border border-line bg-paper-soft p-5">
          <h4 className="font-display text-lg font-semibold mb-4">1 · Configura el lanzamiento</h4>

          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">Género</label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {MODEL_GENEROS.map((g) => (
              <button key={g.id} onClick={() => pickGenero(g.id)}
                className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${genero === g.id ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota"}`}>
                {g.nombre}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">Subgénero</label>
              <select value={subgenero} onChange={(e) => setSubgenero(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink">
                {generoObj.subgeneros.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">Mercado</label>
              <select value={mercado} onChange={(e) => setMercado(e.target.value)}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink">
                {MODEL_MERCADOS.map((m) => <option key={m.iso} value={m.iso}>{m.pais}</option>)}
              </select>
            </div>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2 mt-4">Trimestre de lanzamiento</label>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {MODEL_TRIMESTRES.map((t) => (
              <button key={t} onClick={() => setTrimestre(t)} title={TRI_LABEL[t]}
                className={`rounded-lg px-2 py-1.5 text-sm border transition-colors ${trimestre === t ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota"}`}>
                T{t}
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">Rango de precio</label>
          <div className="grid grid-cols-2 gap-1.5">
            {MODEL_BUCKETS.map((b) => (
              <button key={b.key} onClick={() => setBucket(b.key)}
                className={`rounded-lg px-2 py-1.5 text-xs border transition-colors ${bucket === b.key ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota"}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado + veredicto en lenguaje llano */}
        <div className="rounded-2xl border border-line bg-card p-5 flex flex-col">
          <h4 className="font-display text-lg font-semibold mb-1">2 · Resultado</h4>
          <p className="text-xs text-muted mb-1">Probabilidad de vender 8 o más unidades en {paisName}</p>
          <EChart option={gauge} height={210} />
          <p className="text-center text-xs text-muted -mt-2 mb-3">Media de cualquier lanzamiento: {BASE_PCT}%</p>
          <div className="mt-auto rounded-xl border border-line bg-paper-soft p-4">
            <p className="text-sm text-ink leading-relaxed">
              Probabilidad <b className={nivelColor}>{nivel}</b> ({pct}%), {prob >= modelBaseline ? "por encima" : "por debajo"} de la media ({BASE_PCT}%).
              Lo que más {top.c >= 0 ? "ayuda" : "pesa en contra"}: <b>{top.name.toLowerCase()}</b>.
            </p>
            {suggestion && (
              <p className="text-sm text-ink mt-2 pt-2 border-t border-line">
                💡 Para subirla, prueba <b>{suggestion.label}</b>: pasaría a <b className="text-potenciar">{Math.round(suggestion.p * 100)}%</b>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Por qué: factores en lenguaje claro */}
      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h4 className="font-display text-lg font-semibold mb-1">3 · ¿Por qué este {pct}%? (sin caja negra)</h4>
        <p className="text-sm text-ink-soft mb-4">
          Un título cualquiera tiene de media un <b className="text-ink">{BASE_PCT}%</b> de éxito. El tuyo tiene un <b className="text-ink">{pct}%</b>.
          Esa diferencia ({pct > BASE_PCT ? "+" : ""}{(pct - BASE_PCT).toFixed(1)} puntos) se explica así: cada característica
          lo <b className="text-potenciar">sube</b> (verde) o lo <b className="text-reducir">baja</b> (rojo).
        </p>
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <EChart option={factorsChart} height={200} />
          <ul className="space-y-2">
            {frases.map((f) => (
              <li key={f.name} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 font-display font-semibold tabular-nums w-12 text-right ${f.p >= 0 ? "text-potenciar" : "text-reducir"}`}>
                  {f.p >= 0 ? "+" : ""}{f.p}
                </span>
                <span className="text-ink-soft"><b className="text-ink">{f.name}:</b> {f.razon}.</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ¿Dónde lanzarlo? Comparación por mercado del mismo título */}
      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h4 className="font-display text-lg font-semibold">4 · ¿En qué mercado conviene lanzarlo?</h4>
          <p className="text-sm text-ink-soft">
            Mejor mercado para este título: <b className="text-terracota">{mejorMercado.pais}</b> ({Math.round(mejorMercado.p * 100)}%).
          </p>
        </div>
        <p className="text-sm text-ink-soft mb-3">
          Título evaluado: <b className="text-ink">{tituloLabel}</b> (el que has configurado arriba). Probabilidad de éxito en los 5 mercados con datos suficientes; se omiten los micro-mercados porque su muestra es demasiado pequeña para fiarse. El mercado elegido va resaltado.
        </p>
        <EChart option={marketCompare.chart} height={300} />
      </div>

      {/* Confianza del modelo + análogos */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-line bg-paper-soft p-5">
          <h4 className="font-display text-lg font-semibold mb-3">¿Es fiable el modelo?</h4>
          <div className="font-display text-3xl font-semibold text-ink mb-1">{(modelMetrics.auc * 100).toFixed(0)}%</div>
          <p className="text-sm text-ink-soft leading-snug mb-3">
            de acierto al distinguir un éxito de un fracaso (ROC-AUC; 50% sería puro azar).
          </p>
          <p className="text-xs text-muted leading-snug">
            {modelMeta.algoritmo}, entrenado con {modelMeta.nFilas.toLocaleString("es-ES")} casos reales (validación ciega 80/20).
            {" "}{modelMeta.nota}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h4 className="font-display text-lg font-semibold mb-2">Qué factores pesan más</h4>
          <EChart option={importance} height={150} />
          <p className="text-xs text-muted mt-1">El precio y el mercado mandan; el subgénero apenas predice.</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h4 className="font-display text-lg font-semibold mb-2">Éxitos reales en {paisName}</h4>
          {analogs.length > 0 ? (
            <ul className="space-y-1.5">
              {analogs.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm border-b border-line pb-1.5 last:border-0">
                  <span className="text-ink">{a.subgenero}</span>
                  <span className="text-muted text-xs">{a.uds.toLocaleString("es-ES")} uds · {a.pvp.toLocaleString("es-ES")} €</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Sin ventas registradas de este género en {paisName}.</p>
          )}
        </div>
      </div>

      {/* Benchmark: ¿es Gradient Boosting el mejor modelo? */}
      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <h4 className="font-display text-lg font-semibold mb-1">¿Por qué este modelo y no otro?</h4>
        <p className="text-sm text-ink-soft mb-3">
          Probamos 11 algoritmos de todas las familias (lineal, árboles, bagging, boosting, red neuronal) sobre el mismo problema.
          Gana el <b className="text-ink">gradient boosting</b> (familia XGBoost/LightGBM). Ninguna red neuronal lo supera: el techo de ~0,64 es real, no por elegir mal.
        </p>
        <EChart option={benchChart} height={230} />
      </div>
    </div>
  );
}
