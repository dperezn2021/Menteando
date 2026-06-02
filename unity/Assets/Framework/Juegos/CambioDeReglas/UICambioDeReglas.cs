using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UICambioDeReglas : MonoBehaviour
{
    [Header("Referencias")]
    public CambioDeReglasGame juego;

    [Header("Zona de juego")]
    public RectTransform zonaJuego;

    [Header("Botones")]
    public Button botonPausa;

    [Header("Textos")]
    public TextMeshProUGUI textoRegla;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoAciertos;
    public TextMeshProUGUI textoFallos;
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoNivel;

    [Header("Feedback")]
    public TMP_FontAsset fuenteTextos;
    public bool usarFuenteTMPPorDefecto = false;
    public int maxFeedbacksActivos = 3;

    public RectTransform ZonaJuego => zonaJuego;

    private CambioDeReglasGame juegoSuscrito;
    private Coroutine cambioRoutine;
    private readonly List<GameObject> feedbacksActivos = new List<GameObject>();

    private void Awake()
    {
        CachearJuego();
    }

    public void Preparar(CambioDeReglasGame nuevoJuego)
    {
        if (nuevoJuego != null)
            juego = nuevoJuego;

        CachearJuego();
        SuscribirEventos();
        AjustarTextosPizarra();
        AplicarFuenteSegura(textoRegla);

        ActualizarRegla(juego != null ? juego.TextoRegla : "NORMA: ???");
        ActualizarEstado();
    }

    public void ActualizarRegla(string regla)
    {
        SetText(textoRegla, string.IsNullOrEmpty(regla) ? "NORMA: ???" : regla);
    }

    public void ActualizarEstado()
    {
        if (juego == null) return;

        SetText(textoNivel, "NIVEL " + juego.NivelActual);

        int segundos = Mathf.Max(0, Mathf.CeilToInt(juego.TiempoPartidaRestante));
        SetText(textoTiempo, string.Format("TIEMPO {0:00}:{1:00}", segundos / 60, segundos % 60));

        SetText(textoAciertos, "ACIERTOS " + juego.Aciertos);
        SetText(textoFallos, "FALLOS " + juego.Fallos);
        SetText(textoRacha, "RACHA " + juego.RachaActual);
    }

    public void MostrarFeedbackFlotante(string mensaje, Vector3 posicionMundo, bool esAcierto)
    {
        if (zonaJuego == null) return;

        LimitarFeedbacksActivos();

        GameObject go = new GameObject("Feedback", typeof(RectTransform), typeof(TextMeshProUGUI));
        go.transform.SetParent(zonaJuego, false);
        feedbacksActivos.Add(go);

        RectTransform rt = go.GetComponent<RectTransform>();
        rt.sizeDelta = new Vector2(280f, 80f);
        rt.localScale = Vector3.one;

        if (posicionMundo == Vector3.zero)
        {
            rt.anchoredPosition = Vector2.zero;
        }
        else
        {
            Vector2 localPoint;
            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                zonaJuego,
                RectTransformUtility.WorldToScreenPoint(null, posicionMundo),
                null,
                out localPoint
            );

            rt.anchoredPosition = localPoint;
        }

        TextMeshProUGUI text = go.GetComponent<TextMeshProUGUI>();
        text.text = NormalizarFeedback(mensaje, esAcierto);
        AplicarFuenteSegura(text);
        text.fontSize = 46f;
        text.enableAutoSizing = false;
        text.alignment = TextAlignmentOptions.Center;
        text.color = esAcierto ? Color.green : Color.red;
        text.raycastTarget = false;
        text.outlineWidth = 0.05f;
        text.outlineColor = Color.black;

        StartCoroutine(AnimarFeedback(go));
    }

    public void MostrarPowerUp(Sprite sprite, string mensaje)
    {
        if (zonaJuego == null)
            return;

        if (sprite == null)
        {
            MostrarFeedbackFlotante(mensaje, Vector3.zero, true);
            return;
        }

        GameObject go = new GameObject("PowerUp", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        go.transform.SetParent(zonaJuego, false);

        RectTransform rt = go.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0.5f, 0.5f);
        rt.anchorMax = new Vector2(0.5f, 0.5f);
        rt.pivot = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = Vector2.zero;
        rt.sizeDelta = new Vector2(130f, 130f);
        rt.localScale = Vector3.one * 0.75f;

        Image image = go.GetComponent<Image>();
        image.sprite = sprite;
        image.preserveAspect = true;
        image.raycastTarget = false;

        StartCoroutine(AnimarPowerUp(go));
    }

    private IEnumerator AnimarFeedback(GameObject go)
    {
        if (go == null) yield break;

        TextMeshProUGUI text = go.GetComponent<TextMeshProUGUI>();
        RectTransform rt = go.GetComponent<RectTransform>();

        if (text == null || rt == null)
        {
            if (go != null) Destroy(go);
            yield break;
        }

        float duracion = 0.65f;
        float tiempo = 0f;

        Vector2 posInicial = rt.anchoredPosition;
        Vector2 posFinal = posInicial + new Vector2(0f, 90f);
        Color colorInicial = text.color;

        while (tiempo < duracion)
        {
            if (go == null || rt == null || text == null)
                yield break;

            tiempo += Time.deltaTime;
            float t = Mathf.Clamp01(tiempo / duracion);

            rt.anchoredPosition = Vector2.Lerp(posInicial, posFinal, t);

            float escala = 1f + Mathf.Sin(t * Mathf.PI) * 0.3f;
            rt.localScale = Vector3.one * escala;

            Color c = colorInicial;
            c.a = Mathf.Lerp(colorInicial.a, 0f, t);
            text.color = c;

            yield return null;
        }

        feedbacksActivos.Remove(go);

        if (go != null)
            Destroy(go);
    }

    private IEnumerator AnimarPowerUp(GameObject go)
    {
        if (go == null) yield break;

        RectTransform rt = go.GetComponent<RectTransform>();
        Image image = go.GetComponent<Image>();

        if (rt == null || image == null)
        {
            if (go != null) Destroy(go);
            yield break;
        }

        float duracion = 0.8f;
        float tiempo = 0f;
        Color colorInicial = image.color;

        while (tiempo < duracion)
        {
            if (go == null || rt == null || image == null)
                yield break;

            tiempo += Time.deltaTime;
            float t = Mathf.Clamp01(tiempo / duracion);

            float escala = 0.75f + Mathf.Sin(t * Mathf.PI) * 0.5f;
            rt.localScale = Vector3.one * escala;

            Color c = colorInicial;
            c.a = Mathf.Lerp(colorInicial.a, 0f, Mathf.Clamp01((t - 0.45f) / 0.55f));
            image.color = c;

            yield return null;
        }

        if (go != null)
            Destroy(go);
    }

    public void MostrarCambioRegla(string mensaje)
    {
        if (textoRegla == null) return;

        if (cambioRoutine != null)
            StopCoroutine(cambioRoutine);

        cambioRoutine = StartCoroutine(CambioReglaRoutine());
    }

    private IEnumerator CambioReglaRoutine()
    {
        if (textoRegla == null) yield break;

        RectTransform rt = textoRegla.rectTransform;
        if (rt == null) yield break;

        Color colorOriginal = textoRegla.color;
        Vector3 escalaOriginal = rt.localScale;

        textoRegla.color = Color.yellow;

        float duracion = 0.35f;
        float tiempo = 0f;

        while (tiempo < duracion)
        {
            if (textoRegla == null || rt == null)
                yield break;

            tiempo += Time.deltaTime;
            float t = Mathf.Clamp01(tiempo / duracion);

            float escala = 1f + Mathf.Sin(t * Mathf.PI) * 0.25f;
            rt.localScale = escalaOriginal * escala;

            yield return null;
        }

        if (textoRegla != null)
            textoRegla.color = colorOriginal;

        if (rt != null)
            rt.localScale = escalaOriginal;

        cambioRoutine = null;
    }

    private void CachearJuego()
    {
        if (juego == null)
            juego = GetComponent<CambioDeReglasGame>();

        if (juego == null)
            juego = FindFirstObjectByType<CambioDeReglasGame>();

        if (juego != null && juego.uiCambioDeReglas == null)
            juego.uiCambioDeReglas = this;
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
        if (text == null)
            return;

        AplicarFuenteSegura(text);

        if (text.text != value)
            text.text = value;
    }

    private void AplicarFuenteSegura(TextMeshProUGUI text)
    {
        if (text == null) return;

        // 🔥 FORZAR a usar TU fuente siempre
        TMP_FontAsset fuente = fuenteTextos;

        // Solo si no tienes tu fuente, usa la por defecto
        if (fuente == null && TMP_Settings.defaultFontAsset != null)
            fuente = TMP_Settings.defaultFontAsset;

        if (fuente != null)
        {
            text.font = fuente;
            if (fuente.material != null)
                text.fontSharedMaterial = fuente.material;
        }

        text.richText = false;
        text.isRightToLeftText = false;
        text.fontStyle = FontStyles.Normal;
    }
    private Transform ObtenerPadrePizarra()
    {
        if (textoTiempo != null)
            return textoTiempo.transform.parent;
        if (textoNivel != null)
            return textoNivel.transform.parent;
        if (textoAciertos != null)
            return textoAciertos.transform.parent;
        if (textoFallos != null)
            return textoFallos.transform.parent;
        if (textoRacha != null)
            return textoRacha.transform.parent;

        return null;
    }

    private void AjustarTextosPizarra()
    {
        RectTransform parent = ObtenerPadrePizarra() as RectTransform;
        if (parent != null)
        {
            bool compacto = Screen.width > 0 && Screen.height > 0 && Screen.width < Screen.height;
            parent.anchorMin = compacto ? new Vector2(0.08f, 0.12f) : new Vector2(0.15f, 0.15f);
            parent.anchorMax = compacto ? new Vector2(0.92f, 0.50f) : new Vector2(0.85f, 0.47f);
            parent.anchoredPosition = Vector2.zero;
            parent.sizeDelta = Vector2.zero;

            VerticalLayoutGroup layout = parent.GetComponent<VerticalLayoutGroup>();
            if (layout != null)
                layout.spacing = 0f;
        }

        TextMeshProUGUI[] textos =
        {
            textoTiempo,
            textoRacha,
            textoAciertos,
            textoFallos,
            textoNivel
        };

        foreach (TextMeshProUGUI text in textos)
            AjustarTextoPizarra(text);
    }

    private void AjustarTextoPizarra(TextMeshProUGUI text)
    {
        if (text == null)
            return;

        RectTransform rect = text.rectTransform;
        float anchoDisponible = rect != null && rect.parent is RectTransform parent
            ? Mathf.Max(220f, parent.rect.width * 0.92f)
            : 340f;
        bool compacto = Screen.width > 0 && Screen.height > 0 && Screen.width < Screen.height;
        if (rect != null)
            rect.sizeDelta = new Vector2(Mathf.Min(340f, anchoDisponible), compacto ? 38f : 44f);

        AplicarFuenteSegura(text);
        text.fontSize = compacto ? 34f : 40f;
        text.enableAutoSizing = true;
        text.fontSizeMin = compacto ? 16f : 20f;
        text.fontSizeMax = compacto ? 34f : 40f;
        text.textWrappingMode = TextWrappingModes.Normal;
        text.raycastTarget = false;
    }

    private string NormalizarFeedback(string mensaje, bool esAcierto)
    {
        if (string.IsNullOrWhiteSpace(mensaje))
            return esAcierto ? "BIEN" : "MAL";

        string limpio = mensaje.Trim().ToUpperInvariant();

        if (limpio.Contains("INCORRECTO") || limpio.Contains("ERROR"))
            return "MAL";
        if (limpio.Contains("CORRECTO"))
            return "BIEN";
        if (limpio.Contains("TIEMPO") && !limpio.Contains("+"))
            return "TIEMPO";

        return limpio;
    }

    private void LimitarFeedbacksActivos()
    {
        for (int i = feedbacksActivos.Count - 1; i >= 0; i--)
        {
            if (feedbacksActivos[i] == null)
                feedbacksActivos.RemoveAt(i);
        }

        while (feedbacksActivos.Count >= maxFeedbacksActivos)
        {
            GameObject viejo = feedbacksActivos[0];
            feedbacksActivos.RemoveAt(0);

            if (viejo != null)
                Destroy(viejo);
        }
    }

    private void LimpiarFeedbacks()
    {
        foreach (GameObject fb in feedbacksActivos)
        {
            if (fb != null)
                Destroy(fb);
        }

        feedbacksActivos.Clear();
    }

    private void OnDestroy()
    {
        DesuscribirEventos();

        if (cambioRoutine != null)
            StopCoroutine(cambioRoutine);

        LimpiarFeedbacks();
    }
}
