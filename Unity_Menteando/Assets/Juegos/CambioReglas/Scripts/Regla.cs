[System.Serializable]
public class Regla
{
    public string descripcion;       // Texto que se muestra en pantalla
    public bool requierePulsar;      // true = debe pulsar, false = no debe pulsar
    public float duracion;           // Duración de la regla en segundos

    public Regla(string desc, bool pulsar, float dur)
    {
        descripcion = desc;
        requierePulsar = pulsar;
        duracion = dur;
    }
}
