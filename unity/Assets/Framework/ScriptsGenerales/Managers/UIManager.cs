using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance;

    [Header("Pantallas")]
    public GameObject pantallaInicio;
    public GameObject UIPartida;
    public GameObject pantallaPausa;
    public GameObject pantallaAjustes;
    public GameObject pantallaFinPartida;
    private GameObject pantallaAnterior;



    [Header("HUD espacial")]
    public GameObject cristalCanvas;

    [Header("Botones")]
    public Button botonIniciar;
    public Button botonAjustesInicio;
    public Button botonPausa;
    public Button botonReanudar;
    public Button botonReiniciar;
    public Button botonMenu;
    public Button botonAjustesPausa;
    public Button botonCerrarAjustes;
    public Button botonJugarDeNuevo;
    public Button botonMenuFin;
    public Slider sliderMusica;
    public Slider sliderSFX;


    private bool pausado = false;

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    private void Start()
    {
        ConfigurarSafeArea();
        ConfigurarBotones();
        MostrarSolo(pantallaInicio);
        AudioManager.Instance.MusicaMenu();
        if(cristalCanvas == null)
        {
            return;
        }
        else
        {
            cristalCanvas.SetActive(false);

        }
    }

    private void ConfigurarSafeArea()
    {
        AplicarSafeAreaSiProcede(pantallaInicio);
        AplicarSafeAreaSiProcede(UIPartida);
        AplicarSafeAreaSiProcede(pantallaPausa);
        AplicarSafeAreaSiProcede(pantallaAjustes);
        AplicarSafeAreaSiProcede(pantallaFinPartida);
        AplicarSafeAreaSiProcede(cristalCanvas);
    }

    private void AplicarSafeAreaSiProcede(GameObject pantalla)
    {
        if (pantalla == null || pantalla.GetComponent<RectTransform>() == null)
            return;

        SafeAreaFitter fitter = pantalla.GetComponent<SafeAreaFitter>();
        if (fitter == null)
            fitter = pantalla.AddComponent<SafeAreaFitter>();

        fitter.ApplySafeArea();

        ResponsiveHudTextFitter textFitter = pantalla.GetComponent<ResponsiveHudTextFitter>();
        if (textFitter == null)
            textFitter = pantalla.AddComponent<ResponsiveHudTextFitter>();

        textFitter.ApplyNow();
    }

    void Update()
    {
        if (!GameManager.Instance.estaJugando)
            return;

        if (Input.GetKeyDown(KeyCode.Escape) && GameManager.Instance.estaJugando)
            TogglePausa();
    }



    void ConfigurarBotones()
    {
        botonIniciar.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            IniciarPartida();
        });

        botonAjustesInicio.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            pantallaAnterior = pantallaInicio;
            MusicaAbrirAjustes(); 
        });

        botonPausa.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            TogglePausa();
        });

        botonReanudar.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            TogglePausa();
        });

        botonReiniciar.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            ReiniciarPartida();
        });

        botonMenu.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            VolverAlMenu();
        });

        botonAjustesPausa.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            pantallaAnterior = pantallaPausa;
            MusicaAbrirAjustes();
        });

        botonCerrarAjustes.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            MostrarSolo(pantallaAnterior);
        });

        botonJugarDeNuevo.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            ReiniciarPartida();
        });

        botonMenuFin.onClick.AddListener(() => {
            AudioManager.Instance.Click();
            VolverAlMenu();
        });
    }
    public void MusicaAbrirAjustes()
    {
        // 1. Quitar listeners para evitar que manden 0
        sliderMusica.onValueChanged.RemoveAllListeners();
        sliderSFX.onValueChanged.RemoveAllListeners();

        // 2. Sincronizar sliders con el AudioManager
        sliderMusica.value = AudioManager.Instance.musicaVolumen;
        sliderSFX.value = AudioManager.Instance.sfxVolumen;

        // 3. Volver a activar listeners
        sliderMusica.onValueChanged.AddListener(AudioManager.Instance.SetMusicaVolumen);
        sliderSFX.onValueChanged.AddListener(AudioManager.Instance.SetSFXVolumen);

        // 4. Mostrar panel
        MostrarSolo(pantallaAjustes);
    }

    void MostrarSolo(GameObject pantalla)
    {
        pantallaInicio.SetActive(pantalla == pantallaInicio);
        UIPartida.SetActive(pantalla == UIPartida);
        pantallaPausa.SetActive(pantalla == pantallaPausa);
        pantallaAjustes.SetActive(pantalla == pantallaAjustes);
        pantallaFinPartida.SetActive(pantalla == pantallaFinPartida);
        ConfigurarSafeArea();
    }

    void ReiniciarPartida()
    {
        
        Time.timeScale = 1f;
        pausado = false;
        
        // 🔥 Asegurar que la UI de juego está visible
        MostrarSolo(UIPartida);
        
        if (cristalCanvas != null)
            cristalCanvas.SetActive(true);

        // 🔥 Forzar la recreación del grid
        var juego = FindAnyObjectByType<BaseGame>(FindObjectsInactive.Include);
        if (juego != null)
        {
            // Limpiar cualquier estado residual
            juego.ResetGame();
            GameManager.Instance.ReiniciarPartida();
        }
        else
        {
        }
    }

    void IniciarPartida()
    {

        Time.timeScale = 1f;
        MostrarSolo(UIPartida);

        if (cristalCanvas != null)
            cristalCanvas.SetActive(true);

        var juego = FindAnyObjectByType<BaseGame>(FindObjectsInactive.Include);

        if (juego == null)
        {
            return;
        }


        // 🔥 NO llamar a ResetGame aquí (GameManager.EmpezarJuego lo hará)
        GameManager.Instance.EmpezarJuego(juego);
    }

    void VolverAlMenu()
    {
        Time.timeScale = 1f;
        pausado = false;
        MostrarSolo(pantallaInicio);

        // Ocultar HUD
        if (cristalCanvas == null)
        {
            return;
        }
        else
        {
            cristalCanvas.SetActive(false);

        }


        var juego = FindAnyObjectByType<MisionOrbitalGame>(FindObjectsInactive.Include);
        if (juego != null)
            juego.sistemaOrbital.SetActive(false);

        GameManager.Instance.VolverAlMenu();
    }

    void TogglePausa()
    {
        pausado = !pausado;

        // Buscar el juego actual
        var juego = FindAnyObjectByType<BaseGame>(FindObjectsInactive.Include);

        if (pausado)
        {
            MostrarSolo(pantallaPausa);
            if (cristalCanvas != null)
                cristalCanvas.SetActive(false);

            // 🔥 NO tocar Time.timeScale!
            // Time.timeScale se mantiene en 1f

            // Notificar al GameManager que está pausado
            GameManager.Instance.PausarJuego(true);
        }
        else
        {
            MostrarSolo(UIPartida);
            if (cristalCanvas != null)
                cristalCanvas.SetActive(true);

            // Notificar al GameManager que continúa
            GameManager.Instance.PausarJuego(false);
        }
    }

    public void MostrarResultados(CognitiveMetrics m)
    {
        MostrarSolo(pantallaFinPartida);
        if (cristalCanvas == null)
        {
            return;
        }
        else
        {
            cristalCanvas.SetActive(false);

        }
        Time.timeScale = 0f;
    }
}
