/*
  level2.js

  Nivel 2:
  El estudiante ve una palabra en inglés
  y debe escoger su significado en español usando opciones con imagen.

  Ejemplo:
  Bot: ¿Qué significa "horse"?
  Opciones: caballo, vaca, perro, gato
*/

function mostrarPreguntaNivel2(palabra) {
  const opciones = generarOpciones(palabra);

  palabra.opcionesActuales = opciones;

  const opcionesBotones = opciones.map(opcion => {
    return {
      texto: opcion.espanol,
      imagen: opcion.imagen,
      accion: function() {
        revisarRespuestaNivel(opcion.espanol);
      }
    };
  });

  agregarMensajeConOpcionesImagen(
    `¿Qué significa <strong>"${escaparHTML(palabra.ingles)}"</strong>?`,
    opcionesBotones,
    "bot"
  );
}

function revisarNivel2(textoUsuario) {
  const palabra = BotState.palabraActual;
  const respuesta = limpiarTexto(textoUsuario);

  const opcionElegida = palabra.opcionesActuales.find(opcion => {
    return limpiarTexto(opcion.espanol) === respuesta;
  });

  if (opcionElegida && opcionElegida.id === palabra.id) {
    respuestaCorrecta();
    return;
  }

  respuestaIncorrecta(
    `La respuesta correcta es "${palabra.espanol}".`,
    textoUsuario
  );
}