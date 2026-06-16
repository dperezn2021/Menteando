using TMPro;
using UnityEngine;

[RequireComponent(typeof(RectTransform))]
public class SafeAreaFitter : MonoBehaviour
{
    private RectTransform rectTransform;
    private Rect lastSafeArea;
    private Vector2Int lastScreenSize;
    private Vector2 appliedAnchorMin;
    private Vector2 appliedAnchorMax;

    private void Awake()
    {
        rectTransform = GetComponent<RectTransform>();
        ApplySafeArea();
    }

    private void OnEnable()
    {
        ApplySafeArea();
    }

    private void LateUpdate()
    {
        if (lastSafeArea != Screen.safeArea ||
            lastScreenSize.x != Screen.width ||
            lastScreenSize.y != Screen.height ||
            !Approximately(rectTransform.anchorMin, appliedAnchorMin) ||
            !Approximately(rectTransform.anchorMax, appliedAnchorMax) ||
            !Approximately(rectTransform.offsetMin, Vector2.zero) ||
            !Approximately(rectTransform.offsetMax, Vector2.zero))
        {
            ApplySafeArea();
        }
    }

    public void ApplySafeArea()
    {
        if (rectTransform == null)
            rectTransform = GetComponent<RectTransform>();

        Rect safe = Screen.safeArea;
        lastSafeArea = safe;
        lastScreenSize = new Vector2Int(Screen.width, Screen.height);

        if (Screen.width <= 0 || Screen.height <= 0)
            return;

        Vector2 anchorMin = safe.position;
        Vector2 anchorMax = safe.position + safe.size;
        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        rectTransform.anchorMin = anchorMin;
        rectTransform.anchorMax = anchorMax;
        rectTransform.offsetMin = Vector2.zero;
        rectTransform.offsetMax = Vector2.zero;

        appliedAnchorMin = anchorMin;
        appliedAnchorMax = anchorMax;
    }

    private static bool Approximately(Vector2 a, Vector2 b)
    {
        return Mathf.Approximately(a.x, b.x) && Mathf.Approximately(a.y, b.y);
    }
}

[DisallowMultipleComponent]
public class ResponsiveHudTextFitter : MonoBehaviour
{
    [Range(8f, 28f)] public float minFontSize = 12f;
    [Range(0.25f, 0.85f)] public float minFontScale = 0.45f;

    private Vector2Int lastScreenSize;

    private static readonly string[] HudTokens =
    {
        "hud",
        "header",
        "pizarra",
        "panelhud",
        "tiempo",
        "nivel",
        "racha",
        "acierto",
        "fallo",
        "punto",
        "objetivo",
        "regla",
        "norma",
        "vida",
        "rebote",
        "prueba"
    };

    private void OnEnable()
    {
        ApplyNow();
    }

    private void LateUpdate()
    {
        if (lastScreenSize.x == Screen.width && lastScreenSize.y == Screen.height)
            return;

        ApplyNow();
    }

    public void ApplyNow()
    {
        lastScreenSize = new Vector2Int(Screen.width, Screen.height);

        TMP_Text[] texts = GetComponentsInChildren<TMP_Text>(true);
        for (int i = 0; i < texts.Length; i++)
        {
            if (texts[i] != null && EsTextoHUD(texts[i].transform))
                ConfigurarTexto(texts[i]);
        }
    }

    private bool EsTextoHUD(Transform target)
    {
        Transform current = target;
        while (current != null && current != transform.parent)
        {
            string lowerName = current.name.ToLowerInvariant();
            for (int i = 0; i < HudTokens.Length; i++)
                if (lowerName.Contains(HudTokens[i]))
                    return true;

            if (current == transform)
                break;

            current = current.parent;
        }

        return false;
    }

    private void ConfigurarTexto(TMP_Text text)
    {
        float max = Mathf.Max(text.fontSize, text.fontSizeMax, minFontSize);
        text.enableAutoSizing = true;
        text.fontSizeMax = max;
        text.fontSizeMin = Mathf.Min(text.fontSizeMin > 0f ? text.fontSizeMin : max * minFontScale, max * minFontScale);
        text.fontSizeMin = Mathf.Max(minFontSize, text.fontSizeMin);
        text.textWrappingMode = TextWrappingModes.Normal;
        text.overflowMode = TextOverflowModes.Ellipsis;
        text.raycastTarget = false;
    }
}
