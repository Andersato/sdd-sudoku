# Sudoku Generator Specification

## Purpose

Crea planteamientos nuevos de sudoku con solución única, en el nivel de dificultad que se le pida, para que el jugador pueda empezar partidas distintas en lugar de repetir siempre el mismo tablero.

## Requirements

### Requirement: Generar un planteamiento con solución única
El sistema SHALL generar un planteamiento de sudoku (una matriz 9x9 con celdas fijas y vacías) tal que, al resolverlo con el solver, el resultado sea de tipo "solución única".

Se definen 30 semillas fijas de referencia: las semillas 1 a 10 para el nivel "fácil", las semillas 11 a 20 para el nivel "medio", y las semillas 21 a 30 para el nivel "difícil". Estas mismas 30 semillas se usan en los requisitos de solución única, rango de pistas y rendimiento.

#### Scenario: Las semillas de referencia producen solución única dentro del rango de su nivel
- **WHEN** se genera un planteamiento usando cualquiera de las 30 semillas de referencia, con el nivel de dificultad que le corresponde
- **THEN** al resolver ese planteamiento con el solver, el resultado es de tipo "solución única", y el número de celdas fijas está dentro del rango de pistas de ese nivel

#### Scenario: El planteamiento generado es compatible con sudoku-board
- **WHEN** se usa el planteamiento devuelto por el generador para crear un tablero con `sudoku-board`
- **THEN** el tablero se crea sin error

### Requirement: Niveles de dificultad por número de pistas
El sistema SHALL aceptar un nivel de dificultad entre "fácil", "medio" y "difícil", y SHALL generar un planteamiento cuyo número de celdas fijas (pistas) esté dentro del rango correspondiente a ese nivel:
- Fácil: entre 36 y 45 pistas, ambos inclusive.
- Medio: entre 30 y 35 pistas, ambos inclusive.
- Difícil: entre 24 y 29 pistas, ambos inclusive.

#### Scenario: Generación en nivel fácil
- **WHEN** se genera un planteamiento con nivel de dificultad "fácil"
- **THEN** el planteamiento resultante tiene entre 36 y 45 celdas fijas, ambos inclusive

#### Scenario: Generación en nivel medio
- **WHEN** se genera un planteamiento con nivel de dificultad "medio"
- **THEN** el planteamiento resultante tiene entre 30 y 35 celdas fijas, ambos inclusive

#### Scenario: Generación en nivel difícil
- **WHEN** se genera un planteamiento con nivel de dificultad "difícil"
- **THEN** el planteamiento resultante tiene entre 24 y 29 celdas fijas, ambos inclusive

### Requirement: Rechazo de un nivel de dificultad inválido
El sistema SHALL rechazar con un error cualquier solicitud de generación cuyo nivel de dificultad no sea "fácil", "medio" o "difícil", sin generar ningún planteamiento.

#### Scenario: Nivel de dificultad desconocido
- **WHEN** se solicita generar un planteamiento con un nivel de dificultad que no es "fácil", "medio" ni "difícil" (por ejemplo, "experto" o una cadena vacía)
- **THEN** el sistema lanza un error y no devuelve ningún planteamiento

### Requirement: Reproducibilidad mediante semilla
El sistema SHALL aceptar opcionalmente una semilla de tipo entero (incluidos enteros negativos), y SHALL, para una misma versión del generador, devolver siempre el mismo planteamiento cuando se le pide la misma dificultad con la misma semilla. No indicar semilla, o indicar explícitamente `null`, SHALL equivaler a no usar semilla.

#### Scenario: Misma semilla y dificultad producen el mismo planteamiento
- **WHEN** se genera un planteamiento dos veces con la misma semilla y la misma dificultad, usando la misma versión del generador
- **THEN** ambos planteamientos generados son exactamente iguales, celda por celda

#### Scenario: Las semillas de referencia producen planteamientos distintos entre sí
- **WHEN** se generan los planteamientos correspondientes a las 30 semillas de referencia
- **THEN** no hay dos planteamientos generados que sean exactamente iguales entre sí

#### Scenario: Semilla null equivale a no indicar semilla
- **WHEN** se genera un planteamiento pasando explícitamente `null` como semilla
- **THEN** el sistema genera un planteamiento sin lanzar error, de la misma forma que si no se hubiera indicado semilla

### Requirement: Variedad sin semilla
El sistema SHALL, cuando no se proporciona semilla, generar planteamientos sin garantía de que dos solicitudes produzcan el mismo resultado.

#### Scenario: Diez generaciones sin semilla no son todas iguales
- **WHEN** se generan diez planteamientos seguidos con la misma dificultad y sin especificar semilla
- **THEN** no todos los diez planteamientos generados son exactamente iguales entre sí

### Requirement: Rechazo de una semilla de tipo inválido
El sistema SHALL rechazar con un error cualquier solicitud de generación cuya semilla, si se proporciona y no es `null`, no sea un número entero, sin generar ningún planteamiento.

#### Scenario: Semilla no entera
- **WHEN** se solicita generar un planteamiento con una semilla que no es un número entero ni `null` (por ejemplo, un texto o un número decimal)
- **THEN** el sistema lanza un error y no devuelve ningún planteamiento

### Requirement: Límite de reintentos internos
El sistema SHALL reintentar internamente la generación cuando un intento no produce un planteamiento válido con solución única en el rango de pistas pedido, hasta un máximo de 100 intentos, sin exponer los intentos fallidos en el resultado. El sistema SHALL lanzar un error si agota esos 100 intentos sin producir un planteamiento válido.

#### Scenario: Se agotan los reintentos
- **WHEN** se solicita una generación y los intentos internos fallan en producir un planteamiento válido con solución única en el rango de pistas pedido hasta agotar el límite máximo de intentos
- **THEN** el sistema lanza un error y no devuelve ningún planteamiento

### Requirement: Rendimiento de la generación en el conjunto de referencia
El sistema SHALL completar, en menos de 2 segundos cada una, las 30 generaciones correspondientes a las semillas fijas de referencia (las semillas 1 a 10 para "fácil", 11 a 20 para "medio" y 21 a 30 para "difícil").

#### Scenario: Generación rápida en el conjunto de referencia
- **WHEN** se genera un planteamiento usando cualquiera de las 30 semillas de referencia
- **THEN** la generación se completa en menos de 2 segundos
