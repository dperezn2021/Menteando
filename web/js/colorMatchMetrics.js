const ColorMatchMetrics = {
  calcularCognicion(rawData) {
    const { aciertos = 0, errores = 0, totalIntentos = 0, tiemposRespuesta = [], nivelAlcanzado = 1 } = rawData;
    if (totalIntentos === 0) return { controlInhibitorio: 0, velocidadCognitiva: 0, atencionDividida: 0, memoriaTrabajo: 0 };

    const precision = aciertos / totalIntentos;
    const tiempoMedio = tiemposRespuesta.length > 0 ? tiemposRespuesta.reduce((a,b) => a+b) / tiemposRespuesta.length : 0.8;
    const velocidad = Math.max(0, Math.min(1, 0.8 / tiempoMedio));
    const controlInhibitorio = 1 - (errores / totalIntentos);
    const factorDificultad = 0.75 + (Math.max(0, Math.min(1, nivelAlcanzado / 10)) * 0.25);

    return {
      controlInhibitorio: Math.max(0, Math.min(1, controlInhibitorio * factorDificultad)),
      velocidadCognitiva: Math.max(0, Math.min(1, velocidad * precision)),
      atencionDividida: Math.max(0, Math.min(1, precision * factorDificultad)),
      memoriaTrabajo: Math.max(0, Math.min(1, rawData.mejorRacha / 10))
    };
  },
  aplicarPesos(metrics) {
    return {
      controlInhibitorio: (metrics.controlInhibitorio || 0) * 0.50,
      velocidadCognitiva: (metrics.velocidadCognitiva || 0) * 0.25,
      atencionDividida: (metrics.atencionDividida || 0) * 0.15,
      memoriaTrabajo: (metrics.memoriaTrabajo || 0) * 0.10,
      atencionSelectiva: 0, atencionSostenida: 0, coordinacionVisomotora: 0, flexibilidadCognitiva: 0, planificacion: 0
    };
  },
  procesarDatos(rawData) { return this.aplicarPesos(this.calcularCognicion(rawData)); }
};
if (typeof window !== 'undefined') { window.ColorMatchMetrics = ColorMatchMetrics; if (typeof window.RawGameMetricsProcessor !== 'undefined') window.RawGameMetricsProcessor.register('color match', ColorMatchMetrics); }
