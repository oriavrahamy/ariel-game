import { brawlers, worlds, lossTips } from './data.js';
import { generateQuestions } from './questions.js';
import * as arena from './arena.js';
import * as ui from './ui.js';

let selectedBrawlerIndex = 0;
let selectedWorldIndex = 0;
let currentLevelIndex = 0;
let playerHp, playerMaxHp, enemyHp, enemyMaxHp;
let battleInProgress = false;
let arenaInitialized = false;
let totalDamageDealt = 0;

let activePowerUp = null;
let lastHitTime = 0;
let powerUpQuestion = null;
let isQuestionActive = false;

const MAX_AMMO = 3;
const SUPER_PER_HIT = 25;
const REGEN_DELAY = 3000;
const REGEN_RATE = 0.05;

export function getSelectedBrawler() { return selectedBrawlerIndex; }
export function getSelectedWorld() { return selectedWorldIndex; }

export function setSelectedBrawler(i) {
  const data = ui.getSaveData();
  if (!data.unlockedBrawlers.includes(brawlers[i].id)) {
    ui.showNotification('🔒 צריך ' + brawlers[i].unlockTrophies + ' 🏆 כדי לפתוח!');
    return;
  }
  selectedBrawlerIndex = i;
  data.selectedBrawler = i;
  ui.saveGameData(data);
  const bd = data.brawlerData[brawlers[i].id] || { trophies: 0, xp: 0, level: 1 };
  ui.updateLobbyBrawler(brawlers[i], bd.trophies);
  ui.updateBrawlersPanel(i, data.brawlerData, data.unlockedBrawlers);
  ui.enableBattle(true);
  ui.spinBrawlerHero();
  if (brawlers[i].rarity === 'אפי' || brawlers[i].rarity === 'מיתי' || brawlers[i].rarity === 'אולטרה אגדי') {
    ui.rainbowBrawlerCard(brawlers[i].id);
  }
}

export function setSelectedWorld(i) {
  selectedWorldIndex = i;
  const data = ui.getSaveData();
  data.selectedWorld = i;
  ui.saveGameData(data);
  ui.updateWorldSelection(i);
  ui.updateWorldProgress(i, (data.worldProgress[i] || 0));
}

export function startGame() {
  const data = ui.getSaveData();
  if (!data.unlockedBrawlers.includes(brawlers[selectedBrawlerIndex].id)) {
    if (data.unlockedBrawlers.length > 0) {
      const firstUnlocked = brawlers.findIndex(b => data.unlockedBrawlers.includes(b.id));
      if (firstUnlocked >= 0) setSelectedBrawler(firstUnlocked);
    }
    return;
  }

  const world = worlds[selectedWorldIndex];
  currentLevelIndex = Math.min(data.worldProgress[selectedWorldIndex] || 0, world.levels.length - 1);
  battleInProgress = false;
  activePowerUp = null;
  lastHitTime = 0;
  totalDamageDealt = 0;
  powerUpQuestion = null;
  isQuestionActive = false;

  const initArenaNow = !arenaInitialized;
  if (initArenaNow) {
    ui.closeAllPanels();
  }

  arena.setArenaCallbacks({
    onPlayerShoot: () => {},
    onEnemyHit: (dmg) => handlePlayerHit(dmg),
    onPlayerHit: (dmg) => handleEnemyHit(dmg),
    onSuperReady: () => {}
  });

  arena.setReloading(false);
  arena.setAmmo(MAX_AMMO);
  arena.setSuperCharge(0);
  arena.stopEnemyAI();
  arena.stopPowerUpSpawning();
  arena.stopAmmoRegen();
  arena.removePowerUpMesh();

  ui.showScreen('game-screen');

  if (initArenaNow) {
    arena.initArena(document.getElementById('game-canvas-container'));
    arenaInitialized = true;
  }

  loadLevel();
}

function loadLevel() {
  const brawler = brawlers[selectedBrawlerIndex];
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];
  const data = ui.getSaveData();

  playerMaxHp = brawler.hp;
  if (data.ownedItems.includes('hp-up')) playerMaxHp = Math.floor(playerMaxHp * 1.2);
  playerHp = playerMaxHp;
  enemyMaxHp = level.enemy.hp;
  enemyHp = enemyMaxHp;
  battleInProgress = true;
  lastHitTime = performance.now();

  ui.showScreen('game-screen');
  ui.updateHUD(currentLevelIndex);
  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
  ui.updateAmmoBar(arena.getAmmo(), MAX_AMMO);
  ui.hidePowerUpPrompt();

  arena.positionCharacters(
    { color: brawler.color, headColor: '#FBBF24' },
    { color: level.enemy.color, headColor: '#DC2626' }
  );

  const reloadMs = (brawler.reload || 1.2) * 1000;
  arena.startAmmoRegen();
  arena.startEnemyAI();
  arena.startPowerUpSpawning((type) => handlePowerUpCollect(type));
  startRegenCheck();
}

function handlePlayerHit(dmg) {
  if (!battleInProgress) return;
  enemyHp -= dmg;
  totalDamageDealt += dmg;
  arena.damageFlash('enemy');
  arena.shakeCamera(0.02, 100);

  arena.addSuperCharge(SUPER_PER_HIT);

  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];
  ui.updateHealthBars(playerHp, playerMaxHp, Math.max(0, enemyHp), enemyMaxHp, brawler.name, level.enemy.name);

  if (enemyHp <= 0) {
    battleInProgress = false;
    arena.stopEnemyAI();
    arena.stopPowerUpSpawning();
    setTimeout(() => winLevel(), 300);
  }
}

function handleEnemyHit(dmg) {
  if (!battleInProgress) return;
  lastHitTime = performance.now();

  if (activePowerUp === 'shield') {
    activePowerUp = null;
    arena.removePowerUpMesh();
    ui.updatePowerUp(null);
    ui.showEffect('🛡️ מגן!', '#60A5FA');
    return;
  }

  playerHp -= dmg;
  arena.damageFlash('player');
  arena.shakeCamera(0.04, 150);

  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];
  ui.updateHealthBars(Math.max(0, playerHp), playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);

  if (playerHp <= 0) {
    battleInProgress = false;
    arena.stopEnemyAI();
    arena.stopPowerUpSpawning();
    setTimeout(() => loseLevel(), 300);
  }
}

// ===== HEALTH REGEN =====
let regenInterval = null;

function startRegenCheck() {
  stopRegenCheck();
  regenInterval = setInterval(() => {
    if (!battleInProgress || isQuestionActive) return;
    const now = performance.now();
    if (now - lastHitTime > REGEN_DELAY && playerHp < playerMaxHp) {
      playerHp = Math.min(playerMaxHp, playerHp + playerMaxHp * REGEN_RATE * 0.1);
      const brawler = brawlers[selectedBrawlerIndex];
      const level = worlds[selectedWorldIndex].levels[currentLevelIndex];
      ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
      ui.showHealthRegen(true);
    }
    if (now - lastHitTime < REGEN_DELAY) {
      ui.showHealthRegen(false);
    }
  }, 100);
}

function stopRegenCheck() {
  if (regenInterval) { clearInterval(regenInterval); regenInterval = null; }
}

// ===== POWER-UP QUESTIONS =====
function handlePowerUpCollect(type) {
  if (!battleInProgress || isQuestionActive) return;
  isQuestionActive = true;
  arena.setReloading(true);

  const worldIdx = selectedWorldIndex;
  const questions = generateQuestions(worldIdx, currentLevelIndex, 10);
  const q = questions.length > 0 ? questions[Math.floor(Math.random() * questions.length)] : null;
  if (!q) { isQuestionActive = false; arena.setReloading(false); return; }

  powerUpQuestion = { q, type };
  arena.stopEnemyAI();
  ui.showPowerUpPrompt(type, q, (correct) => {
    isQuestionActive = false;
    arena.setReloading(false);
    ui.hidePowerUpPrompt();

    if (correct) {
      applyPowerUpReward(type);
      ui.showNotification('✅ ' + powerUpNames(type) + '!');
    } else {
      ui.showNotification('❌ תשובה שגויה, אין בונוס');
    }
    powerUpQuestion = null;
    if (battleInProgress) arena.startEnemyAI();
  });
}

function powerUpNames(type) {
  const names = { ammo: '🔫 תחמושת מלאה', super: '💥 אולטי +50%', heal: '❤️ ריפוי +30%', damage: '⚔️ נזק כפול 5 שניות' };
  return names[type] || '🎁 בונוס';
}

function applyPowerUpReward(type) {
  switch (type) {
    case 'ammo':
      arena.setAmmo(MAX_AMMO);
      break;
    case 'super':
      arena.addSuperCharge(50);
      break;
    case 'heal':
      playerHp = Math.min(playerMaxHp, playerHp + Math.floor(playerMaxHp * 0.3));
      const b = brawlers[selectedBrawlerIndex];
      const l = worlds[selectedWorldIndex].levels[currentLevelIndex];
      ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, b.name, l.enemy.name);
      break;
    case 'damage':
      activePowerUp = 'double_damage';
      arena.spawnPowerUpMesh('double_damage');
      ui.updatePowerUp('double_damage');
      setTimeout(() => {
        if (activePowerUp === 'double_damage') {
          activePowerUp = null;
          arena.removePowerUpMesh();
          ui.updatePowerUp(null);
        }
      }, 5000);
      break;
  }
}

// ===== SUPER =====
export function activateSuper() {
  if (!battleInProgress || !arena.getIsSuperReady()) return;
  if (isQuestionActive) return;

  arena.useSuper();
  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];

  if (brawler.superDamage < 0) {
    playerHp = Math.min(playerMaxHp, playerHp + Math.floor(playerMaxHp * Math.abs(brawler.superDamage)));
    ui.showEffect('💚 ' + brawler.superName + '!', '#10B981');
  } else {
    const bonusDmg = Math.floor(enemyMaxHp * brawler.superDamage);
    enemyHp -= bonusDmg;
    totalDamageDealt += bonusDmg;
    ui.showEffect('💥 ' + brawler.superName + '!', '#FFD600');
    arena.shakeCamera(0.08, 300);
    if (enemyHp <= 0) {
      battleInProgress = false;
      arena.stopEnemyAI();
      arena.stopPowerUpSpawning();
      setTimeout(() => winLevel(), 300);
      return;
    }
  }
  arena.damageFlash('enemy');
  ui.updateHealthBars(playerHp, playerMaxHp, Math.max(0, enemyHp), enemyMaxHp, brawler.name, level.enemy.name);
}

function winLevel() {
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];
  const data = ui.getSaveData();
  const brawler = brawlers[selectedBrawlerIndex];
  arena.removePowerUpMesh();

  const brawlerLevel = (data.brawlerData[brawler.id]?.level) || 1;
  const trophies = 15 + (currentLevelIndex * 8) + brawlerLevel * 2;

  if (!data.brawlerData[brawler.id]) data.brawlerData[brawler.id] = { trophies: 0, xp: 0, level: 1 };
  data.brawlerData[brawler.id].trophies += trophies;
  data.totalTrophies += trophies;

  const xpGain = 25 + (currentLevelIndex * 10);
  data.brawlerData[brawler.id].xp += xpGain;
  data.xp += xpGain;

  if (data.brawlerData[brawler.id].xp >= (brawlerLevel * 80)) {
    data.brawlerData[brawler.id].xp -= (brawlerLevel * 80);
    data.brawlerData[brawler.id].level++;
  }
  if (data.xp >= data.level * 100) {
    data.xp -= data.level * 100;
    data.level++;
  }

  const oldProgress = data.worldProgress[selectedWorldIndex] || 0;
  if (currentLevelIndex + 1 > oldProgress && currentLevelIndex + 1 < world.levels.length) {
    data.worldProgress[selectedWorldIndex] = currentLevelIndex + 1;
  }

  checkUnlocks(data);
  ui.saveGameData(data);
  refreshUI(data);
  ui.lightningFlash();

  const tip = '🎉 השלמת את "' + level.name + '"!';
  ui.showResults(true, trophies, 100, totalDamageDealt, tip);
}

function loseLevel() {
  arena.removePowerUpMesh();
  const data = ui.getSaveData();
  const brawler = brawlers[selectedBrawlerIndex];
  const trophies = Math.max(3, Math.floor(enemyHp <= 0 ? 5 : 3));
  if (!data.brawlerData[brawler.id]) data.brawlerData[brawler.id] = { trophies: 0, xp: 0, level: 1 };
  data.brawlerData[brawler.id].trophies += trophies;
  data.totalTrophies += trophies;
  data.xp += 10;
  checkUnlocks(data);
  ui.saveGameData(data);
  refreshUI(data);
  ui.showResults(false, trophies, 0, totalDamageDealt, lossTips[Math.floor(Math.random() * lossTips.length)]);
}

function checkUnlocks(data) {
  brawlers.forEach(b => {
    if (data.totalTrophies >= b.unlockTrophies && !data.unlockedBrawlers.includes(b.id)) {
      data.unlockedBrawlers.push(b.id);
      if (!data.brawlerData[b.id]) data.brawlerData[b.id] = { trophies: 0, xp: 0, level: 1 };
      ui.lightningFlash();
      setTimeout(() => {
        ui.showNotification('🎉 פתחת דמות חדשה: ' + b.name + '!');
        ui.spinBrawlerHero();
        if (b.rarity === 'אפי' || b.rarity === 'מיתי' || b.rarity === 'אולטרה אגדי') {
          ui.rainbowBrawlerCard(b.id);
        }
      }, 500);
    }
  });
}

function refreshUI(data) {
  const brawler = brawlers[selectedBrawlerIndex];
  const bd = data.brawlerData[brawler.id] || { trophies: 0, xp: 0, level: 1 };
  ui.updatePlayerInfo('שחקן ו\'', data.totalTrophies, data.level, data.xp, data.level * 100);
  ui.updateLobbyBrawler(brawler, bd.trophies);
  ui.updateBrawlersPanel(selectedBrawlerIndex, data.brawlerData, data.unlockedBrawlers);
  worlds.forEach((w, i) => ui.updateWorldProgress(i, data.worldProgress[i] || 0));
  ui.enableBattle(data.unlockedBrawlers.includes(brawler.id));
}

export function resetToLobby() {
  battleInProgress = false; isQuestionActive = false;
  arena.stopEnemyAI(); arena.stopPowerUpSpawning(); arena.stopAmmoRegen();
  stopRegenCheck();
  arena.setReloading(false); arena.removePowerUpMesh();
  ui.hidePowerUpPrompt();
  ui.showScreen('lobby-screen');
  loadSavedState();
}

export function nextLevel() {
  const world = worlds[selectedWorldIndex];
  if (currentLevelIndex + 1 < world.levels.length) {
    currentLevelIndex++;
    loadLevel();
  } else {
    ui.showNotification('🏆 השלמת את כל השלבים בעולם הזה!');
    resetToLobby();
  }
}

export function retryLevel() {
  arena.stopPowerUpSpawning(); arena.stopAmmoRegen(); stopRegenCheck();
  loadLevel();
}

export function goBack() {
  if (battleInProgress && !confirm('להפסיק את הקרב?')) return;
  resetToLobby();
}

export function initGame() {
  loadSavedState();
}

function loadSavedState() {
  const data = ui.getSaveData();
  selectedBrawlerIndex = data.selectedBrawler || 0;
  selectedWorldIndex = data.selectedWorld || 0;
  const brawler = brawlers[selectedBrawlerIndex] || brawlers[0];
  const bd = data.brawlerData[brawler.id] || { trophies: 0, xp: 0, level: 1 };
  ui.updatePlayerInfo('שחקן ו\'', data.totalTrophies, data.level, data.xp, data.level * 100);
  ui.updateLobbyBrawler(brawler, bd.trophies);
  ui.updateBrawlersPanel(selectedBrawlerIndex, data.brawlerData, data.unlockedBrawlers);
  ui.updateWorldSelection(selectedWorldIndex);
  worlds.forEach((w, i) => ui.updateWorldProgress(i, data.worldProgress[i] || 0));
  ui.enableBattle(data.unlockedBrawlers.includes(brawler.id));
}
