document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
  actualizarHeader();
  if (typeof inicializarSonidos === "function") {
  inicializarSonidos();
}

  cargarMemoria();

  if (typeof renderizarHistorialInicial === "function") {
    renderizarHistorialInicial();
  }

  /*
    Cargamos vocabulario y diccionario en silencio.
    Así Inglés estará listo cuando el estudiante lo seleccione.
  */
  await cargarVocabulario(false);

  if (typeof cargarDictionary === "function") {
    await cargarDictionary();
  }

  configurarEventos();

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_MATERIA) {
    mostrarMenuMaterias();
  }
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
  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_MATERIA) {
    procesarMateria(texto);
    return;
  }

  if (BotState.materiaActual === CONFIG.MATERIAS.INGLES && !BotState.vocabularioCargado) {
    agregarMensaje(
      "Todavía estoy cargando el vocabulario de inglés. Intenta de nuevo en un momento.",
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

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_REINTENTO) {
    procesarReintento(texto);
    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.PRACTICANDO) {
    if (BotState.materiaActual === CONFIG.MATERIAS.INGLES) {
      revisarRespuestaNivel(texto);
      return;
    }

    if (BotState.materiaActual === CONFIG.MATERIAS.MATEMATICAS) {
      revisarRespuestaMatematica(texto);
      return;
    }

    agregarMensaje(
      "No sé qué materia estás practicando ahora. Escoge Inglés o Matemáticas para continuar.",
      "bot"
    );

    BotState.estado = CONFIG.ESTADOS.ESPERANDO_MATERIA;
    actualizarHeader();
    mostrarMenuMaterias();

    return;
  }

  agregarMensaje(
    "No entendí tu respuesta. Escoge una materia para comenzar.",
    "bot"
  );
}

function revisarRespuestaMatematica(textoUsuario) {
  if (
    typeof MathGeometryState !== "undefined" &&
    MathGeometryState.ejercicioActual
  ) {
    revisarRespuestaGeometriaTexto(textoUsuario);
    return;
  }

  agregarMensaje(
    "Primero escoge un tema de Matemáticas para poder practicar.",
    "bot"
  );

  if (typeof mostrarMenuGeometria === "function") {
    mostrarMenuGeometria();
  }
}

/*
  Muestra el menú inicial de materias.
*/
function mostrarMenuMaterias() {
  agregarMensajeConOpciones(
    CONFIG.MENSAJES.BIENVENIDA,
    [
      {
        texto: "Inglés",
        accion: function() {
          procesarMateria("ingles");
        }
      },
      {
        texto: "Matemáticas",
        accion: function() {
          procesarMateria("matematicas");
        }
      }
    ],
    "bot",

    // IMPORTANTE:
    // El menú inicial NO se guarda en historial.
    // Así no se duplica al refrescar la app.
    false
  );
}

/*
  Procesa la materia seleccionada.
*/
function procesarMateria(texto) {
  const materia = detectarMateria(texto);

  if (!materia) {
    agregarMensaje(
      "No encontré esa materia.\n\nPuedes escoger:\n1. Inglés\n2. Matemáticas",
      "bot"
    );
    return;
  }

  BotState.materiaActual = materia;

  if (materia === CONFIG.MATERIAS.INGLES) {
    iniciarModuloIngles();
    return;
  }

  if (materia === CONFIG.MATERIAS.MATEMATICAS) {
    iniciarModuloMatematicas();
    return;
  }
}

/*
  Detecta materia por número o texto.
*/
function detectarMateria(texto) {
  const mensaje = limpiarTexto(texto);

  if (
    mensaje === "1" ||
    mensaje.includes("ingles") ||
    mensaje.includes("english")
  ) {
    return CONFIG.MATERIAS.INGLES;
  }

  if (
    mensaje === "2" ||
    mensaje.includes("matematica") ||
    mensaje.includes("matematicas") ||
    mensaje.includes("math") ||
    mensaje.includes("mates")
  ) {
    return CONFIG.MATERIAS.MATEMATICAS;
  }

  return null;
}

/*
  Abre el flujo actual de Inglés.
*/
function iniciarModuloIngles() {
  BotState.estado = CONFIG.ESTADOS.ESPERANDO_CATEGORIA;
  BotState.categoriaActual = "";
  BotState.nivelActual = null;
  BotState.palabraActual = null;

  actualizarHeader();

  if (!BotState.vocabularioCargado) {
    agregarMensaje(
      "Estoy cargando el vocabulario de inglés. Intenta de nuevo en un momento.",
      "bot"
    );
    return;
  }

  agregarMensaje(
    "Muy bien. Vamos a aprender Inglés.\n\n" +
    obtenerCategoriasNumeradasComoTexto(),
    "bot"
  );
}

/*
  Módulo de Matemáticas.
*/
function iniciarModuloMatematicas() {
  if (typeof iniciarGeometria === "function") {
    iniciarGeometria();
    return;
  }

  BotState.estado = CONFIG.ESTADOS.ESPERANDO_MATERIA;
  BotState.materiaActual = "";
  BotState.categoriaActual = "";
  BotState.nivelActual = null;
  BotState.palabraActual = null;

  actualizarHeader();

  agregarMensaje(
    "El módulo de Matemáticas todavía no está disponible. Revisa que el archivo js/math-geometry.js esté cargado correctamente.",
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

function procesarReintento(texto) {
  const respuesta = limpiarTexto(texto);

  if (
    respuesta === "si" ||
    respuesta === "sí" ||
    respuesta === "s" ||
    respuesta.includes("quiero") ||
    respuesta.includes("otra vez")
  ) {
    agregarMensaje(
      `Perfecto. Vamos a intentar otra vez ${BotState.categoriaActual} - Nivel ${BotState.nivelActual}.`,
      "bot"
    );

    iniciarNivel(BotState.nivelActual);
    return;
  }

  if (
    respuesta === "no" ||
    respuesta === "n" ||
    respuesta.includes("otro") ||
    respuesta.includes("nivel")
  ) {
    BotState.estado = CONFIG.ESTADOS.ESPERANDO_NIVEL;
    BotState.nivelActual = null;

    actualizarHeader();

    agregarMensaje(
      `Muy bien. Seguimos con la categoría ${BotState.categoriaActual}.

Ahora escoge otro nivel:

1. Ver imagen y escoger la palabra en inglés.
2. Ver palabra en inglés y elegir significado.
3. Completar la palabra.
5. Escribir una oración corta.`,
      "bot"
    );

    return;
  }

  agregarMensaje(
    "No entendí. Escribe sí para repetir este nivel o no para escoger otro nivel.",
    "bot"
  );
}