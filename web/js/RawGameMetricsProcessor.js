/**
 * Generic Raw Game Metrics Processor
 * Template for migrating games from "Unity calculates metrics" to "Unity sends raw data"
 *
 * Each game should implement:
 * 1. A processor class extending RawGameMetricsProcessor
 * 2. Override calcularCognicion(rawData) with game-specific logic
 * 3. Register via RawGameMetricsProcessor.register(gameId, processorInstance)
 */

const RawGameMetricsProcessor = {
  // Registry of game-specific processors
  _processors: {},

  /**
   * Register a game's metrics processor
   * @param {string} gameId - Game ID (must match gameId sent from Unity)
   * @param {Object} processor - Processor with calcularCognicion(rawData) method
   */
  register(gameId, processor) {
    if (!processor.calcularCognicion || typeof processor.calcularCognicion !== 'function') {
      throw new Error(`Processor for ${gameId} must implement calcularCognicion(rawData) method`);
    }
    this._processors[gameId] = processor;
    console.log(`✅ Registered metrics processor for "${gameId}"`);
  },

  /**
   * Process raw game data using the appropriate processor
   * @param {string} gameId - Game ID
   * @param {Object} rawData - Raw gameplay data
   * @returns {Object} Processed CognitiveMetrics (or null if no processor found)
   */
  procesarDatos(gameId, rawData) {
    const processor = this._processors[gameId];
    if (!processor) {
      console.warn(`⚠️ No processor found for gameId "${gameId}". Using empty metrics.`);
      return this._crearMetricasVacias();
    }

    try {
      const metricas = processor.calcularCognicion(rawData);
      return this._validarMetricas(metricas);
    } catch (error) {
      console.error(`❌ Error processing metrics for ${gameId}:`, error);
      return this._crearMetricasVacias();
    }
  },

  /**
   * Create empty metrics structure (all zeros)
   * Useful as fallback when processor unavailable
   */
  _crearMetricasVacias() {
    return {
      atencionSelectiva: 0,
      atencionSostenida: 0,
      atencionDividida: 0,
      velocidadCognitiva: 0,
      memoriaTrabajo: 0,
      memoriaEspacial: 0,
      controlInhibitorio: 0,
      flexibilidadCognitiva: 0,
      planificacion: 0,
      coordinacionVisomotora: 0
    };
  },

  /**
   * Ensure all metrics are valid (0-1 range, no NaN/Infinity)
   */
  _validarMetricas(metricas) {
    const validadas = {};
    const campos = [
      'atencionSelectiva', 'atencionSostenida', 'atencionDividida',
      'velocidadCognitiva', 'memoriaTrabajo', 'memoriaEspacial',
      'controlInhibitorio', 'flexibilidadCognitiva', 'planificacion',
      'coordinacionVisomotora'
    ];

    campos.forEach(campo => {
      let valor = Number(metricas[campo]) || 0;
      // Clamp to 0-1 and handle NaN/Infinity
      valor = Math.max(0, Math.min(1, valor));
      if (!isFinite(valor)) valor = 0;
      validadas[campo] = valor;
    });

    return validadas;
  },

  /**
   * List all registered game processors
   */
  listarProcesadores() {
    return Object.keys(this._processors);
  }
};

// Export globally
if (typeof window !== 'undefined') {
  window.RawGameMetricsProcessor = RawGameMetricsProcessor;
}
