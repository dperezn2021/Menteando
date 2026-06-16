using System.Collections.Generic;
using UnityEngine;

public static class MetricUtils
{
    public static float Average(IList<float> values, float fallback = 0f)
    {
        if (values == null || values.Count == 0)
            return fallback;

        float sum = 0f;
        for (int i = 0; i < values.Count; i++)
            sum += values[i];

        return sum / values.Count;
    }

    public static float Average(IList<int> values, float fallback = 0f)
    {
        if (values == null || values.Count == 0)
            return fallback;

        float sum = 0f;
        for (int i = 0; i < values.Count; i++)
            sum += values[i];

        return sum / values.Count;
    }

    public static float Precision(int correct, int total)
    {
        return total <= 0 ? 0f : Mathf.Clamp01((float)correct / total);
    }

    public static float NormalizedInverseTime(float seconds, float offset = 0.5f, float divisor = 2f)
    {
        return Mathf.Clamp01((1f / Mathf.Max(0.01f, seconds + offset)) / divisor);
    }

    public static float VelocidadNormalizada(float segundos, float tiempoIdeal = 0.8f)
    {
        // 🔥 NUEVA FÓRMULA MÁS BENÉVOLA
        // Si respondes en tiempo ideal (0.8s) → 1.0 (100%)
        // Si respondes en 1.5s → ~0.70 (70%)
        // Si respondes en 2.0s → ~0.55 (55%)
        // Si respondes en 3.0s → ~0.35 (35%)

        if (segundos <= 0) return 1f;

        // Curva de decaimiento más suave
        float resultado = Mathf.Pow(tiempoIdeal / segundos, 0.5f);

        return Mathf.Clamp01(resultado);
    }
}
