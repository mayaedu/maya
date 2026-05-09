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

  mensaje.appendChild(contenorImagen);
  mensaje.appendChild(parrafo);

  return mensaje;
}