# Robótica para el Desarrollo de Habilidades STEAM

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Sitio web del curso **0268-22 - Robótica para el Desarrollo de Habilidades STEAM** de la Universidad Nacional de Costa Rica, Sección Regional Huetar Norte y Caribe - Sarapiquí.

HTML, CSS y JavaScript sin dependencias. GitHub Pages compila el sitio con Jekyll al publicar; no hay paso de build propio.

## Estructura

```
index.html  about.html  resources.html  contact.html  404.html   contenido de cada página (front matter + HTML)
_layouts/default.html    <head>, skip-link, header, <main> y footer comunes
_includes/               header, footer (enlaces de nav.yml y contacto de people.yml), steam-bar, resource-row y person
_data/nav.yml            enlaces del menú: única fuente de verdad
_data/resources.yml      recursos agrupados por tipo (editores, simuladores, apoyo)
_data/people.yml         personas de contacto (el correo va en dos partes)
_data/author.yml         quién hizo el sitio (nombre y usuario de GitHub, se muestra en el footer)
_data/gallery.yml        fotos del carrusel de "Sobre el proyecto" (de 8 a 12; pasadas 20, mejor un álbum aparte)
_config.yml              título, idioma y url del sitio
images/
assets/
  css/
    tokens.css       colores, tipografía, espacio, motion
    base.css         reset, tipografía, enlaces, foco
    components.css   header, footer, hero, filas, recursos, carrusel, video, contacto
    motion.css       transiciones y animaciones (respeta prefers-reduced-motion)
  js/nav.js          menú móvil
  js/email.js        arma los enlaces de correo (el HTML no contiene la dirección) y el botón de copiar
  js/to-top.js       botón flotante "Volver arriba"
  js/carousel.js     botones y contador del carrusel
  fonts/             Atkinson Hyperlegible (400 y 700)
_templates/          page.html y sections.html para copiar y pegar (Jekyll no los publica)
```

## Ver el sitio en local

Requiere Ruby. Con Ruby instalado:

```
bundle install
bundle exec jekyll serve
```

y abrir <http://localhost:4000>. Sin Ruby, basta subir los cambios: GitHub Pages compila el sitio.

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

## Correos

Las personas de contacto viven en `_data/people.yml`. Para escribir un correo suelto en cualquier página:

No escribir direcciones en el HTML. Usar `<a data-mail-user="usuario" data-mail-domain="una.ac.cr"></a>`; `email.js` arma el `mailto:` en el navegador. Con el enlace vacío muestra la dirección, y con texto lo conserva.

## Paleta

Claro y neutro: el color lo ponen las fotos y el logo de la rana. Los cinco colores de STEAM son marcas pequeñas (una franja al pie del hero y los marcadores de Recursos), nunca fondos.

| Rol | Token | Valor |
| --- | --- | --- |
| Base | `--surface`, `--surface-alt`, `--border`, `--border-strong` | `#ffffff`, `#f3f4f5`, `#e2e5e7`, `#aeb6bb` |
| Texto y estructura | `--ink`, `--ink-muted`, `--on-ink-muted` | `#1d2327`, `#566066`, `#c3c9cd` |
| Acción (botón `.action`) | `--action`, `--action-hover` | `#1d2327`, `#f2b600` |
| STEAM | `--steam-s` Ciencia, `--steam-t` Tecnología, `--steam-e` Ingeniería, `--steam-a` Arte, `--steam-m` Matemáticas | `#3f9d5b`, `#1f8fc4`, `#f2b600`, `#d6336c`, `#f07f1a` |

La franja está en `_includes/steam-bar.html`: `{% raw %}{% include steam-bar.html %}{% endraw %}` dentro de un elemento `position: relative`.
