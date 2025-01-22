// Load JSON data using fetch API
async function loadFile(filePath) {
    try {
        // Prepend 'data/' to the file path
        const response = await fetch(`data/${filePath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error loading file:', error);
        throw error;
    }
}

// Then modify loadGameData to use this
async function loadGameData() {
    try {
        // Load sword parts data
        swordParts = await loadFile('swordParts.json');
        
        // Load monsters data
        monsters = await loadFile('monsters.json');
        
        console.log("Game data loaded:", { swordParts, monsters });
        initializeGame();
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

let gameState = {
    scrap: 0,
    currentTier: 1,
    currentSword: null,
    autoForgeInterval: null,
    autoForgeActive: false,
    currentMonster: null,
    upgrades: {
        autoForgeSpeed: 1,
        scrapEfficiency: 1,
        criticalStrike: 0
    },
    statusEffects: []
};

// Classes
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

// Import Monster class and functions
import { 
    Monster,
    applyStatusEffect,
    processStatusEffects,
    spawnMonster,
    handleMonsterDefeat,
    updateMonsterDisplay,
    updateStatusDisplay
} from './Monster.js';

// Combat Functions
// Make attackMonster function globally accessible
    window.attackMonster = function() {
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
    
    // Debug output
    console.log('Attack Details:', {
        sword: sword,
        baseDamage: damage,
        isCritical: isCritical,
        finalDamage: finalDamage,
        previousHealth: previousHealth,
        newHealth: gameState.currentMonster.health
    });

    if (isCritical) {
        addLogMessage(`Critical hit! Dealt ${finalDamage} damage to ${gameState.currentMonster.name}!`);
    } else {
        addLogMessage(`Hit ${gameState.currentMonster.name} for ${finalDamage} damage!`);
    }

    // Update monster health display immediately
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

function calculateDamage(sword) {
    if (!sword) return 0;
    const base = sword.baseDamage || 10;
    const variance = 0.3;
    const damage = base * (1 - variance + Math.random() * variance * 2);
    return Math.max(1, Math.floor(damage)); // Ensure at least 1 damage
}



// Sword Management
function createStarterSword() {
    const starterSword = new Sword(1, {
        blade: swordParts.blades[0],
        hilt: swordParts.hilts[0],
        gem: null
    });
    // Set starter sword properties explicitly
    starterSword.baseDamage = 10; // Base damage for starter sword
    starterSword.attackSpeed = 1.0;
    starterSword.rarity = 'Common';
    starterSword.modifiers = {
        critChance: '5%',
        lootBonus: '0%'
    };
    return starterSword;
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

function upgradeSword() {
    if (gameState.scrap < 100 || !gameState.currentSword) return;
    gameState.scrap -= 100;
    gameState.currentTier++;
    updateGameDisplay();
    addLogMessage(`Upgraded to Tier ${gameState.currentTier}!`);
}

function toggleAutoForge() {
    gameState.autoForgeActive = !gameState.autoForgeActive;
    const button = document.querySelector('[onclick="toggleAutoForge()"]');
    button.textContent = `Auto-Forge: ${gameState.autoForgeActive ? 'On' : 'Off'}`;
    
    if (gameState.autoForgeActive) {
        gameState.autoForgeInterval = setInterval(() => {
            if (gameState.scrap >= 50) forgeSword();
        }, 3000);
    } else {
        clearInterval(gameState.autoForgeInterval);
    }
}

// Display Functions
function updateGameDisplay() {
    document.getElementById('scrap').textContent = gameState.scrap;
    document.getElementById('tier').textContent = romanize(gameState.currentTier);
    updateMonsterDisplay();
    
    if (gameState.currentSword) {
        document.getElementById('sword-name').textContent = getSwordName(gameState.currentSword);
        document.getElementById('damage').textContent = 
            `${Math.floor(gameState.currentSword.baseDamage * 0.7)}-${Math.floor(gameState.currentSword.baseDamage * 1.3)}`;
        document.getElementById('attack-speed').textContent = gameState.currentSword.attackSpeed;
        document.getElementById('durability').value = gameState.currentSword.durability;
        
        document.getElementById('rarity').textContent = gameState.currentSword.rarity;
        document.getElementById('element').textContent = gameState.currentSword.element;
        document.getElementById('crit-chance').textContent = gameState.currentSword.modifiers.critChance;
        document.getElementById('loot-bonus').textContent = gameState.currentSword.modifiers.lootBonus;
    }
}



// View Management
function showView(viewName) {
    console.log('Showing view:', viewName); // Debug log
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.remove('active-view');
    });
    
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active-view');
        if (viewName === 'hunt' && !gameState.currentMonster) {
            spawnMonster();
        }
    } else {
        console.error('View not found:', viewName);
    }
}

// Make showView available globally
window.showView = showView;

// Utility Functions
function addLogMessage(message) {
    const log = document.getElementById('combat-log');
    const entry = document.createElement('div');
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function getSwordName(sword) {
    if (!sword) return "No Sword";
    const parts = sword.parts;
    return `${parts.blade.name} ${sword.rarity} Sword`;
}

function romanize(num) {
    const roman = {
        M: 1000, CM: 900, D: 500, CD: 400,
        C: 100, XC: 90, L: 50, XL: 40,
        X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let str = '';
    for (let i of Object.keys(roman)) {
        let q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }
    return str;
}

// Save/Load Functions
function saveGame() {
    localStorage.setItem('swordForgeSave', JSON.stringify(gameState));
}

function loadGame() {
    const save = localStorage.getItem('swordForgeSave');
    if (save) {
        const savedState = JSON.parse(save);
        gameState = {...gameState, ...savedState};
        if (gameState.currentSword) {
            Object.setPrototypeOf(gameState.currentSword, Sword.prototype);
        }
    }
}

// Event Listeners
function setupEventListeners() {
    // Set up attack button
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.onclick = attackMonster;
    }

    // Set up view buttons
    document.querySelectorAll('[data-view]').forEach(button => {
        button.onclick = (e) => {
            const viewName = e.target.getAttribute('data-view');
            console.log('Button clicked:', viewName); // Debug log
            showView(viewName);
        };
    });

    // Make functions globally available
    window.forgeSword = forgeSword;
    window.upgradeSword = upgradeSword;
    window.toggleAutoForge = toggleAutoForge;
    window.craftSword = craftSword;
}

// Initialization
function initializeGame() {
    try {
        loadGame();
        if (!gameState.currentSword) {
            gameState.currentSword = createStarterSword();
        }
    } catch (e) {
        console.error("Failed to load save:", e);
        gameState.currentSword = createStarterSword();
        gameState.scrap = 0;
        gameState.currentTier = 1;
    }
    
    spawnMonster();
    updateGameDisplay();
    setupEventListeners(); // Make sure this is called
    showView('forge');
    
    setInterval(saveGame, 30000);
}

// Export the loadGameData function to be used by init.js
export { loadGameData };