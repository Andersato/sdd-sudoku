# Tasks

## 1. Tipos y utilidades base del solver

- [ ] 1.1 Crear `src/core/solver/types.ts` con `Solution` (`ReadonlyArray<ReadonlyArray<number>>`) y `SolveResult` (`no_solution` | `unique_solution` | `multiple_solutions`, ver design.md) y verificar que el proyecto compila (`tsc --noEmit` o el comando de build del proyecto) sin errores de tipos.
- [ ] 1.2 Crear `src/core/solver/candidates.ts` con una función que, dado el estado actual de la búsqueda (valores de las celdas fijas del planteamiento original más los valores ya asignados durante el backtracking) y una celda vacía, devuelva el conjunto de candidatos 1-9 válidos usando `peerCoords` de `src/core/board/units.ts`, y verificar con un test unitario que excluye exactamente los valores ya presentes en la fila, columna y cuadro de esa celda dentro del estado de búsqueda.
- [ ] 1.3 Crear un helper de test (por ejemplo `src/core/solver/solutionAssertions.test-helpers.ts`, usado solo desde los tests) que verifique que una `Solution` es válida: cada fila, columna y cuadro 3x3 contiene 1-9 sin repetir, y cada celda fija del planteamiento original conserva su valor en la solución. Verificar el propio helper con un test unitario que confirme que detecta tanto una solución válida como una inválida (por ejemplo, con un número repetido en una fila).

## 2. Backtracking con MRV y poda temprana

- [ ] 2.1 Implementar en `src/core/solver/solve.ts` el backtracking que, en cada paso, elige la celda vacía con menos candidatos (MRV, desempate por menor fila y luego menor columna) y prueba sus valores en orden ascendente, y verificar con un test unitario que, ante el planteamiento sin solución con la celda imposible al final (fila 8 col 8, ver spec), el resultado es `no_solution`.
- [ ] 2.2 Añadir la poda temprana (abortar la rama en cuanto una celda vacía se queda con 0 candidatos tras una asignación) y verificar con un test unitario que resolver dicho planteamiento tarda menos de 1 segundo (medir con `performance.now()` o equivalente de Vitest).
- [ ] 2.3 Verificar con un test unitario, usando el helper de la tarea 1.3, que resolver el planteamiento de Arto Inkala (2012) de la spec devuelve `unique_solution` con una solución válida en menos de 1 segundo.

## 3. Clasificación sin-solución / solución-única / múltiples-soluciones

- [ ] 3.1 Implementar la continuación de la búsqueda tras encontrar la primera solución, deteniéndose al confirmar una segunda solución distinta, y verificar con un test unitario, usando el helper de la tarea 1.3, que el tablero vacío de 81 celdas devuelve `multiple_solutions` con una solución válida incluida.
- [ ] 3.2 Verificar con un test unitario, usando el helper de la tarea 1.3, que un planteamiento con una sola celda fija (por ejemplo, 1 en la celda (0,0)) devuelve `multiple_solutions` con una solución válida incluida.
- [ ] 3.3 Verificar con un test unitario que el planteamiento de referencia con solución única de la spec devuelve `unique_solution` con exactamente la matriz de solución indicada en la spec.
- [ ] 3.4 Verificar con un test unitario que un tablero ya completo y válido (81 celdas fijas sin conflictos) devuelve `unique_solution` cuya solución coincide con los valores del planteamiento.
- [ ] 3.5 Verificar con un test unitario que el planteamiento sin solución de la celda (0,0) (ver spec) devuelve `no_solution`.
- [ ] 3.6 Verificar con un test unitario que resolver dos veces el mismo planteamiento con múltiples soluciones devuelve exactamente la misma solución en ambas llamadas (determinismo).

## 4. Ignorar la partida en curso del jugador

- [ ] 4.1 Verificar con un test unitario que, al resolver un tablero con solución única donde el jugador colocó en celdas editables valores que repiten números en su fila, columna o cuadro 3x3, el resultado es `unique_solution` con la solución del planteamiento original.
- [ ] 4.2 Verificar con un test unitario que, al resolver un tablero con solución única donde el jugador colocó en una celda editable un valor sin conflicto pero distinto del valor correcto, el resultado es `unique_solution` con el valor correcto en esa celda, no el del jugador.

## 5. No mutación del tablero de entrada

- [ ] 5.1 Verificar con un test unitario que, tras resolver un tablero, los valores y el estado `fixed` de cada celda del `Board` original son idénticos a los que tenía antes de llamar al solver (comparar con una copia tomada antes de resolver).
