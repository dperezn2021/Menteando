using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class EcoVisualGame : BaseGame, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    public enum AjusteEscenario
    {
        EncajarSinDeformar,
        CubrirSinDeformar,
        EstirarAlPanel
    }

    private enum FaseEcoVisual
    {
        Inactivo,
        Memorizacion,
        Reconstruccion,
        Evaluacion,
        Finalizado
    }

    [Header("Dificultad")]
    public int nivelInicial = 1;
    public int nivelMaximo = 10;
    public int objetosNivelesIniciales = 2;
    public int nivelesConObjetosIniciales = 2;
    public int objetosNivel10 = 10;
    public float tiempoMemorizacionNivel1 = 7f;
    public float tiempoMemorizacionNivel10 = 4.5f;
    [Range(0f, 1f)] public float porcentajeMinimoNivel1 = 0.35f;
    [Range(0f, 1f)] public float porcentajeMinimoNivel10 = 0.75f;

    [Header("Puntuacion")]
    public int puntosPorObjeto = 100;
    public float esperaTrasEvaluacion = 1f;
    public bool terminarSiNoLlegaAlMinimo = true;
    public bool usarDistanciaRelativaAlPanel = true;
    [Range(0.05f, 1f)] public float distanciaCeroPuntosPanelNivel1 = 0.55f;
    [Range(0.05f, 1f)] public float distanciaCeroPuntosPanelNivel10 = 0.28f;
    [Range(0f, 0.5f)] public float distanciaPerfectaPanelNivel1 = 0.12f;
    [Range(0f, 0.5f)] public float distanciaPerfectaPanelNivel10 = 0.06f;
    public float distanciaCeroPuntosNivel1 = 420f;
    public float distanciaCeroPuntosNivel10 = 220f;
    public float distanciaPerfectaNivel1 = 90f;
    public float distanciaPerfectaNivel10 = 45f;

    [Header("Assets editables")]
    public List<GameObject> prefabsObjetos = new List<GameObject>();
    public GameObject prefabObjeto;
    public GameObject prefabObjetoFallback;
    public bool permitirObjetosRepetidos = false;
    public List<Sprite> imagenesEscenarios = new List<Sprite>();
    public bool generarEscenariosPruebaSiNoHayImagenes = true;

    [Header("Layout generado por codigo")]
    public bool generarZonasPorCodigo = true;
    public bool forzarRaizAPantallaCompleta = true;
    public RectTransform raizLayout;
    public RectTransform fondoGlobal;
    public RectTransform zonaHeader;
    public RectTransform zonaJuego;
    public RectTransform barraObjetos;
    public AjusteEscenario ajusteEscenario = AjusteEscenario.CubrirSinDeformar;
    public float altoHeader = 86f;
    public float altoBarraObjetos = 140f;
    public float paddingHorizontal = 22f;
    public float paddingVerticalJuego = 18f;
    public Color colorFondoGlobal = Color.black;
    public Color colorHeader = new Color(0f, 0f, 0f, 0.55f);
    public Color colorFondoJuego = new Color(0.07f, 0.08f, 0.11f, 1f);
    public Color colorBarraObjetos = new Color(0f, 0f, 0f, 0.42f);

    [Header("Objetos")]
    public Vector2 tamanoObjetoEscena = new Vector2(140f, 140f);
    public Vector2 tamanoObjetoBarra = new Vector2(120f, 120f);
    public float margenGeneracionObjetos = 120f;
    public float separacionMinimaObjetos = 150f;
    public float espaciadoObjetosBarra = 18f;

    [Header("Debug puntuacion")]
    public bool logDistanciasAlEvaluar = true;
    public bool mostrarObjetivosAlEvaluar = true;
    public Color colorObjetivoDebug = new Color(0.3f, 1f, 0.55f, 0.35f);
    public float escalaObjetivoDebug = 1.15f;

    [Header("Cognicion")]
    [Range(0f, 0.35f)] public float pesoProgresoNivelCognicion = 0.15f;
    [Range(0f, 1f)] public float multiplicadorMinimoProgresoCognicion = 0.6f;

    [Header("HUD generado")]
    public TMP_FontAsset fuenteTextos;
    [Range(12f, 36f)] public float tamanoMinimoTextoHUD = 18f;
    [Range(18f, 52f)] public float tamanoMaximoTextoHUD = 34f;
    public float anchoMinimoTextoHUD = 100f;
    public float separacionTextosHeader = 54f;
    public float anchoTextoFaseRecoloca = 520f;
    public float paddingTextoFaseBarra = 24f;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoObjetos;
    public TextMeshProUGUI textoPuntos;
    public TextMeshProUGUI textoMinimo;
    public TextMeshProUGUI textoFase;
    public TextMeshProUGUI textoMemoria;

    [Header("Compatibilidad UI anterior")]
    public UIEcoVisual uiEcoVisual;
    public TextMeshProUGUI textoInstruccion;
    public TextMeshProUGUI textoPuntuacion;

    private readonly List<ObjetoMemoria> objetos = new List<ObjetoMemoria>();
    private readonly List<float> rendimientosRonda = new List<float>();
    private readonly List<GameObject> marcadoresDebug = new List<GameObject>();
    private readonly List<Sprite> escenariosPruebaGenerados = new List<Sprite>();

    private Canvas canvas;
    private Image imagenEscenario;
    private FaseEcoVisual faseActual = FaseEcoVisual.Inactivo;
    private GameObject objetoArrastrando;
    private ObjetoMemoria memoriaArrastrando;
    private RectTransform objetoArrastrandoRect;

    private int nivelActual = 1;
    private int numeroObjetos = 3;
    private int rondaActual = 0;
    private int rondasSuperadas = 0;
    private int rachaActual = 0;
    private int mejorRacha = 0;
    private int puntuacionTotal = 0;
    private int puntuacionMaximaTotal = 0;
    private int puntuacionRonda = 0;
    private int puntuacionMinimaRonda = 0;
    private int objetosColocadosSesion = 0;
    private float tiempoMemorizacionActual = 5f;
    private float distanciaCeroPuntosActual = 240f;
    private float distanciaPerfectaActual = 70f;
    private float porcentajeMinimoActual = 0.6f;
    private bool juegoFinalizado = false;
    private bool evaluando = false;
    private Vector2 ultimoTamanoObjetoEscena;
    private Vector2 ultimoTamanoObjetoBarra;

    public System.Action<int> OnRachaActualizada;
    public System.Action<int> OnNivelActualizado;
    public System.Action<int, int> OnProgresoActualizado;
    public System.Action<int, int> OnPuntuacionActualizada;
    public System.Action<int, int> OnObjetivoRondaActualizado;
    public System.Action<string> OnFaseActualizada;
    public System.Action<float, float> OnMemorizacionActualizada;
    public System.Action<bool> OnFeedback;

    public int RachaActual => rachaActual;
    public int MejorRacha => mejorRacha;
    public int Puntuacion => puntuacionTotal;
    public int TotalColocados => ContarObjetosColocados();
    public int TotalColocadosSesion => objetosColocadosSesion;
    public int TotalObjetos => objetos.Count;
    public int ObjetivoRonda => puntuacionMinimaRonda;

    private class ObjetoMemoria
    {
        public GameObject go;
        public RectTransform rect;
        public Vector2 posicionObjetivo;
        public Vector2 posicionBarra;
        public bool colocado;
        public float distancia;
        public int puntos;
    }

    private void Awake()
    {
        nombre = "eco visual";
        CachearReferencias();
        PrepararLayout();
    }

    [ContextMenu("Aplicar valores recomendados EcoVisual")]
    public void AplicarValoresRecomendados()
    {
        objetosNivelesIniciales = 2;
        nivelesConObjetosIniciales = 2;
        objetosNivel10 = 10;
        tiempoMemorizacionNivel1 = 7f;
        tiempoMemorizacionNivel10 = 4.5f;
        porcentajeMinimoNivel1 = 0.35f;
        porcentajeMinimoNivel10 = 0.75f;
        usarDistanciaRelativaAlPanel = true;
        distanciaCeroPuntosPanelNivel1 = 0.55f;
        distanciaCeroPuntosPanelNivel10 = 0.28f;
        distanciaPerfectaPanelNivel1 = 0.12f;
        distanciaPerfectaPanelNivel10 = 0.06f;
        permitirObjetosRepetidos = false;
        tamanoObjetoEscena = new Vector2(140f, 140f);
        tamanoObjetoBarra = new Vector2(120f, 120f);
        margenGeneracionObjetos = 120f;
        separacionMinimaObjetos = 150f;
        forzarRaizAPantallaCompleta = true;
        colorFondoGlobal = Color.black;
        logDistanciasAlEvaluar = true;
        mostrarObjetivosAlEvaluar = true;
        pesoProgresoNivelCognicion = 0.15f;
        multiplicadorMinimoProgresoCognicion = 0.6f;
        tamanoMinimoTextoHUD = 18f;
        tamanoMaximoTextoHUD = 34f;
        anchoMinimoTextoHUD = 100f;
        separacionTextosHeader = 50f;
        anchoTextoFaseRecoloca = 520f;
        paddingTextoFaseBarra = 24f;
    }

    private void Start()
    {
        CachearReferencias();
        PrepararLayout();
        MostrarBarra(false);
        ActualizarHUD();
    }

    public override void ResetGame()
    {
        StopAllCoroutines();
        LimpiarRonda();

        juegoPausado = false;
        juegoFinalizado = false;
        evaluando = false;
        rondaActual = 0;
        rondasSuperadas = 0;
        rachaActual = 0;
        mejorRacha = 0;
        puntuacionTotal = 0;
        puntuacionMaximaTotal = 0;
        puntuacionRonda = 0;
        puntuacionMinimaRonda = 0;
        objetosColocadosSesion = 0;
        rendimientosRonda.Clear();

        CachearReferencias();
        PrepararLayout();

        nivelActual = Mathf.Clamp(nivelInicial, 1, nivelMaximo);
        DifficultyManager.Instance?.ResetDifficulty(nivelActual);
        AplicarNivel();

        OnRachaActualizada?.Invoke(rachaActual);
        OnNivelActualizado?.Invoke(nivelActual);

        IniciarRonda();
    }

    private void IniciarRonda()
    {
        if (juegoFinalizado) return;

        LimpiarRonda();
        AplicarNivel();

        rondaActual++;
        puntuacionRonda = 0;
        evaluando = false;
        faseActual = FaseEcoVisual.Memorizacion;

        CrearEscenario();
        CrearObjetosEnEscena();

        int maximoRonda = objetos.Count * puntosPorObjeto;
        puntuacionMinimaRonda = Mathf.CeilToInt(maximoRonda * porcentajeMinimoActual);
        puntuacionMaximaTotal += maximoRonda;

        SetFase("MEMORIZA LA ESCENA");
        MostrarBarra(true);
        ActualizarHUD();
        EmitirEventosHUD();

        StartCoroutine(CuentaMemorizacion());
    }

    private void CrearEscenario()
    {
        if (zonaJuego == null) return;

        if (imagenEscenario == null)
        {
            GameObject go = new GameObject("ImagenEscenario", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            go.transform.SetParent(zonaJuego, false);
            RectTransform rect = go.GetComponent<RectTransform>();
            AjustarRectCompleto(rect);
            imagenEscenario = go.GetComponent<Image>();
        }

        imagenEscenario.transform.SetAsFirstSibling();
        imagenEscenario.color = colorFondoJuego;
        imagenEscenario.raycastTarget = false;
        imagenEscenario.preserveAspect = true;
        imagenEscenario.enabled = true;

        Sprite escenario = ObtenerEscenarioAleatorio();
        if (escenario != null)
        {
            imagenEscenario.sprite = escenario;
            imagenEscenario.color = Color.white;
            imagenEscenario.type = Image.Type.Simple;
            AjustarImagenEscenario(escenario);
        }
        else
        {
            imagenEscenario.sprite = null;
            AjustarRectCompleto(imagenEscenario.rectTransform);
        }
    }

    private void CrearObjetosEnEscena()
    {
        List<GameObject> bolsa = CrearBolsaObjetos();
        if (bolsa.Count == 0)
        {
            Debug.LogError("EcoVisual: asigna prefabsObjetos, prefabObjeto o prefabObjetoFallback en el Inspector.");
            return;
        }

        List<Vector2> posiciones = new List<Vector2>();
        int objetosEstaRonda = permitirObjetosRepetidos ? numeroObjetos : Mathf.Min(numeroObjetos, bolsa.Count);

        if (!permitirObjetosRepetidos && numeroObjetos > bolsa.Count)
            Debug.LogWarning($"EcoVisual: el nivel pide {numeroObjetos} objetos, pero solo hay {bolsa.Count} prefabs unicos. Se usaran {objetosEstaRonda} sin repetir.");

        for (int i = 0; i < objetosEstaRonda; i++)
        {
            GameObject prefab = ObtenerPrefabObjeto(bolsa);
            if (prefab == null) continue;

            Vector2 posicion = ObtenerPosicionAleatoria(posiciones);
            posiciones.Add(posicion);

            GameObject obj = Instantiate(prefab, zonaJuego);
            RectTransform rect = obj.GetComponent<RectTransform>();
            if (rect == null) rect = obj.AddComponent<RectTransform>();

            rect.sizeDelta = tamanoObjetoEscena;
            rect.anchoredPosition = posicion;
            obj.transform.SetAsLastSibling();
            ultimoTamanoObjetoEscena = tamanoObjetoEscena;

            CanvasGroup cg = obj.GetComponent<CanvasGroup>();
            if (cg == null) cg = obj.AddComponent<CanvasGroup>();
            cg.alpha = 1f;
            cg.interactable = false;
            cg.blocksRaycasts = false;

            EcoVisualDraggable draggable = obj.GetComponent<EcoVisualDraggable>();
            if (draggable == null) draggable = obj.AddComponent<EcoVisualDraggable>();
            draggable.Inicializar(this);

            objetos.Add(new ObjetoMemoria
            {
                go = obj,
                rect = rect,
                posicionObjetivo = posicion,
                colocado = false
            });
        }
    }

    private IEnumerator CuentaMemorizacion()
    {
        float restante = tiempoMemorizacionActual;
        OnMemorizacionActualizada?.Invoke(restante, tiempoMemorizacionActual);

        while (restante > 0f && !juegoFinalizado)
        {
            if (!juegoPausado)
            {
                restante -= Time.deltaTime;
                OnMemorizacionActualizada?.Invoke(Mathf.Max(0f, restante), tiempoMemorizacionActual);
                ActualizarTextoMemoria(Mathf.Max(0f, restante));
            }

            yield return null;
        }

        if (!juegoFinalizado)
            PasarObjetosABarra();
    }

    private void PasarObjetosABarra()
    {
        faseActual = FaseEcoVisual.Reconstruccion;
        SetFase("RECOLOCA LOS OBJETOS");
        MostrarBarra(true);
        DistribuirObjetosEnBarra();
        ActualizarTextoMemoria(0f);
        ActualizarHUD();
        EmitirEventosHUD();
    }

    private void DistribuirObjetosEnBarra()
    {
        if (barraObjetos == null) return;

        float ancho = Mathf.Max(1f, barraObjetos.rect.width);
        float reservaFase = Mathf.Min(anchoTextoFaseRecoloca + (paddingTextoFaseBarra * 2f), ancho * 0.6f);
        float limiteIzquierdo = (-ancho / 2f) + reservaFase + (tamanoObjetoBarra.x / 2f);
        float limiteDerecho = (ancho / 2f) - (tamanoObjetoBarra.x / 2f);

        if (limiteIzquierdo > limiteDerecho)
            limiteIzquierdo = (-ancho / 2f) + (tamanoObjetoBarra.x / 2f);

        float centroDisponible = (limiteIzquierdo + limiteDerecho) * 0.5f;
        float anchoTotal = (objetos.Count * tamanoObjetoBarra.x) + ((objetos.Count - 1) * espaciadoObjetosBarra);
        float inicioX = centroDisponible - (anchoTotal / 2f) + (tamanoObjetoBarra.x / 2f);

        for (int i = 0; i < objetos.Count; i++)
        {
            ObjetoMemoria obj = objetos[i];
            if (obj.go == null || obj.rect == null) continue;

            obj.go.transform.SetParent(barraObjetos, false);
            obj.go.transform.SetAsLastSibling();
            obj.rect.sizeDelta = tamanoObjetoBarra;
            ultimoTamanoObjetoBarra = tamanoObjetoBarra;

            float x = inicioX + i * (tamanoObjetoBarra.x + espaciadoObjetosBarra);
            x = Mathf.Clamp(x, limiteIzquierdo, limiteDerecho);
            obj.posicionBarra = new Vector2(x, 0f);
            obj.rect.anchoredPosition = obj.posicionBarra;
            obj.colocado = false;

            CanvasGroup cg = obj.go.GetComponent<CanvasGroup>();
            if (cg == null) cg = obj.go.AddComponent<CanvasGroup>();
            cg.alpha = 1f;
            cg.interactable = true;
            cg.blocksRaycasts = true;
        }

        ConfigurarTextoFaseBarra();
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (faseActual != FaseEcoVisual.Reconstruccion || juegoPausado || evaluando)
            return;

        objetoArrastrando = eventData.pointerDrag;
        if (objetoArrastrando == null) return;

        memoriaArrastrando = objetos.Find(o => o.go == objetoArrastrando);
        if (memoriaArrastrando == null)
        {
            LimpiarArrastre();
            return;
        }

        memoriaArrastrando.colocado = false;
        objetoArrastrandoRect = memoriaArrastrando.rect;
        objetoArrastrando.transform.SetParent(zonaJuego, false);
        objetoArrastrando.transform.SetAsLastSibling();
        objetoArrastrandoRect.sizeDelta = tamanoObjetoEscena;

        MoverObjetoArrastrando(eventData);
        EmitirProgreso();
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (objetoArrastrando == null || faseActual != FaseEcoVisual.Reconstruccion || juegoPausado)
            return;

        MoverObjetoArrastrando(eventData);
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (objetoArrastrando == null || memoriaArrastrando == null)
        {
            LimpiarArrastre();
            return;
        }

        if (PuntoDentroZonaJuego(eventData))
        {
            memoriaArrastrando.colocado = true;
            memoriaArrastrando.rect.anchoredPosition = LimitarAPanelJuego(memoriaArrastrando.rect.anchoredPosition);
        }
        else
        {
            DevolverABarra(memoriaArrastrando);
        }

        LimpiarArrastre();
        EmitirProgreso();

        if (TodosColocados())
            StartCoroutine(EvaluarTrasPausa());
    }

    private IEnumerator EvaluarTrasPausa()
    {
        if (evaluando) yield break;

        evaluando = true;
        faseActual = FaseEcoVisual.Evaluacion;
        SetFase("RECALCULANDO PUNTUACION");
        yield return EsperarSinPausa(0.25f);
        EvaluarRonda();
    }

    private void EvaluarRonda()
    {
        puntuacionRonda = 0;

        foreach (ObjetoMemoria obj in objetos)
        {
            obj.distancia = Vector2.Distance(obj.rect.anchoredPosition, obj.posicionObjetivo);
            obj.puntos = CalcularPuntosPorDistancia(obj.distancia);
            puntuacionRonda += obj.puntos;
        }

        if (mostrarObjetivosAlEvaluar)
            MostrarObjetivosDebug();

        int maximoRonda = Mathf.Max(1, objetos.Count * puntosPorObjeto);
        float rendimiento = Mathf.Clamp01((float)puntuacionRonda / maximoRonda);
        bool superaMinimo = puntuacionRonda >= puntuacionMinimaRonda;

        puntuacionTotal += puntuacionRonda;
        rendimientosRonda.Add(rendimiento);
        ActualizarHUD();
        OnPuntuacionActualizada?.Invoke(puntuacionTotal, puntuacionMaximaTotal);
        OnFeedback?.Invoke(superaMinimo);

        Debug.Log($"EcoVisual ronda {rondaActual} nivel {nivelActual}: {puntuacionRonda}/{maximoRonda} minimo {puntuacionMinimaRonda} | distancia perfecta {distanciaPerfectaActual:F1}, cero puntos {distanciaCeroPuntosActual:F1} | {(superaMinimo ? "superada" : "no superada")}");

        if (logDistanciasAlEvaluar)
            LogDistanciasObjetos();

        if (superaMinimo)
        {
            rondasSuperadas++;
            rachaActual++;
            mejorRacha = Mathf.Max(mejorRacha, rachaActual);
            objetosColocadosSesion += objetos.Count;
            AudioManager.Instance?.Acierto();
            OnRachaActualizada?.Invoke(rachaActual);
            SetFase($"SUPERADO: {puntuacionRonda}/{puntuacionMinimaRonda}");
            SubirNivel();
            StartCoroutine(SiguienteRonda());
        }
        else
        {
            rachaActual = 0;
            AudioManager.Instance?.Error();
            OnRachaActualizada?.Invoke(0);
            SetFase($"FIN: {puntuacionRonda}/{puntuacionMinimaRonda}");

            if (terminarSiNoLlegaAlMinimo)
                StartCoroutine(FinalizarPorPuntuacionBaja());
        }
    }

    private IEnumerator SiguienteRonda()
    {
        yield return EsperarSinPausa(esperaTrasEvaluacion);

        if (juegoFinalizado)
            yield break;

        if (GameManager.Instance == null || !GameManager.Instance.estaJugando || GameManager.Instance.tiempoRestante <= 0f)
        {
            OnGameFinished();
            yield break;
        }

        IniciarRonda();
    }

    private IEnumerator FinalizarPorPuntuacionBaja()
    {
        yield return EsperarSinPausa(esperaTrasEvaluacion);

        CognitiveMetrics ponderadas = AplicarPesos(CalcularCognicion());

        if (GameManager.Instance != null)
            GameManager.Instance.estaJugando = false;

        UIManager.Instance?.MostrarResultados(ponderadas);
        OnGameFinished();
    }

    private void SubirNivel()
    {
        nivelActual = Mathf.Clamp(nivelActual + 1, 1, nivelMaximo);

        if (DifficultyManager.Instance != null)
            DifficultyManager.Instance.nivelActual = nivelActual;

        OnNivelActualizado?.Invoke(nivelActual);
    }

    private int CalcularPuntosPorDistancia(float distancia)
    {
        if (distancia <= distanciaPerfectaActual)
            return puntosPorObjeto;

        float rangoPuntuable = Mathf.Max(1f, distanciaCeroPuntosActual - distanciaPerfectaActual);
        float t = Mathf.Clamp01((distancia - distanciaPerfectaActual) / rangoPuntuable);
        return Mathf.RoundToInt(puntosPorObjeto * (1f - t));
    }

    private void MostrarObjetivosDebug()
    {
        LimpiarMarcadoresDebug();

        foreach (ObjetoMemoria obj in objetos)
        {
            if (obj.go == null || obj.rect == null) continue;

            GameObject marcador = new GameObject("ObjetivoDebug", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            marcador.transform.SetParent(zonaJuego, false);
            marcador.transform.SetSiblingIndex(1);

            RectTransform rect = marcador.GetComponent<RectTransform>();
            rect.sizeDelta = obj.rect.sizeDelta * escalaObjetivoDebug;
            rect.anchoredPosition = obj.posicionObjetivo;

            Image img = marcador.GetComponent<Image>();
            Image original = obj.go.GetComponent<Image>();
            if (original != null)
                img.sprite = original.sprite;

            img.color = colorObjetivoDebug;
            img.preserveAspect = true;
            img.raycastTarget = false;

            marcadoresDebug.Add(marcador);
        }
    }

    private void LogDistanciasObjetos()
    {
        for (int i = 0; i < objetos.Count; i++)
        {
            ObjetoMemoria obj = objetos[i];
            Debug.Log($"EcoVisual objeto {i + 1}: distancia {obj.distancia:F1}px | puntos {obj.puntos}/{puntosPorObjeto} | objetivo {obj.posicionObjetivo} | colocado {obj.rect.anchoredPosition}");
        }
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (juegoFinalizado) return;

        juegoFinalizado = true;
        faseActual = FaseEcoVisual.Finalizado;
        StopAllCoroutines();
        MostrarBarra(false);
        OnMemorizacionActualizada?.Invoke(0f, 1f);
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        if (puntuacionMaximaTotal <= 0)
            return m;

        float progresoRondas = Mathf.Clamp01((float)rondasSuperadas / Mathf.Max(1, nivelMaximo - nivelInicial + 1));
        float factorProgreso = Mathf.Lerp(multiplicadorMinimoProgresoCognicion, 1f, progresoRondas);
        float precisionEspacialBase = Mathf.Clamp01((float)puntuacionTotal / puntuacionMaximaTotal);
        float rendimientoMedioBase = Promedio(rendimientosRonda, precisionEspacialBase);
        float consistenciaBase = rondaActual > 0 ? Mathf.Clamp01((float)rondasSuperadas / rondaActual) : precisionEspacialBase;
        float rachaNormalizadaBase = Mathf.Clamp01((float)mejorRacha / Mathf.Max(1, nivelActual));
        float precisionEspacial = precisionEspacialBase * factorProgreso;
        float rendimientoMedio = rendimientoMedioBase * factorProgreso;
        float consistencia = consistenciaBase * factorProgreso;
        float rachaNormalizada = rachaNormalizadaBase * factorProgreso;
        float progreso = progresoRondas;
        float pesoProgreso = Mathf.Clamp01(pesoProgresoNivelCognicion);
        float pesoRendimiento = 1f - pesoProgreso;

        m.memoriaEspacial = Mathf.Clamp01((precisionEspacial * pesoRendimiento) + (progreso * pesoProgreso));
        m.atencionSelectiva = Mathf.Clamp01((rendimientoMedio * (1f - pesoProgreso * 0.65f)) + (progreso * pesoProgreso * 0.65f));
        m.flexibilidadCognitiva = Mathf.Clamp01((rachaNormalizada * (1f - pesoProgreso)) + (progreso * pesoProgreso));
        m.atencionSostenida = Mathf.Clamp01((consistencia * (1f - pesoProgreso * 0.5f)) + (progreso * pesoProgreso * 0.5f));

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.memoriaEspacial = m.memoriaEspacial * 0.60f;
        p.atencionSelectiva = m.atencionSelectiva * 0.20f;
        p.flexibilidadCognitiva = m.flexibilidadCognitiva * 0.10f;
        p.atencionSostenida = m.atencionSostenida * 0.10f;
        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
    }

    private void AplicarNivel()
    {
        nivelActual = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? nivelActual, 1, nivelMaximo);
        float t = Mathf.InverseLerp(1f, nivelMaximo, nivelActual);

        if (nivelActual <= nivelesConObjetosIniciales)
        {
            numeroObjetos = objetosNivelesIniciales;
        }
        else
        {
            float tObjetos = Mathf.InverseLerp(nivelesConObjetosIniciales + 1f, nivelMaximo, nivelActual);
            numeroObjetos = Mathf.RoundToInt(Mathf.Lerp(objetosNivelesIniciales + 1, objetosNivel10, tObjetos));
        }

        tiempoMemorizacionActual = Mathf.Lerp(tiempoMemorizacionNivel1, tiempoMemorizacionNivel10, t);
        porcentajeMinimoActual = Mathf.Lerp(porcentajeMinimoNivel1, porcentajeMinimoNivel10, t);

        float basePanel = ObtenerTamanoBasePanel();
        distanciaCeroPuntosActual = usarDistanciaRelativaAlPanel
            ? basePanel * Mathf.Lerp(distanciaCeroPuntosPanelNivel1, distanciaCeroPuntosPanelNivel10, t)
            : Mathf.Lerp(distanciaCeroPuntosNivel1, distanciaCeroPuntosNivel10, t);

        distanciaPerfectaActual = usarDistanciaRelativaAlPanel
            ? basePanel * Mathf.Lerp(distanciaPerfectaPanelNivel1, distanciaPerfectaPanelNivel10, t)
            : Mathf.Lerp(distanciaPerfectaNivel1, distanciaPerfectaNivel10, t);

        distanciaCeroPuntosActual = Mathf.Max(distanciaPerfectaActual + 1f, distanciaCeroPuntosActual);
    }

    private float ObtenerTamanoBasePanel()
    {
        if (zonaJuego == null)
            return 800f;

        Canvas.ForceUpdateCanvases();
        Rect rect = zonaJuego.rect;
        float basePanel = Mathf.Min(Mathf.Abs(rect.width), Mathf.Abs(rect.height));
        return Mathf.Max(200f, basePanel);
    }

    private void AjustarImagenEscenario(Sprite escenario)
    {
        if (imagenEscenario == null || zonaJuego == null || escenario == null) return;

        RectTransform rectImagen = imagenEscenario.rectTransform;
        Rect rectPanel = zonaJuego.rect;
        float anchoPanel = Mathf.Max(1f, Mathf.Abs(rectPanel.width));
        float altoPanel = Mathf.Max(1f, Mathf.Abs(rectPanel.height));

        if (ajusteEscenario == AjusteEscenario.EstirarAlPanel)
        {
            imagenEscenario.preserveAspect = false;
            AjustarRectCompleto(rectImagen);
            return;
        }

        imagenEscenario.preserveAspect = false;

        float ratioPanel = anchoPanel / altoPanel;
        float ratioSprite = escenario.rect.width / escenario.rect.height;
        float ancho;
        float alto;

        bool cubrir = ajusteEscenario == AjusteEscenario.CubrirSinDeformar;
        if ((ratioSprite > ratioPanel) == cubrir)
        {
            alto = altoPanel;
            ancho = alto * ratioSprite;
        }
        else
        {
            ancho = anchoPanel;
            alto = ancho / ratioSprite;
        }

        rectImagen.anchorMin = new Vector2(0.5f, 0.5f);
        rectImagen.anchorMax = new Vector2(0.5f, 0.5f);
        rectImagen.pivot = new Vector2(0.5f, 0.5f);
        rectImagen.anchoredPosition = Vector2.zero;
        rectImagen.sizeDelta = new Vector2(ancho, alto);
        rectImagen.localScale = Vector3.one;
    }

    private void PrepararLayout()
    {
        if (!generarZonasPorCodigo) return;

        if (raizLayout == null)
            raizLayout = ObtenerRaizLayout();

        if (raizLayout == null) return;

        if (forzarRaizAPantallaCompleta)
            AjustarRectCompleto(raizLayout);

        fondoGlobal = CrearOReusarZona("EcoVisual_FondoGlobal");
        zonaHeader = CrearOReusarZona("EcoVisual_Header");
        zonaJuego = CrearOReusarZona("EcoVisual_Juego");
        barraObjetos = CrearOReusarZona("EcoVisual_BarraObjetos");

        AjustarRectCompleto(fondoGlobal);
        ConfigurarRectSuperior(zonaHeader, altoHeader);
        ConfigurarRectInferior(barraObjetos, altoBarraObjetos);
        ConfigurarRectCentral(zonaJuego, altoHeader, altoBarraObjetos);

        ConfigurarImagenZona(fondoGlobal, colorFondoGlobal, false);
        ConfigurarImagenZona(zonaHeader, colorHeader, true);
        ConfigurarImagenZona(zonaJuego, colorFondoJuego, false);
        ConfigurarImagenZona(barraObjetos, colorBarraObjetos, true);

        PrepararHeader();
        PrepararTextoFaseBarra();
        barraObjetos.gameObject.SetActive(false);

        fondoGlobal.SetAsFirstSibling();
        zonaJuego.SetAsLastSibling();
        barraObjetos.SetAsLastSibling();
        zonaHeader.SetAsLastSibling();
        TraerBotonPausaAlFrente();
    }

    private RectTransform ObtenerRaizLayout()
    {
        UIManager ui = UIManager.Instance != null
            ? UIManager.Instance
            : FindFirstObjectByType<UIManager>(FindObjectsInactive.Include);

        if (ui != null && ui.UIPartida != null)
            return ui.UIPartida.GetComponent<RectTransform>();

        if (zonaJuego != null && zonaJuego.parent is RectTransform parentRect)
            return parentRect;

        if (canvas == null)
            canvas = FindFirstObjectByType<Canvas>(FindObjectsInactive.Include);

        return canvas != null ? canvas.GetComponent<RectTransform>() : null;
    }

    private void TraerBotonPausaAlFrente()
    {
        UIManager ui = UIManager.Instance != null
            ? UIManager.Instance
            : FindFirstObjectByType<UIManager>(FindObjectsInactive.Include);

        if (ui == null || ui.botonPausa == null) return;

        Transform boton = ui.botonPausa.transform;
        RectTransform parent = raizLayout != null ? raizLayout : ui.UIPartida != null ? ui.UIPartida.GetComponent<RectTransform>() : null;
        if (parent != null && boton.parent != parent)
            boton.SetParent(parent, false);

        ui.botonPausa.gameObject.SetActive(true);

        RectTransform rect = ui.botonPausa.GetComponent<RectTransform>();
        if (rect != null)
        {
            float ancho = raizLayout != null && raizLayout.rect.width > 0f ? raizLayout.rect.width : Screen.width;
            bool compacto = ancho < 1000f;
            rect.anchorMin = new Vector2(1f, 0f);
            rect.anchorMax = new Vector2(1f, 0f);
            rect.pivot = new Vector2(1f, 0f);
            rect.anchoredPosition = new Vector2(-24f, 24f);
            rect.sizeDelta = compacto ? new Vector2(200f, 75f) : new Vector2(275f, 100f);
            rect.localScale = Vector3.one;
        }

        LayoutElement layout = ui.botonPausa.GetComponent<LayoutElement>();
        if (layout != null)
            layout.ignoreLayout = true;

        boton.SetAsLastSibling();
    }

    private RectTransform CrearOReusarZona(string nombreZona)
    {
        Transform existente = raizLayout.Find(nombreZona);
        if (existente != null)
            return existente.GetComponent<RectTransform>();

        GameObject go = new GameObject(nombreZona, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        go.transform.SetParent(raizLayout, false);
        return go.GetComponent<RectTransform>();
    }

    private void ConfigurarRectSuperior(RectTransform rect, float alto)
    {
        rect.anchorMin = new Vector2(0f, 1f);
        rect.anchorMax = new Vector2(1f, 1f);
        rect.pivot = new Vector2(0.5f, 1f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(0f, alto);
    }

    private void ConfigurarRectInferior(RectTransform rect, float alto)
    {
        rect.anchorMin = new Vector2(0f, 0f);
        rect.anchorMax = new Vector2(1f, 0f);
        rect.pivot = new Vector2(0.5f, 0f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(0f, alto);
    }

    private void ConfigurarRectCentral(RectTransform rect, float margenSuperior, float margenInferior)
    {
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.offsetMin = new Vector2(paddingHorizontal, margenInferior + paddingVerticalJuego);
        rect.offsetMax = new Vector2(-paddingHorizontal, -margenSuperior - paddingVerticalJuego);
    }

    private void ConfigurarImagenZona(RectTransform rect, Color color, bool raycast)
    {
        Image img = rect.GetComponent<Image>();
        if (img == null) img = rect.gameObject.AddComponent<Image>();

        img.sprite = null;
        img.type = Image.Type.Simple;
        img.preserveAspect = false;
        img.color = color;
        img.raycastTarget = raycast;
    }

    private void PrepararHeader()
    {
        HorizontalLayoutGroup layout = zonaHeader.GetComponent<HorizontalLayoutGroup>();
        if (layout == null)
            layout = zonaHeader.gameObject.AddComponent<HorizontalLayoutGroup>();

        layout.padding = new RectOffset(18, 18, 8, 8);
        layout.spacing = separacionTextosHeader;
        layout.childAlignment = TextAnchor.MiddleCenter;
        layout.childControlWidth = true;
        layout.childControlHeight = true;
        layout.childForceExpandWidth = true;
        layout.childForceExpandHeight = true;

        textoTiempo = CrearTextoHUD(textoTiempo, "Tiempo", "TIEMPO: 00:00", 1f);
        textoNivel = CrearTextoHUD(textoNivel, "Nivel", "NIVEL: 1/10", 0.85f);
        textoRacha = CrearTextoHUD(textoRacha, "Racha", "RACHA: 0", 0.85f);
        textoObjetos = CrearTextoHUD(textoObjetos, "Objetos", "OBJETOS: 0/0", 1f);
        textoPuntos = CrearTextoHUD(textoPuntos, "Puntos", "PUNTOS: 0/0", 1.15f);
        textoMinimo = CrearTextoHUD(textoMinimo, "Minimo", "MINIMO: 0", 1f);
        textoMemoria = CrearTextoHUD(textoMemoria, "Memoria", "", 1f);
        AplicarFuenteATextos();
    }

    private void PrepararTextoFaseBarra()
    {
        if (barraObjetos == null) return;

        if (textoFase == null)
        {
            Transform existente = barraObjetos.Find("Fase");

            if (existente == null && zonaHeader != null)
                existente = zonaHeader.Find("Fase");

            if (existente != null)
                textoFase = existente.GetComponent<TextMeshProUGUI>();
        }

        if (textoFase == null)
        {
            GameObject go = new GameObject("Fase", typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI), typeof(LayoutElement));
            go.transform.SetParent(barraObjetos, false);
            textoFase = go.GetComponent<TextMeshProUGUI>();
        }
        else if (textoFase.transform.parent != barraObjetos)
        {
            textoFase.transform.SetParent(barraObjetos, false);
        }

        textoFase.color = Color.white;
        textoFase.enableAutoSizing = true;
        textoFase.fontSizeMin = tamanoMinimoTextoHUD;
        textoFase.fontSizeMax = tamanoMaximoTextoHUD;
        textoFase.fontStyle = FontStyles.Bold;
        textoFase.raycastTarget = false;
        textoFase.textWrappingMode = TextWrappingModes.NoWrap;
        textoFase.overflowMode = TextOverflowModes.Ellipsis;
        AplicarFuenteTexto(textoFase);

        LayoutElement layout = textoFase.GetComponent<LayoutElement>();
        if (layout == null)
            layout = textoFase.gameObject.AddComponent<LayoutElement>();

        layout.ignoreLayout = true;

        ConfigurarTextoFaseBarra();
    }

    private void ConfigurarTextoFaseBarra()
    {
        if (textoFase == null || barraObjetos == null) return;

        RectTransform rect = textoFase.GetComponent<RectTransform>();
        if (rect == null) return;

        if (faseActual == FaseEcoVisual.Reconstruccion)
        {
            float ancho = Mathf.Min(anchoTextoFaseRecoloca, Mathf.Max(1f, barraObjetos.rect.width * 0.62f));
            rect.anchorMin = new Vector2(0f, 0f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 0.5f);
            rect.anchoredPosition = new Vector2(paddingTextoFaseBarra, 0f);
            rect.sizeDelta = new Vector2(ancho, 0f);
            textoFase.alignment = TextAlignmentOptions.MidlineLeft;
        }
        else
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = Vector2.zero;
            rect.offsetMin = new Vector2(paddingTextoFaseBarra, 0f);
            rect.offsetMax = new Vector2(-paddingTextoFaseBarra, 0f);
            textoFase.alignment = TextAlignmentOptions.Center;
        }

        textoFase.transform.SetAsLastSibling();
    }

    private TextMeshProUGUI CrearTextoHUD(TextMeshProUGUI texto, string nombreTexto, string valorInicial, float anchoFlexible)
    {
        if (texto == null)
        {
            GameObject go = new GameObject(nombreTexto, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI), typeof(LayoutElement));
            go.transform.SetParent(zonaHeader, false);
            texto = go.GetComponent<TextMeshProUGUI>();
            texto.text = valorInicial;
        }
        else if (texto.transform.parent != zonaHeader)
        {
            texto.transform.SetParent(zonaHeader, false);
        }

        texto.color = Color.white;
        texto.alignment = TextAlignmentOptions.Center;
        texto.enableAutoSizing = true;
        texto.fontSizeMin = tamanoMinimoTextoHUD;
        texto.fontSizeMax = tamanoMaximoTextoHUD;
        texto.fontStyle = FontStyles.Bold;
        texto.raycastTarget = false;
        AplicarFuenteTexto(texto);

        LayoutElement layout = texto.GetComponent<LayoutElement>();
        if (layout == null)
            layout = texto.gameObject.AddComponent<LayoutElement>();

        layout.minWidth = anchoMinimoTextoHUD;
        layout.flexibleWidth = anchoFlexible;
        layout.flexibleHeight = 1f;

        return texto;
    }

    private void ActualizarHUD()
    {
        int segundos = GameManager.Instance != null
            ? Mathf.Max(0, Mathf.CeilToInt(GameManager.Instance.tiempoRestante))
            : 0;

        SetText(textoTiempo, $"TIEMPO: {segundos / 60:00}:{segundos % 60:00}");
        SetText(textoNivel, $"NIVEL: {nivelActual}/{nivelMaximo}");
        SetText(textoRacha, $"RACHA: {rachaActual}");
        SetText(textoObjetos, $"OBJETOS: {ContarObjetosColocados()}/{objetos.Count}");
        SetText(textoPuntos, $"PUNTOS: {puntuacionTotal}/{puntuacionMaximaTotal}");
        SetText(textoMinimo, $"MINIMO: {puntuacionMinimaRonda}");

        if (textoPuntuacion != null)
            textoPuntuacion.text = $"PUNTOS: {puntuacionTotal}/{puntuacionMaximaTotal}";
    }

    private void Update()
    {
        if (faseActual != FaseEcoVisual.Inactivo && faseActual != FaseEcoVisual.Finalizado)
        {
            AplicarTamanoObjetosDesdeInspector();
            ActualizarHUD();
        }
    }

    private void AplicarTamanoObjetosDesdeInspector()
    {
        if (tamanoObjetoEscena == ultimoTamanoObjetoEscena && tamanoObjetoBarra == ultimoTamanoObjetoBarra)
            return;

        foreach (ObjetoMemoria obj in objetos)
        {
            if (obj.rect == null || obj.go == null) continue;

            bool estaEnBarra = barraObjetos != null && obj.go.transform.parent == barraObjetos;
            obj.rect.sizeDelta = estaEnBarra ? tamanoObjetoBarra : tamanoObjetoEscena;
        }

        ultimoTamanoObjetoEscena = tamanoObjetoEscena;
        ultimoTamanoObjetoBarra = tamanoObjetoBarra;
    }

    private void ActualizarTextoMemoria(float restante)
    {
        SetText(textoMemoria, restante > 0f ? $"MEMORIA: {Mathf.CeilToInt(restante):00}" : "");
    }

    private void SetFase(string texto)
    {
        PrepararTextoFaseBarra();
        ConfigurarTextoFaseBarra();
        SetText(textoFase, texto);

        if (textoInstruccion != null)
            textoInstruccion.text = texto;

        OnFaseActualizada?.Invoke(texto);
    }

    private void SetText(TextMeshProUGUI tmp, string texto)
    {
        if (tmp == null) return;

        AplicarFuenteTexto(tmp);
        tmp.text = texto;
    }

    private void AplicarFuenteATextos()
    {
        AplicarFuenteTexto(textoTiempo);
        AplicarFuenteTexto(textoNivel);
        AplicarFuenteTexto(textoRacha);
        AplicarFuenteTexto(textoObjetos);
        AplicarFuenteTexto(textoPuntos);
        AplicarFuenteTexto(textoMinimo);
        AplicarFuenteTexto(textoFase);
        AplicarFuenteTexto(textoMemoria);
        AplicarFuenteTexto(textoInstruccion);
        AplicarFuenteTexto(textoPuntuacion);
    }

    private void AplicarFuenteTexto(TextMeshProUGUI texto)
    {
        if (fuenteTextos != null && texto != null)
            texto.font = fuenteTextos;
    }

    private void EmitirEventosHUD()
    {
        EmitirProgreso();
        OnPuntuacionActualizada?.Invoke(puntuacionTotal, puntuacionMaximaTotal);
        OnObjetivoRondaActualizado?.Invoke(puntuacionMinimaRonda, objetos.Count * puntosPorObjeto);
        OnNivelActualizado?.Invoke(nivelActual);
    }

    private void EmitirProgreso()
    {
        OnProgresoActualizado?.Invoke(ContarObjetosColocados(), objetos.Count);
    }

    private List<GameObject> CrearBolsaObjetos()
    {
        List<GameObject> bolsa = new List<GameObject>();

        foreach (GameObject prefab in prefabsObjetos)
            if (prefab != null) bolsa.Add(prefab);

        if (bolsa.Count == 0 && prefabObjeto != null)
            bolsa.Add(prefabObjeto);

        if (bolsa.Count == 0 && prefabObjetoFallback != null)
            bolsa.Add(prefabObjetoFallback);

        return bolsa;
    }

    private GameObject ObtenerPrefabObjeto(List<GameObject> bolsa)
    {
        if (bolsa.Count == 0) return null;

        int indice = Random.Range(0, bolsa.Count);
        GameObject elegido = bolsa[indice];

        if (!permitirObjetosRepetidos)
            bolsa.RemoveAt(indice);

        return elegido;
    }

    private Sprite ObtenerEscenarioAleatorio()
    {
        List<Sprite> disponibles = new List<Sprite>();

        foreach (Sprite sprite in imagenesEscenarios)
            if (sprite != null) disponibles.Add(sprite);

        if (disponibles.Count == 0 && generarEscenariosPruebaSiNoHayImagenes)
        {
            CrearEscenariosPrueba();
            disponibles.AddRange(escenariosPruebaGenerados);
        }

        return disponibles.Count > 0 ? disponibles[Random.Range(0, disponibles.Count)] : null;
    }

    private void CrearEscenariosPrueba()
    {
        if (escenariosPruebaGenerados.Count > 0) return;

        escenariosPruebaGenerados.Add(CrearSpriteEscenarioPrueba(0));
        escenariosPruebaGenerados.Add(CrearSpriteEscenarioPrueba(1));
        escenariosPruebaGenerados.Add(CrearSpriteEscenarioPrueba(2));
    }

    private Sprite CrearSpriteEscenarioPrueba(int tipo)
    {
        const int ancho = 1024;
        const int alto = 576;

        Texture2D textura = new Texture2D(ancho, alto, TextureFormat.RGBA32, false);
        textura.name = $"EcoVisual_EscenarioPrueba_{tipo + 1}";
        textura.wrapMode = TextureWrapMode.Clamp;
        textura.filterMode = FilterMode.Bilinear;

        switch (tipo)
        {
            case 0:
                DibujarEscenarioAula(textura);
                break;
            case 1:
                DibujarEscenarioLaboratorio(textura);
                break;
            default:
                DibujarEscenarioCocina(textura);
                break;
        }

        textura.Apply();

        Sprite sprite = Sprite.Create(textura, new Rect(0f, 0f, ancho, alto), new Vector2(0.5f, 0.5f), 100f);
        sprite.name = textura.name;
        return sprite;
    }

    private void DibujarEscenarioAula(Texture2D textura)
    {
        RellenarTextura(textura, new Color(0.17f, 0.20f, 0.19f, 1f));
        PintarCuadricula(textura, 64, new Color(0.22f, 0.25f, 0.24f, 1f));
        PintarRect(textura, 110, 430, 804, 74, new Color(0.08f, 0.22f, 0.17f, 1f));
        PintarRect(textura, 126, 448, 772, 42, new Color(0.10f, 0.36f, 0.26f, 1f));
        PintarRect(textura, 96, 70, 132, 360, new Color(0.36f, 0.27f, 0.17f, 1f));
        PintarRect(textura, 130, 92, 64, 315, new Color(0.46f, 0.35f, 0.22f, 1f));

        for (int fila = 0; fila < 3; fila++)
        {
            for (int columna = 0; columna < 4; columna++)
            {
                int x = 310 + columna * 130;
                int y = 100 + fila * 95;
                PintarRect(textura, x, y, 88, 52, new Color(0.55f, 0.39f, 0.22f, 1f));
                PintarRect(textura, x + 10, y + 10, 68, 32, new Color(0.64f, 0.47f, 0.27f, 1f));
            }
        }
    }

    private void DibujarEscenarioLaboratorio(Texture2D textura)
    {
        RellenarTextura(textura, new Color(0.12f, 0.15f, 0.18f, 1f));
        PintarCuadricula(textura, 72, new Color(0.18f, 0.22f, 0.25f, 1f));
        PintarRect(textura, 70, 392, 884, 82, new Color(0.28f, 0.32f, 0.35f, 1f));
        PintarRect(textura, 92, 412, 840, 42, new Color(0.40f, 0.45f, 0.48f, 1f));
        PintarRect(textura, 148, 120, 260, 92, new Color(0.30f, 0.36f, 0.39f, 1f));
        PintarRect(textura, 616, 120, 260, 92, new Color(0.30f, 0.36f, 0.39f, 1f));
        PintarRect(textura, 466, 212, 92, 210, new Color(0.24f, 0.30f, 0.33f, 1f));
        PintarCirculo(textura, 242, 166, 24, new Color(0.10f, 0.42f, 0.54f, 1f));
        PintarCirculo(textura, 742, 166, 24, new Color(0.10f, 0.42f, 0.54f, 1f));
        PintarRect(textura, 500, 240, 24, 154, new Color(0.58f, 0.65f, 0.68f, 1f));
    }

    private void DibujarEscenarioCocina(Texture2D textura)
    {
        RellenarTextura(textura, new Color(0.21f, 0.19f, 0.16f, 1f));
        PintarCuadricula(textura, 58, new Color(0.28f, 0.25f, 0.21f, 1f));
        PintarRect(textura, 70, 390, 884, 92, new Color(0.45f, 0.38f, 0.30f, 1f));
        PintarRect(textura, 92, 414, 840, 44, new Color(0.58f, 0.51f, 0.42f, 1f));
        PintarRect(textura, 380, 130, 264, 132, new Color(0.48f, 0.37f, 0.24f, 1f));
        PintarRect(textura, 406, 154, 212, 84, new Color(0.63f, 0.49f, 0.31f, 1f));
        PintarRect(textura, 118, 118, 136, 178, new Color(0.32f, 0.38f, 0.39f, 1f));
        PintarRect(textura, 776, 116, 122, 180, new Color(0.36f, 0.31f, 0.27f, 1f));
        PintarCirculo(textura, 512, 196, 44, new Color(0.24f, 0.29f, 0.28f, 1f));
        PintarCirculo(textura, 512, 196, 25, new Color(0.58f, 0.62f, 0.58f, 1f));
    }

    private void RellenarTextura(Texture2D textura, Color color)
    {
        for (int y = 0; y < textura.height; y++)
            for (int x = 0; x < textura.width; x++)
                textura.SetPixel(x, y, color);
    }

    private void PintarCuadricula(Texture2D textura, int paso, Color color)
    {
        for (int x = 0; x < textura.width; x += paso)
            PintarRect(textura, x, 0, 2, textura.height, color);

        for (int y = 0; y < textura.height; y += paso)
            PintarRect(textura, 0, y, textura.width, 2, color);
    }

    private void PintarRect(Texture2D textura, int x, int y, int ancho, int alto, Color color)
    {
        int minX = Mathf.Clamp(x, 0, textura.width);
        int maxX = Mathf.Clamp(x + ancho, 0, textura.width);
        int minY = Mathf.Clamp(y, 0, textura.height);
        int maxY = Mathf.Clamp(y + alto, 0, textura.height);

        for (int py = minY; py < maxY; py++)
            for (int px = minX; px < maxX; px++)
                textura.SetPixel(px, py, color);
    }

    private void PintarCirculo(Texture2D textura, int centroX, int centroY, int radio, Color color)
    {
        int radioCuadrado = radio * radio;
        int minX = Mathf.Clamp(centroX - radio, 0, textura.width);
        int maxX = Mathf.Clamp(centroX + radio, 0, textura.width);
        int minY = Mathf.Clamp(centroY - radio, 0, textura.height);
        int maxY = Mathf.Clamp(centroY + radio, 0, textura.height);

        for (int y = minY; y < maxY; y++)
        {
            for (int x = minX; x < maxX; x++)
            {
                int dx = x - centroX;
                int dy = y - centroY;
                if ((dx * dx) + (dy * dy) <= radioCuadrado)
                    textura.SetPixel(x, y, color);
            }
        }
    }

    private Vector2 ObtenerPosicionAleatoria(List<Vector2> posicionesUsadas)
    {
        Rect rect = zonaJuego.rect;
        float minX = (-rect.width / 2f) + margenGeneracionObjetos;
        float maxX = (rect.width / 2f) - margenGeneracionObjetos;
        float minY = (-rect.height / 2f) + margenGeneracionObjetos;
        float maxY = (rect.height / 2f) - margenGeneracionObjetos;
        Vector2 posicion = Vector2.zero;

        for (int intento = 0; intento < 40; intento++)
        {
            posicion = new Vector2(Random.Range(minX, maxX), Random.Range(minY, maxY));
            bool valida = true;

            foreach (Vector2 usada in posicionesUsadas)
            {
                if (Vector2.Distance(posicion, usada) < separacionMinimaObjetos)
                {
                    valida = false;
                    break;
                }
            }

            if (valida)
                return posicion;
        }

        return posicion;
    }

    private void MoverObjetoArrastrando(PointerEventData eventData)
    {
        Camera camara = canvas != null ? canvas.worldCamera : null;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(zonaJuego, eventData.position, camara, out Vector2 pos);
        objetoArrastrandoRect.anchoredPosition = LimitarAPanelJuego(pos);
    }

    private bool PuntoDentroZonaJuego(PointerEventData eventData)
    {
        Camera camara = canvas != null ? canvas.worldCamera : null;
        return RectTransformUtility.RectangleContainsScreenPoint(zonaJuego, eventData.position, camara);
    }

    private Vector2 LimitarAPanelJuego(Vector2 posicion)
    {
        Rect rect = zonaJuego.rect;
        float margenX = tamanoObjetoEscena.x * 0.5f;
        float margenY = tamanoObjetoEscena.y * 0.5f;
        posicion.x = Mathf.Clamp(posicion.x, (-rect.width / 2f) + margenX, (rect.width / 2f) - margenX);
        posicion.y = Mathf.Clamp(posicion.y, (-rect.height / 2f) + margenY, (rect.height / 2f) - margenY);
        return posicion;
    }

    private void DevolverABarra(ObjetoMemoria obj)
    {
        if (obj == null || obj.go == null || barraObjetos == null) return;

        obj.go.transform.SetParent(barraObjetos, false);
        obj.rect.sizeDelta = tamanoObjetoBarra;
        obj.rect.anchoredPosition = obj.posicionBarra;
        obj.colocado = false;
    }

    private bool TodosColocados()
    {
        if (objetos.Count == 0) return false;

        foreach (ObjetoMemoria obj in objetos)
            if (!obj.colocado) return false;

        return true;
    }

    private int ContarObjetosColocados()
    {
        int total = 0;

        foreach (ObjetoMemoria obj in objetos)
            if (obj.colocado) total++;

        return total;
    }

    private IEnumerator EsperarSinPausa(float duracion)
    {
        float tiempo = 0f;

        while (tiempo < duracion && !juegoFinalizado)
        {
            if (!juegoPausado)
                tiempo += Time.deltaTime;

            yield return null;
        }
    }

    private float Promedio(List<float> valores, float valorSiVacio)
    {
        if (valores.Count == 0) return valorSiVacio;

        float suma = 0f;
        foreach (float valor in valores)
            suma += valor;

        return suma / valores.Count;
    }

    private void LimpiarRonda()
    {
        LimpiarMarcadoresDebug();

        foreach (ObjetoMemoria obj in objetos)
            if (obj.go != null) Destroy(obj.go);

        objetos.Clear();
        LimpiarArrastre();
    }

    private void LimpiarMarcadoresDebug()
    {
        foreach (GameObject marcador in marcadoresDebug)
            if (marcador != null) Destroy(marcador);

        marcadoresDebug.Clear();
    }

    private void LimpiarArrastre()
    {
        objetoArrastrando = null;
        memoriaArrastrando = null;
        objetoArrastrandoRect = null;
    }

    private void MostrarBarra(bool visible)
    {
        if (barraObjetos != null)
            barraObjetos.gameObject.SetActive(visible);
    }

    private void CachearReferencias()
    {
        if (canvas == null)
            canvas = GetComponentInParent<Canvas>();

        if (canvas == null)
            canvas = FindFirstObjectByType<Canvas>(FindObjectsInactive.Include);

        if (uiEcoVisual == null)
            uiEcoVisual = FindFirstObjectByType<UIEcoVisual>(FindObjectsInactive.Include);

        if (uiEcoVisual != null)
            uiEcoVisual.DesactivarHUDAutomatico();
    }

    private void AjustarRectCompleto(RectTransform rect)
    {
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = Vector2.zero;
        rect.localScale = Vector3.one;
    }

    private void OnDestroy()
    {
        StopAllCoroutines();
    }
}
