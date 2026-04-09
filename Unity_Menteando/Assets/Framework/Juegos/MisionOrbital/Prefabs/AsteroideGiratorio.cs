using UnityEngine;

public class AsteroideGiratorio : MonoBehaviour
{
    [Header("Velocidad de giro")]
    public float velocidad = 45f; // grados por segundo

    [Header("Movimiento flotante opcional")]
    public float amplitud = 10f;
    public float frecuencia = 2f;

    private RectTransform rect;
    private Vector2 posOriginal;

    void Awake()
    {
        rect = GetComponent<RectTransform>();
        posOriginal = rect.anchoredPosition;   // ← ESTA ES LA CLAVE
    }

    void Update()
    {
        // Rotación constante
        rect.Rotate(0f, 0f, velocidad * Time.deltaTime);

        // Movimiento flotante SIN perder la posición original
        float offset = Mathf.Sin(Time.time * frecuencia) * amplitud;
        rect.anchoredPosition = posOriginal + new Vector2(0, offset);
    }
}
