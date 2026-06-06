using TMPro;
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;


public class UITrayectoriasMentales : MonoBehaviour
{
    [Header("Contenedor del juego")]
    public RectTransform gameContainer;

    [Header("Referencias HUD")]
    public TextMeshProUGUI bounceText;
    public TextMeshProUGUI livesText;
    public TextMeshProUGUI attemptText;
    public TextMeshProUGUI levelText;
    public TextMeshProUGUI feedbackText;
    public GameObject loadingScreen;

    [Header("Iconos Power-Up")]
    public Image bouncePowerUpIcon;
    public Image lifePowerUpIcon;
    public TextMeshProUGUI extraLivesCountText;

    [Header("Sprites Power-Up")]
    public Sprite bouncePowerUpSprite;
    public Sprite lifePowerUpSprite;

    [Header("Colores UI")]
    public Color powerUpActiveColor = new Color(1f, 0.84f, 0f, 1f);
    public Color powerUpInactiveColor = new Color(0.3f, 0.3f, 0.3f, 0.5f);
    public Color feedbackGoodColor = new Color(0.56f, 0.92f, 0.45f, 1f);
    public Color feedbackBadColor = new Color(0.74f, 0.24f, 0.18f, 1f);

    [Header("Colores Fondo")]
    public Color colorFondo = new Color(0.035f, 0.055f, 0.06f, 1f);
    public Color colorCaja = new Color(0.07f, 0.10f, 0.11f, 1f);
    public Color colorHUD = new Color(0.04f, 0.07f, 0.08f, 0.96f);

    [Header("Fuente")]
    public TMP_FontAsset fontAsset;

    [Header("Feedback Táctil")]
    public Image chargeRing;
    public float maxRingScale = 1.5f;

    private int extraLives = 0;
    private bool bouncePowerUpActive = false;
    private int currentStreak = 0;

    [Header("Texto de ayuda")]
    public TextMeshProUGUI helpText;
    public string helpTextMessage = "🖱️ Pulsa y arrastra para calcular la trayectoria";
    public float helpTextFadeTime = 0.5f;
    private void Awake()
    {
        if (bouncePowerUpIcon != null)
        {
            bouncePowerUpIcon.color = powerUpInactiveColor;
            if (bouncePowerUpSprite != null)
                bouncePowerUpIcon.sprite = bouncePowerUpSprite;
        }
        if (lifePowerUpIcon != null)
        {
            lifePowerUpIcon.color = extraLives > 0 ? powerUpActiveColor : powerUpInactiveColor;
            if (lifePowerUpSprite != null)
                lifePowerUpIcon.sprite = lifePowerUpSprite;
        }

        if (loadingScreen != null)
            loadingScreen.SetActive(false);

        if (chargeRing != null)
            chargeRing.gameObject.SetActive(false);

        UpdateExtraLivesDisplay();
        ApplyFontToChildren();
    }

    // ============================================================
    // ACTUALIZACIÓN DE TEXTOS
    // ============================================================

    public void ShowHelpText()
    {
        if (helpText == null) return;
        helpText.gameObject.SetActive(true);
        helpText.text = helpTextMessage;
        helpText.color = Color.yellow;

        // Animación de parpadeo suave
        StartCoroutine(PulseHelpText());
    }

    public void HideHelpText()
    {
        if (helpText == null) return;
        helpText.gameObject.SetActive(false);
        StopAllCoroutines();
    }

    private IEnumerator PulseHelpText()
    {
        if (helpText == null) yield break;

        float time = 0;
        Color originalColor = helpText.color;

        while (helpText.gameObject.activeSelf)
        {
            time += Time.deltaTime * 2f;
            float alpha = 0.5f + Mathf.Sin(time) * 0.5f;
            helpText.color = new Color(originalColor.r, originalColor.g, originalColor.b, alpha);
            yield return null;
        }
    }

    public void UpdateBounceText(int required)
    {
        if (bounceText == null) return;
        bounceText.text = bouncePowerUpActive
            ? $"REBOTES {required} <color=#FFD700>+1</color>"
            : $"REBOTES {required}";
    }

    public void UpdateLives(int remaining, int max)
    {
        if (livesText == null) return;
        livesText.text = $"VIDAS {remaining}/{max}";
    }

    public void UpdateRacha(int racha)
    {
        currentStreak = racha;
    }

    public void UpdateAttempt(int current, int max)
    {
        if (attemptText != null)
            attemptText.text = $"PRUEBA {current}/{max}";
    }

    public void UpdateLevel(int level)
    {
        if (levelText != null)
            levelText.text = $" NIVEL {Mathf.Max(1, level)}  |  RACHA {currentStreak}";
    }

    public void ShowFeedback(string message, bool isGood)
    {
        if (feedbackText == null) return;
        feedbackText.gameObject.SetActive(true);
        feedbackText.text = message;
        feedbackText.color = isGood ? feedbackGoodColor : feedbackBadColor;
    }

    public void HideFeedback()
    {
        if (feedbackText != null)
            feedbackText.gameObject.SetActive(false);
    }

    // ============================================================
    // POWER-UPS UI
    // ============================================================

    public void SetBouncePowerUpActive(bool active)
    {
        bouncePowerUpActive = active;
        if (bouncePowerUpIcon != null)
            bouncePowerUpIcon.color = active ? powerUpActiveColor : powerUpInactiveColor;
    }

    public void AddExtraLife()
    {
        extraLives++;
        UpdateExtraLivesDisplay();
    }

    public bool ConsumeExtraLife()
    {
        if (extraLives <= 0) return false;
        extraLives--;
        UpdateExtraLivesDisplay();
        return true;
    }

    public int GetExtraLives() => extraLives;

    public void ResetPowerUps()
    {
        extraLives = 0;
        bouncePowerUpActive = false;
        UpdateExtraLivesDisplay();
        if (bouncePowerUpIcon != null)
            bouncePowerUpIcon.color = powerUpInactiveColor;
    }

    private void UpdateExtraLivesDisplay()
    {
        if (lifePowerUpIcon != null)
            lifePowerUpIcon.color = extraLives > 0 ? powerUpActiveColor : powerUpInactiveColor;
        if (extraLivesCountText != null)
            extraLivesCountText.text = extraLives > 0 ? $"Vidas extra: {extraLives}" : "";
    }

    // ============================================================
    // FEEDBACK TÁCTIL
    // ============================================================

    public void UpdateChargeFeedback(float normalizedTime)
    {
        if (chargeRing != null)
        {
            chargeRing.gameObject.SetActive(true);
            chargeRing.fillAmount = normalizedTime;
            float scale = 1f + (maxRingScale - 1f) * normalizedTime;
            chargeRing.rectTransform.localScale = Vector3.one * scale;
        }
    }

    public void HideChargeFeedback()
    {
        if (chargeRing != null)
        {
            chargeRing.gameObject.SetActive(false);
            chargeRing.fillAmount = 0f;
            chargeRing.rectTransform.localScale = Vector3.one;
        }
    }

    // ============================================================
    // FUENTE
    // ============================================================

    private void ApplyFontToChildren()
    {
        if (fontAsset == null) return;
        TMP_Text[] texts = GetComponentsInChildren<TMP_Text>(true);
        for (int i = 0; i < texts.Length; i++)
            texts[i].font = fontAsset;
    }

    public void ApplyFontToTransform(Transform target)
    {
        if (target == null || fontAsset == null) return;
        TMP_Text[] texts = target.GetComponentsInChildren<TMP_Text>(true);
        for (int i = 0; i < texts.Length; i++)
            texts[i].font = fontAsset;
    }
}