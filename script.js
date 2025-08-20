document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const themeToggle = document.getElementById('themeToggle');
    let cells = [];
    const statusArea = document.getElementById('statusArea');
    const mainMenuButton = document.getElementById('mainMenuButton');
    const resetRoundButton = document.getElementById('resetRoundButton');
    const splashScreen = document.getElementById('splash-screen');
    const boardSizeSelection = document.getElementById('boardSizeSelection');
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const gameBoard = document.getElementById('gameBoard');
    const size3x3Button = document.getElementById('size3x3Button');
    const size4x4Button = document.getElementById('size4x4Button');
    const modeSelection = document.getElementById('modeSelection');
    const pvpNameEntry = document.getElementById('pvpNameEntry');
    const aiNameEntry = document.getElementById('aiNameEntry');
    const markSelection = document.getElementById('markSelection');
    const difficultySelection = document.getElementById('difficultySelection');
    const pvpButton = document.getElementById('pvpButton');
    const pvaButton = document.getElementById('pvaButton');
    const startGamePvpButton = document.getElementById('startGamePvpButton');
    const aiContinueButton = document.getElementById('aiContinueButton');
    const chooseXButton = document.getElementById('chooseXButton');
    const chooseOButton = document.getElementById('chooseOButton');
    const normalButton = document.getElementById('normalButton');
    const hardButton = document.getElementById('hardButton');
    const player1NameInput = document.getElementById('player1NameInput');
    const player2NameInput = document.getElementById('player2NameInput');
    const aiPlayerNameInput = document.getElementById('aiPlayerNameInput');
    const player1ScoreCard = document.getElementById('player1Score');
    const player2ScoreCard = document.getElementById('player2Score');
    const allAppScreens = [boardSizeSelection, mainMenu, gameContainer];
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const tieSound = document.getElementById('tie-sound');

    // --- Game State Variables ---
    let gameState, currentPlayer, gameActive, gameMode, difficulty = null, boardSize = 3;
    let humanPlayerName, player1Name, player2Name;
    let humanScore = 0, aiScore = 0, pvpPlayer1Score = 0, pvpPlayer2Score = 0;
    let humanMark, aiMark;
    let startingPlayer = 'X';
    let winningConditions = [];

    // --- All Functions Are Inside DOMContentLoaded ---
    const playSound = (sound) => {
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    };
    const applyTheme = (theme) => { document.body.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); themeToggle.checked = theme === 'light'; };
    const triggerConfetti = () => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    const transitionTo = (screenToShow) => {
        allAppScreens.forEach(screen => screen.classList.add('hidden'));
        if (screenToShow) screenToShow.classList.remove('hidden');
    };
    const showMenuScreen = (screenToShow) => {
        const screens = mainMenu.querySelectorAll('.screen');
        screens.forEach(s => s.classList.add('hidden'));
        if (screenToShow) screenToShow.classList.remove('hidden');
    };
    const selectBoardSize = (size) => { boardSize = size; transitionTo(mainMenu); showMenuScreen(modeSelection); };
    const startGame = () => { createBoard(); updateScoreboard(); initializeBoard(); transitionTo(gameContainer); };
    const chooseMark = (mark) => {
        humanMark = mark; aiMark = (mark === 'X') ? 'O' : 'X';
        if (difficulty) { selectDifficulty(difficulty); } 
        else { showMenuScreen(difficultySelection); }
    };
    const selectDifficulty = (diff) => {
        difficulty = diff;
        const aiName = `AI (${diff.charAt(0).toUpperCase() + diff.slice(1)})`;
        if (humanMark === 'X') { player1Name = humanPlayerName; player2Name = aiName; } 
        else { player1Name = aiName; player2Name = humanPlayerName; }
        startGame();
    };
    const createBoard = () => {
        gameBoard.innerHTML = '';
        gameBoard.style.setProperty('--grid-size', boardSize);
        for (let i = 0; i < boardSize * boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.cellIndex = i;
            gameBoard.appendChild(cell);
        }
        cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        generateWinningConditions();
    };
    const generateWinningConditions = () => {
        const lines = []; const n = boardSize;
        for (let i = 0; i < n; i++) { const row = []; for (let j = 0; j < n; j++) { row.push(i * n + j); } lines.push(row); }
        for (let i = 0; i < n; i++) { const col = []; for (let j = 0; j < n; j++) { col.push(j * n + i); } lines.push(col); }
        const diag1 = []; const diag2 = [];
        for (let i = 0; i < n; i++) { diag1.push(i * (n + 1)); diag2.push((i + 1) * (n - 1)); } lines.push(diag1); lines.push(diag2);
        winningConditions = lines;
    };
    const updateScoreboard = () => {
        player1ScoreCard.querySelector('.score-name').textContent = player1Name;
        player2ScoreCard.querySelector('.score-name').textContent = player2Name;
        if (gameMode === 'pva') {
            if (humanMark === 'X') { player1ScoreCard.querySelector('.score-value').textContent = humanScore; player2ScoreCard.querySelector('.score-value').textContent = aiScore; } 
            else { player1ScoreCard.querySelector('.score-value').textContent = aiScore; player2ScoreCard.querySelector('.score-value').textContent = humanScore; }
        } else { player1ScoreCard.querySelector('.score-value').textContent = pvpPlayer1Score; player2ScoreCard.querySelector('.score-value').textContent = pvpPlayer2Score; }
    };
    const handleCellClick = (e) => {
        const index = parseInt(e.target.getAttribute('data-cell-index'));
        if (gameState[index] !== "" || !gameActive || (gameMode === 'pva' && currentPlayer === aiMark)) return;
        placeMark(e.target, index); if (checkResult()) return;
        changePlayer();
        if (gameMode === 'pva' && currentPlayer === aiMark) { gameActive = false; setTimeout(makeAIMove, 500); }
    };
    const placeMark = (cell, index) => {
        playSound(clickSound);
        gameState[index] = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
    };
    const changePlayer = () => { currentPlayer = (currentPlayer === 'X') ? 'O' : 'X'; const currentName = (currentPlayer === 'X') ? player1Name : player2Name; statusArea.innerHTML = `${currentName}'s turn`; };
    const checkResult = () => {
        let roundWon = false;
        for (let condition of winningConditions) { if (condition.every(index => gameState[index] === currentPlayer)) { roundWon = true; break; } }
        if (roundWon) {
            gameActive = false;
            const winnerName = (currentPlayer === 'X') ? player1Name : player2Name;
            statusArea.innerHTML = `${winnerName} has won!`;
            if (gameMode === 'pva') { if (currentPlayer === humanMark) humanScore++; else aiScore++; } 
            else { if (currentPlayer === 'X') pvpPlayer1Score++; else pvpPlayer2Score++; }
            updateScoreboard(); 
            triggerConfetti();
            playSound(winSound);
            if (gameMode === 'pvp') { startingPlayer = (startingPlayer === 'X') ? 'O' : 'X'; }
            return true;
        }
        if (!gameState.includes("")) {
            gameActive = false; statusArea.innerHTML = `Game ended in a tie! 🤝`;
            playSound(tieSound);
            if (gameMode === 'pvp') { startingPlayer = (startingPlayer === 'X') ? 'O' : 'X'; }
            return true;
        }
        return false;
    };
    const makeAIMove = () => {
        let move = (difficulty === 'normal') ? getNormalAIMove() : getHardAIMove();
        const cell = document.querySelector(`.cell[data-cell-index='${move}']`);
        placeMark(cell, move); if (checkResult()) { gameActive = false; return; }
        changePlayer(); gameActive = true;
    };
    const getNormalAIMove = () => { let available = gameState.map((c, i) => c === "" ? i : null).filter(v => v !== null); return available[Math.floor(Math.random() * available.length)]; };
    const getHardAIMove = () => {
        const depth = (boardSize === 3) ? 9 : 5;
        return minimax(gameState, aiMark, -Infinity, +Infinity, depth).index;
    };
    const evaluateBoard = (board) => {
        let score = 0;
        for (const condition of winningConditions) {
            const line = condition.map(index => board[index]);
            let aiCount = 0; let humanCount = 0;
            for (const cell of line) { if (cell === aiMark) aiCount++; else if (cell === humanMark) humanCount++; }
            if (humanCount === 0) { score += [0, 1, 10, 100, 10000][aiCount]; }
            if (aiCount === 0) { score -= [0, 1, 10, 100, 10000][humanCount] * 1.5; }
        } return score;
    };
    const minimax = (board, turn, alpha, beta, depth) => {
        const availSpots = board.map((c, i) => c === "" ? i : null).filter(v => v !== null);
        if (checkWinner(board, humanMark)) return { score: -100000 }; if (checkWinner(board, aiMark)) return { score: 100000 };
        if (availSpots.length === 0) return { score: 0 }; if (depth === 0) return { score: evaluateBoard(board) };
        let bestMove;
        if (turn === aiMark) {
            let bestScore = -Infinity;
            for (let spot of availSpots) {
                board[spot] = turn; let result = minimax(board, humanMark, alpha, beta, depth - 1); board[spot] = "";
                if (result.score > bestScore) { bestScore = result.score; bestMove = { index: spot, score: bestScore }; }
                alpha = Math.max(alpha, bestScore); if (beta <= alpha) break;
            } return bestMove;
        } else {
            let bestScore = +Infinity;
            for (let spot of availSpots) {
                board[spot] = turn; let result = minimax(board, aiMark, alpha, beta, depth - 1); board[spot] = "";
                if (result.score < bestScore) { bestScore = result.score; bestMove = { index: spot, score: bestScore }; }
                beta = Math.min(beta, bestScore); if (beta <= alpha) break;
            } return bestMove;
        }
    };
    const checkWinner = (board, turn) => winningConditions.some(c => c.every(i => board[i] === turn));
    const initializeBoard = () => {
        gameActive = true;
        gameState = Array(boardSize * boardSize).fill("");
        currentPlayer = (gameMode === 'pvp') ? startingPlayer : 'X';
        const name = (currentPlayer === 'X') ? player1Name : player2Name;
        statusArea.innerHTML = `${name}'s turn`;
        cells.forEach(cell => cell.classList.remove('x', 'o'));
        if (gameMode === 'pva' && currentPlayer === aiMark) { gameActive = false; setTimeout(makeAIMove, 500); }
    };
    const handleResetRound = () => { if (gameMode === 'pva') { transitionTo(mainMenu); showMenuScreen(markSelection); } else { initializeBoard(); } };
    const returnToMainMenu = () => {
        humanScore = 0; aiScore = 0; pvpPlayer1Score = 0; pvpPlayer2Score = 0; 
        difficulty = null; startingPlayer = 'X';
        player1NameInput.value = ""; player2NameInput.value = ""; aiPlayerNameInput.value = "";
        transitionTo(boardSizeSelection);
    };
    
    // --- Event Listeners ---
    themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked ? 'light' : 'dark'));
    size3x3Button.addEventListener('click', () => selectBoardSize(3));
    size4x4Button.addEventListener('click', () => selectBoardSize(4));
    pvpButton.addEventListener('click', () => { gameMode = 'pvp'; showMenuScreen(pvpNameEntry); });
    pvaButton.addEventListener('click', () => { gameMode = 'pva'; showMenuScreen(aiNameEntry); });
    startGamePvpButton.addEventListener('click', () => { player1Name = player1NameInput.value || 'Player 1'; player2Name = player2NameInput.value || 'Player 2'; startGame(); });
    aiContinueButton.addEventListener('click', () => { humanPlayerName = aiPlayerNameInput.value || 'Player'; showMenuScreen(markSelection); });
    chooseXButton.addEventListener('click', () => chooseMark('X'));
    chooseOButton.addEventListener('click', () => chooseMark('O'));
    normalButton.addEventListener('click', () => selectDifficulty('normal'));
    hardButton.addEventListener('click', () => selectDifficulty('hard'));
    mainMenuButton.addEventListener('click', returnToMainMenu);
    resetRoundButton.addEventListener('click', handleResetRound);

    // Universal click sound for all buttons and the theme toggle
    document.body.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' || event.target.closest('.theme-switcher')) {
            playSound(clickSound);
        }
    });

    // --- Splash Screen ---
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            transitionTo(boardSizeSelection);
        }, 500);
    }, 2500);
});