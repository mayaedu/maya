/*
  learning.js

  Sistema de aprendizaje del bot.

  Este archivo permite que la app aprenda del estudiante:
  - qué palabras acierta
  - qué palabras falla
  - cuáles son difíciles
  - cuáles ya domina
  - qué palabras debe practicar primero

  Usa Memoria y localStorage mediante guardarMemoria().
*/

function prepararAprendizaje() {
  if (!Memoria.aprendizaje) {
    Memoria.aprendizaje = {
      palabras: {},
      palabrasDificiles: [],
      ultimaRecomendacion: ""
    };
  }

  if (!Memoria.aprendizaje.palabras) {
    Memoria.aprendizaje.palabras = {};
  }

  if (!Array.isArray(Memoria.aprendizaje.palabrasDificiles)) {
    Memoria.aprendizaje.palabrasDificiles = [];
  }

  if (!Memoria.aprendizaje.ultimaRecomendacion) {
    Memoria.aprendizaje.ultimaRecomendacion = "";
  }
}

/*
  Registra cuando el estudiante acierta una palabra.
*/
function registrarAprendizajeCorrecto(palabra) {
  prepararAprendizaje();

  if (!palabra || !palabra.ingles) return;

  const clave = obtenerClavePalabra(palabra);

  if (!Memoria.aprendizaje.palabras[clave]) {
    Memoria.aprendizaje.palabras[clave] = crearRegistroPalabra(palabra);
  }

  const registro = Memoria.aprendizaje.palabras[clave];

  registro.correctas++;
  registro.intentos++;
  registro.rachaCorrectas++;
  registro.rachaIncorrectas = 0;
  registro.ultimaPractica = obtenerFechaActualISO();

  actualizarEstadoPalabra(registro);
  actualizarPalabrasDificiles();

  guardarMemoria();
}

/*
  Registra cuando el estudiante falla una palabra.
*/
function registrarAprendizajeIncorrecto(palabra) {
  prepararAprendizaje();

  if (!palabra || !palabra.ingles) return;

  const clave = obtenerClavePalabra(palabra);

  if (!Memoria.aprendizaje.palabras[clave]) {
    Memoria.aprendizaje.palabras[clave] = crearRegistroPalabra(palabra);
  }

  const registro = Memoria.aprendizaje.palabras[clave];

  registro.incorrectas++;
  registro.intentos++;
  registro.rachaIncorrectas++;
  registro.rachaCorrectas = 0;
  registro.ultimaPractica = obtenerFechaActualISO();

  actualizarEstadoPalabra(registro);
  actualizarPalabrasDificiles();

  guardarMemoria();
}

/*
  Crea el registro inicial de una palabra.
*/
function crearRegistroPalabra(palabra) {
  return {
    id: palabra.id,
    espanol: palabra.espanol,
    ingles: palabra.ingles,
    imagen: palabra.imagen || "",
    categoria: BotState.categoriaActual || "",
    grado: palabra.grado || "",

    correctas: 0,
    incorrectas: 0,
    intentos: 0,

    rachaCorrectas: 0,
    rachaIncorrectas: 0,

    dominio: 0,
    estado: "nueva",

    primeraPractica: obtenerFechaActualISO(),
    ultimaPractica: null
  };
}

/*
  Clave única para guardar la palabra.
*/
function obtenerClavePalabra(palabra) {
  const categoria = BotState.categoriaActual || "general";
  return categoria + "_" + limpiarTexto(palabra.ingles);
}

/*
  Calcula si una palabra está:
  - nueva
  - dificil
  - en_proceso
  - aprendida
*/
function actualizarEstadoPalabra(registro) {
  if (!registro || registro.intentos === 0) {
    registro.dominio = 0;
    registro.estado = "nueva";
    return;
  }

  const porcentaje = Math.round((registro.correctas / registro.intentos) * 100);
  registro.dominio = porcentaje;

  /*
    Palabra difícil:
    - falló 2 o más veces
    - o tiene racha de errores
    - o su dominio es menor a 50%
  */
  if (
    registro.incorrectas >= 2 &&
    porcentaje < 70
  ) {
    registro.estado = "dificil";
    return;
  }

  if (registro.rachaIncorrectas >= 2) {
    registro.estado = "dificil";
    return;
  }

  /*
    Palabra aprendida:
    - tiene al menos 3 aciertos
    - tiene 80% o más de dominio
    - lleva 2 aciertos seguidos
  */
  if (
    registro.correctas >= 3 &&
    porcentaje >= 80 &&
    registro.rachaCorrectas >= 2
  ) {
    registro.estado = "aprendida";
    return;
  }

  /*
    En proceso:
    - todavía no está dominada
    - pero va mejorando
  */
  if (porcentaje >= 50) {
    registro.estado = "en_proceso";
    return;
  }

  registro.estado = "dificil";
}

/*
  Actualiza la lista general de palabras difíciles.
*/
function actualizarPalabrasDificiles() {
  prepararAprendizaje();

  const palabras = Object.values(Memoria.aprendizaje.palabras);

  Memoria.aprendizaje.palabrasDificiles = palabras
    .filter(item => item.estado === "dificil")
    .sort((a, b) => {
      if (b.incorrectas !== a.incorrectas) {
        return b.incorrectas - a.incorrectas;
      }

      return a.dominio - b.dominio;
    })
    .slice(0, 20);
}

/*
  Devuelve todas las palabras difíciles.
*/
function obtenerPalabrasDificiles() {
  prepararAprendizaje();

  return Memoria.aprendizaje.palabrasDificiles || [];
}

/*
  Devuelve palabras difíciles de una categoría específica.
*/
function obtenerPalabrasDificilesPorCategoria(categoria) {
  prepararAprendizaje();

  const categoriaLimpia = limpiarTexto(categoria);

  return Memoria.aprendizaje.palabrasDificiles.filter(item => {
    return limpiarTexto(item.categoria) === categoriaLimpia;
  });
}

/*
  Devuelve las palabras que el estudiante ya aprendió.
*/
function obtenerPalabrasAprendidas() {
  prepararAprendizaje();

  const palabras = Object.values(Memoria.aprendizaje.palabras);

  return palabras.filter(item => item.estado === "aprendida");
}

/*
  Devuelve las palabras en proceso.
*/
function obtenerPalabrasEnProceso() {
  prepararAprendizaje();

  const palabras = Object.values(Memoria.aprendizaje.palabras);

  return palabras.filter(item => item.estado === "en_proceso");
}

/*
  Esta función convierte los registros de aprendizaje
  en palabras reales del vocabulario.

  Esto es importante porque las palabras difíciles guardadas
  en memoria no siempre tienen todos los datos actualizados.
*/
function convertirRegistrosAPalabrasDeVocabulario(registros, categoria) {
  const listaCategoria = BotState.vocabulario[categoria] || [];

  return registros
    .map(registro => {
      return listaCategoria.find(item => {
        return limpiarTexto(item.ingles) === limpiarTexto(registro.ingles);
      });
    })
    .filter(item => item);
}

/*
  Prepara una ronda inteligente:
  primero pregunta las palabras difíciles y luego las demás.
*/
function prepararRondaInteligente(categoria) {
  const listaNormal = BotState.vocabulario[categoria] || [];

  const dificilesRegistradas = obtenerPalabrasDificilesPorCategoria(categoria);
  const palabrasDificiles = convertirRegistrosAPalabrasDeVocabulario(
    dificilesRegistradas,
    categoria
  );

  const idsDificiles = new Set(
    palabrasDificiles.map(item => item.id)
  );

  const palabrasNormales = listaNormal.filter(item => {
    return !idsDificiles.has(item.id);
  });

  BotState.rondaActual = [
    ...mezclarArray(palabrasDificiles),
    ...mezclarArray(palabrasNormales)
  ];

  BotState.indiceRonda = 0;

  BotState.ronda = {
    correctas: 0,
    incorrectas: 0,
    total: BotState.rondaActual.length
  };
}

/*
  Devuelve una recomendación para mostrar al terminar la ronda.
*/
function obtenerRecomendacionAprendizaje() {
  prepararAprendizaje();

  const resumen = obtenerResumenAprendizaje();
  const dificiles = obtenerPalabrasDificilesPorCategoria(BotState.categoriaActual);

  if (dificiles.length === 0) {
    const mensaje =
      "Muy bien. No tienes palabras difíciles en esta categoría por ahora.";

    Memoria.aprendizaje.ultimaRecomendacion = mensaje;
    guardarMemoria();

    return mensaje;
  }

  const primeras = dificiles.slice(0, 5);

  const lista = primeras
    .map(item => {
      return `- ${item.espanol} = ${item.ingles} (${item.incorrectas} error(es))`;
    })
    .join("\n");

  const recomendacion =
    "Te recomiendo repasar primero:\n" +
    lista +
    "\n\nResumen de aprendizaje:\n" +
    `Palabras practicadas: ${resumen.total}\n` +
    `Aprendidas: ${resumen.aprendidas}\n` +
    `En proceso: ${resumen.enProceso}\n` +
    `Difíciles: ${resumen.dificiles}`;

  Memoria.aprendizaje.ultimaRecomendacion = recomendacion;

  guardarMemoria();

  return recomendacion;
}

/*
  Devuelve resumen general del aprendizaje.
*/
function obtenerResumenAprendizaje() {
  prepararAprendizaje();

  const palabras = Object.values(Memoria.aprendizaje.palabras);

  const total = palabras.length;
  const aprendidas = palabras.filter(item => item.estado === "aprendida").length;
  const enProceso = palabras.filter(item => item.estado === "en_proceso").length;
  const dificiles = palabras.filter(item => item.estado === "dificil").length;
  const nuevas = palabras.filter(item => item.estado === "nueva").length;

  return {
    total,
    aprendidas,
    enProceso,
    dificiles,
    nuevas
  };
}

/*
  Devuelve un texto bonito del resumen.
*/
function obtenerResumenAprendizajeTexto() {
  const resumen = obtenerResumenAprendizaje();

  return (
    "Resumen de aprendizaje:\n" +
    `Palabras practicadas: ${resumen.total}\n` +
    `Palabras aprendidas: ${resumen.aprendidas}\n` +
    `Palabras en proceso: ${resumen.enProceso}\n` +
    `Palabras difíciles: ${resumen.dificiles}`
  );
}

/*
  Reinicia solo el aprendizaje.
*/
function reiniciarAprendizaje() {
  Memoria.aprendizaje = {
    palabras: {},
    palabrasDificiles: [],
    ultimaRecomendacion: ""
  };

  guardarMemoria();
}

/*
  Utilidad para obtener fecha actual.
*/
function obtenerFechaActualISO() {
  return new Date().toISOString();
}