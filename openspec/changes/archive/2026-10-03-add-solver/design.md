# Design

## Context

Ver `proposal.md` - Why. El modelo de tablero ya existe en `src/core/board/` (`Board`, `Cell`, `units.ts` con `rowCoords`/`colCoords`/`boxCoords`/`peerCoords`). El solver se añade como módulo nuevo en `src/core/solver/`, sin modificar `src/core/board/`.

Por decisión de producto (ver proposal.md), el solver trabaja únicamente sobre el planteamiento original: toma de cada celda su valor solo si `fixed === true`, e ignora cualquier valor de celdas editables.

## Goals / Non-Goals

**Goals:**
- Resolver en menos de 1 segundo los planteamientos de referencia de la spec ("Rendimiento de la resolución"): el sudoku de Arto Inkala (2012) y el planteamiento sin solución con la celda imposible al final del tablero (fila 8, columna 8).
- Clasificar correctamente sin-solución / solución-única / múltiples-soluciones, devolviendo una solución de ejemplo en los dos últimos casos.
- Determinismo: misma entrada produce siempre la misma solución de ejemplo.

**Non-Goals:**
- Enumerar todas las soluciones de un planteamiento ambiguo.
- Explicar o justificar la solución (técnicas humanas de resolución, pistas).
- Optimizar para planteamientos adversariales peores que los de referencia de la spec.

## Decisions

### Algoritmo: backtracking con candidatos por celda y heurística MRV

Se calcula, para cada celda vacía del planteamiento, el conjunto de candidatos válidos (1-9 menos los valores ya fijados en su fila, columna y cuadro 3x3, usando `peerCoords`). En cada paso de backtracking se elige la celda vacía con **menos candidatos** (Minimum Remaining Values, MRV) en lugar de recorrer el tablero en un orden fijo (por ejemplo fila por fila). Tras cada asignación de prueba, se recalculan los candidatos de las celdas vacías afectadas (sus pares en fila/columna/cuadro); si alguna celda vacía queda con 0 candidatos, se retrocede de inmediato (poda temprana).

**Por qué esto resuelve en <1s el caso de la celda imposible al final:** el escenario "sin solución en su última celda" (spec) tiene el tablero vacío salvo la fila 8 y la celda (7,8). Con un recorrido en orden fijo, el backtracking exploraría un árbol de búsqueda enorme en las filas 0-7 (casi sin restricciones, miles de ramas) antes de llegar a la fila 8 y descubrir la contradicción. Con MRV, los candidatos iniciales ya muestran que la celda (8,8) tiene 0 candidatos (su fila exige un 9 para completarse y su columna ya contiene un 9 en la fila 7): esa celda tiene el mínimo de candidatos posible (0) desde el principio, así que el algoritmo la examina primero y falla en el primer paso, sin necesidad de rellenar ninguna otra celda del tablero.

**Por qué es suficiente frente a Dancing Links (Algorithm X):** Dancing Links resolvería este mismo caso igual de rápido (y sería más rápido aún en el peor caso general), pero exige modelar el sudoku como un problema de cobertura exacta y mantener una estructura de lista doblemente enlazada con nodos que se "tapan y destapan" - bastante más compleja de escribir, probar y explicar en un proyecto pensado para aprender SDD. MRV con candidatos y poda temprana es un algoritmo mucho más simple de implementar en TypeScript puro y, para los planteamientos de referencia de la spec (incluido el de Inkala), cumple el requisito de <1s sin esa complejidad adicional. Si en el futuro apareciera un caso real más lento, se podría reforzar con propagación de restricciones adicional (p. ej. "naked singles"/"hidden singles") sin cambiar el contrato público del solver.

### Contar hasta 2 soluciones, no todas

El backtracking sigue intentando alternativas después de encontrar la primera solución completa, pero se detiene en cuanto encuentra una **segunda** solución distinta de la primera. Esto da la clasificación (0 / 1 / ≥2 soluciones) sin pagar el coste de enumerar todas las soluciones posibles.

### Determinismo

El orden de prueba de valores candidatos para una celda es siempre ascendente (1, 2, 3, ... 9), y la elección de la celda con menos candidatos deshace empates siempre por la misma regla (menor índice de fila, luego de columna). Esto garantiza que, ante el mismo planteamiento, la primera solución encontrada sea siempre la misma, cumpliendo el requisito de determinismo de la spec.

### Forma del resultado devuelto

```ts
type Solution = ReadonlyArray<ReadonlyArray<number>>; // 9x9, cada valor es un entero 1-9

type SolveResult =
  | { status: "no_solution" }
  | { status: "unique_solution"; solution: Solution }
  | { status: "multiple_solutions"; solution: Solution };
```

`Solution` es independiente del tipo `Board` (que mezcla valor y fijeza): una vez resuelto no quedan celdas vacías ni distinción fija/editable, así que una matriz de números es la representación más simple. El solver construye su propio estado interno de candidatos a partir de los valores fijos del `Board` de entrada; nunca lo muta.

## Risks / Trade-offs

- [Riesgo] Un planteamiento no contemplado en la spec podría, en teoría, forzar un árbol de búsqueda grande incluso con MRV → Mitigación: MRV es una heurística estándar y suficiente para los planteamientos de referencia de la spec, incluido el caso límite de Inkala (2012).
- [Riesgo] Recalcular candidatos tras cada asignación tiene un coste por nodo del árbol de búsqueda → Mitigación: el coste es proporcional al número de pares de la celda (máx. 20), despreciable frente al ahorro de podar ramas muertas pronto.
