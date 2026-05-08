cargarMensajesIniciales();
configurarScrollInfinito();
cargarVocabulario();
cargarDictionary();

sendBtn.addEventListener("click", enviarMensaje);

userInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    enviarMensaje();
  }
});

function enviarMensaje() {
  const texto = obtenerTextoInput();

  if (texto === "") return;

  agregarMensaje(texto, "user");
  limpiarInput();

  setTimeout(() => {
    procesarMensaje(texto);
  }, 350);
}

function procesarMensaje(texto) {
  const mensaje = limpiarTexto(texto);

  if (!BotState.vocabularioCargado) {
    agregarMensaje("El vocabulario todavía no está cargado.", "bot");
    return;
  }

  if (!BotState.dictionaryCargado) {
    agregarMensaje("El diccionario todavía no está cargado.", "bot");
    return;
  }

  if (
    mensaje.includes("salir") ||
    mensaje.includes("terminar")
  ) {
    salirDePractica();
    return;
  }

  if (
    mensaje.includes("borrar chat") ||
    mensaje.includes("limpiar chat")
  ) {
    limpiarHistorialChat();
    chatBox.innerHTML = "";
    agregarMensaje("Listo. El historial del chat fue borrado.", "bot");
    return;
  }

  if (
    mensaje.includes("puntos") ||
    mensaje.includes("progreso")
  ) {
    agregarMensaje(mostrarProgreso(), "bot");
    return;
  }

  if (
    mensaje.includes("progreso por nivel") ||
    mensaje.includes("niveles")
  ) {
    agregarMensaje(mostrarProgresoPorNivel(), "bot");
    return;
  }

  if (
    mensaje.includes("errores") ||
    mensaje.includes("repasar")
  ) {
    agregarMensaje(mostrarErrores(), "bot");
    return;
  }

  if (
    mensaje.includes("aprendi") ||
    mensaje.includes("aprendidas")
  ) {
    agregarMensaje(mostrarPalabrasAprendidas(), "bot");
    return;
  }

  if (
    mensaje.includes("exportar")
  ) {
    exportarMemoria();
    agregarMensaje("Listo. Se descargó el progreso del estudiante.", "bot");
    return;
  }

  if (
    mensaje.includes("reiniciar memoria") ||
    mensaje.includes("borrar progreso")
  ) {
    reiniciarMemoria();
    agregarMensaje("Listo. Se reinició el progreso del estudiante.", "bot");
    return;
  }

  if (
    mensaje.includes("me llamo") ||
    mensaje.includes("mi nombre es") ||
    mensaje.startsWith("soy ")
  ) {
    const nombre = extraerNombre(texto);

    if (nombre !== "") {
      Memoria.estudiante.nombre = nombre;
      guardarMemoria();

      agregarMensaje(
        `Mucho gusto, ${nombre}. Ahora escoge una categoría: ${obtenerCategoriasComoTexto()}.`,
        "bot"
      );
      return;
    }
  }

  if (
    mensaje.includes("hola") ||
    mensaje.includes("buenas")
  ) {
    responderSaludo();
    return;
  }

  if (
    mensaje.includes("categorias") ||
    mensaje.includes("categorías") ||
    mensaje.includes("opciones")
  ) {
    agregarMensaje(
      "Categorías disponibles: " + obtenerCategoriasComoTexto() + ".",
      "bot"
    );
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_CATEGORIA) {
    manejarCategoria(texto);
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_NIVEL) {
    manejarNivel(texto);
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.PRACTICANDO) {
    revisarRespuestaNivel(texto);
    return;
  }

agregarMensaje(
  "Escoge una categoría válida.\n\n" + obtenerCategoriasNumeradasComoTexto(),
  "bot"
);
}

function manejarCategoria(texto) {
  const categoria = detectarCategoria(texto);

  if (!categoria) {
    agregarMensaje(
      "Escoge una categoría válida: " + obtenerCategoriasComoTexto() + ".",
      "bot"
    );
    return;
  }

  BotState.categoriaActual = categoria;
  BotState.estado = CONFIG.ESTADOS.ESPERANDO_NIVEL;

  agregarMensaje(
    `Muy bien. Escogiste ${categoria}.

Ahora escoge un nivel:

1. Ver imagen y escribir la palabra en inglés.
2. Ver palabra en inglés y elegir significado.
3. Completar la palabra.
5. Escribir una oración corta.`,
    "bot"
  );
}

function manejarNivel(texto) {
  const nivel = obtenerNumeroNivel(texto);

  if (!CONFIG.NIVELES_PERMITIDOS.includes(nivel)) {
    agregarMensaje("Escoge un nivel válido: 1, 2, 3 o 5.", "bot");
    return;
  }

  agregarMensaje(
    `Perfecto. Iniciamos ${BotState.categoriaActual} - Nivel ${nivel}.`,
    "bot"
  );

  iniciarNivel(nivel);
}

function salirDePractica() {
  BotState.estado = CONFIG.ESTADOS.ESPERANDO_CATEGORIA;
  BotState.categoriaActual = "";
  BotState.nivelActual = null;
  BotState.palabraActual = null;
  BotState.rondaActual = [];
  BotState.indiceRonda = 0;

agregarMensaje(
  "Salimos de la práctica.\n\n" + obtenerCategoriasNumeradasComoTexto(),
  "bot"
);
}

function responderSaludo() {
  if (Memoria.estudiante.nombre) {
 agregarMensaje(
  "Salimos de la práctica.\n\n" + obtenerCategoriasNumeradasComoTexto(),
  "bot"
);
  } else {
    agregarMensaje(
      "Hola. Soy tu bot de vocabulario. ¿Cómo te llamas?",
      "bot"
    );
  }
}