# Spec Delta

## Purpose

Representa el estado de un tablero de sudoku 9x9 y las reglas para colocar, borrar y validar números en sus celdas, como base de lógica pura para el resto del juego.

## ADDED Requirements

### Requirement: Creación de tablero vacío
El sistema SHALL permitir crear un tablero 9x9 vacío en el que las 81 celdas son editables y no tienen valor.

#### Scenario: Tablero vacío recién creado
- **WHEN** se crea un tablero sin pasar ningún planteamiento
- **THEN** las 81 celdas están vacías y marcadas como editables

### Requirement: Creación de tablero a partir de un planteamiento
El sistema SHALL permitir crear un tablero a partir de una matriz 9x9 de entrada, donde cada celda es un número entero del 1 al 9 o un valor vacío (`0` o `null`).

#### Scenario: Planteamiento válido con celdas vacías y ocupadas
- **WHEN** se crea un tablero a partir de una matriz 9x9 válida que mezcla celdas vacías y celdas con números del 1 al 9
- **THEN** el tablero resultante refleja esos mismos valores en las mismas posiciones

### Requirement: Celdas fijas del planteamiento
El sistema SHALL marcar como fija (no editable) cada celda que tenía un valor no vacío en el planteamiento inicial, y como editable cada celda que estaba vacía.

#### Scenario: Celda con valor en el planteamiento queda fija
- **WHEN** se crea un tablero a partir de un planteamiento donde la celda (0,0) tiene el valor 5
- **THEN** la celda (0,0) queda marcada como fija y con valor 5

#### Scenario: Celda vacía del planteamiento queda editable
- **WHEN** se crea un tablero a partir de un planteamiento donde la celda (0,1) está vacía
- **THEN** la celda (0,1) queda marcada como editable y sin valor

### Requirement: Validación del planteamiento inicial
El sistema SHALL rechazar con un error la creación de un tablero cuando el planteamiento de entrada no es una matriz 9x9, contiene valores no enteros o fuera del rango 0-9, o contiene números del 1 al 9 repetidos dentro de una misma fila, columna o cuadro 3x3.

#### Scenario: Planteamiento con dimensiones incorrectas
- **WHEN** se intenta crear un tablero con una matriz que no tiene 9 filas o alguna fila no tiene 9 columnas
- **THEN** el sistema lanza un error y no se crea el tablero

#### Scenario: Planteamiento con valor fuera de rango
- **WHEN** se intenta crear un tablero con una celda cuyo valor es menor que 0 o mayor que 9
- **THEN** el sistema lanza un error y no se crea el tablero

#### Scenario: Planteamiento con valor no entero
- **WHEN** se intenta crear un tablero con una celda cuyo valor no es un número entero (por ejemplo, 3.5 o un texto)
- **THEN** el sistema lanza un error y no se crea el tablero

#### Scenario: Planteamiento con número repetido en una fila
- **WHEN** se intenta crear un tablero cuyo planteamiento tiene el mismo número dos veces en la misma fila
- **THEN** el sistema lanza un error y no se crea el tablero

#### Scenario: Planteamiento con número repetido en una columna
- **WHEN** se intenta crear un tablero cuyo planteamiento tiene el mismo número dos veces en la misma columna
- **THEN** el sistema lanza un error y no se crea el tablero

#### Scenario: Planteamiento con número repetido en un cuadro 3x3
- **WHEN** se intenta crear un tablero cuyo planteamiento tiene el mismo número dos veces dentro del mismo cuadro 3x3
- **THEN** el sistema lanza un error y no se crea el tablero

### Requirement: Colocar un número en una celda editable
El sistema SHALL permitir colocar un número entero del 1 al 9 en cualquier celda editable, reemplazando el valor que tuviera previamente dicha celda.

#### Scenario: Colocar número en celda editable vacía
- **WHEN** se coloca el número 7 en una celda editable sin valor
- **THEN** la celda pasa a tener el valor 7

#### Scenario: Reemplazar número existente en celda editable
- **WHEN** se coloca el número 3 en una celda editable que ya tenía el valor 9
- **THEN** la celda pasa a tener el valor 3

### Requirement: Borrar el valor de una celda editable
El sistema SHALL permitir borrar el valor de cualquier celda editable, dejándola vacía.

#### Scenario: Borrar celda editable con valor
- **WHEN** se borra el valor de una celda editable que tiene un número
- **THEN** la celda queda vacía

#### Scenario: Borrar celda editable ya vacía
- **WHEN** se borra el valor de una celda editable que ya está vacía
- **THEN** la celda permanece vacía y no se produce error

### Requirement: Protección de celdas fijas
El sistema SHALL rechazar con un error cualquier intento de colocar o borrar un valor en una celda marcada como fija, sin modificar su contenido.

#### Scenario: Intentar colocar un número en celda fija
- **WHEN** se intenta colocar un número en una celda marcada como fija
- **THEN** el sistema lanza un error y el valor de la celda no cambia

#### Scenario: Intentar borrar una celda fija
- **WHEN** se intenta borrar el valor de una celda marcada como fija
- **THEN** el sistema lanza un error y el valor de la celda no cambia

### Requirement: Validación de entrada en las operaciones de celda
El sistema SHALL rechazar con un error cualquier operación de colocar un número que no sea un entero del 1 al 9, o que use coordenadas de fila o columna fuera del rango 0-8.

#### Scenario: Colocar un valor fuera de rango
- **WHEN** se intenta colocar el número 0 o un número mayor que 9 en una celda
- **THEN** el sistema lanza un error y el tablero no cambia

#### Scenario: Colocar un valor no entero
- **WHEN** se intenta colocar un valor que no es un número entero (por ejemplo, 3.5 o un texto) en una celda
- **THEN** el sistema lanza un error y el tablero no cambia

#### Scenario: Operar sobre coordenadas inexistentes
- **WHEN** se intenta colocar o borrar un valor usando una fila o columna fuera del rango 0-8
- **THEN** el sistema lanza un error y el tablero no cambia

### Requirement: Detección de conflictos al colocar un número
El sistema SHALL permitir colocar un número aunque repita un valor existente en su misma fila, columna o cuadro 3x3, e identificar dicha jugada como conflictiva en lugar de bloquearla.

#### Scenario: Colocar un número que repite valor en su fila
- **WHEN** se coloca un número en una celda y ese mismo número ya existe en otra celda de su misma fila
- **THEN** el número se coloca igualmente y la jugada se informa como conflictiva

#### Scenario: Colocar un número que repite valor en su columna
- **WHEN** se coloca un número en una celda y ese mismo número ya existe en otra celda de su misma columna
- **THEN** el número se coloca igualmente y la jugada se informa como conflictiva

#### Scenario: Colocar un número que repite valor en su cuadro 3x3
- **WHEN** se coloca un número en una celda y ese mismo número ya existe en otra celda de su mismo cuadro 3x3
- **THEN** el número se coloca igualmente y la jugada se informa como conflictiva

#### Scenario: Colocar un número sin conflicto
- **WHEN** se coloca un número en una celda y no existe ese mismo número en su fila, columna ni cuadro 3x3
- **THEN** el número se coloca y la jugada se informa como no conflictiva

### Requirement: Celdas en conflicto con la última jugada
El sistema SHALL, al colocar un número, devolver la lista de celdas que entran en conflicto con la celda recién colocada por compartir fila, columna o cuadro 3x3 y tener el mismo valor, incluidas las celdas fijas.

#### Scenario: Conflicto con una sola celda
- **WHEN** se coloca un número que repite el valor de exactamente una celda de su fila, columna o cuadro 3x3
- **THEN** el sistema devuelve una lista con esa única celda en conflicto

#### Scenario: Conflicto con varias celdas
- **WHEN** se coloca un número que repite el valor de celdas tanto en su fila como en su cuadro 3x3
- **THEN** el sistema devuelve una lista con todas esas celdas en conflicto

#### Scenario: Conflicto con una celda fija
- **WHEN** se coloca un número que repite el valor de una celda fija del planteamiento inicial situada en su misma fila, columna o cuadro 3x3
- **THEN** el sistema incluye esa celda fija en la lista de celdas en conflicto

#### Scenario: Sin conflictos en la jugada
- **WHEN** se coloca un número que no repite ningún valor en su fila, columna ni cuadro 3x3
- **THEN** el sistema devuelve una lista vacía de celdas en conflicto

### Requirement: Consulta de todos los conflictos del tablero
El sistema SHALL permitir consultar, en cualquier momento, la lista completa de celdas del tablero cuyo valor repite el de otra celda en su misma fila, columna o cuadro 3x3, no solo las de la última jugada realizada, y SHALL actualizar esa lista para dejar de incluir celdas cuyo conflicto desaparece.

#### Scenario: Tablero sin conflictos
- **WHEN** se consultan los conflictos de un tablero donde ningún número se repite en ninguna fila, columna o cuadro 3x3
- **THEN** el sistema devuelve una lista vacía

#### Scenario: Tablero con varios conflictos acumulados
- **WHEN** se colocan los números 5 en (0,0) y 5 en (0,1) (misma fila), 7 en (2,3) y 7 en (5,3) (misma columna), y 9 en (6,6) y 9 en (7,7) (mismo cuadro 3x3), y luego se consultan los conflictos del tablero
- **THEN** el sistema devuelve exactamente las celdas (0,0), (0,1), (2,3), (5,3), (6,6) y (7,7) como celdas en conflicto, sin ningún orden garantizado

#### Scenario: Un conflicto desaparece al borrar una de las celdas implicadas
- **WHEN**, tras el escenario anterior, se borra el valor de la celda (0,1)
- **THEN** la lista de conflictos del tablero ya no incluye ni (0,0) ni (0,1), y sigue incluyendo (2,3), (5,3), (6,6) y (7,7)

#### Scenario: Un conflicto desaparece al reemplazar el valor conflictivo
- **WHEN**, tras el escenario "Tablero con varios conflictos acumulados", se coloca el número 2 en la celda (7,7) en lugar del 9
- **THEN** la lista de conflictos del tablero ya no incluye ni (6,6) ni (7,7), y sigue incluyendo (0,0), (0,1), (2,3) y (5,3)
