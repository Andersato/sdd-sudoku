# Sudoku Solver Specification

## Purpose

Determina si el planteamiento original de un tablero de sudoku tiene solución, encuentra una solución completa cuando existe, y distingue entre planteamientos con solución única y planteamientos ambiguos con más de una solución.

## Requirements

### Requirement: Resolver a partir del planteamiento original, no de la partida en curso
El sistema SHALL calcular la solución únicamente a partir de los valores de las celdas fijas del tablero (el planteamiento original), ignorando cualquier valor presente en celdas editables, incluidos los que entren en conflicto entre sí.

#### Scenario: Se ignoran valores conflictivos escritos por el jugador
- **WHEN** se resuelve un tablero cuyo planteamiento original tiene solución única, pero el jugador ha colocado en celdas editables números que repiten valores en su misma fila, columna o cuadro 3x3
- **THEN** el sistema devuelve un resultado de tipo "solución única" con la solución del planteamiento original, sin verse afectado por los valores conflictivos del jugador

#### Scenario: Se ignoran valores del jugador que no coinciden con la solución
- **WHEN** se resuelve un tablero cuyo planteamiento original tiene solución única, y el jugador ha colocado en una celda editable un número que no entra en conflicto con ningún otro valor del tablero, pero que no coincide con el número de esa celda en la solución real
- **THEN** el sistema devuelve un resultado de tipo "solución única" con la solución del planteamiento original, con el número correcto en esa celda, no el que escribió el jugador

### Requirement: Resolver un planteamiento con solución única
El sistema SHALL, cuando el planteamiento original de un tablero admite exactamente una forma de completar sus celdas vacías respetando las reglas del sudoku, devolver un resultado de tipo "solución única" junto con esa solución.

#### Scenario: Planteamiento de referencia con solución única conocida
- **WHEN** se resuelve un tablero creado a partir del siguiente planteamiento (`0` = celda vacía)
  ```
  5 3 0 0 7 0 0 0 0
  6 0 0 1 9 5 0 0 0
  0 9 8 0 0 0 0 6 0
  8 0 0 0 6 0 0 0 3
  4 0 0 8 0 3 0 0 1
  7 0 0 0 2 0 0 0 6
  0 6 0 0 0 0 2 8 0
  0 0 0 4 1 9 0 0 5
  0 0 0 0 8 0 0 7 9
  ```
- **THEN** el sistema devuelve un resultado de tipo "solución única" cuya solución es exactamente
  ```
  5 3 4 6 7 8 9 1 2
  6 7 2 1 9 5 3 4 8
  1 9 8 3 4 2 5 6 7
  8 5 9 7 6 1 4 2 3
  4 2 6 8 5 3 7 9 1
  7 1 3 9 2 4 8 5 6
  9 6 1 5 3 7 2 8 4
  2 8 7 4 1 9 6 3 5
  3 4 5 2 8 6 1 7 9
  ```

#### Scenario: Tablero ya completo y válido
- **WHEN** se resuelve un tablero cuyo planteamiento original ya tiene las 81 celdas fijas con valores y no existe ningún conflicto entre ellas
- **THEN** el sistema devuelve un resultado de tipo "solución única" cuya solución coincide con los valores del planteamiento original

### Requirement: Detectar un planteamiento sin solución
El sistema SHALL, cuando no existe ninguna forma de completar las celdas vacías del planteamiento original respetando las reglas del sudoku, devolver un resultado de tipo "sin solución", sin ninguna solución asociada.

#### Scenario: Planteamiento donde una celda se queda sin ningún número posible
- **WHEN** se resuelve un tablero creado a partir del siguiente planteamiento (`0` = celda vacía), donde la celda (0,0) necesitaría ser 9 por ser el único valor que falta en su fila, pero ese 9 ya existe en su misma columna (fila 1, columna 0)
  ```
  0 1 2 3 4 5 6 7 8
  9 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  ```
- **THEN** el sistema devuelve un resultado de tipo "sin solución"

### Requirement: Detectar un planteamiento con múltiples soluciones
El sistema SHALL, cuando existe más de una forma de completar las celdas vacías del planteamiento original respetando las reglas del sudoku, devolver un resultado de tipo "múltiples soluciones" que incluya una de esas soluciones, sin necesidad de enumerar todas las soluciones posibles.

#### Scenario: Tablero vacío
- **WHEN** se resuelve un tablero vacío de 81 celdas sin ningún valor
- **THEN** el sistema devuelve un resultado de tipo "múltiples soluciones" que incluye una solución válida completa

#### Scenario: Planteamiento con una única pista
- **WHEN** se resuelve un tablero cuyo planteamiento original tiene una sola celda fija, por ejemplo el valor 1 en la celda (0,0), y el resto de celdas vacías
- **THEN** el sistema devuelve un resultado de tipo "múltiples soluciones" que incluye una solución válida completa

### Requirement: Determinismo con múltiples soluciones
El sistema SHALL devolver siempre la misma solución para un mismo planteamiento con múltiples soluciones, sin variar entre llamadas sucesivas.

#### Scenario: Dos resoluciones del mismo planteamiento ambiguo coinciden
- **WHEN** se resuelve dos veces seguidas el mismo tablero cuyo planteamiento original tiene múltiples soluciones
- **THEN** ambas resoluciones devuelven un resultado de tipo "múltiples soluciones" con exactamente la misma solución incluida

### Requirement: Validez de toda solución devuelta
El sistema SHALL garantizar que cualquier solución incluida en un resultado de tipo "solución única" o "múltiples soluciones" conserva en cada celda fija el mismo valor que tenía en el planteamiento original, y que cada fila, columna y cuadro 3x3 de la solución contiene los números del 1 al 9 sin ninguno repetido.

#### Scenario: La solución conserva las celdas fijas del planteamiento
- **WHEN** se resuelve un tablero con solución única o con múltiples soluciones
- **THEN** en la solución devuelta, cada celda que era fija en el planteamiento original mantiene exactamente el mismo valor

#### Scenario: La solución no repite números en ninguna fila, columna o cuadro 3x3
- **WHEN** se resuelve un tablero con solución única o con múltiples soluciones
- **THEN** en la solución devuelta, cada fila, cada columna y cada cuadro 3x3 contiene los nueve números del 1 al 9 sin ningún valor repetido

### Requirement: El solver no modifica el tablero de entrada
El sistema SHALL devolver el resultado de la resolución sin alterar el tablero que recibió como entrada.

#### Scenario: El tablero original permanece intacto tras resolver
- **WHEN** se resuelve un tablero y luego se consultan sus celdas
- **THEN** los valores y el estado de fijeza de cada celda del tablero original son los mismos que antes de llamar al solver

### Requirement: Rendimiento de la resolución
El sistema SHALL devolver el resultado de resolver cada uno de los planteamientos de referencia de los escenarios siguientes (el sudoku de Arto Inkala y el planteamiento sin solución con la celda imposible al final del tablero) en menos de 1 segundo.

#### Scenario: Resolución rápida y correcta de un sudoku de dificultad máxima conocida
- **WHEN** se resuelve un tablero creado a partir del siguiente planteamiento, publicado por Arto Inkala en 2012 y ampliamente citado como uno de los sudokus más difíciles de resolver mediante backtracking (`0` = celda vacía)
  ```
  8 0 0 0 0 0 0 0 0
  0 0 3 6 0 0 0 0 0
  0 7 0 0 9 0 2 0 0
  0 5 0 0 0 7 0 0 0
  0 0 0 0 4 5 7 0 0
  0 0 0 1 0 0 0 3 0
  0 0 1 0 0 0 0 6 8
  0 0 8 5 0 0 0 1 0
  0 9 0 0 0 0 4 0 0
  ```
- **THEN** el sistema devuelve, en menos de 1 segundo, un resultado de tipo "solución única" cuya solución es válida (conserva las celdas fijas y no repite números en ninguna fila, columna o cuadro 3x3)

#### Scenario: Resolución rápida de un planteamiento sin solución en su última celda
- **WHEN** se resuelve un tablero creado a partir del siguiente planteamiento (`0` = celda vacía), donde la celda (8,8) necesitaría ser 9 por ser el único valor que falta en su fila, pero ese 9 ya existe en su misma columna (fila 7, columna 8)
  ```
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 0
  0 0 0 0 0 0 0 0 9
  1 2 3 4 5 6 7 8 0
  ```
- **THEN** el sistema devuelve el resultado de tipo "sin solución" en menos de 1 segundo
