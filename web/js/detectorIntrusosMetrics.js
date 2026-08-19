/**
 * Detector de Intrusos Metrics Calculation
 * Migrates cognitive metric calculation from Unity C# to JavaScript
 * Based on DetectorDeIntrusosGame.CalcularCognicion() and AplicarPesos()
 */

const DetectorIntrusosMetrics = {
  /**
   * Calcula métricas cognitivas a partir de datos crudos
   * @param {Object} rawData - Datos crudos del juego
   * @param {number} rawData.aciertos
   * @param {number} rawData.errores
   * @param {number} rawData.omisiones
   * @param {number} rawData.totalIntentos
   * @param {number} rawData.nivelAlcanzado
   * @param {number} rawData.filas
   * @param {number} rawData.columnas
   * @param {number} rawData.sumaRT
   * @param {number} rawData.tiempoPorEnsayo
   * @returns {Object} CognitiveMetrics con métricas base
   */
  calcularCognicion(rawData) {
    const {
      aciertos = 0,
      errores = 0,
      omisiones = 0,
      nivelAlcanzado = 1,
      filas = 3,
      columnas = 4,
      sumaRT = 0,
      tiempoPorEnsayo = 2.5
    } = rawData;

    const rondasTotales = aciertos + errores + omisiones;
    if (rondasTotales === 0) {
      return {
        atencionSelectiva: 0,
        velocidadCognitiva: 0,
        coordinacionVisomotora: 0,
        atencionDividida: 0
      };
    }

    // Precisión real
    const precisionReal = Math.max(0, Math.min(1, aciertos / rondasTotales));

    // Tiempo de reacción medio (sin incluir omisiones en el divisor)
    const rtMedio = sumaRT / Math.max(1, aciertos + errores);

    // Velocidad: velocidad esperada / velocidad real
    const velocidad = Math.max(0, Math.min(1, tiempoPorEnsayo / Math.max(0.5, rtMedio)));

    // Demanda atencional basada en tamaño del grid
    const totalElementos = filas * columnas;
    const demandaAtencional = Math.max(0, Math.min(1, (totalElementos - 12) / 20));

    // Métricas finales sin ponderar
    return {
      atencionSelectiva: precisionReal,
      velocidadCognitiva: velocidad,
      coordinacionVisomotora: precisionReal * velocidad,
      atencionDividida: precisionReal * (0.5 + demandaAtencional * 0.5)
    };
  },

  /**
   * Aplica pesos finales a las métricas (55/25/15/5)
   * @param {Object} metrics - CognitiveMetrics base
   * @returns {Object} Métricas ponderadas
   */
  aplicarPesos(metrics) {
    return {
      atencionSelectiva: (metrics.atencionSelectiva || 0) * 0.55,
      velocidadCognitiva: (metrics.velocidadCognitiva || 0) * 0.25,
      coordinacionVisomotora: (metrics.coordinacionVisomotora || 0) * 0.15,
      atencionDividida: (metrics.atencionDividida || 0) * 0.05,
      atencionSostenida: 0,
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
  }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.DetectorIntrusosMetrics = DetectorIntrusosMetrics;

  // Registrar con el procesador genérico cuando esté disponible
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('detector de intrusos', DetectorIntrusosMetrics);
  }
}
