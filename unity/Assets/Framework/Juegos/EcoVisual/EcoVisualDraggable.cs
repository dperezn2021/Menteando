using UnityEngine;
using UnityEngine.EventSystems;

[RequireComponent(typeof(RectTransform))]
public class EcoVisualDraggable : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    private EcoVisualGame juego;

    public void Inicializar(EcoVisualGame juegoEcoVisual)
    {
        juego = juegoEcoVisual;
    }

    private void Awake()
    {
        if (juego == null)
            juego = FindFirstObjectByType<EcoVisualGame>(FindObjectsInactive.Include);
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        juego?.OnBeginDrag(eventData);
    }

    public void OnDrag(PointerEventData eventData)
    {
        juego?.OnDrag(eventData);
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        juego?.OnEndDrag(eventData);
    }
}
