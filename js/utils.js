function limpiarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:]/g, "")
    .trim();
}

function extraerNombre(texto) {
  let nombre = String(texto || "")
    .replace(/me llamo/gi, "")
    .replace(/mi nombre es/gi, "")
    .replace(/soy/gi, "")
    .trim();

  if (nombre.length > 0) {
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  return nombre;
}

function mezclarArray(array) {
  const copia = [...array];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temporal = copia[i];
    copia[i] = copia[j];
    copia[j] = temporal;
  }

  return copia;
}

function obtenerNumeroNivel(texto) {
  const limpio = limpiarTexto(texto);

  if (limpio.includes("1")) return 1;
  if (limpio.includes("2")) return 2;
  if (limpio.includes("3")) return 3;
  if (limpio.includes("5")) return 5;

  return null;
}

function capitalizar(texto) {
  texto = String(texto || "");

  if (texto.length === 0) return "";

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function contienePalabra(texto, palabra) {
  const textoLimpio = limpiarTexto(texto);
  const palabraLimpia = limpiarTexto(palabra);

  return textoLimpio.includes(palabraLimpia);
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function escaparHTML(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function crearPalabraIncompleta(palabra) {
  palabra = String(palabra || "");

  if (palabra.length <= 2) {
    return {
      incompleta: palabra,
      respuesta: ""
    };
  }

  const letras = palabra.split("");

  let posicion = 1;

  if (palabra.length > 3) {
    posicion = Math.floor(palabra.length / 2);
  }

  const letraOculta = letras[posicion];
  letras[posicion] = "_";

  return {
    incompleta: letras.join(""),
    respuesta: letraOculta
  };
}

function obtenerPistaPalabra(palabra) {
  palabra = String(palabra || "");

  if (palabra.length === 0) {
    return "Piensa en la palabra correcta.";
  }

  return `Empieza con "${palabra.charAt(0)}" y tiene ${palabra.length} letras.`;
}