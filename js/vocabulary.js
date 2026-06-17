async function cargarVocabulario(mostrarMensaje = true) {
  try {
    BotState.vocabularioCargado = false;
    BotState.vocabulario = {};
    BotState.categoriasDisponibles = [];

    const respuesta = await fetch(CONFIG.VOCABULARIO_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el vocabulario.");
    }

    const datos = await respuesta.json();

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      throw new Error("El vocabulario no tiene un formato válido.");
    }

    BotState.vocabulario = normalizarVocabulario(datos);
    BotState.categoriasDisponibles = Object.keys(BotState.vocabulario);
    BotState.vocabularioCargado = true;

    if (BotState.categoriasDisponibles.length === 0) {
      throw new Error("El vocabulario no contiene categorías válidas.");
    }

    if (mostrarMensaje) {
      agregarMensaje(
        "Vocabulario cargado correctamente.\n\n" + obtenerCategoriasNumeradasComoTexto(),
        "bot",
        false
      );
    }

  } catch (error) {
    BotState.vocabularioCargado = false;
    BotState.vocabulario = {};
    BotState.categoriasDisponibles = [];

    agregarMensaje(
      CONFIG.MENSAJES.ERROR_VOCABULARIO,
      "bot",
      false
    );

    console.error("Error cargando vocabulario:", error);
  }
}

/*
  Limpia el vocabulario cargado:
  - conserva solo categorías que tengan listas
  - elimina palabras inválidas
  - asegura campos básicos
*/
function normalizarVocabulario(datos) {
  const vocabularioLimpio = {};

  Object.keys(datos).forEach(categoria => {
    const lista = datos[categoria];

    if (!Array.isArray(lista)) {
      return;
    }

    const palabrasValidas = lista
      .filter(palabra => {
        return (
          palabra &&
          typeof palabra === "object" &&
          palabra.espanol &&
          palabra.ingles
        );
      })
      .map((palabra, index) => {
        return {
          id: palabra.id !== undefined ? palabra.id : `${categoria}_${index + 1}`,
          espanol: String(palabra.espanol).trim(),
          ingles: String(palabra.ingles).trim(),
          imagen: palabra.imagen || "",
          grado: palabra.grado || "",
          pista: palabra.pista || "",
          completar: palabra.completar || "",
          respuestaCompletar: palabra.respuestaCompletar || ""
        };
      });

    if (palabrasValidas.length > 0) {
      vocabularioLimpio[categoria] = palabrasValidas;
    }
  });

  return vocabularioLimpio;
}

function detectarCategoria(texto) {
  const mensaje = limpiarTexto(texto);

  if (!mensaje) {
    return null;
  }

  /*
    Permite escoger categoría escribiendo el número exacto.
    Ejemplo:
    1 = animales
    2 = colores
  */
  if (/^\d+$/.test(mensaje)) {
    const numero = Number(mensaje);
    const indice = numero - 1;

    if (BotState.categoriasDisponibles[indice]) {
      return BotState.categoriasDisponibles[indice];
    }
  }

  /*
    Permite escoger categoría escribiendo el nombre.
    Ejemplo:
    animales
    animal
    colores
  */
  for (const categoria of BotState.categoriasDisponibles) {
    const categoriaLimpia = limpiarTexto(categoria);

    if (
      mensaje === categoriaLimpia ||
      mensaje.includes(categoriaLimpia) ||
      categoriaLimpia.includes(mensaje)
    ) {
      return categoria;
    }
  }

  return null;
}

/*
  Ronda simple de respaldo.

  El sistema principal recomendado es prepararRondaInteligente()
  desde learning.js. Esta función queda como respaldo si el sistema
  inteligente no está disponible.
*/
function prepararRonda(categoria) {
  const lista = obtenerTodasLasPalabrasDeCategoria(categoria);

  BotState.rondaActual = mezclarArray(lista);

  BotState.indiceRonda = 0;

  BotState.ronda = {
    correctas: 0,
    incorrectas: 0,
    total: BotState.rondaActual.length
  };
}

function obtenerSiguientePalabra() {
  if (!Array.isArray(BotState.rondaActual)) {
    BotState.rondaActual = [];
  }

  if (BotState.indiceRonda >= BotState.rondaActual.length) {
    return null;
  }

  const palabra = BotState.rondaActual[BotState.indiceRonda];

  BotState.indiceRonda++;

  return palabra || null;
}

function obtenerTodasLasPalabrasDeCategoria(categoria) {
  if (!categoria) {
    return [];
  }

  const lista = BotState.vocabulario[categoria];

  if (!Array.isArray(lista)) {
    return [];
  }

  return lista;
}

function buscarPalabraPorId(id) {
  const idBuscado = String(id);

  for (const categoria in BotState.vocabulario) {
    const lista = BotState.vocabulario[categoria];

    if (!Array.isArray(lista)) {
      continue;
    }

    const palabra = lista.find(item => {
      return String(item.id) === idBuscado;
    });

    if (palabra) {
      return palabra;
    }
  }

  return null;
}

function obtenerCategoriasComoTexto() {
  if (!Array.isArray(BotState.categoriasDisponibles)) {
    return "No hay categorías disponibles.";
  }

  if (BotState.categoriasDisponibles.length === 0) {
    return "No hay categorías disponibles.";
  }

  return BotState.categoriasDisponibles.join(", ");
}

function obtenerCategoriasNumeradasComoTexto() {
  if (!Array.isArray(BotState.categoriasDisponibles)) {
    return "No hay categorías disponibles.";
  }

  if (BotState.categoriasDisponibles.length === 0) {
    return "No hay categorías disponibles.";
  }

  let texto = "Selecciona una categoría escribiendo el número:\n\n";

  BotState.categoriasDisponibles.forEach((categoria, index) => {
    texto += `${index + 1}. ${categoria}\n`;
  });

  return texto.trim();
}