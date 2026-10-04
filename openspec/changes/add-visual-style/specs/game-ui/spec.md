# Spec Delta

## MODIFIED Requirements

### Requirement: El tablero distingue celdas fijas de celdas editables
El sistema SHALL mostrar el tablero de 9x9 del planteamiento generado de forma que cada celda fija sea visualmente distinguible de cada celda editable, tanto vacía como con un número puesto por el jugador, mediante al menos una diferencia que no sea solo de color: los números fijos SHALL mostrarse con grosor de letra 700 y los números del jugador con grosor 400, esté o no seleccionada la celda.

#### Scenario: Celdas fijas y editables se ven distintas
- **WHEN** se muestra la pantalla de juego con un planteamiento generado
- **THEN** cada celda fija del planteamiento se muestra con una apariencia distinta a la de las celdas editables

#### Scenario: Celda fija frente a celda editable con número del jugador
- **WHEN** el tablero muestra una celda fija y una celda editable en la que el jugador ha escrito un número, ninguna de las dos seleccionada
- **THEN** el número de la celda fija tiene grosor de letra 700 y el número del jugador tiene grosor 400

#### Scenario: La diferencia se mantiene al seleccionar la celda
- **WHEN** la celda seleccionada es una celda fija o una celda editable con número del jugador
- **THEN** su número conserva el grosor de letra que tiene cuando no está seleccionada (700 para la fija, 400 para la del jugador)

### Requirement: Uso en pantallas de móvil sin desplazamiento horizontal
El sistema SHALL poder usarse por completo en una pantalla de móvil de referencia de 360x640 píxeles sin desplazamiento horizontal: pantalla inicial, aviso de generación, pantalla de error y pantalla de juego. En la pantalla de juego, el tablero y el panel de números SHALL caber además sin desplazamiento vertical; "Nueva partida" puede requerirlo.

#### Scenario: Sin desplazamiento horizontal a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el tablero y el panel de números son completamente visibles y usables sin que la página necesite desplazamiento horizontal ni vertical

#### Scenario: Botón de nueva partida visible a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el botón "Nueva partida" es completamente visible y usable sin desplazamiento horizontal, aunque pueda hacer falta desplazarse en vertical para llegar a él

#### Scenario: Pantalla inicial a 360 píxeles de ancho
- **WHEN** la pantalla inicial se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el título y los tres botones de dificultad son completamente visibles y usables sin que la página necesite desplazamiento horizontal

#### Scenario: Aviso de generación a 360 píxeles de ancho
- **WHEN** el aviso "Generando..." se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el aviso y los botones de dificultad desactivados son completamente visibles sin que la página necesite desplazamiento horizontal

#### Scenario: Pantalla de error a 360 píxeles de ancho
- **WHEN** la pantalla de error de generación se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el mensaje de error, el botón "Reintentar" y los botones de dificultad son completamente visibles y usables sin que la página necesite desplazamiento horizontal

#### Scenario: Mensaje de error largo a 360 píxeles de ancho
- **WHEN** la generación falla con un mensaje de error de más de 200 caracteres y se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el mensaje se reparte en varias líneas y la página no necesita desplazamiento horizontal
