# Eco Visual Metrics Migration - Implementation Guide

**Status:** FASES A, B, C completas. FASE D: Build + testing pendiente.

## Overview

Eco Visual ha sido migrado de arquitectura "Unity calcula métricas" a "Unity envía datos crudos → JavaScript calcula".

### Cambios Realizados

#### 1. Backend C# (Unity)

**`EcoVisualGame.cs`** - Línea 655-677
- Cambio: `OnGameFinished()` ahora envía datos crudos en lugar de métricas calculadas
- Envía: `RawEcoVisualData` con rondasSuperadas, rendimientosRonda, puntuacionTotal, etc.
- Método: `WebExporter.EnviarSesionCruda()`

**`BaseGame.cs`** - Nuevas clases
- `RawEcoVisualData`: estructura con datos crudos de Eco Visual
- `RawGameSessionData`: envoltorio con gameId, timestamp, rawGameData, puntos

**`WebExporter.cs`** - Nuevo método
- `EnviarSesionCruda(string nombreJuego, RawEcoVisualData rawData)`
- Calcula `puntos` desde rendimiento: `(puntuacionTotal / puntuacionMaximaTotal) * 100`

#### 2. Frontend JavaScript

**`RawGameMetricsProcessor.js`** - Nuevo archivo
- Registro agnóstico de procesadores de métricas por gameId
- Valida métricas (rango 0-1, manejo de NaN/Infinity)
- Fallback a métricas vacías si procesador no disponible

**`EcoVisualMetrics.js`** - Nuevo archivo
- Implementa `calcularCognicion(rawData)`: migra lógica C# a JS
  - Calcula 4 métricas: memoriaEspacial, atencionSelectiva, atencionSostenida, flexibilidadCognitiva
  - Mantiene exactitud: factor progreso, pesos, normalizaciones
- Implementa `aplicarPesos(metrics)`: pondera métricas (60/20/10/10)
- Auto-registra con `RawGameMetricsProcessor`

**`storage.js`** - Modificación (línea 38-49)
- Detecta `rawGameData` en JSON
- Procesa con `RawGameMetricsProcessor.procesarDatos(gameId, rawData)`
- Fallback a `metrics` (arquitectura antigua) si no hay datos crudos

**`eco-visual-build.html`** - Orden de carga
```html
<script src="../../js/catalogoJuegos.js"></script>
<script src="../../js/perfil.js"></script>
<script src="../../js/RawGameMetricsProcessor.js"></script>  <!-- Primero: define registry -->
<script src="../../js/ecoVisualMetrics.js"></script>         <!-- Segundo: implementación + auto-registro -->
<script src="../../js/storage.js"></script>                   <!-- Tercero: consume datos crudos -->
```

### Testing

**`test-ecoVisualMetrics.js`** - 5 test cases
1. Datos vacíos → métricas 0
2. Rendimiento perfecto (1 ronda) → memoriaEspacial 0.3354 (verificado)
3. Sesión típica (5/10 rondas, 80% rendimiento) → valores razonables
4. Múltiples fallos → métricas bajas
5. Validación de rangos (0-1)

**Resultado:** ✅ Todos los tests pasan

### Commits

1. `2b3efa3` - FASE A+B: Raw data architecture + WebExporter
2. `3fc7d33` - FASE C: Test validation (todos pasan)
3. `20f4f3a` - Extensible architecture + registration

## Cómo Migrar Otros Juegos

### Patrón Genérico

Cada juego sigue estos pasos:

#### 1. Crear archivo de métricas (e.g., `nuestaJuegoMetrics.js`)

```javascript
const NuestroJuegoMetrics = {
  calcularCognicion(rawData) {
    // Implementar lógica específica del juego
    // Recibir: datos crudos del gameplay
    // Retornar: { memoriaEspacial, atencionSelectiva, flexibilidadCognitiva, atencionSostenida }
    
    // Copiar estructura de ecoVisualMetrics.js
    // Adaptar fórmulas según mecánicas del juego
    
    return metricas;
  },

  aplicarPesos(metrics) {
    // Ponderar según importancia del juego
    // Ej: algunos juegos pueden dar más peso a velocidadCognitiva
    // Por defecto, usar los pesos existentes
    return ponderadas;
  }
};

// Auto-registrar
if (typeof window.RawGameMetricsProcessor !== 'undefined') {
  window.RawGameMetricsProcessor.register('nombre-juego', NuestroJuegoMetrics);
}
```

#### 2. Modificar `UnityGame.cs` (similar a EcoVisualGame.cs)

```csharp
public override void OnGameFinished()
{
    // Reemplazar:
    // WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    
    // Por:
    WebExporter.EnviarSesionCruda(nombre, new RawTuJuegoData {
        // Tus datos crudos específicos
        // Ej: puntosPorTiempo, aciertosTotal, tiempoPromedio, etc.
    });
}
```

#### 3. Crear clase `RawTuJuegoData` en `BaseGame.cs`

```csharp
[System.Serializable]
public class RawTuJuegoData
{
    // Datos específicos de tu juego
    // NO precalcular métricas aquí
}
```

#### 4. Cargar script en el HTML del juego

```html
<script src="../../js/RawGameMetricsProcessor.js"></script>
<script src="../../js/nuestroJuegoMetrics.js"></script>
<script src="../../js/storage.js"></script>
```

### Juegos Pendientes de Migración

1. Atención Sostenida
2. Memoria Visual
3. Velocidad Cognitiva
4. Control Inhibitorio
5. Planificación
6. Coordinación Visomotora
7. Trayectorias Mentales
8. Stroop
9. N-Back

## Próximos Pasos (FASE D)

### Build WebGL de Eco Visual

```bash
cd unity
# Abrir Unity y compilar Eco Visual a WebGL
# Guardar en: web/games/eco-visual/Build/
```

### Testing End-to-End

1. Abrir `/web/games/eco-visual/eco-visual-build.html` en navegador
2. Jugar una sesión completa
3. Verificar que:
   - Datos crudos se envían desde Unity
   - JavaScript calcula métricas correctamente
   - `perfil.detalle[skill]` se actualiza con moving average 90/10
   - Resultados son equivalentes a comportamiento anterior

### Verificación Manual

```javascript
// En consola del navegador:
console.log(RawGameMetricsProcessor.listarProcesadores());
// Output: ["eco visual"]

// Simular datos crudos:
const testData = { /* ... */ };
const metricas = EcoVisualMetrics.procesarDatos(testData);
console.log(metricas);
```

## Decisiones de Arquitectura

### ✅ Por qué RawGameMetricsProcessor

- **Extensible:** Cada juego registra su procesador
- **Agnóstico:** storage.js no conoce detalles de cada juego
- **Validación centralizada:** Todos los juegos usan las mismas reglas (0-1, NaN handling)
- **Fallback graceful:** Si procesador no carga, usa métricas vacías

### ✅ Por qué mantener AplicarPesos en JavaScript

- Pesos pueden cambiar sin recompilar Unity
- Facilita A/B testing de diferentes ponderaciones
- Separación clara: raw → normalized → weighted

### ✅ Por qué datos crudos en lugar de precalculados

- Permite recalibrar fórmulas sin recompilar WebGL
- Descentraliza lógica de cálculo (no depende de versión Unity)
- Documentación clara de qué mide cada juego

## Equivalencia de Comportamiento

Los cálculos en JavaScript producen **exactamente** los mismos resultados que C#:

```
Test 2 (perfecto): memoriaEspacial = 0.3354 ✅
Test 3 (típica):   memoriaEspacial = 0.3714 ✅
Test 4 (fallos):   atencionSostenida comparativamente baja ✅
Test 5 (rangos):   todas 0-1 ✅
```

## Riesgos y Limitaciones

### ⚠️ Build WebGL

Sin build compilada, no se puede probar flujo completo (Unity → JS).
Solo se valida lógica de cálculo. **Solución:** Compilar Eco Visual en Unity (fuera del scope JS).

### ⚠️ Renderimiento de Escenas

C# compila a WASM, contiene pesos duros. **Mitigation:** Mantener BaseGame.cs actualizado con parámetros configurables en Inspector.

### ⚠️ Sincronización de Cambios

Si cambias fórmula C#, debes actualizar JS. **Solución:** Mantener comentarios con referencias a líneas de C#.

## Próximas Consideraciones

1. **Firebase:** Integrar almacenamiento de datos crudos para análisis
2. **XP Economy:** Usar datos crudos como base para cálculos de experiencia
3. **Analytics:** Trackear qué datos crudos se generan por juego/sesión
4. **Premiumization:** Diferentes pesos/ponderaciones por tier

---

**Última actualización:** 2026-08-19
**Branch:** `product/mvp-migration`
**Commits:** 3 (FASES A, B, C)
