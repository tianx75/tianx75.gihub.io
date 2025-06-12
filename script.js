document.addEventListener('DOMContentLoaded', () => {
    // HTML elemek
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
    const obstacleCount = 15; // ÚJ: Akadályok száma
    let snake = [];
    let food = {};
    let obstacles = []; // ÚJ: Akadályok tömbje
    let dx = gridSize;
    let dy = 0;
    let score = 0;
    let isGameOver = false;
    let changingDirection = false;
    let gameLoop;
    
    // Karakter és új képek betöltése
    const characters = {
        gellert: { name: 'Gellért', img: new Image() },
        milan: { name: 'Milán', img: new Image() },
        apa: { name: 'Apa', img: new Image() }
    };
    characters.gellert.img.src = 'gellert.png';
    characters.milan.img.src = 'milan.png';
    characters.apa.img.src = 'apa.png';

    // ÚJ: Ajándék és akadály képek
    const giftImage = new Image();
    giftImage.src = 'ajandek.png';
    const obstacleImage = new Image();
    obstacleImage.src = 'akadal.png';
    
    let selectedCharacter;

    // Eseménykezelők
    characterCards.forEach(card => {
        card.addEventListener('click', () => {
            const characterId = card.dataset.character;
            selectedCharacter = characters[characterId];
            characterSelectionScreen.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            canvas.focus(); // Fókusz a pályára az irányításhoz
            startGame();
        });
    });
    
    resetButton.addEventListener('click', () => { location.reload(); });
    playAgainButton.addEventListener('click', () => {
        gameOverMessage.classList.add('hidden');
        canvas.focus();
        startGame();
    });
    
    // Az irányítás most a canvas-ra figyel, ha fókuszban van
    canvas.addEventListener('keydown', changeDirection);

    function startGame() {
        isGameOver = false;
        score = 0;
        scoreElement.textContent = score;
        currentPlayerName.textContent = selectedCharacter.name;
        currentPlayerImage.src = selectedCharacter.img.src;
        
        snake = [
            {x: Math.floor(canvas.width / 2 / gridSize) * gridSize, y: Math.floor(canvas.height / 2 / gridSize) * gridSize}
        ];
        
        dx = gridSize;
        dy = 0;
        
        generateObstacles(); // ÚJ: Akadályok generálása
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
            drawObstacles(); // ÚJ
            drawFood();
            moveSnake();
            drawSnake();
            main();
        }, 120);
    }

    function clearCanvas() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // ÚJ: Akadályok generálása
    function generateObstacles() {
        obstacles = [];
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
            // Ellenőrizzük, ne legyen túl közel a kezdő kígyóhoz
            if (Math.abs(obstacle.x - snake[0].x) < gridSize * 5 && Math.abs(obstacle.y - snake[0].y) < gridSize * 5) {
                i--; // Próbáljuk újra
            } else {
                obstacles.push(obstacle);
            }
        }
    }
    
    // ÚJ: Akadályok rajzolása
    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, gridSize, gridSize);
        });
    }

    function drawSnake() {
        snake.forEach((part, index) => {
            if (index === 0) { // Fej
                ctx.drawImage(selectedCharacter.img, part.x, part.y, gridSize, gridSize);
            } else { // Test
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
        
        // Ütközés fallal
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            isGameOver = true;
            return;
        }
        
        // Ütközés önmagával
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) { isGameOver = true; return; }
        }
        
        // ÚJ: Ütközés akadállyal
        for (let i = 0; i < obstacles.length; i++) {
            if (head.x === obstacles[i].x && head.y === obstacles[i].y) { isGameOver = true; return; }
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
        
        let onObject = true;
        while(onObject) {
            onObject = false;
            // Ne legyen a kígyón
            snake.forEach(part => { if (part.x === food.x && part.y === food.y) onObject = true; });
            // Ne legyen akadályon
            obstacles.forEach(obstacle => { if (obstacle.x === food.x && obstacle.y === food.y) onObject = true; });
            
            if (onObject) { // Ha rossz helyre került, generáljunk újat
                 food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
                 food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
            }
        }
    }

    function drawFood() {
        // VÁLTOZÁS: Kép rajzolása
        ctx.drawImage(giftImage, food.x, food.y, gridSize, gridSize);
    }
    
    function changeDirection(event) {
        // Megakadályozza az oldal görgetését a nyilakkal
        event.preventDefault();

        if (changingDirection) return;
        changingDirection = true;
        
        const keyPressed = event.key;
        const goingUp = dy === -gridSize;
        const goingDown = dy === gridSize;
        const goingRight = dx === gridSize;
        const goingLeft = dx === -gridSize;
        
        if ((keyPressed === "ArrowLeft" || keyPressed.toLowerCase() === "a") && !goingRight) { dx = -gridSize; dy = 0; }
        if ((keyPressed === "ArrowUp" || keyPressed.toLowerCase() === "w") && !goingDown) { dx = 0; dy = -gridSize; }
        if ((keyPressed === "ArrowRight" || keyPressed.toLowerCase() === "d") && !goingLeft) { dx = gridSize; dy = 0; }
        // JAVÍTÁS: Itt hiba volt, most már lehet lefele menni, ha előtte felfele mentél
        if ((keyPressed === "ArrowDown" || keyPressed.toLowerCase() === "s") && !goingUp) { dx = 0; dy = gridSize; }
    }
});
