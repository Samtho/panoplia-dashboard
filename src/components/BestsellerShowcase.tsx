import Reveal from "./Reveal";
import { topLibros } from "../data/bi";

const base = import.meta.env.BASE_URL;

// Mapa título -> portada curada (por palabra clave).
const COVER: { kw: string; file: string }[] = [
  { kw: "Truenos", file: "truenos.jpg" }, { kw: "Cristalinas", file: "caminar.webp" },
  { kw: "Fiestas", file: "fiestas.jpg" }, { kw: "Sadako", file: "sadako.jpg" },
  { kw: "Georgia", file: "georgia.jpg" }, { kw: "Cerebro", file: "cerebro.jpg" },
  { kw: "Princesas", file: "princesas.jpg" }, { kw: "Pas", file: "quetepaso.jpg" },
  { kw: "Adaptacion", file: "adaptacion.jpg" }, { kw: "Nocturnos", file: "enciclopedia.webp" },
];
const coverFor = (t: string) => COVER.find((c) => t.includes(c.kw))?.file;

// Top libros con portada, deduplicados por portada (ediciones repetidas).
const seen = new Set<string>();
const BOOKS = topLibros
  .map((b) => ({ ...b, cover: coverFor(b.titulo) }))
  .filter((b) => b.cover && !seen.has(b.cover!) && (seen.add(b.cover!), true))
  .slice(0, 5);

export default function BestsellerShowcase() {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold mb-1">La cabeza de la cola larga: los superventas reales</h3>
      <p className="text-sm text-ink-soft mb-5">
        De los 99.985 títulos, un puñado concentra las ventas. Estos son los más vendidos de Panoplia: libros reales detrás de los números.
      </p>
      <div className="grid grid-cols-5 gap-3 md:gap-4">
        {BOOKS.map((b, i) => (
          <Reveal key={b.titulo} delay={i * 70}>
            <figure className="group" data-cursor>
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-line shadow-sm bg-paper-soft">
                <img
                  src={`${base}covers/${b.cover}`}
                  alt={b.titulo}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <figcaption className="mt-2">
                <div className="text-xs font-medium text-ink leading-snug line-clamp-2">{b.titulo}</div>
                <div className="text-xs text-muted mt-0.5">
                  <span className="font-semibold text-terracota">{b.uds.toLocaleString("es-ES")}</span> uds · {b.genero}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
