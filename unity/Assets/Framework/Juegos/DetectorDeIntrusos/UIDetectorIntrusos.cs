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
    }

    private void ConfigurarGridLayout()
    {
        if (gridLayout == null) return;

        // Calcular tamaño de celda según pantalla
        float anchoPantalla = ((RectTransform)gridLayout.transform).rect.width;
        float nuevoAnchoCelda = Mathf.Clamp(anchoPantalla / 6f, 70f, 120f);

        gridLayout.cellSize = new Vector2(nuevoAnchoCelda, nuevoAnchoCelda);
        gridLayout.spacing = new Vector2(espaciado, espaciado);
        gridLayout.startAxis = GridLayoutGroup.Axis.Horizontal;
        gridLayout.childAlignment = TextAnchor.MiddleCenter;
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