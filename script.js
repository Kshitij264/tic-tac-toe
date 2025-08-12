document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const themeToggle = document.getElementById('themeToggle');
    const cells = document.querySelectorAll('.cell');
    const statusArea = document.getElementById('statusArea');
    const mainMenuButton = document.getElementById('mainMenuButton');
    const resetRoundButton = document.getElementById('resetRoundButton');
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const lineSVG = document.getElementById('line-svg');
    const winningLine = document.getElementById('winning-line');
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

    // --- Game State Variables ---
    let gameState, currentPlayer, gameActive, gameMode, difficulty = null;
    let humanPlayerName, player1Name, player2Name;
    let humanScore = 0, aiScore = 0, pvpPlayer1Score = 0, pvpPlayer2Score = 0;
    let humanMark, aiMark;
    let startingPlayer = 'X';
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    const cellCenterCoords = [
        { x: '16.67%', y: '16.67%' }, { x: '50%', y: '16.67%' }, { x: '83.33%', y: '16.67%' },
        { x: '16.67%', y: '50%' },    { x: '50%', y: '50%' },    { x: '83.33%', y: '50%' },
        { x: '16.67%', y: '83.33%' }, { x: '50%', y: '83.33%' }, { x: '83.33%', y: '83.33%' }
    ];

    // --- Theme & Confetti Logic ---
    const applyTheme = (theme) => { document.body.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); themeToggle.checked = theme === 'light'; };
    themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked ? 'light' : 'dark'));
    applyTheme(localStorage.getItem('theme') || 'dark');
    const triggerConfetti = () => confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    // --- Game Setup ---
    const showScreen = (screen) => { [modeSelection, pvpNameEntry, aiNameEntry, markSelection, difficultySelection].forEach(s => s.classList.add('hidden')); screen.classList.remove('hidden'); };
    const startGame = () => { updateScoreboard(); initializeBoard(); mainMenu.classList.add('hidden'); gameContainer.classList.remove('hidden'); };
    
    pvpButton.addEventListener('click', () => { gameMode = 'pvp'; showScreen(pvpNameEntry); });
    pvaButton.addEventListener('click', () => { gameMode = 'pva'; showScreen(aiNameEntry); });
    
    startGamePvpButton.addEventListener('click', () => {
        player1Name = player1NameInput.value || 'Player 1';
        player2Name = player2NameInput.value || 'Player 2';
        startGame();
    });
    
    aiContinueButton.addEventListener('click', () => {
        humanPlayerName = aiPlayerNameInput.value || 'Player';
        showScreen(markSelection);
    });

    const chooseMark = (mark) => {
        humanMark = mark;
        aiMark = (mark === 'X') ? 'O' : 'X';
        if (difficulty) { selectDifficulty(difficulty); } 
        else { showScreen(difficultySelection); }
    };
    chooseXButton.addEventListener('click', () => chooseMark('X'));
    chooseOButton.addEventListener('click', () => chooseMark('O'));

    const selectDifficulty = (diff) => {
        difficulty = diff;
        const aiName = `AI (${diff.charAt(0).toUpperCase() + diff.slice(1)})`;
        if (humanMark === 'X') { player1Name = humanPlayerName; player2Name = aiName; } 
        else { player1Name = aiName; player2Name = humanPlayerName; }
        startGame();
    };
    normalButton.addEventListener('click', () => selectDifficulty('normal'));
    hardButton.addEventListener('click', () => selectDifficulty('hard'));

    // --- Scoreboard ---
    const updateScoreboard = () => {
        player1ScoreCard.querySelector('.score-name').textContent = player1Name;
        player2ScoreCard.querySelector('.score-name').textContent = player2Name;
        if (gameMode === 'pva') {
            if (humanMark === 'X') { player1ScoreCard.querySelector('.score-value').textContent = humanScore; player2ScoreCard.querySelector('.score-value').textContent = aiScore; } 
            else { player1ScoreCard.querySelector('.score-value').textContent = aiScore; player2ScoreCard.querySelector('.score-value').textContent = humanScore; }
        } else { player1ScoreCard.querySelector('.score-value').textContent = pvpPlayer1Score; player2ScoreCard.querySelector('.score-value').textContent = pvpPlayer2Score; }
    };
    
    // --- Core Game Logic ---
    const handleCellClick = (e) => {
        const index = parseInt(e.target.getAttribute('data-cell-index'));
        if (gameState[index] !== "" || !gameActive || (gameMode === 'pva' && currentPlayer === aiMark)) return;
        placeMark(e.target, index); if (checkResult()) return;
        changePlayer();
        if (gameMode === 'pva' && currentPlayer === aiMark) { gameActive = false; setTimeout(makeAIMove, 500); }
    };
    const placeMark = (cell, index) => { gameState[index] = currentPlayer; cell.classList.add(currentPlayer.toLowerCase()); };
    const changePlayer = () => { currentPlayer = (currentPlayer === 'X') ? 'O' : 'X'; const currentName = (currentPlayer === 'X') ? player1Name : player2Name; statusArea.innerHTML = `${currentName}'s turn`; };
    const checkResult = () => {
        let roundWon = false, winningCombo = [];
        for (let condition of winningConditions) { if (condition.every(index => gameState[index] === currentPlayer)) { roundWon = true; winningCombo = condition; break; } }
        if (roundWon) {
            gameActive = false;
            const winnerName = (currentPlayer === 'X') ? player1Name : player2Name;
            statusArea.innerHTML = `${winnerName} has won!`;
            if (gameMode === 'pva') { if (currentPlayer === humanMark) humanScore++; else aiScore++; } 
            else { if (currentPlayer === 'X') pvpPlayer1Score++; else pvpPlayer2Score++; }
            updateScoreboard(); drawWinningLine(winningCombo); triggerConfetti();
            if (gameMode === 'pvp') { startingPlayer = (startingPlayer === 'X') ? 'O' : 'X'; }
            return true;
        }
        if (!gameState.includes("")) {
            gameActive = false; statusArea.innerHTML = `Game ended in a tie! 🤝`;
            if (gameMode === 'pvp') { startingPlayer = (startingPlayer === 'X') ? 'O' : 'X'; }
            return true;
        }
        return false;
    };
    const drawWinningLine = (combo) => {
        const startCell = cellCenterCoords[combo[0]], endCell = cellCenterCoords[combo[2]];
        winningLine.setAttribute('x1', startCell.x); winningLine.setAttribute('y1', startCell.y);
        winningLine.setAttribute('x2', endCell.x); winningLine.setAttribute('y2', endCell.y);
        winningLine.style.strokeDasharray = 1000; winningLine.style.strokeDashoffset = 1000;
        lineSVG.classList.remove('hidden');
        setTimeout(() => { winningLine.style.strokeDashoffset = 0; }, 10);
    };

    // --- AI Logic ---
    const makeAIMove = () => {
        let move = (difficulty === 'normal') ? getNormalAIMove() : getHardAIMove();
        const cell = document.querySelector(`.cell[data-cell-index='${move}']`);
        placeMark(cell, move); if (checkResult()) { gameActive = false; return; }
        changePlayer(); gameActive = true;
    };
    const getNormalAIMove = () => { let available = gameState.map((c, i) => c === "" ? i : null).filter(v => v !== null); return available[Math.floor(Math.random() * available.length)]; };
    const getHardAIMove = () => minimax(gameState, aiMark).index;
    const minimax = (board, turn) => {
        const availSpots = board.map((c, i) => c === "" ? i : null).filter(v => v !== null);
        if (checkWinner(board, humanMark)) return { score: -10 }; if (checkWinner(board, aiMark)) return { score: 10 }; if (availSpots.length === 0) return { score: 0 };
        const moves = [];
        for (let spot of availSpots) {
            const move = { index: spot }; board[spot] = turn; move.score = minimax(board, turn === aiMark ? humanMark : aiMark).score; board[spot] = ""; moves.push(move);
        }
        let bestMove;
        if (turn === aiMark) { let bestScore = -10000; moves.forEach((move, i) => { if (move.score > bestScore) { bestScore = move.score; bestMove = i; } });
        } else { let bestScore = 10000; moves.forEach((move, i) => { if (move.score < bestScore) { bestScore = move.score; bestMove = i; } }); }
        return moves[bestMove];
    };
    const checkWinner = (board, turn) => winningConditions.some(c => c.every(i => board[i] === turn));

    // --- Board & Menu Logic ---
    const initializeBoard = () => {
        gameActive = true;
        gameState = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = (gameMode === 'pvp') ? startingPlayer : 'X';
        const name = (currentPlayer === 'X') ? player1Name : player2Name;
        statusArea.innerHTML = `${name}'s turn`;
        cells.forEach(cell => cell.classList.remove('x', 'o'));
        lineSVG.classList.add('hidden');
        if (gameMode === 'pva' && currentPlayer === aiMark) { gameActive = false; setTimeout(makeAIMove, 500); }
    };
    const handleResetRound = () => { if (gameMode === 'pva') { gameContainer.classList.add('hidden'); mainMenu.classList.remove('hidden'); showScreen(markSelection); } else { initializeBoard(); } };
    const returnToMainMenu = () => {
        humanScore = 0; aiScore = 0; pvpPlayer1Score = 0; pvpPlayer2Score = 0; 
        difficulty = null; startingPlayer = 'X';
        gameActive = false;
        gameContainer.classList.add('hidden');
        player1NameInput.value = ""; player2NameInput.value = ""; aiPlayerNameInput.value = "";
        showScreen(modeSelection);
        mainMenu.classList.remove('hidden');
    };
    
    // --- Event Listeners & Splash Screen ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    mainMenuButton.addEventListener('click', returnToMainMenu);
    resetRoundButton.addEventListener('click', handleResetRound);

    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        mainMenu.classList.add('visible');
    }, 2500); // Start fade-out of splash after 2.5s
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 3000); // Remove splash screen completely after 3s
});