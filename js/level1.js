/*
  level1.js

  Nivel 1:
  El estudiante ve una imagen y una palabra en español.
  Luego escoge la respuesta correcta en inglés entre 3 opciones.

  Ejemplo:
  Bot: ¿Cómo se dice "pato" en inglés?
  Opciones: duck, cow, fish
*/

function mostrarPreguntaNivel1(palabra) {
  const opciones = generarOpcionesNivel1(palabra);

  palabra.opcionesActuales = opciones;

  const opcionesBotones = opciones.map(opcion => {
    return {
      texto: opcion.ingles,
      accion: function() {
        revisarRespuestaNivel(opcion.ingles);
      }
    };
  });

  agregarMensajeConImagenHTML(
    `¿Cómo se dice <strong>"${escaparHTML(palabra.espanol)}"</strong> en inglés?`,
    palabra.imagen,
    "bot"
  );

  setTimeout(() => {
    agregarMensajeConOpciones(
      "Selecciona la respuesta correcta:",
      opcionesBotones,
      "bot"
    );
  }, 300);
}

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