using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Random = UnityEngine.Random;

public class CambioDeReglasGame : BaseGame
{
    [Header("UI")]
    public UICambioDeReglas uiCambioDeReglas;

    [Header("Base de Datos")]
    public FoodDatabase foodDatabase;

    [Header("Configuración")]
    public GameDifficulty currentDifficulty = GameDifficulty.Medium;
    public float duracionReglaInicial = 12f;
    public float duracionReglaFinal = 6f;
    public float duracionRondaInicial = 8f;
    public float duracionRondaFinal = 4f;
    public Vector2 tamanioInicial = new Vector2(140f, 140f);
    public Vector2 tamanioFinal = new Vector2(100f, 100f);
    public int aciertosPorNivel = 5;

    private class AlimentoUI
    {
        public GameObject gameObject;
        public RectTransform rect;
        public Image imagen;
        public Button boton;
        public FoodItem comida;
        public bool resuelto;
    }

    private List<AlimentoUI> alimentosActivos = new List<AlimentoUI>();
    private RectTransform zonaJuego;

    private FoodTags tagActual;
    private bool esModoAtrapar; // true = TOCA, false = EVITA
    private string textoReglaActual = "";

    private bool juegoActivo = true;
    private bool juegoTerminado = false;

    private float temporizadorRegla;
    private float duracionReglaActual;
    private float temporizadorRonda;
    private float duracionRondaActual;

    private int nivelActual = 1;
    private int aciertos = 0;
    private int fallos = 0;
    private int racha = 0;
    private int mejorRacha = 0;
    private int cambiosRegla = 0;

    private float ultimoCambioRegla = 0f;

    // Propiedades públicas
    public int NivelActual => nivelActual;
    public int Aciertos => aciertos;
    public int Fallos => fallos;
    public int RachaActual => racha;
    public int CambiosRegla => cambiosRegla;
    public float TiempoPartidaRestante => GameManager.Instance?.tiempoRestante ?? 0f;
    public string TextoRegla => textoReglaActual;

    public event Action OnEstadoActualizado;
    public event Action<string> OnReglaActualizada;
    public event Action<string> OnCambioRegla;

    private void Awake()
    {
        nombre = "Cambio de Reglas";
        CachearUI();
    }

    public override void ResetGame()
    {
        juegoActivo = true;
        juegoTerminado = false;
        juegoPausado = false;

        nivelActual = 1;
        aciertos = 0;
        fallos = 0;
        racha = 0;
        mejorRacha = 0;
        cambiosRegla = 0;

        PrepararUI();
        GenerarNuevaRegla();
        GenerarRonda();
        EmitirEstado();
    }

    public override void OnGameStart() => ResetGame();

    private void Update()
    {
        if (!juegoActivo || juegoTerminado || juegoPausado) return;

        temporizadorRegla -= Time.deltaTime;
        temporizadorRonda -= Time.deltaTime;

        if (temporizadorRegla <= 0f)
        {
            GenerarNuevaRegla();
        }

        if (temporizadorRonda <= 0f)
        {
            FinalizarRondaPorTiempo();
        }

        EmitirEstado();
    }

    private void GenerarNuevaRegla()
    {
        // Calcular nivel actual basado en aciertos
        nivelActual = 1 + (aciertos / aciertosPorNivel);
        nivelActual = Mathf.Clamp(nivelActual, 1, 10);

        // Duración de regla: más larga al inicio, más corta al final
        float t = (nivelActual - 1f) / 9f;
        duracionReglaActual = Mathf.Lerp(duracionReglaInicial, duracionReglaFinal, t);
        temporizadorRegla = duracionReglaActual;

        // Obtener tags disponibles según nivel y dificultad
        List<FoodTags> tagsDisponibles = ObtenerTagsDisponibles();

        if (tagsDisponibles.Count == 0)
        {
            Debug.LogError("No hay tags disponibles");
            return;
        }

        // Elegir tag aleatorio
        tagActual = tagsDisponibles[Random.Range(0, tagsDisponibles.Count)];

        // Decidir modo (TOCA o EVITA) - más difícil en niveles altos
        if (nivelActual >= 4 && Random.value > 0.6f)
            esModoAtrapar = false;
        else
            esModoAtrapar = true;

        string nombreTag = ObtenerNombreTag(tagActual);
        textoReglaActual = esModoAtrapar ? $"TOCA {nombreTag}" : $"EVITA {nombreTag}";

        cambiosRegla++;
        ultimoCambioRegla = Time.time;

        AudioManager.Instance?.NivelUp();
        OnCambioRegla?.Invoke("¡NORMA ACTUALIZADA!");
        OnReglaActualizada?.Invoke(textoReglaActual);

        Debug.Log($"Nueva regla: {textoReglaActual} (Nivel {nivelActual})");

        // La ronda actual sigue, pero la regla cambia
        EmitirEstado();
    }

    private List<FoodTags> ObtenerTagsDisponibles()
    {
        List<FoodTags> tags = new List<FoodTags>
        {
            FoodTags.Rojo, FoodTags.Verde, FoodTags.Amarillo,
            FoodTags.Redondo, FoodTags.Alargado
        };

        if (nivelActual >= 2)
        {
            tags.Add(FoodTags.Naranja);
            tags.Add(FoodTags.Cuadrado);
        }

        if (nivelActual >= 3 && currentDifficulty != GameDifficulty.Easy)
        {
            tags.Add(FoodTags.Fruta);
            tags.Add(FoodTags.Verdura);
        }

        if (nivelActual >= 4 && currentDifficulty != GameDifficulty.Easy)
        {
            tags.Add(FoodTags.Carne);
            tags.Add(FoodTags.Lacteo);
        }

        if (nivelActual >= 5 && currentDifficulty != GameDifficulty.Easy)
        {
            tags.Add(FoodTags.Pequeno);
            tags.Add(FoodTags.Mediano);
            tags.Add(FoodTags.Grande);
        }

        if (nivelActual >= 6 && currentDifficulty == GameDifficulty.Hard)
        {
            tags.Add(FoodTags.Dulce);
            tags.Add(FoodTags.Salado);
        }

        return tags;
    }

    private string ObtenerNombreTag(FoodTags tag)
    {
        switch (tag)
        {
            case FoodTags.Rojo: return "ROJOS";
            case FoodTags.Verde: return "VERDES";
            case FoodTags.Amarillo: return "AMARILLOS";
            case FoodTags.Naranja: return "NARANJAS";
            case FoodTags.Marron: return "MARRONES";
            case FoodTags.Blanco: return "BLANCOS";
            case FoodTags.Azul: return "AZULES";
            case FoodTags.Rosa: return "ROSAS";
            case FoodTags.Redondo: return "REDONDOS";
            case FoodTags.Alargado: return "ALARGADOS";
            case FoodTags.Cuadrado: return "CUADRADOS";
            case FoodTags.Irregular: return "IRREGULARES";
            case FoodTags.Fruta: return "FRUTAS";
            case FoodTags.Verdura: return "VERDURAS";
            case FoodTags.Carne: return "CARNES";
            case FoodTags.Lacteo: return "LACTEOS";
            case FoodTags.Dulce: return "DULCES";
            case FoodTags.Salado: return "SALADOS";
            case FoodTags.Pequeno: return "PEQUENOS";
            case FoodTags.Mediano: return "MEDIANOS";
            case FoodTags.Grande: return "GRANDES";
            default: return tag.ToString();
        }
    }

    private void GenerarRonda()
    {
        // Limpiar alimentos anteriores
        LimpiarAlimentos();

        // Calcular duración de ronda según nivel
        float t = (nivelActual - 1f) / 9f;
        duracionRondaActual = Mathf.Lerp(duracionRondaInicial, duracionRondaFinal, t);
        temporizadorRonda = duracionRondaActual;

        // Número de alimentos (más en niveles altos)
        int cantidad = Mathf.Clamp(4 + (nivelActual / 2), 3, 10);

        // Calcular cuántos deben cumplir la regla
        int objetivos = Mathf.Clamp(cantidad / 2 + Random.Range(-1, 2), 1, cantidad - 1);

        // Generar posiciones
        List<Vector2> posicionesUsadas = new List<Vector2>();

        for (int i = 0; i < cantidad; i++)
        {
            bool debeCumplir = i < objetivos;
            FoodItem comida = debeCumplir ? ObtenerComidaQueCumple() : ObtenerComidaQueNoCumple();

            Vector2 posicion = ObtenerPosicionLibre(posicionesUsadas);
            posicionesUsadas.Add(posicion);

            CrearAlimento(comida, posicion);
        }

        Debug.Log($"Ronda generada: {objetivos} objetivos, {cantidad - objetivos} distractores");
    }

    private FoodItem ObtenerComidaQueCumple()
    {
        List<FoodItem> candidatos;

        if (esModoAtrapar)
            candidatos = foodDatabase.GetFoodsWithTag(tagActual);
        else
            candidatos = foodDatabase.GetFoodsWithoutTag(tagActual);

        if (candidatos.Count == 0)
            candidatos = foodDatabase.allFoods;

        return candidatos[Random.Range(0, candidatos.Count)];
    }

    private FoodItem ObtenerComidaQueNoCumple()
    {
        List<FoodItem> candidatos;

        if (esModoAtrapar)
            candidatos = foodDatabase.GetFoodsWithoutTag(tagActual);
        else
            candidatos = foodDatabase.GetFoodsWithTag(tagActual);

        if (candidatos.Count == 0)
            candidatos = foodDatabase.allFoods;

        return candidatos[Random.Range(0, candidatos.Count)];
    }

    private void OnAlimentoPresionado(AlimentoUI alimento)
    {
        if (!juegoActivo || juegoTerminado || juegoPausado) return;
        if (alimento.resuelto) return;

        alimento.resuelto = true;
        alimento.boton.interactable = false;

        bool esCorrecto = VerificarSiCumpleRegla(alimento.comida);

        Vector3 posicion = alimento.rect.position;

        if (esCorrecto)
        {
            // ACIERTO
            aciertos++;
            racha++;
            mejorRacha = Mathf.Max(mejorRacha, racha);

            AudioManager.Instance?.Acierto();
            uiCambioDeReglas?.MostrarFeedbackFlotante("¡CORRECTO!", posicion, true);
        }
        else
        {
            // ERROR
            fallos++;
            racha = 0;

            AudioManager.Instance?.Error();
            uiCambioDeReglas?.MostrarFeedbackFlotante("¡INCORRECTO!", posicion, false);
        }

        // Animar y destruir
        StartCoroutine(AnimarYDestruir(alimento.gameObject));

        // Verificar si la ronda terminó
        VerificarFinRonda();
        EmitirEstado();
    }

    private bool VerificarSiCumpleRegla(FoodItem comida)
    {
        bool tieneTag = comida.tags.HasFlag(tagActual);

        if (esModoAtrapar)
            return tieneTag;
        else
            return !tieneTag;
    }


    private IEnumerator AnimarYDestruir(GameObject obj)
    {
        if (obj == null) yield break;

        float duracion = 0.15f;
        float tiempo = 0f;
        RectTransform rect = obj.GetComponent<RectTransform>();
        Image img = obj.GetComponent<Image>();

        if (rect == null || img == null)
        {
            Destroy(obj);
            yield break;
        }

        Vector3 escalaOriginal = rect.localScale;

        while (tiempo < duracion)
        {
            if (obj == null) yield break;

            tiempo += Time.deltaTime;
            float t = tiempo / duracion;

            if (rect != null)
                rect.localScale = Vector3.Lerp(escalaOriginal, Vector3.zero, t);

            if (img != null)
            {
                Color c = img.color;
                c.a = Mathf.Lerp(1f, 0f, t);
                img.color = c;
            }

            yield return null;
        }

        if (obj != null) Destroy(obj);
    }

    private void LimpiarAlimentos()
    {
        foreach (var alimento in alimentosActivos)
        {
            if (alimento?.gameObject != null)
                Destroy(alimento.gameObject);
        }
        alimentosActivos.Clear();
    }

    private Vector2 ObtenerPosicionLibre(List<Vector2> usadas)
    {
        if (zonaJuego == null) return Vector2.zero;

        // Obtener dimensiones REALES de la zona de juego
        float anchoZona = zonaJuego.rect.width;
        float altoZona = zonaJuego.rect.height;

        // Si las dimensiones son 0 (aún no se calculó), usar valores por defecto
        if (anchoZona <= 0) anchoZona = 800f;
        if (altoZona <= 0) altoZona = 600f;

        // Márgenes de seguridad para que no se salgan de la pantalla
        float tamanioAlimento = Mathf.Lerp(tamanioInicial.x, tamanioFinal.x, (nivelActual - 1f) / 9f);
        float margenX = tamanioAlimento * 0.8f;
        float margenY = tamanioAlimento * 0.8f;

        // Límites seguros
        float minX = -anchoZona * 0.4f + margenX;
        float maxX = anchoZona * 0.4f - margenX;
        float minY = -altoZona * 0.35f + margenY;
        float maxY = altoZona * 0.35f - margenY;

        // Asegurar que los límites son válidos
        minX = Mathf.Max(minX, -350f);
        maxX = Mathf.Min(maxX, 350f);
        minY = Mathf.Max(minY, -250f);
        maxY = Mathf.Min(maxY, 250f);

        for (int intento = 0; intento < 60; intento++)
        {
            Vector2 pos = new Vector2(
                Random.Range(minX, maxX),
                Random.Range(minY, maxY)
            );

            // Verificar que no esté demasiado cerca de otro
            bool libre = true;
            float distanciaMinima = tamanioAlimento * 1.2f;

            foreach (var p in usadas)
            {
                if (Vector2.Distance(pos, p) < distanciaMinima)
                {
                    libre = false;
                    break;
                }
            }

            if (libre)
            {
                Debug.Log($"Posición generada: ({pos.x}, {pos.y}) - Zona: {anchoZona}x{altoZona}");
                return pos;
            }
        }

        // Fallback: posición centrada
        Debug.LogWarning("No se encontró posición libre, usando centrado");
        return Vector2.zero;
    }

    private void CrearAlimento(FoodItem comida, Vector2 posicion)
    {
        if (zonaJuego == null) return;

        // VALIDAR que la posición está dentro de los límites
        float anchoZona = zonaJuego.rect.width;
        float altoZona = zonaJuego.rect.height;

        if (anchoZona <= 0) anchoZona = 800f;
        if (altoZona <= 0) altoZona = 600f;

        float tamanio = Mathf.Lerp(tamanioInicial.x, tamanioFinal.x, (nivelActual - 1f) / 9f);
        float margen = tamanio * 0.6f;

        float limiteX = anchoZona * 0.4f - margen;
        float limiteY = altoZona * 0.35f - margen;

        // Corregir posición si está fuera de límites
        Vector2 posCorregida = posicion;
        posCorregida.x = Mathf.Clamp(posCorregida.x, -limiteX, limiteX);
        posCorregida.y = Mathf.Clamp(posCorregida.y, -limiteY, limiteY);

        GameObject obj = new GameObject("Alimento", typeof(RectTransform), typeof(Image), typeof(Button));
        obj.transform.SetParent(zonaJuego, false);

        AlimentoUI nuevo = new AlimentoUI
        {
            gameObject = obj,
            rect = obj.GetComponent<RectTransform>(),
            imagen = obj.GetComponent<Image>(),
            boton = obj.GetComponent<Button>(),
            comida = comida,
            resuelto = false
        };

        // Configurar tamaño
        nuevo.rect.sizeDelta = new Vector2(tamanio, tamanio);

        // POSICIONAR correctamente con anclas en el centro
        nuevo.rect.anchorMin = new Vector2(0.5f, 0.5f);
        nuevo.rect.anchorMax = new Vector2(0.5f, 0.5f);
        nuevo.rect.pivot = new Vector2(0.5f, 0.5f);
        nuevo.rect.anchoredPosition = posCorregida;

        // Imagen
        nuevo.imagen.sprite = comida.sprite;
        nuevo.imagen.preserveAspect = true;

        // Botón
        nuevo.boton.targetGraphic = nuevo.imagen;
        nuevo.boton.onClick.AddListener(() => OnAlimentoPresionado(nuevo));

        alimentosActivos.Add(nuevo);

        Debug.Log($"Alimento creado: {comida.nombre} en posición ({posCorregida.x}, {posCorregida.y})");
    }

    private void VerificarFinRonda()
    {
        // Contar cuántos objetivos quedan
        int objetivosRestantes = 0;
        int totalObjetivos = 0;

        foreach (var alimento in alimentosActivos)
        {
            if (alimento == null) continue;

            if (VerificarSiCumpleRegla(alimento.comida))
            {
                totalObjetivos++;
                if (!alimento.resuelto)
                    objetivosRestantes++;
            }
        }

        if (objetivosRestantes == 0 && totalObjetivos > 0)
        {
            // Todos los objetivos fueron tocados
            Debug.Log($"Ronda completada: {totalObjetivos} objetivos tocados");
            GenerarRonda();
        }
    }

    private void FinalizarRondaPorTiempo()
    {
        // Contar objetivos no tocados (solo para log, no penalizan)
        int noTocados = 0;
        int totalObjetivos = 0;
        List<GameObject> aDestruir = new List<GameObject>();

        foreach (var alimento in alimentosActivos)
        {
            if (alimento == null) continue;

            if (VerificarSiCumpleRegla(alimento.comida))
            {
                totalObjetivos++;
                if (!alimento.resuelto)
                {
                    noTocados++;
                    alimento.resuelto = true;
                    aDestruir.Add(alimento.gameObject);
                }
            }
        }

        // Destruir los que quedaban
        foreach (var obj in aDestruir)
        {
            StartCoroutine(AnimarYDestruir(obj));
        }

        if (noTocados > 0)
        {
            Debug.Log($"Tiempo agotado: {noTocados} de {totalObjetivos} objetivos sin tocar (NO penalizan)");
            if (uiCambioDeReglas != null)
                uiCambioDeReglas.MostrarFeedbackFlotante("¡TIEMPO!", Vector3.zero, false);
        }

        // Generar nueva ronda
        GenerarRonda();
    }
    private void CachearUI()
    {
        if (uiCambioDeReglas == null)
            uiCambioDeReglas = GetComponent<UICambioDeReglas>();
        if (uiCambioDeReglas == null)
            uiCambioDeReglas = FindFirstObjectByType<UICambioDeReglas>();
        if (uiCambioDeReglas == null)
            uiCambioDeReglas = gameObject.AddComponent<UICambioDeReglas>();
    }

    private void PrepararUI()
    {
        CachearUI();
        uiCambioDeReglas.Preparar(this);
        zonaJuego = uiCambioDeReglas.ZonaJuego;
    }

    private void EmitirEstado() => OnEstadoActualizado?.Invoke();

    public override void PausarJuego(bool pausar) => base.PausarJuego(pausar);

    public override void OnGameFinished()
    {
        if (juegoTerminado) return;
        juegoTerminado = true;
        juegoActivo = false;
        LimpiarAlimentos();

        var metrics = AplicarPesos(CalcularCognicion());
        WebExporter.EnviarSesion(nombre, metrics);
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        int total = aciertos + fallos;
        if (total <= 0) return m;

        float precision = (float)aciertos / total;
        float nivelFactor = Mathf.Lerp(0.65f, 1f, Mathf.Clamp01(nivelActual / 10f));
        float adaptacion = Mathf.Clamp01((cambiosRegla - 1f) / 8f);
        float rachaNormalizada = Mathf.Clamp01(mejorRacha / 12f);

        m.flexibilidadCognitiva = Mathf.Clamp01((precision * 0.65f + adaptacion * 0.35f) * nivelFactor);
        m.controlInhibitorio = Mathf.Clamp01(precision * nivelFactor);
        m.planificacion = Mathf.Clamp01((precision * 0.6f + rachaNormalizada * 0.4f) * nivelFactor);
        m.memoriaEspacial = Mathf.Clamp01((precision * 0.75f + rachaNormalizada * 0.25f) * nivelFactor);

        Debug.Log($"📊 Cambio de Reglas - Total:{total} Aciertos:{aciertos} Fallos:{fallos} Cambios:{cambiosRegla} Nivel:{nivelActual}");
        Debug.Log($"📊 Métricas - Flex:{m.flexibilidadCognitiva:F2} Control:{m.controlInhibitorio:F2} Plan:{m.planificacion:F2} Espacial:{m.memoriaEspacial:F2}");

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics w = new CognitiveMetrics();
        w.flexibilidadCognitiva = metrics.flexibilidadCognitiva * 0.55f;
        w.controlInhibitorio = metrics.controlInhibitorio * 0.20f;
        w.planificacion = metrics.planificacion * 0.15f;
        w.memoriaEspacial = metrics.memoriaEspacial * 0.10f;
        return w;
    }
}
