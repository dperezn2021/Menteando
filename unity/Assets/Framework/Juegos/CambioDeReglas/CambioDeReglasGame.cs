// Archivo: CambioDeReglasGame.cs
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using Random = UnityEngine.Random;

public class CambioDeReglasGame : BaseGame
{
    private enum RuleKind
    {
        MatchTag,
        AvoidTag
    }

    private enum PowerUpType
    {
        None,
        Reloj,      // +5 segundos a la ronda
        Estrella,   // Siguiente acierto vale ×3
        Escudo,     // Siguiente error no penaliza
        Congelar    // Detiene el tiempo de ronda 2 segundos
    }

    private struct RuleData
    {
        public RuleKind kind;
        public FoodTags targetTag;
        public string description;
    }

    private class Stimulus
    {
        public RectTransform rect;
        public Image image;
        public Image glowImage;
        public Button button;
        public FoodItem food;
        public PowerUpType powerUp;
        public float age;
        public bool resolved;
    }

    [Header("UI")]
    public UICambioDeReglas uiCambioDeReglas;

    [Header("Temática")]
    public FoodDatabase foodDatabase;
    public Sprite powerUpReloj;
    public Sprite powerUpEstrella;
    public Sprite powerUpEscudo;
    public Sprite powerUpCongelar;
    public Color powerUpGlowColor = new Color(1f, 0.84f, 0f, 0.6f);

    [Header("Dificultad - Progresion mas lenta")]
    public int nivelInicial = 1;
    public int estimulosNivel1 = 3;      // Menos estímulos al inicio
    public int estimulosNivel10 = 8;      // Máximo 8 en nivel 10
    public float tiempoRondaNivel1 = 8f;  // Más tiempo (8 segundos)
    public float tiempoRondaNivel10 = 4f;  // Mínimo 4 segundos
    public float tiempoReglaNivel1 = 15f;  // Regla más larga (15 segundos)
    public float tiempoReglaNivel10 = 8f;  // Regla mínima 8 segundos
                                           
    public Vector2 tamanoEstimuloNivel1 = new Vector2(158f, 158f);
    public Vector2 tamanoEstimuloNivel10 = new Vector2(108f, 108f);
    public int rondasPorPowerUp = 3;

    public GameDifficulty currentDifficulty = GameDifficulty.Medium; // Seleccionable en inspector

    [Header("Animación de corte")]
    public GameObject sliceEffectPrefab; // Opcional: prefab con partículas
    public float sliceAnimationDuration = 0.2f;
    // Añade esta variable al principio de la clase CambioDeReglasGame
    private List<GameObject> feedbacksActivos = new List<GameObject>();
    private int maxFeedbacksSimultaneos = 3;


    [Header("Modo Aleatorio")]
    public bool modoAleatorioActivo = true; // Si true, elige dificultad aleatoria cada partida
    public TextMeshProUGUI textoIndicadorDificultad; // Referencia al texto que mostrará la dificultad
    public float duracionIndicadorDificultad = 3f; // Cuánto tiempo se muestra
    private float tiempoParaProximoCambioDificultad = 15f; // Cambiar cada 15 segundos
    private float temporizadorCambioDificultad;


    private readonly List<Stimulus> stimuli = new List<Stimulus>();
    private RectTransform zonaJuego;
    private RuleData currentRule;
    private RuleData previousRule;
    private bool hasPreviousRule;
    private bool gameActive, gameFinished;
    private float ruleTimer, ruleDuration;
    private float roundTimer, roundDuration;
    private float lastRuleChangeTime;
    private int maxLevelReached = 1;
    private int rondasDesdePowerUp = 0;
    private PowerUpType activePowerUp = PowerUpType.None;
    private int comboMultiplier = 1;
    private float freezeTimer = 0f;

    private int totalDecisions, correctDecisions, wrongTouches, omissions;
    private int inhibitionOpportunities, inhibitionCorrect;
    private int postChangeDecisions, postChangeCorrect;
    private int perseverationErrors, ruleChanges;
    private int currentStreak, bestStreak;
    private float reactionSum;
    private float weightedPerformance, weightedPerformanceWeight;

    public System.Action OnEstadoActualizado;
    public System.Action<string> OnReglaActualizada;
    public System.Action<string, bool> OnFeedback;
    public System.Action<string> OnCambioRegla;

    public int NivelActual => Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? nivelInicial, 1, 10);
    public int Aciertos => correctDecisions;
    public int Fallos => wrongTouches + omissions;
    public int RachaActual => currentStreak;
    public int CambiosRegla => ruleChanges;
    public float TiempoReglaRestante => ruleTimer;
    public float TiempoReglaTotal => ruleDuration;
    public float TiempoRondaRestante => roundTimer;
    public float TiempoRondaTotal => roundDuration;
    public float TiempoPartidaRestante => GameManager.Instance != null ? GameManager.Instance.tiempoRestante : 0f;
    public string TextoRegla => currentRule.description;

    private void Awake()
    {
        nombre = "Cambio de Reglas";
        CachearUI();
    }

    private void Start()
    {
        RuntimeMiniGameUI.PrepareStaticScreens("Cambio de Reglas", "Adapta tu seleccion a la norma activa");
        CachearUI();
    }

    public override void ResetGame()
    {
        gameActive = true;
        gameFinished = false;
        juegoPausado = false;
        hasPreviousRule = false;

        // 🎲 ELEGIR DIFICULTAD ALEATORIA si modoAleatorioActivo está true
        if (modoAleatorioActivo)
        {
            Array difficulties = Enum.GetValues(typeof(GameDifficulty));
            currentDifficulty = (GameDifficulty)difficulties.GetValue(Random.Range(0, difficulties.Length));
            Debug.Log($"🎲 Dificultad aleatoria seleccionada: {currentDifficulty}");
        }

        // Mostrar al jugador qué dificultad tocó
        MostrarDificultadElegida();

        maxLevelReached = Mathf.Clamp(nivelInicial, 1, 10);
        rondasDesdePowerUp = 0;
        activePowerUp = PowerUpType.None;
        comboMultiplier = 1;
        freezeTimer = 0f;

        totalDecisions = correctDecisions = wrongTouches = omissions = 0;
        inhibitionOpportunities = inhibitionCorrect = 0;
        postChangeDecisions = postChangeCorrect = 0;
        perseverationErrors = ruleChanges = 0;
        currentStreak = bestStreak = 0;
        reactionSum = 0f;
        weightedPerformance = 0f;
        weightedPerformanceWeight = 0f;

        DifficultyManager.Instance?.ResetDifficulty(Mathf.Clamp(nivelInicial, 1, 10));
        PrepararUI();
        ChangeRule(true);
        GenerateRound();
        EmitirEstado();
    }

    public override void OnGameStart() => ResetGame();

    private void Update()
    {
        if (!gameActive || gameFinished || juegoPausado) return;

        float delta = Time.deltaTime;
        ruleTimer -= delta;

        if (freezeTimer > 0f)
            freezeTimer -= delta;
        else
            roundTimer -= delta;

        // 🔥 CAMBIO ALEATORIO DE DIFICULTAD CADA CIERTO TIEMPO
        temporizadorCambioDificultad += delta;
        if (temporizadorCambioDificultad >= tiempoParaProximoCambioDificultad && !gameFinished)
        {
            temporizadorCambioDificultad = 0f;
            // Entre 10 y 20 segundos para el próximo cambio
            tiempoParaProximoCambioDificultad = Random.Range(10f, 20f);
            CambiarDificultadAleatoria();
        }

        for (int i = 0; i < stimuli.Count; i++)
            if (stimuli[i] != null && !stimuli[i].resolved)
                stimuli[i].age += delta;

        if (ruleTimer <= 0f) ChangeRule(false);
        if (roundTimer <= 0f && freezeTimer <= 0f) ResolveRoundTimeout();

        EmitirEstado();
    }

    private void CambiarDificultadAleatoria()
    {
        GameDifficulty nuevaDificultad;
        do
        {
            Array difficulties = Enum.GetValues(typeof(GameDifficulty));
            nuevaDificultad = (GameDifficulty)difficulties.GetValue(Random.Range(0, difficulties.Length));
        } while (nuevaDificultad == currentDifficulty); // Evitar repetir la misma

        GameDifficulty anterior = currentDifficulty;
        currentDifficulty = nuevaDificultad;

        // Limpiar y regenerar con nueva dificultad
        ClearStimuli();
        ChangeRule(true);
        GenerateRound();

        // Mostrar notificación
        OnCambioRegla?.Invoke($"¡MODO {GetDifficultyName(nuevaDificultad).ToUpper()}!");
        OnFeedback?.Invoke($"Dificultad cambiada a {GetDifficultyName(nuevaDificultad)}", true);

        // Mostrar en el indicador flotante
        if (textoIndicadorDificultad != null)
        {
            textoIndicadorDificultad.text = $"¡MODO {GetDifficultyName(nuevaDificultad).ToUpper()}!";
            textoIndicadorDificultad.color = Color.cyan;
            textoIndicadorDificultad.gameObject.SetActive(true);
            StartCoroutine(DesvanecerIndicador(textoIndicadorDificultad.gameObject));
        }

        Debug.Log($"🎲 Dificultad cambiada: {anterior} → {nuevaDificultad}");
    }

    // ============================================================
    // REGLAS
    // ============================================================

    private void ChangeRule(bool firstRule)
    {
        int level = NivelActual;
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        if (!firstRule)
        {
            previousRule = currentRule;
            hasPreviousRule = true;
        }

        RuleData nextRule = CreateRuleForLevel(level);
        int guard = 0;
        while (!firstRule && nextRule.description == currentRule.description && guard < 20)
        {
            nextRule = CreateRuleForLevel(level);
            guard++;
        }

        currentRule = nextRule;
        // Duración de regla: 12s nivel1, 6s nivel10
        ruleDuration = Mathf.Lerp(12f, 6f, LevelT(level));
        ruleTimer = ruleDuration;
        lastRuleChangeTime = Time.time;
        if (!firstRule)
        {
            ruleChanges++;
            AudioManager.Instance?.NivelUp();
            OnCambioRegla?.Invoke("¡NUEVA NORMA!");
            OnFeedback?.Invoke("La regla ha cambiado", true);

            // 🔥 NUEVO: Animar el cambio de regla
            StartCoroutine(AnunciarCambioRegla(TextoRegla));
        }

        OnReglaActualizada?.Invoke(TextoRegla);
        EmitirEstado();
    }

    private RuleData CreateRuleForLevel(int level)
    {
        List<FoodTags> availableTags = GetAvailableTagsForLevel(level);

        // Elegir entre "TOCA" o "EVITA"
        RuleKind kind = level >= 5 && Random.value > 0.5f ? RuleKind.AvoidTag : RuleKind.MatchTag;

        for (int attempt = 0; attempt < 30; attempt++)
        {
            FoodTags tag = availableTags[Random.Range(0, availableTags.Count)];
            int count = kind == RuleKind.MatchTag ? foodDatabase.CountByTag(tag) : foodDatabase.CountWithoutTag(tag);

            if (count >= 3)
            {
                string prefix = kind == RuleKind.MatchTag ? "TOCA" : "EVITA";
                return new RuleData
                {
                    kind = kind,
                    targetTag = tag,
                    description = $"{prefix} {TagName(tag)}"
                };
            }
        }

        // Fallback: color o forma básica
        FoodTags fallbackTag = FoodTags.Rojo;
        return new RuleData { kind = RuleKind.MatchTag, targetTag = fallbackTag, description = "TOCA ROJOS" };
    }

    private List<FoodTags> GetAvailableTagsForLevel(int level)
    {
        List<FoodTags> tags = new List<FoodTags>();

        // Siempre presentes
        tags.Add(FoodTags.Rojo);
        tags.Add(FoodTags.Verde);
        tags.Add(FoodTags.Amarillo);
        tags.Add(FoodTags.Redondo);
        tags.Add(FoodTags.Alargado);

        if (currentDifficulty != GameDifficulty.Easy)
        {
            tags.Add(FoodTags.Naranja);
            tags.Add(FoodTags.Marron);
            tags.Add(FoodTags.Blanco);
            tags.Add(FoodTags.Cuadrado);
            tags.Add(FoodTags.Irregular);
        }

        if (currentDifficulty == GameDifficulty.Medium || currentDifficulty == GameDifficulty.Hard)
        {
            if (level >= 3) tags.Add(FoodTags.Fruta);
            if (level >= 3) tags.Add(FoodTags.Verdura);
            if (level >= 3) tags.Add(FoodTags.Carne);
            if (level >= 3) tags.Add(FoodTags.Lacteo);
            if (level >= 4) { tags.Add(FoodTags.Pequeno); tags.Add(FoodTags.Mediano); tags.Add(FoodTags.Grande); }
            if (level >= 6) { tags.Add(FoodTags.Dulce); tags.Add(FoodTags.Salado); }
        }

        if (currentDifficulty == GameDifficulty.Hard)
        {
            if (level >= 5) tags.Add(FoodTags.Bebida); // Aunque no usaremos bebidas, se puede
            if (level >= 7) { tags.Add(FoodTags.Frio); tags.Add(FoodTags.Caliente); }
            if (level >= 8) { tags.Add(FoodTags.Crudo); tags.Add(FoodTags.Cocinado); }
            if (level >= 8) { tags.Add(FoodTags.Azul); tags.Add(FoodTags.Rosa); }
        }

        return tags;
    }

    private string TagName(FoodTags tag)
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
            case FoodTags.Dulce: return "DULCES";
            case FoodTags.Salado: return "SALADOS";
            case FoodTags.Crudo: return "CRUDOS";
            case FoodTags.Cocinado: return "COCINADOS";
            case FoodTags.Frio: return "FRIOS";
            case FoodTags.Caliente: return "CALIENTES";
            case FoodTags.Pequeno: return "PEQUEÑOS";
            case FoodTags.Mediano: return "MEDIANOS";
            case FoodTags.Grande: return "GRANDES";
            default: return tag.ToString().ToUpper();
        }
    }

    // ============================================================
    // GENERACIÓN DE RONDA
    // ============================================================

    private void GenerateRound()
    {
        ClearStimuli();

        int level = NivelActual;
        int count = Mathf.RoundToInt(Mathf.Lerp(estimulosNivel1, estimulosNivel10, LevelT(level)));
        count = Mathf.Clamp(count, 3, 12);

        roundDuration = Mathf.Lerp(tiempoRondaNivel1, tiempoRondaNivel10, LevelT(level));
        roundTimer = roundDuration;
        freezeTimer = 0f;

        if (foodDatabase == null || foodDatabase.allFoods.Count == 0)
        {
            Debug.LogError("FoodDatabase no asignado o vacío");
            return;
        }

        rondasDesdePowerUp++;
        bool spawnPowerUp = (rondasDesdePowerUp >= rondasPorPowerUp && level >= 2);
        if (spawnPowerUp) rondasDesdePowerUp = 0;

        int targets = Mathf.Clamp(Mathf.RoundToInt(count * Random.Range(0.34f, 0.52f)), 1, count - 1);
        List<Vector2> usedPositions = new List<Vector2>();

        int powerUpIndex = spawnPowerUp ? Random.Range(0, count) : -1;

        for (int i = 0; i < count; i++)
        {
            bool shouldMatch = i < targets;
            FoodItem selectedFood = shouldMatch ? GetFoodMatchingRule() : GetFoodNotMatchingRule();

            Stimulus stimulus = new Stimulus { food = selectedFood };

            if (i == powerUpIndex)
            {
                stimulus.powerUp = (PowerUpType)Random.Range(1, 5);
            }

            SpawnStimulus(stimulus, FindFreePosition(usedPositions, CurrentSize(level)));
            usedPositions.Add(stimulus.rect.anchoredPosition);
        }

        ShuffleStimulusPositions();
        EmitirEstado();
    }

    // ============================================================
    // SPAWN DE ESTÍMULOS
    // ============================================================

    private void SpawnStimulus(Stimulus stimulus, Vector2 position)
    {
        if (zonaJuego == null) return;

        GameObject obj = new GameObject("Estimulo", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(Button));
        obj.transform.SetParent(zonaJuego, false);

        stimulus.rect = obj.GetComponent<RectTransform>();
        stimulus.image = obj.GetComponent<Image>();
        stimulus.button = obj.GetComponent<Button>();

        Vector2 baseSize = CurrentSize(NivelActual);

        // Si es Power‑Up usamos el icono, si no, la comida
        if (stimulus.powerUp != PowerUpType.None)
        {
            stimulus.image.sprite = GetPowerUpSprite(stimulus.powerUp);
            // El tamaño puede ser un poco mayor para que destaque
            stimulus.rect.sizeDelta = baseSize * 1.2f;
        }
        else
        {
            stimulus.image.sprite = stimulus.food.sprite;
            float sizeMultiplier = stimulus.food.tags.HasFlag(FoodTags.Grande) ? 1.5f :
                                   stimulus.food.tags.HasFlag(FoodTags.Pequeno) ? 0.65f : 1.0f;
            stimulus.rect.sizeDelta = baseSize * sizeMultiplier;
        }

        stimulus.rect.anchorMin = stimulus.rect.anchorMax = stimulus.rect.pivot = new Vector2(0.5f, 0.5f);
        stimulus.rect.anchoredPosition = position;
        stimulus.image.preserveAspect = true;
        stimulus.image.raycastTarget = true;

        // Solo para Power‑Ups mantenemos un glow sutil
        if (stimulus.powerUp != PowerUpType.None)
        {
            GameObject glowObj = new GameObject("Glow", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            glowObj.transform.SetParent(obj.transform, false);
            stimulus.glowImage = glowObj.GetComponent<Image>();
            stimulus.glowImage.sprite = stimulus.image.sprite;   // mismo icono
            stimulus.glowImage.color = powerUpGlowColor;
            stimulus.glowImage.preserveAspect = true;
            stimulus.glowImage.raycastTarget = false;
            RectTransform glowRect = glowObj.GetComponent<RectTransform>();
            glowRect.anchorMin = glowRect.anchorMax = glowRect.pivot = new Vector2(0.5f, 0.5f);
            glowRect.sizeDelta = stimulus.rect.sizeDelta * 1.25f;
            glowRect.anchoredPosition = Vector2.zero;
        }

        stimulus.button.targetGraphic = stimulus.image;
        stimulus.button.onClick.AddListener(() => OnStimulusPressed(stimulus));

        stimuli.Add(stimulus);
    }

    // ============================================================
    // INTERACCIÓN CON ESTÍMULOS
    // ============================================================

    private void OnStimulusPressed(Stimulus stimulus)
    {
        if (stimulus == null || stimulus.resolved || gameFinished || juegoPausado) return;
        stimulus.resolved = true; // Esto ya lo tienes, pero asegúrate que esté al PRINCIPIO
                                  // Desactivar el botón inmediatamente para evitar doble click
        if (stimulus.button != null) stimulus.button.interactable = false;
        AudioManager.Instance?.Click();
        stimulus.resolved = true;

        if (stimulus.powerUp != PowerUpType.None)
        {
            ApplyPowerUp(stimulus.powerUp);
            StartCoroutine(SliceAndDestroy(stimulus.rect.gameObject, true));
            EmitirEstado();
            if (AllTargetsResolved()) GenerateRound();
            return;
        }

        bool target = currentRule.kind == RuleKind.MatchTag
            ? stimulus.food.tags.HasFlag(currentRule.targetTag)
            : !stimulus.food.tags.HasFlag(currentRule.targetTag);

        totalDecisions++;
        reactionSum += stimulus.age;

        bool postChange = Time.time - lastRuleChangeTime <= 1.65f;
        if (postChange) postChangeDecisions++;

        // Feedback flotante que sale del alimento y va al centro
        Vector3 startPos = stimulus.rect.position;
        Vector3 endPos = zonaJuego.position + Vector3.up * 100f; // hacia centro superior
        string feedbackMsg = "";
        bool isCorrect = false;

        if (target)
        {
            correctDecisions++;
            currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            comboMultiplier = (currentStreak >= 10) ? 3 : (currentStreak >= 5) ? 2 : 1;
            if (activePowerUp == PowerUpType.Estrella)
            {
                comboMultiplier = Mathf.Max(comboMultiplier, 3);
                activePowerUp = PowerUpType.None;
            }
            if (postChange) postChangeCorrect++;
            AudioManager.Instance?.Acierto();
            feedbackMsg = $"¡Correcto! +{comboMultiplier}";
            isCorrect = true;
            RegisterDifficulty(1f, 1f, true, stimulus.age);
        }
        else
        {
            if (activePowerUp == PowerUpType.Escudo)
            {
                activePowerUp = PowerUpType.None;
                AudioManager.Instance?.Acierto();
                feedbackMsg = "¡Escudo!";
                isCorrect = true;
                StartCoroutine(SliceAndDestroy(stimulus.rect.gameObject, true));
                EmitirEstado();
                if (AllTargetsResolved()) GenerateRound();
                return;
            }

            wrongTouches++;
            inhibitionOpportunities++;
            currentStreak = 0;
            comboMultiplier = 1;
            if (hasPreviousRule && MatchesPreviousRule(stimulus)) perseverationErrors++;
            AudioManager.Instance?.Error();
            feedbackMsg = hasPreviousRule && MatchesPreviousRule(stimulus) ? "¡Regla anterior!" : "¡Incorrecto!";
            isCorrect = false;
            RegisterDifficulty(0f, 1.25f, false, stimulus.age);
        }

        // Mostrar feedback flotante
        ShowFloatingFeedback(feedbackMsg, startPos, endPos, isCorrect);

        // Animación de slice y destrucción
        StartCoroutine(SliceAndDestroy(stimulus.rect.gameObject, target));

        EmitirEstado();
        if (AllTargetsResolved()) GenerateRound();
    }


    private IEnumerator SliceAndDestroy(GameObject obj, bool success)
    {
        if (obj == null) yield break;

        // Guardar referencias y verificar que sigan existiendo durante la animación
        RectTransform rect = obj.GetComponent<RectTransform>();
        Image img = obj.GetComponent<Image>();

        if (rect == null || img == null)
        {
            if (obj != null) Destroy(obj);
            yield break;
        }

        Vector3 originalScale = rect.localScale;
        Quaternion originalRot = rect.localRotation;
        float sliceAngle = success ? 30f : -30f;
        float elapsed = 0f;
        float duration = sliceAnimationDuration;

        // Efecto de partículas (opcional)
        if (sliceEffectPrefab != null)
        {
            GameObject effect = Instantiate(sliceEffectPrefab, rect.position, Quaternion.identity);
            ParticleSystem ps = effect.GetComponent<ParticleSystem>();
            if (ps != null) ps.Play();
            Destroy(effect, 1f);
        }

        while (elapsed < duration)
        {
            // CRUCIAL: Verificar que el objeto aún existe en cada frame
            if (obj == null || rect == null || img == null) yield break;

            elapsed += Time.deltaTime;
            float t = elapsed / duration;

            // Escala en X se reduce (como si se partiera)
            float scaleX = Mathf.Lerp(1f, 0.1f, t);
            float scaleY = Mathf.Lerp(1f, 1.3f, t);
            rect.localScale = new Vector3(scaleX, scaleY, 1f);

            // Rotación
            float angle = Mathf.Lerp(0f, sliceAngle, t);
            rect.localRotation = originalRot * Quaternion.Euler(0, 0, angle);

            // Fade out
            Color c = img.color;
            c.a = Mathf.Lerp(1f, 0f, t);
            img.color = c;

            yield return null;
        }

        // Destruir solo si aún existe
        if (obj != null) Destroy(obj);
    }
    private void ShowFloatingFeedback(string message, Vector3 start, Vector3 end, bool isCorrect)
    {
        if (zonaJuego == null) return;

        // Limitar feedbacks simultaneos
        if (feedbacksActivos.Count >= maxFeedbacksSimultaneos)
        {
            // Eliminar el feedback mas antiguo
            if (feedbacksActivos[0] != null)
                Destroy(feedbacksActivos[0]);
            feedbacksActivos.RemoveAt(0);
        }

        // Crear un objeto TextMeshPro temporal
        GameObject go = new GameObject("FloatingFeedback", typeof(RectTransform));
        go.transform.SetParent(zonaJuego, false);
        feedbacksActivos.Add(go);

        TextMeshProUGUI text = go.AddComponent<TextMeshProUGUI>();
        text.text = message;
        text.fontSize = 48;
        if (uiCambioDeReglas != null && uiCambioDeReglas.fuenteTextos != null)
            text.font = uiCambioDeReglas.fuenteTextos;
        text.alignment = TextAlignmentOptions.Center;
        text.color = isCorrect ? Color.green : Color.red;
        text.outlineWidth = 0.2f;
        text.outlineColor = Color.black;

        RectTransform rt = go.GetComponent<RectTransform>();
        rt.position = start; // Empieza donde está el alimento
        rt.sizeDelta = new Vector2(300, 100);

        // ANIMACION: Sube hacia arriba (no hacia el centro)
        StartCoroutine(AnimateFeedbackVertical(go, start, isCorrect));
    }

    private IEnumerator AnimateFeedbackVertical(GameObject go, Vector3 start, bool isCorrect)
    {
        if (go == null) yield break;

        float duration = 0.8f;
        float elapsed = 0f;
        TextMeshProUGUI text = go.GetComponent<TextMeshProUGUI>();
        RectTransform rt = go.GetComponent<RectTransform>();

        if (text == null || rt == null)
        {
            if (go != null) Destroy(go);
            yield break;
        }

        // Posicion inicial (sobre el alimento)
        Vector3 startPos = start;
        // Posicion final (mas arriba, sin ir al centro)
        Vector3 endPos = start + new Vector3(0, 180f, 0); // Sube 180 pixels

        while (elapsed < duration)
        {
            if (go == null || text == null || rt == null) yield break;

            elapsed += Time.deltaTime;
            float t = elapsed / duration;

            // Movimiento hacia arriba (curva suave)
            Vector3 pos = Vector3.Lerp(startPos, endPos, t);
            if (rt != null) rt.position = pos;

            // Escala: empieza pequeño, crece, luego se desvanece
            float scale;
            if (t < 0.3f)
                scale = Mathf.Lerp(0.8f, 1.3f, t / 0.3f);
            else if (t < 0.7f)
                scale = 1.3f;
            else
                scale = Mathf.Lerp(1.3f, 0.5f, (t - 0.7f) / 0.3f);

            if (rt != null) rt.localScale = Vector3.one * scale;

            // Fade out al final
            if (text != null)
            {
                Color c = text.color;
                if (t > 0.5f)
                    c.a = Mathf.Lerp(1f, 0f, (t - 0.5f) / 0.5f);
                else
                    c.a = 1f;
                text.color = c;
            }

            yield return null;
        }
        // Al final, antes del Destroy, limpiar de la lista
        if (go != null && feedbacksActivos.Contains(go))
            feedbacksActivos.Remove(go);

        if (go != null) Destroy(go);
    }
    // Añade esta corrutina en CambioDeReglasGame.cs
    private IEnumerator AnunciarCambioRegla(string nuevaRegla)
    {
        if (uiCambioDeReglas == null || uiCambioDeReglas.textoRegla == null) yield break;

        TextMeshProUGUI textoRegla = uiCambioDeReglas.textoRegla;
        RectTransform rectRegla = textoRegla.rectTransform;

        // Guardar valores originales
        Vector3 originalScale = rectRegla.localScale;
        Color originalColor = textoRegla.color;

        // Efecto 1: Escala de pop
        float elapsed = 0f;
        float popDuration = 0.3f;
        while (elapsed < popDuration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / popDuration;
            // Escala: 1 → 1.3 → 1
            float scale = 1f + Mathf.Sin(t * Mathf.PI) * 0.3f;
            rectRegla.localScale = originalScale * scale;
            // Color: blanco → amarillo → blanco
            textoRegla.color = Color.Lerp(originalColor, Color.yellow, Mathf.Sin(t * Mathf.PI));
            yield return null;
        }

        rectRegla.localScale = originalScale;
        textoRegla.color = originalColor;

        // Efecto 2: Texto de anuncio flotante (opcional)
        if (uiCambioDeReglas.textoCambioRegla != null)
        {
            uiCambioDeReglas.textoCambioRegla.gameObject.SetActive(true);
            uiCambioDeReglas.textoCambioRegla.text = "¡NORMA ACTUALIZADA!";
            uiCambioDeReglas.textoCambioRegla.color = Color.yellow;
            yield return new WaitForSeconds(1f);
            uiCambioDeReglas.textoCambioRegla.gameObject.SetActive(false);
        }
    }

    private void ApplyPowerUp(PowerUpType type)
    {
        switch (type)
        {
            case PowerUpType.Reloj:
                roundTimer += 5f;
                OnFeedback?.Invoke("+5 segundos", true);
                break;
            case PowerUpType.Estrella:
                activePowerUp = PowerUpType.Estrella;
                OnFeedback?.Invoke("¡Proximo acierto ×3!", true);
                break;
            case PowerUpType.Escudo:
                activePowerUp = PowerUpType.Escudo;
                OnFeedback?.Invoke("¡Escudo activado!", true);
                break;
            case PowerUpType.Congelar:
                freezeTimer = 2f;
                OnFeedback?.Invoke("¡Tiempo congelado 2s!", true);
                break;
        }
        AudioManager.Instance?.PowerUp();
    }

    private bool MatchesPreviousRule(Stimulus stimulus)
    {
        if (!hasPreviousRule || stimulus?.food == null) return false;
        return previousRule.kind == RuleKind.MatchTag
            ? stimulus.food.tags.HasFlag(previousRule.targetTag)
            : !stimulus.food.tags.HasFlag(previousRule.targetTag);
    }

    // ============================================================
    // EFECTOS VISUALES
    // ============================================================

    private IEnumerator PopAndDestroy(GameObject obj)
    {
        if (!obj) yield break;

        Vector3 originalScale = obj.transform.localScale;
        float t = 0f;
        while (t < 0.25f)
        {
            if (!obj) yield break;   // El objeto fue destruido externamente

            t += Time.deltaTime;
            float s = Mathf.Lerp(1f, 1.4f, Mathf.Min(t / 0.15f, 1f));
            float alpha = Mathf.Lerp(1f, 0f, Mathf.Clamp01((t - 0.1f) / 0.15f));
            obj.transform.localScale = originalScale * s;

            if (obj.TryGetComponent<Image>(out var img))
            {
                Color c = img.color;
                c.a = alpha;
                img.color = c;
            }
            yield return null;
        }
        if (obj) Destroy(obj);
    }

    private IEnumerator ShakeAndDestroy(GameObject obj)
    {
        if (!obj) yield break;

        Vector3 originalPos = obj.transform.localPosition;
        float t = 0f;
        while (t < 0.35f)
        {
            if (!obj) yield break;

            t += Time.deltaTime;
            float shake = Mathf.Sin(t * 40f) * 8f * (1f - Mathf.Clamp01(t / 0.35f));
            obj.transform.localPosition = originalPos + new Vector3(shake, 0, 0);

            if (t > 0.2f && obj.TryGetComponent<Image>(out var img))
            {
                Color c = img.color;
                c.a = Mathf.Lerp(1f, 0f, (t - 0.2f) / 0.15f);
                img.color = c;
            }
            yield return null;
        }
        if (obj) Destroy(obj);
    }

    // ============================================================
    // RESOLUCIÓN DE RONDA
    // ============================================================

    private void ResolveRoundTimeout()
    {
        int avoidedDistractors = 0;
        float slowestAge = roundDuration;

        for (int i = stimuli.Count - 1; i >= 0; i--)
        {
            Stimulus stimulus = stimuli[i];
            if (stimulus == null || stimulus.resolved) continue;

            bool target = currentRule.kind == RuleKind.MatchTag
                ? stimulus.food.tags.HasFlag(currentRule.targetTag)
                : !stimulus.food.tags.HasFlag(currentRule.targetTag);

            stimulus.resolved = true;
            totalDecisions++;
            slowestAge = Mathf.Max(slowestAge, stimulus.age);

            // 🔥 SOLO CONTAR DISTRACTORES EVITADOS, NO PENALIZAR TARGETS NO TOCADOS
            if (!target)
            {
                avoidedDistractors++;
                inhibitionCorrect++;
                inhibitionOpportunities++;
            }
            // Los targets no tocados simplemente se ignoran (no penalizan)
        }

        if (avoidedDistractors > 0)
        {
            correctDecisions += avoidedDistractors;
            currentStreak += avoidedDistractors > 0 ? 1 : 0;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            comboMultiplier = (currentStreak >= 10) ? 3 : (currentStreak >= 5) ? 2 : 1;
            OnFeedback?.Invoke($"¡Has evitado {avoidedDistractors} distractores!", true);
            RegisterDifficulty(0.7f, 0.45f, true, slowestAge);
        }
        else
        {
            // No hay penalización si no se tocaron objetivos
            OnFeedback?.Invoke("¡Bien! Nuevos alimentos disponibles", true);
        }

        GenerateRound();
    }
    private bool AllTargetsResolved()
    {
        for (int i = 0; i < stimuli.Count; i++)
        {
            Stimulus stimulus = stimuli[i];
            if (stimulus != null && !stimulus.resolved)
            {
                bool target = currentRule.kind == RuleKind.MatchTag
                    ? stimulus.food.tags.HasFlag(currentRule.targetTag)
                    : !stimulus.food.tags.HasFlag(currentRule.targetTag);
                if (target) return false;
            }
        }
        return true;
    }


    private void MostrarDificultadElegida()
    {
        if (textoIndicadorDificultad == null)
        {
            // Crear un texto temporal si no existe
            GameObject go = new GameObject("IndicadorDificultad", typeof(RectTransform), typeof(TextMeshProUGUI));
            go.transform.SetParent(uiCambioDeReglas.ZonaJuego, false);
            textoIndicadorDificultad = go.GetComponent<TextMeshProUGUI>();

            // Configurar posición central
            RectTransform rt = go.GetComponent<RectTransform>();
            rt.anchorMin = new Vector2(0.2f, 0.45f);
            rt.anchorMax = new Vector2(0.8f, 0.55f);
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;

            textoIndicadorDificultad.fontSize = 42;
            textoIndicadorDificultad.alignment = TextAlignmentOptions.Center;
            textoIndicadorDificultad.outlineWidth = 0.2f;
            textoIndicadorDificultad.outlineColor = Color.black;

            if (uiCambioDeReglas != null && uiCambioDeReglas.fuenteTextos != null)
                textoIndicadorDificultad.font = uiCambioDeReglas.fuenteTextos;
        }

        string nombreDificultad = "";
        Color colorDificultad = Color.white;

        switch (currentDifficulty)
        {
            case GameDifficulty.Easy:
                nombreDificultad = "🍎 MODO FACIL 🍎\n(Solo frutas, verduras y carnes)";
                colorDificultad = Color.green;
                break;
            case GameDifficulty.Medium:
                nombreDificultad = "🍕 MODO MEDIO 🍕\n(Añade tamaños y sabores)";
                colorDificultad = Color.yellow;
                break;
            case GameDifficulty.Hard:
                nombreDificultad = "🔥 MODO EXPERTO 🔥\n(¡Todo vale! Temperatura, coccion, colores raros...)";
                colorDificultad = Color.red;
                break;
        }

        textoIndicadorDificultad.text = nombreDificultad;
        textoIndicadorDificultad.color = colorDificultad;
        textoIndicadorDificultad.gameObject.SetActive(true);

        // Animación de entrada y salida
        StartCoroutine(DesvanecerIndicador(textoIndicadorDificultad.gameObject));
    }

    private IEnumerator DesvanecerIndicador(GameObject indicador)
    {
        TextMeshProUGUI text = indicador.GetComponent<TextMeshProUGUI>();
        if (text == null) yield break;

        float elapsed = 0f;
        Color originalColor = text.color;

        // Mostrar durante duracionIndicadorDificultad segundos
        yield return new WaitForSeconds(duracionIndicadorDificultad);

        // Desvanecer
        while (elapsed < 1f)
        {
            elapsed += Time.deltaTime;
            float alpha = Mathf.Lerp(1f, 0f, elapsed);
            text.color = new Color(originalColor.r, originalColor.g, originalColor.b, alpha);
            yield return null;
        }

        indicador.SetActive(false);
        text.color = originalColor; // Restaurar para la próxima vez
    }

    public void CambiarDificultadEnMedioPartida(GameDifficulty nuevaDificultad)
    {
        if (!gameActive || gameFinished) return;

        // Guardar dificultad anterior
        GameDifficulty anterior = currentDifficulty;
        currentDifficulty = nuevaDificultad;

        // 🔥 IMPORTANTE: Forzar la recarga de tags disponibles
        // Limpiar y regenerar todo con la nueva dificultad
        ClearStimuli();

        // Resetear nivel para que se adapte a la nueva dificultad
        DifficultyManager.Instance?.ResetDifficulty(Mathf.Clamp(nivelInicial, 1, 10));
        maxLevelReached = Mathf.Clamp(nivelInicial, 1, 10);

        // Regenerar regla y ronda
        ChangeRule(true); // Forzar nueva regla con la dificultad actualizada
        GenerateRound();

        // Mostrar indicador de cambio
        if (textoIndicadorDificultad != null)
        {
            string mensaje = $"¡DIFICULTAD CAMBIADA!\n{GetDifficultyName(anterior)} → {GetDifficultyName(nuevaDificultad)}";
            textoIndicadorDificultad.text = mensaje;
            textoIndicadorDificultad.color = Color.cyan;
            textoIndicadorDificultad.gameObject.SetActive(true);
            StartCoroutine(DesvanecerIndicador(textoIndicadorDificultad.gameObject));
        }

        // Feedback adicional
        OnFeedback?.Invoke($"Dificultad cambiada a {GetDifficultyName(nuevaDificultad)}", true);
        AudioManager.Instance?.NivelUp();
    }

    private string GetDifficultyName(GameDifficulty diff)
    {
        switch (diff)
        {
            case GameDifficulty.Easy: return "FÁCIL";
            case GameDifficulty.Medium: return "MEDIO";
            case GameDifficulty.Hard: return "EXPERTO";
            default: return diff.ToString();
        }
    }
    // ============================================================
    // SELECCIÓN DE ALIMENTOS
    // ============================================================

    private Sprite GetPowerUpSprite(PowerUpType type)
    {
        switch (type)
        {
            case PowerUpType.Reloj: return powerUpReloj;
            case PowerUpType.Estrella: return powerUpEstrella;
            case PowerUpType.Escudo: return powerUpEscudo;
            case PowerUpType.Congelar: return powerUpCongelar;
            default: return null;
        }
    }

    private FoodItem GetFoodMatchingRule()
    {
        List<FoodItem> candidates = currentRule.kind == RuleKind.MatchTag
            ? foodDatabase.GetFoodsWithTag(currentRule.targetTag)
            : foodDatabase.GetFoodsWithoutTag(currentRule.targetTag);
        if (candidates.Count == 0) candidates = foodDatabase.allFoods;
        return candidates[Random.Range(0, candidates.Count)];
    }

    private FoodItem GetFoodNotMatchingRule()
    {
        List<FoodItem> candidates = currentRule.kind == RuleKind.MatchTag
            ? foodDatabase.GetFoodsWithoutTag(currentRule.targetTag)
            : foodDatabase.GetFoodsWithTag(currentRule.targetTag);
        if (candidates.Count == 0) candidates = foodDatabase.allFoods;
        return candidates[Random.Range(0, candidates.Count)];
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    private void RegisterDifficulty(float value, float weight, bool hit, float reactionTime)
    {
        weightedPerformance += Mathf.Clamp01(value) * Mathf.Max(0.01f, weight);
        weightedPerformanceWeight += Mathf.Max(0.01f, weight);
        DifficultyManager.Instance?.ActualizarDificultad(CurrentPerformance(), hit, reactionTime);
        maxLevelReached = Mathf.Max(maxLevelReached, NivelActual);
    }

    private float CurrentPerformance()
    {
        if (weightedPerformanceWeight <= 0f) return 0.5f;
        return Mathf.Clamp01(weightedPerformance / weightedPerformanceWeight);
    }

    private void CachearUI()
    {
        if (uiCambioDeReglas == null) uiCambioDeReglas = GetComponent<UICambioDeReglas>();
        if (uiCambioDeReglas == null) uiCambioDeReglas = FindFirstObjectByType<UICambioDeReglas>(FindObjectsInactive.Include);
        if (uiCambioDeReglas == null) uiCambioDeReglas = gameObject.AddComponent<UICambioDeReglas>();
    }

    private void PrepararUI()
    {
        CachearUI();
        uiCambioDeReglas.Preparar(this);
        zonaJuego = uiCambioDeReglas.ZonaJuego;
    }

    private void EmitirEstado() => OnEstadoActualizado?.Invoke();

    private void ClearStimuli()
    {
        for (int i = stimuli.Count - 1; i >= 0; i--)
        {
            if (stimuli[i] != null && stimuli[i].rect != null && stimuli[i].rect.gameObject != null)
                Destroy(stimuli[i].rect.gameObject);
        }
        stimuli.Clear();
    }

    private void ShuffleStimulusPositions()
    {
        for (int i = 0; i < stimuli.Count; i++)
        {
            int other = Random.Range(i, stimuli.Count);
            Vector2 pos = stimuli[i].rect.anchoredPosition;
            stimuli[i].rect.anchoredPosition = stimuli[other].rect.anchoredPosition;
            stimuli[other].rect.anchoredPosition = pos;
        }
    }

    private Vector2 FindFreePosition(List<Vector2> usedPositions, Vector2 size)
    {
        float width = PlayWidth(), height = PlayHeight();
        float margin = Mathf.Max(size.x, size.y) * 0.62f;
        for (int attempt = 0; attempt < 35; attempt++)
        {
            Vector2 position = new Vector2(Random.Range(-width * 0.5f + margin, width * 0.5f - margin),
                                           Random.Range(-height * 0.5f + margin, height * 0.5f - margin));
            bool free = true;
            for (int i = 0; i < usedPositions.Count; i++)
            {
                if (Vector2.Distance(position, usedPositions[i]) < margin * 1.35f) { free = false; break; }
            }
            if (free) return position;
        }
        return new Vector2(Random.Range(-width * 0.35f, width * 0.35f), Random.Range(-height * 0.35f, height * 0.35f));
    }

    private Vector2 CurrentSize(int level) => Vector2.Lerp(tamanoEstimuloNivel1, tamanoEstimuloNivel10, LevelT(level));
    private float PlayWidth() => zonaJuego != null ? Mathf.Max(780f, zonaJuego.rect.width) : 900f;
    private float PlayHeight() => zonaJuego != null ? Mathf.Max(520f, zonaJuego.rect.height) : 620f;
    private float LevelT(int level) => Mathf.Clamp01((level - 1f) / 9f);

    public override void PausarJuego(bool pausar) => base.PausarJuego(pausar);

    public override void OnGameFinished()
    {
        if (gameFinished) return;
        gameFinished = true;
        gameActive = false;
        ClearStimuli();
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }
    // Archivo: CambioDeReglasGame.cs (solo se muestra CalcularCognicion y AplicarPesos - el resto queda igual)
    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics metrics = new CognitiveMetrics();
        if (totalDecisions <= 0) return metrics;

        float precision = CurrentPerformance();
        float flexibility = postChangeDecisions > 0 ? (float)postChangeCorrect / postChangeDecisions : precision;
        float perseverationPenalty = 1f - (float)perseverationErrors / Mathf.Max(1, wrongTouches + omissions);
        float inhibition = inhibitionOpportunities > 0 ? (float)inhibitionCorrect / inhibitionOpportunities : precision;
        float levelFactor = Mathf.Lerp(0.6f, 1f, Mathf.Clamp01(maxLevelReached / 8f));

        // Métricas más generosas para adultos
        metrics.flexibilidadCognitiva = Mathf.Clamp01(flexibility * 0.7f + 0.3f) * levelFactor;
        metrics.controlInhibitorio = Mathf.Clamp01(inhibition * 0.7f + 0.3f) * levelFactor;
        metrics.atencionSostenida = Mathf.Lerp(0.6f, 1f, Mathf.Clamp01(totalDecisions / 15f)) * levelFactor;
        metrics.planificacion = Mathf.Clamp01(precision * 0.5f + Mathf.Clamp01(bestStreak / 6f) * 0.5f) * levelFactor;
        metrics.memoriaEspacial = Mathf.Clamp01(precision * 0.6f + 0.4f) * levelFactor;
        return metrics;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics weighted = new CognitiveMetrics();
        weighted.flexibilidadCognitiva = metrics.flexibilidadCognitiva * 0.45f;
        weighted.controlInhibitorio = metrics.controlInhibitorio * 0.30f;
        weighted.atencionSostenida = metrics.atencionSostenida * 0.15f;
        weighted.planificacion = metrics.planificacion * 0.10f;
        return weighted;
    }
}