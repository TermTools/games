// Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    tower: {
        cost: 50,
        damage: 25,
        range: 100,
        fireRate: 500,
        radius: 20
    },
    enemy: {
        types: {
            basic: { health: 100, speed: 1, color: '#e74c3c', reward: 10 },
            fast: { health: 50, speed: 2, color: '#f1c40f', reward: 15 },
            tank: { health: 300, speed: 0.5, color: '#9b59b6', reward: 25 }
        },
        radius: 15
    },
    castle: {
        initialHealth: 100,
        x: 750,
        y: 300
    },
    game: {
        initialGold: 400,  // Extra gold for starting at wave 5
        waveDuration: 5000  // 5 seconds between waves for strategic planning
    }
};

// Path waypoints for enemies to follow
const PATH_WAYPOINTS = [
    { x: 50, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 400, y: 150 },
    { x: 600, y: 150 },
    { x: 600, y: 450 },
    { x: 350, y: 450 },
    { x: 350, y: 500 },
    { x: 750, y: 500 },
    { x: 750, y: 300 }
];

// Game Classes
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / length, this.y / length);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
}

class Enemy {
    constructor(type, waypoints) {
        this.type = type;
        this.config = CONFIG.enemy.types[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.speed = this.config.speed;
        this.color = this.config.color;
        this.reward = this.config.reward;
        
        this.waypoints = waypoints;
        this.currentWaypoint = 0;
        this.position = new Vector2D(waypoints[0].x, waypoints[0].y);
        this.alive = true;
        this.reachedEnd = false;
    }

    update() {
        if (!this.alive || this.reachedEnd) return;

        if (this.currentWaypoint >= this.waypoints.length) {
            this.reachedEnd = true;
            return;
        }

        const target = this.waypoints[this.currentWaypoint];
        const targetPos = new Vector2D(target.x, target.y);
        const direction = new Vector2D(
            targetPos.x - this.position.x,
            targetPos.y - this.position.y
        ).normalize();

        this.position = this.position.add(direction.multiply(this.speed));

        // Check if reached current waypoint
        if (this.position.distance(targetPos) < 10) {
            this.currentWaypoint++;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        // Draw enemy circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, CONFIG.enemy.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const barWidth = 30;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y - CONFIG.enemy.radius - 15,
            barWidth,
            barHeight
        );

        ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(
            this.position.x - barWidth / 2,
            this.position.y - CONFIG.enemy.radius - 15,
            barWidth * healthPercent,
            barHeight
        );
    }
}

class Tower {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.range = CONFIG.tower.range;
        this.damage = CONFIG.tower.damage;
        this.lastFireTime = 0;
        this.target = null;
    }

    update(enemies, bullets, currentTime) {
        // Find target
        this.target = this.findTarget(enemies);

        // Fire at target
        if (this.target && currentTime - this.lastFireTime > CONFIG.tower.fireRate) {
            this.fire(bullets);
            this.lastFireTime = currentTime;
        }
    }

    findTarget(enemies) {
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const enemy of enemies) {
            if (!enemy.alive) continue;

            const distance = this.position.distance(enemy.position);
            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        return closestEnemy;
    }

    fire(bullets) {
        if (this.target) {
            bullets.push(new Bullet(
                this.position.x,
                this.position.y,
                this.target,
                this.damage
            ));
        }
    }

    draw(ctx, showRange = false) {
        // Draw range circle if hovering
        if (showRange) {
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw tower
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, CONFIG.tower.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw tower border
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw barrel pointing at target
        if (this.target) {
            const direction = new Vector2D(
                this.target.position.x - this.position.x,
                this.target.position.y - this.position.y
            ).normalize();

            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(
                this.position.x + direction.x * CONFIG.tower.radius,
                this.position.y + direction.y * CONFIG.tower.radius
            );
            ctx.stroke();
        }
    }
}

class Bullet {
    constructor(x, y, target, damage) {
        this.position = new Vector2D(x, y);
        this.target = target;
        this.damage = damage;
        this.speed = 5;
        this.alive = true;
    }

    update() {
        if (!this.alive || !this.target || !this.target.alive) {
            this.alive = false;
            return;
        }

        const direction = new Vector2D(
            this.target.position.x - this.position.x,
            this.target.position.y - this.position.y
        ).normalize();

        this.position = this.position.add(direction.multiply(this.speed));

        // Check collision with target
        if (this.position.distance(this.target.position) < CONFIG.enemy.radius) {
            this.target.takeDamage(this.damage);
            this.alive = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 5;  // Start at wave 5 for testing
        this.enemies = [];
        this.spawnIndex = 0;
        this.lastSpawnTime = 0;
        this.waveInProgress = false;
        this.wavePaused = false;
        this.pauseEndTime = 0;
    }

    update(currentTime, enemies) {
        if (this.wavePaused) {
            if (currentTime >= this.pauseEndTime) {
                this.wavePaused = false;
                this.startWave();
            }
            return;
        }

        if (!this.waveInProgress && enemies.length === 0) {
            this.wavePaused = true;
            this.pauseEndTime = currentTime + CONFIG.game.waveDuration;
            this.currentWave++;
            return;
        }

        if (this.waveInProgress && this.spawnIndex < this.enemies.length) {
            if (currentTime - this.lastSpawnTime > 500) { // Spawn every 0.5 seconds (doubled spawn rate)
                const enemyData = this.enemies[this.spawnIndex];
                const enemy = new Enemy(enemyData.type, PATH_WAYPOINTS);
                enemies.push(enemy);
                this.spawnIndex++;
                this.lastSpawnTime = currentTime;

                if (this.spawnIndex >= this.enemies.length) {
                    this.waveInProgress = false;
                }
            }
        }
    }

    startWave() {
        this.generateWave();
        this.spawnIndex = 0;
        this.waveInProgress = true;
    }

    generateWave() {
        this.enemies = [];
        const baseEnemies = 8 + this.currentWave * 3;  // More enemies per wave
        
        for (let i = 0; i < baseEnemies; i++) {
            let type = 'basic';
            
            if (this.currentWave >= 3 && Math.random() < 0.3) {
                type = 'fast';
            }
            if (this.currentWave >= 5 && Math.random() < 0.2) {
                type = 'tank';
            }
            
            this.enemies.push({ type });
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.castleHealth = CONFIG.castle.initialHealth;
        this.gold = CONFIG.game.initialGold;
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        
        this.waveManager = new WaveManager();
        this.gameOver = false;
        this.hoveredPosition = null;
        
        this.setupEventListeners();
        this.updateUI();
        this.waveManager.startWave();
        this.gameLoop();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredPosition = null;
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.canPlaceTower(x, y) && this.gold >= CONFIG.tower.cost) {
            this.towers.push(new Tower(x, y));
            this.gold -= CONFIG.tower.cost;
            this.updateUI();
        }
    }

    handleMouseMove(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredPosition = this.canPlaceTower(x, y) ? { x, y } : null;
    }

    canPlaceTower(x, y) {
        // Check if on path
        if (this.isOnPath(x, y, 40)) return false;

        // Check if overlapping with existing towers
        for (const tower of this.towers) {
            if (tower.position.distance(new Vector2D(x, y)) < CONFIG.tower.radius * 2) {
                return false;
            }
        }

        // Check if too close to canvas edges
        if (x < CONFIG.tower.radius || x > CONFIG.canvas.width - CONFIG.tower.radius ||
            y < CONFIG.tower.radius || y > CONFIG.canvas.height - CONFIG.tower.radius) {
            return false;
        }

        return true;
    }

    isOnPath(x, y, threshold) {
        const pos = new Vector2D(x, y);
        
        for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
            const start = new Vector2D(PATH_WAYPOINTS[i].x, PATH_WAYPOINTS[i].y);
            const end = new Vector2D(PATH_WAYPOINTS[i + 1].x, PATH_WAYPOINTS[i + 1].y);
            
            if (this.distanceToLineSegment(pos, start, end) < threshold) {
                return true;
            }
        }
        
        return false;
    }

    distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return point.distance(lineStart);
        
        let param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        if (this.gameOver) return;

        const currentTime = Date.now();

        // Update wave manager
        this.waveManager.update(currentTime, this.enemies);
        
        // Update wave timer display
        if (this.waveManager.wavePaused) {
            const timeRemaining = Math.max(0, this.waveManager.pauseEndTime - currentTime);
            const seconds = Math.ceil(timeRemaining / 1000);
            document.getElementById('wave-timer').textContent = seconds > 0 ? `${seconds}s` : 'Starting...';
        } else {
            document.getElementById('wave-timer').textContent = 'In Progress';
        }

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            
            if (enemy.reachedEnd && enemy.alive) {
                this.castleHealth -= 10;
                this.updateUI();
                return false;
            }
            
            if (!enemy.alive) {
                this.gold += enemy.reward;
                this.updateUI();
                return false;
            }
            
            return true;
        });

        // Update towers
        this.towers.forEach(tower => {
            tower.update(this.enemies, this.bullets, currentTime);
        });

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.alive;
        });

        // Check game over
        if (this.castleHealth <= 0) {
            this.gameOver = true;
            document.getElementById('game-over').classList.remove('hidden');
        }
    }

    draw() {
        // Clear canvas with grass background
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw path
        this.drawPath();

        // Draw castle
        this.drawCastle();

        // Draw hover preview
        if (this.hoveredPosition && this.gold >= CONFIG.tower.cost) {
            this.drawTowerPreview(this.hoveredPosition.x, this.hoveredPosition.y);
        }

        // Draw game objects
        this.towers.forEach(tower => {
            const showRange = this.hoveredPosition && 
                             tower.position.distance(new Vector2D(this.hoveredPosition.x, this.hoveredPosition.y)) < CONFIG.tower.radius * 2;
            tower.draw(this.ctx, showRange);
        });
        
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
    }

    drawPath() {
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(PATH_WAYPOINTS[0].x, PATH_WAYPOINTS[0].y);
        
        for (let i = 1; i < PATH_WAYPOINTS.length; i++) {
            this.ctx.lineTo(PATH_WAYPOINTS[i].x, PATH_WAYPOINTS[i].y);
        }
        
        this.ctx.stroke();

        // Draw path border
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 32;
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawCastle() {
        const castle = CONFIG.castle;
        
        // Castle base
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(castle.x - 25, castle.y - 25, 50, 50);
        
        // Castle details
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(castle.x - 20, castle.y - 20, 40, 40);
        
        // Flag
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(castle.x - 5, castle.y - 35, 15, 10);
        
        // Flag pole
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(castle.x, castle.y - 25);
        this.ctx.lineTo(castle.x, castle.y - 35);
        this.ctx.stroke();
    }

    drawTowerPreview(x, y) {
        // Preview tower
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(x, y, CONFIG.tower.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Preview range
        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, CONFIG.tower.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.globalAlpha = 1.0;
    }

    updateUI() {
        document.getElementById('castle-health').textContent = this.castleHealth;
        document.getElementById('gold').textContent = this.gold;
        document.getElementById('current-wave').textContent = this.waveManager.currentWave;
    }

    restart() {
        this.castleHealth = CONFIG.castle.initialHealth;
        this.gold = CONFIG.game.initialGold;
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        this.waveManager = new WaveManager();
        this.gameOver = false;
        this.hoveredPosition = null;
        
        document.getElementById('game-over').classList.add('hidden');
        this.updateUI();
        this.waveManager.startWave();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});