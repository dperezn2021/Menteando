using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    private BaseGame juegoActual;
    public float duracionPartida = 20f;
    public float tiempoRestante;
    public bool estaJugando;
    private bool juegoPausadoGlobal = false;

    private void Awake()
    {
        Application.runInBackground = true;

        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else Destroy(gameObject);
    }

    public void EmpezarJuego(BaseGame juego)
    {
        AudioManager.Instance.MusicaJuego();
        juegoActual = juego;
        tiempoRestante = duracionPartida;
        estaJugando = true;
        juegoPausadoGlobal = false;
        Time.timeScale = 1f;  // Asegurar tiempo normal

        juegoActual.ResetGame();
    }

    public void ReiniciarPartida()
    {
        tiempoRestante = duracionPartida;
        estaJugando = true;
        juegoPausadoGlobal = false;
        Time.timeScale = 1f;
        AudioManager.Instance.MusicaJuego();

        if (juegoActual != null)
        {
            juegoActual.ResetGame();
            juegoActual.OnGameStart();
        }
    }

    public void VolverAlMenu()
    {
        AudioManager.Instance.MusicaMenu();
        estaJugando = false;
        juegoPausadoGlobal = false;
        Time.timeScale = 1f;
    }

    public void PausarJuego(bool pausar)
    {
        juegoPausadoGlobal = pausar;

        Debug.Log($"🎮 GameManager.PausarJuego - pausar: {pausar}");

        if (juegoActual != null)
            juegoActual.PausarJuego(pausar);
    }

    public bool EstaPausado()
    {
        return juegoPausadoGlobal;
    }

    private void Update()
    {
        if (!estaJugando || juegoPausadoGlobal) return;

        tiempoRestante -= Time.deltaTime;

        if (tiempoRestante <= 0)
            AcabarJuego();
    }

    private void AcabarJuego()
    {
        estaJugando = false;
        juegoPausadoGlobal = false;

        if (juegoActual != null)
        {
            var metricas = juegoActual.CalcularCognicion();
            var ponderadas = juegoActual.AplicarPesos(metricas);

            juegoActual.OnGameFinished();

            AudioManager.Instance.MusicaVictoria();
            UIManager.Instance.MostrarResultados(ponderadas);
        }
    }
}