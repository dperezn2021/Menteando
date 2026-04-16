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
                if (!destruida && onClickCallback != null && !GameManager.Instance.EstaPausado())
                    onClickCallback?.Invoke();
            });
        }
    }
    public void SetSprite(Sprite sprite)
    {
        if (imagen != null && !destruida)
        {
            imagen.sprite = sprite;
            imagen.preserveAspect = true;
        }
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