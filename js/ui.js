const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/*
  Mensaje normal de texto.
*/
function agregarMensaje(texto, tipo, guardar = true) {
  const mensaje = crearElementoMensajeTexto(texto, tipo);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "texto"
    });
  }

  hacerScrollAbajo();
}

/*
  Mensaje con imagen y texto normal.
*/
function agregarMensajeConImagen(texto, imagen, tipo, guardar = true) {
  const mensaje = crearElementoMensajeConImagen(texto, imagen, tipo);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "imagen",
      imagen: imagen || ""
    });
  }

  hacerScrollAbajo();
}

/*
  Mensaje con imagen y texto HTML.
  Se usa para poner palabras en negrita con <strong>.
*/
function agregarMensajeConImagenHTML(html, imagen, tipo, guardar = true) {
  const mensaje = crearElementoMensajeConImagenHTML(html, imagen, tipo);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(quitarHTML(html), tipo, {
      clase: "imagen_html",
      html: html,
      imagen: imagen || ""
    });
  }

  hacerScrollAbajo();
}

/*
  Mensaje con opciones de texto.
  Ejemplo: duck, cow, fish.
*/
function agregarMensajeConOpciones(texto, opciones, tipo = "bot", guardar = true) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("options-wrapper");

  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("option-button");
    boton.textContent = opcion.texto;

    boton.addEventListener("click", () => {
      bloquearBotonesOpciones(contenedorOpciones);

      agregarMensaje(opcion.texto, "user");

      if (typeof opcion.accion === "function") {
        opcion.accion();
      }
    });

    contenedorOpciones.appendChild(boton);
  });

  mensaje.appendChild(contenedorOpciones);
  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "opciones",
      opciones: opciones.map(opcion => {
        return {
          texto: opcion.texto
        };
      })
    });
  }

  hacerScrollAbajo();
}

/*
  Mensaje con opciones que tienen imagen.
  Se usa en Nivel 2.
*/
function agregarMensajeConOpcionesImagen(texto, opciones, tipo = "bot", guardar = true) {
  const mensaje = crearElementoMensajeConOpcionesImagen(texto, opciones, tipo, true);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(quitarHTML(texto), tipo, {
      clase: "opciones_imagen",
      html: texto,
      opciones: opciones.map(opcion => {
        return {
          texto: opcion.texto,
          imagen: opcion.imagen || ""
        };
      })
    });
  }

  hacerScrollAbajo();
}

/*
  Crea un mensaje de texto.
*/
function crearElementoMensajeTexto(texto, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);
  mensaje.textContent = texto;

  return mensaje;
}

/*
  Crea un mensaje con imagen y texto normal.
*/
function crearElementoMensajeConImagen(texto, imagen, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const contenedorImagen = crearContenedorImagen(imagen, texto);

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;

  mensaje.appendChild(contenedorImagen);
  mensaje.appendChild(parrafo);

  return mensaje;
}

/*
  Crea un mensaje con imagen y contenido HTML.
*/
function crearElementoMensajeConImagenHTML(html, imagen, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const contenedorImagen = crearContenedorImagen(imagen, "Imagen de vocabulario");

  const parrafo = document.createElement("p");
  parrafo.innerHTML = html;

  mensaje.appendChild(contenedorImagen);
  mensaje.appendChild(parrafo);

  return mensaje;
}

/*
  Crea el contenedor de imagen con manejo de error.
*/
function crearContenedorImagen(imagen, altTexto = "Imagen") {
  const contenedorImagen = document.createElement("div");
  contenedorImagen.classList.add("image-wrapper");

  if (imagen && imagen.trim() !== "") {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = altTexto;
    img.classList.add("chat-image");

    img.onerror = function() {
      contenedorImagen.innerHTML = "";

      const placeholder = document.createElement("div");
      placeholder.classList.add("image-placeholder");
      placeholder.textContent = CONFIG.MENSAJES.IMAGEN_NO_DISPONIBLE;

      contenedorImagen.appendChild(placeholder);

      console.warn("No se encontró la imagen:", imagen);
    };

    contenedorImagen.appendChild(img);

  } else {
    const placeholder = document.createElement("div");
    placeholder.classList.add("image-placeholder");
    placeholder.textContent = CONFIG.MENSAJES.SIN_IMAGEN;

    contenedorImagen.appendChild(placeholder);
  }

  return contenedorImagen;
}

/*
  Crea un mensaje con opciones de imagen.
*/
function crearElementoMensajeConOpcionesImagen(texto, opciones, tipo = "bot", conAccion = false) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo, "message-wide");

  const parrafo = document.createElement("p");
  parrafo.classList.add("question-title");
  parrafo.innerHTML = texto;
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("image-options-wrapper");

  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("image-option-button");

    const contenedorImagen = document.createElement("div");
    contenedorImagen.classList.add("option-image-box");

    if (opcion.imagen && opcion.imagen.trim() !== "") {
      const img = document.createElement("img");
      img.src = opcion.imagen;
      img.alt = opcion.texto;
      img.classList.add("option-image");

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
    textoOpcion.textContent = opcion.texto;

    boton.appendChild(contenedorImagen);
    boton.appendChild(textoOpcion);

    if (conAccion) {
      boton.addEventListener("click", () => {
        bloquearBotonesOpciones(contenedorOpciones);

        agregarMensaje(opcion.texto, "user");

        if (typeof opcion.accion === "function") {
          opcion.accion();
        }
      });
    } else {
      boton.disabled = true;
      boton.classList.add("option-disabled");
    }

    contenedorOpciones.appendChild(boton);
  });

  mensaje.appendChild(contenedorOpciones);

  return mensaje;
}

/*
  Crea opciones de texto para historial.
  Estas opciones quedan desactivadas.
*/
function crearElementoMensajeOpcionesHistorial(texto, opciones, tipo = "bot") {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("options-wrapper");

  opciones.forEach(opcion => {
    const boton = document.createElement("button");
    boton.classList.add("option-button", "option-disabled");
    boton.textContent = opcion.texto;
    boton.disabled = true;

    contenedorOpciones.appendChild(boton);
  });

  mensaje.appendChild(contenedorOpciones);

  return mensaje;
}

/*
  Bloquea botones después del primer clic.
  Esto evita que el estudiante sume puntos varias veces.
*/
function bloquearBotonesOpciones(contenedor) {
  const botones = contenedor.querySelectorAll("button");

  botones.forEach(boton => {
    boton.disabled = true;
    boton.classList.add("option-disabled");
  });
}

/*
  Renderiza mensajes guardados en historial.
*/
function renderizarMensajeHistorial(item, posicion = "final") {
  let mensaje;

  if (item.clase === "imagen") {
    mensaje = crearElementoMensajeConImagen(
      item.texto,
      item.imagen,
      item.tipo
    );

  } else if (item.clase === "imagen_html") {
    mensaje = crearElementoMensajeConImagenHTML(
      item.html || item.texto,
      item.imagen,
      item.tipo
    );

  } else if (item.clase === "opciones_imagen") {
    mensaje = crearElementoMensajeConOpcionesImagen(
      item.html || item.texto,
      item.opciones || [],
      item.tipo,
      false
    );

  } else if (item.clase === "opciones") {
    mensaje = crearElementoMensajeOpcionesHistorial(
      item.texto,
      item.opciones || [],
      item.tipo
    );

  } else {
    mensaje = crearElementoMensajeTexto(item.texto, item.tipo);
  }

  if (posicion === "inicio") {
    chatBox.prepend(mensaje);
  } else {
    chatBox.appendChild(mensaje);
  }
}

/*
  Limpia el input.
*/
function limpiarInput() {
  userInput.value = "";
}

/*
  Obtiene el texto escrito por el estudiante.
*/
function obtenerTextoInput() {
  return userInput.value.trim();
}

/*
  Bloquea el input.
*/
function bloquearInput() {
  userInput.disabled = true;
  sendBtn.disabled = true;
}

/*
  Desbloquea el input.
*/
function desbloquearInput() {
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

/*
  Hace scroll hacia abajo.
*/
function hacerScrollAbajo() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

/*
  Quita HTML para guardar texto limpio en historial.
*/
function quitarHTML(html) {
  const temporal = document.createElement("div");
  temporal.innerHTML = html;
  return temporal.textContent || temporal.innerText || "";
}

/*
  Actualiza el header con categoría y nivel.
*/
function actualizarHeader() {
  const headerTitle = document.getElementById("headerTitle");
  const headerSubtitle = document.getElementById("headerSubtitle");
  const levelBadge = document.getElementById("levelBadge");

  if (headerTitle) {
    headerTitle.textContent = "Bot de Vocabulario";
  }

  if (headerSubtitle) {
    if (BotState.categoriaActual) {
      headerSubtitle.textContent = "Categoría: " + capitalizar(BotState.categoriaActual);
    } else {
      headerSubtitle.textContent = "Aprende inglés con imágenes";
    }
  }

  if (levelBadge) {
    if (BotState.nivelActual) {
      levelBadge.textContent = "Nivel " + BotState.nivelActual;
      levelBadge.style.display = "inline-flex";
    } else {
      levelBadge.textContent = "";
      levelBadge.style.display = "none";
    }
  }
}