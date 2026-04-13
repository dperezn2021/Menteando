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
    public TextMeshProUGUI textoTiempoRonda;
    public TextMeshProUGUI textoAciertos;
    public TextMeshProUGUI textoNivel;
    public TextMeshProUGUI textoFeedback;
    public TextMeshProUGUI textoTotalCasos;

    [Header("Barra de tiempo")]
    public Image barraTiempo;


    [Header("Efectos Lupa")]
    public float lupaVelocidadMovimiento = 0.5f;
    public float lupaRadioMovimiento = 150f;
    public float lupaVelocidadRotacion = 0.5f;

    [Header("Colores")]
    public Color colorIntruso = new Color(0.96f, 0.77f, 0.26f, 1f);
    public Color colorNormal = new Color(0.4f, 0.5f, 0.6f, 1f);
    public Color colorFeedbackAcierto = new Color(0.3f, 0.8f, 0.5f, 1f);
    public Color colorFeedbackError = new Color(0.9f, 0.4f, 0.4f, 1f);

    [Header("Tamaño celdas")]
    public float anchoCelda = 100f;
    public float altoCelda = 100f;
    public float espaciado = 15f;

    // Posiciones fijas para los elementos decorativos
    private Vector2 posicionFijaClip;
    private Vector2 posicionFijaChincheta;
    private bool posicionesInicializadas = false;

    private Coroutine lupaCoroutine;
    private Vector3 lupaPosicionInicial;
    private float anguloLupa = 0;

    private void Start()
    {
        if (juego == null)
            juego = FindAnyObjectByType<DetectorDeIntrusosGame>();

        if (juego != null)
        {
            juego.OnTiempoRondaActualizado += ActualizarTiempoRonda;
            juego.OnPuntuacionActualizada += ActualizarPuntuacion;
            juego.OnNivelActualizado += ActualizarNivel;  // 🔥 Suscribirse
            juego.OnFeedback += MostrarFeedback;
            juego.OnRondaTerminada += LimpiarFeedback;
            juego.OnGridSizeChanged += ActualizarGridSize;
        }

        // 🔥 Buscar la lupa si no está asignada
        if (lupaScript == null)
            lupaScript = FindAnyObjectByType<LupaFlotante>();

        ConfigurarGridLayout();
    }



    private void ConfigurarGridLayout()
    {
        if (gridLayout == null) return;

        gridLayout.cellSize = new Vector2(anchoCelda, altoCelda);
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
        if (textoTiempoRonda != null)
            textoTiempoRonda.text = $"{tiempo:F1}s";

        if (barraTiempo != null && juego != null)
        {
            barraTiempo.fillAmount = tiempo / juego.tiempoPorEnsayo;
            barraTiempo.color = tiempo < 0.5f ? colorFeedbackError : colorIntruso;
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

    private void MostrarFeedback(bool acierto)
    {
        string mensaje = acierto ? "CORRECTO!" : "ERROR!";

        if (textoFeedback != null)
        {
            textoFeedback.text = mensaje;
            textoFeedback.fontSize = 40;
            textoFeedback.alignment = TextAlignmentOptions.Center;

            if (acierto)
                textoFeedback.color = Color.green;
            else
                textoFeedback.color = Color.red;

            Invoke("LimpiarFeedback", 0.5f);
        }
    }

    private void LimpiarFeedback()
    {
        if (textoFeedback != null)
        {
            textoFeedback.text = "";
        }
    }

    private void OnDestroy()
    {
        if (juego != null)
        {
            juego.OnTiempoRondaActualizado -= ActualizarTiempoRonda;
            juego.OnPuntuacionActualizada -= ActualizarPuntuacion;
            juego.OnNivelActualizado -= ActualizarNivel;
            juego.OnFeedback -= MostrarFeedback;
            juego.OnRondaTerminada -= LimpiarFeedback;
            juego.OnGridSizeChanged -= ActualizarGridSize;
        }

        if (lupaCoroutine != null)
            StopCoroutine(lupaCoroutine);
    }
}