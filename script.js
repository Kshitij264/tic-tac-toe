const startMenu = document.getElementById("startMenu");
const playerModeBtn = document.getElementById("playerMode");
const aiModeBtn = document.getElementById("aiMode");
const difficultyMenu = document.getElementById("difficultyMenu");
const easyModeBtn = document.getElementById("easyMode");
const hardModeBtn = document.getElementById("hardMode");
const namePrompt = document.getElementById("namePrompt");
const player1Input = document.getElementById("player1Name");
const player2Input = document.getElementById("player2Name");
const startGameButton = document.getElementById("startGameButton");
const gameContainer = document.getElementById("gameContainer");
const cells = document.querySelectorAll(".cell");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const themeToggle = document.getElementById("themeToggle");
const player1ScoreSpan = document.getElementById("player1Score");
const player2ScoreSpan = document.getElementById("player2Score");
const drawScoreSpan = document.getElementById("drawScore");
const player1ScoreName = document.getElementById("player1ScoreName");
const player2ScoreName = document.getElementById("player2ScoreName");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isAI = false;
let difficulty = "easy";
let scores = { X: 0, O: 0, draw: 0 };
let players = { X: "Player 1", O: "Player 2" };

playerModeBtn.addEventListener("click", () => {
  isAI = false;
  startMenu.style.display = "none";
  player2Input.style.display = "block";
  namePrompt.style.display = "block";
});

aiModeBtn.addEventListener("click", () => {
  isAI = true;
  startMenu.style.display = "none";
  difficultyMenu.style.display = "block";
});

easyModeBtn.addEventListener("click", () => {
  difficulty = "easy";
  difficultyMenu.style.display = "none";
  player2Input.style.display = "none";
  namePrompt.style.display = "block";
});

hardModeBtn.addEventListener("click", () => {
  difficulty = "hard";
  difficultyMenu.style.display = "none";
  player2Input.style.display = "none";
  namePrompt.style.display = "block";
});

startGameButton.addEventListener("click", () => {
  players.X = player1Input.value || "Player 1";
  players.O = isAI ? "AI" : player2Input.value || "Player 2";
  player1ScoreName.textContent = players.X;
  player2ScoreName.textContent = players.O;
  namePrompt.style.display = "none";
  gameContainer.style.display = "block";
  renderBoard();
});

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => handleMove(index));
});

resetBtn.addEventListener("click", resetGame);

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

function handleMove(index) {
  if (board[index] || checkWinner()) return;
  board[index] = currentPlayer;
  renderBoard();
  const winner = checkWinner();
  if (winner) {
    showMessage(winner === "draw" ? "It's a draw!" : `${players[winner]} wins!`);
    updateScores(winner);
    return;
  }
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  if (isAI && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function renderBoard() {
  board.forEach((val, i) => {
    cells[i].textContent = val;
  });
}

function showMessage(msg) {
  message.textContent = msg;
}

function updateScores(winner) {
  if (winner === "draw") {
    scores.draw++;
    drawScoreSpan.textContent = scores.draw;
  } else {
    scores[winner]++;
    player1ScoreSpan.textContent = scores.X;
    player2ScoreSpan.textContent = scores.O;
  }
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  renderBoard();
  showMessage("");
}

function checkWinner() {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let pattern of winPatterns) {
    const [a,b,c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes("") ? null : "draw";
}

function aiMove() {
  let move;
  if (difficulty === "easy") {
    let available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    move = available[Math.floor(Math.random() * available.length)];
  } else {
    move = minimax(board, "O").index;
  }
  handleMove(move);
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
  const winner = checkWinner();
  if (winner === "X") return { score: -10 };
  if (winner === "O") return { score: 10 };
  if (winner === "draw") return { score: 0 };

  let moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    let result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }
  return bestMove;
}