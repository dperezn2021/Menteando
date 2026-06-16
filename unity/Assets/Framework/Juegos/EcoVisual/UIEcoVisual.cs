using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UIEcoVisual : MonoBehaviour
{
    [Header("Referencias")]
    public EcoVisualGame juego;

    [Header("HUD automatico")]
    public bool crearHUDAutomaticamente = true;
    public bool colocarTextosAsignadosEnHUD = true;
    public RectTransform contenedorHUD;
    public float altoHUD = 74f;
    public Color colorFondoHUD = new Color(0f, 0f, 0f, 0.42f);

    [Header("HUD")]
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;
    public TextMeshProUGUI textoProgreso;
    public TextMeshProUGUI textoPuntuacion;
    public TextMeshProUGUI textoObjetivo;
    public TextMeshProUGUI textoFase;
    public TextMeshProUGUI textoMemorizacion;

    [Header("Barras")]
    public Image barraTiempoPartida;
    public Image barraProgreso;
    public Image barraMemorizacion;

    [Header("Feedback")]
    public Image flashPanel;
    public Color colorAcierto = new Color(0.25f, 0.85f, 0.45f, 1f);
    public Color colorError = new Color(0.95f, 0.25f, 0.25f, 1f);

    private Coroutine flashCoroutine;
    private int ultimoNivel = -1;

    private void Awake()
    {
        CachearReferencias();
        CrearHUDSiNecesario();
        PrepararFlash();
    }

    private void Start()
    {
        CachearReferencias();
        CrearHUDSiNecesario();
        SuscribirEventos();

        ActualizarRacha(juego != null ? juego.RachaActual : 0);
        ActualizarNivel(DifficultyManager.Instance?.nivelActual ?? 1);
        ActualizarProgreso(juego != null ? juego.TotalColocados : 0, juego != null ? juego.TotalObjetos : 0);
        ActualizarPuntuacion(juego != null ? juego.Puntuacion : 0, juego != null ? juego.TotalObjetos * 10 : 0);
        ActualizarObjetivo(juego != null ? juego.ObjetivoRonda : 0, 0);
    }

    private void Update()
    {
        ActualizarTiempoPartida();
        ActualizarNivelDesdeManager();
    }

    public void ActualizarRacha(int racha)
    {
        SetText(textoRacha, $"RACHA: {racha}");
    }

    public void ActualizarNivel(int nivel)
    {
        ultimoNivel = Mathf.Clamp(nivel, 1, 10);
        SetText(textoNivel, $"NIVEL: {ultimoNivel}/10");
    }

    public void ActualizarProgreso(int colocados, int total)
    {
        SetText(textoProgreso, $"OBJETOS: {colocados}/{Mathf.Max(0, total)}");

        if (barraProgreso != null)
            barraProgreso.fillAmount = total > 0 ? Mathf.Clamp01((float)colocados / total) : 0f;
    }

    public void ActualizarPuntuacion(int puntos, int maximo)
    {
        SetText(textoPuntuacion, $"PUNTOS: {puntos}/{Mathf.Max(0, maximo)}");
    }

    public void ActualizarObjetivo(int objetivo, int maximo)
    {
        SetText(textoObjetivo, maximo > 0 ? $"OBJETIVO: {objetivo}/{maximo}" : "OBJETIVO: --");
    }

    public void ActualizarFase(string fase)
    {
        SetText(textoFase, fase);
    }

    public void ActualizarMemorizacion(float restante, float total)
    {
        if (barraMemorizacion != null)
            barraMemorizacion.fillAmount = total > 0f ? Mathf.Clamp01(restante / total) : 0f;

        if (textoMemorizacion != null)
        {
            int segundos = Mathf.Max(0, Mathf.CeilToInt(restante));
            SetText(textoMemorizacion, restante > 0f ? $"MEMORIZA: {segundos:00}" : "");
        }
    }

    public void MostrarFeedback(bool acierto)
    {
        Flash(acierto ? colorAcierto : colorError);
    }

    public void Flash(Color color)
    {
        if (flashPanel == null) return;

        if (flashCoroutine != null)
            StopCoroutine(flashCoroutine);

        flashCoroutine = StartCoroutine(FlashRoutine(color));
    }

    private IEnumerator FlashRoutine(Color color)
    {
        flashPanel.gameObject.SetActive(true);
        color.a = 0.35f;
        flashPanel.color = color;

        float duracion = 0.15f;
        float t = 0f;

        while (t < 1f)
        {
            t += Time.deltaTime / duracion;
            Color c = flashPanel.color;
            c.a = Mathf.Lerp(0.35f, 0f, t);
            flashPanel.color = c;
            yield return null;
        }

        Color final = flashPanel.color;
        final.a = 0f;
        flashPanel.color = final;
        flashPanel.gameObject.SetActive(false);
        flashCoroutine = null;
    }

    private void ActualizarTiempoPartida()
    {
        if (GameManager.Instance == null) return;

        float restante = GameManager.Instance.tiempoRestante;
        int segundos = Mathf.Max(0, Mathf.CeilToInt(restante));

        SetText(textoTiempo, $"TIEMPO: {segundos / 60:00}:{segundos % 60:00}");

        if (barraTiempoPartida != null && GameManager.Instance.duracionPartida > 0f)
            barraTiempoPartida.fillAmount = Mathf.Clamp01(restante / GameManager.Instance.duracionPartida);
    }

    private void ActualizarNivelDesdeManager()
    {
        if (DifficultyManager.Instance == null) return;

        int nivel = Mathf.Clamp(DifficultyManager.Instance.nivelActual, 1, 10);
        if (nivel != ultimoNivel)
            ActualizarNivel(nivel);
    }

    private void SuscribirEventos()
    {
        if (juego == null) return;

        juego.OnRachaActualizada -= ActualizarRacha;
        juego.OnNivelActualizado -= ActualizarNivel;
        juego.OnProgresoActualizado -= ActualizarProgreso;
        juego.OnPuntuacionActualizada -= ActualizarPuntuacion;
        juego.OnObjetivoRondaActualizado -= ActualizarObjetivo;
        juego.OnFaseActualizada -= ActualizarFase;
        juego.OnMemorizacionActualizada -= ActualizarMemorizacion;
        juego.OnFeedback -= MostrarFeedback;

        juego.OnRachaActualizada += ActualizarRacha;
        juego.OnNivelActualizado += ActualizarNivel;
        juego.OnProgresoActualizado += ActualizarProgreso;
        juego.OnPuntuacionActualizada += ActualizarPuntuacion;
        juego.OnObjetivoRondaActualizado += ActualizarObjetivo;
        juego.OnFaseActualizada += ActualizarFase;
        juego.OnMemorizacionActualizada += ActualizarMemorizacion;
        juego.OnFeedback += MostrarFeedback;
    }

    private void CachearReferencias()
    {
        if (juego == null)
            juego = FindFirstObjectByType<EcoVisualGame>(FindObjectsInactive.Include);

        if (juego != null && juego.uiEcoVisual == null)
            juego.uiEcoVisual = this;
    }

    private void CrearHUDSiNecesario()
    {
        if (juego != null && juego.generarZonasPorCodigo)
        {
            DesactivarHUDAutomatico();
            return;
        }

        if (!crearHUDAutomaticamente) return;

        if (contenedorHUD == null)
            contenedorHUD = CrearContenedorHUD();

        if (contenedorHUD == null) return;

        PrepararContenedorHUD();

        textoTiempo = ObtenerOCrearTexto(textoTiempo, "Tiempo", "TIEMPO: 00:00");
        textoNivel = ObtenerOCrearTexto(textoNivel, "Nivel", "NIVEL: 1/10");
        textoRacha = ObtenerOCrearTexto(textoRacha, "Racha", "RACHA: 0");
        textoProgreso = ObtenerOCrearTexto(textoProgreso, "Progreso", "OBJETOS: 0/0");
        textoPuntuacion = ObtenerOCrearTexto(textoPuntuacion, "Puntuacion", "PUNTOS: 0/0");
        textoObjetivo = ObtenerOCrearTexto(textoObjetivo, "Objetivo", "OBJETIVO: --");
        textoMemorizacion = ObtenerOCrearTexto(textoMemorizacion, "Memorizacion", "");
        textoFase = ObtenerOCrearTexto(textoFase, "Fase", "");
    }

    public void DesactivarHUDAutomatico()
    {
        crearHUDAutomaticamente = false;

        if (contenedorHUD != null && contenedorHUD.name == "HUD_EcoVisual")
        {
            Destroy(contenedorHUD.gameObject);
            contenedorHUD = null;
        }
    }

    private RectTransform CrearContenedorHUD()
    {
        Canvas canvas = GetComponentInParent<Canvas>();
        if (canvas == null)
            canvas = FindFirstObjectByType<Canvas>(FindObjectsInactive.Include);

        if (canvas == null)
            return null;

        GameObject go = new GameObject("HUD_EcoVisual", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(HorizontalLayoutGroup));
        go.transform.SetParent(canvas.transform, false);

        RectTransform rect = go.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0f, 1f);
        rect.anchorMax = new Vector2(1f, 1f);
        rect.pivot = new Vector2(0.5f, 1f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(0f, altoHUD);
        rect.SetAsLastSibling();

        return rect;
    }

    private void PrepararContenedorHUD()
    {
        contenedorHUD.anchorMin = new Vector2(0f, 1f);
        contenedorHUD.anchorMax = new Vector2(1f, 1f);
        contenedorHUD.pivot = new Vector2(0.5f, 1f);
        contenedorHUD.anchoredPosition = Vector2.zero;
        contenedorHUD.sizeDelta = new Vector2(0f, altoHUD);
        contenedorHUD.SetAsLastSibling();

        Image fondo = contenedorHUD.GetComponent<Image>();
        if (fondo == null)
            fondo = contenedorHUD.gameObject.AddComponent<Image>();

        fondo.color = colorFondoHUD;
        fondo.raycastTarget = false;

        HorizontalLayoutGroup layout = contenedorHUD.GetComponent<HorizontalLayoutGroup>();
        if (layout == null)
            layout = contenedorHUD.gameObject.AddComponent<HorizontalLayoutGroup>();

        layout.padding = new RectOffset(18, 18, 8, 8);
        layout.spacing = 10f;
        layout.childAlignment = TextAnchor.MiddleCenter;
        layout.childControlWidth = true;
        layout.childControlHeight = true;
        layout.childForceExpandWidth = true;
        layout.childForceExpandHeight = true;
    }

    private TextMeshProUGUI ObtenerOCrearTexto(TextMeshProUGUI texto, string nombre, string valorInicial)
    {
        if (texto == null)
        {
            GameObject go = new GameObject(nombre, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI), typeof(LayoutElement));
            go.transform.SetParent(contenedorHUD, false);
            texto = go.GetComponent<TextMeshProUGUI>();
            texto.text = valorInicial;
        }
        else if (colocarTextosAsignadosEnHUD && texto.transform.parent != contenedorHUD)
        {
            texto.transform.SetParent(contenedorHUD, false);
        }

        RectTransform rect = texto.GetComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = Vector2.zero;

        texto.color = Color.white;
        texto.alignment = TextAlignmentOptions.Center;
        texto.enableAutoSizing = true;
        texto.fontSizeMin = juego != null ? juego.tamanoMinimoTextoHUD : 18f;
        texto.fontSizeMax = juego != null ? juego.tamanoMaximoTextoHUD : 34f;
        texto.fontStyle = FontStyles.Bold;
        texto.raycastTarget = false;
        AplicarFuenteTexto(texto);

        LayoutElement layoutElement = texto.GetComponent<LayoutElement>();
        if (layoutElement == null)
            layoutElement = texto.gameObject.AddComponent<LayoutElement>();

        layoutElement.minWidth = nombre == "Fase" ? 190f : 110f;
        layoutElement.flexibleWidth = nombre == "Fase" ? 1.5f : 1f;

        return texto;
    }

    private void PrepararFlash()
    {
        if (flashPanel == null) return;

        Color c = flashPanel.color;
        c.a = 0f;
        flashPanel.color = c;
        flashPanel.gameObject.SetActive(false);
    }

    private void SetText(TextMeshProUGUI tmp, string texto)
    {
        if (tmp == null) return;

        AplicarFuenteTexto(tmp);
        tmp.text = texto;
    }

    private void AplicarFuenteTexto(TextMeshProUGUI texto)
    {
        if (juego != null && juego.fuenteTextos != null && texto != null)
            texto.font = juego.fuenteTextos;
    }

    private void OnDestroy()
    {
        if (juego != null)
        {
            juego.OnRachaActualizada -= ActualizarRacha;
            juego.OnNivelActualizado -= ActualizarNivel;
            juego.OnProgresoActualizado -= ActualizarProgreso;
            juego.OnPuntuacionActualizada -= ActualizarPuntuacion;
            juego.OnObjetivoRondaActualizado -= ActualizarObjetivo;
            juego.OnFaseActualizada -= ActualizarFase;
            juego.OnMemorizacionActualizada -= ActualizarMemorizacion;
            juego.OnFeedback -= MostrarFeedback;
        }
    }
}
