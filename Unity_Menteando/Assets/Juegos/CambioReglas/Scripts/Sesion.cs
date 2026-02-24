using System.Collections.Generic;

[System.Serializable]
public class Sesion
{
    public string idSesion;
    public string juego = "cambio_reglas";
    public float duracionTotal;
    public List<Intento> intentos = new List<Intento>();
}


