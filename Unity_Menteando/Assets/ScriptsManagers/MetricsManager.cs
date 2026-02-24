using UnityEngine;
using System.Collections.Generic;

public static class MetricsManager
{
    public static GameMetrics CalcularMetricas(int correctas, int incorrectas, int omisiones, List<float> tiemposReaccion)
    {
        GameMetrics m = new GameMetrics();

        int total = correctas + incorrectas + omisiones;

        // 1. PRECISIÓN
        m.precision = total > 0 ? (float)correctas / total : 0f;

        if (tiemposReaccion.Count > 0)
        {
            // 2. VELOCIDAD MEDIA
            float suma = 0f;
            foreach (float t in tiemposReaccion)
                suma += t;

            float tiempoMedio = suma / tiemposReaccion.Count;
            m.velocidadMedia = tiempoMedio;

            // 3. CONSISTENCIA (variabilidad)
            float var = 0f;
            foreach (float t in tiemposReaccion)
                var += Mathf.Pow(t - tiempoMedio, 2);

            float desviacion = Mathf.Sqrt(var / tiemposReaccion.Count);
            m.consistencia = 1f - Mathf.Clamp(desviacion / tiempoMedio, 0f, 1f);

            // 4. CONTROL INHIBITORIO
            int impulsivas = 0;
            foreach (float t in tiemposReaccion)
                if (t < 0.3f) impulsivas++;

            m.controlInhibitorio = 1f - ((float)impulsivas / tiemposReaccion.Count);

            // 5. ÍNDICE DE VELOCIDAD (0–100)
            m.indiceVelocidad = Mathf.Clamp((2f / tiempoMedio) * 50f, 0f, 100f);
        }

        // 6. ÍNDICE DE ATENCIÓN (0–100)
        m.indiceAtencion = m.precision * 100f;

        return m;
    }
}
