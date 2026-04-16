using UnityEngine;

using UnityEngine;

using UnityEngine;

public abstract class BaseGame : MonoBehaviour
{
    public string nombre;
    protected bool juegoPausado = false;

    public abstract void ResetGame();
    public abstract void OnGameStart();
    public abstract void OnGameFinished();
    public abstract CognitiveMetrics CalcularCognicion();
    public abstract CognitiveMetrics AplicarPesos(CognitiveMetrics m);

    public virtual void PausarJuego(bool pausar)
    {
        juegoPausado = pausar;
        Debug.Log($"⏸️ {nombre} - Pausado: {juegoPausado}");
    }

    public virtual bool EstaPausado()
    {
        return juegoPausado;
    }
}

[System.Serializable]
public class CognitiveMetrics
{
    public float atencionSelectiva;
    public float atencionSostenida;
    public float atencionDividida;
    public float velocidadCognitiva;
    public float memoriaTrabajo;
    public float memoriaEspacial;
    public float controlInhibitorio;
    public float flexibilidadCognitiva;
    public float planificacion;
    public float coordinacionVisomotora;
}

[System.Serializable]
public class GameSessionData
{
    public string gameId;
    public string timestamp;
    public CognitiveMetrics metrics;
    public float puntos;
}


//////////////////////////////////////////////////////////////
// CONTEXTO GLOBAL DEL TFG - UNITY + WEB (JS/HTML)
//////////////////////////////////////////////////////////////

// Proyecto: Plataforma de minijuegos cognitivos.
// Backend de juego: Unity (C#).
// Front web: HTML + CSS + JS (dashboard con barras y gráficos).
// Comunicación: Unity genera JSON (GameSessionData) y lo envía a la web.
// Objetivo: medir atención, velocidad, control inhibitorio, etc. por juego.

//////////////////////////////////////////////////////////////
// CLASES IMPORTANTES EN UNITY
//////////////////////////////////////////////////////////////

// BaseGame : MonoBehaviour
// - Clase abstracta base de todos los juegos.
// - Campos:
//   - protected float tiempoInicio;
//   - public string nombre;
// - Métodos abstractos:
//   - public abstract void GenerarEstimulos();
//   - public abstract CognitiveMetrics CalcularCognicion();
//   - public abstract void ResetGame();  // añadido para reinicios genéricos
// - Método protegido:
//   - protected void EmpezarIntento() → guarda Time.time al iniciar cada intento.

// CognitiveMetrics
// - Contiene todas las métricas cognitivas que se envían a la web:
//   - float atencionSostenida;
//   - float atencionSelectiva;
//   - float atencionDividida;
//   - float velocidadCognitiva;
//   - float memoriaTrabajo;
//   - float memoriaEspacial;
//   - float controlInhibitorio;
//   - float flexibilidadCognitiva;
//   - float planificacion;
//   - float coordinacionVisomotora;

// GameSessionData
// - Estructura serializable que se manda a la web:
//   - string gameId;
//   - string timestamp;
//   - CognitiveMetrics metrics;

// DifficultyManager : MonoBehaviour (singleton)
// - Controla el nivel de dificultad global (1–10).
// - Campos:
//   - public static DifficultyManager Instance;
//   - public int nivelActual;
// - Ventanas de rendimiento (últimos N intentos):
//   - List<float> ventanaRendimiento;
//   - List<bool> ventanaAciertos;
//   - List<float> ventanaTiempos;
// - Método clave:
//   - ActualizarDificultad(float rendimiento, bool acierto, float tiempo)
//     - Calcula precisión, tiempo medio, fallos seguidos.
//     - Sube nivel si precisión alta y tiempo bajo.
//     - Baja nivel si precisión baja, muchos fallos o tiempo alto.
//     - Mantiene nivel si rendimiento estable.

// GameManager : MonoBehaviour (singleton)
// - Controla el ciclo de partida (inicio, tiempo, fin, reinicio).
// - Campos:
//   - BaseGame juegoActual;
//   - float duracionPartida;
//   - float tiempoRestante;
//   - bool estaJugando;
//   - TextMeshProUGUI textoTiempoRestante;
//   - GameObject panelFinPartida;
//   - TextMeshProUGUI txtPrecision;
//   - TextMeshProUGUI txtVelocidad;
//   - TMP_InputField inputDuracion;
// - Métodos clave:
//   - EmpezarJuego(BaseGame juego)
//     - Asigna juegoActual, nombreJuego.
//     - Resetea tiempoRestante y activa estaJugando.
//     - Actualiza textoTiempoRestante.
//   - Update()
//     - Si estaJugando, descuenta Time.deltaTime.
//     - Actualiza textoTiempoRestante.
//     - Si tiempoRestante <= 0 → AcabarJuego().
//   - AcabarJuego()
//     - Llama a juegoActual.CalcularCognicion().
//     - Llama a WebExporter.EnviarSesion(nombreJuego, metricas).
//     - Muestra panel final con estadísticas.
//   - ReiniciarPartida()
//     - Lee nueva duración desde inputDuracion (si existe).
//     - Resetea tiempoRestante y estaJugando.
//     - Llama a juegoActual.ResetGame();  // gracias a BaseGame abstract.
//     - Oculta panelFinPartida.

// WebExporter
// - Encargado de enviar los datos de la sesión al front (JS/HTML).
// - Métodos clave:
//   - SaveGameData(string json)
//     - Debug.Log del JSON (para pruebas).
//     - En build WebGL, se conecta con JS (SendMessage / extern).
//   - EnviarSesion(string gameId, CognitiveMetrics metrics)
//     - Crea GameSessionData.
//     - Lo serializa a JSON.
//     - Llama a SaveGameData(json).

//////////////////////////////////////////////////////////////
// JUEGO: DETECTOR DE INTRUSOS (IntruderGame : BaseGame)
//////////////////////////////////////////////////////////////

// Objetivo cognitivo:
// - Atención selectiva.
// - Control inhibitorio.
// - Velocidad cognitiva.
// - Coordinación visomotora.

// Lógica principal:
// - Grid de iconos (prefabIcono) en un GridLayoutGroup (grid).
// - Un icono es el intruso, el resto distractores.
// - El jugador debe pulsar el intruso lo más rápido posible.
// - DifficultyManager ajusta el nivel según rendimiento.

// Dificultad por nivel (grid):
// - Nivel 1–2 → 2x3
// - Nivel 3–4 → 3x3
// - Nivel 5–6 → 4x3
// - Nivel 7–8 → 4x4
// - Nivel 9 → 5x4
// - Nivel 10 → 5x5

// Colores:
// - Intruso: Color.red.
// - Distractores: rojo con alpha variable.
// - Nivel bajo → colores muy diferentes (alpha bajo).
// - Nivel alto → colores muy parecidos (alpha alto).

// Flujo interno de IntruderGame:
// - Awake():
//   - nombre = "detector de intrusos";
// - GenerarEstimulos() (override):
//   - Lee nivelActual de DifficultyManager.
//   - Calcula filas/columnas según nivel.
//   - Limpia grid (Destroy de hijos).
//   - Ajusta GridLayoutGroup.constraintCount = columnas.
//   - Elige intrusoIndex aleatorio.
//   - Instancia prefabIcono N veces (N = filas * columnas).
//   - Usa GetComponentInChildren<Button>() y GetComponentInChildren<Image>().
//   - Asigna color intruso/distractor según nivel.
//   - Añade listener: btn.onClick.AddListener(() => ClickIcono(esIntruso));
//   - Llama a EmpezarIntento() para guardar tiempoInicio.
// - ClickIcono(bool esIntruso):
//   - Si rondaActiva == false → return.
//   - Marca rondaActiva = false.
//   - Calcula tiempo de reacción = Time.time - tiempoInicio.
//   - Actualiza aciertos / erroresImpulsivos.
//   - Llama a DifficultyManager.ActualizarDificultad(rendimiento, esIntruso, tiempo).
//   - Llama a GenerarEstimulos() para siguiente ronda.
// - ResetGame() (override):
//   - Resetea totalIntentos, aciertos, erroresImpulsivos, sumaTiempos.
//   - Reinicia DifficultyManager.nivelActual = 1.
//   - Llama a GenerarEstimulos().
// - CalcularCognicion() (override):
//   - Calcula precision = aciertos / totalIntentos.
//   - Calcula tiempoMedio = sumaTiempos / totalIntentos.
//   - Calcula velocidad = 1 / tiempoMedio.
//   - Asigna:
//     - atencionSelectiva = precision;
//     - controlInhibitorio = 1 - (erroresImpulsivos / totalIntentos);
//     - velocidadCognitiva = velocidad;
//     - coordinacionVisomotora = velocidad * precision;

// Integración con GameManager:
// - GameManager.EmpezarJuego(this) se llama al seleccionar el juego.
// - GameManager controla el tiempo de partida (duracionPartida).
// - Al acabar el tiempo, GameManager llama a:
//   - juegoActual.CalcularCognicion();
//   - WebExporter.EnviarSesion(nombreJuego, metricas);
//   - Muestra panel final con barras.

// Integración con DifficultyManager:
// - Cada click llama a ActualizarDificultad(rendimiento, acierto, tiempo).
// - DifficultyManager sube/baja nivel según precisión y tiempo medio.
// - IntruderGame lee nivelActual en cada GenerarEstimulos() para ajustar grid y colores.

//////////////////////////////////////////////////////////////
// FLUJO DE DATOS UNITY → WEB (JS/HTML)
//////////////////////////////////////////////////////////////

// 1) El jugador juega en Unity (WebGL).
// 2) GameManager controla el tiempo y el juego activo.
// 3) Al terminar la partida:
//    - BaseGame.CalcularCognicion() devuelve CognitiveMetrics.
//    - GameManager llama a WebExporter.EnviarSesion(nombreJuego, metricas).
// 4) WebExporter:
//    - Crea un GameSessionData con:
//      - gameId (ej: "detector de intrusos").
//      - timestamp (DateTime.UtcNow).
//      - metrics (CognitiveMetrics).
//    - Serializa a JSON.
//    - Llama a una función JS (por ejemplo, SendGameData(json)).
// 5) En JS (front):
//    - function SendGameData(jsonString) {
//          const data = JSON.parse(jsonString);
//          // data.gameId
//          // data.timestamp
//          // data.metrics.atencionSelectiva, etc.
//      }
//    - Se actualizan las barras HTML/CSS con estos valores.
//    - Cada métrica se representa como una barra (width = metric * 100%).

//////////////////////////////////////////////////////////////
// SISTEMA DE PUNTUACIÓN AVANZADO (IDEA A IMPLEMENTAR)
//////////////////////////////////////////////////////////////

// Objetivo: que las métricas reflejen:
// - Nivel máximo alcanzado.
// - Penalizaciones por bajadas de nivel.
// - Penalizaciones por errores impulsivos.
// - Diferencia entre rendir bien en nivel bajo vs nivel alto.

// Variables adicionales sugeridas por partida:
// - int nivelMaximoAlcanzado;
// - int subidasNivel;
// - int bajadasNivel;
// - int erroresImpulsivos;
// - int totalIntentos;

// Factores:
// - factorNivel = Lerp(0.5, 2.0, nivelMaximoAlcanzado / 10f);
// - penalizacionErrores = 1 - (erroresImpulsivos / totalIntentos);
// - penalizacionDificultad = 1 + (subidasNivel * 0.05f) - (bajadasNivel * 0.05f);
// - velocidadPonderada = velocidad * (1 + nivelMaximoAlcanzado * 0.1f);

// Métricas finales (ejemplo):
// - atencionSelectiva = precision * factorNivel * penalizacionErrores * penalizacionDificultad;
// - velocidadCognitiva = velocidadPonderada * penalizacionErrores * penalizacionDificultad;
// - controlInhibitorio = (1 - tasaErrores) * factorNivel;
// - coordinacionVisomotora = velocidadCognitiva * atencionSelectiva;

// Esto garantiza que:
// - Ser rápido pero fallar mucho → baja puntuación.
// - Llegar a niveles altos con buena precisión → sube mucho.
// - Ser bueno solo en nivel bajo → no puntúa tanto.
// - Bajadas de nivel → penalización global.

//////////////////////////////////////////////////////////////
// SIGUIENTE PASO AL VOLVER
//////////////////////////////////////////////////////////////

// - Implementar el sistema de puntuación avanzado en IntruderGame.
// - Extenderlo al resto de juegos (MathGame, Eco Visual, etc.).
// - Ajustar el JS/HTML para mostrar estas métricas de forma clara.
// - Opcional: añadir comparativas entre sesiones en el front.
//////////////////////////////////////////////////////////////
