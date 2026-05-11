const startScreen = document.getElementById("startScreen");
const levelScreen = document.getElementById("levelScreen");
const gameScreen = document.getElementById("gameScreen");

const playBtn = document.getElementById("playBtn");
const levelsBtn = document.getElementById("levelsBtn");
const resetProgressBtn = document.getElementById("resetProgressBtn");
const backFromLevelsBtn = document.getElementById("backFromLevelsBtn");

const bestScoreText = document.getElementById("bestScoreText");
const unlockedText = document.getElementById("unlockedText");
const levelGrid = document.getElementById("levelGrid");

const boardElement = document.getElementById("board");
const levelText = document.getElementById("levelText");
const scoreText = document.getElementById("scoreText");
const movesText = document.getElementById("movesText");
const timerText = document.getElementById("timerText");
const difficultyText = document.getElementById("difficultyText");
const meteorText = document.getElementById("meteorText");

const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const soundBtn = document.getElementById("soundBtn");
const homeBtn = document.getElementById("homeBtn");
const nextBtn = document.getElementById("nextBtn");
const goLevelsBtn = document.getElementById("goLevelsBtn");

const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

const STORAGE_KEY = "arrow_escape_save";

let currentLevel = 0;
let board = [];
let score = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isAnimating = false;
let hintedCell = null;
let missionFailed = false;

/*
  Optimización del tablero:
  - Guardamos referencias a las celdas.
  - Guardamos solo las naves activas.
  - Ya no reconstruimos todo el tablero en cada movimiento.
*/
let cellElements = [];
let activeShipCells = [];
let remainingShips = 0;
let hintTimeout = null;

const symbols = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→"
};

/* =========================
   LOCAL STORAGE
========================= */

function getDefaultProgress() {
  return {
    currentLevel: 0,
    score: 0,
    unlockedLevel: 0,
    bestScore: 0
  };
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return getDefaultProgress();

  try {
    return {
      ...getDefaultProgress(),
      ...JSON.parse(saved)
    };
  } catch (error) {
    console.warn("Error al cargar progreso:", error);
    return getDefaultProgress();
  }
}

function saveProgress() {
  const saved = loadProgress();

  const data = {
    currentLevel,
    score,
    unlockedLevel: Math.max(saved.unlockedLevel, currentLevel),
    bestScore: Math.max(saved.bestScore, score)
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateStartInfo();
}

function unlockNextLevel() {
  const saved = loadProgress();

  const data = {
    ...saved,
    currentLevel,
    score,
    unlockedLevel: Math.max(saved.unlockedLevel, currentLevel + 1),
    bestScore: Math.max(saved.bestScore, score)
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateStartInfo();
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);

  currentLevel = 0;
  score = 0;
  moves = 0;
  seconds = 0;

  updateStartInfo();
  renderLevelSelector();
  showStartScreen();
}

function updateStartInfo() {
  const saved = loadProgress();
  const totalLevels = getTotalLevels();

  bestScoreText.textContent = saved.bestScore || 0;
  unlockedText.textContent = Math.min((saved.unlockedLevel || 0) + 1, totalLevels);
}

/* =========================
   PANTALLAS
========================= */

function hideAllScreens() {
  startScreen.classList.add("hidden");
  levelScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
}

function showStartScreen() {
  clearInterval(timerInterval);
  stopMeteorRain();
  hideAllScreens();
  updateStartInfo();
  startScreen.classList.remove("hidden");
}

function showLevelScreen() {
  clearInterval(timerInterval);
  stopMeteorRain();
  hideAllScreens();
  renderLevelSelector();
  levelScreen.classList.remove("hidden");
}

function showGameScreen() {
  hideAllScreens();
  gameScreen.classList.remove("hidden");
}

/* =========================
   INICIO DEL JUEGO
========================= */

function startGame() {
  const savedGame = loadProgress();

  currentLevel = savedGame.currentLevel || 0;
  score = savedGame.score || 0;

  if (currentLevel >= getTotalLevels()) {
    currentLevel = 0;
  }

  showGameScreen();
  loadLevel(currentLevel);
  startTimer();
}

/* =========================
   SELECTOR DE NIVELES
========================= */

function renderLevelSelector() {
  const saved = loadProgress();
  const unlocked = saved.unlockedLevel || 0;
  const totalLevels = getTotalLevels();

  levelGrid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < totalLevels; index++) {
    const levelNumber = index + 1;
    const difficulty = getDifficultyByLevel(levelNumber);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "level-btn";
    button.textContent = levelNumber;

    if (index <= unlocked) {
      button.classList.add("unlocked");
      button.title = difficulty.name;

      button.addEventListener("click", () => {
        currentLevel = index;
        score = saved.score || 0;
        showGameScreen();
        loadLevel(currentLevel);
        startTimer();
      });
    } else {
      button.classList.add("locked");
      button.textContent = "🔒";
      button.disabled = true;
    }

    fragment.appendChild(button);
  }

  levelGrid.appendChild(fragment);
}

/* =========================
   CARGAR NIVEL
========================= */

function loadLevel(index) {
  const level = getLevel(index);

  board = level.board.map(row => [...row]);

  moves = 0;
  seconds = 0;
  isAnimating = false;
  hintedCell = null;
  missionFailed = false;

  cellElements = [];
  activeShipCells = [];
  remainingShips = board.flat().filter(cell => cell !== "").length;

  if (hintTimeout) {
    clearTimeout(hintTimeout);
    hintTimeout = null;
  }

  levelText.textContent = index + 1;
  movesText.textContent = moves;
  timerText.textContent = "00:00";
  scoreText.textContent = score;

  if (difficultyText) {
    difficultyText.textContent = level.difficulty;
  }

  renderBoard();
  startMeteorRain();
}

/* =========================
   DIBUJAR TABLERO
   Se ejecuta solo al cargar nivel
========================= */

function renderBoard() {
  const size = board.length;

  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  cellElements = [];
  activeShipCells = [];

  const fragment = document.createDocumentFragment();

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const div = document.createElement("div");
      const index = getCellIndex(rowIndex, colIndex);

      div.className = "cell";
      div.dataset.row = rowIndex;
      div.dataset.col = colIndex;

      cellElements[index] = div;

      if (cell) {
        div.classList.add("arrow", cell);

        const ship = document.createElement("span");
        ship.className = "ship";

        div.appendChild(ship);

        activeShipCells.push({
          row: rowIndex,
          col: colIndex,
          cellElement: div,
          shipElement: ship
        });
      }

      fragment.appendChild(div);
    });
  });

  boardElement.appendChild(fragment);
}

/* =========================
   UTILIDADES DEL TABLERO
========================= */

function getCellIndex(row, col) {
  return row * board.length + col;
}

function getCellElement(row, col) {
  return cellElements[getCellIndex(row, col)] || null;
}

function removeShipFromActiveList(row, col) {
  activeShipCells = activeShipCells.filter(ship => {
    return !(ship.row === row && ship.col === col);
  });
}

function clearShipCell(row, col) {
  const cellElement = getCellElement(row, col);

  if (!cellElement) return;

  cellElement.className = "cell";
  cellElement.innerHTML = "";
  cellElement.style.removeProperty("--shoot-x");
  cellElement.style.removeProperty("--shoot-y");

  removeShipFromActiveList(row, col);
}

function clearHintVisual() {
  if (hintTimeout) {
    clearTimeout(hintTimeout);
    hintTimeout = null;
  }

  if (hintedCell) {
    const cellElement = getCellElement(hintedCell.row, hintedCell.col);

    if (cellElement) {
      cellElement.classList.remove("hint");
    }

    hintedCell = null;
  }
}

/*
  Esta función la puede usar meteoros.js
  cuando un meteorito destruye una nave.
*/
function markShipDestroyedByMeteor(row, col) {
  const cellElement = getCellElement(row, col);

  if (!cellElement) return;

  const shipElement = cellElement.querySelector(".ship");

  if (shipElement) {
    shipElement.remove();
  }

  cellElement.classList.remove(
    "arrow",
    "up",
    "down",
    "left",
    "right",
    "hint",
    "blocked",
    "shoot"
  );

  cellElement.style.removeProperty("--shoot-x");
  cellElement.style.removeProperty("--shoot-y");

  removeShipFromActiveList(row, col);
}

/* =========================
   CLICK EN NAVE
   Usamos delegación de eventos:
   solo 1 listener para todo el tablero
========================= */

boardElement.addEventListener("click", event => {
  const cellElement = event.target.closest(".cell.arrow");

  if (!cellElement || !boardElement.contains(cellElement)) return;

  const row = Number(cellElement.dataset.row);
  const col = Number(cellElement.dataset.col);

  handleArrowClick(row, col);
});

function handleArrowClick(row, col) {
  if (isAnimating || missionFailed) return;

  const direction = board[row][col];

  if (!direction) return;

  if (canExit(row, col, direction)) {
    removeArrow(row, col);
  } else {
    showBlocked(row, col);
  }
}

/* =========================
   VALIDAR SALIDA
========================= */

function canExit(row, col, direction) {
  let r = row;
  let c = col;

  while (true) {
    if (direction === "up") r--;
    if (direction === "down") r++;
    if (direction === "left") c--;
    if (direction === "right") c++;

    if (r < 0 || r >= board.length || c < 0 || c >= board.length) {
      return true;
    }

    if (board[r][c]) {
      return false;
    }
  }
}

/* =========================
   ANIMACIÓN DE SALIDA
========================= */

function removeArrow(row, col) {
  const direction = board[row][col];
  const cellElement = getCellElement(row, col);

  if (!cellElement || !direction) return;

  isAnimating = true;
  clearHintVisual();

  trySaveMeteorTarget(row, col);

  const boardRect = boardElement.getBoundingClientRect();
  const cellRect = cellElement.getBoundingClientRect();

  let moveX = 0;
  let moveY = 0;

  if (direction === "up") {
    moveY = -(cellRect.bottom - boardRect.top);
  }

  if (direction === "down") {
    moveY = boardRect.bottom - cellRect.top;
  }

  if (direction === "left") {
    moveX = -(cellRect.right - boardRect.left);
  }

  if (direction === "right") {
    moveX = boardRect.right - cellRect.left;
  }

  playLaunchSound();

  cellElement.style.setProperty("--shoot-x", `${moveX}px`);
  cellElement.style.setProperty("--shoot-y", `${moveY}px`);

  cellElement.classList.add("shoot");

setTimeout(() => {
  board[row][col] = "";

  remainingShips = Math.max(0, remainingShips - 1);

  moves++;
  score += 10;

  movesText.textContent = moves;
  scoreText.textContent = score;

  clearShipCell(row, col);

  isAnimating = false;

  checkWin();
}, 290);
}

/* =========================
   NAVE BLOQUEADA
========================= */

function showBlocked(row, col) {
  applyMistakePenalty();
  playBlockedSound();

  const cellElement = getCellElement(row, col);

  if (!cellElement) return;

  cellElement.classList.add("blocked");

  setTimeout(() => {
    cellElement.classList.remove("blocked");
  }, 300);
}

/* =========================
   PENALIZACIÓN
========================= */

function applyMistakePenalty() {
  const level = getLevel(currentLevel);
  const penalty = level.mistakePenalty || 0;

  if (penalty <= 0) return;

  score = Math.max(0, score - penalty);
  scoreText.textContent = score;
}

/* =========================
   PISTA
========================= */

function getAvailableMoves() {
  const movesList = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const direction = board[row][col];

      if (!direction) continue;

      if (canExit(row, col, direction)) {
        movesList.push({ row, col, direction });
      }
    }
  }

  return movesList;
}

function showHint() {
  if (isAnimating || missionFailed) return;

  const availableMoves = getAvailableMoves();

  if (availableMoves.length === 0) {
    return;
  }

  clearHintVisual();

  hintedCell = availableMoves[0];

  score = Math.max(0, score - 5);
  scoreText.textContent = score;

  const cellElement = getCellElement(hintedCell.row, hintedCell.col);

  if (cellElement) {
    cellElement.classList.add("hint");
  }

  hintTimeout = setTimeout(() => {
    if (hintedCell) {
      const currentCell = getCellElement(hintedCell.row, hintedCell.col);

      if (currentCell) {
        currentCell.classList.remove("hint");
      }
    }

    hintedCell = null;
    hintTimeout = null;
  }, 1400);
}

/* =========================
   BONUS
========================= */

function calculateLevelBonus() {
  const level = getLevel(currentLevel);

  const baseBonus = level.baseBonus || 100;
  const movePenalty = moves * 2;
  const timePenalty = seconds;

  return Math.max(10, baseBonus - movePenalty - timePenalty);
}

/* =========================
   GANAR NIVEL
========================= */

function checkWin() {
  if (missionFailed) return;

  if (remainingShips === 0) {
    clearInterval(timerInterval);
    stopMeteorRain();

    const level = getLevel(currentLevel);
    const bonus = calculateLevelBonus();

    score += bonus;
    scoreText.textContent = score;

    unlockNextLevel();

    playWinSound();

    nextBtn.textContent = "Siguiente nivel";
    goLevelsBtn.textContent = "Misiones";

    messageTitle.textContent = "¡Misión completada!";
    messageText.textContent =
      `Zona: ${level.difficulty} | ` +
      `Lanzamientos: ${moves} | ` +
      `Bonus: ${bonus} | ` +
      `Energía: ${score}`;

    message.classList.remove("hidden");
  }
}

/* =========================
   CRONÓMETRO
========================= */

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    seconds++;

    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");

    timerText.textContent = `${min}:${sec}`;
  }, 1000);
}

/* =========================
   BOTONES
========================= */

playBtn.addEventListener("click", () => {
  startGame();
});

levelsBtn.addEventListener("click", () => {
  showLevelScreen();
});

backFromLevelsBtn.addEventListener("click", () => {
  showStartScreen();
});

resetProgressBtn.addEventListener("click", () => {
  const confirmReset = confirm("¿Seguro que quieres borrar tu progreso?");

  if (confirmReset) {
    resetProgress();
  }
});

restartBtn.addEventListener("click", () => {
  stopMeteorRain();
  clearHintVisual();
  loadLevel(currentLevel);
  startTimer();
});

hintBtn.addEventListener("click", () => {
  showHint();
});

homeBtn.addEventListener("click", () => {
  stopMeteorRain();
  clearHintVisual();
  saveProgress();
  showStartScreen();
});

nextBtn.addEventListener("click", () => {
  message.classList.add("hidden");

  if (missionFailed) {
    missionFailed = false;
    isAnimating = false;

    loadLevel(currentLevel);
    startTimer();

    return;
  }

  currentLevel++;

  if (currentLevel >= getTotalLevels()) {
    currentLevel = 0;
  }

  saveProgress();

  loadLevel(currentLevel);
  startTimer();
});

goLevelsBtn.addEventListener("click", () => {
  message.classList.add("hidden");
  clearHintVisual();
  showLevelScreen();
});

/* =========================
   INICIAR
========================= */

updateStartInfo();
showStartScreen();