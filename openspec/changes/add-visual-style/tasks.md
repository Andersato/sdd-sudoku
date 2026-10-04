# Tasks

## 1. Base: medir el contraste, paleta, tema oscuro y tipografía

- [ ] 1.1 Crear `src/ui/contrast.ts` con `parseColor` (acepta `#rrggbb`, `rgb()` y `rgba()`), `relativeLuminance` y `contrastRatio` (D7). Verificar con `src/ui/contrast.test.ts` (Vitest, sin DOM): blanco sobre negro da 21, un color sobre sí mismo da 1, `#38bdf8` sobre `#1e293b` da 6,83 ± 0,01, y `parseColor("rgba(…, 0.5)")` conserva el alfa.
- [ ] 1.2 Reescribir la parte inicial de `src/ui/styles.css`: las variables `--color-*` de la paleta de D1 en `:root`, más `color-scheme: dark`, el fondo y el color de texto en `html`/`body`, `min-height: 100dvh` y la familia de fuentes del sistema (D10). Sin ninguna regla `prefers-color-scheme` ni `@font-face`. Crear `src/vite-env.d.ts` con `/// <reference types="vite/client" />` (D7). Verificar con `src/ui/palette.test.ts` (Vitest, lee el CSS con `import css from "./styles.css?raw"`, sin `node:fs`):
  - existen todas las variables de D1;
  - el fondo tiene luminancia ≤ 0,03, B ≥ R y B ≥ G, y no es `#000000`;
  - `--color-text` es `#ffffff`;
  - el acento da ≥ 4,5:1 sobre `--color-surface` y `--color-surface-selected` y no es blanco ni igual a los reservados;
  - error y éxito dan ≥ 4,5:1 sobre el fondo y son distintos entre sí y del acento;
  - el archivo no contiene `@font-face`;
  - si existe la regla de la celda seleccionada (se añade en 2.2), los canales R, G y B del `rgb()` de su `box-shadow` coinciden con `--color-accent` (D4).

  Verificar también que `npm run build` (incluye `tsc --noEmit`) pasa con el `?raw`.
- [ ] 1.3 Crear `e2e/support/style.ts` con los ayudantes de Playwright de D8: `paletteColor(page, name)` (lee una variable de `:root` y la normaliza a `rgb()`), `effectiveBackground(locator)` (falla si encuentra un `background-image` o un alfa intermedio), `textContrast(locator)` y `expectReducedMotion(page)`. `tsc` no revisa `e2e/`, así que se verifica usándolos: los tests de 1.4 los importan y pasan, y en 1.4 se añade un test con un elemento de fondo translúcido inyectado en la página, que comprueba que `effectiveBackground` falla en ese caso.
- [ ] 1.4 Crear `e2e/theme.spec.ts`. Verificar con Playwright, usando `e2e/support/style.ts`, los escenarios de "Tema oscuro fijo":
  - el fondo de la pantalla inicial cumple la luminancia y el tono;
  - es el mismo color mientras se genera (promesa pendiente con `installPuzzleHook`), en la pantalla de error (`rejectPending`) y en la de juego;
  - con `page.emulateMedia({ colorScheme: "light" })` el fondo es el mismo que con `"dark"`.

  Incluye también el test de 1.3 sobre un fondo translúcido.
- [ ] 1.5 Crear `e2e/typography.spec.ts`. Verificar con Playwright los escenarios de "Tipografía del sistema": al cargar la aplicación, elegir una dificultad y escribir un número no se registra ninguna petición con `resourceType() === "font"`, y ninguna regla de `document.styleSheets` es un `CSSFontFaceRule`.

## 2. Tablero: números, casilla seleccionada, forma y foco

- [ ] 2.1 En `styles.css`, dar estilo a las celdas: fondo `--color-surface`, líneas de 1 px `--color-grid-line` y de 3 px `--color-border` entre cuadros de 3x3, números fijos en `--color-text` con peso 700, números editables en `--color-accent` con peso 400, `tabular-nums`, y sin `:hover`, `transition` ni `animation`. Verificar en `e2e/cellStates.spec.ts` los escenarios de game-ui:
  - "Celdas fijas y editables se ven distintas": una celda fija comparada con una editable vacía y con una editable con número del jugador. La fija difiere de la vacía en el contenido y de la del jugador en el peso y el color;
  - "Celda fija frente a celda editable con número del jugador": pesos 700 y 400;
  - "La diferencia se mantiene al seleccionar la celda".

  Y los de visual-style "Número fijo en blanco" y "Número del jugador en color de acento". Verificar también que `e2e/board.spec.ts` y `e2e/blocks.spec.ts` siguen pasando sin cambios.
- [ ] 2.2 Implementar el indicador de la casilla seleccionada (D4): fondo `--color-surface-selected`, `outline` de 2 px de acento hacia dentro, brillo de acento con `box-shadow` (canales escritos a mano, D4) y `z-index`. Verificar que la comprobación de canales de `palette.test.ts` (1.2) se ejecuta y pasa. Verificar en `e2e/cellStates.spec.ts`:
  - "Celda seleccionada frente a no seleccionada": contorno sólido ≥ 2 px de acento y brillo con los canales del acento, y ninguna otra de las 80 celdas los tiene;
  - "La celda anterior pierde el indicador";
  - "Contorno de selección visible": ≥ 3:1 frente a `--color-surface`;
  - "Cada estado difiere de los demás en una propiedad medible que no es el color": con una fija, una vacía y una del jugador sin seleccionar, y otra celda seleccionada, se comprueban las 6 parejas por peso, contorno o brillo, o contenido.
- [ ] 2.3 Redondear el tablero sin recortar la selección (D5): borde de 3 px, `border-radius: 12px`, sombra, `overflow: visible` y radio de 9 px en la esquina exterior de las 4 celdas de las esquinas. Verificar en `e2e/shape.spec.ts`:
  - "Esquinas redondeadas": el radio del tablero es mayor que 0;
  - "Sombras suaves": el `box-shadow` del tablero no es `none`;
  - "El redondeo no borra la separación entre cuadros de 3x3", en horizontal y en vertical;
  - "El indicador no se recorta en las esquinas del tablero": con la celda (0,0) seleccionada, el tablero tiene `overflow` visible y la celda tiene el contorno de acento de ≥ 2 px hacia dentro.
- [ ] 2.4 Añadir el foco del tablero (D6): `:focus-visible` con un anillo de acento de 3 px a 4 px de distancia, y `outline: none` para `:focus` sin `:focus-visible`. Verificar en `e2e/focus.spec.ts`:
  - "Volver al tablero con el teclado": Tab hasta el botón "1" del panel y después Mayúsculas+Tab. El tablero tiene el foco y un `outline` sólido de acento ≥ 3:1 sobre el fondo;
  - "El foco del tablero no se confunde con la selección", en este orden: clic en una celda para seleccionarla, Tab hasta el botón "1" y Mayúsculas+Tab. Sin flechas ni otras teclas que redibujen la pantalla. El anillo está en el elemento `grid` y la celda seleccionada conserva su propio contorno.
- [ ] 2.5 Verificar en `e2e/cellStates.spec.ts` el escenario "Pasar el ratón por una celda no cambia su aspecto": se compara el fondo, el color, el `outline` y el `box-shadow` de una celda no seleccionada antes y después de `hover()`, con movimiento reducido.

## 3. Botones: tipos, estados y respuesta visual

- [ ] 3.1 Añadir `data-variant` al crear los botones (D2): `primary` para dificultades y "Reintentar" en `startScreen.ts` y para los números 1-9 en `numberPanel.ts`; `secondary` para "Borrar" en `numberPanel.ts` y "Nueva partida" en `boardView.ts`. Verificar con un test Playwright en `e2e/buttons.spec.ts` que cada botón de las pantallas inicial, de error y de juego tiene el `data-variant` esperado, y que todos los tests existentes de `e2e/` siguen pasando.
- [ ] 3.2 Dar estilo a los botones (D3):
  - base común: radio, sombra y altura mínima de 44 px;
  - principales: fondo de acento y texto `--color-on-accent`;
  - secundarios: `--color-secondary` con borde `--color-border` en todos sus estados;
  - estados `:hover:not(:disabled)` y `:active:not(:disabled)`;
  - `:focus-visible` con anillo de acento;
  - `:disabled` sin acento.

  Verificar en `e2e/buttons.spec.ts`, con movimiento reducido:
  - "Botón principal habilitado con acento": en las dificultades de la pantalla inicial, en "Reintentar" y las dificultades de la pantalla de error, y en los números del panel;
  - "Botón secundario sin acento", en reposo, con el ratón encima y pulsado (sobre "Borrar" sin celda seleccionada, D8);
  - "Botón desactivado sin acento";
  - "Límite del botón visible": fondo o borde ≥ 3:1 sobre el fondo, en reposo y con el ratón encima;
  - "Esquinas redondeadas" y "Sombras suaves" en los botones habilitados.
- [ ] 3.3 Verificar en `e2e/buttons.spec.ts` la respuesta visual, con movimiento reducido. Como principal se usa el botón "5" del panel y como secundario "Borrar", ambos sin celda seleccionada, para que pulsar y soltar no redibuje la pantalla (D8). Escenarios:
  - "Cambio al pasar el ratón";
  - "Cambio al pulsar": `hover` + `mouse.down`, distinto del aspecto con el ratón encima;
  - "Vuelta al reposo al quitar el ratón";
  - "Vuelta al aspecto con el ratón encima al soltar": `mouse.up` sin mover el ratón;
  - "Foco del teclado visible en los botones": con Tab;
  - "Indicador de foco visible": ≥ 3:1 sobre el fondo;
  - "Botón desactivado no reacciona": durante la generación, el aspecto es distinto del habilitado y no cambia con `hover()`.

## 4. Animaciones y movimiento reducido

- [ ] 4.1 Añadir las transiciones de 150 ms a los botones y la regla global de `prefers-reduced-motion: reduce` (D9). Verificar en `e2e/motion.spec.ts`, sin preferencia de movimiento reducido:
  - "Transición en los botones": se separan por comas los valores de `transition-duration` del botón, y todos deben ser > 0 s y ≤ 0,25 s;
  - "La selección cambia sin animación": todos los valores de `transition-duration` de las celdas son `0s` y `animation-name` es `none`.
- [ ] 4.2 Verificar en `e2e/motion.spec.ts`, **sin** movimiento reducido para que haya una transición en curso, el escenario "Las animaciones no retrasan la jugada": con una celda editable seleccionada, `hover()` sobre el botón "5" del panel, clic justo después y lectura inmediata del texto de la celda con `page.evaluate`, sin la espera automática de las comprobaciones. El resultado es "5".
- [ ] 4.3 Verificar en `e2e/motion.spec.ts`, con `page.emulateMedia({ reducedMotion: "reduce" })`:
  - "Sin transiciones con movimiento reducido": todos los valores de `transition-duration` de botones y celdas son `0s`;
  - "Los estados siguen distinguiéndose con movimiento reducido": la celda seleccionada conserva el contorno y el brillo, y el botón "5" (sin celda seleccionada) cambia de aspecto con el ratón encima y al pulsarlo.

## 5. Contraste del texto y colores reservados

- [ ] 5.1 Poner el mensaje de error de generación en un recuadro con fondo `--color-surface`, borde `--color-border`, texto `--color-text` y `overflow-wrap: anywhere` (D10). El título y "Generando..." usan `--color-text` sobre el fondo. Verificar en `e2e/contrast.spec.ts`, con movimiento reducido y `effectiveBackground`, que el texto alcanza ≥ 4,5:1 en estos escenarios:
  - "Número fijo legible";
  - "Número del jugador legible";
  - "Número del jugador legible dentro de la casilla seleccionada";
  - "Número fijo legible dentro de la casilla seleccionada";
  - "Título legible";
  - "Aviso de generación legible";
  - "Mensaje de error de generación legible".
- [ ] 5.2 Verificar en `e2e/contrast.spec.ts` dos escenarios:
  - "Texto de los botones legible en todos sus estados": para cada botón habilitado de las pantallas inicial, de error y de juego, ≥ 4,5:1 en reposo, con el ratón encima y con el foco. El estado pulsado se mide sobre el botón "5" y sobre "Borrar", ambos sin celda seleccionada (D8), y sobre un botón de dificultad con `mouse.down` sin `mouse.up`;
  - "Texto de un botón desactivado": ≥ 3:1 en los botones de dificultad durante la generación.
- [ ] 5.3 Verificar en `e2e/contrast.spec.ts` el escenario "Los colores reservados no aparecen todavía en pantalla": en las pantallas inicial, de generación, de error y de juego (con una celda seleccionada y un número del jugador), ningún elemento visible tiene `color`, `background-color`, `border-*-color` u `outline-color` igual a `--color-error` o a `--color-success`.

## 6. Pantalla de móvil de 360x640

- [ ] 6.1 Añadir `<meta name="viewport" content="width=device-width, initial-scale=1">` a `index.html` y ajustar la maquetación (D11): `[data-screen]` con `max-width: 460px` y `margin: 0 auto`, y tablero y panel con `width: min(100%, 420px)`. Actualizar `e2e/responsive.spec.ts`:
  - usa un `viewport` de 360x640, `isMobile: true` y `hasTouch: true`;
  - comprueba `window.innerWidth === 360`;
  - comprueba el escenario modificado "Sin desplazamiento horizontal a 360 píxeles de ancho": las 4 celdas de las esquinas, el tablero, los 9 números y "Borrar" pasan `toBeInViewport({ ratio: 1 })` sin desplazarse, y no hay `scrollWidth > clientWidth`.

  Verificar que el test falla si se quita temporalmente la etiqueta `meta viewport` y pasa con ella.
- [ ] 6.2 Verificar en `e2e/responsive.spec.ts`, con la misma emulación móvil, los demás escenarios modificados de game-ui. Lo que la spec pide "completamente visible" se comprueba con `toBeInViewport({ ratio: 1 })`, y en todos los casos sin `scrollWidth > clientWidth`:
  - "Botón de nueva partida visible a 360 píxeles de ancho": tras `scrollIntoViewIfNeeded`, está completamente visible y se puede pulsar;
  - "Pantalla inicial": el título y los tres botones de dificultad;
  - "Aviso de generación": el aviso y los botones desactivados;
  - "Pantalla de error": el mensaje, "Reintentar" y las dificultades;
  - "Mensaje de error largo": se rechaza con un mensaje de 250 caracteres que incluye una palabra de 60 caracteres sin espacios. El recuadro mide más de una línea de alto.

## 7. Comprobación final

- [ ] 7.1 Ejecutar `npm test`, `npm run test:e2e` y `npm run build`, y verificar que pasan todos los tests, también los que existían antes del cambio. Verificar con una búsqueda en `src/` que ningún archivo que no sea un test (`*.test.ts`) importa `contrast.ts`, para que no llegue al empaquetado de la aplicación.
- [ ] 7.2 Revisión visual manual con `npm run dev` a 360x640 y en escritorio. Verificar a simple vista las pantallas inicial, de generación, de error y de juego, con una celda seleccionada y números del jugador. Anotar cualquier diferencia con la dirección visual de la propuesta antes de pasar al code-reviewer.
