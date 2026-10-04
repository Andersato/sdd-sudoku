# Proposal

## Why

Hoy el juego de sudoku solo existe como lógica interna (`src/core/`): hay un tablero, un solver y un generador de planteamientos, pero nadie puede jugar porque no existe ninguna pantalla. El jugador necesita una interfaz en el navegador para elegir una dificultad, ver el tablero y jugar la partida.

## What Changes

- Se añade una pantalla inicial donde el jugador elige el nivel de dificultad (fácil, medio o difícil) para empezar una partida nueva. Al elegir un nivel, se genera un planteamiento con `sudoku-generator` para esa dificultad y se pasa a la pantalla de juego.
- Mientras se genera el planteamiento, se muestra un aviso de "Generando..." y los demás niveles de dificultad no se pueden elegir hasta que termine.
- Si la generación falla (por ejemplo, se agotan los reintentos internos del generador), se muestra un mensaje comprensible del problema y la opción de volver a intentarlo, sin tener que recargar la página.
- Se añade la pantalla de juego, que muestra el tablero de 9x9: las celdas fijas del planteamiento se distinguen visualmente de las celdas editables del jugador.
- El jugador puede seleccionar cualquier celda (fija o editable) haciendo clic en ella. Seleccionar una celda fija la resalta, pero no permite escribir ni borrar su valor.
- El jugador también puede moverse entre celdas con las flechas del teclado, incluidas las celdas fijas (la selección se mueve igual, se pueda editar o no la celda de destino).
- Con una celda editable seleccionada, el jugador puede escribir un número del 1 al 9 (con el teclado físico o con un panel de números en pantalla) o borrar su valor (con la tecla Backspace/Delete o un botón de borrar en el panel). Ambas vías de entrada producen el mismo resultado.
- Pulsar una tecla no válida (letras, símbolos, 0, etc.), o pulsar un número sin ninguna celda seleccionada o con una celda fija seleccionada, no cambia nada en el tablero ni muestra ningún mensaje de error.
- Se añade un botón "Nueva partida", visible durante el juego, que vuelve a la pantalla inicial de selección de dificultad. Si el jugador ya ha escrito algún número en una celda editable, se le pide confirmación antes de abandonar la partida en curso; si no ha escrito ninguno, vuelve directamente sin confirmar.
- El tablero y el panel de números se pueden usar en una pantalla de móvil sin necesidad de desplazamiento horizontal.
- Fuera de alcance (irán en otro cambio): marcar o resaltar errores/conflictos en el tablero, detectar que la partida se ha ganado, y cualquier temporizador.
- Fuera de alcance: guardar o recuperar una partida entre recargas de página; guardar el historial de jugadas (deshacer/rehacer).

## Capabilities

### New Capabilities
- `game-ui`: interfaz web para jugar una partida de sudoku — pantalla inicial de selección de dificultad (con su estado de carga y de error), tablero interactivo con selección de celda por clic o teclado, entrada/borrado de números, y la acción de empezar una nueva partida.

### Modified Capabilities
(ninguna; `sudoku-board`, `sudoku-solver` y `sudoku-generator` se consumen tal cual, sin cambios de requisitos)

## Impact

- Código nuevo en `src/ui/`, que depende de `src/core/board/` (crear tablero, colocar/borrar números) y `src/core/generator/` (generar el planteamiento al elegir dificultad). No depende de `src/core/solver/` en este cambio, porque no se valida ni se resuelve nada todavía.
- Cambios en `src/main.ts` (hoy vacío) para montar la interfaz, y en `index.html` si hace falta algún elemento adicional.
- Nueva dependencia de desarrollo: Playwright, para los tests funcionales del flujo de juego en el navegador (ya prevista en `CLAUDE.md`, pero aún no instalada en el repo). No se añade ningún framework de UI: la pantalla se construye con TypeScript y el DOM directamente, salvo que se decida lo contrario en `design.md`.
- La interfaz debe funcionar en anchos de pantalla de móvil sin provocar scroll horizontal, lo que puede requerir CSS responsive (sin librería adicional).
