using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class ReflejosCruzadosGame : BaseGame
{
    private enum FallingKind
    {
        Green,
        Red,
        Switch
    }

    private class FallingItem
    {
        public RectTransform rect;
        public SimpleShapeGraphic shape;
        public Button button;
        public TMP_Text label;
        public FallingKind kind;
        public float speed;
        public bool resolved;
        public float age;
    }

    private RectTransform root;
    private RectTransform laneArea;
    private TextMeshProUGUI ruleText;
    private TextMeshProUGUI scoreText;
    private TextMeshProUGUI levelText;
    private TextMeshProUGUI feedbackText;

    private readonly List<FallingItem> items = new List<FallingItem>();

    private bool gameActive;
    private bool gameFinished;
    private bool invertedRule;
    private float invertedTimeLeft;
    private float spawnTimer;
    private int maxLevelReached = 1;

    private int totalEvents;
    private int touchedCorrect;
    private int touchedIncorrect;
    private int avoidedCorrect;
    private int missedTargets;
    private int switchHits;
    private int currentStreak;
    private int bestStreak;

    private void Awake()
    {
        nombre = "reflejos-cruzados";
    }

    private void Start()
    {
        RuntimeMiniGameUI.PrepareStaticScreens("Reflejos Cruzados", "Toca verdes y evita rojos");
    }

    public override void ResetGame()
    {
        gameActive = true;
        gameFinished = false;
        juegoPausado = false;
        invertedRule = false;
        invertedTimeLeft = 0f;
        spawnTimer = 0.35f;
        maxLevelReached = 1;

        totalEvents = 0;
        touchedCorrect = 0;
        touchedIncorrect = 0;
        avoidedCorrect = 0;
        missedTargets = 0;
        switchHits = 0;
        currentStreak = 0;
        bestStreak = 0;

        DifficultyManager.Instance?.ResetDifficulty(1);
        BuildUI();
        ClearItems();
        UpdateHud();
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

        if (invertedTimeLeft > 0f)
        {
            invertedTimeLeft -= delta;
            if (invertedTimeLeft <= 0f)
            {
                invertedRule = false;
                feedbackText.text = "Regla normal";
                feedbackText.color = RuntimeMiniGameUI.MutedText;
                UpdateHud();
            }
        }

        spawnTimer -= delta;
        if (spawnTimer <= 0f)
        {
            SpawnItem();
            spawnTimer = CurrentSpawnInterval();
        }

        float bottomLimit = -LaneHeight() * 0.5f - 70f;
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
    }

    private void BuildUI()
    {
        root = RuntimeMiniGameUI.CreateGameplayRoot(
            "ReflejosCruzadosRuntimeUI",
            "Reflejos Cruzados",
            "Verde: tocar. Rojo: evitar. Azul: cambia la regla");

        if (root == null)
            return;

        RectTransform statusPanel = RuntimeMiniGameUI.CreatePanel("StatusPanel", root, RuntimeMiniGameUI.Panel);
        RuntimeMiniGameUI.SetRect(statusPanel, new Vector2(0.06f, 0.78f), new Vector2(0.94f, 0.91f), Vector2.zero, Vector2.zero);

        ruleText = RuntimeMiniGameUI.CreateText("RuleText", statusPanel, "", 30f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Left);
        RuntimeMiniGameUI.SetRect(ruleText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 38f), new Vector2(-370f, -8f));

        scoreText = RuntimeMiniGameUI.CreateText("ScoreText", statusPanel, "", 22f, RuntimeMiniGameUI.MutedText, TextAlignmentOptions.Left);
        RuntimeMiniGameUI.SetRect(scoreText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 10f), new Vector2(-370f, -56f));

        levelText = RuntimeMiniGameUI.CreateText("LevelText", statusPanel, "", 22f, RuntimeMiniGameUI.Accent, TextAlignmentOptions.Right);
        RuntimeMiniGameUI.SetRect(levelText.rectTransform, Vector2.zero, Vector2.one, new Vector2(0f, 26f), new Vector2(-28f, -26f));

        laneArea = RuntimeMiniGameUI.CreatePanel("LaneArea", root, RuntimeMiniGameUI.PanelSoft);
        RuntimeMiniGameUI.SetRect(laneArea, new Vector2(0.12f, 0.12f), new Vector2(0.88f, 0.75f), Vector2.zero, Vector2.zero);

        for (int i = 0; i < 3; i++)
        {
            RectTransform lane = RuntimeMiniGameUI.CreatePanel("Lane_" + i, laneArea, i % 2 == 0 ? new Color(1f, 1f, 1f, 0.045f) : new Color(1f, 1f, 1f, 0.075f));
            RuntimeMiniGameUI.SetRect(lane, new Vector2(i / 3f, 0f), new Vector2((i + 1f) / 3f, 1f), new Vector2(8f, 10f), new Vector2(-8f, -10f));
        }

        feedbackText = RuntimeMiniGameUI.CreateText("FeedbackText", root, "", 26f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Center);
        RuntimeMiniGameUI.SetRect(feedbackText.rectTransform, new Vector2(0.08f, 0.05f), new Vector2(0.92f, 0.11f), Vector2.zero, Vector2.zero);
    }

    private void SpawnItem()
    {
        if (laneArea == null)
            return;

        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        FallingKind kind = ChooseKind(level);
        int lane = Random.Range(0, 3);

        GameObject itemObject = new GameObject("Falling_" + kind, typeof(RectTransform), typeof(CanvasRenderer), typeof(SimpleShapeGraphic), typeof(Button));
        itemObject.transform.SetParent(laneArea, false);

        FallingItem item = new FallingItem
        {
            rect = itemObject.GetComponent<RectTransform>(),
            shape = itemObject.GetComponent<SimpleShapeGraphic>(),
            button = itemObject.GetComponent<Button>(),
            kind = kind,
            speed = CurrentSpeed(level)
        };

        item.rect.anchorMin = new Vector2(0.5f, 0.5f);
        item.rect.anchorMax = new Vector2(0.5f, 0.5f);
        item.rect.pivot = new Vector2(0.5f, 0.5f);
        item.rect.sizeDelta = new Vector2(CurrentSize(level), CurrentSize(level));
        item.rect.anchoredPosition = new Vector2(LaneX(lane), LaneHeight() * 0.5f + 72f);

        item.shape.SetShape(kind == FallingKind.Switch ? SimpleShapeKind.Diamond : SimpleShapeKind.Circle, ColorForKind(kind));
        item.button.targetGraphic = item.shape;
        item.button.onClick.AddListener(() => TouchItem(item));

        if (kind == FallingKind.Switch)
        {
            item.label = RuntimeMiniGameUI.CreateText("Label", itemObject.transform, "!", 34f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Center);
            RuntimeMiniGameUI.SetRect(item.label.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        }

        items.Add(item);
    }

    private FallingKind ChooseKind(int level)
    {
        float levelT = (level - 1f) / 9f;
        float switchChance = level >= 4 ? Mathf.Lerp(0.06f, 0.18f, levelT) : 0f;

        if (Random.value < switchChance)
            return FallingKind.Switch;

        return Random.value < Mathf.Lerp(0.58f, 0.46f, levelT) ? FallingKind.Green : FallingKind.Red;
    }

    private float CurrentSpawnInterval()
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        return Mathf.Lerp(1.05f, 0.42f, (level - 1f) / 9f);
    }

    private float CurrentSpeed(int level)
    {
        return Mathf.Lerp(210f, 470f, (level - 1f) / 9f);
    }

    private float CurrentSize(int level)
    {
        return Mathf.Lerp(100f, 74f, (level - 1f) / 9f);
    }

    private Color ColorForKind(FallingKind kind)
    {
        switch (kind)
        {
            case FallingKind.Green:
                return new Color(0.18f, 0.82f, 0.38f, 1f);
            case FallingKind.Red:
                return new Color(0.95f, 0.23f, 0.22f, 1f);
            default:
                return new Color(0.2f, 0.52f, 1f, 1f);
        }
    }

    private bool ShouldTouch(FallingKind kind)
    {
        if (kind == FallingKind.Switch)
            return true;

        if (invertedRule)
            return kind == FallingKind.Red;

        return kind == FallingKind.Green;
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
            feedbackText.text = item.kind == FallingKind.Switch ? "Cambio de regla" : "Toque correcto";
            feedbackText.color = RuntimeMiniGameUI.Good;
            AudioManager.Instance?.Acierto();

            if (item.kind == FallingKind.Switch)
                ActivateRuleSwitch();
        }
        else
        {
            touchedIncorrect++;
            currentStreak = 0;
            feedbackText.text = "Habia que esquivar";
            feedbackText.color = RuntimeMiniGameUI.Bad;
            AudioManager.Instance?.Error();
        }

        DifficultyManager.Instance?.ActualizarDificultad(CalcularRendimientoInstantaneo(), correct, item.age);
        RemoveItem(item);
        UpdateHud();
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
            feedbackText.text = item.kind == FallingKind.Switch ? "Cambio perdido" : "Objetivo perdido";
            feedbackText.color = RuntimeMiniGameUI.Bad;
            AudioManager.Instance?.Error();
        }
        else
        {
            avoidedCorrect++;
            currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            feedbackText.text = "Esquiva correcta";
            feedbackText.color = RuntimeMiniGameUI.Good;
        }

        DifficultyManager.Instance?.ActualizarDificultad(CalcularRendimientoInstantaneo(), !shouldTouch, item.age);
        RemoveItem(item);
        UpdateHud();
    }

    private void ActivateRuleSwitch()
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        invertedRule = !invertedRule;
        invertedTimeLeft = Mathf.Lerp(3.8f, 2.3f, (level - 1f) / 9f);
        switchHits++;
        UpdateHud();
    }

    private float CalcularRendimientoInstantaneo()
    {
        if (totalEvents <= 0)
            return 0.5f;

        return Mathf.Clamp01((float)(touchedCorrect + avoidedCorrect) / totalEvents);
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

    private void UpdateHud()
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        if (ruleText != null)
        {
            ruleText.text = invertedRule
                ? "Regla invertida: rojo toca, verde evita"
                : "Regla normal: verde toca, rojo evita";
        }

        if (scoreText != null)
            scoreText.text = "Correctos " + (touchedCorrect + avoidedCorrect) + "/" + Mathf.Max(1, totalEvents) + "  Racha " + currentStreak;

        if (levelText != null)
            levelText.text = "Nivel " + level + (invertedRule ? "  Cambio " + Mathf.CeilToInt(invertedTimeLeft) + "s" : "");
    }

    private float LaneWidth()
    {
        return laneArea != null ? Mathf.Max(600f, laneArea.rect.width) / 3f : 260f;
    }

    private float LaneHeight()
    {
        return laneArea != null ? Mathf.Max(560f, laneArea.rect.height) : 620f;
    }

    private float LaneX(int lane)
    {
        float width = LaneWidth();
        return width * (lane - 1);
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

        float precision = (float)(touchedCorrect + avoidedCorrect) / totalEvents;
        float visomotor = (float)touchedCorrect / Mathf.Max(1, touchedCorrect + touchedIncorrect + missedTargets);
        float inhibition = (float)avoidedCorrect / Mathf.Max(1, avoidedCorrect + touchedIncorrect);
        float spatialMemory = Mathf.Clamp01(precision * (1f - (float)missedTargets / totalEvents));
        float switchBonus = Mathf.Clamp01(switchHits / 3f) * 0.1f;
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
