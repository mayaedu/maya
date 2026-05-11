const TOTAL_LEVELS = 100;

function getDifficultyByLevel(levelNumber) {
  if (levelNumber <= 10) {
    return {
      name: "Fácil",
      size: 4,
      arrows: 5,
      mistakePenalty: 0,
      baseBonus: 100,
      minBlockedArrows: 0,
      maxAvailableMovesAtStart: 5,
      minSolutionSteps: 5,
      maxAttempts: 800
    };
  }

  if (levelNumber <= 25) {
    return {
      name: "Medio",
      size: 5,
      arrows: 10,
      mistakePenalty: 2,
      baseBonus: 220,
      minBlockedArrows: 3,
      maxAvailableMovesAtStart: 5,
      minSolutionSteps: 10,
      maxAttempts: 1400
    };
  }

  if (levelNumber <= 45) {
    return {
      name: "Difícil",
      size: 6,
      arrows: 16,
      mistakePenalty: 5,
      baseBonus: 380,
      minBlockedArrows: 7,
      maxAvailableMovesAtStart: 4,
      minSolutionSteps: 16,
      maxAttempts: 2200
    };
  }

  if (levelNumber <= 70) {
    return {
      name: "Avanzado",
      size: 7,
      arrows: 24,
      mistakePenalty: 8,
      baseBonus: 600,
      minBlockedArrows: 12,
      maxAvailableMovesAtStart: 3,
      minSolutionSteps: 24,
      maxAttempts: 3500
    };
  }

  if (levelNumber <= 90) {
    return {
      name: "Experto",
      size: 8,
      arrows: 34,
      mistakePenalty: 12,
      baseBonus: 900,
      minBlockedArrows: 20,
      maxAvailableMovesAtStart: 3,
      minSolutionSteps: 34,
      maxAttempts: 5000
    };
  }

  return {
    name: "Maestro",
    size: 9,
    arrows: 45,
    mistakePenalty: 16,
    baseBonus: 1300,
    minBlockedArrows: 30,
    maxAvailableMovesAtStart: 2,
    minSolutionSteps: 45,
    maxAttempts: 7000
  };
}

function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getRandomDirection() {
  return getRandomItem(["up", "down", "left", "right"]);
}

function getAllPositions(size) {
  const positions = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push({ row, col });
    }
  }

  return positions;
}

function getAllEmptyPositions(board) {
  const positions = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      if (!board[row][col]) {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

function canArrowExitFromBoard(board, row, col, direction) {
  let r = row;
  let c = col;
  const size = board.length;

  while (true) {
    if (direction === "up") r--;
    if (direction === "down") r++;
    if (direction === "left") c--;
    if (direction === "right") c++;

    if (r < 0 || r >= size || c < 0 || c >= size) {
      return true;
    }

    if (board[r][c]) {
      return false;
    }
  }
}

function countBlockedArrows(board) {
  let blocked = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const direction = board[row][col];

      if (!direction) continue;

      if (!canArrowExitFromBoard(board, row, col, direction)) {
        blocked++;
      }
    }
  }

  return blocked;
}

function countAvailableMoves(board) {
  let available = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const direction = board[row][col];

      if (!direction) continue;

      if (canArrowExitFromBoard(board, row, col, direction)) {
        available++;
      }
    }
  }

  return available;
}

function getAvailableMoves(board) {
  const moves = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const direction = board[row][col];

      if (!direction) continue;

      if (canArrowExitFromBoard(board, row, col, direction)) {
        moves.push({ row, col, direction });
      }
    }
  }

  return moves;
}

/*
  Esta función intenta resolver el tablero.
  Si puede resolverlo, devuelve la solución.
  Si no puede, devuelve null.
*/
function getSolutionSteps(originalBoard) {
  const tempBoard = originalBoard.map(row => [...row]);
  const solution = [];

  let safety = 0;

  while (safety < 1000) {
    safety++;

    const availableMoves = getAvailableMoves(tempBoard);

    if (availableMoves.length === 0) {
      break;
    }

    /*
      Para que el análisis sea más estricto,
      quitamos solo UNA flecha por vuelta.
      Esto ayuda a medir mejor si el nivel tiene cadena de dependencia.
    */
    const selectedMove = availableMoves[0];

    solution.push(selectedMove);
    tempBoard[selectedMove.row][selectedMove.col] = "";
  }

  const remaining = tempBoard.flat().filter(cell => cell !== "").length;

  if (remaining > 0) {
    return null;
  }

  return solution;
}

function isSolvable(board) {
  return getSolutionSteps(board) !== null;
}

/*
  Mide qué tan complejo es un nivel.
  Mayor puntaje = más difícil.
*/
function calculateComplexityScore(board, solution) {
  const totalArrows = board.flat().filter(cell => cell !== "").length;
  const blocked = countBlockedArrows(board);
  const availableAtStart = countAvailableMoves(board);

  let score = 0;

  score += totalArrows * 4;
  score += blocked * 8;
  score += solution.length * 3;

  /*
    Menos movimientos disponibles al inicio = más difícil.
  */
  score += Math.max(0, 8 - availableAtStart) * 12;

  /*
    Penaliza tableros demasiado abiertos.
  */
  if (availableAtStart > totalArrows * 0.45) {
    score -= 40;
  }

  return score;
}

/*
  Generador básico aleatorio.
*/
function generateRandomBoard(difficulty) {
  const board = createEmptyBoard(difficulty.size);
  const positions = shuffleArray(getAllPositions(difficulty.size));

  let placed = 0;

  for (const pos of positions) {
    if (placed >= difficulty.arrows) break;

    board[pos.row][pos.col] = getRandomDirection();
    placed++;
  }

  return board;
}

/*
  Generador con “zonas densas”.
  Esto crea grupos de flechas más cercanas entre sí,
  lo que provoca más bloqueos y dependencia.
*/
function generateDenseBoard(difficulty) {
  const board = createEmptyBoard(difficulty.size);
  const size = difficulty.size;

  const center = {
    row: Math.floor(size / 2),
    col: Math.floor(size / 2)
  };

  const positions = getAllPositions(size).sort((a, b) => {
    const distA = Math.abs(a.row - center.row) + Math.abs(a.col - center.col);
    const distB = Math.abs(b.row - center.row) + Math.abs(b.col - center.col);

    return distA - distB + (Math.random() - 0.5);
  });

  let placed = 0;

  for (const pos of positions) {
    if (placed >= difficulty.arrows) break;

    board[pos.row][pos.col] = getDirectionTowardCrowd(pos.row, pos.col, size);
    placed++;
  }

  return board;
}

/*
  Las flechas tienden a apuntar hacia zonas donde probablemente
  haya otras flechas, creando más bloqueos.
*/
function getDirectionTowardCrowd(row, col, size) {
  const directions = [];

  if (row < size / 2) directions.push("down");
  if (row >= size / 2) directions.push("up");
  if (col < size / 2) directions.push("right");
  if (col >= size / 2) directions.push("left");

  directions.push(getRandomDirection());

  return getRandomItem(directions);
}

/*
  Generador mixto:
  En niveles bajos usa aleatorio.
  En niveles altos usa tableros densos y complejos.
*/
function generateCandidateBoard(difficulty, levelNumber) {
  if (levelNumber <= 20) {
    return generateRandomBoard(difficulty);
  }

  if (levelNumber <= 50) {
    return Math.random() < 0.55
      ? generateDenseBoard(difficulty)
      : generateRandomBoard(difficulty);
  }

  return Math.random() < 0.8
    ? generateDenseBoard(difficulty)
    : generateRandomBoard(difficulty);
}

/*
  Crea un nivel buscando el tablero más complejo encontrado
  dentro del número de intentos permitido.
*/
function generateSolvableLevel(levelNumber) {
  const difficulty = getDifficultyByLevel(levelNumber);

  let bestBoard = null;
  let bestSolution = null;
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < difficulty.maxAttempts; attempt++) {
    const candidateBoard = generateCandidateBoard(difficulty, levelNumber);
    const solution = getSolutionSteps(candidateBoard);

    if (!solution) continue;

    const blockedArrows = countBlockedArrows(candidateBoard);
    const availableMoves = countAvailableMoves(candidateBoard);

    if (blockedArrows < difficulty.minBlockedArrows) continue;
    if (availableMoves > difficulty.maxAvailableMovesAtStart) continue;
    if (solution.length < difficulty.minSolutionSteps) continue;

    const complexityScore = calculateComplexityScore(candidateBoard, solution);

    if (complexityScore > bestScore) {
      bestScore = complexityScore;
      bestBoard = candidateBoard;
      bestSolution = solution;
    }
  }

  /*
    Si no encuentra uno perfecto, genera uno más simple pero solucionable.
  */
  if (!bestBoard) {
    return generateFallbackLevel(levelNumber, difficulty);
  }

  return {
    number: levelNumber,
    difficulty: difficulty.name,
    size: difficulty.size,
    arrows: difficulty.arrows,
    mistakePenalty: difficulty.mistakePenalty,
    baseBonus: difficulty.baseBonus,
    complexityScore: bestScore,
    solution: bestSolution,
    board: bestBoard
  };
}

function generateFallbackLevel(levelNumber, difficulty) {
  let board = null;
  let solution = null;

  for (let attempt = 0; attempt < 1000; attempt++) {
    const candidateBoard = generateRandomBoard(difficulty);
    const candidateSolution = getSolutionSteps(candidateBoard);

    if (candidateSolution) {
      board = candidateBoard;
      solution = candidateSolution;
      break;
    }
  }

  if (!board) {
    board = createEasySolvableBoard(difficulty);
    solution = getSolutionSteps(board) || [];
  }

  return {
    number: levelNumber,
    difficulty: difficulty.name,
    size: difficulty.size,
    arrows: difficulty.arrows,
    mistakePenalty: difficulty.mistakePenalty,
    baseBonus: difficulty.baseBonus,
    complexityScore: calculateComplexityScore(board, solution),
    solution,
    board
  };
}

/*
  Último respaldo:
  Crea un tablero muy simple con flechas que sí pueden salir.
*/
function createEasySolvableBoard(difficulty) {
  const board = createEmptyBoard(difficulty.size);
  const positions = shuffleArray(getAllPositions(difficulty.size));

  let placed = 0;

  for (const pos of positions) {
    if (placed >= difficulty.arrows) break;

    const directions = shuffleArray(["up", "down", "left", "right"]);

    for (const direction of directions) {
      board[pos.row][pos.col] = direction;

      if (canArrowExitFromBoard(board, pos.row, pos.col, direction)) {
        placed++;
        break;
      }

      board[pos.row][pos.col] = "";
    }
  }

  return board;
}

const LEVEL_CACHE = {};

function getLevel(index) {
  if (!LEVEL_CACHE[index]) {
    LEVEL_CACHE[index] = generateSolvableLevel(index + 1);
  }

  return LEVEL_CACHE[index];
}

function getTotalLevels() {
  return TOTAL_LEVELS;
}

const LEVELS = generateAllLevels();