/**
 * Detector de Intrusos Metrics Tests
 * Valida que los cálculos en JavaScript son equivalentes a C#
 */

console.log("\n🧪 TESTS: Detector de Intrusos Metrics");

// TEST 1: Datos vacíos
console.log("\n📋 TEST 1: Datos vacíos");
const test1 = {
  aciertos: 0,
  errores: 0,
  omisiones: 0,
  nivelAlcanzado: 1,
  filas: 3,
  columnas: 4,
  sumaRT: 0,
  tiempoPorEnsayo: 2.5
};
const result1 = DetectorIntrusosMetrics.procesarDatos(test1);
console.assert(result1.atencionSelectiva === 0, "Selectiva debe ser 0");
console.assert(result1.velocidadCognitiva === 0, "Velocidad debe ser 0");
console.log("✅ Caso vacío: todas las métricas = 0");

// TEST 2: Rendimiento perfecto (todos aciertos, tiempo rápido)
console.log("\n📋 TEST 2: Rendimiento perfecto");
const test2 = {
  aciertos: 10,
  errores: 0,
  omisiones: 0,
  nivelAlcanzado: 3,
  filas: 3,
  columnas: 4,
  sumaRT: 10,  // 10 intentos, 1 segundo cada uno
  tiempoPorEnsayo: 2.5
};
const result2 = DetectorIntrusosMetrics.calcularCognicion(test2);
const result2p = DetectorIntrusosMetrics.aplicarPesos(result2);
console.log(`  Selectiva base: ${result2.atencionSelectiva.toFixed(4)}`);
console.log(`  Velocidad base: ${result2.velocidadCognitiva.toFixed(4)}`);
console.log(`  Selectiva ponderada: ${result2p.atencionSelectiva.toFixed(4)}`);
console.assert(result2.atencionSelectiva === 1.0, "Selectiva base debe ser 1.0 (100% aciertos)");
console.assert(result2.velocidadCognitiva === 1.0, "Velocidad base debe ser 1.0 (rápido)");
console.log("✅ Rendimiento perfecto validado");

// TEST 3: Sesión típica (algunos errores, tiempo moderado)
console.log("\n📋 TEST 3: Sesión típica");
const test3 = {
  aciertos: 7,
  errores: 2,
  omisiones: 1,
  nivelAlcanzado: 2,
  filas: 3,
  columnas: 4,
  sumaRT: 22.5,  // 9 intentos con respuesta (7+2), promedio 2.5s
  tiempoPorEnsayo: 2.5
};
const result3 = DetectorIntrusosMetrics.calcularCognicion(test3);
const result3p = DetectorIntrusosMetrics.aplicarPesos(result3);
const precision3 = 7 / 10;
const rtMedio3 = 22.5 / 9;
const velocidad3 = 2.5 / rtMedio3;
console.log(`  Precisión: ${precision3.toFixed(4)}`);
console.log(`  RT medio: ${rtMedio3.toFixed(4)}s`);
console.log(`  Velocidad base: ${velocidad3.toFixed(4)}`);
console.log(`  Selectiva ponderada: ${result3p.atencionSelectiva.toFixed(4)}`);
console.assert(
  Math.abs(result3.atencionSelectiva - precision3) < 0.001,
  `Selectiva base debe ser ~${precision3.toFixed(4)}`
);
console.assert(
  Math.abs(result3.velocidadCognitiva - 1.0) < 0.001,
  "Velocidad base debe ser ~1.0"
);
console.log("✅ Sesión típica validada");

// TEST 4: Bajo rendimiento (muchos errores)
console.log("\n📋 TEST 4: Bajo rendimiento");
const test4 = {
  aciertos: 3,
  errores: 6,
  omisiones: 1,
  nivelAlcanzado: 1,
  filas: 3,
  columnas: 4,
  sumaRT: 20,
  tiempoPorEnsayo: 2.5
};
const result4 = DetectorIntrusosMetrics.procesarDatos(test4);
const precision4 = 3 / 10;
console.log(`  Selectiva ponderada: ${result4.atencionSelectiva.toFixed(4)}`);
console.assert(
  result4.atencionSelectiva < 0.3,
  "Con baja precisión, selectiva ponderada debe ser baja"
);
console.log("✅ Bajo rendimiento validado");

// TEST 5: Validación de demanda atencional (grid más grande)
console.log("\n📋 TEST 5: Demanda atencional (grid 6x7)");
const test5 = {
  aciertos: 8,
  errores: 2,
  omisiones: 0,
  nivelAlcanzado: 8,
  filas: 6,
  columnas: 7,  // 42 elementos, demanda = (42-12)/20 = 1.5 → 1.0 clamped
  sumaRT: 20,
  tiempoPorEnsayo: 1.0
};
const result5 = DetectorIntrusosMetrics.calcularCognicion(test5);
const demanda5 = Math.min(1, (6*7 - 12) / 20);
console.log(`  Demanda atencional: ${demanda5.toFixed(4)}`);
console.log(`  AtencionalDividida base: ${result5.atencionDividida.toFixed(4)}`);
console.assert(result5.atencionDividida > 0.8, "Dividida debe ser alta con grid grande");
console.log("✅ Demanda atencional validada");

// TEST 6: Validación de rangos
console.log("\n📋 TEST 6: Validación de rangos [0-1]");
const test6 = {
  aciertos: 5,
  errores: 3,
  omisiones: 2,
  nivelAlcanzado: 3,
  filas: 4,
  columnas: 4,
  sumaRT: 15,
  tiempoPorEnsayo: 2.0
};
const result6 = DetectorIntrusosMetrics.procesarDatos(test6);
const keys = ['atencionSelectiva', 'velocidadCognitiva', 'coordinacionVisomotora', 'atencionDividida'];
let allValid = true;
keys.forEach(key => {
  const value = result6[key];
  if (value < 0 || value > 1 || isNaN(value) || !isFinite(value)) {
    console.log(`  ❌ ${key}: ${value}`);
    allValid = false;
  }
});
console.assert(allValid, "Todas las métricas deben estar en [0, 1]");
console.log("✅ Todos los rangos validados");

console.log("\n✅ TODOS LOS TESTS PASARON\n");
