using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UICambioDeReglas : MonoBehaviour
{
    [Header("Referencias")]
    public CambioDeReglasGame juego;

    [Header("Assets editables")]
    public TMP_FontAsset fuenteTextos;
    public Sprite fondoJuego;
    public Sprite fondoHUD;

    [Header("Layout")]
    public float altoHeader = 104f;
    public Color colorHeader = new Color(0.04f, 0.06f, 0.08f, 0.92f);
    public Color colorHUDFallback = new Color(0.08f, 0.13f, 0.16f, 0.88f);
    public Color colorZonaJuego = new Color(1f, 1f, 1f, 0.05f);
    public Color colorFeedbackAcierto = new Color(0.22f, 0.78f, 0.45f, 1f);
    public Color colorFeedbackError = new Color(0.9f, 0.28f, 0.28f, 1f);

    // Elementos de UI (se crearán dinámicamente)
    public RectTransform zonaJuego { get; private set; }
    public Image barraRegla { get; private set; }
    public Image barraRonda { get; private set; }
    public TextMeshProUGUI textoRegla { get; private set; }
    public TextMeshProUGUI textoNivel { get; private set; }
    public TextMeshProUGUI textoTiempo { get; private set; }
    public TextMeshProUGUI textoAciertos { get; private set; }
    public TextMeshProUGUI textoFallos { get; private set; }
    public TextMeshProUGUI textoRacha { get; private set; }
    public TextMeshProUGUI textoCambios { get; private set; }
    public TextMeshProUGUI textoCambioRegla { get; private set; }

    private CambioDeReglasGame juegoSuscrito;
    private Coroutine feedbackRoutine;
    private Coroutine cambioRoutine;
    private GameObject panelJuego;
    private Button botonPausa;

    public RectTransform ZonaJuego => zonaJuego;

    private void Awake() => CachearJuego();
    private void Start() => CachearJuego();

    private void Update() => ActualizarEstado();

    public void Preparar(CambioDeReglasGame nuevoJuego)
    {
        if (nuevoJuego != null) juego = nuevoJuego;
        CachearJuego();
        CrearUICompleta();
        SuscribirEventos();
        ActualizarRegla(juego?.TextoRegla ?? "NORMA: TOCA VERDE");
        ActualizarEstado();
    }

    public void ActualizarRegla(string regla) => SetText(textoRegla, regla);

    public void ActualizarEstado()
    {
        if (juego == null) return;

        SetText(textoNivel, $"NIVEL {juego.NivelActual}");

        int segundos = Mathf.Max(0, Mathf.CeilToInt(juego.TiempoPartidaRestante));
        SetText(textoTiempo, $"TIEMPO {segundos / 60:00}:{segundos % 60:00}");
        SetText(textoAciertos, $"ACIERTOS {juego.Aciertos}");
        SetText(textoFallos, $"FALLOS {juego.Fallos}");
        SetText(textoRacha, $"RACHA {juego.RachaActual}");
        SetText(textoCambios, $"CAMBIOS {juego.CambiosRegla}");

        if (barraRegla != null)
            barraRegla.fillAmount = Mathf.Clamp01(juego.TiempoReglaRestante / Mathf.Max(0.01f, juego.TiempoReglaTotal));

        if (barraRonda != null)
            barraRonda.fillAmount = Mathf.Clamp01(juego.TiempoRondaRestante / Mathf.Max(0.01f, juego.TiempoRondaTotal));
    }

    public void MostrarFeedback(string mensaje, bool acierto)
    {
        if (feedbackRoutine != null) StopCoroutine(feedbackRoutine);
        feedbackRoutine = StartCoroutine(FeedbackRoutine(mensaje, acierto));
    }

    public void MostrarCambioRegla(string mensaje)
    {
        if (cambioRoutine != null) StopCoroutine(cambioRoutine);
        cambioRoutine = StartCoroutine(CambioReglaRoutine(mensaje));
    }

    private IEnumerator FeedbackRoutine(string mensaje, bool acierto)
    {
        if (textoRegla == null) yield break;

        // Guardar el texto original de la norma
        string originalText = juego?.TextoRegla ?? textoRegla.text;
        Color originalColor = textoRegla.color;

        // Crear un texto de feedback flotante temporal (no modificar la norma)
        GameObject feedbackObj = new GameObject("FeedbackTemp", typeof(RectTransform));
        feedbackObj.transform.SetParent(zonaJuego, false);
        TextMeshProUGUI feedbackText = feedbackObj.AddComponent<TextMeshProUGUI>();
        feedbackText.text = mensaje;
        feedbackText.fontSize = 48;
        feedbackText.alignment = TextAlignmentOptions.Center;
        feedbackText.color = acierto ? colorFeedbackAcierto : colorFeedbackError;
        feedbackText.font = fuenteTextos;

        // Posicionar cerca del centro de la zona de juego
        RectTransform feedbackRect = feedbackObj.GetComponent<RectTransform>();
        feedbackRect.anchorMin = new Vector2(0.3f, 0.45f);
        feedbackRect.anchorMax = new Vector2(0.7f, 0.55f);
        feedbackRect.offsetMin = Vector2.zero;
        feedbackRect.offsetMax = Vector2.zero;

        // Animar y destruir
        float duration = 1.2f;
        float elapsed = 0f;
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            Color c = feedbackText.color;
            c.a = Mathf.Lerp(1f, 0f, t);
            feedbackText.color = c;

            // Escala de pop
            float scale = 1f + Mathf.Sin(t * Mathf.PI) * 0.5f;
            feedbackRect.localScale = Vector3.one * scale;
            yield return null;
        }

        Destroy(feedbackObj);
        feedbackRoutine = null;
    }
    private IEnumerator CambioReglaRoutine(string mensaje)
    {
        if (textoCambioRegla == null) yield break;

        textoCambioRegla.gameObject.SetActive(true);
        textoCambioRegla.text = string.IsNullOrEmpty(mensaje) ? "REGLA CAMBIADA" : mensaje;
        textoCambioRegla.color = Color.white;

        float duracion = 1.65f;
        float t = 0f;
        while (t < duracion)
        {
            t += Time.deltaTime;
            float fade = Mathf.Clamp01((t - 0.95f) / 0.7f);
            Color c = textoCambioRegla.color;
            c.a = Mathf.Lerp(1f, 0f, fade);
            textoCambioRegla.color = c;
            yield return null;
        }

        textoCambioRegla.gameObject.SetActive(false);
        cambioRoutine = null;
    }

    private void CrearUICompleta()
    {
        Transform parent = ObtenerCanvasPadre();
        if (parent == null) return;

        // Destruir UI anterior si existe
        if (panelJuego != null) Destroy(panelJuego);

        // Crear panel principal
        panelJuego = new GameObject("PanelJuego", typeof(RectTransform));
        panelJuego.transform.SetParent(parent, false);
        RectTransform panelRect = panelJuego.GetComponent<RectTransform>();
        panelRect.anchorMin = Vector2.zero;
        panelRect.anchorMax = Vector2.one;
        panelRect.offsetMin = Vector2.zero;
        panelRect.offsetMax = Vector2.zero;

        // Fondo
        Image fondo = panelJuego.AddComponent<Image>();
        fondo.sprite = fondoJuego;
        fondo.color = fondoJuego != null ? Color.white : new Color(0.1f, 0.1f, 0.15f);
        fondo.raycastTarget = false;

        // Zona de juego (centro)
        GameObject zonaObj = new GameObject("ZonaJuego", typeof(RectTransform));
        zonaObj.transform.SetParent(panelJuego.transform, false);
        zonaJuego = zonaObj.GetComponent<RectTransform>();
        zonaJuego.anchorMin = new Vector2(0.22f, 0f);
        zonaJuego.anchorMax = new Vector2(1f, 1f);
        zonaJuego.offsetMin = new Vector2(12f, 22f);
        zonaJuego.offsetMax = new Vector2(-24f, -altoHeader - 18f);

        Image zonaBg = zonaObj.AddComponent<Image>();
        zonaBg.color = colorZonaJuego;
        zonaBg.raycastTarget = false;

        // Panel HUD izquierdo
        GameObject hudObj = new GameObject("PanelHUD", typeof(RectTransform));
        hudObj.transform.SetParent(panelJuego.transform, false);
        RectTransform hudRect = hudObj.GetComponent<RectTransform>();
        hudRect.anchorMin = new Vector2(0f, 0f);
        hudRect.anchorMax = new Vector2(0.22f, 1f);
        hudRect.offsetMin = new Vector2(18f, 22f);
        hudRect.offsetMax = new Vector2(-10f, -altoHeader - 18f);

        Image hudBg = hudObj.AddComponent<Image>();
        hudBg.sprite = fondoHUD;
        hudBg.color = fondoHUD != null ? Color.white : colorHUDFallback;
        hudBg.raycastTarget = false;

        // Header (barra superior)
        GameObject headerObj = new GameObject("Header", typeof(RectTransform));
        headerObj.transform.SetParent(panelJuego.transform, false);
        RectTransform headerRect = headerObj.GetComponent<RectTransform>();
        headerRect.anchorMin = new Vector2(0f, 1f);
        headerRect.anchorMax = new Vector2(1f, 1f);
        headerRect.offsetMin = new Vector2(0f, -altoHeader);
        headerRect.offsetMax = Vector2.zero;

        Image headerBg = headerObj.AddComponent<Image>();
        headerBg.color = colorHeader;
        headerBg.raycastTarget = false;

        // Texto regla CENTRAL (dentro de zona juego, parte superior)
        GameObject reglaContainer = new GameObject("ReglaContainer", typeof(RectTransform));
        reglaContainer.transform.SetParent(zonaJuego, false);
        RectTransform reglaContainerRect = reglaContainer.GetComponent<RectTransform>();
        reglaContainerRect.anchorMin = new Vector2(0.1f, 0.82f);
        reglaContainerRect.anchorMax = new Vector2(0.9f, 0.95f);
        reglaContainerRect.offsetMin = Vector2.zero;
        reglaContainerRect.offsetMax = Vector2.zero;

        Image reglaBg = reglaContainer.AddComponent<Image>();
        reglaBg.color = new Color(0, 0, 0, 0.7f);

        GameObject textoReglaObj = new GameObject("TextoRegla", typeof(RectTransform));
        textoReglaObj.transform.SetParent(reglaContainer.transform, false);
        textoRegla = textoReglaObj.AddComponent<TextMeshProUGUI>();
        textoRegla.text = "NORMA: ???";
        textoRegla.fontSize = 52;
        textoRegla.alignment = TextAlignmentOptions.Center;
        textoRegla.color = Color.white;
        RectTransform textoReglaRect = textoReglaObj.GetComponent<RectTransform>();
        textoReglaRect.anchorMin = Vector2.zero;
        textoReglaRect.anchorMax = Vector2.one;
        textoReglaRect.offsetMin = Vector2.zero;
        textoReglaRect.offsetMax = Vector2.zero;

        // Textos HUD
        textoNivel = CrearTextoHUD(hudObj.transform, "NIVEL 1", 0);
        textoTiempo = CrearTextoHUD(hudObj.transform, "TIEMPO 00:00", 1);
        textoAciertos = CrearTextoHUD(hudObj.transform, "ACIERTOS 0", 2);
        textoFallos = CrearTextoHUD(hudObj.transform, "FALLOS 0", 3);
        textoRacha = CrearTextoHUD(hudObj.transform, "RACHA 0", 4);
        textoCambios = CrearTextoHUD(hudObj.transform, "CAMBIOS 0", 5);

 

        // Texto cambio regla
        GameObject cambioObj = new GameObject("TextoCambioRegla", typeof(RectTransform));
        cambioObj.transform.SetParent(zonaJuego, false);
        textoCambioRegla = cambioObj.AddComponent<TextMeshProUGUI>();
        textoCambioRegla.fontSize = 72;
        textoCambioRegla.alignment = TextAlignmentOptions.Center;
        textoCambioRegla.color = Color.white;
        RectTransform cambioRect = cambioObj.GetComponent<RectTransform>();
        cambioRect.anchorMin = new Vector2(0.1f, 0.4f);
        cambioRect.anchorMax = new Vector2(0.9f, 0.6f);
        cambioRect.offsetMin = Vector2.zero;
        cambioRect.offsetMax = Vector2.zero;
        cambioObj.SetActive(false);

        // Botón pausa
        ReubicarBotonPausa(headerObj.transform);

        AplicarFuente();
    }

    private TextMeshProUGUI CrearTextoHUD(Transform parent, string texto, int index)
    {
        GameObject obj = new GameObject($"Texto{index}", typeof(RectTransform));
        obj.transform.SetParent(parent, false);
        TextMeshProUGUI text = obj.AddComponent<TextMeshProUGUI>();
        text.text = texto;
        text.fontSize = 38;
        text.alignment = TextAlignmentOptions.Center;
        text.color = Color.white;

        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0f, 1f);
        rect.anchorMax = new Vector2(1f, 1f);
        float top = -160f - index * 66f;
        rect.offsetMin = new Vector2(20f, top - 60f);
        rect.offsetMax = new Vector2(-20f, top);

        return text;
    }

    private void CrearBarra(Transform parent, string nombre, Color color, float posY)
    {
        GameObject track = new GameObject($"{nombre}Track", typeof(RectTransform));
        track.transform.SetParent(parent, false);
        Image trackImg = track.AddComponent<Image>();
        trackImg.color = new Color(1f, 1f, 1f, 0.2f);

        RectTransform trackRect = track.GetComponent<RectTransform>();
        trackRect.anchorMin = new Vector2(0.05f, 0f);
        trackRect.anchorMax = new Vector2(0.95f, 0f);
        trackRect.anchoredPosition = new Vector2(0f, posY);
        trackRect.sizeDelta = new Vector2(0f, 12f);

        GameObject fill = new GameObject($"{nombre}Fill", typeof(RectTransform));
        fill.transform.SetParent(track.transform, false);
        Image fillImg = fill.AddComponent<Image>();
        fillImg.type = Image.Type.Filled;
        fillImg.fillMethod = Image.FillMethod.Horizontal;
        fillImg.fillOrigin = 0;
        fillImg.fillAmount = 1f;
        fillImg.color = color;

        RectTransform fillRect = fill.GetComponent<RectTransform>();
        fillRect.anchorMin = Vector2.zero;
        fillRect.anchorMax = Vector2.one;
        fillRect.offsetMin = Vector2.zero;
        fillRect.offsetMax = Vector2.zero;

        if (nombre == "BarraRegla") barraRegla = fillImg;
        else barraRonda = fillImg;
    }

    private void ReubicarBotonPausa(Transform header)
    {
        botonPausa = UIManager.Instance?.botonPausa;
        if (botonPausa == null) return;

        botonPausa.gameObject.SetActive(true);
        botonPausa.transform.SetParent(header, false);

        RectTransform rect = botonPausa.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(1f, 0.5f);
        rect.anchorMax = new Vector2(1f, 0.5f);
        rect.pivot = new Vector2(1f, 0.5f);
        rect.sizeDelta = new Vector2(190f, 58f);
        rect.anchoredPosition = new Vector2(-22f, 0f);
        botonPausa.transform.SetAsLastSibling();
    }

    private void AplicarFuente()
    {
        if (fuenteTextos == null)
        {
            fuenteTextos = Resources.Load<TMP_FontAsset>("TMP Fonts/LiberationSans SDF");
            if (fuenteTextos == null) return;
        }

        TMP_Text[] textos = panelJuego.GetComponentsInChildren<TMP_Text>(true);
        foreach (var t in textos) t.font = fuenteTextos;
    }

    private Transform ObtenerCanvasPadre()
    {
        if (UIManager.Instance?.UIPartida != null)
            return UIManager.Instance.UIPartida.transform;

        Canvas canvas = FindFirstObjectByType<Canvas>();
        return canvas != null ? canvas.transform : transform;
    }

    private void CachearJuego()
    {
        if (juego == null) juego = GetComponent<CambioDeReglasGame>();
        if (juego == null) juego = FindFirstObjectByType<CambioDeReglasGame>();
        if (juego != null && juego.uiCambioDeReglas == null) juego.uiCambioDeReglas = this;
    }

    private void SuscribirEventos()
    {
        DesuscribirEventos();
        juegoSuscrito = juego;
        if (juegoSuscrito == null) return;

        juegoSuscrito.OnEstadoActualizado += ActualizarEstado;
        juegoSuscrito.OnReglaActualizada += ActualizarRegla;
        juegoSuscrito.OnFeedback += MostrarFeedback;
        juegoSuscrito.OnCambioRegla += MostrarCambioRegla;
    }

    private void DesuscribirEventos()
    {
        if (juegoSuscrito == null) return;
        juegoSuscrito.OnEstadoActualizado -= ActualizarEstado;
        juegoSuscrito.OnReglaActualizada -= ActualizarRegla;
        juegoSuscrito.OnFeedback -= MostrarFeedback;
        juegoSuscrito.OnCambioRegla -= MostrarCambioRegla;
        juegoSuscrito = null;
    }

    private void SetText(TextMeshProUGUI text, string value)
    {
        if (text != null) text.text = value;
    }

    private void OnDestroy()
    {
        DesuscribirEventos();
        if (botonPausa != null && UIManager.Instance?.UIPartida != null)
            botonPausa.transform.SetParent(UIManager.Instance.UIPartida.transform);
    }
}