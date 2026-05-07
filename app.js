const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let memoria = cargarMemoria();

let vocabularioPrimaria = {};
let categoriasDisponibles = [];

let modoPractica = false;
let categoriaActual = "";
let palabraActual = null;
let vocabularioCargado = false;

sendBtn.addEventListener("click", enviarMensaje);

userInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    enviarMensaje();
  }
});

cargarVocabulario();

async function cargarVocabulario() {
  try {
    const respuesta = await fetch("data/vocabulario.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo leer data/vocabulario.json");
    }

    vocabularioPrimaria = await respuesta.json();
    categoriasDisponibles = Object.keys(vocabularioPrimaria);
    vocabularioCargado = true;

    agregarMensaje(
      "Vocabulario cargado correctamente. Puedes escribir: " + categoriasDisponibles.join(", ") + ".",
      "bot"
    );

  } catch (error) {
    vocabularioCargado = false;

    agregarMensaje(
      "No pude cargar el vocabulario. Revisa que exista el archivo data/vocabulario.json y abre el proyecto con Live Server o un servidor local.",
      "bot"
    );

    console.error("Error cargando vocabulario:", error);
  }
}

function enviarMensaje() {
  const texto = userInput.value.trim();

  if (texto === "") return;

  agregarMensaje(texto, "user");
  userInput.value = "";

  setTimeout(() => {
    const respuesta = generarRespuesta(texto);

    if (respuesta) {
      agregarMensaje(respuesta, "bot");
    }
  }, 400);
}

function agregarMensaje(texto, tipo) {
  const mensaje = document.createElement("div");
  mensaje.classList.add("message", tipo);
  mensaje.textContent = texto;

  chatBox.appendChild(mensaje);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function agregarMensajeConImagen(texto, imagen, tipo) {
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
      placeholder.textContent = "Imagen no disponible";

      contenedorImagen.appendChild(placeholder);

      console.warn("No se encontró la imagen:", imagen);
    };

    contenedorImagen.appendChild(img);

  } else {
    const placeholder = document.createElement("div");
    placeholder.classList.add("image-placeholder");
    placeholder.textContent = "Sin imagen";

    contenedorImagen.appendChild(placeholder);
  }

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;

  mensaje.appendChild(contenedorImagen);
  mensaje.appendChild(parrafo);

  chatBox.appendChild(mensaje);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function generarRespuesta(texto) {
  const mensaje = limpiarTexto(texto);

  if (!vocabularioCargado) {
    return "Todavía no tengo el vocabulario cargado. Revisa el archivo JSON.";
  }

  if (modoPractica && palabraActual) {
    return revisarRespuesta(mensaje);
  }

  if (
    mensaje.includes("me llamo") ||
    mensaje.includes("mi nombre es") ||
    mensaje.startsWith("soy ")
  ) {
    const nombre = extraerNombre(texto);

    if (nombre !== "") {
      memoria.estudiante.nombre = nombre;
      guardarMemoria();

      return `Mucho gusto, ${nombre}. Vamos a aprender vocabulario de primaria.`;
    }
  }

  if (
    mensaje.includes("hola") ||
    mensaje.includes("buenas")
  ) {
    if (memoria.estudiante.nombre) {
      return `Hola, ${memoria.estudiante.nombre}. ¿Qué quieres practicar hoy? Puedes escribir: ${categoriasDisponibles.join(", ")}.`;
    }

    return "Hola. Soy tu bot de vocabulario. ¿Cómo te llamas?";
  }

  if (
    mensaje.includes("puntos") ||
    mensaje.includes("puntaje")
  ) {
    return `Tienes ${memoria.estudiante.puntos} puntos. Palabras aprendidas: ${memoria.estudiante.palabrasAprendidas.length}.`;
  }

  if (
    mensaje.includes("que aprendi") ||
    mensaje.includes("que he aprendido") ||
    mensaje.includes("palabras aprendidas")
  ) {
    return mostrarPalabrasAprendidas();
  }

  if (
    mensaje.includes("errores") ||
    mensaje.includes("repasar")
  ) {
    return mostrarErrores();
  }

  if (
    mensaje.includes("salir") ||
    mensaje.includes("terminar")
  ) {
    modoPractica = false;
    palabraActual = null;
    categoriaActual = "";

    return "Muy bien. Terminamos la práctica. Puedes escribir otra categoría.";
  }

  if (
    mensaje.includes("categorias") ||
    mensaje.includes("categorías") ||
    mensaje.includes("opciones")
  ) {
    return "Categorías disponibles: " + categoriasDisponibles.join(", ") + ".";
  }

  const categoriaDetectada = detectarCategoria(mensaje);

  if (categoriaDetectada) {
    return iniciarPractica(categoriaDetectada);
  }

  return "Puedes escribir una categoría para practicar: " + categoriasDisponibles.join(", ") + ".";
}

function detectarCategoria(mensaje) {
  for (const categoria of categoriasDisponibles) {
    const categoriaLimpia = limpiarTexto(categoria);

    if (
      mensaje.includes(categoriaLimpia) ||
      categoriaLimpia.includes(mensaje)
    ) {
      return categoria;
    }
  }

  return null;
}

function iniciarPractica(categoria) {
  if (!vocabularioPrimaria[categoria] || vocabularioPrimaria[categoria].length === 0) {
    return `La categoría "${categoria}" no tiene palabras disponibles.`;
  }

  categoriaActual = categoria;
  modoPractica = true;

  palabraActual = obtenerPalabraAleatoria(categoriaActual);

  setTimeout(() => {
    mostrarPreguntaActual();
  }, 350);

  return `Vamos a practicar ${categoria}. Mira la imagen y responde.`;
}

function mostrarPreguntaActual() {
  if (!palabraActual) return;

  agregarMensajeConImagen(
    `¿Cómo se dice "${palabraActual.espanol}" en inglés?`,
    palabraActual.imagen,
    "bot"
  );
}

function revisarRespuesta(respuestaUsuario) {
  const respuestaCorrecta = limpiarTexto(palabraActual.ingles);

  if (respuestaUsuario === respuestaCorrecta) {
    memoria.estudiante.puntos += 10;
    guardarPalabraAprendida(palabraActual);

    palabraActual = obtenerPalabraAleatoria(categoriaActual);
    guardarMemoria();

    setTimeout(() => {
      mostrarPreguntaActual();
    }, 600);

    return "Excelente. Ganaste 10 puntos. Vamos con otra palabra.";
  }

  memoria.estudiante.errores.push({
    espanol: palabraActual.espanol,
    ingles: palabraActual.ingles,
    imagen: palabraActual.imagen || "",
    respuestaUsuario: respuestaUsuario
  });

  guardarMemoria();

  setTimeout(() => {
    mostrarPreguntaActual();
  }, 700);

  return `Casi. La respuesta correcta es "${palabraActual.ingles}". Repite conmigo: ${palabraActual.ingles}.`;
}

function obtenerPalabraAleatoria(categoria) {
  const lista = vocabularioPrimaria[categoria];
  const indice = Math.floor(Math.random() * lista.length);
  return lista[indice];
}

function guardarPalabraAprendida(palabra) {
  const existe = memoria.estudiante.palabrasAprendidas.some(item => {
    return item.id === palabra.id;
  });

  if (!existe) {
    memoria.estudiante.palabrasAprendidas.push({
      id: palabra.id,
      espanol: palabra.espanol,
      ingles: palabra.ingles,
      imagen: palabra.imagen || "",
      categoria: categoriaActual
    });
  }
}

function mostrarPalabrasAprendidas() {
  if (memoria.estudiante.palabrasAprendidas.length === 0) {
    return "Todavía no tienes palabras aprendidas. Vamos a practicar.";
  }

  let respuesta = "Estas son tus palabras aprendidas:\n";

  memoria.estudiante.palabrasAprendidas.forEach((palabra, index) => {
    respuesta += `${index + 1}. ${palabra.espanol} = ${palabra.ingles}\n`;
  });

  return respuesta;
}

function mostrarErrores() {
  if (memoria.estudiante.errores.length === 0) {
    return "Muy bien. No tienes errores guardados.";
  }

  let respuesta = "Estas palabras debes repasar:\n";

  memoria.estudiante.errores.forEach((error, index) => {
    respuesta += `${index + 1}. ${error.espanol} = ${error.ingles}\n`;
  });

  return respuesta;
}

function cargarMemoria() {
  const memoriaGuardada = localStorage.getItem("memoriaBotPrimariaVisual");

  if (memoriaGuardada) {
    try {
      return JSON.parse(memoriaGuardada);
    } catch (error) {
      console.warn("La memoria estaba dañada. Se creó una nueva memoria.");
    }
  }

  return {
    estudiante: {
      nombre: "",
      grado: "",
      puntos: 0,
      palabrasAprendidas: [],
      errores: []
    }
  };
}

function guardarMemoria() {
  localStorage.setItem("memoriaBotPrimariaVisual", JSON.stringify(memoria));
}

function limpiarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, "")
    .trim();
}

function extraerNombre(texto) {
  let nombre = texto
    .replace(/me llamo/gi, "")
    .replace(/mi nombre es/gi, "")
    .replace(/soy/gi, "")
    .trim();

  if (nombre.length > 0) {
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  return nombre;
}
