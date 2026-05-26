using UnityEngine;

[CreateAssetMenu(fileName = "FoodItem", menuName = "Menteando/Food Item")]
public class FoodItem : ScriptableObject
{
    public Sprite sprite;
    public string nombre;
    public FoodTags tags;
    public MainCategory mainCategory;
}

public enum MainCategory
{
    Fruta, Verdura, Carne, Lacteo, Bebida, Otro
}

[System.Flags]
public enum FoodTags
{
    None = 0,
    Rojo = 1 << 0,
    Verde = 1 << 1,
    Amarillo = 1 << 2,
    Naranja = 1 << 3,
    Marron = 1 << 4,
    Blanco = 1 << 5,
    Azul = 1 << 6,
    Rosa = 1 << 7,
    Redondo = 1 << 8,
    Alargado = 1 << 9,
    Cuadrado = 1 << 10,
    Irregular = 1 << 11,
    Fruta = 1 << 12,
    Verdura = 1 << 13,
    Carne = 1 << 14,
    Lacteo = 1 << 15,
    Dulce = 1 << 17,
    Salado = 1 << 18,
    Crudo = 1 << 19,
    Cocinado = 1 << 20,
    Frio = 1 << 21,
    Caliente = 1 << 22,
    Bebida = 1 << 23,
    Pequeno = 1 << 24,
    Mediano = 1 << 25,
    Grande = 1 << 26
}

public enum GameDifficulty { Easy, Medium, Hard }