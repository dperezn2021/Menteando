using UnityEngine;

public class BackgroundExecutionGuard : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    private static void Configure()
    {
        Application.runInBackground = true;
        QualitySettings.vSyncCount = 0;

        if (FindFirstObjectByType<BackgroundExecutionGuard>() == null)
        {
            GameObject guard = new GameObject("BackgroundExecutionGuard");
            DontDestroyOnLoad(guard);
            guard.AddComponent<BackgroundExecutionGuard>();
        }
    }

    private void OnApplicationFocus(bool hasFocus)
    {
        Application.runInBackground = true;
        if (GameManager.Instance != null && !GameManager.Instance.EstaPausado())
            Time.timeScale = 1f;
    }

    private void OnApplicationPause(bool pauseStatus)
    {
        Application.runInBackground = true;
        if (!pauseStatus && GameManager.Instance != null && !GameManager.Instance.EstaPausado())
            Time.timeScale = 1f;
    }
}
