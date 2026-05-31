// ===============================
// PLAYER STORAGE - CONECTA 4
// Maneja jugador local con localStorage
// ===============================

const STORAGE_PLAYER_KEY = "conecta4_player";

// Compatibilidad con versión anterior
const OLD_STORAGE_UID_KEY = "conecta4_uid";
const OLD_STORAGE_NAME_KEY = "conecta4_name";

// ===============================
// VERIFICAR LOCALSTORAGE
// ===============================

function storageAvailable() {
  try {
    const testKey = "__conecta4_test__";
    localStorage.setItem(testKey, "ok");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error("localStorage no disponible:", error);
    return false;
  }
}

// ===============================
// OBTENER JUGADOR GUARDADO
// ===============================

export function getStoredPlayer() {
  if (!storageAvailable()) {
    return null;
  }

  // 1. Leer nueva estructura JSON
  const savedPlayer = localStorage.getItem(STORAGE_PLAYER_KEY);

  if (savedPlayer) {
    try {
      const player = JSON.parse(savedPlayer);

      if (player && player.uid && player.name) {
        return {
          uid: player.uid,
          name: player.name
        };
      }
    } catch (error) {
      console.error("Error leyendo jugador guardado:", error);
      localStorage.removeItem(STORAGE_PLAYER_KEY);
    }
  }

  // 2. Migrar datos viejos si existen
  const oldUid = localStorage.getItem(OLD_STORAGE_UID_KEY);
  const oldName = localStorage.getItem(OLD_STORAGE_NAME_KEY);

  if (oldUid && oldName) {
    const player = {
      uid: oldUid,
      name: oldName
    };

    saveStoredPlayer(player);
    return player;
  }

  return null;
}

// ===============================
// CREAR JUGADOR LOCAL
// ===============================

export function createLocalPlayer(rawName) {
  const cleanName = cleanPlayerName(rawName);

  if (!cleanName || cleanName.length < 3) {
    throw new Error("El nombre debe tener al menos 3 letras.");
  }

  const uid = createPlayerId(cleanName);

  const player = {
    uid,
    name: cleanName
  };

  saveStoredPlayer(player);

  return player;
}

// ===============================
// GUARDAR JUGADOR
// ===============================

export function saveStoredPlayer(player) {
  if (!storageAvailable()) {
    throw new Error("No se pudo guardar el jugador en este navegador.");
  }

  if (!player || !player.uid || !player.name) {
    throw new Error("Jugador inválido.");
  }

  const cleanPlayer = {
    uid: player.uid,
    name: player.name
  };

  localStorage.setItem(STORAGE_PLAYER_KEY, JSON.stringify(cleanPlayer));

  // También guardamos en las claves viejas por compatibilidad
  localStorage.setItem(OLD_STORAGE_UID_KEY, cleanPlayer.uid);
  localStorage.setItem(OLD_STORAGE_NAME_KEY, cleanPlayer.name);
}

// ===============================
// BORRAR JUGADOR
// ===============================

export function clearStoredPlayer() {
  localStorage.removeItem(STORAGE_PLAYER_KEY);
  localStorage.removeItem(OLD_STORAGE_UID_KEY);
  localStorage.removeItem(OLD_STORAGE_NAME_KEY);
}

// ===============================
// LIMPIAR NOMBRE
// ===============================

export function cleanPlayerName(name) {
  return String(name || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ===============================
// NORMALIZAR ID
// ===============================

export function normalizePlayerId(name) {
  return cleanPlayerName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 18);
}

// ===============================
// TOKEN DE 3 DÍGITOS
// ===============================

export function createRandomToken() {
  return Math.floor(100 + Math.random() * 900).toString();
}

// ===============================
// CREAR ID FINAL
// Ejemplo: Francisco → francisco_482
// ===============================

export function createPlayerId(name) {
  const baseName = normalizePlayerId(name) || "jugador";
  const token = createRandomToken();

  return `${baseName}_${token}`;
}