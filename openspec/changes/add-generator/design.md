# Design

## Context

`src/core/board/` define `Board`, `Cell` y `createBoardFromPuzzle(puzzle)`, que construye un tablero a partir de un planteamiento (matriz 9x9 de `0`/`null`/`1-9`) y rechaza con error cualquier planteamiento inválido o con duplicados. `src/core/solver/` expone `solve(board): SolveResult`, que distingue `no_solution` / `unique_solution` / `multiple_solutions` mediante backtracking con MRV (most-constrained-cell) y poda de dominios; ya maneja en menos de 1s el sudoku de Arto Inkala. El generador se apoya en ambos sin modificarlos: usa `createBoardFromPuzzle` para verificar que su salida es un planteamiento válido, y `solve` para verificar unicidad de la solución. Puede reutilizar utilidades existentes de solo lectura (p. ej. `peerCoords`, `allUnits`) sin alterarlas. Ver `proposal.md` para el porqué y el alcance.

## Goals / Non-Goals

**Goals:**
- Un algoritmo determinista dado un seed entero, reproducible en cualquier máquina (sin depender de `Math.random()` ni de iteración de `Map`/`Set` con orden no garantizado para decisiones aleatorias).
- Generación rápida en el conjunto de 30 semillas de referencia (<2s cada una).
- Límite de reintentos internos testeable sin depender de que un intento real falle ni de que se agoten 100 intentos reales en un test (sería lento y/o frágil).

**Non-Goals:**
- Medir dificultad por técnicas de resolución (ver proposal.md).
- Optimizar el algoritmo de generación más allá de cumplir el presupuesto de 2s en el conjunto de referencia.
- Exponer el PRNG o el número de intentos usados como parte del resultado público.
- Modificar `sudoku-solver` o `sudoku-board`.

## Decisions

### Algoritmo: full-grid aleatorio + "dig holes" con verificación de unicidad
1. **Rellenar un tablero completo válido al azar** (`fillGrid`, implementación propia del generador, no una modificación de `sudoku-solver`): partir de una rejilla vacía y aplicar backtracking con selección de celda por MRV, igual en espíritu al de `solve`, pero recorriendo los candidatos de cada celda en un orden aleatorio (derivado del PRNG) en lugar de ascendente. Esto da una solución completa aleatoria distinta en cada intento. Puede reutilizar `peerCoords`/`allUnits` de `sudoku-board` para calcular candidatos, pero el backtracking en sí vive en el generador.
2. **Elegir el número de pistas objetivo**: usando el PRNG, elegir un número de pistas objetivo dentro del rango del nivel pedido (p. ej., para "easy", un entero entre 36 y 45).
3. **Quitar pistas (dig holes)**: a partir de la solución completa (81 celdas fijas), ir quitando celdas en un orden aleatorio (derivado del PRNG), comprobando tras cada remoción con `solve` que el planteamiento resultante sigue teniendo `status: "unique_solution"`. Si quitar una celda rompe la unicidad, se restaura esa celda y se continúa con la siguiente celda candidata. Se deja de quitar pistas en cuanto el número de pistas restante alcanza el objetivo elegido en el paso 2 — nunca se baja de él.
4. **Criterio de éxito de un intento**: el intento es exitoso si, al terminar (porque se alcanzó el objetivo o porque se agotaron las celdas candidatas), el número final de pistas está dentro del rango del nivel, aunque no coincida exactamente con el objetivo elegido en el paso 2. El intento falla si se agotan las celdas candidatas sin poder seguir quitando (por romper la unicidad) y el número de pistas queda por encima del límite superior del rango. En ese caso se descarta el intento completo y se reintenta desde el paso 1 con la siguiente porción de la secuencia del PRNG.
5. **Resultado**: el planteamiento con las celdas restantes como fijas y el resto vacías (`0`), que se valida pasándolo por `createBoardFromPuzzle` antes de devolverlo (double-check de forma y ausencia de duplicados).

Alternativa considerada: generar por plantillas/permutaciones de un sudoku base conocido (más rápido, menos aleatorio y con patrones repetitivos detectables); se descarta porque reduce la variedad real de planteamientos.

### PRNG determinista seedable: mulberry32
Se usa **mulberry32** como PRNG determinista explícito en vez de `Math.random()`. Es una elección estándar, ligera (un `uint32` de estado, sin dependencias) y con buena distribución para este tamaño de problema; no se requiere criptográficamente seguro.

Normalización de la semilla antes de inicializar el estado de mulberry32:
- Semilla entera (positiva, negativa o cero): se normaliza con `seed >>> 0`, que interpreta los 32 bits en complemento a dos como un entero sin signo. Esta operación es pura y determinista, igual en cualquier máquina, de modo que una misma semilla (incluida una negativa) produce siempre el mismo estado inicial.
- Sin semilla (`undefined`/`null`): se deriva una semilla no determinista (p. ej. `Date.now()` combinado con un contador interno) antes de aplicar la misma normalización `>>> 0`.

Con semilla, la secuencia de decisiones aleatorias (orden de candidatos al rellenar, número de pistas objetivo, orden de celdas al quitar pistas) es siempre la misma en cualquier máquina → mismo planteamiento. Sin semilla, cada llamada usa una secuencia distinta → variedad.

Alternativa considerada: usar la semilla solo para elegir entre una lista de planteamientos precomputados; se descarta porque limita la variedad a un catálogo fijo y no escala a "generar un sudoku nuevo" en sentido real.

### Niveles de dificultad en código
`Difficulty = "easy" | "medium" | "hard"` (código en inglés por convención del proyecto; las specs y mensajes de error de cara al usuario usan "fácil"/"medio"/"difícil" como ya se describe en la spec). El mapeo es:
- `"easy"` → 36-45 pistas
- `"medium"` → 30-35 pistas
- `"hard"` → 24-29 pistas

### Reintentos con límite y función de intento inyectables
El límite de 100 intentos (requisito de la spec) y la propia función que ejecuta un intento se implementan como parámetros internos inyectables, no como constantes inaccesibles. La función pública (`generatePuzzle({ difficulty, seed })`) llama a una función interna de orquestación con los valores por defecto: `maxAttempts = 100` y la función real de intento (rellenar + elegir objetivo + dig holes, pasos 1-4). Esa función interna no es parte del API público de `src/core/generator/index.ts`, pero se exporta desde un módulo interno para que los tests puedan importarla y sobrescribir ambos parámetros.

El test del escenario "Se agotan los reintentos" no depende de que un intento real falle; usa la función interna con una función de intento inyectada que siempre devuelve fallo, y dos casos:
- `maxAttempts = 0`: la orquestación agota el límite sin ejecutar ningún intento y lanza el error inmediatamente.
- `maxAttempts = 3` con la función de intento inyectada (siempre falla): la orquestación ejecuta exactamente 3 intentos fallidos y lanza el error.

Cada intento real (no inyectado) completo consume la siguiente porción de la secuencia del PRNG, de forma que, con semilla fija, repetir la generación reproduce la misma secuencia de intentos y el mismo resultado final (éxito o agotamiento). Esto es independiente del mecanismo de inyección usado en tests para el escenario de agotamiento.

### Estructura de módulos
- `src/core/generator/types.ts`: `Difficulty`, `GeneratorOptions`, `GeneratorError`.
- `src/core/generator/rng.ts`: PRNG mulberry32 seedable y normalización de semilla (`seed >>> 0`).
- `src/core/generator/fillGrid.ts`: relleno completo aleatorio de una rejilla válida (backtracking propio).
- `src/core/generator/digHoles.ts`: elección del objetivo de pistas y remoción con verificación de unicidad vía `solve`.
- `src/core/generator/generate.ts`: función de intento (pasos 1-4) y función interna de orquestación con `maxAttempts` y la función de intento inyectables; expone la función pública `generatePuzzle`.
- `src/core/generator/index.ts`: API pública exportada del módulo.

## Risks / Trade-offs

- [Riesgo] Verificar unicidad con `solve` en cada remoción de pista es costoso (backtracking completo por cada celda candidata) → Mitigación: `solve` ya poda con MRV y domains; el presupuesto de rendimiento (<2s) solo se exige sobre las 30 semillas de referencia, no sobre cualquier entrada arbitraria.
- [Riesgo] Para dificultad "hard" (24-29 pistas), es más probable que un intento se quede por encima del rango sin poder seguir quitando pistas sin romper unicidad → Mitigación: reintentos internos (hasta 100) con una nueva secuencia aleatoria por intento.
- [Riesgo] Un PRNG mal elegido podría tener sesgos o periodos cortos que generen patrones repetitivos → Mitigación: mulberry32 es una elección estándar con buena distribución para este tamaño de problema.
