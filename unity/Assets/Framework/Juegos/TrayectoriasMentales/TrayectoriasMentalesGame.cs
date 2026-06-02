using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TrayectoriasMentalesGame : BaseGame
{
    private enum Phase { Planning, Executing, Feedback }
    private enum BoxSide { Top, Right, Bottom, Left }
    private enum ExecutionFailReason { None, Trap, WrongBounceCount, NoExit }
    private enum PowerUpType { ExtraBounce, ExtraLife }

    private enum RoomShape { Rectangle, LShape, TShape, Corridor, BigRoom }
    private RoomShape currentShape;
    private List<Vector2> shapeVertices = new List<Vector2>();

    private class Trap
    {
        public RectTransform rect;
        public Image image;
    }

    private class PowerUp
    {
        public RectTransform rect;
        public Image image;
        public PowerUpType type;
        public bool collected;
    }

    // ============================================================
    // INSPECTOR
    // ============================================================

    [Header("Referencias")]
    public UITrayectoriasMentales ui;
    public RectTransform playArea;

    [Header("Dificultad")]
    public int nivelInicial = 1;
    public int nivelMaximo = 10;
    public int intentosMaximos = 3;
    public int pruebasParaSubirNivel = 2;
    public int trampasNivel1 = 0;
    public int trampasNivel10 = 5;
    public int paredesInternasNivel1 = 0;
    public int paredesInternasNivel10 = 4;
    public int rebotesObjetivoNivel1 = 1;
    public int rebotesExtraPorNivel = 1;
    public int rebotesMaximos = 5;
    public float largoSalidaBase = 150f;
    public float largoSalidaExtraPorRebote = 38f;
    public float largoSalidaMin = 150f;
    public float largoSalidaMax = 340f;
    [Range(0.35f, 1f)] public float escalaCajaNivel1 = 0.52f;
    [Range(0.35f, 1f)] public float escalaCajaNivel10 = 0.92f;

    [Header("Formas de caja")]
    public int MAX_INTENTOS = 10;
    public bool usarFormasVariadas = true;

    [Header("Movimiento")]
    public float velocidadRata = 650f;
    public float duracionMaximaEjecucion = 11f;
    public float radioRata = 18f;
    public float escalaVisualRata = 2.25f;
    public float grosorPared = 18f;

    [Header("Sprites")]
    public Sprite spritePared;
    public Sprite spriteRata;
    public Sprite spriteTrampa;
    public Sprite spritePowerUpBounce;
    public Sprite spritePowerUpLife;
    public Sprite spriteSalida; // Sprite para marcar la salida

    public float pixelsPerUnit = 100f;
    public float escalaSpritePared = 8f;

    [Header("Colores Juego")]
    public Color colorSalida = new Color(0.56f, 0.92f, 0.45f, 1f);
    public Color colorRata = new Color(0.72f, 0.72f, 0.68f, 1f);
    public Color colorTrampa = new Color(0.74f, 0.24f, 0.18f, 1f);
    public Color colorTrayectoria = new Color(0.64f, 0.90f, 1f, 0.86f);
    public Color colorSolucionDebug = new Color(1f, 0.82f, 0.22f, 0.92f);
    public Color colorPowerUpBounce = new Color(1f, 0.84f, 0f, 1f);
    public Color colorPowerUpLife = new Color(0.2f, 0.9f, 0.3f, 1f);

    [Header("Vista previa")]
    public bool mostrarSolucionDebug = false;
    public int rebotesPreviewNivelBajo = 3;
    public int rebotesPreviewNivelMedio = 2;
    public int pasosTrasReboteBajo = 25;
    public int pasosTrasReboteMedio = 18;
    public int pasosTrasReboteAlto = 12;

    // ============================================================
    // ESTADO INTERNO
    // ============================================================

    private RectTransform wallLayer, trapLayer, powerUpLayer, trajectoryLayer;
    private RectTransform ratRect;
    private Graphic ratGraphic;

    private GameObject exitMarker; // Añade esta variable al inicio de la clase

    private AudioManager audioManager => AudioManager.Instance;
    private bool simulationSilent = false;
    private int simulationTargetBounces;


    private readonly List<Trap> traps = new List<Trap>();
    private readonly List<PowerUp> powerUps = new List<PowerUp>();
    private readonly List<RectTransform> trajectoryDots = new List<RectTransform>();
    private readonly List<RectTransform> walls = new List<RectTransform>();
    private readonly List<RectTransform> internalWalls = new List<RectTransform>();
    private readonly List<Vector2> solutionPath = new List<Vector2>();

    private Phase phase;
    private bool gameActive, gameFinished;
    private int requiredBounces, originalRequiredBounces;
    private float exitLength, currentBoxScale = 1f;
    private BoxSide exitSide;
    private float exitCenter;
    private int maxLevelReached = 1;
    private Vector2 ratStart, ratPosition;
    private Vector2 aimDirection = Vector2.right;
    private Vector2 currentMoveDirection = Vector2.right;
    private Vector2 lastPointerLocal = new Vector2(float.NaN, float.NaN);
    private Coroutine executionRoutine;
    private bool regenerateAfterFeedback = true;

    private int attempts, successes, trapHits, wrongBounceFails, noExitFails;
    private int currentStreak, bestStreak, currentLevel, remainingAttempts, successesInCurrentLevel;
    private int totalRequiredBounces, totalUsedBounces;
    private float totalExitDistanceScore;
    private bool bouncePowerUpCollected;

    private float spriteWidth, spriteHeight;
    private Rect _cachedBounds;
    private bool _boundsCached;

    // ============================================================
    // CICLO DE VIDA
    // ============================================================

    private void Awake()
    {
        nombre = "Trayectorias Mentales";
        if (spritePared != null)
        {
            spriteWidth = (spritePared.rect.width / pixelsPerUnit) * escalaSpritePared;
            spriteHeight = (spritePared.rect.height / pixelsPerUnit) * escalaSpritePared;
        }
        else { spriteWidth = 2f * escalaSpritePared; spriteHeight = 0.7f * escalaSpritePared; }


    }

    public override void ResetGame()
    {
        if (executionRoutine != null) StopCoroutine(executionRoutine);
        gameActive = true;
        gameFinished = false;
        juegoPausado = false;
        regenerateAfterFeedback = true;
        attempts = successes = trapHits = wrongBounceFails = noExitFails = 0;
        currentStreak = bestStreak = 0;
        currentLevel = Mathf.Clamp(nivelInicial, 1, nivelMaximo);
        remainingAttempts = Mathf.Max(1, intentosMaximos);
        successesInCurrentLevel = 0;
        totalRequiredBounces = totalUsedBounces = 0;
        totalExitDistanceScore = 0f;
        maxLevelReached = currentLevel;
        bouncePowerUpCollected = false;
        DifficultyManager.Instance?.ResetDifficulty(currentLevel);
        SyncDifficultyLevel();
        DisableGenericTimer();
        ui?.ResetPowerUps();
        BuildGameObjects();
        GenerateRound();

        // Ocultar pantalla de carga al iniciar
        if (ui != null && ui.loadingScreen != null)
            ui.loadingScreen.SetActive(false);

    }

    public override void OnGameStart() => ResetGame();

    private void Update()
    {
        DisableGenericTimer();
        if (gameActive && !gameFinished && !juegoPausado) AnimateRat();
        if (!gameActive || gameFinished || juegoPausado || phase != Phase.Planning) return;
        UpdateAimFromPointer();
        if (Input.GetMouseButtonDown(0) && PointerInsidePlayArea()) BeginExecution();
        if (Input.GetKeyDown(KeyCode.D))
        {
            mostrarSolucionDebug = !mostrarSolucionDebug;
            DrawTrajectory();
        }
    }

    // ============================================================
    // CONSTRUCCIÓN DE OBJETOS DE JUEGO
    // ============================================================

    private void BuildGameObjects()
    {
        if (playArea == null) return;
        for (int i = playArea.childCount - 1; i >= 0; i--)
            Destroy(playArea.GetChild(i).gameObject);
        wallLayer = CreateLayer("WallLayer");
        trapLayer = CreateLayer("TrapLayer");
        powerUpLayer = CreateLayer("PowerUpLayer");
        trajectoryLayer = CreateLayer("TrajectoryLayer");
        GameObject ratObj = new GameObject("Rata", typeof(RectTransform), typeof(CanvasRenderer));
        ratObj.transform.SetParent(playArea, false);
        ratRect = ratObj.GetComponent<RectTransform>();
        Image img = ratObj.AddComponent<Image>();
        if (spriteRata != null) { img.sprite = spriteRata; img.color = Color.white; img.preserveAspect = true; }
        else img.color = colorRata;
        ratGraphic = img;
        ratGraphic.raycastTarget = false;
        walls.Clear();
        internalWalls.Clear();
        traps.Clear();
        powerUps.Clear();
    }

    private RectTransform CreateLayer(string name)
    {
        GameObject obj = new GameObject(name, typeof(RectTransform));
        obj.transform.SetParent(playArea, false);
        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
        return rect;
    }

    // ============================================================
    // GENERACIÓN DE NIVEL
    // ============================================================

    private void GenerateRound()
    {
        if (gameFinished || playArea == null) return;
        int level = CurrentLevel();
        maxLevelReached = Mathf.Max(maxLevelReached, level);
        phase = Phase.Planning;
        requiredBounces = RequiredBouncesForLevel(level);
        originalRequiredBounces = requiredBounces;
        currentBoxScale = BoxScaleForLevel(level);
        exitLength = ExitLengthForBounces(requiredBounces);
        bouncePowerUpCollected = false;
        _boundsCached = false;
        Canvas.ForceUpdateCanvases();

        bool generated = false;
        for (int gen = 0; gen < 15 && !generated; gen++)
        {
            ClearTraps();
            ClearPowerUps();
            ClearTrajectory();
            ClearWalls();
            SetupLevelGeometry();
            BuildMazeWalls(InternalWallCountForLevel(level));

            if (!TryFindSolvableAim(out aimDirection, requiredBounces, 0))
                continue;
            List<Vector2> pathNormal = new List<Vector2>(solutionPath);

            List<Vector2> pathPU = null;
            // 4. Colocar PowerUps
            int puCount = PowerUpCountForLevel(level);


            if (puCount >= 1 && pathNormal.Count > 3)
            {
                List<PowerUpType> puTypes = new List<PowerUpType>();

                if (puCount == 1)
                {
                    puTypes.Add(Random.value > 0.5f ? PowerUpType.ExtraBounce : PowerUpType.ExtraLife);
                }
                else
                {
                    puTypes.Add(PowerUpType.ExtraBounce);
                    puTypes.Add(PowerUpType.ExtraLife);
                }

                foreach (PowerUpType puType in puTypes)
                {
                    if (puType == PowerUpType.ExtraLife)
                    {
                        PlacePowerUpOnPath(pathNormal, PowerUpType.ExtraLife);
                    }
                    else // ExtraBounce
                    {
                        if (requiredBounces < rebotesMaximos)
                        {
                            if (TryFindSolvableAim(out Vector2 puDir, requiredBounces + 1, 0))
                            {
                                pathPU = new List<Vector2>(solutionPath);

                                if (pathPU.Count > 3)
                                {
                                    PlacePowerUpOnPath(pathPU, PowerUpType.ExtraBounce);
                                }
                            }
                        }
                    }
                }
            }
            solutionPath.Clear();
            solutionPath.AddRange(pathNormal);
            TryFindSolvableAim(out aimDirection, requiredBounces, 0);
            generated = true;
        }

        if (!generated) CreateFallbackLevel();
        PositionRat();
        UpdateAimFromPointer(true);
        ui?.HideFeedback();
        UpdateHud();
        DrawTrajectory();
    }

    private void CreateExitMarker()
    {
        // Destruir marcador anterior si existe
        if (exitMarker != null)
        {
            Destroy(exitMarker);
            exitMarker = null;
        }

        if (spriteSalida == null) return;

        Rect bounds = PlayBounds();
        Vector2 exitPos = ExitPoint();

        switch (exitSide)
        {
            case BoxSide.Top:
                exitPos = new Vector2(exitCenter, bounds.yMax + 20f);
                break;
            case BoxSide.Bottom:
                exitPos = new Vector2(exitCenter, bounds.yMin - 20f);
                break;
            case BoxSide.Right:
                exitPos = new Vector2(bounds.xMax + 20f, exitCenter);
                break;
            case BoxSide.Left:
                exitPos = new Vector2(bounds.xMin - 20f, exitCenter);
                break;
        }

        exitMarker = new GameObject("ExitMarker", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        exitMarker.transform.SetParent(playArea, false);
        Image img = exitMarker.GetComponent<Image>();
        img.sprite = spriteSalida;
        img.color = colorSalida;
        img.preserveAspect = true;
        img.raycastTarget = false;

        RectTransform rt = exitMarker.GetComponent<RectTransform>();
        rt.anchorMin = rt.anchorMax = rt.pivot = new Vector2(0.5f, 0.5f);
        rt.anchoredPosition = exitPos;
        rt.sizeDelta = new Vector2(exitLength * 0.5f, exitLength * 0.5f);

        float rot = exitSide switch
        {
            BoxSide.Top => 180f,
            BoxSide.Bottom => 0f,
            BoxSide.Left => 90f,
            BoxSide.Right => -90f,
            _ => 0f
        };
        rt.localRotation = Quaternion.Euler(0, 0, rot);
    }

    private void PlacePowerUpOnPath(List<Vector2> path, PowerUpType type)
    {
        if (path.Count < 3)
        {
            return;
        }

        // Intentar colocar en la ruta
        for (int attempt = 0; attempt < 30; attempt++)
        {
            int idx = Random.Range(path.Count / 4, path.Count * 3 / 4);
            Vector2 pos = path[idx] + RandomOffset(15f);

            if (!IsPointInsideShape(pos)) continue;
            Rect r = CreateRect(pos, new Vector2(50f, 50f));
            if (OverlapsAnyInternalWall(r)) continue;
            if (AnyOverlap(r)) continue;

            CreatePowerUpObject(pos, new Vector2(50f, 50f), type);
            return;
        }

        // Fallback: punto medio
        Vector2 fallback = path[path.Count / 2];
        CreatePowerUpObject(fallback, new Vector2(50f, 50f), type);
    }

    private void CreatePowerUpObject(Vector2 pos, Vector2 size, PowerUpType type)
    {
        Sprite s = type == PowerUpType.ExtraBounce ? spritePowerUpBounce : spritePowerUpLife;
        

        GameObject obj = new GameObject("PowerUp", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(powerUpLayer, false);
        PowerUp pu = new PowerUp { rect = obj.GetComponent<RectTransform>(), image = obj.GetComponent<Image>(), type = type };
        pu.rect.anchorMin = pu.rect.anchorMax = pu.rect.pivot = new Vector2(0.5f, 0.5f);
        pu.rect.anchoredPosition = pos;
        pu.rect.sizeDelta = size;
        pu.image.raycastTarget = false;
        if (s != null) { pu.image.sprite = s; pu.image.color = Color.white; pu.image.preserveAspect = true; }
        else pu.image.color = type == PowerUpType.ExtraBounce ? colorPowerUpBounce : colorPowerUpLife;
        pu.image.enabled = true;
        pu.rect.SetAsLastSibling();
        powerUps.Add(pu);
    }

    // ============================================================
    // GEOMETRÍA Y PAREDES
    // ============================================================

    private void SetupLevelGeometry()
    {
        ClearWalls();
        solutionPath.Clear();
        Rect bounds = PlayBounds();
        exitLength = ExitLengthForBounces(requiredBounces);
        GenerateRoomShape();
        ChooseExitEdge(bounds);
        CreateOuterWalls(bounds);
        PositionRatStart(bounds);
        CreateExitMarker(); // AÑADIR ESTA LÍNEA
    }

    private void ChooseExitEdge(Rect bounds)
    {
        List<int> candidateEdges = new List<int>();
        for (int i = 0; i < shapeVertices.Count; i++)
        {
            Vector2 start = shapeVertices[i];
            Vector2 end = shapeVertices[(i + 1) % shapeVertices.Count];
            bool onTop = Mathf.Abs(start.y - bounds.yMax) < 5f && Mathf.Abs(end.y - bounds.yMax) < 5f;
            bool onBottom = Mathf.Abs(start.y - bounds.yMin) < 5f && Mathf.Abs(end.y - bounds.yMin) < 5f;
            bool onRight = Mathf.Abs(start.x - bounds.xMax) < 5f && Mathf.Abs(end.x - bounds.xMax) < 5f;
            bool onLeft = Mathf.Abs(start.x - bounds.xMin) < 5f && Mathf.Abs(end.x - bounds.xMin) < 5f;
            if (!onTop && !onBottom && !onRight && !onLeft) continue;
            float length = Vector2.Distance(start, end);
            if (length >= exitLength * 1.2f) candidateEdges.Add(i);
        }
        if (candidateEdges.Count == 0)
        {
            currentShape = RoomShape.BigRoom;
            GenerateRoomShape();
            for (int i = 0; i < shapeVertices.Count; i++)
                if (Vector2.Distance(shapeVertices[i], shapeVertices[(i + 1) % shapeVertices.Count]) >= exitLength * 1.2f)
                    candidateEdges.Add(i);
            if (candidateEdges.Count == 0) candidateEdges.Add(0);
        }
        int chosenEdge = candidateEdges[Random.Range(0, candidateEdges.Count)];
        Vector2 edgeStart = shapeVertices[chosenEdge];
        Vector2 edgeEnd = shapeVertices[(chosenEdge + 1) % shapeVertices.Count];
        if (Mathf.Abs(edgeStart.y - bounds.yMax) < 5f) exitSide = BoxSide.Top;
        else if (Mathf.Abs(edgeStart.y - bounds.yMin) < 5f) exitSide = BoxSide.Bottom;
        else if (Mathf.Abs(edgeStart.x - bounds.xMax) < 5f) exitSide = BoxSide.Right;
        else exitSide = BoxSide.Left;
        bool horizontal = exitSide == BoxSide.Top || exitSide == BoxSide.Bottom;
        float margin = exitLength * 0.5f;
        float minCoord = horizontal ? Mathf.Min(edgeStart.x, edgeEnd.x) + margin : Mathf.Min(edgeStart.y, edgeEnd.y) + margin;
        float maxCoord = horizontal ? Mathf.Max(edgeStart.x, edgeEnd.x) - margin : Mathf.Max(edgeStart.y, edgeEnd.y) - margin;
        exitCenter = Random.Range(minCoord, maxCoord);
    }

    private void PositionRatStart(Rect bounds)
    {
        float margin = radioRata + spriteWidth;
        Vector2 exitPoint = ExitPoint();
        for (int attempt = 0; attempt < 100; attempt++)
        {
            float x = Random.Range(bounds.xMin + margin, bounds.xMax - margin);
            float y = Random.Range(bounds.yMin + margin, bounds.yMax - margin);
            Vector2 candidate = new Vector2(x, y);
            if (!IsPointInsideShape(candidate)) continue;
            if (Vector2.Distance(candidate, exitPoint) < bounds.width * 0.25f) continue;
            if (IsOverlappingWall(candidate)) continue;
            ratStart = candidate;
            ratPosition = candidate;
            return;
        }
        Vector2 centroid = Vector2.zero;
        foreach (Vector2 v in shapeVertices) centroid += v;
        centroid /= shapeVertices.Count;
        if (IsPointInsideShape(centroid) && !IsOverlappingWall(centroid))
        { ratStart = centroid; ratPosition = centroid; return; }
        ratStart = new Vector2(bounds.xMin + margin * 2, bounds.yMin + margin * 2);
        ratPosition = ratStart;
    }

    private bool IsOverlappingWall(Vector2 point)
    {
        foreach (var wall in walls)
        {
            Rect r = CreateExpandedRect(wall.anchoredPosition, WallCollisionSize(wall), radioRata + 5f);
            if (r.Contains(point)) return true;
        }
        return false;
    }

    private void CreateOuterWalls(Rect bounds)
    {
        float half = exitLength * 0.5f;
        for (int i = 0; i < shapeVertices.Count; i++)
        {
            Vector2 start = shapeVertices[i];
            Vector2 end = shapeVertices[(i + 1) % shapeVertices.Count];
            bool vertical = Mathf.Abs(start.x - end.x) < 1f;
            float gapCenter = float.NaN;
            bool isExit = false;
            switch (exitSide)
            {
                case BoxSide.Top: isExit = Mathf.Abs(start.y - bounds.yMax) < 5f && Mathf.Abs(end.y - bounds.yMax) < 5f; break;
                case BoxSide.Bottom: isExit = Mathf.Abs(start.y - bounds.yMin) < 5f && Mathf.Abs(end.y - bounds.yMin) < 5f; break;
                case BoxSide.Right: isExit = Mathf.Abs(start.x - bounds.xMax) < 5f && Mathf.Abs(end.x - bounds.xMax) < 5f; break;
                case BoxSide.Left: isExit = Mathf.Abs(start.x - bounds.xMin) < 5f && Mathf.Abs(end.x - bounds.xMin) < 5f; break;
            }
            if (isExit) gapCenter = exitCenter;
            CreateWallLine(start.x, start.y, end.x, end.y, vertical, gapCenter, half);
        }
    }

    private void GenerateRoomShape()
    {
        currentShape = usarFormasVariadas ? (RoomShape)Random.Range(0, 5) : RoomShape.BigRoom;
        shapeVertices.Clear();
        Rect bounds = PlayBounds();
        float xMin = bounds.xMin, xMax = bounds.xMax, yMin = bounds.yMin, yMax = bounds.yMax;
        float w = bounds.width, h = bounds.height;
        switch (currentShape)
        {
            case RoomShape.LShape:
                float lCutX = xMin + w * 0.65f, lCutY = yMin + h * 0.65f;
                shapeVertices.Add(new Vector2(xMin, yMax)); shapeVertices.Add(new Vector2(lCutX, yMax));
                shapeVertices.Add(new Vector2(lCutX, lCutY)); shapeVertices.Add(new Vector2(xMax, lCutY));
                shapeVertices.Add(new Vector2(xMax, yMin)); shapeVertices.Add(new Vector2(xMin, yMin));
                break;
            case RoomShape.TShape:
                float tMidY = yMin + h * 0.55f, tArmW = w * 0.35f, tMidX = xMin + w * 0.5f;
                shapeVertices.Add(new Vector2(tMidX - tArmW, yMax)); shapeVertices.Add(new Vector2(tMidX + tArmW, yMax));
                shapeVertices.Add(new Vector2(tMidX + tArmW, tMidY)); shapeVertices.Add(new Vector2(xMax, tMidY));
                shapeVertices.Add(new Vector2(xMax, yMin)); shapeVertices.Add(new Vector2(xMin, yMin));
                shapeVertices.Add(new Vector2(xMin, tMidY)); shapeVertices.Add(new Vector2(tMidX - tArmW, tMidY));
                break;
            case RoomShape.Corridor:
                if (Random.value > 0.5f)
                {
                    float corrH = h * 0.65f, corrY = yMin + h * 0.175f;
                    shapeVertices.Add(new Vector2(xMin, corrY + corrH)); shapeVertices.Add(new Vector2(xMax, corrY + corrH));
                    shapeVertices.Add(new Vector2(xMax, corrY)); shapeVertices.Add(new Vector2(xMin, corrY));
                }
                else
                {
                    float corrW = w * 0.65f, corrX = xMin + w * 0.175f;
                    shapeVertices.Add(new Vector2(corrX, yMax)); shapeVertices.Add(new Vector2(corrX + corrW, yMax));
                    shapeVertices.Add(new Vector2(corrX + corrW, yMin)); shapeVertices.Add(new Vector2(corrX, yMin));
                }
                break;
            default:
                shapeVertices.Add(new Vector2(xMin, yMax)); shapeVertices.Add(new Vector2(xMax, yMax));
                shapeVertices.Add(new Vector2(xMax, yMin)); shapeVertices.Add(new Vector2(xMin, yMin));
                break;
        }
    }

    private void CreateWallLine(float x1, float y1, float x2, float y2, bool vertical, float gapCenter, float gapHalf)
    {
        float total = vertical ? Mathf.Abs(y2 - y1) : Mathf.Abs(x2 - x1);
        float dir = vertical ? Mathf.Sign(y2 - y1) : Mathf.Sign(x2 - x1);
        float ox = x1, oy = y1;
        int count = 0;
        float blockSize = vertical ? spriteHeight : spriteWidth;
        if (float.IsNaN(gapCenter))
        {
            PlaceWallRun(ox, oy, dir, vertical, 0f, total, blockSize, ref count);
            return;
        }
        float gapStartLocal = gapCenter - gapHalf - (vertical ? y1 : x1);
        float gapEndLocal = gapCenter + gapHalf - (vertical ? y1 : x1);
        gapStartLocal = Mathf.Clamp(gapStartLocal, 0, total);
        gapEndLocal = Mathf.Clamp(gapEndLocal, 0, total);
        PlaceWallRun(ox, oy, dir, vertical, 0f, gapStartLocal, blockSize, ref count);
        PlaceWallRun(ox, oy, dir, vertical, gapEndLocal, total, blockSize, ref count);
    }

    private void PlaceWallRun(float ox, float oy, float dir, bool vertical, float start, float end, float blockSize, ref int count)
    {
        if (end - start <= 1f) return;
        float pos = start;
        while (pos + blockSize <= end + 0.01f)
        {
            PlaceWallBlock(ox, oy, dir, vertical, pos, count++);
            pos += blockSize;
        }
    }

    private void PlaceWallBlock(float ox, float oy, float dir, bool vertical, float offset, int index)
    {
        float halfBlock = (vertical ? spriteHeight : spriteWidth) * 0.5f;
        Vector2 center = vertical ? new Vector2(ox, oy + dir * (offset + halfBlock)) : new Vector2(ox + dir * (offset + halfBlock), oy);
        Vector2 blockSize = new Vector2(spriteWidth, spriteHeight);
        GameObject obj = new GameObject("Pared", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(wallLayer, false);
        Image img = obj.GetComponent<Image>();
        img.sprite = spritePared; img.color = Color.white; img.preserveAspect = false; img.type = Image.Type.Simple; img.raycastTarget = false;
        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = center;
        rect.sizeDelta = blockSize;
        rect.localRotation = Quaternion.Euler(0, 0, (vertical ? 90f : 0f));
        walls.Add(rect);
        internalWalls.Add(rect);
    }

    private void BuildMazeWalls(int count)
    {
        count = Mathf.Clamp(count, 0, 10);
        Rect bounds = PlayBounds();
        int placed = 0, guard = 0;
        while (placed < count && guard < 150)
        {
            guard++;
            bool vert = Random.value > 0.5f;
            int numBlocks = Random.Range(2, 4);
            float len = (vert ? spriteHeight : spriteWidth) * numBlocks;
            float thickness = vert ? spriteWidth : spriteHeight;
            Vector2 pos = new Vector2(Random.Range(bounds.xMin + 120f, bounds.xMax - 120f), Random.Range(bounds.yMin + 100f, bounds.yMax - 100f));
            if (!IsPointInsideShape(pos)) continue;
            if (!CanPlaceInternalWall(CreateRect(pos, vert ? new Vector2(thickness, len) : new Vector2(len, thickness)))) continue;
            if (solutionPath.Count > 0 && BlocksSolutionPath(CreateExpandedRect(pos, vert ? new Vector2(thickness, len) : new Vector2(len, thickness), radioRata))) continue;
            CreateInternalWallBlocks(pos, vert, numBlocks);
            placed++;
        }
    }

    private void CreateInternalWallBlocks(Vector2 center, bool vertical, int numBlocks)
    {
        float step = vertical ? spriteHeight : spriteWidth;
        float start = -(numBlocks - 1) * step * 0.5f;
        for (int i = 0; i < numBlocks; i++)
        {
            Vector2 blockCenter = center + (vertical ? Vector2.up : Vector2.right) * (start + i * step);
            GameObject obj = new GameObject("ParedInterna", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(wallLayer, false);
            Image img = obj.GetComponent<Image>();
            img.sprite = spritePared; img.color = Color.white; img.preserveAspect = false; img.type = Image.Type.Simple; img.raycastTarget = false;
            RectTransform rect = obj.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = blockCenter;
            rect.sizeDelta = new Vector2(spriteWidth, spriteHeight);
            rect.localRotation = Quaternion.Euler(0f, 0f, vertical ? 90f : 0f);
            walls.Add(rect);
            internalWalls.Add(rect);
        }
    }

    private bool CanPlaceInternalWall(Rect rect)
    {
        if (OverlapsCircle(rect, ratStart, radioRata + 72f)) return false;
        if (DistanceToExit(rect.center) < exitLength * 0.85f) return false;
        if (CreateRect(ExitPoint(), Vector2.one * (exitLength + 90f)).Overlaps(rect)) return false;
        foreach (var w in internalWalls)
            if (CreateExpandedRect(w.anchoredPosition, WallCollisionSize(w), grosorPared * 2f).Overlaps(rect)) return false;
        return true;
    }

    // ============================================================
    // TRAMPAS
    // ============================================================

    private void BuildTraps(int count, List<Vector2> pathNormal, List<Vector2> pathPU = null)
    {
        ClearTraps();
        if (count <= 0) return;
        Rect bounds = PlayBounds();
        int placed = 0, guard = 0;
        while (placed < count && guard < 200)
        {
            guard++;
            Vector2 size = new Vector2(Random.Range(50f, 90f), Random.Range(35f, 65f));
            Vector2 pos = new Vector2(Random.Range(bounds.xMin + 80f, bounds.xMax - 80f), Random.Range(bounds.yMin + 60f, bounds.yMax - 60f));
            if (!IsPointInsideShape(pos)) continue;
            if (DistanceToExit(pos) < exitLength * 1.5f) continue;
            if (Vector2.Distance(pos, ratStart) < 100f) continue;
            Rect rect = CreateRect(pos, size);
            if (OverlapsAnyInternalWall(rect)) continue;
            if (AnyOverlap(rect)) continue;
            if (pathNormal != null && BlocksPath(rect, pathNormal)) continue;
            if (pathPU != null && BlocksPath(rect, pathPU)) continue;
            GameObject obj = new GameObject("Ratonera", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(trapLayer, false);
            Image img = obj.GetComponent<Image>();
            if (spriteTrampa != null) { img.sprite = spriteTrampa; img.color = Color.white; img.preserveAspect = true; }
            else img.color = colorTrampa;
            img.raycastTarget = false;
            RectTransform rt = obj.GetComponent<RectTransform>();
            rt.anchorMin = rt.anchorMax = rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;
            traps.Add(new Trap { rect = rt, image = img });
            placed++;
        }
    }

    private bool BlocksPath(Rect rect, List<Vector2> path)
    {
        Rect expanded = rect;
        expanded.xMin -= radioRata; expanded.xMax += radioRata;
        expanded.yMin -= radioRata; expanded.yMax += radioRata;
        foreach (Vector2 point in path)
            if (expanded.Contains(point)) return true;
        return false;
    }

    private bool BlocksSolutionPath(Rect trapRect)
    {
        Rect expanded = trapRect;
        expanded.xMin -= radioRata; expanded.xMax += radioRata;
        expanded.yMin -= radioRata; expanded.yMax += radioRata;
        foreach (Vector2 point in solutionPath)
            if (expanded.Contains(point)) return true;
        return false;
    }

    // ============================================================
    // VALIDACIÓN
    // ============================================================

    private bool TryFindSolvableAim(out Vector2 dir, int targetBounces, int minWalls)
    {
        simulationSilent = true;
        dir = Vector2.right; solutionPath.Clear();
        int samples = Mathf.Clamp(180 + targetBounces * 60, 180, 540);
        float offset = Random.Range(0f, 360f / samples);
        List<Vector2> path = new List<Vector2>(100);
        List<int> hitWalls = new List<int>();

        for (int i = 0; i < samples; i++)
        {
            float rad = (offset + i * 360f / samples) * Mathf.Deg2Rad;
            Vector2 d = new Vector2(Mathf.Cos(rad), Mathf.Sin(rad));
            if (!SimulateDetailed(d, path, hitWalls, targetBounces)) continue;
            if (minWalls > 0 && new HashSet<int>(hitWalls).Count < minWalls) continue;
            dir = d.normalized;
            solutionPath.Clear(); solutionPath.AddRange(path);
            simulationSilent = false;
            return true;
        }

        simulationSilent = false;
        return false;
    }

    private bool SimulateDetailed(Vector2 dir, List<Vector2> path, List<int> hitWalls, int targetBounces)
    {
        simulationSilent = true;
        simulationTargetBounces = targetBounces;
        path.Clear(); hitWalls.Clear(); path.Add(ratStart);
        Vector2 pos = ratStart, vel = dir.normalized * velocidadRata;
        int bounces = 0; float t = 0f;

        while (t < ExecutionDurationLimit())
        {
            t += 0.05f;
            int before = bounces;
            bool s; ExecutionFailReason f;
            StepSimulation(ref pos, ref vel, ref bounces, 0.05f, out s, out f);

            if (f == ExecutionFailReason.WrongBounceCount) { simulationSilent = false; return false; }
            if (f == ExecutionFailReason.Trap) { simulationSilent = false; return false; }

            path.Add(pos);

            if (bounces > before)
            {
                int wi = IdentifyHitWall(pos);
                if (wi >= 0 && !IsExitBounce(wi, pos))
                    hitWalls.Add(wi);
            }

            if (s)
            {
                simulationSilent = false;
                return bounces == targetBounces;
            }

            if (bounces > targetBounces) { simulationSilent = false; return false; }
        }
        simulationSilent = false;
        return false;
    }
    private bool IsExitBounce(int wallIndex, Vector2 pos)
    {
        if (wallIndex >= 1 && wallIndex <= 4)
        {
            BoxSide hitSide = (BoxSide)(wallIndex - 1);
            if (hitSide == exitSide)
            {
                float half = exitLength * 0.5f;
                switch (exitSide)
                {
                    case BoxSide.Top: case BoxSide.Bottom: return pos.x >= exitCenter - half && pos.x <= exitCenter + half;
                    case BoxSide.Left: case BoxSide.Right: return pos.y >= exitCenter - half && pos.y <= exitCenter + half;
                }
            }
        }
        return false;
    }

    private int IdentifyHitWall(Vector2 pos)
    {
        for (int i = 0; i < internalWalls.Count; i++)
            if (CreateExpandedRect(internalWalls[i].anchoredPosition, WallCollisionSize(internalWalls[i]), radioRata + 5f).Contains(pos))
                return 100 + i;
        Rect bounds = PlayBounds();
        if (Mathf.Abs(pos.x - bounds.xMin) < radioRata + 2f) return 0;
        if (Mathf.Abs(pos.x - bounds.xMax) < radioRata + 2f) return 1;
        if (Mathf.Abs(pos.y - bounds.yMin) < radioRata + 2f) return 2;
        if (Mathf.Abs(pos.y - bounds.yMax) < radioRata + 2f) return 3;
        return -1;
    }

    // ============================================================
    // SIMULACIÓN FÍSICA
    // ============================================================

    private void StepSimulation(ref Vector2 pos, ref Vector2 vel, ref int bounces, float dt, out bool success, out ExecutionFailReason failReason)
    {
        success = false;
        failReason = ExecutionFailReason.None;
        Vector2 next = pos + vel * dt;
        Rect bounds = PlayBounds();

        int targetBounces = simulationSilent ? simulationTargetBounces : requiredBounces;

        if (HitsTrap(next)) { pos = next; failReason = ExecutionFailReason.Trap; return; }
        if (TryBounceInternal(pos, ref next, ref vel))
        {
            bounces++;
            if (bounces > targetBounces) failReason = ExecutionFailReason.WrongBounceCount;
            pos = next; return;
        }
        if (IsCompletelyOutside(next) && IsAlignedWithHole(next))
        {
            pos = next;
            int realTarget = bouncePowerUpCollected ? originalRequiredBounces + 1 : targetBounces;
            if (bounces == realTarget) success = true;
            else failReason = ExecutionFailReason.WrongBounceCount;
            return;
        }

        BoxSide crossedSide;
        float l = bounds.xMin + radioRata - next.x;
        float r = next.x - (bounds.xMax - radioRata);
        float b = bounds.yMin + radioRata - next.y;
        float t = next.y - (bounds.yMax - radioRata);
        float max = Mathf.Max(l, r, b, t);
        if (max <= 0f) { pos = next; return; }

        if (max == l) crossedSide = BoxSide.Left;
        else if (max == r) crossedSide = BoxSide.Right;
        else if (max == b) crossedSide = BoxSide.Bottom;
        else crossedSide = BoxSide.Top;

        if (crossedSide == exitSide && IsAlignedWithHole(next)) { pos = next; return; }

        bounces++;
        if (bounces > targetBounces) { pos = next; failReason = ExecutionFailReason.WrongBounceCount; return; }

        if (!simulationSilent) audioManager.Rebote();

        switch (crossedSide)
        {
            case BoxSide.Left: next.x = bounds.xMin + radioRata; vel.x *= -1f; break;
            case BoxSide.Right: next.x = bounds.xMax - radioRata; vel.x *= -1f; break;
            case BoxSide.Bottom: next.y = bounds.yMin + radioRata; vel.y *= -1f; break;
            case BoxSide.Top: next.y = bounds.yMax - radioRata; vel.y *= -1f; break;
        }
        pos = next;
    }
    private bool TryBounceInternal(Vector2 current, ref Vector2 next, ref Vector2 vel)
    {
        for (int i = 0; i < internalWalls.Count; i++)
        {
            RectTransform w = internalWalls[i];
            if (w == null) continue;
            Vector2 realSize = new Vector2(spriteWidth, spriteHeight);
            float rotZ = Mathf.Abs(w.localEulerAngles.z % 180f);
            if (rotZ > 45f && rotZ < 135f) realSize = new Vector2(spriteHeight, spriteWidth);
            Rect wr = CreateExpandedRect(w.anchoredPosition, realSize, radioRata);
            if (!wr.Contains(next)) continue;

            bool bounceX = ShouldBounceX(current, next, wr, realSize);
            if (bounceX) { vel.x *= -1f; next.x = current.x <= wr.center.x ? wr.xMin - 1f : wr.xMax + 1f; next.y = current.y; }
            else { vel.y *= -1f; next.y = current.y <= wr.center.y ? wr.yMin - 1f : wr.yMax + 1f; next.x = current.x; }

            Rect bounds = PlayBounds();
            next.x = Mathf.Clamp(next.x, bounds.xMin + radioRata, bounds.xMax - radioRata);
            next.y = Mathf.Clamp(next.y, bounds.yMin + radioRata, bounds.yMax - radioRata);

            if (!simulationSilent) audioManager.Rebote();
            return true;
        }
        return false;
    }

    private bool ShouldBounceX(Vector2 c, Vector2 n, Rect wr, Vector2 s)
    {
        if (c.x <= wr.xMin && n.x > wr.xMin) return true;
        if (c.x >= wr.xMax && n.x < wr.xMax) return true;
        if (c.y <= wr.yMin && n.y > wr.yMin) return false;
        if (c.y >= wr.yMax && n.y < wr.yMax) return false;
        if (s.y > s.x * 1.25f) return true;
        if (s.x > s.y * 1.25f) return false;
        return Mathf.Min(Mathf.Abs(n.x - wr.xMin), Mathf.Abs(n.x - wr.xMax)) < Mathf.Min(Mathf.Abs(n.y - wr.yMin), Mathf.Abs(n.y - wr.yMax));
    }

    // ============================================================
    // EJECUCIÓN
    // ============================================================

    private void BeginExecution()
    {
        if (phase != Phase.Planning || gameFinished) return;
        if (executionRoutine != null) StopCoroutine(executionRoutine);
        executionRoutine = StartCoroutine(ExecuteRoutine());
    }

    private IEnumerator ExecuteRoutine()
    {
        phase = Phase.Executing; ui?.HideFeedback(); UpdateHud();
        attempts++; totalRequiredBounces += requiredBounces;
        Vector2 pos = ratStart, vel = aimDirection * velocidadRata;
        currentMoveDirection = vel.normalized;
        int usedBounces = 0;
        float closest = DistanceToExit(pos);
        ExecutionFailReason failReason = ExecutionFailReason.None;
        bool success = false;
        bouncePowerUpCollected = false;

        for (float elapsed = 0; elapsed < ExecutionDurationLimit() && !gameFinished; elapsed += Time.deltaTime)
        {
            if (juegoPausado) { yield return null; continue; }
            float dt = Time.deltaTime;
            StepSimulation(ref pos, ref vel, ref usedBounces, dt, out success, out failReason);
            currentMoveDirection = vel.normalized;
            closest = Mathf.Min(closest, DistanceToExit(pos));
            CheckPowerUpCollection(pos);



            ratPosition = pos; ratRect.anchoredPosition = pos;
            ApplyRatRotation();
            if (success || failReason != ExecutionFailReason.None) break;
            yield return null;
        }

        if (!success && failReason == ExecutionFailReason.None) failReason = ExecutionFailReason.NoExit;
        totalUsedBounces += usedBounces;
        totalExitDistanceScore += 1f - Mathf.Clamp01(closest / Mathf.Max(1f, PlayDiagonal()));
        RegisterAttempt(success, failReason, usedBounces);
        executionRoutine = null;
    }

    private void CheckPowerUpCollection(Vector2 pos)
    {
        for (int i = powerUps.Count - 1; i >= 0; i--)
        {
            PowerUp pu = powerUps[i];
            if (pu.collected) continue;
            Rect r = CreateRect(pu.rect.anchoredPosition, pu.rect.sizeDelta);
            r.xMin -= radioRata; r.xMax += radioRata;
            r.yMin -= radioRata; r.yMax += radioRata;
            if (!r.Contains(pos)) continue;
            pu.collected = true;

            audioManager.PowerUp();

            if (pu.type == PowerUpType.ExtraBounce)
            {
                requiredBounces++; bouncePowerUpCollected = true;
                ui?.SetBouncePowerUpActive(true);
                ui?.ShowFeedback("¡+1 Rebote!", true);
            }
            else { ui?.AddExtraLife(); ui?.ShowFeedback("¡+1 Vida!", true); }
            pu.image.enabled = false;
            StartCoroutine(FlashFeedback());
        }
    }

    private IEnumerator FlashFeedback() { yield return new WaitForSecondsRealtime(3.5f); if (!juegoPausado) ui?.HideFeedback(); }

    private void RegisterAttempt(bool success, ExecutionFailReason failReason, int usedBounces)
    {
        phase = Phase.Feedback;
        if (success)
        {
            audioManager?.Acierto(); // AÑADIR

            regenerateAfterFeedback = true; successes++; currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            successesInCurrentLevel++;
            int needed = Mathf.Max(1, pruebasParaSubirNivel);
            if (successesInCurrentLevel >= needed && currentLevel < nivelMaximo)
            {
                currentLevel++; remainingAttempts = Mathf.Max(1, intentosMaximos); successesInCurrentLevel = 0;
                SyncDifficultyLevel();
                audioManager?.NivelUp(); // AÑADIR
                ui?.ShowFeedback($"Nivel {currentLevel}: ahora son {RequiredBouncesForLevel(currentLevel)} rebotes", true);
            }
            else ui?.ShowFeedback($"Salida correcta {successesInCurrentLevel}/{needed}", true);
            requiredBounces = originalRequiredBounces; bouncePowerUpCollected = false;
            ui?.SetBouncePowerUpActive(false);
        }
        else
        {
            audioManager?.Error(); // AÑADIR

            if (!(ui != null && ui.ConsumeExtraLife())) remainingAttempts = Mathf.Max(0, remainingAttempts - 1);
            regenerateAfterFeedback = false; currentStreak = 0; successesInCurrentLevel = 0;
            string msg = failReason == ExecutionFailReason.Trap ? "Ratonera." :
                         failReason == ExecutionFailReason.WrongBounceCount ? $"Rebotes incorrectos: {usedBounces}/{requiredBounces}." :
                         "La rata no encontró la salida.";
            msg += $" Intentos {remainingAttempts}/{intentosMaximos}";
            ui?.ShowFeedback(msg, false);
        }
        UpdateHud();
        StartCoroutine(NextRoundAfterDelay());
    }

    private IEnumerator NextRoundAfterDelay()
    {
        // Esperar 3 segundos para que se lea el feedback
        yield return new WaitForSecondsRealtime(3f);

        // Ocultar feedback
        ui?.HideFeedback();

        // Mostrar pantalla de carga
        if (ui != null && ui.loadingScreen != null)
            ui.loadingScreen.SetActive(true);

        yield return new WaitForSecondsRealtime(0.3f);

        if (gameFinished)
        {
            if (ui != null && ui.loadingScreen != null)
                ui.loadingScreen.SetActive(false);
            yield break;
        }

        if (remainingAttempts <= 0)
        {
            if (ui != null && ui.loadingScreen != null)
                ui.loadingScreen.SetActive(false);
            FinishGameNow();
            yield break;
        }

        if (regenerateAfterFeedback)
            GenerateRound();
        else
            ResetCurrentPuzzleAttempt();

        yield return new WaitForEndOfFrame();
        yield return new WaitForEndOfFrame();

        if (ui != null && ui.loadingScreen != null)
            ui.loadingScreen.SetActive(false);
    }


    // ============================================================
    // RATA Y APUNTADO
    // ============================================================

    private void PositionRat()
    {
        ratRect.anchorMin = ratRect.anchorMax = ratRect.pivot = new Vector2(0.5f, 0.5f);
        ratRect.sizeDelta = Vector2.one * radioRata * 2f * escalaVisualRata;
        ratRect.anchoredPosition = ratPosition;
        currentMoveDirection = aimDirection;
        ApplyRatRotation();
    }

    private void ResetCurrentPuzzleAttempt()
    {
        phase = Phase.Planning; ratPosition = ratStart;
        requiredBounces = originalRequiredBounces; bouncePowerUpCollected = false;
        ui?.SetBouncePowerUpActive(false);
        PositionRat(); 
        
        UpdateAimFromPointer(true); UpdateHud(); DrawTrajectory();

    }

    private void AnimateRat() { if (ratRect != null) ApplyRatRotation(); }

    private void ApplyRatRotation()
    {
        if (ratRect == null) return;
        Vector2 dir = currentMoveDirection.sqrMagnitude > 0.001f ? currentMoveDirection.normalized : Vector2.left;
        float angle = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg - 180f;
        float tilt = Mathf.Sin(Time.time * 5.8f) * 7f;
        ratRect.localRotation = Quaternion.Euler(0, 0, angle + tilt);
    }

    private void UpdateAimFromPointer(bool force = false)
    {
        Vector2 pointer;
        if (!TryGetPointerLocal(out pointer)) { pointer = ratStart + aimDirection * 120f; return; }
        if (!force && Vector2.Distance(pointer, lastPointerLocal) < 1.5f) return;
        lastPointerLocal = pointer;
        Vector2 direction = pointer - ratStart;
        if (direction.sqrMagnitude > 12f) { aimDirection = direction.normalized; currentMoveDirection = aimDirection; }
        ApplyRatRotation(); DrawTrajectory();
    }

    // ============================================================
    // TRAYECTORIA
    // ============================================================

    private void DrawTrajectory()
    {
        ClearTrajectory();
        if (phase == Phase.Planning)
        {
            simulationSilent = true;
            int maxBouncesToShow = Mathf.Max(1, requiredBounces - 1); // N-1 rebotes mínimo
            int postSteps = 40; // Muchos puntos después del último rebote

            Vector2 pos = ratStart, vel = aimDirection * velocidadRata;
            int bounces = 0, dotsAfterLastBounce = 0;

            for (float t = 0; t < ExecutionDurationLimit() && trajectoryDots.Count < 200; t += 0.045f)
            {
                int before = bounces;
                bool s; ExecutionFailReason f;
                StepSimulation(ref pos, ref vel, ref bounces, 0.045f, out s, out f);
                if (s || f != ExecutionFailReason.None) break;

                CreateTrajectoryDot(pos, colorTrayectoria);

                if (bounces >= maxBouncesToShow)
                {
                    if (bounces == before) dotsAfterLastBounce++;
                    if (dotsAfterLastBounce >= postSteps) break;
                }
            }
            simulationSilent = false;
        }

        if (mostrarSolucionDebug && solutionPath.Count > 0)
            for (int i = 0; i < solutionPath.Count; i++)
                CreateTrajectoryDot(solutionPath[i], colorSolucionDebug, 12f);
    }

    private void CreateTrajectoryDot(Vector2 pos, Color color, float size = 8f)
    {
        GameObject obj = new GameObject("Dot", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(trajectoryLayer, false);
        Image img = obj.GetComponent<Image>();
        img.color = color; img.raycastTarget = false;
        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = Vector2.one * size;
        rect.anchoredPosition = pos;
        trajectoryDots.Add(rect);
    }

    // ============================================================
    // FALLBACK
    // ============================================================

    private void CreateFallbackLevel()
    {
        ClearWalls(); ClearTraps(); ClearPowerUps();
        Rect bounds = PlayBounds();
        exitSide = BoxSide.Right;
        exitCenter = bounds.yMin + bounds.height * 0.5f;
        exitLength = ExitLengthForBounces(requiredBounces);
        currentShape = RoomShape.BigRoom;
        GenerateRoomShape();
        CreateOuterWalls(bounds);
        ratStart = new Vector2(bounds.xMin + bounds.width * 0.3f, bounds.yMin + bounds.height * 0.5f);
        ratPosition = ratStart;
        if (!TryFindSolvableAim(out aimDirection, requiredBounces, 1)) aimDirection = Vector2.right;
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    private bool IsPointInsideShape(Vector2 point)
    {
        if (shapeVertices.Count < 3) return false;
        bool inside = false;
        int j = shapeVertices.Count - 1;
        for (int i = 0; i < shapeVertices.Count; i++)
        {
            if ((shapeVertices[i].y > point.y) != (shapeVertices[j].y > point.y) &&
                point.x < (shapeVertices[j].x - shapeVertices[i].x) * (point.y - shapeVertices[i].y) / (shapeVertices[j].y - shapeVertices[i].y) + shapeVertices[i].x)
                inside = !inside;
            j = i;
        }
        return inside;
    }

    private bool IsCompletelyOutside(Vector2 point)
    {
        if (!IsAlignedWithHole(point)) return false;
        Rect bounds = PlayBounds();
        switch (exitSide)
        {
            case BoxSide.Top: return point.y > bounds.yMax + radioRata;
            case BoxSide.Bottom: return point.y < bounds.yMin - radioRata;
            case BoxSide.Right: return point.x > bounds.xMax + radioRata;
            case BoxSide.Left: return point.x < bounds.xMin - radioRata;
        }
        return false;
    }

    private bool IsAlignedWithHole(Vector2 point)
    {
        float half = exitLength * 0.5f;
        switch (exitSide)
        {
            case BoxSide.Top: case BoxSide.Bottom: return point.x >= exitCenter - half && point.x <= exitCenter + half;
            case BoxSide.Left: case BoxSide.Right: return point.y >= exitCenter - half && point.y <= exitCenter + half;
        }
        return false;
    }

    private void UpdateHud()
    {
        if (ui == null) return;
        int level = CurrentLevel();
        if (level < 1) level = 1;
        maxLevelReached = Mathf.Max(maxLevelReached, level);
        ui.UpdateBounceText(requiredBounces);
        ui.UpdateLives(remainingAttempts, Mathf.Max(1, intentosMaximos));
        ui.UpdateRacha(currentStreak);
        ui.UpdateAttempt(Mathf.Min(successesInCurrentLevel, Mathf.Max(1, pruebasParaSubirNivel)), Mathf.Max(1, pruebasParaSubirNivel));
        ui.UpdateLevel(level);
    }

    private int CurrentLevel() => Mathf.Clamp(currentLevel > 0 ? currentLevel : nivelInicial, 1, nivelMaximo);
    private int RequiredBouncesForLevel(int l) => Mathf.Clamp(rebotesObjetivoNivel1 + Mathf.Max(0, (l - 1) / 2) * Mathf.Max(1, rebotesExtraPorNivel), 1, rebotesMaximos);
    private float ExitLengthForBounces(int bounces) => Mathf.Clamp(largoSalidaBase + largoSalidaExtraPorRebote * Mathf.Max(0, bounces - 1), largoSalidaMin, largoSalidaMax);
    private float BoxScaleForLevel(int l) => Mathf.Lerp(escalaCajaNivel1, escalaCajaNivel10, Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f)));
    private int TrapCountForLevel(int l) => Mathf.RoundToInt(Mathf.Lerp(trampasNivel1, trampasNivel10, Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f))));
    private int InternalWallCountForLevel(int l) => l <= 1 ? 1 : Mathf.RoundToInt(Mathf.Lerp(1, paredesInternasNivel10, Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f))));
    private int PowerUpCountForLevel(int l)
    {
        if (l <= 3) return 1;   // Niveles 2-3: 1 PU
        if (l <= 6) return 2;   // Niveles 4-6: 2 PUs (vida + rebote)
        return 3;                // Niveles 7+: 2 PUs
    }
    private Vector2 RandomOffset(float range) => new Vector2(Random.Range(-range, range), Random.Range(-range, range));
    private void SyncDifficultyLevel() { currentLevel = Mathf.Clamp(currentLevel, 1, nivelMaximo); maxLevelReached = Mathf.Max(maxLevelReached, currentLevel); if (DifficultyManager.Instance != null) DifficultyManager.Instance.nivelActual = currentLevel; }
    private void DisableGenericTimer() { if (GameManager.Instance != null && GameManager.Instance.estaJugando) GameManager.Instance.tiempoRestante = 99999f; }
    private float ExecutionDurationLimit() => Mathf.Max(duracionMaximaEjecucion, 5f + requiredBounces * 1.45f);
    private bool PointerInsidePlayArea() => TryGetPointerLocal(out Vector2 p) && playArea.rect.Contains(p);
    private bool TryGetPointerLocal(out Vector2 local)
    {
        local = Vector2.zero;
        if (playArea == null) return false;
        Canvas c = playArea.GetComponentInParent<Canvas>();
        Camera cam = c != null && c.renderMode != RenderMode.ScreenSpaceOverlay ? c.worldCamera : null;
        return RectTransformUtility.ScreenPointToLocalPointInRectangle(playArea, Input.mousePosition, cam, out local);
    }
    private bool HitsTrap(Vector2 pos)
    {
        foreach (var t in traps)
        {
            Rect r = CreateRect(t.rect.anchoredPosition, t.rect.sizeDelta);
            r.xMin -= radioRata * 0.5f; r.xMax += radioRata * 0.5f;
            r.yMin -= radioRata * 0.5f; r.yMax += radioRata * 0.5f;
            if (r.Contains(pos)) return true;
        }
        return false;
    }
    private Rect CreateRect(Vector2 c, Vector2 s) => new Rect(c - s * 0.5f, s);
    private Rect CreateExpandedRect(Vector2 c, Vector2 s, float p) { Rect r = CreateRect(c, s); r.xMin -= p; r.xMax += p; r.yMin -= p; r.yMax += p; return r; }
    private bool OverlapsAnyInternalWall(Rect rect) { foreach (var w in internalWalls) if (CreateExpandedRect(w.anchoredPosition, WallCollisionSize(w), radioRata + 14f).Overlaps(rect)) return true; return false; }
    private Vector2 WallCollisionSize(RectTransform wall)
    {
        if (wall == null) return Vector2.zero;
        float z = Mathf.Abs(Mathf.DeltaAngle(0f, wall.localEulerAngles.z));
        return z > 45f && z < 135f ? new Vector2(wall.sizeDelta.y, wall.sizeDelta.x) : wall.sizeDelta;
    }
    private bool OverlapsCircle(Rect rect, Vector2 center, float radius) { float cx = Mathf.Clamp(center.x, rect.xMin, rect.xMax), cy = Mathf.Clamp(center.y, rect.yMin, rect.yMax); return Vector2.Distance(center, new Vector2(cx, cy)) < radius; }
    private bool AnyOverlap(Rect rect) { foreach (var t in traps) if (CreateRect(t.rect.anchoredPosition, t.rect.sizeDelta).Overlaps(rect)) return true; foreach (var p in powerUps) if (CreateRect(p.rect.anchoredPosition, p.rect.sizeDelta).Overlaps(rect)) return true; return false; }
    private float DistanceToExit(Vector2 pos) => Vector2.Distance(pos, ExitPoint());
    private Vector2 ExitPoint() { Rect b = PlayBounds(); return exitSide switch { BoxSide.Top => new Vector2(exitCenter, b.yMax), BoxSide.Bottom => new Vector2(exitCenter, b.yMin), BoxSide.Right => new Vector2(b.xMax, exitCenter), _ => new Vector2(b.xMin, exitCenter) }; }
    private Rect PlayBounds()
    {
        if (_boundsCached) return _cachedBounds;
        float s = Mathf.Clamp(currentBoxScale, 0.35f, 1f);
        float w = (PlayWidth() - grosorPared * 2f) * s;
        float h = (PlayHeight() - grosorPared * 2f) * s;
        _cachedBounds = new Rect(-w * 0.5f, -h * 0.5f, w, h);
        _boundsCached = true;
        return _cachedBounds;
    }
    private float PlayWidth() => playArea != null && playArea.rect.width > 1f ? playArea.rect.width : 900f;
    private float PlayHeight() => playArea != null && playArea.rect.height > 1f ? playArea.rect.height : 560f;
    private float PlayDiagonal() { Rect b = PlayBounds(); return Mathf.Sqrt(b.width * b.width + b.height * b.height); }

    private void ClearTraps() { for (int i = traps.Count - 1; i >= 0; i--) if (traps[i]?.rect != null) Destroy(traps[i].rect.gameObject); traps.Clear(); }
    private void ClearPowerUps() { for (int i = powerUps.Count - 1; i >= 0; i--) if (powerUps[i]?.rect != null) Destroy(powerUps[i].rect.gameObject); powerUps.Clear(); }
    private void ClearWalls()
    {
        for (int i = walls.Count - 1; i >= 0; i--)
            if (walls[i] != null) Destroy(walls[i].gameObject);
        walls.Clear();
        internalWalls.Clear();

        // Limpiar marcador de salida
        if (exitMarker != null)
        {
            Destroy(exitMarker);
            exitMarker = null;
        }
    }
    private void ClearTrajectory() { for (int i = trajectoryDots.Count - 1; i >= 0; i--) if (trajectoryDots[i] != null) Destroy(trajectoryDots[i].gameObject); trajectoryDots.Clear(); }

    public override void PausarJuego(bool pausar) => base.PausarJuego(pausar);

    private void FinishGameNow()
    {
        if (gameFinished) return;
        if (GameManager.Instance != null) GameManager.Instance.estaJugando = false;
        CognitiveMetrics w = AplicarPesos(CalcularCognicion());
        OnGameFinished();
        AudioManager.Instance?.MusicaVictoria();
        UIManager.Instance?.MostrarResultados(w);
    }

    public override void OnGameFinished()
    {
        if (gameFinished) return;
        gameFinished = true; gameActive = false;
        if (executionRoutine != null) StopCoroutine(executionRoutine);
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        if (attempts <= 0) return m;

        // Precisión base (más generosa)
        float prec = Mathf.Lerp(0.4f, 1f, (float)successes / Mathf.Max(1f, attempts));

        // Evitar trampas (más generoso)
        float trap = Mathf.Lerp(0.5f, 1f, 1f - Mathf.Clamp01((float)trapHits / Mathf.Max(1f, attempts)));

        // Precisión de rebotes (más generoso)
        float bounceAccuracy = Mathf.Lerp(0.3f, 1f, 1f - Mathf.Clamp01(Mathf.Abs(totalRequiredBounces - totalUsedBounces) / Mathf.Max(1f, totalRequiredBounces + attempts * 0.5f)));

        // Distancia a la salida
        float dist = Mathf.Clamp01(totalExitDistanceScore / Mathf.Max(1f, attempts)) * 0.8f + 0.2f;

        // Racha (más generosa)
        float streak = Mathf.Lerp(0.3f, 1f, Mathf.Clamp01(bestStreak / 3f));

        // Factor de nivel
        float lvl = Mathf.Lerp(0.5f, 1f, Mathf.Clamp01(maxLevelReached / 8f));

        // Métricas base (valores más altos)
        m.planificacion = (prec * 0.6f + bounceAccuracy * 0.4f) * lvl;
        m.memoriaTrabajo = (prec * 0.4f + bounceAccuracy * 0.35f + streak * 0.25f) * lvl;
        m.memoriaEspacial = (trap * 0.4f + dist * 0.6f) * prec * lvl;
        m.atencionSostenida = Mathf.Lerp(0.4f, 1f, Mathf.Clamp01(attempts / 4f)) * (0.4f + prec * 0.6f) * lvl;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics w = new CognitiveMetrics();
        w.planificacion = m.planificacion * 0.55f;
        w.memoriaTrabajo = m.memoriaTrabajo * 0.20f;
        w.memoriaEspacial = m.memoriaEspacial * 0.15f;
        w.atencionSostenida = m.atencionSostenida * 0.10f;
        return w;
    }
}