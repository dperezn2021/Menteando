using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class OperacionesEncadenadasGame : BaseGame
{
    public static OperacionesEncadenadasGame Instance;

    [Header("UI interna del juego")]
    public UICalculadora ui;

    [Header("Configuracion")]
    public float tiempoMemorizacion = 2f;

    private int numeroMemorizado;
    private int turnosRestantesParaEspecial;
    private bool esperandoEspecial = false;
    private int respuestaEsperada;
    private bool enMemorizacion = false;
    private bool activo = false;
    private bool finalizado = false;
    private Coroutine rutinaMemorizacion;

    public int rachaActual = 0;
    private int totalOperaciones = 0;
    private int operacionesCorrectas = 0;
    private float tiempoInicioOperacion;
    private readonly List<float> tiemposRespuesta = new List<float>();
    private readonly List<bool> aciertos = new List<bool>();
    private readonly List<bool> fueEspecial = new List<bool>();
    private readonly List<int> nivelesPorOperacion = new List<int>();
    private readonly List<int> rachasAlFallar = new List<int>();

    private void Awake()
    {
        Instance = this;
        nombre = "operaciones encadenadas";

        if (ui == null)
            ui = FindFirstObjectByType<UICalculadora>();

        if (ui != null)
            ui.Inicializar(this);
        else
            Debug.LogError("UICalculadora no encontrada");
    }

    public override void ResetGame()
    {
        if (rutinaMemorizacion != null)
            StopCoroutine(rutinaMemorizacion);

        finalizado = false;
        juegoPausado = false;
        rachaActual = 0;
        totalOperaciones = 0;
        operacionesCorrectas = 0;
        tiemposRespuesta.Clear();
        aciertos.Clear();
        fueEspecial.Clear();
        nivelesPorOperacion.Clear();
        rachasAlFallar.Clear();

        activo = false;
        enMemorizacion = false;
        esperandoEspecial = false;

        DifficultyManager.Instance?.ResetDifficulty(1);

        if (ui == null)
            ui = FindFirstObjectByType<UICalculadora>();

        ui?.Inicializar(this);
        rutinaMemorizacion = StartCoroutine(FaseMemorizacionInicial());
    }

    private IEnumerator FaseMemorizacionInicial()
    {
        enMemorizacion = true;
        activo = false;
        esperandoEspecial = false;

        numeroMemorizado = GenerarNumeroSegunNivel();

        if (ui == null)
        {
            yield break;
        }

        ui.MostrarMemorizacion($"MEMORIZA: {numeroMemorizado}");

        yield return GamePause.WaitWhileNotPaused(tiempoMemorizacion, () => juegoPausado || finalizado);

        if (finalizado) yield break;

        turnosRestantesParaEspecial = Random.Range(2, 6);
        GenerarOperacionNormal();

        enMemorizacion = false;
        activo = true;
        ui?.LimpiarInput();
        tiempoInicioOperacion = Time.time;
    }

    private void ReiniciarConMemorizacion()
    {
        if (rutinaMemorizacion != null)
            StopCoroutine(rutinaMemorizacion);

        rutinaMemorizacion = StartCoroutine(FaseMemorizacionInicial());
    }

    private void GenerarOperacionNormal()
    {
        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
        respuestaEsperada = 0;
        string texto = "";

        switch (nivel)
        {
            case 1:
            case 2:
                int a = Random.Range(1, 10);
                int b = Random.Range(1, 10);
                string op = Random.value > 0.5f ? "+" : "-";
                respuestaEsperada = Calcular(a, op, b);
                texto = $"{a} {op} {b} = ?";
                break;
            case 3:
                int a3 = Random.Range(1, 10);
                int b3 = Random.Range(1, 10);
                respuestaEsperada = a3 * b3;
                texto = $"{a3} x {b3} = ?";
                break;
            case 4:
                int divisor = Random.Range(1, 10);
                int cociente = Random.Range(1, 10);
                int dividendo = divisor * cociente;
                respuestaEsperada = cociente;
                texto = $"{dividendo} / {divisor} = ?";
                break;
            case 5:
                int a5 = Random.Range(1, 10);
                int b5 = Random.Range(10, 100);
                string op5 = Random.value > 0.5f ? "+" : "-";
                respuestaEsperada = Calcular(a5, op5, b5);
                texto = $"{a5} {op5} {b5} = ?";
                break;
            case 6:
                int a6 = Random.Range(1, 10);
                int b6 = Random.Range(10, 100);
                respuestaEsperada = a6 * b6;
                texto = $"{a6} x {b6} = ?";
                break;
            case 7:
                int a7 = Random.Range(10, 100);
                int b7 = Random.Range(10, 100);
                string op7 = Random.value > 0.5f ? "+" : "-";
                respuestaEsperada = Calcular(a7, op7, b7);
                texto = $"{a7} {op7} {b7} = ?";
                break;
            case 8:
                int a8 = Random.Range(10, 100);
                int b8 = Random.Range(10, 100);
                respuestaEsperada = a8 * b8;
                texto = $"{a8} x {b8} = ?";
                break;
            case 9:
                int divisor9 = Random.Range(10, 100);
                int cociente9 = Random.Range(1, 10);
                int dividendo9 = divisor9 * cociente9;
                respuestaEsperada = cociente9;
                texto = $"{dividendo9} / {divisor9} = ?";
                break;
            case 10:
            default:
                int tipo = Random.Range(0, 3);
                if (tipo == 0)
                {
                    int a10 = Random.Range(100, 1000);
                    int b10 = Random.Range(100, 1000);
                    string op10 = Random.value > 0.5f ? "+" : "-";
                    respuestaEsperada = Calcular(a10, op10, b10);
                    texto = $"{a10} {op10} {b10} = ?";
                }
                else if (tipo == 1)
                {
                    int a10 = Random.Range(10, 100);
                    int b10 = Random.Range(10, 100);
                    respuestaEsperada = a10 * b10;
                    texto = $"{a10} x {b10} = ?";
                }
                else
                {
                    int divisor10 = Random.Range(10, 100);
                    int cociente10 = Random.Range(1, 10);
                    int dividendo10 = divisor10 * cociente10;
                    respuestaEsperada = cociente10;
                    texto = $"{dividendo10} / {divisor10} = ?";
                }
                break;
        }

        esperandoEspecial = false;
        ui?.MostrarOperacion(texto);
    }

    private void GenerarOperacionEspecial()
    {
        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
        int otroNumero = GenerarNumeroConDigitos(nivel <= 4 ? 1 : 2);
        string[] ops = { "+", "-", "x" };
        string operador = ops[Random.Range(0, ops.Length)];
        bool primero = Random.value > 0.5f;

        if (primero)
        {
            respuestaEsperada = Calcular(numeroMemorizado, operador, otroNumero);
            ui?.MostrarOperacion($"? {operador} {otroNumero} = ?");
        }
        else
        {
            respuestaEsperada = Calcular(otroNumero, operador, numeroMemorizado);
            ui?.MostrarOperacion($"{otroNumero} {operador} ? = ?");
        }

        esperandoEspecial = true;
    }

    private int GenerarNumeroSegunNivel()
    {
        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
        return GenerarNumeroConDigitos(nivel <= 4 ? 1 : 2);
    }

    private int GenerarNumeroConDigitos(int digitos)
    {
        return digitos == 1 ? Random.Range(1, 10) : Random.Range(10, 100);
    }

    private int Calcular(int a, string op, int b)
    {
        switch (op)
        {
            case "+": return a + b;
            case "-": return a - b;
            case "x": return a * b;
            case "×": return a * b;
            default: return 0;
        }
    }

    public void EnviarRespuesta(int respuestaUsuario)
    {
        if (!activo || enMemorizacion || juegoPausado || finalizado)
            return;

        float tiempoRespuesta = Time.time - tiempoInicioOperacion;
        bool esCorrecto = respuestaUsuario == respuestaEsperada;
        bool eraEspecial = esperandoEspecial;

        if (esCorrecto)
            AudioManager.Instance?.Acierto();
        else
            AudioManager.Instance?.Error();

        totalOperaciones++;
        if (esCorrecto) operacionesCorrectas++;

        tiemposRespuesta.Add(tiempoRespuesta);
        aciertos.Add(esCorrecto);
        fueEspecial.Add(eraEspecial);
        nivelesPorOperacion.Add(DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1);

        float rendimiento = esCorrecto ? Mathf.Clamp01(1.5f - (tiempoRespuesta / 3f)) : 0f;
        DifficultyManager.Instance?.ActualizarDificultad(rendimiento, esCorrecto, tiempoRespuesta);

        if (esCorrecto)
        {
            rachaActual++;

            if (eraEspecial)
            {
                ui?.LimpiarInput();
                ReiniciarConMemorizacion();
                return;
            }

            turnosRestantesParaEspecial--;
            if (turnosRestantesParaEspecial <= 0)
                GenerarOperacionEspecial();
            else
                GenerarOperacionNormal();

            ui?.LimpiarInput();
            tiempoInicioOperacion = Time.time;
        }
        else
        {
            rachasAlFallar.Add(rachaActual);
            rachaActual = 0;
            ui?.LimpiarInput();
            ReiniciarConMemorizacion();
        }

    

    }

    public override CognitiveMetrics CalcularCognicion()
    {
        int total = totalOperaciones;
        if (total == 0) return new CognitiveMetrics();

        float tiempoMedio = MetricUtils.Average(tiemposRespuesta, 1f);

        // VELOCIDAD COGNITIVA (corregida)
        float velocidadCognitiva = Mathf.Clamp01(2f / (tiempoMedio + 0.5f));

        // MEMORIA DE TRABAJO
        int totalEspeciales = 0;
        int aciertosEspeciales = 0;
        for (int i = 0; i < total; i++)
        {
            if (fueEspecial[i])
            {
                totalEspeciales++;
                if (aciertos[i]) aciertosEspeciales++;
            }
        }
        float memoriaTrabajo = totalEspeciales > 0 ? (float)aciertosEspeciales / totalEspeciales : 0.3f;

        // PLANIFICACIÓN
        int operacionesLargas = 0;
        int aciertosLargas = 0;
        for (int i = 0; i < total; i++)
        {
            if (nivelesPorOperacion[i] > 4)
            {
                operacionesLargas++;
                if (aciertos[i]) aciertosLargas++;
            }
        }
        float planificacion = operacionesLargas > 0 ? (float)aciertosLargas / operacionesLargas : 0.2f;

        // ATENCIÓN SELECTIVA
        float aciertosFaciles = 0f, totalFaciles = 0f;
        float aciertosDificiles = 0f, totalDificiles = 0f;
        for (int i = 0; i < total; i++)
        {
            if (nivelesPorOperacion[i] <= 4)
            {
                totalFaciles++;
                if (aciertos[i]) aciertosFaciles++;
            }
            else
            {
                totalDificiles++;
                if (aciertos[i]) aciertosDificiles++;
            }
        }
        float precisionFacil = totalFaciles > 0 ? aciertosFaciles / totalFaciles : 0.5f;
        float precisionDificil = totalDificiles > 0 ? aciertosDificiles / totalDificiles : 0f;
        float atencionSelectiva = (precisionFacil + precisionDificil) / 2f;

        return new CognitiveMetrics
        {
            memoriaTrabajo = Mathf.Clamp01(memoriaTrabajo),
            controlInhibitorio = 0f,
            planificacion = Mathf.Clamp01(planificacion),
            velocidadCognitiva = Mathf.Clamp01(velocidadCognitiva),
            atencionSelectiva = Mathf.Clamp01(atencionSelectiva)
        };
    }
    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        return new CognitiveMetrics
        {
            memoriaTrabajo = m.memoriaTrabajo * 0.50f,
            planificacion = m.planificacion * 0.25f,
            velocidadCognitiva = m.velocidadCognitiva * 0.20f,
            atencionSelectiva = m.atencionSelectiva * 0.05f
        };
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (finalizado) return;
        finalizado = true;
        activo = false;
        enMemorizacion = false;
        if (rutinaMemorizacion != null) StopCoroutine(rutinaMemorizacion);
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
    }
}
