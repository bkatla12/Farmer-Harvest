import { Entity } from './Entity.js';

/**
 * Static scarecrow obstacle
 * @class
 * @extends Entity
 */
export class Scarecrow extends Entity {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    constructor(x, y) {
        super(x, y, 26, 46);
    }

    /**
     * Draw scarecrow
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        ctx.fillStyle = "#9b7653";
        ctx.fillRect(x + w / 2 - 3, y, 6, h);
        ctx.fillStyle = "#c28e0e";
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#6b4f2a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y + 18);
        ctx.lineTo(x + w, y + 18);
        ctx.stroke();
    }
}

/**
 * Moving crow obstacle that reduces score
 * @class
 * @extends Entity
 */
export class Crow extends Entity {
    /**
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     */
    constructor(x, y) {
        super(x, y, 24, 24);
        this.speed = 120;
        this.vx = (Math.random() - 0.5) * 2 * this.speed;
        this.vy = (Math.random() - 0.5) * 2 * this.speed;
        this.color = "#333";
    }

    /**
     * Update crow movement with bouncing
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Bounce off walls
        if (this.x <= 0 || this.x >= 900 - this.w) this.vx *= -1;
        if (this.y <= 0 || this.y >= 540 - this.h) this.vy *= -1;

        // Keep in bounds
        this.x = Math.max(0, Math.min(900 - this.w, this.x));
        this.y = Math.max(0, Math.min(540 - this.h, this.y));
    }

    /**
     * Draw crow
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 3, this.h / 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
