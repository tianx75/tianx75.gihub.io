document.addEventListener('DOMContentLoaded', () => {
    // HTML elemek kiválasztása
    const characterSelectionScreen = document.getElementById('character-selection');
    const gameContainer = document.getElementById('game-container');
    const characterCards = document.querySelectorAll('.character-card');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const scoreElement = document.getElementById('score');
    const currentPlayerName = document.getElementById('current-player-name');
    const currentPlayerImage = document.getElementById('current-player-image');
    
    const gameOverMessage = document.getElementById('game-over-message');
    const finalScoreElement = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-button');
    const resetButton = document.getElementById('reset-button');

    // Játék beállítások
    const gridSize = 20;
    let snake = [];
    let food = {};
    let dx = gridSize;
    let dy = 0;
    let score = 0;
    let isGameOver = false;
    let changingDirection = false;
    let gameLoop;
    
    // Karakter adatok
    const characters = {
        gellert: { name: 'Gellért', img: new Image() },
        milan: { name: 'Milán', img: new Image() },
        apa: { name: 'Apa', img: new Image() }
    };
    characters.gellert.img.src = 'gellert.png';
    characters.milan.img.src = 'milan.png';
    characters.apa.img.src = 'apa.png';
    
    let selectedCharacter;

    // Eseménykezelők
    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            const characterId = card.dataset.character;
            selectedCharacter = characters[characterId];
            characterSelectionScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            startGame();
        });
    });
    
    resetButton.addEventListener('click', () => {
        location.reload(); // Oldal újratöltése a karakterválasztáshoz
    });

    playAgainButton.addEventListener('click', () => {
        gameOverMessage.classList.add('hidden');
        startGame();
    });
    
    document.addEventListener('keydown', changeDirection);

    // Fő játékfüggvények
    function startGame() {
        isGameOver = false;
        score = 0;
        scoreElement.textContent = score;
        currentPlayerName.textContent = selectedCharacter.name;
        currentPlayerImage.src = selectedCharacter.img.src;
        
        // Kígyó kezdőpozíciója a vászon közepén
        snake = [
            {x: Math.floor(canvas.width / 2 / gridSize) * gridSize, y: Math.floor(canvas.height / 2 / gridSize) * gridSize},
            {x: Math.floor(canvas.width / 2 / gridSize) * gridSize - gridSize, y: Math.floor(canvas.height / 2 / gridSize) * gridSize},
            {x: Math.floor(canvas.width / 2 / gridSize) * gridSize - (gridSize*2), y: Math.floor(canvas.height / 2 / gridSize) * gridSize}
        ];
        
        dx = gridSize;
        dy = 0;
        
        generateFood();
        main();
    }
    
    function main() {
        if (isGameOver) {
            clearTimeout(gameLoop);
            finalScoreElement.textContent = score;
            gameOverMessage.classList.remove('hidden');
            return;
        }

        changingDirection = false;
        gameLoop = setTimeout(() => {
            clearCanvas();
            drawFood();
            moveSnake();
            drawSnake();
            main();
        }, 120); // Ez a szám a kígyó sebessége. Kisebb szám = gyorsabb kígyó.
    }

    function clearCanvas() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnake() {
        snake.forEach((part, index) => {
            if (index === 0) { // A kígyó feje
                ctx.drawImage(selectedCharacter.img, part.x, part.y, gridSize, gridSize);
            } else { // A kígyó teste
                ctx.fillStyle = '#5cb85c';
                ctx.strokeStyle = '#4cae4c';
                ctx.fillRect(part.x, part.y, gridSize, gridSize);
                ctx.strokeRect(part.x, part.y, gridSize, gridSize);
            }
        });
    }

    function moveSnake() {
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        // Ütközés a fallal
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            isGameOver = true;
            return;
        }
        
        // Ütközés önmagával
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                isGameOver = true;
                return;
            }
        }
        
        const ateFood = snake[0].x === food.x && snake[0].y === food.y;
        if (ateFood) {
            score += 10;
            scoreElement.textContent = score;
            generateFood();
        } else {
            snake.pop();
        }
    }

    function generateFood() {
        food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        // Ellenőrizzük, hogy az étel nem a kígyón van-e
        snake.forEach(part => {
            if (part.x === food.x && part.y === food.y) {
                generateFood();
            }
        });
    }

    function drawFood() {
        ctx.fillStyle = '#d9534f';
        ctx.strokeStyle = '#c9302c';
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        ctx.strokeRect(food.x, food.y, gridSize, gridSize);
    }
    
    function changeDirection(event) {
        if (changingDirection) return;
        changingDirection = true;
        
        const keyPressed = event.key;
        const goingUp = dy === -gridSize;
        const goingDown = dy === gridSize;
        const goingRight = dx === gridSize;
        const goingLeft = dx === -gridSize;
        
        if ((keyPressed === "ArrowLeft" || keyPressed === "a") && !goingRight) {
            dx = -gridSize;
            dy = 0;
        }
        if ((keyPressed === "ArrowUp" || keyPressed === "w") && !goingDown) {
            dx = 0;
            dy = -gridSize;
        }
        if ((keyPressed === "ArrowRight" || keyPressed === "d") && !goingLeft) {
            dx = gridSize;
            dy = 0;
        }
        if ((keyPressed === "ArrowDown" || keyPressed === "s") && !goingDown) {
            dx = 0;
            dy = gridSize;
        }
    }
});