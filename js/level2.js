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

  const mensaje = document.createElement("div");
  mensaje.classList.add("message", "bot", "message-wide");

  const parrafo = document.createElement("p");
  parrafo.classList.add("question-title");
  parrafo.innerHTML = `¿Qué significa <strong>"${escaparHTML(palabra.ingles)}"</strong>?`;
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("image-options-wrapper");

  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("image-option-button");
    boton.dataset.valor = opcion.espanol;

    const contenedorImagen = document.createElement("div");
    contenedorImagen.classList.add("option-image-box");

    if (opcion.imagen && opcion.imagen.trim() !== "") {
      const img = document.createElement("img");
      img.src = opcion.imagen;
      img.alt = opcion.espanol;
      img.classList.add("option-image");
      img.loading = "lazy";

      img.onerror = function() {
        contenedorImagen.innerHTML = "";

        const placeholder = document.createElement("div");
        placeholder.classList.add("option-image-placeholder");
        placeholder.textContent = "Sin imagen";

        contenedorImagen.appendChild(placeholder);
      };

      contenedorImagen.appendChild(img);

    } else {
      const placeholder = document.createElement("div");
      placeholder.classList.add("option-image-placeholder");
      placeholder.textContent = "Sin imagen";

      contenedorImagen.appendChild(placeholder);
    }

    const textoOpcion = document.createElement("span");
    textoOpcion.classList.add("option-label");
    textoOpcion.textContent = opcion.espanol;

    boton.appendChild(contenedorImagen);
    boton.appendChild(textoOpcion);

    boton.addEventListener("click", () => {
      revisarNivel2ConBoton(opcion, palabra, contenedorOpciones);
    });

    contenedorOpciones.appendChild(boton);
  });

  mensaje.appendChild(contenedorOpciones);
  chatBox.appendChild(mensaje);

  if (typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(
      quitarHTML(`¿Qué significa "${palabra.ingles}"?`),
      "bot",
      {
        clase: "opciones_imagen",
        html: `¿Qué significa <strong>"${escaparHTML(palabra.ingles)}"</strong>?`,
        opciones: opciones.map(opcion => {
          return {
            texto: opcion.espanol,
            imagen: opcion.imagen || "",
            valor: opcion.espanol
          };
        })
      }
    );
  }

  hacerScrollAbajo();
}



function revisarNivel2ConBoton(opcionSeleccionada, palabraCorrecta, contenedorOpciones) {
  const respuesta = limpiarTexto(opcionSeleccionada.espanol);
  const correcta = limpiarTexto(palabraCorrecta.espanol);

  if (typeof marcarOpcionesRespuesta === "function") {
    marcarOpcionesRespuesta(
      contenedorOpciones,
      palabraCorrecta.espanol,
      opcionSeleccionada.espanol
    );
  } else {
    bloquearBotonesOpciones(contenedorOpciones);
  }

  agregarMensaje(opcionSeleccionada.espanol, "user");

  setTimeout(() => {
    if (respuesta === correcta) {
      respuestaCorrecta();
      return;
    }

    respuestaIncorrecta(
      `La respuesta correcta es "${palabraCorrecta.espanol}".`,
      opcionSeleccionada.espanol
    );
  }, 600);
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