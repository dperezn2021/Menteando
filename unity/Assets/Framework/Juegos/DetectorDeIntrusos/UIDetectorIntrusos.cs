using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class UIDetectorIntrusos : MonoBehaviour
{
    [Header("Referencias al Juego")]
    public DetectorDeIntrusosGame juego;
    public GridLayoutGroup gridLayout;
    public LupaFlotante lupaScript;

    [Header("Textos UI")]
    public TextMeshProUGUI textoTiempoPartida;    // Tiempo total de partida (GameManager)
    public TextMeshProUGUI textoAciertos;
    public TextMeshProUGUI textoNivel;
    public TextMeshProUGUI textoTotalCasos;

    [Header("Barras de tiempo")]
    public Image barraTiempoRonda;       // Barra del tiempo de ronda

    [Header("Colores")]
    public Color colorIntruso = new Color(0.96f, 0.77f, 0.26f, 1f);
    public Color colorNormal = new Color(0.4f, 0.5f, 0.6f, 1f);
    public Color colorFeedbackAcierto = new Color(0.3f, 0.8f, 0.5f, 1f);
    public Color colorFeedbackError = new Color(0.9f, 0.4f, 0.4f, 1f);

    [Header("Tamaño celdas")]
    public float anchoCelda = 100f;
    public float altoCelda = 100f;
    public float espaciado = 15f;

    private Coroutine lupaCoroutine;
    private float tiempoPartidaTotal = 60f; // Duración total de la partida (se actualiza desde GameManager)
    private Vector2 ultimoTamanoGrid = Vector2.zero;

    private void Start()
    {
        if (juego == null)
            juego = FindAnyObjectByType<DetectorDeIntrusosGame>();

        if (juego != null)
        {
            juego.OnTiempoRondaActualizado += ActualizarTiempoRonda;
            juego.OnPuntuacionActualizada += ActualizarPuntuacion;
            juego.OnNivelActualizado += ActualizarNivel;
            juego.OnGridSizeChanged += ActualizarGridSize;
        }

        if (lupaScript == null)
            lupaScript = FindAnyObjectByType<LupaFlotante>();

        ConfigurarGridLayout();
        ConfigurarTextosHUD();

        // Obtener duración total de la partida desde GameManager
        if (GameManager.Instance != null)
            tiempoPartidaTotal = GameManager.Instance.duracionPartida;
    }

    private void Update()
    {
        // Actualizar tiempo total de partida
        if (GameManager.Instance != null && textoTiempoPartida != null)
        {
            float tiempoRestante = GameManager.Instance.tiempoRestante;
            int segundos = Mathf.Max(0, Mathf.CeilToInt(tiempoRestante));
            textoTiempoPartida.text = $"{segundos / 60:00}:{segundos % 60:00}";

        
        }

        ActualizarGridSiCambioTamano();
    }

    private void ConfigurarGridLayout()
    {
        if (gridLayout == null) return;

        // Calcular tamaño de celda según pantalla
        RectTransform gridRect = (RectTransform)gridLayout.transform;
        float anchoPantalla = Mathf.Max(1f, gridRect.rect.width);
        float altoPantalla = Mathf.Max(1f, gridRect.rect.height);
        float referencia = Mathf.Min(anchoPantalla / 6f, altoPantalla / 5f);
        float nuevoAnchoCelda = Mathf.Clamp(referencia, 58f, 120f);

        gridLayout.cellSize = new Vector2(nuevoAnchoCelda, nuevoAnchoCelda);
        float spacing = Mathf.Clamp(espaciado, 8f, nuevoAnchoCelda * 0.22f);
        gridLayout.spacing = new Vector2(spacing, spacing);
        gridLayout.startAxis = GridLayoutGroup.Axis.Horizontal;
        gridLayout.childAlignment = TextAnchor.MiddleCenter;
        ultimoTamanoGrid = gridRect.rect.size;
    }

    private void ActualizarGridSiCambioTamano()
    {
        if (gridLayout == null)
            return;

        RectTransform gridRect = (RectTransform)gridLayout.transform;
        if ((gridRect.rect.size - ultimoTamanoGrid).sqrMagnitude > 1f)
            ConfigurarGridLayout();
    }

    private void ConfigurarTextosHUD()
    {
        ConfigurarTextoHUD(textoTiempoPartida, 18f, 42f);
        ConfigurarTextoHUD(textoAciertos, 18f, 42f);
        ConfigurarTextoHUD(textoNivel, 18f, 42f);
        ConfigurarTextoHUD(textoTotalCasos, 18f, 42f);
    }

    private void ConfigurarTextoHUD(TextMeshProUGUI texto, float min, float max)
    {
        if (texto == null)
            return;

        texto.enableAutoSizing = true;
        texto.fontSizeMin = min;
        texto.fontSizeMax = max;
        texto.textWrappingMode = TextWrappingModes.Normal;
        texto.overflowMode = TextOverflowModes.Ellipsis;
        texto.raycastTarget = false;
    }

    private void ActualizarGridSize(int filas, int columnas)
    {
        if (gridLayout != null)
        {
            gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            gridLayout.constraintCount = columnas;
        }
    }

    private void ActualizarTiempoRonda(float tiempo)
    {
       

        if (barraTiempoRonda != null && juego != null)
        {
            barraTiempoRonda.fillAmount = tiempo / juego.tiempoPorEnsayo;
            barraTiempoRonda.color = tiempo < 0.5f ? colorFeedbackError : colorIntruso;
        }
    }

    private void ActualizarPuntuacion(int aciertos, int total)
    {
        if (textoAciertos != null)
            textoAciertos.text = $"{aciertos}";

        if (textoTotalCasos != null)
            textoTotalCasos.text = $"{aciertos}/{total}";
    }

    private void ActualizarNivel(int nivel)
    {
        if (textoNivel != null)
            textoNivel.text = $"Nivel {nivel}";

        if (lupaScript != null)
            lupaScript.ActualizarParametrosPorNivel(nivel);
    }




    private void OnDestroy()
    {
        if (juego != null)
        {
            juego.OnTiempoRondaActualizado -= ActualizarTiempoRonda;
            juego.OnPuntuacionActualizada -= ActualizarPuntuacion;
            juego.OnNivelActualizado -= ActualizarNivel;
            juego.OnGridSizeChanged -= ActualizarGridSize;
        }

        if (lupaCoroutine != null)
            StopCoroutine(lupaCoroutine);
    }
}
