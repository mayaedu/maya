/*
  level3.js

  Nivel 3:
  El estudiante debe completar la palabra en inglés.

  Ejemplo:
  Bot: Completa la palabra: h_rse
  Usuario puede responder:
  - o
  - horse
*/

function mostrarPreguntaNivel3(palabra) {
  let completar = palabra.completar;
  let respuestaCompletar = palabra.respuestaCompletar;

  if (!completar || !respuestaCompletar) {
    const generado = crearPalabraIncompleta(palabra.ingles);

    completar = generado.incompleta;
    respuestaCompletar = generado.respuesta;

    palabra.completar = completar;
    palabra.respuestaCompletar = respuestaCompletar;
  }

  const pista = palabra.pista || obtenerPistaPalabra(palabra.ingles);

  agregarMensajeConImagenHTML(
    `Completa la palabra en inglés:<br><br>
<strong>${escaparHTML(completar)}</strong><br><br>
Pista: ${escaparHTML(pista)}`,
    palabra.imagen,
    "bot"
  );
}

function revisarNivel3(textoUsuario) {
  const respuesta = limpiarTexto(textoUsuario);
  const palabra = BotState.palabraActual;

  if (!palabra.completar || !palabra.respuestaCompletar) {
    const generado = crearPalabraIncompleta(palabra.ingles);

    palabra.completar = generado.incompleta;
    palabra.respuestaCompletar = generado.respuesta;
  }

  const correctaCompleta = limpiarTexto(palabra.ingles);
  const letraFaltante = limpiarTexto(palabra.respuestaCompletar || "");

  if (respuesta === correctaCompleta || respuesta === letraFaltante) {
    respuestaCorrecta();
    return;
  }

  respuestaIncorrecta(
    `La palabra correcta es "${palabra.ingles}". La letra que faltaba era "${palabra.respuestaCompletar}".`,
    textoUsuario
  );
}