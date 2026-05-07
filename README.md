# Bot educativo de vocabulario para primaria

Este proyecto incluye:

- index.html
- style.css
- app.js
- data/vocabulario.json
- carpeta img/ para colocar tus imágenes

## Importante

El vocabulario se carga desde `data/vocabulario.json` usando `fetch`.

Por eso, para probarlo correctamente, abre el proyecto con Live Server en Visual Studio Code
o ejecuta este comando dentro de la carpeta del proyecto:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Imágenes

Coloca tus imágenes dentro de la carpeta `img/`.

Ejemplo:

```text
img/vaca.png
img/perro.png
img/gato.png
```

Si una imagen no existe, el bot no se rompe. Mostrará:

```text
Imagen no disponible
```

## Cómo agregar una palabra nueva

Abre `data/vocabulario.json` y agrega un objeto como este:

```json
{
  "id": 24,
  "espanol": "caballo",
  "ingles": "horse",
  "imagen": "img/caballo.png",
  "grado": "primero"
}
```
