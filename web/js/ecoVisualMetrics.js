/**
 * Eco Visual Metrics Calculation
 * Migrates cognitive metric calculation from Unity C# to JavaScript
 * Based on EcoVisualGame.CalcularCognicion() and AplicarPesos()
 */

const EcoVisualMetrics = {
  /**
   * Calcula métricas cognitivas a partir de datos crudos
   * @param {Object} rawData - Datos crudos del juego
   * @param {number} rawData.rondasSuperadas
   * @param {number} rawData.rondaActual
   * @param {number} rawData.puntuacionTotal
   * @param {number} rawData.puntuacionMaximaTotal
   * @param {number[]} rawData.rendimientosRonda
   * @param {number} rawData.mejorRacha
   * @param {number} rawData.nivelActual
   * @param {number} rawData.nivelMaximo
   * @param {number} rawData.nivelInicial
   * @param {number} rawData.pesoProgresoNivelCognicion
   * @param {number} rawData.multiplicadorMinimoProgresoCognicion
   * @returns {Object} CognitiveMetrics con 4 campos principales
   */
  calcularCognicion(rawData) {
    const {
      rondasSuperadas = 0,
      rondaActual = 0,
      puntuacionTotal = 0,
      puntuacionMaximaTotal = 1,
      rendimientosRonda = [],
      mejorRacha = 0,
      nivelActual = 1,
      nivelMaximo = 10,
      nivelInicial = 1,
      pesoProgresoNivelCognicion = 0.15,
      multiplicadorMinimoProgresoCognicion = 0.6
    } = rawData;

    // Base metrics crudas
    const progresoRondas = Math.max(0, Math.min(1,
      rondasSuperadas / Math.max(1, nivelMaximo - nivelInicial + 1)
    ));

    const factorProgreso = (multiplicadorMinimoProgresoCognicion * (1 - progresoRondas)) +
                           (1 * progresoRondas);

    const precisionEspacialBase = Math.max(0, Math.min(1,
      puntuacionTotal / Math.max(1, puntuacionMaximaTotal)
    ));

    const rendimientoMedioBase = this._promedio(rendimientosRonda, precisionEspacialBase);

    const consistenciaBase = rondaActual > 0
      ? Math.max(0, Math.min(1, rondasSuperadas / rondaActual))
      : precisionEspacialBase;

    const rachaNormalizadaBase = Math.max(0, Math.min(1,
      mejorRacha / Math.max(1, nivelActual)
    ));

    // Aplicar factor progreso
    const precisionEspacial = precisionEspacialBase * factorProgreso;
    const rendimientoMedio = rendimientoMedioBase * factorProgreso;
    const consistencia = consistenciaBase * factorProgreso;
    const rachaNormalizada = rachaNormalizadaBase * factorProgreso;
    const progreso = progresoRondas;

    // Pesos
    const pesoProgreso = Math.max(0, Math.min(1, pesoProgresoNivelCognicion));
    const pesoRendimiento = 1 - pesoProgreso;

    // Métricas finales
    return {
      memoriaEspacial: Math.max(0, Math.min(1,
        (precisionEspacial * pesoRendimiento) + (progreso * pesoProgreso)
      )),
      atencionSelectiva: Math.max(0, Math.min(1,
        (rendimientoMedio * (1 - pesoProgreso * 0.65)) + (progreso * pesoProgreso * 0.65)
      )),
      flexibilidadCognitiva: Math.max(0, Math.min(1,
        (rachaNormalizada * (1 - pesoProgreso)) + (progreso * pesoProgreso)
      )),
      atencionSostenida: Math.max(0, Math.min(1,
        (consistencia * (1 - pesoProgreso * 0.5)) + (progreso * pesoProgreso * 0.5)
      ))
    };
  },

  /**
   * Aplica pesos finales a las métricas (60/20/10/10)
   * @param {Object} metrics - CognitiveMetrics
   * @returns {Object} Métricas ponderadas
   */
  aplicarPesos(metrics) {
    return {
      memoriaEspacial: (metrics.memoriaEspacial || 0) * 0.60,
      atencionSelectiva: (metrics.atencionSelectiva || 0) * 0.20,
      flexibilidadCognitiva: (metrics.flexibilidadCognitiva || 0) * 0.10,
      atencionSostenida: (metrics.atencionSostenida || 0) * 0.10,
      // Rellena campos que no usa Eco Visual para compatibilidad
      atencionDividida: 0,
      velocidadCognitiva: 0,
      memoriaTrabajo: 0,
      controlInhibitorio: 0,
      planificacion: 0,
      coordinacionVisomotora: 0
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

  // Helper privado
  _promedio(valores, valorSiVacio) {
    if (!valores || valores.length === 0) return valorSiVacio;
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return suma / valores.length;
  }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.EcoVisualMetrics = EcoVisualMetrics;
}
