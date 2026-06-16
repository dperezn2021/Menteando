using TMPro;
using UnityEngine;
using UnityEngine.UI;

public enum SimpleShapeKind
{
    Circle,
    Square,
    Triangle,
    Diamond,
    Hexagon
}

public class SimpleShapeGraphic : MaskableGraphic
{
    public SimpleShapeKind shape = SimpleShapeKind.Circle;
    [Range(12, 64)] public int circleSegments = 40;

    public void SetShape(SimpleShapeKind newShape, Color newColor)
    {
        shape = newShape;
        color = newColor;
        SetVerticesDirty();
    }

    protected override void OnPopulateMesh(VertexHelper vh)
    {
        vh.Clear();

        Rect rect = GetPixelAdjustedRect();
        Vector2 center = rect.center;
        float radius = Mathf.Min(rect.width, rect.height) * 0.48f;

        switch (shape)
        {
            case SimpleShapeKind.Circle:
                AddRegularPolygon(vh, center, radius, Mathf.Max(12, circleSegments), -90f);
                break;
            case SimpleShapeKind.Square:
                AddPolygon(vh, new[]
                {
                    new Vector2(center.x - radius, center.y - radius),
                    new Vector2(center.x - radius, center.y + radius),
                    new Vector2(center.x + radius, center.y + radius),
                    new Vector2(center.x + radius, center.y - radius)
                });
                break;
            case SimpleShapeKind.Triangle:
                AddRegularPolygon(vh, center, radius, 3, 90f);
                break;
            case SimpleShapeKind.Diamond:
                AddPolygon(vh, new[]
                {
                    new Vector2(center.x, center.y + radius),
                    new Vector2(center.x + radius, center.y),
                    new Vector2(center.x, center.y - radius),
                    new Vector2(center.x - radius, center.y)
                });
                break;
            case SimpleShapeKind.Hexagon:
                AddRegularPolygon(vh, center, radius, 6, 30f);
                break;
        }
    }

    private void AddRegularPolygon(VertexHelper vh, Vector2 center, float radius, int sides, float angleOffset)
    {
        Vector2[] points = new Vector2[sides];

        for (int i = 0; i < sides; i++)
        {
            float angle = (angleOffset + i * 360f / sides) * Mathf.Deg2Rad;
            points[i] = center + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * radius;
        }

        AddPolygon(vh, points);
    }

    private void AddPolygon(VertexHelper vh, Vector2[] points)
    {
        if (points == null || points.Length < 3)
            return;

        Vector2 center = Vector2.zero;
        for (int i = 0; i < points.Length; i++)
            center += points[i];
        center /= points.Length;

        UIVertex vertex = UIVertex.simpleVert;
        vertex.color = color;
        vertex.position = center;
        vh.AddVert(vertex);

        for (int i = 0; i < points.Length; i++)
        {
            vertex.position = points[i];
            vh.AddVert(vertex);
        }

        for (int i = 0; i < points.Length; i++)
        {
            int next = i == points.Length - 1 ? 1 : i + 2;
            vh.AddTriangle(0, i + 1, next);
        }
    }
}

public static class RuntimeMiniGameUI
{
    public static readonly Color Background = new Color(0.045f, 0.07f, 0.09f, 1f);
    public static readonly Color Panel = new Color(0.08f, 0.13f, 0.16f, 0.96f);
    public static readonly Color PanelSoft = new Color(0.11f, 0.18f, 0.22f, 0.9f);
    public static readonly Color Accent = new Color(0.26f, 0.75f, 0.82f, 1f);
    public static readonly Color Good = new Color(0.22f, 0.78f, 0.45f, 1f);
    public static readonly Color Bad = new Color(0.9f, 0.28f, 0.28f, 1f);
    public static readonly Color Text = new Color(0.93f, 0.96f, 0.98f, 1f);
    public static readonly Color MutedText = new Color(0.66f, 0.75f, 0.8f, 1f);

    public static RectTransform CreateGameplayRoot(string rootName, string title, string subtitle)
    {
        Transform parent = ResolveGameplayParent();
        if (parent == null)
            return null;

        UIManager ui = ResolveUIManager();
        HideGameplayChildren(parent, ui != null ? ui.botonPausa : null);

        Transform oldRoot = parent.Find(rootName);
        if (oldRoot != null)
            Object.Destroy(oldRoot.gameObject);

        GameObject rootObject = new GameObject(rootName, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        rootObject.transform.SetParent(parent, false);

        RectTransform root = rootObject.GetComponent<RectTransform>();
        SetRect(root, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
        EnsureSafeAreaIfNeeded(root);

        Image background = rootObject.GetComponent<Image>();
        background.color = Background;
        background.raycastTarget = false;

        RectTransform header = CreatePanel("Header", root, new Color(0.035f, 0.055f, 0.07f, 0.98f));
        SetRect(header, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0f, -104f), new Vector2(0f, 0f));

        TextMeshProUGUI titleText = CreateText("Title", header, title, 36f, Text, TextAlignmentOptions.Left);
        SetRect(titleText.rectTransform, Vector2.zero, Vector2.one, new Vector2(28f, 34f), new Vector2(-260f, -12f));

        TextMeshProUGUI subtitleText = CreateText("Subtitle", header, subtitle, 18f, MutedText, TextAlignmentOptions.Left);
        SetRect(subtitleText.rectTransform, Vector2.zero, Vector2.one, new Vector2(30f, 10f), new Vector2(-260f, -58f));

        if (ui != null && ui.botonPausa != null)
        {
            ui.botonPausa.gameObject.SetActive(true);
            ui.botonPausa.transform.SetAsLastSibling();
        }

        PrepareStaticScreens(title, subtitle);
        Canvas.ForceUpdateCanvases();
        return root;
    }

    public static RectTransform CreatePanel(string name, Transform parent, Color color)
    {
        GameObject panel = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        panel.transform.SetParent(parent, false);

        Image image = panel.GetComponent<Image>();
        image.color = color;
        image.raycastTarget = false;

        return panel.GetComponent<RectTransform>();
    }

    public static Image CreateImage(string name, Transform parent, Color color)
    {
        GameObject imageObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
        imageObject.transform.SetParent(parent, false);

        Image image = imageObject.GetComponent<Image>();
        image.color = color;
        return image;
    }

    public static TextMeshProUGUI CreateText(string name, Transform parent, string value, float size, Color color, TextAlignmentOptions alignment)
    {
        GameObject textObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(TextMeshProUGUI));
        textObject.transform.SetParent(parent, false);

        TextMeshProUGUI text = textObject.GetComponent<TextMeshProUGUI>();
        text.text = value;
        text.fontSize = size;
        text.color = color;
        text.alignment = alignment;
        text.textWrappingMode = TextWrappingModes.Normal;
        text.raycastTarget = false;
        return text;
    }

    public static Button CreateButton(string name, Transform parent, string label, float fontSize, Color color)
    {
        GameObject buttonObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image), typeof(Button));
        buttonObject.transform.SetParent(parent, false);

        Image image = buttonObject.GetComponent<Image>();
        image.color = color;

        Button button = buttonObject.GetComponent<Button>();
        ColorBlock colors = button.colors;
        colors.normalColor = color;
        colors.highlightedColor = Color.Lerp(color, Color.white, 0.12f);
        colors.pressedColor = Color.Lerp(color, Color.black, 0.18f);
        colors.selectedColor = colors.highlightedColor;
        button.colors = colors;

        TextMeshProUGUI buttonText = CreateText("Label", buttonObject.transform, label, fontSize, Text, TextAlignmentOptions.Center);
        SetRect(buttonText.rectTransform, Vector2.zero, Vector2.one, new Vector2(8f, 4f), new Vector2(-8f, -4f));
        return button;
    }

    public static SimpleShapeGraphic CreateShape(string name, Transform parent, SimpleShapeKind shape, Color color)
    {
        GameObject shapeObject = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(SimpleShapeGraphic));
        shapeObject.transform.SetParent(parent, false);

        SimpleShapeGraphic graphic = shapeObject.GetComponent<SimpleShapeGraphic>();
        graphic.SetShape(shape, color);
        return graphic;
    }

    public static void SetRect(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
    {
        rect.anchorMin = anchorMin;
        rect.anchorMax = anchorMax;
        rect.offsetMin = offsetMin;
        rect.offsetMax = offsetMax;
    }

    public static void EnsureSafeAreaIfNeeded(RectTransform rect)
    {
        if (rect == null || HasSafeAreaInParents(rect.transform))
            return;

        if (rect.GetComponent<SafeAreaFitter>() == null)
            rect.gameObject.AddComponent<SafeAreaFitter>();
    }

    public static bool HasSafeAreaInParents(Transform transform)
    {
        Transform current = transform != null ? transform.parent : null;
        while (current != null)
        {
            if (current.GetComponent<SafeAreaFitter>() != null)
                return true;

            current = current.parent;
        }

        return false;
    }

    public static void SetButtonText(Button button, string label)
    {
        if (button == null)
            return;

        TMP_Text text = button.GetComponentInChildren<TMP_Text>(true);
        if (text != null)
            text.text = label;
    }

    public static void PrepareStaticScreens(string title, string subtitle)
    {
        UIManager ui = ResolveUIManager();
        if (ui == null)
            return;

        SetScreenTitle(ui.pantallaInicio, title, subtitle);
        SetScreenTitle(ui.pantallaFinPartida, "FIN DE LA LECCION", "Resultados guardados");
        SetButtonText(ui.botonIniciar, "Jugar");
        SetButtonText(ui.botonAjustesInicio, "Ajustes");
        SetButtonText(ui.botonPausa, "||");
        SetButtonText(ui.botonReanudar, "Reanudar");
        SetButtonText(ui.botonReiniciar, "Reiniciar");
        SetButtonText(ui.botonMenu, "Menu");
        SetButtonText(ui.botonJugarDeNuevo, "Jugar de nuevo");
        SetButtonText(ui.botonMenuFin, "Menu");
    }

    private static void SetScreenTitle(GameObject screen, string title, string subtitle)
    {
        if (screen == null)
            return;

        TMP_Text[] texts = screen.GetComponentsInChildren<TMP_Text>(true);
        if (texts == null || texts.Length == 0)
            return;

        TMP_Text titleText = null;
        float largestSize = -1f;

        for (int i = 0; i < texts.Length; i++)
        {
            if (texts[i].name.ToLowerInvariant().Contains("titulo"))
            {
                titleText = texts[i];
                break;
            }

            if (texts[i].fontSize > largestSize)
            {
                largestSize = texts[i].fontSize;
                titleText = texts[i];
            }
        }

        if (titleText != null)
            titleText.text = title;

        for (int i = 0; i < texts.Length; i++)
        {
            if (texts[i] == titleText)
                continue;

            string current = texts[i].text;
            if (string.IsNullOrWhiteSpace(current) || current.Contains("---") || current == "New Text" || current == "Doble")
            {
                texts[i].text = subtitle;
                break;
            }
        }
    }

    private static Transform ResolveGameplayParent()
    {
        UIManager ui = ResolveUIManager();
        if (ui != null && ui.UIPartida != null)
            return ui.UIPartida.transform;

        Canvas canvas = Object.FindFirstObjectByType<Canvas>(FindObjectsInactive.Include);
        if (canvas != null)
            return canvas.transform;

        GameObject canvasObject = new GameObject("Canvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
        Canvas newCanvas = canvasObject.GetComponent<Canvas>();
        newCanvas.renderMode = RenderMode.ScreenSpaceOverlay;

        CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920f, 1080f);
        scaler.matchWidthOrHeight = 0.5f;
        return canvasObject.transform;
    }

    private static UIManager ResolveUIManager()
    {
        if (UIManager.Instance != null)
            return UIManager.Instance;

        return Object.FindFirstObjectByType<UIManager>(FindObjectsInactive.Include);
    }

    private static void HideGameplayChildren(Transform parent, Button pauseButton)
    {
        for (int i = parent.childCount - 1; i >= 0; i--)
        {
            Transform child = parent.GetChild(i);
            if (pauseButton != null && child == pauseButton.transform)
                continue;

            child.gameObject.SetActive(false);
        }
    }
}
