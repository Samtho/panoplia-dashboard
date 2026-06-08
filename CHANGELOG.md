# Registro de cambios · Cuadro de mando Panoplia

Cada entrada es un punto recuperable. En GitHub, cada commit y cada **tag** (v1.0, v1.1…) es un
punto de restauración: se puede volver a cualquiera con `git checkout <tag>` o desde la pestaña
"Releases/Tags" del repositorio.

## v1.0 — 2026-06-08 · Estado estable previo al rediseño de Anexos
- Presentación completa: Diagnóstico, Mercados (mapa), Catálogo, Géneros (cockpit + matriz),
  Clientes (RFM), Demanda, Predictor IA, Gobernanza del dato, Hoja de ruta.
- Vista **Power BI** (réplica nativa del cuadro del equipo).
- Vista **Anexos técnicos**: modelo de datos en estrella, código de los modelos (resaltado),
  resultados (métricas, benchmark, matriz de confusión).
- Modo claro/oscuro, responsive móvil, header corregido, cursor y preloader.
- Galería Top 5 portadas + miniaturas en el Top 10 de Power BI.
- Publicado en GitHub Pages: https://samtho.github.io/panoplia-dashboard/

## v1.1 — 2026-06-08 · Rediseño de Anexos (UI premium + decisión)
- Anexos rediseñado en oscuro con enfoque decisión + técnica (cada bloque con su "para el negocio").
- Nueva pestaña **"Cómo y dónde se hizo"**: entorno, flujo de Excel a decisión y dónde se alojan los modelos (local + GitHub Pages; Azure como futuro).
- Nueva pestaña **"Decisión por objetivo"** (puntos de operación): el mismo modelo con 3 umbrales (cobertura máxima / equilibrio / riesgo mínimo) y la curva del compromiso. Números reales.
- Código unificado en una pestaña con selector; resaltado de sintaxis y cabecera de archivo.
- Script nuevo `_analisis/09_operating_points.py` → `web/src/data/operating.ts`.

<!-- Próximas entradas arriba de esta línea. Formato: ## vX.Y — fecha · título -->
