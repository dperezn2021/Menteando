[System.Serializable]
public class ReglaAntigua
{
    public string descripcion;       // Texto que se muestra en pantalla
    public bool requierePulsar;      // true = debe pulsar, false = no debe pulsar
    public float duracion;           // Duración de la regla en segundos

    public ReglaAntigua(string desc, bool pulsar, float dur)
    {
        descripcion = desc;
        requierePulsar = pulsar;
        duracion = dur;
    }
}
