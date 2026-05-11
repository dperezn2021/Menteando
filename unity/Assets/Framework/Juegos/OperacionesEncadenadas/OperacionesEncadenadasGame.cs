using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class OperacionesEncadenadasGame : BaseGame
{
    public static OperacionesEncadenadasGame Instance;

    [Header("UI interna del juego")]
    public UICalculadora ui;

    [Header("Tiempos")]
    public float tiempoMemorizacion = 2f;

    // Estado
    private int numeroMemorizado;
    private int turnosRestantesParaEspecial;
    private bool esperandoEspecial = false;
    private int respuestaEsperada;
    private bool enMemorizacion = false;
    private bool activo = false;

    // Métricas
    private int rachaActual = 0;
    private int totalOperaciones = 0;
    private int operacionesCorrectas = 0;
    private float tiempoInicioOperacion;
    private List<float> tiemposRespuesta = new();
    private List<bool> aciertos = new();
    private List<bool> fueEspecial = new();
    private List<int> nivelesPorOperacion = new();
    private List<int> rachasAlFallar = new();

    private void Awake()
    {
        Instance = this;
        nombre = "operaciones-encadenadas";

        if (ui == null)
            ui = FindFirstObjectByType<UICalculadora>();
    }

    // ============================================================
    // RESET
    // ============================================================
    public override void ResetGame()
    {
        rachaActual = 0;
        totalOperaciones = 0;
        operacionesCorrectas = 0;
        tiemposRespuesta.Clear();
        aciertos.Clear();
        fueEspecial.Clear();
        nivelesPorOperacion.Clear();
        rachasAlFallar.Clear();

        activo = true;

        StartCoroutine(FaseMemorizacion());
    }

    // ============================================================
    // MEMORIZACIÓN (RESPETA PAUSA)
    // ============================================================
    private IEnumerator FaseMemorizacion()
    {
        enMemorizacion = true;
        activo = false;

        numeroMemorizado = GenerarNumeroSegunNivel();
        ui.MostrarMemorizacion($"MEMORIZA: {numeroMemorizado}");

        float t = 0f;
        while (t < tiempoMemorizacion)
        {
            if (!juegoPausado)
                t += Time.deltaTime;

            yield return null;
        }

        ui.OcultarMemorizacion();

        turnosRestantesParaEspecial = Random.Range(2, 6);
        esperandoEspecial = false;

        GenerarOperacionNormal();

        enMemorizacion = false;
        activo = true;

        tiempoInicioOperacion = Time.time;
    }

    // ============================================================
    // GENERACIÓN DE OPERACIONES
    // ============================================================
    private int GenerarNumeroSegunNivel()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        return nivel <= 4 ? Random.Range(1, 10) : Random.Range(10, 100);
    }

    private void GenerarOperacionNormal()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        string texto = "";
        respuestaEsperada = 0;

        switch (nivel)
        {
            case 1:
            case 2:
                int a1 = Random.Range(1, 10);
                int b1 = Random.Range(1, 10);
                string op1 = Random.value > 0.5f ? "+" : "-";
                respuestaEsperada = Calcular(a1, op1, b1);
                texto = $"{a1} {op1} {b1} = ?";
                break;

            case 3:
                int m1 = Random.Range(1, 10);
                int m2 = Random.Range(1, 10);
                respuestaEsperada = m1 * m2;
                texto = $"{m1} × {m2} = ?";
                break;

            case 4:
                int divisor = Random.Range(1, 10);
                int cociente = Random.Range(1, 10);
                int dividendo = divisor * cociente;
                respuestaEsperada = cociente;
                texto = $"{dividendo} ÷ {divisor} = ?";
                break;

            default:
                int x = Random.Range(10, 100);
                int y = Random.Range(10, 100);
                string op2 = Random.value > 0.5f ? "+" : "-";
                respuestaEsperada = Calcular(x, op2, y);
                texto = $"{x} {op2} {y} = ?";
                break;
        }

        ui.MostrarOperacion(texto);
        fueEspecial.Add(false);
    }

    private void GenerarOperacionEspecial()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        int otro = nivel <= 4 ? Random.Range(1, 10) : Random.Range(10, 100);
        string[] ops = { "+", "-", "×" };
        string op = ops[Random.Range(0, ops.Length)];

        bool primero = Random.value > 0.5f;

        if (primero)
        {
            respuestaEsperada = Calcular(numeroMemorizado, op, otro);
            ui.MostrarOperacion($"? {op} {otro} = ?");
        }
        else
        {
            respuestaEsperada = Calcular(otro, op, numeroMemorizado);
            ui.MostrarOperacion($"{otro} {op} ? = ?");
        }

        fueEspecial.Add(true);
    }

    private int Calcular(int a, string op, int b)
    {
        return op switch
        {
            "+" => a + b,
            "-" => a - b,
            "×" => a * b,
            _ => 0
        };
    }

    // ============================================================
    // RESPUESTA DEL JUGADOR
    // ============================================================
    public void EnviarRespuesta(int r)
    {
        if (!activo || enMemorizacion || juegoPausado) return;

        float tiempo = Time.time - tiempoInicioOperacion;
        bool correcto = (r == respuestaEsperada);

        // Sonido
        if (correcto) AudioManager.Instance.Acierto();
        else AudioManager.Instance.Error();

        // Dificultad
        float rendimiento = correcto ? Mathf.Clamp01(1.5f - tiempo / 3f) : 0f;
        DifficultyManager.Instance.ActualizarDificultad(rendimiento, correcto, tiempo);

        // Métricas
        totalOperaciones++;
        tiemposRespuesta.Add(tiempo);
        aciertos.Add(correcto);
        nivelesPorOperacion.Add(DifficultyManager.Instance.nivelActual);

        if (correcto)
        {
            operacionesCorrectas++;
            rachaActual++;

            if (esperandoEspecial)
            {
                // ACIERTA ESPECIAL → MEMORIZACIÓN
                StartCoroutine(FaseMemorizacion());
                return;
            }

            // Operación normal acertada
            turnosRestantesParaEspecial--;

            if (turnosRestantesParaEspecial <= 0)
            {
                esperandoEspecial = true;
                GenerarOperacionEspecial();
            }
            else
            {
                GenerarOperacionNormal();
            }
        }
        else
        {
            // FALLA → MEMORIZACIÓN
            rachasAlFallar.Add(rachaActual);
            rachaActual = 0;
            StartCoroutine(FaseMemorizacion());
            return;
        }

        ui.LimpiarInput();
        tiempoInicioOperacion = Time.time;
    }

    // ============================================================
    // MÉTRICAS
    // ============================================================
    public override CognitiveMetrics CalcularCognicion()
    {
        int total = totalOperaciones;
        if (total == 0) return new CognitiveMetrics();

        float precision = (float)operacionesCorrectas / total;

        float tiempoMedio = 0f;
        foreach (float t in tiemposRespuesta) tiempoMedio += t;
        tiempoMedio /= total;

        // MEMORIA DE TRABAJO (solo especiales)
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

        float memoriaTrabajo = totalEspeciales > 0
            ? (float)aciertosEspeciales / totalEspeciales
            : 0.5f;

        // CONTROL INHIBITORIO
        float puntuacionInhibitoria = 0f;

        for (int i = 0; i < total; i++)
        {
            if (aciertos[i])
                puntuacionInhibitoria += 1f;
            else
            {
                float t = tiemposRespuesta[i];
                float penalizacion =
                    t < 1f ? 0f :
                    t < 2f ? 0.5f :
                             0.8f;

                puntuacionInhibitoria += penalizacion;
            }
        }

        float controlInhibitorio = puntuacionInhibitoria / total;

        // PLANIFICACIÓN
        float planificacion = 0.5f;
        int largas = 0;
        int aciertosLargas = 0;

        for (int i = 0; i < total; i++)
        {
            if (nivelesPorOperacion[i] > 4)
            {
                largas++;
                if (aciertos[i]) aciertosLargas++;
            }
        }

        if (largas > 0)
        {
            float precisionLarga = (float)aciertosLargas / largas;
            planificacion = precisionLarga * 0.8f + 0.2f;
        }

        // VELOCIDAD COGNITIVA
        float velocidadCognitiva = Mathf.Clamp01((1f / (tiempoMedio + 0.5f)) / 2f);

        // ATENCIÓN SELECTIVA
        float aciertosFaciles = 0;
        float totalFaciles = 0;
        float aciertosDificiles = 0;
        float totalDificiles = 0;

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
        float precisionDificil = totalDificiles > 0 ? aciertosDificiles / totalDificiles : 0.5f;

        float atencionSelectiva = (precisionFacil + precisionDificil) / 2f;

        // MÉTRICAS FINALES
        CognitiveMetrics m = new CognitiveMetrics();
        m.memoriaTrabajo = memoriaTrabajo;
        m.controlInhibitorio = controlInhibitorio;
        m.planificacion = planificacion;
        m.velocidadCognitiva = velocidadCognitiva;
        m.atencionSelectiva = atencionSelectiva;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        p.atencionSelectiva = m.atencionSelectiva * 0.05f;
        p.memoriaTrabajo = m.memoriaTrabajo * 0.50f;
        p.controlInhibitorio = m.controlInhibitorio * 0.10f;
        p.planificacion = m.planificacion * 0.15f;
        p.velocidadCognitiva = m.velocidadCognitiva * 0.20f;

        return p;
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    public override void OnGameFinished()
    {
        // Nada que hacer
    }
}
