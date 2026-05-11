using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class SilencioMentalGame : BaseGame
{
    private enum TamanioEstimulo { Pequeno, Mediano, Grande }

    [Header("Tiempos")]
    public float tiempoRecordar = 2.5f;
    public float tiempoFeedback = 1f;
    public float tiempoEntreEstimulos = 0.5f;

    [Header("Curvas (nivel 1 a 10)")]
    public AnimationCurve duracionEstimulo;
    public AnimationCurve probObjetivo;

    [Header("Tamanios fijos")]
    public int tamanioPequeno = 52;
    public int tamanioMediano = 82;
    public int tamanioGrande = 116;

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
    private bool finalizado = false;
    private bool enPausa = false;
    private float inicioPartida;

    private string objIcono;
    private Color objColor;
    private int objTam;
    private TamanioEstimulo objTamanio;

    private string estIcono;
    private Color estColor;
    private int estTam;
    private TamanioEstimulo estTamanio;
    private bool estEsObjetivo;
    private float inicioEstimulo;
    private float duracionEst;

    private int aciertos = 0;
    private int aciertosObjetivo = 0;
    private int rechazosCorrectos = 0;
    private int objetivosMostrados = 0;
    private int distractoresMostrados = 0;
    private int fallosComision = 0;
    private int omisiones = 0;
    private float puntos = 0f;
    private int racha = 0;
    private int mejorRacha = 0;
    private List<float> tiemposReaccion = new List<float>();

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
    }

    public override void ResetGame()
    {
        if (rutinaActual != null) StopCoroutine(rutinaActual);

        if (ui == null) ui = FindFirstObjectByType<UISilencioMental>();

        if (ui != null)
        {
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
        }

        activo = false;
        mostrandoObjetivo = false;
        esperandoRespuesta = false;
        feedbackVisible = false;
        enPausa = false;
        finalizado = false;

        aciertos = fallosComision = omisiones = 0;
        aciertosObjetivo = rechazosCorrectos = objetivosMostrados = distractoresMostrados = 0;
        tiemposReaccion.Clear();
        puntos = 0f;
        racha = 0;
        mejorRacha = 0;

        DifficultyManager.Instance?.ResetDifficulty(1);
        OnNivel?.Invoke(1);
        OnRacha?.Invoke(0);

        ElegirNuevoObjetivo();
        rutinaActual = StartCoroutine(SecuenciaRecordar());
    }

    private void ElegirNuevoObjetivo()
    {
        objIcono = todosIconos[Random.Range(0, todosIconos.Count)];
        objColor = colores[Random.Range(0, colores.Count)];
        objTamanio = TamanioAleatorio();
        objTam = ObtenerFontSize(objTamanio);
    }

    private IEnumerator SecuenciaRecordar()
    {
        activo = false;
        mostrandoObjetivo = true;

        ui?.MostrarMensaje("Recuerda tu lección:", Color.white);
        OnMostrarIcono?.Invoke(objIcono, objColor, objTam);

        float tiempoPasado = 0;
        while (tiempoPasado < tiempoRecordar)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

        OnOcultarTodo?.Invoke();
        mostrandoObjetivo = false;

        tiempoPasado = 0;
        while (tiempoPasado < tiempoEntreEstimulos)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

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
        estEsObjetivo = esObjetivo;

        if (esObjetivo)
        {
            objetivosMostrados++;
            estIcono = objIcono;
            estColor = objColor;
            estTamanio = objTamanio;
            estTam = ObtenerFontSize(estTamanio);
        }
        else
        {
            distractoresMostrados++;
            GenerarDistractorParecido();
        }

        OnMostrarIcono?.Invoke(estIcono, estColor, estTam);
        esperandoRespuesta = true;
        inicioEstimulo = Time.time;
        rutinaActual = StartCoroutine(TemporizadorOmision());
    }

    private IEnumerator TemporizadorOmision()
    {
        float tiempoPasado = 0;
        while (tiempoPasado < duracionEst)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

        if (esperandoRespuesta && activo && !mostrandoObjetivo && !feedbackVisible && !enPausa)
        {
            esperandoRespuesta = false;
            if (estEsObjetivo)
            {
                omisiones++;
                racha = 0;
                if (ui != null) StartCoroutine(ui.MostrarFeedbackTemporal("ERROR", Color.red));
                AudioManager.Instance?.Error();
                feedbackVisible = true;
                OnOcultarTodo?.Invoke();
                rutinaActual = StartCoroutine(ReiniciarPorFallo());
            }
            else
            {
                aciertos++;
                rechazosCorrectos++;
                puntos += 0.25f;
                racha++;
                if (racha > mejorRacha) mejorRacha = racha;
                OnRacha?.Invoke(racha);
                if (ui != null) StartCoroutine(ui.MostrarFeedbackTemporal("CORRECTO", Color.green));
                AudioManager.Instance?.Acierto();
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

        bool fueObjetivo = estEsObjetivo;
        float tiempoRespuesta = Time.time - inicioEstimulo;
        tiemposReaccion.Add(tiempoRespuesta);

        if (fueObjetivo)
        {
            aciertos++;
            aciertosObjetivo++;
            puntos += 1f;
            racha++;
            if (racha > mejorRacha) mejorRacha = racha;
            OnRacha?.Invoke(racha);
            if (ui != null) StartCoroutine(ui.MostrarFeedbackTemporal("CORRECTO", Color.green));
            AudioManager.Instance?.Acierto();
            float rendimiento = Mathf.Clamp01(1f - (tiempoRespuesta / duracionEst));
            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, tiempoRespuesta);
            if (racha % 5 == 0) SubirNivel();
        }
        else
        {
            fallosComision++;
            racha = 0;
            puntos = Mathf.Max(0, puntos - 1f);
            OnRacha?.Invoke(0);
            if (ui != null) StartCoroutine(ui.MostrarFeedbackTemporal("ERROR", Color.red));
            AudioManager.Instance?.Error();
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, tiempoRespuesta);
        }

        feedbackVisible = true;
        OnOcultarTodo?.Invoke();
        rutinaActual = StartCoroutine(fueObjetivo ? MostrarFeedbackYContinuar() : ReiniciarPorFallo());
    }

    private IEnumerator MostrarFeedbackYContinuar()
    {
        float tiempoPasado = 0;
        while (tiempoPasado < tiempoFeedback)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }
        OnOcultarTodo?.Invoke();
        feedbackVisible = false;
        if (activo && !enPausa) GenerarSiguienteEstimulo();
    }

    private IEnumerator ReiniciarPorFallo()
    {
        activo = false;
        float tiempoPasado = 0;
        while (tiempoPasado < tiempoFeedback)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

        DifficultyManager.Instance?.ResetDifficulty(1);
        OnNivel?.Invoke(1);
        ElegirNuevoObjetivo();

        mostrandoObjetivo = true;
        ui?.MostrarMensaje("Recuerda tu lección:", Color.white);
        OnMostrarIcono?.Invoke(objIcono, objColor, objTam);

        tiempoPasado = 0;
        while (tiempoPasado < tiempoRecordar)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

        OnOcultarTodo?.Invoke();
        mostrandoObjetivo = false;

        tiempoPasado = 0;
        while (tiempoPasado < tiempoEntreEstimulos)
        {
            if (!enPausa)
                tiempoPasado += Time.deltaTime;
            yield return null;
        }

        activo = true;
        feedbackVisible = false;
        if (!enPausa) GenerarSiguienteEstimulo();
    }

    private void GenerarDistractorParecido()
    {
        float r = Random.value;

        if (r < 0.30f)
        {
            estIcono = IconoMismaCategoriaDistinto();
            estColor = objColor;
            estTamanio = TamanioAleatorio();
        }
        else if (r < 0.60f)
        {
            estIcono = objIcono;
            estColor = ColorDistinto();
            estTamanio = TamanioAleatorio();
        }
        else if (r < 0.85f)
        {
            estIcono = objIcono;
            estColor = objColor;
            estTamanio = TamanioDistinto(objTamanio);
        }
        else
        {
            estIcono = todosIconos[Random.Range(0, todosIconos.Count)];
            estColor = colores[Random.Range(0, colores.Count)];
            estTamanio = TamanioAleatorio();
        }

        if (estIcono == objIcono && estColor == objColor && estTamanio == objTamanio)
            estTamanio = TamanioDistinto(objTamanio);

        estTam = ObtenerFontSize(estTamanio);
    }

    private string IconoMismaCategoriaDistinto()
    {
        char c = objIcono[0];
        string cat = categoria.ContainsKey(c) ? categoria[c] : "letra";
        var candidatos = todosIconos.Where(i => i != objIcono && categoria.ContainsKey(i[0]) && categoria[i[0]] == cat).ToList();
        if (candidatos.Count == 0)
            candidatos = todosIconos.Where(i => i != objIcono).ToList();

        return candidatos[Random.Range(0, candidatos.Count)];
    }

    private Color ColorDistinto()
    {
        if (colores.Count <= 1)
            return objColor;

        Color color;
        do
        {
            color = colores[Random.Range(0, colores.Count)];
        }
        while (color == objColor);

        return color;
    }

    private TamanioEstimulo TamanioAleatorio()
    {
        return (TamanioEstimulo)Random.Range(0, 3);
    }

    private TamanioEstimulo TamanioDistinto(TamanioEstimulo actual)
    {
        TamanioEstimulo nuevo;
        do
        {
            nuevo = TamanioAleatorio();
        }
        while (nuevo == actual);

        return nuevo;
    }

    private int ObtenerFontSize(TamanioEstimulo tamanio)
    {
        switch (tamanio)
        {
            case TamanioEstimulo.Pequeno: return tamanioPequeno;
            case TamanioEstimulo.Mediano: return tamanioMediano;
            case TamanioEstimulo.Grande: return tamanioGrande;
            default: return tamanioMediano;
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
        if (!activo || mostrandoObjetivo || feedbackVisible || finalizado || enPausa) return;

        if (GameManager.Instance != null)
            OnTiempoPartida?.Invoke(GameManager.Instance.tiempoRestante);
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (finalizado) return;

        finalizado = true;
        activo = false;
        esperandoRespuesta = false;
        feedbackVisible = false;
        if (rutinaActual != null) StopCoroutine(rutinaActual);
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        int total = objetivosMostrados + distractoresMostrados;
        if (total == 0) return m;

        m.atencionSostenida = objetivosMostrados > 0 ? (float)aciertosObjetivo / objetivosMostrados : 0.5f;
        m.controlInhibitorio = distractoresMostrados > 0 ? (float)rechazosCorrectos / distractoresMostrados : 1f;
        m.atencionSelectiva = (float)(aciertosObjetivo + rechazosCorrectos) / total;
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

        if (AudioManager.Instance?.musicaSource != null)
        {
            if (pausar)
                AudioManager.Instance.musicaSource.Pause();
            else
                AudioManager.Instance.musicaSource.UnPause();
        }

        // 🔥 AL REANUDAR, FORZAR REINICIO DE LA LECCIÓN
        if (!pausar)
        {
            if (rutinaActual != null) StopCoroutine(rutinaActual);
            OnOcultarTodo?.Invoke();
            activo = false;
            mostrandoObjetivo = false;
            esperandoRespuesta = false;
            feedbackVisible = false;

            // Volver a empezar la lección
            ElegirNuevoObjetivo();
            rutinaActual = StartCoroutine(SecuenciaRecordar());
        }

        Debug.Log($"⏸️ Pausa: {pausar} | enPausa: {enPausa}");
    }
}