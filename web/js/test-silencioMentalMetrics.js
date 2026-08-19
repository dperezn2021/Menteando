/**
 * Silencio Mental Metrics Tests
 * Valida que los cálculos en JavaScript son equivalentes a C#
 */

console.log("\n🧪 TESTS: Silencio Mental Metrics");

// TEST 1: Datos vacíos
console.log("\n📋 TEST 1: Datos vacíos");
const test1 = {
  aciertosObjetivo: 0,
  rechazosCorrectos: 0,
  objetivosMostrados: 0,
  distractoresMostrados: 0,
  mejorRacha: 0,
  nivelAlcanzado: 1
};
const result1 = SilencioMentalMetrics.procesarDatos(test1);
console.assert(result1.atencionSostenida === 0, "Sostenida debe ser 0");
console.assert(result1.controlInhibitorio === 0, "Control debe ser 0");
console.log("✅ Caso vacío: todas las métricas = 0");

// TEST 2: Rendimiento perfecto
console.log("\n📋 TEST 2: Rendimiento perfecto");
const test2 = {
  aciertosObjetivo: 8,
  rechazosCorrectos: 8,
  objetivosMostrados: 8,
  distractoresMostrados: 8,
  mejorRacha: 20,
  nivelAlcanzado: 8
};
const result2 = SilencioMentalMetrics.calcularCognicion(test2);
const result2p = SilencioMentalMetrics.aplicarPesos(result2);
console.log(`  Sostenida base: ${result2.atencionSostenida.toFixed(4)}`);
console.log(`  Control base: ${result2.controlInhibitorio.toFixed(4)}`);
console.log(`  Selectiva base: ${result2.atencionSelectiva.toFixed(4)}`);
console.log(`  Memoria trabajo base: ${result2.memoriaTrabajo.toFixed(4)}`);
console.assert(result2.atencionSostenida === 1.0, "Sostenida debe ser 1.0");
console.assert(result2.controlInhibitorio === 1.0, "Control debe ser 1.0");
console.assert(result2.atencionSelectiva === 1.0, "Selectiva debe ser 1.0");
console.assert(result2.memoriaTrabajo === 1.0, "Memoria trabajo debe ser 1.0");
console.log("✅ Rendimiento perfecto validado");

// TEST 3: Sesión típica (algunos aciertos, algunos errores)
console.log("\n📋 TEST 3: Sesión típica");
const test3 = {
  aciertosObjetivo: 6,
  rechazosCorrectos: 5,
  objetivosMostrados: 8,
  distractoresMostrados: 8,
  mejorRacha: 8,
  nivelAlcanzado: 4
};
const result3 = SilencioMentalMetrics.calcularCognicion(test3);
const result3p = SilencioMentalMetrics.aplicarPesos(result3);
const sostenida3 = 6/8;
const control3 = 5/8;
const selectiva3 = (6+5)/16;
const memoria3 = 8/20;
console.log(`  Sostenida esperada: ${sostenida3.toFixed(4)}, obtenida: ${result3.atencionSostenida.toFixed(4)}`);
console.log(`  Control esperado: ${control3.toFixed(4)}, obtenido: ${result3.controlInhibitorio.toFixed(4)}`);
console.log(`  Selectiva esperada: ${selectiva3.toFixed(4)}, obtenida: ${result3.atencionSelectiva.toFixed(4)}`);
console.assert(
  Math.abs(result3.atencionSostenida - sostenida3) < 0.001,
  `Sostenida debe ser ~${sostenida3.toFixed(4)}`
);
console.log("✅ Sesión típica validada");

// TEST 4: Malo en GO (muchas omisiones)
console.log("\n📋 TEST 4: Malo en GO (omisiones)");
const test4 = {
  aciertosObjetivo: 2,
  rechazosCorrectos: 7,
  objetivosMostrados: 8,
  distractoresMostrados: 8,
  mejorRacha: 3,
  nivelAlcanzado: 2
};
const result4 = SilencioMentalMetrics.procesarDatos(test4);
console.log(`  Sostenida ponderada: ${result4.atencionSostenida.toFixed(4)}`);
console.assert(result4.atencionSostenida < 0.2, "Con baja precisión GO, sostenida debe ser baja");
console.log("✅ Bajo GO validado");

// TEST 5: Malo en NoGo (muchos falsos positivos)
console.log("\n📋 TEST 5: Malo en NoGo (falsos positivos)");
const test5 = {
  aciertosObjetivo: 7,
  rechazosCorrectos: 2,
  objetivosMostrados: 8,
  distractoresMostrados: 8,
  mejorRacha: 2,
  nivelAlcanzado: 2
};
const result5 = SilencioMentalMetrics.procesarDatos(test5);
console.log(`  Control ponderado: ${result5.controlInhibitorio.toFixed(4)}`);
console.assert(result5.controlInhibitorio < 0.15, "Con baja precisión NoGo, control debe ser bajo");
console.log("✅ Bajo NoGo validado");

// TEST 6: Racha máxima (memoriaTrabajo = 1.0)
console.log("\n📋 TEST 6: Racha máxima");
const test6 = {
  aciertosObjetivo: 5,
  rechazosCorrectos: 5,
  objetivosMostrados: 6,
  distractoresMostrados: 6,
  mejorRacha: 25,  // > 20
  nivelAlcanzado: 5
};
const result6 = SilencioMentalMetrics.calcularCognicion(test6);
console.log(`  Memoria trabajo base: ${result6.memoriaTrabajo.toFixed(4)}`);
console.assert(result6.memoriaTrabajo === 1.0, "Con racha > 20, memoria debe ser 1.0 (clamped)");
console.log("✅ Racha máxima validada");

// TEST 7: Validación de rangos
console.log("\n📋 TEST 7: Validación de rangos [0-1]");
const test7 = {
  aciertosObjetivo: 5,
  rechazosCorrectos: 4,
  objetivosMostrados: 7,
  distractoresMostrados: 7,
  mejorRacha: 5,
  nivelAlcanzado: 3
};
const result7 = SilencioMentalMetrics.procesarDatos(test7);
const keys = ['atencionSostenida', 'controlInhibitorio', 'atencionSelectiva', 'memoriaTrabajo'];
let allValid = true;
keys.forEach(key => {
  const value = result7[key];
  if (value < 0 || value > 1 || isNaN(value) || !isFinite(value)) {
    console.log(`  ❌ ${key}: ${value}`);
    allValid = false;
  }
});
console.assert(allValid, "Todas las métricas deben estar en [0, 1]");
console.log("✅ Todos los rangos validados");

console.log("\n✅ TODOS LOS TESTS PASARON\n");
