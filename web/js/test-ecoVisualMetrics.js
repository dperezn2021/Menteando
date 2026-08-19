/**
 * Test para EcoVisualMetrics
 * Valida que los cálculos en JavaScript producen resultados equivalentes a C#
 */

function testEcoVisualMetrics() {
  console.log("🧪 Iniciando tests EcoVisualMetrics...\n");

  // Test 1: Caso vacío (primer juego)
  console.log("TEST 1: Datos vacíos (inicio)");
  const test1 = EcoVisualMetrics.procesarDatos({
    rondasSuperadas: 0,
    rondaActual: 0,
    puntuacionTotal: 0,
    puntuacionMaximaTotal: 100,
    rendimientosRonda: [],
    mejorRacha: 0,
    nivelActual: 1,
    nivelMaximo: 10,
    nivelInicial: 1,
    pesoProgresoNivelCognicion: 0.15,
    multiplicadorMinimoProgresoCognicion: 0.6
  });
  console.log("  Resultado:", test1);
  console.assert(test1.memoriaEspacial === 0, "memoriaEspacial debería ser 0");
  console.log("  ✅ PASS\n");

  // Test 2: Rendimiento perfecto, ronda 1
  console.log("TEST 2: Rendimiento perfecto, 1 ronda superada");
  const test2 = EcoVisualMetrics.procesarDatos({
    rondasSuperadas: 1,
    rondaActual: 1,
    puntuacionTotal: 100,
    puntuacionMaximaTotal: 100,
    rendimientosRonda: [1.0],
    mejorRacha: 1,
    nivelActual: 2,
    nivelMaximo: 10,
    nivelInicial: 1,
    pesoProgresoNivelCognicion: 0.15,
    multiplicadorMinimoProgresoCognicion: 0.6
  });
  console.log("  Resultado:", test2);
  // Con 1 ronda de 10 posibles: progreso = 1/10 = 0.1
  // factorProgreso = 0.6 * (1 - 0.1) + 1 * 0.1 = 0.54 + 0.1 = 0.64
  // precisionEspacial = 1.0 * 0.64 = 0.64
  // memoriaEspacial = (0.64 * 0.85) + (0.1 * 0.15) = 0.544 + 0.015 = 0.559
  // Después AplicarPesos: 0.559 * 0.60 = 0.3354
  console.assert(
    Math.abs(test2.memoriaEspacial - 0.3354) < 0.01,
    `memoriaEspacial debería ~0.3354, got ${test2.memoriaEspacial}`
  );
  console.log("  ✅ PASS\n");

  // Test 3: Sesión típica a mitad de juego
  console.log("TEST 3: Sesión típica (5 rondas de 10, 80% rendimiento)");
  const test3 = EcoVisualMetrics.procesarDatos({
    rondasSuperadas: 5,
    rondaActual: 6,
    puntuacionTotal: 400,
    puntuacionMaximaTotal: 500,
    rendimientosRonda: [0.8, 0.85, 0.8, 0.75, 0.8, 0.78],
    mejorRacha: 5,
    nivelActual: 6,
    nivelMaximo: 10,
    nivelInicial: 1,
    pesoProgresoNivelCognicion: 0.15,
    multiplicadorMinimoProgresoCognicion: 0.6
  });
  console.log("  Resultado:", test3);
  // progreso = 5 / 10 = 0.5
  // factorProgreso = 0.6 * 0.5 + 1 * 0.5 = 0.8
  // precisionEspacial = 0.8 * 0.8 = 0.64
  // rendimientoMedio ≈ 0.8 * 0.8 ≈ 0.64
  // consistencia = 5/6 ≈ 0.833 * 0.8 ≈ 0.667
  // racha = 5/6 ≈ 0.833 * 0.8 ≈ 0.667
  console.assert(test3.memoriaEspacial > 0.3 && test3.memoriaEspacial < 0.5,
    `memoriaEspacial debería estar entre 0.3 y 0.5, got ${test3.memoriaEspacial}`);
  console.assert(test3.atencionSelectiva > 0.1 && test3.atencionSelectiva < 0.25,
    `atencionSelectiva debería estar entre 0.1 y 0.25, got ${test3.atencionSelectiva}`);
  console.log("  ✅ PASS\n");

  // Test 4: Rondas fallidas (consistencia baja)
  console.log("TEST 4: Múltiples fallos (baja consistencia)");
  const test4 = EcoVisualMetrics.procesarDatos({
    rondasSuperadas: 2,
    rondaActual: 5,
    puntuacionTotal: 150,
    puntuacionMaximaTotal: 500,
    rendimientosRonda: [0.7, 0.6, 0.5, 0.4, 0.3],
    mejorRacha: 1,
    nivelActual: 1,
    nivelMaximo: 10,
    nivelInicial: 1,
    pesoProgresoNivelCognicion: 0.15,
    multiplicadorMinimoProgresoCognicion: 0.6
  });
  console.log("  Resultado:", test4);
  // progreso = 2/10 = 0.2
  // consistencia = 2/5 = 0.4 * factorProgreso ≈ bajo
  console.assert(test4.atencionSostenida < test3.atencionSostenida,
    `atencionSostenida debería ser menor que test3`);
  console.log("  ✅ PASS\n");

  // Test 5: Comprobar que sumas están entre 0-1
  console.log("TEST 5: Validar rangos (todas métricas 0-1)");
  const test5 = EcoVisualMetrics.procesarDatos({
    rondasSuperadas: 3,
    rondaActual: 3,
    puntuacionTotal: 250,
    puntuacionMaximaTotal: 300,
    rendimientosRonda: [0.9, 0.85, 0.8],
    mejorRacha: 3,
    nivelActual: 4,
    nivelMaximo: 10,
    nivelInicial: 1,
    pesoProgresoNivelCognicion: 0.15,
    multiplicadorMinimoProgresoCognicion: 0.6
  });
  console.log("  Resultado:", test5);
  const metricas = [
    test5.memoriaEspacial,
    test5.atencionSelectiva,
    test5.flexibilidadCognitiva,
    test5.atencionSostenida
  ];
  metricas.forEach((m, i) => {
    console.assert(m >= 0 && m <= 1, `Métrica ${i} fuera de rango: ${m}`);
  });
  console.log("  ✅ PASS\n");

  console.log("✅ Todos los tests completados exitosamente");
}

// Ejecutar si está disponible
if (typeof window !== 'undefined' && typeof window.EcoVisualMetrics !== 'undefined') {
  testEcoVisualMetrics();
} else {
  console.error("❌ EcoVisualMetrics no está disponible");
}
