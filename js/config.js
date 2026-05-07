const CONFIG = {
  VOCABULARIO_URL: "data/vocabulario.json",
  DICTIONARY_URL: "data/dictionary.json",

  STORAGE_KEY: "memoriaBotPrimariaVisual",
  CHAT_HISTORY_KEY: "historialChatBotPrimaria",

  PUNTOS_POR_RESPUESTA: 10,

  CANTIDAD_MENSAJES_INICIALES: 12,
  CANTIDAD_MENSAJES_POR_CARGA: 8,

  NIVELES_PERMITIDOS: [1, 2, 3, 5],

  ESTADOS: {
    ESPERANDO_CATEGORIA: "esperando_categoria",
    ESPERANDO_NIVEL: "esperando_nivel",
    PRACTICANDO: "practicando"
  },

  MENSAJES: {
    BIENVENIDA: "Hola. Soy tu bot de vocabulario de primaria. Cargando vocabulario...",
    ERROR_VOCABULARIO: "No pude cargar el vocabulario. Revisa el archivo data/vocabulario.json.",
    ERROR_DICCIONARIO: "No pude cargar el diccionario. Revisa el archivo data/dictionary.json.",
    IMAGEN_NO_DISPONIBLE: "Imagen no disponible",
    SIN_IMAGEN: "Sin imagen"
  }
};