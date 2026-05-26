using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UICambioDeReglas : MonoBehaviour
{
    [Header("Referencias")]
    public CambioDeReglasGame juego;

    [Header("Assets")]
    public TMP_FontAsset fuenteTextos;
    public Sprite fondoJuego;
    public Sprite fondoHUD;

    [Header("Colores")]
    public float altoHeader = 104f;
    public Color colorHeader = new Color(0.04f, 0.06f, 0.08f, 0.92f);
    public Color colorHUDFallback = new Color(0.08f, 0.13f, 0.16f, 0.88f);
    public Color colorZonaJuego = new Color(1f, 1f, 1f, 0.05f);

    // Elementos UI
    public RectTransform zonaJuego { get; private set; }
    public TextMeshProUGUI textoRegla { get; private set; }
    public TextMeshProUGUI textoNivel { get; private set; }
    public TextMeshProUGUI textoTiempo { get; private set; }
    public TextMeshProUGUI textoAciertos { get; private set; }
    public TextMeshProUGUI textoFallos { get; private set; }
    public TextMeshProUGUI textoRacha { get; private set; }
    public TextMeshProUGUI textoCambios { get; private set; }

    private CambioDeReglasGame juegoSuscrito;
    private Coroutine cambioRoutine;
    private GameObject panelJuego;
    private Button botonPausa;
    private List<GameObject> feedbacksActivos = new List<GameObject>();

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
        ActualizarRegla(juego?.TextoRegla ?? "NORMA: ???");
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
    }

    public void MostrarFeedbackFlotante(string mensaje, Vector3 posicion, bool esAcierto)
    {
        if (zonaJuego == null) return;

        // Limpiar feedbacks viejos
        while (feedbacksActivos.Count >= 3)
        {
            if (feedbacksActivos[0] != null)
                Destroy(feedbacksActivos[0]);
            feedbacksActivos.RemoveAt(0);
        }

        GameObject go = new GameObject("Feedback", typeof(RectTransform));
        go.transform.SetParent(zonaJuego, false);
        feedbacksActivos.Add(go);

        TextMeshProUGUI text = go.AddComponent<TextMeshProUGUI>();
        text.text = mensaje;
        text.fontSize = 42;
        if (fuenteTextos != null) text.font = fuenteTextos;
        text.alignment = TextAlignmentOptions.Center;
        text.color = esAcierto ? Color.green : Color.red;
        text.outlineWidth = 0.2f;
        text.outlineColor = Color.black;

        RectTransform rt = go.GetComponent<RectTransform>();
        rt.position = posicion;
        rt.sizeDelta = new Vector2(200, 70);

        StartCoroutine(AnimarFeedback(go));
    }

    private IEnumerator AnimarFeedback(GameObject go)
    {
        if (go == null) yield break;

        float duracion = 0.7f;
        float tiempo = 0f;
        TextMeshProUGUI text = go.GetComponent<TextMeshProUGUI>();
        RectTransform rt = go.GetComponent<RectTransform>();

        if (text == null || rt == null)
        {
            if (go != null) Destroy(go);
            yield break;
        }

        Vector3 posInicial = rt.position;
        Vector3 posFinal = posInicial + new Vector3(0, 100f, 0);

        while (tiempo < duracion)
        {
            tiempo += Time.deltaTime;
            float t = tiempo / duracion;

            rt.position = Vector3.Lerp(posInicial, posFinal, t);

            float escala = 1f + Mathf.Sin(t * Mathf.PI) * 0.5f;
            rt.localScale = Vector3.one * escala;

            Color c = text.color;
            c.a = Mathf.Lerp(1f, 0f, t);
            text.color = c;

            yield return null;
        }

        feedbacksActivos.Remove(go);
        Destroy(go);
    }

    public void MostrarCambioRegla(string mensaje)
    {
        if (cambioRoutine != null) StopCoroutine(cambioRoutine);
        cambioRoutine = StartCoroutine(CambioReglaRoutine(mensaje));
    }

    private IEnumerator CambioReglaRoutine(string mensaje)
    {
        if (textoRegla == null) yield break;

        Color originalColor = textoRegla.color;
        textoRegla.color = Color.yellow;

        // Animar el texto de la regla
        RectTransform rt = textoRegla.rectTransform;
        Vector3 escalaOriginal = rt.localScale;

        float duracion = 0.3f;
        float tiempo = 0f;

        while (tiempo < duracion)
        {
            tiempo += Time.deltaTime;
            float t = tiempo / duracion;
            float escala = 1f + Mathf.Sin(t * Mathf.PI) * 0.2f;
            rt.localScale = escalaOriginal * escala;
            yield return null;
        }

        rt.localScale = escalaOriginal;
        textoRegla.color = originalColor;
        cambioRoutine = null;
    }

    private void CrearUICompleta()
    {
        Transform parent = ObtenerCanvasPadre();
        if (parent == null) return;

        if (panelJuego != null) Destroy(panelJuego);

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
        fondo.color = fondoJuego != null ? Color.white : new Color(0.08f, 0.08f, 0.12f);
        fondo.raycastTarget = false;

        // Header
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

        // Panel HUD izquierdo
        GameObject hudObj = new GameObject("PanelHUD", typeof(RectTransform));
        hudObj.transform.SetParent(panelJuego.transform, false);
        RectTransform hudRect = hudObj.GetComponent<RectTransform>();
        hudRect.anchorMin = new Vector2(0f, 0f);
        hudRect.anchorMax = new Vector2(0.24f, 1f);
        hudRect.offsetMin = new Vector2(12f, 12f);
        hudRect.offsetMax = new Vector2(-8f, -altoHeader - 12f);

        Image hudBg = hudObj.AddComponent<Image>();
        hudBg.sprite = fondoHUD;
        hudBg.color = fondoHUD != null ? Color.white : colorHUDFallback;
        hudBg.raycastTarget = false;

        // Zona de juego
        GameObject zonaObj = new GameObject("ZonaJuego", typeof(RectTransform));
        zonaObj.transform.SetParent(panelJuego.transform, false);
        zonaJuego = zonaObj.GetComponent<RectTransform>();
        zonaJuego.anchorMin = new Vector2(0.24f, 0f);
        zonaJuego.anchorMax = new Vector2(1f, 1f);
        zonaJuego.offsetMin = new Vector2(8f, 12f);
        zonaJuego.offsetMax = new Vector2(-12f, -altoHeader - 12f);

        Image zonaBg = zonaObj.AddComponent<Image>();
        zonaBg.color = colorZonaJuego;
        zonaBg.raycastTarget = false;

        // Texto regla central
        GameObject reglaObj = new GameObject("TextoRegla", typeof(RectTransform));
        reglaObj.transform.SetParent(zonaJuego, false);
        textoRegla = reglaObj.AddComponent<TextMeshProUGUI>();
        textoRegla.text = "NORMA: ???";
        textoRegla.fontSize = 48;
        textoRegla.alignment = TextAlignmentOptions.Center;
        textoRegla.color = Color.white;

        RectTransform reglaRect = reglaObj.GetComponent<RectTransform>();
        reglaRect.anchorMin = new Vector2(0.05f, 0.85f);
        reglaRect.anchorMax = new Vector2(0.95f, 0.98f);
        reglaRect.offsetMin = Vector2.zero;
        reglaRect.offsetMax = Vector2.zero;

        // Texto HUD
        textoNivel = CrearTextoHUD(hudObj.transform, "NIVEL 1", 0);
        textoTiempo = CrearTextoHUD(hudObj.transform, "TIEMPO 00:00", 1);
        textoAciertos = CrearTextoHUD(hudObj.transform, "ACIERTOS 0", 2);
        textoFallos = CrearTextoHUD(hudObj.transform, "FALLOS 0", 3);
        textoRacha = CrearTextoHUD(hudObj.transform, "RACHA 0", 4);
        textoCambios = CrearTextoHUD(hudObj.transform, "CAMBIOS 0", 5);

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
        text.fontSize = 32;
        text.alignment = TextAlignmentOptions.Center;
        text.color = Color.white;

        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0f, 1f);
        rect.anchorMax = new Vector2(1f, 1f);
        float top = -120f - index * 55f;
        rect.offsetMin = new Vector2(10f, top - 45f);
        rect.offsetMax = new Vector2(-10f, top);

        return text;
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
        rect.sizeDelta = new Vector2(220f, 48f);
        rect.anchoredPosition = new Vector2(-20f, 0f);
        botonPausa.transform.SetAsLastSibling();
    }

    private void AplicarFuente()
    {
        if (fuenteTextos == null) return;
        if (panelJuego == null) return;

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
        juegoSuscrito.OnCambioRegla += MostrarCambioRegla;
    }

    private void DesuscribirEventos()
    {
        if (juegoSuscrito == null) return;
        juegoSuscrito.OnEstadoActualizado -= ActualizarEstado;
        juegoSuscrito.OnReglaActualizada -= ActualizarRegla;
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
        foreach (var fb in feedbacksActivos)
            if (fb != null) Destroy(fb);
    }
}