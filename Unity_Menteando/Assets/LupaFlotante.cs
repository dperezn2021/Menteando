using UnityEngine;

public class LupaFlotante : MonoBehaviour
{
    [Header("Movimiento Base")]
    public float velocidadMovimientoBase = 0.5f;
    public float radioMovimientoBase = 150f;
    public float velocidadRotacionBase = 0.5f;

    [Header("Aumento por nivel")]
    public float aumentoVelocidadPorNivel = 0.1f;   // +0.1 por nivel
    public float aumentoRadioPorNivel = 15f;        // +15 por nivel
    public float aumentoRotacionPorNivel = 0.05f;   // +0.05 por nivel

    [Header("Límites máximos")]
    public float velocidadMaxima = 2f;
    public float radioMaximo = 350f;
    public float rotacionMaxima = 2f;

    // Variables dinámicas
    private float velocidadMovimientoActual;
    private float radioMovimientoActual;
    private float velocidadRotacionActual;

    private Vector3 posicionInicial;
    private float angulo = 0;

    void Start()
    {
        posicionInicial = transform.localPosition;
        ActualizarParametrosPorNivel(1); // Nivel inicial
    }

    void Update()
    {
        // MOVIMIENTO CIRCULAR por el canvas
        angulo += Time.deltaTime * velocidadMovimientoActual;
        float x = Mathf.Cos(angulo) * radioMovimientoActual;
        float y = Mathf.Sin(angulo * 0.7f) * radioMovimientoActual * 0.6f;
        transform.localPosition = posicionInicial + new Vector3(x, y, 0);

        // ROTACIÓN suave
        float rotZ = Mathf.Sin(Time.time * velocidadRotacionActual) * 15f;
        transform.localRotation = Quaternion.Euler(0, 0, rotZ);
    }

    public void ActualizarParametrosPorNivel(int nivel)
    {
        // Calcular valores según el nivel (1-10)
        velocidadMovimientoActual = velocidadMovimientoBase + (aumentoVelocidadPorNivel * (nivel - 1));
        radioMovimientoActual = radioMovimientoBase + (aumentoRadioPorNivel * (nivel - 1));
        velocidadRotacionActual = velocidadRotacionBase + (aumentoRotacionPorNivel * (nivel - 1));

        // Aplicar límites máximos
        velocidadMovimientoActual = Mathf.Min(velocidadMovimientoActual, velocidadMaxima);
        radioMovimientoActual = Mathf.Min(radioMovimientoActual, radioMaximo);
        velocidadRotacionActual = Mathf.Min(velocidadRotacionActual, rotacionMaxima);

        Debug.Log($"🔍 LUPA - Nivel {nivel}: Velocidad={velocidadMovimientoActual:F2}, Radio={radioMovimientoActual:F0}, Rotación={velocidadRotacionActual:F2}");
    }
}