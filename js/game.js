import { brawlers, worlds, lossTips, RARITY_COLORS } from './data.js';
import { generateQuestions, validateQuestionDifficulty } from './questions.js';
import * as arena from './arena.js';
import * as ui from './ui.js';

let selectedBrawlerIndex = 0;
let selectedWorldIndex = 0;
let currentLevelIndex = 0;
let playerHp, playerMaxHp;
let enemyHp, enemyMaxHp;
let currentQuestions = [];
let questionIndex = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let totalDamageDealt = 0;
let superCharge = 0;
let isSuperReady = false;
let battleInProgress = false;
let arenaInitialized = false;
let correctStreak = 0;
let activePowerUp = null;

const POWERUP_TYPES = ['shield', 'crystal', 'double_damage'];

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
  correctAnswers = 0; totalQuestions = 0;
  totalDamageDealt = 0; superCharge = 0;
  isSuperReady = false; battleInProgress = false;
  correctStreak = 0; activePowerUp = null;

  if (!arenaInitialized) {
    ui.closeAllPanels();
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
  questionIndex = 0;
  battleInProgress = true;
  correctStreak = 0;
  activePowerUp = null;
  arena.removePowerUpMesh();

  currentQuestions = shuffleArray(generateQuestions(selectedWorldIndex, currentLevelIndex, 8));
  const validCount = currentQuestions.filter(q => validateQuestionDifficulty(q, currentLevelIndex)).length;
  if (validCount < currentQuestions.length * 0.5) {
    currentQuestions = shuffleArray(generateQuestions(selectedWorldIndex, Math.min(currentLevelIndex + 1, 2), 8));
  }

  ui.showScreen('game-screen');
  ui.updateHUD(currentLevelIndex);
  ui.updateSuperBar(0);
  ui.updatePowerUp(null);

  arena.positionCharacters(
    { color: brawler.color, headColor: '#FBBF24' },
    { color: level.enemy.color, headColor: '#DC2626' }
  );
  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
  setTimeout(() => nextQuestion(), 500);
}

function nextQuestion() {
  if (!battleInProgress) return;
  const q = currentQuestions[questionIndex % currentQuestions.length];
  ui.showQuestion(q, (isCorrect) => {
    totalQuestions++;
    if (isCorrect) { correctAnswers++; correctStreak++; handleCorrectAnswer(); }
    else { correctStreak = 0; handleWrongAnswer(); }
  });
}

function trySpawnPowerUp() {
  if (activePowerUp || !battleInProgress) return;
  if (correctStreak > 0 && correctStreak % 2 === 0) {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    activePowerUp = type;
    arena.spawnPowerUpMesh(type);
    ui.showPowerUpSpawned(type);
    setTimeout(() => {
      if (activePowerUp === type && battleInProgress) {
        if (type === 'crystal') {
          superCharge = Math.min(100, superCharge + 50);
          if (superCharge >= 100) { superCharge = 100; isSuperReady = true; }
          ui.updateSuperBar(superCharge);
          ui.showPowerUpActivated(type);
          activePowerUp = null; arena.removePowerUpMesh(); ui.updatePowerUp(null);
        } else {
          ui.updatePowerUp(type);
        }
      }
    }, 1500);
  }
}

function handleCorrectAnswer() {
  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];

  let pctDamage = 0.20;
  const dmgBonus = (brawler.damage - 200) / 2000;
  pctDamage += dmgBonus;
  let damage = Math.floor(enemyMaxHp * pctDamage);

  if (activePowerUp === 'double_damage') {
    damage *= 2;
    ui.showPowerUpActivated('double_damage');
    activePowerUp = null; ui.updatePowerUp(null); arena.removePowerUpMesh();
  }

  const data = ui.getSaveData();
  if (data.ownedItems.includes('dmg-up')) damage = Math.floor(damage * 1.15);

  if (isSuperReady) {
    ui.lightningFlash();
    const superDmg = Math.floor(enemyMaxHp * brawler.superDamage);
    if (brawler.superDamage < 0) {
      playerHp = Math.min(playerMaxHp, playerHp + Math.floor(playerMaxHp * Math.abs(brawler.superDamage)));
      ui.showEffect('💚 +' + Math.abs(brawler.superDamage) * 100 + '% ריפוי!', '#10B981');
      ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
    } else {
      damage += superDmg;
      ui.showEffect('💥 ' + brawler.superName + '! +' + Math.round(superDmg), '#FFD600');
    }
    superCharge = 0; isSuperReady = false;
  } else {
    superCharge += 25;
    if (superCharge >= 100) { superCharge = 100; isSuperReady = true; ui.showNotification('💥 אולטי מוכן! תשובה נכונה תפעיל אותו!'); }
  }

  enemyHp -= damage;
  totalDamageDealt += damage;
  arena.attackAnimation('enemy', () => { arena.damageFlash('enemy'); arena.shakeCamera(0.03, 150); });
  ui.updateSuperBar(superCharge);
  ui.updateHealthBars(playerHp, playerMaxHp, Math.max(0, enemyHp), enemyMaxHp, brawler.name, level.enemy.name);
  ui.showEffect('🔥 -' + damage, '#FF1744');
  questionIndex++;

  if (enemyHp <= 0) setTimeout(() => winLevel(), 600);
  else { trySpawnPowerUp(); setTimeout(() => nextQuestion(), 800); }
}

function handleWrongAnswer() {
  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];

  if (activePowerUp === 'shield') {
    ui.showPowerUpActivated('shield');
    activePowerUp = null; ui.updatePowerUp(null); arena.removePowerUpMesh();
    ui.showEffect('🛡️ מגן! התקפה נבלמה!', '#60A5FA');
    arena.shakeCamera(0.02, 100);
    questionIndex++;
    setTimeout(() => nextQuestion(), 1000);
    return;
  }

  const enemyAttack = Math.floor(playerMaxHp * 0.12) + 50;
  playerHp -= enemyAttack;
  arena.attackAnimation('player', () => { arena.damageFlash('player'); arena.shakeCamera(0.06, 250); });
  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
  ui.showEffect('💢 -' + enemyAttack, '#FF1744');
  questionIndex++;
  if (playerHp <= 0) setTimeout(() => loseLevel(), 600);
  else setTimeout(() => nextQuestion(), 1000);
}

function winLevel() {
  battleInProgress = false;
  arena.removePowerUpMesh();
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];
  const data = ui.getSaveData();
  const brawler = brawlers[selectedBrawlerIndex];

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const brawlerLevel = (data.brawlerData[brawler.id] && data.brawlerData[brawler.id].level) || 1;
  const brawlerLevelBonus = brawlerLevel * 2;
  const baseTrophies = 15 + (currentLevelIndex * 8) + brawlerLevelBonus;
  const accuracyBonus = Math.floor((correctAnswers / totalQuestions) * 15);
  const trophies = baseTrophies + accuracyBonus;

  if (!data.brawlerData[brawler.id]) data.brawlerData[brawler.id] = { trophies: 0, xp: 0, level: 1 };
  data.brawlerData[brawler.id].trophies += trophies;
  data.totalTrophies += trophies;

  const xpGain = 25 + (currentLevelIndex * 10) + (brawlerLevel * 3);
  let xpBoost = data.ownedItems.includes('xp-boost') ? 2 : 1;
  data.brawlerData[brawler.id].xp += xpGain * xpBoost;
  data.xp += xpGain * xpBoost;

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
    if (data.ownedItems.includes('xp-boost')) {
      const idx = data.ownedItems.indexOf('xp-boost');
      if (idx > -1) data.ownedItems.splice(idx, 1);
    }
  }

  const oldProgress = data.worldProgress[selectedWorldIndex] || 0;
  if (currentLevelIndex + 1 > oldProgress && currentLevelIndex + 1 < world.levels.length) {
    data.worldProgress[selectedWorldIndex] = currentLevelIndex + 1;
  }

  checkUnlocks(data);
  ui.saveGameData(data);
  refreshUI(data);
  ui.lightningFlash();

  const tip = '🎉 השלמת את "' + level.name + '"! ' + (accuracy >= 80 ? 'תוצאה מצוינת!' : 'המשך להתאמן!');
  ui.showResults(true, trophies, accuracy, totalDamageDealt, tip);
}

function loseLevel() {
  battleInProgress = false;
  arena.removePowerUpMesh();
  const data = ui.getSaveData();
  const brawler = brawlers[selectedBrawlerIndex];

  const trophies = Math.max(3, Math.floor(correctAnswers * 2));
  if (!data.brawlerData[brawler.id]) data.brawlerData[brawler.id] = { trophies: 0, xp: 0, level: 1 };
  data.brawlerData[brawler.id].trophies += trophies;
  data.totalTrophies += trophies;
  data.xp += 10;

  checkUnlocks(data);
  ui.saveGameData(data);
  refreshUI(data);

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  ui.showResults(false, trophies, accuracy, totalDamageDealt, lossTips[Math.floor(Math.random() * lossTips.length)]);
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
  battleInProgress = false; activePowerUp = null;
  arena.removePowerUpMesh();
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

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
