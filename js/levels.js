/*
  levels.js

  Controlador general de niveles.

  Este archivo NO contiene la lógica interna de cada nivel.
  Solo decide qué nivel mostrar, revisa la respuesta llamando al archivo correcto
  y maneja funciones comunes como avanzar, terminar ronda y registrar respuestas.

  Archivos que deben cargarse antes:
  - level1.js
  - level2.js
  - level3.js
  - level5.js
*/

function iniciarNivel(nivel) {
  BotState.nivelActual = nivel;
  BotState.estado = CONFIG.ESTADOS.PRACTICANDO;

  actualizarHeader();

  prepararRonda(BotState.categoriaActual);
  registrarCategoriaPracticada(BotState.categoriaActual);

  BotState.palabraActual = obtenerSiguientePalabra();

  if (!BotState.palabraActual) {
    agregarMensaje("No hay palabras disponibles para esta categoría.", "bot");
    return;
  }

  setTimeout(() => {
    mostrarPreguntaActual();
  }, 500);
}

function mostrarPreguntaActual() {
  const palabra = BotState.palabraActual;

  if (!palabra) {
    terminarRonda();
    return;
  }

  if (BotState.nivelActual === 1) {
    mostrarPreguntaNivel1(palabra);
    return;
  }

  if (BotState.nivelActual === 2) {
    mostrarPreguntaNivel2(palabra);
    return;
  }

  if (BotState.nivelActual === 3) {
    mostrarPreguntaNivel3(palabra);
    return;
  }

  if (BotState.nivelActual === 5) {
    mostrarPreguntaNivel5(palabra);
    return;
  }

  agregarMensaje("Nivel no disponible. Escoge 1, 2, 3 o 5.", "bot");
}

function revisarRespuestaNivel(textoUsuario) {
  if (!BotState.palabraActual) {
    return;
  }

  if (BotState.nivelActual === 1) {
    revisarNivel1(textoUsuario);
    return;
  }

  if (BotState.nivelActual === 2) {
    revisarNivel2(textoUsuario);
    return;
  }

  if (BotState.nivelActual === 3) {
    revisarNivel3(textoUsuario);
    return;
  }

  if (BotState.nivelActual === 5) {
    revisarNivel5(textoUsuario);
    return;
  }

  agregarMensaje("No pude revisar la respuesta porque el nivel no es válido.", "bot");
}

function respuestaCorrecta() {
  Memoria.estudiante.puntos += CONFIG.PUNTOS_POR_RESPUESTA;
  Memoria.estudiante.correctas++;
  BotState.ronda.correctas++;

  registrarCorrectaNivel(BotState.nivelActual);
  guardarPalabraAprendida(BotState.palabraActual);

  if (typeof registrarAprendizajeCorrecto === "function") {
    registrarAprendizajeCorrecto(BotState.palabraActual);
  }

  guardarMemoria();

  agregarMensaje(
    `Excelente. Ganaste ${CONFIG.PUNTOS_POR_RESPUESTA} punto.`,
    "bot"
  );

  avanzarPalabra();
}

function respuestaIncorrecta(mensaje, respuestaUsuario = "") {
  Memoria.estudiante.incorrectas++;
  BotState.ronda.incorrectas++;

  registrarIncorrectaNivel(BotState.nivelActual);
  guardarError(
    BotState.palabraActual,
    BotState.nivelActual,
    respuestaUsuario
  );

  if (typeof registrarAprendizajeIncorrecto === "function") {
    registrarAprendizajeIncorrecto(BotState.palabraActual);
  }

  guardarMemoria();

  agregarMensaje("Casi. " + mensaje, "bot");

  avanzarPalabra();
}

function avanzarPalabra() {
  setTimeout(() => {
    BotState.palabraActual = obtenerSiguientePalabra();

    if (!BotState.palabraActual) {
      terminarRonda();
      return;
    }

    mostrarPreguntaActual();
  }, 700);
}

function generarOpciones(palabraCorrecta) {
  const lista = obtenerTodasLasPalabrasDeCategoria(BotState.categoriaActual);

  const incorrectas = lista
    .filter(item => item.id !== palabraCorrecta.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return mezclarArray([palabraCorrecta, ...incorrectas]);
}

function terminarRonda() {
  const total = BotState.ronda.total;
  const correctas = BotState.ronda.correctas;
  const incorrectas = BotState.ronda.incorrectas;

  BotState.estado = CONFIG.ESTADOS.ESPERANDO_CATEGORIA;
  BotState.categoriaActual = "";
  BotState.nivelActual = null;
  BotState.palabraActual = null;
  BotState.rondaActual = [];
  BotState.indiceRonda = 0;

  actualizarHeader();

  let recomendacion = "";

  if (typeof obtenerRecomendacionAprendizaje === "function") {
    recomendacion = "\n\n" + obtenerRecomendacionAprendizaje();
  }

  agregarMensaje(
    `Terminaste la ronda.

Resultado de esta ronda:
Total de palabras: ${total}
Correctas: ${correctas}
Incorrectas: ${incorrectas}

Puntos acumulados: ${Memoria.estudiante.puntos}${recomendacion}

Escribe otra categoría para seguir practicando.`,
    "bot"
  );
}