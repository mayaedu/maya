/*
  level1.js

  Nivel 1:
  El estudiante ve una imagen y debe escribir la palabra en inglés.

  Ejemplo:
  Bot: ¿Cómo se dice "caballo" en inglés?
  Usuario: horse
*/

function mostrarPreguntaNivel1(palabra) {
  agregarMensajeConImagenHTML(
    `¿Cómo se dice <strong>"${escaparHTML(palabra.espanol)}"</strong> en inglés?`,
    palabra.imagen,
    "bot"
  );
}

function revisarNivel1(textoUsuario) {
  const respuesta = limpiarTexto(textoUsuario);
  const correcta = limpiarTexto(BotState.palabraActual.ingles);

  if (respuesta === correcta) {
    respuestaCorrecta();
    return;
  }

  respuestaIncorrecta(
    `La respuesta correcta es "${BotState.palabraActual.ingles}".`,
    textoUsuario
  );
}