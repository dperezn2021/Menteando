// Archivo: FoodDatabase.cs
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

[CreateAssetMenu(fileName = "FoodDatabase", menuName = "Menteando/Food Database")]
public class FoodDatabase : ScriptableObject
{
    public List<FoodItem> allFoods;

    public List<FoodItem> GetFoodsWithTag(FoodTags tag) => allFoods.FindAll(f => f.tags.HasFlag(tag));
    public List<FoodItem> GetFoodsWithoutTag(FoodTags tag) => allFoods.FindAll(f => !f.tags.HasFlag(tag));
    public int CountByTag(FoodTags tag) => allFoods.Count(f => f.tags.HasFlag(tag));
    public int CountWithoutTag(FoodTags tag) => allFoods.Count(f => !f.tags.HasFlag(tag));
    public FoodItem GetRandomFood() => allFoods[Random.Range(0, allFoods.Count)];
}