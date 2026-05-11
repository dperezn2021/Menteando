using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;

public class DetectorDeIntrusosGame : BaseGame
{
    [Header("Configuración del Juego")]
    public Transform gridContainer;
    public GameObject prefabIcono;

    [Header("Sprites")]
    public Sprite spriteNormal;
    public Sprite spriteIntruso;

    [Header("Dificultad - Curvas de progresión")]
    public AnimationCurve curvaColumnas;
    public AnimationCurve curvaFilas;
    public AnimationCurve curvaTiempo;

    [Header("Tamaño de celdas UI")]
    public float celdaAncho = 150f;
    public float celdaAlto = 150f;

    private bool juegoTerminado = false;
    private int filas;
    private int columnas;
    private int intrusoIndex;
    private bool rondaActiva;
    private Coroutine temporizadorCoroutine;
    private float tiempoInicio;
    private GameObject[] celdas;
    private int errores;
    private int omisiones;
    private float sumaRT;
    private float sumaRT2;

    private List<float> tiemposReaccion = new List<float>();
    private List<bool> aciertosLista = new List<bool>();

    [HideInInspector] public float tiempoRondaRestante;
    [HideInInspector] public int aciertos;
    [HideInInspector] public int totalIntentos;
    [HideInInspector] public float tiempoPorEnsayo = 2.5f;

    public System.Action<float> OnTiempoRondaActualizado;
    public System.Action<int, int> OnPuntuacionActualizada;
    public System.Action<int> OnNivelActualizado;
    public System.Action<bool> OnFeedback;
    public System.Action OnRondaTerminada;
    public System.Action<int, int> OnGridSizeChanged;

    private void Awake()
    {
        nombre = "detector-intrusos";
        InicializarCurvasDificultad();
    }

    private void InicializarCurvasDificultad()
    {
        if (curvaColumnas == null || curvaColumnas.keys.Length == 0)
        {
            curvaColumnas = new AnimationCurve();
            curvaColumnas.AddKey(1, 4);
            curvaColumnas.AddKey(3, 4);
            curvaColumnas.AddKey(5, 5);
            curvaColumnas.AddKey(7, 6);
            curvaColumnas.AddKey(10, 7);
        }

        if (curvaFilas == null || curvaFilas.keys.Length == 0)
        {
            curvaFilas = new AnimationCurve();
            curvaFilas.AddKey(1, 3);
            curvaFilas.AddKey(4, 3);
            curvaFilas.AddKey(6, 4);
            curvaFilas.AddKey(10, 4);
        }

        if (curvaTiempo == null || curvaTiempo.keys.Length == 0)
        {
            curvaTiempo = new AnimationCurve();
            curvaTiempo.AddKey(1, 2.5f);
            curvaTiempo.AddKey(3, 2.2f);
            curvaTiempo.AddKey(5, 1.8f);
            curvaTiempo.AddKey(7, 1.4f);
            curvaTiempo.AddKey(10, 1.0f);
        }
    }

    public override void ResetGame()
    {
        Debug.Log("🔄 ResetGame - Reiniciando partida");

        juegoTerminado = false;
        juegoPausado = false;

        if (temporizadorCoroutine != null)
            StopCoroutine(temporizadorCoroutine);

        totalIntentos = 0;
        aciertos = 0;
        errores = 0;
        omisiones = 0;
        sumaRT = 0;
        sumaRT2 = 0;

        tiemposReaccion.Clear();
        aciertosLista.Clear();
        DifficultyManager.Instance?.ResetDifficulty(1);

        rondaActiva = false;

        GenerarEstimulos();
    }

    public void GenerarEstimulos()
    {
        if (temporizadorCoroutine != null)
            StopCoroutine(temporizadorCoroutine);

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        ObtenerConfiguracionNivel(nivel);

        OnGridSizeChanged?.Invoke(filas, columnas);
        OnNivelActualizado?.Invoke(nivel);

        CrearGrid();

        rondaActiva = true;
        totalIntentos++;
        tiempoInicio = Time.time;
        tiempoRondaRestante = tiempoPorEnsayo;

        Debug.Log($"🔄 RONDA {totalIntentos} - Nivel {nivel} - Tiempo: {tiempoPorEnsayo}s");

        temporizadorCoroutine = StartCoroutine(TemporizadorEnsayo());
    }

    private void ObtenerConfiguracionNivel(int nivel)
    {
        columnas = Mathf.RoundToInt(curvaColumnas.Evaluate(nivel));
        filas = Mathf.RoundToInt(curvaFilas.Evaluate(nivel));
        tiempoPorEnsayo = curvaTiempo.Evaluate(nivel);
    }

    private void CrearGrid()
    {
        if (celdas != null)
        {
            foreach (GameObject celda in celdas)
                if (celda != null) Destroy(celda);
        }

        int total = filas * columnas;
        intrusoIndex = Random.Range(0, total);
        celdas = new GameObject[total];

        if (gridContainer != null)
        {
            GridLayoutGroup grid = gridContainer.GetComponent<GridLayoutGroup>();
            if (grid != null)
            {
                grid.cellSize = new Vector2(celdaAncho, celdaAlto);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = columnas;
            }
        }

        for (int i = 0; i < total; i++)
        {
            GameObject icono = Instantiate(prefabIcono, gridContainer);
            icono.name = $"Celda_{i}";
            celdas[i] = icono;

            bool esIntruso = (i == intrusoIndex);

            Image img = icono.GetComponent<Image>();
            Button btn = icono.GetComponent<Button>();

            if (img == null)
            {
                Debug.LogError($"❌ Celda {i} no tiene Image component");
                continue;
            }

            if (btn == null)
            {
                Debug.LogError($"❌ Celda {i} no tiene Button component");
                continue;
            }

            if (esIntruso && spriteIntruso != null)
                img.sprite = spriteIntruso;
            else if (spriteNormal != null)
                img.sprite = spriteNormal;

            img.color = Color.white;

            int indiceCapturado = i;
            btn.onClick.RemoveAllListeners();
            btn.onClick.AddListener(() => ClickCelda(indiceCapturado));
        }

        Debug.Log($"🎯 Grid {filas}x{columnas} - Intruso en celda {intrusoIndex}");
    }

    private void ClickCelda(int indice)
    {
        Debug.Log($"🖱️ CLICK en celda {indice} - RondaActiva: {rondaActiva} | JuegoTerminado: {juegoTerminado} | Pausado: {juegoPausado}");

        if (!rondaActiva || juegoTerminado || juegoPausado) return;

        rondaActiva = false;

        if (temporizadorCoroutine != null)
            StopCoroutine(temporizadorCoroutine);

        float rt = Time.time - tiempoInicio;
        tiemposReaccion.Add(rt);

        bool esIntruso = (indice == intrusoIndex);
        aciertosLista.Add(esIntruso);

        sumaRT += rt;
        sumaRT2 += rt * rt;

        if (esIntruso)
        {
            aciertos++;
            OnFeedback?.Invoke(true);
            float rendimiento = Mathf.Clamp01(1f - (rt / tiempoPorEnsayo));
            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, rt);
            AudioManager.Instance.Acierto();
            Debug.Log($"✅ ACIERTO! Tiempo: {rt:F2}s | Aciertos: {aciertos}");
        }
        else
        {
            errores++;
            OnFeedback?.Invoke(false);
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, rt);
            AudioManager.Instance.Error();
            Debug.Log($"❌ ERROR! Clic en distractor | Errores: {errores}");
        }

        OnPuntuacionActualizada?.Invoke(aciertos, totalIntentos);
        StartCoroutine(EsperarYGenerar());
    }

    private IEnumerator TemporizadorEnsayo()
    {
        while (tiempoRondaRestante > 0 && rondaActiva && !juegoTerminado)
        {
            if (!juegoPausado)
            {
                tiempoRondaRestante -= Time.deltaTime;
                OnTiempoRondaActualizado?.Invoke(tiempoRondaRestante);
            }
            yield return null;
        }

        if (rondaActiva && !juegoTerminado && !juegoPausado)
        {
            omisiones++;
            rondaActiva = false;

            float rtPenalizacion = tiempoPorEnsayo;
            tiemposReaccion.Add(rtPenalizacion);
            aciertosLista.Add(false);

            sumaRT += rtPenalizacion;
            sumaRT2 += rtPenalizacion * rtPenalizacion;

            OnFeedback?.Invoke(false);
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, rtPenalizacion);

            Debug.Log($"⏰ OMISIÓN! No se pulsó a tiempo | Omisiones: {omisiones}");

            yield return new WaitForSeconds(0.5f);
            OnRondaTerminada?.Invoke();
            GenerarEstimulos();
        }
    }

    private IEnumerator EsperarYGenerar()
    {
        float tiempoEspera = 0;
        while (tiempoEspera < 0.3f)
        {
            if (!juegoPausado)
                tiempoEspera += Time.deltaTime;
            yield return null;
        }

        if (!juegoTerminado && !juegoPausado)
            GenerarEstimulos();
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        int rondasTotales = aciertos + errores + omisiones;
        if (rondasTotales == 0) return m;

        float precisionReal = (float)aciertos / rondasTotales;
        float rtMedio = sumaRT / Mathf.Max(1, aciertos + errores);

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        float tiempoEsperado = curvaTiempo.Evaluate(nivel);
        float velocidad = Mathf.Clamp01(tiempoEsperado / Mathf.Max(0.5f, rtMedio));

        int totalElementos = filas * columnas;
        float demandaAtencional = Mathf.Clamp01((totalElementos - 12f) / 20f);

        Debug.Log($"📊 FINAL - Rondas: {rondasTotales} | Aciertos: {aciertos} | Errores: {errores} | Omisiones: {omisiones}");
        Debug.Log($"📊 Precisión real: {precisionReal:P0} | Tiempo medio: {rtMedio:F2}s | Velocidad: {velocidad:P0}");
        Debug.Log($"📊 Nivel alcanzado: {nivel} | Grid: {filas}x{columnas}");

        m.atencionSelectiva = precisionReal;
        m.velocidadCognitiva = velocidad;
        m.coordinacionVisomotora = precisionReal * velocidad;
        m.atencionDividida = precisionReal * (0.5f + demandaAtencional * 0.5f);

        m.atencionSostenida = 0f;
        m.memoriaTrabajo = 0f;
        m.memoriaEspacial = 0f;
        m.controlInhibitorio = 0f;
        m.flexibilidadCognitiva = 0f;
        m.planificacion = 0f;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        p.atencionSelectiva = m.atencionSelectiva * 0.55f;
        p.velocidadCognitiva = m.velocidadCognitiva * 0.25f;
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.15f;
        p.atencionDividida = m.atencionDividida * 0.05f;

        p.atencionSostenida = 0f;
        p.memoriaTrabajo = 0f;
        p.memoriaEspacial = 0f;
        p.controlInhibitorio = 0f;
        p.flexibilidadCognitiva = 0f;
        p.planificacion = 0f;

        return p;
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    public override void OnGameFinished()
    {
        juegoTerminado = true;
        rondaActiva = false;

        if (temporizadorCoroutine != null)
            StopCoroutine(temporizadorCoroutine);

        if (celdas != null)
        {
            foreach (GameObject celda in celdas)
                if (celda != null) Destroy(celda);
            celdas = null;
        }

        CognitiveMetrics m = CalcularCognicion();
        CognitiveMetrics p = AplicarPesos(m);

        Debug.Log($"📤 Enviando resultados - Selectiva: {p.atencionSelectiva:F2}, Velocidad: {p.velocidadCognitiva:F2}");

        WebExporter.EnviarSesion(nombre, p);
    }

    private void OnDestroy()
    {
        if (temporizadorCoroutine != null)
            StopCoroutine(temporizadorCoroutine);
    }
}

public class CeldaData : MonoBehaviour
{
    public bool esIntruso;
    public int indice;
}