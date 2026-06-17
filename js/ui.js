const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let botonBajarChat = null;
let historialScrollConfigurado = false;

/*
  Mensaje normal de texto.
*/
function agregarMensaje(texto, tipo, guardar = true) {
  const estabaAbajo = estaCercaDelFinalChat();

  const mensaje = crearElementoMensajeTexto(texto, tipo);
  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "texto"
    });
  }

  if (estabaAbajo || tipo === "user") {
    hacerScrollAbajo();
  } else {
    mostrarBotonBajarChat();
  }
}

/*
  Mensaje con imagen y texto normal.
*/
function agregarMensajeConImagen(texto, imagen, tipo, guardar = true) {
  const estabaAbajo = estaCercaDelFinalChat();

  const mensaje = crearElementoMensajeConImagen(texto, imagen, tipo);
  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, tipo, {
      clase: "imagen",
      imagen: imagen || ""
    });
  }

  if (estabaAbajo || tipo === "user") {
    hacerScrollAbajo();
  } else {
    mostrarBotonBajarChat();
  }
}

/*
  Mensaje con imagen y texto HTML.
  Se usa para poner palabras en negrita con <strong>.
*/
function agregarMensajeConImagenHTML(html, imagen, tipo, guardar = true) {
  const estabaAbajo = estaCercaDelFinalChat();

  const mensaje = crearElementoMensajeConImagenHTML(html, imagen, tipo);
  chatBox.appendChild(mensaje);

  if (guardar && typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(quitarHTML(html), tipo, {
      clase: "imagen_html",
      html: html,
      imagen: imagen || ""
    });
  }

  if (estabaAbajo || tipo === "user") {
    hacerScrollAbajo();
  } else {
    mostrarBotonBajarChat();
  }
}

/*
  Mensaje con opciones de texto.
  Ejemplo: Inglés, Matemáticas, duck, cow, fish.
*/
function agregarMensajeConOpciones(texto, opciones, tipo = "bot", guardar = true) {
  const estabaAbajo = estaCercaDelFinalChat();

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
    boton.dataset.valor = opcion.valor !== undefined ? opcion.valor : opcion.texto;

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

  if (estabaAbajo || tipo === "user") {
    hacerScrollAbajo();
  } else {
    mostrarBotonBajarChat();
  }
}

/*
  Mensaje con opciones que tienen imagen.
  Se usa en Nivel 2.
*/
function agregarMensajeConOpcionesImagen(texto, opciones, tipo = "bot", guardar = true) {
  const estabaAbajo = estaCercaDelFinalChat();

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

  if (estabaAbajo || tipo === "user") {
    hacerScrollAbajo();
  } else {
    mostrarBotonBajarChat();
  }
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
    img.loading = "lazy";

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
	
	
	boton.dataset.valor = opcion.valor !== undefined ? opcion.valor : opcion.texto;

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
  const mensaje = crearElementoDesdeHistorial(item);

  if (!mensaje) {
    return;
  }

  if (posicion === "inicio") {
    chatBox.prepend(mensaje);
  } else {
    chatBox.appendChild(mensaje);
  }
}

/*
  Renderiza el historial inicial al abrir la app.
  Esta función ya es llamada desde app.js.
*/
function renderizarHistorialInicial() {
  if (typeof obtenerUltimosMensajes !== "function") {
    configurarScrollInfinitoChat();
    crearBotonBajarChat();
    return;
  }

  const mensajes = obtenerUltimosMensajes();

  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    configurarScrollInfinitoChat();
    crearBotonBajarChat();
    return;
  }

  const fragmento = document.createDocumentFragment();

  mensajes.forEach(item => {
    const mensaje = crearElementoDesdeHistorial(item);

    if (mensaje) {
      fragmento.appendChild(mensaje);
    }
  });

  chatBox.appendChild(fragmento);

  configurarScrollInfinitoChat();
  crearBotonBajarChat();

  setTimeout(() => {
    hacerScrollAbajo();
  }, 50);
}

/*
  Crea un elemento de mensaje a partir del historial.
  Se usa para renderizar muchos mensajes con mejor rendimiento.
*/

function crearElementoDesdeHistorial(item) {
  if (!item) return null;
  
  
    /*
    Evita volver a mostrar en historial el menú inicial de materias.
    Ese menú debe aparecer fresco al abrir la app, no duplicarse.
  */
  if (esMenuInicialMateriasHistorial(item)) {
    return null;
  }

  if (item.clase === "imagen") {
    return crearElementoMensajeConImagen(
      item.texto,
      item.imagen,
      item.tipo
    );
  }

  if (item.clase === "imagen_html") {
    return crearElementoMensajeConImagenHTML(
      item.html || item.texto,
      item.imagen,
      item.tipo
    );
  }

  if (item.clase === "opciones_imagen") {
    return crearElementoMensajeConOpcionesImagen(
      item.html || item.texto,
      item.opciones || [],
      item.tipo,
      false
    );
  }

  if (item.clase === "opciones") {
    return crearElementoMensajeOpcionesHistorial(
      item.texto,
      item.opciones || [],
      item.tipo
    );
  }

  /*
    Resultados de Matemáticas guardados en historial.
    Correcto = verde suave.
    Incorrecto = rojo suave.
  */
  if (item.clase === "math_result_correct") {
    const mensaje = crearElementoMensajeTexto(item.texto, item.tipo);
    mensaje.classList.add("math-result-card", "math-result-correct");
    return mensaje;
  }

  if (item.clase === "math_result_wrong") {
    const mensaje = crearElementoMensajeTexto(item.texto, item.tipo);
    mensaje.classList.add("math-result-card", "math-result-wrong");
    return mensaje;
  }

  return crearElementoMensajeTexto(item.texto, item.tipo);
}



function esMenuInicialMateriasHistorial(item) {
  if (!item) return false;

  const texto = limpiarTexto(item.texto || "");

  const tieneTextoMaya =
    texto.includes("hola soy maya") &&
    texto.includes("que te gustaria aprender");

  const tieneOpcionesMaterias =
    Array.isArray(item.opciones) &&
    item.opciones.some(opcion => limpiarTexto(opcion.texto || "") === "ingles") &&
    item.opciones.some(opcion => limpiarTexto(opcion.texto || "") === "matematicas");

  return item.clase === "opciones" && tieneTextoMaya && tieneOpcionesMaterias;
}
/*
  Configura scroll infinito hacia arriba
  y control de botón para volver abajo.
*/
function configurarScrollInfinitoChat() {
  if (historialScrollConfigurado) {
    return;
  }

  historialScrollConfigurado = true;

  chatBox.addEventListener("scroll", () => {
    manejarScrollSuperior();
    manejarBotonBajarChat();
  });
}

/*
  Cuando el usuario llega arriba, carga mensajes anteriores.
*/
function manejarScrollSuperior() {
  if (typeof obtenerMensajesAnteriores !== "function") {
    return;
  }

  if (typeof cargandoHistorial !== "undefined" && cargandoHistorial) {
    return;
  }

  const cercaDelInicio = chatBox.scrollTop <= 20;

  if (!cercaDelInicio) {
    return;
  }

  const alturaAntes = chatBox.scrollHeight;
  const scrollAntes = chatBox.scrollTop;

  if (typeof cargandoHistorial !== "undefined") {
    cargandoHistorial = true;
  }

  const anteriores = obtenerMensajesAnteriores();

  if (!anteriores || anteriores.length === 0) {
    if (typeof cargandoHistorial !== "undefined") {
      cargandoHistorial = false;
    }

    return;
  }

  const fragmento = document.createDocumentFragment();

  anteriores.forEach(item => {
    const mensaje = crearElementoDesdeHistorial(item);

    if (mensaje) {
      fragmento.appendChild(mensaje);
    }
  });

  chatBox.prepend(fragmento);

  const alturaDespues = chatBox.scrollHeight;
  chatBox.scrollTop = alturaDespues - alturaAntes + scrollAntes;

  if (typeof cargandoHistorial !== "undefined") {
    cargandoHistorial = false;
  }
}

/*
  Detecta si el usuario está cerca del final del chat.
*/
function estaCercaDelFinalChat() {
  const distanciaFinal = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
  return distanciaFinal < 120;
}

/*
  Controla si el botón de bajar se muestra o se oculta.
*/
function manejarBotonBajarChat() {
  if (!botonBajarChat) {
    return;
  }

  if (estaCercaDelFinalChat()) {
    ocultarBotonBajarChat();
  } else {
    mostrarBotonBajarChat();
  }
}

/*
  Crea botón flotante para bajar al último mensaje.
*/
function crearBotonBajarChat() {
  if (botonBajarChat) {
    return;
  }

  const contenedorApp = document.querySelector(".app-container");

  if (!contenedorApp) {
    return;
  }

  contenedorApp.style.position = "relative";

  botonBajarChat = document.createElement("button");
  botonBajarChat.type = "button";
  botonBajarChat.textContent = "↓";
  botonBajarChat.title = "Ir al final del chat";
  botonBajarChat.setAttribute("aria-label", "Ir al final del chat");

  botonBajarChat.style.position = "absolute";
  botonBajarChat.style.right = "18px";
  botonBajarChat.style.bottom = "78px";
  botonBajarChat.style.width = "42px";
  botonBajarChat.style.height = "42px";
  botonBajarChat.style.borderRadius = "50%";
  botonBajarChat.style.border = "none";
  botonBajarChat.style.background = "#2563eb";
  botonBajarChat.style.color = "white";
  botonBajarChat.style.fontSize = "22px";
  botonBajarChat.style.fontWeight = "800";
  botonBajarChat.style.cursor = "pointer";
  botonBajarChat.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.35)";
  botonBajarChat.style.display = "none";
  botonBajarChat.style.zIndex = "20";

  botonBajarChat.addEventListener("click", () => {
    hacerScrollAbajo("smooth");
  });

  contenedorApp.appendChild(botonBajarChat);
}

/*
  Muestra el botón para bajar.
*/
function mostrarBotonBajarChat() {
  if (!botonBajarChat) {
    crearBotonBajarChat();
  }

  if (botonBajarChat) {
    botonBajarChat.style.display = "block";
  }
}

/*
  Oculta el botón para bajar.
*/
function ocultarBotonBajarChat() {
  if (botonBajarChat) {
    botonBajarChat.style.display = "none";
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
function hacerScrollAbajo(comportamiento = "auto") {
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: comportamiento
  });

  ocultarBotonBajarChat();
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
  Actualiza el header con materia, categoría y nivel.
*/
function actualizarHeader() {
  const headerTitle = document.getElementById("headerTitle");
  const headerSubtitle = document.getElementById("headerSubtitle");
  const levelBadge = document.getElementById("levelBadge");

  if (headerTitle) {
    headerTitle.textContent = "Maya";
  }

  if (headerSubtitle) {
    if (BotState.materiaActual && BotState.categoriaActual) {
      headerSubtitle.textContent =
        capitalizarMateria(BotState.materiaActual) +
        " · Categoría: " +
        capitalizar(BotState.categoriaActual);

    } else if (BotState.materiaActual) {
      headerSubtitle.textContent =
        "Materia: " + capitalizarMateria(BotState.materiaActual);

    } else {
      headerSubtitle.textContent = "Aprende con Maya";
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

/*
  Capitaliza nombres de materias.
*/
function capitalizarMateria(materia) {
  const limpia = limpiarTexto(materia);

  if (limpia === "ingles") {
    return "Inglés";
  }

  if (limpia === "matematicas" || limpia === "matematica") {
    return "Matemáticas";
  }

  return capitalizar(materia);
}



/*
  Marca visualmente las opciones después de responder.
  - La correcta se pinta en verde.
  - La incorrecta seleccionada se pinta en rojo.
  - Todas quedan bloqueadas.
*/
function marcarOpcionesRespuesta(contenedor, respuestaCorrecta, respuestaSeleccionada) {
  if (!contenedor) return;

  const correcta = limpiarTexto(respuestaCorrecta);
  const seleccionada = limpiarTexto(respuestaSeleccionada);

  const botones = contenedor.querySelectorAll("button");

  botones.forEach(boton => {
    const valorBoton = limpiarTexto(
      boton.dataset.valor || boton.textContent || ""
    );

    boton.disabled = true;
    boton.classList.add("option-disabled");

    if (valorBoton === correcta) {
      boton.classList.add("option-correct");
    }

    if (valorBoton === seleccionada && seleccionada !== correcta) {
      boton.classList.add("option-wrong");
    }
  });
}


let indicadorEscribiendoMaya = null;

/*
  Muestra indicador de escritura de Maya.
*/
function mostrarMayaEscribiendo() {
  if (indicadorEscribiendoMaya) {
    return;
  }

  const mensaje = document.createElement("div");
  mensaje.classList.add("message", "bot", "typing-message");

  const contenedor = document.createElement("div");
  contenedor.classList.add("typing-indicator");

  const punto1 = document.createElement("span");
  const punto2 = document.createElement("span");
  const punto3 = document.createElement("span");

  contenedor.appendChild(punto1);
  contenedor.appendChild(punto2);
  contenedor.appendChild(punto3);

  mensaje.appendChild(contenedor);

  indicadorEscribiendoMaya = mensaje;
  chatBox.appendChild(mensaje);

  hacerScrollAbajo();
}

/*
  Oculta indicador de escritura de Maya.
*/
function ocultarMayaEscribiendo() {
  if (!indicadorEscribiendoMaya) {
    return;
  }

  indicadorEscribiendoMaya.remove();
  indicadorEscribiendoMaya = null;
}

/*
  Agrega un mensaje de Maya con pequeña espera visual.
  Sirve para que el chat se sienta más natural.
*/
function agregarMensajeMayaConEspera(texto, tiempo = 500) {
  mostrarMayaEscribiendo();

  setTimeout(() => {
    ocultarMayaEscribiendo();
    agregarMensaje(texto, "bot");
  }, tiempo);
}