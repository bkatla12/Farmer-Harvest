import { Entity } from './Entity.js';

/**
 * Power-up collectible
 * @class
 * @extends Entity
 */
export class PowerUp extends Entity {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Power-up type ('speedBoost', 'scythe')
     */
    constructor(x, y, type) {
        super(x, y, 20, 20);
        this.type = type;
        this.pulse = 0;
    }

    /**
     * Update animation
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) {
        this.pulse += dt * 5;
    }

    /**
     * Draw power-up with pulsing effect
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const pulseSize = Math.sin(this.pulse) * 2;
        const size = this.w + pulseSize;
        const offset = pulseSize / 2;

        switch (this.type) {
            case 'speedBoost':
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.moveTo(this.x - offset + size / 2, this.y - offset);
                ctx.lineTo(this.x - offset + size, this.y - offset + size);
                ctx.lineTo(this.x - offset, this.y - offset + size);
                ctx.closePath();
                ctx.fill();
                break;
            case 'scythe':
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(this.x - offset + size / 2, this.y - offset + size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
}
