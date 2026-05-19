using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class CambioDeReglasGame : BaseGame
{
    private enum RuleKind
    {
        Color,
        Shape,
        Size,
        AvoidColor
    }

    private struct RuleData
    {
        public RuleKind kind;
        public int colorIndex;
        public SimpleShapeKind shape;
        public bool large;
        public string description;
    }

    private struct StimulusData
    {
        public int colorIndex;
        public SimpleShapeKind shape;
        public bool large;
        public int positionIndex;
    }

    private readonly Color[] stimulusColors =
    {
        new Color(0.18f, 0.78f, 0.42f, 1f),
        new Color(0.9f, 0.22f, 0.22f, 1f),
        new Color(0.22f, 0.48f, 0.95f, 1f),
        new Color(0.96f, 0.76f, 0.22f, 1f)
    };

    private readonly string[] colorNames = { "verde", "rojo", "azul", "amarillo" };
    private readonly SimpleShapeKind[] shapes =
    {
        SimpleShapeKind.Circle,
        SimpleShapeKind.Square,
        SimpleShapeKind.Triangle,
        SimpleShapeKind.Diamond
    };

    private readonly string[] shapeNames = { "circulo", "cuadrado", "triangulo", "rombo" };

    private RectTransform root;
    private RectTransform stimulusArea;
    private TextMeshProUGUI ruleText;
    private TextMeshProUGUI scoreText;
    private TextMeshProUGUI levelText;
    private TextMeshProUGUI feedbackText;
    private Image ruleBar;
    private Image stimulusBar;
    private SimpleShapeGraphic currentShape;
    private Button currentButton;

    private RuleData currentRule;
    private StimulusData currentStimulus;
    private bool currentShouldTouch;
    private bool gameActive;
    private bool gameFinished;
    private bool stimulusActive;

    private float ruleTimeTotal;
    private float ruleTimeLeft;
    private float stimulusTimeTotal;
    private float stimulusTimeLeft;
    private float nextStimulusDelay;
    private float lastRuleChangeTime;

    private int totalTrials;
    private int correctTrials;
    private int omissions;
    private int inhibitTrials;
    private int inhibitCorrect;
    private int postChangeTrials;
    private int postChangeCorrect;
    private int streak;
    private int bestStreak;
    private int maxLevelReached = 1;

    private void Awake()
    {
        nombre = "cambio-de-reglas";
    }

    private void Start()
    {
        RuntimeMiniGameUI.PrepareStaticScreens("Cambio de Reglas", "Clasifica segun la norma activa");
    }

    public override void ResetGame()
    {
        gameActive = true;
        gameFinished = false;
        stimulusActive = false;
        juegoPausado = false;

        totalTrials = 0;
        correctTrials = 0;
        omissions = 0;
        inhibitTrials = 0;
        inhibitCorrect = 0;
        postChangeTrials = 0;
        postChangeCorrect = 0;
        streak = 0;
        bestStreak = 0;
        maxLevelReached = 1;

        DifficultyManager.Instance?.ResetDifficulty(1);
        BuildUI();
        ChangeRule(true);
        ScheduleNextStimulus(0.25f);
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

        ruleTimeLeft -= delta;
        if (ruleTimeLeft <= 0f)
            ChangeRule(false);

        if (ruleBar != null)
            ruleBar.fillAmount = Mathf.Clamp01(ruleTimeLeft / Mathf.Max(0.01f, ruleTimeTotal));

        if (stimulusActive)
        {
            stimulusTimeLeft -= delta;
            if (stimulusBar != null)
                stimulusBar.fillAmount = Mathf.Clamp01(stimulusTimeLeft / Mathf.Max(0.01f, stimulusTimeTotal));

            if (stimulusTimeLeft <= 0f)
                RegisterResponse(false, stimulusTimeTotal);
        }
        else if (nextStimulusDelay > 0f)
        {
            nextStimulusDelay -= delta;
            if (nextStimulusDelay <= 0f)
                SpawnStimulus();
        }
    }

    private void BuildUI()
    {
        root = RuntimeMiniGameUI.CreateGameplayRoot(
            "CambioDeReglasRuntimeUI",
            "Cambio de Reglas",
            "Toca solo cuando el estimulo cumpla la norma actual");

        if (root == null)
            return;

        RectTransform hud = RuntimeMiniGameUI.CreatePanel("RulePanel", root, RuntimeMiniGameUI.Panel);
        RuntimeMiniGameUI.SetRect(hud, new Vector2(0.05f, 0.78f), new Vector2(0.95f, 0.91f), Vector2.zero, Vector2.zero);

        ruleText = RuntimeMiniGameUI.CreateText("RuleText", hud, "", 32f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Left);
        RuntimeMiniGameUI.SetRect(ruleText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 32f), new Vector2(-360f, -10f));

        levelText = RuntimeMiniGameUI.CreateText("LevelText", hud, "", 22f, RuntimeMiniGameUI.Accent, TextAlignmentOptions.Right);
        RuntimeMiniGameUI.SetRect(levelText.rectTransform, Vector2.zero, Vector2.one, new Vector2(0f, 56f), new Vector2(-28f, -12f));

        scoreText = RuntimeMiniGameUI.CreateText("ScoreText", hud, "", 22f, RuntimeMiniGameUI.MutedText, TextAlignmentOptions.Right);
        RuntimeMiniGameUI.SetRect(scoreText.rectTransform, Vector2.zero, Vector2.one, new Vector2(0f, 18f), new Vector2(-28f, -48f));

        Image ruleTrack = RuntimeMiniGameUI.CreateImage("RuleBarTrack", hud, new Color(1f, 1f, 1f, 0.08f));
        RuntimeMiniGameUI.SetRect(ruleTrack.rectTransform, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(28f, 10f), new Vector2(-28f, 20f));

        ruleBar = RuntimeMiniGameUI.CreateImage("RuleBarFill", ruleTrack.transform, RuntimeMiniGameUI.Accent);
        ruleBar.type = Image.Type.Filled;
        ruleBar.fillMethod = Image.FillMethod.Horizontal;
        RuntimeMiniGameUI.SetRect(ruleBar.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);

        stimulusArea = RuntimeMiniGameUI.CreatePanel("StimulusArea", root, RuntimeMiniGameUI.PanelSoft);
        RuntimeMiniGameUI.SetRect(stimulusArea, new Vector2(0.08f, 0.16f), new Vector2(0.92f, 0.74f), Vector2.zero, Vector2.zero);

        Image stimulusTrack = RuntimeMiniGameUI.CreateImage("StimulusBarTrack", stimulusArea, new Color(1f, 1f, 1f, 0.08f));
        RuntimeMiniGameUI.SetRect(stimulusTrack.rectTransform, new Vector2(0.12f, 0f), new Vector2(0.88f, 0f), new Vector2(0f, 24f), new Vector2(0f, 36f));

        stimulusBar = RuntimeMiniGameUI.CreateImage("StimulusBarFill", stimulusTrack.transform, RuntimeMiniGameUI.Good);
        stimulusBar.type = Image.Type.Filled;
        stimulusBar.fillMethod = Image.FillMethod.Horizontal;
        RuntimeMiniGameUI.SetRect(stimulusBar.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);

        currentShape = RuntimeMiniGameUI.CreateShape("StimulusShape", stimulusArea, SimpleShapeKind.Circle, stimulusColors[0]);
        currentButton = currentShape.gameObject.AddComponent<Button>();
        currentButton.targetGraphic = currentShape;
        currentButton.onClick.AddListener(OnStimulusPressed);
        currentShape.gameObject.SetActive(false);

        feedbackText = RuntimeMiniGameUI.CreateText("FeedbackText", root, "", 28f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Center);
        RuntimeMiniGameUI.SetRect(feedbackText.rectTransform, new Vector2(0.1f, 0.07f), new Vector2(0.9f, 0.14f), Vector2.zero, Vector2.zero);
    }

    private void ChangeRule(bool firstRule)
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        RuleData nextRule = CreateRuleForLevel(level);
        if (!firstRule)
        {
            int guard = 0;
            while (nextRule.description == currentRule.description && guard < 8)
            {
                nextRule = CreateRuleForLevel(level);
                guard++;
            }
        }

        currentRule = nextRule;
        ruleTimeTotal = Mathf.Lerp(6.5f, 2.8f, (level - 1f) / 9f);
        ruleTimeLeft = ruleTimeTotal;
        lastRuleChangeTime = Time.time;

        if (ruleText != null)
            ruleText.text = currentRule.description;

        if (stimulusActive)
            currentShouldTouch = ShouldTouch(currentStimulus);

        feedbackText.text = firstRule ? "Prepara la nueva norma" : "Norma cambiada";
        feedbackText.color = RuntimeMiniGameUI.Accent;
        UpdateHud();
    }

    private RuleData CreateRuleForLevel(int level)
    {
        RuleKind kind;
        int pool = level < 4 ? 2 : level < 7 ? 3 : 4;
        int roll = Random.Range(0, pool);

        if (roll == 0) kind = RuleKind.Color;
        else if (roll == 1) kind = RuleKind.Shape;
        else if (roll == 2) kind = RuleKind.Size;
        else kind = RuleKind.AvoidColor;

        RuleData rule = new RuleData
        {
            kind = kind,
            colorIndex = Random.Range(0, stimulusColors.Length),
            shape = shapes[Random.Range(0, shapes.Length)],
            large = Random.value > 0.5f
        };

        switch (kind)
        {
            case RuleKind.Color:
                rule.description = "Toca los " + colorNames[rule.colorIndex];
                break;
            case RuleKind.Shape:
                rule.description = "Toca " + ShapeName(rule.shape);
                break;
            case RuleKind.Size:
                rule.description = rule.large ? "Toca figuras grandes" : "Toca figuras pequenas";
                break;
            case RuleKind.AvoidColor:
                rule.description = "No toques los " + colorNames[rule.colorIndex];
                break;
        }

        return rule;
    }

    private void SpawnStimulus()
    {
        if (currentShape == null)
            return;

        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        stimulusTimeTotal = Mathf.Lerp(2.35f, 0.9f, (level - 1f) / 9f);
        stimulusTimeLeft = stimulusTimeTotal;

        bool shouldCreateTarget = Random.value < 0.55f;
        currentStimulus = CreateStimulusMatchingRule(shouldCreateTarget);
        currentShouldTouch = ShouldTouch(currentStimulus);

        RectTransform rect = currentShape.rectTransform;
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = currentStimulus.large ? new Vector2(190f, 190f) : new Vector2(128f, 128f);
        rect.anchoredPosition = PositionForIndex(currentStimulus.positionIndex);

        currentShape.SetShape(currentStimulus.shape, stimulusColors[currentStimulus.colorIndex]);
        currentShape.gameObject.SetActive(true);

        if (stimulusBar != null)
            stimulusBar.fillAmount = 1f;

        stimulusActive = true;
        feedbackText.text = currentShouldTouch ? "Pulsa" : "Espera";
        feedbackText.color = currentShouldTouch ? RuntimeMiniGameUI.Good : RuntimeMiniGameUI.MutedText;
    }

    private StimulusData CreateStimulusMatchingRule(bool shouldMatch)
    {
        StimulusData stimulus = RandomStimulus();

        if (shouldMatch)
            ForceMatch(ref stimulus);
        else
            ForceMismatch(ref stimulus);

        stimulus.positionIndex = Random.Range(0, 6);
        return stimulus;
    }

    private StimulusData RandomStimulus()
    {
        return new StimulusData
        {
            colorIndex = Random.Range(0, stimulusColors.Length),
            shape = shapes[Random.Range(0, shapes.Length)],
            large = Random.value > 0.5f,
            positionIndex = Random.Range(0, 6)
        };
    }

    private void ForceMatch(ref StimulusData stimulus)
    {
        switch (currentRule.kind)
        {
            case RuleKind.Color:
                stimulus.colorIndex = currentRule.colorIndex;
                break;
            case RuleKind.Shape:
                stimulus.shape = currentRule.shape;
                break;
            case RuleKind.Size:
                stimulus.large = currentRule.large;
                break;
            case RuleKind.AvoidColor:
                stimulus.colorIndex = DifferentColor(currentRule.colorIndex);
                break;
        }
    }

    private void ForceMismatch(ref StimulusData stimulus)
    {
        switch (currentRule.kind)
        {
            case RuleKind.Color:
                stimulus.colorIndex = DifferentColor(currentRule.colorIndex);
                break;
            case RuleKind.Shape:
                stimulus.shape = DifferentShape(currentRule.shape);
                break;
            case RuleKind.Size:
                stimulus.large = !currentRule.large;
                break;
            case RuleKind.AvoidColor:
                stimulus.colorIndex = currentRule.colorIndex;
                break;
        }
    }

    private bool ShouldTouch(StimulusData stimulus)
    {
        switch (currentRule.kind)
        {
            case RuleKind.Color:
                return stimulus.colorIndex == currentRule.colorIndex;
            case RuleKind.Shape:
                return stimulus.shape == currentRule.shape;
            case RuleKind.Size:
                return stimulus.large == currentRule.large;
            case RuleKind.AvoidColor:
                return stimulus.colorIndex != currentRule.colorIndex;
            default:
                return false;
        }
    }

    private void OnStimulusPressed()
    {
        if (!stimulusActive || gameFinished || juegoPausado)
            return;

        float reactionTime = Mathf.Clamp(stimulusTimeTotal - stimulusTimeLeft, 0f, stimulusTimeTotal);
        RegisterResponse(true, reactionTime);
    }

    private void RegisterResponse(bool pressed, float reactionTime)
    {
        if (!stimulusActive)
            return;

        stimulusActive = false;
        currentShape.gameObject.SetActive(false);

        bool correct = pressed == currentShouldTouch;
        totalTrials++;

        if (!currentShouldTouch)
        {
            inhibitTrials++;
            if (!pressed)
                inhibitCorrect++;
        }

        bool closeToRuleChange = Time.time - lastRuleChangeTime <= 1.4f;
        if (closeToRuleChange)
        {
            postChangeTrials++;
            if (correct)
                postChangeCorrect++;
        }

        if (correct)
        {
            correctTrials++;
            streak++;
            bestStreak = Mathf.Max(bestStreak, streak);
            feedbackText.text = pressed ? "Correcto" : "Inhibicion correcta";
            feedbackText.color = RuntimeMiniGameUI.Good;
            AudioManager.Instance?.Acierto();
        }
        else
        {
            streak = 0;
            if (!pressed && currentShouldTouch)
                omissions++;

            feedbackText.text = pressed ? "Era mejor esperar" : "Se escapo el objetivo";
            feedbackText.color = RuntimeMiniGameUI.Bad;
            AudioManager.Instance?.Error();
        }

        float precision = MetricUtils.Precision(correctTrials, totalTrials);
        float speedReward = correct ? Mathf.Clamp01(1f - reactionTime / Mathf.Max(0.1f, stimulusTimeTotal)) : 0f;
        DifficultyManager.Instance?.ActualizarDificultad(Mathf.Lerp(precision, speedReward, 0.35f), correct, reactionTime);

        UpdateHud();
        ScheduleNextStimulus(0.28f);
    }

    private void ScheduleNextStimulus(float delay)
    {
        nextStimulusDelay = delay;
    }

    private void UpdateHud()
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        if (levelText != null)
            levelText.text = "Nivel " + level;

        if (scoreText != null)
            scoreText.text = correctTrials + "/" + Mathf.Max(1, totalTrials) + "  Racha " + streak;
    }

    private Vector2 PositionForIndex(int index)
    {
        Vector2[] positions =
        {
            new Vector2(-330f, 120f),
            new Vector2(0f, 150f),
            new Vector2(330f, 110f),
            new Vector2(-250f, -95f),
            new Vector2(80f, -120f),
            new Vector2(340f, -75f)
        };

        return positions[Mathf.Abs(index) % positions.Length];
    }

    private int DifferentColor(int colorIndex)
    {
        int next = Random.Range(0, stimulusColors.Length - 1);
        return next >= colorIndex ? next + 1 : next;
    }

    private SimpleShapeKind DifferentShape(SimpleShapeKind shape)
    {
        int current = 0;
        for (int i = 0; i < shapes.Length; i++)
        {
            if (shapes[i] == shape)
            {
                current = i;
                break;
            }
        }

        int next = Random.Range(0, shapes.Length - 1);
        return shapes[next >= current ? next + 1 : next];
    }

    private string ShapeName(SimpleShapeKind shape)
    {
        for (int i = 0; i < shapes.Length; i++)
            if (shapes[i] == shape)
                return shapeNames[i];

        return "figura";
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
        stimulusActive = false;

        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics metrics = new CognitiveMetrics();
        if (totalTrials <= 0)
            return metrics;

        float precision = MetricUtils.Precision(correctTrials, totalTrials);
        float flexibility = postChangeTrials > 0 ? (float)postChangeCorrect / postChangeTrials : precision;
        float inhibition = inhibitTrials > 0 ? (float)inhibitCorrect / inhibitTrials : precision;
        float levelFactor = Mathf.Lerp(0.75f, 1f, Mathf.Clamp01(maxLevelReached / 10f));
        float planning = Mathf.Clamp01(precision * 0.65f + Mathf.Clamp01(bestStreak / 8f) * 0.35f);
        float spatial = Mathf.Clamp01((1f - (float)omissions / Mathf.Max(1, totalTrials)) * precision);

        metrics.flexibilidadCognitiva = Mathf.Clamp01(flexibility * levelFactor);
        metrics.controlInhibitorio = Mathf.Clamp01(inhibition * levelFactor);
        metrics.planificacion = Mathf.Clamp01(planning * levelFactor);
        metrics.memoriaEspacial = Mathf.Clamp01(spatial * levelFactor);
        return metrics;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics weighted = new CognitiveMetrics();
        weighted.flexibilidadCognitiva = metrics.flexibilidadCognitiva * 0.55f;
        weighted.controlInhibitorio = metrics.controlInhibitorio * 0.20f;
        weighted.planificacion = metrics.planificacion * 0.15f;
        weighted.memoriaEspacial = metrics.memoriaEspacial * 0.10f;
        return weighted;
    }
}
