let audioContext = null;
let soundEnabled = true;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function createOscillatorSound({
  type = "sine",
  startFrequency = 440,
  endFrequency = 220,
  duration = 0.3,
  volume = 0.2
}) {
  if (!soundEnabled) return;
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(startFrequency, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, endFrequency),
    audioContext.currentTime + duration
  );

  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

/* =========================
   SONIDO DE DESPEGUE
========================= */

function playLaunchSound() {
  initAudio();

  createOscillatorSound({
    type: "sawtooth",
    startFrequency: 180,
    endFrequency: 900,
    duration: 0.28,
    volume: 0.16
  });

  setTimeout(() => {
    createOscillatorSound({
      type: "triangle",
      startFrequency: 500,
      endFrequency: 1200,
      duration: 0.18,
      volume: 0.08
    });
  }, 45);
}

/* =========================
   SONIDO DE BLOQUEO / ERROR
========================= */

function playBlockedSound() {
  initAudio();

  createOscillatorSound({
    type: "square",
    startFrequency: 180,
    endFrequency: 90,
    duration: 0.18,
    volume: 0.12
  });
}

/* =========================
   SONIDO DE MISIÓN COMPLETADA
========================= */

function playWinSound() {
  initAudio();

  const notes = [
    { frequency: 440, delay: 0 },
    { frequency: 660, delay: 120 },
    { frequency: 880, delay: 240 },
    { frequency: 1320, delay: 380 }
  ];

  notes.forEach(note => {
    setTimeout(() => {
      createOscillatorSound({
        type: "triangle",
        startFrequency: note.frequency,
        endFrequency: note.frequency * 1.2,
        duration: 0.22,
        volume: 0.13
      });
    }, note.delay);
  });
}

/* =========================
   ACTIVAR / DESACTIVAR SONIDO
========================= */

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem("galaxy_escape_sound", soundEnabled ? "on" : "off");

  return soundEnabled;
}

function loadSoundSetting() {
  const saved = localStorage.getItem("galaxy_escape_sound");

  if (saved === "off") {
    soundEnabled = false;
  } else {
    soundEnabled = true;
  }

  return soundEnabled;
}

function isSoundEnabled() {
  return soundEnabled;
}