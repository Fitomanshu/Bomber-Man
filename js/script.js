// Seleccionar el canvas y obtener el contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensiones del canvas
const canvasSize = canvas.width; // Como es cuadrado, el ancho y el alto son iguales

// Dimensiones de la cuadrícula
const rows = 13;  // Igual número de filas y columnas
const cols = 13;

// Tamaño de cada celda (cuadrados)
const cellSize = canvasSize / cols;

// Parámetros del juego
const gridSize = 13;  // Tamaño del tablero (13x13)
let playerPosition = { row: 1, col: 1 };  // Posición inicial del jugador
const bombs = [];  // Almacena las bombas
let lives = 3;  // Contador de vidas
const livesDisplay = document.getElementById('lives'); // Elemento para mostrar las vidas

// Estructura para almacenar el estado de cada celda
const gameGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

// Inicializar el tablero de juego
function initGameGrid() {
    // Colocar paredes indestructibles en los bordes
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) {
                gameGrid[row][col] = 'wall'; // Bloques indestructibles
            } else if (Math.random() < 0.3 && !(row === 1 && col === 1)) {
                gameGrid[row][col] = 'brick'; // Bloques destructibles
            } else if (Math.random() < 0.1) {
                gameGrid[row][col] = 'wall'; // Añadir bloques indestructibles en el área jugable
            } else {
                gameGrid[row][col] = 'empty'; // Celdas vacías
            }
        }
    }
    updateLivesDisplay(); // Mostrar vidas al iniciar el juego
    drawGrid(); // Dibujar la cuadrícula inicial
}

// Función para dibujar la cuadrícula
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = col * cellSize;
            let y = row * cellSize;

            // Verificar el estado de la celda
            if (gameGrid[row][col] === 'wall') {
                ctx.fillStyle = '#555555'; // Color gris oscuro para bloques indestructibles
            } else if (gameGrid[row][col] === 'brick') {
                ctx.fillStyle = '#FF0000'; // Color rojo para bloques destructibles
            } else {
                ctx.fillStyle = '#00FF00'; // Color verde para celdas vacías
            }

            // Dibujar el bloque
            ctx.fillRect(x, y, cellSize, cellSize);

            // Dibujar el borde del bloque (para resaltar la cuadrícula)
            ctx.strokeStyle = '#ffffff'; // Color de la línea
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }

    // Dibujar al jugador
    const playerX = playerPosition.col * cellSize;
    const playerY = playerPosition.row * cellSize;
    ctx.fillStyle = '#0000FF'; // Color azul para el jugador
    ctx.fillRect(playerX, playerY, cellSize, cellSize); // Dibujar al jugador

    // Dibujar las bombas
    bombs.forEach(bomb => {
        const bombX = bomb.col * cellSize;
        const bombY = bomb.row * cellSize;
        ctx.fillStyle = '#0000FF'; // Color azul para la bomba
        ctx.fillRect(bombX, bombY, cellSize, cellSize); // Dibujar bomba
    });
}

// Función para actualizar el contador de vidas en el HUD
function updateLivesDisplay() {
    livesDisplay.textContent = `Vidas: ${lives}`;
}

// Función para mover al jugador
function movePlayer(newRow, newCol) {
    // Verificar si la nueva posición está dentro del tablero y no es una pared
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        const targetCell = gameGrid[newRow][newCol];
        if (targetCell !== 'wall' && targetCell !== 'brick') {
            // Actualizar la posición del jugador
            playerPosition.row = newRow;
            playerPosition.col = newCol;
            drawGrid(); // Redibujar la cuadrícula
        }
    }
}

// Función para colocar una bomba
function placeBomb() {
    const bombPosition = { ...playerPosition };  // Posición de la bomba igual a la del jugador

    // Verificar si hay una bomba en la misma posición
    if (bombs.some(bomb => bomb.row === bombPosition.row && bomb.col === bombPosition.col)) {
        return; // No colocar una bomba si ya hay una
    }

    // Marcar la bomba en el tablero
    bombs.push(bombPosition);  // Agregar bomba a la lista

    // Explosión de la bomba después de 3 segundos
    setTimeout(() => explodeBomb(bombPosition), 3000);
}

// Función para manejar la explosión de la bomba
function explodeBomb(bombPosition) {
    const explosionTiles = [bombPosition]; // Comenzar con la posición de la bomba

    // Agregar posiciones de explosión en todas las direcciones
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (Math.abs(i) === Math.abs(j)) continue; // Saltar la posición central (bomba)
            const newRow = bombPosition.row + i;
            const newCol = bombPosition.col + j;

            // Verificar si está dentro de los límites del tablero
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                explosionTiles.push({ row: newRow, col: newCol });
            }
        }
    }

    // Procesar la explosión
    let playerHit = false; // Variable para verificar si el jugador está cerca de la explosión
    explosionTiles.forEach(pos => {
        // Solo destruir bloques destructibles
        if (gameGrid[pos.row][pos.col] === 'brick') {
            gameGrid[pos.row][pos.col] = 'empty'; // Destruir bloque
        }

        // Verificar si el jugador está cerca de la explosión
        if (pos.row === playerPosition.row && pos.col === playerPosition.col) {
            playerHit = true; // El jugador está en la posición de la explosión
        }
    });

    // Remover bomba visualmente
    bombs.splice(bombs.indexOf(bombPosition), 1); // Quitar la bomba

    // Dibujar explosión
    drawExplosion(explosionTiles);

    // Disminuir vidas si el jugador fue golpeado
    if (playerHit) {
        lives--; // Disminuir la vida
        updateLivesDisplay(); // Actualizar el contador de vidas
    }

    // Redibujar la cuadrícula después de la explosión
    setTimeout(() => {
        explosionTiles.forEach(pos => {
            // Restaurar la celda a vacía si no es un bloque indestructible
            if (gameGrid[pos.row][pos.col] !== 'wall') {
                gameGrid[pos.row][pos.col] = 'empty'; // Restaurar la celda a vacía
            }
        });
        drawGrid(); // Redibujar la cuadrícula después de la explosión
    }, 1000); // Esperar 1 segundo antes de restaurar el estado
}

// Función para dibujar la explosión
function drawExplosion(explosionTiles) {
    explosionTiles.forEach(pos => {
        const x = pos.col * cellSize;
        const y = pos.row * cellSize;

        // Color amarillo para la explosión
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)'; // Color amarillo semi-transparente
        ctx.fillRect(x, y, cellSize, cellSize); // Dibujar explosión
    });
}

// Control de teclado para mover al jugador y colocar bombas
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(playerPosition.row - 1, playerPosition.col);
            break;
        case 'ArrowDown':
            movePlayer(playerPosition.row + 1, playerPosition.col);
            break;
        case 'ArrowLeft':
            movePlayer(playerPosition.row, playerPosition.col - 1);
            break;
        case 'ArrowRight':
            movePlayer(playerPosition.row, playerPosition.col + 1);
            break;
        case 'Enter': // Tecla 'b' para colocar una bomba
            placeBomb();
            break;
    }
});

// Inicializar el juego
initGameGrid();
