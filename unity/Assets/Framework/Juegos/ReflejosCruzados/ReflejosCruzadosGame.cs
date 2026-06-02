using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ReflejosCruzadosGame : BaseGame
{
    private const float ValorAciertoDiana = 1f;
    private const float PesoAciertoDiana = 1f;
    private const float ValorInhibicionCorrecta = 0.55f;
    private const float PesoInhibicionCorrecta = 0.25f;
    private const float PesoErrorComision = 1.25f;
    private const float PesoErrorOmision = 1.15f;

    private enum FallingKind
    {
        Green,
        Red
    }

    private class FallingItem
    {
        public RectTransform rect;
        public Button button;
        public FallingKind kind;
        public float speed;
        public float age;
        public bool resolved;
    }

    [Header("UI")]
    public UIReflejosCruzados uiReflejosCruzados;

    [Header("Dificultad")]
    public int nivelInicial = 1;
    public float intervaloSpawnNivel1 = 1.0f;
    public float intervaloSpawnNivel10 = 0.42f;
    public float velocidadNivel1 = 210f;
    public float velocidadNivel10 = 480f;
    public Vector2 tamanoDianaNivel1 = new Vector2(108f, 108f);
    public Vector2 tamanoDianaNivel10 = new Vector2(76f, 76f);
    public float escalaHitboxDiana = 1.35f;
    public float tamanoMinimoHitboxDiana = 118f;

    [Header("Estilo dianas")]
    public Color colorDianaVerde = new Color(0.372549f, 0.4980392f, 0.227451f, 1f);
    public Color colorDianaRoja = new Color(0.5254902f, 0.1843137f, 0.2039216f, 1f);
    public Color colorCentroDiana = new Color(1f, 0.9137255f, 0.7215686f, 1f);

    [Header("Regla invertida")]
    public float primerCambioReglaSegundos = 5f;
    public float intervaloCambioReglaNivel1 = 10f;
    public float intervaloCambioReglaNivel10 = 4.5f;
    public int cambiosReglaMaximosNivel1 = 1;
    public int cambiosReglaMaximosNivel10 = 5;

    private readonly List<FallingItem> items = new List<FallingItem>();

    private RectTransform zonaJuego;
    private bool gameActive;
    private bool gameFinished;
    private bool invertedRule;
    private int ruleSwitchCount;
    private float ruleSwitchAt;
    private float spawnTimer;
    private int maxLevelReached = 1;

    private int totalEvents;
    private int touchedCorrect;
    private int touchedIncorrect;
    private int avoidedCorrect;
    private int missedTargets;
    private int currentStreak;
    private int bestStreak;
    private float weightedPerformance;
    private float weightedPerformanceWeight;

    public System.Action OnEstadoActualizado;
    public System.Action<string> OnReglaActualizada;
    public System.Action<string, bool> OnFeedback;
    public System.Action<string> OnReglaInvertida;

    public int Aciertos => touchedCorrect;
    public int Fallos => touchedIncorrect + missedTargets;
    public int RachaActual => currentStreak;
    public int NivelActual => Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? nivelInicial, 1, 10);
    public float TiempoRestante => GameManager.Instance != null ? GameManager.Instance.tiempoRestante : 0f;
    public bool ReglaInvertida => invertedRule;
    public string TextoRegla => invertedRule ? "NORMA: TOCA ROJOS" : "NORMA: TOCA VERDES";

    private void Awake()
    {
        nombre = "reflejos cruzados";
        CachearUI();
    }

    private void Start()
    {
        CachearUI();
    }

    public override void ResetGame()
    {
        gameActive = true;
        gameFinished = false;
        juegoPausado = false;
        invertedRule = false;
        ruleSwitchCount = 0;
        spawnTimer = 0.35f;
        maxLevelReached = 1;

        totalEvents = 0;
        touchedCorrect = 0;
        touchedIncorrect = 0;
        avoidedCorrect = 0;
        missedTargets = 0;
        currentStreak = 0;
        bestStreak = 0;
        weightedPerformance = 0f;
        weightedPerformanceWeight = 0f;

        DifficultyManager.Instance?.ResetDifficulty(Mathf.Clamp(nivelInicial, 1, 10));
        PrepararUI();
        ClearItems();
        ScheduleRuleSwitch();
        EmitirEstado();
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    private void Update()
    {
        if (!gameActive || gameFinished || juegoPausado)
            return;

        float delta = Time.deltaTime;

        if (CurrentElapsedTime() >= ruleSwitchAt)
            TryActivateRuleSwitch();

        spawnTimer -= delta;
        if (spawnTimer <= 0f)
        {
            SpawnItem();
            spawnTimer = CurrentSpawnInterval();
        }

        float bottomLimit = -PlayHeight() * 0.5f - 80f;
        for (int i = items.Count - 1; i >= 0; i--)
        {
            FallingItem item = items[i];
            if (item == null || item.resolved)
                continue;

            item.age += delta;
            item.rect.anchoredPosition += Vector2.down * item.speed * delta;

            if (item.rect.anchoredPosition.y < bottomLimit)
                ResolveMiss(item);
        }

        EmitirEstado();
    }

    private void SpawnItem()
    {
        if (zonaJuego == null)
            return;

        int level = NivelActual;
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        FallingKind kind = Random.value < Mathf.Lerp(0.62f, 0.50f, (level - 1f) / 9f) ? FallingKind.Green : FallingKind.Red;
        Vector2 visualSize = CurrentSize(level);
        Vector2 hitboxSize = CurrentHitboxSize(visualSize);

        GameObject itemObject = new GameObject("Diana_" + kind, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(Button));
        itemObject.transform.SetParent(zonaJuego, false);

        FallingItem item = new FallingItem
        {
            rect = itemObject.GetComponent<RectTransform>(),
            button = itemObject.GetComponent<Button>(),
            kind = kind,
            speed = CurrentSpeed(level)
        };

        item.rect.anchorMin = new Vector2(0.5f, 0.5f);
        item.rect.anchorMax = new Vector2(0.5f, 0.5f);
        item.rect.pivot = new Vector2(0.5f, 0.5f);
        item.rect.sizeDelta = hitboxSize;
        item.rect.anchoredPosition = new Vector2(RandomX(hitboxSize.x), PlayHeight() * 0.5f + hitboxSize.y);

        Image hitbox = itemObject.GetComponent<Image>();
        hitbox.color = new Color(1f, 1f, 1f, 0f);
        hitbox.raycastTarget = true;

        GameObject visualObject = new GameObject("Visual", typeof(RectTransform), typeof(CanvasRenderer), typeof(SimpleShapeGraphic));
        visualObject.transform.SetParent(itemObject.transform, false);
        RectTransform visualRect = visualObject.GetComponent<RectTransform>();
        visualRect.anchorMin = new Vector2(0.5f, 0.5f);
        visualRect.anchorMax = new Vector2(0.5f, 0.5f);
        visualRect.pivot = new Vector2(0.5f, 0.5f);
        visualRect.sizeDelta = visualSize;
        visualRect.anchoredPosition = Vector2.zero;

        SimpleShapeGraphic outer = visualObject.GetComponent<SimpleShapeGraphic>();
        outer.SetShape(SimpleShapeKind.Circle, ColorForKind(kind));
        outer.raycastTarget = false;

        SimpleShapeGraphic middle = RuntimeMiniGameUI.CreateShape("Ring", visualObject.transform, SimpleShapeKind.Circle, colorCentroDiana);
        middle.raycastTarget = false;
        RuntimeMiniGameUI.SetRect(middle.rectTransform, new Vector2(0.16f, 0.16f), new Vector2(0.84f, 0.84f), Vector2.zero, Vector2.zero);

        SimpleShapeGraphic center = RuntimeMiniGameUI.CreateShape("Center", visualObject.transform, SimpleShapeKind.Circle, ColorForKind(kind));
        center.raycastTarget = false;
        RuntimeMiniGameUI.SetRect(center.rectTransform, new Vector2(0.34f, 0.34f), new Vector2(0.66f, 0.66f), Vector2.zero, Vector2.zero);

        item.button.targetGraphic = hitbox;
        item.button.transition = Selectable.Transition.None;
        item.button.onClick.AddListener(() => TouchItem(item));
        items.Add(item);
    }

    private float CurrentSpawnInterval()
    {
        return Mathf.Lerp(intervaloSpawnNivel1, intervaloSpawnNivel10, (NivelActual - 1f) / 9f);
    }

    private float CurrentSpeed(int level)
    {
        return Mathf.Lerp(velocidadNivel1, velocidadNivel10, (level - 1f) / 9f);
    }

    private Vector2 CurrentSize(int level)
    {
        return Vector2.Lerp(tamanoDianaNivel1, tamanoDianaNivel10, (level - 1f) / 9f);
    }

    private Vector2 CurrentHitboxSize(Vector2 visualSize)
    {
        float minSize = Mathf.Max(1f, tamanoMinimoHitboxDiana);
        float scale = Mathf.Max(1f, escalaHitboxDiana);
        return new Vector2(
            Mathf.Max(minSize, visualSize.x * scale),
            Mathf.Max(minSize, visualSize.y * scale)
        );
    }

    private Color ColorForKind(FallingKind kind)
    {
        return kind == FallingKind.Green
            ? colorDianaVerde
            : colorDianaRoja;
    }

    private bool ShouldTouch(FallingKind kind)
    {
        return invertedRule ? kind == FallingKind.Red : kind == FallingKind.Green;
    }

    private void TouchItem(FallingItem item)
    {
        if (item == null || item.resolved || gameFinished || juegoPausado)
            return;

        bool correct = ShouldTouch(item.kind);
        item.resolved = true;
        totalEvents++;

        if (correct)
        {
            touchedCorrect++;
            currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            AudioManager.Instance?.Disparo();
            AudioManager.Instance?.Acierto();
            OnFeedback?.Invoke("Diana correcta", true);
            RegisterDifficultyResult(ValorAciertoDiana, PesoAciertoDiana, true, true, item.age);
        }
        else
        {
            touchedIncorrect++;
            currentStreak = 0;
            AudioManager.Instance?.Disparo();
            AudioManager.Instance?.Error();
            OnFeedback?.Invoke("Diana equivocada", false);
            RegisterDifficultyResult(0f, PesoErrorComision, true, false, item.age);
        }

        RemoveItem(item);
        EmitirEstado();
    }

    private void ResolveMiss(FallingItem item)
    {
        if (item == null || item.resolved)
            return;

        bool shouldTouch = ShouldTouch(item.kind);
        item.resolved = true;
        totalEvents++;

        if (shouldTouch)
        {
            missedTargets++;
            currentStreak = 0;
            OnFeedback?.Invoke("Se escapo una diana", false);
            RegisterDifficultyResult(0f, PesoErrorOmision, true, false, Mathf.Max(item.age, 4.5f));
        }
        else
        {
            avoidedCorrect++;
            RegisterDifficultyResult(ValorInhibicionCorrecta, PesoInhibicionCorrecta, false, true, item.age);
        }

        RemoveItem(item);
        EmitirEstado();
    }

    private void ScheduleRuleSwitch()
    {
        float duration = GameManager.Instance != null ? GameManager.Instance.duracionPartida : 45f;
        float elapsed = CurrentElapsedTime();
        if (duration - elapsed <= 2f)
        {
            ruleSwitchAt = float.PositiveInfinity;
            return;
        }

        float firstDelay = primerCambioReglaSegundos;
        float interval = ruleSwitchCount == 0 ? firstDelay : CurrentRuleSwitchInterval();
        float jitter = Random.Range(-0.85f, 1.15f);
        float nextTime = elapsed + Mathf.Max(2.5f, interval + jitter);
        ruleSwitchAt = Mathf.Min(nextTime, duration - 1.5f);
    }

    private void TryActivateRuleSwitch()
    {
        if (ruleSwitchCount < CurrentRuleSwitchLimit())
            ActivateRuleSwitch();

        ScheduleRuleSwitch();
    }

    private void ActivateRuleSwitch()
    {
        ruleSwitchCount++;
        invertedRule = !invertedRule;
        AudioManager.Instance?.NivelUp();
        OnFeedback?.Invoke("Regla cambiada", false);
        OnReglaActualizada?.Invoke(TextoRegla);
        OnReglaInvertida?.Invoke(invertedRule ? "REGLA INVERTIDA\nTOCA ROJOS" : "REGLA CAMBIADA\nTOCA VERDES");
        EmitirEstado();
    }

    private int CurrentRuleSwitchLimit()
    {
        float t = (NivelActual - 1f) / 9f;
        return Mathf.Clamp(Mathf.RoundToInt(Mathf.Lerp(cambiosReglaMaximosNivel1, cambiosReglaMaximosNivel10, t)), 1, 10);
    }

    private float CurrentRuleSwitchInterval()
    {
        return Mathf.Lerp(intervaloCambioReglaNivel1, intervaloCambioReglaNivel10, (NivelActual - 1f) / 9f);
    }

    private void RegisterDifficultyResult(float value, float weight, bool updateDifficulty, bool difficultyHit, float reactionTime)
    {
        weightedPerformance += Mathf.Clamp01(value) * Mathf.Max(0.01f, weight);
        weightedPerformanceWeight += Mathf.Max(0.01f, weight);

        if (updateDifficulty)
            DifficultyManager.Instance?.ActualizarDificultad(CalcularRendimientoInstantaneo(), difficultyHit, reactionTime);
    }

    private float CalcularRendimientoInstantaneo()
    {
        if (weightedPerformanceWeight <= 0f)
            return 0.5f;

        return Mathf.Clamp01(weightedPerformance / weightedPerformanceWeight);
    }

    private void RemoveItem(FallingItem item)
    {
        items.Remove(item);
        if (item.rect != null)
            Destroy(item.rect.gameObject);
    }

    private void ClearItems()
    {
        for (int i = items.Count - 1; i >= 0; i--)
            if (items[i] != null && items[i].rect != null)
                Destroy(items[i].rect.gameObject);

        items.Clear();
    }

    private void CachearUI()
    {
        if (uiReflejosCruzados == null)
            uiReflejosCruzados = GetComponent<UIReflejosCruzados>();

        if (uiReflejosCruzados == null)
            uiReflejosCruzados = FindFirstObjectByType<UIReflejosCruzados>(FindObjectsInactive.Include);

        if (uiReflejosCruzados == null)
            uiReflejosCruzados = gameObject.AddComponent<UIReflejosCruzados>();
    }

    private void PrepararUI()
    {
        CachearUI();
        uiReflejosCruzados.Preparar(this);
        zonaJuego = uiReflejosCruzados.ZonaJuego;
        OnReglaActualizada?.Invoke(TextoRegla);
    }

    private void EmitirEstado()
    {
        OnEstadoActualizado?.Invoke();
    }

    private float CurrentElapsedTime()
    {
        if (GameManager.Instance == null)
            return Time.timeSinceLevelLoad;

        return Mathf.Max(0f, GameManager.Instance.duracionPartida - GameManager.Instance.tiempoRestante);
    }

    private float PlayWidth()
    {
        return zonaJuego != null ? Mathf.Max(760f, zonaJuego.rect.width) : 900f;
    }

    private float PlayHeight()
    {
        return zonaJuego != null ? Mathf.Max(520f, zonaJuego.rect.height) : 620f;
    }

    private float RandomX(float itemSize)
    {
        float margin = itemSize * 0.65f;
        float halfWidth = PlayWidth() * 0.5f;
        return Random.Range(-halfWidth + margin, halfWidth - margin);
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
    }

    public override void OnGameFinished()
    {
        if (gameFinished)
            return;

        gameFinished = true;
        gameActive = false;
        ClearItems();
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics metrics = new CognitiveMetrics();
        if (totalEvents <= 0)
            return metrics;

        float precision = CalcularRendimientoInstantaneo();
        float visomotor = (float)touchedCorrect / Mathf.Max(1, touchedCorrect + touchedIncorrect + missedTargets);
        float inhibition = (float)avoidedCorrect / Mathf.Max(1, avoidedCorrect + touchedIncorrect);
        float spatialMemory = Mathf.Clamp01(precision * (1f - (float)missedTargets / totalEvents));
        float switchBonus = ruleSwitchCount > 0 ? Mathf.Clamp01(ruleSwitchCount / 5f) * 0.1f : 0f;
        float planning = Mathf.Clamp01(precision * 0.65f + Mathf.Clamp01(bestStreak / 8f) * 0.25f + switchBonus);
        float levelFactor = Mathf.Lerp(0.75f, 1f, Mathf.Clamp01(maxLevelReached / 10f));

        metrics.coordinacionVisomotora = Mathf.Clamp01(visomotor * levelFactor);
        metrics.controlInhibitorio = Mathf.Clamp01(inhibition * levelFactor);
        metrics.memoriaEspacial = Mathf.Clamp01(spatialMemory * levelFactor);
        metrics.planificacion = Mathf.Clamp01(planning * levelFactor);
        return metrics;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics weighted = new CognitiveMetrics();
        weighted.coordinacionVisomotora = metrics.coordinacionVisomotora * 0.50f;
        weighted.controlInhibitorio = metrics.controlInhibitorio * 0.25f;
        weighted.memoriaEspacial = metrics.memoriaEspacial * 0.15f;
        weighted.planificacion = metrics.planificacion * 0.10f;
        return weighted;
    }
}
