import { brawlers, worlds, lossTips, RARITY_COLORS } from './data.js';
import { generateQuestions, validateQuestionDifficulty } from './questions.js';
import * as arena from './arena.js';
import * as ui from './ui.js';

let selectedBrawlerIndex = 0;
let selectedWorldIndex = 0;
let currentLevelIndex = 0;
let playerHp, playerMaxHp;
let enemyHp, enemyMaxHp;
let battleInProgress = false;
let arenaInitialized = false;
let activePowerUp = null;
let isPausedForReload = false;
let totalDamageDealt = 0;

let playerAmmo = 6;
let maxAmmo = 6;
let reloadQuestions = [];
let reloadQuestionIdx = 0;
let reloadCorrect = 0;

const MAX_AMMO = 6;

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
  if (brawlers[i].rarity === 'אפי' || brawlers[i].rarity === 'מיתי' || brawlers[i].rarity === 'אגדה') {
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
  isPausedForReload = false;
  playerAmmo = MAX_AMMO;
  maxAmmo = MAX_AMMO;
  reloadQuestions = [];
  reloadQuestionIdx = 0;
  reloadCorrect = 0;

  if (!arenaInitialized) {
    ui.closeAllPanels();
    arena.initArena(document.getElementById('game-canvas-container'));
    arena.setArenaCallbacks({
      onPlayerShoot: () => {},
      onEnemyHit: (dmg) => handlePlayerHitEnemy(dmg),
      onPlayerHit: (dmg) => handleEnemyHitPlayer(dmg),
      onAmmoEmpty: () => startReload()
    });
    arenaInitialized = true;
  } else {
    arena.setArenaCallbacks({
      onPlayerShoot: () => {},
      onEnemyHit: (dmg) => handlePlayerHitEnemy(dmg),
      onPlayerHit: (dmg) => handleEnemyHitPlayer(dmg),
      onAmmoEmpty: () => startReload()
    });
  }

  arena.setReloading(false);
  arena.setPlayerAmmo(MAX_AMMO);
  arena.setMaxAmmo(MAX_AMMO);
  arena.stopEnemyAI();

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
  activePowerUp = null;
  arena.removePowerUpMesh();

  ui.showScreen('game-screen');
  ui.updateHUD(currentLevelIndex);
  ui.updatePowerUp(null);
  ui.hideReloadOverlay();
  ui.updateAmmoBar(playerAmmo, maxAmmo);

  arena.positionCharacters(
    { color: brawler.color, headColor: '#FBBF24' },
    { color: level.enemy.color, headColor: '#DC2626' }
  );
  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);

  arena.startEnemyAI();
}

function handlePlayerHitEnemy(dmg) {
  if (!battleInProgress || isPausedForReload) return;
  enemyHp -= dmg;
  totalDamageDealt += dmg;
  arena.damageFlash('enemy');
  arena.shakeCamera(0.02, 100);
  ui.updateHealthBars(playerHp, playerMaxHp, Math.max(0, enemyHp), enemyMaxHp,
    brawlers[selectedBrawlerIndex].name, worlds[selectedWorldIndex].levels[currentLevelIndex].enemy.name);

  if (enemyHp <= 0) {
    battleInProgress = false;
    arena.stopEnemyAI();
    setTimeout(() => winLevel(), 300);
  }
}

function handleEnemyHitPlayer(dmg) {
  if (!battleInProgress || isPausedForReload) return;
  playerHp -= dmg;
  arena.damageFlash('player');
  arena.shakeCamera(0.04, 150);
  ui.updateHealthBars(Math.max(0, playerHp), playerMaxHp, enemyHp, enemyMaxHp,
    brawlers[selectedBrawlerIndex].name, worlds[selectedWorldIndex].levels[currentLevelIndex].enemy.name);

  // Check if player has shield power-up
  if (activePowerUp === 'shield') {
    ui.showPowerUpActivated('shield');
    activePowerUp = null;
    ui.updatePowerUp(null);
    arena.removePowerUpMesh();
    playerHp = Math.min(playerHp + dmg, playerMaxHp);
    ui.showEffect('🛡️ מגן!', '#60A5FA');
    ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp,
      brawlers[selectedBrawlerIndex].name, worlds[selectedWorldIndex].levels[currentLevelIndex].enemy.name);
    return;
  }

  if (playerHp <= 0) {
    battleInProgress = false;
    arena.stopEnemyAI();
    setTimeout(() => loseLevel(), 300);
  }
}

function startReload() {
  if (isPausedForReload || !battleInProgress) return;
  isPausedForReload = true;
  arena.stopEnemyAI();
  arena.setReloading(true);

  const worldIdx = selectedWorldIndex;
  reloadQuestions = [];
  reloadQuestionIdx = 0;
  reloadCorrect = 0;

  const levels = worlds[worldIdx].levels;
  if (!levels || levels.length === 0) {
    finishReload();
    return;
  }

  for (let d = 1; d <= 4; d++) {
    const found = generateQuestions(worldIdx, Math.min(d - 1, 2), 10);
    const filtered = found.filter(q => q._score >= d && q._score <= d + 1);
    const chosen = filtered.length > 0 ? filtered[0] : found[0];
    if (chosen) reloadQuestions.push(chosen);
    else {
      const fallback = generateQuestions(worldIdx, 0, 1);
      if (fallback[0]) reloadQuestions.push(fallback[0]);
    }
  }

  ui.showReloadOverlay(reloadQuestions, onReloadAnswer);
}

function onReloadAnswer(isCorrect) {
  if (isCorrect) reloadCorrect++;
  reloadQuestionIdx++;

  if (reloadQuestionIdx >= reloadQuestions.length) {
    finishReload();
    return;
  }
  ui.updateReloadProgress(reloadQuestionIdx + 1, reloadQuestions.length);
  ui.showReloadCurrentQuestion(reloadQuestions[reloadQuestionIdx]);
}

function finishReload() {
  const refill = Math.max(1, Math.floor((reloadCorrect / reloadQuestions.length) * maxAmmo));
  playerAmmo = Math.min(maxAmmo, playerAmmo + refill);
  ui.hideReloadOverlay();
  arena.setPlayerAmmo(playerAmmo);
  arena.setReloading(false);
  isPausedForReload = false;
  ui.updateAmmoBar(playerAmmo, maxAmmo);
  if (playerAmmo > 0) {
    arena.startEnemyAI();
  } else {
    ui.showNotification('❌ לא הצלחת לטעון!');
    battleInProgress = false;
    setTimeout(() => loseLevel(), 500);
  }
}

function winLevel() {
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];
  const data = ui.getSaveData();
  const brawler = brawlers[selectedBrawlerIndex];
  arena.removePowerUpMesh();

  const brawlerLevel = (data.brawlerData[brawler.id] && data.brawlerData[brawler.id].level) || 1;
  const trophies = 15 + (currentLevelIndex * 8) + brawlerLevel * 2;

  if (!data.brawlerData[brawler.id]) data.brawlerData[brawler.id] = { trophies: 0, xp: 0, level: 1 };
  data.brawlerData[brawler.id].trophies += trophies;
  data.totalTrophies += trophies;

  const xpGain = 25 + (currentLevelIndex * 10);
  data.brawlerData[brawler.id].xp += xpGain;
  data.xp += xpGain;

  const xpNeeded = brawlerLevel * 80;
  if (data.brawlerData[brawler.id].xp >= xpNeeded) {
    data.brawlerData[brawler.id].xp -= xpNeeded;
    data.brawlerData[brawler.id].level++;
    ui.showNotification('⬆️ ' + brawler.name + ' עלה רמה! רמה ' + data.brawlerData[brawler.id].level);
  }

  const playerXpNeeded = data.level * 100;
  if (data.xp >= playerXpNeeded) {
    data.xp -= playerXpNeeded;
    data.level++;
    ui.showNotification('🎉 עלית רמה! רמה ' + data.level);
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
  const trophies = Math.max(3, Math.floor(enemyHp < 0 ? 5 : 3));
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
        if (b.rarity === 'אפי' || b.rarity === 'מיתי' || b.rarity === 'אגדה') {
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
  battleInProgress = false;
  isPausedForReload = false;
  activePowerUp = null;
  arena.stopEnemyAI();
  arena.setReloading(false);
  arena.removePowerUpMesh();
  ui.hideReloadOverlay();
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

export function retryLevel() { loadLevel(); }

export function goBack() {
  if (battleInProgress && !confirm('להפסיק את הקרב ולחזור לתפריט?')) return;
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
