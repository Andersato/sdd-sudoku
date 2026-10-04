# Tasks

## 1. Tipos base y PRNG determinista

- [x] 1.1 Crear `src/core/generator/types.ts` con `Difficulty` (`"easy" | "medium" | "hard"`), `GeneratorOptions` (`{ difficulty: Difficulty; seed?: number | null }`) y `GeneratorError` (ver design.md), y verificar que el proyecto compila sin errores de tipos.
- [x] 1.2 Crear `src/core/generator/rng.ts` con un PRNG mulberry32 seedable y una función de normalización de semilla (`seed >>> 0`), y verificar con tests unitarios que: (a) el mismo entero de semilla produce siempre la misma secuencia de números, (b) semillas distintas producen secuencias distintas, y (c) una semilla negativa se normaliza de forma determinista (misma semilla negativa → mismo estado inicial y misma secuencia).

## 2. Validación de dificultad y semilla

- [x] 2.1 Implementar en `src/core/generator/generate.ts` la validación de `difficulty`, y verificar con un test unitario que un valor distinto de `"easy"`, `"medium"` o `"hard"` lanza `GeneratorError` sin generar ningún planteamiento.
- [x] 2.2 Implementar la validación de `seed`, y verificar con tests unitarios que: una semilla que no es un entero ni `null`/`undefined` (por ejemplo, un texto, un decimal, `NaN` o `Infinity`) lanza `GeneratorError`; y que `null` es aceptado y tratado como "sin semilla" sin lanzar error.

## 3. Relleno completo aleatorio (`fillGrid`)

- [x] 3.1 Implementar en `src/core/generator/fillGrid.ts` el backtracking propio con selección de celda por MRV y orden aleatorio de candidatos (derivado del PRNG recibido), reutilizando `peerCoords`/`allUnits` de `src/core/board/units.ts` sin modificarlos, y verificar con un test unitario que el resultado es una rejilla completa de 81 celdas con cada fila, columna y cuadro 3x3 conteniendo 1-9 sin repetir.
- [x] 3.2 Verificar con un test unitario que, con la misma semilla, dos llamadas a `fillGrid` producen exactamente la misma rejilla completa, y que con semillas distintas producen rejillas distintas.

## 4. Elección de objetivo y remoción de pistas (`digHoles`)

- [x] 4.1 Implementar en `src/core/generator/digHoles.ts` la elección (derivada del PRNG) de un número de pistas objetivo dentro del rango del nivel pedido, y verificar con un test unitario que el objetivo elegido siempre cae dentro del rango de pistas de cada nivel (`easy` 36-45, `medium` 30-35, `hard` 24-29).
- [x] 4.2 Implementar la remoción de celdas en orden aleatorio (derivado del PRNG) a partir de una rejilla completa, verificando unicidad con `solve` de `src/core/solver/` tras cada remoción y restaurando la celda si se rompe la unicidad, deteniéndose al alcanzar el objetivo elegido en 4.1 sin bajar nunca de él, y verificar con un test unitario que el planteamiento resultante, resuelto con `solve`, da `status: "unique_solution"`.
- [x] 4.3 Extraer el criterio de éxito/fallo de un intento a una función pura (`isAttemptSuccessful(hintCount, difficulty): boolean`, o equivalente: número final de pistas + nivel → éxito si el número cae dentro del rango del nivel, fallo si queda por encima del límite superior), y verificar con tests unitarios que llaman directamente a esa función con valores de `hintCount` dentro del rango, por debajo y por encima, para cada nivel, sin necesidad de forzar secuencias del PRNG ni ejecutar `digHoles`.

## 5. Orquestación de intentos, reintentos y API pública

- [x] 5.1 Implementar en `src/core/generator/generate.ts` la función interna de orquestación que ejecuta intentos (fillGrid + digHoles) hasta tener éxito o agotar `maxAttempts`, con `maxAttempts` y la función de intento como parámetros inyectables (valores por defecto: 100 y la función de intento real), y verificar con un test unitario, usando `maxAttempts = 0`, que se lanza `GeneratorError` inmediatamente sin ejecutar ningún intento.
- [x] 5.2 Verificar con un test unitario, usando `maxAttempts = 3` y una función de intento inyectada que siempre devuelve fallo, que la orquestación ejecuta exactamente 3 intentos y lanza `GeneratorError`.
- [x] 5.3 Verificar con un test unitario que llama dos veces a `generatePuzzle` con la misma semilla y la misma dificultad, y comprueba que ambos planteamientos devueltos son exactamente iguales celda por celda.
- [x] 5.4 Implementar `generatePuzzle(options: GeneratorOptions)` en `src/core/generator/generate.ts`, que valida entrada (tareas 2.1-2.2), ejecuta la orquestación (5.1) con los valores por defecto, y antes de devolver el planteamiento lo valida pasándolo por `createBoardFromPuzzle` de `src/core/board/`, y verificar con un test unitario que el planteamiento devuelto se puede usar para crear un tablero con `createBoardFromPuzzle` sin error.
- [x] 5.5 Verificar con un test unitario, inyectando en la orquestación (vía la función de intento) un resultado de intento "exitoso" cuyo planteamiento no sea válido para `createBoardFromPuzzle` (por ejemplo, con un duplicado), que `generatePuzzle` lanza un error interno distinto de `GeneratorError` y no reintenta la generación.
- [x] 5.6 Crear `src/core/generator/index.ts` exportando `generatePuzzle` y los tipos públicos (`Difficulty`, `GeneratorOptions`), y verificar que el proyecto compila sin errores de tipos.

## 6. Verificación de los requisitos de la spec con las 30 semillas de referencia

- [x] 6.1 En un archivo de test dedicado, definir las 30 semillas de referencia (1-10 "easy", 11-20 "medium", 21-30 "hard") y, en un `beforeAll` con tiempo límite ampliado (por ejemplo 70 segundos, para cubrir las 30 generaciones), generar una vez el planteamiento de cada semilla con `generatePuzzle`, midiendo con `performance.now()` (o equivalente de Vitest) la duración de cada generación individual, y guardar en una estructura compartida (planteamiento + duración) por semilla para reutilizarla en 6.2 y 6.4.
- [x] 6.2 Usando los planteamientos generados en el `beforeAll` de 6.1, verificar con un test parametrizado (`test.each`, un caso por semilla) que cada planteamiento, resuelto con `solve`, da `status: "unique_solution"` y tiene el número de pistas dentro del rango de su nivel.
- [x] 6.3 Usando los mismos planteamientos del `beforeAll` de 6.1, verificar con un test unitario que, entre los 30, no hay dos que sean exactamente iguales.
- [x] 6.4 Verificar con un test unitario (tiempo límite propio mayor de 5 segundos) que generar diez planteamientos con la misma dificultad y sin especificar semilla no produce diez planteamientos todos iguales entre sí.
- [x] 6.5 Usando las duraciones guardadas en el `beforeAll` de 6.1, verificar con un test parametrizado (`test.each`, un caso por semilla) que la duración medida para cada semilla de referencia es menor de 2 segundos.
