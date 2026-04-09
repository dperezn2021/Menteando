//using UnityEngine;
//using UnityEngine.UI;
//using TMPro;
//using System.Collections;

//public class GameUIManager : MonoBehaviour
//{
//    public static GameUIManager Instance;

//    [Header("Pantallas")]
//    public GameObject pantallaInicio;
//    public GameObject UIPartida;
//    public GameObject pantallaPausa;
//    public GameObject pantallaAjustes;
//    public GameObject pantallaFinPartida;

//    public GameObject cristalCanvas;


//    [Header("Botones")]
//    public Button botonIniciar;
//    public Slider sliderDificultadInicial;
//    public Button botonPausa;
//    public Button botonReanudar;
//    public Button botonReiniciar;
//    public Button botonMenuPrincipal;
//    public Button botonAjustes;
//    public Slider sliderMusica;
//    public Slider sliderSFX;
//    public Button botonCerrarAjustes;
//    public Button botonJugarDeNuevo;
//    public Button botonVolverAlMenu;

//    [Header("Textos")]
//    public TMP_Text textoDificultadSeleccionada;
//    public TMP_Text textoTiempoRestante;
//    public TMP_Text textoRacha;
//    public TMP_Text textoNivel;

//    [Header("Audio - Fuentes")]
//    public AudioSource musicaSource;
//    public AudioSource sfxSource;

//    [Header("Audio - Clips")]
//    public AudioClip musicaFondo;
//    public AudioClip musicaMenu;
//    public AudioClip musicaWin;
//    public AudioClip sonidoClick;
//    public AudioClip sonidoAcierto;
//    public AudioClip sonidoTecla;
//    public AudioClip sonidoError;
//    public AudioClip sonidoExtra;
//    public AudioClip sonidoNivelUp;

//    private bool isPaused = false;

//    void Awake()
//    {
//        if (Instance == null) Instance = this;
//        else Destroy(gameObject);

//        CargarPreferenciasAudio();
//    }

//    void Start()
//    {
//        Time.timeScale = 1f; // 🔥 evita bugs de pausa heredada
//        ConfigurarBotones();
//        OcultarPantallasMenos(pantallaInicio);

//        // Iniciar música de fondo
//        ReproducirMusicaFondo(musicaMenu);
//    }
//    void CargarPreferenciasAudio()
//    {
//        float musicVol = PlayerPrefs.GetFloat("MusicVolume", 0.5f);
//        float sfxVol = PlayerPrefs.GetFloat("SFXVolume", 0.5f);

//        if (musicaSource) musicaSource.volume = musicVol;
//        if (sfxSource) sfxSource.volume = sfxVol;
//        if (sliderMusica) sliderMusica.value = musicVol;
//        if (sliderSFX) sliderSFX.value = sfxVol;
//    }

//    void ConfigurarBotones()
//    {
//        if (botonIniciar) botonIniciar.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            IniciarPartida();
//        });
//        if (botonPausa) botonPausa.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            TogglePausa();
//        });
//        if (botonReanudar) botonReanudar.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            TogglePausa();
//        });
//        if (botonReiniciar) botonReiniciar.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            ReiniciarPartida();
//        });
//        if (botonMenuPrincipal) botonMenuPrincipal.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            VolverAlMenu();
//        });
//        if (botonAjustes) botonAjustes.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            MostrarPanel(pantallaAjustes, true);
//            MostrarPanel(pantallaPausa, false);
//        });
//        if (botonCerrarAjustes) botonCerrarAjustes.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            MostrarPanel(pantallaAjustes, false);
//            MostrarPanel(pantallaPausa, true);
//        });
//        if (botonJugarDeNuevo) botonJugarDeNuevo.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            ReiniciarPartida();
//        });
//        if (botonVolverAlMenu) botonVolverAlMenu.onClick.AddListener(() => {
//            ReproducirSonido(sonidoClick);
//            VolverAlMenu();
//        });

//        if (sliderMusica) sliderMusica.onValueChanged.AddListener(SetMusicVolume);
//        if (sliderSFX) sliderSFX.onValueChanged.AddListener(SetSFXVolume);
//    }

//    void IniciarPartida()
//    {
//        cristalCanvas.SetActive(true);

//        Debug.Log("=== INICIAR PARTIDA ===");

//        // Verificar que sliderDificultadInicial existe antes de usarlo
//        if (sliderDificultadInicial != null && DifficultyManager.Instance != null)
//        {
//            int dificultadElegida = (int)sliderDificultadInicial.value;
//            DifficultyManager.Instance.nivelActual = dificultadElegida;
//        }

//        OcultarPantallasMenos(UIPartida);
//        StartCoroutine(IniciarJuegoConDelay());
//    }

//    IEnumerator IniciarJuegoConDelay()
//    {
//        yield return null;

//        // Buscar CUALQUIER juego que herede de BaseGame
//        BaseGame juego = FindFirstObjectByType<BaseGame>();

//        if (juego != null && GameManager.Instance != null)
//        {
//            Debug.Log($"Juego encontrado: {juego.GetType().Name}, llamando a EmpezarJuego");
//            GameManager.Instance.EmpezarJuego(juego);
//        }
//        else if (juego == null)
//        {
//            Debug.LogError("No se encuentra ningún juego que herede de BaseGame en la escena");
//        }
//        else if (GameManager.Instance == null)
//        {
//            Debug.LogError("GameManager.Instance es NULL");
//        }
//    }

//    void TogglePausa()
//    {
//        isPaused = !isPaused;
//        if (isPaused)
//        {
//            MostrarPanel(pantallaPausa, true);
//            Time.timeScale = 0f;
//            if (musicaSource) musicaSource.Pause();
//        }
//        else
//        {
//            MostrarPanel(pantallaPausa, false);
//            Time.timeScale = 1f;
//            if (musicaSource) musicaSource.UnPause();
//        }
//    }

//    void ReiniciarPartida()
//    {
//        Time.timeScale = 1f;
//        isPaused = false;
//        OcultarPantallasMenos(UIPartida);
//        if (GameManager.Instance != null)
//            GameManager.Instance.ReiniciarPartida();
//    }

//    void VolverAlMenu()
//    {
//        Time.timeScale = 1f;
//        isPaused = false;
//        cristalCanvas.SetActive(false);

//        OcultarPantallasMenos(pantallaInicio);
//        if (GameManager.Instance != null)
//            GameManager.Instance.VolverAlMenu();
//        ReproducirMusicaFondo(musicaMenu);
//    }

//    void MostrarPanel(GameObject panel, bool visible)
//    {
//        if (panel != null) panel.SetActive(visible);
//    }

//    void SetMusicVolume(float vol)
//    {
//        if (musicaSource) musicaSource.volume = vol;
//        PlayerPrefs.SetFloat("MusicVolume", vol);
//    }

//    void SetSFXVolume(float vol)
//    {
//        if (sfxSource) sfxSource.volume = vol;
//        PlayerPrefs.SetFloat("SFXVolume", vol);
//    }

//    public void MostrarResultados(CognitiveMetrics metrics)
//    {
//        cristalCanvas.SetActive(false);
        
//        OcultarPantallasMenos(pantallaFinPartida);

//        if (botonPausa != null) botonPausa.gameObject.SetActive(false);
//        Time.timeScale = 0f;
//        ReproducirMusicaFondo(musicaWin);
//    }

//    private void OcultarPantallasMenos(GameObject pantalla)
//    {
//        GameObject[] pantallas = { pantallaInicio, UIPartida, pantallaPausa, pantallaAjustes, pantallaFinPartida };
//        foreach (GameObject p in pantallas)
//            if (p != null) p.SetActive(p == pantalla);
//    }

//    void Update()
//    {
//        // Texto dificultad seleccionada
//        if (textoDificultadSeleccionada != null && sliderDificultadInicial != null)
//        {
//            textoDificultadSeleccionada.text = ((int)sliderDificultadInicial.value).ToString();
//        }

//        // Texto racha
//        if (textoRacha != null && OperacionesEncadenadasGame.Instance != null)
//        {
//            textoRacha.text = "Racha: " + OperacionesEncadenadasGame.Instance.rachaActual;
//        }

//        // Texto nivel
//        if (textoNivel != null && DifficultyManager.Instance != null)
//        {
//            textoNivel.text = "Nivel: " + DifficultyManager.Instance.nivelActual;
//        }

//        // Texto tiempo restante
//        if (textoTiempoRestante != null && GameManager.Instance != null)
//        {
//            textoTiempoRestante.text = "Tiempo: " + Mathf.CeilToInt(GameManager.Instance.tiempoRestante).ToString();
//        }

//        // Tecla Escape para pausa
//        if (Input.GetKeyDown(KeyCode.Escape))
//        {
//            // Verificar que las pantallas existen antes de acceder a activeSelf
//            if (pantallaFinPartida != null && pantallaFinPartida.activeSelf) return;
//            if (pantallaInicio != null && pantallaInicio.activeSelf) return;
//            TogglePausa();
//        }
//    }

//    // ========== MÉTODOS PÚBLICOS PARA REPRODUCIR SONIDOS ==========

//    public void ReproducirMusicaFondo(AudioClip musica)
//    {
//        // Solo intentar reproducir si musicaSource existe y el clip no es nulo
//        if (musicaSource == null)
//        {
//            Debug.LogWarning("⚠️ ReproducirMusicaFondo: musicaSource es NULL");
//            return;
//        }

//        if (musica == null)
//        {
//            Debug.LogWarning("⚠️ ReproducirMusicaFondo: El clip de música es NULL");
//            return;
//        }

//        Debug.Log($"Reproduciendo: {musica.name}");
//        musicaSource.Stop();
//        musicaSource.volume = PlayerPrefs.GetFloat("MusicVolume", 0.5f);
//        musicaSource.mute = false;
//        musicaSource.clip = musica;
//        musicaSource.loop = true;
//        musicaSource.Play();
//    }

//    public void ReproducirSonido(AudioClip clip)
//    {
//        // Solo reproducir si sfxSource existe y el clip no es nulo
//        if (sfxSource == null)
//        {
//            Debug.LogWarning("⚠️ ReproducirSonido: sfxSource es NULL");
//            return;
//        }

//        if (clip == null)
//        {
//            // No mostrar warning porque muchos sonidos pueden no estar asignados
//            return;
//        }

//        sfxSource.PlayOneShot(clip);
//    }

//    public void ReproducirAcierto()
//    {
//        if (sonidoAcierto != null)
//            ReproducirSonido(sonidoAcierto);
//    }

//    public void ReproducirError()
//    {
//        if (sonidoError != null)
//            ReproducirSonido(sonidoError);
//    }

//    public void ReproducirExtra()
//    {
//        if (sonidoExtra != null)
//            ReproducirSonido(sonidoExtra);
//    }

//    public void ReproducirNivelUp()
//    {
//        if (sonidoNivelUp != null)
//            ReproducirSonido(sonidoNivelUp);
//    }
//}