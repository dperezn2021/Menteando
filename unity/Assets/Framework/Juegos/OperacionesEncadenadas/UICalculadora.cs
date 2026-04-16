//using UnityEngine;
//using TMPro;
//using UnityEngine.UI;
//using System.Collections;

//public class UICalculadora : MonoBehaviour
//{
//    [Header("Elementos UI (TMP)")]
//    public TextMeshProUGUI textoOperacion;
//    public TMP_InputField inputRespuesta;

//    [Header("Botones")]
//    public Button[] botonesNumeros;  // 0-9
//    public Button botonClear;        // Limpia todo (C)
//    public Button botonDelete;       // Borra último dígito (⌫)
//    public Button botonIgual;
//    public Button botonMenos;

//    private OperacionesEncadenadasGame gameLogic;

//    void Start()
//    {
//        // Configurar botones numéricos
//        for (int i = 0; i < botonesNumeros.Length; i++)
//        {
//            int num = i;
//            if (botonesNumeros[i] != null)
//            {
//                botonesNumeros[i].onClick.AddListener(() => {
//                    GameUIManager.Instance?.ReproducirSonido(GameUIManager.Instance.sonidoClick);
//                    AgregarNumero(num);
//                });
//            }
            
//        }
//        if (botonClear) botonClear.onClick.AddListener(LimpiarInput);
//        if (botonDelete) botonDelete.onClick.AddListener(BorrarUltimoDigito);
//        if (botonIgual) botonIgual.onClick.AddListener(EnviarRespuesta);
//        if (botonMenos) botonMenos.onClick.AddListener(AgregarSignoMenos);


//        if (inputRespuesta)
//        {
//            inputRespuesta.contentType = TMP_InputField.ContentType.IntegerNumber;
//            inputRespuesta.characterLimit = 6;
//            inputRespuesta.text = "0";
//        }
//        if (textoOperacion) textoOperacion.text = "";
//    }

//    public void Inicializar(OperacionesEncadenadasGame logic)
//    {
//        gameLogic = logic;
//        LimpiarInput();
//    }

//    public void AgregarNumero(int num)
//    {
//        if (inputRespuesta == null) return;
//        string current = inputRespuesta.text;
//        bool esNegativo = current.StartsWith("-");
//        if (esNegativo) current = current.Substring(1);
//        if (current == "0") current = "";
//        current += num.ToString();
//        if (current.Length > 5) current = current.Substring(0, 5);
//        inputRespuesta.text = esNegativo ? "-" + current : current;
//        GameUIManager.Instance?.ReproducirSonido(GameUIManager.Instance.sonidoClick);

//    }

//    public void AgregarSignoMenos()
//    {
//        if (inputRespuesta == null) return;
//        string current = inputRespuesta.text;
//        if (current.StartsWith("-")) return;
//        if (current == "0" || string.IsNullOrEmpty(current))
//            inputRespuesta.text = "-";
//        else
//            inputRespuesta.text = "-" + current;

//        GameUIManager.Instance?.ReproducirSonido(GameUIManager.Instance.sonidoClick);

//    }

//    public void BorrarUltimoDigito()
//    {
//        if (inputRespuesta == null) return;
//        string current = inputRespuesta.text;
//        if (string.IsNullOrEmpty(current) || current == "0") return;
//        if (current == "-")
//        {
//            inputRespuesta.text = "0";
//            return;
//        }
//        current = current.Substring(0, current.Length - 1);
//        if (string.IsNullOrEmpty(current) || current == "-")
//            inputRespuesta.text = "0";
//        else
//            inputRespuesta.text = current;

//        GameUIManager.Instance?.ReproducirSonido(GameUIManager.Instance.sonidoClick);

//    }

//    public void LimpiarInput()
//    {
//        if (inputRespuesta) inputRespuesta.text = "0";
//        GameUIManager.Instance?.ReproducirSonido(GameUIManager.Instance.sonidoClick);

//    }

//    public void EnviarRespuesta()
//    {
//        if (inputRespuesta == null) return;
//        if (int.TryParse(inputRespuesta.text, out int respuesta))
//        {
//            gameLogic?.EnviarRespuesta(respuesta);
//            LimpiarInput();
//        }
//    }

//    public void ActualizarOperacion(string operacion)
//    {
//        if (textoOperacion) textoOperacion.text = operacion;
//    }

//    public void MostrarMensajeMemorizacion(string mensaje, float duracion)
//    {
//        StartCoroutine(MostrarMensajeCoroutine(mensaje, duracion));
//    }

//    private IEnumerator MostrarMensajeCoroutine(string mensaje, float duracion)
//    {
//        if (textoOperacion == null) yield break;
//        string original = textoOperacion.text;
//        textoOperacion.text = mensaje;
//        yield return new WaitForSeconds(duracion);
//        textoOperacion.text = original;
//    }

//    private void Update()
//    {
//        if (gameLogic == null) return;

//        if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
//            EnviarRespuesta();

//        for (int i = 0; i <= 9; i++)
//        {

//            if (Input.GetKeyDown(KeyCode.Alpha0 + i) || Input.GetKeyDown(KeyCode.Keypad0 + i))
//            {
//                AgregarNumero(i);
//            }
//        }

//        if (Input.GetKeyDown(KeyCode.Minus) || Input.GetKeyDown(KeyCode.KeypadMinus))
//            AgregarSignoMenos();

//        if (Input.GetKeyDown(KeyCode.Delete) || Input.GetKeyDown(KeyCode.Backspace))
//            BorrarUltimoDigito();

//        if (Input.GetKeyDown(KeyCode.C))
//            LimpiarInput();
//    }
//}