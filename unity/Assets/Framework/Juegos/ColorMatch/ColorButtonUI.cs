//// ===================================================== 
//// ColorButtonUI.cs
//// =====================================================

//using UnityEngine;
//using UnityEngine.UI;

//public class ColorButtonUI : MonoBehaviour
//{
//    public Button button;
//    public Image image;

//    private string colorId;
//    private ColorMatchGame juego;

//    public void Configurar(
//        string id,
//        Color color,
//        ColorMatchGame game
//    )
//    {
//        colorId = id;
//        juego = game;

//        image.color = color;

//        button.onClick.RemoveAllListeners();

//        button.onClick.AddListener(() =>
//        {
//            juego.Responder(colorId);
//        });
//    }
//}