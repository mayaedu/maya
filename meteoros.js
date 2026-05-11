/* =====================================================
   meteoros.js
   Lluvia de meteoros optimizada para Android

   Optimización principal:
   - Pool fijo de meteoros
   - No crea ni elimina meteoros constantemente
   - Máximo controlado de meteoros activos
   - Colisiones revisadas cada ciertos ms, no cada frame
   - Solo revisa colisión si el meteoro está cerca del tablero
===================================================== */

let meteorRainInterval = null;
let meteorAnimationFrame = null;
let meteorRainActive = false;

let meteorPool = [];
let activeMeteors = [];

let lastMeteorCollisionCheck = 0;

const METEOR_IMAGE_SRC = "meteor.png";
const METEOR_POOL_SIZE = 8;
const BOARD_COLLISION_MARGIN = 90;

/* =========================
   PRECARGAR PNG
========================= */

(function preloadMeteorImage() {
  const img = new Image();
  img.src = METEOR_IMAGE_SRC;
})();

/* =========================
   CREAR POOL UNA SOLA VEZ
========================= */

function initMeteorPool() {
  if (meteorPool.length > 0) return;

  for (let i = 0; i < METEOR_POOL_SIZE; i++) {
    const meteorElement = document.createElement("img");

    meteorElement.src = METEOR_IMAGE_SRC;
    meteorElement.alt = "";
    meteorElement.draggable = false;
    meteorElement.loading = "eager";
    meteorElement.decoding = "async";

    meteorElement.className = "visual-meteor";
    meteorElement.style.display = "none";

    document.body.appendChild(meteorElement);

    const meteorData = {
      element: meteorElement,
      active: false,
      destroyed: false
    };

    meteorElement.addEventListener("animationend", () => {
      recycleMeteor(meteorData);
    });

    meteorPool.push(meteorData);
  }
}

/* =========================
   INICIAR LLUVIA
========================= */

function startMeteorRain() {
  stopMeteorRain();

  initMeteorPool();

  meteorRainActive = true;
  lastMeteorCollisionCheck = 0;

  const config = getMeteorRainConfig();

  if (config.meteorsPerWave <= 0) {
    updateMeteorText("SAFE");
    return;
  }

  updateMeteorText("ACTIVE");

  meteorRainInterval = setInterval(() => {
    createMeteorWave();
  }, config.spawnRate);

  meteorAnimationFrame = requestAnimationFrame(checkMeteorCollisions);

  setTimeout(() => {
    createMeteorWave();
  }, 500);
}

/* =========================
   DETENER LLUVIA
========================= */

function stopMeteorRain() {
  meteorRainActive = false;

  clearInterval(meteorRainInterval);
  meteorRainInterval = null;

  if (meteorAnimationFrame) {
    cancelAnimationFrame(meteorAnimationFrame);
    meteorAnimationFrame = null;
  }

  activeMeteors.forEach(meteor => {
    recycleMeteor(meteor);
  });

  activeMeteors = [];

  updateMeteorText("SAFE");
}

/* =========================
   CONFIGURACIÓN POR NIVEL
========================= */

function getMeteorRainConfig() {
  const levelNumber =
    typeof currentLevel !== "undefined"
      ? currentLevel + 1
      : 1;

  if (levelNumber <= 5) {
    return {
      spawnRate: 999999,
      minDuration: 7.0,
      maxDuration: 8.5,
      minSize: 18,
      maxSize: 26,
      meteorsPerWave: 0,
      maxActiveMeteors: 0,
      collisionEveryMs: 140
    };
  }

  const progress = Math.min((levelNumber - 5) / 95, 1);

  const spawnRate = Math.round(lerp(2600, 520, progress));

  const minDuration = lerp(6.4, 2.2, progress);
  const maxDuration = lerp(8.2, 3.2, progress);

  const minSize = Math.round(lerp(20, 34, progress));
  const maxSize = Math.round(lerp(34, 58, progress));

  let meteorsPerWave = 1;

  if (levelNumber >= 30) meteorsPerWave = 2;
  if (levelNumber >= 65) meteorsPerWave = 3;
  if (levelNumber >= 90) meteorsPerWave = 4;

  let maxActiveMeteors = 3;

  if (levelNumber >= 30) maxActiveMeteors = 5;
  if (levelNumber >= 65) maxActiveMeteors = 7;
  if (levelNumber >= 90) maxActiveMeteors = 8;

  const collisionEveryMs = Math.round(lerp(125, 75, progress));

  return {
    spawnRate,
    minDuration,
    maxDuration,
    minSize,
    maxSize,
    meteorsPerWave,
    maxActiveMeteors,
    collisionEveryMs
  };
}

/* =========================
   CREAR OLEADA
========================= */

function createMeteorWave() {
  if (!meteorRainActive || isMissionFailed()) return;

  const config = getMeteorRainConfig();

  if (config.meteorsPerWave <= 0) return;

  const availableSlots = config.maxActiveMeteors - activeMeteors.length;

  if (availableSlots <= 0) return;

  const meteorsToCreate = Math.min(config.meteorsPerWave, availableSlots);

  for (let i = 0; i < meteorsToCreate; i++) {
    setTimeout(() => {
      if (!meteorRainActive || isMissionFailed()) return;

      if (activeMeteors.length >= config.maxActiveMeteors) return;

      launchMeteorFromPool();
    }, i * 180);
  }
}

/* =========================
   LANZAR METEORO REUTILIZADO
========================= */

function launchMeteorFromPool() {
  if (!meteorRainActive || isMissionFailed()) return;

  const gameScreen = document.getElementById("gameScreen");

  if (!gameScreen || gameScreen.classList.contains("hidden")) {
    return;
  }

  const meteorData = getFreeMeteor();

  if (!meteorData) return;

  const config = getMeteorRainConfig();

  const meteor = meteorData.element;

  const size = randomBetween(config.minSize, config.maxSize);
  const duration = randomBetween(config.minDuration, config.maxDuration);
  const route = createRandomMeteorRoute();

  meteorData.active = true;
  meteorData.destroyed = false;

  meteor.style.display = "block";

  meteor.style.width = `${size}px`;
  meteor.style.height = `${size}px`;

  meteor.style.setProperty("--meteor-start-x", `${route.startX}px`);
  meteor.style.setProperty("--meteor-start-y", `${route.startY}px`);
  meteor.style.setProperty("--meteor-end-x", `${route.endX}px`);
  meteor.style.setProperty("--meteor-end-y", `${route.endY}px`);
  meteor.style.setProperty("--meteor-rotate", `${randomBetween(220, 720)}deg`);
  meteor.style.animationDuration = `${duration}s`;

  meteor.classList.remove("meteor-active", "meteor-hit");

  /*
    Forzamos reinicio limpio de animación.
    Esto es importante al reutilizar el mismo elemento.
  */
  void meteor.offsetWidth;

  meteor.classList.add("meteor-active");

  activeMeteors.push(meteorData);
}

function getFreeMeteor() {
  return meteorPool.find(meteor => !meteor.active) || null;
}

/* =========================
   RECICLAR METEORO
========================= */

function recycleMeteor(meteorData) {
  if (!meteorData || !meteorData.element) return;

  const meteor = meteorData.element;

  meteorData.active = false;
  meteorData.destroyed = false;

  meteor.classList.remove("meteor-active", "meteor-hit");
  meteor.style.display = "none";

  activeMeteors = activeMeteors.filter(item => item !== meteorData);
}

/* =========================
   RUTAS RANDOM
========================= */

function createRandomMeteorRoute() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const type = Math.floor(Math.random() * 5);

  if (type === 0) {
    const startX = randomBetween(-120, width + 80);
    const startY = -140;

    const endX = startX + randomBetween(-240, 280);
    const endY = height + 180;

    return { startX, startY, endX, endY };
  }

  if (type === 1) {
    const startX = -180;
    const startY = randomBetween(-80, height * 0.75);

    const endX = width + 220;
    const endY = startY + randomBetween(120, 460);

    return { startX, startY, endX, endY };
  }

  if (type === 2) {
    const startX = width + 180;
    const startY = randomBetween(-80, height * 0.75);

    const endX = -220;
    const endY = startY + randomBetween(120, 460);

    return { startX, startY, endX, endY };
  }

  if (type === 3) {
    const startX = randomBetween(-220, width * 0.35);
    const startY = -180;

    const endX = width + randomBetween(80, 260);
    const endY = height + randomBetween(100, 260);

    return { startX, startY, endX, endY };
  }

  const startX = randomBetween(width * 0.65, width + 220);
  const startY = -180;

  const endX = randomBetween(-260, width * 0.35);
  const endY = height + randomBetween(100, 260);

  return { startX, startY, endX, endY };
}

/* =========================
   COLISIONES OPTIMIZADAS
========================= */

function checkMeteorCollisions(timestamp) {
  if (!meteorRainActive || isMissionFailed()) return;

  const config = getMeteorRainConfig();

  if (timestamp - lastMeteorCollisionCheck >= config.collisionEveryMs) {
    lastMeteorCollisionCheck = timestamp;

    const boardSearchRect = getExpandedBoardRect(BOARD_COLLISION_MARGIN);

    for (const meteor of activeMeteors) {
      if (!meteor.element || meteor.destroyed || !meteor.active) continue;

      const meteorRect = meteor.element.getBoundingClientRect();

      /*
        Si no está cerca del tablero, no revisamos contra naves.
      */
      if (boardSearchRect && !rectsOverlap(meteorRect, boardSearchRect)) {
        continue;
      }

      const meteorHitbox = shrinkRect(meteorRect, 0.35);
      const shipHit = getShipCollision(meteorHitbox);

      if (shipHit) {
        meteor.destroyed = true;
        explodeMeteorOnShip(meteor, shipHit);
        return;
      }
    }
  }

  meteorAnimationFrame = requestAnimationFrame(checkMeteorCollisions);
}

function getShipCollision(meteorRect) {
  if (
    typeof boardElement === "undefined" ||
    typeof board === "undefined" ||
    !boardElement ||
    !board ||
    isMissionFailed()
  ) {
    return null;
  }

  const cells = boardElement.children;
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!board[row][col]) continue;

      const index = row * size + col;
      const cellElement = cells[index];

      if (!cellElement) continue;

      const shipElement = cellElement.querySelector(".ship");

      if (!shipElement) continue;

      const shipRect = shipElement.getBoundingClientRect();
      const shipHitbox = shrinkRect(shipRect, 0.28);

      if (rectsOverlap(meteorRect, shipHitbox)) {
        return {
          row,
          col,
          cellElement,
          shipElement
        };
      }
    }
  }

  return null;
}

function getExpandedBoardRect(margin) {
  if (typeof boardElement === "undefined" || !boardElement) {
    return null;
  }

  const rect = boardElement.getBoundingClientRect();

  return {
    left: rect.left - margin,
    right: rect.right + margin,
    top: rect.top - margin,
    bottom: rect.bottom + margin,
    width: rect.width + margin * 2,
    height: rect.height + margin * 2
  };
}

function rectsOverlap(a, b) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function shrinkRect(rect, amount) {
  const shrinkX = rect.width * amount;
  const shrinkY = rect.height * amount;

  return {
    left: rect.left + shrinkX,
    right: rect.right - shrinkX,
    top: rect.top + shrinkY,
    bottom: rect.bottom - shrinkY,
    width: rect.width - shrinkX * 2,
    height: rect.height - shrinkY * 2
  };
}

/* =========================
   EXPLOSIÓN
========================= */

function explodeMeteorOnShip(meteor, shipHit) {
  if (isMissionFailed()) return;

  const { row, col, cellElement } = shipHit;

  updateMeteorText("IMPACT");

  cellElement.classList.add("meteor-impact");

  if (meteor.element) {
    meteor.element.classList.add("meteor-hit");
  }

  createExplosionEffect(cellElement);

  board[row][col] = "";

  if (typeof playBlockedSound === "function") {
    playBlockedSound();
  }

  setTimeout(() => {
    recycleMeteor(meteor);
    failMissionByMeteor();
  }, 420);
}

function createExplosionEffect(cellElement) {
  const explosion = document.createElement("div");
  explosion.className = "ship-explosion";
  explosion.textContent = "💥";

  cellElement.appendChild(explosion);

  setTimeout(() => {
    explosion.remove();
  }, 650);
}

function failMissionByMeteor() {
  if (isMissionFailed()) return;

  missionFailed = true;
  isAnimating = true;

  if (typeof timerInterval !== "undefined") {
    clearInterval(timerInterval);
  }

  meteorRainActive = false;

  clearInterval(meteorRainInterval);
  meteorRainInterval = null;

  if (meteorAnimationFrame) {
    cancelAnimationFrame(meteorAnimationFrame);
    meteorAnimationFrame = null;
  }

  activeMeteors.forEach(meteor => {
    recycleMeteor(meteor);
  });

  activeMeteors = [];

  updateMeteorText("IMPACT");

  messageTitle.textContent = "¡Nave destruida!";
  messageText.textContent =
    "Un meteorito chocó contra una nave. Intenta liberar la flota más rápido.";

  nextBtn.textContent = "Reintentar";
  goLevelsBtn.textContent = "Misiones";

  message.classList.remove("hidden");
}

/* =========================
   COMPATIBILIDAD CON MAIN.JS
========================= */

function trySaveMeteorTarget(row, col) {
  return false;
}

/* =========================
   UTILIDADES
========================= */

function removeMeteor(meteorData) {
  recycleMeteor(meteorData);
}

function updateMeteorText(text) {
  if (typeof meteorText !== "undefined" && meteorText) {
    meteorText.textContent = text;
  }
}

function isMissionFailed() {
  return typeof missionFailed !== "undefined" && missionFailed;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}