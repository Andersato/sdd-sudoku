# Spec Delta

## MODIFIED Requirements

### Requirement: El tablero distingue celdas fijas de celdas editables
El sistema SHALL mostrar el tablero de 9x9 del planteamiento generado de forma que cada celda fija sea visualmente distinguible de cada celda editable, tanto vacía como con un número puesto por el jugador, mediante al menos una diferencia que no sea solo de color (grosor de letra del número o contenido de la celda).

#### Scenario: Celdas fijas y editables se ven distintas
- **WHEN** se muestra la pantalla de juego con un planteamiento generado
- **THEN** cada celda fija del planteamiento se muestra con una apariencia distinta a la de las celdas editables

#### Scenario: Celda fija frente a celda editable con número del jugador
- **WHEN** el tablero muestra una celda fija y una celda editable en la que el jugador ha escrito un número
- **THEN** el número de la celda fija se muestra con un grosor de letra mayor que el número del jugador

#### Scenario: La diferencia se mantiene al seleccionar la celda
- **WHEN** la celda seleccionada es una celda fija o una celda editable con número del jugador
- **THEN** su número conserva el grosor de letra que tiene cuando no está seleccionada

### Requirement: Uso en pantallas de móvil sin desplazamiento horizontal
El sistema SHALL mostrar la pantalla inicial (incluidos el aviso de generación y la pantalla de error con "Reintentar") y la pantalla de juego (tablero, panel de números y botón "Nueva partida") de forma que puedan usarse completamente en un ancho de pantalla de 360 píxeles sin que aparezca desplazamiento horizontal.

#### Scenario: Sin desplazamiento horizontal a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una ventana de 360 píxeles de ancho
- **THEN** el tablero y el panel de números son completamente visibles y usables sin que la página necesite desplazamiento horizontal

#### Scenario: Botón de nueva partida visible a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una ventana de 360 píxeles de ancho
- **THEN** el botón "Nueva partida" es completamente visible y usable sin desplazamiento horizontal

#### Scenario: Pantalla inicial a 360 píxeles de ancho
- **WHEN** la pantalla inicial se muestra en una ventana de 360 píxeles de ancho
- **THEN** los tres botones de dificultad son completamente visibles y usables sin que la página necesite desplazamiento horizontal

#### Scenario: Pantalla de error a 360 píxeles de ancho
- **WHEN** la pantalla de error de generación se muestra en una ventana de 360 píxeles de ancho
- **THEN** el mensaje de error, el botón "Reintentar" y los botones de dificultad son completamente visibles sin que la página necesite desplazamiento horizontal
