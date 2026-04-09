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
        ConfigurarBotones();
        MostrarSolo(pantallaInicio);
        cristalCanvas.SetActive(false);
    }

    void Update()
    {
        if (!GameManager.Instance.estaJugando)
            return;

        if (Input.GetKeyDown(KeyCode.Escape))
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
            sliderMusica.value = AudioManager.Instance.musicaVolumen;
            sliderSFX.value = AudioManager.Instance.sfxVolumen;

            pantallaAnterior = pantallaInicio;
            MostrarSolo(pantallaAjustes);
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
            sliderMusica.value = AudioManager.Instance.musicaVolumen;
            sliderSFX.value = AudioManager.Instance.sfxVolumen;

            MostrarSolo(pantallaAjustes);
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

    void MostrarSolo(GameObject pantalla)
    {
        pantallaInicio.SetActive(pantalla == pantallaInicio);
        UIPartida.SetActive(pantalla == UIPartida);
        pantallaPausa.SetActive(pantalla == pantallaPausa);
        pantallaAjustes.SetActive(pantalla == pantallaAjustes);
        pantallaFinPartida.SetActive(pantalla == pantallaFinPartida);
    }

    void IniciarPartida()
    {
        Time.timeScale = 1f;

        MostrarSolo(UIPartida);
        cristalCanvas.SetActive(true);

        var juego = FindAnyObjectByType<MisionOrbitalGame>(FindObjectsInactive.Include);
        if (juego != null)
            juego.sistemaOrbital.SetActive(true);

        GameManager.Instance.EmpezarJuego(juego);
    }

    void ReiniciarPartida()
    {
        Time.timeScale = 1f;

        MostrarSolo(UIPartida);
        cristalCanvas.SetActive(true);

        var juego = FindAnyObjectByType<MisionOrbitalGame>(FindObjectsInactive.Include);
        if (juego != null)
            juego.sistemaOrbital.SetActive(true);

        GameManager.Instance.ReiniciarPartida();
    }


    void VolverAlMenu()
    {
        Time.timeScale = 1f;

        MostrarSolo(pantallaInicio);

        // Ocultar HUD
        cristalCanvas.SetActive(false);

        // Ocultar rosco
        var juego = FindAnyObjectByType<MisionOrbitalGame>(FindObjectsInactive.Include);
        if (juego != null)
            juego.sistemaOrbital.SetActive(false);

        GameManager.Instance.VolverAlMenu();
    }

    void TogglePausa()
    {
        pausado = !pausado;

        if (pausado)
        {
            MostrarSolo(pantallaPausa);
            cristalCanvas.SetActive(false);
            Time.timeScale = 0f;
        }
        else
        {
            MostrarSolo(UIPartida);
            cristalCanvas.SetActive(true);
            Time.timeScale = 1f;
        }
    }


    public void MostrarResultados(CognitiveMetrics m)
    {
        MostrarSolo(pantallaFinPartida);
        cristalCanvas.SetActive(false);
        Time.timeScale = 0f;
    }
}
