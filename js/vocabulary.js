async function cargarVocabulario() {
  try {
    const respuesta = await fetch(CONFIG.VOCABULARIO_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el vocabulario.");
    }

    BotState.vocabulario = await respuesta.json();
    BotState.categoriasDisponibles = Object.keys(BotState.vocabulario);
    BotState.vocabularioCargado = true;

    agregarMensaje(
      "Vocabulario cargado correctamente.\n\n" + obtenerCategoriasNumeradasComoTexto(),
      "bot",
      false
    );

  } catch (error) {
    BotState.vocabularioCargado = false;

    agregarMensaje(
      CONFIG.MENSAJES.ERROR_VOCABULARIO,
      "bot",
      false
    );

    console.error("Error cargando vocabulario:", error);
  }
}

function detectarCategoria(texto) {
  const mensaje = limpiarTexto(texto);

  // Permitir seleccionar categoría por número
  const numero = parseInt(mensaje);

  if (!isNaN(numero)) {
    const indice = numero - 1;

    if (BotState.categoriasDisponibles[indice]) {
      return BotState.categoriasDisponibles[indice];
    }
  }

  // Permitir seleccionar categoría por nombre
  for (const categoria of BotState.categoriasDisponibles) {
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

function prepararRonda(categoria) {
  const lista = BotState.vocabulario[categoria] || [];

  BotState.rondaActual = mezclarArray(lista);
  BotState.indiceRonda = 0;

  BotState.ronda = {
    correctas: 0,
    incorrectas: 0,
    total: BotState.rondaActual.length
  };
}

function obtenerSiguientePalabra() {
  if (BotState.indiceRonda >= BotState.rondaActual.length) {
    return null;
  }

  const palabra = BotState.rondaActual[BotState.indiceRonda];
  BotState.indiceRonda++;

  return palabra;
}

function obtenerTodasLasPalabrasDeCategoria(categoria) {
  return BotState.vocabulario[categoria] || [];
}

function buscarPalabraPorId(id) {
  for (const categoria in BotState.vocabulario) {
    const palabra = BotState.vocabulario[categoria].find(item => item.id === id);

    if (palabra) {
      return palabra;
    }
  }

  return null;
}

function obtenerCategoriasComoTexto() {
  if (BotState.categoriasDisponibles.length === 0) {
    return "No hay categorías disponibles.";
  }

  return BotState.categoriasDisponibles.join(", ");
}

function obtenerCategoriasNumeradasComoTexto() {
  if (BotState.categoriasDisponibles.length === 0) {
    return "No hay categorías disponibles.";
  }

  let texto = "Selecciona una categoría escribiendo el número:\n\n";

  BotState.categoriasDisponibles.forEach((categoria, index) => {
    texto += `${index + 1}. ${categoria}\n`;
  });

  return texto.trim();
}