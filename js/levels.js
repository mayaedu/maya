function iniciarNivel(nivel) {
  BotState.nivelActual = nivel;
  BotState.estado = CONFIG.ESTADOS.PRACTICANDO;

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
}

function mostrarPreguntaNivel1(palabra) {
  agregarMensajeConImagen(
    `¿Cómo se dice "${palabra.espanol}" en inglés?`,
    palabra.imagen,
    "bot"
  );
}

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
    `¿Qué significa "${palabra.ingles}"?`,
    opcionesBotones,
    "bot"
  );
}

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

  agregarMensajeConImagen(
    `Completa la palabra en inglés:

${completar}

Pista: ${pista}`,
    palabra.imagen,
    "bot"
  );
}

function mostrarPreguntaNivel5(palabra) {
  agregarMensajeConImagen(
    `Escribe una oración corta en inglés usando la palabra "${palabra.ingles}".

Estructuras permitidas:

1. The ${palabra.ingles} is big.
2. A ${palabra.ingles} is happy.
3. I see a ${palabra.ingles}.
4. The ${palabra.ingles} can run.

Ejemplo: ${palabra.oracionEjemplo || `The ${palabra.ingles} is big.`}`,
    palabra.imagen,
    "bot"
  );
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
}

function revisarNivel1(textoUsuario) {
  const respuesta = limpiarTexto(textoUsuario);
  const correcta = limpiarTexto(BotState.palabraActual.ingles);

  if (respuesta === correcta) {
    respuestaCorrecta();
  } else {
    respuestaIncorrecta(
      `La respuesta correcta es "${BotState.palabraActual.ingles}".`,
      textoUsuario
    );
  }
}

function revisarNivel2(textoUsuario) {
  const palabra = BotState.palabraActual;
  const respuesta = limpiarTexto(textoUsuario);

  const opcionElegida = palabra.opcionesActuales.find(opcion => {
    return limpiarTexto(opcion.espanol) === respuesta;
  });

  if (opcionElegida && opcionElegida.id === palabra.id) {
    respuestaCorrecta();
  } else {
    respuestaIncorrecta(
      `La respuesta correcta es "${palabra.espanol}".`,
      textoUsuario
    );
  }
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
  } else {
    respuestaIncorrecta(
      `La palabra correcta es "${palabra.ingles}". La letra que faltaba era "${palabra.respuestaCompletar}".`,
      textoUsuario
    );
  }
}

function revisarNivel5(textoUsuario) {
  if (!BotState.dictionaryCargado) {
    respuestaIncorrecta(
      "El diccionario todavía no está cargado. Revisa el archivo data/dictionary.json.",
      textoUsuario
    );
    return;
  }

  const respuestaOriginal = textoUsuario.trim();
  const respuesta = limpiarTexto(respuestaOriginal);

  const nounCorrecto = limpiarTexto(BotState.palabraActual.ingles);
  const palabras = respuesta.split(" ").filter(p => p.length > 0);

  const resultado = validarOracionNivel5(palabras, nounCorrecto);

  if (resultado.valida) {
    respuestaCorrecta();
    return;
  }

  let ayuda = resultado.mensaje;

  ayuda += `

Ejemplos válidos:
- The ${BotState.palabraActual.ingles} is big.
- A ${BotState.palabraActual.ingles} is happy.
- I see a ${BotState.palabraActual.ingles}.
- The ${BotState.palabraActual.ingles} can run.`;

  respuestaIncorrecta(ayuda, textoUsuario);
}

function validarOracionNivel5(palabras, nounCorrecto) {
  if (!palabras.includes(nounCorrecto)) {
    return {
      valida: false,
      mensaje: `La oración debe usar la palabra "${nounCorrecto}".`
    };
  }

  if (tienePalabrasBloqueadas(palabras)) {
    return {
      valida: false,
      mensaje: "La oración debe estar en inglés. Evita mezclar palabras en español."
    };
  }

  /*
    Reglas válidas:

    1. article + noun + verb + adjective
       The cow is big.

    2. article + noun + can + actionVerb
       The dog can run.

    3. pronoun + verb + article + noun
       I see a cow.

    4. this/that + is + article + noun
       This is a cow.
  */

  if (palabras.length === 4) {
    const [p1, p2, p3, p4] = palabras;

    // The cow is big
    if (
      esArticle(p1) &&
      p2 === nounCorrecto &&
      esVerb(p3) &&
      esAdjective(p4)
    ) {
      return {
        valida: true,
        mensaje: "Oración correcta."
      };
    }

    // The dog can run
    if (
      esArticle(p1) &&
      p2 === nounCorrecto &&
      p3 === "can" &&
      esActionVerb(p4)
    ) {
      return {
        valida: true,
        mensaje: "Oración correcta."
      };
    }

    // I see a cow
    if (
      esPronoun(p1) &&
      esVerb(p2) &&
      esArticle(p3) &&
      p4 === nounCorrecto
    ) {
      return {
        valida: true,
        mensaje: "Oración correcta."
      };
    }

    // This is a cow
    if (
      (p1 === "this" || p1 === "that") &&
      p2 === "is" &&
      esArticle(p3) &&
      p4 === nounCorrecto
    ) {
      return {
        valida: true,
        mensaje: "Oración correcta."
      };
    }
  }

  return {
    valida: false,
    mensaje: "La oración no sigue una estructura válida para este nivel."
  };
}

function respuestaCorrecta() {
  Memoria.estudiante.puntos += CONFIG.PUNTOS_POR_RESPUESTA;
  Memoria.estudiante.correctas++;
  BotState.ronda.correctas++;

  registrarCorrectaNivel(BotState.nivelActual);
  guardarPalabraAprendida(BotState.palabraActual);
  guardarMemoria();

  agregarMensaje(
    `Excelente. Ganaste ${CONFIG.PUNTOS_POR_RESPUESTA} puntos.`,
    "bot"
  );

  avanzarPalabra();
}

function respuestaIncorrecta(mensaje, respuestaUsuario = "") {
  Memoria.estudiante.incorrectas++;
  BotState.ronda.incorrectas++;

  registrarIncorrectaNivel(BotState.nivelActual);
  guardarError(BotState.palabraActual, BotState.nivelActual, respuestaUsuario);
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

  agregarMensaje(
    `Terminaste la ronda.

Resultado de esta ronda:
Total de palabras: ${total}
Correctas: ${correctas}
Incorrectas: ${incorrectas}

Puntos acumulados: ${Memoria.estudiante.puntos}

Escribe otra categoría para seguir practicando.`,
    "bot"
  );
}