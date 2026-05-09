let DictionaryIndex = {
  articles: new Set(),
  pronouns: new Set(),
  nouns: new Set(),
  verbsBe: new Set(),
  verbsAction: new Set(),
  modals: new Set(),
  adjectives: new Set(),
  blockedSpanishWords: new Set()
};

async function cargarDictionary() {
  try {
    const respuesta = await fetch(CONFIG.DICTIONARY_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el diccionario.");
    }

    BotState.dictionary = await respuesta.json();
    BotState.dictionaryCargado = true;

    prepararDictionaryIndex();

    console.log("Diccionario cargado correctamente:", BotState.dictionary);
    console.log("Índice del diccionario preparado:", DictionaryIndex);

  } catch (error) {
    BotState.dictionaryCargado = false;

    agregarMensaje(
      CONFIG.MENSAJES.ERROR_DICCIONARIO,
      "bot",
      false
    );

    console.error("Error cargando dictionary.json:", error);
  }
}

function prepararDictionaryIndex() {
  DictionaryIndex.articles = crearSetLimpio(BotState.dictionary.articles);
  DictionaryIndex.pronouns = crearSetLimpio(BotState.dictionary.pronouns);
  DictionaryIndex.nouns = crearSetLimpio(BotState.dictionary.nouns);
  DictionaryIndex.verbsBe = crearSetLimpio(BotState.dictionary.verbsBe);
  DictionaryIndex.verbsAction = crearSetLimpio(BotState.dictionary.verbsAction);
  DictionaryIndex.modals = crearSetLimpio(BotState.dictionary.modals);
  DictionaryIndex.adjectives = crearSetLimpio(BotState.dictionary.adjectives);
  DictionaryIndex.blockedSpanishWords = crearSetLimpio(BotState.dictionary.blockedSpanishWords);

  agregarNounsDesdeVocabulario();
}

function crearSetLimpio(lista) {
  if (!Array.isArray(lista)) {
    return new Set();
  }

  return new Set(
    lista
      .filter(item => item !== null && item !== undefined)
      .map(item => limpiarTexto(String(item)))
      .filter(item => item.length > 0)
  );
}

function agregarNounsDesdeVocabulario() {
  if (!BotState.vocabulario || typeof BotState.vocabulario !== "object") {
    return;
  }

  Object.keys(BotState.vocabulario).forEach(categoria => {
    const lista = BotState.vocabulario[categoria];

    if (!Array.isArray(lista)) return;

    lista.forEach(item => {
      if (item.ingles) {
        DictionaryIndex.nouns.add(limpiarTexto(item.ingles));
      }
    });
  });
}

function esArticle(palabra) {
  return DictionaryIndex.articles.has(limpiarTexto(palabra));
}

function esPronoun(palabra) {
  return DictionaryIndex.pronouns.has(limpiarTexto(palabra));
}

function esNoun(palabra) {
  return DictionaryIndex.nouns.has(limpiarTexto(palabra));
}

function esVerbBe(palabra) {
  return DictionaryIndex.verbsBe.has(limpiarTexto(palabra));
}

function esVerbAction(palabra) {
  return DictionaryIndex.verbsAction.has(limpiarTexto(palabra));
}

function esModal(palabra) {
  return DictionaryIndex.modals.has(limpiarTexto(palabra));
}

function esAdjective(palabra) {
  return DictionaryIndex.adjectives.has(limpiarTexto(palabra));
}

function tienePalabrasBloqueadas(palabras) {
  return palabras.some(palabra => {
    return DictionaryIndex.blockedSpanishWords.has(limpiarTexto(palabra));
  });
}