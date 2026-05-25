using UnityEngine;
using TMPro;

public class LoadingDots : MonoBehaviour
{
    public TextMeshProUGUI loadingText;
    private string baseText = "Generando nivel";
    private int dots = 0;
    private float timer = 0f;
    private float updateInterval = 0.2f; // Cada medio segundo cambia

    void Update()
    {
        if (!gameObject.activeSelf) return;

        timer += Time.unscaledDeltaTime;
        if (timer >= updateInterval)
        {
            timer = 0f;
            dots = (dots + 1) % 4;
            string dotStr = new string('.', dots);
            if (loadingText != null)
                loadingText.text = baseText + dotStr;
        }
    }
}