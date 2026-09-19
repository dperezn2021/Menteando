const CambioDeReglasMetrics = {
  calcularCognicion(rawData) {
    const { aciertosReales = 0, fallos = 0, cambiosRegla = 0, mejorRacha = 0, nivelActual = 1 } = rawData;
    const total = aciertosReales + fallos;
    if (total <= 0) {
      return { flexibilidadCognitiva: 0, controlInhibitorio: 0, atencionSostenida: 0, planificacion: 0, memoriaEspacial: 0 };
    }
    const precision = aciertosReales / total;
    const precisionExigente = Math.max(0, Math.min(1, (precision - 0.50) / (0.95 - 0.50)));
    const volumen = Math.max(0, Math.min(1, total / 45));
    const nivelFactor = Math.max(0, Math.min(1, (nivelActual - 1) / 9));
    const flexibilidad = Math.max(0, Math.min(1, cambiosRegla / 30));
    const rachaNormalizada = Math.max(0, Math.min(1, Math.min(mejorRacha, aciertosReales) / 18));
    return {
      flexibilidadCognitiva: Math.max(0, Math.min(1, (precisionExigente * 0.45 + flexibilidad * 0.35 + nivelFactor * 0.20) * volumen)),
      controlInhibitorio: Math.max(0, Math.min(1, (precisionExigente * 0.80 + nivelFactor * 0.20) * volumen)),
      atencionSostenida: Math.max(0, Math.min(1, (aciertosReales / 60) * precisionExigente)),
      planificacion: Math.max(0, Math.min(1, (precisionExigente * 0.40 + rachaNormalizada * 0.40 + nivelFactor * 0.20) * volumen)),
      memoriaEspacial: Math.max(0, Math.min(1, (precisionExigente * 0.70 + nivelFactor * 0.30) * volumen))
    };
  },
  aplicarPesos(metrics) {
    return {
      flexibilidadCognitiva: (metrics.flexibilidadCognitiva || 0) * 0.40,
      controlInhibitorio: (metrics.controlInhibitorio || 0) * 0.30,
      atencionSostenida: (metrics.atencionSostenida || 0) * 0.20,
      planificacion: (metrics.planificacion || 0) * 0.10,
      atencionSelectiva: 0, atencionDividida: 0, coordinacionVisomotora: 0, memoriaTrabajo: 0, velocidadCognitiva: 0
    };
  },
  procesarDatos(rawData) { return this.aplicarPesos(this.calcularCognicion(rawData)); }
};
if (typeof window !== 'undefined') { window.CambioDeReglasMetrics = CambioDeReglasMetrics; if (typeof window.RawGameMetricsProcessor !== 'undefined') window.RawGameMetricsProcessor.register('cambio de reglas', CambioDeReglasMetrics); }
