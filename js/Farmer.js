import { Entity } from './Entity.js';

/**
 * Player-controlled farmer character with sprite animation
 * @class
 * @extends Entity
 */
export class Farmer extends Entity {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(x, y) {
        super(x, y, 34, 34);
        this.speed = 260;
        this.vx = 0;
        this.vy = 0;
        
        // Animation properties
        this.sprite = new Image();
        this.sprite.src = 'sprites/farmer.png';
        this.spriteLoaded = false;

        this.sprite.onerror = () => {
            console.error('Failed to load farmer sprite at:', this.sprite.src);
            this.spriteLoaded = false;
        };
        
        this.sprite.onload = () => {
            console.log('Farmer sprite loaded successfully');
            this.spriteLoaded = true;
        };
        
        // Animation state
        this.frame = 0;
        this.frameTimer = 0;
        this.direction = 0; // 0: down, 1: left, 2: right, 3: up
        this.isMoving = false;
        
        // Power-up states
        this.speedBoost = 0;
        this.hasScythe = 0;
    }

    /**
     * Handle keyboard input
     * @param {Input} input - Input handler instance
     */
    handleInput(input) {
        const L = input.keys.has("ArrowLeft"), R = input.keys.has("ArrowRight");
        const U = input.keys.has("ArrowUp"), D = input.keys.has("ArrowDown");
        
        this.vx = (R - L) * this.speed * (this.speedBoost > 0 ? 1.5 : 1);
        this.vy = (D - U) * this.speed * (this.speedBoost > 0 ? 1.5 : 1);
        
        // Update direction and movement state for animation
        this.isMoving = this.vx !== 0 || this.vy !== 0;
        if (L) this.direction = 1;
        if (R) this.direction = 2;
        if (U) this.direction = 3;
        if (D) this.direction = 0;
    }

    /**
     * Update farmer state
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) {
        // Update power-up timers
        if (this.speedBoost > 0) this.speedBoost -= dt;
        if (this.hasScythe > 0) this.hasScythe -= dt;
        
        // Update animation
        if (this.isMoving) {
            this.frameTimer += dt;
            if (this.frameTimer >= 0.1) { // 10 FPS animation
                this.frameTimer = 0;
                this.frame = (this.frame + 1) % 4;
            }
        } else {
            this.frame = 0; // Idle frame
        }

        // Movement with collision detection
        const oldX = this.x, oldY = this.y;
        this.x = this.clamp(this.x + this.vx * dt, 0, 900 - this.w);
        this.y = this.clamp(this.y + this.vy * dt, 0, 540 - this.h);
        
        // Collision with obstacles
        const hitObs = game.obstacles.some(o => this.aabb(this, o));
        if (hitObs) {
            this.x = oldX;
            this.y = oldY;
        }
    }

    /**
     * Draw farmer with sprite animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (this.spriteLoaded) {
            // Draw from sprite sheet (4x4 grid)
            const frameSize = 32;
            const sx = this.frame * frameSize;
            const sy = this.direction * frameSize;
            
            ctx.drawImage(
                this.sprite,
                sx, sy, frameSize, frameSize,
                this.x, this.y - 10, this.w, this.h + 10
            );
            
            // Draw power-up effects
            if (this.speedBoost > 0) {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            }
            if (this.hasScythe > 0) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - 2, this.y - 2, this.w + 4, this.h + 4);
            }
        } else {
            // Fallback to original drawing
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = "#c28e0e";
            ctx.fillRect(this.x + 4, this.y - 6, this.w - 8, 8);
            ctx.fillRect(this.x + 10, this.y - 18, this.w - 20, 12);
        }
    }

    /**
     * Clamp value between min and max
     * @param {number} v - Value to clamp
     * @param {number} lo - Minimum value
     * @param {number} hi - Maximum value
     * @returns {number} Clamped value
     */
    clamp(v, lo, hi) {
        return Math.min(hi, Math.max(lo, v));
    }

    /**
     * Axis-aligned bounding box collision detection
     * @param {Entity} a - First entity
     * @param {Entity} b - Second entity
     * @returns {boolean} True if colliding
     */
    aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
}
