const boardSize = 10; // 棋盘大小
const mineCount = 10; // 地雷数量
let board = [];
let gameOver = false;

const gameBoard = document.getElementById('game-board');

// 初始化棋盘
function initBoard() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    gameOver = false;
    generateMines();
    calculateAdjacentMines();
    renderBoard();
}

// 生成地雷
function generateMines() {
    let minePositions = [];
    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        if (!board[row][col]) {
            board[row][col] = {
                revealed: false,
                mine: true,
                adjacentMines: 0,
                flagged: false // 是否已标记
            };
            minePositions.push([row, col]);
        }
    }
}

// 计算每个格子周围的地雷数量
function calculateAdjacentMines() {
    const directions = [-1, 0, 1];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (!board[row][col]) {
                board[row][col] = {
                    revealed: false,
                    mine: false,
                    adjacentMines: 0,
                    flagged: false // 是否已标记
                };
            }
            if (board[row][col].mine) continue;

            let adjacentMines = 0;
            for (let dx of directions) {
                for (let dy of directions) {
                    if (dx === 0 && dy === 0) continue;
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                        if (board[newRow][newCol] && board[newRow][newCol].mine) {
                            adjacentMines++;
                        }
                    }
                }
            }
            board[row][col].adjacentMines = adjacentMines;
        }
    }
}

// 渲染棋盘
function renderBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 40px)`;
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');

            if (cell.revealed) {
                if (cell.mine) {
                    cellElement.textContent = '💣';
                    cellElement.classList.add('mine');
                } else {
                    cellElement.textContent = cell.adjacentMines > 0 ? cell.adjacentMines : '';
                    cellElement.classList.add('revealed');
                }
            } else if (cell.flagged) {
                cellElement.textContent = '🚩'; // 标记为旗子
            }

            // 左键点击事件 - 揭示格子
            cellElement.addEventListener('click', () => revealCell(i, j));

            // 右键点击事件 - 标记格子
            cellElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(i, j);
            });

            gameBoard.appendChild(cellElement);
        });
    });
}

// 点击格子时触发的逻辑
function revealCell(row, col) {
    if (gameOver || board[row][col].revealed || board[row][col].flagged) return;

    const cell = board[row][col];
    cell.revealed = true;

    if (cell.mine) {
        gameOver = true;
        revealAllMines();
        alert('Game Over!');
    } else if (cell.adjacentMines === 0) {
        revealAdjacentCells(row, col);
    }

    renderBoard();

    // 检查是否赢得了游戏
    if (checkWin()) {
        gameOver = true;
        alert('Congratulations! You Win!');
    }
}

// 右键标记或取消标记格子
function toggleFlag(row, col) {
    if (gameOver || board[row][col].revealed) return;

    board[row][col].flagged = !board[row][col].flagged;

    renderBoard();

    // 检查是否赢得了游戏
    if (checkWin()) {
        gameOver = true;
        alert('Congratulations! You Win!');
    }
}

// 显示所有地雷（游戏结束时调用）
function revealAllMines() {
    board.forEach(row => {
        row.forEach(cell => {
            if (cell.mine) {
                cell.revealed = true;
            }
        });
    });
}

// 递归揭示相邻的空格
function revealAdjacentCells(row, col) {
    const directions = [-1, 0, 1];
    for (let dx of directions) {
        for (let dy of directions) {
            if (dx === 0 && dy === 0) continue; // 跳过当前格子
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                const adjacentCell = board[newRow][newCol];
                if (!adjacentCell.revealed && !adjacentCell.mine && !adjacentCell.flagged) {
                    adjacentCell.revealed = true;
                    if (adjacentCell.adjacentMines === 0) {
                        revealAdjacentCells(newRow, newCol);
                    }
                }
            }
        }
    }
}

// 检查是否赢得游戏（即所有非地雷格子均已揭示或正确标记）
function checkWin() {
    return board.every(row => row.every(cell => (cell.revealed && !cell.mine) || (cell.flagged && cell.mine)));
}

// 初始化游戏
initBoard();
