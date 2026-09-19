const ReflejosCruzadosMetrics = {
  calcularCognicion(rawData) {
    const{totalEvents=0,touchedCorrect=0,touchedIncorrect=0,avoidedCorrect=0,missedTargets=0,bestStreak=0,maxLevelReached=1,ruleSwitchCount=0}=rawData;
    if(totalEvents<=0)return{};
    const visomotor=touchedCorrect/Math.max(1,touchedCorrect+touchedIncorrect+missedTargets);
    const inhibition=avoidedCorrect/Math.max(1,avoidedCorrect+touchedIncorrect);
    const precision=Math.max(0,Math.min(1,visomotor));
    const spatialMemory=Math.min(1,precision*(1-(missedTargets/totalEvents)));
    const switchBonus=ruleSwitchCount>0?Math.min(1,ruleSwitchCount/5)*0.1:0;
    const planning=Math.min(1,precision*0.65+Math.min(1,bestStreak/8)*0.25+switchBonus);
    const levelFactor=0.75+Math.min(1,maxLevelReached/10)*(1-0.75);
    return{coordinacionVisomotora:Math.min(1,visomotor*levelFactor),controlInhibitorio:Math.min(1,inhibition*levelFactor),memoriaEspacial:Math.min(1,spatialMemory*levelFactor),planificacion:Math.min(1,planning*levelFactor)};
  },
  aplicarPesos(metrics) {
    return{coordinacionVisomotora:(metrics.coordinacionVisomotora||0)*0.50,controlInhibitorio:(metrics.controlInhibitorio||0)*0.25,memoriaEspacial:(metrics.memoriaEspacial||0)*0.15,planificacion:(metrics.planificacion||0)*0.10,atencionSelectiva:0,atencionSostenida:0,atencionDividida:0,memoriaTrabajo:0,flexibilidadCognitiva:0,velocidadCognitiva:0};
  },
  procesarDatos(rawData){return this.aplicarPesos(this.calcularCognicion(rawData));}
};
if(typeof window!=='undefined'){window.ReflejosCruzadosMetrics=ReflejosCruzadosMetrics;if(typeof window.RawGameMetricsProcessor!=='undefined')window.RawGameMetricsProcessor.register('reflejos cruzados',ReflejosCruzadosMetrics);}
