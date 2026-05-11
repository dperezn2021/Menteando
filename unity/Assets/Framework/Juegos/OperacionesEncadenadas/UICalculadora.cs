using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class UICalculadora : MonoBehaviour
{
    [Header("Elementos UI (TMP)")]
    public TextMeshProUGUI textoOperacion;
    public TMP_InputField inputRespuesta;

    [Header("Botones")]
    public Button[] botonesNumeros;  // 0-9
    public Button botonClear;        // C
    public Button botonDelete;       // ⌫
    public Button botonIgual;        // =
    public Button botonMenos;        // -

    private OperacionesEncadenadasGame gameLogic;

    void Start()
    {
        // BOTONES NUMÉRICOS
        for (int i = 0; i < botonesNumeros.Length; i++)
        {
            int num = i;
            botonesNumeros[i].onClick.AddListener(() =>
            {
                AudioManager.Instance?.Click();
                AgregarNumero(num);
            });
        }

        // BOTONES ESPECIALES
        botonClear.onClick.AddListener(() =>
        {
            AudioManager.Instance?.Click();
            LimpiarInput();
        });

        botonDelete.onClick.AddListener(() =>
        {
            AudioManager.Instance?.Click();
            BorrarUltimoDigito();
        });

        botonIgual.onClick.AddListener(() =>
        {
            AudioManager.Instance?.Click();
            EnviarRespuesta();
        });

        botonMenos.onClick.AddListener(() =>
        {
            AudioManager.Instance?.Click();
            AgregarSignoMenos();
        });

        // INPUT
        inputRespuesta.contentType = TMP_InputField.ContentType.IntegerNumber;
        inputRespuesta.characterLimit = 6;
        inputRespuesta.text = "0";
        inputRespuesta.DeactivateInputField();
    }

    public void Inicializar(OperacionesEncadenadasGame logic)
    {
        gameLogic = logic;
        LimpiarInput();
    }

    // ============================
    // INPUT NUMÉRICO
    // ============================
    public void AgregarNumero(int num)
    {
        string current = inputRespuesta.text;
        bool negativo = current.StartsWith("-");

        if (negativo) current = current.Substring(1);
        if (current == "0") current = "";

        current += num.ToString();
        if (current.Length > 5) current = current.Substring(0, 5);

        inputRespuesta.text = negativo ? "-" + current : current;
        inputRespuesta.DeactivateInputField();
    }

    public void AgregarSignoMenos()
    {
        string current = inputRespuesta.text;

        if (!current.StartsWith("-"))
            inputRespuesta.text = current == "0" ? "-" : "-" + current;

        inputRespuesta.DeactivateInputField();
    }

    public void BorrarUltimoDigito()
    {
        string current = inputRespuesta.text;

        if (current == "-" || current.Length <= 1)
            inputRespuesta.text = "0";
        else
            inputRespuesta.text = current.Substring(0, current.Length - 1);

        inputRespuesta.DeactivateInputField();
    }

    public void LimpiarInput()
    {
        inputRespuesta.text = "0";
        inputRespuesta.DeactivateInputField();
    }

    // ============================
    // ENVÍO DE RESPUESTA
    // ============================
    public void EnviarRespuesta()
    {
        inputRespuesta.DeactivateInputField();

        if (int.TryParse(inputRespuesta.text, out int r))
        {
            gameLogic?.EnviarRespuesta(r);
            LimpiarInput();
        }
    }

    // ============================
    // OPERACIÓN Y MEMORIZACIÓN
    // ============================
    public void MostrarOperacion(string operacion)
    {
        textoOperacion.text = operacion;
    }

    public void MostrarMemorizacion(string msg)
    {
        textoOperacion.text = msg;
    }

    public void OcultarMemorizacion()
    {
        textoOperacion.text = "";
    }

    // ============================
    // TECLADO
    // ============================
    private void Update()
    {
        if (gameLogic == null) return;

        if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
            EnviarRespuesta();

        for (int i = 0; i <= 9; i++)
        {
            if (Input.GetKeyDown(KeyCode.Alpha0 + i) ||
                Input.GetKeyDown(KeyCode.Keypad0 + i))
                AgregarNumero(i);
        }

        if (Input.GetKeyDown(KeyCode.Minus) || Input.GetKeyDown(KeyCode.KeypadMinus))
            AgregarSignoMenos();

        if (Input.GetKeyDown(KeyCode.Backspace) || Input.GetKeyDown(KeyCode.Delete))
            BorrarUltimoDigito();

        if (Input.GetKeyDown(KeyCode.C))
            LimpiarInput();
    }
}
