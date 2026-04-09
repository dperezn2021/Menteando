//using TMPro;
//using UnityEngine;
//using UnityEngine.UI;
//using System.Collections;
//using System.Collections.Generic;

//public class DetectorDeIntrusosGame : BaseGame
//{
//    [Header("UI")]
//    public Transform grid;
//    public GameObject prefabIcono;
//    public GridLayoutGroup gridLayout;  // ← AÑADIDO: Referencia al GridLayoutGroup

//    [Header("Parámetros")]
//    public float tiempoPorEnsayo = 2.5f;

//    [Header("Tamaño celdas (px)")]
//    public float anchoCelda = 80f;
//    public float altoCelda = 80f;
//    public float espaciado = 10f;

//    private int filas;
//    private int columnas;
//    private int intrusoIndex;

//    // Control de la ronda actual
//    private bool rondaActiva;
//    private Coroutine temporizadorCoroutine;

//    // Estadísticas
//    private int totalIntentos;
//    private int aciertos;
//    private int errores;
//    private int omisiones;
//    private float sumaRT;
//    private float sumaRT2;

//    // UI temporal (opcional)
//    private TextMeshProUGUI textoTemporizador;

//    private void Awake()
//    {
//        nombre = "detector-intrusos";

//        // Buscar referencia al GridLayoutGroup si no está asignada
//        if (gridLayout == null && grid != null)
//            gridLayout = grid.GetComponent<GridLayoutGroup>();

//        // Buscar texto de temporizador en la UI
//        textoTemporizador = GameObject.Find("TextoTiempoEnsayo")?.GetComponent<TextMeshProUGUI>();
//    }

//    public override void ResetGame()
//    {
//        // Detener corrutinas activas
//        if (temporizadorCoroutine != null)
//            StopCoroutine(temporizadorCoroutine);

//        totalIntentos = 0;
//        aciertos = 0;
//        errores = 0;
//        omisiones = 0;
//        sumaRT = 0;
//        sumaRT2 = 0;
//        rondaActiva = false;

//        GenerarEstimulos();
//    }

//    public void GenerarEstimulos()
//    {
//        // Detener temporizador anterior
//        if (temporizadorCoroutine != null)
//            StopCoroutine(temporizadorCoroutine);

//        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
//        ObtenerGrid(nivel, out filas, out columnas);

//        // IMPORTANTE: Configurar GridLayoutGroup ANTES de crear los hijos
//        ConfigurarGridLayout();
//        CrearGrid();

//        rondaActiva = true;
//        totalIntentos++;
//        EmpezarIntento();

//        temporizadorCoroutine = StartCoroutine(TemporizadorEnsayo());
//    }

//    private void ConfigurarGridLayout()
//    {
//        if (gridLayout == null) return;

//        // Configurar para que crezca en HORIZONTAL con altura fija
//        gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
//        gridLayout.constraintCount = columnas;  // Número fijo de columnas
//        gridLayout.cellSize = new Vector2(anchoCelda, altoCelda);
//        gridLayout.spacing = new Vector2(espaciado, espaciado);
//        gridLayout.startAxis = GridLayoutGroup.Axis.Horizontal;
//        gridLayout.childAlignment = TextAnchor.MiddleCenter;

//        // Ajustar el tamaño del contenedor para que tenga altura fija
//        RectTransform rect = grid as RectTransform;
//        if (rect != null)
//        {
//            // La altura será: (filas * altoCelda) + ((filas-1) * espaciado)
//            float alturaTotal = (filas * altoCelda) + ((filas - 1) * espaciado);
//            rect.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, alturaTotal);
//        }
//    }

//    private IEnumerator TemporizadorEnsayo()
//    {
//        float tiempoRestante = tiempoPorEnsayo;

//        while (tiempoRestante > 0 && rondaActiva)
//        {
//            tiempoRestante -= Time.deltaTime;

//            // Actualizar UI del temporizador si existe
//            if (textoTemporizador != null)
//                textoTemporizador.text = $"⏱️ {tiempoRestante:F1}s";

//            yield return null;
//        }

//        if (rondaActiva)
//        {
//            // OMISIÓN
//            omisiones++;
//            rondaActiva = false;
//            float rtPenalizacion = tiempoPorEnsayo;
//            sumaRT += rtPenalizacion;
//            sumaRT2 += rtPenalizacion * rtPenalizacion;

//            Debug.Log($"⏱️ OMISIÓN - Nivel: {DifficultyManager.Instance?.nivelActual}");

//            // Actualizar dificultad (omisión = mal rendimiento)
//            DifficultyManager.Instance?.ActualizarDificultad(0f, false, rtPenalizacion);

//            GenerarEstimulos();
//        }
//    }

//    private void CrearGrid()
//    {
//        // LIMPIAR GRID CORRECTAMENTE
//        if (grid == null)
//        {
//            Debug.LogError("❌ Grid Transform no asignado");
//            return;
//        }

//        // Eliminar todos los hijos (importante: usar lista temporal para evitar errores)
//        List<GameObject> hijos = new List<GameObject>();
//        foreach (Transform child in grid)
//            hijos.Add(child.gameObject);

//        foreach (GameObject hijo in hijos)
//            DestroyImmediate(hijo);

//        int total = filas * columnas;
//        intrusoIndex = Random.Range(0, total);

//        Debug.Log($"🎮 Generando grid {filas}x{columnas} = {total} celdas. Intruso en índice: {intrusoIndex}");

//        for (int i = 0; i < total; i++)
//        {
//            GameObject icono = Instantiate(prefabIcono, grid);
//            icono.name = $"Celda_{i}";

//            Button btn = icono.GetComponent<Button>();
//            Image img = icono.GetComponent<Image>();

//            if (btn == null)
//            {
//                Debug.LogError($"❌ PrefabIcono no tiene componente Button en celda {i}");
//                continue;
//            }

//            if (img == null)
//            {
//                Debug.LogError($"❌ PrefabIcono no tiene componente Image en celda {i}");
//                continue;
//            }

//            bool esIntruso = (i == intrusoIndex);

//            // Configurar color según nivel (más difícil = más parecidos)
//            int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
//            float factorDificultad = Mathf.Lerp(0.3f, 0.95f, (nivel - 1f) / 9f);

//            if (esIntruso)
//            {
//                img.color = Color.black;
//            }
//            else
//            {
//                // Distractores: más opacos en niveles altos (más parecidos al intruso)
//                img.color = new Color(0, 0, 0, factorDificultad);
//            }

//            // IMPORTANTE: Limpiar listeners anteriores y añadir nuevo
//            btn.onClick.RemoveAllListeners();
//            int indiceCapturado = i;  // Capturar índice para el callback
//            btn.onClick.AddListener(() => ClickIcono(indiceCapturado == intrusoIndex, indiceCapturado));
//        }
//    }

//    private void ClickIcono(bool esIntruso, int indiceClicado)
//    {
//        if (!rondaActiva)
//        {
//            Debug.Log("⚠️ Click ignorado: ronda no activa");
//            return;
//        }

//        rondaActiva = false;

//        if (temporizadorCoroutine != null)
//            StopCoroutine(temporizadorCoroutine);

//        float rt = Time.time - tiempoInicio;
//        sumaRT += rt;
//        sumaRT2 += rt * rt;

//        bool fueAcierto = false;

//        if (esIntruso)
//        {
//            aciertos++;
//            FeedbackCelda(indiceClicado, esIntruso);
//            fueAcierto = true;
//            Debug.Log($"✅ ACIERTO! Tiempo: {rt:F2}s - Celda {indiceClicado}");

//            // Reproducir sonido de acierto
//            GameUIManager.Instance?.ReproducirAcierto();

//            // Calcular rendimiento (1 = perfecto, 0 = muy lento)
//            float rendimiento = Mathf.Clamp01(1f - (rt / tiempoPorEnsayo));
//            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, rt);
//        }
//        else
//        {
//            errores++;
//            FeedbackCelda(indiceClicado, esIntruso);
//            Debug.Log($"❌ ERROR! Click en distractor - Celda {indiceClicado}");

//            GameUIManager.Instance?.ReproducirError();
//            DifficultyManager.Instance?.ActualizarDificultad(0f, false, rt);
//        }

//        // Pequeño feedback visual (opcional - si tienes un panel de feedback)
//        StartCoroutine(FeedbackVisual(fueAcierto));

//        GenerarEstimulos();
//    }

//    private IEnumerator FeedbackVisual(bool acierto)
//    {
//        // Si tienes un panel de feedback, puedes mostrarlo aquí
//        GameObject feedbackPanel = GameObject.Find("FeedbackPanel");
//        if (feedbackPanel != null)
//        {
//            Image img = feedbackPanel.GetComponent<Image>();
//            if (img != null)
//            {
//                img.color = acierto ? new Color(0, 1, 0, 0.5f) : new Color(1, 0, 0, 0.5f);
//                feedbackPanel.SetActive(true);
//                yield return new WaitForSeconds(0.2f);
//                feedbackPanel.SetActive(false);
//            }
//        }
//    }

//    public override CognitiveMetrics CalcularCognicion()
//    {
//        CognitiveMetrics m = new CognitiveMetrics();

//        if (totalIntentos == 0)
//        {
//            Debug.LogWarning("⚠️ CalcularCognicion: totalIntentos es 0");
//            return m;
//        }

//        float precision = (float)aciertos / totalIntentos;
//        float errorRate = (float)errores / totalIntentos;
//        float omissionRate = (float)omisiones / totalIntentos;
//        float rtMedio = sumaRT / totalIntentos;
//        float varRT = Mathf.Max(0, (sumaRT2 / totalIntentos) - (rtMedio * rtMedio));

//        Debug.Log($"📊 Estadísticas - Intentos:{totalIntentos} Aciertos:{aciertos} Errores:{errores} Omisiones:{omisiones}");
//        Debug.Log($"📊 RT Medio:{rtMedio:F2}s Variabilidad:{varRT:F2}");

//        // Factores de penalización
//        float factorNivel = ObtenerFactorNivel();
//        float penalizacionOmisiones = 1f - omissionRate;

//        m.atencionSelectiva = Mathf.Clamp01(precision * factorNivel * penalizacionOmisiones);
//        m.velocidadCognitiva = Mathf.Clamp01((1f / rtMedio) * factorNivel * penalizacionOmisiones);
//        m.coordinacionVisomotora = Mathf.Clamp01(precision * (1f / rtMedio) * factorNivel * penalizacionOmisiones);
//        m.atencionDividida = 0f;

//        return m;
//    }

//    private float ObtenerFactorNivel()
//    {
//        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
//        // Nivel 1 = 0.5, Nivel 10 = 2.0
//        return Mathf.Lerp(0.5f, 2f, (nivel - 1f) / 9f);
//    }

//    private IEnumerator FeedbackCelda(int indice, bool acierto)
//    {
//        Transform celda = grid.GetChild(indice);
//        Image img = celda.GetComponent<Image>();
//        Color original = img.color;

//        img.color = acierto ? Color.green : Color.red;
//        yield return new WaitForSeconds(0.15f);
//        img.color = original;
//    }
//    private void ObtenerGrid(int nivel, out int f, out int c)
//    {
//        // MÁXIMO 4 FILAS - CRECIMIENTO HORIZONTAL
//        if (nivel <= 2) { f = 3; c = 4; }      // 3x4
//        else if (nivel <= 4) { f = 3; c = 5; }  // 3x5
//        else if (nivel <= 6) { f = 4; c = 5; }  // 4x5
//        else if (nivel <= 8) { f = 4; c = 6; }  // 4x6
//        else { f = 4; c = 7; }                  // 4x7
//    }

//    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
//    {
//        CognitiveMetrics p = new CognitiveMetrics();

//        p.atencionSelectiva = m.atencionSelectiva * 0.55f;
//        p.atencionDividida = m.atencionDividida * 0.05f;
//        p.velocidadCognitiva = m.velocidadCognitiva * 0.25f;
//        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.15f;

//        p.atencionSostenida = 0f;
//        p.memoriaTrabajo = 0f;
//        p.memoriaEspacial = 0f;
//        p.controlInhibitorio = 0f;
//        p.flexibilidadCognitiva = 0f;
//        p.planificacion = 0f;

//        return p;
//    }

//    private void OnDestroy()
//    {
//        if (temporizadorCoroutine != null)
//            StopCoroutine(temporizadorCoroutine);
//    }
//}