const BotState = {
  // Estado actual del bot:
  // esperando_categoria | esperando_nivel | practicando
  estado: CONFIG.ESTADOS.ESPERANDO_CATEGORIA,

  // Categoría seleccionada por el estudiante
  categoriaActual: "",

  // Nivel seleccionado por el estudiante
  nivelActual: null,

  // Palabra que se está preguntando actualmente
  palabraActual: null,

  // Vocabulario cargado desde data/vocabulario.json
  vocabulario: {},

  // Lista de categorías disponibles en el JSON
  categoriasDisponibles: [],

  // Indica si el vocabulario ya fue cargado correctamente
  vocabularioCargado: false,

  // Diccionario cargado desde data/dictionary.json
  dictionary: {},

  // Indica si el diccionario ya fue cargado correctamente
  dictionaryCargado: false,

  // Ronda actual sin repetir palabras
  rondaActual: [],

  // Posición actual dentro de la ronda
  indiceRonda: 0,

  // Estadísticas temporales solo de la ronda actual
  ronda: {
    correctas: 0,
    incorrectas: 0,
    total: 0
  }
};