# Proposal

## Why

El juego ya puede representar un tablero y validar jugadas, pero no tiene forma de resolver un sudoku. Sin un solver no se puede comprobar si un planteamiento tiene solución, encontrarla, ni detectar planteamientos ambiguos (con más de una solución) antes de ofrecérselos al jugador. Es la pieza de lógica que necesitan tanto la futura pantalla de "resolver" como el futuro generador de tableros.

## What Changes

- Nueva función de resolución que, dado un tablero, intenta encontrar una solución completa a partir únicamente de las celdas fijas de su planteamiento original (ignora cualquier valor que el jugador haya escrito en celdas editables).
- Clasificación del resultado en tres casos: sin solución, solución única (con la solución encontrada), o múltiples soluciones (con una de ellas).
- La búsqueda de soluciones múltiples se detiene en cuanto se confirma una segunda solución distinta, sin enumerar todas las soluciones posibles.
- Resolución en menos de 1 segundo para los planteamientos de referencia usados en la spec (un sudoku de dificultad máxima conocida y un planteamiento sin solución).
- Solo lógica pura en `src/core/`, sin ningún componente de interfaz.

## Fuera de alcance

- Generar tableros o planteamientos nuevos (es responsabilidad de un futuro generador).
- Dar pistas o sugerencias de jugada al jugador.
- Comprobar si la partida en curso del jugador (con los valores que ya ha escrito en celdas editables) sigue teniendo solución; el solver solo resuelve el planteamiento original.

## Capabilities

### New Capabilities
- `sudoku-solver`: resolución de un tablero de sudoku, incluida la detección de ausencia de solución y de solución no única.

### Modified Capabilities
(ninguna; no cambia el comportamiento de `sudoku-board`)

## Impact

- Código nuevo en `src/core/solver/` (por ejemplo `solve.ts`), reutilizando los tipos y utilidades de `src/core/board/` (`Board`, `Cell`, `units.ts`) para leer el tablero y sus unidades, sin modificarlos.
- No afecta a `src/ui/` ni a ninguna API pública existente.
- Sin nuevas dependencias externas (ver design.md para el algoritmo elegido).
