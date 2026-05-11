using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(GridLayoutGroup))]
public class ResponsiveGridController : MonoBehaviour
{
    public GridLayoutGroup grid;
    public RectTransform container;
    public float minCellSize = 52f;
    public float maxCellSize = 110f;
    public float minSpacing = 6f;
    public float maxSpacing = 16f;
    public Vector2 padding = new Vector2(12f, 12f);

    private int currentRows = 1;
    private int currentColumns = 1;
    private Vector2 lastSize;

    private void Awake()
    {
        if (grid == null)
            grid = GetComponent<GridLayoutGroup>();

        if (container == null)
            container = grid.transform as RectTransform;
    }

    private void Update()
    {
        if (container == null) return;

        Vector2 size = container.rect.size;
        if ((size - lastSize).sqrMagnitude > 0.5f)
        {
            lastSize = size;
            Apply(currentRows, currentColumns);
        }
    }

    public void Apply(int rows, int columns)
    {
        if (grid == null)
            grid = GetComponent<GridLayoutGroup>();

        if (container == null)
            container = grid.transform as RectTransform;

        currentRows = Mathf.Max(1, rows);
        currentColumns = Mathf.Max(1, columns);

        if (container == null || grid == null)
            return;

        float width = Mathf.Max(1f, container.rect.width - padding.x * 2f);
        float height = Mathf.Max(1f, container.rect.height - padding.y * 2f);
        float spacing = Mathf.Clamp(Mathf.Min(width, height) * 0.025f, minSpacing, maxSpacing);
        float cellWidth = (width - spacing * (currentColumns - 1)) / currentColumns;
        float cellHeight = (height - spacing * (currentRows - 1)) / currentRows;
        float rawCell = Mathf.Min(cellWidth, cellHeight);
        float cell = rawCell < minCellSize ? Mathf.Max(24f, rawCell) : Mathf.Clamp(rawCell, minCellSize, maxCellSize);

        grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
        grid.constraintCount = currentColumns;
        grid.spacing = new Vector2(spacing, spacing);
        grid.cellSize = new Vector2(cell, cell);
        grid.padding = new RectOffset(
            Mathf.RoundToInt(padding.x),
            Mathf.RoundToInt(padding.x),
            Mathf.RoundToInt(padding.y),
            Mathf.RoundToInt(padding.y)
        );
    }
}
