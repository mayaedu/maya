

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
  actualizarHeader();

  cargarMemoria();

  if (typeof cargarHistorialChat === "function") {
    cargarHistorialChat();
  }

  if (typeof renderizarHistorialInicial === "function") {
    renderizarHistorialInicial();
  }

  agregarMensaje(
    "Hola. Soy tu bot de vocabulario de primaria.\nCargando vocabulario...",
    "bot"
  );

  await cargarVocabulario();

  if (typeof cargarDictionary === "function") {
    await cargarDictionary();
  }

  configurarEventos();
}

function configurarEventos() {
  sendBtn.addEventListener("click", enviarMensaje);

  userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      enviarMensaje();
    }
  });
}

function enviarMensaje() {
  const texto = obtenerTextoInput();

  if (texto === "") {
    return;
  }

  agregarMensaje(texto, "user");
  limpiarInput();

  procesarMensaje(texto);
}

function procesarMensaje(texto) {
  if (!BotState.vocabularioCargado) {
    agregarMensaje(
      "Todavía estoy cargando el vocabulario. Intenta de nuevo en un momento.",
      "bot"
    );
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_CATEGORIA) {
    procesarCategoria(texto);
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_NIVEL) {
    procesarNivel(texto);
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.PRACTICANDO) {
    revisarRespuestaNivel(texto);
    return;
  }

  agregarMensaje(
    "No entendí tu respuesta. Escribe una categoría para comenzar.",
    "bot"
  );
}

function procesarCategoria(texto) {
  const categoria = detectarCategoria(texto);

  if (!categoria) {
    agregarMensaje(
      "No encontré esa categoría.\n\nEscoge una categoría disponible:\n" +
      obtenerCategoriasNumeradasComoTexto(),
      "bot"
    );
    return;
  }

  BotState.categoriaActual = categoria;
  BotState.estado = CONFIG.ESTADOS.ESPERANDO_NIVEL;

  actualizarHeader();

  agregarMensaje(
    `Muy bien. Escogiste ${categoria}.\n\nAhora escoge un nivel:\n\n` +
    "1. Ver imagen y escoger la palabra en inglés.\n" +
    "2. Ver palabra en inglés y elegir significado.\n" +
    "3. Completar la palabra.\n" +
    "5. Escribir una oración corta.",
    "bot"
  );
}

function procesarNivel(texto) {
  const nivel = obtenerNumeroNivel(texto);

  if (!nivel || !CONFIG.NIVELES_PERMITIDOS.includes(nivel)) {
    agregarMensaje(
      "Nivel no válido. Escoge 1, 2, 3 o 5.",
      "bot"
    );
    return;
  }

  agregarMensaje(
    `Perfecto. Iniciamos ${BotState.categoriaActual} - Nivel ${nivel}.`,
    "bot"
  );

  iniciarNivel(nivel);
}