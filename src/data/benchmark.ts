// Benchmark de modelos (ROC-AUC en test) sobre el mismo problema, todas las familias del temario.
// Generado por _analisis/05_benchmark_modelos.py. Gana la familia gradient boosting.
export const benchmark: { modelo: string; auc: number; ganador?: boolean }[] = [
  { modelo: "Gradient Boosting (XGBoost/LightGBM)", auc: 0.645, ganador: true },
  { modelo: "AdaBoost", auc: 0.620 },
  { modelo: "Random Forest", auc: 0.607 },
  { modelo: "Árbol de decisión", auc: 0.606 },
  { modelo: "Regresión Logística", auc: 0.588 },
  { modelo: "Red neuronal (MLP)", auc: 0.585 },
  { modelo: "Naive Bayes", auc: 0.564 },
  { modelo: "Azar (baseline)", auc: 0.500 },
];
