//using System.Collections;
//using TMPro;
//using UnityEngine;
//using UnityEngine.UI;

//public class RoscoExpressGame : BaseGame
//{
//    private const float NIVEL_MAX = 10.0f;

//    [Header("3D Objects")]
//    public Transform sateliteContainer;
//    public GameObject satelitePrefab;

//    [Header("UI Básica")]
//    public GameObject flashRenderer;
//    public TextMeshProUGUI textoNivelActual;
//    public GameObject panelResultado;
//    public TextMeshProUGUI textoResultado;

//    [Header("Botón Central")]
//    public BotonCentralController botonCentral;

//    // Datos de la misión
//    private int totalSatelites;
//    private int indiceObjetivo;    // Rojo
//    private int indiceActivo;      // Amarillo
//    private float radioOrbita;
//    private float velocidadRotacion;
//    private bool misionActiva = false;
//    private bool girando = false;
//    private Renderer[] satelites;

//    // Estadísticas
//    private int totalDisparos;
//    private int impactos;
//    private int fallos;
//    private float sumaTiemposReaccion;
//    private int mejorNivel;
//    private int sentidoRotacion;

//    private Coroutine rutinaOrbita;

//    private void Awake()
//    {
//        nombre = "mision-orbital";
//    }

//    private void Start()
//    {
//        if (GameManager.Instance != null)
//            GameManager.Instance.EmpezarJuego(this);

//        if (flashRenderer != null)
//            flashRenderer.SetActive(false);

//        if (panelResultado != null)
//            panelResultado.SetActive(false);

//        // Configurar botón central
//        if (botonCentral != null)
//            botonCentral.SetJuego(this);

//        IniciarMision();
//    }

//    public void GenerarEstimulos()
//    {
//        IniciarMision();
//    }

//    private void IniciarMision()
//    {
//        AplicarDificultad();
//        CrearAnilloSatelites();

//        // Seleccionar satélite objetivo (ROJO)
//        indiceObjetivo = Random.Range(0, totalSatelites);

//        // Seleccionar satélite activo inicial (AMARILLO)
//        do
//        {
//            indiceActivo = Random.Range(0, totalSatelites);
//        } while (indiceActivo == indiceObjetivo);

//        misionActiva = true;
//        girando = true;

//        ActualizarColoresSatelites();

//        // Dirección de rotación (niveles altos = más impredecible)
//        if (DifficultyManager.Instance != null && DifficultyManager.Instance.nivelActual >= 6)
//        {
//            sentidoRotacion = Random.value < 0.5f ? 1 : -1;
//        }
//        else
//        {
//            sentidoRotacion = 1;
//        }

//        if (rutinaOrbita != null)
//            StopCoroutine(rutinaOrbita);

//        rutinaOrbita = StartCoroutine(RotarSatelites());
//        EmpezarIntento();
//    }

//    private void AplicarDificultad()
//    {
//        int nivel = 1;
//        if (DifficultyManager.Instance != null)
//            nivel = DifficultyManager.Instance.nivelActual;

//        // Actualizar UI
//        if (textoNivelActual != null)
//            textoNivelActual.text = $"🌌 ÓRBITA {nivel} 🌌";

//        if (nivel > mejorNivel)
//            mejorNivel = nivel;

//        // Ajustes de dificultad
//        totalSatelites = Mathf.RoundToInt(Mathf.Lerp(6, 22, nivel / NIVEL_MAX));
//        velocidadRotacion = Mathf.Lerp(0.22f, 0.015f, nivel / NIVEL_MAX);
//        radioOrbita = Mathf.Lerp(3f, 4f, nivel / NIVEL_MAX);
//    }

//    private void CrearAnilloSatelites()
//    {
//        if (sateliteContainer == null)
//        {
//            Debug.LogError("SateliteContainer no asignado en el Inspector");
//            return;
//        }

//        // Limpiar anillo anterior
//        foreach (Transform t in sateliteContainer)
//            Destroy(t.gameObject);

//        if (satelitePrefab == null)
//        {
//            Debug.LogError("SatelitePrefab no asignado en el Inspector");
//            return;
//        }

//        satelites = new Renderer[totalSatelites];
//        float angulo = 360f / totalSatelites;

//        for (int i = 0; i < totalSatelites; i++)
//        {
//            GameObject sat = Instantiate(satelitePrefab, sateliteContainer);
//            float rad = Mathf.Deg2Rad * (i * angulo);
//            sat.transform.localPosition = new Vector3(Mathf.Cos(rad), 0, Mathf.Sin(rad)) * radioOrbita;

//            Renderer renderer = sat.GetComponent<Renderer>();
//            if (renderer != null)
//                satelites[i] = renderer;
//            else
//                Debug.LogWarning($"Satélite {i} no tiene Renderer");
//        }
//    }

//    private void ActualizarColoresSatelites()
//    {
//        for (int i = 0; i < totalSatelites; i++)
//        {
//            if (satelites[i] == null) continue;

//            if (i == indiceActivo)
//                satelites[i].material.color = Color.yellow;
//            else if (i == indiceObjetivo)
//                satelites[i].material.color = Color.red;
//            else
//                satelites[i].material.color = Color.gray;
//        }
//    }

//    private IEnumerator RotarSatelites()
//    {
//        while (girando)
//        {
//            indiceActivo = (indiceActivo + sentidoRotacion + totalSatelites) % totalSatelites;
//            ActualizarColoresSatelites();
//            yield return new WaitForSeconds(velocidadRotacion);
//        }
//    }

//    public void Disparar()
//    {
//        if (!misionActiva) return;

//        misionActiva = false;
//        girando = false;

//        if (rutinaOrbita != null)
//            StopCoroutine(rutinaOrbita);

//        float tiempoReaccion = Time.time - tiempoInicio;
//        sumaTiemposReaccion += tiempoReaccion;
//        totalDisparos++;

//        bool impacto = (indiceActivo == indiceObjetivo);

//        if (impacto)
//        {
//            impactos++;
//            if (GameUIManager.Instance != null)
//                GameUIManager.Instance.ReproducirAcierto();
//        }
//        else
//        {
//            fallos++;
//            if (GameUIManager.Instance != null)
//                GameUIManager.Instance.ReproducirError();
//        }

//        StartCoroutine(FeedbackMision(impacto));

//        if (DifficultyManager.Instance != null)
//        {
//            float rendimiento = impacto ? Mathf.Clamp01(1f / (tiempoReaccion * 2f)) : 0f;
//            DifficultyManager.Instance.ActualizarDificultad(rendimiento, impacto, tiempoReaccion);
//        }
//    }

//    private IEnumerator FeedbackMision(bool impacto)
//    {
//        // Marcar el satélite impactado
//        if (indiceActivo < satelites.Length && satelites[indiceActivo] != null)
//            satelites[indiceActivo].material.color = Color.green;

//        // Flash y mensaje
//        if (flashRenderer != null)
//        {
//            Image flashImg = flashRenderer.GetComponent<Image>();
//            if (flashImg != null)
//            {
//                flashImg.color = impacto ? new Color(0, 1, 0.1f, 0.3f) : new Color(1, 0.1f, 0.1f, 0.3f);
//            }
//            flashRenderer.SetActive(true);
//        }

//        if (textoResultado != null)
//        {
//            textoResultado.text = impacto ? "🚀 ¡ÓRBITA ALCANZADA! 🚀" : "💥 ¡SEÑAL PERDIDA! 💥";
//        }

//        yield return new WaitForSeconds(0.2f);

//        if (flashRenderer != null)
//            flashRenderer.SetActive(false);

//        if (panelResultado != null)
//            panelResultado.SetActive(true);

//        yield return new WaitForSeconds(0.3f);

//        if (panelResultado != null)
//            panelResultado.SetActive(false);

//        IniciarMision();
//    }

//    public override void ResetGame()
//    {
//        totalDisparos = 0;
//        impactos = 0;
//        fallos = 0;
//        sumaTiemposReaccion = 0f;
//        mejorNivel = 0;

//        tiempoInicio = Time.time;

//        if (rutinaOrbita != null)
//            StopCoroutine(rutinaOrbita);

//        if (DifficultyManager.Instance != null)
//            DifficultyManager.Instance.nivelActual = 1;

//        IniciarMision();
//    }

//    public override CognitiveMetrics CalcularCognicion()
//    {
//        CognitiveMetrics m = new CognitiveMetrics();

//        float nivelMaxScore = Mathf.Clamp01(mejorNivel / NIVEL_MAX);
//        float nivelFinalScore = Mathf.Clamp01(DifficultyManager.Instance.nivelActual / 10f);
//        float precision = totalDisparos > 0 ? (float)impactos / totalDisparos : 0f;
//        float tiempoMedio = totalDisparos > 0 ? sumaTiemposReaccion / totalDisparos : 1f;
//        float velocidadBruta = 1f / tiempoMedio;
//        float velocidadNorm = Mathf.Clamp01(velocidadBruta / 3f);
//        float inhibicion = 1f - ((float)fallos / Mathf.Max(1, totalDisparos));
//        float visomotora = velocidadNorm * precision;

//        float wRend = 0.6f;
//        float wMax = 0.3f;
//        float wFinal = 0.1f;

//        m.atencionSelectiva = wRend * precision + wMax * nivelMaxScore + wFinal * nivelFinalScore;
//        m.velocidadCognitiva = 0.8f * velocidadNorm + 0.15f * nivelMaxScore + 0.05f * nivelFinalScore;
//        m.controlInhibitorio = wRend * inhibicion + wMax * nivelMaxScore + wFinal * nivelFinalScore;
//        m.coordinacionVisomotora = wRend * visomotora + wMax * nivelMaxScore + wFinal * nivelFinalScore;

//        m.atencionSostenida = 0f;
//        m.atencionDividida = 0f;
//        m.memoriaTrabajo = 0f;
//        m.memoriaEspacial = 0f;
//        m.flexibilidadCognitiva = 0f;
//        m.planificacion = 0f;

//        return m;
//    }

//    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
//    {
//        CognitiveMetrics p = new CognitiveMetrics();

//        p.velocidadCognitiva = m.velocidadCognitiva * 0.45f;
//        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.35f;
//        p.atencionSelectiva = m.atencionSelectiva * 0.15f;
//        p.controlInhibitorio = m.controlInhibitorio * 0.05f;

//        p.atencionSostenida = 0f;
//        p.atencionDividida = 0f;
//        p.memoriaTrabajo = 0f;
//        p.memoriaEspacial = 0f;
//        p.flexibilidadCognitiva = 0f;
//        p.planificacion = 0f;

//        return p;
//    }
//}