const CONFIG = {
  // Archivos de datos
  VOCABULARIO_URL: "data/vocabulario.json",
  DICTIONARY_URL: "data/dictionary.json",

  // Memoria del estudiante
  STORAGE_KEY: "memoriaBotPrimariaVisual",

  // Historial del chat
  CHAT_HISTORY_KEY: "historialChatBotPrimaria",

  // Cada acierto vale 1 punto
  PUNTOS_POR_RESPUESTA: 1,

  // Scroll infinito del chat
  CANTIDAD_MENSAJES_INICIALES: 12,
  CANTIDAD_MENSAJES_POR_CARGA: 8,

  // Niveles disponibles
  NIVELES_PERMITIDOS: [1, 2, 3, 5],

  // Materias disponibles
  MATERIAS: {
    INGLES: "ingles",
    MATEMATICAS: "matematicas"
  },

  // Estados internos del bot
  ESTADOS: {
    ESPERANDO_MATERIA: "esperando_materia",
    ESPERANDO_CATEGORIA: "esperando_categoria",
    ESPERANDO_NIVEL: "esperando_nivel",
    ESPERANDO_REINTENTO: "esperando_reintento",
    PRACTICANDO: "practicando"
  },

  // Mensajes generales
  MENSAJES: {
    BIENVENIDA: "Hola, soy Maya, tu amigo de aprendizaje.\n\n¿Qué te gustaría aprender?",
    ERROR_VOCABULARIO: "No pude cargar el vocabulario. Revisa el archivo data/vocabulario.json.",
    ERROR_DICCIONARIO: "No pude cargar el diccionario. Revisa el archivo data/dictionary.json.",
    IMAGEN_NO_DISPONIBLE: "Imagen no disponible",
    SIN_IMAGEN: "Sin imagen"
  }
};