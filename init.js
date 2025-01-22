// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Import game module
        const gameModule = await import('./game.js');
        
        // Load game data
        await gameModule.loadGameData();
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});