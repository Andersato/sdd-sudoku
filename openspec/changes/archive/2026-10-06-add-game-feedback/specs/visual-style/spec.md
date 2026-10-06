# Spec Delta

## MODIFIED Requirements

### Requirement: Paleta con acento y colores reservados
El sistema SHALL definir una paleta con nombre para cada color: fondo, texto principal (blanco), acento, error y éxito. El acento SHALL tener un contraste de al menos 4,5:1 sobre el fondo de las celdas y ser distinto del blanco y de los colores reservados. El error y el éxito SHALL ser distintos entre sí y del acento, y tener al menos 4,5:1 sobre el fondo. El color de error SHALL usarse solo en los números de las casillas marcadas como error, y el de éxito solo en el mensaje de partida completada.

#### Scenario: Los colores reservados están definidos y son distintos
- **WHEN** se inspecciona la paleta definida por la aplicación
- **THEN** existen un color de error y un color de éxito, distintos entre sí y distintos del color de acento

#### Scenario: Los colores reservados son legibles sobre el fondo
- **WHEN** se calcula el contraste del color de error y del color de éxito sobre el color de fondo
- **THEN** ambos contrastes son de al menos 4,5:1

#### Scenario: El acento es legible sobre las celdas
- **WHEN** se calcula el contraste del color de acento sobre el fondo de las celdas no seleccionadas y sobre el fondo de la celda seleccionada
- **THEN** ambos contrastes son de al menos 4,5:1, y el acento no es blanco ni coincide con el color de error o de éxito

#### Scenario: Los colores reservados no aparecen todavía en pantalla
- **WHEN** se recorren la pantalla inicial, la de generación en curso, la de error de generación y la de juego sin ninguna casilla en conflicto ni la partida completada
- **THEN** ningún elemento visible usa el color de error ni el color de éxito en su texto, su fondo, su borde o su contorno

#### Scenario: El color de error solo aparece en las casillas en conflicto
- **WHEN** la pantalla de juego tiene casillas marcadas como error
- **THEN** el color de error aparece únicamente en el texto de los números de esas casillas, y ningún otro elemento visible lo usa

#### Scenario: El color de éxito solo aparece en el mensaje de partida completada
- **WHEN** la partida está completada
- **THEN** el color de éxito aparece únicamente en el mensaje de partida completada, y ningún otro elemento visible lo usa

### Requirement: Contraste mínimo del texto
El sistema SHALL mostrar todo el texto visible (números del tablero, también los marcados como error, botones, título, avisos, temporizador, mensaje de partida completada y mensajes de error) con un contraste de al menos 4,5:1 respecto a su fondo inmediato, que SHALL ser sólido, en cualquier estado del elemento. Como única excepción, el texto de un botón desactivado SHALL tener un contraste de al menos 3:1.

#### Scenario: Número fijo legible
- **WHEN** se muestra una celda fija sin seleccionar
- **THEN** el contraste entre el color de su número y el fondo de la celda es de al menos 4,5:1

#### Scenario: Número del jugador legible
- **WHEN** se muestra una celda editable con un número puesto por el jugador, sin seleccionar
- **THEN** el contraste entre el color de su número y el fondo de la celda es de al menos 4,5:1

#### Scenario: Número del jugador legible dentro de la casilla seleccionada
- **WHEN** la celda seleccionada es una celda editable con un número puesto por el jugador
- **THEN** el contraste entre el color de su número y el fondo de la celda seleccionada es de al menos 4,5:1

#### Scenario: Número fijo legible dentro de la casilla seleccionada
- **WHEN** la celda seleccionada es una celda fija
- **THEN** el contraste entre el color de su número y el fondo de la celda seleccionada es de al menos 4,5:1

#### Scenario: Número en error legible
- **WHEN** se muestra una celda marcada como error, sin seleccionar
- **THEN** el contraste entre el color de su número y el fondo de la celda es de al menos 4,5:1

#### Scenario: Número en error legible dentro de la casilla seleccionada
- **WHEN** la celda seleccionada está marcada como error
- **THEN** el contraste entre el color de su número y el fondo de la celda seleccionada es de al menos 4,5:1

#### Scenario: Temporizador legible
- **WHEN** se muestra la pantalla de juego
- **THEN** el contraste entre el texto del temporizador y su fondo es de al menos 4,5:1

#### Scenario: Mensaje de partida completada legible
- **WHEN** se muestra el mensaje de partida completada
- **THEN** el contraste entre su texto y su fondo es de al menos 4,5:1

#### Scenario: Título legible
- **WHEN** se muestra la pantalla inicial
- **THEN** el contraste entre el título "SDD Sudoku" y su fondo es de al menos 4,5:1

#### Scenario: Aviso de generación legible
- **WHEN** se muestra el aviso "Generando..."
- **THEN** el contraste entre su texto y su fondo es de al menos 4,5:1

#### Scenario: Mensaje de error de generación legible
- **WHEN** se muestra el mensaje de error de generación
- **THEN** el contraste entre el texto del mensaje y su fondo es de al menos 4,5:1

#### Scenario: Texto de los botones legible en todos sus estados
- **WHEN** se muestra cualquier botón habilitado (dificultades, números del panel, "Borrar", "Nueva partida", "Reintentar") en reposo, con el ratón encima, mientras se pulsa o con el foco del teclado
- **THEN** el contraste entre el texto del botón y su fondo es de al menos 4,5:1 en cada uno de esos estados

#### Scenario: Texto de un botón desactivado
- **WHEN** los botones de dificultad están desactivados porque hay una generación en curso
- **THEN** el contraste entre su texto y su fondo es de al menos 3:1

### Requirement: Estados de celda distinguibles sin depender solo del color
El sistema SHALL mostrar las celdas fijas, las editables vacías, las editables con número del jugador, la celda seleccionada y las celdas marcadas como error de forma que cada estado se distinga de los demás por al menos una diferencia que no sea de color: grosor de letra, presencia de contorno o brillo, presencia de subrayado, o contenido. La diferencia de grosor entre número fijo y número del jugador la define el requisito "El tablero distingue celdas fijas de celdas editables" de game-ui.

#### Scenario: Cada estado difiere de los demás en una propiedad medible que no es el color
- **WHEN** el tablero muestra a la vez una celda fija sin seleccionar, una editable vacía sin seleccionar, una editable con número del jugador sin seleccionar y una celda seleccionada
- **THEN** para cada pareja de esos cuatro estados se cumple al menos una de estas diferencias: distinto grosor de letra del número, presencia de contorno o brillo en una y no en la otra, o distinto contenido (una vacía y la otra con número)

#### Scenario: Una celda en error se distingue sin depender del color
- **WHEN** el tablero muestra una celda del jugador marcada como error y otra celda del jugador sin marcar, ninguna seleccionada, y también una celda fija marcada como error y otra celda fija sin marcar, ninguna seleccionada
- **THEN** en cada pareja, el número de la celda en error está subrayado y el de la celda sin marcar no

### Requirement: Colores de los números del tablero
El sistema SHALL mostrar los números puestos por el jugador en el color de acento y los números fijos en blanco, tanto si la celda está seleccionada como si no, salvo cuando la celda está marcada como error: entonces su número, sea fijo o del jugador, SHALL mostrarse en el color de error.

#### Scenario: Número del jugador en color de acento
- **WHEN** el jugador escribe un número en una celda editable sin provocar ningún conflicto
- **THEN** ese número se muestra con el color de acento

#### Scenario: Número fijo en blanco
- **WHEN** se muestra una celda fija que no está en conflicto
- **THEN** su número se muestra en blanco

#### Scenario: Número en error en el color de error
- **WHEN** una celda fija o una celda con número del jugador está marcada como error, seleccionada o no
- **THEN** su número se muestra en el color de error

#### Scenario: El número recupera su color al resolverse el conflicto
- **WHEN** una celda deja de estar en conflicto
- **THEN** su número vuelve a mostrarse en el color de acento si es del jugador o en blanco si es fija
