using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine.UI;

public class SilencioMentalGame : BaseGame
{
    [Header("Configuración")]
    public float duracionPartida = 120f;
    public float tiempoMostrandoObjetivo = 3f;

    [Header("Dificultad - Curvas")]
    public AnimationCurve curvaTiempoEntreSprites;
    public AnimationCurve curvaProbabilidadObjetivo;

    [Header("Características")]
    public List<Color> coloresDisponibles;
    public List<string> nombresColores;
    public List<string> formasDisponibles;
    public List<string> tamaniosDisponibles;

    [Header("UI")]
    public UISilencioMental uiSilencioMental;

    // Eventos para UI
    public System.Action<int, int> OnRacha;
    public System.Action<float> OnTiempoRestante;
    public System.Action<int, int, int> OnEstadisticas;
    public System.Action<int> OnNivelActualizado;
    public System.Action<Sprite, string> OnMostrarObjetivo;
    public System.Action OnOcultarObjetivo;

    // 🔥 NUEVO EVENTO PARA ICONOS TMP
    public System.Action<string, Color, int> OnMostrarEstimulo;
    public System.Action OnOcultarEstimulo;

    // Estado
    private bool juegoActivo = true;
    private bool esperandoRespuesta = false;
    private bool mostrandoObjetivoInicial = false;
    private SpriteData spriteObjetivo;
    private SpriteData spriteActual;
    private float tiempoProximoEstimulo;
    private float tiempoInicioPartida;

    // Métricas
    private int aciertos = 0;
    private int errores = 0;
    private int omisiones = 0;
    private List<float> tiemposReaccion = new List<float>();

    // Racha
    private int rachaActual = 0;
    private int mejorRacha = 0;

    // Banco de “sprites” lógicos (solo datos, ya no texturas)
    private List<SpriteData> todosLosSprites = new List<SpriteData>();

    // Lista de iconos TMP
    private readonly string[] iconosTMP = {
        "●","○","■","□","▲","△","▼","▽","◆","◇",
        "★","☆","✦","✧","✩","✪","✫","✬","✭","✮","✯",
        "←","↑","→","↓","↖","↗","↘","↙"
    };

    private void Awake()
    {
        nombre = "silencio-mental";
        InicializarColores();
        InicializarCurvas();
        GenerarBancoDeSprites(); // solo datos: color, forma, tamaño, nombre
    }

    private void InicializarColores()
    {
        coloresDisponibles = new List<Color>
        {
            Color.red, new Color(0f, 0.8f, 0f), Color.blue, Color.yellow,
            new Color(0.8f, 0f, 0.8f), new Color(1f, 0.5f, 0f),
            new Color(0f, 0.8f, 0.8f), new Color(1f, 0.2f, 0.5f),
            new Color(0.5f, 0.3f, 0.8f), new Color(0.8f, 0.5f, 0.2f)
        };

        nombresColores = new List<string> {
            "Rojo", "Verde", "Azul", "Amarillo", "Morado", "Naranja",
            "Cian", "Rosa", "Violeta", "Marrón"
        };

        formasDisponibles = new List<string> {
            "Círculo", "Cuadrado", "Triángulo", "Hexágono",
            "Estrella", "Corazón", "Rombo", "Pentágono"
        };

        tamaniosDisponibles = new List<string> { "Pequeño", "Mediano", "Grande" };
    }

    private void InicializarCurvas()
    {
        if (curvaTiempoEntreSprites == null || curvaTiempoEntreSprites.keys.Length == 0)
        {
            curvaTiempoEntreSprites = new AnimationCurve();
            curvaTiempoEntreSprites.AddKey(1, 2.5f);
            curvaTiempoEntreSprites.AddKey(3, 2.2f);
            curvaTiempoEntreSprites.AddKey(5, 1.8f);
            curvaTiempoEntreSprites.AddKey(7, 1.4f);
            curvaTiempoEntreSprites.AddKey(10, 0.8f);
        }

        if (curvaProbabilidadObjetivo == null || curvaProbabilidadObjetivo.keys.Length == 0)
        {
            curvaProbabilidadObjetivo = new AnimationCurve();
            curvaProbabilidadObjetivo.AddKey(1, 0.50f);
            curvaProbabilidadObjetivo.AddKey(3, 0.40f);
            curvaProbabilidadObjetivo.AddKey(5, 0.30f);
            curvaProbabilidadObjetivo.AddKey(7, 0.20f);
            curvaProbabilidadObjetivo.AddKey(10, 0.15f);
        }
    }

    private void GenerarBancoDeSprites()
    {
        todosLosSprites.Clear();
        int id = 0;

        foreach (Color color in coloresDisponibles)
        {
            foreach (string forma in formasDisponibles)
            {
                foreach (string tamanio in tamaniosDisponibles)
                {
                    SpriteData sprite = new SpriteData();
                    sprite.id = id++;
                    sprite.color = color;
                    sprite.colorNombre = nombresColores[coloresDisponibles.IndexOf(color)];
                    sprite.forma = forma;
                    sprite.tamanio = tamanio;
                    sprite.nombre = $"{forma} {sprite.colorNombre} ({tamanio})";
                    sprite.textura = null; // ya no usamos textura para estímulos

                    todosLosSprites.Add(sprite);
                }
            }
        }

        Debug.Log($"✅ Banco generado: {todosLosSprites.Count} combinaciones");
    }

    public override void ResetGame()
    {
        if (uiSilencioMental == null)
            uiSilencioMental = FindFirstObjectByType<UISilencioMental>();

        if (uiSilencioMental == null)
        {
            Debug.LogWarning("⚠️ No se encontró UISilencioMental");
            return;
        }

        // Suscribir eventos
        OnRacha += uiSilencioMental.ActualizarRacha;
        OnTiempoRestante += uiSilencioMental.ActualizarTiempo;
        OnNivelActualizado += uiSilencioMental.ActualizarNivel;
        OnMostrarObjetivo += uiSilencioMental.MostrarObjetivo;
        OnOcultarObjetivo += uiSilencioMental.OcultarObjetivo;

        OnMostrarEstimulo += uiSilencioMental.MostrarIconoAleatorio;
        OnOcultarEstimulo += uiSilencioMental.OcultarEstimulo;

        juegoActivo = false;
        esperandoRespuesta = false;

        aciertos = errores = omisiones = 0;
        tiemposReaccion.Clear();
        rachaActual = mejorRacha = 0;

        SeleccionarObjetivoAleatorio();
        StartCoroutine(MostrarObjetivoInicial());
    }

    private void SeleccionarObjetivoAleatorio()
    {
        spriteObjetivo = todosLosSprites[Random.Range(0, todosLosSprites.Count)];
        Debug.Log($"🎯 OBJETIVO: {spriteObjetivo.nombre}");
    }

    // --------- LÓGICA DE SELECCIÓN (igual que antes) ---------

    private float CalcularSimilitud(SpriteData a, SpriteData b)
    {
        float similitud = 0;
        if (a.forma == b.forma) similitud += 0.5f;
        if (a.colorNombre == b.colorNombre) similitud += 0.3f;
        if (a.tamanio == b.tamanio) similitud += 0.2f;
        return similitud;
    }

    private SpriteData SeleccionarSiguienteSprite()
    {
        if (todosLosSprites == null || todosLosSprites.Count == 0)
        {
            Debug.LogError("❌ No hay sprites en el banco");
            return null;
        }

        if (spriteObjetivo == null)
        {
            Debug.LogError("❌ spriteObjetivo es null");
            return todosLosSprites[0];
        }

        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        float probObjetivo = curvaProbabilidadObjetivo.Evaluate(nivel);

        // ¿Objetivo o distractor?
        if (Random.value < probObjetivo)
            return spriteObjetivo;

        var distractores = todosLosSprites.Where(s => s != spriteObjetivo).ToList();
        if (distractores.Count == 0)
        {
            Debug.LogWarning("⚠️ No hay distractores, usando objetivo");
            return spriteObjetivo;
        }

        // Ponderar por similitud
        List<float> pesos = new List<float>();
        foreach (var d in distractores)
        {
            float similitud = CalcularSimilitud(spriteObjetivo, d);
            float peso = Mathf.Pow(similitud, 2f);
            pesos.Add(peso);
        }

        float totalPeso = pesos.Sum();
        if (totalPeso == 0)
            return distractores[Random.Range(0, distractores.Count)];

        float random = Random.value * totalPeso;
        float acumulado = 0;

        for (int i = 0; i < distractores.Count; i++)
        {
            acumulado += pesos[i];
            if (random <= acumulado)
                return distractores[i];
        }

        return distractores[Random.Range(0, distractores.Count)];
    }

    // ---------------------------------------------------------

    private IEnumerator MostrarObjetivoInicial()
    {
        mostrandoObjetivoInicial = true;
        juegoActivo = false;

        // Objetivo: seguimos usando un sprite placeholder (puedes mejorarlo luego)
        Texture2D tex = new Texture2D(128, 128);
        Sprite sprite = Sprite.Create(tex, new Rect(0, 0, 128, 128), new Vector2(0.5f, 0.5f));

        OnMostrarObjetivo?.Invoke(sprite, spriteObjetivo.nombre);

        yield return new WaitForSeconds(tiempoMostrandoObjetivo);

        OnOcultarObjetivo?.Invoke();
        mostrandoObjetivoInicial = false;

        juegoActivo = true;
        tiempoInicioPartida = Time.time;
        tiempoProximoEstimulo = Time.time + ObtenerTiempoEntreSprites();

        ActualizarUI();
    }

    private float ObtenerTiempoEntreSprites()
    {
        int nivel = DifficultyManager.Instance?.nivelActual ?? 1;
        return curvaTiempoEntreSprites.Evaluate(nivel);
    }

    private void Update()
    {
        if (!juegoActivo || mostrandoObjetivoInicial) return;

        if (Input.GetKeyDown(KeyCode.Space))
            Responder();

        float tiempoTranscurrido = Time.time - tiempoInicioPartida;
        OnTiempoRestante?.Invoke(duracionPartida - tiempoTranscurrido);

        if (tiempoTranscurrido >= duracionPartida)
        {
            TerminarJuego();
            return;
        }

        if (!esperandoRespuesta && Time.time >= tiempoProximoEstimulo)
        {
            GenerarEstimuloTMP();
            esperandoRespuesta = true;
            tiempoProximoEstimulo = Time.time + ObtenerTiempoEntreSprites();
            StartCoroutine(AutoOmision());
        }
    }

    private void GenerarEstimuloTMP()
    {
        if (spriteObjetivo == null)
        {
            Debug.LogError("❌ spriteObjetivo es null");
            return;
        }

        spriteActual = SeleccionarSiguienteSprite();
        if (spriteActual == null)
        {
            Debug.LogError("❌ spriteActual es null");
            return;
        }

        spriteActual.tiempoAparicion = Time.time;

        // Icono aleatorio
        string icono = iconosTMP[Random.Range(0, iconosTMP.Length)];

        // Color del estímulo = color del “sprite lógico”
        Color color = spriteActual.color;

        // Tamaño según tamaño lógico
        int fontSize = spriteActual.tamanio switch
        {
            "Pequeño" => 140,
            "Mediano" => 200,
            "Grande" => 260,
            _ => 200
        };

        OnMostrarEstimulo?.Invoke(icono, color, fontSize);

        bool esObjetivo = (spriteActual == spriteObjetivo);
        Debug.Log($"💭 Estímulo: {(esObjetivo ? "OBJETIVO ✅" : "DISTRACTOR ❌")} - {spriteActual.nombre} - Icono {icono}");
    }

    private IEnumerator AutoOmision()
    {
        yield return new WaitForSeconds(1.5f);

        if (esperandoRespuesta && juegoActivo && !mostrandoObjetivoInicial)
        {
            esperandoRespuesta = false;
            OnOcultarEstimulo?.Invoke();

            if (spriteActual == spriteObjetivo)
            {
                omisiones++;
                rachaActual = 0;
                ResetearNivelPorFallo();
            }
            else
            {
                aciertos++;
                rachaActual++;
                if (rachaActual > mejorRacha) mejorRacha = rachaActual;

                if (rachaActual >= 5)
                    SubirNivel();
            }

            ActualizarUI();
        }
    }

    public void Responder()
    {
        if (!esperandoRespuesta || !juegoActivo || mostrandoObjetivoInicial) return;

        esperandoRespuesta = false;
        float tiempoRespuesta = Time.time - spriteActual.tiempoAparicion;
        tiemposReaccion.Add(tiempoRespuesta);

        OnOcultarEstimulo?.Invoke();

        if (spriteActual == spriteObjetivo)
        {
            aciertos++;
            rachaActual++;
            if (rachaActual > mejorRacha) mejorRacha = rachaActual;

            float rendimiento = Mathf.Clamp01(1f - (tiempoRespuesta / ObtenerTiempoEntreSprites()));
            DifficultyManager.Instance?.ActualizarDificultad(rendimiento, true, tiempoRespuesta);

            if (rachaActual >= 5)
                SubirNivel();
        }
        else
        {
            errores++;
            rachaActual = 0;
            ResetearNivelPorFallo();
            DifficultyManager.Instance?.ActualizarDificultad(0f, false, tiempoRespuesta);
        }

        ActualizarUI();
    }

    private void SubirNivel()
    {
        int nivelActual = DifficultyManager.Instance?.nivelActual ?? 1;
        if (nivelActual < 10)
        {
            DifficultyManager.Instance.nivelActual = nivelActual + 1;
            OnNivelActualizado?.Invoke(DifficultyManager.Instance.nivelActual);
        }
    }

    private void ResetearNivelPorFallo()
    {
        if (DifficultyManager.Instance != null && DifficultyManager.Instance.nivelActual > 1)
        {
            DifficultyManager.Instance.nivelActual = 1;
            OnNivelActualizado?.Invoke(1);
        }
    }

    private void ActualizarUI()
    {
        OnRacha?.Invoke(rachaActual, mejorRacha);
        OnEstadisticas?.Invoke(aciertos, omisiones, errores);
    }

    private void TerminarJuego()
    {
        juegoActivo = false;
        OnGameFinished();
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    public override void OnGameFinished()
    {
        juegoActivo = false;

        CognitiveMetrics m = CalcularCognicion();
        CognitiveMetrics p = AplicarPesos(m);
        WebExporter.EnviarSesion(nombre, p);
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        int total = aciertos + errores + omisiones;
        if (total == 0) return m;

        m.atencionSostenida = 1f - ((float)omisiones / total);
        m.controlInhibitorio = 1f - ((float)errores / total);

        int oportunidadesObjetivo = aciertos + omisiones;
        m.atencionSelectiva = oportunidadesObjetivo > 0 ? (float)aciertos / oportunidadesObjetivo : 0;

        m.memoriaTrabajo = Mathf.Clamp01((float)mejorRacha / 20f);

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        p.atencionSostenida = m.atencionSostenida * 0.50f;
        p.controlInhibitorio = m.controlInhibitorio * 0.30f;
        p.atencionSelectiva = m.atencionSelectiva * 0.15f;
        p.memoriaTrabajo = m.memoriaTrabajo * 0.05f;

        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        juegoActivo = !pausar;
    }
}

public class SpriteData
{
    public int id;
    public string nombre;
    public Texture2D textura;
    public Color color;
    public string colorNombre;
    public string forma;
    public string tamanio;
    public float tiempoAparicion;
}
