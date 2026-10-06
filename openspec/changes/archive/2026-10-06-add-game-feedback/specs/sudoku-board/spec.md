# Spec Delta

## ADDED Requirements

### Requirement: Consulta de tablero completado correctamente
El sistema SHALL permitir consultar, en cualquier momento, si el tablero está completado correctamente, es decir, si las 81 celdas (fijas y editables) tienen número y ninguna repite el valor de otra celda de su misma fila, columna o cuadro 3x3. La consulta SHALL no modificar el tablero.

#### Scenario: Tablero lleno y sin conflictos
- **WHEN** se consulta un tablero creado a partir del planteamiento de referencia del solver (el que empieza por `5 3 0 0 7 ...`) en el que se han colocado, en todas sus celdas editables, los números de su solución conocida
- **THEN** el sistema indica que el tablero está completado correctamente

#### Scenario: Tablero con una celda vacía
- **WHEN** se consulta el tablero del escenario anterior después de borrar el valor de una sola celda editable
- **THEN** el sistema indica que el tablero no está completado

#### Scenario: Tablero lleno con un conflicto
- **WHEN** se consulta el tablero del primer escenario después de colocar un 5 en la celda editable (0,2), que repite el 5 fijo de la celda (0,0)
- **THEN** el sistema indica que el tablero no está completado

#### Scenario: Tablero vacío
- **WHEN** se consulta un tablero vacío recién creado
- **THEN** el sistema indica que el tablero no está completado

#### Scenario: La consulta no modifica el tablero
- **WHEN** se consulta si un tablero está completado y luego se leen sus celdas
- **THEN** los valores y el estado de fijeza de cada celda son los mismos que antes de la consulta
