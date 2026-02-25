using UnityEngine;
using System.Collections.Generic;

public class DifficultyManager : MonoBehaviour
{
    public static DifficultyManager Instance;

    public int nivelActual = 1;

    private List<float> ventanaRendimiento = new List<float>();
    private List<bool> ventanaAciertos = new List<bool>();
    private List<float> ventanaTiempos = new List<float>();

    private const int VENTANA = 5;
    private const int NIVEL_MIN = 1;
    private const int NIVEL_MAX = 10;

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    // rendimiento = 0–1
    public void ActualizarDificultad(float rendimiento, bool acierto, float tiempo)
    {
        ventanaRendimiento.Add(rendimiento);
        ventanaAciertos.Add(acierto);
        ventanaTiempos.Add(tiempo);

        if (ventanaRendimiento.Count < VENTANA)
            return;

        // --- Calcular métricas ---
        float precision = 0f;
        foreach (bool ok in ventanaAciertos)
            if (ok) precision++;

        precision /= ventanaAciertos.Count;

        float sumaTiempos = 0f;
        foreach (float t in ventanaTiempos)
            sumaTiempos += t;

        float tiempoMedio = sumaTiempos / ventanaTiempos.Count;

        int fallosSeguidos = 0;
        for (int i = ventanaAciertos.Count - 1; i >= 0; i--)
        {
            if (!ventanaAciertos[i]) fallosSeguidos++;
            else break;
        }

        // --- Decisiones de dificultad ---

        // BAJAR NIVEL
        if (precision < 0.5f || fallosSeguidos >= 2 || tiempoMedio > 4f)
        {
            nivelActual = Mathf.Max(NIVEL_MIN, nivelActual - 1);
            Debug.Log("BAJA NIVEL → " + nivelActual);
        }
        // SUBIR NIVEL
        else if (precision > 0.8f && tiempoMedio < 2.5f)
        {
            nivelActual = Mathf.Min(NIVEL_MAX, nivelActual + 1);
            Debug.Log("SUBE NIVEL → " + nivelActual);
        }
        else
        {
            Debug.Log("Nivel estable → " + nivelActual);
        }

        // Reset ventana
        ventanaRendimiento.Clear();
        ventanaAciertos.Clear();
        ventanaTiempos.Clear();
    }
}
