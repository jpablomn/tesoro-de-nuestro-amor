# El Tesoro de Nuestro Amor 🏴‍☠️

Una búsqueda del tesoro interactiva y personalizada. HTML5, CSS3 y JavaScript ES6 puro — sin frameworks, sin build, sin dependencias externas más que dos librerías tipográficas de Google Fonts.

## Estructura del proyecto

```
tesoro-de-nuestro-amor/
├── index.html
├── robots.txt          # noindex — este sitio no debe indexarse ni compartirse
├── styles/
│   ├── tokens.css        # colores, tipografía, espaciado, easing
│   ├── base.css           # reset + globales + prefers-reduced-motion
│   ├── components.css      # botones, formulario de código, sello, modal de ayuda, cofre
│   ├── map.css              # arte del mapa y sus tres estados
│   └── scenes.css            # composición de cada escena
└── scripts/
    ├── content.js       # TODA la narrativa: textos, pistas, ayudas, códigos, destino
    ├── state.js           # máquina de progreso (locked/available/completed) + localStorage
    ├── narrator.js         # frases del Capitán
    ├── soundscape.js         # sonido ambiental generado por código (Web Audio API)
    ├── transitions.js         # cambios de escena
    ├── hints.js                # modal de ayuda progresiva
    ├── map.js                   # mapa SVG, marcadores, rutas, paneo de cámara
    └── app.js                    # orquestación principal
```

## Instalación

No requiere `npm install` ni build. Es un sitio 100% estático.

```bash
cd tesoro-de-nuestro-amor
python3 -m http.server 8811
```

Luego abre `http://localhost:8811`. (Abrir `index.html` con doble clic también funciona, aunque el módulo de sonido y algunos fetch de fuentes se comportan mejor servidos por HTTP.)

## Configuración

Todo lo narrativo vive en `scripts/content.js`, sin tocar el resto del código:

- **Lugares, pistas y ayudas progresivas** de cada una de las 5 paradas.
- **Códigos secretos** de las tarjetas físicas (`secretCode` por parada) — hoy son provisionales (BRÚJULA, TESORO, TIMÓN, ROSA, DULCE); cámbialos y actualiza las tarjetas de Canva a la par.
- **Mensajes del cofre** y del mapa final.
- **`finalMap.destination.label`** — el lugar exacto donde esperarás al final. Vacío a propósito; complétalo cuando lo tengas decidido.

## Reiniciar la aventura

El progreso se guarda en `localStorage`. Para reiniciarlo (por ejemplo, para probar de nuevo desde cero), visita:

```
https://tu-usuario.github.io/tesoro-de-nuestro-amor/?reset=1
```

Esto no es un botón visible a propósito — no debe aparecer durante la experiencia real.

## Privacidad

Este sitio contiene los códigos y la narrativa completa de una sorpresa. `robots.txt` y la etiqueta `<meta name="robots">` piden a los buscadores que no lo indexen, pero la URL sigue siendo pública para quien la tenga — no la compartas en redes ni la enlaces desde otro sitio.

## Publicar en GitHub Pages

```bash
cd tesoro-de-nuestro-amor
git init
git add .
git commit -m "El Tesoro de Nuestro Amor: primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tesoro-de-nuestro-amor.git
git push -u origin main
```

Luego, en GitHub → **Settings → Pages**, selecciona la rama `main` y la carpeta `/ (root)`.

## Accesibilidad

- Navegación completa por teclado en los marcadores del mapa (Tab, Enter/Espacio) y en el modal de ayuda (Escape cierra).
- `aria-live` en la línea del narrador y en el feedback del código.
- Respeta `prefers-reduced-motion` en transiciones, paneo del mapa, cofre y sonido.

## Rendimiento

- Sin frameworks ni librerías externas — todo el mapa, los iconos y los efectos son SVG/CSS inline.
- Sonido ambiental sintetizado por código (Web Audio API): cero archivos de audio.
- Proyecto completo: ~90 KB de texto (HTML + CSS + JS), sin imágenes.
