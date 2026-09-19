console.log("\n🧪 TESTS: Operaciones Encadenadas Metrics");

// TEST 1: Vacío
console.log("\n📋 TEST 1: Datos vacíos");
const test1 = { operacionesCorrectas: 0, totalOperaciones: 0, tiemposRespuesta: [], aciertos: [], fueEspecial: [], nivelesPorOperacion: [] };
const r1 = OperacionesEncadenadasMetrics.procesarDatos(test1);
console.assert(r1.memoriaTrabajo === 0 && r1.velocidadCognitiva === 0, "Vacío debe ser 0");
console.log("✅ Vacío validado");

// TEST 2: Perfecto
console.log("\n📋 TEST 2: Perfecto");
const test2 = {
  operacionesCorrectas: 8, totalOperaciones: 8,
  tiemposRespuesta: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  aciertos: [true, true, true, true, true, true, true, true],
  fueEspecial: [false, false, false, true, false, false, false, true],
  nivelesPorOperacion: [2, 3, 4, 5, 6, 7, 8, 5]
};
const r2 = OperacionesEncadenadasMetrics.calcularCognicion(test2);
console.log(`  Memoria: ${r2.memoriaTrabajo.toFixed(4)}, Planif: ${r2.planificacion.toFixed(4)}, Vel: ${r2.velocidadCognitiva.toFixed(4)}`);
console.assert(r2.memoriaTrabajo === 1.0, "Mem debe ser 1 (2/2)");
console.log("✅ Perfecto validado");

// TEST 3: Típico (algunos errores)
console.log("\n📋 TEST 3: Típico");
const test3 = {
  operacionesCorrectas: 6, totalOperaciones: 10,
  tiemposRespuesta: [0.7, 0.8, 0.6, 1.0, 0.9, 0.5, 0.65, 1.1, 0.75, 0.8],
  aciertos: [true, true, false, true, true, true, false, true, true, false],
  fueEspecial: [false, false, false, true, false, false, false, true, false, false],
  nivelesPorOperacion: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};
const r3 = OperacionesEncadenadasMetrics.procesarDatos(test3);
console.log(`  Memoria ponderada: ${r3.memoriaTrabajo.toFixed(4)}`);
console.assert(r3.memoriaTrabajo > 0 && r3.memoriaTrabajo < 0.6, "Mem debe estar en rango");
console.log("✅ Típico validado");

// TEST 4: Rangos [0-1]
console.log("\n📋 TEST 4: Rangos");
const test4 = {
  operacionesCorrectas: 5, totalOperaciones: 8,
  tiemposRespuesta: [0.6, 0.8, 0.7, 1.0, 0.5, 0.9, 0.75, 0.65],
  aciertos: [true, true, false, true, true, false, true, true],
  fueEspecial: [false, true, false, true, false, false, true, false],
  nivelesPorOperacion: [1, 3, 5, 7, 2, 6, 4, 8]
};
const r4 = OperacionesEncadenadasMetrics.procesarDatos(test4);
let valid = Object.values(r4).slice(0, 4).every(v => v >= 0 && v <= 1 && !isNaN(v));
console.assert(valid, "Todos en [0-1]");
console.log("✅ Rangos validados");

console.log("\n✅ TODOS PASARON\n");
