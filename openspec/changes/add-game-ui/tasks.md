# Tasks

## 1. Playwright y scaffolding de `src/ui/`

- [ ] 1.1 Añadir `@playwright/test` como dependencia de desarrollo, crear `playwright.config.ts` (con `webServer` apuntando a `vite dev` y el puerto correspondiente) y el script `test:e2e` en `package.json`, y verificar que `npx playwright install` y un test Playwright trivial (una página en blanco) se ejecutan sin error.
- [ ] 1.2 Crear la carpeta `src/ui/` y el punto de montaje mínimo (`src/ui/app.ts` con una función `mount(container: HTMLElement, deps: AppDeps)` vacía) conectado desde `src/main.ts`, y verificar que `npm run build` (incluye `tsc --noEmit`) sigue pasando.

## 2. Dificultad, estado de generación y la llamada diferida al generador

- [ ] 2.1 Crear `src/ui/difficulty.ts` con las etiquetas visibles en español para cada valor de `Difficulty` (`"easy" | "medium" | "hard"`, importado de `src/core/generator/`), y verificar con un test unitario (Vitest, sin DOM) que las tres etiquetas son las esperadas ("Fácil", "Medio", "Difícil").
- [ ] 2.2 Crear `src/ui/generatePuzzleAsync.ts` con `waitForNextPaint` (doble `requestAnimationFrame`) y `defaultGeneratePuzzleAsync`, y verificar con un test unitario (Vitest, con `requestAnimationFrame` controlado/mockeado, sin DOM) que `defaultGeneratePuzzleAsync` no llama a `generatePuzzle` hasta que se han resuelto los dos `requestAnimationFrame` encadenados.
- [ ] 2.3 Definir en `src/ui/state.ts` el tipo `AppState` (unión discriminada: `start/idle`, `start/generating`, `start/error`, `game`, con `board: Board` en `game`) y las funciones puras de transición (`chooseDifficulty`, `generationSucceeded`, `generationFailed`, `retry`, `confirmNewGame`) descritas en `design.md`, y verificar con tests unitarios (Vitest, sin DOM) cada transición, incluidas las que no deben tener efecto (elegir una dificultad mientras `status === "generating"`, incluida la misma dificultad). No hay una función `requestNewGame`: la decisión de confirmar o no vive en la capa de DOM (ver 6.2), apoyada en `shouldConfirmNewGame` (6.1).
- [ ] 2.4 Verificar con un test unitario (Vitest, sin DOM) que `generationSucceeded` convierte el planteamiento crudo `(number | null)[][]` en un `Board` usando `createBoardFromPuzzle` de `src/core/board/create.ts`, de forma que cada celda no nula del planteamiento queda con `fixed: true` en el `Board` resultante del estado `game`.

No se añade `jsdom` ni `happy-dom` como entorno de Vitest: estas tareas (2.1-2.3) cubren solo funciones puras que no tocan el DOM. Todo lo que renderiza o manipula el DOM se verifica con Playwright en las secciones siguientes.

## 3. Pantalla inicial: selección de dificultad, generación en curso y error

- [ ] 3.1 Implementar `src/ui/startScreen.ts`, que renderiza los tres botones de dificultad (deshabilitados o sin manejador mientras `status === "generating"`) usando las funciones de `state.ts` (2.3), y al elegir uno llama a `deps.generatePuzzleAsync` y despacha `generationSucceeded`/`generationFailed` según el resultado, y verificar con un test Playwright que, usando `window.__sudokuTestGeneratePuzzle__` con una promesa controlada por el test, elegir "fácil" pasa a la pantalla de juego cuando esa promesa se resuelve con un planteamiento.
- [ ] 3.2 Renderizar el aviso "Generando..." cuando `status === "generating"`, y el mensaje de error más la opción de reintentar y los otros dos niveles de dificultad cuando `status === "error"`, y verificar con un test Playwright que, instalando con `page.addInitScript` un `window.__sudokuTestGeneratePuzzle__` que devuelve una promesa pendiente, el aviso "Generando..." es visible mientras esa promesa no se resuelve.
- [ ] 3.3 Verificar con un test Playwright, usando `window.__sudokuTestGeneratePuzzle__` para rechazar la promesa, que se muestra un mensaje de error comprensible junto con la opción de reintentar y los otros dos niveles de dificultad.
- [ ] 3.4 Verificar con un test Playwright que, tras un error, usar "reintentar" vuelve a mostrar "Generando..." y, si la segunda llamada (controlada por el test) tiene éxito, se pasa a la pantalla de juego.
- [ ] 3.5 Verificar con un test Playwright que, tras un error en una dificultad, elegir uno de los otros dos niveles desde la pantalla de error inicia una generación nueva para esa dificultad distinta.
- [ ] 3.6 Verificar con un test Playwright que, mientras `status === "generating"`, hacer clic en cualquier nivel de dificultad (incluido el mismo que se está generando) no inicia una segunda generación (usando un contador de llamadas en el `generatePuzzleAsync` de prueba).

## 4. Tablero: renderizado, selección por clic y por teclado

- [ ] 4.1 Implementar `src/ui/boardView.ts` para renderizar el tablero con `role="grid"`, cada celda con `role="gridcell"`, `data-row`, `data-col`, `data-fixed` y `aria-selected` según `design.md`, y verificar con un test Playwright que, para un planteamiento conocido, las celdas fijas esperadas tienen `data-fixed="true"` y el resto `data-fixed="false"`, usando los selectores `[data-row][data-col]`.
- [ ] 4.2 Implementar la selección por clic (reemplaza la selección anterior, funciona tanto en celdas fijas como editables) y verificar con un test Playwright que hacer clic en una celda fija y luego en una celda editable deja `aria-selected="true"` solo en la segunda.
- [ ] 4.3 Crear `nextSelection(current, key)` en `src/ui/navigation.ts` según `design.md`, y verificar con tests unitarios (Vitest, sin DOM) las cuatro direcciones por separado (arriba, abajo, izquierda, derecha) desde una celda central, el caso `current = null` (debe devolver siempre `{ row: 0, col: 0 }`), y los cuatro bordes del tablero por separado (cada uno con la flecha que apunta hacia fuera, comprobando que la celda no cambia).
- [ ] 4.4 Dar `tabindex="0"` al contenedor del tablero y llamar a `.focus()` sobre él al montar la pantalla de juego; conectar `nextSelection` a un manejador de `keydown` en ese contenedor, con `event.preventDefault()` para las cuatro flechas y para Backspace/Delete, y verificar con un test Playwright, para cada una de las cuatro flechas, que la selección se mueve a la celda adyacente esperada (usando los atributos `data-row`/`data-col`/`aria-selected`) **sin hacer clic antes en ninguna celda** (comprobando así que el tablero recibe el foco automáticamente al entrar en la pantalla de juego), incluido el caso sin ninguna celda seleccionada (debe seleccionar `data-row="0" data-col="0"`).
- [ ] 4.5 Verificar con un test Playwright que, tras pulsar una flecha hacia el borde del tablero, la página no hace scroll (comparar `window.scrollY`/`window.scrollX` antes y después), confirmando que `preventDefault()` surte efecto.
- [ ] 4.6 Verificar con un test Playwright que una celda fija y una celda editable tienen un estilo computado distinto (por ejemplo, comparando `getComputedStyle(cell).color` o `.fontWeight` entre una celda de cada tipo con `page.evaluate`), sin depender de ningún nombre de clase CSS.

## 5. Entrada y borrado de números

- [ ] 5.1 Implementar `handleDigit(value)` y `handleErase()` en `src/ui/boardView.ts`, que comprueban si hay una celda seleccionada y si es editable antes de llamar a `place`/`clear` de `src/core/board/mutate.ts`, y verificar con tests unitarios (Vitest, sobre un `Board` de prueba, sin DOM) que: sin celda seleccionada no hacen nada; con una celda fija seleccionada no hacen nada; con una celda editable seleccionada, `handleDigit` coloca el valor y `handleErase` la vacía.
- [ ] 5.2 Conectar `handleDigit`/`handleErase` tanto a las teclas 1-9/Backspace/Delete como a los botones del panel de números (nuevo módulo `src/ui/numberPanel.ts`), ignorando cualquier otra tecla sin efecto ni mensaje, y verificar con un test Playwright que escribir con el teclado físico y con el panel en la misma celda editable produce el mismo resultado visible.
- [ ] 5.3 Verificar con un test Playwright que pulsar una tecla no válida (por ejemplo, una letra), o pulsar un número con una celda fija seleccionada, o pulsar un número sin ninguna celda seleccionada, no cambia ningún valor del tablero y no muestra ningún mensaje de error.
- [ ] 5.4 Verificar con un test Playwright que borrar (con Backspace/Delete o el botón del panel) una celda fija seleccionada, o borrar sin ninguna celda seleccionada, no cambia el tablero ni muestra ningún mensaje de error.

## 6. Nueva partida

- [ ] 6.1 Crear `shouldConfirmNewGame(board)` en `src/ui/navigation.ts` (o módulo equivalente) según `design.md`, y verificar con tests unitarios (Vitest, sin DOM) que devuelve `false` para un tablero recién generado, `true` tras colocar un número en una celda editable, y `false` de nuevo tras borrar ese mismo número (sin dejar ningún otro puesto).
- [ ] 6.2 Implementar el control "Nueva partida" en la pantalla de juego, que llama a `window.confirm(...)` solo cuando `shouldConfirmNewGame(board)` es `true`, y vuelve a la pantalla inicial (`idle`) si no hace falta confirmar o si el jugador confirma, y verificar con un test Playwright que, sin haber escrito ningún número, "Nueva partida" vuelve directamente a la pantalla inicial sin que aparezca ningún diálogo (comprobar con `page.on("dialog")` que no se dispara ninguno).
- [ ] 6.3 Verificar con un test Playwright que, tras escribir un número, "Nueva partida" dispara un diálogo de confirmación con el mensaje fijo definido en `design.md` (interceptado con `page.on("dialog")`); aceptar el diálogo vuelve a la pantalla inicial, y cancelarlo mantiene la pantalla de juego con el tablero intacto.
- [ ] 6.4 Verificar con un test Playwright que, tras escribir un número en una celda y borrarlo (sin dejar ningún otro número puesto), "Nueva partida" vuelve directamente a la pantalla inicial sin pedir confirmación.

## 7. Responsive a 360px

- [ ] 7.1 Añadir el CSS del tablero (CSS Grid 9x9, `aspect-ratio: 1`, ancho basado en `min(92vw, 420px)` o equivalente) y del panel de números (`flex-wrap`) descrito en `design.md`, y verificar con un test Playwright, con el viewport fijado a 360px de ancho, que no aparece scroll horizontal en la página (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`) y que todas las celdas del tablero y los botones del panel son visibles dentro del viewport.

## 8. Integración y flujo completo

- [ ] 8.1 Conectar en `src/main.ts` la comprobación de `window.__sudokuTestGeneratePuzzle__` antes de montar la app con `defaultGeneratePuzzleAsync` como valor por defecto, y verificar con un test Playwright que, sin instalar ningún hook de prueba, elegir una dificultad en una página recién cargada termina (con el generador real) en la pantalla de juego con un tablero de 81 celdas.
- [ ] 8.2 Verificar con un test Playwright de extremo a extremo (sin ningún hook de prueba) el flujo completo: cargar la página, elegir dificultad "fácil", esperar a la pantalla de juego, seleccionar una celda editable por clic, escribir un número con el teclado, seleccionar otra celda con las flechas, escribir un número con el panel, y confirmar que ambos valores se muestran correctamente en el tablero.
