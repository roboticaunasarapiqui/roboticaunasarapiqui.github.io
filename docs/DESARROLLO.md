# Guía técnica del sitio

Cómo está armado el sitio y cómo modificarlo. Para la información del proyecto, ver el [README](../README.md).

HTML, CSS y JavaScript sin dependencias. GitHub Pages compila el sitio con Jekyll al publicar; no hay paso de build propio.

## Estructura

```
index.html  about.html  resources.html  contact.html  404.html   contenido de cada página (front matter + HTML)
_layouts/default.html    <head>, skip-link, header, <main> y footer comunes
_includes/               header, footer, steam-bar, resource-row, person y carousel
_data/nav.yml            enlaces del menú: única fuente de verdad
_data/resources.yml      recursos agrupados por tipo (editores, simuladores, apoyo)
_data/people.yml         personas de contacto (el correo va en dos partes)
_data/gallery.yml        fotos del carrusel de "Sobre el proyecto", en el orden en que salen
_data/author.yml         quién hizo el sitio (nombre y usuario de GitHub, se muestra en el footer)
_config.yml              título, idioma y url del sitio
images/                  fotos del sitio en .webp
assets/
  css/
    tokens.css       colores, tipografía, espacio, motion
    base.css         reset, tipografía, enlaces, foco
    components.css   header, footer, hero, filas, recursos, carrusel, video, contacto
    motion.css       transiciones y animaciones (respeta prefers-reduced-motion)
  js/nav.js          menú móvil
  js/email.js        arma los enlaces de correo (el HTML no contiene la dirección) y el botón de copiar
  js/to-top.js       botón flotante "Volver arriba"
  js/carousel.js     botones, contador y avance automático del carrusel
  fonts/             Atkinson Hyperlegible (400 y 700)
_templates/          page.html y sections.html para copiar y pegar (Jekyll no los publica)
docs/                esta guía (Jekyll no la publica)
```

## Ver el sitio en local

Requiere Ruby. Con Ruby instalado:

```
bundle install
bundle exec jekyll serve
```

y abrir <http://localhost:4000>. Sin Ruby, basta subir los cambios: GitHub Pages compila el sitio.

`_config.yml` no se recarga solo: si se cambia, hay que reiniciar el servidor.

## Agregar una sección

1. Abrir `_templates/sections.html`.
2. Copiar el bloque que corresponda en la página, después del front matter.
3. Alternar `.section` y `.section section-alt` entre secciones contiguas.

Para un componente nuevo: agregar sus estilos a `assets/css/components.css` con una sola clase por regla y usar solo variables de `tokens.css`; sus transiciones van en `motion.css`.

## Agregar una página

1. Copiar `_templates/page.html` a la raíz con el nombre nuevo y completar `title` y `description`.
2. Agregar su enlace en `_data/nav.yml`. El menú, el footer y `aria-current` salen del layout.

## Agregar un recurso

Editar `_data/resources.yml`: agregar el recurso a un grupo existente o crear un grupo nuevo. Lleva `title`, `description` y `url`, o `mail: responsable` si se solicita por correo. `platform` es opcional (`lego`, `spike`, `roberta`, `arduino`). `access` también (`online` o `offline`, que se muestra como "En línea" o "Sin internet"). Para una plataforma nueva: agregarla en `platforms`, definir `--cat-<clave>` en `tokens.css` y la regla `.tag-<clave>` en `components.css`. `resources.html` no se toca.

## Fotos y carrusel

Para agregar una foto al carrusel:

1. Convertirla a `.webp` de 1600 px como máximo por lado (las fotos de celular pesan varios MB) y guardarla en `images/` con un nombre descriptivo.
2. Agregar un bloque en `_data/gallery.yml` con `src`, `alt` (qué se ve), `width` y `height` reales. El orden del archivo es el orden en que salen.

Recomendado: de 8 a 12 fotos; pasadas 20, mejor una página de álbum aparte. El carrusel avanza solo cada 5 segundos (parámetro `autoplay` en `about.html`, en milisegundos; sin él no avanza solo). Se detiene si la persona toca los controles, si cambia de pestaña o si el carrusel sale de pantalla, y tiene botón de pausa.

## Correos

Las personas de contacto viven en `_data/people.yml`. Para escribir un correo suelto en cualquier página:

No escribir direcciones en el HTML. Usar `<a data-mail-user="usuario" data-mail-domain="una.ac.cr"></a>`; `email.js` arma el `mailto:` en el navegador. Con el enlace vacío muestra la dirección, y con texto lo conserva.

Esto frena a los bots que solo leen el HTML, pero no a los que ejecutan JavaScript ni a quien lea el repositorio público.

## Paleta

Claro y neutro: el color lo ponen las fotos y el logo de la rana. Los cinco colores de STEAM son marcas pequeñas (una franja al pie del hero y del footer y los marcadores de Recursos), nunca fondos.

| Rol | Token | Valor |
| --- | --- | --- |
| Base | `--surface`, `--surface-alt`, `--border`, `--border-strong` | `#ffffff`, `#f3f4f5`, `#e2e5e7`, `#aeb6bb` |
| Texto y estructura | `--ink`, `--ink-muted`, `--on-ink-muted` | `#1d2327`, `#566066`, `#c3c9cd` |
| Acción (botón `.action`) | `--action`, `--action-hover` | `#1d2327`, `#f2b600` |
| STEAM | `--steam-s` Ciencia, `--steam-t` Tecnología, `--steam-e` Ingeniería, `--steam-a` Arte, `--steam-m` Matemáticas | `#3f9d5b`, `#1f8fc4`, `#f2b600`, `#d6336c`, `#f07f1a` |

La franja está en `_includes/steam-bar.html`: `{% include steam-bar.html %}` dentro de un elemento `position: relative`.
