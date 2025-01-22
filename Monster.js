class Monster {
    constructor(tier) {
        const tierData = monsters.tiers.find(t => t.level === tier) || monsters.tiers[0];
        const monster = tierData.monsters[Math.floor(Math.random() * tierData.monsters.length)];
        
        this.name = monster.name;
        this.health = monster.health * Math.pow(1.5, tier - 1);
        this.maxHealth = this.health;
        this.scrapReward = monster.scrapReward * Math.pow(1.2, tier - 1);
        this.attacks = monster.attacks;
        this.element = monster.element || 'None';
        this.level = tier;
    }
}

// Status Effect Functions
function applyStatusEffect(type, damage) {
    gameState.statusEffects.push({
        type,
        duration: 3,
        damagePerTick: Math.floor(damage)
    });
    updateStatusDisplay();
}

function processStatusEffects() {
    if (gameState.statusEffects.length === 0) return;
    
    gameState.statusEffects.forEach(effect => {
        if (effect.duration > 0 && gameState.currentMonster.health > 0) {
            gameState.currentMonster.health -= effect.damagePerTick;
            addLogMessage(`${effect.type} dealt ${effect.damagePerTick} damage!`);
            effect.duration--;
        }
    });
    
    gameState.statusEffects = gameState.statusEffects.filter(effect => effect.duration > 0);
    updateStatusDisplay();
}

// Monster Management
function spawnMonster() {
    gameState.statusEffects = [];
    gameState.currentMonster = new Monster(gameState.currentTier);
    updateMonsterDisplay();
    addLogMessage(`A level ${gameState.currentMonster.level} ${gameState.currentMonster.name} appears!`);
}

function handleMonsterDefeat() {
    const reward = Math.floor(gameState.currentMonster.scrapReward * 
        (1 + parseInt(gameState.currentSword.modifiers.lootBonus) / 100));
    gameState.scrap += reward;
    addLogMessage(`Defeated ${gameState.currentMonster.name}! Gained ${reward} scrap.`);
    spawnMonster();
}

// Monster Display Functions
function updateMonsterDisplay() {
    if (!gameState.currentMonster) return;
    
    const healthBar = document.getElementById('monster-health');
    const healthPercent = (gameState.currentMonster.health / gameState.currentMonster.maxHealth) * 100;
    
    if (healthBar) {
        healthBar.value = healthPercent;
    }
    
    const elementDisplay = document.getElementById('monster-element');
    if (elementDisplay) {
        elementDisplay.textContent = gameState.currentMonster.element;
    }
    
    const rewardDisplay = document.getElementById('monster-reward');
    if (rewardDisplay) {
        rewardDisplay.textContent = Math.floor(gameState.currentMonster.scrapReward);
    }
    
    updateStatusDisplay();
}

function updateStatusDisplay() {
    const statusElement = document.getElementById('monster-status');
    if (!statusElement) return;
    
    statusElement.innerHTML = gameState.statusEffects
        .map(e => `<div class="status-effect ${e.type.toLowerCase()}">${e.type} (${e.duration})</div>`)
        .join('');
}

// Export the Monster class and functions
export { 
    Monster,
    applyStatusEffect,
    processStatusEffects,
    spawnMonster,
    handleMonsterDefeat,
    updateMonsterDisplay,
    updateStatusDisplay
};