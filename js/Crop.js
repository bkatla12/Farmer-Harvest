import { Entity } from './Entity.js';

/**
 * Collectible crop with different types and point values
 * @class
 * @extends Entity
 */
export class Crop extends Entity {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Crop type ('wheat', 'pumpkin', 'goldenApple')
     */
    constructor(x, y, type = "wheat") {
        super(x, y, 20, 26);
        this.type = type;
        this.sway = Math.random() * Math.PI * 2;
        this.points = this.getPointsValue();
    }

    /**
     * Get point value based on crop type
     * @returns {number} Point value
     */
    getPointsValue() {
        const values = { wheat: 1, pumpkin: 3, goldenApple: 5 };
        return values[this.type] || 1;
    }

    /**
     * Update crop animation
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) {
        this.sway += dt * 2;
    }

    /**
     * Draw crop with type-specific colors
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const { x, y, w, h } = this;
        
        // Set colors based on type
        let stemColor, headColor;
        switch (this.type) {
            case 'pumpkin':
                stemColor = "#2f7d32";
                headColor = "#ff6b00";
                break;
            case 'goldenApple':
                stemColor = "#2f7d32";
                headColor = "#ffd700";
                break;
            default: // wheat
                stemColor = "#2f7d32";
                headColor = "#d9a441";
        }

        // Draw stem with sway
        ctx.strokeStyle = stemColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w / 2 + Math.sin(this.sway) * 3, y + h / 2, x + w / 2, y);
        ctx.stroke();

        // Draw crop head
        ctx.fillStyle = headColor;
        if (this.type === 'pumpkin') {
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'goldenApple') {
            ctx.beginPath();
            ctx.arc(x + w / 2, y, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.ellipse(x + w / 2, y, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}