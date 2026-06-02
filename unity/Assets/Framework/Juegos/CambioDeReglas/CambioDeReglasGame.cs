using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Random = UnityEngine.Random;

public class CambioDeReglasGame : BaseGame
{
    private enum PowerUpTipo
    {
        Escudo,
        Estrella,
        Reloj
    }

    [Header("UI")]
    public UICambioDeReglas uiCambioDeReglas;

    [Header("Base de Datos")]
    public FoodDatabase foodDatabase;

    [Header("Configuración")]
    public float duracionReglaInicial = 12f;
    public float duracionReglaFinal = 6f;
    public float duracionRondaInicial = 8f;
    public float duracionRondaFinal = 4f;
    public Vector2 tamanioInicial = new Vector2(140f, 140f);
    public Vector2 tamanioFinal = new Vector2(100f, 100f);
    public float escalaVisualPequeno = 0.45f;
    public float escalaVisualMediano = 1f;
    public float escalaVisualGrande = 1.65f;

    [Header("Claridad visual de colores")]
    public bool reforzarColoresEnReglasDeColor = true;
    [Range(0f, 1f)]
    public float intensidadTinteColor = 0.35f;
    public Color colorVisualAmarillo = new Color(1f, 0.92f, 0.05f, 1f);
    public Color colorVisualNaranja = new Color(1f, 0.40f, 0.02f, 1f);
    public Color colorVisualMarron = new Color(0.42f, 0.20f, 0.07f, 1f);

    [Header("Rendimiento")]
    public int rondasCompletadasParaSubirNivel = 5;
    public int rondasConFalloParaBajarNivel = 3;

    [Header("Power Ups")]
    public bool powerUpsActivos = true;
    public Sprite spritePowerUpEscudo;
    public Sprite spritePowerUpEstrella;
    public Sprite spritePowerUpReloj;
    public float intervaloPowerUpMin = 10f;
    public float intervaloPowerUpMax = 16f;
    public float bonusTiempoReloj = 5f;
    public int bonusAciertosEstrella = 2;
    public float duracionPowerUpVisible = 7f;
    public float tamanioPowerUp = 95f;
    public int maxPowerUpsEnPantalla = 1;

    [Header("Debug")]
    public bool permitirCambioManualConN = true;

    private class AlimentoUI
    {
        public GameObject gameObject;
        public RectTransform rect;
        public Image imagen;
        public Button boton;
        public FoodItem comida;
        public bool resuelto;
    }

    private class PowerUpUI
    {
        public GameObject gameObject;
        public RectTransform rect;
        public Image imagen;
        public Button boton;
        public PowerUpTipo tipo;
        public bool consumido;
    }

    private readonly List<AlimentoUI> alimentosActivos = new List<AlimentoUI>();
    private readonly List<PowerUpUI> powerUpsEnPantalla = new List<PowerUpUI>();

    private RectTransform zonaJuego;

    private FoodTags tagActual;
    private bool esModoAtrapar;
    private string textoReglaActual = "";

    private bool juegoActivo;
    private bool juegoTerminado;
    private bool generandoRonda;

    private float temporizadorRegla;
    private float temporizadorRonda;
    private float temporizadorPowerUp;
    private float ultimoSegundoUI = -1f;

    private int nivelActual = 1;
    private int aciertos;
    private int aciertosReales;
    private int fallos;
    private int racha;
    private int mejorRacha;
    private int cambiosRegla;
    private int rondasCompletadasNivel;
    private int rondasConFalloNivel;
    private bool rondaTuvoFallo;
    private bool escudoActivo;

    public int NivelActual => nivelActual;
    public int Aciertos => aciertos;
    public int Fallos => fallos;
    public int RachaActual => racha;
    public int CambiosRegla => cambiosRegla;
    public float TiempoPartidaRestante => GameManager.Instance != null ? GameManager.Instance.tiempoRestante : 0f;
    public string TextoRegla => textoReglaActual;

    public event Action OnEstadoActualizado;
    public event Action<string> OnReglaActualizada;
    public event Action<string> OnCambioRegla;

    private void Awake()
    {
        nombre = "cambio de reglas";
        CachearUI();
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    public override void ResetGame()
    {
        juegoActivo = true;
        juegoTerminado = false;
        juegoPausado = false;
        generandoRonda = false;

        nivelActual = 1;
        aciertos = 0;
        aciertosReales = 0;
        fallos = 0;
        racha = 0;
        mejorRacha = 0;
        cambiosRegla = 0;
        rondasCompletadasNivel = 0;
        rondasConFalloNivel = 0;
        rondaTuvoFallo = false;
        escudoActivo = false;
        LimpiarPowerUps();
        ProgramarSiguientePowerUp();
        ultimoSegundoUI = -1f;

        PrepararUI();
        GenerarRondaConNuevaRegla("inicio");
        EmitirEstado();
    }

    private void Update()
    {
        if (!juegoActivo || juegoTerminado || juegoPausado) return;

        ActualizarPowerUps();

        temporizadorRonda -= Time.deltaTime;

        if (nivelActual >= 4)
            temporizadorRegla -= Time.deltaTime;

        if (nivelActual >= 4 && temporizadorRegla <= 0f)
        {
            RegistrarResultadoRonda(false);
            GenerarRondaConNuevaRegla("temporizador");
            return;
        }

        if (temporizadorRonda <= 0f)
        {
            FinalizarRondaPorTiempo();
            return;
        }

        if (permitirCambioManualConN && Input.GetKeyDown(KeyCode.N))
        {
            GenerarRondaConNuevaRegla("debug N");
            return;
        }

        int segundoActual = Mathf.CeilToInt(TiempoPartidaRestante);
        if (segundoActual != Mathf.CeilToInt(ultimoSegundoUI))
        {
            ultimoSegundoUI = segundoActual;
            EmitirEstado();
        }
    }

    private void GenerarRondaConNuevaRegla(string motivo)
    {
        if (generandoRonda || !juegoActivo || juegoTerminado) return;

        generandoRonda = true;

        rondaTuvoFallo = false;
        CambiarRegla(motivo);
        LimpiarAlimentos();
        ConfigurarTemporizadores();
        CrearAlimentosDeRonda();

        generandoRonda = false;
        EmitirEstado();
    }

    private void CambiarRegla(string motivo)
    {
        List<FoodTags> tagsDisponibles = ObtenerTagsPorNivel();

        if (tagsDisponibles.Count == 0)
        {
            Debug.LogError("CambioDeReglasGame: no hay tags disponibles.");
            return;
        }

        FoodTags nuevoTag = tagsDisponibles[Random.Range(0, tagsDisponibles.Count)];
        bool nuevoModoAtrapar = !PuedeUsarModoEvitar() || Random.value > ProbabilidadEvitar();

        tagActual = nuevoTag;
        esModoAtrapar = nuevoModoAtrapar;

        textoReglaActual = esModoAtrapar
            ? $"TOCA {ObtenerNombreTag(tagActual)}"
            : $"EVITA {ObtenerNombreTag(tagActual)}";

        cambiosRegla++;

        Debug.Log($"[REGLA] Nivel {nivelActual} | {textoReglaActual} | motivo: {motivo}");

        AudioManager.Instance?.NivelUp();
        OnReglaActualizada?.Invoke(textoReglaActual);
        OnCambioRegla?.Invoke("NORMA ACTUALIZADA");
    }

    private void ConfigurarTemporizadores()
    {
        float t = (nivelActual - 1f) / 9f;

        temporizadorRegla = Mathf.Lerp(duracionReglaInicial, duracionReglaFinal, t);
        temporizadorRonda = Mathf.Lerp(duracionRondaInicial, duracionRondaFinal, t);
    }

    private void CrearAlimentosDeRonda()
    {
        if (foodDatabase == null || foodDatabase.allFoods == null || foodDatabase.allFoods.Count == 0)
        {
            Debug.LogError("CambioDeReglasGame: FoodDatabase no asignada o vacía.");
            return;
        }

        int cantidad = ObtenerCantidadAlimentos();
        int objetivos = Mathf.Clamp(cantidad / 2 + Random.Range(-1, 2), 1, cantidad - 1);

        List<Vector2> posicionesUsadas = new List<Vector2>();

        for (int i = 0; i < cantidad; i++)
        {
            FoodItem comida = i < objetivos ? ObtenerComidaQueCumple() : ObtenerComidaQueNoCumple();

            if (comida == null)
                continue;

            Vector2 posicion = ObtenerPosicionLibre(posicionesUsadas);
            posicionesUsadas.Add(posicion);

            CrearAlimento(comida, posicion);
        }

        Debug.Log($"[RONDA] Nivel {nivelActual} | {objetivos} objetivos | {cantidad - objetivos} distractores");
    }

    private int ObtenerCantidadAlimentos()
    {
        if (nivelActual <= 2) return 4;
        if (nivelActual <= 4) return 5;
        if (nivelActual <= 6) return 6;
        if (nivelActual <= 8) return 8;
        return 10;
    }

    private bool PuedeUsarModoEvitar()
    {
        return nivelActual >= 4;
    }

    private float ProbabilidadEvitar()
    {
        if (nivelActual < 4) return 0f;
        if (nivelActual < 7) return 0.25f;
        return 0.45f;
    }

    private List<FoodTags> ObtenerTagsPorNivel()
    {
        List<FoodTags> tags = new List<FoodTags>();

        if (nivelActual >= 1)
        {
            tags.Add(FoodTags.Rojo);
            tags.Add(FoodTags.Verde);
            tags.Add(FoodTags.Amarillo);
            tags.Add(FoodTags.Redondo);
            tags.Add(FoodTags.Alargado);
        }

        if (nivelActual >= 3)
        {
            tags.Add(FoodTags.Fruta);
            tags.Add(FoodTags.Verdura);
            tags.Add(FoodTags.Carne);
            tags.Add(FoodTags.Lacteo);
        }

        if (nivelActual >= 5)
        {
            tags.Add(FoodTags.Bebida);
            tags.Add(FoodTags.Crudo);
            tags.Add(FoodTags.Cocinado);
        }

        if (nivelActual >= 7)
        {
            tags.Add(FoodTags.Dulce);
            tags.Add(FoodTags.Salado);
        }

        if (nivelActual >= 9)
        {
            tags.Add(FoodTags.Frio);
            tags.Add(FoodTags.Caliente);
            tags.Add(FoodTags.Pequeno);
            tags.Add(FoodTags.Mediano);
            tags.Add(FoodTags.Grande);
        }

        tags.RemoveAll(tag => foodDatabase == null || foodDatabase.CountByTag(tag) == 0 || foodDatabase.CountWithoutTag(tag) == 0);

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
            case FoodTags.Bebida: return "BEBIDAS";
            case FoodTags.Crudo: return "CRUDOS";
            case FoodTags.Cocinado: return "COCINADOS";
            case FoodTags.Dulce: return "DULCES";
            case FoodTags.Salado: return "SALADOS";
            case FoodTags.Frio: return "FRIOS";
            case FoodTags.Caliente: return "CALIENTES";
            case FoodTags.Pequeno: return "PEQUENOS";
            case FoodTags.Mediano: return "MEDIANOS";
            case FoodTags.Grande: return "GRANDES";
            default: return tag.ToString().ToUpperInvariant();
        }
    }

    private FoodItem ObtenerComidaQueCumple()
    {
        List<FoodItem> candidatos = esModoAtrapar
            ? foodDatabase.GetFoodsWithTag(tagActual)
            : foodDatabase.GetFoodsWithoutTag(tagActual);

        return ObtenerAleatoriaValida(candidatos);
    }

    private FoodItem ObtenerComidaQueNoCumple()
    {
        List<FoodItem> candidatos = esModoAtrapar
            ? foodDatabase.GetFoodsWithoutTag(tagActual)
            : foodDatabase.GetFoodsWithTag(tagActual);

        return ObtenerAleatoriaValida(candidatos);
    }

    private FoodItem ObtenerAleatoriaValida(List<FoodItem> candidatos)
    {
        if (candidatos == null || candidatos.Count == 0)
            candidatos = foodDatabase.allFoods;

        if (candidatos == null || candidatos.Count == 0)
            return null;

        return candidatos[Random.Range(0, candidatos.Count)];
    }

    private void CrearAlimento(FoodItem comida, Vector2 posicion)
    {
        if (zonaJuego == null || comida == null) return;

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

        float t = (nivelActual - 1f) / 9f;
        float tamanio = Mathf.Lerp(tamanioInicial.x, tamanioFinal.x, t);
        float escalaVisual = EsReglaTamano() ? ObtenerEscalaVisualPorTamano(comida) : 1f;
        float tamanioVisual = tamanio * escalaVisual;

        nuevo.rect.anchorMin = new Vector2(0.5f, 0.5f);
        nuevo.rect.anchorMax = new Vector2(0.5f, 0.5f);
        nuevo.rect.pivot = new Vector2(0.5f, 0.5f);
        nuevo.rect.sizeDelta = new Vector2(tamanioVisual, tamanioVisual);
        nuevo.rect.anchoredPosition = posicion;
        nuevo.rect.localScale = Vector3.one;

        nuevo.imagen.sprite = comida.sprite;
        nuevo.imagen.preserveAspect = true;
        nuevo.imagen.raycastTarget = true;
        nuevo.imagen.color = ObtenerColorImagen(comida);
        CrearMarcadorColorSiProcede(obj.transform, comida);

        nuevo.boton.targetGraphic = nuevo.imagen;
        nuevo.boton.onClick.AddListener(() => OnAlimentoPresionado(nuevo));

        alimentosActivos.Add(nuevo);
    }

    private void OnAlimentoPresionado(AlimentoUI alimento)
    {
        if (!juegoActivo || juegoTerminado || juegoPausado) return;
        if (alimento == null || alimento.resuelto) return;
        if (alimento.gameObject == null || alimento.comida == null) return;

        alimento.resuelto = true;

        if (alimento.boton != null)
            alimento.boton.interactable = false;

        bool correcto = VerificarSiCumpleRegla(alimento.comida);
        Vector3 posicion = alimento.rect != null ? alimento.rect.position : Vector3.zero;

        Debug.Log("[FOOD] " + alimento.comida.nombre + " tags efectivos: " + alimento.comida.EffectiveTags);
        if (correcto)
        {
            aciertos++;
            aciertosReales++;
            racha++;
            mejorRacha = Mathf.Max(mejorRacha, racha);

            AudioManager.Instance?.Acierto();
            uiCambioDeReglas?.MostrarFeedbackFlotante("BIEN", posicion, true);
        }
        else
        {
            if (escudoActivo)
            {
                escudoActivo = false;
                AudioManager.Instance?.PowerUp();
                uiCambioDeReglas?.MostrarFeedbackFlotante("ESCUDO", posicion, true);
            }
            else
            {
                fallos++;
                racha = 0;
                rondaTuvoFallo = true;

                AudioManager.Instance?.Error();
                uiCambioDeReglas?.MostrarFeedbackFlotante("MAL", posicion, false);
            }
        }
        StartCoroutine(AnimarYDestruir(alimento));
        VerificarFinRonda();
        EmitirEstado();
    }

    private bool VerificarSiCumpleRegla(FoodItem comida)
    {
        if (comida == null) return false;

        bool tieneTag = comida.HasEffectiveTag(tagActual);
        return esModoAtrapar ? tieneTag : !tieneTag;
    }

    private void RegistrarResultadoRonda(bool completada)
    {
        if (completada)
        {
            rondasCompletadasNivel++;

            int necesarias = Mathf.Max(1, rondasCompletadasParaSubirNivel);
            if (rondasCompletadasNivel >= necesarias)
            {
                rondasCompletadasNivel = 0;
                CambiarNivelPorRondas(1);
            }
        }

        if (rondaTuvoFallo)
        {
            rondasConFalloNivel++;

            int necesarias = Mathf.Max(1, rondasConFalloParaBajarNivel);
            if (rondasConFalloNivel >= necesarias)
            {
                rondasConFalloNivel = 0;
                CambiarNivelPorRondas(-1);
            }
        }
    }

    private void CambiarNivelPorRondas(int delta)
    {
        int nivelAnterior = nivelActual;
        nivelActual = Mathf.Clamp(nivelActual + delta, 1, 10);

        if (nivelActual == nivelAnterior)
            return;

        ConfigurarTemporizadores();
        Debug.Log($"[NIVEL] {nivelAnterior} -> {nivelActual} por rondas");
    }

    private void VerificarFinRonda()
    {
        int objetivosRestantes = 0;
        int totalObjetivos = 0;

        foreach (AlimentoUI alimento in alimentosActivos)
        {
            if (alimento == null || alimento.gameObject == null || alimento.comida == null)
                continue;

            if (VerificarSiCumpleRegla(alimento.comida))
            {
                totalObjetivos++;

                if (!alimento.resuelto)
                    objetivosRestantes++;
            }
        }

        if (totalObjetivos > 0 && objetivosRestantes == 0)
        {
            RegistrarResultadoRonda(true);
            GenerarRondaConNuevaRegla("ronda completada");
        }
    }

    private void FinalizarRondaPorTiempo()
    {
        int noTocados = 0;
        int totalObjetivos = 0;

        foreach (AlimentoUI alimento in alimentosActivos)
        {
            if (alimento == null || alimento.gameObject == null || alimento.comida == null)
                continue;

            if (VerificarSiCumpleRegla(alimento.comida))
            {
                totalObjetivos++;

                if (!alimento.resuelto)
                    noTocados++;
            }
        }

        Debug.Log($"[TIEMPO] {noTocados}/{totalObjetivos} objetivos sin tocar. Cuentan como ronda con fallo.");

        if (noTocados > 0)
        {
            rondaTuvoFallo = true;
            uiCambioDeReglas?.MostrarFeedbackFlotante("TIEMPO", Vector3.zero, false);
        }

        RegistrarResultadoRonda(false);
        GenerarRondaConNuevaRegla("tiempo ronda");
    }

    private IEnumerator AnimarYDestruir(AlimentoUI alimento)
    {
        if (alimento == null || alimento.gameObject == null) yield break;

        GameObject obj = alimento.gameObject;
        RectTransform rect = alimento.rect;
        Image img = alimento.imagen;

        if (rect == null || img == null)
        {
            alimentosActivos.Remove(alimento);
            if (obj != null) Destroy(obj);
            yield break;
        }

        float duracion = 0.15f;
        float tiempo = 0f;

        Vector3 escalaOriginal = rect.localScale;
        Color colorOriginal = img.color;

        while (tiempo < duracion)
        {
            if (obj == null || rect == null || img == null)
                yield break;

            tiempo += Time.deltaTime;
            float t = Mathf.Clamp01(tiempo / duracion);

            rect.localScale = Vector3.Lerp(escalaOriginal, Vector3.zero, t);

            Color c = colorOriginal;
            c.a = Mathf.Lerp(colorOriginal.a, 0f, t);
            img.color = c;

            yield return null;
        }

        alimentosActivos.Remove(alimento);

        if (obj != null)
            Destroy(obj);
    }

    private void LimpiarAlimentos()
    {
        foreach (AlimentoUI alimento in alimentosActivos)
        {
            if (alimento != null && alimento.gameObject != null)
                Destroy(alimento.gameObject);
        }

        alimentosActivos.Clear();
    }

    private void LimpiarPowerUps()
    {
        foreach (PowerUpUI powerUp in powerUpsEnPantalla)
        {
            if (powerUp != null && powerUp.gameObject != null)
                Destroy(powerUp.gameObject);
        }

        powerUpsEnPantalla.Clear();
    }

    private Vector2 ObtenerPosicionLibre(List<Vector2> usadas)
    {
        if (zonaJuego == null) return Vector2.zero;

        float ancho = zonaJuego.rect.width > 0f ? zonaJuego.rect.width : 800f;
        float alto = zonaJuego.rect.height > 0f ? zonaJuego.rect.height : 600f;

        float t = (nivelActual - 1f) / 9f;
        float tamanio = Mathf.Lerp(tamanioInicial.x, tamanioFinal.x, t);
        float escalaMaxima = EsReglaTamano() ? Mathf.Max(1f, escalaVisualGrande) : 1f;
        float distanciaMinima = tamanio * escalaMaxima * 1.15f;

        float minX = -ancho * 0.42f;
        float maxX = ancho * 0.42f;
        float minY = -alto * 0.35f;
        float maxY = alto * 0.30f;

        for (int intento = 0; intento < 60; intento++)
        {
            Vector2 pos = new Vector2(Random.Range(minX, maxX), Random.Range(minY, maxY));

            bool libre = true;

            foreach (Vector2 usada in usadas)
            {
                if (Vector2.Distance(pos, usada) < distanciaMinima)
                {
                    libre = false;
                    break;
                }
            }

            if (libre)
                return pos;
        }

        return Vector2.zero;
    }

    private bool EsReglaTamano()
    {
        return tagActual == FoodTags.Pequeno || tagActual == FoodTags.Mediano || tagActual == FoodTags.Grande;
    }

    private bool EsReglaColor()
    {
        return EsTagColor(tagActual);
    }

    private bool EsTagColor(FoodTags tag)
    {
        return tag == FoodTags.Rojo ||
               tag == FoodTags.Verde ||
               tag == FoodTags.Amarillo ||
               tag == FoodTags.Naranja ||
               tag == FoodTags.Marron ||
               tag == FoodTags.Blanco ||
               tag == FoodTags.Azul ||
               tag == FoodTags.Rosa;
    }

    private FoodTags ObtenerColorPrincipal(FoodItem comida)
    {
        if (comida == null)
            return FoodTags.None;

        if (comida.HasEffectiveTag(FoodTags.Amarillo)) return FoodTags.Amarillo;
        if (comida.HasEffectiveTag(FoodTags.Naranja)) return FoodTags.Naranja;
        if (comida.HasEffectiveTag(FoodTags.Marron)) return FoodTags.Marron;
        if (comida.HasEffectiveTag(FoodTags.Rojo)) return FoodTags.Rojo;
        if (comida.HasEffectiveTag(FoodTags.Verde)) return FoodTags.Verde;
        if (comida.HasEffectiveTag(FoodTags.Blanco)) return FoodTags.Blanco;
        if (comida.HasEffectiveTag(FoodTags.Azul)) return FoodTags.Azul;
        if (comida.HasEffectiveTag(FoodTags.Rosa)) return FoodTags.Rosa;

        return FoodTags.None;
    }

    private Color ObtenerColorImagen(FoodItem comida)
    {
        if (!reforzarColoresEnReglasDeColor || !EsReglaColor())
            return Color.white;

        FoodTags color = ObtenerColorPrincipal(comida);
        if (!EsTagColor(color))
            return Color.white;

        return Color.Lerp(Color.white, ObtenerColorVisual(color), Mathf.Clamp01(intensidadTinteColor));
    }

    private Color ObtenerColorVisual(FoodTags color)
    {
        switch (color)
        {
            case FoodTags.Rojo: return new Color(0.92f, 0.08f, 0.06f, 1f);
            case FoodTags.Verde: return new Color(0.08f, 0.72f, 0.16f, 1f);
            case FoodTags.Amarillo: return colorVisualAmarillo;
            case FoodTags.Naranja: return colorVisualNaranja;
            case FoodTags.Marron: return colorVisualMarron;
            case FoodTags.Blanco: return new Color(0.94f, 0.94f, 0.90f, 1f);
            case FoodTags.Azul: return new Color(0.10f, 0.35f, 0.95f, 1f);
            case FoodTags.Rosa: return new Color(1f, 0.20f, 0.55f, 1f);
            default: return Color.white;
        }
    }

    private void CrearMarcadorColorSiProcede(Transform parent, FoodItem comida)
    {
        if (!reforzarColoresEnReglasDeColor || !EsReglaColor() || parent == null)
            return;

        FoodTags color = ObtenerColorPrincipal(comida);
        if (!EsTagColor(color))
            return;

        SimpleShapeGraphic marker = RuntimeMiniGameUI.CreateShape("MarcadorColor", parent, SimpleShapeKind.Circle, ObtenerColorVisual(color));
        marker.raycastTarget = false;
        RuntimeMiniGameUI.SetRect(marker.rectTransform, new Vector2(0.66f, 0.02f), new Vector2(0.98f, 0.34f), Vector2.zero, Vector2.zero);
    }

    private float ObtenerEscalaVisualPorTamano(FoodItem comida)
    {
        if (comida == null)
            return 1f;

        if (comida.HasEffectiveTag(FoodTags.Pequeno))
            return Mathf.Max(0.2f, escalaVisualPequeno);
        if (comida.HasEffectiveTag(FoodTags.Grande))
            return Mathf.Max(0.2f, escalaVisualGrande);
        if (comida.HasEffectiveTag(FoodTags.Mediano))
            return Mathf.Max(0.2f, escalaVisualMediano);

        return 1f;
    }

    private void ActualizarPowerUps()
    {
        if (!powerUpsActivos || zonaJuego == null)
            return;

        LimpiarPowerUpsNulos();

        temporizadorPowerUp -= Time.deltaTime;
        if (temporizadorPowerUp > 0f)
            return;

        if (powerUpsEnPantalla.Count < Mathf.Max(1, maxPowerUpsEnPantalla))
            CrearPowerUpAleatorio();

        ProgramarSiguientePowerUp();
    }

    private void ProgramarSiguientePowerUp()
    {
        if (!powerUpsActivos)
        {
            temporizadorPowerUp = float.PositiveInfinity;
            return;
        }

        float min = Mathf.Max(1f, intervaloPowerUpMin);
        float max = Mathf.Max(min, intervaloPowerUpMax);
        temporizadorPowerUp = Random.Range(min, max);
    }

    private void CrearPowerUpAleatorio()
    {
        PowerUpTipo tipo = (PowerUpTipo)Random.Range(0, 3);
        CrearPowerUp(tipo);
    }

    private void CrearPowerUp(PowerUpTipo tipo)
    {
        if (zonaJuego == null)
            return;

        Sprite sprite = ObtenerSpritePowerUp(tipo);
        if (sprite == null)
            return;

        GameObject obj = new GameObject("PowerUp_" + tipo, typeof(RectTransform), typeof(Image), typeof(Button));
        obj.transform.SetParent(zonaJuego, false);

        PowerUpUI powerUp = new PowerUpUI
        {
            gameObject = obj,
            rect = obj.GetComponent<RectTransform>(),
            imagen = obj.GetComponent<Image>(),
            boton = obj.GetComponent<Button>(),
            tipo = tipo,
            consumido = false
        };

        float tamanio = Mathf.Max(48f, tamanioPowerUp);
        powerUp.rect.anchorMin = new Vector2(0.5f, 0.5f);
        powerUp.rect.anchorMax = new Vector2(0.5f, 0.5f);
        powerUp.rect.pivot = new Vector2(0.5f, 0.5f);
        powerUp.rect.sizeDelta = new Vector2(tamanio, tamanio);
        powerUp.rect.anchoredPosition = ObtenerPosicionPowerUpLibre();
        powerUp.rect.localScale = Vector3.one;

        powerUp.imagen.sprite = sprite;
        powerUp.imagen.preserveAspect = true;
        powerUp.imagen.raycastTarget = true;

        powerUp.boton.targetGraphic = powerUp.imagen;
        powerUp.boton.onClick.AddListener(() => OnPowerUpPresionado(powerUp));

        powerUpsEnPantalla.Add(powerUp);
        StartCoroutine(ExpirarPowerUp(powerUp));
    }

    private Sprite ObtenerSpritePowerUp(PowerUpTipo tipo)
    {
        switch (tipo)
        {
            case PowerUpTipo.Escudo: return spritePowerUpEscudo;
            case PowerUpTipo.Estrella: return spritePowerUpEstrella;
            case PowerUpTipo.Reloj: return spritePowerUpReloj;
            default: return null;
        }
    }

    private Vector2 ObtenerPosicionPowerUpLibre()
    {
        if (zonaJuego == null)
            return Vector2.zero;

        float ancho = zonaJuego.rect.width > 0f ? zonaJuego.rect.width : 800f;
        float alto = zonaJuego.rect.height > 0f ? zonaJuego.rect.height : 600f;

        float minX = -ancho * 0.40f;
        float maxX = ancho * 0.40f;
        float minY = -alto * 0.32f;
        float maxY = alto * 0.30f;
        float distanciaMinima = Mathf.Max(120f, tamanioPowerUp * 1.35f);

        for (int intento = 0; intento < 50; intento++)
        {
            Vector2 pos = new Vector2(Random.Range(minX, maxX), Random.Range(minY, maxY));
            if (PosicionLibreParaPowerUp(pos, distanciaMinima))
                return pos;
        }

        return Vector2.zero;
    }

    private bool PosicionLibreParaPowerUp(Vector2 posicion, float distanciaMinima)
    {
        foreach (AlimentoUI alimento in alimentosActivos)
        {
            if (alimento == null || alimento.rect == null || alimento.gameObject == null)
                continue;

            if (Vector2.Distance(posicion, alimento.rect.anchoredPosition) < distanciaMinima)
                return false;
        }

        foreach (PowerUpUI powerUp in powerUpsEnPantalla)
        {
            if (powerUp == null || powerUp.rect == null || powerUp.gameObject == null)
                continue;

            if (Vector2.Distance(posicion, powerUp.rect.anchoredPosition) < distanciaMinima)
                return false;
        }

        return true;
    }

    private void OnPowerUpPresionado(PowerUpUI powerUp)
    {
        if (!juegoActivo || juegoTerminado || juegoPausado) return;
        if (powerUp == null || powerUp.consumido) return;
        if (powerUp.gameObject == null) return;

        powerUp.consumido = true;

        if (powerUp.boton != null)
            powerUp.boton.interactable = false;

        AplicarPowerUp(powerUp.tipo);
        StartCoroutine(AnimarYDestruirPowerUp(powerUp));
    }

    private void AplicarPowerUp(PowerUpTipo tipo)
    {
        switch (tipo)
        {
            case PowerUpTipo.Escudo:
                ActivarEscudo();
                break;
            case PowerUpTipo.Estrella:
                ActivarEstrella();
                break;
            case PowerUpTipo.Reloj:
                ActivarReloj();
                break;
        }
    }

    private IEnumerator ExpirarPowerUp(PowerUpUI powerUp)
    {
        float duracion = Mathf.Max(1f, duracionPowerUpVisible);
        float tiempo = 0f;

        while (tiempo < duracion)
        {
            if (powerUp == null || powerUp.consumido || powerUp.gameObject == null)
                yield break;

            tiempo += Time.deltaTime;
            yield return null;
        }

        if (powerUp != null && !powerUp.consumido)
        {
            powerUp.consumido = true;

            if (powerUp.boton != null)
                powerUp.boton.interactable = false;

            StartCoroutine(AnimarYDestruirPowerUp(powerUp));
        }
    }

    private IEnumerator AnimarYDestruirPowerUp(PowerUpUI powerUp)
    {
        if (powerUp == null || powerUp.gameObject == null)
            yield break;

        GameObject obj = powerUp.gameObject;
        RectTransform rect = powerUp.rect;
        Image img = powerUp.imagen;

        if (rect == null || img == null)
        {
            powerUpsEnPantalla.Remove(powerUp);
            if (obj != null) Destroy(obj);
            yield break;
        }

        float duracion = 0.15f;
        float tiempo = 0f;
        Vector3 escalaOriginal = rect.localScale;
        Color colorOriginal = img.color;

        while (tiempo < duracion)
        {
            if (obj == null || rect == null || img == null)
                yield break;

            tiempo += Time.deltaTime;
            float t = Mathf.Clamp01(tiempo / duracion);

            rect.localScale = Vector3.Lerp(escalaOriginal, Vector3.zero, t);
            Color c = colorOriginal;
            c.a = Mathf.Lerp(colorOriginal.a, 0f, t);
            img.color = c;

            yield return null;
        }

        powerUpsEnPantalla.Remove(powerUp);

        if (obj != null)
            Destroy(obj);
    }

    private void LimpiarPowerUpsNulos()
    {
        for (int i = powerUpsEnPantalla.Count - 1; i >= 0; i--)
        {
            if (powerUpsEnPantalla[i] == null || powerUpsEnPantalla[i].gameObject == null)
                powerUpsEnPantalla.RemoveAt(i);
        }
    }

    private void ActivarEscudo()
    {
        escudoActivo = true;
        AudioManager.Instance?.PowerUp();
        uiCambioDeReglas?.MostrarFeedbackFlotante("ESCUDO", Vector3.zero, true);
    }

    private void ActivarEstrella()
    {
        int bonus = Mathf.Max(1, bonusAciertosEstrella);
        aciertos += bonus;
        racha += bonus;
        mejorRacha = Mathf.Max(mejorRacha, racha);

        AudioManager.Instance?.PowerUp();
        uiCambioDeReglas?.MostrarFeedbackFlotante("BIEN +" + bonus, Vector3.zero, true);
        EmitirEstado();
    }

    private void ActivarReloj()
    {
        float bonus = Mathf.Max(1f, bonusTiempoReloj);

        if (GameManager.Instance != null)
            GameManager.Instance.tiempoRestante += bonus;

        AudioManager.Instance?.PowerUp();
        uiCambioDeReglas?.MostrarFeedbackFlotante("TIEMPO +" + Mathf.CeilToInt(bonus) + "s", Vector3.zero, true);
        EmitirEstado();
    }

    private void CachearUI()
    {
        if (uiCambioDeReglas == null)
            uiCambioDeReglas = GetComponent<UICambioDeReglas>();

        if (uiCambioDeReglas == null)
            uiCambioDeReglas = FindFirstObjectByType<UICambioDeReglas>();

        if (uiCambioDeReglas == null)
            Debug.LogError("CambioDeReglasGame: falta asignar UICambioDeReglas en la escena.");
    }


    private void PrepararUI()
    {
        CachearUI();

        if (uiCambioDeReglas == null)
            return;

        uiCambioDeReglas.Preparar(this);
        zonaJuego = uiCambioDeReglas.ZonaJuego;

        if (zonaJuego == null)
            Debug.LogError("CambioDeReglasGame: falta asignar ZonaJuego en UICambioDeReglas.");
    }


    private void EmitirEstado()
    {
        OnEstadoActualizado?.Invoke();
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
    }

    public override void OnGameFinished()
    {
        if (juegoTerminado) return;

        juegoTerminado = true;
        juegoActivo = false;

        LimpiarAlimentos();
        LimpiarPowerUps();

        CognitiveMetrics metrics = AplicarPesos(CalcularCognicion());
        WebExporter.EnviarSesion(nombre, metrics);
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        int total = aciertosReales + fallos;
        if (total <= 0) return m;

        float precision = (float)aciertosReales / total;
        float precisionExigente = Mathf.InverseLerp(0.50f, 0.95f, precision);
        float volumen = Mathf.Clamp01(total / 45f);
        float nivelFactor = Mathf.Clamp01((nivelActual - 1f) / 9f);
        float flexibilidad = Mathf.Clamp01(cambiosRegla / 30f);
        float rachaNormalizada = Mathf.Clamp01(Mathf.Min(mejorRacha, aciertosReales) / 18f);

        m.flexibilidadCognitiva = Mathf.Clamp01((precisionExigente * 0.45f + flexibilidad * 0.35f + nivelFactor * 0.20f) * volumen);
        m.controlInhibitorio = Mathf.Clamp01((precisionExigente * 0.80f + nivelFactor * 0.20f) * volumen);
        m.atencionSostenida = Mathf.Clamp01((aciertosReales / 60f) * precisionExigente);
        m.planificacion = Mathf.Clamp01((precisionExigente * 0.40f + rachaNormalizada * 0.40f + nivelFactor * 0.20f) * volumen);
        m.memoriaEspacial = Mathf.Clamp01((precisionExigente * 0.70f + nivelFactor * 0.30f) * volumen);

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics w = new CognitiveMetrics();

        w.flexibilidadCognitiva = metrics.flexibilidadCognitiva * 0.40f;
        w.controlInhibitorio = metrics.controlInhibitorio * 0.30f;
        w.atencionSostenida = metrics.atencionSostenida * 0.20f;
        w.planificacion = metrics.planificacion * 0.10f;

        return w;
    }
}
