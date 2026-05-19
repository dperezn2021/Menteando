using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class DobleCanalGame : BaseGame
{
    [Header("Control Orbital")]
    [SerializeField] private string objetivoNombre = "escudo";
    [SerializeField] private string distractorNombre = "peligro";
    [SerializeField] private Color objetivoColor = new Color(0.38f, 0.90f, 1f);
    [SerializeField] private Color distractorColor = new Color(1f, 0.32f, 0.36f);
    [SerializeField] private bool forzarLandscapeEnMovil = true;

    [Header("Runner")]
    [SerializeField] private GameObject prefabRobot;
    [SerializeField] private GameObject prefabObstaculoBajo;
    [SerializeField] private GameObject prefabObstaculoAlto;
    [SerializeField] private Transform suelo;
    [SerializeField] private float fuerzaSalto = 8f;
    [SerializeField] private float gravedad = 20f;
    [SerializeField] private float alturaSuelo = 0f;
    [SerializeField] private float posicionRunnerX = -3.15f;
    [SerializeField] private float offsetSpawnObstaculo = 6.2f;
    [SerializeField] private float distanciaEntreObstaculos = 8.4f;
    [SerializeField] private float distanciaEntreObstaculosMinima = 6.3f;
    [SerializeField] private float intervaloMinimoObstaculos = 2.00f;
    [SerializeField] private float intervaloMinimoObstaculosNivelAlto = 1.70f;
    [SerializeField] private float radioHorizontalColision = 0.85f;
    [SerializeField] private float tiempoMaximoSaltoSostenido = 0.34f;
    [SerializeField] private float multiplicadorGravedadSaltoSostenido = 0.35f;

    [Header("Estimulos")]
    [SerializeField, Range(0.1f, 0.9f)] private float probabilidadObjetivo = 0.50f;
    [SerializeField] private float esperaEstimuloNivel1Min = 0.80f;
    [SerializeField] private float esperaEstimuloNivel1Max = 1.55f;
    [SerializeField] private float esperaEstimuloNivel10Min = 0.35f;
    [SerializeField] private float esperaEstimuloNivel10Max = 0.75f;

    [Header("Dificultad")]
    [SerializeField] private AnimationCurve curvaVelocidadRunner;
    [SerializeField] private AnimationCurve curvaDuracionEstimulo;

    [Header("UI")]
    [SerializeField] private DobleCanalUI ui;

    private GameObject personajeActivo;
    private GameObject sueloVisualRuntime;
    private bool personajeCreadoEnRuntime;
    private Vector3 escalaOriginalPersonaje = Vector3.one;
    private readonly List<GameObject> obstaculosActivos = new List<GameObject>();
    private readonly Dictionary<GameObject, ObstaculoRuntime> datosObstaculos = new Dictionary<GameObject, ObstaculoRuntime>();

    private bool jugando;
    private bool finalizado;
    private bool enSuelo = true;
    private bool esperandoRespuesta;
    private bool feedbackActivo;
    private float velocidadVertical;
    private float distanciaRecorrida;
    private float distanciaUltimoObstaculo;
    private float tiempoUltimoObstaculo;
    private float tiempoSaltoSostenido;
    private bool mantenerSalto;
    private int nivelActual = 1;
    private float tiempoRestanteInterno;

    private Estimulo estimuloActual;
    private Coroutine rutinaInicio;
    private Coroutine rutinaEstimulos;
    private Coroutine rutinaOmision;
    private Coroutine rutinaFeedbackCentral;
    private Coroutine rutinaFeedbackRadar;
    private Coroutine rutinaFeedbackRunner;
    private Coroutine rutinaSalto;

    private int aciertosObjetivo;
    private int omisionesObjetivo;
    private int aciertosNoGo;
    private int erroresImpulsivos;
    private int obstaculosEsquivados;
    private int colisiones;
    private int mejorRacha;
    private int rachaActual;
    private int distractoresSeguidos;
    private bool ultimoObstaculoFueAlto;
    private int nivelMaximoAlcanzado;
    private readonly List<float> tiemposReaccion = new List<float>();

    private void Awake()
    {
        nombre = "doble canal";
        InicializarEstimulos();
        InicializarCurvas();
    }

    private void Start()
    {
        CachearUI();
    }

    public override void ResetGame()
    {
        DetenerRutinas();

        juegoPausado = false;
        jugando = false;
        finalizado = false;
        esperandoRespuesta = false;
        feedbackActivo = false;
        velocidadVertical = 0f;
        distanciaRecorrida = 0f;
        distanciaUltimoObstaculo = 0f;
        tiempoUltimoObstaculo = -999f;
        tiempoSaltoSostenido = 0f;
        mantenerSalto = false;
        enSuelo = true;
        nivelActual = 1;
        tiempoRestanteInterno = 60f;

        aciertosObjetivo = 0;
        omisionesObjetivo = 0;
        aciertosNoGo = 0;
        erroresImpulsivos = 0;
        obstaculosEsquivados = 0;
        colisiones = 0;
        mejorRacha = 0;
        rachaActual = 0;
        distractoresSeguidos = 0;
        ultimoObstaculoFueAlto = false;
        nivelMaximoAlcanzado = 1;
        tiemposReaccion.Clear();

        DifficultyManager.Instance?.ResetDifficulty(1);

        LimpiarObstaculos();
        ConfigurarOrientacion();
        ConfigurarCamara();
        PrepararSuelo();
        PrepararPersonaje();

        CachearUI();
        ui?.EnsureInitialized(this);
        ui?.ConfigurarUI();
        ActualizarReglaUI();
        ActualizarUI();

        rutinaInicio = StartCoroutine(IniciarPartida());
    }

    private void ConfigurarCamara()
    {
        Camera cam = Camera.main;
        if (cam != null)
        {
            cam.rect = new Rect(0f, 0f, 0.5f, 1f);
            cam.orthographic = true;
            cam.transform.position = new Vector3(0f, 1.6f, -10f);
            cam.orthographicSize = 3.7f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.02f, 0.04f, 0.08f);
        }
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    private IEnumerator IniciarPartida()
    {
        ui?.MostrarFeedback("preparado", Color.white);
        yield return EsperarGameplay(0.75f);

        ui?.MostrarFeedback("ya", new Color(0.25f, 1f, 0.45f));
        yield return EsperarGameplay(0.35f);

        ui?.OcultarFeedback();
        jugando = true;
        rutinaEstimulos = StartCoroutine(CicloEstimulos());
        StartCoroutine(ControlFinPartida());
    }

    private IEnumerator ControlFinPartida()
    {
        while (jugando && !finalizado)
        {
            float tiempoActual = ObtenerTiempoRestante();
            if (tiempoActual <= 0f)
            {
                OnGameFinished();
                break;
            }
            ui?.ActualizarTiempo(Mathf.CeilToInt(tiempoActual));
            yield return EsperarGameplay(0.2f);
        }
    }

    private float ObtenerTiempoRestante()
    {
        if (GameManager.Instance != null && GameManager.Instance.tiempoRestante > 0)
            return GameManager.Instance.tiempoRestante;
        else if (tiempoRestanteInterno > 0)
        {
            tiempoRestanteInterno -= Time.deltaTime;
            return tiempoRestanteInterno;
        }
        return 0f;
    }

    private IEnumerator CicloEstimulos()
    {
        while (!finalizado)
        {
            nivelActual = ObtenerNivelActual();
            float tiempoEntre = ObtenerEsperaAleatoriaEstimulo(nivelActual);
            yield return EsperarGameplay(tiempoEntre);

            if (jugando && !juegoPausado && !feedbackActivo && !esperandoRespuesta)
                GenerarEstimulo();
        }
    }

    private void GenerarEstimulo()
    {
        nivelActual = ObtenerNivelActual();
        ActualizarReglaUI();

        bool debeSerObjetivo = DebeSalirObjetivo();
        Estimulo nuevo = debeSerObjetivo ? CrearObjetivo() : CrearDistractor();

        estimuloActual = nuevo;
        esperandoRespuesta = true;
        distractoresSeguidos = nuevo.esObjetivo ? 0 : distractoresSeguidos + 1;

        float duracion = curvaDuracionEstimulo.Evaluate(nivelActual);
        ui?.MostrarEstimulo(nuevo.icono, nuevo.color, duracion);

        if (rutinaOmision != null)
            StopCoroutine(rutinaOmision);

        rutinaOmision = StartCoroutine(TemporizadorOmision(duracion));
    }

    private IEnumerator TemporizadorOmision(float duracion)
    {
        yield return EsperarGameplay(duracion);

        if (!esperandoRespuesta || !jugando || feedbackActivo)
            yield break;

        esperandoRespuesta = false;
        ui?.OcultarEstimulo();

        if (estimuloActual.esObjetivo)
        {
            omisionesObjetivo++;
            rachaActual = 0;
            tiemposReaccion.Add(duracion);
            ActualizarDificultad(0f, false, duracion);
            MostrarFeedbackRadar("omisión", new Color(1f, 0.30f, 0.38f), 0.35f);
        }
        else
        {
            aciertosNoGo++;
            SumarRacha();
            ActualizarDificultad(0.85f, true, 0.35f);
            MostrarFeedbackRadar("correcto", new Color(0.30f, 1f, 0.40f), 0.35f);
        }

        ActualizarUI();
    }

    private bool DebeSalirObjetivo()
    {
        if (distractoresSeguidos >= 2)
            return true;
        return Random.value < probabilidadObjetivo;
    }

    public void Responder()
    {
        if (!jugando || !esperandoRespuesta || feedbackActivo || estimuloActual == null)
            return;

        esperandoRespuesta = false;

        if (rutinaOmision != null)
        {
            StopCoroutine(rutinaOmision);
            rutinaOmision = null;
        }

        float tiempoRespuesta = Mathf.Max(0.01f, Time.time - estimuloActual.tiempoInicio);
        tiemposReaccion.Add(tiempoRespuesta);
        ui?.OcultarEstimulo();

        if (estimuloActual.esObjetivo)
        {
            aciertosObjetivo++;
            SumarRacha();
            float rendimiento = Mathf.Clamp01(1f - tiempoRespuesta / Mathf.Max(0.1f, estimuloActual.duracion));
            ActualizarDificultad(rendimiento, true, tiempoRespuesta);
            MostrarFeedbackRadar("¡acertaste!", new Color(0.30f, 1f, 0.40f), 0.35f);
        }
        else
        {
            erroresImpulsivos++;
            rachaActual = 0;
            ActualizarDificultad(0f, false, tiempoRespuesta);
            MostrarFeedbackRadar("error", new Color(1f, 0.30f, 0.38f), 0.35f);
        }

        ActualizarUI();
    }

    public void Saltar()
    {
        if (!jugando || juegoPausado || !enSuelo || personajeActivo == null)
            return;

        velocidadVertical = fuerzaSalto;
        enSuelo = false;
        tiempoSaltoSostenido = 0f;
        AnimarSalto();
    }

    private void Update()
    {
        if (!jugando || juegoPausado || finalizado)
            return;

        nivelActual = ObtenerNivelActual();
        ManejarEntrada();
        ActualizarRunner();
        ActualizarUI();
    }

    private void ManejarEntrada()
    {
        bool pedirSalto = Input.GetKeyDown(KeyCode.Space) ||
                          Input.GetKeyDown(KeyCode.UpArrow) ||
                          Input.GetKeyDown(KeyCode.W);

        bool pedirRespuesta = Input.GetKeyDown(KeyCode.Return) ||
                              Input.GetKeyDown(KeyCode.KeypadEnter) ||
                              Input.GetKeyDown(KeyCode.E) ||
                              Input.GetMouseButtonDown(1);

        mantenerSalto = Input.GetKey(KeyCode.Space) ||
                        Input.GetKey(KeyCode.UpArrow) ||
                        Input.GetKey(KeyCode.W);

        if (Input.GetMouseButtonDown(0))
        {
            if (Input.mousePosition.x < Screen.width * 0.5f)
                pedirSalto = true;
            else
                pedirRespuesta = true;
        }

        if (Input.GetMouseButton(0) && Input.mousePosition.x < Screen.width * 0.5f)
            mantenerSalto = true;

        for (int i = 0; i < Input.touchCount; i++)
        {
            Touch touch = Input.GetTouch(i);

            if (touch.position.x < Screen.width * 0.5f)
            {
                if (touch.phase != TouchPhase.Ended && touch.phase != TouchPhase.Canceled)
                    mantenerSalto = true;

                if (touch.phase == TouchPhase.Began)
                    pedirSalto = true;
            }
            else if (touch.phase == TouchPhase.Began)
            {
                pedirRespuesta = true;
            }
        }

        if (pedirSalto)
            Saltar();

        if (pedirRespuesta)
            Responder();
    }

    private void ActualizarRunner()
    {
        if (personajeActivo == null)
            return;

        float gravedadActual = gravedad;
        if (!enSuelo && velocidadVertical > 0f && mantenerSalto && tiempoSaltoSostenido < tiempoMaximoSaltoSostenido)
        {
            gravedadActual *= multiplicadorGravedadSaltoSostenido;
            tiempoSaltoSostenido += Time.deltaTime;
        }

        velocidadVertical -= gravedadActual * Time.deltaTime;
        float nuevaY = personajeActivo.transform.position.y + velocidadVertical * Time.deltaTime;

        if (nuevaY <= alturaSuelo)
        {
            nuevaY = alturaSuelo;
            velocidadVertical = 0f;
            enSuelo = true;
            tiempoSaltoSostenido = 0f;
        }

        Vector3 posicion = personajeActivo.transform.position;
        personajeActivo.transform.position = new Vector3(posicion.x, nuevaY, posicion.z);

        float velocidadActual = curvaVelocidadRunner.Evaluate(nivelActual);
        distanciaRecorrida += velocidadActual * Time.deltaTime;

        float distanciaObjetivo = ObtenerDistanciaEntreObstaculos();
        float intervaloObjetivo = ObtenerIntervaloMinimoObstaculos();
        if (distanciaRecorrida - distanciaUltimoObstaculo >= distanciaObjetivo &&
            Time.time - tiempoUltimoObstaculo >= intervaloObjetivo)
        {
            SpawnObstaculo();
            distanciaUltimoObstaculo = distanciaRecorrida;
            tiempoUltimoObstaculo = Time.time;
        }

        for (int i = obstaculosActivos.Count - 1; i >= 0; i--)
        {
            GameObject obstaculo = obstaculosActivos[i];
            if (obstaculo == null)
            {
                obstaculosActivos.RemoveAt(i);
                continue;
            }

            float xAnterior = obstaculo.transform.position.x;
            obstaculo.transform.position += Vector3.left * velocidadActual * Time.deltaTime;

            ObstaculoRuntime datos = ObtenerDatosObstaculo(obstaculo);
            float runnerX = personajeActivo.transform.position.x;
            float dx = Mathf.Abs(obstaculo.transform.position.x - runnerX);
            bool cruzoAlRunner = xAnterior >= runnerX && obstaculo.transform.position.x <= runnerX;
            bool colisionaEnX = dx < datos.radioHorizontal || cruzoAlRunner;
            bool noHaSaltadoSuficiente = personajeActivo.transform.position.y < datos.alturaNecesaria;

            if (colisionaEnX && noHaSaltadoSuficiente)
            {
                colisiones++;
                rachaActual = 0;
                ActualizarDificultad(0f, false, 1f);
                MostrarFeedbackRunner(datos.esAlto ? "salto corto" : "choque", Color.red, 0.45f);
                Destroy(obstaculo);
                datosObstaculos.Remove(obstaculo);
                obstaculosActivos.RemoveAt(i);
            }
            else if (obstaculo.transform.position.x < personajeActivo.transform.position.x - 1.5f)
            {
                obstaculosEsquivados++;
                Destroy(obstaculo);
                datosObstaculos.Remove(obstaculo);
                obstaculosActivos.RemoveAt(i);
            }
        }
    }

    private void SpawnObstaculo()
    {
        if (personajeActivo == null)
            return;

        ObstaculoRuntime datos = CrearDatosObstaculo();
        Vector3 spawnPos = new Vector3(personajeActivo.transform.position.x + offsetSpawnObstaculo, alturaSuelo + datos.centroY, 0f);
        GameObject obstaculo;

        GameObject prefabSeleccionado = datos.esAlto ? prefabObstaculoAlto : prefabObstaculoBajo;

        if (prefabSeleccionado != null)
            obstaculo = Instantiate(prefabSeleccionado, spawnPos, Quaternion.identity);
        else
            obstaculo = CrearObstaculoRuntime(spawnPos);

        obstaculo.name = datos.esAlto ? "CajaAlta_DobleCanal" : "CajaBaja_DobleCanal";
        obstaculo.transform.position = spawnPos;
        obstaculo.transform.localScale = datos.escalaVisual;
        Renderer renderer = obstaculo.GetComponentInChildren<Renderer>();
        if (renderer != null)
            renderer.material.color = datos.esAlto ? new Color(0.78f, 0.30f, 1f) : new Color(1f, 0.70f, 0.22f);

        datosObstaculos[obstaculo] = datos;
        obstaculosActivos.Add(obstaculo);
    }

    private ObstaculoRuntime CrearDatosObstaculo()
    {
        float t = Mathf.InverseLerp(3f, 10f, nivelActual);
        bool puedeSerAlto = nivelActual >= 4;
        bool esAlto = puedeSerAlto && Random.value < Mathf.Lerp(0.15f, 0.65f, t);
        if (ultimoObstaculoFueAlto)
            esAlto = false;

        ultimoObstaculoFueAlto = esAlto;

        if (esAlto)
        {
            float alturaVisual = Mathf.Lerp(1.15f, 1.85f, t);
            return new ObstaculoRuntime
            {
                esAlto = true,
                alturaNecesaria = Mathf.Lerp(1.05f, 1.55f, t),
                radioHorizontal = radioHorizontalColision,
                centroY = alturaVisual * 0.45f,
                escalaVisual = new Vector3(0.62f, alturaVisual, 0.62f)
            };
        }

        return new ObstaculoRuntime
        {
            esAlto = false,
            alturaNecesaria = 0.42f,
            radioHorizontal = radioHorizontalColision,
            centroY = 0.32f,
            escalaVisual = new Vector3(0.66f, 0.66f, 0.66f)
        };
    }

    private ObstaculoRuntime ObtenerDatosObstaculo(GameObject obstaculo)
    {
        if (obstaculo != null && datosObstaculos.TryGetValue(obstaculo, out ObstaculoRuntime datos))
            return datos;

        return new ObstaculoRuntime
        {
            esAlto = false,
            alturaNecesaria = 0.42f,
            radioHorizontal = radioHorizontalColision,
            centroY = 0.32f,
            escalaVisual = Vector3.one * 0.66f
        };
    }

    private void ActualizarDificultad(float rendimiento, bool fueCorrecto, float tiempoRespuesta)
    {
        if (DifficultyManager.Instance != null)
        {
            DifficultyManager.Instance.ActualizarDificultad(rendimiento, fueCorrecto, tiempoRespuesta);
            nivelActual = ObtenerNivelActual();
        }
        else
        {
            if (fueCorrecto && rendimiento > 0.7f)
                nivelActual = Mathf.Min(10, nivelActual + 1);
            else if (!fueCorrecto)
                nivelActual = Mathf.Max(1, nivelActual - 1);
        }

        ActualizarReglaUI();
        ui?.ActualizarNivel(nivelActual);
    }

    private void MostrarFeedback(string mensaje, Color color, float duracion)
    {
        if (rutinaFeedbackCentral != null)
            StopCoroutine(rutinaFeedbackCentral);

        rutinaFeedbackCentral = StartCoroutine(FeedbackCentralTemporal(mensaje, color, duracion));
    }

    private IEnumerator FeedbackCentralTemporal(string mensaje, Color color, float duracion)
    {
        ui?.MostrarFeedback(mensaje, color);
        yield return EsperarGameplay(duracion);
        ui?.OcultarFeedback();
        rutinaFeedbackCentral = null;
    }

    private void MostrarFeedbackRadar(string mensaje, Color color, float duracion)
    {
        if (rutinaFeedbackRadar != null)
            StopCoroutine(rutinaFeedbackRadar);

        rutinaFeedbackRadar = StartCoroutine(FeedbackRadarTemporal(mensaje, color, duracion));
    }

    private IEnumerator FeedbackRadarTemporal(string mensaje, Color color, float duracion)
    {
        feedbackActivo = true;
        ui?.MostrarFeedbackRadar(mensaje, color);
        yield return EsperarGameplay(duracion);
        ui?.OcultarFeedbackRadar();
        feedbackActivo = false;
        rutinaFeedbackRadar = null;
    }

    private void MostrarFeedbackRunner(string mensaje, Color color, float duracion)
    {
        if (rutinaFeedbackRunner != null)
            StopCoroutine(rutinaFeedbackRunner);

        rutinaFeedbackRunner = StartCoroutine(FeedbackRunnerTemporal(mensaje, color, duracion));
    }

    private IEnumerator FeedbackRunnerTemporal(string mensaje, Color color, float duracion)
    {
        ui?.MostrarFeedbackRunner(mensaje, color);
        yield return EsperarGameplay(duracion);
        ui?.OcultarFeedbackRunner();
        rutinaFeedbackRunner = null;
    }

    private void AnimarSalto()
    {
        if (personajeActivo == null)
            return;

        if (rutinaSalto != null)
            StopCoroutine(rutinaSalto);

        rutinaSalto = StartCoroutine(AnimarEscala(personajeActivo.transform, escalaOriginalPersonaje, 0.12f));
    }

    private IEnumerator AnimarEscala(Transform target, Vector3 escalaBase, float duracion)
    {
        Vector3 escalaAlta = new Vector3(escalaBase.x * 0.9f, escalaBase.y * 1.18f, escalaBase.z);
        float t = 0f;

        while (t < duracion)
        {
            if (!juegoPausado)
            {
                t += Time.deltaTime;
                target.localScale = Vector3.Lerp(escalaBase, escalaAlta, t / duracion);
            }
            yield return null;
        }

        target.localScale = escalaBase;
        rutinaSalto = null;
    }

    private IEnumerator EsperarGameplay(float duracion)
    {
        float t = 0f;
        while (t < duracion && !finalizado)
        {
            if (!juegoPausado)
                t += Time.deltaTime;

            yield return null;
        }
    }

    private void PrepararPersonaje()
    {
        if (personajeCreadoEnRuntime && personajeActivo != null)
            Destroy(personajeActivo);

        personajeCreadoEnRuntime = false;
        personajeActivo = null;

        Vector3 posicionInicial = new Vector3(posicionRunnerX, alturaSuelo, 0f);

        if (prefabRobot != null)
        {
            personajeActivo = Instantiate(prefabRobot, posicionInicial, Quaternion.identity);
            personajeActivo.name = "RobotHero_DobleCanal";
            personajeCreadoEnRuntime = true;
        }
        else
        {
            personajeActivo = CrearPersonajeRuntime(posicionInicial);
            personajeCreadoEnRuntime = true;
        }

        escalaOriginalPersonaje = personajeActivo != null ? personajeActivo.transform.localScale : Vector3.one;
    }

    private void PrepararSuelo()
    {
        if (suelo != null)
            alturaSuelo = suelo.position.y;

        if (sueloVisualRuntime == null)
        {
            sueloVisualRuntime = GameObject.CreatePrimitive(PrimitiveType.Cube);
            sueloVisualRuntime.name = "Suelo_DobleCanal_Runtime";
            Renderer renderer = sueloVisualRuntime.GetComponent<Renderer>();
            if (renderer != null)
                renderer.material.color = new Color(0.10f, 0.80f, 0.95f);
        }

        // Suelo mucho más a la izquierda y más ancho
        sueloVisualRuntime.transform.position = new Vector3(0f, alturaSuelo - 0.38f, 0.15f);
        sueloVisualRuntime.transform.localScale = new Vector3(8.5f, 0.10f, 0.60f);
    }

    private GameObject CrearPersonajeRuntime(Vector3 posicion)
    {
        GameObject robot = new GameObject("RobotHero_DobleCanal");
        robot.transform.position = posicion;

        CrearPiezaRobot(robot.transform, "Cuerpo", new Vector3(0f, 0.62f, 0f), new Vector3(0.46f, 0.62f, 0.24f), new Color(0.24f, 0.55f, 1f));
        CrearPiezaRobot(robot.transform, "Cabeza", new Vector3(0f, 1.08f, 0f), new Vector3(0.36f, 0.30f, 0.22f), new Color(0.70f, 0.84f, 1f));
        CrearPiezaRobot(robot.transform, "Capa", new Vector3(-0.26f, 0.58f, 0.06f), new Vector3(0.12f, 0.74f, 0.08f), new Color(0.82f, 0.22f, 1f));
        CrearPiezaRobot(robot.transform, "PiernaA", new Vector3(-0.13f, 0.18f, 0f), new Vector3(0.16f, 0.34f, 0.16f), new Color(0.16f, 0.32f, 0.70f));
        CrearPiezaRobot(robot.transform, "PiernaB", new Vector3(0.13f, 0.18f, 0f), new Vector3(0.16f, 0.34f, 0.16f), new Color(0.16f, 0.32f, 0.70f));

        return robot;
    }

    private void CrearPiezaRobot(Transform parent, string nombre, Vector3 localPosition, Vector3 localScale, Color color)
    {
        GameObject pieza = GameObject.CreatePrimitive(PrimitiveType.Cube);
        pieza.name = nombre;
        pieza.transform.SetParent(parent, false);
        pieza.transform.localPosition = localPosition;
        pieza.transform.localScale = localScale;
        Renderer renderer = pieza.GetComponent<Renderer>();
        if (renderer != null)
            renderer.material.color = color;
    }

    private GameObject CrearObstaculoRuntime(Vector3 posicion)
    {
        GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.transform.position = posicion;
        go.transform.localScale = new Vector3(0.65f, 0.65f, 0.65f);
        Renderer renderer = go.GetComponent<Renderer>();
        if (renderer != null)
            renderer.material.color = new Color(1f, 0.70f, 0.22f);
        return go;
    }

    private void ConfigurarOrientacion()
    {
        if (forzarLandscapeEnMovil && Application.isMobilePlatform)
        {
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.orientation = ScreenOrientation.LandscapeLeft;
        }
    }

    private void LimpiarObstaculos()
    {
        foreach (GameObject obs in obstaculosActivos)
        {
            if (obs != null)
                Destroy(obs);
        }

        obstaculosActivos.Clear();
        datosObstaculos.Clear();
    }

    private void DetenerRutinas()
    {
        if (rutinaInicio != null) StopCoroutine(rutinaInicio);
        if (rutinaEstimulos != null) StopCoroutine(rutinaEstimulos);
        if (rutinaOmision != null) StopCoroutine(rutinaOmision);
        if (rutinaFeedbackCentral != null) StopCoroutine(rutinaFeedbackCentral);
        if (rutinaFeedbackRadar != null) StopCoroutine(rutinaFeedbackRadar);
        if (rutinaFeedbackRunner != null) StopCoroutine(rutinaFeedbackRunner);
        if (rutinaSalto != null) StopCoroutine(rutinaSalto);

        rutinaInicio = null;
        rutinaEstimulos = null;
        rutinaOmision = null;
        rutinaFeedbackCentral = null;
        rutinaFeedbackRadar = null;
        rutinaFeedbackRunner = null;
        rutinaSalto = null;
    }

    private void InicializarEstimulos()
    {
        if (string.IsNullOrWhiteSpace(objetivoNombre))
            objetivoNombre = "escudo";

        if (string.IsNullOrWhiteSpace(distractorNombre))
            distractorNombre = "peligro";

        objetivoNombre = objetivoNombre.ToLowerInvariant();
        distractorNombre = distractorNombre.ToLowerInvariant();
    }

    private void InicializarCurvas()
    {
        if (curvaVelocidadRunner == null || curvaVelocidadRunner.keys.Length == 0)
            curvaVelocidadRunner = new AnimationCurve(new Keyframe(1, 3.7f), new Keyframe(7, 5.5f), new Keyframe(10, 6.6f));

        if (curvaDuracionEstimulo == null || curvaDuracionEstimulo.keys.Length == 0)
            curvaDuracionEstimulo = new AnimationCurve(new Keyframe(1, 1.20f), new Keyframe(10, 0.85f));
    }

    private Estimulo CrearObjetivo()
    {
        Estimulo estimulo = new Estimulo
        {
            icono = objetivoNombre,
            color = objetivoColor,
            esObjetivo = true,
            tiempoInicio = Time.time,
            duracion = curvaDuracionEstimulo.Evaluate(nivelActual)
        };
        return estimulo;
    }

    private Estimulo CrearDistractor()
    {
        return new Estimulo
        {
            icono = distractorNombre,
            color = distractorColor,
            esObjetivo = false,
            tiempoInicio = Time.time,
            duracion = curvaDuracionEstimulo.Evaluate(nivelActual)
        };
    }

    private float ObtenerDistanciaEntreObstaculos()
    {
        float t = Mathf.InverseLerp(1f, 10f, nivelActual);
        return Mathf.Lerp(distanciaEntreObstaculos, distanciaEntreObstaculosMinima, t);
    }

    private float ObtenerIntervaloMinimoObstaculos()
    {
        float t = Mathf.InverseLerp(1f, 10f, nivelActual);
        return Mathf.Lerp(intervaloMinimoObstaculos, intervaloMinimoObstaculosNivelAlto, t);
    }

    private float ObtenerEsperaAleatoriaEstimulo(int nivel)
    {
        float t = Mathf.InverseLerp(1f, 10f, nivel);
        float min = Mathf.Lerp(esperaEstimuloNivel1Min, esperaEstimuloNivel10Min, t);
        float max = Mathf.Lerp(esperaEstimuloNivel1Max, esperaEstimuloNivel10Max, t);
        return Random.Range(min, Mathf.Max(min, max));
    }

    private int ObtenerNivelActual()
    {
        if (DifficultyManager.Instance != null)
            return Mathf.Clamp(DifficultyManager.Instance.nivelActual, 1, 10);

        return Mathf.Clamp(nivelActual, 1, 10);
    }

    private void SumarRacha()
    {
        rachaActual++;
        mejorRacha = Mathf.Max(mejorRacha, rachaActual);
    }

    private void CachearUI()
    {
        if (ui == null)
            ui = FindFirstObjectByType<DobleCanalUI>();
    }

    private void ActualizarReglaUI()
    {
        nivelActual = ObtenerNivelActual();
        string regla = $"pulsa {objetivoNombre}";
        ui?.ActualizarObjetivo(regla, objetivoColor);
        ui?.ActualizarNivel(nivelActual);
    }

    private void ActualizarUI()
    {
        int fallos = erroresImpulsivos + omisionesObjetivo + colisiones;
        int puntos = obstaculosEsquivados * 10 +
                     aciertosObjetivo * 25 +
                     aciertosNoGo * 8 -
                     erroresImpulsivos * 18 -
                     omisionesObjetivo * 15 -
                     colisiones * 12;

        ui?.ActualizarPuntuacion(Mathf.Max(0, puntos));
        ui?.ActualizarAciertos(aciertosObjetivo + aciertosNoGo);
        ui?.ActualizarFallos(fallos);
        ui?.ActualizarDistancia(Mathf.FloorToInt(distanciaRecorrida));
        ui?.ActualizarColisiones(colisiones);
        ui?.ActualizarNivel(nivelActual);
        ui?.ActualizarRacha(rachaActual);
    }

    public override void OnGameFinished()
    {
        if (finalizado)
            return;

        finalizado = true;
        jugando = false;
        esperandoRespuesta = false;

        DetenerRutinas();
        ui?.OcultarEstimulo();
        ui?.OcultarFeedback();
        LimpiarObstaculos();

        CognitiveMetrics metricas = CalcularCognicion();
        WebExporter.EnviarSesion(nombre, AplicarPesos(metricas));

        ui?.MostrarResultados(aciertosObjetivo, omisionesObjetivo, aciertosNoGo, erroresImpulsivos,
            obstaculosEsquivados, colisiones, Mathf.FloorToInt(distanciaRecorrida));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        int totalGo = aciertosObjetivo + omisionesObjetivo;
        int totalNoGo = aciertosNoGo + erroresImpulsivos;
        int totalObstaculos = obstaculosEsquivados + colisiones;

        float eficienciaGo = totalGo > 0 ? (float)aciertosObjetivo / totalGo : 1f;
        float eficienciaNoGo = totalNoGo > 0 ? (float)aciertosNoGo / totalNoGo : 1f;
        float eficienciaRunner = totalObstaculos > 0 ? (float)obstaculosEsquivados / totalObstaculos : 1f;
        float eficienciaEstimulos = (eficienciaGo + eficienciaNoGo) * 0.5f;
        float tiempoMedio = ObtenerTiempoMedioReaccion();
        float participacionRunner = totalObstaculos > 0 ? Mathf.Clamp01(totalObstaculos / 8f) : 0.4f;
        float participacionEstimulos = (totalGo + totalNoGo) > 0 ? Mathf.Clamp01((totalGo + totalNoGo) / 12f) : 0.4f;
        float baseRunner = Mathf.Lerp(0.35f, eficienciaRunner, participacionRunner);
        float baseEstimulos = Mathf.Lerp(0.35f, eficienciaEstimulos, participacionEstimulos);
        float castigoErrores = Mathf.Clamp01(1f - (colisiones * 0.035f) - (omisionesObjetivo * 0.025f) - (erroresImpulsivos * 0.025f));

        m.atencionDividida = Mathf.Clamp01(((baseRunner + baseEstimulos) * 0.5f) * castigoErrores);
        m.coordinacionVisomotora = Mathf.Clamp01((0.25f + 0.75f * eficienciaRunner) * Mathf.Clamp01(1f / (tiempoMedio + 0.45f)));
        m.atencionSostenida = Mathf.Clamp01((0.55f + 0.45f * castigoErrores) * Mathf.Lerp(0.75f, 1f, participacionEstimulos));
        m.velocidadCognitiva = Mathf.Clamp01(1f / (tiempoMedio + 0.35f));

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        return new CognitiveMetrics
        {
            atencionDividida = m.atencionDividida * 0.60f,
            coordinacionVisomotora = m.coordinacionVisomotora * 0.20f,
            atencionSostenida = m.atencionSostenida * 0.15f,
            velocidadCognitiva = m.velocidadCognitiva * 0.05f
        };
    }

    private float ObtenerTiempoMedioReaccion()
    {
        if (tiemposReaccion.Count == 0)
            return 0.75f;

        float total = 0f;
        for (int i = 0; i < tiemposReaccion.Count; i++)
            total += tiemposReaccion[i];

        return total / tiemposReaccion.Count;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
    }

    private class Estimulo
    {
        public string icono;
        public Color color;
        public bool esObjetivo;
        public float tiempoInicio;
        public float duracion;
    }

    private struct ObstaculoRuntime
    {
        public bool esAlto;
        public float alturaNecesaria;
        public float radioHorizontal;
        public float centroY;
        public Vector3 escalaVisual;
    }
}
