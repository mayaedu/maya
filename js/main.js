import { supabase } from "./supabase-config.js";
import { getAIMove } from "./ia.js";

import {
  getStoredPlayer,
  createLocalPlayer,
  clearStoredPlayer
} from "./player-storage.js";

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

let storedPlayer = getStoredPlayer();
let myUid = storedPlayer?.uid || null;
let myName = storedPlayer?.name || null;

let currentRoomId = null;
let myPlayerNumber = null;
let roomListenerActive = false;
let roomChannel = null;

// ================= ELEMENTOS HTML =================

const boardDiv = document.getElementById("board");
const status = document.getElementById("status");

const mainMenu = document.getElementById("mainMenu");
const gameArea = document.getElementById("gameArea");
const rankingArea = document.getElementById("rankingArea");
const onlineInfo = document.getElementById("onlineInfo");
const rankingList = document.getElementById("rankingList");

const playerModal = document.getElementById("playerModal");
const playerInfo = document.getElementById("playerInfo");
const playerNameInput = document.getElementById("playerNameInput");
const playerModalError = document.getElementById("playerModalError");

init();

// ================= INIT =================

function init() {
  board = createEmptyBoard();
  currentPlayer = 1;
  gameOver = false;
  isAnimating = false;

  renderBoard();
  attachEvents();
  loadPlayerMenu();

  status.textContent = "Selecciona un modo";
}

// ================= MENÚ =================

window.startSoloGame = function () {
  if (!myUid || !myName) {
    loadPlayerMenu();
    return;
  }

  unsubscribeRoom();

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
  if (!myUid || !myName) {
    loadPlayerMenu();
    return;
  }

  unsubscribeRoom();

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
  status.textContent = "Conectando con Supabase...";

  await ensurePlayerExists(myUid, myName);
  await createOrJoinRoom();
};

window.showRanking = async function () {
  unsubscribeRoom();

  mainMenu.style.display = "none";
  gameArea.style.display = "none";
  rankingArea.style.display = "block";

  rankingList.innerHTML = "Cargando ranking...";

  await loadRanking();
};

window.backToMenu = function () {
  unsubscribeRoom();

  gameArea.style.display = "none";
  rankingArea.style.display = "none";
  mainMenu.style.display = "block";

  gameMode = null;
  gameOver = false;
  isAnimating = false;
  currentRoomId = null;
  myPlayerNumber = null;

  loadPlayerMenu();
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

    const { error } = await supabase
      .from("rooms")
      .update({
        board: freshBoard,
        turn: 1,
        winner: null,
        loser: null,
        draw: false,
        finished: false,
        stats_updated: false,
        status: "playing",
        last_move: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", currentRoomId);

    if (error) {
      console.error(error);
      status.textContent = "No se pudo reiniciar la partida.";
    }
  }
};

// ================= USUARIO LOCAL =================

function loadPlayerMenu() {
  const player = getStoredPlayer();

  myUid = player?.uid || null;
  myName = player?.name || null;

  if (myUid && myName) {
    closePlayerModal();

    if (playerInfo) {
      playerInfo.innerHTML = `
        Jugador: ${myName}
        <small>ID: ${myUid}</small>
        <button class="change-player-btn" onclick="changePlayerName()">
          Cambiar jugador
        </button>
      `;
    }

    setMenuButtonsEnabled(true);
    return;
  }

  if (playerInfo) {
    playerInfo.textContent = "";
  }

  setMenuButtonsEnabled(false);
  openPlayerModal();
}

function openPlayerModal() {
  if (!playerModal) return;

  playerModal.classList.add("show");
  playerModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    if (playerNameInput) playerNameInput.focus();
  }, 100);
}

function closePlayerModal() {
  if (!playerModal) return;

  playerModal.classList.remove("show");
  playerModal.setAttribute("aria-hidden", "true");

  if (playerModalError) {
    playerModalError.textContent = "";
  }
}

window.savePlayerName = async function () {
  const rawName = playerNameInput?.value?.trim() || "";

  try {
    if (playerModalError) {
      playerModalError.textContent = "Creando jugador...";
    }

    const player = createLocalPlayer(rawName);

    myUid = player.uid;
    myName = player.name;

    await ensurePlayerExists(myUid, myName);

    loadPlayerMenu();
  } catch (error) {
    if (playerModalError) {
      playerModalError.textContent = error.message || "No se pudo crear el jugador.";
    }
  }
};

window.changePlayerName = function () {
  clearStoredPlayer();

  myUid = null;
  myName = null;

  if (playerNameInput) {
    playerNameInput.value = "";
  }

  if (playerModalError) {
    playerModalError.textContent = "";
  }

  loadPlayerMenu();
};

window.closePlayerModal = function () {
  if (!myUid || !myName) return;
  closePlayerModal();
};

function setMenuButtonsEnabled(enabled) {
  const buttons = document.querySelectorAll(".menu-btn");

  buttons.forEach((btn) => {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? "1" : "0.45";
    btn.style.pointerEvents = enabled ? "auto" : "none";
  });
}

async function ensurePlayerExists(uid, name) {
  if (!uid || !name) return;

  const { error } = await supabase
    .from("players")
    .upsert(
      {
        id: uid,
        name: name
      },
      {
        onConflict: "id"
      }
    );

  if (error) {
    console.error(error);
    status.textContent = "No se pudo crear el jugador.";
  }
}

// ================= SALAS ONLINE =================

async function createOrJoinRoom() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("status", "waiting")
    .is("player2_id", null)
    .neq("player1_id", myUid)
    .order("created_at", { ascending: true })
    .limit(5);

  if (error) {
    console.error(error);
    status.textContent = "Error al buscar salas.";
    return;
  }

  let joined = false;

  if (rooms && rooms.length > 0) {
    for (const room of rooms) {
      const success = await joinRoom(room.id);

      if (success) {
        currentRoomId = room.id;
        myPlayerNumber = 2;
        joined = true;
        await loadCurrentRoom();
        listenRoom();
        break;
      }
    }
  }

  if (!joined) {
    await createRoom();
  }
}

async function joinRoom(roomId) {
  const { data, error } = await supabase
    .from("rooms")
    .update({
      player2_id: myUid,
      player2_name: myName,
      status: "playing",
      updated_at: new Date().toISOString()
    })
    .eq("id", roomId)
    .eq("status", "waiting")
    .is("player2_id", null)
    .select()
    .single();

  if (error) {
    console.error(error);
    return false;
  }

  return !!data && data.player2_id === myUid;
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
    id: roomId,
    status: "waiting",
    turn: 1,
    winner: null,
    loser: null,
    draw: false,
    finished: false,
    stats_updated: false,
    player1_id: myUid,
    player1_name: myName,
    player2_id: null,
    player2_name: null,
    board: createEmptyBoard(),
    last_move: null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("rooms")
    .insert(roomData);

  if (error) {
    console.error(error);
    status.textContent = "No se pudo crear la sala.";
    return;
  }

  listenRoom();
  await loadCurrentRoom();
}

async function loadCurrentRoom() {
  if (!currentRoomId) return;

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", currentRoomId)
    .single();

  if (error) {
    console.error(error);
    status.textContent = "No se pudo cargar la sala.";
    return;
  }

  applyRoomState(data);
}

function listenRoom() {
  if (!currentRoomId || roomListenerActive) return;

  roomListenerActive = true;

  roomChannel = supabase
    .channel("room_" + currentRoomId)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${currentRoomId}`
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          status.textContent = "La sala ya no existe.";
          return;
        }

        if (payload.new) {
          applyRoomState(payload.new);
        }
      }
    )
    .subscribe(async (subscriptionStatus) => {
      if (subscriptionStatus === "SUBSCRIBED") {
        await loadCurrentRoom();
      }
    });
}

function unsubscribeRoom() {
  if (roomChannel) {
    supabase.removeChannel(roomChannel);
    roomChannel = null;
  }

  roomListenerActive = false;
}

function applyRoomState(room) {
  if (gameMode !== "online") return;
  if (!room) return;

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

  const { error } = await supabase
    .from("rooms")
    .update({
      board: board,
      turn: nextTurn,
      status: roomStatus,
      finished: finished,
      draw: draw,
      winner: winnerUid,
      loser: loserUid,
      last_move: {
        row,
        col,
        player: currentPlayer,
        by: myUid,
        at: Date.now()
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", currentRoomId)
    .eq("turn", myPlayerNumber)
    .eq("finished", false);

  if (error) {
    console.error(error);
    status.textContent = "No se pudo enviar la jugada.";
    isAnimating = false;
    await loadCurrentRoom();
    return;
  }

  await supabase
    .from("moves")
    .insert({
      room_id: currentRoomId,
      player_id: myUid,
      column_played: col,
      row_played: row,
      player_number: currentPlayer,
      board_after: board
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
  if (!currentRoomId) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select("player1_id, player2_id")
    .eq("id", currentRoomId)
    .single();

  if (error || !data) {
    console.error(error);
    return null;
  }

  if (myPlayerNumber === 1) {
    return data.player2_id || null;
  }

  return data.player1_id || null;
}

// ================= ESTADÍSTICAS =================

async function updateStatsOnce({ winnerUid, loserUid, draw }) {
  if (!currentRoomId) return;

  const { data: room, error } = await supabase
    .from("rooms")
    .update({ stats_updated: true })
    .eq("id", currentRoomId)
    .eq("stats_updated", false)
    .select()
    .single();

  if (error || !room) {
    return;
  }

  if (draw) {
    if (room.player1_id) await addDraw(room.player1_id, room.player1_name || "Jugador");
    if (room.player2_id) await addDraw(room.player2_id, room.player2_name || "Jugador");
    return;
  }

  if (winnerUid) {
    const winnerName = winnerUid === room.player1_id ? room.player1_name : room.player2_name;
    await addWin(winnerUid, winnerName || "Jugador");
  }

  if (loserUid) {
    const loserName = loserUid === room.player1_id ? room.player1_name : room.player2_name;
    await addLoss(loserUid, loserName || "Jugador");
  }
}

async function getPlayerStats(uid, fallbackName = "Jugador") {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", uid)
    .single();

  if (error || !data) {
    return createUserStats(uid, fallbackName);
  }

  return data;
}

async function savePlayerStats(stats) {
  const { error } = await supabase
    .from("players")
    .upsert(stats, { onConflict: "id" });

  if (error) {
    console.error(error);
  }
}

async function addWin(uid, name = "Jugador") {
  const user = await getPlayerStats(uid, name);

  user.name = user.name || name;
  user.wins = (user.wins || 0) + 1;
  user.games_played = (user.games_played || 0) + 1;
  user.score = (user.score || 0) + 3;

  await savePlayerStats(user);
}

async function addLoss(uid, name = "Jugador") {
  const user = await getPlayerStats(uid, name);

  user.name = user.name || name;
  user.losses = (user.losses || 0) + 1;
  user.games_played = (user.games_played || 0) + 1;

  await savePlayerStats(user);
}

async function addDraw(uid, name = "Jugador") {
  const user = await getPlayerStats(uid, name);

  user.name = user.name || name;
  user.draws = (user.draws || 0) + 1;
  user.games_played = (user.games_played || 0) + 1;
  user.score = (user.score || 0) + 1;

  await savePlayerStats(user);
}

function createUserStats(uid, name = "Jugador") {
  return {
    id: uid,
    name,
    wins: 0,
    losses: 0,
    draws: 0,
    games_played: 0,
    score: 0
  };
}

// ================= RANKING =================

async function loadRanking() {
  const { data: users, error } = await supabase
    .from("players")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    rankingList.innerHTML = "No se pudo cargar el ranking.";
    return;
  }

  if (!users || users.length === 0) {
    rankingList.innerHTML = "Todavía no hay jugadores en el ranking.";
    return;
  }

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