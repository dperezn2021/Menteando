using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using TMPro;
using System.Collections;
using System.Text.RegularExpressions;

public class DobleCanalUI : MonoBehaviour
{
    [Header("Estilo")]
    [SerializeField] private TMP_FontAsset fuenteNeo;
    [SerializeField] private TMP_FontAsset fuenteNumeros;

    [Header("Paneles")]
    [SerializeField] private GameObject panelIzquierdo;
    [SerializeField] private GameObject panelDerecho;

    [Header("HUD")]
    [SerializeField] private TextMeshProUGUI textoPuntuacion;
    [SerializeField] private TextMeshProUGUI textoAciertos;
    [SerializeField] private TextMeshProUGUI textoFallos;
    [SerializeField] private TextMeshProUGUI textoDistancia;
    [SerializeField] private TextMeshProUGUI textoTiempo;
    [SerializeField] private TextMeshProUGUI textoNivel;
    [SerializeField] private TextMeshProUGUI textoObjetivo;
    [SerializeField] private TextMeshProUGUI textoColisiones;
    [SerializeField] private TextMeshProUGUI textoRacha;

    [Header("Estimulos")]
    [SerializeField] private TextMeshProUGUI textoEstimulo;
    [SerializeField] private GameObject prefabEstimuloEscudo;
    [SerializeField] private GameObject prefabEstimuloPeligro;

    [Header("Feedback")]
    [SerializeField] private TextMeshProUGUI textoFeedback;
    [SerializeField] private TextMeshProUGUI textoFeedbackRunner;
    [SerializeField] private TextMeshProUGUI textoFeedbackRadar;

    [Header("Botones")]
    [SerializeField] private Button botonResponder;
    [SerializeField] private Button botonSaltar;
    [SerializeField] private GameObject botoneraMovil;

    [Header("Resultados")]
    [SerializeField] private GameObject panelResultados;
    [SerializeField] private TextMeshProUGUI textoResultados;

    private DobleCanalGame juego;
    private Canvas canvas;
    private RectTransform root;
    private bool canvasCreadoRuntime;
    private bool botonesConectados;
    private GameObject estimuloVisualActivo;

    private readonly Color colorFondo = new Color(0.025f, 0.035f, 0.055f, 0.00f);
    private readonly Color colorPiloto = new Color(0.035f, 0.070f, 0.115f, 0.00f);
    private readonly Color colorRadar = new Color(0.10f, 0.05f, 0.20f, 1f);
    private readonly Color colorPanel = new Color(0.030f, 0.040f, 0.055f, 1f);
    private readonly Color colorTexto = new Color(0.93f, 0.96f, 1f, 1f);
    private readonly Color colorSuave = new Color(0.82f, 0.76f, 0.92f, 1f);
    private readonly Color colorAcento = new Color(0.86f, 0.42f, 1f, 1f);

    private void Awake()
    {
        EnsureInitialized();
    }

    private void Start()
    {
        if (juego == null)
            juego = FindFirstObjectByType<DobleCanalGame>();

        EnsureInitialized(juego);
    }

    public void EnsureInitialized(DobleCanalGame juegoRef = null)
    {
        if (juegoRef != null)
            juego = juegoRef;

        PrepararCanvas();
        PrepararRoot();
        ConfigurarCanvasScaler();
        CrearLayoutSiFalta();
        ConectarBotones();
        ConfigurarUI();
        AplicarEstiloATodosLosTextos();
    }

    public void ConfigurarUI()
    {
        if (root != null)
            Estirar(root);

        RectTransform left = panelIzquierdo != null ? panelIzquierdo.GetComponent<RectTransform>() : null;
        RectTransform right = panelDerecho != null ? panelDerecho.GetComponent<RectTransform>() : null;

        if (left != null)
        {
            ConfigurarRect(left, new Vector2(0f, 0f), new Vector2(0.5f, 1f), Vector2.zero, Vector2.zero);
            ConfigurarPanelBase(panelIzquierdo, Color.clear, false);
            left.SetAsFirstSibling();
        }

        if (right != null)
        {
            ConfigurarRect(right, new Vector2(0.5f, 0f), new Vector2(1f, 1f), Vector2.zero, Vector2.zero);
            ConfigurarPanelBase(panelDerecho, colorRadar, true);
            right.SetAsFirstSibling();
        }

        if (botoneraMovil != null)
            botoneraMovil.SetActive(Application.isMobilePlatform);

        OcultarEstimulo();
        OcultarFeedback();
        OcultarResultados();
    }

    public void ActualizarPuntuacion(int puntos) => SetTextNumerico(textoPuntuacion, $"puntos\n{puntos}");
    public void ActualizarAciertos(int aciertos) => SetTextNumerico(textoAciertos, $"aciertos\n{aciertos}");
    public void ActualizarFallos(int fallos) => SetTextNumerico(textoFallos, $"errores\n{fallos}");
    public void ActualizarDistancia(int distancia) => SetTextNumerico(textoDistancia, $"metros\n{distancia}");
    public void ActualizarTiempo(int segundos) => SetTextNumerico(textoTiempo, $"tiempo\n{segundos}s");
    public void ActualizarNivel(int nivel) => SetTextNumerico(textoNivel, $"nivel\n{nivel}");
    public void ActualizarColisiones(int colisiones) => SetTextNumerico(textoColisiones, $"choques\n{colisiones}");
    public void ActualizarRacha(int rachaActual) => SetTextNumerico(textoRacha, $"racha\n{rachaActual}");

    public void ActualizarObjetivo(string regla, Color colorObjetivo)
    {
        if (textoObjetivo == null) return;
        AplicarFuenteTexto(textoObjetivo, false);
        textoObjetivo.text = regla.ToLowerInvariant();
        textoObjetivo.color = colorAcento;
    }

    public void MostrarEstimulo(string icono, Color color, float duracion)
    {
        if (textoEstimulo == null) return;

        LimpiarEstimuloVisual();
        bool esEscudo = icono == "escudo";
        GameObject prefab = icono == "escudo" ? prefabEstimuloEscudo : prefabEstimuloPeligro;
        if (prefab != null)
        {
            estimuloVisualActivo = Instantiate(prefab, textoEstimulo.rectTransform);
            estimuloVisualActivo.name = esEscudo ? "EstimuloEscudo" : "EstimuloPeligro";
            ConfigurarPrefabEstimulo(estimuloVisualActivo);
        }
        else
        {
            estimuloVisualActivo = CrearEstimuloBase(textoEstimulo.rectTransform, esEscudo);
        }

        textoEstimulo.text = "";
        AplicarFuenteTexto(textoEstimulo, false);
        textoEstimulo.color = color;
        textoEstimulo.gameObject.SetActive(true);
        textoEstimulo.transform.localScale = Vector3.zero;
        textoEstimulo.transform.SetAsLastSibling();
        ActualizarColorPanelRadar(esEscudo ? new Color(0.05f, 0.16f, 0.28f, 1f) : new Color(0.30f, 0.05f, 0.10f, 1f));
        StartCoroutine(AnimarAparicion(textoEstimulo.transform, 0.10f));
    }

    public void OcultarEstimulo()
    {
        if (textoEstimulo != null)
        {
            LimpiarEstimuloVisual();
            textoEstimulo.text = "";
            textoEstimulo.color = Color.white;
            textoEstimulo.transform.localScale = Vector3.one;
            textoEstimulo.gameObject.SetActive(false);
            ActualizarColorPanelRadar(colorRadar);
        }
    }

    public void MostrarFeedback(string mensaje, Color color)
    {
        if (textoFeedback == null) return;
        AplicarFuenteTexto(textoFeedback, false);
        textoFeedback.text = mensaje.ToLowerInvariant();
        textoFeedback.color = color;
        textoFeedback.gameObject.SetActive(true);
        textoFeedback.transform.localScale = Vector3.one;
    }

    public void OcultarFeedback()
    {
        if (textoFeedback != null)
            textoFeedback.gameObject.SetActive(false);

        OcultarFeedbackRunner();
        OcultarFeedbackRadar();
    }

    public void MostrarFeedbackRunner(string mensaje, Color color)
    {
        MostrarFeedbackEnTexto(textoFeedbackRunner, mensaje, color, false);
    }

    public void OcultarFeedbackRunner()
    {
        if (textoFeedbackRunner != null)
            textoFeedbackRunner.gameObject.SetActive(false);
    }

    public void MostrarFeedbackRadar(string mensaje, Color color)
    {
        MostrarFeedbackEnTexto(textoFeedbackRadar, mensaje, color, false);
    }

    public void OcultarFeedbackRadar()
    {
        if (textoFeedbackRadar != null)
            textoFeedbackRadar.gameObject.SetActive(false);
    }

    public void MostrarResultados(int aciertosGo, int omisionesGo, int aciertosNoGo, int erroresNoGo,
        int obstaculosOK, int colisiones, int distancia)
    {
        if (panelResultados != null)
            panelResultados.SetActive(true);

        int totalGo = aciertosGo + omisionesGo;
        int totalNoGo = aciertosNoGo + erroresNoGo;
        float precisionGo = totalGo > 0 ? aciertosGo * 100f / totalGo : 0f;
        float precisionNoGo = totalNoGo > 0 ? aciertosNoGo * 100f / totalNoGo : 0f;

        string texto = $"resultados\n\n" +
                       $"escudo: {aciertosGo} aciertos / {omisionesGo} omisiones\n" +
                       $"peligro: {aciertosNoGo} correctos / {erroresNoGo} impulsivos\n" +
                       $"runner: {obstaculosOK} obstaculos / {colisiones} choques\n" +
                       $"distancia: {distancia}m\n\n" +
                       $"precision go: {precisionGo:F0}%\n" +
                       $"precision no-go: {precisionNoGo:F0}%";

        SetTextNumerico(textoResultados, texto);
    }

    public void OcultarResultados()
    {
        if (panelResultados != null)
            panelResultados.SetActive(false);
    }

    // ---------- MÉTODOS PRIVADOS ----------
    private void PrepararCanvas()
    {
        canvas = GetComponentInParent<Canvas>();
        if (canvas == null) canvas = FindFirstObjectByType<Canvas>();
        if (canvas == null)
        {
            GameObject canvasGo = new GameObject("Canvas_DobleCanal", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvas = canvasGo.GetComponent<Canvas>();
            canvasCreadoRuntime = true;
        }
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        if (FindFirstObjectByType<EventSystem>() == null)
        {
            GameObject eventSystem = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            eventSystem.transform.SetParent(canvas.transform, false);
        }
    }

    private void PrepararRoot()
    {
        root = GetComponent<RectTransform>();
        if (root == null || GetComponentInParent<Canvas>() == null)
        {
            Transform existente = canvas.transform.Find("DobleCanalRuntimeUI");
            GameObject rootGo = existente != null ? existente.gameObject : new GameObject("DobleCanalRuntimeUI", typeof(RectTransform));
            rootGo.transform.SetParent(canvas.transform, false);
            root = rootGo.GetComponent<RectTransform>();
        }
        Estirar(root);

        Image fondo = root.GetComponent<Image>();
        if (fondo == null) fondo = root.gameObject.AddComponent<Image>();
        fondo.color = colorFondo;
        fondo.raycastTarget = false;
    }

    private void ConfigurarCanvasScaler()
    {
        if (!canvasCreadoRuntime) return;
        CanvasScaler scaler = canvas.GetComponent<CanvasScaler>();
        if (scaler == null) scaler = canvas.gameObject.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920f, 1080f);
        scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
        scaler.matchWidthOrHeight = 0.5f;
        if (canvas.GetComponent<GraphicRaycaster>() == null)
            canvas.gameObject.AddComponent<GraphicRaycaster>();
    }

    private void CrearLayoutSiFalta()
    {
        if (panelIzquierdo == null)
            panelIzquierdo = CrearPanel("Canal_Piloto", root, new Vector2(0f, 0f), new Vector2(0.5f, 1f), colorPiloto);
        if (panelDerecho == null)
            panelDerecho = CrearPanel("Canal_Radar", root, new Vector2(0.5f, 0f), new Vector2(1f, 1f), colorRadar);

        RectTransform left = panelIzquierdo.GetComponent<RectTransform>();
        RectTransform right = panelDerecho.GetComponent<RectTransform>();

        CrearLineaDivisoria();
        CrearDecoracionCanal(left, "heroe", "mitad izquierda", TextAlignmentOptions.Left);
        CrearDecoracionCanal(right, "radar", "mitad derecha", TextAlignmentOptions.Right);
        CrearHud();
        CrearRadar(right);
        CrearFeedback();
        CrearResultados();
    }

    private void CrearHud()
    {
        RectTransform hud = GetOrCreateRect(root, "HUD_DobleCanal");
        ConfigurarRect(hud, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, -70f), new Vector2(0f, 140f));
        ObtenerImage(hud.gameObject, colorPanel).raycastTarget = false;

        textoPuntuacion = textoPuntuacion ?? CrearTextoNumerico("TextoPuntuacion", hud, "puntos\n0", 52, TextAlignmentOptions.Center, colorTexto, new Vector2(0.02f, 0f), new Vector2(0.18f, 1f));
        textoFallos = textoFallos ?? CrearTextoNumerico("TextoFallos", hud, "errores\n0", 52, TextAlignmentOptions.Center, colorTexto, new Vector2(0.20f, 0f), new Vector2(0.36f, 1f));
        textoRacha = textoRacha ?? CrearTextoNumerico("TextoRacha", hud, "racha\n0", 56, TextAlignmentOptions.Center, colorTexto, new Vector2(0.38f, 0f), new Vector2(0.54f, 1f));
        textoTiempo = textoTiempo ?? CrearTextoNumerico("TextoTiempo", hud, "tiempo\n0s", 60, TextAlignmentOptions.Center, colorAcento, new Vector2(0.56f, 0f), new Vector2(0.76f, 1f));
        textoNivel = textoNivel ?? CrearTextoNumerico("TextoNivel", hud, "nivel\n1", 56, TextAlignmentOptions.Center, colorTexto, new Vector2(0.78f, 0f), new Vector2(0.98f, 1f));

        ConfigurarTextoHud(textoPuntuacion, hud, new Vector2(0.02f, 0f), new Vector2(0.18f, 1f), 52, colorTexto);
        ConfigurarTextoHud(textoFallos, hud, new Vector2(0.20f, 0f), new Vector2(0.36f, 1f), 52, colorTexto);
        ConfigurarTextoHud(textoRacha, hud, new Vector2(0.38f, 0f), new Vector2(0.54f, 1f), 56, colorTexto);
        ConfigurarTextoHud(textoTiempo, hud, new Vector2(0.56f, 0f), new Vector2(0.76f, 1f), 60, colorAcento);
        ConfigurarTextoHud(textoNivel, hud, new Vector2(0.78f, 0f), new Vector2(0.98f, 1f), 56, colorTexto);
    }

    private void CrearRadar(RectTransform parent)
    {
        RectTransform zonaEstimulo = GetOrCreateRect(parent, "ZonaEstimuloRadar");
        ConfigurarRect(zonaEstimulo, new Vector2(0.08f, 0.18f), new Vector2(0.92f, 0.78f), Vector2.zero, Vector2.zero);
        ObtenerImage(zonaEstimulo.gameObject, new Color(0f, 0f, 0f, 0f)).raycastTarget = false;

        textoObjetivo = textoObjetivo ?? CrearTexto("TextoObjetivoRadar", parent, "pulsa escudo", 72, TextAlignmentOptions.Center, colorAcento, new Vector2(0.04f, 0.62f), new Vector2(0.96f, 0.84f));
        textoEstimulo = textoEstimulo ?? CrearTexto("TextoEstimuloRadar", parent, "", 210, TextAlignmentOptions.Center, Color.white, new Vector2(0.08f, 0.18f), new Vector2(0.92f, 0.78f));

        textoEstimulo.transform.SetParent(parent, false);
        ConfigurarRect(textoEstimulo.rectTransform, new Vector2(0.08f, 0.18f), new Vector2(0.92f, 0.78f), Vector2.zero, Vector2.zero);

        AplicarFuenteTexto(textoObjetivo, false);
        AplicarFuenteTexto(textoEstimulo, false);

        botonResponder = botonResponder ?? CrearBoton("BotonResponderRadar", parent, "responder", new Vector2(0.22f, 0.05f), new Vector2(0.78f, 0.14f), colorAcento);
        botonSaltar = botonSaltar ?? CrearBoton("BotonSaltarPiloto", panelIzquierdo.GetComponent<RectTransform>(), "saltar", new Vector2(0.22f, 0.05f), new Vector2(0.78f, 0.14f), new Color(0.18f, 0.55f, 1f, 1f));
    }

    private void CrearFeedback()
    {
        if (textoFeedback == null)
        {
            RectTransform feedback = GetOrCreateRect(root, "Feedback_DobleCanal");
            ConfigurarRect(feedback, new Vector2(0.30f, 0.42f), new Vector2(0.70f, 0.58f), Vector2.zero, Vector2.zero);
            textoFeedback = feedback.gameObject.GetComponent<TextMeshProUGUI>();
            if (textoFeedback == null) textoFeedback = feedback.gameObject.AddComponent<TextMeshProUGUI>();
        }
        ConfigurarTexto(textoFeedback, "", 58, TextAlignmentOptions.Center, Color.white, false);
        textoFeedback.fontStyle = FontStyles.Bold;
        textoFeedback.raycastTarget = false;

        if (textoFeedbackRunner == null)
        {
            RectTransform runner = GetOrCreateRect(panelIzquierdo.GetComponent<RectTransform>(), "Feedback_Runner");
            ConfigurarRect(runner, new Vector2(0.12f, 0.38f), new Vector2(0.88f, 0.54f), Vector2.zero, Vector2.zero);
            textoFeedbackRunner = runner.gameObject.GetComponent<TextMeshProUGUI>();
            if (textoFeedbackRunner == null) textoFeedbackRunner = runner.gameObject.AddComponent<TextMeshProUGUI>();
        }
        ConfigurarTexto(textoFeedbackRunner, "", 42, TextAlignmentOptions.Center, Color.white, false);
        textoFeedbackRunner.fontStyle = FontStyles.Bold;
        textoFeedbackRunner.raycastTarget = false;

        if (textoFeedbackRadar == null)
        {
            RectTransform radar = GetOrCreateRect(panelDerecho.GetComponent<RectTransform>(), "Feedback_Radar");
            ConfigurarRect(radar, new Vector2(0.12f, 0.34f), new Vector2(0.88f, 0.52f), Vector2.zero, Vector2.zero);
            textoFeedbackRadar = radar.gameObject.GetComponent<TextMeshProUGUI>();
            if (textoFeedbackRadar == null) textoFeedbackRadar = radar.gameObject.AddComponent<TextMeshProUGUI>();
        }
        ConfigurarTexto(textoFeedbackRadar, "", 42, TextAlignmentOptions.Center, Color.white, false);
        textoFeedbackRadar.fontStyle = FontStyles.Bold;
        textoFeedbackRadar.raycastTarget = false;
    }

    private void CrearResultados()
    {
        if (panelResultados == null)
            panelResultados = CrearPanel("Resultados_DobleCanal", root, new Vector2(0.20f, 0.15f), new Vector2(0.80f, 0.85f), new Color(0.02f, 0.03f, 0.05f, 0.96f));
        RectTransform panel = panelResultados.GetComponent<RectTransform>();
        textoResultados = textoResultados ?? CrearTextoNumerico("TextoResultados", panel, "", 34, TextAlignmentOptions.Center, colorTexto, new Vector2(0.08f, 0.08f), new Vector2(0.92f, 0.92f));
        panelResultados.SetActive(false);
    }

    private void CrearLineaDivisoria()
    {
        RectTransform divider = GetOrCreateRect(root, "Divisor_DobleCanal");
        ConfigurarRect(divider, new Vector2(0.5f, 0f), new Vector2(0.5f, 1f), Vector2.zero, new Vector2(4f, 0f));
        ObtenerImage(divider.gameObject, new Color(0.86f, 0.42f, 1f, 0.70f)).raycastTarget = false;
    }

    private void CrearDecoracionCanal(RectTransform parent, string titulo, string ayuda, TextAlignmentOptions alineacion)
    {
        string nombreTitulo = "Titulo_" + titulo;
        if (parent.Find(nombreTitulo) == null)
            CrearTexto(nombreTitulo, parent, titulo, 60, alineacion, colorSuave, new Vector2(0.06f, 0.82f), new Vector2(0.94f, 0.88f));

        string nombreAyuda = "Ayuda_" + titulo;
        if (parent.Find(nombreAyuda) == null)
            CrearTexto(nombreAyuda, parent, ayuda, 36, alineacion, new Color(0.64f, 0.76f, 0.88f, 0.75f), new Vector2(0.08f, 0.76f), new Vector2(0.92f, 0.81f));
    }

    private void ConectarBotones()
    {
        if (botonesConectados) return;
        if (botonResponder != null) botonResponder.onClick.AddListener(() => juego?.Responder());
        if (botonSaltar != null) botonSaltar.onClick.AddListener(() => juego?.Saltar());
        botonesConectados = true;
    }

    private void ConfigurarTextoHud(TextMeshProUGUI texto, RectTransform parent, Vector2 anchorMin, Vector2 anchorMax, float fontSize, Color color)
    {
        if (texto == null)
            return;

        texto.transform.SetParent(parent, false);
        ConfigurarRect(texto.rectTransform, anchorMin, anchorMax, Vector2.zero, Vector2.zero);
        texto.fontSize = fontSize;
        texto.fontSizeMax = fontSize;
        texto.fontSizeMin = Mathf.Max(18f, fontSize * 0.55f);
        texto.alignment = TextAlignmentOptions.Center;
        texto.color = color;
        texto.gameObject.SetActive(true);
        AplicarFuenteNumerica(texto);
    }

    private void ConfigurarPrefabEstimulo(GameObject estimulo)
    {
        if (estimulo == null)
            return;

        RectTransform rect = estimulo.GetComponent<RectTransform>();
        if (rect != null)
        {
            rect.anchorMin = new Vector2(0.5f, 0.5f);
            rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = Vector2.zero;
            rect.sizeDelta = new Vector2(260f, 260f);
            rect.localScale = Vector3.one;
        }
        else
        {
            estimulo.transform.localPosition = Vector3.zero;
            estimulo.transform.localScale = Vector3.one;
        }
    }

    private GameObject CrearEstimuloBase(RectTransform parent, bool esEscudo)
    {
        GameObject rootGo = new GameObject(esEscudo ? "EscudoBase" : "PeligroBase", typeof(RectTransform), typeof(Image));
        rootGo.transform.SetParent(parent, false);

        RectTransform rootRect = rootGo.GetComponent<RectTransform>();
        rootRect.anchorMin = new Vector2(0.5f, 0.5f);
        rootRect.anchorMax = new Vector2(0.5f, 0.5f);
        rootRect.pivot = new Vector2(0.5f, 0.5f);
        rootRect.anchoredPosition = Vector2.zero;
        rootRect.sizeDelta = new Vector2(260f, 260f);

        Image fondo = rootGo.GetComponent<Image>();
        fondo.color = esEscudo ? new Color(0.18f, 0.78f, 1f, 1f) : new Color(1f, 0.18f, 0.25f, 1f);
        fondo.raycastTarget = false;

        if (esEscudo)
        {
            CrearBloqueVisual(rootRect, "nucleo", new Vector2(0f, 0f), new Vector2(160f, 160f), new Color(0.56f, 0.18f, 1f, 1f), 45f);
            CrearBloqueVisual(rootRect, "brillo", new Vector2(0f, 0f), new Vector2(90f, 90f), new Color(0.90f, 0.96f, 1f, 1f), 45f);
        }
        else
        {
            CrearBloqueVisual(rootRect, "barraVertical", new Vector2(0f, 18f), new Vector2(54f, 150f), new Color(1f, 0.90f, 0.18f, 1f), 0f);
            CrearBloqueVisual(rootRect, "barraHorizontal", new Vector2(0f, -62f), new Vector2(54f, 42f), new Color(1f, 0.90f, 0.18f, 1f), 0f);
        }

        return rootGo;
    }

    private void CrearBloqueVisual(RectTransform parent, string nombre, Vector2 posicion, Vector2 tamano, Color color, float rotacionZ)
    {
        GameObject go = new GameObject(nombre, typeof(RectTransform), typeof(Image));
        go.transform.SetParent(parent, false);

        RectTransform rect = go.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = posicion;
        rect.sizeDelta = tamano;
        rect.localRotation = Quaternion.Euler(0f, 0f, rotacionZ);

        Image image = go.GetComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
    }

    private void ActualizarColorPanelRadar(Color color)
    {
        if (panelDerecho == null)
            return;

        Image image = panelDerecho.GetComponent<Image>();
        if (image == null)
            image = panelDerecho.AddComponent<Image>();

        image.color = color;
        image.raycastTarget = false;
    }

    private void LimpiarEstimuloVisual()
    {
        if (estimuloVisualActivo != null)
        {
            Destroy(estimuloVisualActivo);
            estimuloVisualActivo = null;
        }
    }

    private IEnumerator AnimarAparicion(Transform target, float duracion)
    {
        float t = 0f;
        while (t < duracion)
        {
            t += Time.deltaTime;
            target.localScale = Vector3.Lerp(Vector3.zero, Vector3.one, Mathf.Clamp01(t / duracion));
            yield return null;
        }
        target.localScale = Vector3.one;
    }

    private GameObject CrearPanel(string nombre, RectTransform parent, Vector2 anchorMin, Vector2 anchorMax, Color color)
    {
        RectTransform rect = GetOrCreateRect(parent, nombre);
        ConfigurarRect(rect, anchorMin, anchorMax, Vector2.zero, Vector2.zero);
        ObtenerImage(rect.gameObject, color);
        return rect.gameObject;
    }

    private Button CrearBoton(string nombre, RectTransform parent, string texto, Vector2 anchorMin, Vector2 anchorMax, Color color)
    {
        RectTransform rect = GetOrCreateRect(parent, nombre);
        ConfigurarRect(rect, anchorMin, anchorMax, Vector2.zero, Vector2.zero);

        Image image = ObtenerImage(rect.gameObject, color);
        image.raycastTarget = true;

        Button button = rect.gameObject.GetComponent<Button>();
        if (button == null) button = rect.gameObject.AddComponent<Button>();

        ColorBlock colors = button.colors;
        colors.normalColor = color;
        colors.highlightedColor = Color.Lerp(color, Color.white, 0.18f);
        colors.pressedColor = Color.Lerp(color, Color.black, 0.18f);
        colors.selectedColor = colors.highlightedColor;
        button.colors = colors;

        RectTransform textoRect = GetOrCreateRect(rect, "Texto");
        ConfigurarRect(textoRect, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        TextMeshProUGUI label = textoRect.gameObject.GetComponent<TextMeshProUGUI>();
        if (label == null) label = textoRect.gameObject.AddComponent<TextMeshProUGUI>();

        ConfigurarTexto(label, texto, 48, TextAlignmentOptions.Center, Color.white, false);
        label.fontStyle = FontStyles.Bold;
        label.raycastTarget = false;
        return button;
    }

    private TextMeshProUGUI CrearTexto(string nombre, RectTransform parent, string texto, float fontSize,
        TextAlignmentOptions alignment, Color color, Vector2 anchorMin, Vector2 anchorMax)
    {
        RectTransform rect = GetOrCreateRect(parent, nombre);
        ConfigurarRect(rect, anchorMin, anchorMax, Vector2.zero, Vector2.zero);
        TextMeshProUGUI tmp = rect.gameObject.GetComponent<TextMeshProUGUI>();
        if (tmp == null) tmp = rect.gameObject.AddComponent<TextMeshProUGUI>();
        ConfigurarTexto(tmp, texto, fontSize, alignment, color, false);
        return tmp;
    }

    private TextMeshProUGUI CrearTextoNumerico(string nombre, RectTransform parent, string texto, float fontSize,
        TextAlignmentOptions alignment, Color color, Vector2 anchorMin, Vector2 anchorMax)
    {
        TextMeshProUGUI tmp = CrearTexto(nombre, parent, texto, fontSize, alignment, color, anchorMin, anchorMax);
        AplicarFuenteNumerica(tmp);
        return tmp;
    }

    private void ConfigurarTexto(TextMeshProUGUI tmp, string texto, float fontSize, TextAlignmentOptions alignment, Color color, bool esNumerico = false)
    {
        tmp.text = texto.ToLowerInvariant();
        if (esNumerico) AplicarFuenteNumerica(tmp);
        else AplicarFuenteTexto(tmp, false);
        tmp.fontSize = fontSize;
        tmp.enableAutoSizing = true;
        tmp.fontSizeMax = fontSize;
        tmp.fontSizeMin = Mathf.Max(12f, fontSize * 0.50f);
        tmp.alignment = alignment;
        tmp.color = color;
        tmp.textWrappingMode = TextWrappingModes.Normal;
        tmp.overflowMode = TextOverflowModes.Ellipsis;
        tmp.raycastTarget = false;
    }

    private void SetTextNumerico(TextMeshProUGUI tmp, string txt)
    {
        if (tmp == null) return;
        AplicarFuenteNumerica(tmp);
        tmp.text = txt.ToLowerInvariant();
    }

    private void SetText(TextMeshProUGUI tmp, string txt)
    {
        if (tmp == null) return;
        AplicarFuenteTexto(tmp, false);
        tmp.text = txt.ToLowerInvariant();
    }

    private void MostrarFeedbackEnTexto(TextMeshProUGUI tmp, string mensaje, Color color, bool esNumerico = false)
    {
        if (tmp == null) return;
        if (esNumerico) AplicarFuenteNumerica(tmp);
        else AplicarFuenteTexto(tmp, false);
        tmp.text = mensaje.ToLowerInvariant();
        tmp.color = color;
        tmp.gameObject.SetActive(true);
        tmp.transform.localScale = Vector3.one;
    }

    private void AplicarEstiloATodosLosTextos()
    {
        if (root == null) return;
        TextMeshProUGUI[] textos = root.GetComponentsInChildren<TextMeshProUGUI>(true);
        foreach (TextMeshProUGUI tmp in textos)
        {
            bool contieneDigitos = Regex.IsMatch(tmp.text, @"\d");
            if (contieneDigitos)
                AplicarFuenteNumerica(tmp);
            else
                AplicarFuenteTexto(tmp, false);
            tmp.text = tmp.text.ToLowerInvariant();
            tmp.enableAutoSizing = true;
            tmp.textWrappingMode = TextWrappingModes.Normal;
            tmp.overflowMode = TextOverflowModes.Ellipsis;
        }
    }

    private void AplicarFuenteTexto(TextMeshProUGUI tmp, bool forzarNumeros = false)
    {
        if (tmp == null) return;
        ConfigurarFallbackNumerico();
        if (forzarNumeros && fuenteNumeros != null)
            tmp.font = fuenteNumeros;
        else if (fuenteNeo != null)
            tmp.font = fuenteNeo;
        else if (fuenteNumeros != null)
            tmp.font = fuenteNumeros;
    }

    private void AplicarFuenteNumerica(TextMeshProUGUI tmp)
    {
        if (tmp == null) return;
        if (fuenteNumeros != null)
            tmp.font = fuenteNumeros;
        else if (fuenteNeo != null)
            tmp.font = fuenteNeo;
    }

    private void ConfigurarFallbackNumerico()
    {
        if (fuenteNeo == null || fuenteNumeros == null) return;
        if (!fuenteNeo.fallbackFontAssetTable.Contains(fuenteNumeros))
            fuenteNeo.fallbackFontAssetTable.Add(fuenteNumeros);
    }

    // Métodos auxiliares de RectTransform
    private RectTransform GetOrCreateRect(RectTransform parent, string nombre)
    {
        Transform existing = parent.Find(nombre);
        if (existing != null)
        {
            RectTransform existingRect = existing.GetComponent<RectTransform>();
            if (existingRect != null) return existingRect;
        }
        GameObject go = new GameObject(nombre, typeof(RectTransform));
        go.transform.SetParent(parent, false);
        return go.GetComponent<RectTransform>();
    }

    private Image ObtenerImage(GameObject go, Color color)
    {
        Image image = go.GetComponent<Image>();
        if (image == null) image = go.AddComponent<Image>();
        image.color = color;
        image.raycastTarget = color.a > 0.2f;
        return image;
    }

    private void ConfigurarPanelBase(GameObject panel, Color color, bool visible)
    {
        if (panel == null) return;
        Image image = panel.GetComponent<Image>();
        if (visible)
        {
            if (image == null) image = panel.AddComponent<Image>();
            image.color = color;
            image.raycastTarget = false;
        }
        else if (image != null)
        {
            image.color = Color.clear;
            image.raycastTarget = false;
        }
    }

    private void ConfigurarRect(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax, Vector2 anchoredPosition, Vector2 sizeDelta)
    {
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.anchoredPosition = anchoredPosition;
        rect.sizeDelta = sizeDelta;
        bool estiradoEnX = !Mathf.Approximately(anchorMin.x, anchorMax.x);
        bool estiradoEnY = !Mathf.Approximately(anchorMin.y, anchorMax.y);
        if (estiradoEnX && estiradoEnY && sizeDelta == Vector2.zero && anchoredPosition == Vector2.zero)
        {
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }

    private void Estirar(RectTransform rect)
    {
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = Vector2.zero;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
    }
}
