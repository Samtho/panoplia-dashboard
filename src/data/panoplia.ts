// Fuente única de datos de la web. Cifras reales calculadas del histórico de facturación
// (dataset 2021 a inicios de 2026) y cruzadas con el docx canónico
// (documento/TFM_Panoplia_INESDI_v2_1.docx). Las series y matrices pesadas se generan en
// computed.ts desde el dataset (ver _analisis/02_calculo_web.py) y se re-exportan abajo.
// Modo de confidencialidad: clientes pseudonimizados, datos académicos (ver disclaimer).

// Re-exporta los datos calculados desde el dataset real (no editar a mano: regenerar).
export {
  ventasMensuales,
  ventasAnualesReal,
  estacionalidad,
  mercadosReal,
  mercadoAnio,
  matriz,
  matrizRanking,
  matrizConteo,
  MERCADOS_ORDEN,
  longTail,
} from "./computed";

export const meta = {
  empresa: "Panoplia de Libros, S.L.",
  titulo:
    "Estrategia de diversificación de negocio para la optimización de las exportaciones",
  subtitulo: "Cuadro de mando estratégico · TFM INESDI · Grupo 4",
  periodo: "2021 a inicios de 2026",
  fundada: 2002,
  sede: "Madrid",
  disclaimer:
    "Datos con fines académicos. Clientes pseudonimizados y cifras tratadas de forma agregada. Algunas series están indexadas.",
};

// ---------- KPIs de cabecera (reales) ----------
export const kpis = {
  facturacion: "≈15,4 M€", // 15.454.978 EUR
  titulos: 99_985,
  clientes: 722,
  mercados: 12,
  generos: 9,
  registros: 372_979,
  facturas: 8_120,
  unidades: 1_750_322,
  margenBruto: 71.2, // %
  descuentoMedio: 40.3, // %
  ventasPorTitulo: "154,57 €",
};

// ---------- Pregunta 1: ¿Lo está haciendo bien? ----------
// Narrativa del diagnóstico. La serie indexada real (2021-2025, 2022 = 100) vive en
// ventasAnualesReal (computed.ts). Caída acumulada -18,3% (índice 2025 = 81,6).
export const ventasAnuales = {
  baseLabel: "2022 = 100 (pico histórico)",
  caidaAcumulada: -18.3,
  picoAbsoluto: "3,28 M€ (2022)",
  valle2025: "2,68 M€ (2025)",
  sectorCrecimiento2024: 6.3,
  veredicto:
    "Cae el 18,3% desde 2022 mientras el sector crece el 6,3%. Pierde cuota de mercado relativa.",
};

// ---------- Pregunta 2: ¿Puede seguir exportando? ----------
export const concentracion = {
  domestico: 91.86,
  exportacion: 8.14,
  ventasEspana: "14,20 M€",
  ventasExport: "1,26 M€",
  // México concentra el 77% de toda la exportación (969.603 € de 1,26 M€).
  mexicoSobreExport: 77,
  veredicto:
    "Se declara exportadora pero el 91,86% es doméstico. Y la exportación es, en realidad, México: concentra el 77% de todo lo que sale al exterior.",
};

// La cuota por mercado (12 mercados activos, reales) vive en mercadosReal (computed.ts).

// ---------- Pregunta 3: géneros (ventas reales) ----------
// Ventas netas por género (M€). Total ≈15,44M. Infantil y Juvenil lidera.
export const generos = [
  { nombre: "Infantil y Juvenil", ventasM: 2.21, pct: 14.3 },
  { nombre: "Literatura", ventasM: 2.09, pct: 13.5 },
  { nombre: "Historia y Pensamiento", ventasM: 2.02, pct: 13.1 },
  { nombre: "Ciencia y Tecnología", ventasM: 1.82, pct: 11.8 },
  { nombre: "Poesía y Teatro", ventasM: 1.65, pct: 10.7 },
  { nombre: "Arte y Humanidades", ventasM: 1.63, pct: 10.6 },
  { nombre: "Ciencias Sociales", ventasM: 1.44, pct: 9.3 },
  { nombre: "Religión y Espiritualidad", ventasM: 1.35, pct: 8.7 },
  { nombre: "Autoayuda", ventasM: 1.23, pct: 8.0 },
];

// ---------- Pregunta 3b: matriz scoring género x mercado (108 cruces, reales) ----------
// Los datos (matriz, ranking, conteo) se re-exportan desde computed.ts. Aquí, la metodología
// y la lectura. score = 0,25·CAGR + 0,25·tendencia reciente + 0,15·aceleración + 0,20·cuota
// relativa + 0,15·estabilidad. Umbrales: Potenciar ≥0,75, Mantener 0,55-0,74, Vigilar 0,35-0,54,
// Reducir <0,35.
export const matrizMeta = {
  metodologia:
    "Score multi-criterio (0-1) por cruce género × mercado: CAGR 25%, tendencia reciente 25%, aceleración 15%, cuota relativa 20%, estabilidad 15%.",
  umbrales: [
    { cat: "Potenciar", rango: "≥ 0,75", tono: "potenciar" },
    { cat: "Mantener", rango: "0,55 - 0,74", tono: "mantener" },
    { cat: "Vigilar", rango: "0,35 - 0,54", tono: "vigilar" },
    { cat: "Reducir", rango: "< 0,35", tono: "reducir" },
  ],
  // Lectura: el score premia la trayectoria, no solo el volumen. En mercados pequeños un
  // crecimiento desde base baja eleva el score: léase junto al volumen de cada mercado.
  caveat:
    "El score mide trayectoria y cuota relativa, no volumen absoluto. En micro-mercados un score alto señala potencial de desarrollo, no tamaño actual.",
  veredicto:
    "Infantil y Juvenil es el género más consistente: lidera el ranking de score medio entre los doce mercados, en línea con el TFM y con la tendencia del sector.",
};

// ---------- Pregunta 4: clientes (RFM real, 10 segmentos) ----------
// clientes = nº de clientes; pctVentas = % de la facturación total que aporta el segmento.
export const rfm = {
  totalClientes: 722,
  segmentos: [
    { nombre: "Campeones", clientes: 175, pctClientes: 24.2, pctVentas: 75.1, ventasEuro: 11_603_342, tono: "top" },
    { nombre: "Clientes Leales", clientes: 160, pctClientes: 22.2, pctVentas: 14.0, ventasEuro: 2_167_389, tono: "bien" },
    { nombre: "En Riesgo", clientes: 44, pctClientes: 6.1, pctVentas: 6.8, ventasEuro: 1_044_439, tono: "riesgo" },
    { nombre: "Necesitan Atención", clientes: 50, pctClientes: 6.9, pctVentas: 1.7, ventasEuro: 258_198, tono: "riesgo" },
    { nombre: "Hibernando", clientes: 34, pctClientes: 4.7, pctVentas: 1.4, ventasEuro: 223_466, tono: "neutro" },
    { nombre: "Poco Activos", clientes: 116, pctClientes: 16.1, pctVentas: 0.6, ventasEuro: 92_284, tono: "neutro" },
    { nombre: "Prometedores", clientes: 59, pctClientes: 8.2, pctVentas: 0.3, ventasEuro: 50_324, tono: "neutro" },
    { nombre: "Recientes", clientes: 47, pctClientes: 6.5, pctVentas: 0.1, ventasEuro: 13_542, tono: "neutro" },
    { nombre: "Perdidos", clientes: 36, pctClientes: 5.0, pctVentas: 0.0, ventasEuro: 1_287, tono: "neutro" },
    { nombre: "No Puedo Perderlos", clientes: 1, pctClientes: 0.1, pctVentas: 0.0, ventasEuro: 707, tono: "riesgo" },
  ],
  // Concentración Pareto (reales, clientes pseudonimizados)
  top5: 20.99,
  clienteTop: { alias: "LIBRERIA421", cuota: 7.37, ventas: "1,14 M€" },
  veredicto:
    "El 24% de clientes (Campeones) aporta el 75% de las ventas. Pero los 'En Riesgo' (solo 44 clientes) ya pesan 1,04 M€: el dinero se está enfriando.",
};

// ---------- Pregunta 5: catálogo ----------
export const catalogo = {
  titulos: 99_985,
  catalogoActivoExcel: "≈7.479",
  ratioReconstruccion: "≈13x",
  lineasSinCoste: 75,
  descuentoMedio: 40.3,
  margenBruto: 71.2,
  ventasPorTitulo: "154,57 €",
  // Segmentos de precio por unidades vendidas (reales)
  preciosSegmento: [
    { nombre: "Medio (10-20 €)", unidadesMil: 944, pct: 53.93 },
    { nombre: "Premium (20-35 €)", unidadesMil: 414, pct: 23.66 },
    { nombre: "Económico (<10 €)", unidadesMil: 345, pct: 19.7 },
    { nombre: "Lujo (>35 €)", unidadesMil: 47, pct: 2.7 },
  ],
  // Curva long tail real: el 5% de los títulos genera el 53% de las ventas; el 20%, el 79%.
  longTailResumen: {
    top5pct: 53.1,
    top20pct: 78.7,
    top1pct: 29.5,
  },
  veredicto:
    "El universo real es 13 veces el catálogo gestionado en Excel. La cola es larguísima: el 5% de los títulos hace el 53% de las ventas y el 75% de las líneas no registra coste.",
};

// ---------- Pregunta 6: patrón temporal y forecast ----------
// La serie mensual real (computed.ts) revela estacionalidad marcada sobre la que se construye
// el modelo predictivo. Picos en julio y noviembre; valle en agosto.
export const forecast = {
  metodo: "Machine Learning supervisado (XGBoost) + explicabilidad SHAP; PoC con LSTM",
  estacionalidad: {
    pico: "Julio y noviembre (≈ +34% sobre la media mensual)",
    valle: "Agosto (≈ -35% sobre la media)",
  },
  veredicto:
    "La demanda no es plana: tiene estacionalidad fuerte (picos en julio y noviembre, valle en agosto). El modelo XGBoost + SHAP usa este patrón para anticipar el rendimiento de un título por mercado.",
  nota:
    "Las métricas del modelo entrenado (precision, recall, ROC-AUC) se documentan en el Anexo C del TFM.",
};

// ---------- Contexto sectorial (FGEE 2024) ----------
export const sector = {
  mercadoInterior: "3.037,51 M€",
  crecimientoInterior: 6.3,
  exportacionSector: "361,31 M€",
  crecimientoExport: 4.04,
  canalLibrerias: 58.2,
};

// ---------- Hoja de ruta (3 horizontes) ----------
export const hojaDeRuta = [
  {
    horizonte: "0 a 90 días",
    titulo: "Frenar la fuga y limpiar el dato",
    acciones: [
      "Protocolo de retención para los 44 clientes 'En Riesgo' (1,04 M€ en juego).",
      "Estándares de calidad del dato: registrar coste en cada línea de factura.",
    ],
  },
  {
    horizonte: "6 meses",
    titulo: "Diversificar y estructurar",
    acciones: [
      "Desarrollo activo del mercado mexicano (6,28%, ya es el 2º mercado).",
      "Migrar el catálogo de Excel a PostgreSQL.",
    ],
  },
  {
    horizonte: "12 meses",
    titulo: "Institucionalizar",
    acciones: [
      "Migración a arquitectura cloud en Azure.",
      "Designar un responsable de gobernanza del dato.",
    ],
  },
];

// Todas las cifras y series de la web salen del histórico de facturación real. Lo único que
// no se reproduce aquí son las métricas del modelo XGBoost entrenado (Anexo C del TFM).
