const TrayectoriasMentalesMetrics = {
  calcularCognicion(rawData) {
    const { attempts = 0, successes = 0, trapHits = 0, totalRequiredBounces = 0, totalUsedBounces = 0, bestStreak = 0, maxLevelReached = 1, totalExitDistanceScore = 0 } = rawData;
    if (attempts <= 0) {
      return { planificacion: 0, memoriaTrabajo: 0, memoriaEspacial: 0, atencionSostenida: 0 };
    }
    const prec = 0.4 + (successes / Math.max(1, attempts)) * (1 - 0.4);
    const trap = 0.5 + (1 - Math.min(1, trapHits / Math.max(1, attempts))) * (1 - 0.5);
    const bounceAccuracy = 0.3 + (1 - Math.min(1, Math.abs(totalRequiredBounces - totalUsedBounces) / Math.max(1, totalRequiredBounces + attempts * 0.5))) * (1 - 0.3);
    const dist = Math.min(1, totalExitDistanceScore / Math.max(1, attempts)) * 0.8 + 0.2;
    const streak = 0.3 + Math.min(1, bestStreak / 3) * (1 - 0.3);
    const lvl = 0.5 + Math.min(1, maxLevelReached / 8) * (1 - 0.5);
    return {
      planificacion: Math.max(0, Math.min(1, (prec * 0.6 + bounceAccuracy * 0.4) * lvl)),
      memoriaTrabajo: Math.max(0, Math.min(1, (prec * 0.4 + bounceAccuracy * 0.35 + streak * 0.25) * lvl)),
      memoriaEspacial: Math.max(0, Math.min(1, (trap * 0.4 + dist * 0.6) * prec * lvl)),
      atencionSostenida: Math.max(0, Math.min(1, (0.4 + Math.min(1, attempts / 4) * (1 - 0.4)) * (0.4 + prec * 0.6) * lvl))
    };
  },
  aplicarPesos(metrics) {
    return {
      planificacion: (metrics.planificacion || 0) * 0.55,
      memoriaTrabajo: (metrics.memoriaTrabajo || 0) * 0.20,
      memoriaEspacial: (metrics.memoriaEspacial || 0) * 0.15,
      atencionSostenida: (metrics.atencionSostenida || 0) * 0.10,
      atencionSelectiva: 0,
      atencionDividida: 0,
      coordinacionVisomotora: 0,
      controlInhibitorio: 0,
      flexibilidadCognitiva: 0
    };
  },
  procesarDatos(rawData) {
    return this.aplicarPesos(this.calcularCognicion(rawData));
  }
};
if (typeof window !== 'undefined') {
  window.TrayectoriasMentalesMetrics = TrayectoriasMentalesMetrics;
  if (typeof window.RawGameMetricsProcessor !== 'undefined') {
    window.RawGameMetricsProcessor.register('trayectorias mentales', TrayectoriasMentalesMetrics);
  }
}
