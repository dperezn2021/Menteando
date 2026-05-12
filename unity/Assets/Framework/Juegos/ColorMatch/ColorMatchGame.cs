using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class ColorMatchGame : BaseGame
{
    [Header("Configuración")]
    public float tiempoPorRonda = 3f;
    public float tiempoEntreRondas = 0.35f;

    [Header("Referencia UI")]
    public ColorWheelUI colorWheel;

    // 🔥 Lista completa de colores (8 colores)
    private List<ColorStroopData> todosLosColores = new List<ColorStroopData>()
    {
        new ColorStroopData("ROJO", Color.red),
        new ColorStroopData("AZUL", Color.blue),
        new ColorStroopData("VERDE", Color.green),
        new ColorStroopData("AMARILLO", Color.yellow),
        new ColorStroopData("MORADO", new Color(0.8f, 0.2f, 0.9f)),
        new ColorStroopData("CIAN", Color.cyan),
        new ColorStroopData("NARANJA", new Color(1f, 0.5f, 0f)),
        new ColorStroopData("ROSA", new Color(1f, 0.3f, 0.8f))
    };

    private bool rondaActiva = false;
    private string colorCorrectoActual;
    private float tiempoInicioRonda;
    private Coroutine rutinaRonda;

    private int aciertos = 0;
    private int errores = 0;
    private int totalIntentos = 0;
    private int racha = 0;
    private int mejorRacha = 0;
    private List<float> tiemposReaccion = new List<float>();

    public System.Action<int> OnRachaActualizada;
    public System.Action<int> OnNivelActualizado;

    private void Awake()
    {
        nombre = "color-match";
    }

    public override void ResetGame()
    {
        if (rutinaRonda != null) StopCoroutine(rutinaRonda);

        aciertos = 0;
        errores = 0;
        totalIntentos = 0;
        racha = 0;
        mejorRacha = 0;
        tiemposReaccion.Clear();
        rondaActiva = false;

        DifficultyManager.Instance?.ResetDifficulty(1);

        int nivelInicial = DifficultyManager.Instance?.nivelActual ?? 1;
        if (colorWheel != null)
        {
            colorWheel.GenerarRosco(nivelInicial);
        }

        OnRachaActualizada?.Invoke(0);
        OnNivelActualizado?.Invoke(nivelInicial);

        StartCoroutine(IniciarPartida());
    }

    private IEnumerator IniciarPartida()
    {
        yield return new WaitForSeconds(0.5f);
        GenerarRonda();
    }

    private void GenerarRonda()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;

        // Regenerar rosco si cambia el nivel
        if (colorWheel != null)
        {
            colorWheel.GenerarRosco(nivel);
        }

        // 🔥 Obtener los colores que están ACTUALMENTE en el rosco
        List<Color> coloresEnRosco = colorWheel?.coloresEnRoscoActual ?? new List<Color>();

        if (coloresEnRosco.Count == 0)
        {
            Debug.LogError("❌ No hay colores en el rosco");
            return;
        }

        // 🔥 Crear lista de ColorStroopData para los colores del rosco
        List<ColorStroopData> coloresRoscoData = new List<ColorStroopData>();
        foreach (var color in coloresEnRosco)
        {
            string nombre = ObtenerNombrePorColor(color);
            if (nombre != "DESCONOCIDO")
            {
                coloresRoscoData.Add(new ColorStroopData(nombre, color));
            }
        }

        ColorStroopData palabra;
        ColorStroopData colorVisual;

        if (nivel <= 5)
        {
            // Nivel 1-5: palabra y color están en el rosco
            palabra = coloresRoscoData[Random.Range(0, coloresRoscoData.Count)];
            colorVisual = coloresRoscoData[Random.Range(0, coloresRoscoData.Count)];
        }
        else
        {
            // Nivel 6-10: palabra puede ser de TODOS los colores, color visual debe estar en el rosco
            palabra = todosLosColores[Random.Range(0, todosLosColores.Count)];
            colorVisual = coloresRoscoData[Random.Range(0, coloresRoscoData.Count)];
        }

        colorCorrectoActual = colorVisual.nombre;
        colorWheel?.ActualizarCentro(palabra.nombre, colorVisual.color);

        tiempoInicioRonda = Time.time;
        rondaActiva = true;

        if (rutinaRonda != null) StopCoroutine(rutinaRonda);
        rutinaRonda = StartCoroutine(TemporizadorRonda());

        Debug.Log($"🎯 Nivel {nivel} - Palabra: {palabra.nombre} (color {colorVisual.nombre}), ColorCorrecto: {colorCorrectoActual}");
    }

    private string ObtenerNombrePorColor(Color color)
    {
        foreach (var c in todosLosColores)
        {
            if (Mathf.Approximately(c.color.r, color.r) &&
                Mathf.Approximately(c.color.g, color.g) &&
                Mathf.Approximately(c.color.b, color.b))
            {
                return c.nombre;
            }
        }
        return "DESCONOCIDO";
    }

    public void ProcesarRespuesta(int indiceBoton)
    {
        if (!rondaActiva || juegoPausado) return;

        // 🔥 Obtener el color REAL según el índice del botón
        if (colorWheel == null || colorWheel.coloresEnRoscoActual.Count == 0)
        {
            Debug.LogError("❌ No se puede procesar respuesta: rosco vacío");
            return;
        }

        int idx = indiceBoton % colorWheel.coloresEnRoscoActual.Count;
        Color colorBoton = colorWheel.coloresEnRoscoActual[idx];
        string colorSeleccionado = ObtenerNombrePorColor(colorBoton);

        bool esCorrecto = (colorSeleccionado == colorCorrectoActual);
        float tiempoRespuesta = Time.time - tiempoInicioRonda;

        Debug.Log($"🔘 Botón {indiceBoton} -> Color: {colorSeleccionado}, Correcto: {colorCorrectoActual} -> {(esCorrecto ? "✅" : "❌")}");

        RegistrarRespuesta(esCorrecto, tiempoRespuesta);
    }

    private void RegistrarRespuesta(bool esCorrecto, float tiempo)
    {
        if (!rondaActiva) return;

        rondaActiva = false;
        if (rutinaRonda != null) StopCoroutine(rutinaRonda);

        totalIntentos++;
        tiemposReaccion.Add(tiempo);

        if (esCorrecto)
        {
            aciertos++;
            racha++;
            if (racha > mejorRacha) mejorRacha = racha;
            AudioManager.Instance?.Acierto();
            OnRachaActualizada?.Invoke(racha);
        }
        else
        {
            errores++;
            racha = 0;
            AudioManager.Instance?.Error();
            OnRachaActualizada?.Invoke(0);
        }

        float rendimiento = (float)aciertos / totalIntentos;
        DifficultyManager.Instance?.ActualizarDificultad(rendimiento, esCorrecto, tiempo);

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        OnNivelActualizado?.Invoke(nivel);

        StartCoroutine(EsperarSiguienteRonda());
    }

    private IEnumerator EsperarSiguienteRonda()
    {
        yield return new WaitForSeconds(tiempoEntreRondas);
        if (!juegoPausado)
            GenerarRonda();
    }

    private IEnumerator TemporizadorRonda()
    {
        float tiempoRestante = tiempoPorRonda;

        while (tiempoRestante > 0 && rondaActiva && !juegoPausado)
        {
            tiempoRestante -= Time.deltaTime;
            yield return null;
        }

        if (rondaActiva && !juegoPausado)
        {
            RegistrarRespuesta(false, tiempoPorRonda);
        }
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        float precision = totalIntentos > 0 ? (float)aciertos / totalIntentos : 0f;
        float tiempoMedio = MetricUtils.Average(tiemposReaccion, 1f);
        float velocidad = MetricUtils.VelocidadNormalizada(tiempoMedio, 0.8f);
        float controlInhibitorio = 1f - ((float)errores / Mathf.Max(1, totalIntentos));

        m.controlInhibitorio = Mathf.Clamp01(controlInhibitorio);
        m.velocidadCognitiva = velocidad;  // Sin dividir por 2        m.atencionDividida = Mathf.Clamp01(precision);
        m.memoriaTrabajo = Mathf.Clamp01((float)mejorRacha / 20f);

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.controlInhibitorio = m.controlInhibitorio * 0.50f;
        p.velocidadCognitiva = m.velocidadCognitiva * 0.25f;
        p.atencionDividida = m.atencionDividida * 0.15f;
        p.memoriaTrabajo = m.memoriaTrabajo * 0.10f;
        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        if (!pausar && !rondaActiva)
        {
            GenerarRonda();
        }
    }

    [System.Serializable]
    public class ColorStroopData
    {
        public string nombre;
        public Color color;

        public ColorStroopData(string nombre, Color color)
        {
            this.nombre = nombre;
            this.color = color;
        }
    }
}