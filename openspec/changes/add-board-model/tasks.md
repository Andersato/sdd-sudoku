# Tasks

## 1. Setup del proyecto

- [ ] 1.1 Inicializar el proyecto con Vite + TypeScript (`package.json`, `tsconfig.json`, estructura `src/`) y confirmar que `npm install` y el comando de build de Vite (`npm run build` o equivalente) funcionan sin errores.
- [ ] 1.2 Instalar y configurar Vitest, añadir un script `test` en `package.json`, y verificar con una prueba trivial (`describe/it` que pasa) que `npm run test` ejecuta y encuentra el archivo.

## 2. Estructura del módulo y tipos base

- [ ] 2.1 Crear `src/core/board/` con los tipos base: `Cell` (`readonly { value: number | null, fixed: boolean }`), `Board` (matriz 9x9 `readonly` de `Cell`), `Coord` (`{ row: number, col: number }`), y el tipo de error `SudokuBoardError` con `code: 'invalid_puzzle' | 'fixed_cell' | 'invalid_value' | 'out_of_bounds'`. Usar `readonly` en `Cell` y en la estructura de `Board` para que el compilador señale cualquier intento de mutación directa, reforzando la decisión de inmutabilidad de `design.md`. Verificar que el proyecto compila (`tsc --noEmit` o el comando de build de Vite) sin errores de tipos.

## 3. Creación de tablero vacío y desde planteamiento

- [ ] 3.1 Implementar `createEmptyBoard()` que devuelve un tablero de 81 celdas editables y vacías (`value: null`). Verificar con un test unitario que recorre las 81 celdas y comprueba `value === null` y `fixed === false` (cubre el requisito "Creación de tablero vacío").
- [ ] 3.2 Implementar `createBoardFromPuzzle(puzzle: (number | null)[][])` que normaliza `0` y `null` a `null`, marca como fijas las celdas con valor no vacío y editables las vacías. Verificar con tests unitarios para: planteamiento válido mixto, celda con valor queda fija, celda vacía queda editable (cubre "Creación de tablero a partir de un planteamiento" y "Celdas fijas del planteamiento").
- [ ] 3.3 Implementar la validación de `createBoardFromPuzzle`: dimensiones distintas de 9x9, y valores fuera de 0-9, lanzando `SudokuBoardError` con `code: 'invalid_puzzle'`. Verificar con tests unitarios para dimensiones incorrectas y valor fuera de rango (cubre esos escenarios de "Validación del planteamiento inicial").
- [ ] 3.4 Añadir a esa validación una comprobación en tiempo de ejecución de que cada celda es un entero (o vacía): como la firma `(number | null)[][]` no impide que, en tiempo de ejecución, lleguen valores de otro tipo (por ejemplo desde JSON sin tipar o un test que fuerza un `string`), tratar cada celda como `unknown` al validar y rechazar con `code: 'invalid_puzzle'` cualquier valor que no sea `null`, `0`, o un entero entre 1 y 9 (no números decimales como `3.5`, ni strings, ni otros tipos). Verificar con un test unitario que pasa un planteamiento con una celda `3.5` y otro con una celda de tipo `string`, comprobando que ambos lanzan el error (cubre "Planteamiento con valor no entero").
- [ ] 3.5 Completar la validación de números repetidos en fila, columna o cuadro 3x3 dentro del planteamiento, lanzando `SudokuBoardError` con `code: 'invalid_puzzle'`. Verificar con un test unitario por cada caso: repetido en fila, en columna, en cuadro 3x3 (cubre esos tres escenarios de "Validación del planteamiento inicial").

## 4. Colocar y borrar valores

- [ ] 4.1 Implementar `place(board, cell, value)` como función pura que devuelve un tablero nuevo con el valor colocado en una celda editable (reemplazando el valor previo si existía), sin mutar el tablero recibido. Verificar con tests unitarios: colocar en celda vacía, reemplazar valor existente, y que el tablero original no cambia tras la llamada (cubre "Colocar un número en una celda editable" y la decisión de inmutabilidad en `design.md`).
- [ ] 4.2 Implementar `clear(board, cell)` como función pura que devuelve un tablero nuevo con la celda editable vacía, sin mutar el original. Verificar con tests unitarios: borrar celda con valor, borrar celda ya vacía (no produce error), y que el tablero original no cambia (cubre "Borrar el valor de una celda editable").
- [ ] 4.3 Añadir a `place` y `clear` el rechazo de operaciones sobre celdas fijas, lanzando `SudokuBoardError` con `code: 'fixed_cell'` sin modificar el tablero. Verificar con tests unitarios para ambos casos (cubre "Protección de celdas fijas").
- [ ] 4.4 Añadir a `place` la validación en tiempo de ejecución (tratando `value` como `unknown` por la misma razón que en 3.4) de que el valor es un entero del 1 al 9, y a `place`/`clear` la validación de coordenadas fuera de 0-8, lanzando `SudokuBoardError` con `code: 'invalid_value'` o `code: 'out_of_bounds'` respectivamente, sin modificar el tablero. Verificar con tests unitarios por cada escenario de "Validación de entrada en las operaciones de celda" (valor fuera de rango, valor no entero, coordenadas inexistentes).

## 5. Detección de conflictos en una jugada

- [ ] 5.1 Implementar la función interna que, dada una celda y un tablero, devuelve las celdas de su misma fila, columna y cuadro 3x3 (incluidas las fijas) que comparten su valor. Verificar con tests unitarios de esta función para fila, columna y cuadro 3x3 por separado, incluyendo el caso con una celda fija en conflicto.
- [ ] 5.2 Integrar esa función en `place` para que devuelva `{ board, conflicts }`, permitiendo colocar un valor aunque sea conflictivo (no bloquea la jugada). Verificar con tests unitarios: conflicto en fila, en columna, en cuadro 3x3, conflicto con una celda fija, conflicto con varias celdas a la vez, y jugada sin conflicto (`conflicts` vacío) (cubre "Detección de conflictos al colocar un número" y "Celdas en conflicto con la última jugada").

## 6. Consulta de todos los conflictos del tablero

- [ ] 6.1 Implementar `getConflicts(board)` que recorre las 27 unidades (filas, columnas, cuadros 3x3) y devuelve la lista de celdas cuyo valor se repite dentro de alguna unidad. Verificar con un test unitario sobre un tablero sin conflictos (lista vacía) y uno con conflictos acumulados en fila, columna y cuadro 3x3 a la vez, comprobando las posiciones exactas devueltas (cubre "Tablero sin conflictos" y "Tablero con varios conflictos acumulados").
- [ ] 6.2 Verificar con tests unitarios que, tras borrar una de las celdas implicadas en un conflicto (con `clear`) o tras reemplazar su valor (con `place`), `getConflicts` deja de incluir esas celdas y sigue incluyendo el resto de conflictos no relacionados (cubre los escenarios "Un conflicto desaparece al borrar..." y "...al reemplazar...").

## 7. Revisión final

- [ ] 7.1 Ejecutar la suite completa de Vitest de `src/core/board/` y verificar que todos los escenarios de `specs/sudoku-board/spec.md` tienen al menos un test correspondiente que pasa.
- [ ] 7.2 Revisar que ninguna función de `src/core/board/` importa nada de `src/ui/`, verificando manualmente o con un lint de imports que la carpeta se mantiene libre de dependencias de interfaz (cubre la restricción de arquitectura del proyecto).
