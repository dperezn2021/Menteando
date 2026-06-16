using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Button), typeof(Image))]
public class CeldaUI : MonoBehaviour
{
    private Image imagen;
    private Button boton;
    private System.Action onClickCallback;
    private bool destruida = false;

    private void Awake()
    {
        imagen = GetComponent<Image>();
        boton = GetComponent<Button>();

        if (imagen == null)
            Debug.LogError($"❌ CeldaUI: No se encontró Image en {gameObject.name}");

        if (boton != null)
            boton.interactable = true;
    }

    public void Configurar(System.Action onClick)
    {
        onClickCallback = onClick;

        if (boton != null)
        {
            boton.onClick.RemoveAllListeners();
            boton.onClick.AddListener(() => {
                if (!destruida && onClickCallback != null && GameManager.Instance != null && !GameManager.Instance.EstaPausado())
                    onClickCallback?.Invoke();
            });
        }
    }

    public void SetSprite(Sprite sprite)
    {
        if (imagen == null)
        {
            Debug.LogError($"❌ CeldaUI.SetSprite: imagen es null en {gameObject.name}");
            return;
        }

        imagen.sprite = sprite;
        imagen.preserveAspect = true;

        // 🔥 FORZAR que se vea (color blanco para mostrar el sprite correctamente)
        imagen.color = Color.white;

        Debug.Log($"✅ Sprite asignado a {gameObject.name}: {(sprite != null ? sprite.name : "NULL")}");
    }

    public void SetColor(Color color)
    {
        if (imagen != null && !destruida)
            imagen.color = color;
    }

    private void OnDestroy()
    {
        destruida = true;
        if (boton != null)
            boton.onClick.RemoveAllListeners();
    }
}