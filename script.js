// Add timer, looping functionality, flagging capability, fastest time tracking, and restart button to the Minesweeper game

let boardSize = 10;
let mineCount = 10;
let board = [];
let minePositions = [];
let timerInterval;
let timeElapsed = 0;
let gameOver = false;
let fastestTime = localStorage.getItem('fastestTime') ? parseInt(localStorage.getItem('fastestTime')) : null;

const gameBoard = document.getElementById('game-board');
const timerDisplay = document.createElement('div');
timerDisplay.id = 'timer';
const fastestTimeDisplay = document.createElement('div');
fastestTimeDisplay.id = 'fastest-time';
const restartButton = document.createElement('button');
restartButton.id = 'restart-button';
restartButton.textContent = '🔄 Restart';
restartButton.addEventListener('click', initBoard);

document.body.insertBefore(timerDisplay, gameBoard);
document.body.insertBefore(fastestTimeDisplay, gameBoard);
document.body.insertBefore(restartButton, gameBoard);

function initBoard() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    gameOver = false;
    updateTimerDisplay();
    updateFastestTimeDisplay();
    timerInterval = setInterval(updateTimer, 1000);
    
    board = Array(boardSize).fill().map(() => Array(boardSize).fill().map(() => ({ revealed: false, mine: false, adjacentMines: 0, flagged: false })));
    generateMines();
    calculateAdjacentMines();
    renderBoard();
}

function updateTimer() {
    timeElapsed++;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    timerDisplay.textContent = `Time Elapsed: ${timeElapsed} seconds`;
}

function updateFastestTimeDisplay() {
    if (fastestTime !== null) {
        fastestTimeDisplay.textContent = `Fastest Time: ${fastestTime} seconds`;
    } else {
        fastestTimeDisplay.textContent = 'Fastest Time: N/A';
    }
}

function generateMines() {
    minePositions = [];
    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col].mine) {
            board[row][col].mine = true;
            minePositions.push([row, col]);
        }
    }
}

function calculateAdjacentMines() {
    const directions = [-1, 0, 1];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].mine) continue;

            let adjacentMines = 0;
            for (let dx of directions) {
                for (let dy of directions) {
                    if (dx === 0 && dy === 0) continue;
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                        if (board[newRow][newCol].mine) {
                            adjacentMines++;
                        }
                    }
                }
            }
            board[row][col].adjacentMines = adjacentMines;
        }
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell.revealed) {
                cellElement.textContent = cell.mine ? '💣' : cell.adjacentMines || '';
                if (cell.mine) cellElement.classList.add('mine');
                else cellElement.classList.add('revealed');
            } else if (cell.flagged) {
                cellElement.textContent = '🚩';
            }
            
            // Left-click to reveal cell
            cellElement.addEventListener('click', () => revealCell(i, j));
            
            // Right-click to flag/unflag cell
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(i, j);
            });

            gameBoard.appendChild(cellElement);
        });
    });
}

function revealCell(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

    const cell = board[row][col];
    cell.revealed = true;

    if (cell.mine) {
        gameOver = true;
        clearInterval(timerInterval);
        revealAllMines();
        alert('Game Over!');
    } else if (cell.adjacentMines === 0) {
        revealAdjacentCells(row, col);
    }

    renderBoard();

    // Check if player has won
    if (checkWin()) {
        gameOver = true;
        clearInterval(timerInterval);
        if (fastestTime === null || timeElapsed < fastestTime) {
            fastestTime = timeElapsed;
            localStorage.setItem('fastestTime', fastestTime);
        }
        alert('Congratulations! You Win!');
    }
}

function toggleFlag(row, col) {
    if (gameOver || board[row][col].revealed) return;

    board[row][col].flagged = !board[row][col].flagged;
    renderBoard();

    // Check if player has won
    if (checkWin()) {
        gameOver = true;
        clearInterval(timerInterval);
        if (fastestTime === null || timeElapsed < fastestTime) {
            fastestTime = timeElapsed;
            localStorage.setItem('fastestTime', fastestTime);
        }
        alert('Congratulations! You Win!');
    }
}

function revealAllMines() {
    board.forEach(row => {
        row.forEach(cell => {
            if (cell.mine) {
                cell.revealed = true;
            }
        });
    });
}

function revealAdjacentCells(row, col) {
    const directions = [-1, 0, 1];
    for (let dx of directions) {
        for (let dy of directions) {
            if (dx === 0 && dy === 0) continue;
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !board[newRow][newCol].revealed) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function checkWin() {
    return board.every(row => row.every(cell => (cell.revealed && !cell.mine) || (cell.flagged && cell.mine)));
}

// Add a loop to restart the game automatically if the player chooses to play again
initBoard();
