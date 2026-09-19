/**
 * Operaciones Encadenadas Metrics Calculation
 * Migrates cognitive metric calculation from Unity C# to JavaScript
 */

const OperacionesEncadenadasMetrics = {
  calcularCognicion(rawData) {
    const {
      operacionesCorrectas = 0,
      totalOperaciones = 0,
      tiemposRespuesta = [],
      aciertos = [],
      fueEspecial = [],
      nivelesPorOperacion = []
    } = rawData;

    if (totalOperaciones === 0) {
      return { memoriaTrabajo: 0, planificacion: 0, velocidadCognitiva: 0, atencionSelectiva: 0 };
    }

    // Velocidad cognitiva
    const tiempoMedio = this._average(tiemposRespuesta, 1.0);
    const velocidadCognitiva = Math.max(0, Math.min(1, 2 / (tiempoMedio + 0.5)));

    // Memoria de trabajo (operaciones especiales)
    let totalEspeciales = 0, aciertosEspeciales = 0;
    for (let i = 0; i < totalOperaciones; i++) {
      if (fueEspecial[i]) {
        totalEspeciales++;
        if (aciertos[i]) aciertosEspeciales++;
      }
    }
    const memoriaTrabajo = totalEspeciales > 0 ? aciertosEspeciales / totalEspeciales : 0.3;

    // Planificación (operaciones difíciles, nivel > 4)
    let operacionesLargas = 0, aciertosLargas = 0;
    for (let i = 0; i < totalOperaciones; i++) {
      if (nivelesPorOperacion[i] > 4) {
        operacionesLargas++;
        if (aciertos[i]) aciertosLargas++;
      }
    }
    const planificacion = operacionesLargas > 0 ? aciertosLargas / operacionesLargas : 0.2;

    // Atención selectiva (fácil vs difícil)
    let aciertosFaciles = 0, totalFaciles = 0;
    let aciertosDificiles = 0, totalDificiles = 0;
    for (let i = 0; i < totalOperaciones; i++) {
      if (nivelesPorOperacion[i] <= 4) {
        totalFaciles++;
        if (aciertos[i]) aciertosFaciles++;
      } else {
        totalDificiles++;
        if (aciertos[i]) aciertosDificiles++;
      }
    }
    const precisionFacil = totalFaciles > 0 ? aciertosFaciles / totalFaciles : 0.5;
    const precisionDificil = totalDificiles > 0 ? aciertosDificiles / totalDificiles : 0;
    const atencionSelectiva = (precisionFacil + precisionDificil) / 2;

    return {
      memoriaTrabajo: Math.max(0, Math.min(1, memoriaTrabajo)),
      planificacion: Math.max(0, Math.min(1, planificacion)),
      velocidadCognitiva: velocidadCognitiva,
      atencionSelectiva: Math.max(0, Math.min(1, atencionSelectiva))
    };
  },

  aplicarPesos(metrics) {
    return {
      memoriaTrabajo: (metrics.memoriaTrabajo || 0) * 0.50,
      planificacion: (metrics.planificacion || 0) * 0.25,
      velocidadCognitiva: (metrics.velocidadCognitiva || 0) * 0.20,
      atencionSelectiva: (metrics.atencionSelectiva || 0) * 0.05,
      atencionSostenida: 0,
      atencionDividida: 0,
      coordinacionVisomotora: 0,
      controlInhibitorio: 0,
      flexibilidadCognitiva: 0
    };
  },

  procesarDatos(rawData) {
    const metricas = this.calcularCognicion(rawData);
    return this.aplicarPesos(metricas);
  },

  _average(valores, defaultVal) {
    if (!valores || valores.length === 0) return defaultVal;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }
};

if (typeof window !== 'undefined') {
  window.OperacionesEncadenadasMetrics = OperacionesEncadenadasMetrics;
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('operaciones encadenadas', OperacionesEncadenadasMetrics);
  }
}
