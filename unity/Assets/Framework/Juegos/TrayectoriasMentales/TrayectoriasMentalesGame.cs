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
    private List<Vector2> shapeVertices = new List<Vector2>(); // Vértices del contorno


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
    public int intentosMaximos = 2;
    public int pruebasParaSubirNivel = 2;
    public int trampasNivel1 = 0;
    public int trampasNivel10 = 5;
    public int paredesInternasNivel1 = 0;
    public int paredesInternasNivel10 = 4;
    public int rebotesObjetivoNivel1 = 1;
    public int rebotesExtraPorNivel = 1;
    public int rebotesMaximos = 5;
    public float largoSalidaBase = 80f;
    public float largoSalidaExtraPorRebote = 12f;
    public float largoSalidaMin = 80f;
    public float largoSalidaMax = 180f;
    [Range(0.35f, 1f)] public float escalaCajaNivel1 = 0.52f;
    [Range(0.35f, 1f)] public float escalaCajaNivel10 = 0.92f;

    [Header("Formas de caja")]
    public int MAX_INTENTOS = 10;
    public bool usarFormasVariadas = true;
    public int gridSizeX = 5;   // celdas en horizontal
    public int gridSizeY = 4;   // celdas en vertical

    [Header("Movimiento")]
    public float velocidadRata = 650f;
    public float duracionMaximaEjecucion = 11f;
    public float radioRata = 18f;
    public float escalaVisualRata = 2.0f;
    public float grosorPared = 18f;

    [Header("Sprites")]
    public Sprite spritePared;
    public Sprite spriteRata;
    public Sprite spriteTrampa;
    public Sprite spritePowerUpBounce;
    public Sprite spritePowerUpLife;
    public float pixelsPerUnit = 100f;
    public float escalaSpritePared = 8f;

    [Header("Colores Juego")]
    public Color colorSalida = new Color(0.56f, 0.92f, 0.45f, 1f);
    public Color colorRata = new Color(0.72f, 0.72f, 0.68f, 1f);
    public Color colorTrampa = new Color(0.74f, 0.24f, 0.18f, 1f);
    public Color colorQueso = new Color(1f, 0.82f, 0.22f, 1f);
    public Color colorTrayectoria = new Color(0.64f, 0.90f, 1f, 0.86f);
    public Color colorSolucionDebug = new Color(1f, 0.82f, 0.22f, 0.92f);
    public Color colorPowerUpBounce = new Color(1f, 0.84f, 0f, 1f);
    public Color colorPowerUpLife = new Color(0.2f, 0.9f, 0.3f, 1f);

    [Header("Vista previa")]
    public bool mostrarSolucionDebug = false;
    public int rebotesPreviewNivelBajo = 2;
    public int rebotesPreviewNivelMedio = 1;
    public int pasosTrasReboteBajo = 12;
    public int pasosTrasReboteMedio = 9;
    public int pasosTrasReboteAlto = 5;

    // ============================================================
    // ESTADO INTERNO
    // ============================================================

    private RectTransform wallLayer, trapLayer, powerUpLayer, trajectoryLayer;
    private RectTransform ratRect, exitRect;
    private Graphic ratGraphic;
    private Image exitImage;

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

    // Caché
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
            // Multiplicamos por escalaSpritePared para que cada sprite cubra más
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
    }

    public override void OnGameStart() => ResetGame();

    

    private void Update()
    {
        DisableGenericTimer();
        if (gameActive && !gameFinished && !juegoPausado) AnimateRat();
        if (!gameActive || gameFinished || juegoPausado || phase != Phase.Planning) return;
        UpdateAimFromPointer();
        if (Input.GetMouseButtonDown(0) && PointerInsidePlayArea()) BeginExecution();

        // Toggle debug con tecla D
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

        // Limpiar hijos anteriores
        for (int i = playArea.childCount - 1; i >= 0; i--)
            Destroy(playArea.GetChild(i).gameObject);

        // Capas
        wallLayer = CreateLayer("WallLayer");
        trapLayer = CreateLayer("TrapLayer");
        powerUpLayer = CreateLayer("PowerUpLayer");
        trajectoryLayer = CreateLayer("TrajectoryLayer");

        // Salida
        //GameObject exitObj = new GameObject("Salida", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        //exitObj.transform.SetParent(playArea, false);
        //exitImage.color = colorSalida;
        //exitImage.raycastTarget = false;
        //exitImage.enabled = false;
        exitImage = null;
        exitRect = null;

        // Rata
        GameObject ratObj = new GameObject("Rata", typeof(RectTransform), typeof(CanvasRenderer));
        ratObj.transform.SetParent(playArea, false);
        ratRect = ratObj.GetComponent<RectTransform>();

        Image img = ratObj.AddComponent<Image>();
        if (spriteRata != null)
        {
            img.sprite = spriteRata;
            img.color = Color.white;
            img.preserveAspect = true;
        }
        else
        {
            img.color = colorRata;
        }
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
        exitLength = Mathf.Clamp(largoSalidaBase + largoSalidaExtraPorRebote * requiredBounces * 2f, 120f, largoSalidaMax * 1.5f);
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

            // 1. Geometría base
            SetupLevelGeometry();

            // 2. Paredes internas
            BuildMazeWalls(InternalWallCountForLevel(level));

            // 3. Trampas (sin conocer las rutas aún, pero evitando salida y rata)
            BuildTrapsPreliminar(TrapCountForLevel(level));

            // 4. AHORA buscar rutas (ya con todo puesto)
            if (!TryFindSolvableAim(out aimDirection, requiredBounces, 0))
            {
                continue;
            }
            List<Vector2> pathNormal = new List<Vector2>(solutionPath);

            // 5. Ruta extra para power-up de rebote
            List<Vector2> pathExtra = null;
            if (PowerUpCountForLevel(level) >= 1)
            {
                if (TryFindSolvableAim(out Vector2 extraDir, requiredBounces + 1, 0))
                {
                    pathExtra = new List<Vector2>(solutionPath);
                }
                else
                {
                    // Si no hay ruta extra, usar la normal para colocar el PU
                    pathExtra = new List<Vector2>(pathNormal);
                }
            }
            // 6. Verificar que las trampas no bloquean las rutas
            if (TrapsBlockPath(pathNormal) || (pathExtra != null && TrapsBlockPath(pathExtra)))
            {
                continue; // Regenerar
            }

            // 7. Colocar power-ups en las rutas
            if (pathExtra != null && pathExtra.Count > 3)
            {
                PlacePowerUpOnPath(pathExtra, PowerUpType.ExtraBounce);
            }
            if (PowerUpCountForLevel(level) >= 2)
            {
                PlacePowerUpOnPath(pathNormal, PowerUpType.ExtraLife);
            }

            // Después de colocar power-ups, añade:
            Debug.Log($"PowerUps colocados: {powerUps.Count}, nivel: {level}, count esperado: {PowerUpCountForLevel(level)}");

            // 8. Restaurar ruta normal
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
    /// <summary>
    /// Coloca un power-up en un punto aleatorio de la ruta (no al principio ni al final)
    /// </summary>
    private void PlacePowerUpOnPath(List<Vector2> path, PowerUpType type)
    {
        if (path.Count < 2) return;

        // Probar puntos de la ruta
        for (int attempt = 0; attempt < 30; attempt++)
        {
            int index = Random.Range(1, path.Count - 1);
            Vector2 pos = path[index] + new Vector2(Random.Range(-20f, 20f), Random.Range(-20f, 20f));

            if (!IsPointInsideShape(pos)) continue;

            Rect rect = CreateRect(pos, new Vector2(50f, 50f));
            if (OverlapsAnyInternalWall(rect)) continue;
            if (AnyOverlap(rect)) continue;

            CreatePowerUpObject(pos, new Vector2(50f, 50f), type);
            Debug.Log($"PU colocado en ruta: {type} en {pos}");
            return;
        }

        // Fallback: punto medio de la ruta sin desplazar
        int mid = path.Count / 2;
        Vector2 fallbackPos = path[mid];

        Rect r = CreateRect(fallbackPos, new Vector2(50f, 50f));
        // Ignorar overlaps en fallback, forzar colocación
        CreatePowerUpObject(fallbackPos, new Vector2(50f, 50f), type);
        Debug.Log($"PU FALLBACK colocado: {type} en {fallbackPos}");
    }
    /// <summary>
         /// Crea un objeto PowerUp en la posición dada
         /// </summary>
    private void CreatePowerUpObject(Vector2 pos, Vector2 size, PowerUpType type)
    {
        GameObject obj = new GameObject("PowerUp", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(powerUpLayer, false);
        PowerUp pu = new PowerUp { rect = obj.GetComponent<RectTransform>(), image = obj.GetComponent<Image>(), type = type };
        pu.rect.anchorMin = pu.rect.anchorMax = pu.rect.pivot = new Vector2(0.5f, 0.5f);
        pu.rect.anchoredPosition = pos;
        pu.rect.sizeDelta = size;
        pu.image.raycastTarget = false;

        Sprite s = type == PowerUpType.ExtraBounce ? spritePowerUpBounce : spritePowerUpLife;
        if (s != null) { pu.image.sprite = s; pu.image.color = Color.white; pu.image.preserveAspect = true; }
        else pu.image.color = type == PowerUpType.ExtraBounce ? colorPowerUpBounce : colorPowerUpLife;

        powerUps.Add(pu);
    }

    private void SetupLevelGeometry()
    {
        ClearWalls();
        solutionPath.Clear();
        Rect bounds = PlayBounds();

        // Salida GRANDE: mínimo 150, máximo 300
        exitLength = Mathf.Clamp(largoSalidaBase + requiredBounces * 30f, 150f, 300f);

        GenerateRoomShape();
        ChooseExitEdge(bounds);
        CreateOuterWalls(bounds);
        PositionRatStart(bounds);
    }
    /// <summary>
    /// Elige una arista del polígono que pueda contener la salida
    /// </summary>
    private void ChooseExitEdge(Rect bounds)
    {
        List<int> candidateEdges = new List<int>();

        for (int i = 0; i < shapeVertices.Count; i++)
        {
            Vector2 start = shapeVertices[i];
            Vector2 end = shapeVertices[(i + 1) % shapeVertices.Count];

            float length = Vector2.Distance(start, end);
            if (length >= exitLength * 1.2f)
            {
                candidateEdges.Add(i);
            }
        }

        if (candidateEdges.Count == 0)
        {
            currentShape = RoomShape.BigRoom;
            GenerateRoomShape();
            candidateEdges.Add(Random.Range(0, shapeVertices.Count));
        }

        int chosenEdge = candidateEdges[Random.Range(0, candidateEdges.Count)];
        Vector2 edgeStart = shapeVertices[chosenEdge];
        Vector2 edgeEnd = shapeVertices[(chosenEdge + 1) % shapeVertices.Count];

        // Determinar el lado
        bool vertical = Mathf.Approximately(edgeStart.x, edgeEnd.x);
        bool horizontal = Mathf.Approximately(edgeStart.y, edgeEnd.y);

        if (horizontal)
        {
            exitSide = (edgeStart.y > bounds.center.y) ? BoxSide.Top : BoxSide.Bottom;
        }
        else
        {
            exitSide = (edgeStart.x > bounds.center.x) ? BoxSide.Right : BoxSide.Left;
        }

        // Calcular el centro del hueco
        float margin = exitLength * 0.3f;
        float minCoord, maxCoord;

        if (horizontal)
        {
            minCoord = Mathf.Min(edgeStart.x, edgeEnd.x) + margin;
            maxCoord = Mathf.Max(edgeStart.x, edgeEnd.x) - margin;
        }
        else
        {
            minCoord = Mathf.Min(edgeStart.y, edgeEnd.y) + margin;
            maxCoord = Mathf.Max(edgeStart.y, edgeEnd.y) - margin;
        }

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

        // Fallback: centroide de la forma
        Vector2 centroid = Vector2.zero;
        foreach (Vector2 v in shapeVertices) centroid += v;
        centroid /= shapeVertices.Count;

        // Asegurar que el centroide está dentro y no sobre una pared
        if (IsPointInsideShape(centroid) && !IsOverlappingWall(centroid))
        {
            ratStart = centroid;
            ratPosition = centroid;
            return;
        }

        // Último recurso: esquina inferior izquierda + offset
        ratStart = new Vector2(bounds.xMin + margin * 2, bounds.yMin + margin * 2);
        ratPosition = ratStart;
    }

    // Nuevo método auxiliar
    private bool IsOverlappingWall(Vector2 point)
    {
        foreach (var wall in walls)
        {
            Rect r = CreateExpandedRect(wall.anchoredPosition, wall.sizeDelta, radioRata + 5f);
            if (r.Contains(point)) return true;
        }
        return false;
    }
    // ============================================================
    // PAREDES
    // ============================================================
    private void CreateOuterWalls(Rect bounds)
    {
        float half = exitLength * 0.5f;

        for (int i = 0; i < shapeVertices.Count; i++)
        {
            Vector2 start = shapeVertices[i];
            Vector2 end = shapeVertices[(i + 1) % shapeVertices.Count];

            bool vertical = Mathf.Abs(start.x - end.x) < Mathf.Abs(start.y - end.y) * 0.1f;
            bool horizontal = Mathf.Abs(start.y - end.y) < Mathf.Abs(start.x - end.x) * 0.1f;

            float gapCenter = float.NaN;

            // Comprobar si esta arista debe tener el hueco de salida
            if (horizontal && (exitSide == BoxSide.Top || exitSide == BoxSide.Bottom))
            {
                float edgeY = (start.y + end.y) * 0.5f;
                bool isTopEdge = edgeY > bounds.center.y;

                if ((exitSide == BoxSide.Top && isTopEdge) || (exitSide == BoxSide.Bottom && !isTopEdge))
                {
                    float minX = Mathf.Min(start.x, end.x);
                    float maxX = Mathf.Max(start.x, end.x);
                    if (exitCenter >= minX + half && exitCenter <= maxX - half)
                    {
                        gapCenter = exitCenter;
                    }
                }
            }
            else if (vertical && (exitSide == BoxSide.Left || exitSide == BoxSide.Right))
            {
                float edgeX = (start.x + end.x) * 0.5f;
                bool isRightEdge = edgeX > bounds.center.x;

                if ((exitSide == BoxSide.Right && isRightEdge) || (exitSide == BoxSide.Left && !isRightEdge))
                {
                    float minY = Mathf.Min(start.y, end.y);
                    float maxY = Mathf.Max(start.y, end.y);
                    if (exitCenter >= minY + half && exitCenter <= maxY - half)
                    {
                        gapCenter = exitCenter;
                    }
                }
            }

            CreateWallLine(start.x, start.y, end.x, end.y, vertical, gapCenter, half);
        }
    }


    private void GenerateRoomShape()
    {
        currentShape = usarFormasVariadas ? (RoomShape)Random.Range(0, 5) : RoomShape.BigRoom;
        shapeVertices.Clear();

        Rect bounds = PlayBounds();
        float xMin = bounds.xMin;
        float xMax = bounds.xMax;
        float yMin = bounds.yMin;
        float yMax = bounds.yMax;
        float w = bounds.width;
        float h = bounds.height;

        switch (currentShape)
        {
            case RoomShape.BigRoom:
            default:
                shapeVertices.Add(new Vector2(xMin, yMax));
                shapeVertices.Add(new Vector2(xMax, yMax));
                shapeVertices.Add(new Vector2(xMax, yMin));
                shapeVertices.Add(new Vector2(xMin, yMin));
                break;

            case RoomShape.LShape:
                // Corte más pequeño = pasillos más anchos (65% en vez de 60%)
                float lCutX = xMin + w * 0.65f;
                float lCutY = yMin + h * 0.65f;
                shapeVertices.Add(new Vector2(xMin, yMax));
                shapeVertices.Add(new Vector2(lCutX, yMax));
                shapeVertices.Add(new Vector2(lCutX, lCutY));
                shapeVertices.Add(new Vector2(xMax, lCutY));
                shapeVertices.Add(new Vector2(xMax, yMin));
                shapeVertices.Add(new Vector2(xMin, yMin));
                break;

            case RoomShape.TShape:
                // Brazos más anchos (35% en vez de 25%)
                float tMidY = yMin + h * 0.55f;
                float tArmW = w * 0.35f;
                float tMidX = xMin + w * 0.5f;
                shapeVertices.Add(new Vector2(tMidX - tArmW, yMax));
                shapeVertices.Add(new Vector2(tMidX + tArmW, yMax));
                shapeVertices.Add(new Vector2(tMidX + tArmW, tMidY));
                shapeVertices.Add(new Vector2(xMax, tMidY));
                shapeVertices.Add(new Vector2(xMax, yMin));
                shapeVertices.Add(new Vector2(xMin, yMin));
                shapeVertices.Add(new Vector2(xMin, tMidY));
                shapeVertices.Add(new Vector2(tMidX - tArmW, tMidY));
                break;

            case RoomShape.Corridor:
                // Más ancho (65% en vez de 50%)
                if (Random.value > 0.5f)
                {
                    float corrH = h * 0.65f;
                    float corrY = yMin + h * 0.175f;
                    shapeVertices.Add(new Vector2(xMin, corrY + corrH));
                    shapeVertices.Add(new Vector2(xMax, corrY + corrH));
                    shapeVertices.Add(new Vector2(xMax, corrY));
                    shapeVertices.Add(new Vector2(xMin, corrY));
                }
                else
                {
                    float corrW = w * 0.65f;
                    float corrX = xMin + w * 0.175f;
                    shapeVertices.Add(new Vector2(corrX, yMax));
                    shapeVertices.Add(new Vector2(corrX + corrW, yMax));
                    shapeVertices.Add(new Vector2(corrX + corrW, yMin));
                    shapeVertices.Add(new Vector2(corrX, yMin));
                }
                break;
        }
    }


    private void CreateWallLine(float x1, float y1, float x2, float y2, bool vertical, float gapCenter, float gapHalf)
    {
        float total = vertical ? Mathf.Abs(y2 - y1) : Mathf.Abs(x2 - x1);
        float dir = vertical ? Mathf.Sign(y2 - y1) : Mathf.Sign(x2 - x1);
        float ox = x1, oy = y1;
        int count = 0;

        // Tamaño de cada bloque = tamaño BASE del sprite (afectado por escalaSpritePared)
        float blockSize = vertical ? spriteHeight : spriteWidth;

        // Si no hay hueco: colocar bloques hasta cubrir la distancia
        if (float.IsNaN(gapCenter))
        {
            float pos = 0f;
            while (pos < total - 0.01f)
            {
                PlaceWallBlock(ox, oy, dir, vertical, pos, count++);
                pos += blockSize;
            }
            return;
        }

        // Hay hueco
        float gapStartLocal = gapCenter - gapHalf - (vertical ? y1 : x1);
        float gapEndLocal = gapCenter + gapHalf - (vertical ? y1 : x1);
        gapStartLocal = Mathf.Clamp(gapStartLocal, 0, total);
        gapEndLocal = Mathf.Clamp(gapEndLocal, 0, total);

        // Primer tramo
        float pos2 = 0f;
        while (pos2 < gapStartLocal - 0.01f)
        {
            PlaceWallBlock(ox, oy, dir, vertical, pos2, count++);
            pos2 += blockSize;
        }

        // Segundo tramo
        pos2 = gapEndLocal;
        while (pos2 < total - 0.01f)
        {
            PlaceWallBlock(ox, oy, dir, vertical, pos2, count++);
            pos2 += blockSize;
        }
    }

    /// <summary>
    /// Coloca UN bloque de pared del tamaño EXACTO del sprite, sin estirar
    /// </summary>
    private void PlaceWallBlock(float ox, float oy, float dir, bool vertical, float offset, int index)
    {
        float halfBlock = (vertical ? spriteHeight : spriteWidth) * 0.5f;
        Vector2 center = vertical
            ? new Vector2(ox, oy + dir * (offset + halfBlock))
            : new Vector2(ox + dir * (offset + halfBlock), oy);

        // Tamaño EXACTO: en X = ancho del sprite, en Y = alto del sprite
        // Esto se aplica ANTES de la rotación
        Vector2 blockSize = new Vector2(spriteWidth, spriteHeight);

        GameObject obj = new GameObject("Pared", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(wallLayer, false);
        Image img = obj.GetComponent<Image>();
        img.sprite = spritePared;
        img.color = Color.white;
        img.preserveAspect = false;
        img.type = Image.Type.Simple;
        img.raycastTarget = false;

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

            Vector2 pos = new Vector2(
                Random.Range(bounds.xMin + 120f, bounds.xMax - 120f),
                Random.Range(bounds.yMin + 100f, bounds.yMax - 100f));

            if (!IsPointInsideShape(pos)) continue;

            Vector2 size = new Vector2(spriteWidth, spriteHeight * numBlocks);
            // Para verticales, el tamaño base es el mismo (luego se rota)

            if (!CanPlaceInternalWall(CreateRect(pos, vert ? new Vector2(thickness, len) : new Vector2(len, thickness)))) continue;
            if (solutionPath.Count > 0 && BlocksSolutionPath(CreateExpandedRect(pos, vert ? new Vector2(thickness, len) : new Vector2(len, thickness), radioRata))) continue;

            GameObject obj = new GameObject("ParedInterna", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(wallLayer, false);
            Image img = obj.GetComponent<Image>();
            img.sprite = spritePared;
            img.color = Color.white;
            img.preserveAspect = false;
            img.type = Image.Type.Simple;
            img.raycastTarget = false;

            RectTransform rect = obj.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0.5f, 0.5f);
            rect.anchoredPosition = pos;
            rect.sizeDelta = size;
            rect.localRotation = Quaternion.Euler(0, 0, vert ? 90f : 0f);

            walls.Add(rect);
            internalWalls.Add(rect);
            placed++;
        }
    }

    private bool CanPlaceInternalWall(Rect rect)
    {
        if (OverlapsCircle(rect, ratStart, radioRata + 72f)) return false;
        if (DistanceToExit(rect.center) < exitLength * 0.85f) return false;
        if (CreateRect(ExitPoint(), Vector2.one * (exitLength + 90f)).Overlaps(rect)) return false;
        foreach (var w in internalWalls)
            if (CreateExpandedRect(w.anchoredPosition, w.sizeDelta, grosorPared * 2f).Overlaps(rect)) return false;
        return true;
    }


    // ============================================================
    // TRAMPAS
    // ============================================================
    private void BuildTrapsPreliminar(int count)
    {
        ClearTraps();
        if (count <= 0) return;
        Rect bounds = PlayBounds();
        int placed = 0, guard = 0;

        while (placed < count && guard < 150)
        {
            guard++;
            Vector2 size = new Vector2(Random.Range(68f, 120f), Random.Range(48f, 92f));
            Vector2 pos = new Vector2(Random.Range(bounds.xMin + 90f, bounds.xMax - 90f), Random.Range(bounds.yMin + 80f, bounds.yMax - 80f));

            if (!IsPointInsideShape(pos)) continue;

            Rect rect = CreateRect(pos, size);

            if (OverlapsCircle(rect, ratStart, radioRata + 58f)) continue;
            if (DistanceToExit(pos) < exitLength * 0.65f) continue;
            if (OverlapsAnyInternalWall(rect)) continue;
            if (AnyOverlap(rect)) continue;

            GameObject obj = new GameObject("Ratonera", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(trapLayer, false);
            Trap trap = new Trap { rect = obj.GetComponent<RectTransform>(), image = obj.GetComponent<Image>() };
            trap.rect.anchorMin = trap.rect.anchorMax = trap.rect.pivot = new Vector2(0.5f, 0.5f);
            trap.rect.anchoredPosition = pos;
            trap.rect.sizeDelta = size;
            if (spriteTrampa != null) { trap.image.sprite = spriteTrampa; trap.image.color = Color.white; trap.image.preserveAspect = true; }
            else trap.image.color = colorTrampa;
            trap.image.raycastTarget = false;

            traps.Add(trap);
            placed++;
        }
    }

    // Verifica si alguna trampa bloquea la ruta
    private bool TrapsBlockPath(List<Vector2> path)
    {
        if (path.Count < 2) return false;

        foreach (var trap in traps)
        {
            Rect r = CreateRect(trap.rect.anchoredPosition, trap.rect.sizeDelta);
            r.xMin -= radioRata;
            r.xMax += radioRata;
            r.yMin -= radioRata;
            r.yMax += radioRata;

            // Comprobar cada segmento de la ruta
            for (int i = 0; i < path.Count - 1; i++)
            {
                if (SegmentIntersectsRect(path[i], path[i + 1], r))
                    return true;
            }
        }
        return false;
    }

    // Comprueba si un segmento de línea intersecta un rectángulo
    private bool SegmentIntersectsRect(Vector2 a, Vector2 b, Rect rect)
    {
        // Si alguno de los extremos está dentro, hay intersección
        if (rect.Contains(a) || rect.Contains(b)) return true;

        // Comprobar intersección con los 4 lados del rectángulo
        Vector2[] corners = new Vector2[]
        {
        new Vector2(rect.xMin, rect.yMin),
        new Vector2(rect.xMax, rect.yMin),
        new Vector2(rect.xMax, rect.yMax),
        new Vector2(rect.xMin, rect.yMax)
        };

        for (int i = 0; i < 4; i++)
        {
            Vector2 c1 = corners[i];
            Vector2 c2 = corners[(i + 1) % 4];

            if (LinesIntersect(a, b, c1, c2))
                return true;
        }

        return false;
    }

    // Intersección de dos segmentos
    private bool LinesIntersect(Vector2 p1, Vector2 p2, Vector2 p3, Vector2 p4)
    {
        float d1 = Direction(p3, p4, p1);
        float d2 = Direction(p3, p4, p2);
        float d3 = Direction(p1, p2, p3);
        float d4 = Direction(p1, p2, p4);

        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)))
            return true;

        return false;
    }

    private float Direction(Vector2 a, Vector2 b, Vector2 c)
    {
        return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
    }
    private void BuildTraps(int count, List<Vector2> pathNormal, List<Vector2> pathExtra = null)
    {
        ClearTraps();
        if (count <= 0) return;
        Rect bounds = PlayBounds();
        int placed = 0, guard = 0;

        while (placed < count && guard < 150)
        {
            guard++;
            Vector2 size = new Vector2(Random.Range(68f, 120f), Random.Range(48f, 92f));
            Vector2 pos = new Vector2(Random.Range(bounds.xMin + 90f, bounds.xMax - 90f), Random.Range(bounds.yMin + 80f, bounds.yMax - 80f));

            if (!IsPointInsideShape(pos)) continue;

            Rect rect = CreateRect(pos, size);

            if (OverlapsCircle(rect, ratStart, radioRata + 58f)) continue;
            if (DistanceToExit(pos) < exitLength * 0.65f) continue;
            if (OverlapsAnyInternalWall(rect)) continue;
            if (AnyOverlap(rect)) continue;

            // No bloquear las rutas
            if (BlocksPath(rect, pathNormal)) continue;
            if (pathExtra != null && BlocksPath(rect, pathExtra)) continue;

            GameObject obj = new GameObject("Ratonera", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            obj.transform.SetParent(trapLayer, false);
            Trap trap = new Trap { rect = obj.GetComponent<RectTransform>(), image = obj.GetComponent<Image>() };
            trap.rect.anchorMin = trap.rect.anchorMax = trap.rect.pivot = new Vector2(0.5f, 0.5f);
            trap.rect.anchoredPosition = pos;
            trap.rect.sizeDelta = size;
            if (spriteTrampa != null) { trap.image.sprite = spriteTrampa; trap.image.color = Color.white; trap.image.preserveAspect = true; }
            else trap.image.color = colorTrampa;
            trap.image.raycastTarget = false;

            traps.Add(trap);
            placed++;
        }
    }

    private bool BlocksPath(Rect rect, List<Vector2> path)
    {
        Rect expanded = rect;
        expanded.xMin -= radioRata;
        expanded.xMax += radioRata;
        expanded.yMin -= radioRata;
        expanded.yMax += radioRata;

        foreach (Vector2 point in path)
        {
            if (expanded.Contains(point))
                return true;
        }
        return false;
    }
    // Nuevo método auxiliar
    private bool BlocksSolutionPath(Rect trapRect)
    {
        // Expandir el rect de la trampa con el radio de la rata
        Rect expanded = trapRect;
        expanded.xMin -= radioRata;
        expanded.xMax += radioRata;
        expanded.yMin -= radioRata;
        expanded.yMax += radioRata;

        // Comprobar si algún punto del camino de solución toca la trampa
        foreach (Vector2 point in solutionPath)
        {
            if (expanded.Contains(point))
                return true;
        }
        return false;
    }


    // ============================================================
    // POWER-UPS
    // ============================================================

    private void BuildPowerUps(int count, List<Vector2> pathNormal, List<Vector2> pathExtra = null)
    {
        // El power-up de rebote ya se colocó en PlacePowerUpOnPath
        // Aquí solo colocamos power-ups de vida
        if (count < 2) return;

        Rect bounds = PlayBounds();

        for (int g = 0; g < 100; g++)
        {
            Vector2 pos = new Vector2(Random.Range(bounds.xMin + 80f, bounds.xMax - 80f), Random.Range(bounds.yMin + 70f, bounds.yMax - 70f));
            if (!IsPointInsideShape(pos)) continue;

            Rect rect = CreateRect(pos, new Vector2(50f, 50f));
            if (OverlapsCircle(rect, ratStart, radioRata + 70f)) continue;
            if (DistanceToExit(pos) < exitLength * 0.7f) continue;
            if (OverlapsAnyInternalWall(rect)) continue;
            if (AnyOverlap(rect)) continue;
            if (BlocksPath(rect, pathNormal)) continue;
            if (pathExtra != null && BlocksPath(rect, pathExtra)) continue;

            CreatePowerUpObject(pos, new Vector2(50f, 50f), PowerUpType.ExtraLife);
            return;
        }
    }
    private bool ValidateBouncePowerUpPath(Vector2 checkpoint, int targetBounces)
    {
        List<Vector2> path = new List<Vector2>(100);
        for (int i = 0; i < 180; i++)
        {
            float rad = (i * 360f / 180f) * Mathf.Deg2Rad;
            if (SimulateCheckpoint(new Vector2(Mathf.Cos(rad), Mathf.Sin(rad)), path, checkpoint, targetBounces)) return true;
        }
        return false;
    }

    private bool SimulateCheckpoint(Vector2 dir, List<Vector2> path, Vector2 checkpoint, int targetBounces)
    {
        path.Clear(); path.Add(ratStart);
        Vector2 pos = ratStart, vel = dir.normalized * velocidadRata;
        int bounces = 0; float t = 0f; bool reached = false;
        while (t < ExecutionDurationLimit())
        {
            t += 0.05f;
            bool s; ExecutionFailReason f;
            StepSimulation(ref pos, ref vel, ref bounces, 0.05f, out s, out f);
            if (f != ExecutionFailReason.None) return false;
            if (!reached && Vector2.Distance(pos, checkpoint) < radioRata + 25f) reached = true;
            if (s) return reached && bounces == targetBounces;
            if (bounces > targetBounces) return false;
        }
        return false;
    }

    private void CreateFallbackLevel()
    {
        ClearWalls(); ClearTraps(); ClearPowerUps();
        Rect bounds = PlayBounds();
        exitSide = BoxSide.Right;
        exitCenter = bounds.yMin + bounds.height * 0.5f;
        exitLength = Mathf.Clamp(largoSalidaBase, largoSalidaMin, largoSalidaMax);
        CreateOuterWalls(bounds);
        ratStart = new Vector2(bounds.xMin + bounds.width * 0.3f, bounds.yMin + bounds.height * 0.5f);
        ratPosition = ratStart;
        if (!TryFindSolvableAim(out aimDirection, requiredBounces, 1)) aimDirection = Vector2.right;
    }

    // ============================================================
    // RATA
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
        phase = Phase.Planning;
        ratPosition = ratStart;
        requiredBounces = originalRequiredBounces;
        bouncePowerUpCollected = false;
        ui?.SetBouncePowerUpActive(false);
        PositionRat();
        ui?.HideFeedback();
        UpdateAimFromPointer(true);
        UpdateHud();
        DrawTrajectory();
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

    // ============================================================
    // APUNTADO (CORREGIDO)
    // ============================================================

    private void UpdateAimFromPointer(bool force = false)
    {
        Vector2 pointer;
        if (!TryGetPointerLocal(out pointer))
        {
            pointer = ratStart + aimDirection * 120f;
        }

        if (!force && Vector2.Distance(pointer, lastPointerLocal) < 1.5f)
            return;

        lastPointerLocal = pointer;
        Vector2 direction = pointer - ratStart;

        if (direction.sqrMagnitude > 12f)
        {
            aimDirection = direction.normalized;
            currentMoveDirection = aimDirection;
        }

        ApplyRatRotation();
        DrawTrajectory();
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
        phase = Phase.Executing;
        ui?.HideFeedback();
        UpdateHud();
        attempts++;
        totalRequiredBounces += requiredBounces;

        Vector2 pos = ratStart, vel = aimDirection * velocidadRata;
        currentMoveDirection = vel.normalized;
        int usedBounces = 0;
        float elapsed = 0f, closest = DistanceToExit(pos);
        ExecutionFailReason failReason = ExecutionFailReason.None;
        bool success = false;
        bouncePowerUpCollected = false;

        while (elapsed < ExecutionDurationLimit() && !gameFinished)
        {
            if (juegoPausado) { yield return null; continue; }
            float dt = Time.deltaTime;
            elapsed += dt;
            StepSimulation(ref pos, ref vel, ref usedBounces, dt, out success, out failReason);
            currentMoveDirection = vel.normalized;
            closest = Mathf.Min(closest, DistanceToExit(pos));
            CheckPowerUpCollection(pos);
            ratPosition = pos;
            ratRect.anchoredPosition = pos;
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

    private void RegisterAttempt(bool success, ExecutionFailReason failReason, int usedBounces)
    {
        phase = Phase.Feedback;

        if (success)
        {
            regenerateAfterFeedback = true;
            successes++;
            currentStreak++;
            bestStreak = Mathf.Max(bestStreak, currentStreak);
            int needed = Mathf.Max(1, pruebasParaSubirNivel);
            successesInCurrentLevel = Mathf.Min(successesInCurrentLevel + 1, needed);

            if (successesInCurrentLevel >= needed && currentLevel < nivelMaximo)
            {
                currentLevel++;
                remainingAttempts = Mathf.Max(1, intentosMaximos);
                successesInCurrentLevel = 0;
                SyncDifficultyLevel();
                ui?.ShowFeedback($"Nivel {currentLevel}: ahora son {RequiredBouncesForLevel(currentLevel)} rebotes", true);
                AudioManager.Instance?.NivelUp();
            }
            else
            {
                ui?.ShowFeedback($"Salida correcta {successesInCurrentLevel}/{needed}", true);
                AudioManager.Instance?.Acierto();
            }

            requiredBounces = originalRequiredBounces;
            bouncePowerUpCollected = false;
            ui?.SetBouncePowerUpActive(false);
        }
        else
        {
            bool hadExtraLife = ui != null && ui.ConsumeExtraLife();

            if (!hadExtraLife)
                remainingAttempts = Mathf.Max(0, remainingAttempts - 1);

            regenerateAfterFeedback = false;
            currentStreak = 0;

            string failMessage;
            switch (failReason)
            {
                case ExecutionFailReason.Trap:
                    trapHits++;
                    failMessage = "Ratonera.";
                    break;
                case ExecutionFailReason.WrongBounceCount:
                    wrongBounceFails++;
                    failMessage = $"Rebotes incorrectos: {usedBounces}/{requiredBounces}.";
                    break;
                default:
                    noExitFails++;
                    failMessage = "La rata no encontró la salida.";
                    break;
            }

            if (hadExtraLife)
                failMessage += " ¡Vida extra usada!";

            failMessage += $" Intentos {remainingAttempts}/{Mathf.Max(1, intentosMaximos)}";
            ui?.ShowFeedback(failMessage, false);
            AudioManager.Instance?.Error();
        }

        UpdateHud();
        StartCoroutine(NextRoundAfterDelay());
    }

    private void CheckPowerUpCollection(Vector2 pos)
    {
        for (int i = powerUps.Count - 1; i >= 0; i--)
        {
            PowerUp pu = powerUps[i];
            if (pu.collected) continue;
            Rect r = CreateRect(pu.rect.anchoredPosition, pu.rect.sizeDelta);
            r.xMin -= radioRata; r.xMax += radioRata; r.yMin -= radioRata; r.yMax += radioRata;
            if (!r.Contains(pos)) continue;

            Debug.Log($"PowerUp recogido: {pu.type} en frame {Time.frameCount}");


            pu.collected = true;
            if (pu.type == PowerUpType.ExtraBounce)
            {
                requiredBounces++;
                bouncePowerUpCollected = true;
                ui?.SetBouncePowerUpActive(true);
                ui?.ShowFeedback("¡+1 Rebote!", true);
            }
            else
            {
                ui?.AddExtraLife();
                ui?.ShowFeedback("¡+1 Vida!", true);
            }
            pu.image.enabled = false;
            StartCoroutine(FlashFeedback());
        }
    }

    private IEnumerator FlashFeedback()
    {
        yield return new WaitForSecondsRealtime(0.5f);
        if (!juegoPausado) ui?.HideFeedback();
    }

    private IEnumerator NextRoundAfterDelay()
    {
        yield return new WaitForSecondsRealtime(1.2f);
        if (gameFinished) yield break;
        if (remainingAttempts <= 0) { FinishGameNow(); yield break; }
        if (regenerateAfterFeedback) GenerateRound();
        else ResetCurrentPuzzleAttempt();
    }

    // ============================================================
    // TRAYECTORIA
    // ============================================================

    private void DrawTrajectory()
    {
        ClearTrajectory();

        // Dibujar la preview normal solo en Planning
        if (phase == Phase.Planning)
        {
            int level = CurrentLevel();
            int previewBounces = level <= 4 ? rebotesPreviewNivelBajo : rebotesPreviewNivelMedio;
            int postSteps = level <= 4 ? pasosTrasReboteBajo : level <= 6 ? pasosTrasReboteMedio : pasosTrasReboteAlto;

            Vector2 pos = ratStart, vel = aimDirection * velocidadRata;
            int bounces = 0, dotsAfter = 0;
            float t = 0f;

            while (t < ExecutionDurationLimit() && trajectoryDots.Count < 80)
            {
                t += 0.045f;
                int before = bounces;
                bool s; ExecutionFailReason f;
                StepSimulation(ref pos, ref vel, ref bounces, 0.045f, out s, out f);
                if (s || f != ExecutionFailReason.None) break;

                CreateTrajectoryDot(pos, colorTrayectoria);

                if (bounces >= previewBounces && bounces > 0)
                {
                    if (bounces == before) dotsAfter++;
                    if (dotsAfter >= postSteps) break;
                }
                if (bounces > previewBounces) break;
            }
        }

        // Dibujar solución debug SIEMPRE que esté activado y haya solución
        if (mostrarSolucionDebug && solutionPath.Count > 0)
        {
            for (int i = 0; i < solutionPath.Count; i++)
                CreateTrajectoryDot(solutionPath[i], colorSolucionDebug, 12f);
        }
    }


    private void CreateTrajectoryDot(Vector2 pos, Color color, float size = 8f)
    {
        GameObject obj = new GameObject("Dot", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        obj.transform.SetParent(trajectoryLayer, false);
        Image img = obj.GetComponent<Image>();
        img.color = color;
        img.raycastTarget = false;
        RectTransform rect = obj.GetComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = rect.pivot = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = Vector2.one * size;
        rect.anchoredPosition = pos;
        trajectoryDots.Add(rect);
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

        // 1. Trampas
        if (HitsTrap(next))
        {
            pos = next;
            failReason = ExecutionFailReason.Trap;
            return;
        }

        // 2. Paredes internas
        // 2. Paredes internas
        if (TryBounceInternal(pos, ref next, ref vel))
        {
            bounces++;
            if (bounces > requiredBounces)
                failReason = ExecutionFailReason.WrongBounceCount;
            pos = next;
            return; // Salir inmediatamente, no comprobar bordes exteriores
        }
        // 3. COMPROBAR PRIMERO SI HA SALIDO COMPLETAMENTE POR EL HUECO
        //    Si ya está fuera del área Y alineado con el hueco, es éxito.
        if (IsCompletelyOutside(next) && IsAlignedWithHole(next))
        {
            pos = next;
            bool valid = bounces == requiredBounces || (bouncePowerUpCollected && bounces == requiredBounces + 1);
            if (valid) success = true;
            else failReason = ExecutionFailReason.WrongBounceCount;
            return;
        }

        // 4. Comprobar si ha tocado un borde exterior
        BoxSide crossedSide;
        float l = bounds.xMin + radioRata - next.x;
        float r = next.x - (bounds.xMax - radioRata);
        float b = bounds.yMin + radioRata - next.y;
        float t = next.y - (bounds.yMax - radioRata);
        float max = Mathf.Max(l, r, b, t);

        if (max <= 0f)
        {
            // Sigue dentro, no hay colisión
            pos = next;
            return;
        }

        // Determinar qué lado ha cruzado
        if (max == l) crossedSide = BoxSide.Left;
        else if (max == r) crossedSide = BoxSide.Right;
        else if (max == b) crossedSide = BoxSide.Bottom;
        else crossedSide = BoxSide.Top;

        // 5. SI está cruzando JUSTO por el hueco de salida, NO contamos rebote
        //    Simplemente dejamos que siga avanzando (en el siguiente frame saldrá)
        if (crossedSide == exitSide && IsAlignedWithHole(next))
        {
            // No sumamos rebote, la rata está atravesando el hueco
            pos = next;
            return;
        }

        // 6. Si no es el hueco, es un rebote normal en pared exterior
        bounces++;
        if (bounces > requiredBounces)
        {
            pos = next;
            failReason = ExecutionFailReason.WrongBounceCount;
            return;
        }

        // Rebotar
        switch (crossedSide)
        {
            case BoxSide.Left: next.x = bounds.xMin + radioRata; vel.x *= -1f; break;
            case BoxSide.Right: next.x = bounds.xMax - radioRata; vel.x *= -1f; break;
            case BoxSide.Bottom: next.y = bounds.yMin + radioRata; vel.y *= -1f; break;
            case BoxSide.Top: next.y = bounds.yMax - radioRata; vel.y *= -1f; break;
        }
        pos = next;
    }


    // Métodos auxiliares nuevos (añádelos a la clase)

    private bool IsPointInsideShape(Vector2 point)
    {
        if (shapeVertices.Count < 3) return false;

        // Algoritmo Ray Casting para punto dentro de polígono
        bool inside = false;
        int j = shapeVertices.Count - 1;

        for (int i = 0; i < shapeVertices.Count; i++)
        {
            Vector2 vi = shapeVertices[i];
            Vector2 vj = shapeVertices[j];

            if (((vi.y > point.y) != (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x))
            {
                inside = !inside;
            }
            j = i;
        }

        return inside;
    }

    // ¿Está completamente fuera de los límites de juego?
    private bool IsCompletelyOutside(Vector2 point)
    {
        Rect bounds = PlayBounds();

        // Para formas no rectangulares, comprobamos si está fuera del bounding box
        // y alineado con el hueco
        bool outsideBounds = point.x < bounds.xMin - radioRata || point.x > bounds.xMax + radioRata ||
                             point.y < bounds.yMin - radioRata || point.y > bounds.yMax + radioRata;

        if (!outsideBounds) return false;

        // Verificar que está saliendo por el lado correcto
        switch (exitSide)
        {
            case BoxSide.Top: return point.y > bounds.yMax;
            case BoxSide.Bottom: return point.y < bounds.yMin;
            case BoxSide.Right: return point.x > bounds.xMax;
            case BoxSide.Left: return point.x < bounds.xMin;
        }
        return false;
    }

    // ¿Está alineado con el hueco de salida en el eje correcto?
    private bool IsAlignedWithHole(Vector2 point)
    {
        float half = exitLength * 0.5f;
        switch (exitSide)
        {
            case BoxSide.Top:
            case BoxSide.Bottom:
                return point.x >= exitCenter - half && point.x <= exitCenter + half;
            case BoxSide.Left:
            case BoxSide.Right:
                return point.y >= exitCenter - half && point.y <= exitCenter + half;
        }
        return false;
    }




    private bool TryBounceInternal(Vector2 current, ref Vector2 next, ref Vector2 vel)
    {
        for (int i = 0; i < internalWalls.Count; i++)
        {
            RectTransform w = internalWalls[i];
            if (w == null) continue;
            Rect wr = CreateExpandedRect(w.anchoredPosition, w.sizeDelta, radioRata);
            if (!wr.Contains(next)) continue;

            bool bounceX = ShouldBounceX(current, next, wr, w.sizeDelta);
            if (bounceX)
            {
                vel.x *= -1f;
                next.x = current.x <= wr.center.x ? wr.xMin - 0.5f : wr.xMax + 0.5f;
                next.y = current.y;
            }
            else
            {
                vel.y *= -1f;
                next.y = current.y <= wr.center.y ? wr.yMin - 0.5f : wr.yMax + 0.5f;
                next.x = current.x;
            }

            Rect bounds = PlayBounds();
            next.x = Mathf.Clamp(next.x, bounds.xMin + radioRata, bounds.xMax - radioRata);
            next.y = Mathf.Clamp(next.y, bounds.yMin + radioRata, bounds.yMax - radioRata);
            return true; // Solo un rebote por frame
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
    // VALIDACIÓN
    // ============================================================

    private bool TryFindSolvableAim(out Vector2 dir, int targetBounces, int minWalls)
    {
        dir = Vector2.right; solutionPath.Clear();
        // Menos samples para ir más rápido
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
            return true;
        }
        return false;
    }
    private bool SimulateDetailed(Vector2 dir, List<Vector2> path, List<int> hitWalls, int targetBounces)
    {
        path.Clear(); hitWalls.Clear(); path.Add(ratStart);
        Vector2 pos = ratStart, vel = dir.normalized * velocidadRata;
        int bounces = 0; float t = 0f;

        while (t < ExecutionDurationLimit())
        {
            t += 0.05f;
            int before = bounces;
            bool s; ExecutionFailReason f;
            StepSimulation(ref pos, ref vel, ref bounces, 0.05f, out s, out f);

            if (f == ExecutionFailReason.WrongBounceCount) return false;
            if (f == ExecutionFailReason.Trap) return false;

            // AÑADIR puntos intermedios (cada 3 steps para no sobrecargar)
            if (path.Count % 3 == 0)
                path.Add(pos);

            if (bounces > before)
            {
                int wi = IdentifyHitWall(pos);
                if (wi >= 0 && !IsExitBounce(wi, pos))
                    hitWalls.Add(wi);
            }

            if (s)
            {
                path.Add(pos); // punto final
                return bounces == targetBounces;
            }

            if (bounces > targetBounces) return false;
        }
        return false;
    }

    // Nuevo método auxiliar
    private bool IsExitBounce(int wallIndex, Vector2 pos)
    {
        // Si el rebote fue contra una pared exterior que coincide con el lado de salida
        if (wallIndex >= 1 && wallIndex <= 4)
        {
            BoxSide hitSide = (BoxSide)(wallIndex - 1);
            if (hitSide == exitSide)
            {
                float half = exitLength * 0.5f;
                switch (exitSide)
                {
                    case BoxSide.Top:
                    case BoxSide.Bottom:
                        return pos.x >= exitCenter - half && pos.x <= exitCenter + half;
                    case BoxSide.Left:
                    case BoxSide.Right:
                        return pos.y >= exitCenter - half && pos.y <= exitCenter + half;
                }
            }
        }
        return false;
    }

    private int IdentifyHitWall(Vector2 pos)
    {
        for (int i = 0; i < internalWalls.Count; i++)
            if (CreateExpandedRect(internalWalls[i].anchoredPosition, internalWalls[i].sizeDelta, radioRata + 5f).Contains(pos))
                return 100 + i;

        Rect bounds = PlayBounds();
        if (Mathf.Abs(pos.x - bounds.xMin) < radioRata + 2f) return 0;  // Left
        if (Mathf.Abs(pos.x - bounds.xMax) < radioRata + 2f) return 1;  // Right
        if (Mathf.Abs(pos.y - bounds.yMin) < radioRata + 2f) return 2;  // Bottom
        if (Mathf.Abs(pos.y - bounds.yMax) < radioRata + 2f) return 3;  // Top
        return -1;
    }
    // ============================================================
    // UTILIDADES
    // ============================================================

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

    private int CurrentLevel() { if (currentLevel <= 0) currentLevel = Mathf.Clamp(nivelInicial, 1, nivelMaximo); return Mathf.Clamp(currentLevel, 1, nivelMaximo); }
    private int RequiredBouncesForLevel(int l) => Mathf.Clamp(rebotesObjetivoNivel1 + Mathf.Max(0, (l - 1) / 2) * Mathf.Max(1, rebotesExtraPorNivel), 1, rebotesMaximos);
    private float BoxScaleForLevel(int l) => Mathf.Lerp(escalaCajaNivel1, escalaCajaNivel10, Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f)));
    private int TrapCountForLevel(int l)
    {
        // Antes: return l <= 2 ? 0 : ...
        // Ahora: mínimo 1 trampa desde nivel 1
        if (l <= 1) return 1;
        float t = Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f));
        return Mathf.RoundToInt(Mathf.Lerp(1, trampasNivel10, t));
    }

    private int InternalWallCountForLevel(int l)
    {
        // Antes: return l <= 2 ? 0 : ...
        // Ahora: mínimo 1 muro desde nivel 1
        if (l <= 1) return 1;
        float t = Mathf.Clamp01((l - 1f) / Mathf.Max(1f, nivelMaximo - 1f));
        return Mathf.RoundToInt(Mathf.Lerp(1, paredesInternasNivel10, t));
    }
    private int PowerUpCountForLevel(int l)
    {
        if (l <= 1) return 1; // Nivel 1: 1 power-up
        if (l <= 3) return 1; // Niveles 2-3: 1 power-up
        if (l <= 6) return 2; // Niveles 4-6: 2 power-ups
        return 2;             // Niveles 7+: 2 power-ups
    }
    private void SyncDifficultyLevel() { currentLevel = Mathf.Clamp(currentLevel, 1, nivelMaximo); maxLevelReached = Mathf.Max(maxLevelReached, currentLevel); if (DifficultyManager.Instance != null) DifficultyManager.Instance.nivelActual = currentLevel; }
    private void DisableGenericTimer() { if (GameManager.Instance != null && GameManager.Instance.estaJugando) GameManager.Instance.tiempoRestante = 99999f; }
    private float ExecutionDurationLimit() => Mathf.Max(duracionMaximaEjecucion, 5f + requiredBounces * 1.45f);

    private bool PointerInsidePlayArea() { Vector2 p; return TryGetPointerLocal(out p) && playArea.rect.Contains(p); }
    private bool TryGetPointerLocal(out Vector2 local) { local = Vector2.zero; if (playArea == null) return false; Canvas c = playArea.GetComponentInParent<Canvas>(); Camera cam = c != null && c.renderMode != RenderMode.ScreenSpaceOverlay ? c.worldCamera : null; return RectTransformUtility.ScreenPointToLocalPointInRectangle(playArea, Input.mousePosition, cam, out local); }

    private bool HitsTrap(Vector2 pos) { foreach (var t in traps) { Rect r = CreateRect(t.rect.anchoredPosition, t.rect.sizeDelta); r.xMin -= radioRata; r.xMax += radioRata; r.yMin -= radioRata; r.yMax += radioRata; if (r.Contains(pos)) return true; } return false; }
    private Rect CreateRect(Vector2 c, Vector2 s) => new Rect(c - s * 0.5f, s);
    private Rect CreateExpandedRect(Vector2 c, Vector2 s, float p) { Rect r = CreateRect(c, s); r.xMin -= p; r.xMax += p; r.yMin -= p; r.yMax += p; return r; }
    private bool OverlapsAnyInternalWall(Rect rect) { foreach (var w in internalWalls) if (CreateExpandedRect(w.anchoredPosition, w.sizeDelta, radioRata + 14f).Overlaps(rect)) return true; return false; }
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
    private void ClearWalls() { for (int i = walls.Count - 1; i >= 0; i--) if (walls[i] != null) Destroy(walls[i].gameObject); walls.Clear(); internalWalls.Clear(); }
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
        float prec = (float)successes / attempts;
        float trap = 1f - Mathf.Clamp01((float)trapHits / attempts);
        float acc = 1f - Mathf.Clamp01(Mathf.Abs(totalRequiredBounces - totalUsedBounces) / Mathf.Max(1f, totalRequiredBounces + attempts));
        float dist = totalExitDistanceScore / attempts;
        float streak = Mathf.Clamp01(bestStreak / 4f);
        float lvl = Mathf.Lerp(0.75f, 1f, Mathf.Clamp01(maxLevelReached / 10f));
        m.planificacion = (prec * 0.68f + acc * 0.32f) * lvl;
        m.memoriaTrabajo = (prec * 0.45f + acc * 0.35f + streak * 0.20f) * lvl;
        m.memoriaEspacial = (trap * 0.40f + dist * 0.60f) * prec * lvl;
        m.atencionSostenida = Mathf.Clamp01(attempts / 5f) * (0.45f + prec * 0.55f) * lvl;
        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics w = new CognitiveMetrics();
        w.planificacion = m.planificacion * 0.60f;
        w.memoriaTrabajo = m.memoriaTrabajo * 0.20f;
        w.memoriaEspacial = m.memoriaEspacial * 0.15f;
        w.atencionSostenida = m.atencionSostenida * 0.05f;
        return w;
    }
}