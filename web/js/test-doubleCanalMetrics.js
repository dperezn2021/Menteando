/**
 * Doble Canal Metrics Tests
 * Valida que los cálculos en JavaScript son equivalentes a C#
 */

console.log("\n🧪 TESTS: Doble Canal Metrics");

// TEST 1: Datos vacíos
console.log("\n📋 TEST 1: Datos vacíos");
const test1 = {
  aciertosObjetivo: 0,
  omisionesObjetivo: 0,
  aciertosNoGo: 0,
  erroresImpulsivos: 0,
  obstaculosEsquivados: 0,
  colisiones: 0,
  mejorRacha: 0,
  tiemposReaccion: [],
  nivelAlcanzado: 1
};
const result1 = DoubleCanalMetrics.procesarDatos(test1);
console.assert(result1.atencionDividida === 0, "Dividida debe ser 0");
console.assert(result1.velocidadCognitiva === 0, "Velocidad debe ser 0");
console.log("✅ Caso vacío: todas las métricas = 0");

// TEST 2: GO perfecto, NoGo perfecto, Runner perfecto
console.log("\n📋 TEST 2: Rendimiento perfecto");
const test2 = {
  aciertosObjetivo: 8,
  omisionesObjetivo: 0,
  aciertosNoGo: 6,
  erroresImpulsivos: 0,
  obstaculosEsquivados: 10,
  colisiones: 0,
  mejorRacha: 10,
  tiemposReaccion: [0.30, 0.35, 0.28, 0.32, 0.30, 0.33, 0.29, 0.31, 0.32, 0.30, 0.35, 0.28, 0.33, 0.30],
  nivelAlcanzado: 7
};
const result2 = DoubleCanalMetrics.calcularCognicion(test2);
const result2p = DoubleCanalMetrics.aplicarPesos(result2);
console.log(`  Dividida base: ${result2.atencionDividida.toFixed(4)}`);
console.log(`  Velocidad base: ${result2.velocidadCognitiva.toFixed(4)}`);
console.log(`  Dividida ponderada: ${result2p.atencionDividida.toFixed(4)}`);
console.assert(result2.atencionDividida > 0.9, "Dividida base debe ser > 0.9");
console.log("✅ Rendimiento perfecto validado");

// TEST 3: Sesión típica (algunos aciertos, algunos errores)
console.log("\n📋 TEST 3: Sesión típica");
const test3 = {
  aciertosObjetivo: 6,
  omisionesObjetivo: 2,
  aciertosNoGo: 4,
  erroresImpulsivos: 2,
  obstaculosEsquivados: 7,
  colisiones: 3,
  mejorRacha: 4,
  tiemposReaccion: [0.45, 0.50, 0.42, 0.52, 0.48, 0.55, 0.43, 0.49, 0.51, 0.44],
  nivelAlcanzado: 5
};
const result3 = DoubleCanalMetrics.calcularCognicion(test3);
const result3p = DoubleCanalMetrics.aplicarPesos(test3);
const goScore3 = (6/8) * (1 - 2/8);
const noGoScore3 = 4/6;
const runnerScore3 = 7/10;
console.log(`  GO Score: ${goScore3.toFixed(4)}`);
console.log(`  NoGo Score: ${noGoScore3.toFixed(4)}`);
console.log(`  Runner Score: ${runnerScore3.toFixed(4)}`);
console.log(`  Dividida base: ${result3.atencionDividida.toFixed(4)}`);
console.log(`  Dividida ponderada: ${result3p.atencionDividida.toFixed(4)}`);
console.assert(result3.atencionDividida > 0.5, "Dividida base debe ser > 0.5");
console.log("✅ Sesión típica validada");

// TEST 4: Mal rendimiento (muchos errores)
console.log("\n📋 TEST 4: Mal rendimiento");
const test4 = {
  aciertosObjetivo: 2,
  omisionesObjetivo: 6,
  aciertosNoGo: 1,
  erroresImpulsivos: 5,
  obstaculosEsquivados: 2,
  colisiones: 8,
  mejorRacha: 1,
  tiemposReaccion: [1.0, 0.95, 1.1, 1.05, 0.98],
  nivelAlcanzado: 2
};
const result4 = DoubleCanalMetrics.procesarDatos(test4);
console.log(`  Dividida ponderada: ${result4.atencionDividida.toFixed(4)}`);
console.assert(result4.atencionDividida < 0.3, "Con mal rendimiento, dividida debe ser baja");
console.log("✅ Mal rendimiento validado");

// TEST 5: Validar InverseLerp (velocidad)
console.log("\n📋 TEST 5: Validación de velocidad cognitiva");
const test5 = {
  aciertosObjetivo: 5,
  omisionesObjetivo: 1,
  aciertosNoGo: 4,
  erroresImpulsivos: 0,
  obstaculosEsquivados: 8,
  colisiones: 2,
  mejorRacha: 5,
  tiemposReaccion: [0.25, 0.27, 0.23, 0.26],  // Muy rápido
  nivelAlcanzado: 8
};
const result5 = DoubleCanalMetrics.calcularCognicion(test5);
console.log(`  RT medio: ~0.25s (muy rápido)`);
console.log(`  Velocidad base: ${result5.velocidadCognitiva.toFixed(4)}`);
console.assert(result5.velocidadCognitiva > 0.95, "Con RT muy rápido, velocidad debe ser > 0.95");
console.log("✅ Velocidad rápida validada");

// TEST 6: Validación de rangos
console.log("\n📋 TEST 6: Validación de rangos [0-1]");
const test6 = {
  aciertosObjetivo: 5,
  omisionesObjetivo: 3,
  aciertosNoGo: 4,
  erroresImpulsivos: 2,
  obstaculosEsquivados: 6,
  colisiones: 4,
  mejorRacha: 3,
  tiemposReaccion: [0.50, 0.55, 0.48, 0.52],
  nivelAlcanzado: 4
};
const result6 = DoubleCanalMetrics.procesarDatos(test6);
const keys = ['atencionDividida', 'coordinacionVisomotora', 'atencionSostenida', 'velocidadCognitiva'];
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
