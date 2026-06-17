
function iniciarNivel(nivel) {
  BotState.nivelActual = nivel;
  BotState.estado = CONFIG.ESTADOS.PRACTICANDO;

  actualizarHeader();

 if (typeof prepararRondaInteligente === "function") {
  prepararRondaInteligente(BotState.categoriaActual);
} else {
  prepararRonda(BotState.categoriaActual);
}
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

  BotState.estado = CONFIG.ESTADOS.ESPERANDO_REINTENTO;

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

¿Te gustaría intentar este nivel una vez más?

Escribe:
sí = repetir este nivel
no = escoger otro nivel`,
    "bot"
  );
}