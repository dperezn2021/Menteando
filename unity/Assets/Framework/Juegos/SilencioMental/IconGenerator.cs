using UnityEngine;

public static class IconGenerator
{
    public enum Forma
    {
        Circulo,
        Cuadrado,
        Triangulo,
        Estrella,
        Rombo,
        FlechaArriba,
        FlechaAbajo,
        FlechaIzquierda,
        FlechaDerecha
    }

    public static Sprite Generar(Forma forma, Color color, int tamaño)
    {
        int pixelSize = tamaño switch
        {
            1 => 64,
            2 => 128,
            3 => 192,
            _ => 128
        };

        Texture2D tex = new Texture2D(pixelSize, pixelSize);
        Color[] pixeles = new Color[pixelSize * pixelSize];
        for (int i = 0; i < pixeles.Length; i++) pixeles[i] = Color.clear;

        int centro = pixelSize / 2;
        int radio = pixelSize / 2 - 4;

        switch (forma)
        {
            case Forma.Circulo:
                for (int x = 0; x < pixelSize; x++)
                    for (int y = 0; y < pixelSize; y++)
                    {
                        float dx = x - centro;
                        float dy = y - centro;
                        if (dx * dx + dy * dy <= radio * radio)
                            pixeles[y * pixelSize + x] = color;
                    }
                break;

            case Forma.Cuadrado:
                int margen = pixelSize / 5;
                for (int x = margen; x < pixelSize - margen; x++)
                    for (int y = margen; y < pixelSize - margen; y++)
                        pixeles[y * pixelSize + x] = color;
                break;

            case Forma.Triangulo:
                for (int x = 0; x < pixelSize; x++)
                    for (int y = 0; y < pixelSize; y++)
                    {
                        float xRel = (x - centro) / (float)radio;
                        float yRel = (y - centro) / (float)radio + 0.4f;
                        if (yRel >= 0 && Mathf.Abs(xRel) <= (1 - yRel) * 0.9f)
                            pixeles[y * pixelSize + x] = color;
                    }
                break;

            case Forma.Estrella:
                for (int x = 0; x < pixelSize; x++)
                    for (int y = 0; y < pixelSize; y++)
                    {
                        float dx = Mathf.Abs(x - centro);
                        float dy = Mathf.Abs(y - centro);
                        if (dx * 1.3f + dy <= radio)
                            pixeles[y * pixelSize + x] = color;
                    }
                break;

            case Forma.Rombo:
                for (int x = 0; x < pixelSize; x++)
                    for (int y = 0; y < pixelSize; y++)
                    {
                        float dx = Mathf.Abs(x - centro);
                        float dy = Mathf.Abs(y - centro);
                        if (dx + dy <= radio)
                            pixeles[y * pixelSize + x] = color;
                    }
                break;

            case Forma.FlechaArriba:
                DibujarFlecha(pixeles, pixelSize, color, Direccion.Arriba);
                break;
            case Forma.FlechaAbajo:
                DibujarFlecha(pixeles, pixelSize, color, Direccion.Abajo);
                break;
            case Forma.FlechaIzquierda:
                DibujarFlecha(pixeles, pixelSize, color, Direccion.Izquierda);
                break;
            case Forma.FlechaDerecha:
                DibujarFlecha(pixeles, pixelSize, color, Direccion.Derecha);
                break;
        }

        tex.SetPixels(pixeles);
        tex.Apply();
        return Sprite.Create(tex, new Rect(0, 0, pixelSize, pixelSize), new Vector2(0.5f, 0.5f));
    }

    private enum Direccion { Arriba, Abajo, Izquierda, Derecha }

    private static void DibujarFlecha(Color[] pixeles, int size, Color color, Direccion dir)
    {
        int centro = size / 2;
        int radio = size / 2 - 4;
        int punta = size / 3;
        int baseFlecha = size * 2 / 3;

        for (int x = 0; x < size; x++)
            for (int y = 0; y < size; y++)
            {
                bool dibujar = false;
                switch (dir)
                {
                    case Direccion.Arriba:
                        if (y < punta && Mathf.Abs(x - centro) <= (punta - y) * (radio / (float)punta))
                            dibujar = true;
                        else if (y >= punta && y < baseFlecha && Mathf.Abs(x - centro) <= radio / 3)
                            dibujar = true;
                        break;
                    case Direccion.Abajo:
                        if (y > size - punta && Mathf.Abs(x - centro) <= (y - (size - punta)) * (radio / (float)punta))
                            dibujar = true;
                        else if (y <= size - punta && y > size - baseFlecha && Mathf.Abs(x - centro) <= radio / 3)
                            dibujar = true;
                        break;
                    case Direccion.Izquierda:
                        if (x < punta && Mathf.Abs(y - centro) <= (punta - x) * (radio / (float)punta))
                            dibujar = true;
                        else if (x >= punta && x < baseFlecha && Mathf.Abs(y - centro) <= radio / 3)
                            dibujar = true;
                        break;
                    case Direccion.Derecha:
                        if (x > size - punta && Mathf.Abs(y - centro) <= (x - (size - punta)) * (radio / (float)punta))
                            dibujar = true;
                        else if (x <= size - punta && x > size - baseFlecha && Mathf.Abs(y - centro) <= radio / 3)
                            dibujar = true;
                        break;
                }
                if (dibujar)
                    pixeles[y * size + x] = color;
            }
    }
}