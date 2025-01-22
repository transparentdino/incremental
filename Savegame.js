// Use the shared gameState from game.js
let gameState = window.gameState;

// Save/Load Functions with Base64 Encoding
function saveGame() {
    try {
        const jsonString = JSON.stringify(gameState);
        const encodedSave = btoa(unescape(encodeURIComponent(jsonString)));
        localStorage.setItem('swordForgeSave', encodedSave);
    } catch (error) {
        console.error('Error saving game:', error);
    }
}

function loadGame() {
    try {
        const encodedSave = localStorage.getItem('swordForgeSave');
        if (encodedSave) {
            const jsonString = decodeURIComponent(escape(atob(encodedSave)));
            const savedState = JSON.parse(jsonString);
            gameState = {...gameState, ...savedState};
            if (gameState.currentSword) {
                Object.setPrototypeOf(gameState.currentSword, Sword.prototype);
            }
        }
    } catch (error) {
        console.error('Error loading game:', error);
        throw error; // Rethrow to be caught by initializeGame
    }
}

// Utility functions for Base64 encoding/decoding
function btoa(str) {
    return Buffer.from(str).toString('base64');
}

function atob(str) {
    return Buffer.from(str, 'base64').toString();
}