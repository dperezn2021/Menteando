using TMPro;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    private BaseGame juegoActual;

    public float duracionPartida = 120.0f;
    private float tiempoRestante;
    private bool estaJugando;

    public TextMeshProUGUI textoTiempoRestante;

    private string nombreJuego;


    public GameObject panelFinPartida;

    public TextMeshProUGUI txtPrecision;
    public TextMeshProUGUI txtVelocidad;

    public TMP_InputField inputDuracion;

    public BaseGame prefabJuego;

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);

        panelFinPartida.SetActive(false);

    }

    public void EmpezarJuego(BaseGame juego)
    {
        juegoActual = juego;
        nombreJuego = juego.nombre;

        tiempoRestante = duracionPartida;
        estaJugando = true;

        if (textoTiempoRestante != null)
            textoTiempoRestante.text = duracionPartida.ToString();

    }

    public void ReiniciarPartida()
    {
        float nuevaDuracion = duracionPartida;

        if (inputDuracion != null && int.TryParse(inputDuracion.text, out int d) && d > 0)
            nuevaDuracion = d;

        duracionPartida = nuevaDuracion;
        tiempoRestante = duracionPartida;
        estaJugando = true;

        ((MathGame)juegoActual).ResetGame();

        panelFinPartida.SetActive(false);
    }



    private void Update()
    {
        if (!estaJugando) return;

        tiempoRestante -= Time.deltaTime;

        if (textoTiempoRestante != null)
            textoTiempoRestante.text = Mathf.Ceil(tiempoRestante).ToString();

        if (tiempoRestante <= 0)
        {
            AcabarJuego();
        }
    }
    private void MostrarPanelFinal(CognitiveMetrics m)
    {
        // Estadísticas básicas
        txtPrecision.text = "Precisión: " + (m.atencionSostenida * 100f).ToString("F0") + "%";
        txtVelocidad.text = "Velocidad cognitiva: " + (m.velocidadCognitiva * 100f).ToString("F0") + "%";

        // Duración predeterminada
        inputDuracion.text = duracionPartida.ToString();

        panelFinPartida.SetActive(true);
    }

    private void AcabarJuego()
    {
        estaJugando = false;

        CognitiveMetrics metricas = juegoActual.CalcularCognicion();
        WebExporter.EnviarSesion(nombreJuego, metricas);

        // Mostrar estadísticas
        MostrarPanelFinal(metricas);

        Debug.Log("Juego finalizado. Métricas enviadas.");
    }

}
