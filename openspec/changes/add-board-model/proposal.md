# Proposal

## Why

El juego necesita un modelo de datos y lógica para el tablero de sudoku antes de poder construir cualquier interfaz. Sin un tablero que sepa representar el estado, distinguir celdas fijas de editables y detectar jugadas inválidas, no hay base sobre la que construir el resto del juego (UI, solver, generador).

## What Changes

- Nueva estructura de datos para un tablero de sudoku 9x9, soportando:
  - Inicialización vacía (todas las celdas editables).
  - Inicialización desde un planteamiento (matriz 9x9 de entrada, 0 o `null` representa celda vacía).
  - Marcado automático de las celdas no vacías del planteamiento inicial como fijas (no editables).
  - Validación del planteamiento de entrada: tamaño distinto de 9x9, valores fuera de 0-9, o números repetidos en una misma fila/columna/cuadro 3x3 se rechazan con un error al construir el tablero.
- Operaciones sobre el tablero:
  - Colocar un número del 1 al 9 en una celda editable, reemplazando cualquier valor previo que tuviera.
  - Borrar el valor de una celda editable.
  - Rechazar (sin aplicar) intentos de modificar una celda fija, con un error.
  - Rechazar con error los valores fuera de 1-9 o coordenadas fuera del tablero.
  - Un número que entra en conflicto con otro SÍ se coloca igualmente; el conflicto se informa, no bloquea la jugada.
- Validación de reglas de sudoku:
  - Detectar si un valor colocado repite un número en su misma fila, columna o cuadro 3x3.
  - Devolver la lista de celdas en conflicto con la celda recién colocada.
  - Permitir consultar, en cualquier momento, la lista completa de celdas del tablero que están en conflicto (no solo las de la última jugada).
- Todo lo anterior es lógica pura en `src/core/`, sin ninguna dependencia de interfaz (no hay pantalla en este cambio).

Fuera de alcance (explícito):
- Generación de sudokus (crear planteamientos nuevos).
- Resolver sudokus (solver).
- Cualquier interfaz de usuario (`src/ui/`).
- Detección de si el tablero está completo/resuelto correctamente (se deja para un cambio futuro).
- Persistencia o serialización del estado fuera de memoria.

## Capabilities

### New Capabilities
- `sudoku-board`: representación del tablero 9x9, estado de celdas (fija/editable, valor), operaciones de colocar/borrar números, validación del planteamiento inicial, y detección/consulta de conflictos de fila/columna/cuadro 3x3.

### Modified Capabilities
(ninguna; no existen capabilities previas en el proyecto)

## Impact

- Código nuevo en `src/core/board/` (o similar), sin tocar `src/ui/` (no existe todavía).
- No afecta APIs externas ni dependencias del proyecto (sigue sin backend/base de datos).
- Sienta las bases para cambios futuros: generador de sudokus, solver, y la UI del tablero.
