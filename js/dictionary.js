async function cargarDictionary() {
  try {
    const respuesta = await fetch(CONFIG.DICTIONARY_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el diccionario.");
    }

    BotState.dictionary = await respuesta.json();
    BotState.dictionaryCargado = true;

    console.log("Diccionario cargado correctamente:", BotState.dictionary);

  } catch (error) {
    BotState.dictionaryCargado = false;

    agregarMensaje(
      CONFIG.MENSAJES.ERROR_DICCIONARIO,
      "bot"
    );

    console.error("Error cargando dictionary.json:", error);
  }
}

function palabraExisteEnLista(palabra, lista) {
  if (!lista || !Array.isArray(lista)) return false;

  return lista.includes(limpiarTexto(palabra));
}

function esArticle(palabra) {
  return palabraExisteEnLista(palabra, BotState.dictionary.articles);
}

function esPronoun(palabra) {
  return palabraExisteEnLista(palabra, BotState.dictionary.pronouns);
}

function esVerb(palabra) {
  return palabraExisteEnLista(palabra, BotState.dictionary.verbs);
}

function esActionVerb(palabra) {
  return palabraExisteEnLista(palabra, BotState.dictionary.actionVerbs);
}

function esAdjective(palabra) {
  return palabraExisteEnLista(palabra, BotState.dictionary.adjectives);
}

function tienePalabrasBloqueadas(palabras) {
  const bloqueadas = BotState.dictionary.blockedSpanishWords || [];

  return palabras.some(palabra => {
    return bloqueadas.includes(limpiarTexto(palabra));
  });
}