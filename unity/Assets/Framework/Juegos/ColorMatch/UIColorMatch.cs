using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

public class UIColorMatch : MonoBehaviour
{
    [Header("Referencias")]
    public ColorWheelUI colorWheel;
    public ColorMatchGame colorGame;

    [Header("HUD")]
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;

    private void Start()
    {
        if (colorGame == null)
            colorGame = FindFirstObjectByType<ColorMatchGame>();

        if (colorWheel == null && colorGame != null)
            colorWheel = colorGame.colorWheel;

        // Suscribirse a eventos del juego
        if (colorGame != null)
        {
            colorGame.OnRachaActualizada += ActualizarRacha;
            colorGame.OnNivelActualizado += ActualizarNivel;
        }
    }

    private void Update()
    {
        // Actualizar tiempo desde GameManager
        if (textoTiempo != null && GameManager.Instance != null)
        {
            float tiempoRestante = GameManager.Instance.tiempoRestante;
            int segundos = Mathf.Max(0, Mathf.CeilToInt(tiempoRestante));
            textoTiempo.text = $"{segundos / 60:00}:{segundos % 60:00}";
        }
    }

    private void ActualizarRacha(int racha)
    {
        if (textoRacha != null)
            textoRacha.text = $"RACHA: {racha}";
    }

    private void ActualizarNivel(int nivel)
    {
        if (textoNivel != null)
            textoNivel.text = $"NIVEL: {nivel}/10";
    }

    private void OnDestroy()
    {
        if (colorGame != null)
        {
            colorGame.OnRachaActualizada -= ActualizarRacha;
            colorGame.OnNivelActualizado -= ActualizarNivel;
        }
    }
}