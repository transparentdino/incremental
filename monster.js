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
        this.parts = monster.parts || [
            { name: 'Scale', dropRate: 0.8 },
            { name: 'Claw', dropRate: 0.5 },
            { name: 'Fang', dropRate: 0.3 },
            { name: 'Gem', dropRate: 0.1 }
        ];
    }

    getRandomDrops() {
        const drops = [];
        this.parts.forEach(part => {
            if (Math.random() < part.dropRate) {
                drops.push(part.name);
            }
        });
        return drops;
    }
}

function spawnMonster() {
    gameState.statusEffects = [];
    const tier = gameState.currentArea.getRandomTier();
    gameState.currentMonster = new Monster(tier);
    
    // Apply area modifiers
    if (gameState.currentSword) {
        const element = gameState.currentSword.element;
        if (element && gameState.currentArea.elementalEffects[element]) {
            const multiplier = gameState.currentArea.elementalEffects[element];
            gameState.currentMonster.health *= multiplier;
            gameState.currentMonster.maxHealth = gameState.currentMonster.health;
        }
    }
    
    updateMonsterDisplay();
    addLogMessage(`A level ${gameState.currentMonster.level} ${gameState.currentMonster.name} appears in ${gameState.currentArea.name}!`);
}

function handleMonsterDefeat() {
    const reward = Math.floor(gameState.currentMonster.scrapReward * 
        (1 + parseInt(gameState.currentSword.modifiers.lootBonus) / 100));
    gameState.scrap += reward;
    
    // Get monster drops
    const drops = gameState.currentMonster.getRandomDrops();
    if (!gameState.monsterParts) {
        gameState.monsterParts = {};
    }
    
    // Add drops to inventory
    drops.forEach(part => {
        gameState.monsterParts[part] = (gameState.monsterParts[part] || 0) + 1;
    });
    
    // Create log message
    let logMessage = `Defeated ${gameState.currentMonster.name}! Gained ${reward} scrap.`;
    if (drops.length > 0) {
        logMessage += `\nObtained: ${drops.join(', ')}`;
    }
    addLogMessage(logMessage);
    
    spawnMonster();
    updateGameDisplay();
}

function attackMonster() {
    if (!gameState.currentMonster || gameState.currentMonster.health <= 0) {
        spawnMonster();
        return;
    }

    if (!gameState.currentSword) {
        addLogMessage("You need a sword to attack!");
        return;
    }

    const sword = gameState.currentSword;
    const damage = calculateDamage(sword);
    const isCritical = Math.random() < (parseFloat(sword.modifiers.critChance) / 100);
    
    const finalDamage = isCritical ? damage * 2 : damage;
    const previousHealth = gameState.currentMonster.health;
    gameState.currentMonster.health = Math.max(0, gameState.currentMonster.health - finalDamage);
    
    if (isCritical) {
        addLogMessage(`Critical hit! Dealt ${finalDamage} damage to ${gameState.currentMonster.name}!`);
    } else {
        addLogMessage(`Hit ${gameState.currentMonster.name} for ${finalDamage} damage!`);
    }

    updateMonsterDisplay();

    // Apply element effects
    if (sword.element === 'Fire' && !gameState.statusEffects.find(e => e.type === 'Burn')) {
        applyStatusEffect('Burn', damage * 0.2);
    } else if (sword.element === 'Ice' && !gameState.statusEffects.find(e => e.type === 'Freeze')) {
        applyStatusEffect('Freeze', damage * 0.1);
    }

    if (gameState.currentMonster.health <= 0) {
        handleMonsterDefeat();
    }

    processStatusEffects();
    updateGameDisplay();
};

export { Monster, spawnMonster, handleMonsterDefeat, attackMonster };