const MisionOrbitalMetrics = {
  calcularCognicion(rawData) {
    const { totalIntentos = 0, aciertos = 0, sumaRT = 0, sumaRT2 = 0, maxLevelReached = 1, mejorRacha = 0, cambiosDireccion = 0 } = rawData;
    if (totalIntentos === 0) {
      return { velocidadCognitiva: 0, coordinacionVisomotora: 0, flexibilidadCognitiva: 0, planificacion: 0 };
    }
    const precision = aciertos / totalIntentos;
    const precisionLerpada = 0.3 + precision * (1 - 0.3);
    const rtMedio = sumaRT / totalIntentos;
    const velocidadRaw = Math.max(0, Math.min(1, (2.0 - rtMedio) / (2.0 - 0.35)));
    const varianza = Math.max(0, (sumaRT2 / totalIntentos) - (rtMedio * rtMedio));
    const desviacion = Math.sqrt(varianza);
    const consistencia = 1 - Math.min(1, desviacion / 1.2);
    const factorNivel = 0.7 + Math.min(1, maxLevelReached / 12) * (1 - 0.7);
    const rachaBonus = Math.min(1, mejorRacha / 8);
    const tasaCambios = totalIntentos > 0 ? cambiosDireccion / Math.max(1, totalIntentos / 5) : 0;
    const adaptacionDireccion = Math.min(1, 1 - tasaCambios * 0.5);
    return {
      velocidadCognitiva: Math.max(0.2, Math.min(0.95, velocidadRaw * 0.8 + 0.15)),
      coordinacionVisomotora: Math.max(0.2, Math.min(0.95, (precisionLerpada * 0.6 + velocidadRaw * 0.3 + rachaBonus * 0.1) * factorNivel)),
      flexibilidadCognitiva: Math.max(0.15, Math.min(0.9, (precisionLerpada * 0.4 + adaptacionDireccion * 0.4 + rachaBonus * 0.2) * factorNivel)),
      planificacion: Math.max(0.1, Math.min(0.85, (precisionLerpada * 0.5 + consistencia * 0.3 + rachaBonus * 0.2) * factorNivel))
    };
  },
  aplicarPesos(metrics) {
    return {
      velocidadCognitiva: (metrics.velocidadCognitiva || 0) * 0.40,
      coordinacionVisomotora: (metrics.coordinacionVisomotora || 0) * 0.35,
      flexibilidadCognitiva: (metrics.flexibilidadCognitiva || 0) * 0.15,
      planificacion: (metrics.planificacion || 0) * 0.10,
      atencionSelectiva: 0,
      atencionSostenida: 0,
      atencionDividida: 0,
      memoriaTrabajo: 0,
      memoriaEspacial: 0,
      controlInhibitorio: 0
    };
  },
  procesarDatos(rawData) {
    return this.aplicarPesos(this.calcularCognicion(rawData));
  }
};
if (typeof window !== 'undefined') {
  window.MisionOrbitalMetrics = MisionOrbitalMetrics;
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('mision orbital', MisionOrbitalMetrics);
  }
}
