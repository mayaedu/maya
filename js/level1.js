/*
  level1.js

  Nivel 1:
  El estudiante ve una imagen y una palabra en español.
  Luego escoge la respuesta correcta en inglés entre 3 opciones.

  Mejora:
  - Marca la respuesta correcta en verde.
  - Marca la respuesta incorrecta en rojo.
  - Evita varios clics.
*/

function mostrarPreguntaNivel1(palabra) {
  const opciones = generarOpcionesNivel1(palabra);

  palabra.opcionesActuales = opciones;

  agregarMensajeConImagenHTML(
    `¿Cómo se dice <strong>"${escaparHTML(palabra.espanol)}"</strong> en inglés?`,
    palabra.imagen,
    "bot"
  );

  setTimeout(() => {
    mostrarOpcionesNivel1(opciones, palabra);
  }, 300);
}

function mostrarOpcionesNivel1(opciones, palabraCorrecta) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", "bot");

  const parrafo = document.createElement("p");
  parrafo.textContent = "Selecciona la respuesta correcta:";
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("options-wrapper");

  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("option-button");
    boton.textContent = opcion.ingles;

    boton.addEventListener("click", () => {
      revisarNivel1ConBoton(opcion, palabraCorrecta, contenedorOpciones);
    });

    contenedorOpciones.appendChild(boton);
  });

  mensaje.appendChild(contenedorOpciones);
  chatBox.appendChild(mensaje);

  if (typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial("Selecciona la respuesta correcta:", "bot", {
      clase: "opciones",
      opciones: opciones.map(opcion => {
        return {
          texto: opcion.ingles
        };
      })
    });
  }

  hacerScrollAbajo();
}

function revisarNivel1ConBoton(opcionSeleccionada, palabraCorrecta, contenedorOpciones) {
  const respuesta = limpiarTexto(opcionSeleccionada.ingles);
  const correcta = limpiarTexto(palabraCorrecta.ingles);

  const botones = contenedorOpciones.querySelectorAll("button");

  botones.forEach(boton => {
    boton.disabled = true;
    boton.classList.add("option-disabled");

    const textoBoton = limpiarTexto(boton.textContent);

    if (textoBoton === correcta) {
      boton.classList.add("option-correct");
    }

    if (textoBoton === respuesta && respuesta !== correcta) {
      boton.classList.add("option-wrong");
    }
  });

  agregarMensaje(opcionSeleccionada.ingles, "user");

  setTimeout(() => {
    if (respuesta === correcta) {
      respuestaCorrecta();
      return;
    }

    respuestaIncorrecta(
      `La respuesta correcta es "${palabraCorrecta.ingles}".`,
      opcionSeleccionada.ingles
    );
  }, 600);
}

/*
  Esta función se mantiene por compatibilidad.
  Si el estudiante escribe en el input, también revisa la respuesta.
*/
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

function generarOpcionesNivel1(palabraCorrecta) {
  const lista = obtenerTodasLasPalabrasDeCategoria(BotState.categoriaActual);

  const incorrectas = lista
    .filter(item => item.id !== palabraCorrecta.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return mezclarArray([palabraCorrecta, ...incorrectas]);
}