# visual-style Specification

## Purpose

Define el aspecto visual de la aplicación: un tema oscuro fijo con una paleta común, contraste legible, una casilla seleccionada y unos botones reconocibles sin depender solo del color, y animaciones sutiles que respetan la preferencia de movimiento reducido.

## Requirements

### Requirement: Tema oscuro fijo
El sistema SHALL mostrar todas sus pantallas (inicial, generación en curso, error de generación y juego) sobre un mismo fondo gris azulado muy oscuro: luminancia relativa de 0,03 como máximo, componente azul mayor o igual que el rojo y que el verde, y distinto del negro puro (#000000). El fondo SHALL ser el mismo con cualquier preferencia de tema claro u oscuro del sistema operativo.

#### Scenario: Fondo oscuro en la pantalla inicial
- **WHEN** se carga la aplicación
- **THEN** el fondo de la página tiene una luminancia relativa de 0,03 como máximo, su componente azul es mayor o igual que el rojo y que el verde, y no es #000000

#### Scenario: Fondo oscuro mientras se genera
- **WHEN** se muestra el aviso de generación en curso
- **THEN** el fondo de la página es el mismo color que en la pantalla inicial

#### Scenario: Fondo oscuro en la pantalla de error de generación
- **WHEN** se muestra la pantalla de error de generación
- **THEN** el fondo de la página es el mismo color que en la pantalla inicial

#### Scenario: Fondo oscuro en la pantalla de juego
- **WHEN** se muestra la pantalla de juego
- **THEN** el fondo de la página es el mismo color que en la pantalla inicial

#### Scenario: El tema no cambia con la preferencia clara del sistema
- **WHEN** se carga la aplicación con el sistema operativo configurado con preferencia de tema claro
- **THEN** el fondo de la página es el mismo color que con preferencia de tema oscuro

### Requirement: Paleta con acento y colores reservados
El sistema SHALL definir una paleta con nombre para cada color: fondo, texto principal (blanco), acento, error y éxito. El acento SHALL tener un contraste de al menos 4,5:1 sobre el fondo de las celdas y ser distinto del blanco y de los colores reservados. El error y el éxito SHALL ser distintos entre sí y del acento, tener al menos 4,5:1 sobre el fondo, y no usarse todavía en ningún elemento visible.

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
- **WHEN** se recorren la pantalla inicial, la de generación en curso, la de error de generación y la de juego
- **THEN** ningún elemento visible usa el color de error ni el color de éxito en su texto, su fondo, su borde o su contorno

### Requirement: Contraste mínimo del texto
El sistema SHALL mostrar todo el texto visible (números del tablero, botones, título, avisos y mensajes de error) con un contraste de al menos 4,5:1 respecto a su fondo inmediato, que SHALL ser sólido, en cualquier estado del elemento. Como única excepción, el texto de un botón desactivado SHALL tener un contraste de al menos 3:1.

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

### Requirement: Contraste mínimo de los indicadores no textuales
El sistema SHALL mostrar el contorno de la casilla seleccionada, los indicadores de foco del teclado (de los botones y del tablero) y el borde o el fondo que delimita cada botón habilitado con un contraste de al menos 3:1 respecto a los colores adyacentes.

#### Scenario: Contorno de selección visible
- **WHEN** hay una celda seleccionada
- **THEN** su contorno tiene un contraste de al menos 3:1 respecto al fondo de las celdas no seleccionadas

#### Scenario: Indicador de foco visible
- **WHEN** un botón o el tablero tiene el foco del teclado
- **THEN** su indicador de foco tiene un contraste de al menos 3:1 respecto al fondo de la página

#### Scenario: Límite del botón visible
- **WHEN** se muestra un botón habilitado
- **THEN** su borde o su fondo tiene un contraste de al menos 3:1 respecto al fondo de la página

### Requirement: Indicador de la casilla seleccionada
El sistema SHALL marcar la celda seleccionada con un contorno sólido de color de acento, de al menos 2 píxeles y distinto de las líneas de la cuadrícula, y con un brillo decorativo del mismo color a su alrededor. Ninguna otra celda SHALL tener ese contorno ni ese brillo, y el indicador SHALL verse completo en cualquier celda, también en las esquinas del tablero.

#### Scenario: Celda seleccionada frente a no seleccionada
- **WHEN** hay una celda seleccionada
- **THEN** la celda seleccionada muestra un contorno sólido de color de acento de al menos 2 píxeles y un brillo de color de acento, y ninguna celda no seleccionada muestra ese contorno ni ese brillo

#### Scenario: La celda anterior pierde el indicador
- **WHEN** el jugador selecciona otra celda distinta
- **THEN** la celda anterior deja de mostrar el contorno y el brillo, y la nueva celda los muestra

#### Scenario: El indicador no se recorta en las esquinas del tablero
- **WHEN** la celda seleccionada es la de la esquina superior izquierda (fila 0, columna 0)
- **THEN** su contorno es visible en sus cuatro lados y no queda recortado por el borde redondeado del tablero

### Requirement: Estados de celda distinguibles sin depender solo del color
El sistema SHALL mostrar las celdas fijas, las editables vacías, las editables con número del jugador y la celda seleccionada de forma que cada estado se distinga de los demás por al menos una diferencia que no sea de color: grosor de letra, presencia de contorno o brillo, o contenido. La diferencia de grosor entre número fijo y número del jugador la define el requisito "El tablero distingue celdas fijas de celdas editables" de game-ui.

#### Scenario: Cada estado difiere de los demás en una propiedad medible que no es el color
- **WHEN** el tablero muestra a la vez una celda fija sin seleccionar, una editable vacía sin seleccionar, una editable con número del jugador sin seleccionar y una celda seleccionada
- **THEN** para cada pareja de esos cuatro estados se cumple al menos una de estas diferencias: distinto grosor de letra del número, presencia de contorno o brillo en una y no en la otra, o distinto contenido (una vacía y la otra con número)

### Requirement: Las celdas no reaccionan al pasar el ratón
El sistema SHALL mantener el aspecto de cada celda del tablero sin cambios cuando el ratón pasa por encima; solo la selección cambia el aspecto de una celda.

#### Scenario: Pasar el ratón por una celda no cambia su aspecto
- **WHEN** el jugador pasa el ratón por encima de una celda no seleccionada, sin hacer clic
- **THEN** el fondo, el color del número, el contorno y el brillo de esa celda son los mismos que antes

### Requirement: Colores de los números del tablero
El sistema SHALL mostrar los números puestos por el jugador en el color de acento y los números fijos en blanco, tanto si la celda está seleccionada como si no.

#### Scenario: Número del jugador en color de acento
- **WHEN** el jugador escribe un número en una celda editable
- **THEN** ese número se muestra con el color de acento

#### Scenario: Número fijo en blanco
- **WHEN** se muestra una celda fija
- **THEN** su número se muestra en blanco

### Requirement: Jerarquía de botones principales y secundarios
El sistema SHALL mostrar los botones principales habilitados (dificultades, números del panel y "Reintentar") con fondo de color de acento. Los botones secundarios ("Borrar" y "Nueva partida") y los botones desactivados SHALL no usar el acento en su fondo, borde ni texto en ningún estado. El indicador de foco del teclado sí puede ser de color de acento en todos los botones.

#### Scenario: Botón principal habilitado con acento
- **WHEN** se muestra habilitado un botón de dificultad, un botón de número del panel o el botón "Reintentar"
- **THEN** su fondo es del color de acento

#### Scenario: Botón secundario sin acento
- **WHEN** se muestra el botón "Borrar" o el botón "Nueva partida" en reposo, con el ratón encima o mientras se pulsa
- **THEN** ni su fondo, ni su borde, ni su texto usan el color de acento

#### Scenario: Botón desactivado sin acento
- **WHEN** los botones de dificultad están desactivados porque hay una generación en curso
- **THEN** ni su fondo, ni su borde, ni su texto usan el color de acento

### Requirement: Respuesta visual de los botones
El sistema SHALL cambiar visiblemente el aspecto de cada botón habilitado al pasar el ratón por encima, al pulsarlo y al recibir el foco del teclado, y SHALL devolverlo a su aspecto anterior cuando termina cada una de esas situaciones. Los botones desactivados SHALL no reaccionar al ratón.

#### Scenario: Cambio al pasar el ratón
- **WHEN** el jugador pasa el ratón por encima de un botón habilitado
- **THEN** el aspecto del botón (fondo, borde, sombra o posición) cambia respecto a su estado de reposo

#### Scenario: Cambio al pulsar
- **WHEN** el jugador mantiene pulsado un botón habilitado
- **THEN** el aspecto del botón cambia respecto a su estado con el ratón encima

#### Scenario: Vuelta al reposo al quitar el ratón
- **WHEN** el jugador aparta el ratón de un botón habilitado sobre el que estaba
- **THEN** el botón vuelve a su aspecto de reposo

#### Scenario: Vuelta al aspecto con el ratón encima al soltar
- **WHEN** el jugador suelta un botón habilitado que mantenía pulsado, con el ratón todavía encima
- **THEN** el botón vuelve a su aspecto con el ratón encima

#### Scenario: Foco del teclado visible en los botones
- **WHEN** un botón recibe el foco mediante la tecla Tab
- **THEN** el botón muestra un indicador de foco que no tiene en reposo

#### Scenario: Botón desactivado no reacciona
- **WHEN** los botones de dificultad están desactivados porque hay una generación en curso
- **THEN** se muestran con un aspecto distinto del de reposo habilitado, y pasar el ratón por encima no cambia su aspecto

### Requirement: Foco del teclado en el tablero
El sistema SHALL mostrar un indicador de foco alrededor de todo el tablero cuando este recibe el foco mediante el teclado, distinto del contorno de la casilla seleccionada.

#### Scenario: Volver al tablero con el teclado
- **WHEN** el foco está en el primer botón del panel de números y el jugador pulsa Mayúsculas+Tab
- **THEN** el tablero recibe el foco y muestra un indicador de foco que rodea el tablero entero

#### Scenario: El foco del tablero no se confunde con la selección
- **WHEN** el tablero tiene el foco del teclado y hay una celda seleccionada
- **THEN** el indicador de foco rodea el tablero entero y la celda seleccionada conserva su propio contorno

### Requirement: Forma y profundidad
El sistema SHALL mostrar el tablero y los botones con esquinas redondeadas y sombras suaves, sin que el redondeo impida ver la separación entre cuadros de 3x3.

#### Scenario: Esquinas redondeadas
- **WHEN** se muestra la pantalla de juego
- **THEN** el contorno exterior del tablero y los botones tienen esquinas redondeadas

#### Scenario: Sombras suaves
- **WHEN** se muestra la pantalla de juego
- **THEN** el tablero y los botones habilitados proyectan una sombra

#### Scenario: El redondeo no borra la separación entre cuadros de 3x3
- **WHEN** se muestra el tablero con el redondeo aplicado
- **THEN** el borde entre dos celdas de cuadros de 3x3 distintos sigue siendo más grueso que el borde entre dos celdas del mismo cuadro, tanto en horizontal como en vertical

### Requirement: Animaciones sutiles
El sistema SHALL animar solo los cambios de aspecto de los botones, con transiciones de 250 milisegundos como máximo que afectan al color, al borde, a la sombra o a la posición, nunca al contenido ni a la posibilidad de pulsar. La selección de celdas SHALL cambiar sin animación.

#### Scenario: Transición en los botones
- **WHEN** el jugador pasa el ratón por encima de un botón habilitado, sin preferencia de movimiento reducido
- **THEN** el cambio de aspecto se produce con una transición de duración mayor que 0 y de 250 milisegundos como máximo

#### Scenario: La selección cambia sin animación
- **WHEN** el jugador selecciona una celda, sin preferencia de movimiento reducido
- **THEN** el contorno y el brillo aparecen de inmediato, sin transición ni animación

#### Scenario: Las animaciones no retrasan la jugada
- **WHEN** el jugador pulsa el botón de un número del panel con una celda editable seleccionada, mientras ese botón está en plena transición
- **THEN** inmediatamente después de la pulsación, sin esperar, el texto de la celda ya es el número pulsado

### Requirement: Movimiento reducido
El sistema SHALL desactivar todas las animaciones y transiciones cuando el sistema operativo indique preferencia por reducir el movimiento, sin perder ninguna de las diferencias visuales entre estados.

#### Scenario: Sin transiciones con movimiento reducido
- **WHEN** se carga la aplicación con la preferencia de reducir movimiento activada y el jugador pasa el ratón por un botón habilitado
- **THEN** el cambio de aspecto es inmediato, sin transición ni animación

#### Scenario: Los estados siguen distinguiéndose con movimiento reducido
- **WHEN** se carga la aplicación con la preferencia de reducir movimiento activada
- **THEN** la celda seleccionada sigue mostrando su contorno y su brillo, y los botones siguen cambiando de aspecto al pasar el ratón y al pulsarlos

### Requirement: Tipografía del sistema
El sistema SHALL usar exclusivamente las fuentes instaladas en el sistema operativo del jugador, sin descargar ni declarar fuentes propias.

#### Scenario: No se descargan fuentes
- **WHEN** se carga la aplicación y se juega una partida
- **THEN** la página no realiza ninguna petición de archivos de fuente

#### Scenario: No se declaran fuentes propias
- **WHEN** se inspeccionan las hojas de estilo de la página
- **THEN** no contienen ninguna declaración de fuente propia (`@font-face`)
