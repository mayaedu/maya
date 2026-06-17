let HistorialChat = cargarHistorialChat();
let indiceHistorialVisible = 0;
let cargandoHistorial = false;

function cargarHistorialChat() {
  const guardado = localStorage.getItem(CONFIG.CHAT_HISTORY_KEY);

  if (!guardado) {
    return [];
  }

  try {
    const historial = JSON.parse(guardado);

    if (!Array.isArray(historial)) {
      return [];
    }

    return historial;

  } catch (error) {
    console.warn("El historial del chat estaba dañado.");
    return [];
  }
}

function guardarHistorialChat() {
  localStorage.setItem(
    CONFIG.CHAT_HISTORY_KEY,
    JSON.stringify(HistorialChat)
  );
}

function guardarMensajeEnHistorial(texto, tipo, datosExtra = {}) {
  HistorialChat.push({
    texto: texto,
    tipo: tipo,
    fecha: new Date().toISOString(),
    ...datosExtra
  });

  limitarHistorialChat();

  guardarHistorialChat();
}

/*
  Limita la cantidad de mensajes guardados.
  Esto evita que localStorage crezca demasiado
  y ayuda al rendimiento en Android.
*/
function limitarHistorialChat() {
  const maximo = CONFIG.MAX_MENSAJES_HISTORIAL || 150;

  if (HistorialChat.length <= maximo) {
    return;
  }

  HistorialChat = HistorialChat.slice(-maximo);

  indiceHistorialVisible = Math.min(
    indiceHistorialVisible,
    HistorialChat.length
  );
}

function obtenerUltimosMensajes() {
  const total = HistorialChat.length;
  const cantidad = CONFIG.CANTIDAD_MENSAJES_INICIALES;

  indiceHistorialVisible = Math.max(total - cantidad, 0);

  return HistorialChat.slice(indiceHistorialVisible, total);
}

function obtenerMensajesAnteriores() {
  if (indiceHistorialVisible <= 0) {
    return [];
  }

  const fin = indiceHistorialVisible;
  const inicio = Math.max(
    fin - CONFIG.CANTIDAD_MENSAJES_POR_CARGA,
    0
  );

  indiceHistorialVisible = inicio;

  return HistorialChat.slice(inicio, fin);
}

function limpiarHistorialChat() {
  HistorialChat = [];
  indiceHistorialVisible = 0;
  localStorage.removeItem(CONFIG.CHAT_HISTORY_KEY);
}