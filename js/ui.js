const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

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

function agregarMensajeConImagenHTML(html, imagen, tipo, guardar = true) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const contenedorImagen = document.createElement("div");
  contenedorImagen.classList.add("image-wrapper");

  if (imagen && imagen.trim() !== "") {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = "Imagen de vocabulario";
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

  const parrafo = document.createElement("p");
  parrafo.innerHTML = html;

  mensaje.appendChild(contenedorImagen);
  mensaje.appendChild(parrafo);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(parrafo.textContent, tipo, {
      clase: "imagen",
      imagen: imagen || ""
    });
  }

  hacerScrollAbajo();
}

function agregarMensajeConOpciones(texto, opciones, tipo = "bot", guardar = true) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;
  mensaje.appendChild(parrafo);

  const contenedorOpciones = document.createElement("div");
  contenedorOpciones.classList.add("options-wrapper");

  opciones.forEach((opcion) => {
    const boton = document.createElement("button");
    boton.classList.add("option-button");
    boton.textContent = opcion.texto;

    boton.addEventListener("click", () => {
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

function agregarMensajeConOpcionesImagen(texto, opciones, tipo = "bot", guardar = true) {
  const mensaje = crearElementoMensajeConOpcionesImagen(texto, opciones, tipo, true);

  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "opciones_imagen",
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

function crearElementoMensajeTexto(texto, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);
  mensaje.textContent = texto;

  return mensaje;
}

function crearElementoMensajeConImagen(texto, imagen, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);

  const contenedorImagen = document.createElement("div");
  contenedorImagen.classList.add("image-wrapper");

  if (imagen && imagen.trim() !== "") {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = texto;
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

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;

  mensaje.appendChild(contenedorImagen);
  mensaje.appendChild(parrafo);

  return mensaje;
}

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

function renderizarMensajeHistorial(item, posicion = "final") {
  let mensaje;

  if (item.clase === "imagen") {
    mensaje = crearElementoMensajeConImagen(item.texto, item.imagen, item.tipo);

  } else if (item.clase === "opciones_imagen") {
    mensaje = crearElementoMensajeConOpcionesImagen(
      item.texto,
      item.opciones || [],
      item.tipo,
      false
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

function cargarMensajesIniciales() {
  if (typeof obtenerUltimosMensajes !== "function") {
    return;
  }

  const mensajes = obtenerUltimosMensajes();

  if (mensajes.length === 0) {
    return;
  }

  chatBox.innerHTML = "";

  mensajes.forEach(item => {
    renderizarMensajeHistorial(item, "final");
  });

  hacerScrollAbajo();
}

function configurarScrollInfinito() {
  chatBox.addEventListener("scroll", () => {
    if (typeof cargandoHistorial === "undefined") return;
    if (cargandoHistorial) return;

    if (chatBox.scrollTop <= 10) {
      cargarMensajesAnterioresEnChat();
    }
  });
}

function cargarMensajesAnterioresEnChat() {
  if (typeof obtenerMensajesAnteriores !== "function") {
    return;
  }

  const alturaAntes = chatBox.scrollHeight;

  cargandoHistorial = true;

  const anteriores = obtenerMensajesAnteriores();

  if (anteriores.length === 0) {
    cargandoHistorial = false;
    return;
  }

  anteriores.reverse().forEach(item => {
    renderizarMensajeHistorial(item, "inicio");
  });

  const alturaDespues = chatBox.scrollHeight;
  chatBox.scrollTop = alturaDespues - alturaAntes;

  setTimeout(() => {
    cargandoHistorial = false;
  }, 300);
}

function actualizarHeader() {
  const levelBadge = document.getElementById("levelBadge");
  const headerSubtitle = document.getElementById("headerSubtitle");

  if (!levelBadge || !headerSubtitle) return;

  if (BotState.estado === CONFIG.ESTADOS.PRACTICANDO && BotState.nivelActual) {
    levelBadge.textContent = "Nivel " + BotState.nivelActual;

    if (BotState.categoriaActual) {
      headerSubtitle.textContent = "Categoría: " + capitalizar(BotState.categoriaActual);
    } else {
      headerSubtitle.textContent = "Practicando vocabulario";
    }

    return;
  }

  if (BotState.estado === CONFIG.ESTADOS.ESPERANDO_NIVEL && BotState.categoriaActual) {
    levelBadge.textContent = "Elige nivel";
    headerSubtitle.textContent = "Categoría: " + capitalizar(BotState.categoriaActual);
    return;
  }

  levelBadge.textContent = "Sin nivel";
  headerSubtitle.textContent = "Aprende inglés con imágenes";
}

function limpiarInput() {
  userInput.value = "";
}

function obtenerTextoInput() {
  return userInput.value.trim();
}

function bloquearInput() {
  userInput.disabled = true;
  sendBtn.disabled = true;
}

function desbloquearInput() {
  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

function hacerScrollAbajo() {
  chatBox.scrollTop = chatBox.scrollHeight;
}