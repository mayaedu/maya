let HistorialChat = cargarHistorialChat();
let indiceHistorialVisible = 0;
let cargandoHistorial = false;

function cargarHistorialChat() {
  const guardado = localStorage.getItem(CONFIG.CHAT_HISTORY_KEY);

  if (!guardado) {
    return [];
  }

  try {
    return JSON.parse(guardado);
  } catch (error) {
    console.warn("El historial del chat estaba dañado.");
    return [];
  }
}

function guardarHistorialChat() {
  localStorage.setItem(CONFIG.CHAT_HISTORY_KEY, JSON.stringify(HistorialChat));
}

function guardarMensajeEnHistorial(texto, tipo, datosExtra = {}) {
  HistorialChat.push({
    texto: texto,
    tipo: tipo,
    fecha: new Date().toISOString(),
    ...datosExtra
  });

  guardarHistorialChat();
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