# Design

## Context

Ver proposal.md (Why) y las specs `visual-style` y `game-ui` de este cambio para los requisitos.

Estado actual relevante:

- Todo el estilo vive en `src/ui/styles.css` (unas 70 líneas, colores sueltos, sin variables). Se importa desde `src/main.ts`.
- `renderGameScreen` (`src/ui/boardView.ts`) vacía el contenedor y recrea las 81 celdas y los botones en cada acción, y después llama a `grid.focus()`. Por eso una transición CSS en una celda no llega a ejecutarse, y una animación por fotogramas se repetiría en cada jugada. Por esta razón la selección cambia sin animación (decisión del usuario).
- Las celdas ya exponen `data-fixed`, `aria-selected`, `data-row` y `data-col`. Los botones exponen `data-difficulty`, `data-digit` y `data-action="erase"`; "Reintentar" y "Nueva partida" no tienen atributos propios.
- `index.html` no tiene `<meta name="viewport">`. En un móvil real, o en Playwright con `isMobile: true`, la página se maqueta a 980 px y se reduce, en lugar de maquetarse a 360 px.
- El tablero mide `min(92vw, 420px)` dentro de un contenedor con `padding: 1rem`. A 360 px son 331 + 32 = 363 px, que ya desborda en cuanto la página se maqueta de verdad a 360 px.
- Vitest solo incluye `src/**/*.test.ts` y se ejecuta sin DOM. Playwright toma `e2e/`.

## Goals / Non-Goals

**Goals:**

- Una sola fuente de verdad para la paleta, legible tanto por el CSS como por los tests.
- Tests de contraste deterministas: fondos opacos y sin colores intermedios de una transición.
- Cambios de marcado mínimos y sin tocar `src/core/` ni la lógica de estado.

**Non-Goals:**

- No se reescribe el dibujado del tablero para evitar recrear el DOM. Se queda como está.
- No se crea un sistema de temas ni un mecanismo para cambiar de paleta en tiempo de ejecución.

## Decisions

### D1. La paleta son variables CSS con nombre en `:root`

Los colores se definen una sola vez como propiedades personalizadas en `:root`, dentro de `src/ui/styles.css`. Todo el resto del CSS las usa con `var(--…)`. Los tests las leen de dos formas: desde el propio archivo en los tests unitarios (D7) y con `getComputedStyle(document.documentElement)` en los tests funcionales.

Paleta, con contrastes ya calculados según la fórmula de WCAG 2.x:

| Variable | Valor | Uso | Contraste comprobado |
|---|---|---|---|
| `--color-bg` | `#0f172a` | fondo de la página | luminancia 0,009 (≤ 0,03); B ≥ R, G |
| `--color-surface` | `#1e293b` | fondo de celdas, del panel de error y de botones desactivados | — |
| `--color-surface-selected` | `#24344f` | fondo de la celda seleccionada | — |
| `--color-text` | `#ffffff` | números fijos, texto general, texto de los secundarios | 14,6 sobre surface; 12,5 sobre selected; 17,9 sobre bg |
| `--color-accent` | `#38bdf8` | números del jugador, selección, fondo de los principales, foco | 6,8 sobre surface; 5,8 sobre selected; 8,3 sobre bg |
| `--color-accent-hover` | `#7dd3fc` | principal con el ratón encima | texto on-accent: 10,7 |
| `--color-accent-active` | `#0ea5e9` | principal pulsado | texto on-accent: 6,4 |
| `--color-on-accent` | `#0f172a` | texto sobre fondo de acento | 8,3 sobre acento |
| `--color-secondary` | `#334155` | fondo de los secundarios | texto: 10,4 |
| `--color-secondary-hover` | `#475569` | secundario con el ratón encima | texto: 7,6 |
| `--color-secondary-active` | `#293548` | secundario pulsado | texto: 12,4 |
| `--color-border` | `#64748b` | borde de los secundarios, líneas gruesas de 3x3, borde del tablero | 3,75 sobre bg |
| `--color-grid-line` | `#334155` | líneas finas entre celdas | — |
| `--color-text-disabled` | `#94a3b8` | texto de los botones desactivados | 5,7 sobre surface (≥ 3) |
| `--color-error` | `#f87171` | reservado, sin uso | 6,5 sobre bg |
| `--color-success` | `#4ade80` | reservado, sin uso | 10,2 sobre bg |

Los botones principales llevan texto oscuro (`--color-on-accent`) sobre el acento. El texto blanco sobre un azul vivo no llega a 4,5:1: con `#38bdf8` da unos 2,1:1.

Alternativas descartadas:
- Una paleta en un módulo TypeScript inyectada en el DOM: añade código de ejecución solo para tener colores.
- Colores escritos directamente en cada regla: no se pueden comprobar desde los tests y se desincronizan.

### D2. Botones principales y secundarios marcados con `data-variant`

Cada botón recibe `data-variant="primary"` o `data-variant="secondary"` al crearse:

- principales: dificultades y "Reintentar" (`startScreen.ts`), y números 1-9 (`numberPanel.ts`);
- secundarios: "Borrar" (`numberPanel.ts`) y "Nueva partida" (`boardView.ts`).

El CSS apunta a `button[data-variant="…"]`. Así se sigue el mismo estilo de atributos `data-*` que ya usa la interfaz, y los tests pueden encontrar los botones de cada tipo.

Alternativa descartada: inferir el tipo a partir de `data-digit`, `data-difficulty` y similares. "Reintentar" y "Nueva partida" no tienen atributo, y la regla se rompería en silencio al añadir un botón nuevo.

### D3. Estados de los botones solo con CSS

- Reposo: fondo y borde de su tipo, `border-radius: 10px` y sombra suave (`0 2px 6px rgb(0 0 0 / 0.35)`).
- Los secundarios mantienen el borde `1px solid var(--color-border)` en reposo, con el ratón encima y pulsados. Su fondo solo da 1,7:1 (reposo) y 2,4:1 (con el ratón encima) frente al fondo de la página, así que el 3:1 de "Límite del botón visible" depende de ese borde (3,75:1).
- `:hover:not(:disabled)`: fondo `-hover` y una sombra algo mayor.
- `:active:not(:disabled)`: fondo `-active`, `transform: translateY(1px)` y una sombra menor. Es distinto del aspecto con el ratón encima, como pide la spec.
- `:focus-visible`: `outline: 3px solid var(--color-accent)` con `outline-offset: 2px`, en todos los botones. La spec permite que el foco de los secundarios use el acento.
- `:disabled`: fondo `--color-surface`, texto `--color-text-disabled`, borde `--color-grid-line`, sin sombra y con `cursor: not-allowed`. Como los estados anteriores llevan `:not(:disabled)`, un botón desactivado no reacciona al ratón.
- Altura mínima de 44 px, para que el área táctil sea cómoda.

### D4. Casilla seleccionada: `outline` sólido más `box-shadow` de acento

`[role="gridcell"][aria-selected="true"]` tiene:
- `background: var(--color-surface-selected)`;
- `outline: 2px solid var(--color-accent)` con `outline-offset: -2px`. El contorno queda dentro de la celda, así que no lo tapan las celdas vecinas;
- `box-shadow: 0 0 12px 2px rgb(56 189 248 / 0.55)` (el acento translúcido), que es el brillo decorativo. Es la única excepción a D1: los canales del acento están escritos a mano. Con `color-mix(in srgb, var(--color-accent) 55%, transparent)` el navegador devolvería el color calculado en el formato `color(srgb …)`, y la detección por canales de D8 dejaría de funcionar. Para que no se desincronicen, `palette.test.ts` comprueba que los canales de ese `rgb()` coinciden con `--color-accent` (D7);
- `position: relative; z-index: 1`, para que el brillo se pinte por encima de las celdas vecinas.

Las celdas usan `outline: none` y `box-shadow: none` cuando no están seleccionadas, y no tienen reglas `:hover` ni `transition`.

Se usa `outline` y no `border` porque los bordes ya dibujan la cuadrícula: si se cambiara el borde, la celda se movería y se alterarían las líneas de 3x3 que comprueba `e2e/blocks.spec.ts`. Con `outline`, el contorno es "adicional y distinto de las líneas de la cuadrícula", como pide la spec.

### D5. Tablero redondeado sin recortar la selección

- El tablero tiene `border: 3px solid var(--color-border)`, `border-radius: 12px`, la sombra `0 8px 24px rgb(0 0 0 / 0.45)` y `overflow: visible`. No se usa `overflow: hidden`, porque recortaría el brillo y el contorno de las celdas de las esquinas.
- Para que el fondo de las cuatro celdas de las esquinas no sobresalga del borde redondeado, cada una lleva en su esquina exterior un radio de 9 px (12 − 3).
- Se mantienen los grosores actuales de los bordes: 1 px dentro de un cuadro de 3x3 y 3 px entre cuadros. Así siguen pasando los tests de separación existentes y el nuevo escenario del redondeo.

### D6. Foco del tablero con `:focus-visible`

`[role="grid"]:focus-visible` muestra `outline: 3px solid var(--color-accent)` con `outline-offset: 4px`, que rodea el tablero entero por fuera de su borde. `[role="grid"]:focus` sin `:focus-visible` usa `outline: none`, así que al usar el ratón no aparece el anillo. El indicador es distinto del de la selección por su posición, fuera del tablero, y por su tamaño.

El `grid.focus()` que se ejecuta tras cada acción hereda el criterio del navegador: si la interacción anterior fue con el teclado, el anillo se mantiene; si fue con el ratón, no aparece.

### D7. Medir el contraste con un módulo puro compartido

`src/ui/contrast.ts` exporta funciones puras, sin DOM:
- `parseColor(css)`: acepta `#rrggbb` y `rgb()`/`rgba()`, que es lo que devuelve `getComputedStyle`;
- `relativeLuminance(rgb)`;
- `contrastRatio(a, b)`.

Lo usan:
- `src/ui/contrast.test.ts` (Vitest), que comprueba casos conocidos: blanco sobre negro = 21, un color sobre sí mismo = 1 y un valor intermedio de referencia;
- `src/ui/palette.test.ts` (Vitest), que lee `src/ui/styles.css` como texto con `import css from "./styles.css?raw"`. Extrae las variables `--color-*` de `:root` y comprueba las reglas de la paleta: luminancia del fondo, acento ≥ 4,5 sobre surface y surface-selected, reservados ≥ 4,5 sobre bg y distintos entre sí y del acento, y que los canales del brillo de D4 son los del acento;
- los tests de Playwright, que lo importan para calcular el contraste a partir de los colores calculados del navegador.

Se pone en `src/ui/` porque es la única carpeta que recoge Vitest. Además, si `e2e/` tuviera un `*.test.ts`, Playwright lo ejecutaría como test funcional. La aplicación no lo importa, así que el empaquetado lo descarta.

Para que `tsc` acepte el `?raw`, se añade `src/vite-env.d.ts` con `/// <reference types="vite/client" />`. Vite ya está instalado, así que no hay dependencias nuevas, y Vitest entiende `?raw` igual que Vite. Por defecto Vitest sustituye los CSS por una cadena vacía, también con `?raw`, así que `vitest.config.ts` añade `css: { include: [/styles\.css/] }`.

Alternativa descartada: leer el archivo con `node:fs`. `tsconfig.json` incluye todo `src`, también los tests, y `npm run build` ejecuta `tsc --noEmit`. Sin `@types/node`, que no está instalado, la compilación fallaría, y añadirlo sería una dependencia nueva.

Alternativa descartada: añadir una dependencia de accesibilidad (axe-core o similar). Está prohibido añadir dependencias sin consultarlo, y además no comprueba los estados de pasar el ratón ni de pulsar.

### D8. Tests de contraste fiables

- **Fondos sólidos.** Todo texto queda sobre un fondo opaco: celdas, botones, panel del mensaje de error y `body`/`html` con `--color-bg`. No hay degradados ni fondos translúcidos detrás del texto. El ayudante de Playwright `effectiveBackground(el)` sube por los ancestros hasta encontrar el primer `background-color` con alfa 1. Si antes encuentra un `background-image` o un fondo con un alfa intermedio, falla en lugar de adivinar.
- **Sin colores intermedios.** Los tests que miden contraste, colores o estados ejecutan `page.emulateMedia({ reducedMotion: "reduce" })`. Las transiciones duran entonces 0 s (D9) y no se mide un color a medio camino. Solo se ejecutan sin esa preferencia los tests de duración de la transición y el de "Las animaciones no retrasan la jugada", que necesita una transición en curso.
- **Pulsar sin efectos secundarios.** Al soltar un botón se produce un clic real. Los tests de pulsar y soltar usan botones cuyo clic no cambia nada: un número del panel y "Borrar", ambos sin celda seleccionada (`handleDigit` y `handleErase` devuelven el mismo tablero y no se redibuja la pantalla). Un botón de dificultad iniciaría la generación, y "Nueva partida" volvería a la pantalla inicial.
- **Pulsar y pasar el ratón.** Para pasar el ratón se usa `locator.hover()`. Para pulsar se combina `hover()` con `page.mouse.down()`: se mide con el botón pulsado y después se ejecuta `mouse.up()`.
- **Detectar el acento.** Los tests leen `--color-accent` (y los demás colores) desde `:root`, lo normalizan a `rgb()` con un elemento temporal y comparan con los valores calculados (`color`, `background-color`, `outline-color` o `border-*-color`). El brillo se comprueba buscando los canales del acento dentro de `box-shadow`.

### D9. Transiciones solo en los botones, y regla global de movimiento reducido

- Los botones tienen `transition: background-color, border-color, box-shadow, transform` de 150 ms (≤ 250 ms). Las transiciones nunca afectan al contenido, a `visibility` ni a `pointer-events`, así que el texto y la posibilidad de pulsar cambian al instante.
- Las celdas no tienen `transition` ni `animation`.
- Dentro de `@media (prefers-reduced-motion: reduce)`, la regla `*, *::before, *::after { transition: none !important; animation: none !important; }` desactiva todas las transiciones y animaciones. Los cambios de color, contorno y posición siguen ocurriendo, solo que de golpe.

### D10. Tema oscuro fijo y tipografía del sistema

- `:root { color-scheme: dark; }`, para que las barras de desplazamiento y los controles nativos se vean oscuros. No hay ninguna regla `prefers-color-scheme`, así que la preferencia clara del sistema no cambia nada.
- `html, body { background: var(--color-bg); color: var(--color-text); }`, con `min-height: 100dvh` en `body`.
- `font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No hay `@font-face` ni enlaces a fuentes externas. Los números del tablero llevan `font-variant-numeric: tabular-nums`.
- Pesos: celdas fijas 700 y celdas editables 400, también con la celda seleccionada.
- El título y el aviso "Generando..." se pintan con `--color-text` sobre `--color-bg`. El mensaje de error va en un recuadro con fondo `--color-surface`, borde `--color-border`, texto `--color-text` y `overflow-wrap: anywhere`, para que un mensaje largo, aunque no tenga espacios, se reparta en varias líneas. No usa el color de error.
- El título (`h1`) mide `2rem`, con peso 700, `letter-spacing: 0.01em` y margen `1rem 0 1.5rem`. El aviso "Generando..." (`[role="status"]`) lleva un margen vertical de `1rem`.

### D11. Maquetación a 360x640 y `meta viewport`

- Se añade `<meta name="viewport" content="width=device-width, initial-scale=1">` a `index.html`.
- `[data-screen]` pasa a tener `padding: 1rem`, `max-width: 460px` y `margin: 0 auto`. El tablero y el panel usan `width: min(100%, 420px)` en lugar de `92vw`, así que a 360 px miden 328 px y nunca desbordan su contenedor.
- El panel de números mantiene sus 5 columnas: dos filas de 44 px más el hueco. La suma de relleno, tablero (328), márgenes y panel (unos 96) da unos 470 px, que caben en 640 sin desplazamiento vertical. "Nueva partida" va debajo y puede quedar justo en el límite, lo que la spec permite.
- La pantalla inicial (`[data-screen="start"]`) centra su contenido con `text-align: center`. En la pantalla de juego, "Nueva partida" (`[data-screen="game"] > button`) se centra bajo el panel con `display: block` y `margin: 0 auto`.
- Los tests de 360x640 usan `test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true })`. Además comprueban `window.innerWidth === 360`: sin `meta viewport` y con `isMobile`, el navegador maqueta a 980 px, y la comprobación de desplazamiento horizontal pasaría aunque el diseño estuviera mal. Esa comprobación de `innerWidth` es la que detecta que falta la etiqueta.
- Lo que la spec pide "completamente visible" se comprueba con `toBeInViewport({ ratio: 1 })`. Sin la opción, Playwright da por buena una visibilidad parcial.

## Risks / Trade-offs

- [El brillo translúcido de la selección se superpone a las celdas vecinas y puede reducir un poco el contraste percibido de sus números] → Un brillo de 12 px con un alfa de 0,55 no tapa el centro de la celda vecina. El contraste medido de cada número es el de su celda, que es opaca y no cambia.
- [`:focus-visible` tras un `grid.focus()` programático depende de la heurística de cada navegador] → Los tests de foco del tablero seleccionan primero la celda con un clic y después solo usan Tab y Mayúsculas+Tab, que no redibujan la pantalla. Así el anillo nunca depende de un `grid.focus()` programático. El comportamiento tras un clic no forma parte de la spec.
- [Con `isMobile` cambian algunas cosas en Chromium (táctil y desplazamiento)] → Solo se usa en los tests de 360x640. El resto de tests se queda en escritorio.
- [Recrear el DOM en cada acción reinicia `:hover` en los botones del panel] → Al recrearse, el navegador vuelve a calcular `:hover` en el siguiente movimiento del ratón. Es un parpadeo imperceptible con movimiento reducido o con transiciones de 150 ms, y la spec no lo cubre.
- [`src/ui/contrast.ts` es código que solo usan los tests, aunque vive en `src/`] → Es puro y pequeño, y el empaquetado lo descarta. Si un cambio posterior (avisos de error o éxito) lo necesita en la aplicación, ya está en su sitio.

## Migration Plan

No hay datos ni estado persistente. El cambio es solo de presentación y se revierte restaurando `styles.css`, `index.html` y los atributos `data-variant`.
