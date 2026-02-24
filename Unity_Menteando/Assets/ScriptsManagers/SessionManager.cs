using UnityEngine;
using System.Collections.Generic;


public class SessionManager : MonoBehaviour
{
    public static SessionManager Instance;

    private List<GameMetrics> intentos = new List<GameMetrics>();

    private void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }
    public void GuardarIntento(GameMetrics metricas)
    {
        intentos.Add(metricas);
        GuardarSesionJSON();
    }
    private void GuardarSesionJSON()
    {
        string json = JsonUtility.ToJson(new DatosSesion(intentos), true);
        PlayerPrefs.SetString("UltimaSesion", json);
        PlayerPrefs.Save();
        Debug.Log("Guardado en PlayerPrefs: " + PlayerPrefs.GetString("UltimaSesion"));

    }
}

[System.Serializable]
public class DatosSesion
{
    public List<GameMetrics> partida;

    public DatosSesion(List<GameMetrics> p)
    {
        this.partida = p;
    }
}

