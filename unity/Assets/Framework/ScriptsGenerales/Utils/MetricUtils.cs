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
}
