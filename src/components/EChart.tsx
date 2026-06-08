import { useEffect, useRef } from "react";
import * as echarts from "echarts";

type Props = {
  option: echarts.EChartsCoreOption;
  className?: string;
  height?: number | string;
  // Eventos opcionales del gráfico (p. ej. clic en una celda de la matriz).
  onClick?: (params: { data?: unknown; value?: unknown; name?: string; componentType?: string }) => void;
};

// Envoltorio de ECharts: inicializa, actualiza opciones, se redimensiona y propaga clics.
export default function EChart({ option, className, height = 380, onClick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  // Guardamos el handler en una ref para no re-inicializar el chart en cada render.
  const clickRef = useRef(onClick);
  clickRef.current = onClick;

  useEffect(() => {
    if (!el.current) return;
    const instance = echarts.init(el.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (params) => clickRef.current?.(params as Parameters<NonNullable<Props["onClick"]>>[0]));
    const ro = new ResizeObserver(() => instance.resize());
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      instance.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, true);
  }, [option]);

  return <div ref={el} className={className} style={{ width: "100%", height }} />;
}
