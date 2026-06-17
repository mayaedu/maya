/*
  sounds.js

  Sonidos generados con JavaScript.
  No necesita archivos MP3.

  Usa Web Audio API.
*/

const SoundState = {
  activo: true,
  volumen: 0.35,
  contexto: null
};

function obtenerContextoAudio() {
  if (!SoundState.contexto) {
    const AudioContextSeguro = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextSeguro) {
      return null;
    }

    SoundState.contexto = new AudioContextSeguro();
  }

  if (SoundState.contexto.state === "suspended") {
    SoundState.contexto.resume();
  }

  return SoundState.contexto;
}

function reproducirSonido(nombre) {
  if (!SoundState.activo) {
    return;
  }

  const contexto = obtenerContextoAudio();

  if (!contexto) {
    return;
  }

  if (nombre === "click") {
    sonidoClick(contexto);
    return;
  }

  if (nombre === "correct") {
    sonidoCorrecto(contexto);
    return;
  }

  if (nombre === "wrong") {
    sonidoIncorrecto(contexto);
    return;
  }

  if (nombre === "start") {
    sonidoInicio(contexto);
    return;
  }

  if (nombre === "finish") {
    sonidoFinal(contexto);
    return;
  }
}

function crearTono(contexto, frecuencia, duracion, tipo = "sine", volumen = SoundState.volumen) {
  const oscilador = contexto.createOscillator();
  const ganancia = contexto.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frecuencia, contexto.currentTime);

  ganancia.gain.setValueAtTime(0.0001, contexto.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(volumen, contexto.currentTime + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + duracion);

  oscilador.connect(ganancia);
  ganancia.connect(contexto.destination);

  oscilador.start(contexto.currentTime);
  oscilador.stop(contexto.currentTime + duracion + 0.02);
}

function crearTonoProgramado(contexto, frecuencia, inicio, duracion, tipo = "sine", volumen = SoundState.volumen) {
  const oscilador = contexto.createOscillator();
  const ganancia = contexto.createGain();

  const tiempoInicio = contexto.currentTime + inicio;
  const tiempoFin = tiempoInicio + duracion;

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frecuencia, tiempoInicio);

  ganancia.gain.setValueAtTime(0.0001, tiempoInicio);
  ganancia.gain.exponentialRampToValueAtTime(volumen, tiempoInicio + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, tiempoFin);

  oscilador.connect(ganancia);
  ganancia.connect(contexto.destination);

  oscilador.start(tiempoInicio);
  oscilador.stop(tiempoFin + 0.02);
}

/*
  Sonido corto para clic.
*/
function sonidoClick(contexto) {
  crearTono(contexto, 520, 0.06, "triangle", 0.18);
}

/*
  Sonido alegre para respuesta correcta.
*/
function sonidoCorrecto(contexto) {
  crearTonoProgramado(contexto, 660, 0.00, 0.10, "sine", 0.26);
  crearTonoProgramado(contexto, 880, 0.10, 0.12, "sine", 0.28);
  crearTonoProgramado(contexto, 1046, 0.22, 0.16, "sine", 0.25);
}

/*
  Sonido suave para respuesta incorrecta.
*/
function sonidoIncorrecto(contexto) {
  crearTonoProgramado(contexto, 260, 0.00, 0.14, "sawtooth", 0.16);
  crearTonoProgramado(contexto, 190, 0.15, 0.18, "sawtooth", 0.14);
}

/*
  Sonido de inicio de ronda.
*/
function sonidoInicio(contexto) {
  crearTonoProgramado(contexto, 523, 0.00, 0.10, "triangle", 0.22);
  crearTonoProgramado(contexto, 659, 0.10, 0.10, "triangle", 0.22);
  crearTonoProgramado(contexto, 784, 0.20, 0.16, "triangle", 0.22);
}

/*
  Sonido de final de ronda.
*/
function sonidoFinal(contexto) {
  crearTonoProgramado(contexto, 784, 0.00, 0.12, "sine", 0.24);
  crearTonoProgramado(contexto, 988, 0.13, 0.12, "sine", 0.24);
  crearTonoProgramado(contexto, 1175, 0.26, 0.20, "sine", 0.22);
}

function activarSonidos() {
  SoundState.activo = true;
}

function desactivarSonidos() {
  SoundState.activo = false;
}

function alternarSonidos() {
  SoundState.activo = !SoundState.activo;
  return SoundState.activo;
}

function cambiarVolumenSonidos(volumen) {
  SoundState.volumen = Math.max(0, Math.min(1, Number(volumen)));
}