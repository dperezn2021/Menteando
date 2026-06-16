using System;
using System.Collections;
using UnityEngine;

public static class GamePause
{
    public static IEnumerator WaitWhileNotPaused(float seconds, Func<bool> isPaused)
    {
        float elapsed = 0f;
        while (elapsed < seconds)
        {
            if (isPaused == null || !isPaused())
                elapsed += Time.deltaTime;

            yield return null;
        }
    }
}
