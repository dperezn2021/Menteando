/**
 * Doble Canal Metrics Calculation
 * Migrates cognitive metric calculation from Unity C# to JavaScript
 * Based on DobleCanalGame.CalcularCognicion() and AplicarPesos()
 */

const DoubleCanalMetrics = {
  /**
   * Calcula métricas cognitivas a partir de datos crudos
   * @param {Object} rawData - Datos crudos del juego
   * @param {number} rawData.aciertosObjetivo - GO hits
   * @param {number} rawData.omisionesObjetivo - GO misses
   * @param {number} rawData.aciertosNoGo - NoGo correct rejections
   * @param {number} rawData.erroresImpulsivos - NoGo false alarms
   * @param {number} rawData.obstaculosEsquivados - Runner dodges
   * @param {number} rawData.colisiones - Runner collisions
   * @param {number} rawData.mejorRacha - Best streak
   * @param {number[]} rawData.tiemposReaccion - Reaction times
   * @param {number} rawData.nivelAlcanzado - Final level
   * @returns {Object} CognitiveMetrics con 4 métricas base
   */
  calcularCognicion(rawData) {
    const {
      aciertosObjetivo = 0,
      omisionesObjetivo = 0,
      aciertosNoGo = 0,
      erroresImpulsivos = 0,
      obstaculosEsquivados = 0,
      colisiones = 0,
      tiemposReaccion = []
    } = rawData;

    // GO metrics
    const goTotal = aciertosObjetivo + omisionesObjetivo;
    const goAccuracy = goTotal > 0 ? aciertosObjetivo / goTotal : 0;
    const goPenalty = goTotal > 0 ? omisionesObjetivo / goTotal : 0;
    const goScore = Math.max(0, Math.min(1, goAccuracy * (1 - goPenalty)));

    // NoGo metrics
    const noGoTotal = aciertosNoGo + erroresImpulsivos;
    const noGoAccuracy = noGoTotal > 0 ? aciertosNoGo / noGoTotal : 0;
    const noGoScore = noGoAccuracy;

    // Runner metrics
    const runnerTotal = obstaculosEsquivados + colisiones;
    const runnerScore = runnerTotal > 0 ? obstaculosEsquivados / runnerTotal : 0.5;

    // Reaction time metrics
    const rtMedio = this._obtenerTiempoMedioReaccion(tiemposReaccion);
    const rtScore = Math.max(0, Math.min(1, this._inverseLerp(1.2, 0.25, rtMedio)));

    // Final metrics without weights
    return {
      atencionDividida: Math.max(0, Math.min(1, (goScore * 0.45) + (noGoScore * 0.25) + (runnerScore * 0.30))),
      atencionSostenida: Math.max(0, Math.min(1, (goScore * 0.7) + ((1 - goPenalty) * 0.3))),
      coordinacionVisomotora: Math.max(0, Math.min(1, (runnerScore * 0.65) + (rtScore * 0.35))),
      velocidadCognitiva: rtScore
    };
  },

  /**
   * Aplica pesos finales a las métricas (60/20/15/5)
   * @param {Object} metrics - CognitiveMetrics base
   * @returns {Object} Métricas ponderadas
   */
  aplicarPesos(metrics) {
    return {
      atencionDividida: (metrics.atencionDividida || 0) * 0.60,
      coordinacionVisomotora: (metrics.coordinacionVisomotora || 0) * 0.20,
      atencionSostenida: (metrics.atencionSostenida || 0) * 0.15,
      velocidadCognitiva: (metrics.velocidadCognitiva || 0) * 0.05,
      atencionSelectiva: 0,
      memoriaTrabajo: 0,
      memoriaEspacial: 0,
      controlInhibitorio: 0,
      flexibilidadCognitiva: 0,
      planificacion: 0
    };
  },

  /**
   * Pipeline completa: datos crudos → métricas → ponderadas
   * @param {Object} rawData - Datos crudos del juego
   * @returns {Object} Métricas finales ponderadas
   */
  procesarDatos(rawData) {
    const metricas = this.calcularCognicion(rawData);
    return this.aplicarPesos(metricas);
  },

  // Helpers privados
  _obtenerTiempoMedioReaccion(tiemposReaccion) {
    if (!tiemposReaccion || tiemposReaccion.length === 0) return 0.75;
    const total = tiemposReaccion.reduce((acc, val) => acc + val, 0);
    return total / tiemposReaccion.length;
  },

  _inverseLerp(a, b, value) {
    if (a === b) return value > b ? 1 : 0;
    return (value - a) / (b - a);
  }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.DoubleCanalMetrics = DoubleCanalMetrics;

  // Registrar con el procesador genérico cuando esté disponible
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('doble canal', DoubleCanalMetrics);
  }
}
