    using TMPro;
    using UnityEngine;
    using UnityEngine.Rendering;

    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance;

        private BaseGame juegoActual;

        public float duracionPartida = 120.0f;
        private float tiempoRestante;
        private bool estaJugando;

        public TextMeshProUGUI textoTiempoRestante;

        private string nombreJuego;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void EmpezarJuego(BaseGame juego)
        {
            juegoActual = juego;
            nombreJuego = juego.nombre;
            tiempoRestante = duracionPartida;
            estaJugando = true;
            textoTiempoRestante.text = duracionPartida.ToString();
        }

        private void Update()
        {
            if (!estaJugando) return;

            tiempoRestante -= Time.deltaTime;
            textoTiempoRestante.text = Mathf.Ceil(tiempoRestante).ToString();

            if(tiempoRestante <= 0)
            {
                AcabarJuego(nombreJuego);
            }
        }

        private void AcabarJuego(string nombreJuego)
        {
            estaJugando= false;

            GameMetrics metricas = juegoActual.GetMetricas();
            ScoreManager.Instance.ProcesarMetricas(metricas);
            SessionManager.Instance.GuardarIntento(metricas);

            WebExporter.EnviarSesion(nombreJuego, metricas);

        }
    }
