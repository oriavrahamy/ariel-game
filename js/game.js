import { brawlers, worlds, lossTips } from './data.js';
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
const POWERUP_NAMES = {
  shield: '🛡️ מגן',
  crystal: '💎 קריסטל',
  double_damage: '💪 נזק כפול'
};
const POWERUP_COLORS = {
  shield: '#60A5FA',
  crystal: '#FBBF24',
  double_damage: '#EF4444'
};

export function getSelectedBrawler() { return selectedBrawlerIndex; }
export function setSelectedBrawler(i) { selectedBrawlerIndex = i; }
export function getSelectedWorld() { return selectedWorldIndex; }
export function setSelectedWorld(i) { selectedWorldIndex = i; }

export function startGame() {
  const world = worlds[selectedWorldIndex];
  currentLevelIndex = 0;
  correctAnswers = 0;
  totalQuestions = 0;
  totalDamageDealt = 0;
  superCharge = 0;
  isSuperReady = false;
  battleInProgress = false;
  correctStreak = 0;
  activePowerUp = null;

  const data = ui.getSaveData();
  const savedProgress = data.worldProgress[selectedWorldIndex] || 0;
  currentLevelIndex = Math.min(savedProgress, world.levels.length - 1);

  if (!arenaInitialized) {
    const container = document.getElementById('game-canvas-container');
    arena.initArena(container);
    arenaInitialized = true;
  }

  loadLevel();
}

function loadLevel() {
  const brawler = brawlers[selectedBrawlerIndex];
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];

  playerMaxHp = brawler.hp;
  const data = ui.getSaveData();
  if (data.ownedItems.includes('hp-up')) {
    playerMaxHp = Math.floor(playerMaxHp * 1.2);
  }
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
    const backup = generateQuestions(selectedWorldIndex, Math.min(currentLevelIndex + 1, 2), 8);
    currentQuestions = shuffleArray(backup);
  }

  ui.showScreen('game-screen');
  ui.updateHUD(currentLevelIndex);
  ui.updateSuperBar(0);
  ui.updatePowerUp(null);

  const playerChar = { color: brawler.color, headColor: '#FBBF24' };
  const enemyChar = { color: level.enemy.color, headColor: '#DC2626' };

  arena.positionCharacters(playerChar, enemyChar);
  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);

  setTimeout(() => nextQuestion(), 500);
}

function nextQuestion() {
  if (!battleInProgress) return;
  const q = currentQuestions[questionIndex % currentQuestions.length];
  ui.showQuestion(q, (isCorrect) => {
    totalQuestions++;
    if (isCorrect) {
      correctAnswers++;
      correctStreak++;
      handleCorrectAnswer();
    } else {
      correctStreak = 0;
      handleWrongAnswer();
    }
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
          if (superCharge >= 100) {
            superCharge = 100;
            isSuperReady = true;
          }
          ui.updateSuperBar(superCharge);
          ui.showPowerUpActivated(type);
          activePowerUp = null;
          arena.removePowerUpMesh();
          ui.updatePowerUp(null);
        } else {
          ui.updatePowerUp(type);
          ui.showPowerUpCollected(type);
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
    activePowerUp = null;
    ui.updatePowerUp(null);
    arena.removePowerUpMesh();
  }

  const data = ui.getSaveData();
  if (data.ownedItems.includes('dmg-up')) {
    damage = Math.floor(damage * 1.15);
  }

  if (isSuperReady) {
    const superDmg = Math.floor(enemyMaxHp * brawler.superDamage);
    if (brawler.superDamage < 0) {
      playerHp = Math.min(playerMaxHp, playerHp + Math.floor(playerMaxHp * Math.abs(brawler.superDamage)));
      ui.showEffect('\uD83D\uDC9A +' + Math.abs(brawler.superDamage) * 100 + '% \u05E8\u05D9\u05E4\u05D5\u05D9!', '#10B981');
      ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
    } else {
      damage += superDmg;
      ui.showEffect('\uD83D\uDCA5 ' + brawler.superName + '! +' + Math.round(superDmg), '#F59E0B');
    }
    superCharge = 0;
    isSuperReady = false;
  } else {
    superCharge += 25;
    if (superCharge >= 100) {
      superCharge = 100;
      isSuperReady = true;
      ui.showNotification('\uD83D\uDCA5 \u05D0\u05D5\u05DC\u05D8\u05D9 \u05DE\u05D5\u05DB\u05DF! \u05EA\u05E9\u05D5\u05D1\u05D4 \u05E0\u05DB\u05D5\u05E0\u05D4 \u05EA\u05E4\u05E2\u05D9\u05DC \u05D0\u05D5\u05EA\u05D5!');
    }
  }

  enemyHp -= damage;
  totalDamageDealt += damage;

  arena.attackAnimation('enemy', () => {
    arena.damageFlash('enemy');
    arena.shakeCamera(0.03, 150);
  });

  ui.updateSuperBar(superCharge);
  ui.updateHealthBars(playerHp, playerMaxHp, Math.max(0, enemyHp), enemyMaxHp, brawler.name, level.enemy.name);
  ui.showEffect('\uD83D\uDD25 -' + damage, '#EF4444');

  questionIndex++;

  if (enemyHp <= 0) {
    setTimeout(() => winLevel(), 600);
  } else {
    trySpawnPowerUp();
    setTimeout(() => nextQuestion(), 800);
  }
}

function handleWrongAnswer() {
  const brawler = brawlers[selectedBrawlerIndex];
  const level = worlds[selectedWorldIndex].levels[currentLevelIndex];

  if (activePowerUp === 'shield') {
    ui.showPowerUpActivated('shield');
    activePowerUp = null;
    ui.updatePowerUp(null);
    arena.removePowerUpMesh();
    ui.showEffect('\uD83D\uDEE1\uFE0F \u05DE\u05D2\u05DF! \u05D4\u05EA\u05E7\u05E4\u05D4 \u05E0\u05D1\u05DC\u05DE\u05D4!', '#60A5FA');
    arena.shakeCamera(0.02, 100);
    questionIndex++;
    setTimeout(() => nextQuestion(), 1000);
    return;
  }

  const enemyAttack = Math.floor(playerMaxHp * 0.12) + 50;
  playerHp -= enemyAttack;

  arena.attackAnimation('player', () => {
    arena.damageFlash('player');
    arena.shakeCamera(0.06, 250);
  });

  ui.updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, brawler.name, level.enemy.name);
  ui.showEffect('\uD83D\uDCA2 -' + enemyAttack, '#EF4444');

  questionIndex++;

  if (playerHp <= 0) {
    setTimeout(() => loseLevel(), 600);
  } else {
    setTimeout(() => nextQuestion(), 1000);
  }
}

function winLevel() {
  battleInProgress = false;
  arena.removePowerUpMesh();
  const world = worlds[selectedWorldIndex];
  const level = world.levels[currentLevelIndex];
  const data = ui.getSaveData();

  const baseTrophies = 20 + (currentLevelIndex * 10);
  const accuracyBonus = Math.floor((correctAnswers / totalQuestions) * 20);
  const trophies = baseTrophies + accuracyBonus;

  data.trophies += trophies;

  const oldProgress = data.worldProgress[selectedWorldIndex] || 0;
  if (currentLevelIndex + 1 > oldProgress && currentLevelIndex + 1 < world.levels.length) {
    data.worldProgress[selectedWorldIndex] = currentLevelIndex + 1;
  }

  const xpGain = 30 + (currentLevelIndex * 10);
  let xpBoost = 1;
  if (data.ownedItems.includes('xp-boost')) xpBoost = 2;
  data.xp += xpGain * xpBoost;

  const xpNeeded = data.level * 100;
  if (data.xp >= xpNeeded) {
    data.xp -= xpNeeded;
    data.level++;
    ui.showNotification('\uD83C\uDF89 \u05E2\u05DC\u05D9\u05EA \u05E8\u05DE\u05D4! \u05E8\u05DE\u05D4 ' + data.level);
    if (data.ownedItems.includes('xp-boost')) {
      const idx = data.ownedItems.indexOf('xp-boost');
      if (idx > -1) data.ownedItems.splice(idx, 1);
    }
  }

  ui.saveGameData(data);

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const tip = '\uD83C\uDF89 \u05D4\u05E9\u05DC\u05DE\u05EA \u05D0\u05EA "' + level.name + '"! ' + (accuracy >= 80 ? '\u05EA\u05D5\u05E6\u05D0\u05D4 \u05DE\u05E6\u05D5\u05D9\u05E0\u05EA!' : '\u05D4\u05DE\u05E9\u05DA \u05DC\u05D4\u05EA\u05D0\u05DE\u05DF!');

  ui.showResults(true, trophies, accuracy, totalDamageDealt, tip);
}

function loseLevel() {
  battleInProgress = false;
  arena.removePowerUpMesh();
  const data = ui.getSaveData();

  const trophies = Math.max(5, Math.floor(correctAnswers * 3));
  data.trophies += trophies;
  data.xp += 10;

  ui.saveGameData(data);

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const tip = lossTips[Math.floor(Math.random() * lossTips.length)];

  ui.showResults(false, trophies, accuracy, totalDamageDealt, tip);
}

export function resetToLobby() {
  battleInProgress = false;
  activePowerUp = null;
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
    ui.showNotification('\uD83C\uDFC6 \u05D4\u05E9\u05DC\u05DE\u05EA \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05DC\u05D1\u05D9\u05DD \u05D1\u05E2\u05D5\u05DC\u05DD \u05D4\u05D6\u05D4!');
    resetToLobby();
  }
}

export function retryLevel() {
  loadLevel();
}

export function goBack() {
  if (battleInProgress && !confirm('\u05DC\u05D4\u05E4\u05E1\u05D9\u05E7 \u05D0\u05EA \u05D4\u05E7\u05E8\u05D1 \u05D5\u05DC\u05D7\u05D6\u05D5\u05E8 \u05DC\u05EA\u05E4\u05E8\u05D9\u05D8?')) {
    return;
  }
  resetToLobby();
}

export function initGame() {
  const container = document.getElementById('game-canvas-container');
  arena.initArena(container);
  arenaInitialized = true;
  loadSavedState();
}

function loadSavedState() {
  const data = ui.getSaveData();
  ui.updateBrawlerSelection(selectedBrawlerIndex);
  ui.updateWorldSelection(selectedWorldIndex);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
