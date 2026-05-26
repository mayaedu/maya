import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  runTransaction,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

import { getAIMove } from "./ia.js";

// ================= FIREBASE =================

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "grafi-23b65.firebaseapp.com",
  databaseURL: "https://grafi-23b65-default-rtdb.firebaseio.com",
  projectId: "grafi-23b65"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ================= CONFIG JUEGO =================

const ROWS = 6;
const COLS = 7;

let board;
let currentPlayer = 1;
let gameOver = false;
let isAnimating = false;

let gameMode = null; // "solo" | "online"

// ================= IA =================

let soloVsAI = true;
let aiDifficulty = "medium"; // "easy" | "medium" | "hard"

// ================= ONLINE =================

let myUid = getOrCreateUserId();
let myName = getOrCreatePlayerName();

let currentRoomId = null;
let myPlayerNumber = null;
let roomListenerActive = false;

// ================= ELEMENTOS HTML =================

const boardDiv = document.getElementById("board");
const status = document.getElementById("status");

const mainMenu = document.getElementById("mainMenu");
const gameArea = document.getElementById("gameArea");
const rankingArea = document.getElementById("rankingArea");
const onlineInfo = document.getElementById("onlineInfo");
const rankingList = document.getElementById("rankingList");

init();

// ================= INIT =================

function init() {
  board = createEmptyBoard();
  currentPlayer = 1;
  gameOver = false;
  isAnimating = false;

  renderBoard();
  attachEvents();

  status.textContent = "Selecciona un modo";
}

// ================= MENÚ =================

window.startSoloGame = function () {
  gameMode = "solo";
  soloVsAI = true;
  aiDifficulty = "medium";

  mainMenu.style.display = "none";
  rankingArea.style.display = "none";
  gameArea.style.display = "block";

  currentRoomId = null;
  myPlayerNumber = null;
  roomListenerActive = false;

  board = createEmptyBoard();
  currentPlayer = 1;
  gameOver = false;
  isAnimating = false;

  renderBoard();

  onlineInfo.textContent = "Modo: Jugar Solo contra IA";
  status.textContent = "Tu turno";
};

window.startOnlineGame = async function () {
  gameMode = "online";

  mainMenu.style.display = "none";
  rankingArea.style.display = "none";
  gameArea.style.display = "block";

  board = createEmptyBoard();
  currentPlayer = 1;
  gameOver = false;
  isAnimating = false;

  currentRoomId = null;
  myPlayerNumber = null;
  roomListenerActive = false;

  renderBoard();

  onlineInfo.textContent = "Buscando sala online...";
  status.textContent = "Conectando con Firebase...";

  await createOrJoinRoom();
};

window.showRanking = async function () {
  mainMenu.style.display = "none";
  gameArea.style.display = "none";
  rankingArea.style.display = "block";

  rankingList.innerHTML = "Cargando ranking...";

  await loadRanking();
};

window.backToMenu = function () {
  gameArea.style.display = "none";
  rankingArea.style.display = "none";
  mainMenu.style.display = "block";

  gameMode = null;
  gameOver = false;
  isAnimating = false;

  status.textContent = "Selecciona un modo";
};

window.resetGame = async function () {
  if (gameMode === "solo") {
    board = createEmptyBoard();
    currentPlayer = 1;
    gameOver = false;
    isAnimating = false;

    renderBoard();

    onlineInfo.textContent = "Modo: Jugar Solo contra IA";
    status.textContent = "Tu turno";
    return;
  }

  if (gameMode === "online" && currentRoomId) {
    const freshBoard = createEmptyBoard();

    await update(ref(db, `rooms/${currentRoomId}`), {
      board: freshBoard,
      turn: 1,
      winner: null,
      loser: null,
      draw: false,
      finished: false,
      statsUpdated: false,
      status: "playing",
      lastMove: null,
      updatedAt: Date.now()
    });
  }
};

// ================= USUARIO LOCAL =================

function getOrCreateUserId() {
  let uid = localStorage.getItem("conecta4_uid");

  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("conecta4_uid", uid);
  }

  return uid;
}

function getOrCreatePlayerName() {
  let name = localStorage.getItem("conecta4_name");

  if (!name) {
    name = "Jugador " + Math.floor(Math.random() * 9999);
    localStorage.setItem("conecta4_name", name);
  }

  return name;
}

// ================= SALAS ONLINE =================

async function createOrJoinRoom() {
  const roomsRef = ref(db, "rooms");
  const snapshot = await get(roomsRef);

  let joined = false;

  if (snapshot.exists()) {
    const rooms = snapshot.val();

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (
        room.status === "waiting" &&
        room.players &&
        room.players.player1 &&
        room.players.player1.uid !== myUid
      ) {
        const success = await joinRoomTransaction(roomId);

        if (success) {
          currentRoomId = roomId;
          myPlayerNumber = 2;
          joined = true;
          listenRoom();
          break;
        }
      }
    }
  }

  if (!joined) {
    await createRoom();
  }
}

async function joinRoomTransaction(roomId) {
  const roomRef = ref(db, `rooms/${roomId}`);

  const result = await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.status !== "waiting") return room;
    if (room.players?.player2) return room;

    room.players.player2 = {
      uid: myUid,
      name: myName
    };

    room.status = "playing";
    room.updatedAt = Date.now();

    return room;
  });

  return result.committed &&
    result.snapshot.val()?.players?.player2?.uid === myUid;
}

async function createRoom() {
  const roomId =
    "room_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 7);

  currentRoomId = roomId;
  myPlayerNumber = 1;

  const roomData = {
    status: "waiting",
    createdAt: Date.now(),
    updatedAt: Date.now(),

    turn: 1,
    winner: null,
    loser: null,
    draw: false,
    finished: false,
    statsUpdated: false,

    players: {
      player1: {
        uid: myUid,
        name: myName
      },
      player2: null
    },

    board: createEmptyBoard(),
    lastMove: null
  };

  await set(ref(db, `rooms/${roomId}`), roomData);

  listenRoom();
}

function listenRoom() {
  if (!currentRoomId || roomListenerActive) return;

  roomListenerActive = true;

  const roomRef = ref(db, `rooms/${currentRoomId}`);

  onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      status.textContent = "La sala ya no existe.";
      return;
    }

    const room = snapshot.val();
    applyRoomState(room);
  });
}

function applyRoomState(room) {
  if (gameMode !== "online") return;

  board = room.board || createEmptyBoard();
  currentPlayer = room.turn || 1;
  gameOver = !!room.finished;

  renderBoardFromData();

  if (room.status === "waiting") {
    onlineInfo.textContent = `Sala: ${currentRoomId} | Eres Jugador ${myPlayerNumber}`;
    status.textContent = "Esperando otro jugador...";
    return;
  }

  if (room.status === "playing") {
    onlineInfo.textContent = `Sala: ${currentRoomId} | Eres Jugador ${myPlayerNumber}`;

    if (currentPlayer === myPlayerNumber) {
      status.textContent = "Tu turno";
    } else {
      status.textContent = "Turno del rival";
    }

    return;
  }

  if (room.status === "finished") {
    onlineInfo.textContent = `Sala finalizada: ${currentRoomId}`;

    if (room.draw) {
      status.textContent = "🤝 Empate";
    } else if (room.winner === myUid) {
      status.textContent = "🎉 Ganaste";
    } else if (room.loser === myUid) {
      status.textContent = "Perdiste";
    } else {
      status.textContent = "Partida finalizada";
    }
  }
}

// ================= EVENTOS =================

function attachEvents() {
  boardDiv.addEventListener("click", (e) => {
    if (gameOver || isAnimating) return;

    const col = parseInt(e.target.dataset.col);
    if (isNaN(col)) return;

    if (gameMode === "solo") {
      if (soloVsAI && currentPlayer !== 1) return;
      playTurn(col);
      return;
    }

    if (gameMode === "online") {
      if (!currentRoomId) return;

      if (currentPlayer !== myPlayerNumber) {
        status.textContent = "Espera tu turno";
        return;
      }

      playTurn(col);
    }
  });
}

// ================= TURNO =================

async function playTurn(col) {
  if (gameOver || isAnimating) return;

  if (gameMode === "online" && currentPlayer !== myPlayerNumber) return;

  if (col === null || col === undefined) return;

  const row = getAvailableRow(col);
  if (row === -1) return;

  isAnimating = true;

  board[row][col] = currentPlayer;

  animateDrop(row, col, currentPlayer, async () => {
    paintCell(row, col, currentPlayer);

    if (gameMode === "solo") {
      handleSoloTurnEnd(row, col);
      return;
    }

    if (gameMode === "online") {
      await handleOnlineTurnEnd(row, col);
    }
  });
}

// ================= TURNO SOLO + IA =================

function handleSoloTurnEnd(row, col) {
  if (checkWin(row, col)) {
    gameOver = true;
    isAnimating = false;

    if (currentPlayer === 1) {
      status.textContent = "🎉 Ganaste";
    } else {
      status.textContent = "🤖 Ganó la IA";
    }

    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    isAnimating = false;
    status.textContent = "🤝 Empate";
    return;
  }

  switchPlayer();

  if (soloVsAI && currentPlayer === 2) {
    status.textContent = "🤖 Pensando...";

    isAnimating = false;

    setTimeout(() => {
      playAIMove();
    }, 500);

    return;
  }

  status.textContent = currentPlayer === 1 ? "Tu turno" : `Turno: Jugador ${currentPlayer}`;
  isAnimating = false;
}

function playAIMove() {
  if (gameOver || isAnimating) return;
  if (gameMode !== "solo") return;
  if (currentPlayer !== 2) return;

  const aiCol = getAIMove(board, aiDifficulty);

  if (aiCol === null || aiCol === undefined) {
    status.textContent = "🤝 Empate";
    gameOver = true;
    return;
  }

  playTurn(aiCol);
}
// ================= TURNO ONLINE =================

async function handleOnlineTurnEnd(row, col) {
  let winnerUid = null;
  let loserUid = null;
  let draw = false;
  let finished = false;
  let roomStatus = "playing";
  let nextTurn = currentPlayer === 1 ? 2 : 1;

  if (checkWin(row, col)) {
    finished = true;
    roomStatus = "finished";
    winnerUid = myUid;
    loserUid = await getOpponentUid();
    gameOver = true;
  }

  if (!finished && isBoardFull()) {
    finished = true;
    roomStatus = "finished";
    draw = true;
    gameOver = true;
  }

  await update(ref(db, `rooms/${currentRoomId}`), {
    board: board,
    turn: nextTurn,
    status: roomStatus,
    finished: finished,
    draw: draw,
    winner: winnerUid,
    loser: loserUid,
    lastMove: {
      row,
      col,
      player: currentPlayer,
      by: myUid,
      at: Date.now()
    },
    updatedAt: Date.now()
  });

  if (finished) {
    await updateStatsOnce({
      winnerUid,
      loserUid,
      draw
    });
  }

  isAnimating = false;
}

async function getOpponentUid() {
  const snapshot = await get(ref(db, `rooms/${currentRoomId}/players`));

  if (!snapshot.exists()) return null;

  const players = snapshot.val();

  if (myPlayerNumber === 1) {
    return players.player2?.uid || null;
  }

  return players.player1?.uid || null;
}

// ================= ESTADÍSTICAS =================

async function updateStatsOnce({ winnerUid, loserUid, draw }) {
  if (!currentRoomId) return;

  const roomRef = ref(db, `rooms/${currentRoomId}`);

  const result = await runTransaction(roomRef, (room) => {
    if (!room) return room;

    if (room.statsUpdated) {
      return room;
    }

    room.statsUpdated = true;
    return room;
  });

  if (!result.committed) return;

  const room = result.snapshot.val();

  if (!room || !room.statsUpdated) return;

  if (draw) {
    const players = room.players;

    const p1 = players?.player1?.uid;
    const p2 = players?.player2?.uid;

    if (p1) await addDraw(p1, players.player1.name);
    if (p2) await addDraw(p2, players.player2.name);

    return;
  }

  if (winnerUid) {
    await addWin(winnerUid);
  }

  if (loserUid) {
    await addLoss(loserUid);
  }
}

async function addWin(uid) {
  const userRef = ref(db, `users/${uid}`);

  await runTransaction(userRef, (user) => {
    if (!user) user = createUserStats(uid);

    user.name = user.name || myName;
    user.wins = (user.wins || 0) + 1;
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    user.score = (user.score || 0) + 3;

    return user;
  });
}

async function addLoss(uid) {
  const userRef = ref(db, `users/${uid}`);

  await runTransaction(userRef, (user) => {
    if (!user) user = createUserStats(uid);

    user.name = user.name || "Jugador";
    user.losses = (user.losses || 0) + 1;
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;

    return user;
  });
}

async function addDraw(uid, name = "Jugador") {
  const userRef = ref(db, `users/${uid}`);

  await runTransaction(userRef, (user) => {
    if (!user) user = createUserStats(uid, name);

    user.name = user.name || name;
    user.draws = (user.draws || 0) + 1;
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    user.score = (user.score || 0) + 1;

    return user;
  });
}

function createUserStats(uid, name = "Jugador") {
  return {
    uid,
    name,
    wins: 0,
    losses: 0,
    draws: 0,
    gamesPlayed: 0,
    score: 0
  };
}

// ================= RANKING =================

async function loadRanking() {
  const rankingRef = query(
    ref(db, "users"),
    orderByChild("score"),
    limitToLast(10)
  );

  const snapshot = await get(rankingRef);

  if (!snapshot.exists()) {
    rankingList.innerHTML = "Todavía no hay jugadores en el ranking.";
    return;
  }

  const users = [];

  snapshot.forEach((child) => {
    users.push({
      uid: child.key,
      ...child.val()
    });
  });

  users.sort((a, b) => (b.score || 0) - (a.score || 0));

  rankingList.innerHTML = "";

  users.forEach((user, index) => {
    const div = document.createElement("div");
    div.className = "ranking-item";

    div.innerHTML = `
      <span>${index + 1}. ${user.name || "Jugador"}</span>
      <span>${user.score || 0} pts</span>
    `;

    rankingList.appendChild(div);
  });
}

// ================= RENDER =================

function renderBoard() {
  boardDiv.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.col = c;
      boardDiv.appendChild(cell);
    }
  }
}

function renderBoardFromData() {
  renderBoard();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const value = board[r][c];

      if (value === 1 || value === 2) {
        paintCell(r, c, value);
      }
    }
  }
}

function paintCell(row, col, player) {
  const index = row * COLS + col;
  const cell = boardDiv.children[index];

  if (!cell) return;

  cell.classList.add(player === 1 ? "player1" : "player2");
}

// ================= ANIMACIÓN =================

function animateDrop(row, col, player, callback) {
  const index = row * COLS + col;
  const targetCell = boardDiv.children[index];

  if (!targetCell) {
    if (callback) callback();
    return;
  }

  const boardRect = boardDiv.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();

  const piece = document.createElement("div");

  piece.classList.add("falling-piece");
  piece.classList.add(
    player === 1 ? "falling-player1" : "falling-player2"
  );

  const startX = cellRect.left - boardRect.left;
  const startY = -80;
  const endY = cellRect.top - boardRect.top;

  piece.style.left = `${startX}px`;
  piece.style.top = `${startY}px`;

  boardDiv.appendChild(piece);

  requestAnimationFrame(() => {
    piece.style.top = `${endY}px`;
  });

  setTimeout(() => {
    piece.remove();

    if (callback) callback();
  }, 450);
}

// ================= UTILIDADES =================

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }

  return -1;
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function isBoardFull() {
  return board.every(row =>
    row.every(cell => cell !== 0)
  );
}

// ================= GANADOR =================

function checkWin(row, col) {
  return (
    checkDirection(row, col, 1, 0) ||
    checkDirection(row, col, 0, 1) ||
    checkDirection(row, col, 1, 1) ||
    checkDirection(row, col, 1, -1)
  );
}

function checkDirection(row, col, dr, dc) {
  let count = 1;

  count += countCells(row, col, dr, dc);
  count += countCells(row, col, -dr, -dc);

  return count >= 4;
}

function countCells(row, col, dr, dc) {
  let r = row + dr;
  let c = col + dc;
  let count = 0;

  while (
    r >= 0 &&
    r < ROWS &&
    c >= 0 &&
    c < COLS &&
    board[r][c] === currentPlayer
  ) {
    count++;
    r += dr;
    c += dc;
  }

  return count;
}