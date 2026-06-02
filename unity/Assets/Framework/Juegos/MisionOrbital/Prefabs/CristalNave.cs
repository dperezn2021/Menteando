using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CristalNave : MonoBehaviour
{
    [Header("Colores")]
    public Color colorPrincipal = new Color(0f, 0.8f, 1f);
    public Color colorSecundario = new Color(0.3f, 0.5f, 0.8f);
    public Color colorAlerta = new Color(1f, 0.2f, 0.2f);

    [Header("Config")]
    public float grosorLineas = 2f;
    public float alphaFondo = 0.15f;

    RectTransform barraGasolina;
    RectTransform barraEstaciones;
    public TextMeshProUGUI textoGasolina;
    public TextMeshProUGUI textoEstaciones;
    Image barraGasolinaImage;
    Image barraEstacionesImage;
    private float alturaMaxGasolina;
    private float alturaMaxEstaciones;

    void Start()
    {
        CrearHUD();
    }

    void Update()
    {
        // GASOLINA = tiempo restante
        if (GameManager.Instance != null)
        {
            float t = GameManager.Instance.tiempoRestante;
            float total = GameManager.Instance.duracionPartida;
            ActualizarGasolina(Mathf.Clamp01(t / total));
        }

        // ESTACIONES = nivel actual
        if (DifficultyManager.Instance != null)
        {
            float nivel = DifficultyManager.Instance.nivelActual;
            ActualizarEstaciones(Mathf.Clamp01(nivel / 10f));
        }
    }

    // ============================================================
    // CREACIÓN DE HUD
    // ============================================================

    void CrearHUD()
    {
        CrearFondo();
        CrearEsquinas();
        CrearBrujula();
        CrearCruceta();
        CrearBarras();
        CrearBotonDisparo();
    }

    void CrearFondo()
    {
        GameObject fondo = Crear("Fondo", transform);
        RectTransform rect = fondo.AddComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;

        Image img = fondo.AddComponent<Image>();
        img.color = new Color(0f, 0.05f, 0.1f, alphaFondo);
    }

    // ============================================================
    // ESQUINAS (FUNCIONALES)
    // ============================================================

    void CrearEsquinas()
    {
        float margen = 20f;
        float largo = 65f;
        float grosor = grosorLineas * 2f;

        // SUP IZQ
        CrearLineaEsquina(new Vector2(0, 1), new Vector2(margen, -margen), largo, grosor, true);
        CrearLineaEsquina(new Vector2(0, 1), new Vector2(margen, -margen), largo, grosor, false);

        // SUP DER
        CrearLineaEsquina(new Vector2(1, 1), new Vector2(-margen, -margen), largo, grosor, true);
        CrearLineaEsquina(new Vector2(1, 1), new Vector2(-margen, -margen), largo, grosor, false);

        // INF IZQ
        CrearLineaEsquina(new Vector2(0, 0), new Vector2(margen, margen), largo, grosor, true);
        CrearLineaEsquina(new Vector2(0, 0), new Vector2(margen, margen), largo, grosor, false);

        // INF DER
        CrearLineaEsquina(new Vector2(1, 0), new Vector2(-margen, margen), largo, grosor, true);
        CrearLineaEsquina(new Vector2(1, 0), new Vector2(-margen, margen), largo, grosor, false);
    }

    void CrearLineaEsquina(Vector2 anchor, Vector2 offset, float largo, float grosor, bool horizontal)
    {
        GameObject linea = Crear("Linea", transform);
        RectTransform rect = linea.AddComponent<RectTransform>();

        rect.anchorMin = rect.anchorMax = anchor;
        rect.pivot = anchor;
        rect.anchoredPosition = offset;

        if (horizontal)
            rect.sizeDelta = new Vector2(largo, grosor);
        else
            rect.sizeDelta = new Vector2(grosor, largo);

        linea.AddComponent<Image>().color = colorPrincipal;
    }

    // ============================================================
    // BRÚJULA
    // ============================================================

    void CrearBrujula()
    {
        GameObject brujula = Crear("Brujula", transform);
        RectTransform rect = brujula.AddComponent<RectTransform>();

        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 1);
        rect.pivot = new Vector2(0.5f, 1);
        rect.anchoredPosition = new Vector2(0, -40);
        rect.sizeDelta = new Vector2(350, 30);

        string[] dirs = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };

        for (int i = 0; i < dirs.Length; i++)
        {
            float x = -175f + (350f / (dirs.Length - 1)) * i;
            Color col = (dirs[i] == "N" || dirs[i] == "S") ? colorAlerta : colorPrincipal;
            CrearTextoBrujula(brujula.transform, dirs[i], new Vector2(x, 0), col);
        }
    }

    // ============================================================
    // CRUCETA (CENTRADA DE VERDAD)
    // ============================================================

    void CrearCruceta()
    {
        float largo = 40f;
        float sep = 15f;

        CrearLineaCentro(new Vector2(-sep, 0), new Vector2(largo, grosorLineas));
        CrearLineaCentro(new Vector2(sep, 0), new Vector2(largo, grosorLineas));
        CrearLineaCentro(new Vector2(0, sep), new Vector2(grosorLineas, largo));
        CrearLineaCentro(new Vector2(0, -sep), new Vector2(grosorLineas, largo));

        GameObject centro = Crear("CentroCruceta", transform);
        RectTransform rect = centro.AddComponent<RectTransform>();
        
        rect.sizeDelta = new Vector2(30, 30);

        Image img = centro.AddComponent<Image>();
        img.color = new Color(0.0f, 0.0f, 0.0f, 0.0f);

        Button btn = centro.AddComponent<Button>();
        btn.onClick.AddListener(DispararMisionOrbital);
    }

    void CrearLineaCentro(Vector2 offset, Vector2 size)
    {
        GameObject linea = Crear("LineaCentro", transform);
        RectTransform rect = linea.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = offset;
        rect.sizeDelta = size;

        linea.AddComponent<Image>().color = colorAlerta;
    }

    void CrearBotonDisparo()
    {
        GameObject botonObj = Crear("BotonDisparo", transform);
        RectTransform rect = botonObj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0f);
        rect.pivot = new Vector2(0.5f, 0f);
        rect.anchoredPosition = new Vector2(0f, 34f);
        rect.sizeDelta = new Vector2(132f, 54f);

        Image fondo = botonObj.AddComponent<Image>();
        fondo.color = new Color(colorAlerta.r, colorAlerta.g, colorAlerta.b, 0.32f);

        Button btn = botonObj.AddComponent<Button>();
        btn.targetGraphic = fondo;
        btn.onClick.AddListener(DispararMisionOrbital);

        ColorBlock colors = btn.colors;
        colors.normalColor = fondo.color;
        colors.highlightedColor = new Color(colorAlerta.r, colorAlerta.g, colorAlerta.b, 0.46f);
        colors.pressedColor = new Color(colorAlerta.r, colorAlerta.g, colorAlerta.b, 0.70f);
        colors.selectedColor = colors.highlightedColor;
        btn.colors = colors;

        GameObject textoObj = Crear("Texto", botonObj.transform);
        RectTransform textoRect = textoObj.AddComponent<RectTransform>();
        textoRect.anchorMin = Vector2.zero;
        textoRect.anchorMax = Vector2.one;
        textoRect.offsetMin = Vector2.zero;
        textoRect.offsetMax = Vector2.zero;

        // Primero, mueve el archivo a: Assets/Resources/space age SDF.asset

        TextMeshProUGUI texto = textoObj.AddComponent<TextMeshProUGUI>();
        texto.text = "disparar";
        texto.fontSize = 18;
        texto.color = Color.white;
        texto.alignment = TextAlignmentOptions.Center;
        texto.raycastTarget = false;

        TMP_FontAsset fuente = Resources.Load<TMP_FontAsset>("space age SDF");
        if (fuente != null)
        {
            texto.font = fuente;
        }
        else
        {
        }
    }

    void DispararMisionOrbital()
    {
        var juego = FindAnyObjectByType<MisionOrbitalGame>(FindObjectsInactive.Include);
        if (juego != null) juego.Disparar();
    }

    // ============================================================
    // BARRAS (FUNCIONALES)
    // ============================================================

    void CrearBarras()
    {
        float ancho = 25f;
        float alto = 180f;
        alturaMaxGasolina = alto;
        alturaMaxEstaciones = alto;


        // GASOLINA (izquierda)
        GameObject gas = Crear("Gasolina", transform);
        RectTransform rectGas = gas.AddComponent<RectTransform>();
        rectGas.anchorMin = rectGas.anchorMax = new Vector2(0, 0);
        rectGas.pivot = new Vector2(0, 0);
        rectGas.anchoredPosition = new Vector2(40, 40);
        rectGas.sizeDelta = new Vector2(ancho, alto);

        // --- TEXTO GASOLINA ---
        textoGasolina.transform.SetParent(rectGas, false);
        textoGasolina.rectTransform.anchorMin = new Vector2(0.5f, 1f);
        textoGasolina.rectTransform.anchorMax = new Vector2(0.5f, 1f);
        textoGasolina.rectTransform.pivot = new Vector2(0.5f, 0f);
        textoGasolina.rectTransform.anchoredPosition = new Vector2(2, 10);

        Image fondoGas = gas.AddComponent<Image>();
        fondoGas.color = new Color(0.1f, 0.1f, 0.15f, 0.8f);

        GameObject nivelGas = Crear("NivelGas", gas.transform);
        barraGasolina = nivelGas.AddComponent<RectTransform>();
        barraGasolina.anchorMin = new Vector2(0, 0);
        barraGasolina.anchorMax = new Vector2(1, 0);
        barraGasolina.pivot = new Vector2(0.5f, 0);
        barraGasolina.sizeDelta = new Vector2(0, alto);

        barraGasolinaImage = nivelGas.AddComponent<Image>();
        barraGasolinaImage.color = Color.green;

        // ESTACIONES (derecha)
        GameObject est = Crear("Estaciones", transform);
        RectTransform rectEst = est.AddComponent<RectTransform>();
        rectEst.anchorMin = rectEst.anchorMax = new Vector2(1, 0);
        rectEst.pivot = new Vector2(1, 0);
        rectEst.anchoredPosition = new Vector2(-40, 40);
        rectEst.sizeDelta = new Vector2(ancho, alto);

        // --- TEXTO ESTACIONES ---
        textoEstaciones.transform.SetParent(rectEst, false);
        textoEstaciones.rectTransform.anchorMin = new Vector2(0.5f, 1f);
        textoEstaciones.rectTransform.anchorMax = new Vector2(0.5f, 1f);
        textoEstaciones.rectTransform.pivot = new Vector2(0.5f, 0f);
        textoEstaciones.rectTransform.anchoredPosition = new Vector2(-2, 10);
        Image fondoEst = est.AddComponent<Image>();
        fondoEst.color = new Color(0.1f, 0.1f, 0.15f, 0.8f);

        GameObject nivelEst = Crear("NivelEst", est.transform);
        barraEstaciones = nivelEst.AddComponent<RectTransform>();
        barraEstaciones.anchorMin = new Vector2(0, 0);
        barraEstaciones.anchorMax = new Vector2(1, 0);
        barraEstaciones.pivot = new Vector2(0.5f, 0);
        barraEstaciones.sizeDelta = new Vector2(0, alto);

        barraEstacionesImage = nivelEst.AddComponent<Image>();
        barraEstacionesImage.color = colorSecundario;
    }


    // ============================================================
    // ACTUALIZACIÓN DE BARRAS
    // ============================================================

    void ActualizarGasolina(float p)
    {
        float altura = Mathf.Lerp(0, alturaMaxGasolina, p);
        barraGasolina.sizeDelta = new Vector2(barraGasolina.sizeDelta.x, altura);

        if (p > 0.6f)
            barraGasolinaImage.color = Color.Lerp(Color.yellow, Color.green, (p - 0.6f) / 0.4f);
        else if (p > 0.3f)
            barraGasolinaImage.color = Color.Lerp(Color.red, Color.yellow, (p - 0.3f) / 0.3f);
        else
            barraGasolinaImage.color = Color.red;
    }

    void ActualizarEstaciones(float p)
    {
        float altura = Mathf.Lerp(0, alturaMaxEstaciones, p);
        barraEstaciones.sizeDelta = new Vector2(barraEstaciones.sizeDelta.x, altura);

        if (p > 0.7f)
            barraEstacionesImage.color = colorSecundario;
        else if (p > 0.3f)
            barraEstacionesImage.color = Color.Lerp(colorSecundario, new Color(1f, 0.5f, 0f), (p - 0.3f) / 0.4f);
        else
            barraEstacionesImage.color = Color.Lerp(new Color(1f, 0.5f, 0f), Color.red, (p - 0.7f) / 0.3f);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    GameObject Crear(string nombre, Transform parent)
    {
        GameObject obj = new GameObject(nombre);
        obj.transform.SetParent(parent, false);
        return obj;
    }

   

    void CrearTextoBrujula(Transform parent, string texto, Vector2 pos, Color color)
    {
        GameObject obj = Crear("Dir_" + texto, parent);
        RectTransform rect = obj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = pos;

        TextMeshProUGUI tmp = obj.AddComponent<TextMeshProUGUI>();
        tmp.text = texto;
        tmp.fontSize = 12;
        tmp.color = color;
        tmp.alignment = TextAlignmentOptions.Center;
    }
}
