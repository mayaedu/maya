// ===============================
// MOTOR IA - CONECTA 4
// ===============================

const ROWS = 6;
const COLS = 7;

const AI_PLAYER = 2;
const HUMAN_PLAYER = 1;

// Profundidad recomendada:
// 3 = rápida
// 4 = más inteligente
// 5 = más pesada
const DEFAULT_DEPTH = 4;

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================

export function getAIMove(board, difficulty = "medium") {
  const depth = getDepthByDifficulty(difficulty);

  const validCols = getValidColumns(board);

  if (validCols.length === 0) return null;

  // 1. Si la IA puede ganar, lo hace
  for (const col of validCols) {
    const tempBoard = cloneBoard(board);
    const row = getAvailableRow(tempBoard, col);

    tempBoard[row][col] = AI_PLAYER;

    if (checkWin(tempBoard, row, col, AI_PLAYER)) {
      return col;
    }
  }

  // 2. Si el humano puede ganar, lo bloquea
  for (const col of validCols) {
    const tempBoard = cloneBoard(board);
    const row = getAvailableRow(tempBoard, col);

    tempBoard[row][col] = HUMAN_PLAYER;

    if (checkWin(tempBoard, row, col, HUMAN_PLAYER)) {
      return col;
    }
  }

  // 3. Usar minimax con poda alfa-beta
  let bestScore = -Infinity;
  let bestCols = [];

  for (const col of validCols) {
    const tempBoard = cloneBoard(board);
    const row = getAvailableRow(tempBoard, col);

    tempBoard[row][col] = AI_PLAYER;

    const score = minimax(
      tempBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false
    );

    if (score > bestScore) {
      bestScore = score;
      bestCols = [col];
    } else if (score === bestScore) {
      bestCols.push(col);
    }
  }

  return chooseBestColumn(bestCols);
}

// ===============================
// DIFICULTAD
// ===============================

function getDepthByDifficulty(difficulty) {
  if (difficulty === "easy") return 2;
  if (difficulty === "hard") return 5;

  return DEFAULT_DEPTH;
}

// ===============================
// MINIMAX
// ===============================

function minimax(board, depth, alpha, beta, maximizingPlayer) {
  const result = getGameResult(board);

  if (result.finished || depth === 0) {
    return evaluateBoard(board, result);
  }

  const validCols = getValidColumns(board);

  if (maximizingPlayer) {
    let value = -Infinity;

    for (const col of validCols) {
      const tempBoard = cloneBoard(board);
      const row = getAvailableRow(tempBoard, col);

      tempBoard[row][col] = AI_PLAYER;

      const score = minimax(
        tempBoard,
        depth - 1,
        alpha,
        beta,
        false
      );

      value = Math.max(value, score);
      alpha = Math.max(alpha, value);

      if (alpha >= beta) break;
    }

    return value;
  } else {
    let value = Infinity;

    for (const col of validCols) {
      const tempBoard = cloneBoard(board);
      const row = getAvailableRow(tempBoard, col);

      tempBoard[row][col] = HUMAN_PLAYER;

      const score = minimax(
        tempBoard,
        depth - 1,
        alpha,
        beta,
        true
      );

      value = Math.min(value, score);
      beta = Math.min(beta, value);

      if (alpha >= beta) break;
    }

    return value;
  }
}

// ===============================
// EVALUACIÓN DEL TABLERO
// ===============================

function evaluateBoard(board, result) {
  if (result.finished) {
    if (result.winner === AI_PLAYER) return 100000;
    if (result.winner === HUMAN_PLAYER) return -100000;
    return 0;
  }

  let score = 0;

  // Dar valor extra al centro
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;

  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === AI_PLAYER) centerCount++;
  }

  score += centerCount * 6;

  // Evaluar todas las ventanas de 4
  score += evaluateAllWindows(board);

  return score;
}

function evaluateAllWindows(board) {
  let score = 0;

  // Horizontales
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [
        board[r][c],
        board[r][c + 1],
        board[r][c + 2],
        board[r][c + 3]
      ];

      score += evaluateWindow(window);
    }
  }

  // Verticales
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const window = [
        board[r][c],
        board[r + 1][c],
        board[r + 2][c],
        board[r + 3][c]
      ];

      score += evaluateWindow(window);
    }
  }

  // Diagonal \
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [
        board[r][c],
        board[r + 1][c + 1],
        board[r + 2][c + 2],
        board[r + 3][c + 3]
      ];

      score += evaluateWindow(window);
    }
  }

  // Diagonal /
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const window = [
        board[r][c],
        board[r - 1][c + 1],
        board[r - 2][c + 2],
        board[r - 3][c + 3]
      ];

      score += evaluateWindow(window);
    }
  }

  return score;
}

function evaluateWindow(window) {
  const aiCount = window.filter(cell => cell === AI_PLAYER).length;
  const humanCount = window.filter(cell => cell === HUMAN_PLAYER).length;
  const emptyCount = window.filter(cell => cell === 0).length;

  let score = 0;

  if (aiCount === 4) score += 10000;
  else if (aiCount === 3 && emptyCount === 1) score += 120;
  else if (aiCount === 2 && emptyCount === 2) score += 20;

  if (humanCount === 4) score -= 10000;
  else if (humanCount === 3 && emptyCount === 1) score -= 160;
  else if (humanCount === 2 && emptyCount === 2) score -= 25;

  return score;
}

// ===============================
// RESULTADO DEL JUEGO
// ===============================

function getGameResult(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];

      if (player !== 0 && checkWin(board, r, c, player)) {
        return {
          finished: true,
          winner: player
        };
      }
    }
  }

  if (isBoardFull(board)) {
    return {
      finished: true,
      winner: null
    };
  }

  return {
    finished: false,
    winner: null
  };
}

// ===============================
// UTILIDADES
// ===============================

function getValidColumns(board) {
  const cols = [];

  // Orden estratégico: centro primero
  const preferredOrder = [3, 2, 4, 1, 5, 0, 6];

  for (const col of preferredOrder) {
    if (board[0][col] === 0) {
      cols.push(col);
    }
  }

  return cols;
}

function chooseBestColumn(cols) {
  if (!cols || cols.length === 0) return null;

  // Si entre las mejores está el centro, elegirlo
  if (cols.includes(3)) return 3;

  return cols[Math.floor(Math.random() * cols.length)];
}

function getAvailableRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }

  return -1;
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function isBoardFull(board) {
  return board.every(row =>
    row.every(cell => cell !== 0)
  );
}

function checkWin(board, row, col, player) {
  return (
    checkDirection(board, row, col, player, 1, 0) ||
    checkDirection(board, row, col, player, 0, 1) ||
    checkDirection(board, row, col, player, 1, 1) ||
    checkDirection(board, row, col, player, 1, -1)
  );
}

function checkDirection(board, row, col, player, dr, dc) {
  let count = 1;

  count += countCells(board, row, col, player, dr, dc);
  count += countCells(board, row, col, player, -dr, -dc);

  return count >= 4;
}

function countCells(board, row, col, player, dr, dc) {
  let r = row + dr;
  let c = col + dc;
  let count = 0;

  while (
    r >= 0 &&
    r < ROWS &&
    c >= 0 &&
    c < COLS &&
    board[r][c] === player
  ) {
    count++;

    r += dr;
    c += dc;
  }

  return count;
}