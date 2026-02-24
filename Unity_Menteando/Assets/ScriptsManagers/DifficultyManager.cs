using UnityEngine;
using System.Collections.Generic;

public class DifficultyManager : MonoBehaviour
{
    public static DifficultyManager Instance;

    public float rating = 1000f; // rating inicial
    public int nivelActual = 1;

    private List<float> historial = new List<float>();
    private const int ventana = 10;

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    public void ActualizarDificultad(float precision, float velocidad, float consistencia, float control)
    {
        float rendimiento =
            (0.4f * precision) +
            (0.3f * velocidad) +
            (0.2f * consistencia) +
            (0.1f * control);

        historial.Add(rendimiento);
        if (historial.Count > ventana)
            historial.RemoveAt(0);

        float media = 0f;
        foreach (float r in historial) media += r;
        media /= historial.Count;

        // Ajuste suave tipo ELO
        float delta = (media - 0.5f) * 25f; // más suave aún
        rating += delta;
        rating = Mathf.Clamp(rating, 800f, 5000f);

        // Convertir rating a nivel (procedimental)
        nivelActual = Mathf.FloorToInt((rating - 800f) / 150f) + 1;

        Debug.Log($"[DIFICULTAD] Media: {media} | Rating: {rating} | Nivel: {nivelActual}");
    }
}
