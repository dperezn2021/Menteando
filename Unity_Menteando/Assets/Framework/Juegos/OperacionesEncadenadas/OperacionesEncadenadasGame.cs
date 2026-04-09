//using UnityEngine;
//using System.Collections;
//using System.Collections.Generic;

//public class OperacionesEncadenadasGame : BaseGame
//{
//    public static OperacionesEncadenadasGame Instance;

//    [Header("Referencia UI")]
//    public UICalculadora uiCalculadora;

//    [Header("Configuración")]
//    public float tiempoMostrarMemorizacion = 2f;

//    // Estado del juego
//    private int numeroMemorizado;
//    private int turnosRestantesParaEspecial;  // cuenta regresiva para la operación especial
//    private bool esperandoOperacionEspecial = false;
//    private int respuestaEsperada;
//    private bool juegoActivo = false;
//    private bool enFaseMemorizacion = false;

//    // Racha y métricas
//    public int rachaActual = 0;
//    private int rachaObjetivoParaNuevoNumero; // no se usa, pero lo mantenemos por si acaso
//    private List<float> tiemposRespuesta = new List<float>();
//    private List<bool> aciertos = new List<bool>();
//    private List<int> rachasAlFallar = new List<int>();
//    private int totalOperaciones = 0;
//    private int operacionesCorrectas = 0;
//    private float tiempoInicioOperacion;
//    private List<bool> fueOperacionEspecial = new List<bool>();
//    private List<int> nivelesPorOperacion = new List<int>();


//    private void Awake()
//    {
//        Instance = this;
//        nombre = "operaciones encadenadas";
//        if (uiCalculadora == null)
//            uiCalculadora = FindFirstObjectByType<UICalculadora>();
//        if (uiCalculadora == null)
//            Debug.LogError("UICalculadora no encontrada");
//        else
//            uiCalculadora.Inicializar(this);
//    }

//    public override void ResetGame()
//    {
//        Debug.Log("=== RESETGAME LLAMADO ===");
//        rachaActual = 0;
//        totalOperaciones = 0;
//        operacionesCorrectas = 0;
//        tiemposRespuesta.Clear();
//        aciertos.Clear();
//        rachasAlFallar.Clear();
//        juegoActivo = true;
//        StartCoroutine(FaseMemorizacionInicial());
//        GameUIManager.Instance.ReproducirMusicaFondo(GameUIManager.Instance.musicaFondo);
//    }

//    private IEnumerator FaseMemorizacionInicial()
//    {
//        enFaseMemorizacion = true;
//        juegoActivo = false;
//        numeroMemorizado = GenerarNumeroSegunNivel();
//        uiCalculadora.MostrarMensajeMemorizacion($"MEMORIZA: {numeroMemorizado}", tiempoMostrarMemorizacion);

//        yield return new WaitForSeconds(tiempoMostrarMemorizacion);
//        // Iniciar el ciclo: generamos un número aleatorio de turnos normales (2-5)
//        turnosRestantesParaEspecial = Random.Range(2, 6);
//        esperandoOperacionEspecial = false;
//        GenerarOperacionNormal();
//        enFaseMemorizacion = false;
//        juegoActivo = true;
//        uiCalculadora.LimpiarInput();
//        EmpezarIntento();
//        tiempoInicioOperacion = Time.time;
//    }

//    private void GenerarOperacionNormal()
//    {
//        if (uiCalculadora == null) return;

//        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
//        respuestaEsperada = 0;
//        string texto = "";

//        switch (nivel)
//        {
//            case 1:
//            case 2:
//                // Sumas y restas 1 dígito
//                int a1 = Random.Range(1, 10);
//                int b1 = Random.Range(1, 10);
//                string[] ops1 = { "+", "-" };
//                string op1 = ops1[Random.Range(0, ops1.Length)];
//                respuestaEsperada = Calcular(a1, op1, b1);
//                texto = $"{a1} {op1} {b1} = ?";
//                break;

//            case 3:
//                // Multiplicación 1 dígito
//                int a2 = Random.Range(1, 10);
//                int b2 = Random.Range(1, 10);
//                respuestaEsperada = a2 * b2;
//                texto = $"{a2} × {b2} = ?";
//                break;

//            case 4:
//                // División entera 1 dígito
//                int divisor = Random.Range(1, 10);
//                int cociente = Random.Range(1, 10);
//                int dividendo = divisor * cociente;
//                respuestaEsperada = cociente;
//                texto = $"{dividendo} ÷ {divisor} = ?";
//                break;

//            case 5:
//                // Sumas y restas 1+2 dígitos
//                int a3 = Random.Range(1, 10);
//                int b3 = Random.Range(10, 100);
//                string[] ops3 = { "+", "-" };
//                string op3 = ops3[Random.Range(0, ops3.Length)];
//                respuestaEsperada = Calcular(a3, op3, b3);
//                texto = $"{a3} {op3} {b3} = ?";
//                break;

//            case 6:
//                // Multiplicación 1×2 dígitos
//                int a4 = Random.Range(1, 10);
//                int b4 = Random.Range(10, 100);
//                respuestaEsperada = a4 * b4;
//                texto = $"{a4} × {b4} = ?";
//                break;

//            case 7:
//                // Sumas y restas 2 dígitos
//                int a5 = Random.Range(10, 100);
//                int b5 = Random.Range(10, 100);
//                string[] ops5 = { "+", "-" };
//                string op5 = ops5[Random.Range(0, ops5.Length)];
//                respuestaEsperada = Calcular(a5, op5, b5);
//                texto = $"{a5} {op5} {b5} = ?";
//                break;

//            case 8:
//                // Multiplicación 2 dígitos
//                int a6 = Random.Range(10, 100);
//                int b6 = Random.Range(10, 100);
//                respuestaEsperada = a6 * b6;
//                texto = $"{a6} × {b6} = ?";
//                break;

//            case 9:
//                // División 2 dígitos
//                int divisor2 = Random.Range(10, 100);
//                int cociente2 = Random.Range(1, 10);
//                int dividendo2 = divisor2 * cociente2;
//                respuestaEsperada = cociente2;
//                texto = $"{dividendo2} ÷ {divisor2} = ?";
//                break;

//            case 10:
//                // Combinado avanzado (todo mezclado)
//                int tipo = Random.Range(0, 4);
//                if (tipo == 0) // Suma/resta 3 dígitos
//                {
//                    int a7 = Random.Range(100, 1000);
//                    int b7 = Random.Range(100, 1000);
//                    string[] ops7 = { "+", "-" };
//                    string op7 = ops7[Random.Range(0, ops7.Length)];
//                    respuestaEsperada = Calcular(a7, op7, b7);
//                    texto = $"{a7} {op7} {b7} = ?";
//                }
//                else if (tipo == 1) // Multiplicación 2×2
//                {
//                    int a7 = Random.Range(10, 100);
//                    int b7 = Random.Range(10, 100);
//                    respuestaEsperada = a7 * b7;
//                    texto = $"{a7} × {b7} = ?";
//                }
//                else // División 2 dígitos
//                {
//                    int divisor3 = Random.Range(10, 100);
//                    int cociente3 = Random.Range(1, 10);
//                    int dividendo3 = divisor3 * cociente3;
//                    respuestaEsperada = cociente3;
//                    texto = "{dividendo3} ÷ {divisor3} = ?";
//                }
//                break;
//        }

//        uiCalculadora.ActualizarOperacion(texto);
//        fueOperacionEspecial.Add(false);

//        Debug.Log($"Operación NORMAL (nivel {nivel}): {texto} | Respuesta: {respuestaEsperada}");
//    }
//    private void GenerarOperacionEspecial()
//    {
//        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
//        int digitos = (nivel <= 4) ? 1 : 2;
//        int otroNumero = GenerarNumeroConDigitos(digitos);
//        string[] ops = { "+", "-", "×" };
//        string operador = ops[Random.Range(0, ops.Length)];
//        // Decidir si el número memorizado va primero o segundo
//        bool primero = Random.value > 0.5f;
//        if (primero)
//        {
//            respuestaEsperada = Calcular(numeroMemorizado, operador, otroNumero);
//            uiCalculadora.ActualizarOperacion($"? {operador} {otroNumero} = ?");
//        }
//        else
//        {
//            respuestaEsperada = Calcular(otroNumero, operador, numeroMemorizado);
//            uiCalculadora.ActualizarOperacion($"{otroNumero} {operador} ? = ?");
//        }
//        fueOperacionEspecial.Add(true);

//        Debug.Log($"Operación ESPECIAL (memorizado={numeroMemorizado}) | Respuesta esperada: {respuestaEsperada}");
//    }

//    private int GenerarNumeroConDigitos(int digitos)
//    {
//        return digitos == 1 ? Random.Range(1, 10) : Random.Range(10, 100);
//    }

//    private int Calcular(int a, string op, int b)
//    {
//        switch (op)
//        {
//            case "+": return a + b;
//            case "-": return a - b;
//            case "×": return a * b;
//            default: return 0;
//        }
//    }

//    private int GenerarNumeroSegunNivel()
//    {
//        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
//        int digitos = (nivel <= 4) ? 1 : 2;
//        return GenerarNumeroConDigitos(digitos);
//    }

//    public void EnviarRespuesta(int respuestaUsuario)
//    {
//        if (!juegoActivo || enFaseMemorizacion) return;
//        float tiempoRespuesta = Time.time - tiempoInicioOperacion;
//        bool esCorrecto = (respuestaUsuario == respuestaEsperada);

//        float rendimiento = esCorrecto ? Mathf.Clamp01(1.5f - (tiempoRespuesta / 3f)) : 0f;
//        DifficultyManager.Instance.ActualizarDificultad(rendimiento, esCorrecto, tiempoRespuesta);
//        // Reproducir sonido según acierto/error
//        if (esCorrecto)
//            GameUIManager.Instance?.ReproducirAcierto();
//        else
//            GameUIManager.Instance?.ReproducirError();

//        totalOperaciones++;
//        tiemposRespuesta.Add(tiempoRespuesta);
//        aciertos.Add(esCorrecto);
//        fueOperacionEspecial.Add(esperandoOperacionEspecial);
//        nivelesPorOperacion.Add(DifficultyManager.Instance.nivelActual);


//        if (esCorrecto)
//        {
//            operacionesCorrectas++;
//            rachaActual++;
//            if (esperandoOperacionEspecial)
//            {
//                // Acertó la operación especial → seguir con operaciones normales
//                esperandoOperacionEspecial = false;
//                turnosRestantesParaEspecial = Random.Range(2, 6);
//                StartCoroutine(FaseMemorizacionInicial());
//            }
//            else
//            {
//                // Operación normal acertada
//                turnosRestantesParaEspecial--;
//                if (turnosRestantesParaEspecial <= 0)
//                {
//                    // Toca operación especial
//                    esperandoOperacionEspecial = true;
//                    GenerarOperacionEspecial();

//                }
//                else
//                {
//                    GenerarOperacionNormal();
//                }
//            }
//            uiCalculadora.LimpiarInput();
//        }
//        else
//        {
//            // Fallo: se pierde la racha y se reinicia con un nuevo número a memorizar
//            rachasAlFallar.Add(rachaActual);
//            rachaActual = 0;
//            StartCoroutine(FaseMemorizacionInicial());
//            return;
//        }

//        EmpezarIntento();
//        tiempoInicioOperacion = Time.time;
//    }


//    public override CognitiveMetrics CalcularCognicion()
//    {
//        int total = totalOperaciones;
//        if (total == 0) return new CognitiveMetrics();

//        float precision = (float)operacionesCorrectas / total;
//        float tiempoMedio = 0f;
//        foreach (float t in tiemposRespuesta) tiempoMedio += t;
//        tiempoMedio /= total;

//        // 1. MEMORIA DE TRABAJO (solo operaciones especiales)
//        int totalEspeciales = 0;
//        int aciertosEspeciales = 0;
//        for (int i = 0; i < total; i++)
//        {
//            if (fueOperacionEspecial[i])
//            {
//                totalEspeciales++;
//                if (aciertos[i]) aciertosEspeciales++;
//            }
//        }

//        float memoriaTrabajo = 0.5f; // valor neutro por defecto
//        if (totalEspeciales > 0)
//        {
//            float precisionEspecial = (float)aciertosEspeciales / totalEspeciales;

//            // Factor de racha: media de aciertos antes de fallar (rachasAlFallar)
//            float mediaRachaAntesDeFallar = 0f;
//            foreach (int r in rachasAlFallar) mediaRachaAntesDeFallar += r;
//            mediaRachaAntesDeFallar = (rachasAlFallar.Count > 0) ? mediaRachaAntesDeFallar / rachasAlFallar.Count : 5f;

//            // Normalizar: una racha de 5 aciertos seguidos es excelente
//            float factorRacha = Mathf.Clamp01(mediaRachaAntesDeFallar / 5f);

//            // Memoria de trabajo = precisión en especiales × capacidad de mantener racha
//            memoriaTrabajo = precisionEspecial * factorRacha;
//        }

//        // 2. CONTROL INHIBITORIO
//        float puntuacionInhibitoria = 0f;
//        for (int i = 0; i < total; i++)
//        {
//            if (aciertos[i])
//            {
//                puntuacionInhibitoria += 1f; // Acierto suma 1
//            }
//            else
//            {
//                // Error: penaliza más si fue rápido
//                float tiempo = tiemposRespuesta[i];
//                float penalizacion;

//                if (tiempo < 1f)
//                    penalizacion = 0f;      // Error impulsivo → 0 puntos
//                else if (tiempo < 2f)
//                    penalizacion = 0.5f;    // Error medio → 0.5 puntos
//                else
//                    penalizacion = 0.8f;    // Error reflexivo → 0.8 puntos

//                puntuacionInhibitoria += penalizacion;
//            }
//        }
//        float controlInhibitorio = puntuacionInhibitoria / total;


//        // 3. PLANIFICACIÓN
//        // PLANIFICACIÓN (rediseñada)
//        float planificacion = 0.5f;
//        int operacionesLargas = 0;
//        int aciertosEnLargas = 0;

//        for (int i = 0; i < total; i++)
//        {
//            // Una operación de 3 números (nivel > 4) requiere planificación
//            if (nivelesPorOperacion[i] > 4)  // Necesitas guardar el nivel de cada operación
//            {
//                operacionesLargas++;
//                if (aciertos[i]) aciertosEnLargas++;
//            }
//        }

//        if (operacionesLargas > 0)
//        {
//            // Planificación = aciertos en operaciones largas × factor de tiempo adecuado
//            float precisionLarga = (float)aciertosEnLargas / operacionesLargas;
//            planificacion = precisionLarga * 0.8f + 0.2f; // Ajuste
//        }
//        // 4. VELOCIDAD COGNITIVA
//        float velocidadCognitiva = 1f / (tiempoMedio + 0.5f);
//        velocidadCognitiva = Mathf.Clamp01(velocidadCognitiva / 2f);

//        // 5. ATENCIÓN SELECTIVA
//        // ATENCIÓN SELECTIVA (mejorada)
//        float aciertosFaciles = 0;
//        float totalFaciles = 0;
//        float aciertosDifíciles = 0;
//        float totalDifíciles = 0;

//        for (int i = 0; i < total; i++)
//        {
//            if (nivelesPorOperacion[i] <= 4) // Fáciles (nivel 1-4)
//            {
//                totalFaciles++;
//                if (aciertos[i]) aciertosFaciles++;
//            }
//            else // Difíciles (nivel 5+)
//            {
//                totalDifíciles++;
//                if (aciertos[i]) aciertosDifíciles++;
//            }
//        }

//        float precisionFacil = totalFaciles > 0 ? aciertosFaciles / totalFaciles : 0.5f;
//        float precisionDificil = totalDifíciles > 0 ? aciertosDifíciles / totalDifíciles : 0.5f;

//        // La atención selectiva es buena si mantienes precisión alta en ambas
//        float atencionSelectiva = (precisionFacil + precisionDificil) / 2f;

//        // Crear métricas SOLO con las 5 relevantes
//        CognitiveMetrics metrics = new CognitiveMetrics();
//        metrics.memoriaTrabajo = memoriaTrabajo;
//        metrics.controlInhibitorio = controlInhibitorio;
//        metrics.planificacion = planificacion;
//        metrics.velocidadCognitiva = velocidadCognitiva;
//        metrics.atencionSelectiva = atencionSelectiva;

//        // Las que no se usan en este juego van a 0
//        metrics.atencionSostenida = 0f;
//        metrics.atencionDividida = 0f;
//        metrics.memoriaEspacial = 0f;
//        metrics.flexibilidadCognitiva = 0f;
//        metrics.coordinacionVisomotora = 0f;

//        return metrics;
//    }

//    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
//    {
//        CognitiveMetrics p = new CognitiveMetrics();

//        p.atencionSelectiva = m.atencionSelectiva * 0.05f;
//        p.memoriaTrabajo = m.memoriaTrabajo * 0.50f;
//        p.controlInhibitorio = m.controlInhibitorio * 0.10f;
//        p.planificacion = m.planificacion * 0.15f;
//        p.velocidadCognitiva = m.velocidadCognitiva * 0.20f;

//        // El resto no aporta en este juego
//        p.atencionSostenida = 0f;
//        p.atencionDividida = 0f;
//        p.memoriaEspacial = 0f;
//        p.flexibilidadCognitiva = 0f;
//        p.coordinacionVisomotora = 0f;

//        return p;
//    }

//}