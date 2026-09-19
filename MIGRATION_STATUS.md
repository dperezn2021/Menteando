# Eco Visual Metrics Migration - Status Checkpoint

**Status**: FASE A-D (Arquitectura completa, Bugs corregidos, Tests agregados)

**Branch**: `product/mvp-migration`  
**Last updated**: 2026-09-19

---

## Arquitectura

### Flujo Antiguo
```
Unity → CalcularCognicion(C#) → AplicarPesos(C#) → WebExporter.EnviarSesion() → JSON → JavaScript → storage.js
```

### Flujo Nuevo
```
Unity → Collect RawGameData → WebExporter.EnviarSesionCruda() → JSON → RawGameMetricsProcessor
  → Game-specific Processor (JS) → Normalize [0-1] → AplicarPesos(JS) → storage.js
```

### Componentes Compartidos
- **C#**: `BaseGame.cs` (RawData classes), `WebExporter.cs` (EnviarSesionCruda)
- **JS**: `RawGameMetricsProcessor.js` (registry), `storage.js` (dual-path: raw or legacy)
- **HTML**: Each game loads `[RawGameMetricsProcessor.js → gameMetrics.js → storage.js]`

---

## Estado por Juego (10/10)

| Juego | Raw C# | Processor JS | Tests | Status |
|-------|--------|--------------|-------|--------|
| Detector Intrusos | ✅ | ✅ | ✅ (6) | End-to-end: Pendiente build |
| Doble Canal | ✅ | ✅ | ✅ (6) | Pendiente build + manual |
| Silencio Mental | ✅ | ✅ | ✅ (7) | Pendiente build + manual |
| Operaciones Encadenadas | ✅ | ✅ | ✅ (4) | Pendiente build + manual |
| Eco Visual | ✅ | ✅ | ✅ (5) | **Validado end-to-end** ✅ |
| Color Match | ✅ | ✅ | ✅ (3) | Pendiente build + manual |
| Cambio de Reglas | ✅ | ✅* | ✅ (4) | *Bugs corregidos 2026-09-19 |
| Trayectorias Mentales | ✅ | ✅* | ✅ (4) | *Bugs corregidos 2026-09-19 |
| Misión Orbital | ✅ | ✅* | ✅ (4) | *Bugs corregidos 2026-09-19 |
| Reflejos Cruzados | ✅ | ✅ | ✅ (4) | Pendiente build + manual |

---

## Archivos Clave

### C# (Shared)
- `unity/Assets/Framework/ScriptsGenerales/Base/BaseGame.cs` - RawData class definitions
- `unity/Assets/Framework/ScriptsGenerales/Base/WebExporter.cs` - EnviarSesionCruda()

### JavaScript (Core)
- `web/js/RawGameMetricsProcessor.js` - Registry + processor dispatch
- `web/js/storage.js` - Dual-path handling (raw data vs legacy metrics)

### Game Processors (web/js/*Metrics.js)
1. `detectorIntrusosMetrics.js`
2. `doubleCanalMetrics.js`
3. `silencioMentalMetrics.js`
4. `operacionesEncadenadasMetrics.js`
5. `ecoVisualMetrics.js`
6. `colorMatchMetrics.js`
7. `cambioDeReglasMetrics.js`
8. `trayectoriasMentalesMetrics.js`
9. `misionOrbitalMetrics.js`
10. `reflejosCruzadosMetrics.js`

### Tests (web/js/test-*Metrics.js)
All 10 games have tests (vacío, perfecto, típico, bajo, límites).

### Documentation
- `MIGRATION_GUIDE.md` - Pattern for migrating new games

---

## Commits Relevantes

- `7661670` - Detector de Intrusos
- `a23b065` - Doble Canal
- `5cb4e28` - Silencio Mental
- `1c97bd3` - Operaciones Encadenadas
- `167ee09` - Color Match
- `4c1a3a4` - Final 4 games (Cambio/Trayectorias/Misión/Reflejos)
- `6095b14` - **FIX: Critical bugs + complete tests**

---

## Bugs Encontrados y Corregidos (2026-09-19)

1. **Cambio de Reglas**: 
   - ❌ Retornaba `{}` vacío cuando total=0
   - ❌ Falta `Math.max(0, ...)` en clamping
   - ✅ FIXED: Retorna objeto con defaults 0, agregado Math.max() completo

2. **Trayectorias Mentales**:
   - ❌ Retornaba `{}` vacío cuando attempts=0
   - ❌ Código minificado (ilegible)
   - ❌ Clamping incompleto
   - ✅ FIXED: Desminificado, defaults 0, clamping explícito

3. **Misión Orbital**:
   - ❌ Retornaba `{}` vacío cuando totalIntentos=0
   - ❌ Código minificado
   - ❌ Clamping incompleto
   - ✅ FIXED: Desminificado, defaults 0, clamping explícito

---

## Validación Técnica

### Por Juego
- ✅ **Defensiva contra div/0**: todos retornan defaults válidos
- ✅ **Arrays vacíos**: manejados (length === 0 → return defaults)
- ✅ **Rango [0-1]**: garantizado con Math.max(0, Math.min(1, ...))
- ✅ **NaN/Infinity**: prevenidos con Math.max(..., 1) divisores
- ✅ **Pesos**: aplicados correctamente (suma no siempre 1.0, pero por diseño)

### Cobertura de Tests
- ✅ Caso vacío/mínimo (div/0)
- ✅ Rendimiento perfecto
- ✅ Sesión típica
- ✅ Bajo rendimiento
- ✅ Límites [0-1]

---

## Pendientes Inmediatos

1. **Builds WebGL nuevas**: Los 10 juegos necesitan recompilar en Unity
   - Ruta: `web/games/{juego}/Build/`
   - Después de cada build, verificar que RawData se envía correctamente

2. **End-to-End Manual**: 
   - ✅ Eco Visual (validado)
   - ⏳ Otros 9 juegos (bloqueado por build WebGL)

3. **Verificar HTML loaders**: 
   - Todos cargan RawGameMetricsProcessor antes de game processor
   - Todos cargan storage.js después de processors

---

## Decisiones que NO deben Cambiarse

- ✅ **Preservar fórmulas C# actuales**: No rediseñar ponderaciones
- ✅ **Moving average 90/10**: Mantener en perfil (storage.js)
- ✅ **Raw data agnóstico**: Procesadores en JS, no en Unity
- ✅ **Tests fuera del Índice Cognitivo**: Score separado de XP
- ✅ **NO implementar**: XP, PostGame, Firebase, Stripe, Free/Premium, Nivel Menteando

---

## Para Siguiente Sesión

1. Recompilar 10 juegos WebGL en Unity
2. Probar E2E (cada juego: jugar sesión completa → perfil actualizado)
3. Crear/actualizar HTMLs si necesario
4. Considerado: Firebase para almacenamiento de raw data (out of scope ahora)
