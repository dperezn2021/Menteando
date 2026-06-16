using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UIReflejosCruzados : MonoBehaviour
{
    private const string RootName = "ReflejosCruzadosLayout";

    [Header("Referencias")]
    public ReflejosCruzadosGame juego;

    [Header("Assets editables")]
    public TMP_FontAsset fuenteTextos;
    public Sprite fondoJuego;
    public Sprite fondoHUD;

    [Header("Layout")]
    public float altoHeader = 104f;
    public float altoHUDCompacto = 92f;
    public Color colorHeader = new Color(0f, 0f, 0f, 0.55f);
    public Color colorHUDFallback = new Color(0.08f, 0.13f, 0.16f, 0.72f);
    public Color colorFeedbackAcierto = new Color(0.22f, 0.78f, 0.45f, 1f);
    public Color colorFeedbackError = new Color(0.9f, 0.28f, 0.28f, 1f);
    public Color colorFondoFeedback = new Color(1f, 0.9137255f, 0.7215686f, 0.92f);
    public Color colorFondoCambioRegla = new Color(0.5254902f, 0.1843137f, 0.2039216f, 0.94f);

    [Header("Layout generado")]
    [HideInInspector]
    public RectTransform raizLayout;
    [HideInInspector]
    public RectTransform headerNorma;
    [HideInInspector]
    public RectTransform panelHUD;
    [HideInInspector]
    public RectTransform zonaJuego;
    [HideInInspector]
    public Image imagenFondo;
    [HideInInspector]
    public Image imagenHUD;
    [HideInInspector]
    public TextMeshProUGUI textoNorma;
    [HideInInspector]
    public TextMeshProUGUI textoNivel;
    [HideInInspector]
    public TextMeshProUGUI textoTiempo;
    [HideInInspector]
    public TextMeshProUGUI textoAciertos;
    [HideInInspector]
    public TextMeshProUGUI textoFallos;
    [HideInInspector]
    public TextMeshProUGUI textoRacha;
    [HideInInspector]
    public Image fondoFeedback;
    [HideInInspector]
    public TextMeshProUGUI textoFeedback;
    [HideInInspector]
    public Image fondoAlertaRegla;
    [HideInInspector]
    public TextMeshProUGUI textoAlertaRegla;

    private ReflejosCruzadosGame juegoSuscrito;
    private Coroutine feedbackRoutine;
    private Coroutine alertaRoutine;
    private bool layoutCompacto;

    public RectTransform ZonaJuego => zonaJuego;

    private void Awake()
    {
        CachearJuego();
    }

    private void Start()
    {
        CachearJuego();
    }

    private void Update()
    {
        ActualizarEstado();
    }

    public void Preparar(ReflejosCruzadosGame nuevoJuego)
    {
        if (nuevoJuego != null)
            juego = nuevoJuego;

        CachearJuego();
        CrearLayout();
        SuscribirEventos();
        ActualizarNorma(juego != null ? juego.TextoRegla : "NORMA: TOCA VERDES");
        ActualizarEstado();
    }

    public void ActualizarNorma(string norma)
    {
        SetText(textoNorma, norma);
    }

    public void ActualizarEstado()
    {
        if (juego == null)
            return;

        int segundos = Mathf.Max(0, Mathf.CeilToInt(juego.TiempoRestante));
        SetText(textoNivel, $"NIVEL {juego.NivelActual}");
        SetText(textoTiempo, $"TIEMPO {segundos / 60:00}:{segundos % 60:00}");
        SetText(textoAciertos, $"ACIERTOS {juego.Aciertos}");
        SetText(textoFallos, $"FALLOS {juego.Fallos}");
        SetText(textoRacha, $"RACHA {juego.RachaActual}");
    }

    public void MostrarFeedback(string mensaje, bool acierto)
    {
        if (textoFeedback == null)
            return;

        if (feedbackRoutine != null)
            StopCoroutine(feedbackRoutine);

        feedbackRoutine = StartCoroutine(FeedbackRoutine(mensaje, acierto));
    }

    public void MostrarReglaInvertida(string mensaje)
    {
        if (textoAlertaRegla == null)
            return;

        if (alertaRoutine != null)
            StopCoroutine(alertaRoutine);

        alertaRoutine = StartCoroutine(AlertaReglaRoutine(mensaje));
    }

    private IEnumerator FeedbackRoutine(string mensaje, bool acierto)
    {
        if (fondoFeedback != null)
        {
            fondoFeedback.gameObject.SetActive(true);
            fondoFeedback.color = colorFondoFeedback;
        }

        textoFeedback.gameObject.SetActive(true);
        textoFeedback.text = mensaje;
        textoFeedback.color = acierto ? colorFeedbackAcierto : colorFeedbackError;

        float duracion = 0.85f;
        float t = 0f;

        while (t < duracion)
        {
            t += Time.deltaTime;
            Color color = textoFeedback.color;
            color.a = Mathf.Lerp(1f, 0f, t / duracion);
            textoFeedback.color = color;

            if (fondoFeedback != null)
            {
                Color fondo = fondoFeedback.color;
                fondo.a = Mathf.Lerp(colorFondoFeedback.a, 0f, t / duracion);
                fondoFeedback.color = fondo;
            }

            yield return null;
        }

        textoFeedback.gameObject.SetActive(false);
        if (fondoFeedback != null)
            fondoFeedback.gameObject.SetActive(false);

        feedbackRoutine = null;
    }

    private IEnumerator AlertaReglaRoutine(string mensaje)
    {
        if (fondoAlertaRegla != null)
        {
            fondoAlertaRegla.gameObject.SetActive(true);
            fondoAlertaRegla.color = colorFondoCambioRegla;
        }

        textoAlertaRegla.gameObject.SetActive(true);
        textoAlertaRegla.text = string.IsNullOrEmpty(mensaje) ? "REGLA CAMBIADA" : mensaje;
        textoAlertaRegla.color = new Color(1f, 0.84f, 0.28f, 1f);

        float duracion = 2.2f;
        float t = 0f;

        while (t < duracion)
        {
            t += Time.deltaTime;
            Color color = textoAlertaRegla.color;
            color.a = Mathf.Lerp(1f, 0f, Mathf.Clamp01((t - 1.4f) / 0.8f));
            textoAlertaRegla.color = color;

            if (fondoAlertaRegla != null)
            {
                Color fondo = fondoAlertaRegla.color;
                fondo.a = Mathf.Lerp(colorFondoCambioRegla.a, 0f, Mathf.Clamp01((t - 1.4f) / 0.8f));
                fondoAlertaRegla.color = fondo;
            }

            yield return null;
        }

        textoAlertaRegla.gameObject.SetActive(false);
        if (fondoAlertaRegla != null)
            fondoAlertaRegla.gameObject.SetActive(false);

        Color final = textoAlertaRegla.color;
        final.a = 1f;
        textoAlertaRegla.color = final;
        alertaRoutine = null;
    }

    private void CrearLayout()
    {
        Transform parent = ResolverPadrePartida();
        if (parent == null)
            return;

        Button pausa = ObtenerBotonPausa();
        Transform oldRoot = parent.Find(RootName);
        if (oldRoot != null)
        {
            if (pausa != null && pausa.transform.IsChildOf(oldRoot))
                pausa.transform.SetParent(parent, false);

            oldRoot.gameObject.SetActive(false);
            Destroy(oldRoot.gameObject);
        }

        OcultarHijosPartida(parent, pausa != null ? pausa.transform : null);

        GameObject rootObject = new GameObject(RootName, typeof(RectTransform));
        rootObject.transform.SetParent(parent, false);
        raizLayout = rootObject.GetComponent<RectTransform>();
        SetRect(raizLayout, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        RuntimeMiniGameUI.EnsureSafeAreaIfNeeded(raizLayout);
        layoutCompacto = DebeUsarLayoutCompacto();

        CrearFondo();
        CrearHeader(pausa);
        CrearHUD();
        CrearZonaJuego();
        CrearFeedback();

        AplicarFuente();
        Canvas.ForceUpdateCanvases();
    }

    private void CrearFondo()
    {
        imagenFondo = CrearImagen("FondoJuego", raizLayout, Color.white);
        SetRect(imagenFondo.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        imagenFondo.sprite = fondoJuego;
        imagenFondo.preserveAspect = false;
        imagenFondo.raycastTarget = false;
        imagenFondo.color = fondoJuego != null ? Color.white : RuntimeMiniGameUI.Background;
    }

    private void CrearHeader(Button pausa)
    {
        Image headerImage = CrearImagen("HeaderNorma", raizLayout, colorHeader);
        headerNorma = headerImage.rectTransform;
        SetRect(headerNorma, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, -altoHeader), Vector2.zero);
        headerImage.raycastTarget = false;

        float tamanoNorma = layoutCompacto ? 44f : 58f;
        textoNorma = CrearTexto("TextoNorma", headerNorma, "NORMA: TOCA VERDES", tamanoNorma, Color.white, TextAlignmentOptions.Center);
        SetRect(textoNorma.rectTransform, Vector2.zero, Vector2.one, new Vector2(24f, 8f), new Vector2(-190f, -8f));

        ReubicarBotonPausa(pausa);
    }

    private void CrearHUD()
    {
        imagenHUD = CrearImagen("PanelHUD", raizLayout, colorHUDFallback);
        panelHUD = imagenHUD.rectTransform;
        if (layoutCompacto)
        {
            SetRect(panelHUD, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(18f, 22f), new Vector2(-18f, 22f + altoHUDCompacto));
            HorizontalLayoutGroup layout = panelHUD.gameObject.AddComponent<HorizontalLayoutGroup>();
            layout.padding = new RectOffset(8, 8, 6, 6);
            layout.spacing = 6f;
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.childControlWidth = true;
            layout.childControlHeight = true;
            layout.childForceExpandWidth = true;
            layout.childForceExpandHeight = true;
        }
        else
        {
            SetRect(panelHUD, new Vector2(0f, 0f), new Vector2(0.4f, 1f), new Vector2(18f, 22f), new Vector2(-10f, -altoHeader - 18f));
        }
        imagenHUD.sprite = fondoHUD;
        imagenHUD.preserveAspect = false;
        imagenHUD.raycastTarget = false;
        imagenHUD.color = fondoHUD != null ? Color.white : colorHUDFallback;

        textoNivel = CrearLineaHUD("Nivel", "NIVEL 1", 0);
        textoTiempo = CrearLineaHUD("Tiempo", "TIEMPO 00:00", 1);
        textoAciertos = CrearLineaHUD("Aciertos", "ACIERTOS 0", 2);
        textoFallos = CrearLineaHUD("Fallos", "FALLOS 0", 3);
        textoRacha = CrearLineaHUD("Racha", "RACHA 0", 4);
    }

    private void CrearZonaJuego()
    {
        GameObject zonaObject = new GameObject("ZonaJuego", typeof(RectTransform), typeof(RectMask2D));
        zonaObject.transform.SetParent(raizLayout, false);
        zonaJuego = zonaObject.GetComponent<RectTransform>();
        if (layoutCompacto)
            SetRect(zonaJuego, Vector2.zero, Vector2.one, new Vector2(18f, altoHUDCompacto + 38f), new Vector2(-18f, -altoHeader - 18f));
        else
            SetRect(zonaJuego, new Vector2(0.4f, 0f), new Vector2(1f, 1f), new Vector2(12f, 22f), new Vector2(-24f, -altoHeader - 18f));
    }

    private void CrearFeedback()
    {
        fondoFeedback = CrearImagen("FondoFeedback", raizLayout, colorFondoFeedback);
        if (layoutCompacto)
            SetRect(fondoFeedback.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(54f, altoHUDCompacto + 28f), new Vector2(-54f, altoHUDCompacto + 92f));
        else
            SetRect(fondoFeedback.rectTransform, new Vector2(0.4f, 0f), new Vector2(1f, 0f), new Vector2(54f, 18f), new Vector2(-66f, 92f));
        fondoFeedback.gameObject.SetActive(false);

        textoFeedback = CrearTexto("Feedback", raizLayout, "", 34f, colorFeedbackAcierto, TextAlignmentOptions.Center);
        if (layoutCompacto)
            SetRect(textoFeedback.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(24f, altoHUDCompacto + 34f), new Vector2(-24f, altoHUDCompacto + 84f));
        else
            SetRect(textoFeedback.rectTransform, new Vector2(0.4f, 0f), new Vector2(1f, 0f), new Vector2(12f, 24f), new Vector2(-24f, 84f));
        textoFeedback.gameObject.SetActive(false);

        fondoAlertaRegla = CrearImagen("FondoAlertaRegla", zonaJuego, colorFondoCambioRegla);
        SetRect(fondoAlertaRegla.rectTransform, new Vector2(0.02f, 0.18f), new Vector2(0.98f, 0.82f), Vector2.zero, Vector2.zero);
        fondoAlertaRegla.gameObject.SetActive(false);

        textoAlertaRegla = CrearTexto("AlertaRegla", zonaJuego, "", 86f, new Color(1f, 0.84f, 0.28f, 1f), TextAlignmentOptions.Center);
        SetRect(textoAlertaRegla.rectTransform, new Vector2(0.05f, 0.24f), new Vector2(0.95f, 0.76f), new Vector2(10f, 8f), new Vector2(-10f, -8f));
        textoAlertaRegla.gameObject.SetActive(false);
    }

    private TextMeshProUGUI CrearLineaHUD(string name, string value, int index)
    {
        float tamano = layoutCompacto ? 30f : 42f;
        TextMeshProUGUI text = CrearTexto(name, panelHUD, value, tamano, Color.white, TextAlignmentOptions.Center);
        if (layoutCompacto)
        {
            LayoutElement layout = text.gameObject.AddComponent<LayoutElement>();
            layout.minWidth = 92f;
            layout.flexibleWidth = 1f;
            layout.flexibleHeight = 1f;
            SetRect(text.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            return text;
        }

        float top = -272f - index * 72f;
        SetRect(text.rectTransform, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(24f, top - 68f), new Vector2(-24f, top));
        return text;
    }

    private Image CrearImagen(string name, Transform parent, Color color)
    {
        GameObject imageObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        imageObject.transform.SetParent(parent, false);

        Image image = imageObject.GetComponent<Image>();
        image.color = color;
        image.raycastTarget = false;
        return image;
    }

    private TextMeshProUGUI CrearTexto(string name, Transform parent, string value, float size, Color color, TextAlignmentOptions alignment)
    {
        GameObject textObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
        textObject.transform.SetParent(parent, false);

        TextMeshProUGUI text = textObject.GetComponent<TextMeshProUGUI>();
        text.text = value;
        text.fontSize = size;
        text.fontSizeMin = Mathf.Max(12f, size * 0.55f);
        text.fontSizeMax = size;
        text.enableAutoSizing = true;
        text.color = color;
        text.alignment = alignment;
        text.textWrappingMode = TextWrappingModes.Normal;
        text.raycastTarget = false;
        return text;
    }

    private void ReubicarBotonPausa(Button pausa)
    {
        if (pausa == null || headerNorma == null)
            return;

        pausa.gameObject.SetActive(true);
        pausa.transform.SetParent(headerNorma, false);

        RectTransform rect = pausa.GetComponent<RectTransform>();
        if (rect == null)
            return;

        rect.anchorMin = new Vector2(1f, 0.5f);
        rect.anchorMax = new Vector2(1f, 0.5f);
        rect.pivot = new Vector2(1f, 0.5f);
        rect.sizeDelta = layoutCompacto ? new Vector2(160f, 54f) : new Vector2(220f, 58f);
        rect.anchoredPosition = new Vector2(layoutCompacto ? -14f : -22f, 0f);
        pausa.transform.SetAsLastSibling();
    }

    private bool DebeUsarLayoutCompacto()
    {
        if (Screen.width <= 0 || Screen.height <= 0)
            return false;

        return Screen.width < Screen.height || Mathf.Min(Screen.width, Screen.height) < 900;
    }

    private void CachearJuego()
    {
        if (juego == null)
            juego = GetComponent<ReflejosCruzadosGame>();

        if (juego == null)
            juego = FindFirstObjectByType<ReflejosCruzadosGame>(FindObjectsInactive.Include);

        if (juego != null && juego.uiReflejosCruzados == null)
            juego.uiReflejosCruzados = this;
    }

    private void SuscribirEventos()
    {
        DesuscribirEventos();
        juegoSuscrito = juego;

        if (juegoSuscrito == null)
            return;

        juegoSuscrito.OnEstadoActualizado += ActualizarEstado;
        juegoSuscrito.OnReglaActualizada += ActualizarNorma;
        juegoSuscrito.OnFeedback += MostrarFeedback;
        juegoSuscrito.OnReglaInvertida += MostrarReglaInvertida;
    }

    private void DesuscribirEventos()
    {
        if (juegoSuscrito == null)
            return;

        juegoSuscrito.OnEstadoActualizado -= ActualizarEstado;
        juegoSuscrito.OnReglaActualizada -= ActualizarNorma;
        juegoSuscrito.OnFeedback -= MostrarFeedback;
        juegoSuscrito.OnReglaInvertida -= MostrarReglaInvertida;
        juegoSuscrito = null;
    }

    private void AplicarFuente()
    {
        if (fuenteTextos == null || raizLayout == null)
            return;

        TMP_Text[] textos = raizLayout.GetComponentsInChildren<TMP_Text>(true);
        for (int i = 0; i < textos.Length; i++)
            textos[i].font = fuenteTextos;
    }

    private Transform ResolverPadrePartida()
    {
        if (UIManager.Instance != null && UIManager.Instance.UIPartida != null)
            return UIManager.Instance.UIPartida.transform;

        Canvas canvas = FindFirstObjectByType<Canvas>(FindObjectsInactive.Include);
        return canvas != null ? canvas.transform : transform;
    }

    private Button ObtenerBotonPausa()
    {
        return UIManager.Instance != null ? UIManager.Instance.botonPausa : null;
    }

    private void OcultarHijosPartida(Transform parent, Transform pausa)
    {
        for (int i = 0; i < parent.childCount; i++)
        {
            Transform child = parent.GetChild(i);
            if (child == pausa)
                continue;

            if (child.name == RootName)
                continue;

            child.gameObject.SetActive(false);
        }
    }

    private void SetText(TextMeshProUGUI text, string value)
    {
        if (text != null)
            text.text = value;
    }

    private static void SetRect(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
    {
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = offsetMin;
        rect.offsetMax = offsetMax;
    }

    private void OnDestroy()
    {
        DesuscribirEventos();
    }
}
