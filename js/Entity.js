/**
 * Base Entity class for all game objects
 * @class
 */
export class Entity {
    /**
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} w - Width
     * @param {number} h - Height
     */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dead = false;
    }

    /**
     * Update entity state
     * @param {number} dt - Delta time
     * @param {Game} game - Game instance
     */
    update(dt, game) { }

    /**
     * Draw entity
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) { }
}