import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useSmoothScroll } from "./lib/motion";
import EChart from "./components/EChart";
import MatrixCockpit from "./components/MatrixCockpit";
import LaunchSimulator from "./components/LaunchSimulator";
import ScenarioSimulator from "./components/ScenarioSimulator";
import BestsellerShowcase from "./components/BestsellerShowcase";
import PowerBIWorkspace from "./components/PowerBIWorkspace";
import FlatMap from "./components/FlatMap";
import DefensePanel from "./components/DefensePanel";
import Counter from "./components/Counter";
import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import MobileMenu from "./components/MobileMenu";
import { Card, Kpi, Recommendation, SectionHeader, Verdict } from "./components/ui";
import {
  catalogReconstructionOption,
  concentrationOption,
  diagnosisOption,
  exportMarketsOption,
  genresOption,
  longTailOption,
  monthlySeriesOption,
  priceSegmentsOption,
  rfmContributionOption,
  seasonalityOption,
  seasonByYearOption,
  setChartTheme,
} from "./charts/options";
import {
  catalogo,
  concentracion,
  forecast,
  hojaDeRuta,
  kpis,
  matrizConteo,
  matrizMeta,
  meta,
  rfm,
} from "./data/panoplia";

const NAV = [
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "mercados", label: "Mercados" },
  { id: "catalogo", label: "Catálogo" },
  { id: "generos", label: "Géneros" },
  { id: "clientes", label: "Clientes" },
  { id: "forecast", label: "Demanda" },
  { id: "predictor", label: "Predictor IA" },
  { id: "ruta", label: "Hoja de ruta" },
];

export default function App() {
  const conc = useMemo(concentrationOption, []);
  const diag = useMemo(diagnosisOption, []);
  const catRecon = useMemo(catalogReconstructionOption, []);
  const longtail = useMemo(longTailOption, []);
  const expMkt = useMemo(exportMarketsOption, []);
  const price = useMemo(priceSegmentsOption, []);
  const gen = useMemo(genresOption, []);
  const rfmChart = useMemo(rfmContributionOption, []);
  const monthly = useMemo(monthlySeriesOption, []);
  const season = useMemo(seasonalityOption, []);
  const seasonYear = useMemo(seasonByYearOption, []);

  const [juryOn, setJuryOn] = useState(false);
  const [active, setActive] = useState<string>("");
  const [biView, setBiView] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [themeKey, setThemeKey] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  // Modo oscuro: tokens CSS + paleta de gráficos (remonta para que los charts se recoloren).
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    setChartTheme(next);
    setThemeKey((k) => k + 1);
  }

  // Scroll cinemático (Lenis) en toda la página.
  useSmoothScroll();

  // Entrada del hero con GSAP (escalonada, tipo web premiada).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", { y: 34, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.13, delay: 0.05 });
    });
    return () => ctx.revert();
  }, []);

  // Reveal on scroll: revela cada sección al entrar en viewport (una sola vez).
  useEffect(() => {
    const els = mainRef.current?.querySelectorAll<HTMLElement>("section.reveal");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [themeKey]);

  // Scrollspy: resalta el enlace de nav de la sección visible.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [themeKey]);

  // Vista Power BI: experiencia independiente (no es la presentación).
  if (biView) return <PowerBIWorkspace onExit={() => setBiView(false)} />;

  return (
    <div className={`min-h-screen transition-[padding] ${juryOn ? "pl-16" : ""}`}>
      <Preloader />
      <CustomCursor />
      {/* ---------- Nav (sticky header con sección activa) ---------- */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-paper/85 border-b border-line">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
          <a href="#top" className="font-display font-semibold text-lg tracking-tight shrink-0">
            Panoplia<span className="text-terracota">.</span>
          </a>
          {/* Títulos en la cabecera, con marcado de la sección activa al hacer scroll */}
          <div className="hidden lg:flex gap-4 text-sm text-ink-soft">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}
                className={`relative py-1 transition-colors hover:text-terracota ${active === n.id ? "text-terracota font-medium" : ""}`}>
                {n.label}
                {active === n.id && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded bg-terracota" />}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleTheme} aria-label="Cambiar tema"
              className="rounded-full h-9 w-9 grid place-items-center text-base border bg-card text-ink-soft border-line hover:border-terracota hover:text-terracota transition-colors">
              {dark ? "☀" : "☾"}
            </button>
            <button onClick={() => setBiView(true)}
              className="hidden lg:inline-flex rounded-full px-3 py-1.5 text-sm font-medium border border-terracota text-terracota hover:bg-terracota hover:text-white transition-colors">
              ▦ Power BI
            </button>
            <button onClick={() => setJuryOn((v) => !v)}
              className={`hidden lg:inline-flex rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${juryOn ? "bg-terracota text-white border-terracota" : "bg-card text-ink-soft border-line hover:border-terracota hover:text-terracota"}`}>
              Defensa
            </button>
            <button onClick={() => setMobileOpen(true)} aria-label="Menú"
              className="lg:hidden rounded-full h-9 w-9 grid place-items-center text-lg border bg-card text-ink-soft border-line">
              ☰
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <MobileMenu nav={NAV} active={active} juryOn={juryOn}
          onClose={() => setMobileOpen(false)} onPowerBI={() => setBiView(true)} onDefensa={() => setJuryOn((v) => !v)} />
      )}
      {juryOn && <DefensePanel active={active} onClose={() => setJuryOn(false)} />}

      {/* ---------- Hero ---------- */}
      <header id="top" className="relative mx-auto max-w-6xl px-5 pt-16 pb-12 overflow-hidden">
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-anim text-terracota font-semibold tracking-[0.18em] uppercase text-xs mb-4">
          {meta.subtitulo}
        </p>
        <h1 className="hero-anim font-display text-4xl md:text-6xl font-semibold leading-[1.05] max-w-4xl">
          ¿Está Panoplia tomando las decisiones correctas con sus datos?
        </h1>
        <p className="hero-anim mt-6 max-w-2xl text-lg text-ink-soft leading-relaxed">
          {meta.empresa} mueve {kpis.facturacion} en {meta.periodo}, pero decide casi a ciegas. Este
          cuadro de mando responde, con evidencia, a tres preguntas: <strong>¿lo está haciendo
          bien?</strong>, <strong>¿puede seguir exportando?</strong> y <strong>¿qué géneros y
          clientes priorizar?</strong>
        </p>

        <div className="hero-anim mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line">
          {[
            {
              value: <Counter to={15.4} format={(v) => `≈${v.toFixed(1).replace(".", ",")} M€`} />,
              label: "Facturación acumulada (2021-2026)",
            },
            {
              value: <Counter to={kpis.titulos} format={(v) => Math.round(v).toLocaleString("es-ES")} />,
              label: "Títulos únicos reconstruidos",
            },
            {
              value: <Counter to={kpis.clientes} format={(v) => Math.round(v).toString()} />,
              label: "Clientes B2B activos",
            },
            {
              value: <Counter to={kpis.margenBruto} format={(v) => `${v.toFixed(1).replace(".", ",")}%`} />,
              label: "Margen bruto medio",
            },
          ].map((k) => (
            <div key={k.label} className="bg-paper">
              <Kpi value={k.value} label={k.label} />
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-muted max-w-2xl">{meta.disclaimer}</p>
      </header>

      <main key={themeKey} ref={mainRef} className="mx-auto max-w-6xl px-5 pt-10 pb-20 space-y-16 md:space-y-24">
        {/* ---------- 00. Diagnóstico ---------- */}
        <section id="diagnostico" className="reveal">
          <SectionHeader
            kicker="00 · El diagnóstico"
            question="Se dice exportadora, pero los datos cuentan otra historia."
            lead="Cuatro hechos, extraídos de su propio histórico de facturación, enmarcan todo lo demás: una empresa concentrada en España, en caída, con un catálogo mucho mayor del que creía y una larguísima cola de títulos casi inertes."
          />
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-display text-lg font-semibold mb-1">El 91,86% es España</h3>
              <p className="text-sm text-ink-soft mb-3">De los 15,4 M€, solo 1,26 M€ (8,14%) salen al exterior.</p>
              <EChart option={conc} height={90} />
              <p className="text-xs text-muted mt-3">Se declara exportadora, pero vive del mercado doméstico. La diversificación es la palanca pendiente.</p>
            </Card>
            <Card>
              <h3 className="font-display text-lg font-semibold mb-1">Cae mientras el sector crece</h3>
              <p className="text-sm text-ink-soft mb-2">Ventas indexadas (2022 = 100). Caída del 18,3% desde el pico.</p>
              <EChart option={diag} height={230} />
            </Card>
            <Card>
              <h3 className="font-display text-lg font-semibold mb-1">Un catálogo 13 veces mayor</h3>
              <p className="text-sm text-ink-soft mb-2">En Excel gestionaban 7.479 títulos; el universo real son 99.985.</p>
              <EChart option={catRecon} height={210} />
            </Card>
            <Card>
              <h3 className="font-display text-lg font-semibold mb-1">El 5% de los títulos hace el 53%</h3>
              <p className="text-sm text-ink-soft mb-2">Una cola larguísima esconde a unos pocos superventas.</p>
              <EChart option={longtail} height={230} />
            </Card>
          </div>
          <div className="mt-6">
            <Verdict tone="alerta">
              Cuatro señales de alerta a la vez: dependencia extrema de España, ventas en descenso, un catálogo a oscuras y ventas hiperconcentradas en pocos títulos. El resto del cuadro de mando convierte cada una en decisiones.
            </Verdict>
          </div>
          <Card className="mt-6">
            <BestsellerShowcase />
          </Card>
        </section>

        {/* ---------- 1. Mercados ---------- */}
        <section id="mercados" className="reveal">
          <SectionHeader
            kicker="01 · ¿Puede seguir exportando?"
            question="Se llama exportadora, pero vive del mercado doméstico."
            lead={`El ${concentracion.domestico}% de la facturación es España (${concentracion.ventasEspana}) y solo el ${concentracion.exportacion}% sale al exterior (${concentracion.ventasExport}). México ya es el segundo mercado: la diversificación es real.`}
          />
          <div className="relative left-1/2 -translate-x-1/2 w-screen bg-paper-soft/40 border-y border-line py-8 mb-8">
            <div className="mx-auto max-w-6xl px-5 mb-1">
              <h3 className="font-display text-xl font-semibold mb-1">El mapa de la exportación</h3>
              <p className="text-sm text-ink-soft">
                Cada flecha sale de Madrid hacia un mercado. El grosor y el tamaño reflejan el volumen: México domina, el resto son hilos finos. Filtra por país.
              </p>
            </div>
            <FlatMap />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold mb-1">
                Dentro de la exportación (escala logarítmica)
              </h3>
              <p className="text-sm text-ink-soft mb-2">
                México concentra el {concentracion.mexicoSobreExport}% de todo lo que sale al exterior; el resto son mercados marginales.
              </p>
              <EChart option={expMkt} height={320} />
            </Card>
            <div className="space-y-4">
              <Verdict tone="oportunidad">{concentracion.veredicto}</Verdict>
              <Recommendation>
                Convertir México (6,28%) en el primer mercado de desarrollo activo y fijar un objetivo de
                cuota exportadora a 24 meses. La dependencia del 91,86% doméstico es el mayor riesgo y la
                mayor oportunidad a la vez.
              </Recommendation>
            </div>
          </div>
        </section>

        {/* ---------- 2. Catálogo ---------- */}
        <section id="catalogo" className="reveal">
          <SectionHeader
            kicker="02 · ¿Qué tiene realmente en catálogo?"
            question="Margen alto, pero el dato a oscuras."
            lead={`Ya viste que el universo real son ${catalogo.titulos.toLocaleString("es-ES")} títulos (13x lo que se gestionaba en Excel). El problema ahora es de gobernanza: el ${catalogo.lineasSinCoste}% de las líneas no registra coste, así que el margen real es en parte una incógnita.`}
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold mb-2">Unidades por segmento de precio</h3>
              <EChart option={price} height={300} />
            </Card>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { v: `${catalogo.margenBruto}%`, l: "Margen bruto medio" },
                { v: `${catalogo.descuentoMedio}%`, l: "Descuento medio sobre PVP" },
                { v: `${catalogo.lineasSinCoste}%`, l: "Líneas sin coste registrado" },
                { v: catalogo.ventasPorTitulo, l: "Ventas por título" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-line bg-paper-soft p-4">
                  <div className="font-display text-2xl font-semibold text-terracota">{s.v}</div>
                  <div className="text-xs text-muted mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <Verdict tone="oportunidad">{catalogo.veredicto}</Verdict>
            <Recommendation>
              Aflorar el long tail invisible para decisiones de stock e impresión bajo demanda, y exigir el
              registro de coste en cada línea: sin coste no hay margen real ni decisiones de rentabilidad
              fiables. El grueso del volumen está en el tramo medio (10-20 €).
            </Recommendation>
          </div>
        </section>

        {/* ---------- 4. Géneros ---------- */}
        <section id="generos" className="reveal">
          <SectionHeader
            kicker="03 · ¿Qué géneros potenciar o reducir?"
            question="Un catálogo equilibrado, liderado por Infantil y Juvenil."
            lead="Ningún género domina: las ventas se reparten entre los nueve. Infantil y Juvenil lidera (2,21 M€) y es el más consistente entre mercados, alineado con la tendencia del sector. La decisión fina es por combinación género × mercado."
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <EChart option={gen} height={360} />
            </Card>
            <div className="space-y-4">
              <Verdict tone="oportunidad">
                Catálogo diversificado: el riesgo no es de mix de género, sino de mercado y de cliente.
              </Verdict>
              <Recommendation>
                Mantener la amplitud, reforzar Infantil y Juvenil como punta de lanza exportadora (es el
                género más dinámico del sector) y usar la matriz género × mercado para decidir dónde
                potenciar o reducir.
              </Recommendation>
            </div>
          </div>
          <Card className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h3 className="font-display text-lg font-semibold">
                Cockpit de decisión · matriz género × mercado (108 cruces)
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span><b className="text-ink">{matrizConteo.POTENCIAR}</b> Potenciar</span>
                <span><b className="text-ink">{matrizConteo.MANTENER}</b> Mantener</span>
                <span><b className="text-ink">{matrizConteo.VIGILAR}</b> Vigilar</span>
                <span><b className="text-ink">{matrizConteo.REDUCIR}</b> Reducir</span>
              </div>
            </div>
            <p className="text-sm text-ink-soft mb-4">{matrizMeta.metodologia}</p>
            <MatrixCockpit />
          </Card>
        </section>

        {/* ---------- 5. Clientes (RFM real) ---------- */}
        <section id="clientes" className="reveal">
          <SectionHeader
            kicker="04 · ¿A qué clientes cuidar?"
            question="El 24% de los clientes genera el 75% de las ventas."
            lead="La segmentación RFM de los 722 clientes revela una concentración extrema: los 'Campeones' (175 clientes) aportan tres cuartas partes de la facturación. Y hay 1,04 M€ enfriándose en solo 44 clientes 'En Riesgo'."
          />
          <Card className="mb-6">
            <h3 className="font-display text-lg font-semibold mb-2">¿Qué es RFM y por qué "Campeones"?</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {[
                { l: "Recencia", d: "¿Hace cuánto que compró por última vez? Cuanto más reciente, mejor." },
                { l: "Frecuencia", d: "¿Cuántas veces compra? Cuantas más, más fiel." },
                { l: "Monetario", d: "¿Cuánto factura? Cuanto más gasta, más valioso." },
              ].map((x) => (
                <div key={x.l} className="rounded-xl border border-line bg-paper-soft p-4">
                  <div className="font-display font-semibold text-terracota">{x.l}</div>
                  <div className="text-sm text-ink-soft mt-1">{x.d}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">
              Cada cliente se clasifica con estas tres señales (R, F, M) y cae en un segmento. Los
              <b className="text-ink"> "Campeones"</b> son los mejores en las tres a la vez: compran a menudo,
              hace poco y mucho. Son <b>175 clientes (el 24% de la base)</b> y, ellos solos, generan el
              <b className="text-ink"> 75% de la facturación</b>: una cuarta parte de los clientes sostiene tres
              cuartas partes del negocio. Por eso son los que primero hay que blindar, y por eso los 44
              <b className="text-ink"> "En Riesgo"</b> (1,04 M€ enfriándose) son la alerta más urgente.
            </p>
          </Card>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold mb-2">Aportación a las ventas por segmento RFM</h3>
              <EChart option={rfmChart} height={380} />
            </Card>
            <div className="space-y-4">
              <Verdict tone="alerta">{rfm.veredicto}</Verdict>
              <Recommendation>
                Blindar a los Campeones y lanzar ya un protocolo de reactivación para los 44 clientes "En
                Riesgo" (1,04 M€) antes de que migren a inactivos. La pérdida de un solo cliente del Top 5
                (21% conjunto) impacta de inmediato.
              </Recommendation>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              rfm.segmentos[0], // Campeones
              rfm.segmentos[1], // Leales
              rfm.segmentos[2], // En Riesgo
              rfm.segmentos[3], // Necesitan Atención
            ].map((s) => (
              <div key={s.nombre} className="rounded-xl border border-line bg-paper-soft p-4">
                <div className="font-display font-semibold text-ink">{s.nombre}</div>
                <div className="text-2xl font-display font-semibold text-terracota mt-1">
                  {s.pctVentas}%
                </div>
                <div className="text-xs text-muted mt-1">
                  {s.clientes} clientes · {s.pctClientes}% de la base
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- 6. Demanda: patrón temporal y forecast ---------- */}
        <section id="forecast" className="reveal">
          <SectionHeader
            kicker="05 · ¿Se puede anticipar la demanda?"
            question="La demanda no es plana: tiene estacionalidad fuerte."
            lead="63 meses de ventas reales revelan un patrón estacional marcado. Sobre él se construye el modelo predictivo (XGBoost + SHAP) que anticipa el rendimiento de un título por mercado."
          />
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="font-display text-lg font-semibold mb-1">Ventas netas mensuales (2021 - 2026)</h3>
              <p className="text-sm text-ink-soft mb-2">La línea sube y baja cada año con el mismo ritmo: eso es estacionalidad, no azar. La tendencia de fondo, además, es decreciente.</p>
              <EChart option={monthly} height={290} />
            </Card>
            <Card>
              <h3 className="font-display text-lg font-semibold mb-1">¿Qué meses venden más?</h3>
              <p className="text-sm text-ink-soft mb-2">Índice 100 = mes medio. Verde = pico, rojo = valle.</p>
              <EChart option={season} height={290} />
            </Card>
          </div>
          {/* Lectura de negocio: qué significan los picos y valles */}
          <div className="mt-6 grid md:grid-cols-3 gap-3">
            {[
              { t: "Picos: julio y noviembre", d: "Hasta +34% sobre la media. Son las ventanas para empujar lanzamientos y campañas de exportación: la demanda ya está alta.", tone: "text-potenciar" },
              { t: "Valle: agosto", d: "Hasta -35%. Mes flojo (vacaciones del canal librero). Mejor no concentrar lanzamientos ni stock aquí.", tone: "text-reducir" },
              { t: "Qué hacer con esto", d: "Planificar compras, impresión bajo demanda y esfuerzo comercial según el calendario real, no a ojo. El modelo de IA usa este patrón.", tone: "text-ink" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-line bg-paper-soft p-4">
                <div className={`font-display font-semibold ${x.tone}`}>{x.t}</div>
                <div className="text-sm text-ink-soft mt-1">{x.d}</div>
              </div>
            ))}
          </div>
          <Card className="mt-6">
            <h3 className="font-display text-lg font-semibold mb-1">Compara año a año</h3>
            <p className="text-sm text-ink-soft mb-3">
              Cada línea es un año. Se ve el mismo patrón estacional repetido, pero el nivel general baja: 2025 (turquesa intenso) corre por debajo de 2022. Haz clic en un año de la leyenda para aislarlo o compararlo.
            </p>
            <EChart option={seasonYear} height={320} />
          </Card>
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Verdict tone="neutro">{forecast.veredicto}</Verdict>
            </div>
            <Recommendation>
              Planificar stock e impresión bajo demanda según el calendario real: reforzar de cara a los
              picos de julio y noviembre, contener en agosto. {forecast.nota}
            </Recommendation>
          </div>
        </section>

        {/* ---------- 6b. Predictor IA (modelo real) ---------- */}
        <section id="predictor" className="reveal">
          <SectionHeader
            kicker="06 · IA aplicada a la decisión"
            question="Un modelo que predice el éxito de un título antes de lanzarlo."
            lead="Entrenado sobre 112.598 pares título-mercado reales (Gradient Boosting, familia XGBoost). Configura un lanzamiento hipotético y el modelo estima su probabilidad de éxito y, sobre todo, explica por qué."
          />
          <LaunchSimulator />
        </section>

        {/* ---------- 7. Hoja de ruta ---------- */}
        <section id="ruta" className="reveal">
          <SectionHeader
            kicker="07 · ¿Qué hacer ahora?"
            question="Una hoja de ruta accionable a tres horizontes."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {hojaDeRuta.map((h, i) => (
              <div key={h.horizonte} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display text-3xl text-terracota">{i + 1}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {h.horizonte}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-3">{h.titulo}</h3>
                <ul className="space-y-2 text-sm text-ink-soft">
                  {h.acciones.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-terracota">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <ScenarioSimulator />
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted flex flex-col md:flex-row gap-2 justify-between">
          <span>{meta.titulo}</span>
          <span>TFM INESDI · Business Analytics e IA · Grupo 4</span>
        </div>
      </footer>
    </div>
  );
}
