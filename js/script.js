// Parámetros del juego
const gridSize = 13;  // Tamaño del tablero (13x13)
const gameGrid = document.getElementById('game-grid');
let playerPosition = { row: 1, col: 1 };  // Posición inicial del jugador
const bombs = [];  // Almacena las bombas colocadas
let lives = 3;  // Contador de vidas
const livesDisplay = document.getElementById('lives'); // Elemento para mostrar las vidas

// Inicializar el tablero de juego
function initGameGrid() {
    gameGrid.innerHTML = '';  // Limpiar el tablero
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = row;
            tile.dataset.col = col;

            // Colocar paredes indestructibles en los bordes y cada 2 espacios
            if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1 || (row % 2 === 0 && col % 2 === 0)) {
                tile.classList.add('wall');
            } else if (Math.random() < 0.3 && !(row === 1 && col === 1)) {
                // Colocar bloques destructibles (bricks) aleatoriamente, pero no en la posición del jugador
                tile.classList.add('brick');
            }

            // Colocar al jugador en la posición inicial
            if (row === playerPosition.row && col === playerPosition.col) {
                tile.classList.add('player');
            }

            gameGrid.appendChild(tile);
        }
    }
    updateLivesDisplay(); // Mostrar vidas al iniciar el juego
}

// Función para actualizar el contador de vidas en el HUD
function updateLivesDisplay() {
    livesDisplay.textContent = `Vidas: ${lives}`;
}

// Función para mover al jugador
function movePlayer(newRow, newCol) {
    // Verificar si la nueva posición está dentro del tablero y no es una pared
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        const targetTile = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
        if (!targetTile.classList.contains('wall') && !targetTile.classList.contains('brick')) {
            // Actualizar la posición del jugador
            const currentTile = document.querySelector(`[data-row="${playerPosition.row}"][data-col="${playerPosition.col}"]`);
            currentTile.classList.remove('player');
            playerPosition.row = newRow;
            playerPosition.col = newCol;
            targetTile.classList.add('player');
        }
    }
}

// Función para colocar una bomba
function placeBomb() {
    const bombPosition = { ...playerPosition };  // Posición de la bomba igual a la del jugador
    const bombTile = document.querySelector(`[data-row="${bombPosition.row}"][data-col="${bombPosition.col}"]`);

    // Verificar si hay una bomba en la misma posición
    if (bombs.some(bomb => bomb.row === bombPosition.row && bomb.col === bombPosition.col)) {
        return; // No colocar una bomba si ya hay una
    }

    // Marcar la bomba en el tablero
    bombTile.classList.add('bomb');
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
        const tile = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
        
        // Solo destruye bloques destructibles
        if (tile.classList.contains('brick')) {
            tile.classList.remove('brick'); // Destruir bloque
        } else if (tile.classList.contains('wall')) {
            return; // No hacer nada si es una pared
        }
        
        tile.classList.add('explosion'); // Mostrar explosión
        
        // Verificar si el jugador está cerca de la explosión
        if (pos.row === playerPosition.row && pos.col === playerPosition.col) {
            playerHit = true; // El jugador está en la posición de la explosión
        }
    });

    // Remover bomba visualmente
    const bombTile = document.querySelector(`[data-row="${bombPosition.row}"][data-col="${bombPosition.col}"]`);
    bombTile.classList.remove('bomb'); // Quitar la bomba

    // Disminuir vidas si el jugador fue golpeado
    if (playerHit) {
        lives--; // Disminuir la vida
        updateLivesDisplay(); // Actualizar el contador de vidas
        if (lives <= 0) {
            alert('¡Game Over!'); // Alerta de fin del juego
            // Aquí podrías reiniciar el juego o detener la ejecución
        }
    }

    // Remover la clase de explosión después de un breve periodo
    setTimeout(() => {
        explosionTiles.forEach(pos => {
            const tile = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            tile.classList.remove('explosion'); // Quitar explosión después de 500ms
        });
    }, 500); // 500ms para que la explosión sea visible antes de desaparecer
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
        case ' ': // Barra espaciadora para colocar bomba
            placeBomb();
            break;
    }
});

// Iniciar el juego
initGameGrid();
