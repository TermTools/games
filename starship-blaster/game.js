const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverlay = document.getElementById('gameOverlay');
const restartBtn = document.getElementById('restartBtn');

let gameRunning = true;
let score = 0;
let keys = {};

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 30,
    speed: 7,
    color: 'white'
};

let bullets = [];
let enemies = [];
let enemySpawnTimer = 0;
let canShoot = true;


class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 10;
        this.color = 'red';
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffscreen() {
        return this.y + this.height < 0;
    }
}

class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
        this.color = '#00ff00';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 15, this.y + 25, 10, 5);
    }

    hasReachedBottom() {
        return this.y + this.height >= canvas.height;
    }
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    
    if (keys[' '] && canShoot) {
        bullets.push(new Bullet(player.x + player.width / 2 - 4, player.y));
        canShoot = false;
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - 10);
    ctx.lineTo(player.x + 10, player.y);
    ctx.lineTo(player.x + player.width - 10, player.y);
    ctx.closePath();
    ctx.fill();
}

function spawnEnemies() {
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) {
        enemies.push(new Enemy());
        enemySpawnTimer = 0;
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const enemy = enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                scoreElement.textContent = score;
                break;
            }
        }
    }
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverlay.classList.remove('hidden');
}

function resetGame() {
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    bullets = [];
    enemies = [];
    score = 0;
    scoreElement.textContent = score;
    enemySpawnTimer = 0;
    gameRunning = true;
    gameOverlay.classList.add('hidden');
}

function gameLoop() {
    if (gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updatePlayer();
        spawnEnemies();
        
        bullets = bullets.filter(bullet => {
            bullet.update();
            if (!bullet.isOffscreen()) {
                bullet.draw();
                return true;
            }
            return false;
        });
        
        enemies = enemies.filter(enemy => {
            enemy.update();
            enemy.draw();
            
            if (enemy.hasReachedBottom()) {
                gameOver();
                return false;
            }
            return true;
        });
        
        checkCollisions();
        drawPlayer();
    }
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'Enter' && !gameRunning) {
        resetGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    
    if (e.key === ' ') {
        canShoot = true;
    }
});

restartBtn.addEventListener('click', resetGame);

gameLoop();