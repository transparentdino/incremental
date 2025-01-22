Sword Forge - Incremental Game Design
Core Loop

Auto-attack monsters to generate scrap
Spend scrap on sword upgrades
Kill stronger monsters for better rewards
Unlock new areas through boss progression

Basic Mechanics
Auto-Combat System

Basic DPS (Damage Per Second) against monsters
Monsters have HP and drop scrap when defeated
Higher level monsters drop more scrap
Elemental weaknesses multiply damage (e.g. 2x damage)

Sword Components

Hilt

Contains 1-3 gem slots
Each slot multiplies total DPS
Better hilts unlock more slots
Upgrade cost scales with power


Gems

Slot into hilts for multipliers
Examples:

Red Gem: x1.5 damage
Blue Gem: x2 damage to ice-weak enemies
Green Gem: x1.25 scrap gain
Yellow Gem: x1.75 boss damage
Purple Gem: x1.4 all damage




Blade

Base damage dealer
Adds elemental effects
Upgradeable with scrap
Different elements for different zones



Progression Systems
Resource Generation

Scrap per second from kills
Automatic collection
Upgrade multipliers
Offline progress

Area Advancement

Each area has stronger monsters
Boss requires specific DPS threshold
New areas unlock new resources
Better scrap/second ratios

Upgrades

Sword base damage
Scrap gain multipliers
Auto-collection speed
Inventory space
Gem drop rates

Features to Add
Automation Elements

Auto gem equipping
Auto sword upgrading
Resource collectors
Progress bars

Prestige System Ideas

Reset for permanent multipliers
Keep some upgrades on reset
Multiple prestige layers
Different resources per layer

Numbers/Scaling

Use scientific notation for large numbers
Exponential cost scaling
Multiplier stacking
Achievement bonuses

Quality of Life

Save system
Export/Import saves
Statistics tracking
Achievement system
Upgrade buy max/buy 10/buy 100

Visual Elements

Simple monster sprites
Progress bars
Number animations
Basic particle effects
Minimal UI with important stats

# Sword Forge - Gem System Design

## Gem Base Types

### Ruby (Fire Affinity)
- Base Effect: Fire Damage
- Possible Modifiers:
  - "Scorching": Damage increases with consecutive hits (5-15% per stack)
  - "Volcanic": Chance to cause explosion on kill (10-25% chance)
  - "Phoenix": Damage multiplier that resets on area change (2-5% per kill)
  - "Infernal": Creates burning zones that increase DPS (25-75% more damage)

### Sapphire (Ice Affinity)
- Base Effect: Ice Damage
- Possible Modifiers:
  - "Freezing": Slows enemy spawn rate but increases drops (15-40%)
  - "Glacial": Chance to instantly kill low HP enemies (triggers below 5-15% HP)
  - "Arctic": Each frozen enemy increases damage to others (3-8% per frozen)
  - "Frost Chain": Frozen enemies spread effect to others (1-3 spreads)

### Emerald (Nature Affinity)
- Base Effect: Nature Damage
- Possible Modifiers:
  - "Growing": Damage increases while in same area (1-3% per minute)
  - "Spore": Defeated enemies spawn temporary clones that fight for you (5-15% chance)
  - "Overgrowth": Multiple hits stack additional scrap chance (2-7% per stack)
  - "Verdant": Creates resource-generating zones (1-4 resources/second)

### Topaz (Lightning Affinity)
- Base Effect: Lightning Damage
- Possible Modifiers:
  - "Static": Chance to instantly kill and chain to others (5-15% chance)
  - "Storm": Random lightning strikes hit enemies (1-4 strikes/second)
  - "Overcharge": Critical hits temporarily boost all damage (10-30% for 5s)
  - "Conductor": Each enemy hit increases chain chance (2-8% per hit)

### Amethyst (Void Affinity)
- Base Effect: Void Damage
- Possible Modifiers:
  - "Vacuum": Pulls in resources from further away (25-75% larger range)
  - "Void Rift": Chance to duplicate resources on collection (5-15% chance)
  - "Nullifier": Reduce enemy defensive abilities (10-30% reduction)
  - "Dark Matter": Creates slow damage zones that generate resources (1-3/second)

### Diamond (Pure Affinity)
- Base Effect: Pure Damage
- Possible Modifiers:
  - "Perfect": Chance for double damage (10-25% chance)
  - "Pristine": Higher quality resource drops (15-40% better)
  - "Flawless": Streak of kills increases all effects (5-15% per 10 kills)
  - "Brilliance": Increases effectiveness of other gems (5-20% boost)

## Gem Rarity System
- Common: 1 modifier
- Uncommon: 1 modifier + 1 substat
- Rare: 2 modifiers
- Epic: 2 modifiers + 1 substat
- Legendary: 3 modifiers
- Mythic: 3 modifiers + 1 substat

## Substat Pool
- Resource Gain: 5-25%
- Kill Speed: 10-30%
- Boss Damage: 15-45%
- Critical Chance: 5-15%
- Area Clear Speed: 10-30%
- Offline Progress: 10-40%

## Special Combinations
When multiple gems are slotted together:

### Dual Affinities
- Fire + Ice: "Steam Power" (Increased offline progress)
- Lightning + Nature: "Storm Growth" (Resources grow over time)
- Void + Pure: "Perfect Chaos" (Random powerful effects)
- Fire + Lightning: "Thunder Strike" (Chain explosions)
- Ice + Void: "Absolute Zero" (Mass freeze chance)
- Nature + Pure: "Perfect Growth" (Compound resource gains)

### Triple Affinities
- Fire + Ice + Lightning: "Elemental Mastery"
- Nature + Void + Pure: "Force of Nature"
- Lightning + Void + Fire: "Chaos Storm"
- Ice + Nature + Pure: "Eternal Growth"

## Gem Acquisition
- Monster drops (based on area)
- Boss guaranteed drops
- Fusion system
- Upgrade system
- Trading system (future feature)

## Gem Enhancement
- Can use scrap to level up gems
- Each level increases modifier effectiveness
- Maximum level based on rarity
- Fusion can combine same-type gems
- Chance for better modifiers on fusion

## Strategic Elements
- Gem synergies affect optimal builds
- Different combinations for farming vs boss fights
- Special combinations for specific areas
- Trade-offs between immediate power and scaling effects
