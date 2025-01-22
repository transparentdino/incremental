

import { Monster, spawnMonster, handleMonsterDefeat, attackMonster } from './monster.js';
import { Sword, forgeSword, craftSword, upgradeSword, hasRequiredMaterials, deductMaterials } from './sword.js';

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
        // Load game data
        const [swordPartsData, monstersData, areasData] = await Promise.all([
            loadFile('swordParts.json'),
            loadFile('monsters.json'),
            loadFile('areas.json')
        ]);
        
        swordParts = swordPartsData;
        monsters = monstersData;
        gameState.areas = areasData.areas.map(area => new Area(area));
        
        // Set default area
        gameState.currentArea = gameState.areas[0];
        
        console.log("Game data loaded:", { swordParts, monsters, areas: gameState.areas });
        initializeGame();
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Export gameState for use in Savegame.js
window.gameState = {
    scrap: 0,
    currentTier: 1,
    currentSword: null,
    autoForgeInterval: null,
    autoForgeActive: false,
    currentMonster: null,
    currentArea: null,
    areas: [],
    upgrades: {
        autoForgeSpeed: 1,
        scrapEfficiency: 1,
        criticalStrike: 0
    },
    statusEffects: [],
    inventory: {
        monsterParts: {},
        craftingMaterials: {},
        swords: []
    },
    craftingRecipes: {
        'Common Blade': { Scale: 5, Claw: 2 },
        'Uncommon Blade': { Scale: 10, Claw: 5, Fang: 2 },
        'Rare Blade': { Scale: 20, Claw: 10, Fang: 5, Gem: 1 },
        'Common Hilt': { Scale: 3, Claw: 1 },
        'Uncommon Hilt': { Scale: 6, Claw: 3, Fang: 1 },
        'Rare Hilt': { Scale: 12, Claw: 6, Fang: 3, Gem: 1 }
    }
};

// Inventory Management Functions
function addToInventory(item, quantity, category = 'monsterParts') {
    if (!gameState.inventory[category]) {
        console.error(`Invalid inventory category: ${category}`);
        return;
    }
    gameState.inventory[category][item] = (gameState.inventory[category][item] || 0) + quantity;
    updateInventoryDisplay();
}

function removeFromInventory(item, quantity, category = 'monsterParts') {
    if (!gameState.inventory[category] || !gameState.inventory[category][item]) {
        console.error(`Item not found in inventory: ${item}`);
        return;
    }
    gameState.inventory[category][item] -= quantity;
    if (gameState.inventory[category][item] <= 0) {
        delete gameState.inventory[category][item];
    }
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const inventoryElement = document.getElementById('inventory');
    if (!inventoryElement) return;

    let inventoryHTML = '<h3>Inventory</h3>';
    for (const [category, items] of Object.entries(gameState.inventory)) {
        inventoryHTML += `<h4>${category}</h4>`;
        if (Object.keys(items).length === 0) {
            inventoryHTML += `<p>No ${category} yet</p>`;
        } else {
            inventoryHTML += '<ul>';
            for (const [item, quantity] of Object.entries(items)) {
                inventoryHTML += `<li>${item}: ${quantity}</li>`;
            }
            inventoryHTML += '</ul>';
        }
    }
    inventoryElement.innerHTML = inventoryHTML;
}

// Classes
class Area {
    constructor(areaData) {
        this.id = areaData.id;
        this.name = areaData.name;
        this.description = areaData.description;
        this.monsterTiers = areaData.monsterTiers;
        this.scrapMultiplier = areaData.scrapMultiplier;
        this.elementalEffects = areaData.elementalEffects;
    }
    
    getRandomTier() {
        return this.monsterTiers[Math.floor(Math.random() * this.monsterTiers.length)];
    }
}




// Combat Functions


function calculateDamage(sword) {
    if (!sword) return 0;
    const base = sword.baseDamage || 10;
    const variance = 0.3;
    const damage = base * (1 - variance + Math.random() * variance * 2);
    return Math.max(1, Math.floor(damage)); // Ensure at least 1 damage
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


function changeArea(areaId) {
    const newArea = gameState.areas.find(area => area.id === areaId);
    if (newArea) {
        gameState.currentArea = newArea;
        const description = `${newArea.description}\n\nPossible Monsters:\n` +
            newArea.monsterTiers.map(tier => {
                const tierData = monsters.tiers.find(t => t.level === tier);
                return tierData.monsters.map(m => `- ${m.name} (Level ${tier})`).join('\n');
            }).join('\n');
        document.getElementById('area-description').textContent = description;
        spawnMonster();
        updateGameDisplay();
    }
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
    updateInventoryDisplay();
    
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
    
    // Update monster name and level display
    const monsterNameDisplay = document.getElementById('monster-name');
    if (monsterNameDisplay) {
        monsterNameDisplay.textContent = `${gameState.currentMonster.name} (Level ${gameState.currentMonster.level})`;
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

// View Management
function showView(viewName) {
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.remove('active-view');
    });
    
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active-view');
        if (viewName === 'hunt' && !gameState.currentMonster) {
            spawnMonster();
        }
    }
}

// Utility Functions
export function addLogMessage(message) {
    console.log('Attempting to add log message:', message);
    const log = document.getElementById('combat-log');
    if (!log) {
        console.error('Combat log element not found!');
        return;
    }
    const entry = document.createElement('div');
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    console.log('Message added to combat log:', message);
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
    // Set up area selector
    const areaSelector = document.getElementById('area-selector');
    if (areaSelector) {
        areaSelector.addEventListener('change', (e) => {
            changeArea(e.target.value);
        });
    }

    // Set up attack button
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        console.log('Attack button found and event listener added');
        attackButton.addEventListener('click', () => {
            console.log('Attack button clicked');
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
            gameState.currentMonster.health -= finalDamage;
            
            if (isCritical) {
                addLogMessage(`Critical hit! Dealt ${finalDamage} damage to ${gameState.currentMonster.name}!`);
            } else {
                addLogMessage(`Hit ${gameState.currentMonster.name} for ${finalDamage} damage!`);
            }

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
        });
    }

    // Set up view buttons
    document.querySelectorAll('[data-view]').forEach(button => {
        button.addEventListener('click', (e) => {
            showView(e.target.dataset.view);
        });
    });

    // Set up other buttons
    const forgeButton = document.querySelector('[onclick="forgeSword()"]');
    if (forgeButton) {
        forgeButton.onclick = () => forgeSword();
    }

    const upgradeButton = document.querySelector('[onclick="upgradeSword()"]');
    if (upgradeButton) {
        upgradeButton.onclick = () => upgradeSword();
    }

    const autoForgeButton = document.querySelector('[onclick="toggleAutoForge()"]');
    if (autoForgeButton) {
        autoForgeButton.onclick = () => toggleAutoForge();
    }
}

// Initialization
export function initializeGameInterface() {
    initializeGame();
}

function initializeGame() {
    try {
        const saveExists = localStorage.getItem('swordForgeSave');
        loadGame();
        
        // If no save existed, this is a new game
        if (!saveExists) {
            gameState.scrap = 50; // Give player starting scrap
            gameState.currentTier = 1;
            // Add test items to inventory
            addToInventory('Scale', 5, 'monsterParts');
            addToInventory('Claw', 3, 'monsterParts');
            addToInventory('Iron', 10, 'craftingMaterials');
            saveGame(); // Save initial state
        }
    } catch (e) {
        console.error("Failed to load save:", e);
        // If loading fails, treat as new game
        gameState.scrap = 50;
        gameState.currentTier = 1;
        saveGame();
    }
    
    spawnMonster();
    updateGameDisplay();
    updateInventoryDisplay(); // Initialize inventory display
    setupEventListeners(); // Make sure this is called
    showView('forge');
    
    setInterval(saveGame, 30000);
}

// And make sure this is at the end of your file
// Start Screen Functions
function showGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'flex';
    document.querySelector('.container').style.display = 'grid';
}

function setupStartScreen() {
    console.log('Setting up start screen...');
    
    // Hide game interface initially
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    
    // New Game Button
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            console.log('New game button clicked');
            localStorage.removeItem('swordForgeSave');
            initializeGame();
            showGame();
        });
    } else {
        console.error('New game button not found!');
    }

    // Load Game Button
    const loadGameBtn = document.getElementById('load-game-btn');
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
            console.log('Load game button clicked');
            initializeGame();
            showGame();
        });
    } else {
        console.error('Load game button not found!');
    }

    // Import Save Button
    const importSaveBtn = document.getElementById('import-save-btn');
    if (importSaveBtn) {
        importSaveBtn.addEventListener('click', () => {
            console.log('Import save button clicked');
            const saveCode = document.getElementById('save-code-input').value;
            if (saveCode) {
                try {
                    localStorage.setItem('swordForgeSave', saveCode);
                    initializeGame();
                    showGame();
                } catch (error) {
                    console.error('Import failed:', error);
                    alert('Invalid save code!');
                }
            }
        });
    } else {
        console.error('Import save button not found!');
    }

    // Export Save Button
    const exportSaveBtn = document.getElementById('export-save-btn');
    if (exportSaveBtn) {
        exportSaveBtn.addEventListener('click', () => {
            console.log('Export save button clicked');
            saveGame();
            const saveCode = localStorage.getItem('swordForgeSave');
            document.getElementById('save-code-input').value = saveCode;
            alert('Save code copied to input box!');
        });
    } else {
        console.error('Export save button not found!');
    }
}
    console.log('Setting up start screen...');
    
    // Hide game interface initially
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            console.log('New game button clicked');
            localStorage.removeItem('swordForgeSave');
            initializeGame();
            showGame();
        });
    } else {
        console.error('New game button not found!');
    }
    document.getElementById('new-game-btn').addEventListener('click', () => {
        localStorage.removeItem('swordForgeSave');
        initializeGame();
        showGame();
    });

    document.getElementById('load-game-btn').addEventListener('click', () => {
        initializeGame();
        showGame();
    });

    document.getElementById('import-save-btn').addEventListener('click', () => {
        const saveCode = document.getElementById('save-code-input').value;
        if (saveCode) {
            try {
                localStorage.setItem('swordForgeSave', saveCode);
                initializeGame();
                showGame();
            } catch (error) {
                alert('Invalid save code!');
            }
        }
    });

    document.getElementById('export-save-btn').addEventListener('click', () => {
        saveGame();
        const saveCode = localStorage.getItem('swordForgeSave');
        document.getElementById('save-code-input').value = saveCode;
        alert('Save code copied to input box!');
    });

// Initialize the game interface and make it globally accessible
window.initializeGameInterface = function() {
    console.log('Initializing game interface...');
    try {
        setupStartScreen();
        loadGameData();
        setupEventListeners();
        console.log('Game interface initialized successfully');
    } catch (error) {
        console.error('Error initializing game interface:', error);
        alert('Failed to initialize game!');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initializeGameInterface();
    loadGameData();
    setupEventListeners();
});