using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class SilencioMentalGame : BaseGame
{
    [Header("Tiempos")]
    public float tiempoRecordar = 2.5f;
    public float tiempoFeedback = 1f;
    public float tiempoEntreEstimulos = 0.5f;

    [Header("Curvas (nivel 1 a 10)")]
    public AnimationCurve duracionEstimulo;
    public AnimationCurve probObjetivo;
    public AnimationCurve tamanioMin;
    public AnimationCurve tamanioMax;

    [Header("Íconos")]
    public List<string> letras = new List<string> { "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" };
    public List<string> numeros = new List<string> { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };
    public List<string> simbolos = new List<string> { "$", "€", "£", "+", "-", "*", "/", "%", "#", "@", "&", "?", "!", ">", "<" };
    private List<string> todosIconos;
    private Dictionary<char, string> categoria;

    public List<Color> colores = new List<Color> { Color.red, Color.green, Color.blue, Color.yellow, Color.magenta, Color.cyan, new Color(1f, 0.5f, 0f), Color.white };

    [Header("UI")]
    public UISilencioMental ui;

    // Eventos
    public System.Action<int> OnRacha;
    public System.Action<float> OnTiempoPartida;
    public System.Action<int> OnNivel;
    public System.Action<string, Color, int> OnMostrarIcono;
    public System.Action<string, Color> OnMostrarMensaje;
    public System.Action OnOcultarTodo;

    // Estado
    private bool activo = false;
    private bool mostrandoObjetivo = false;
    private bool esperandoRespuesta = false;
    private bool feedbackVisible = false;
    private float inicioPartida;

    private string objIcono;
    private Color objColor;
    private int objTam;

    private string estIcono;
    private Color estColor;
    private int estTam;
    private float inicioEstimulo;
    private float duracionEst;

    private int aciertos = 0;
    private int fallosComision = 0;
    private int omisiones = 0;
    private float puntos = 0f;
    private int racha = 0;
    private int mejorRacha = 0;

    // Control de pausa
    private bool enPausa = false;
    private Coroutine rutinaActual = null;

    private void Awake()
    {
        nombre = "silencio-mental";
        InicializarListas();
        InicializarCurvas();
    }

    private void InicializarListas()
    {
        todosIconos = new List<string>();
        todosIconos.AddRange(letras);
        todosIconos.AddRange(numeros);
        todosIconos.AddRange(simbolos);

        categoria = new Dictionary<char, string>();
        foreach (string s in letras) foreach (char c in s) categoria[c] = "letra";
        foreach (string s in numeros) foreach (char c in s) categoria[c] = "numero";
        foreach (string s in simbolos) foreach (char c in s) categoria[c] = "simbolo";
    }

    private void InicializarCurvas()
    {
        if (duracionEstimulo == null || duracionEstimulo.keys.Length == 0)
        {
            duracionEstimulo = new AnimationCurve();
            duracionEstimulo.AddKey(1, 2.5f);
            duracionEstimulo.AddKey(5, 1.8f);
            duracionEstimulo.AddKey(10, 1.0f);
        }
        if (probObjetivo == null || probObjetivo.keys.Length == 0)
        {
            probObjetivo = new AnimationCurve();
            probObjetivo.AddKey(1, 0.40f);
            probObjetivo.AddKey(5, 0.30f);
            probObjetivo.AddKey(10, 0.20f);
        }
        if (tamanioMin == null || tamanioMin.keys.Length == 0)
        {
            tamanioMin = new AnimationCurve();
            tamanioMin.AddKey(1, 60);
            tamanioMin.AddKey(10, 40);
        }
        if (tamanioMax == null || tamanioMax.keys.Length == 0)
        {
            tamanioMax = new AnimationCurve();
            tamanioMax.AddKey(1, 120);
            tamanioMax.AddKey(10, 80);
        }
    }

    public override void ResetGame()
    {
        // Detener todo
        if (rutinaActual != null) StopCoroutine(rutinaActual);

        if (ui == null) ui = FindFirstObjectByType<UISilencioMental>();

        OnRacha -= ui.ActualizarRacha;
        OnTiempoPartida -= ui.ActualizarTiempo;
        OnNivel -= ui.ActualizarNivel;
        OnMostrarIcono -= ui.MostrarIcono;
        OnOcultarTodo -= ui.OcultarTodo;

        OnRacha += ui.ActualizarRacha;
        OnTiempoPartida += ui.ActualizarTiempo;
        OnNivel += ui.ActualizarNivel;
        OnMostrarIcono += ui.MostrarIcono;
        OnOcultarTodo += ui.OcultarTodo;

        activo = false;
        mostrandoObjetivo = false;
        esperandoRespuesta = false;
        feedbackVisible = false;
        enPausa = false;

        aciertos = fallosComision = omisiones = 0;
        puntos = 0f;
        racha = 0;
        mejorRacha = 0;

        if (DifficultyManager.Instance != null) DifficultyManager.Instance.nivelActual = 1;
        OnNivel?.Invoke(1);
        OnRacha?.Invoke(0);

        ElegirNuevoObjetivo();
        rutinaActual = StartCoroutine(SecuenciaRecordar());
    }

    private void ElegirNuevoObjetivo()
    {
        objIcono = todosIconos[Random.Range(0, todosIconos.Count)];
        objColor = colores[Random.Range(0, colores.Count)];
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        int min = Mathf.RoundToInt(tamanioMin.Evaluate(nivel));
        int max = Mathf.RoundToInt(tamanioMax.Evaluate(nivel));
        objTam = Random.Range(min, max + 1);
    }

    // CORUTINA PRINCIPAL CON PAUSA MANUAL
    private IEnumerator SecuenciaRecordar()
    {
        activo = false;
        mostrandoObjetivo = true;

        ui.MostrarMensaje("Recuerda tu lección:", Color.white);
        OnMostrarIcono?.Invoke(objIcono, objColor, objTam);

        yield return EsperarSegundos(tiempoRecordar);

        OnOcultarTodo?.Invoke();
        mostrandoObjetivo = false;

        yield return EsperarSegundos(tiempoEntreEstimulos);

        activo = true;
        inicioPartida = Time.time;
        GenerarSiguienteEstimulo();
    }

    private void GenerarSiguienteEstimulo()
    {
        if (!activo || enPausa) return;

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        duracionEst = duracionEstimulo.Evaluate(nivel);
        float prob = probObjetivo.Evaluate(nivel);
        bool esObjetivo = Random.value < prob;

        if (esObjetivo)
        {
            estIcono = objIcono;
            estColor = objColor;
            estTam = objTam;
        }
        else
        {
            char c = objIcono[0];
            string cat = categoria.ContainsKey(c) ? categoria[c] : "letra";
            var candidatos = todosIconos.Where(i => i != objIcono && categoria.ContainsKey(i[0]) && categoria[i[0]] == cat).ToList();
            if (candidatos.Count == 0) candidatos = todosIconos.Where(i => i != objIcono).ToList();
            estIcono = candidatos[Random.Range(0, candidatos.Count)];
            estColor = colores[Random.Range(0, colores.Count)];
            int min = Mathf.RoundToInt(tamanioMin.Evaluate(nivel));
            int max = Mathf.RoundToInt(tamanioMax.Evaluate(nivel));
            estTam = Random.Range(min, max + 1);
        }

        OnMostrarIcono?.Invoke(estIcono, estColor, estTam);
        esperandoRespuesta = true;
        inicioEstimulo = Time.time;
        rutinaActual = StartCoroutine(TemporizadorOmision());
    }

    private IEnumerator TemporizadorOmision()
    {
        yield return EsperarSegundos(duracionEst);

        if (esperandoRespuesta && activo && !mostrandoObjetivo && !feedbackVisible && !enPausa)
        {
            esperandoRespuesta = false;
            bool eraObjetivo = (estIcono == objIcono);

            if (eraObjetivo)
            {
                omisiones++;
                racha = 0;
                StartCoroutine(ui.MostrarFeedbackTemporal("ERROR", Color.red));
                feedbackVisible = true;
                OnOcultarTodo?.Invoke();
                rutinaActual = StartCoroutine(ReiniciarPorFallo());
            }
            else
            {
                aciertos++;
                puntos += 0.25f;
                racha++;
                if (racha > mejorRacha) mejorRacha = racha;
                OnRacha?.Invoke(racha);
                StartCoroutine(ui.MostrarFeedbackTemporal("CORRECTO", Color.green));
                feedbackVisible = true;
                OnOcultarTodo?.Invoke();
                if (racha % 5 == 0) SubirNivel();
                rutinaActual = StartCoroutine(MostrarFeedbackYContinuar());
            }
        }
    }

    public void Responder()
    {
        if (!activo || mostrandoObjetivo || !esperandoRespuesta || feedbackVisible || enPausa) return;

        if (rutinaActual != null) StopCoroutine(rutinaActual);
        esperandoRespuesta = false;

        bool fueObjetivo = (estIcono == objIcono);

        if (fueObjetivo)
        {
            aciertos++;
            puntos += 1f;
            racha++;
            if (racha > mejorRacha) mejorRacha = racha;
            OnRacha?.Invoke(racha);
            StartCoroutine(ui.MostrarFeedbackTemporal("CORRECTO", Color.green));
            float rendimiento = Mathf.Clamp01(1f - ((Time.time - inicioEstimulo) / duracionEst));
            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, Time.time - inicioEstimulo);
            if (racha % 5 == 0) SubirNivel();
        }
        else
        {
            fallosComision++;
            racha = 0;
            puntos = Mathf.Max(0, puntos - 1f);
            OnRacha?.Invoke(0);
            StartCoroutine(ui.MostrarFeedbackTemporal("ERROR", Color.red));
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, Time.time - inicioEstimulo);
        }

        feedbackVisible = true;
        OnOcultarTodo?.Invoke();
        rutinaActual = StartCoroutine(fueObjetivo ? MostrarFeedbackYContinuar() : ReiniciarPorFallo());
    }

    private IEnumerator MostrarFeedbackYContinuar()
    {
        yield return EsperarSegundos(tiempoFeedback);
        OnOcultarTodo?.Invoke();
        feedbackVisible = false;
        if (activo && !enPausa) GenerarSiguienteEstimulo();
    }

    private IEnumerator ReiniciarPorFallo()
    {
        activo = false;
        yield return EsperarSegundos(tiempoFeedback);

        if (DifficultyManager.Instance != null) DifficultyManager.Instance.nivelActual = 1;
        OnNivel?.Invoke(1);
        ElegirNuevoObjetivo();

        mostrandoObjetivo = true;
        ui.MostrarMensaje("Recuerda tu lección:", Color.white);
        OnMostrarIcono?.Invoke(objIcono, objColor, objTam);

        yield return EsperarSegundos(tiempoRecordar);

        OnOcultarTodo?.Invoke();
        mostrandoObjetivo = false;

        yield return EsperarSegundos(tiempoEntreEstimulos);

        activo = true;
        feedbackVisible = false;
        if (!enPausa) GenerarSiguienteEstimulo();
    }

    // 🔥 ESPERA QUE RESPETA LA PAUSA
    private IEnumerator EsperarSegundos(float segundos)
    {
        float tiempoPasado = 0f;
        while (tiempoPasado < segundos)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }
    }

    private void SubirNivel()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        if (nivel < 10)
        {
            DifficultyManager.Instance.nivelActual = nivel + 1;
            OnNivel?.Invoke(nivel + 1);
        }
    }

    private void Update()
    {
        if (!activo || mostrandoObjetivo || feedbackVisible || enPausa) return;

        float tiempoRestante = GameManager.Instance.tiempoRestante;
        OnTiempoPartida?.Invoke(tiempoRestante);

        if (tiempoRestante <= 0)
        {
            OnGameFinished();
        }
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        activo = false;
        if (rutinaActual != null) StopCoroutine(rutinaActual);
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        int total = aciertos + fallosComision + omisiones;
        if (total == 0) return m;
        int opsObj = aciertos + omisiones;
        m.atencionSostenida = opsObj > 0 ? (float)aciertos / opsObj : 0;
        int distractores = fallosComision + (total - opsObj);
        m.controlInhibitorio = distractores > 0 ? 1f - ((float)fallosComision / distractores) : 1f;
        m.atencionSelectiva = (float)aciertos / total;
        m.memoriaTrabajo = Mathf.Clamp01((float)mejorRacha / 20f);
        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.atencionSostenida = m.atencionSostenida * 0.50f;
        p.controlInhibitorio = m.controlInhibitorio * 0.30f;
        p.atencionSelectiva = m.atencionSelectiva * 0.15f;
        p.memoriaTrabajo = m.memoriaTrabajo * 0.05f;
        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        enPausa = pausar;

        Debug.Log($"⏸️ SilencioMental - Pausa: {pausar}, activo: {activo}");

        if (!pausar && activo && !mostrandoObjetivo && !feedbackVisible && !esperandoRespuesta)
        {
            // Al reanudar, si no hay estímulo activo, generar uno
            GenerarSiguienteEstimulo();
        }
    }
}