# Proposal

## Why

Hoy el juego no tiene forma de crear planteamientos de sudoku nuevos: solo existen el modelo de tablero (`sudoku-board`) y el solver (`sudoku-solver`), que operan sobre un planteamiento ya dado. Sin un generador, el jugador siempre jugaría el mismo sudoku (o uno que haya que escribir a mano), lo que impide ofrecer partidas nuevas y variadas con un nivel de dificultad elegido.

## What Changes

- Se añade un generador de sudokus que produce un planteamiento nuevo (una matriz 9x9 con celdas fijas y vacías) listo para crear un tablero con `sudoku-board`.
- El generador garantiza que el planteamiento devuelto tiene solución única, usando `sudoku-solver` para verificarlo.
- El generador acepta un nivel de dificultad (fácil, medio o difícil), definido por el número de celdas fijas (pistas) del planteamiento:
  - Fácil: 36–45 pistas.
  - Medio: 30–35 pistas.
  - Difícil: 24–29 pistas.
- Una dificultad que no sea una de esas tres opciones produce un error, sin generar ningún planteamiento.
- El generador acepta opcionalmente una semilla (seed) de tipo entero. Con la misma semilla y la misma dificultad, siempre devuelve el mismo planteamiento, en cualquier máquina, incluidos los reintentos internos (que también se derivan de la semilla). Sin semilla, cada llamada usa aleatoriedad propia y no está garantizado (ni es esperable) que varias llamadas sin semilla devuelvan el mismo planteamiento. Una semilla de un tipo distinto a entero produce un error.
- La garantía de reproducibilidad de la semilla es válida solo dentro de una misma versión del generador; no se garantiza que una semilla produzca el mismo planteamiento tras cambios futuros en el algoritmo. Esa estabilidad entre versiones queda fuera de alcance.
- El generador reintenta internamente (sin exponer los intentos fallidos) cuando un intento no logra un planteamiento válido con solución única en el rango de pistas pedido, hasta un máximo de 100 intentos. Si agota los 100 intentos sin éxito, lanza un error en vez de seguir intentando.
- Fuera de alcance: medir la dificultad por técnicas de resolución lógica (solo eliminación simple, pares, etc.); esta propuesta define dificultad únicamente por número de pistas. Podría abordarse en un cambio futuro.
- Fuera de alcance: cualquier interfaz de usuario para pedir o mostrar un sudoku generado. Esta propuesta es solo lógica (`src/core/`).

## Capabilities

### New Capabilities
- `sudoku-generator`: genera planteamientos de sudoku nuevos con solución única, en un nivel de dificultad (fácil, medio, difícil) elegido por número de pistas, con soporte opcional de semilla entera para reproducibilidad determinista dentro de una misma versión del generador.

### Modified Capabilities
(ninguna; `sudoku-board` y `sudoku-solver` se consumen tal cual, sin cambios de requisitos)

## Impact

- Código nuevo en `src/core/generator/` (sin dependencias de `src/ui/`).
- Depende de `src/core/board/` (para la forma del planteamiento) y `src/core/solver/` (para verificar unicidad de la solución).
- Rendimiento: se verifica con 10 semillas fijas de referencia por cada nivel de dificultad (fácil, medio, difícil); cada una de esas 30 generaciones debe completarse en menos de 2 segundos. No se promete ese límite para cualquier semilla o entrada arbitraria, solo para este conjunto de referencia; el límite de intentos (100) es la garantía general de terminación.
- No añade dependencias nuevas ni cambia la UI.
