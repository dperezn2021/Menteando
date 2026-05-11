using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class DobleCanalGame : BaseGame
{
    [Header("Configuración")]
    public float tiempoEntreEstimulos = 1.5f;
    public float tiempoRespuestaMaximo = 1.2f;

    [Header("Curvas de dificultad (nivel 1 a 10)")]
    public AnimationCurve curvaVelocidadRunner;     // desde 4 a 8
    public AnimationCurve curvaTiempoEntreEstimulos; // desde 1.8 a 0.8
    public AnimationCurve curvaProbObjetivo;         // desde 0.45 a 0.25
    public AnimationCurve curvaDuracionEstimulo;     // desde 1.5 a 0.8

    [Header("Runner")]
    public GameObject personaje;
    public Transform suelo;
    public GameObject prefabObstaculo;
    public float fuerzaSalto = 8f;
    public float gravedad = 20f;
    public float distanciaEntreObstaculos = 3f;
    public float alturaSuelo = 0f;

    [Header("Estímulos")]
    public List<string> iconosDisponibles;
    public List<Color> coloresDisponibles;

    [Header("UI")]
    public DobleCanalUI ui;

    // Eventos UI
    public System.Action<int> OnPuntuacion;
    public System.Action<int> OnAciertos;
    public System.Action<int> OnFallos;
    public System.Action<int> OnDistancia;
    public System.Action<string, Color, int> OnMostrarEstimulo;
    public System.Action OnOcultarEstimulo;
    public System.Action<string, Color> OnMostrarFeedback;
    public System.Action OnFeedbackTerminado;

    // Estado del Runner
    private bool enSuelo = true;
    private float velocidadVertical = 0f;
    private float distanciaRecorrida = 0f;
    private float ultimoSpawnX = 0f;
    private List<GameObject> obstaculosActivos = new List<GameObject>();

    // Estado del juego
    private bool activo = false;
    private bool esperandoRespuesta = false;
    private bool feedbackVisible = false;
    private bool finalizado = false;

    // Estímulos
    private string objetivoIcono;
    private Color objetivoColor;
    private string estimuloIcono;
    private Color estimuloColor;
    private int estimuloFontSize = 80;
    private float inicioEstimulo;
    private float duracionEstimuloActual;

    // Métricas
    private int aciertos = 0;
    private int fallos = 0;
    private int obstaculosEsquivados = 0;
    private int colisiones = 0;
    private int racha = 0;
    private int mejorRacha = 0;
    private List<float> tiemposReaccion = new List<float>();

    private void Awake()
    {
        nombre = "doble-canal";
        InicializarListas();
        InicializarCurvas();
    }

    private void InicializarListas()
    {
        if (iconosDisponibles == null || iconosDisponibles.Count == 0)
            iconosDisponibles = new List<string> { "●", "■", "▲", "★", "♥", "♦" };
        if (coloresDisponibles == null || coloresDisponibles.Count == 0)
            coloresDisponibles = new List<Color> { Color.red, Color.green, Color.blue, Color.yellow, Color.magenta, Color.cyan };
    }

    private void InicializarCurvas()
    {
        if (curvaVelocidadRunner == null || curvaVelocidadRunner.keys.Length == 0)
        {
            curvaVelocidadRunner = new AnimationCurve();
            curvaVelocidadRunner.AddKey(1, 4f);
            curvaVelocidadRunner.AddKey(10, 8f);
        }
        if (curvaTiempoEntreEstimulos == null || curvaTiempoEntreEstimulos.keys.Length == 0)
        {
            curvaTiempoEntreEstimulos = new AnimationCurve();
            curvaTiempoEntreEstimulos.AddKey(1, 1.8f);
            curvaTiempoEntreEstimulos.AddKey(10, 0.8f);
        }
        if (curvaProbObjetivo == null || curvaProbObjetivo.keys.Length == 0)
        {
            curvaProbObjetivo = new AnimationCurve();
            curvaProbObjetivo.AddKey(1, 0.45f);
            curvaProbObjetivo.AddKey(10, 0.25f);
        }
        if (curvaDuracionEstimulo == null || curvaDuracionEstimulo.keys.Length == 0)
        {
            curvaDuracionEstimulo = new AnimationCurve();
            curvaDuracionEstimulo.AddKey(1, 1.5f);
            curvaDuracionEstimulo.AddKey(10, 0.8f);
        }
    }

    public override void ResetGame()
    {
        if (ui == null) ui = FindFirstObjectByType<DobleCanalUI>();

        // Suscribir eventos
        OnPuntuacion -= ui.ActualizarPuntuacion;
        OnAciertos -= ui.ActualizarAciertos;
        OnFallos -= ui.ActualizarFallos;
        OnDistancia -= ui.ActualizarDistancia;
        OnMostrarEstimulo -= ui.MostrarEstimulo;
        OnOcultarEstimulo -= ui.OcultarEstimulo;
        OnMostrarFeedback -= ui.MostrarFeedback;
        OnFeedbackTerminado -= ui.FeedbackTerminado;

        OnPuntuacion += ui.ActualizarPuntuacion;
        OnAciertos += ui.ActualizarAciertos;
        OnFallos += ui.ActualizarFallos;
        OnDistancia += ui.ActualizarDistancia;
        OnMostrarEstimulo += ui.MostrarEstimulo;
        OnOcultarEstimulo += ui.OcultarEstimulo;
        OnMostrarFeedback += ui.MostrarFeedback;
        OnFeedbackTerminado += ui.FeedbackTerminado;

        // Limpiar obstáculos
        foreach (GameObject obs in obstaculosActivos)
            if (obs != null) Destroy(obs);
        obstaculosActivos.Clear();

        // Resetear runner
        if (personaje != null)
        {
            personaje.transform.position = new Vector3(-5f, alturaSuelo, 0);
            velocidadVertical = 0f;
            enSuelo = true;
        }

        // Resetear variables
        distanciaRecorrida = 0f;
        ultimoSpawnX = 0f;
        aciertos = 0;
        fallos = 0;
        obstaculosEsquivados = 0;
        colisiones = 0;
        racha = 0;
        mejorRacha = 0;
        tiemposReaccion.Clear();
        activo = false;
        esperandoRespuesta = false;
        feedbackVisible = false;
        finalizado = false;
        DifficultyManager.Instance?.ResetDifficulty(1);

        // Elegir objetivo
        objetivoIcono = iconosDisponibles[Random.Range(0, iconosDisponibles.Count)];
        objetivoColor = coloresDisponibles[Random.Range(0, coloresDisponibles.Count)];

        ActualizarUI();
        StartCoroutine(IniciarPartida());
        Debug.Log($"🎯 Doble Canal - Objetivo: {objetivoIcono} color:{objetivoColor}");
    }

    private IEnumerator IniciarPartida()
    {
        activo = false;
        OnMostrarFeedback?.Invoke("PREPARADO...", Color.white);
        yield return new WaitForSeconds(1f);
        OnMostrarFeedback?.Invoke("¡YA!", Color.green);
        yield return new WaitForSeconds(0.5f);
        OnFeedbackTerminado?.Invoke();

        activo = true;
        StartCoroutine(CicloEstimulos());
    }

    private IEnumerator CicloEstimulos()
    {
        while (activo)
        {
            float tiempoEntre = curvaTiempoEntreEstimulos.Evaluate(DifficultyManager.Instance?.nivelActual ?? 1);
            yield return new WaitForSeconds(tiempoEntre);
            if (activo && !feedbackVisible) GenerarEstimulo();
        }
    }

    private void GenerarEstimulo()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        duracionEstimuloActual = curvaDuracionEstimulo.Evaluate(nivel);
        float prob = curvaProbObjetivo.Evaluate(nivel);
        bool esObjetivo = Random.value < prob;

        if (esObjetivo)
        {
            estimuloIcono = objetivoIcono;
            estimuloColor = objetivoColor;
        }
        else
        {
            var otros = iconosDisponibles.Where(i => i != objetivoIcono).ToList();
            estimuloIcono = otros[Random.Range(0, otros.Count)];
            estimuloColor = coloresDisponibles[Random.Range(0, coloresDisponibles.Count)];
        }

        OnMostrarEstimulo?.Invoke(estimuloIcono, estimuloColor, estimuloFontSize);
        esperandoRespuesta = true;
        inicioEstimulo = Time.time;
        StartCoroutine(TemporizadorOmision());
    }

    private IEnumerator TemporizadorOmision()
    {
        yield return new WaitForSeconds(duracionEstimuloActual);

        if (esperandoRespuesta && activo && !feedbackVisible)
        {
            esperandoRespuesta = false;
            OnOcultarEstimulo?.Invoke();

            bool eraObjetivo = (estimuloIcono == objetivoIcono);
            if (eraObjetivo)
            {
                fallos++;
                OnMostrarFeedback?.Invoke("OMISIÓN", Color.red);
                feedbackVisible = true;
                StartCoroutine(EsperarFeedback());
            }
            else
            {
                aciertos++;
                racha++;
                if (racha > mejorRacha) mejorRacha = racha;
                OnMostrarFeedback?.Invoke("CORRECTO", Color.green);
                feedbackVisible = true;
                StartCoroutine(EsperarFeedback());
            }
            ActualizarUI();
        }
    }

    public void Responder()
    {
        if (!esperandoRespuesta || !activo || feedbackVisible) return;

        esperandoRespuesta = false;
        StopAllCoroutines();
        StartCoroutine(CicloEstimulos());

        float tiempoRespuesta = Time.time - inicioEstimulo;
        tiemposReaccion.Add(tiempoRespuesta);
        OnOcultarEstimulo?.Invoke();

        bool eraObjetivo = (estimuloIcono == objetivoIcono);

        if (eraObjetivo)
        {
            aciertos++;
            racha++;
            if (racha > mejorRacha) mejorRacha = racha;
            OnMostrarFeedback?.Invoke("CORRECTO", Color.green);
            float rendimiento = Mathf.Clamp01(1f - (tiempoRespuesta / duracionEstimuloActual));
            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, tiempoRespuesta);
        }
        else
        {
            fallos++;
            racha = 0;
            OnMostrarFeedback?.Invoke("ERROR", Color.red);
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, tiempoRespuesta);
        }

        feedbackVisible = true;
        ActualizarUI();
        StartCoroutine(EsperarFeedback());
    }

    private IEnumerator EsperarFeedback()
    {
        yield return new WaitForSeconds(0.8f);
        OnFeedbackTerminado?.Invoke();
        feedbackVisible = false;
    }

    private void Update()
    {
        if (!activo) return;

        // ========== CANAL IZQUIERDO: RUNNER ==========

        // Salto
        if (Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0))
        {
            if (enSuelo)
            {
                velocidadVertical = fuerzaSalto;
                enSuelo = false;
            }
        }

        // Gravedad
        velocidadVertical -= gravedad * Time.deltaTime;
        float nuevaY = personaje.transform.position.y + velocidadVertical * Time.deltaTime;
        if (nuevaY <= alturaSuelo)
        {
            nuevaY = alturaSuelo;
            velocidadVertical = 0f;
            enSuelo = true;
        }
        personaje.transform.position = new Vector3(personaje.transform.position.x, nuevaY, 0);

        // Distancia y velocidad
        float velocidadActual = curvaVelocidadRunner.Evaluate(DifficultyManager.Instance?.nivelActual ?? 1);
        distanciaRecorrida += velocidadActual * Time.deltaTime;

        // Spawn obstáculos
        if (ultimoSpawnX < distanciaRecorrida - distanciaEntreObstaculos)
        {
            SpawnObstaculo();
            ultimoSpawnX = distanciaRecorrida;
        }

        // Mover obstáculos y detectar colisiones
        for (int i = obstaculosActivos.Count - 1; i >= 0; i--)
        {
            if (obstaculosActivos[i] == null)
            {
                obstaculosActivos.RemoveAt(i);
                continue;
            }

            obstaculosActivos[i].transform.position += Vector3.left * velocidadActual * Time.deltaTime;

            if (Vector3.Distance(obstaculosActivos[i].transform.position, personaje.transform.position) < 0.8f)
            {
                colisiones++;
                Destroy(obstaculosActivos[i]);
                obstaculosActivos.RemoveAt(i);
            }
            else if (obstaculosActivos[i].transform.position.x < personaje.transform.position.x - 1f)
            {
                obstaculosEsquivados++;
                Destroy(obstaculosActivos[i]);
                obstaculosActivos.RemoveAt(i);
            }
        }

        ActualizarUI();

        // Fin de partida
        if (colisiones >= 5)
        {
            activo = false;
            OnGameFinished();
        }
    }

    private void SpawnObstaculo()
    {
        Vector3 spawnPos = new Vector3(personaje.transform.position.x + 8f, alturaSuelo, 0);
        GameObject obstaculo = Instantiate(prefabObstaculo, spawnPos, Quaternion.identity);
        obstaculosActivos.Add(obstaculo);
    }

    private void ActualizarUI()
    {
        int puntuacion = (obstaculosEsquivados * 10) + (aciertos * 20) - (fallos * 15);
        OnPuntuacion?.Invoke(Mathf.Max(0, puntuacion));
        OnAciertos?.Invoke(aciertos);
        OnFallos?.Invoke(fallos);
        OnDistancia?.Invoke(Mathf.FloorToInt(distanciaRecorrida));
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (finalizado) return;

        finalizado = true;
        activo = false;
        foreach (GameObject obs in obstaculosActivos)
            if (obs != null) Destroy(obs);
        obstaculosActivos.Clear();
        CognitiveMetrics m = CalcularCognicion();
        WebExporter.EnviarSesion(nombre, AplicarPesos(m));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        int totalObstaculos = obstaculosEsquivados + colisiones;
        int totalEstimulos = aciertos + fallos;

        float eficienciaRunner = totalObstaculos > 0 ? (float)obstaculosEsquivados / totalObstaculos : 1f;
        float eficienciaEstimulos = totalEstimulos > 0 ? (float)aciertos / totalEstimulos : 1f;

        m.atencionDividida = eficienciaRunner * eficienciaEstimulos;

        float tiempoMedio = tiemposReaccion.Count > 0 ? tiemposReaccion.Average() : 0.5f;
        m.coordinacionVisomotora = Mathf.Clamp01(1f / (tiempoMedio + 0.5f)) * eficienciaRunner;
        m.atencionSostenida = 1f - Mathf.Clamp01((float)colisiones / 10f);
        m.velocidadCognitiva = Mathf.Clamp01(1f / (tiempoMedio + 0.3f));

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.atencionDividida = m.atencionDividida * 0.60f;
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.20f;
        p.atencionSostenida = m.atencionSostenida * 0.15f;
        p.velocidadCognitiva = m.velocidadCognitiva * 0.05f;
        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        activo = !pausar;
    }
}
