using UnityEngine;

[CreateAssetMenu(fileName = "FoodItem", menuName = "Menteando/Food Item")]
public class FoodItem : ScriptableObject
{
    public Sprite sprite;
    public string nombre;
    public FoodTags tags;

    // Nueva: categoría principal para facilitar la selección de modo
    public MainCategory mainCategory;

    // Método para validar que las tags sean coherentes (opcional)
    public bool IsValidForDifficulty(GameDifficulty difficulty)
    {
        if (difficulty == GameDifficulty.Easy)
            return mainCategory == MainCategory.Fruta || mainCategory == MainCategory.Verdura || mainCategory == MainCategory.Carne;
        if (difficulty == GameDifficulty.Medium)
            return mainCategory != MainCategory.Bebida; // Excluir bebidas en medio
        return true; // Difícil incluye todo
    }

    public bool HasValidTags()
    {
        // Una bebida no puede ser alargada a menos que sea botella específica
        if (tags.HasFlag(FoodTags.Bebida) && tags.HasFlag(FoodTags.Alargado))
        {
            // Solo permitir si es un caso especial (ej: botella)
            if (nombre != "Botella de agua" && nombre != "Refresco")
                return false;
        }

        // Un alimento no puede ser fruta y carne al mismo tiempo
        if (tags.HasFlag(FoodTags.Fruta) && tags.HasFlag(FoodTags.Carne))
            return false;

        // Un alimento no puede ser dulce y salado a la vez
        if (tags.HasFlag(FoodTags.Dulce) && tags.HasFlag(FoodTags.Salado))
            return false;

        // Un alimento no puede ser frío y caliente a la vez
        if (tags.HasFlag(FoodTags.Frio) && tags.HasFlag(FoodTags.Caliente))
            return false;

        // Un alimento no puede ser crudo y cocinado a la vez
        if (tags.HasFlag(FoodTags.Crudo) && tags.HasFlag(FoodTags.Cocinado))
            return false;

        return true;
    }
}

public enum MainCategory
{
    Fruta, Verdura, Carne, Lacteo, Bebida, Otro
}

[System.Flags]
public enum FoodTags
{
    None = 0,
    // Colores
    Rojo = 1 << 0,
    Verde = 1 << 1,
    Amarillo = 1 << 2,
    Naranja = 1 << 3,
    Marron = 1 << 4,
    Blanco = 1 << 5,
    Azul = 1 << 6,
    Rosa = 1 << 7,
    // Formas
    Redondo = 1 << 8,
    Alargado = 1 << 9,
    Cuadrado = 1 << 10,
    Irregular = 1 << 11,
    // Categorías básicas (niveles bajos)
    Fruta = 1 << 12,
    Verdura = 1 << 13,
    Carne = 1 << 14,
    Lacteo = 1 << 15,
    // Categorías avanzadas (niveles altos)
    Dulce = 1 << 17,
    Salado = 1 << 18,
    Crudo = 1 << 19,
    Cocinado = 1 << 20,
    Frio = 1 << 21,
    Caliente = 1 << 22,
    Bebida = 1 << 26,
    // Tamaños
    Pequeno = 1 << 23,
    Mediano = 1 << 24,
    Grande = 1 << 25
}

public enum GameDifficulty { Easy, Medium, Hard }