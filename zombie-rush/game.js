const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthText = document.getElementById('healthText');
const healthFill = document.getElementById('healthFill');
const scoreValue = document.getElementById('scoreValue');
const overlay = document.getElementById('overlay');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 800;
canvas.height = 600;

let gameRunning = true;
let score = 0;
let waveTimer = 0;
let zombieSpawnInterval = 180;
let difficulty = 1;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 4,
    health: 100,
    maxHealth: 100,
    angle: 0,
    color: '#4444ff'
};

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
};

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

const bullets = [];
const zombies = [];

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = 8;
        this.angle = angle;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.color = '#ffff00';
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.x < -this.radius || this.x > canvas.width + this.radius ||
               this.y < -this.radius || this.y > canvas.height + this.radius;
    }
}

class Zombie {
    constructor() {
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0:
                this.x = Math.random() * canvas.width;
                this.y = -20;
                break;
            case 1:
                this.x = canvas.width + 20;
                this.y = Math.random() * canvas.height;
                break;
            case 2:
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 20;
                break;
            case 3:
                this.x = -20;
                this.y = Math.random() * canvas.height;
                break;
        }
        this.radius = 18;
        this.speed = 0.8 + Math.random() * 0.4 * difficulty;
        this.health = 1;
        this.color = '#cc0000';
        this.damage = 10;
    }

    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#990000';
        ctx.beginPath();
        ctx.arc(-6, -5, 3, 0, Math.PI * 2);
        ctx.arc(6, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#660000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.restore();
    }
}

function handleKeyDown(e) {
    if (e.key in keys) {
        keys[e.key] = true;
    }
}

function handleKeyUp(e) {
    if (e.key in keys) {
        keys[e.key] = false;
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}

function handleMouseClick(e) {
    if (!gameRunning) return;
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push(new Bullet(player.x, player.y, angle));
}

function updatePlayer() {
    let dx = 0;
    let dy = 0;
    
    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
        
        player.x += dx * player.speed;
        player.y += dy * player.speed;
        
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    }
    
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        
        if (bullet.isOffScreen()) {
            bullets.splice(i, 1);
            continue;
        }
        
        for (let j = zombies.length - 1; j >= 0; j--) {
            const zombie = zombies[j];
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < bullet.radius + zombie.radius) {
                bullets.splice(i, 1);
                zombies.splice(j, 1);
                score += 10;
                updateScore();
                break;
            }
        }
    }
}

function updateZombies() {
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        zombie.update();
        
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.radius + zombie.radius) {
            player.health -= zombie.damage;
            zombies.splice(i, 1);
            updateHealth();
            
            if (player.health <= 0) {
                gameOver();
            }
        }
    }
}

function spawnZombies() {
    waveTimer++;
    
    if (waveTimer >= zombieSpawnInterval) {
        const zombieCount = Math.floor(1 + difficulty * 0.5);
        for (let i = 0; i < zombieCount; i++) {
            zombies.push(new Zombie());
        }
        waveTimer = 0;
        
        if (zombieSpawnInterval > 60) {
            zombieSpawnInterval -= 2;
        }
        
        if (score > 0 && score % 100 === 0) {
            difficulty += 0.2;
        }
    }
}

function updateHealth() {
    player.health = Math.max(0, player.health);
    healthText.textContent = Math.floor(player.health);
    healthFill.style.width = (player.health / player.maxHealth * 100) + '%';
}

function updateScore() {
    scoreValue.textContent = score;
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#6666ff';
    ctx.fillRect(player.radius - 5, -3, 10, 6);
    
    ctx.restore();
}

function gameOver() {
    gameRunning = false;
    finalScore.textContent = score;
    overlay.classList.remove('hidden');
}

function restart() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = player.maxHealth;
    score = 0;
    waveTimer = 0;
    zombieSpawnInterval = 180;
    difficulty = 1;
    bullets.length = 0;
    zombies.length = 0;
    gameRunning = true;
    
    updateHealth();
    updateScore();
    overlay.classList.add('hidden');
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning) {
        updatePlayer();
        updateBullets();
        updateZombies();
        spawnZombies();
    }
    
    bullets.forEach(bullet => bullet.draw());
    zombies.forEach(zombie => zombie.draw());
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleMouseClick);
restartBtn.addEventListener('click', restart);

gameLoop();