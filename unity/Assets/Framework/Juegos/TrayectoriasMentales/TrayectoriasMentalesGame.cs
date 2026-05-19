using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class TrayectoriasMentalesGame : BaseGame
{
    private enum Phase
    {
        Planning,
        Executing,
        Feedback
    }

    private readonly Vector2Int[] directions =
    {
        Vector2Int.up,
        Vector2Int.right,
        Vector2Int.down,
        Vector2Int.left
    };

    private RectTransform root;
    private RectTransform boardPanel;
    private GridLayoutGroup boardGrid;
    private Image[] cells;
    private TextMeshProUGUI[] cellLabels;
    private TextMeshProUGUI phaseText;
    private TextMeshProUGUI sequenceText;
    private TextMeshProUGUI timerText;
    private TextMeshProUGUI levelText;
    private TextMeshProUGUI feedbackText;
    private Button upButton;
    private Button rightButton;
    private Button downButton;
    private Button leftButton;
    private Button undoButton;
    private Button clearButton;
    private Button runButton;

    private Phase phase;
    private bool gameActive;
    private bool gameFinished;
    private int boardSize;
    private bool[,] obstacles;
    private Vector2Int startCell;
    private Vector2Int targetCell;
    private Vector2Int ballCell;
    private List<Vector2Int> solutionMoves = new List<Vector2Int>();
    private List<Vector2Int> solutionPath = new List<Vector2Int>();
    private List<Vector2Int> plannedMoves = new List<Vector2Int>();
    private List<string> plannedCodes = new List<string>();

    private float planningTimeTotal;
    private float planningTimeLeft;
    private int maxCommands;
    private int maxLevelReached = 1;
    private Coroutine executionRoutine;

    private int attempts;
    private int successes;
    private int collisions;
    private int timeouts;
    private int totalCommandsUsed;
    private int totalOptimalCommands;
    private int totalExtraCommands;
    private float totalPlanningTime;
    private int bestStreak;
    private int currentStreak;

    private void Awake()
    {
        nombre = "trayectorias-mentales";
    }

    private void Start()
    {
        RuntimeMiniGameUI.PrepareStaticScreens("Trayectorias Mentales", "Programa la ruta antes de ejecutar");
    }

    public override void ResetGame()
    {
        if (executionRoutine != null)
            StopCoroutine(executionRoutine);

        gameActive = true;
        gameFinished = false;
        juegoPausado = false;
        attempts = 0;
        successes = 0;
        collisions = 0;
        timeouts = 0;
        totalCommandsUsed = 0;
        totalOptimalCommands = 0;
        totalExtraCommands = 0;
        totalPlanningTime = 0f;
        currentStreak = 0;
        bestStreak = 0;
        maxLevelReached = 1;

        DifficultyManager.Instance?.ResetDifficulty(1);
        BuildUI();
        GenerateRound();
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    private void Update()
    {
        if (!gameActive || gameFinished || juegoPausado)
            return;

        if (phase == Phase.Planning)
        {
            planningTimeLeft -= Time.deltaTime;
            if (planningTimeLeft <= 0f)
            {
                timeouts++;
                BeginExecution();
            }

            UpdateHud();
        }
    }

    private void BuildUI()
    {
        root = RuntimeMiniGameUI.CreateGameplayRoot(
            "TrayectoriasMentalesRuntimeUI",
            "Trayectorias Mentales",
            "Planifica una secuencia y observa la ejecucion automatica");

        if (root == null)
            return;

        RectTransform statusPanel = RuntimeMiniGameUI.CreatePanel("StatusPanel", root, RuntimeMiniGameUI.Panel);
        RuntimeMiniGameUI.SetRect(statusPanel, new Vector2(0.06f, 0.78f), new Vector2(0.94f, 0.91f), Vector2.zero, Vector2.zero);

        phaseText = RuntimeMiniGameUI.CreateText("PhaseText", statusPanel, "", 30f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Left);
        RuntimeMiniGameUI.SetRect(phaseText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 42f), new Vector2(-360f, -8f));

        sequenceText = RuntimeMiniGameUI.CreateText("SequenceText", statusPanel, "", 22f, RuntimeMiniGameUI.MutedText, TextAlignmentOptions.Left);
        RuntimeMiniGameUI.SetRect(sequenceText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 12f), new Vector2(-360f, -52f));

        levelText = RuntimeMiniGameUI.CreateText("LevelText", statusPanel, "", 22f, RuntimeMiniGameUI.Accent, TextAlignmentOptions.Right);
        RuntimeMiniGameUI.SetRect(levelText.rectTransform, Vector2.zero, Vector2.one, new Vector2(0f, 52f), new Vector2(-28f, -12f));

        timerText = RuntimeMiniGameUI.CreateText("TimerText", statusPanel, "", 22f, RuntimeMiniGameUI.MutedText, TextAlignmentOptions.Right);
        RuntimeMiniGameUI.SetRect(timerText.rectTransform, Vector2.zero, Vector2.one, new Vector2(0f, 16f), new Vector2(-28f, -52f));

        boardPanel = RuntimeMiniGameUI.CreatePanel("BoardPanel", root, RuntimeMiniGameUI.PanelSoft);
        RuntimeMiniGameUI.SetRect(boardPanel, new Vector2(0.07f, 0.13f), new Vector2(0.64f, 0.75f), Vector2.zero, Vector2.zero);
        boardGrid = boardPanel.gameObject.AddComponent<GridLayoutGroup>();
        boardGrid.childAlignment = TextAnchor.MiddleCenter;
        boardGrid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
        boardGrid.spacing = new Vector2(8f, 8f);

        RectTransform controlsPanel = RuntimeMiniGameUI.CreatePanel("ControlsPanel", root, RuntimeMiniGameUI.Panel);
        RuntimeMiniGameUI.SetRect(controlsPanel, new Vector2(0.68f, 0.13f), new Vector2(0.93f, 0.75f), Vector2.zero, Vector2.zero);

        upButton = RuntimeMiniGameUI.CreateButton("UpButton", controlsPanel, "UP", 20f, RuntimeMiniGameUI.Accent);
        RuntimeMiniGameUI.SetRect(upButton.GetComponent<RectTransform>(), new Vector2(0.32f, 0.70f), new Vector2(0.68f, 0.84f), Vector2.zero, Vector2.zero);
        upButton.onClick.AddListener(() => AddMove(Vector2Int.up, "U"));

        leftButton = RuntimeMiniGameUI.CreateButton("LeftButton", controlsPanel, "LEFT", 19f, RuntimeMiniGameUI.Accent);
        RuntimeMiniGameUI.SetRect(leftButton.GetComponent<RectTransform>(), new Vector2(0.08f, 0.52f), new Vector2(0.44f, 0.66f), Vector2.zero, Vector2.zero);
        leftButton.onClick.AddListener(() => AddMove(Vector2Int.left, "L"));

        rightButton = RuntimeMiniGameUI.CreateButton("RightButton", controlsPanel, "RIGHT", 19f, RuntimeMiniGameUI.Accent);
        RuntimeMiniGameUI.SetRect(rightButton.GetComponent<RectTransform>(), new Vector2(0.56f, 0.52f), new Vector2(0.92f, 0.66f), Vector2.zero, Vector2.zero);
        rightButton.onClick.AddListener(() => AddMove(Vector2Int.right, "R"));

        downButton = RuntimeMiniGameUI.CreateButton("DownButton", controlsPanel, "DOWN", 19f, RuntimeMiniGameUI.Accent);
        RuntimeMiniGameUI.SetRect(downButton.GetComponent<RectTransform>(), new Vector2(0.32f, 0.34f), new Vector2(0.68f, 0.48f), Vector2.zero, Vector2.zero);
        downButton.onClick.AddListener(() => AddMove(Vector2Int.down, "D"));

        undoButton = RuntimeMiniGameUI.CreateButton("UndoButton", controlsPanel, "BORRAR", 18f, RuntimeMiniGameUI.PanelSoft);
        RuntimeMiniGameUI.SetRect(undoButton.GetComponent<RectTransform>(), new Vector2(0.08f, 0.18f), new Vector2(0.44f, 0.30f), Vector2.zero, Vector2.zero);
        undoButton.onClick.AddListener(UndoMove);

        clearButton = RuntimeMiniGameUI.CreateButton("ClearButton", controlsPanel, "LIMPIAR", 18f, RuntimeMiniGameUI.PanelSoft);
        RuntimeMiniGameUI.SetRect(clearButton.GetComponent<RectTransform>(), new Vector2(0.56f, 0.18f), new Vector2(0.92f, 0.30f), Vector2.zero, Vector2.zero);
        clearButton.onClick.AddListener(ClearMoves);

        runButton = RuntimeMiniGameUI.CreateButton("RunButton", controlsPanel, "EJECUTAR", 21f, RuntimeMiniGameUI.Good);
        RuntimeMiniGameUI.SetRect(runButton.GetComponent<RectTransform>(), new Vector2(0.08f, 0.04f), new Vector2(0.92f, 0.14f), Vector2.zero, Vector2.zero);
        runButton.onClick.AddListener(BeginExecution);

        feedbackText = RuntimeMiniGameUI.CreateText("FeedbackText", root, "", 26f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Center);
        RuntimeMiniGameUI.SetRect(feedbackText.rectTransform, new Vector2(0.08f, 0.05f), new Vector2(0.92f, 0.11f), Vector2.zero, Vector2.zero);
    }

    private void GenerateRound()
    {
        if (gameFinished)
            return;

        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        boardSize = level < 4 ? 4 : level < 8 ? 5 : 6;
        int targetPathLength = Mathf.Clamp(3 + Mathf.RoundToInt(level * 0.55f), 3, 8);
        planningTimeTotal = Mathf.Lerp(14f, 5.5f, (level - 1f) / 9f);
        planningTimeLeft = planningTimeTotal;
        maxCommands = targetPathLength + 3;

        CreateSolvableBoard(targetPathLength, level);
        BuildBoardCells();

        plannedMoves.Clear();
        plannedCodes.Clear();
        ballCell = startCell;
        phase = Phase.Planning;
        feedbackText.text = "Programa todos los pasos antes de ejecutar";
        feedbackText.color = RuntimeMiniGameUI.MutedText;
        SetControlsInteractable(true);
        DrawBoard();
        UpdateHud();
    }

    private void CreateSolvableBoard(int targetPathLength, int level)
    {
        solutionMoves.Clear();
        solutionPath.Clear();

        int guard = 0;
        do
        {
            guard++;
            solutionMoves.Clear();
            solutionPath.Clear();
            startCell = new Vector2Int(Random.Range(0, boardSize), Random.Range(0, boardSize));
            Vector2Int current = startCell;
            solutionPath.Add(current);

            for (int i = 0; i < targetPathLength; i++)
            {
                List<Vector2Int> candidates = new List<Vector2Int>();
                for (int d = 0; d < directions.Length; d++)
                {
                    Vector2Int next = current + directions[d];
                    if (IsInside(next) && !solutionPath.Contains(next))
                        candidates.Add(directions[d]);
                }

                if (candidates.Count == 0)
                {
                    for (int d = 0; d < directions.Length; d++)
                    {
                        Vector2Int next = current + directions[d];
                        if (IsInside(next))
                            candidates.Add(directions[d]);
                    }
                }

                Vector2Int move = candidates[Random.Range(0, candidates.Count)];
                current += move;
                solutionMoves.Add(move);
                solutionPath.Add(current);
            }

            targetCell = current;
        }
        while (targetCell == startCell && guard < 20);

        obstacles = new bool[boardSize, boardSize];
        int obstacleTarget = Mathf.Clamp(level + 1, 2, boardSize * boardSize / 3);
        int placed = 0;
        int attemptsToPlace = 0;

        while (placed < obstacleTarget && attemptsToPlace < 200)
        {
            attemptsToPlace++;
            Vector2Int cell = new Vector2Int(Random.Range(0, boardSize), Random.Range(0, boardSize));
            if (cell == startCell || cell == targetCell || solutionPath.Contains(cell) || obstacles[cell.x, cell.y])
                continue;

            obstacles[cell.x, cell.y] = true;
            placed++;
        }
    }

    private void BuildBoardCells()
    {
        if (boardGrid == null)
            return;

        for (int i = boardPanel.childCount - 1; i >= 0; i--)
            Destroy(boardPanel.GetChild(i).gameObject);

        cells = new Image[boardSize * boardSize];
        cellLabels = new TextMeshProUGUI[boardSize * boardSize];
        boardGrid.constraintCount = boardSize;

        Canvas.ForceUpdateCanvases();
        float side = Mathf.Min(Mathf.Max(460f, boardPanel.rect.width), Mathf.Max(460f, boardPanel.rect.height));
        float cellSize = Mathf.Clamp((side - (boardSize - 1) * boardGrid.spacing.x - 36f) / boardSize, 58f, 112f);
        boardGrid.cellSize = new Vector2(cellSize, cellSize);

        for (int y = boardSize - 1; y >= 0; y--)
        {
            for (int x = 0; x < boardSize; x++)
            {
                GameObject cellObject = new GameObject("Cell_" + x + "_" + y, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
                cellObject.transform.SetParent(boardPanel, false);

                int index = IndexOf(new Vector2Int(x, y));
                cells[index] = cellObject.GetComponent<Image>();
                cells[index].color = new Color(0.14f, 0.22f, 0.26f, 1f);

                TextMeshProUGUI label = RuntimeMiniGameUI.CreateText("Label", cellObject.transform, "", 24f, RuntimeMiniGameUI.Text, TextAlignmentOptions.Center);
                RuntimeMiniGameUI.SetRect(label.rectTransform, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
                cellLabels[index] = label;
            }
        }
    }

    private void AddMove(Vector2Int direction, string code)
    {
        if (phase != Phase.Planning || plannedMoves.Count >= maxCommands || gameFinished)
            return;

        plannedMoves.Add(direction);
        plannedCodes.Add(code);
        AudioManager.Instance?.Click();
        DrawBoard();
        UpdateHud();
    }

    private void UndoMove()
    {
        if (phase != Phase.Planning || plannedMoves.Count == 0)
            return;

        int last = plannedMoves.Count - 1;
        plannedMoves.RemoveAt(last);
        plannedCodes.RemoveAt(last);
        DrawBoard();
        UpdateHud();
    }

    private void ClearMoves()
    {
        if (phase != Phase.Planning)
            return;

        plannedMoves.Clear();
        plannedCodes.Clear();
        DrawBoard();
        UpdateHud();
    }

    private void BeginExecution()
    {
        if (phase != Phase.Planning || gameFinished)
            return;

        if (plannedMoves.Count == 0)
        {
            RegisterAttempt(false, false, true);
            return;
        }

        if (executionRoutine != null)
            StopCoroutine(executionRoutine);

        executionRoutine = StartCoroutine(ExecuteRoutine());
    }

    private IEnumerator ExecuteRoutine()
    {
        phase = Phase.Executing;
        SetControlsInteractable(false);
        ballCell = startCell;
        feedbackText.text = "Ejecutando plan";
        feedbackText.color = RuntimeMiniGameUI.Accent;
        DrawBoard();

        yield return WaitGameSeconds(0.25f);

        bool hitObstacle = false;

        for (int i = 0; i < plannedMoves.Count; i++)
        {
            Vector2Int next = ballCell + plannedMoves[i];
            if (!IsInside(next) || IsObstacle(next))
            {
                hitObstacle = true;
                collisions++;
                feedbackText.text = "Choque en el paso " + (i + 1);
                feedbackText.color = RuntimeMiniGameUI.Bad;
                AudioManager.Instance?.Error();
                break;
            }

            ballCell = next;
            DrawBoard();
            yield return WaitGameSeconds(0.28f);
        }

        bool success = !hitObstacle && ballCell == targetCell;
        RegisterAttempt(success, hitObstacle, false);
        executionRoutine = null;
    }

    private void RegisterAttempt(bool success, bool hitObstacle, bool noPlan)
    {
        phase = Phase.Feedback;
        SetControlsInteractable(false);

        attempts++;
        totalCommandsUsed += plannedMoves.Count;
        totalOptimalCommands += Mathf.Max(1, solutionMoves.Count);
        totalExtraCommands += Mathf.Abs(plannedMoves.Count - solutionMoves.Count);
        totalPlanningTime += Mathf.Clamp(planningTimeTotal - planningTimeLeft, 0f, planningTimeTotal);

        if (success)
        {
            successes++;
            currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            feedbackText.text = "Objetivo alcanzado";
            feedbackText.color = RuntimeMiniGameUI.Good;
            AudioManager.Instance?.Acierto();
        }
        else
        {
            currentStreak = 0;
            if (noPlan)
                feedbackText.text = "Sin ruta programada";
            else if (!hitObstacle)
                feedbackText.text = "La ruta no llega al objetivo";
            feedbackText.color = RuntimeMiniGameUI.Bad;
            AudioManager.Instance?.Error();
        }

        float efficiency = plannedMoves.Count == 0
            ? 0f
            : Mathf.Clamp01((float)solutionMoves.Count / Mathf.Max(1, plannedMoves.Count));
        DifficultyManager.Instance?.ActualizarDificultad(success ? efficiency : 0f, success, planningTimeTotal - planningTimeLeft);

        DrawBoard();
        UpdateHud();
        StartCoroutine(NextRoundAfterDelay());
    }

    private IEnumerator NextRoundAfterDelay()
    {
        yield return WaitGameSeconds(0.85f);
        GenerateRound();
    }

    private IEnumerator WaitGameSeconds(float seconds)
    {
        float elapsed = 0f;
        while (elapsed < seconds && !gameFinished)
        {
            if (!juegoPausado)
                elapsed += Time.deltaTime;

            yield return null;
        }
    }

    private void DrawBoard()
    {
        if (cells == null || cellLabels == null)
            return;

        List<Vector2Int> preview = BuildPreviewPath(out Vector2Int previewCrash);

        for (int y = 0; y < boardSize; y++)
        {
            for (int x = 0; x < boardSize; x++)
            {
                Vector2Int cell = new Vector2Int(x, y);
                int index = IndexOf(cell);
                cells[index].color = new Color(0.14f, 0.22f, 0.26f, 1f);
                cellLabels[index].text = "";

                if (preview.Contains(cell))
                    cells[index].color = new Color(0.16f, 0.47f, 0.54f, 1f);

                if (IsObstacle(cell))
                {
                    cells[index].color = new Color(0.08f, 0.09f, 0.11f, 1f);
                    cellLabels[index].text = "X";
                }

                if (cell == targetCell)
                {
                    cells[index].color = new Color(0.95f, 0.72f, 0.18f, 1f);
                    cellLabels[index].text = "T";
                }

                if (cell == previewCrash)
                    cells[index].color = RuntimeMiniGameUI.Bad;

                Vector2Int visibleBall = phase == Phase.Executing ? ballCell : startCell;
                if (cell == visibleBall)
                {
                    cells[index].color = RuntimeMiniGameUI.Accent;
                    cellLabels[index].text = "B";
                }
            }
        }
    }

    private List<Vector2Int> BuildPreviewPath(out Vector2Int crashCell)
    {
        List<Vector2Int> preview = new List<Vector2Int>();
        crashCell = new Vector2Int(-100, -100);

        if (phase != Phase.Planning)
            return preview;

        Vector2Int current = startCell;
        for (int i = 0; i < plannedMoves.Count; i++)
        {
            Vector2Int next = current + plannedMoves[i];
            if (!IsInside(next) || IsObstacle(next))
            {
                crashCell = IsInside(next) ? next : current;
                break;
            }

            current = next;
            preview.Add(current);
        }

        return preview;
    }

    private void UpdateHud()
    {
        int level = Mathf.Clamp(DifficultyManager.Instance?.nivelActual ?? 1, 1, 10);
        maxLevelReached = Mathf.Max(maxLevelReached, level);

        if (phaseText != null)
            phaseText.text = phase == Phase.Planning ? "Planificacion" : phase == Phase.Executing ? "Ejecucion" : "Resultado";

        if (sequenceText != null)
            sequenceText.text = plannedCodes.Count == 0 ? "Ruta: -" : "Ruta: " + string.Join(" ", plannedCodes) + "  (" + plannedCodes.Count + "/" + maxCommands + ")";

        if (timerText != null)
            timerText.text = "Plan: " + Mathf.Max(0, Mathf.CeilToInt(planningTimeLeft)) + "s";

        if (levelText != null)
            levelText.text = "Nivel " + level + "  " + successes + "/" + Mathf.Max(1, attempts);
    }

    private void SetControlsInteractable(bool interactable)
    {
        if (upButton != null) upButton.interactable = interactable;
        if (rightButton != null) rightButton.interactable = interactable;
        if (downButton != null) downButton.interactable = interactable;
        if (leftButton != null) leftButton.interactable = interactable;
        if (undoButton != null) undoButton.interactable = interactable;
        if (clearButton != null) clearButton.interactable = interactable;
        if (runButton != null) runButton.interactable = interactable;
    }

    private bool IsInside(Vector2Int cell)
    {
        return cell.x >= 0 && cell.y >= 0 && cell.x < boardSize && cell.y < boardSize;
    }

    private bool IsObstacle(Vector2Int cell)
    {
        return IsInside(cell) && obstacles != null && obstacles[cell.x, cell.y];
    }

    private int IndexOf(Vector2Int cell)
    {
        return cell.y * boardSize + cell.x;
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
        if (executionRoutine != null)
            StopCoroutine(executionRoutine);

        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics metrics = new CognitiveMetrics();
        if (attempts <= 0)
            return metrics;

        float precision = MetricUtils.Precision(successes, attempts);
        float efficiency = 1f - Mathf.Clamp01((float)totalExtraCommands / Mathf.Max(1, totalCommandsUsed + totalOptimalCommands));
        float spatial = 1f - Mathf.Clamp01((float)collisions / attempts);
        float timing = 1f - Mathf.Clamp01((totalPlanningTime / attempts) / 14f);
        float workingMemory = Mathf.Clamp01(efficiency * 0.65f + Mathf.Clamp01(bestStreak / 4f) * 0.35f);
        float sustained = Mathf.Clamp01(precision * Mathf.Clamp01(attempts / 5f) * (1f - (float)timeouts / Mathf.Max(1, attempts)));
        float levelFactor = Mathf.Lerp(0.75f, 1f, Mathf.Clamp01(maxLevelReached / 10f));

        metrics.planificacion = Mathf.Clamp01(precision * (efficiency * 0.85f + timing * 0.15f) * levelFactor);
        metrics.memoriaTrabajo = Mathf.Clamp01(workingMemory * precision * levelFactor);
        metrics.memoriaEspacial = Mathf.Clamp01(spatial * precision * levelFactor);
        metrics.atencionSostenida = Mathf.Clamp01(sustained * levelFactor);
        return metrics;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics metrics)
    {
        CognitiveMetrics weighted = new CognitiveMetrics();
        weighted.planificacion = metrics.planificacion * 0.60f;
        weighted.memoriaTrabajo = metrics.memoriaTrabajo * 0.20f;
        weighted.memoriaEspacial = metrics.memoriaEspacial * 0.15f;
        weighted.atencionSostenida = metrics.atencionSostenida * 0.05f;
        return weighted;
    }
}
