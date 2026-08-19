/**
 * Silencio Mental Metrics Calculation
 * Migrates cognitive metric calculation from Unity C# to JavaScript
 * Based on SilencioMentalGame.CalcularCognicion() and AplicarPesos()
 */

const SilencioMentalMetrics = {
  /**
   * Calcula métricas cognitivas a partir de datos crudos
   * @param {Object} rawData - Datos crudos del juego
   * @param {number} rawData.aciertosObjetivo - GO hits
   * @param {number} rawData.rechazosCorrectos - NoGo correct rejections
   * @param {number} rawData.objetivosMostrados - Total GO stimuli
   * @param {number} rawData.distractoresMostrados - Total NoGo stimuli
   * @param {number} rawData.mejorRacha - Best streak
   * @param {number} rawData.nivelAlcanzado - Final level
   * @returns {Object} CognitiveMetrics con 4 métricas base
   */
  calcularCognicion(rawData) {
    const {
      aciertosObjetivo = 0,
      rechazosCorrectos = 0,
      objetivosMostrados = 0,
      distractoresMostrados = 0,
      mejorRacha = 0
    } = rawData;

    const total = objetivosMostrados + distractoresMostrados;
    if (total === 0) {
      return {
        atencionSostenida: 0,
        controlInhibitorio: 0,
        atencionSelectiva: 0,
        memoriaTrabajo: 0
      };
    }

    // GO accuracy
    const atencionSostenida = objetivosMostrados > 0
      ? aciertosObjetivo / objetivosMostrados
      : 0.5;

    // NoGo accuracy
    const controlInhibitorio = distractoresMostrados > 0
      ? rechazosCorrectos / distractoresMostrados
      : 1.0;

    // Overall accuracy
    const atencionSelectiva = (aciertosObjetivo + rechazosCorrectos) / total;

    // Streak metric
    const memoriaTrabajo = Math.max(0, Math.min(1, mejorRacha / 20));

    return {
      atencionSostenida: Math.max(0, Math.min(1, atencionSostenida)),
      controlInhibitorio: Math.max(0, Math.min(1, controlInhibitorio)),
      atencionSelectiva: Math.max(0, Math.min(1, atencionSelectiva)),
      memoriaTrabajo: memoriaTrabajo
    };
  },

  /**
   * Aplica pesos finales a las métricas (50/30/15/5)
   * @param {Object} metrics - CognitiveMetrics base
   * @returns {Object} Métricas ponderadas
   */
  aplicarPesos(metrics) {
    return {
      atencionSostenida: (metrics.atencionSostenida || 0) * 0.50,
      controlInhibitorio: (metrics.controlInhibitorio || 0) * 0.30,
      atencionSelectiva: (metrics.atencionSelectiva || 0) * 0.15,
      memoriaTrabajo: (metrics.memoriaTrabajo || 0) * 0.05,
      atencionDividida: 0,
      velocidadCognitiva: 0,
      coordinacionVisomotora: 0,
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
  }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.SilencioMentalMetrics = SilencioMentalMetrics;

  // Registrar con el procesador genérico cuando esté disponible
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('silencio mental', SilencioMentalMetrics);
  }
}
