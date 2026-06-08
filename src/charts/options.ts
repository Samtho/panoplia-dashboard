import type { EChartsCoreOption } from "echarts";
import {
  generos,
  catalogo,
  rfm,
  ventasAnualesReal,
  ventasMensuales,
  estacionalidad,
  mercadosReal,
  matriz,
  matrizRanking,
  longTail,
  MERCADOS_ORDEN,
} from "../data/panoplia";
import { modelImportances } from "../data/model";

// Paleta compartida (espejo de los tokens CSS). Cambia con el modo claro/oscuro.
const LIGHT = {
  ink: "#122120", inkSoft: "#46514f", muted: "#8a9693", line: "#dde8e5",
  terracota: "#10a99e", terracotaDeep: "#0b6f68", clay: "#8bd5cc",
  potenciar: "#1f9d74", mantener: "#74c3a3", vigilar: "#e0a92b", reducir: "#df5b4b",
};
const DARK = {
  ink: "#e9f0ee", inkSoft: "#aab4b1", muted: "#7c8784", line: "#28332f",
  terracota: "#22c1b4", terracotaDeep: "#7fe3d8", clay: "#356b63",
  potenciar: "#3cbd8e", mantener: "#6fbf9d", vigilar: "#e6b53e", reducir: "#e87363",
};
export const C = { ...LIGHT };
// Aplica el tema a la paleta de gráficos (mutación in situ; rebuild de opciones aparte).
export function setChartTheme(dark: boolean) {
  Object.assign(C, dark ? DARK : LIGHT);
}

const FONT = "Inter, system-ui, sans-serif";
const baseText = { fontFamily: FONT, color: C.inkSoft };

// Nombre de país por ISO (para ejes y tooltips)
const PAIS: Record<string, string> = Object.fromEntries(
  mercadosReal.map((m) => [m.iso, m.pais]),
);

// ---------- Diagnóstico: ventas anuales indexadas vs sector (real, 2021-2025) ----------
export function diagnosisOption(): EChartsCoreOption {
  const serie = ventasAnualesReal;
  return {
    textStyle: baseText,
    grid: { left: 48, right: 24, top: 48, bottom: 36 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => (v == null ? "s/d" : `${v} (índice)`),
    },
    xAxis: {
      type: "category",
      data: serie.map((p) => p.anio),
      axisLine: { lineStyle: { color: C.line } },
      axisLabel: { color: C.muted },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      name: "Índice  ·  2022 = 100",
      nameTextStyle: { color: C.muted, align: "left" },
      min: 70,
      max: 105,
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
      axisLabel: { color: C.muted },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 9,
        data: serie.map((p) => p.indice),
        lineStyle: { color: C.terracota, width: 3 },
        itemStyle: { color: C.terracota, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, position: "top", color: C.ink, fontWeight: 600, formatter: "{c}" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16,169,158,0.22)" },
              { offset: 1, color: "rgba(16,169,158,0.01)" },
            ],
          },
        },
        markLine: {
          symbol: "none",
          data: [{ yAxis: 100 }],
          lineStyle: { color: C.muted, type: "dashed" },
          label: { formatter: "pico 2022", color: C.muted, position: "insideEndTop" },
        },
        markPoint: {
          symbol: "pin",
          symbolSize: 56,
          data: [
            {
              coord: ["2025", 81.6],
              value: "-18,3%",
              itemStyle: { color: C.reducir },
              label: { color: "#fff", fontWeight: 700, fontSize: 12 },
            },
          ],
        },
      },
    ],
    graphic: [
      {
        type: "text",
        right: 24,
        top: 8,
        style: {
          text: "Sector editorial España: +6,3% (2024, FGEE)",
          fill: C.potenciar,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 12,
        },
      },
    ],
  };
}

// ---------- Serie mensual real (2021-01 .. 2026-03; 2026 parcial) ----------
export function monthlySeriesOption(): EChartsCoreOption {
  const data = ventasMensuales.map((p) => [p.mes, Math.round(p.ventas)]);
  // índice donde empieza 2026 (zona parcial sombreada)
  const i2026 = ventasMensuales.findIndex((p) => p.mes.startsWith("2026"));
  return {
    textStyle: baseText,
    grid: { left: 56, right: 20, top: 24, bottom: 56 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `${(v as number).toLocaleString("es-ES")} €`,
    },
    xAxis: {
      type: "category",
      data: ventasMensuales.map((p) => p.mes),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: {
        color: C.muted,
        interval: (_idx: number, val: string) => val.endsWith("-01"),
        formatter: (val: string) => val.slice(0, 4),
      },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: C.muted, formatter: (v: number) => `${Math.round(v / 1000)}k` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: C.terracota, width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16,169,158,0.20)" },
              { offset: 1, color: "rgba(16,169,158,0.01)" },
            ],
          },
        },
        markArea: i2026 >= 0 ? {
          itemStyle: { color: "rgba(140,132,120,0.10)" },
          data: [[{ xAxis: ventasMensuales[i2026].mes, name: "2026 (parcial)" }, { xAxis: ventasMensuales[ventasMensuales.length - 1].mes }]],
          label: { color: C.muted, fontSize: 11, position: "insideTop" },
        } : undefined,
      },
    ],
  };
}

// ---------- Demanda: comparación mes a mes, año contra año (leyenda interactiva) ----------
export function seasonByYearOption(): EChartsCoreOption {
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const byYear: Record<string, Record<number, number>> = {};
  ventasMensuales.forEach((p) => {
    const [y, m] = p.mes.split("-");
    (byYear[y] = byYear[y] || {})[Number(m)] = p.ventas;
  });
  const years = Object.keys(byYear).sort();
  // años recientes en turquesa intenso, antiguos en gris: deja ver la caída
  const palette: Record<string, string> = {
    "2021": "#cdd6d4", "2022": "#9bb8b3", "2023": "#5fb3a8", "2024": "#2aa79b", "2025": "#0b6f68", "2026": C.terracota,
  };
  return {
    textStyle: baseText,
    grid: { left: 56, right: 20, top: 36, bottom: 28 },
    tooltip: { trigger: "axis", valueFormatter: (v: number) => (v == null ? "s/d" : `${Math.round(v as number).toLocaleString("es-ES")} €`) },
    legend: { top: 0, textStyle: { color: C.inkSoft }, icon: "roundRect" },
    xAxis: {
      type: "category", data: MESES, boundaryGap: false,
      axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false }, axisLabel: { color: C.muted },
    },
    yAxis: {
      type: "value", axisLabel: { color: C.muted, formatter: (v: number) => `${Math.round(v / 1000)}k` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    series: years.map((y) => ({
      name: y, type: "line", smooth: true, symbol: "circle", symbolSize: 5,
      data: MESES.map((_, i) => byYear[y][i + 1] ?? null),
      lineStyle: { width: y === "2025" ? 3 : 2, color: palette[y], type: y === "2026" ? "dashed" : "solid" },
      itemStyle: { color: palette[y] },
      connectNulls: false,
    })),
  };
}

// ---------- Estacionalidad: índice de ventas por mes del año ----------
export function seasonalityOption(): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: "axis", valueFormatter: (v: number) => `${v} (media = 100)` },
    xAxis: {
      type: "category",
      data: estacionalidad.map((e) => e.mes),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.muted },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
      axisLabel: { color: C.muted },
    },
    series: [
      {
        type: "bar",
        data: estacionalidad.map((e) => ({
          value: e.indice,
          itemStyle: { color: e.indice >= 115 ? C.terracota : e.indice <= 80 ? C.clay : C.inkSoft },
        })),
        barWidth: "62%",
        markLine: {
          symbol: "none",
          data: [{ yAxis: 100 }],
          lineStyle: { color: C.muted, type: "dashed" },
          label: { formatter: "media anual", color: C.muted, position: "insideStartTop" },
        },
        markPoint: {
          symbol: "pin", symbolSize: 46,
          data: [
            { type: "max", name: "Pico", itemStyle: { color: C.potenciar }, label: { color: "#fff", fontWeight: 700, fontSize: 10 } },
            { type: "min", name: "Valle", itemStyle: { color: C.reducir }, label: { color: "#fff", fontWeight: 700, fontSize: 10 } },
          ],
        },
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
}

// ---------- Concentración: doméstico vs exportación (barra apilada 100%) ----------
export function concentrationOption(): EChartsCoreOption {
  const esp = mercadosReal.find((m) => m.iso === "ES")!;
  const exportPct = 100 - esp.cuota;
  return {
    textStyle: baseText,
    grid: { left: 16, right: 16, top: 8, bottom: 8 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => `${(v as number).toFixed(2)}%` },
    xAxis: { type: "value", max: 100, show: false },
    yAxis: { type: "category", data: ["Facturación"], show: false },
    series: [
      {
        type: "bar",
        stack: "t",
        data: [Number(esp.cuota.toFixed(2))],
        name: "España (doméstico)",
        itemStyle: { color: C.terracotaDeep, borderRadius: [8, 0, 0, 8] },
        label: { show: true, color: "#fff", fontWeight: 700, formatter: "España\n{c}%" },
        barWidth: 64,
      },
      {
        type: "bar",
        stack: "t",
        data: [Number(exportPct.toFixed(2))],
        name: "Exportación",
        itemStyle: { color: C.clay, borderRadius: [0, 8, 8, 0] },
        label: { show: true, color: C.ink, fontWeight: 700, formatter: `Export\n${exportPct.toFixed(2)}%`, position: "insideRight" },
      },
    ],
  };
}

// ---------- Mercados de exportación (zoom al 8,14%, sin España) ----------
export function exportMarketsOption(): EChartsCoreOption {
  const exp = mercadosReal.filter((m) => m.iso !== "ES");
  const totalExport = exp.reduce((s, m) => s + m.ventasEuro, 0);
  return {
    textStyle: baseText,
    grid: { left: 90, right: 64, top: 12, bottom: 24 },
    tooltip: {
      trigger: "item",
      formatter: (p: { name: string; value: number }) =>
        `<b>${p.name}</b><br/>${p.value.toLocaleString("es-ES")} €<br/>${((p.value / totalExport) * 100).toFixed(1)}% de la exportación`,
    },
    xAxis: {
      type: "log",
      axisLabel: { color: C.muted, formatter: (v: number) => `${(v / 1000).toLocaleString("es-ES")}k` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: exp.map((m) => m.pais),
      axisLine: { lineStyle: { color: C.line } },
      axisLabel: { color: C.ink, fontWeight: 500 },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: exp.map((m, i) => ({
          value: Math.round(m.ventasEuro),
          itemStyle: { color: i === 0 ? C.terracota : C.clay },
        })),
        barWidth: "60%",
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { value: number }) => `${(p.value / 1000).toFixed(0)}k €`,
        },
        itemStyle: { borderRadius: [0, 5, 5, 0] },
      },
    ],
  };
}

// ---------- Catálogo: reconstrucción del universo (cifras reales) ----------
export function catalogReconstructionOption(): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 150, right: 80, top: 16, bottom: 24 },
    tooltip: {
      trigger: "item",
      valueFormatter: (v: number) => `${(v as number).toLocaleString("es-ES")} títulos`,
    },
    xAxis: {
      type: "value",
      axisLabel: { color: C.muted, formatter: (v: number) => `${v / 1000}k` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: ["Catálogo activo (Excel)", "Universo real (facturas)"],
      axisLine: { lineStyle: { color: C.line } },
      axisLabel: { color: C.ink, fontWeight: 500 },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        barWidth: "50%",
        data: [
          { value: 7479, itemStyle: { color: C.muted } },
          { value: 99985, itemStyle: { color: C.terracota } },
        ],
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { value: number }) => p.value.toLocaleString("es-ES"),
        },
        itemStyle: { borderRadius: [0, 6, 6, 0] },
      },
    ],
  };
}

// ---------- Catálogo: curva long tail (% títulos -> % ventas acumuladas) ----------
export function longTailOption(): EChartsCoreOption {
  const pts = longTail.puntos;
  return {
    textStyle: baseText,
    grid: { left: 52, right: 24, top: 24, bottom: 44 },
    tooltip: {
      trigger: "axis",
      formatter: (ps: { axisValue: string; value: number }[]) =>
        `Top ${ps[0].axisValue}% de títulos<br/><b>${ps[0].value}%</b> de las ventas`,
    },
    xAxis: {
      type: "category",
      name: "% de títulos (ordenados por ventas)",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: C.muted },
      data: pts.map((p) => p.pctTitulos),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.muted, formatter: "{value}%" },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: C.muted, formatter: "{value}%" },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: pts.map((p) => p.pctVentas),
        lineStyle: { color: C.terracota, width: 3 },
        itemStyle: { color: C.terracota },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16,169,158,0.22)" },
              { offset: 1, color: "rgba(16,169,158,0.01)" },
            ],
          },
        },
        markPoint: {
          symbol: "pin",
          symbolSize: 50,
          data: [{ coord: ["5", 53.1], value: "53%", itemStyle: { color: C.terracotaDeep }, label: { color: "#fff", fontWeight: 700 } }],
        },
      },
    ],
  };
}

// ---------- Géneros: ventas reales por género ----------
export function genresOption(): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 170, right: 70, top: 12, bottom: 24 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => `${v} M€` },
    xAxis: {
      type: "value",
      axisLabel: { color: C.muted, formatter: "{value} M€" },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: generos.map((g) => g.nombre),
      axisLine: { lineStyle: { color: C.line } },
      axisLabel: { color: C.ink, fontWeight: 500 },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        barWidth: "62%",
        data: generos.map((g, i) => ({
          value: g.ventasM,
          itemStyle: { color: i === 0 ? C.terracota : C.clay },
        })),
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { value: number }) => `${p.value} M€`,
        },
        itemStyle: { borderRadius: [0, 6, 6, 0] },
      },
    ],
  };
}

// Orden de géneros del heatmap (por score medio, mejor arriba). Lo usa también el cockpit.
export const GENERO_ORDEN: string[] = matrizRanking.map((r) => r.genero);

// ---------- Matriz género × mercado: heatmap de 108 scores (real) ----------
// focusIso: si se indica, atenúa las columnas que no son ese mercado.
export function matrixHeatmapOption(focusIso?: string | null): EChartsCoreOption {
  const genOrder = GENERO_ORDEN;
  const byGenero: Record<string, (typeof matriz)[number]> = Object.fromEntries(
    matriz.map((f) => [f.genero, f]),
  );
  const data: { value: [number, number, number]; itemStyle?: { opacity: number } }[] = [];
  genOrder.forEach((gname, yi) => {
    const fila = byGenero[gname];
    MERCADOS_ORDEN.forEach((iso, xi) => {
      const celda = fila.celdas.find((c) => c.iso === iso);
      if (celda && celda.score !== null) {
        const dim = focusIso && iso !== focusIso;
        data.push({ value: [xi, yi, celda.score], itemStyle: dim ? { opacity: 0.18 } : undefined });
      }
    });
  });
  return {
    textStyle: baseText,
    grid: { left: 150, right: 20, top: 10, bottom: 88 },
    tooltip: {
      position: "top",
      formatter: (p: { value: [number, number, number] }) => {
        const iso = MERCADOS_ORDEN[p.value[0]];
        const gname = genOrder[p.value[1]];
        const celda = byGenero[gname].celdas.find((c) => c.iso === iso)!;
        return `<b>${gname}</b> · ${PAIS[iso]}<br/>Score: ${celda.score}<br/>Acción: ${celda.cat}<br/>Ventas: ${Math.round(celda.ventas).toLocaleString("es-ES")} €`;
      },
    },
    xAxis: {
      type: "category",
      data: MERCADOS_ORDEN.map((iso) => PAIS[iso]),
      splitArea: { show: true, areaStyle: { color: ["rgba(0,0,0,0)", "rgba(140,132,120,0.04)"] } },
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.inkSoft, rotate: 40, fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: genOrder,
      inverse: true,
      splitArea: { show: true, areaStyle: { color: ["rgba(0,0,0,0)", "rgba(140,132,120,0.04)"] } },
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontWeight: 500, fontSize: 11 },
    },
    visualMap: {
      type: "piecewise",
      orient: "horizontal",
      bottom: 8,
      left: "center",
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { color: C.inkSoft, fontSize: 11 },
      pieces: [
        { min: 0.75, max: 1, label: "Potenciar (≥0,75)", color: C.potenciar },
        { min: 0.55, max: 0.75, label: "Mantener", color: C.mantener },
        { min: 0.35, max: 0.55, label: "Vigilar", color: C.vigilar },
        { min: 0, max: 0.35, label: "Reducir (<0,35)", color: C.reducir },
      ],
    },
    series: [
      {
        type: "heatmap",
        data,
        label: { show: true, color: "#fff", fontWeight: 600, fontSize: 10, formatter: (p: { value: [number, number, number] }) => p.value[2].toFixed(2) },
        itemStyle: { borderColor: "#faf8f3", borderWidth: 2 },
        emphasis: { itemStyle: { borderColor: C.ink, borderWidth: 1 } },
      },
    ],
  };
}

// ---------- Predictor: benchmark de modelos (ROC-AUC) ----------
export function benchmarkOption(rows: { modelo: string; auc: number; ganador?: boolean }[]): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 200, right: 50, top: 6, bottom: 18 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => `AUC ${v}` },
    xAxis: {
      type: "value", min: 0.5, max: 0.7,
      axisLabel: { color: C.muted },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category", inverse: true,
      data: rows.map((r) => r.modelo),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontSize: 11 },
    },
    series: [
      {
        type: "bar", barWidth: "62%",
        data: rows.map((r) => ({ value: r.auc, itemStyle: { color: r.ganador ? C.terracota : C.clay, borderRadius: [0, 4, 4, 0] } })),
        label: { show: true, position: "right", color: C.inkSoft, fontWeight: 600, formatter: (p: { value: number }) => p.value.toFixed(3) },
      },
    ],
  };
}

// ---------- Mapa plano de exportación (geo + líneas animadas) ----------
// Coordenadas [lng, lat] de cada mercado.
const GEO_COORDS: Record<string, [number, number]> = {
  ES: [-3.7038, 40.4168], MX: [-99.1332, 19.4326], PE: [-77.0428, -12.0464],
  DE: [13.405, 52.52], CL: [-70.6693, -33.4489], AU: [151.2093, -33.8688],
  SE: [18.0686, 59.3293], GB: [-0.1278, 51.5074], NI: [-86.2362, 12.1149],
  VE: [-66.9036, 10.4806], BE: [4.3517, 50.8503], PL: [21.0122, 52.2297],
};
const MADRID = GEO_COORDS.ES;

export function flatMapOption(focusIso?: string | null): EChartsCoreOption {
  const all = mercadosReal.filter((m) => m.iso !== "ES" && GEO_COORDS[m.iso]);
  const maxV = Math.max(...all.map((m) => m.ventasEuro)); // escala estable
  // Al filtrar, SOLO se muestra el mercado elegido (más Madrid como origen).
  const exp = focusIso ? all.filter((m) => m.iso === focusIso) : all;

  const lines = exp.map((m) => ({
    coords: [MADRID, GEO_COORDS[m.iso]],
    name: m.pais,
    value: m.ventasEuro,
    lineStyle: {
      width: focusIso ? 2.4 : Math.max(0.6, 3.2 * Math.sqrt(m.ventasEuro / maxV)),
      color: C.terracota,
      opacity: 0.6,
    },
  }));
  const points = [
    { name: "Madrid (origen)", value: [...MADRID, maxV], itemStyle: { color: C.terracotaDeep } },
    ...exp.map((m) => ({
      name: m.pais,
      value: [...GEO_COORDS[m.iso], m.ventasEuro],
      itemStyle: { color: C.terracota, opacity: 1 },
    })),
  ];

  return {
    textStyle: baseText,
    tooltip: {
      trigger: "item",
      formatter: (p: { name: string; value: number[] | number }) => {
        const v = Array.isArray(p.value) ? p.value[2] : p.value;
        return v ? `<b>${p.name}</b><br/>${Math.round(v as number).toLocaleString("es-ES")} €` : p.name;
      },
    },
    geo: {
      map: "world",
      roam: false,
      center: [-38, 22],
      zoom: 1.5,
      itemStyle: { areaColor: "#e9f2f0", borderColor: "#cdded9", borderWidth: 0.5 },
      emphasis: { disabled: true },
      silent: true,
    },
    series: [
      {
        type: "lines",
        coordinateSystem: "geo",
        zlevel: 2,
        effect: { show: true, period: 5, trailLength: 0.25, symbol: "arrow", symbolSize: 7, color: C.terracotaDeep },
        lineStyle: { curveness: 0.3 },
        data: lines,
      },
      {
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 3,
        rippleEffect: { brushType: "stroke", scale: 2.6 },
        symbolSize: (val: number[]) => 5 + 14 * Math.sqrt((val[2] as number) / maxV),
        label: {
          show: true,
          position: "right",
          formatter: (p: { name: string }) => p.name.replace(" (origen)", ""),
          color: C.ink,
          fontSize: 11,
          fontWeight: 500,
        },
        data: points,
      },
    ],
  };
}

// ---------- Informe ejecutivo (Power BI): gráficos genéricos filtrables ----------
export function execMonthlyOption(data: { mes: string; v: number }[]): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 52, right: 16, top: 16, bottom: 40 },
    tooltip: { trigger: "axis", valueFormatter: (v: number) => `${(v as number).toLocaleString("es-ES")} €` },
    xAxis: {
      type: "category", data: data.map((d) => d.mes), boundaryGap: false,
      axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false },
      axisLabel: { color: C.muted, interval: (_i: number, val: string) => val.endsWith("-01"), formatter: (v: string) => v.slice(0, 4) },
    },
    yAxis: { type: "value", axisLabel: { color: C.muted, formatter: (v: number) => `${Math.round(v / 1000)}k` }, splitLine: { lineStyle: { color: C.line, type: "dashed" } } },
    series: [{
      type: "line", data: data.map((d) => Math.round(d.v)), smooth: true, showSymbol: false,
      lineStyle: { color: C.terracota, width: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(16,169,158,0.20)" }, { offset: 1, color: "rgba(16,169,158,0.01)" }] } },
    }],
  };
}

export function execBarOption(data: { label: string; v: number }[], opts: { horizontal?: boolean; euros?: boolean } = {}): EChartsCoreOption {
  const fmt = (v: number) => opts.euros ? `${(v / 1e6).toFixed(2)} M€` : v.toLocaleString("es-ES");
  const cat = { type: "category" as const, data: data.map((d) => d.label), axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false }, axisLabel: { color: C.ink, fontSize: 11 } };
  const val = { type: "value" as const, axisLabel: { color: C.muted, formatter: (v: number) => opts.euros ? `${(v / 1e6).toFixed(1)}M` : `${v}` }, splitLine: { lineStyle: { color: C.line, type: "dashed" } } };
  return {
    textStyle: baseText,
    grid: opts.horizontal ? { left: 140, right: 60, top: 10, bottom: 24 } : { left: 50, right: 16, top: 16, bottom: 28 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => fmt(v as number) },
    xAxis: opts.horizontal ? val : cat,
    yAxis: opts.horizontal ? { ...cat, inverse: true } : val,
    series: [{
      type: "bar", barWidth: "58%",
      data: data.map((d, i) => ({ value: Math.round(d.v), itemStyle: { color: i === 0 ? C.terracota : C.clay, borderRadius: opts.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] } })),
      label: { show: !!opts.horizontal, position: "right", color: C.inkSoft, fontWeight: 600, formatter: (p: { value: number }) => fmt(p.value) },
    }],
  };
}

export function execPieOption(data: { name: string; value: number }[]): EChartsCoreOption {
  const palette = [C.terracota, C.terracotaDeep, C.clay, C.vigilar, C.mantener];
  return {
    textStyle: baseText,
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: { bottom: 0, textStyle: { color: C.inkSoft }, type: "scroll" },
    series: [{
      type: "pie", radius: ["48%", "72%"], center: ["50%", "44%"], avoidLabelOverlap: true,
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      label: { color: C.ink, formatter: "{d}%", fontWeight: 600 },
      data: data.map((d, i) => ({ name: d.name, value: d.value, itemStyle: { color: palette[i % palette.length] } })),
    }],
  };
}

export function execDonutOption(esp: number, exp: number): EChartsCoreOption {
  const tot = esp + exp || 1;
  return {
    textStyle: baseText,
    tooltip: { trigger: "item", formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: ${(p.value / 1e6).toFixed(2)} M€ (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { color: C.inkSoft } },
    series: [{
      type: "pie", radius: ["50%", "74%"], center: ["50%", "44%"], avoidLabelOverlap: true,
      itemStyle: { borderColor: "#fff", borderWidth: 2 },
      label: { color: C.ink, formatter: (p: { percent: number }) => `${p.percent}%`, fontWeight: 600 },
      data: [
        { name: "España", value: esp, itemStyle: { color: C.terracotaDeep } },
        { name: "Exportación", value: exp, itemStyle: { color: C.clay } },
      ],
      // evita warning si tot=0
      ...(tot ? {} : {}),
    }],
  };
}

// ---------- Simulador: trayectoria histórica + proyección en vivo ----------
export function projectionOption(proj: number): EChartsCoreOption {
  const hist = [2.99, 3.28, 3.02, 3.09, 2.68]; // facturación anual real 2021-2025 (M€)
  const last = hist[hist.length - 1];
  const p1 = last + (proj - last) / 3;
  const p2 = last + (2 * (proj - last)) / 3;
  const years = ["2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028"];
  return {
    textStyle: baseText,
    grid: { left: 44, right: 20, top: 28, bottom: 28 },
    tooltip: { trigger: "axis", valueFormatter: (v: number) => (v == null ? "" : `${(v as number).toFixed(2)} M€`) },
    xAxis: {
      type: "category", data: years, boundaryGap: false,
      axisLine: { lineStyle: { color: C.line } }, axisTick: { show: false }, axisLabel: { color: C.muted },
    },
    yAxis: {
      type: "value", min: 2.4, max: 3.6,
      axisLabel: { color: C.muted, formatter: "{value} M€" },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    series: [
      {
        name: "Histórico", type: "line", smooth: true, symbol: "circle", symbolSize: 7,
        data: [...hist, null, null, null],
        lineStyle: { color: C.muted, width: 2 }, itemStyle: { color: C.muted },
      },
      {
        name: "Proyección", type: "line", smooth: true, symbol: "circle", symbolSize: 7,
        data: [null, null, null, null, last, Number(p1.toFixed(2)), Number(p2.toFixed(2)), Number(proj.toFixed(2))],
        lineStyle: { color: C.terracota, width: 3, type: "dashed" },
        itemStyle: { color: C.terracota },
        areaStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [
            { offset: 0, color: "rgba(16,169,158,0.22)" }, { offset: 1, color: "rgba(16,169,158,0.01)" }] },
        },
        markLine: {
          symbol: "none", data: [{ yAxis: 3.28 }],
          lineStyle: { color: C.clay, type: "dashed" },
          label: { formatter: "pico 2022", color: C.muted, position: "insideStartTop" },
        },
      },
    ],
  };
}

// ---------- Predictor: aguja de probabilidad de éxito ----------
export function gaugeOption(prob: number): EChartsCoreOption {
  const pct = Math.round(prob * 1000) / 10;
  return {
    textStyle: baseText,
    series: [
      {
        type: "gauge",
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: "100%",
        center: ["50%", "58%"],
        progress: { show: true, width: 16, roundCap: true },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 16,
            color: [
              [0.25, C.reducir],
              [0.45, C.vigilar],
              [1, C.potenciar],
            ],
          },
        },
        pointer: { width: 5, length: "62%", itemStyle: { color: C.ink } },
        anchor: { show: true, size: 14, itemStyle: { color: C.ink } },
        axisTick: { distance: -16, length: 4, lineStyle: { color: "#fff" } },
        splitLine: { distance: -16, length: 16, lineStyle: { color: "#fff", width: 2 } },
        axisLabel: { distance: 22, color: C.muted, fontSize: 10, formatter: (v: number) => `${v}` },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "32%"],
          fontSize: 38,
          fontWeight: 700,
          fontFamily: "Fraunces, serif",
          color: C.ink,
          formatter: () => `${pct}%`,
        },
        data: [{ value: pct }],
      },
    ],
  };
}

// ---------- Predictor: waterfall de explicabilidad (aportación por factor) ----------
export function waterfallOption(
  steps: { name: string; from: number; to: number; kind: "base" | "pos" | "neg" | "total" }[],
): EChartsCoreOption {
  const color = (k: string) =>
    k === "base" ? C.muted : k === "total" ? C.terracota : k === "pos" ? C.potenciar : C.reducir;
  return {
    textStyle: baseText,
    grid: { left: 90, right: 40, top: 10, bottom: 24 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (ps: { dataIndex: number }[]) => {
        const s = steps[ps[0].dataIndex];
        const delta = Math.round((s.to - s.from) * 1000) / 10;
        return `${s.name}: ${s.kind === "neg" ? "" : "+"}${delta} pp`;
      },
    },
    xAxis: {
      type: "value",
      min: 0,
      max: 1,
      axisLabel: { color: C.muted, formatter: (v: number) => `${Math.round(v * 100)}%` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: steps.map((s) => s.name),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        stack: "w",
        itemStyle: { color: "transparent" },
        data: steps.map((s) => Math.min(s.from, s.to)),
      },
      {
        type: "bar",
        stack: "w",
        data: steps.map((s) => ({ value: Math.abs(s.to - s.from), itemStyle: { color: color(s.kind), borderRadius: 3 } })),
        barWidth: "58%",
      },
    ],
  };
}

// ---------- Predictor: aportación de cada factor (barras divergentes, en puntos) ----------
export function factorsBarOption(contribs: { name: string; c: number }[]): EChartsCoreOption {
  const pts = contribs.map((f) => Math.round(f.c * 1000) / 10); // puntos porcentuales
  const maxAbs = Math.max(6, ...pts.map((v) => Math.abs(v))) * 1.25;
  return {
    textStyle: baseText,
    grid: { left: 84, right: 36, top: 6, bottom: 20 },
    tooltip: {
      trigger: "item",
      formatter: (p: { name: string; value: number }) =>
        `${p.name}: ${p.value >= 0 ? "+" : ""}${p.value} puntos`,
    },
    xAxis: {
      type: "value",
      min: -maxAbs,
      max: maxAbs,
      axisLabel: { color: C.muted, formatter: (v: number) => `${v > 0 ? "+" : ""}${v}` },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: contribs.map((f) => f.name),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        data: pts.map((v) => ({ value: v, itemStyle: { color: v >= 0 ? C.potenciar : C.reducir, borderRadius: 3 } })),
        barWidth: "55%",
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { value: number }) => `${p.value >= 0 ? "+" : ""}${p.value}`,
        },
        markLine: { silent: true, symbol: "none", data: [{ xAxis: 0 }], lineStyle: { color: C.muted } },
      },
    ],
  };
}

// ---------- Predictor: comparación de probabilidad por mercado (mismo título) ----------
export function marketCompareOption(rows: { pais: string; p: number; current: boolean }[]): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 96, right: 50, top: 6, bottom: 18 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => `${v}%` },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: C.muted, formatter: "{value}%" },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: rows.map((r) => r.pais),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        barWidth: "62%",
        data: rows.map((r) => ({
          value: Math.round(r.p * 1000) / 10,
          itemStyle: { color: r.current ? C.terracota : C.clay, borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { value: number }) => `${p.value}%`,
        },
      },
    ],
  };
}

// ---------- Predictor: importancia de variables ----------
export function importanceOption(): EChartsCoreOption {
  const d = [...modelImportances].sort((a, b) => a.importance - b.importance);
  return {
    textStyle: baseText,
    grid: { left: 86, right: 44, top: 6, bottom: 18 },
    tooltip: { trigger: "item", valueFormatter: (v: number) => `${v}%` },
    xAxis: { type: "value", axisLabel: { color: C.muted, formatter: "{value}%" }, splitLine: { lineStyle: { color: C.line, type: "dashed" } } },
    yAxis: {
      type: "category",
      data: d.map((x) => x.feature),
      axisLine: { lineStyle: { color: C.line } },
      axisTick: { show: false },
      axisLabel: { color: C.ink, fontWeight: 500 },
    },
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: d.map((x, i) => ({ value: x.importance, itemStyle: { color: i === d.length - 1 ? C.terracota : C.clay } })),
        label: { show: true, position: "right", color: C.inkSoft, fontWeight: 600, formatter: (p: { value: number }) => `${p.value}%` },
        itemStyle: { borderRadius: [0, 5, 5, 0] },
      },
    ],
  };
}

// ---------- Sparkline minimalista (detalle de celda / tendencia de mercado) ----------
export function sparklineOption(values: number[], labels: string[] = ["2021", "2022", "2023", "2024", "2025"]): EChartsCoreOption {
  return {
    textStyle: baseText,
    grid: { left: 4, right: 4, top: 18, bottom: 4 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `${(v as number).toLocaleString("es-ES")} €`,
    },
    xAxis: { type: "category", data: labels, show: false },
    yAxis: { type: "value", show: false, scale: true },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { color: C.terracota, width: 2 },
        itemStyle: { color: C.terracota },
        label: {
          show: true,
          position: "top",
          fontSize: 9,
          color: C.muted,
          formatter: (p: { dataIndex: number; value: number }) =>
            p.dataIndex === 0 || p.dataIndex === values.length - 1 ? `${Math.round(p.value / 1000)}k` : "",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16,169,158,0.22)" },
              { offset: 1, color: "rgba(16,169,158,0.01)" },
            ],
          },
        },
      },
    ],
  };
}

// ---------- Clientes: aportación de ventas por segmento RFM (real) ----------
export function rfmContributionOption(): EChartsCoreOption {
  const tonoColor: Record<string, string> = {
    top: C.terracota,
    bien: C.mantener,
    riesgo: C.reducir,
    neutro: C.clay,
  };
  const segs = rfm.segmentos;
  return {
    textStyle: baseText,
    grid: { left: 150, right: 90, top: 12, bottom: 24 },
    tooltip: {
      trigger: "item",
      formatter: (p: { dataIndex: number }) => {
        const s = segs[p.dataIndex];
        return `<b>${s.nombre}</b><br/>${s.pctVentas}% de las ventas<br/>${s.clientes} clientes (${s.pctClientes}%)`;
      },
    },
    xAxis: {
      type: "value",
      axisLabel: { color: C.muted, formatter: "{value}%" },
      splitLine: { lineStyle: { color: C.line, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: segs.map((s) => s.nombre),
      axisLine: { lineStyle: { color: C.line } },
      axisLabel: { color: C.ink, fontWeight: 500 },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        barWidth: "60%",
        data: segs.map((s) => ({
          value: s.pctVentas,
          itemStyle: { color: tonoColor[s.tono] ?? C.clay },
        })),
        label: {
          show: true,
          position: "right",
          color: C.inkSoft,
          fontWeight: 600,
          formatter: (p: { dataIndex: number }) =>
            `${segs[p.dataIndex].pctVentas}%  ·  ${segs[p.dataIndex].clientes} cli.`,
        },
        itemStyle: { borderRadius: [0, 6, 6, 0] },
      },
    ],
  };
}

// ---------- Catálogo: segmentos de precio por unidades (real) ----------
export function priceSegmentsOption(): EChartsCoreOption {
  const palette = [C.terracota, C.clay, C.vigilar, C.terracotaDeep];
  return {
    textStyle: baseText,
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    legend: { bottom: 0, textStyle: { color: C.inkSoft } },
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        label: { color: C.ink, formatter: "{d}%", fontWeight: 600 },
        data: catalogo.preciosSegmento.map((p, i) => ({
          name: p.nombre,
          value: p.pct,
          itemStyle: { color: palette[i % palette.length] },
        })),
      },
    ],
  };
}
