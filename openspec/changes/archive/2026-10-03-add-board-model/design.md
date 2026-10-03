# Design

## Context

Ver `proposal.md` - Why. Esta es la primera pieza de lógica del juego (`src/core/`), así que no hay patrones previos en el proyecto que seguir; las decisiones aquí fijan convenciones para el resto de `src/core/`.

## Goals / Non-Goals

**Goals:**
- Definir una representación de tablero y celda simple, fácil de testear con Vitest.
- Decidir cómo se calculan y expresan los conflictos (requisitos "Detección de conflictos" y "Consulta de todos los conflictos" en `specs/sudoku-board/spec.md`).
- Definir una estrategia de errores consistente para las validaciones (requisitos "Validación del planteamiento inicial", "Protección de celdas fijas", "Validación de entrada en las operaciones de celda").
- Fijar la forma de la API (mutabilidad, formas de retorno) para que solver, generador y UI futuros se apoyen en un contrato estable.

**Non-Goals:**
- Elegir la librería o framework de UI (no aplica, no hay UI en este cambio).
- Optimizar rendimiento más allá de lo trivial para un tablero 9x9 (81 celdas): cualquier recorrido es O(81) o menos.

## Decisions

### Celda vacía: `0` o `null` se aceptan como entrada, pero la representación interna es siempre `null`
El planteamiento de entrada puede marcar una celda vacía con `0` o con `null` (ambos válidos según la spec). Al construir el tablero, ambos se normalizan a `null`. Toda lectura posterior (valor de una celda, planteamiento derivado, etc.) expone `null` para "vacío", nunca `0`.

- **Por qué**: tener dos representaciones válidas de "vacío" circulando por el código interno (comparaciones `=== 0` en un sitio, `== null` en otro) es una fuente fácil de bugs sutiles. Normalizar en el borde de entrada mantiene el resto de la lógica (validación de conflictos, impresión, etc.) con un único caso que comprobar.
- **Alternativa considerada**: mantener `0` como representación interna de vacío. Se descarta porque `0` no es un valor válido de sudoku y mezcla "ausencia de valor" con "un número", mientras que `null` lo distingue del tipo `1-9` sin ambigüedad.

### El tablero es inmutable: `place()` y `clear()` devuelven un tablero nuevo
Ninguna operación modifica el tablero recibido; `place(board, cell, value)` y `clear(board, cell)` devuelven una nueva instancia de tablero con el cambio aplicado, dejando intacta la instancia original.

- **Por qué**: las piezas que vendrán después se benefician directamente de esto sin que la spec tenga que decirlo explícitamente:
  - **UI**: un tablero inmutable encaja de forma natural con cualquier framework de UI basado en detección de cambios por referencia (re-render al cambiar la referencia del estado), sin necesidad de clonar manualmente antes de mutar.
  - **Solver**: un solver por backtracking prueba una jugada, retrocede, prueba otra; con mutación in-place eso exige deshacer manualmente cada paso con el riesgo de dejar el tablero en un estado inconsistente si se olvida un caso. Con inmutabilidad, "retroceder" es simplemente descartar la referencia del tablero probado y seguir con la anterior.
  - **Deshacer (futuro)**: una pila de tableros inmutables (snapshots) implementa deshacer/rehacer sin lógica adicional de "revertir el último cambio"; cada estado pasado ya existe tal cual.
- **Alternativa considerada**: tablero mutable con métodos que modifican en sitio. Se descarta porque trasladaría a cada consumidor (UI, solver, undo) la responsabilidad de clonar manualmente antes de cada intento, repitiendo esa lógica en varios lugares.
- **Trade-off aceptado**: cada `place`/`clear` reconstruye la estructura de 81 celdas; a esta escala (81 celdas) el costo es insignificante frente a la simplicidad que aporta.

### `place()` devuelve `{ board, conflicts }`; `clear()` devuelve el tablero nuevo
`place(board, cell, value)` devuelve un objeto con el nuevo tablero (`board`) y la lista de celdas en conflicto con la celda recién colocada (`conflicts`, posiblemente vacía). La jugada se considera conflictiva si y solo si `conflicts` no está vacía; no existe un booleano `isConflict` separado, se deriva de `conflicts.length > 0`. `clear()` no puede generar conflictos (quitar un valor nunca crea una repetición), así que devuelve directamente el tablero nuevo sin envoltorio.

- **Por qué**: devolver ambos datos juntos desde `place()` evita una segunda pasada de cálculo o una llamada adicional a "consultar conflictos" justo después de colocar, que es exactamente el caso de uso principal (la UI futura necesita saber, en el momento de la jugada, qué resaltar).
- **Alternativa considerada**: que `place()` devuelva solo el tablero y haya que llamar aparte a la consulta de conflictos. Se descarta por forzar una llamada extra en el camino más común y por desacoplar innecesariamente "cuáles son los conflictos de esta jugada" de "cuál es el resultado de esta jugada".

### Recalcular conflictos bajo demanda, sin estado incremental
Tanto los conflictos devueltos por `place()` como la consulta de "todos los conflictos del tablero" se calculan recorriendo filas, columnas y cuadros 3x3 en el momento de la llamada; el tablero no mantiene un índice de conflictos como estado aparte.

- **Por qué**: 81 celdas es un volumen trivial (recorrer las 27 unidades de 9 celdas cada vez es ~243 comparaciones en el peor caso). Mantener un índice incremental añadiría complejidad (invalidación al borrar/reemplazar) sin beneficio medible, y es más difícil de razonar junto con la inmutabilidad (cada tablero nuevo necesitaría su propio índice derivado).
- **Alternativa considerada**: mantener un mapa valor→celdas por unidad (fila/columna/cuadro) actualizado en cada `place`/`clear`. Se descarta por ahora; si el perfilado futuro lo justifica, se puede introducir sin cambiar la spec ni la API pública (es un detalle de implementación interno).

### Las celdas se identifican por coordenadas `{row, col}`, ambas en 0-8
Consistente con el resto del proyecto en inglés para código/nombres y con los escenarios de la spec, que ya usan `(fila, columna)` 0-indexado.

### Un solo tipo de error con un `code` discriminante
Las validaciones (planteamiento inválido, celda fija, valor fuera de rango, coordenadas inválidas) lanzan un error de un tipo propio (p. ej. `SudokuBoardError`) con un campo `code` (`'invalid_puzzle' | 'fixed_cell' | 'invalid_value' | 'out_of_bounds'`) en vez de usar `Error` genérico o un error por caso.

- **Por qué**: permite a quien llame (tests, y más adelante la UI) distinguir el motivo del fallo sin parsear mensajes, sin crear una jerarquía de clases que la spec no requiere.
- **Alternativa considerada**: una clase de error por cada validación. Se descarta por ser más código para el mismo valor informativo que un campo `code`.

### La celda recién colocada se considera "en conflicto" si comparte valor con cualquier otra celda de su unidad, incluidas las fijas
Esto es directamente lo que pide la spec (requisito "Conflicto con una celda fija"): no hay distinción de implementación aquí, se recorre la unidad completa (fija + editable) buscando el mismo valor.

## Risks / Trade-offs

- [Riesgo] Reconstruir el tablero completo en cada `place`/`clear` y recalcular conflictos en cada consulta podría ser lento si en el futuro se llama muy frecuentemente (p. ej. en cada pulsación de tecla desde la UI) → Mitigación: 81 celdas es insignificante para cualquier UI interactiva; revisar solo si el profiling real lo muestra como problema.
- [Riesgo] Si en un cambio futuro se añade un solver o generador que construya y pruebe tableros masivamente (miles de intentos de backtracking), la combinación de inmutabilidad + recálculo completo podría notarse → Mitigación: la interfaz pública (colocar, borrar, consultar conflictos) no cambia si luego se opta por estructuras persistentes más eficientes o un índice incremental; es un refactor interno aislado en `src/core/board/`.
