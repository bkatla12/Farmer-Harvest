## FARMER-HARVEST
This is a lightweight html game for game enthuthiasits. The player moves the farmer by use of arrow keys where up arrow (Moves the farmer up), down (movest the farmer downward), left arrow (moves farmer to the left), right arrow (moves the farmer to the right. The farmer havests wheat, Pumpkin, and Golden Apple.

The game has 3 rows that switch automatically.

# New Features
**Speed Boost (Represented by Animated Triagle)** + **scythe (Represented by Red Circle)** - Speed boost help the farmer tonavigate throught tight spaces quickly to avoid crows. The Scythe also serve the same purpose as speed boost but these help farmers harvest more crops within 100px distance without necessarily having to come into contact with the crop.

**Scarecrows and Crows** - These are moving black in color and when the farmer comes into contact with then, the score reduces.

# How to run the game?

1) Open the game in vs code. Install Live Server (Five Server) Extension.

2) Click Go Live at the bottom right corner of the vs code. The Game will be lauched with the default browser. Click Start to play. You can scroll down  to see the instructions and how to play the game.

# Arrow Function
Arrow function added in DOMContentLoaded to maintain the clean scope.
```bash
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game");
    if (canvas) {
        window.game = new Game(canvas);
    } else {
        console.error("Canvas #game not found. Check index.html IDs.");
    }
});
```

# this keyword
Used in the following code to refer to this particular context.
```bash
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
```

# bind
bind ensures this inside onResize still points to the game object.
bind gives us a stable function reference so we can later call removeEventListener with the exact same handler.

```bash
// Using bind here for the same reason as Input class - we need to remove the exact same function reference
        this._onResize = this.onResize.bind(this);
        window.addEventListener("resize", this._onResize);
```

