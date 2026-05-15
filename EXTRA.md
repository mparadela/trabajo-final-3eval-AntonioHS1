## EXTRA — Widget del tiempo con Open-Meteo

### ¿Qué es?

Como parte opcional del proyecto, podéis integrar un widget de clima en tiempo real que muestre la temperatura y el estado del cielo de hoy. El widget ya está incluido en el HTML que os he dado, solo tenéis que programar la lógica en JavaScript.

### API que vais a usar: Open-Meteo

Open-Meteo es una API meteorológica de código abierto. Tiene dos ventajas importantes para este proyecto:

- **Gratuita para uso no comercial**
- **No requiere registro ni API Key**

No hace falta crear ninguna cuenta ni exponer ninguna contraseña en vuestro repositorio de GitHub. Solo necesitáis construir la URL correcta y hacer el fetch.


## Endpoint

La API devuelve datos meteorológicos diarios. Este es el endpoint para Zaragoza:

```
https://api.open-meteo.com/v1/forecast?latitude=41.6488&longitude=-0.8891&daily=weathercode,temperature_2m_max&timezone=Europe/Madrid
```

Podéis cambiar `latitude` y `longitude` por cualquier otra ciudad.

**Ejemplo de respuesta JSON** (simplificado):

```json
{
  "daily": {
    "time": ["2025-05-20", "2025-05-21", ...],
    "weathercode": [2, 3, 0, ...],
    "temperature_2m_max": [24.1, 19.8, 27.3, ...]
  }
}
```

El primer elemento de cada array corresponde a **hoy**. Solo necesitáis el índice `[0]`.

### Códigos meteorológicos WMO

La API no devuelve texto descriptivo, sino un código numérico (`weathercode`). Tenéis que traducirlo vosotros a texto e icono. Aquí tenéis los más comunes:

| Código | Descripción           | Emoji sugerido |
|--------|-----------------------|----------------|
| 0      | Cielo despejado       | ☀️              |
| 1      | Principalmente claro  | 🌤️              |
| 2      | Parcialmente nublado  | ⛅              |
| 3      | Nublado               | ☁️              |
| 45, 48 | Niebla                | 🌫️              |
| 51–55  | Llovizna              | 🌦️              |
| 61–65  | Lluvia                | 🌧️              |
| 71–75  | Nieve                 | 🌨️              |
| 80–82  | Chubascos             | 🌦️              |
| 95     | Tormenta              | ⛈️              |

Referencia completa: https://open-meteo.com/en/docs (sección "Weather Code")


## Elementos del HTML que tenéis que actualizar

```html
<span id="weather-icon">--</span>      <!-- Aquí ponéis el emoji -->
<span id="weather-temp">--°C</span>    <!-- Aquí la temperatura -->
<p id="weather-desc">Cargando...</p>   <!-- Aquí la descripción -->
<p class="weather-city">Zaragoza, ES</p> <!-- Aquí el nombre de la ciudad -->
```

---

### Extra del extra — Geolocalización

Si queréis ir un paso más allá, podéis usar la **Geolocation API** del navegador para mostrar el tiempo de la ubicación real del ordenador, en lugar de usar siempre Zaragoza.
Para la ubicación real del ordenador tenéis que utilizar los métodos correspondientes del objeto navigator.

### Lo que se evaluará

Para que el extra compute en la nota, la implementación tiene que:

1. Hacer un `fetch` correcto al endpoint de Open-Meteo
2. Mostrar la temperatura máxima de hoy en `#weather-temp`
3. Mostrar un icono o emoji representativo en `#weather-icon`
4. Mostrar una descripción textual en `#weather-desc`
5. Gestionar el error correctamente si la API no responde (sin romper la app)

La geolocalización es un extra adicional que suma, pero no es obligatoria para que el widget compute.
