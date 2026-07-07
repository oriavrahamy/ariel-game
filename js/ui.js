import { brawlers, worlds, shopItems, lossTips } from './data.js';

let onBrawlerSelect, onWorldSelect, onStartBattle;
let onAnswerClick, onBack, onNext, onRetry, onLobby;

export function initUI(callbacks) {
  onBrawlerSelect = callbacks.onBrawlerSelect;
  onWorldSelect = callbacks.onWorldSelect;
  onStartBattle = callbacks.onStartBattle;
  onAnswerClick = callbacks.onAnswerClick;
  onBack = callbacks.onBack;
  onNext = callbacks.onNext;
  onRetry = callbacks.onRetry;
  onLobby = callbacks.onLobby;

  populateBrawlers();
  populateWorlds();
  populateShop();
  bindEvents();

  loadSaveData();
}

function bindEvents() {
  document.getElementById('btn-start').addEventListener('click', onStartBattle);
  document.getElementById('btn-back').addEventListener('click', onBack);
  document.getElementById('btn-next').addEventListener('click', onNext);
  document.getElementById('btn-retry').addEventListener('click', onRetry);
  document.getElementById('btn-lobby').addEventListener('click', onLobby);
}

function populateBrawlers() {
  const grid = document.getElementById('brawlers-grid');
  grid.innerHTML = '';
  brawlers.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = 'brawler-btn';
    btn.dataset.id = b.id;
    btn.innerHTML = `
      <span class="brawler-emoji">${b.emoji}</span>
      <span class="brawler-name">${b.name}</span>
      <span class="brawler-hp">❤️ ${b.hp} | ⚔️ ${b.damage}</span>
    `;
    btn.addEventListener('click', () => onBrawlerSelect(i));
    grid.appendChild(btn);
  });
}

function populateWorlds() {
  const list = document.getElementById('worlds-list');
  list.innerHTML = '';
  worlds.forEach((w, i) => {
    const btn = document.createElement('button');
    btn.className = 'world-btn';
    btn.dataset.id = w.id;
    if (i === 0) btn.classList.add('active');
    const progress = getWorldProgress(i);
    btn.innerHTML = `
      <span class="world-emoji">${w.emoji}</span>
      <span class="world-info">
        <span class="world-name">${w.name}</span>
        <span class="world-topic">${w.topic}</span>
      </span>
      <span class="world-progress">${progress}/3</span>
    `;
    btn.addEventListener('click', () => onWorldSelect(i));
    list.appendChild(btn);
  });
}

function populateShop() {
  const container = document.getElementById('shop-items');
  container.innerHTML = '';
  shopItems.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `
      <span class="shop-icon">${item.icon}</span>
      <span>${item.name}</span>
      <span class="shop-cost">🏆 ${item.cost}</span>
      <button class="shop-btn" data-id="${item.id}">קנה</button>
    `;
    div.querySelector('.shop-btn').addEventListener('click', () => buyShopItem(item));
    container.appendChild(div);
  });
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function updateBrawlerSelection(index) {
  document.querySelectorAll('.brawler-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
  });
  const b = brawlers[index];
  const info = document.getElementById('selected-brawler-info');
  info.innerHTML = `
    ${b.emoji} <strong>${b.name}</strong> — ❤️ ${b.hp} | ⚔️ ${b.damage} | 💥 ${b.superName} (${Math.abs(b.superDamage * 100)}%)
    <br><small>${b.desc}</small>
  `;
  document.getElementById('btn-start').disabled = false;
}

export function updateWorldSelection(index) {
  document.querySelectorAll('.world-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

export function updateHUD(levelIndex) {
  const level = document.getElementById('hud-level');
  const waveEl = document.getElementById('hud-wave');
  const worldIdx = getSelectedWorld();
  const world = worlds[worldIdx];
  if (world && world.levels[levelIndex]) {
    level.textContent = world.levels[levelIndex].name;
  }
  const enemy = world.levels[levelIndex].enemy;
  waveEl.textContent = `🎯 ${enemy.name}`;
}

export function updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, playerName, enemyName) {
  const pFill = document.getElementById('player-health-fill');
  const pText = document.getElementById('player-health-text');
  const pName = document.getElementById('player-name-hud');
  const eFill = document.getElementById('enemy-health-fill');
  const eText = document.getElementById('enemy-health-text');
  const eName = document.getElementById('enemy-name-hud');

  const pPct = Math.max(0, (playerHp / playerMaxHp) * 100);
  const ePct = Math.max(0, (enemyHp / enemyMaxHp) * 100);

  pFill.style.width = pPct + '%';
  pText.textContent = `${Math.ceil(playerHp)}/${playerMaxHp}`;
  pName.textContent = playerName;

  eFill.style.width = ePct + '%';
  eText.textContent = `${Math.ceil(enemyHp)}/${enemyMaxHp}`;
  eName.textContent = enemyName;
}

export function showQuestion(questionObj, onAnswer) {
  const overlay = document.getElementById('question-overlay');
  overlay.classList.remove('hidden');

  const topic = document.getElementById('question-topic');
  const text = document.getElementById('question-text');
  const grid = document.getElementById('answers-grid');
  const feedback = document.getElementById('question-feedback');
  feedback.classList.add('hidden');

  const worldIdx = getSelectedWorld();
  topic.textContent = `${worlds[worldIdx].emoji} ${worlds[worldIdx].topic}`;
  text.textContent = questionObj.q;

  grid.innerHTML = '';
  questionObj.a.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const isCorrect = i === questionObj.c;
      document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        document.querySelectorAll('.answer-btn')[questionObj.c].classList.add('correct');
      }
      feedback.classList.remove('hidden');
      feedback.className = `question-feedback ${isCorrect ? 'success' : 'fail'}`;
      feedback.textContent = isCorrect ? '✅ תשובה נכונה!' : `❌ התשובה הנכונה: ${questionObj.a[questionObj.c]}`;
      setTimeout(() => {
        overlay.classList.add('hidden');
        feedback.classList.add('hidden');
        document.querySelectorAll('.answer-btn').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
        onAnswer(isCorrect);
      }, isCorrect ? 800 : 1500);
    });
    grid.appendChild(btn);
  });
}

export function hideQuestion() {
  document.getElementById('question-overlay').classList.add('hidden');
}

export function showEffect(text, color = '#EF4444') {
  const el = document.getElementById('attack-effect');
  const textEl = document.getElementById('effect-text');
  textEl.textContent = text;
  textEl.style.color = color;
  el.classList.remove('hidden');

  const clone = textEl.cloneNode(true);
  textEl.parentNode.replaceChild(clone, textEl);
  clone.id = 'effect-text';

  setTimeout(() => {
    el.classList.add('hidden');
  }, 800);
}

export function showResults(won, trophies, accuracy, damage, tip) {
  showScreen('results-screen');
  const icon = document.getElementById('results-icon');
  const title = document.getElementById('results-title');
  const trophiesEl = document.getElementById('results-trophies');
  const accuracyEl = document.getElementById('results-accuracy');
  const damageEl = document.getElementById('results-damage-dealt');
  const tipEl = document.getElementById('results-tip');
  const nextBtn = document.getElementById('btn-next');
  const retryBtn = document.getElementById('btn-retry');

  if (won) {
    icon.textContent = '🏆';
    title.textContent = '🎉 ניצחון!';
    title.style.background = 'linear-gradient(135deg, #10B981, #06B6D4)';
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor = 'transparent';
    title.style.backgroundClip = 'text';
    nextBtn.style.display = 'block';
  } else {
    icon.textContent = '💔';
    title.textContent = 'הפסדת...';
    title.style.background = 'linear-gradient(135deg, #EF4444, #F59E0B)';
    title.style.webkitBackgroundClip = 'text';
    title.style.webkitTextFillColor = 'transparent';
    title.style.backgroundClip = 'text';
    nextBtn.style.display = 'none';
  }

  trophiesEl.textContent = `+${trophies} 🏆`;
  accuracyEl.textContent = Math.round(accuracy) + '%';
  damageEl.textContent = Math.round(damage);

  tipEl.textContent = tip || (won ? '💪 המשך כך! כל אחוז מקרב אותך לשליטה!' : getRandomTip());
}

function getRandomTip() {
  return lossTips[Math.floor(Math.random() * lossTips.length)];
}

export function updateSuperBar(pct) {
  document.getElementById('super-fill').style.width = Math.min(100, pct) + '%';
}

export function updatePowerUp(type) {
  const el = document.getElementById('powerup-indicator');
  const icon = document.getElementById('powerup-icon');
  const name = document.getElementById('powerup-name');
  if (!type) {
    el.classList.add('hidden');
    return;
  }
  const names = { shield: 'מגן', crystal: 'קריסטל', double_damage: 'נזק כפול' };
  const icons = { shield: '🛡️', crystal: '💎', double_damage: '💪' };
  icon.textContent = icons[type] || '🎁';
  name.textContent = names[type] || type;
  el.classList.remove('hidden');
}

export function showPowerUpSpawned(type) {
  const names = { shield: '🛡️ מגן!', crystal: '💎 קריסטל!', double_damage: '💪 נזק כפול!' };
  showNotification('🎁 פאוור-אפ מופיע בזירה: ' + (names[type] || type));
}

export function showPowerUpCollected(type) {
  const names = { shield: '🛡️ מגן', crystal: '💎 קריסטל', double_damage: '💪 נזק כפול' };
  showNotification('✅ אספת: ' + (names[type] || type) + '!');
}

export function showPowerUpActivated(type) {
  const names = { shield: '🛡️ המגן בולם את ההתקפה!', crystal: '💎 +50% אולטי!', double_damage: '💪 נזק כפול!' };
  showNotification((names[type] || '') + ' ⚡');
}

export function updateTrophiesDisplay(amount) {
  document.getElementById('total-trophies').textContent = amount;
}

export function updateXP(xp, maxXp) {
  const fill = document.getElementById('xp-fill');
  const text = document.getElementById('xp-text');
  const pct = Math.min(100, (xp / maxXp) * 100);
  fill.style.width = pct + '%';
  text.textContent = `${xp} / ${maxXp} XP`;
}

export function updatePlayerLevel(level) {
  document.getElementById('player-level').textContent = `רמה ${level}`;
}

export function showNotification(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); el.classList.add('hidden'); }, 2500);
}

function getWorldProgress(index) {
  const data = loadRawData();
  return data.worldProgress[index] || 0;
}

function getSelectedWorld() {
  const active = document.querySelector('.world-btn.active');
  if (!active) return 0;
  const id = active.dataset.id;
  return worlds.findIndex(w => w.id === id);
}

function loadRawData() {
  try {
    return JSON.parse(localStorage.getItem('brawlPercentsData')) || getDefaultData();
  } catch {
    return getDefaultData();
  }
}

function getDefaultData() {
  return {
    trophies: 0,
    xp: 0,
    level: 1,
    worldProgress: [0, 0, 0, 0],
    selectedBrawler: 0,
    selectedWorld: 0,
    ownedItems: []
  };
}

function loadSaveData() {
  const data = loadRawData();
  updateTrophiesDisplay(data.trophies);
  updateXP(data.xp, data.level * 100);
  updatePlayerLevel(data.level);
}

function buyShopItem(item) {
  const data = loadRawData();
  if (data.ownedItems.includes(item.id)) {
    showNotification('✅ כבר קנית את הפריט הזה!');
    return;
  }
  if (data.trophies < item.cost) {
    showNotification('❌ אין מספיק גביעים! צריך ' + item.cost + ' 🏆');
    return;
  }
  data.trophies -= item.cost;
  data.ownedItems.push(item.id);
  saveData(data);
  updateTrophiesDisplay(data.trophies);
  showNotification(`✅ קנית "${item.name}"!`);
}

function saveData(data) {
  localStorage.setItem('brawlPercentsData', JSON.stringify(data));
}

export function getSaveData() {
  return loadRawData();
}

export function saveGameData(data) {
  saveData(data);
  updateTrophiesDisplay(data.trophies);
  updateXP(data.xp, data.level * 100);
  updatePlayerLevel(data.level);
}
