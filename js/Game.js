import { Farmer } from './Farmer.js';
import { Crop } from './Crop.js';
import { Scarecrow, Crow } from './Obstacle.js';
import { PowerUp } from './PowerUp.js';
import { Input } from './Input.js';

// Game states
const State = Object.freeze({
    MENU: "MENU",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    GAME_OVER: "GAME_OVER",
    WIN: "WIN",
    LEVEL_COMPLETE: "LEVEL_COMPLETE"
});

/**
 * Main game controller class
 * @class
 */
export class Game {
    /**
     * @param {HTMLCanvasElement} canvas - Game canvas element
     */
    constructor(canvas) {
        if (!canvas) {
            console.error("Canvas #game not found. Check index.html IDs.");
            return;
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.state = State.MENU;
        this.config = null;

        // Game world
        this.player = new Farmer(900 / 2 - 17, 540 - 80);
        this.crops = [];
        this.obstacles = [];
        this.crows = [];
        this.powerUps = [];

        // Game progression
        this.currentLevel = 1;
        this.levelsCompleted = 0;
        this.totalLevels = 3;

        // Timing
        this.lastTime = 0;
        this.timeLeft = 60;
        this.spawnEvery = 0.8;
        this._accumSpawn = 0;
        this.powerUpTimer = 0;

        // Score
        this.score = 0;
        this.goal = 15;

        // Input handling
        this.input = new Input(this);

        // Using bind here for the same reason as Input class - we need to remove the exact same function reference
        this._onResize = this.onResize.bind(this);
        window.addEventListener("resize", this._onResize);

        // UI elements
        this.setupUI();

        // Load configuration and start
        this.loadConfig().then(() => {
            // Using arrow function for RAF to maintain 'this' context
            // This is required because RAF calls the function with window context by default
            this.tick = (ts) => {
                const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
                this.lastTime = ts;
                this.update(dt);
                this.render();
                requestAnimationFrame(this.tick);
            };

            this.reset();
        });
    }

    /**
     * Load game configuration from JSON file
     * @returns {Promise} Promise that resolves when config is loaded
     */
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            console.log('Game configuration loaded:', this.config);
        } catch (error) {
            console.error('Failed to load config, using defaults:', error);
            // Fallback default config
            this.config = {
                levels: [
                    { number: 1, timeLimit: 60, goal: 15, spawnRate: 0.8, obstacles: 2, crows: 1 },
                    { number: 2, timeLimit: 45, goal: 20, spawnRate: 0.6, obstacles: 3, crows: 2 },
                    { number: 3, timeLimit: 30, goal: 25, spawnRate: 0.4, obstacles: 4, crows: 3 }
                ],
                cropTypes: {
                    wheat: { points: 1, spawnWeight: 0.6 },
                    pumpkin: { points: 3, spawnWeight: 0.3 },
                    goldenApple: { points: 5, spawnWeight: 0.1 }
                }
            };
        }
    }

    /**
     * Setup UI event listeners
     */
    setupUI() {
        const get = id => document.getElementById(id) || console.error(`#${id} not found`);

        this.ui = {
            score: get("score"),
            time: get("time"),
            goal: get("goal"),
            status: get("status"),
            level: get("level"),
            start: get("btnStart"),
            reset: get("btnReset"),
            nextLevel: get("btnNextLevel")
        };

        // Event listeners with arrow functions to maintain 'this' context
        if (this.ui.start) {
            this.ui.start.addEventListener("click", () => this.start());
        }
        if (this.ui.reset) {
            this.ui.reset.addEventListener("click", () => this.reset());
        }
        if (this.ui.nextLevel) {
            this.ui.nextLevel.addEventListener("click", () => this.advanceToNextLevel());
        }
    }

    /**
     * Handle window resize
     */
    onResize() {
        // Fixed canvas size for simplicity
    }

    /**
     * Start the game
     */
    start() {
        if (this.state === State.MENU || this.state === State.GAME_OVER || this.state === State.WIN) {
            this.reset();
            this.state = State.PLAYING;
            this.updateUIStatus("Playing…");
            requestAnimationFrame(this.tick);
        } else if (this.state === State.PAUSED) {
            this.state = State.PLAYING;
            this.updateUIStatus("Playing…");
        }
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        this.state = State.MENU;
        this.currentLevel = 1;
        this.levelsCompleted = 0;
        this.totalLevels = 3;
        this.player = new Farmer(900 / 2 - 17, 540 - 80);
        this.crops = [];
        this.obstacles = [];
        this.crows = [];
        this.powerUps = [];
        this.score = 0;
        this.levelCompleted = false;
        this.lastCrowHit = 0;

        // Hide Next Level button when resetting
        if (this.ui.nextLevel) {
            this.ui.nextLevel.style.display = 'none';
        }

        this.setupLevel(this.currentLevel);
        this.lastTime = performance.now();
        this.syncUI();
        this.updateUIStatus("Menu");
    }

    /**
     * Setup level configuration
     * @param {number} level - Level number
     */
    setupLevel(level) {
        const levelConfig = this.config.levels.find(l => l.number === level) || this.config.levels[0];

        this.timeLeft = levelConfig.timeLimit;
        this.goal = levelConfig.goal;
        this.spawnEvery = levelConfig.spawnRate;
        this._accumSpawn = 0;

        // Clear existing obstacles and crows
        this.obstacles = [];
        this.crows = [];

        // Add obstacles
        for (let i = 0; i < levelConfig.obstacles; i++) {
            this.obstacles.push(new Scarecrow(
                100 + i * 200,
                100 + (i % 2) * 150
            ));
        }

        // Add crows
        for (let i = 0; i < levelConfig.crows; i++) {
            this.crows.push(new Crow(
                150 + i * 150,
                200 + (i % 2) * 100
            ));
        }

        this.syncUI();
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.state === State.PLAYING) {
            this.state = State.PAUSED;
            this.updateUIStatus("Paused");
        } else if (this.state === State.PAUSED) {
            this.state = State.PLAYING;
            this.updateUIStatus("Playing…");
        }
    }

    /**
     * Update UI status text
     * @param {string} text - Status text
     */
    updateUIStatus(text) {
        if (this.ui.status) this.ui.status.textContent = text;
    }

    /**
     * Synchronize UI elements with game state
     */
    syncUI() {
        if (this.ui.score) this.ui.score.textContent = String(this.score);
        if (this.ui.time) this.ui.time.textContent = Math.ceil(this.timeLeft);
        if (this.ui.goal) this.ui.goal.textContent = String(this.goal);
        if (this.ui.level) this.ui.level.textContent = String(this.currentLevel);
    }

    /**
     * Spawn a new crop with weighted random type
     */
    spawnCrop() {
        const gx = Math.floor(Math.random() * ((900 - 2 * 30) / 30)) * 30 + 30;
        const gy = Math.floor(Math.random() * ((540 - 2 * 30) / 30)) * 30 + 30;

        // Weighted random crop type
        const rand = Math.random();
        let type = 'wheat';
        if (rand < 0.1) type = 'goldenApple';
        else if (rand < 0.4) type = 'pumpkin';

        this.crops.push(new Crop(gx, gy, type));
    }

    /**
     * Spawn a power-up randomly
     */
    spawnPowerUp() {
        if (Math.random() < 0.02) { // 2% chance per spawn check
            const gx = Math.floor(Math.random() * ((900 - 2 * 30) / 30)) * 30 + 30;
            const gy = Math.floor(Math.random() * ((540 - 2 * 30) / 30)) * 30 + 30;
            const type = Math.random() < 0.7 ? 'speedBoost' : 'scythe';
            this.powerUps.push(new PowerUp(gx, gy, type));
        }
    }

    /**
     * Check for collisions between entities
     * @param {Entity} a - First entity
     * @param {Entity} b - Second entity
     * @returns {boolean} True if colliding
     */
    aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        this.levelsCompleted++;
        this.currentLevel++;

        if (this.currentLevel > this.totalLevels) {
            this.state = State.WIN;
            this.updateUIStatus("You Win All Levels!");
        } else {
            this.setupLevel(this.currentLevel);
            this.crops = [];
            this.powerUps = [];
            this.updateUIStatus(`Level ${this.currentLevel}!`);
        }
    }

    /**
     * Advance to the next level or end game if all levels completed
     */
    advanceToNextLevel() {
        // Hide the Next Level button
        if (this.ui.nextLevel) {
            this.ui.nextLevel.style.display = 'none';
        }

        this.levelsCompleted++;
        this.currentLevel++;

        if (this.currentLevel > this.totalLevels) {
            // All levels completed - player wins the entire game
            this.state = State.WIN;
            this.updateUIStatus("Congratulations! You completed all levels!");
            this.showVictoryScreen();
        } else {
            // Setup next level
            this.setupLevel(this.currentLevel);
            this.crops = [];
            this.powerUps = [];
            this.levelCompleted = false;
            this.state = State.PLAYING;
            this.updateUIStatus(`Level ${this.currentLevel} - Go!`);

            // Brief ready message
            setTimeout(() => {
                this.updateUIStatus("Playing...");
            }, 2000);
        }
        this.syncUI();
    }

    /**
     * Update game state
     * @param {number} dt - Delta time
     */
    update(dt) {
        if (this.state !== State.PLAYING) return;

        // Countdown timer
        this.timeLeft = Math.max(0, this.timeLeft - dt);
        if (this.timeLeft <= 0) {
            this.state = State.GAME_OVER;
            this.updateUIStatus("Game Over");
            this.syncUI();
            return;
        }

        // Update player
        this.player.handleInput(this.input);
        this.player.update(dt, this);

        // Spawn crops with increasing frequency based on level
        this._accumSpawn += dt;
        while (this._accumSpawn >= this.spawnEvery) {
            this._accumSpawn -= this.spawnEvery;
            this.spawnCrop();
            this.spawnPowerUp();
        }

        // Update crows (moving obstacles)
        this.crows.forEach(crow => crow.update(dt, this));

        // Check crop collection
        // Using arrow function here to maintain 'this' context in the filter callback
        const collected = this.crops.filter(c => this.aabb(this.player, c));
        if (collected.length) {
            // Using arrow function in forEach to maintain context
            collected.forEach(c => {
                c.dead = true;
                this.score += c.points;
            });

            this.syncUI();

            if (this.score >= this.goal) {
                this.nextLevel();
            }
        }

        // Check power-up collection
        // Arrow function maintains 'this' context
        const collectedPowerUps = this.powerUps.filter(p => this.aabb(this.player, p));
        collectedPowerUps.forEach(p => {
            p.dead = true;
            if (p.type === 'speedBoost') {
                this.player.speedBoost = 5; // 5 seconds
            } else if (p.type === 'scythe') {
                this.player.hasScythe = 3; // 3 seconds
                // Collect all nearby crops when scythe is active
                const nearbyCrops = this.crops.filter(c => {
                    const dx = c.x - this.player.x;
                    const dy = c.y - this.player.y;
                    return Math.sqrt(dx * dx + dy * dy) < 100; // 100px radius
                });
                nearbyCrops.forEach(c => {
                    c.dead = true;
                    this.score += c.points;
                });
            }
        });

        // Check crow collisions (reduce score)
        // Arrow function maintains context in filter
        const hitCrows = this.crows.filter(c => this.aabb(this.player, c));
        if (hitCrows.length) {
            this.score = Math.max(0, this.score - 2);
            this.syncUI();
        }

        // Clean up dead entities
        // Using arrow functions for concise array filtering
        this.crops = this.crops.filter(c => !c.dead);
        this.powerUps = this.powerUps.filter(p => !p.dead);

        // Update animations
        this.crops.forEach(c => c.update(dt, this));
        this.powerUps.forEach(p => p.update(dt, this));

        this.syncUI();
    }

    /**
     * Complete the current level and show level complete screen
     */
    completeLevel() {
        this.state = State.LEVEL_COMPLETE;
        this.updateUIStatus(`Level ${this.currentLevel} Complete!`);

        // Show the Next Level button
        if (this.ui.nextLevel) {
            this.ui.nextLevel.style.display = 'block';

            // Update button text based on whether this is the final level
            if (this.currentLevel >= this.totalLevels) {
                this.ui.nextLevel.textContent = "Final Level!";
                this.ui.nextLevel.disabled = true;
            } else {
                this.ui.nextLevel.textContent = `Next Level (${this.currentLevel + 1})`;
                this.ui.nextLevel.disabled = false;
            }
        }

        // Show level completion statistics
        this.showLevelCompleteStats();
    }

    /**
     * Show level completion statistics
     */
    showLevelCompleteStats() {
        const levelConfig = this.config.levels.find(l => l.number === this.currentLevel);
        const timeBonus = Math.max(0, Math.floor(this.timeLeft * 2)); // 2 points per second remaining

        console.log(`Level ${this.currentLevel} Complete!`);
        console.log(`Time remaining: ${Math.ceil(this.timeLeft)}s`);
        console.log(`Time bonus: +${timeBonus} points`);
        console.log(`Total score: ${this.score}`);

        // You could display this in the UI as well
        if (this.ui.status) {
            this.ui.status.textContent = `Level ${this.currentLevel} Complete! Time bonus: +${timeBonus}`;
        }

        // Add time bonus to score
        this.score += timeBonus;
        this.syncUI();
    }

    /**
     * Render the game
     */
    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.clearRect(0, 0, 900, 540);

        // Field background
        ctx.fillStyle = "#dff0d5";
        ctx.fillRect(0, 0, 900, 540);
        ctx.strokeStyle = "#c7e0bd";
        ctx.lineWidth = 1;
        for (let y = 30; y < 540; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(900, y);
            ctx.stroke();
        }
        for (let x = 30; x < 900; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 540);
            ctx.stroke();
        }

        // Draw game objects
        if (this.state !== State.LEVEL_COMPLETE) {
            this.crops.forEach(c => c.draw(ctx));
            this.obstacles.forEach(o => o.draw(ctx));
            this.crows.forEach(c => c.draw(ctx));
            this.powerUps.forEach(p => p.draw(ctx));
            this.player.draw(ctx);
        }

        // UI overlays
        ctx.fillStyle = "#333";
        ctx.font = "16px system-ui, sans-serif";

        if (this.state === State.MENU) {
            ctx.fillText("Press Start to play", 20, 28);
        } else if (this.state === State.PAUSED) {
            ctx.fillText("Paused (press P to resume)", 20, 28);
        } else if (this.state === State.GAME_OVER) {
            ctx.fillText("Time up! Press Reset to return to Menu", 20, 28);
        } else if (this.state === State.LEVEL_COMPLETE) {
            // Level complete screen
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, 900, 540);

            ctx.fillStyle = "#4CAF50";
            ctx.font = "bold 36px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Level ${this.currentLevel} Complete!`, 450, 200);

            ctx.fillStyle = "white";
            ctx.font = "24px system-ui, sans-serif";
            ctx.fillText(`Score: ${this.score}`, 450, 250);
            ctx.fillText(`Time Bonus: +${Math.max(0, Math.floor(this.timeLeft * 2))}`, 450, 290);

            if (this.currentLevel >= this.totalLevels) {
                ctx.fillText("Final Level Reached!", 450, 340);
                ctx.fillText("Click Next Level for the final challenge", 450, 380);
            } else {
                ctx.fillText(`Next: Level ${this.currentLevel + 1}`, 450, 340);
                ctx.fillText("Click Next Level to continue", 450, 380);
            }

            ctx.textAlign = "left"; // Reset text alignment
        } else if (this.state === State.WIN) {
            if (this.currentLevel > this.totalLevels) {
                ctx.fillText("All levels complete! Press Reset to play again", 20, 28);
            } else {
                ctx.fillText(`Level ${this.currentLevel} complete!`, 20, 28);
            }
        }

        // Power-up status (only show during gameplay)
        if (this.state === State.PLAYING) {
            if (this.player.speedBoost > 0) {
                ctx.fillText(`Speed Boost: ${Math.ceil(this.player.speedBoost)}s`, 20, 50);
            }
            if (this.player.hasScythe > 0) {
                ctx.fillText(`Scythe: ${Math.ceil(this.player.hasScythe)}s`, 20, 70);
            }
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.input.dispose();
        window.removeEventListener("resize", this._onResize);
    }
}

// Initialize game when DOM is loaded
// Using arrow function for DOMContentLoaded to maintain clean scope
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game");
    if (canvas) {
        window.game = new Game(canvas);
    } else {
        console.error("Canvas #game not found. Check index.html IDs.");
    }
});
