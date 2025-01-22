class Sword {
    constructor(tier, parts = null) {
        if (!parts) {
            parts = {
                blade: swordParts.blades[Math.floor(Math.random() * swordParts.blades.length)],
                hilt: swordParts.hilts[Math.floor(Math.random() * swordParts.hilts.length)],
                gem: swordParts.gems[Math.floor(Math.random() * swordParts.gems.length)]
            };
        }
        
        this.tier = tier;
        this.parts = parts;
        this.element = parts.gem ? parts.gem.element : 'None';
        this.baseDamage = Math.floor(10 * Math.pow(1.5, tier-1)) * parts.blade.damageMultiplier;
        this.attackSpeed = (1 + tier * 0.2 + parts.hilt.attackSpeedBonus).toFixed(1);
        this.rarity = this.calculateRarity();
        this.modifiers = this.calculateModifiers();
        this.durability = 100;
    }

    calculateRarity() {
        const rand = Math.random();
        if (rand < 0.5) return 'Common';
        if (rand < 0.8) return 'Uncommon';
        if (rand < 0.95) return 'Rare';
        if (rand < 0.99) return 'Epic';
        return 'Legendary';
    }

    calculateModifiers() {
        return {
            critChance: Math.min(5 + (this.tier * 2) + gameState.upgrades.criticalStrike, 35) + '%',
            lootBonus: Math.floor(this.tier * 3 * gameState.upgrades.scrapEfficiency) + '%'
        };
    }
}

function forgeSword() {
    if (gameState.scrap < 50) return;
    gameState.scrap -= 50;
    gameState.currentSword = new Sword(gameState.currentTier);
    updateGameDisplay();
    addLogMessage("Forged new sword!");
}

function craftSword() {
    const selectedBlade = document.getElementById('blade-selector').value;
    const selectedHilt = document.getElementById('hilt-selector').value;
    const selectedGem = document.getElementById('gem-selector').value;
    
    const blade = swordParts.blades.find(b => b.name === selectedBlade);
    const hilt = swordParts.hilts.find(h => h.name === selectedHilt);
    const gem = swordParts.gems.find(g => g.name === selectedGem);
    
    // Check if we have required materials
    const bladeRecipe = gameState.craftingRecipes[selectedBlade];
    const hiltRecipe = gameState.craftingRecipes[selectedHilt];
    
    if (!hasRequiredMaterials(bladeRecipe) || !hasRequiredMaterials(hiltRecipe)) {
        addLogMessage("Not enough materials!");
        return;
    }
    
    // Deduct materials
    deductMaterials(bladeRecipe);
    deductMaterials(hiltRecipe);
    
    const totalCost = blade.scrapCost + hilt.scrapCost + (gem ? gem.scrapCost : 0);
    
    if (gameState.scrap < totalCost) {
        addLogMessage("Not enough scrap!");
        return;
    }
    
    gameState.scrap -= totalCost;
    gameState.currentSword = new Sword(gameState.currentTier, {blade, hilt, gem});
    updateGameDisplay();
    addLogMessage(`Crafted new ${getSwordName(gameState.currentSword)}!`);
}

function hasRequiredMaterials(recipe) {
    for (const [part, quantity] of Object.entries(recipe)) {
        if ((gameState.monsterParts[part] || 0) < quantity) {
            return false;
        }
    }
    return true;
}

function deductMaterials(recipe) {
    for (const [part, quantity] of Object.entries(recipe)) {
        gameState.monsterParts[part] -= quantity;
        if (gameState.monsterParts[part] === 0) {
            delete gameState.monsterParts[part];
        }
    }
}

function upgradeSword() {
    if (gameState.scrap < 100 || !gameState.currentSword) return;
    gameState.scrap -= 100;
    gameState.currentTier++;
    updateGameDisplay();
    addLogMessage(`Upgraded to Tier ${gameState.currentTier}!`);
}

export { Sword, forgeSword, craftSword, upgradeSword, hasRequiredMaterials, deductMaterials };