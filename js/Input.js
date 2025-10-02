/**
 * Input handler for keyboard events
 * @class
 */
export class Input {
    /**
     * @param {Game} game - Game instance
     */
    constructor(game) {
        this.game = game;
        this.keys = new Set();
        
        // Using bind here because we need to preserve the Input instance context
        // Arrow functions wouldn't work here because we need to remove the exact same function reference
        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);
        
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    onKeyDown(e) {
        if (e.key === "p" || e.key === "P") this.game.togglePause();
        this.keys.add(e.key);
    }

    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - Keyboard event
     */
    onKeyUp(e) {
        this.keys.delete(e.key);
    }

    /**
     * Clean up event listeners
     */
    dispose() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}
