# Spec Delta

## MODIFIED Requirements

### Requirement: Escribir un número en la celda editable seleccionada
El sistema SHALL, con una celda editable seleccionada y mientras la partida no esté completada, permitir escribir un número del 1 al 9 en esa celda tanto con el teclado físico como con un panel de números en pantalla, con el mismo resultado en ambos casos.

#### Scenario: Escribir un número con el teclado físico
- **WHEN** hay una celda editable seleccionada y el jugador pulsa una tecla numérica del 1 al 9
- **THEN** esa celda pasa a mostrar ese número

#### Scenario: Escribir un número con el panel en pantalla
- **WHEN** hay una celda editable seleccionada y el jugador pulsa el botón de un número del 1 al 9 en el panel de números
- **THEN** esa celda pasa a mostrar ese número, igual que si se hubiera escrito con el teclado físico

#### Scenario: Escribir un número reemplaza el valor anterior de la celda
- **WHEN** hay una celda editable seleccionada que ya tiene un número, y el jugador escribe un número distinto
- **THEN** la celda pasa a mostrar el número nuevo en lugar del anterior

### Requirement: Borrar el valor de la celda editable seleccionada
El sistema SHALL, con una celda editable seleccionada que tiene un número y mientras la partida no esté completada, permitir borrar ese número tanto con las teclas Backspace o Delete del teclado físico como con un botón de borrar en el panel de números, con el mismo resultado en ambos casos.

#### Scenario: Borrar con el teclado físico
- **WHEN** hay una celda editable seleccionada con un número y el jugador pulsa Backspace o Delete
- **THEN** esa celda queda vacía

#### Scenario: Borrar con el botón del panel
- **WHEN** hay una celda editable seleccionada con un número y el jugador pulsa el botón de borrar del panel de números
- **THEN** esa celda queda vacía, igual que si se hubiera borrado con el teclado físico

### Requirement: Entradas sin efecto sobre el tablero
El sistema SHALL ignorar, sin modificar el tablero ni mostrar ningún mensaje de error, cualquier intento de escribir o borrar un número cuando no sea aplicable: una tecla que no sea un número del 1-9 ni Backspace/Delete ni una flecha, un número o un borrado sin ninguna celda seleccionada, un número o un borrado con una celda fija seleccionada, o un número o un borrado con la partida ya completada.

#### Scenario: Tecla no válida no cambia nada
- **WHEN** el jugador pulsa una tecla que no es un número del 1 al 9, ni Backspace, ni Delete, ni una flecha (por ejemplo, una letra o un símbolo)
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

#### Scenario: Escribir un número sin ninguna celda seleccionada no cambia nada
- **WHEN** no hay ninguna celda seleccionada y el jugador pulsa una tecla numérica del 1 al 9 o el botón de un número en el panel
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

#### Scenario: Escribir un número con una celda fija seleccionada no cambia nada
- **WHEN** hay una celda fija seleccionada y el jugador pulsa una tecla numérica del 1 al 9 o el botón de un número en el panel
- **THEN** el valor de esa celda fija no cambia y no se muestra ningún mensaje de error

#### Scenario: Borrar con una celda fija seleccionada no cambia nada
- **WHEN** hay una celda fija seleccionada y el jugador pulsa Backspace, Delete o el botón de borrar del panel
- **THEN** el valor de esa celda fija no cambia y no se muestra ningún mensaje de error

#### Scenario: Borrar sin ninguna celda seleccionada no cambia nada
- **WHEN** no hay ninguna celda seleccionada y el jugador pulsa Backspace, Delete o el botón de borrar del panel
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

#### Scenario: Escribir o borrar con la partida completada no cambia nada
- **WHEN** la partida está completada, hay una celda editable seleccionada y el jugador escribe un número o borra, con el teclado físico o con el panel
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

### Requirement: Empezar una nueva partida
El sistema SHALL mostrar, durante la pantalla de juego, un control para empezar una nueva partida que vuelve a la pantalla inicial de selección de dificultad; SHALL pedir confirmación antes de abandonar la partida en curso si, en el momento de usar ese control, la partida no está completada y hay algún número puesto por el jugador en alguna celda editable del tablero, y SHALL volver directamente a la pantalla inicial sin pedir confirmación en cualquier otro caso: si no hay ninguno en ese momento (incluido el caso de haber escrito y borrado números antes, sin dejar ninguno puesto) o si la partida está completada.

#### Scenario: Nueva partida sin números puestos vuelve directamente
- **WHEN** el jugador usa el control de nueva partida y, en ese momento, ninguna celda editable tiene un número puesto por el jugador
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad sin pedir confirmación

#### Scenario: Escribir y borrar todos los números no pide confirmación
- **WHEN** el jugador escribió números en una o más celdas editables, los borró todos, y después usa el control de nueva partida
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad sin pedir confirmación

#### Scenario: Nueva partida con algún número puesto pide confirmación
- **WHEN** el jugador usa el control de nueva partida y, en ese momento, la partida no está completada y al menos una celda editable tiene un número puesto por el jugador
- **THEN** el sistema pide confirmación antes de volver a la pantalla inicial

#### Scenario: Nueva partida con la partida completada vuelve directamente
- **WHEN** la partida está completada y el jugador usa el control de nueva partida
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad sin pedir confirmación

#### Scenario: Confirmar el abandono vuelve a la pantalla inicial
- **WHEN** el jugador confirma que quiere abandonar la partida en curso
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad

#### Scenario: Cancelar el abandono mantiene la partida en curso
- **WHEN** el jugador, tras pedírsele confirmación, decide no abandonar la partida
- **THEN** el sistema permanece en la pantalla de juego con el tablero y los números tal como estaban

### Requirement: Uso en pantallas de móvil sin desplazamiento horizontal
El sistema SHALL poder usarse por completo en una pantalla de móvil de referencia de 360x640 píxeles sin desplazamiento horizontal: pantalla inicial, aviso de generación, pantalla de error y pantalla de juego. En la pantalla de juego, el temporizador, el tablero, el panel de números y, cuando se muestra, el mensaje de partida completada SHALL caber además sin desplazamiento vertical; "Nueva partida" puede requerirlo.

#### Scenario: Sin desplazamiento horizontal a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el temporizador, el tablero y el panel de números son completamente visibles y usables sin que la página necesite desplazamiento horizontal ni vertical

#### Scenario: Mensaje de partida completada a 360 píxeles de ancho
- **WHEN** la partida está completada y la pantalla de juego se muestra en una pantalla de móvil de 360x640 píxeles
- **THEN** el mensaje de partida completada, el temporizador, el tablero y el panel de números son completamente visibles sin que la página necesite desplazamiento horizontal ni vertical

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
