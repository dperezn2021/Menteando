using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    private BaseGame juegoActual;
    public float duracionPartida = 20f;
    public float tiempoRestante;
    public bool estaJugando;

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

        juegoActual.ResetGame();
    }

    public void ReiniciarPartida()
    {
        tiempoRestante = duracionPartida;
        estaJugando = true;
        AudioManager.Instance.MusicaJuego();

        juegoActual.ResetGame();
    }

    public void VolverAlMenu()
    {
        AudioManager.Instance.MusicaMenu();
        estaJugando = false;
    }

    private void Update()
    {
        if (!estaJugando) return;

        tiempoRestante -= Time.deltaTime;

        if (tiempoRestante <= 0)
            AcabarJuego();
    }

    private void AcabarJuego()
    {
        estaJugando = false;

        var metricas = juegoActual.CalcularCognicion();
        var ponderadas = juegoActual.AplicarPesos(metricas);
        AudioManager.Instance.MusicaVictoria();

        juegoActual.OnGameFinished();
        UIManager.Instance.MostrarResultados(ponderadas);
    }
}
