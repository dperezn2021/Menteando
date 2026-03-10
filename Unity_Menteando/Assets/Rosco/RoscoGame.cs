using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class RoscoGame : BaseGame
{
    private const float NIVEL_MAX = 10.0f;

    [Header("3D Objects")]
    public Transform roscoContainer;
    public GameObject spherePrefab;

    [Header("UI")]
    public GameObject flashRenderer;
    public TextMeshProUGUI textoNivelActual;
    public GameObject panelResultado;
    public TextMeshProUGUI textoResultado;

    private int totalPuntos;
    private int indiceRojo;
    private int indiceAmarillo;
    private float radioRosco;
    private float velocidadGiro;
    private bool girando = false;
    private bool rondaActiva = false;
    private Renderer[] puntos;

    private int totalIntentos;
    private int aciertos;
    private int errores;
    private float sumaTiempos;

    private int mejorNivel;
    private int sentido;

    private Coroutine rutinaGiro;

    private void Awake()
    {
        nombre = "rosco";
    }

    private void Start()
    {
        GameManager.Instance.EmpezarJuego(this);
        flashRenderer.SetActive(false);
        panelResultado.SetActive(false);
        
        GenerarEstimulos();
    }

    public override void GenerarEstimulos()
    {
        AplicarDificultad();
        CrearRosco();

        indiceRojo = Random.Range(0, totalPuntos);
        while(indiceAmarillo == indiceRojo)
        {
            indiceAmarillo = Random.Range(0, totalPuntos);
        }

        rondaActiva = true;
        girando = true;

        ActualizarColores();

        if (DifficultyManager.Instance.nivelActual >= 6)
        {
            sentido = Random.value < 0.5f ? 1 : -1;
        }
        else
        {
            sentido = 1;
        }

        rutinaGiro = StartCoroutine(Girar());
        EmpezarIntento();
    }

    private void AplicarDificultad()
    {
        int nivel = DifficultyManager.Instance.nivelActual;

        // Mostrar nivel
        textoNivelActual.text = "Nivel " + nivel;

        if (nivel > mejorNivel) mejorNivel = nivel;

        // Más puntos y más velocidad
        totalPuntos = Mathf.RoundToInt(Mathf.Lerp(6, 22, nivel / NIVEL_MAX));
        velocidadGiro = Mathf.Lerp(0.22f, 0.015f, nivel / NIVEL_MAX);
        
        radioRosco = Mathf.RoundToInt(Mathf.Lerp(3, 4, nivel / NIVEL_MAX));
    }

    private void CrearRosco()
    {
        foreach (Transform t in roscoContainer)
            Destroy(t.gameObject);

        puntos = new Renderer[totalPuntos];

        float angulo = 360f / totalPuntos;

        for (int i = 0; i < totalPuntos; i++)
        {
            GameObject p = Instantiate(spherePrefab, roscoContainer);
            float rad = Mathf.Deg2Rad * (i * angulo);
            p.transform.localPosition = new Vector3(Mathf.Cos(rad), 0, Mathf.Sin(rad)) * radioRosco;

            puntos[i] = p.GetComponent<Renderer>();
        }
    }

    private void ActualizarColores()
    {
        for (int i = 0; i < totalPuntos; i++)
        {
            if (i == indiceAmarillo)
                puntos[i].material.color = Color.yellow;
            else if (i == indiceRojo)
                puntos[i].material.color = Color.red;
            else
                puntos[i].material.color = Color.gray;
        }
    }


    private IEnumerator Girar()
    {
        while (girando)
        {
            indiceAmarillo = (indiceAmarillo + sentido + totalPuntos) % totalPuntos;
            ActualizarColores(); 

            yield return new WaitForSeconds(velocidadGiro);
        }
    }


    public void PulsarBoton()
    {
        if (!rondaActiva) return;

        rondaActiva = false;
        girando = false;

        StopCoroutine(rutinaGiro);

        float tiempo = Time.time - tiempoInicio;
        sumaTiempos += tiempo;
        totalIntentos++;

        bool acierto = indiceAmarillo == indiceRojo;

        if (acierto) aciertos++;
        else errores++;

        StartCoroutine(FeedbackYResultado(acierto));

        DifficultyManager.Instance.ActualizarDificultad(acierto ? 1f : 0f, acierto, tiempo);
    }


    private IEnumerator FeedbackYResultado(bool acierto)
    {
        // 1. Pintar la bola actual de verde
        roscoContainer.GetChild(indiceAmarillo).GetComponent<Renderer>().material.color = Color.green;

        // 2. Flash suave
        flashRenderer.GetComponent<Image>().color = acierto ? new Color(0, 1, 0.1f, 0.1f) : new Color(1, 0.1f, 0.1f, 0.1f);
        textoResultado.text = acierto ? "¡Acierto!" : "Fallo";
        flashRenderer.SetActive(true);

        // 3. Espera corta
        yield return new WaitForSeconds(0.2f);

        flashRenderer.SetActive(false);

        // 4. Mostrar panel con texto
        panelResultado.SetActive(true);

        // 5. Espera corta y siguiente ronda
        yield return new WaitForSeconds(0.2f);
        panelResultado.SetActive(false);

        GenerarEstimulos();
    }

    public void ResetGame()
    {
        totalIntentos = 0;
        aciertos = 0;
        errores = 0;
        sumaTiempos = 0f;

        tiempoInicio = Time.time;

        if (rutinaGiro != null)
            StopCoroutine(rutinaGiro);

        DifficultyManager.Instance.nivelActual = 1;


        GenerarEstimulos();
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        // Nivel máximo y final normalizados
        float nivelMaxScore = Mathf.Clamp01(mejorNivel / NIVEL_MAX);
        float nivelFinalScore = Mathf.Clamp01(DifficultyManager.Instance.nivelActual / 10f);

        // Precisión
        float precision = totalIntentos > 0 ? (float)aciertos / totalIntentos : 0f;

        // Velocidad cognitiva normalizada
        float tiempoMedio = totalIntentos > 0 ? sumaTiempos / totalIntentos : 1f;
        float velocidadBruta = 1f / tiempoMedio;
        float velocidadNorm = Mathf.Clamp01(velocidadBruta / 3f);

        // Control inhibitorio
        float inhibicion = 1f - ((float)errores / Mathf.Max(1, totalIntentos));

        // Coordinación visomotora
        float visomotora = velocidadNorm * precision;

        // PESOS
        float wRend = 0.6f;  // rendimiento
        float wMax = 0.3f;  // nivel máximo
        float wFinal = 0.1f;  // nivel final


        // MÉTRICAS FINALES
        m.atencionSelectiva =
            wRend * precision +
            wMax * nivelMaxScore +
            wFinal * nivelFinalScore;

        // Ejemplo solo para velocidadCognitiva
        m.velocidadCognitiva =
            0.8f * velocidadNorm +
            0.15f * nivelMaxScore +
            0.05f * nivelFinalScore;


        m.controlInhibitorio =
            wRend * inhibicion +
            wMax * nivelMaxScore +
            wFinal * nivelFinalScore;

        m.coordinacionVisomotora =
            wRend * visomotora +
            wMax * nivelMaxScore +
            wFinal * nivelFinalScore;

        // No medidas en este juego
        m.atencionSostenida = 0f;
        m.atencionDividida = 0f;
        m.memoriaTrabajo = 0f;
        m.memoriaEspacial = 0f;
        m.flexibilidadCognitiva = 0f;
        m.planificacion = 0f;

        return m;
    }



}
