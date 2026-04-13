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
    public float celdaAncho = 90f;
    public float celdaAlto = 90f;

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

        for (int i = 0; i < total; i++)
        {
            GameObject icono = Instantiate(prefabIcono, gridContainer);
            icono.name = $"Celda_{i}";
            celdas[i] = icono;

            bool esIntruso = (i == intrusoIndex);

            CeldaData data = icono.GetComponent<CeldaData>();
            if (data == null)
                data = icono.AddComponent<CeldaData>();

            data.esIntruso = esIntruso;
            data.indice = i;

            CeldaUI celdaUI = icono.GetComponent<CeldaUI>();
            if (celdaUI != null)
            {
                celdaUI.Configurar(() => ClickCelda(data.indice));

                if (esIntruso && spriteIntruso != null)
                    celdaUI.SetSprite(spriteIntruso);
                else if (spriteNormal != null)
                    celdaUI.SetSprite(spriteNormal);
            }
        }
    }

    private void ClickCelda(int indice)
    {
        if (!rondaActiva || juegoTerminado || juegoPausado) return;

        rondaActiva = false;
        Debug.Log($"🎯 ClickCelda - juegoPausado: {juegoPausado}");

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
        }
        else
        {
            errores++;
            OnFeedback?.Invoke(false);
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, rt);
            AudioManager.Instance.Error();
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

        if (totalIntentos == 0) return m;

        float precision = (float)aciertos / totalIntentos;
        float errorRate = (float)errores / totalIntentos;
        float omissionRate = (float)omisiones / totalIntentos;
        float rtMedio = sumaRT / Mathf.Max(1, totalIntentos - omisiones);
        float rtVar = Mathf.Max(0, (sumaRT2 / Mathf.Max(1, totalIntentos)) - (rtMedio * rtMedio));

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        float factorNivel = 1f + ((nivel - 1f) / 9f);
        float tiempoEsperado = curvaTiempo.Evaluate(nivel);
        float velocidadRaw = tiempoEsperado / Mathf.Max(0.3f, rtMedio);

        float penalizacionFallos = 1f - (errorRate * 0.8f);
        float penalizacionOmisiones = 1f - (omissionRate * 1.2f);

        m.atencionSelectiva = Mathf.Clamp01(precision * penalizacionFallos * (1f + (factorNivel - 1f) * 0.5f));
        m.velocidadCognitiva = Mathf.Clamp01(velocidadRaw * penalizacionOmisiones * (1f + (factorNivel - 1f) * 0.3f));

        float coordinacionRaw = (precision + velocidadRaw) / 2f;
        m.coordinacionVisomotora = Mathf.Clamp01(coordinacionRaw * penalizacionFallos * penalizacionOmisiones);

        int totalElementos = filas * columnas;
        float demandaAtencional = Mathf.Clamp01((totalElementos - 12f) / 16f);
        m.atencionDividida = Mathf.Clamp01(precision * (1f - omissionRate * 0.5f) * (1f + demandaAtencional * 0.5f));

        m.controlInhibitorio = Mathf.Clamp01(1f - (errorRate * 1.2f));

        float consistencia = 1f - Mathf.Clamp01(rtVar / 2f);
        m.atencionSostenida = consistencia * (1f - omissionRate * 0.5f);

        if (aciertosLista.Count >= 3)
        {
            int aciertosRecientes = 0;
            int inicio = Mathf.Max(0, aciertosLista.Count - 5);
            for (int i = inicio; i < aciertosLista.Count; i++)
                if (aciertosLista[i]) aciertosRecientes++;
            m.memoriaTrabajo = (float)aciertosRecientes / Mathf.Min(5, aciertosLista.Count - inicio);
        }

        m.flexibilidadCognitiva = Mathf.Clamp01((precision + velocidadRaw) / 2f * (1f + (nivel - 1f) / 9f * 0.3f));

        m.memoriaEspacial = 0f;
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

        p.atencionSostenida = m.atencionSostenida * 0.01f;
        p.memoriaTrabajo = m.memoriaTrabajo * 0.01f;
        p.controlInhibitorio = m.controlInhibitorio * 0.01f;
        p.flexibilidadCognitiva = m.flexibilidadCognitiva * 0.01f;

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