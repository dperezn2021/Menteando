using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class ColorMatchGame : BaseGame
{
    [Header("Configuracion")]
    public float tiempoPorRonda = 3f;
    public float tiempoEntreRondas = 0.35f;

    [Header("Referencia UI")]
    public ColorWheelUI colorWheel;
    public UIColorMatch uiColorMatch; // 🔥 CAMBIO

    private const int NIVEL_CAMBIO_REGLA = 6; // 🔥 CAMBIO

    private bool rondaActiva = false;
    private bool juegoTerminado = false; // 🔥 CAMBIO
    private int indiceCorrectoActual = -1; // 🔥 CAMBIO
    private string colorCorrectoActual = string.Empty;
    private float tiempoInicioRonda;
    private int rondaId = 0; // 🔥 CAMBIO

    private Coroutine rutinaInicio; // 🔥 CAMBIO
    private Coroutine rutinaRonda;
    private Coroutine rutinaSiguienteRonda;

    private int aciertos = 0;
    private int errores = 0;
    private int totalIntentos = 0;
    private int racha = 0;
    private int mejorRacha = 0;
    private int nivelMaximoAlcanzado = 1; // 🔥 CAMBIO
    private readonly List<float> tiemposReaccion = new List<float>();

    public System.Action<int> OnRachaActualizada;
    public System.Action<int> OnNivelActualizado;
    public System.Action<bool> OnReglaActualizada; // 🔥 CAMBIO

    private bool ultimaRegla = false; // 🔥 NUEVO: guardar estado anterior


    private void Awake()
    {
        nombre = "color match";
        CachearReferencias(); // 🔥 CAMBIO
    }

    private void Start()
    {
        CachearReferencias(); // 🔥 CAMBIO
    }

    public override void ResetGame()
    {
        StopAllCoroutines(); // 🔥 CAMBIO
        LimpiarRutinas(); // 🔥 CAMBIO

        juegoPausado = false; // 🔥 CAMBIO
        juegoTerminado = false; // 🔥 CAMBIO
        rondaActiva = false;
        rondaId++; // 🔥 CAMBIO

        aciertos = 0;
        errores = 0;
        totalIntentos = 0;
        racha = 0;
        mejorRacha = 0;
        nivelMaximoAlcanzado = 1; // 🔥 CAMBIO
        indiceCorrectoActual = -1; // 🔥 CAMBIO
        colorCorrectoActual = string.Empty; // 🔥 CAMBIO
        tiemposReaccion.Clear();

        CachearReferencias(); // 🔥 CAMBIO
        DifficultyManager.Instance?.ResetDifficulty(1);

        int nivelInicial = DifficultyManager.Instance?.nivelActual ?? 1;
        nivelMaximoAlcanzado = nivelInicial; // 🔥 CAMBIO

        if (colorWheel != null)
        {
            colorWheel.SetGameLogic(this); // 🔥 CAMBIO
            colorWheel.SetPausado(false); // 🔥 CAMBIO
            colorWheel.GenerarRosco(nivelInicial);
        }

        bool responderTextoInicial = DebeResponderTexto(nivelInicial);
        ultimaRegla = responderTextoInicial;

        OnRachaActualizada?.Invoke(0);
        OnNivelActualizado?.Invoke(nivelInicial);
        OnReglaActualizada?.Invoke(responderTextoInicial); // 🔥 CAMBIO

        rutinaInicio = StartCoroutine(IniciarPartida(rondaId)); // 🔥 CAMBIO
    }

    private IEnumerator IniciarPartida(int idRondaEsperado) // 🔥 CAMBIO
    {
        float espera = 0f;
        while (espera < 0.25f && !juegoTerminado && idRondaEsperado == rondaId) // 🔥 CAMBIO
        {
            if (!juegoPausado)
                espera += Time.deltaTime;

            yield return null;
        }

        if (!juegoTerminado && !juegoPausado && idRondaEsperado == rondaId) // 🔥 CAMBIO
            GenerarRonda();

        rutinaInicio = null; // 🔥 CAMBIO
    }

    private void GenerarRonda()
    {
        if (juegoTerminado || juegoPausado) return;

        CachearReferencias();

        if (colorWheel == null)
        {
            Debug.LogError("ColorMatch: falta la referencia a ColorWheelUI.");
            return;
        }

        int nivel = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        nivelMaximoAlcanzado = Mathf.Max(nivelMaximoAlcanzado, nivel);
        rondaId++;
        int rondaActual = rondaId;

        if (colorWheel.nivelRoscoActual != nivel || colorWheel.datosColoresActuales.Count == 0)
            colorWheel.GenerarRosco(nivel);

        if (colorWheel.datosColoresActuales.Count == 0)
        {
            Debug.LogError("ColorMatch: no hay colores logicos en el rosco.");
            return;
        }

        ColorMatchColorData palabraActual = colorWheel.ObtenerDatoActualAleatorio();
        ColorMatchColorData colorVisualActual = colorWheel.ObtenerDatoActualAleatorio();
        bool responderTexto = DebeResponderTexto(nivel);
        ColorMatchColorData correcto = responderTexto ? palabraActual : colorVisualActual;

        indiceCorrectoActual = correcto.indice;
        colorCorrectoActual = correcto.nombre;

        colorWheel.ActualizarCentro(palabraActual, colorVisualActual);
        colorWheel.ForzarRefrescoCentro();

        tiempoInicioRonda = Time.time;
        rondaActiva = true;

        if (rutinaRonda != null)
            StopCoroutine(rutinaRonda);

        rutinaRonda = StartCoroutine(TemporizadorRonda(rondaActual));

        OnNivelActualizado?.Invoke(nivel);

        // 🔥 CAMBIO: Solo invocar cuando la regla realmente cambia
        if (responderTexto != ultimaRegla)
        {
            ultimaRegla = responderTexto;
            OnReglaActualizada?.Invoke(responderTexto);
        }

        Debug.Log($"ColorMatch ronda {rondaActual} nivel {nivel} | Rosco: {colorWheel.ResumenRoscoActual()} | Pantalla: {colorWheel.TextoCentroActual()} | Palabra: {palabraActual.nombre} | Color visual: {colorVisualActual.nombre} | Respuesta: {colorCorrectoActual}");
    }

    private bool DebeResponderTexto(int nivel) // 🔥 CAMBIO
    {
        return nivel >= NIVEL_CAMBIO_REGLA;
    }

    public void ProcesarRespuesta(int indiceSector)
    {
        if (!rondaActiva || juegoPausado || juegoTerminado) return; // 🔥 CAMBIO

        if (colorWheel == null)
        {
            Debug.LogError("ColorMatch: no se puede procesar respuesta sin ColorWheelUI.");
            return;
        }

        if (!colorWheel.ObtenerDatoActualPorSector(indiceSector, out ColorMatchColorData seleccionado)) // 🔥 CAMBIO
        {
            Debug.LogError($"ColorMatch: sector invalido: {indiceSector}");
            return;
        }

        bool esCorrecto = seleccionado.indice == indiceCorrectoActual; // 🔥 CAMBIO
        float tiempoRespuesta = Mathf.Clamp(Time.time - tiempoInicioRonda, 0f, tiempoPorRonda); // 🔥 CAMBIO

        Debug.Log($"ColorMatch click ronda {rondaId} sector {indiceSector} -> {seleccionado.nombre} | Correcto: {colorCorrectoActual} | {(esCorrecto ? "OK" : "ERROR")}"); // 🔥 CAMBIO

        RegistrarRespuesta(esCorrecto, tiempoRespuesta);
    }

    private void RegistrarRespuesta(bool esCorrecto, float tiempo)
    {
        if (!rondaActiva || juegoTerminado) return; // 🔥 CAMBIO

        rondaActiva = false;

        if (rutinaRonda != null)
        {
            StopCoroutine(rutinaRonda);
            rutinaRonda = null; // 🔥 CAMBIO
        }

        totalIntentos++;
        tiemposReaccion.Add(Mathf.Clamp(tiempo, 0f, tiempoPorRonda)); // 🔥 CAMBIO

        CachearReferencias(); // 🔥 CAMBIO

        if (esCorrecto)
        {
            aciertos++;
            racha++;
            mejorRacha = Mathf.Max(mejorRacha, racha); // 🔥 CAMBIO
            AudioManager.Instance?.Acierto();
            uiColorMatch?.Flash(Color.green); // 🔥 CAMBIO
            OnRachaActualizada?.Invoke(racha);
        }
        else
        {
            errores++;
            racha = 0;
            AudioManager.Instance?.Error();
            uiColorMatch?.Flash(Color.red); // 🔥 CAMBIO
            colorWheel?.ShakeCentro();
            OnRachaActualizada?.Invoke(0);
        }

        float precision = MetricUtils.Precision(aciertos, totalIntentos); // 🔥 CAMBIO
        DifficultyManager.Instance?.ActualizarDificultad(precision, esCorrecto, tiempo);

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        nivelMaximoAlcanzado = Mathf.Max(nivelMaximoAlcanzado, nivel); // 🔥 CAMBIO
        OnNivelActualizado?.Invoke(nivel);

        if (rutinaSiguienteRonda != null)
            StopCoroutine(rutinaSiguienteRonda);

        rutinaSiguienteRonda = StartCoroutine(EsperarSiguienteRonda(rondaId)); // 🔥 CAMBIO
    }

    private IEnumerator EsperarSiguienteRonda(int idRondaEsperado) // 🔥 CAMBIO
    {
        float espera = 0f;

        while (espera < tiempoEntreRondas && !juegoTerminado && idRondaEsperado == rondaId) // 🔥 CAMBIO
        {
            if (!juegoPausado)
                espera += Time.deltaTime;

            yield return null;
        }

        rutinaSiguienteRonda = null; // 🔥 CAMBIO

        if (!juegoTerminado && !juegoPausado && idRondaEsperado == rondaId) // 🔥 CAMBIO
            GenerarRonda();
    }

    private IEnumerator TemporizadorRonda(int idRondaEsperado) // 🔥 CAMBIO
    {
        float tiempoRestante = tiempoPorRonda;

        while (tiempoRestante > 0f && rondaActiva && !juegoTerminado && idRondaEsperado == rondaId) // 🔥 CAMBIO
        {
            if (!juegoPausado)
                tiempoRestante -= Time.deltaTime; // 🔥 CAMBIO

            yield return null;
        }

        rutinaRonda = null; // 🔥 CAMBIO

        if (rondaActiva && !juegoTerminado && idRondaEsperado == rondaId) // 🔥 CAMBIO
            RegistrarRespuesta(false, tiempoPorRonda);
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (juegoTerminado) return; // 🔥 CAMBIO

        juegoTerminado = true; // 🔥 CAMBIO
        rondaActiva = false; // 🔥 CAMBIO
        rondaId++; // 🔥 CAMBIO
        StopAllCoroutines(); // 🔥 CAMBIO
        LimpiarRutinas(); // 🔥 CAMBIO
        colorWheel?.SetPausado(true); // 🔥 CAMBIO

        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        if (totalIntentos <= 0)
            return m;

        float precision = MetricUtils.Precision(aciertos, totalIntentos); // 🔥 CAMBIO
        float tiempoMedio = MetricUtils.Average(tiemposReaccion, tiempoPorRonda); // 🔥 CAMBIO
        float velocidad = MetricUtils.VelocidadNormalizada(tiempoMedio, 0.8f);
        float controlInhibitorio = 1f - ((float)errores / Mathf.Max(1, totalIntentos));
        float factorDificultad = Mathf.Lerp(0.75f, 1f, Mathf.Clamp01(nivelMaximoAlcanzado / 10f)); // 🔥 CAMBIO

        m.controlInhibitorio = Mathf.Clamp01(controlInhibitorio * factorDificultad); // 🔥 CAMBIO
        m.velocidadCognitiva = Mathf.Clamp01(velocidad * precision); // 🔥 CAMBIO
        m.atencionDividida = Mathf.Clamp01(precision * factorDificultad); // 🔥 CAMBIO
        m.memoriaTrabajo = Mathf.Clamp01((float)mejorRacha / 10f); // 🔥 CAMBIO

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
        colorWheel?.SetPausado(pausar); // 🔥 CAMBIO

        if (!pausar && !rondaActiva && !juegoTerminado) // 🔥 CAMBIO
            GenerarRonda();
    }

    private void CachearReferencias() // 🔥 CAMBIO
    {
        if (colorWheel == null)
            colorWheel = FindFirstObjectByType<ColorWheelUI>(FindObjectsInactive.Include); // 🔥 CAMBIO

        if (uiColorMatch == null)
            uiColorMatch = FindFirstObjectByType<UIColorMatch>(FindObjectsInactive.Include); // 🔥 CAMBIO

        if (colorWheel != null)
            colorWheel.SetGameLogic(this);
    }

    private void LimpiarRutinas() // 🔥 CAMBIO
    {
        rutinaInicio = null;
        rutinaRonda = null;
        rutinaSiguienteRonda = null;
    }

    private void OnDestroy() // 🔥 CAMBIO
    {
        StopAllCoroutines(); // 🔥 CAMBIO
        LimpiarRutinas();
    }
}
