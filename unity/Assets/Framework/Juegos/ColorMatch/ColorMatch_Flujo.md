# Color Match - Flujo tecnico

## Objetivo

Implementar un Stroop simple y robusto integrado con `BaseGame`, `GameManager`, `DifficultyManager`, `UIManager`, `AudioManager` y `WebExporter`.

## Habilidades y pesos

- Control inhibitorio: 50%
- Velocidad cognitiva: 25%
- Atencion dividida: 15%
- Memoria de trabajo: 10%

## Flujo de partida

1. `ResetGame()` limpia metricas, nivel, racha, estimulo actual y estado de pausa.
2. Se muestra una regla breve: "Pulsa el COLOR, ignora la palabra".
3. Cada ronda genera:
   - palabra escrita: rojo, azul, verde, amarillo, morado
   - color visual real
   - opciones de respuesta por color
4. El jugador pulsa el color visual correcto, no el texto.
5. Si acierta:
   - suma acierto
   - registra tiempo de reaccion
   - sube racha
   - llama a `DifficultyManager.ActualizarDificultad`
6. Si falla:
   - suma error de interferencia
   - rompe racha
   - penaliza dificultad
7. Al terminar el tiempo, `OnGameFinished()` exporta metricas ponderadas.

## Dificultad

- Nivel 1-3: pocas opciones, alto tiempo de respuesta, baja interferencia.
- Nivel 4-6: mas opciones, palabra y color casi siempre incongruentes.
- Nivel 7-10: menor tiempo, mas opciones, distractores cercanos y cambios de posicion.

## Metricas

- `controlInhibitorio`: 1 - tasa de errores por interferencia.
- `velocidadCognitiva`: tiempo esperado / tiempo medio, normalizado.
- `atencionDividida`: precision manteniendo regla + respuesta entre opciones.
- `memoriaTrabajo`: racha normalizada, como proxy de mantener la regla activa.

## Reutilizacion

- Usar `GamePause.WaitWhileNotPaused` para esperas.
- Usar `MetricUtils` para medias, precision y velocidad normalizada.
- Usar `SafeAreaFitter` en pantalla de partida.
- Usar el mismo patron de finalizacion con guard `finalizado`.
