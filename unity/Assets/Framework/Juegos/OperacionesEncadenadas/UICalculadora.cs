using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UICalculadora : MonoBehaviour
{
    [Header("Elementos UI (TMP)")]
    public TextMeshProUGUI textoOperacion;
    public TMP_InputField inputRespuesta;
    public TextMeshProUGUI textoRachaActual;
    public TextMeshProUGUI textoTiempoRestante;
    public TextMeshProUGUI textoNivel;

    [Header("Botones")]
    public Button[] botonesNumeros;
    public Button botonClear;
    public Button botonDelete;
    public Button botonIgual;
    public Button botonMenos;

    private OperacionesEncadenadasGame gameLogic;
    private bool botonesConfigurados = false;
    private float ultimoTiempoTecla = 0f;

    private void Start()
    {
        Debug.Log($"UICalculadora activa en: {gameObject.name}", this);
        // 🔥 FORZAR BÚSQUEDA DE textoOperacion SI NO ESTÁ ASIGNADO
        if (textoOperacion == null)
            textoOperacion = GetComponentInChildren<TextMeshProUGUI>();

        if (textoOperacion == null)
            Debug.LogError("❌ textoOperacion no asignado - Créalo y asígnalo manualmente en el Inspector");
        else
            textoOperacion.gameObject.SetActive(true);

        ConfigurarInput();
        ConfigurarBotones();
        ConfigurarTextosResponsivos();

        if (gameLogic == null)
        {
            OperacionesEncadenadasGame juego = FindFirstObjectByType<OperacionesEncadenadasGame>();
            if (juego != null)
                Inicializar(juego);
        }
    }

    public void Inicializar(OperacionesEncadenadasGame logic)
    {
        gameLogic = logic;
        ConfigurarInput();
        ConfigurarBotones();
        ConfigurarTextosResponsivos();
        LimpiarInput();
        ActualizarHUD();
    }

    private void ConfigurarInput()
    {
        if (inputRespuesta != null)
        {
            inputRespuesta.contentType = TMP_InputField.ContentType.IntegerNumber;
            inputRespuesta.characterLimit = 6;
            inputRespuesta.readOnly = true;
            inputRespuesta.interactable = false;
            inputRespuesta.shouldHideMobileInput = true;
            inputRespuesta.enabled = false;
            if (string.IsNullOrEmpty(inputRespuesta.text))
                inputRespuesta.text = "0";
        }

        if (textoOperacion != null)
            textoOperacion.gameObject.SetActive(true);
    }

    private void ConfigurarBotones()
    {
        if (botonesConfigurados) return;

        if (botonesNumeros != null)
        {
            for (int i = 0; i < botonesNumeros.Length; i++)
            {
                int num = i;
                if (botonesNumeros[i] == null) continue;

                botonesNumeros[i].onClick.RemoveAllListeners();
                botonesNumeros[i].onClick.AddListener(() =>
                {
                    AudioManager.Instance?.Click();
                    AgregarNumero(num);
                });
            }
        }

        if (botonClear != null)
        {
            botonClear.onClick.RemoveAllListeners();
            botonClear.onClick.AddListener(() =>
            {
                AudioManager.Instance?.Click();
                LimpiarInput();
            });
        }

        if (botonDelete != null)
        {
            botonDelete.onClick.RemoveAllListeners();
            botonDelete.onClick.AddListener(() =>
            {
                AudioManager.Instance?.Click();
                BorrarUltimoDigito();
            });
        }

        if (botonIgual != null)
        {
            botonIgual.onClick.RemoveAllListeners();
            botonIgual.onClick.AddListener(() =>
            {
                AudioManager.Instance?.Click();
                EnviarRespuesta();
            });
        }

        if (botonMenos != null)
        {
            botonMenos.onClick.RemoveAllListeners();
            botonMenos.onClick.AddListener(() =>
            {
                AudioManager.Instance?.Click();
                AgregarSignoMenos();
            });
        }

        botonesConfigurados = true;
    }

    public void AgregarNumero(int num)
    {
        if (inputRespuesta == null) return;

        string current = inputRespuesta.text;
        bool negativo = current.StartsWith("-");

        if (negativo) current = current.Substring(1);
        if (current == "0") current = "";

        current += num.ToString();
        if (current.Length > 5) current = current.Substring(0, 5);

        inputRespuesta.text = negativo ? "-" + current : current;
    }

    public void AgregarSignoMenos()
    {
        if (inputRespuesta == null) return;

        string current = inputRespuesta.text;
        if (current.StartsWith("-")) return;

        inputRespuesta.text = string.IsNullOrEmpty(current) || current == "0" ? "-" : "-" + current;
    }

    public void BorrarUltimoDigito()
    {
        if (inputRespuesta == null) return;

        string current = inputRespuesta.text;
        if (string.IsNullOrEmpty(current) || current == "0")
            return;

        current = current.Substring(0, current.Length - 1);
        inputRespuesta.text = string.IsNullOrEmpty(current) || current == "-" ? "0" : current;
    }

    public void LimpiarInput()
    {
        if (inputRespuesta != null)
            inputRespuesta.text = "0";
    }

    public void EnviarRespuesta()
    {
        if (inputRespuesta == null) return;

        if (int.TryParse(inputRespuesta.text, out int respuesta))
        {
            gameLogic?.EnviarRespuesta(respuesta);
            LimpiarInput();
        }
    }

    public void MostrarOperacion(string operacion)
    {
        if (textoOperacion == null) return;
        textoOperacion.text = operacion;
    }

    public void MostrarMemorizacion(string mensaje)
    {
        if (textoOperacion == null)
        {
            return;
        }
        textoOperacion.text = mensaje;
    }

    public void OcultarMemorizacion()
    {
        if (textoOperacion != null)
            textoOperacion.text = "";
    }

    private void Update()
    {
        if (gameLogic == null) return;

        // Prevenir doble procesamiento
        if (Time.unscaledTime - ultimoTiempoTecla < 0.05f) return;

        if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
        {
            ultimoTiempoTecla = Time.unscaledTime;
            EnviarRespuesta();
        }

        for (int i = 0; i <= 9; i++)
        {
            bool pressed =
                Input.GetKeyDown(KeyCode.Alpha0 + i) ||
                Input.GetKeyDown(KeyCode.Keypad0 + i);

            if (pressed)
            {
                AgregarNumero(i);
                break;
            }
        }

        if (Input.GetKeyDown(KeyCode.Minus) || Input.GetKeyDown(KeyCode.KeypadMinus))
        {
            ultimoTiempoTecla = Time.unscaledTime;
            AgregarSignoMenos();
        }

        if (Input.GetKeyDown(KeyCode.Backspace) || Input.GetKeyDown(KeyCode.Delete))
        {
            ultimoTiempoTecla = Time.unscaledTime;
            BorrarUltimoDigito();
        }

        if (Input.GetKeyDown(KeyCode.C))
        {
            ultimoTiempoTecla = Time.unscaledTime;
            LimpiarInput();
        }

        ActualizarHUD();
    }

    private void ActualizarHUD()
    {
        if (textoRachaActual != null && gameLogic != null)
            textoRachaActual.text = $"RACHA: {gameLogic.rachaActual}";

        if (textoTiempoRestante != null && GameManager.Instance != null)
        {
            int segundos = Mathf.Max(0, Mathf.CeilToInt(GameManager.Instance.tiempoRestante));
            textoTiempoRestante.text = $"TIEMPO: {segundos:00}";
        }

        if (textoNivel != null && DifficultyManager.Instance != null)
            textoNivel.text = $"NIVEL: {DifficultyManager.Instance.nivelActual}/10";
    }

    private void ConfigurarTextosResponsivos()
    {
        ConfigurarTexto(textoOperacion, 28f, 84f);
        ConfigurarTexto(textoRachaActual, 16f, 38f);
        ConfigurarTexto(textoTiempoRestante, 16f, 38f);
        ConfigurarTexto(textoNivel, 16f, 38f);
    }

    private void ConfigurarTexto(TextMeshProUGUI texto, float min, float max)
    {
        if (texto == null)
            return;

        texto.enableAutoSizing = true;
        texto.fontSizeMin = min;
        texto.fontSizeMax = max;
        texto.textWrappingMode = TextWrappingModes.Normal;
        texto.overflowMode = TextOverflowModes.Ellipsis;
        texto.raycastTarget = false;
    }
}
