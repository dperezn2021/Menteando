using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

[System.Serializable]
public struct ColorMatchColorData
{
    public int indice;
    public string nombre;
    public Color color;

    public ColorMatchColorData(int indice, string nombre, Color color)
    {
        this.indice = indice;
        this.nombre = nombre;
        this.color = color;
    }
}

public class ColorWheelUI : MonoBehaviour
{
    [Header("Contenedores")]
    public RectTransform wheelContainer;

    [Header("Configuracion Visual")]
    public float radioExterno = 220f;
    public float radioInterno = 80f;

    [Header("Centro")]
    public TextMeshProUGUI centerText;

    [Header("Animacion")]
    public bool rotacionActiva = true;
    public float velocidadRotacion = 8f;

    [Header("Feedback")]
    public float duracionFlash = 0.15f;

    public int nivelRoscoActual = 0; // 🔥 CAMBIO
    public List<Color> coloresEnRoscoActual = new List<Color>(); // 🔥 CAMBIO
    public List<int> indicesColoresActuales = new List<int>(); // 🔥 CAMBIO
    public List<ColorMatchColorData> datosColoresActuales = new List<ColorMatchColorData>(); // 🔥 CAMBIO
    public List<int> indicesEnRoscoActual => indicesColoresActuales; // 🔥 CAMBIO

    private static readonly ColorMatchColorData[] catalogoColores = new ColorMatchColorData[] // 🔥 CAMBIO
    {
        new ColorMatchColorData(0,  "AZUL",     new Color(0.20f, 0.40f, 0.90f)),  // Azul vibrante
        new ColorMatchColorData(1,  "VERDE",    new Color(0.10f, 0.80f, 0.20f)),  // Verde intenso
        new ColorMatchColorData(2,  "ROJO",     new Color(0.95f, 0.10f, 0.10f)),  // Rojo puro
        new ColorMatchColorData(3,  "AMARILLO", new Color(1.00f, 0.95f, 0.00f)),  // Amarillo brillante
        new ColorMatchColorData(4,  "MORADO",   new Color(0.80f, 0.20f, 0.90f)),  // Morado intenso
        new ColorMatchColorData(5,  "NARANJA",  new Color(1.00f, 0.65f, 0.00f)),  // Naranja vivo
        new ColorMatchColorData(6,  "CIAN",     new Color(0.00f, 0.95f, 1.00f)),  // Cian brillante
        new ColorMatchColorData(7,  "ROSA",     new Color(1.00f, 0.20f, 0.60f)),  // Rosa fucsia
        new ColorMatchColorData(8,  "LILA",     new Color(0.60f, 0.30f, 0.85f)),  // Lila saturado
        new ColorMatchColorData(9,  "MENTA",    new Color(0.20f, 0.95f, 0.70f)),  // Menta fresca
        new ColorMatchColorData(10, "MARRON",   new Color(0.70f, 0.35f, 0.10f)),  // Marrón oscuro
        new ColorMatchColorData(11, "BLANCO",   new Color(0.95f, 0.95f, 0.95f))   // Blanco puro
    };

    private readonly List<GameObject> sectores = new List<GameObject>();
    private ColorMatchGame gameLogic;
    private int direccionRotacion = 1;
    private bool pausado = false;
    private Coroutine shakeCoroutine;

    private void Awake()
    {
        gameLogic = FindFirstObjectByType<ColorMatchGame>(FindObjectsInactive.Include);
    }

    private void Start()
    {
        if (gameLogic == null)
            gameLogic = FindFirstObjectByType<ColorMatchGame>(FindObjectsInactive.Include);
    }

    private void Update()
    {
        if (rotacionActiva && !pausado && wheelContainer != null)
            wheelContainer.Rotate(0f, 0f, velocidadRotacion * direccionRotacion * Time.deltaTime);
    }

    public void SetGameLogic(ColorMatchGame game)
    {
        gameLogic = game;
    }

    public void SetPausado(bool valor)
    {
        pausado = valor;
    }

    public void CambiarDireccion()
    {
        direccionRotacion *= -1;
    }

    public void GenerarRosco(int nivel, bool preservar = false)
    {
        nivelRoscoActual = Mathf.Clamp(nivel, 1, 10);
        int numSectores = CalcularSectoresPorNivel(nivelRoscoActual);

        if (preservar && sectores.Count == numSectores && datosColoresActuales.Count == numSectores)
            return;

        LimpiarSectores();
        coloresEnRoscoActual.Clear();
        indicesColoresActuales.Clear();
        datosColoresActuales.Clear();

        if (wheelContainer == null)
        {
            Debug.LogError("ColorWheelUI: falta wheelContainer.");
            return;
        }

        List<ColorMatchColorData> disponibles = new List<ColorMatchColorData>(catalogoColores);

        for (int i = 0; i < numSectores && disponibles.Count > 0; i++)
        {
            int randomPos = Random.Range(0, disponibles.Count);
            ColorMatchColorData dato = disponibles[randomPos];
            disponibles.RemoveAt(randomPos);

            datosColoresActuales.Add(dato);
            indicesColoresActuales.Add(dato.indice);
            coloresEnRoscoActual.Add(dato.color);
            CrearSector(i, numSectores, dato);
        }

        ConfigurarRotacionPorNivel(nivelRoscoActual);
        Debug.Log($"ColorWheelUI: rosco nivel {nivelRoscoActual} con {datosColoresActuales.Count} sectores: {ResumenRoscoActual()}");
    }

    private int CalcularSectoresPorNivel(int nivel)
    {
        int[] sectoresPorNivel = { 2, 3, 4, 5, 6, 7, 8, 9, 10, 12 };
        nivel = Mathf.Clamp(nivel, 1, 10);
        return sectoresPorNivel[nivel - 1];
    }

    private void ConfigurarRotacionPorNivel(int nivel)
    {
        if (nivel < 8)
        {
            direccionRotacion = 1;
            return;
        }

        direccionRotacion = Random.value < 0.5f ? -1 : 1;
    }

    private void CrearSector(int indiceSector, int total, ColorMatchColorData dato)
    {
        GameObject sectorGO = new GameObject($"Sector_{indiceSector}_{dato.nombre}", typeof(RectTransform), typeof(Image), typeof(Button), typeof(ColorWheelSectorData));
        sectorGO.transform.SetParent(wheelContainer, false);

        RectTransform rect = sectorGO.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = new Vector2(radioExterno * 2f, radioExterno * 2f);
        rect.anchoredPosition = Vector2.zero;
        rect.localScale = Vector3.one;

        Texture2D textura = GenerarTexturaSectorAnillo(total, indiceSector, dato.color);
        Sprite sprite = Sprite.Create(textura, new Rect(0, 0, textura.width, textura.height), new Vector2(0.5f, 0.5f), 100f);

        Image img = sectorGO.GetComponent<Image>();
        img.sprite = sprite;
        img.type = Image.Type.Simple;
        img.alphaHitTestMinimumThreshold = 0.1f;
        img.raycastTarget = true;

        Button btn = sectorGO.GetComponent<Button>();
        btn.targetGraphic = img;
        btn.transition = Selectable.Transition.ColorTint;

        ColorBlock colors = btn.colors;
        colors.highlightedColor = Color.Lerp(dato.color, Color.white, 0.25f);
        colors.pressedColor = Color.Lerp(dato.color, Color.black, 0.20f);
        colors.selectedColor = colors.highlightedColor;
        btn.colors = colors;

        ColorWheelSectorData data = sectorGO.GetComponent<ColorWheelSectorData>();
        data.Configurar(indiceSector, dato.indice, dato.nombre, dato.color);

        int sectorCapturado = indiceSector;
        btn.onClick.RemoveAllListeners();
        btn.onClick.AddListener(() => OnSectorClick(sectorCapturado));

        sectores.Add(sectorGO);
    }

    private Texture2D GenerarTexturaSectorAnillo(int total, int index, Color color)
    {
        const int res = 512;
        Texture2D tex = new Texture2D(res, res, TextureFormat.RGBA32, false);
        tex.wrapMode = TextureWrapMode.Clamp;
        tex.filterMode = FilterMode.Bilinear;

        Vector2 centro = new Vector2(res / 2f, res / 2f);
        float rExt = res * 0.48f;
        float ratioInterno = Mathf.Clamp01(radioInterno / Mathf.Max(1f, radioExterno));
        float rInt = rExt * ratioInterno;
        float gradosPorSector = 360f / Mathf.Max(1, total);
        float a0 = index * gradosPorSector;
        float a1 = (index + 1) * gradosPorSector;

        for (int x = 0; x < res; x++)
        {
            for (int y = 0; y < res; y++)
            {
                Vector2 p = new Vector2(x, y);
                float dist = Vector2.Distance(p, centro);
                float ang = Mathf.Atan2(y - centro.y, x - centro.x) * Mathf.Rad2Deg;
                if (ang < 0f) ang += 360f;

                bool dentroAnillo = dist >= rInt && dist <= rExt;
                bool dentroAngulo = ang >= a0 && ang <= a1;

                tex.SetPixel(x, y, dentroAnillo && dentroAngulo ? color : Color.clear);
            }
        }

        tex.Apply();
        return tex;
    }

    private void OnSectorClick(int indiceSector)
    {
        if (gameLogic == null)
            gameLogic = FindFirstObjectByType<ColorMatchGame>(FindObjectsInactive.Include);

        gameLogic?.ProcesarRespuesta(indiceSector);
    }

    private void LimpiarSectores()
    {
        foreach (GameObject sector in sectores)
        {
            if (sector == null)
                continue;

            Image img = sector.GetComponent<Image>();
            if (img != null && img.sprite != null)
            {
                Texture textura = img.sprite.texture;
                Destroy(img.sprite);
                Destroy(textura);
            }

            Destroy(sector);
        }

        sectores.Clear();
    }

    public bool TieneColorActual(int indiceColor)
    {
        return ObtenerDatoActualPorIndice(indiceColor, out _);
    }

    public bool ObtenerDatoActualPorSector(int indiceSector, out ColorMatchColorData dato)
    {
        if (indiceSector < 0 || indiceSector >= datosColoresActuales.Count)
        {
            dato = default;
            return false;
        }

        dato = datosColoresActuales[indiceSector];
        return true;
    }

    public bool ObtenerDatoActualPorIndice(int indiceColor, out ColorMatchColorData dato)
    {
        for (int i = 0; i < datosColoresActuales.Count; i++)
        {
            if (datosColoresActuales[i].indice == indiceColor)
            {
                dato = datosColoresActuales[i];
                return true;
            }
        }

        dato = default;
        return false;
    }

    public ColorMatchColorData ObtenerDatoActualAleatorio()
    {
        if (datosColoresActuales.Count == 0)
            return catalogoColores[0];

        return datosColoresActuales[Random.Range(0, datosColoresActuales.Count)];
    }

    public int ObtenerIndiceColorPorSector(int indiceSector)
    {
        return ObtenerDatoActualPorSector(indiceSector, out ColorMatchColorData dato) ? dato.indice : -1;
    }

    public Color ObtenerColorPorIndice(int indiceColor)
    {
        if (ObtenerDatoActualPorIndice(indiceColor, out ColorMatchColorData actual))
            return actual.color;

        for (int i = 0; i < catalogoColores.Length; i++)
            if (catalogoColores[i].indice == indiceColor)
                return catalogoColores[i].color;

        return Color.white;
    }

    public string ObtenerNombrePorIndice(int indiceColor)
    {
        if (ObtenerDatoActualPorIndice(indiceColor, out ColorMatchColorData actual))
            return actual.nombre;

        for (int i = 0; i < catalogoColores.Length; i++)
            if (catalogoColores[i].indice == indiceColor)
                return catalogoColores[i].nombre;

        return "DESCONOCIDO";
    }

    public string ResumenRoscoActual()
    {
        if (datosColoresActuales.Count == 0)
            return "VACIO";

        List<string> nombres = new List<string>();
        for (int i = 0; i < datosColoresActuales.Count; i++)
            nombres.Add(datosColoresActuales[i].nombre);

        return string.Join(", ", nombres);
    }

    public void ActualizarCentro(ColorMatchColorData palabra, ColorMatchColorData colorVisual)
    {
        if (centerText == null) return;

        centerText.text = palabra.nombre;
        centerText.color = colorVisual.color;
        centerText.outlineColor = Color.black;
        centerText.outlineWidth = 0.18f;
    }

    public void ActualizarCentro(string texto, Color color)
    {
        if (centerText == null) return;

        centerText.text = texto;
        centerText.color = color;
        centerText.outlineColor = Color.black;
        centerText.outlineWidth = 0.18f;
    }

    public void ForzarRefrescoCentro()
    {
        if (centerText == null) return;

        centerText.SetAllDirty();
        centerText.ForceMeshUpdate();
        Canvas.ForceUpdateCanvases();
    }

    public string TextoCentroActual()
    {
        if (centerText == null)
            return "SIN_CENTER_TEXT";

        Color c = centerText.color;
        return $"{centerText.text} rgb({c.r:F2},{c.g:F2},{c.b:F2})";
    }

    public void ShakeCentro()
    {
        if (shakeCoroutine != null)
            StopCoroutine(shakeCoroutine);

        shakeCoroutine = StartCoroutine(ShakeRoutine());
    }

    private IEnumerator ShakeRoutine()
    {
        if (centerText == null)
        {
            shakeCoroutine = null;
            yield break;
        }

        Vector3 original = centerText.transform.localPosition;
        float duracion = Mathf.Max(0.01f, duracionFlash);
        float fuerza = 12f;
        float t = 0f;

        while (t < duracion)
        {
            if (!pausado)
            {
                t += Time.deltaTime;
                float x = Random.Range(-fuerza, fuerza);
                centerText.transform.localPosition = original + new Vector3(x, 0f, 0f);
            }

            yield return null;
        }

        centerText.transform.localPosition = original;
        shakeCoroutine = null;
    }

    private void OnDestroy()
    {
        LimpiarSectores();
    }
}

public class ColorWheelSectorData : MonoBehaviour
{
    public int indiceSector;
    public int indiceColor;
    public string nombreColor;
    public Color color;

    public void Configurar(int sector, int indice, string nombre, Color colorReal)
    {
        indiceSector = sector;
        indiceColor = indice;
        nombreColor = nombre;
        color = colorReal;
    }
}
