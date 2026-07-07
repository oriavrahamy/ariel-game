import { brawlers, worlds, shopItems, lossTips, RARITY_COLORS } from './data.js';

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

  populateBrawlersPanel();
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

  document.querySelectorAll('.panel-close').forEach(b => {
    b.addEventListener('click', closeAllPanels);
  });
  document.getElementById('panel-overlay').addEventListener('click', closeAllPanels);

  document.querySelectorAll('.bottom-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panel = tab.dataset.tab;
      openPanel(panel);
    });
  });
}

export function showScreen(id) {
  closeAllPanels();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== PANEL SYSTEM =====
let currentPanel = null;

function openPanel(name) {
  const panelId = name + '-panel';
  const panel = document.getElementById(panelId);
  const overlay = document.getElementById('panel-overlay');
  if (!panel) return;

  if (currentPanel === panelId) {
    closeAllPanels();
    return;
  }

  closeAllPanels();
  panel.classList.add('open');
  overlay.classList.remove('hidden');
  currentPanel = panelId;

  document.querySelectorAll('.bottom-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
}

export function closeAllPanels() {
  document.querySelectorAll('.slide-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('panel-overlay').classList.add('hidden');
  document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
  currentPanel = null;
}

// ===== LOBBY UPDATE =====
export function updateLobbyBrawler(brawler, trophies) {
  const img = document.getElementById('brawler-hero');
  img.src = brawler.image;
  img.alt = brawler.name;

  document.getElementById('hero-name').textContent = brawler.name;
  document.getElementById('hero-rarity').textContent = brawler.rarity;
  document.getElementById('hero-rarity').style.color = RARITY_COLORS[brawler.rarity] || '#fff';
  document.getElementById('hero-trophies').textContent = '🏆 ' + trophies;
}

export function updatePlayerInfo(name, trophies, level, xp, maxXp) {
  document.getElementById('player-name').textContent = name;
  document.getElementById('player-trophies').textContent = '🏆 ' + trophies;
  document.getElementById('player-level').textContent = level;

  const pct = Math.min(100, (xp / maxXp) * 100);
  const circumference = 97.4;
  const offset = circumference - (pct / 100) * circumference;
  const circle = document.getElementById('xp-circle');
  if (circle) {
    circle.style.strokeDashoffset = offset;
  }
}

export function enableBattle(enable) {
  document.getElementById('btn-start').disabled = !enable;
}

// ===== BRAWLERS PANEL =====
export function populateBrawlersPanel() {
  const grid = document.getElementById('brawlers-grid');
  grid.innerHTML = '';
  brawlers.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'brawler-card';
    card.dataset.id = b.id;

    const rarityColor = RARITY_COLORS[b.rarity] || '#fff';
    card.style.borderColor = rarityColor;

    card.innerHTML = `
      <img class="brawler-card-img" src="${b.image}" alt="${b.name}" loading="lazy"
        style="border-color: ${rarityColor}">
      <span class="brawler-card-name">${b.name}</span>
      <span class="brawler-card-rarity" style="color: ${rarityColor}">${b.rarity}</span>
      <span class="brawler-card-trophies">🏆 <span class="brawler-card-trophies-num">0</span></span>
    `;

    card.addEventListener('click', () => onBrawlerSelect(i));
    grid.appendChild(card);
  });
}

export function updateBrawlersPanel(selectedIndex, brawlerDataMap, unlockedIds) {
  const cards = document.querySelectorAll('.brawler-card');
  cards.forEach((card, i) => {
    const b = brawlers[i];
    const isUnlocked = unlockedIds.includes(b.id);
    const isSelected = i === selectedIndex;

    card.classList.toggle('selected', isSelected);
    card.classList.toggle('locked', !isUnlocked);

    if (!isUnlocked) {
      card.innerHTML = `
        <div class="brawler-card-img" style="border-color: #333; background: #1a1a2e; display:flex;align-items:center;justify-content:center;">
          <span style="font-size:2rem;opacity:0.3;">🔒</span>
        </div>
        <span class="brawler-card-name" style="color:#555;">???</span>
        <span class="brawler-card-trophies">🔒 ${b.unlockTrophies} 🏆</span>
      `;
    } else {
      const rarityColor = RARITY_COLORS[b.rarity] || '#fff';
      const data = brawlerDataMap[b.id] || { trophies: 0, xp: 0, level: 1 };
      card.style.borderColor = rarityColor;
      card.innerHTML = `
        <img class="brawler-card-img" src="${b.image}" alt="${b.name}" loading="lazy"
          style="border-color: ${rarityColor}">
        <span class="brawler-card-name">${b.name}</span>
        <span class="brawler-card-rarity" style="color: ${rarityColor}">${b.rarity}</span>
        <span class="brawler-card-trophies">🏆 ${data.trophies}</span>
      `;
    }
  });
}

// ===== WORLDS =====
function populateWorlds() {
  const list = document.getElementById('worlds-list');
  list.innerHTML = '';
  worlds.forEach((w, i) => {
    const card = document.createElement('div');
    card.className = 'world-card';
    card.dataset.id = w.id;
    card.innerHTML = `
      <div class="wc-header">
        <span class="wc-emoji">${w.emoji}</span>
        <div class="wc-info">
          <span class="wc-name">${w.name}</span>
          <span class="wc-topic">${w.topic}</span>
        </div>
        <span class="wc-progress" id="wp-${i}">0/3</span>
      </div>
    `;
    card.addEventListener('click', () => onWorldSelect(i));
    list.appendChild(card);
  });
}

export function updateWorldSelection(index) {
  document.querySelectorAll('.world-card').forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
}

export function updateWorldProgress(index, progress) {
  const el = document.getElementById('wp-' + index);
  if (el) el.textContent = progress + '/3';
}

// ===== SHOP =====
function populateShop() {
  const list = document.getElementById('shop-items');
  list.innerHTML = '';
  shopItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'shop-card';
    card.innerHTML = `
      <span class="shop-icon">${item.icon}</span>
      <div class="shop-info">
        <span class="shop-name">${item.name}</span>
        <span class="shop-desc">${item.desc}</span>
      </div>
      <span class="shop-cost">🏆 ${item.cost}</span>
      <button class="shop-btn" data-item="${item.id}">קנה</button>
    `;
    card.querySelector('.shop-btn').addEventListener('click', () => buyShopItem(item));
    list.appendChild(card);
  });
}

function buyShopItem(item) {
  const data = getRawData();
  if (data.ownedItems.includes(item.id)) {
    showNotification('✅ כבר קנית את הפריט הזה!');
    return;
  }
  if (data.totalTrophies < item.cost) {
    showNotification('❌ צריך ' + item.cost + ' 🏆');
    return;
  }
  data.totalTrophies -= item.cost;
  data.ownedItems.push(item.id);
  saveData(data);
  updatePlayerInfo('שחקן ו\'', data.totalTrophies, data.level, data.xp, data.level * 100);
  showNotification('✅ קנית "' + item.name + '"!');
}

// ===== GAME HUD =====
export function updateHUD(levelIndex) {
  const level = document.getElementById('hud-level');
  const waveEl = document.getElementById('hud-wave');
  const world = worlds[getSelectedWorldIndex()];
  if (world && world.levels[levelIndex]) {
    level.textContent = world.levels[levelIndex].name;
    waveEl.textContent = '🎯 ' + world.levels[levelIndex].enemy.name;
  }
}

export function updateHealthBars(playerHp, playerMaxHp, enemyHp, enemyMaxHp, playerName, enemyName) {
  const pPct = Math.max(0, (playerHp / playerMaxHp) * 100);
  const ePct = Math.max(0, (enemyHp / enemyMaxHp) * 100);
  document.getElementById('player-health-fill').style.width = pPct + '%';
  document.getElementById('player-health-text').textContent = `${Math.ceil(playerHp)}/${playerMaxHp}`;
  document.getElementById('player-name-hud').textContent = playerName;
  document.getElementById('enemy-health-fill').style.width = ePct + '%';
  document.getElementById('enemy-health-text').textContent = `${Math.ceil(enemyHp)}/${enemyMaxHp}`;
  document.getElementById('enemy-name-hud').textContent = enemyName;
}

export function showQuestion(questionObj, onAnswer) {
  const overlay = document.getElementById('question-overlay');
  overlay.classList.remove('hidden');

  document.getElementById('question-topic').textContent = worlds[getSelectedWorldIndex()].emoji + ' ' + worlds[getSelectedWorldIndex()].topic;
  document.getElementById('question-text').textContent = questionObj.q;

  const grid = document.getElementById('answers-grid');
  const feedback = document.getElementById('question-feedback');
  feedback.classList.add('hidden');
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
      feedback.className = 'question-feedback ' + (isCorrect ? 'success' : 'fail');
      feedback.textContent = isCorrect ? '✅ תשובה נכונה!' : '❌ התשובה הנכונה: ' + questionObj.a[questionObj.c];
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

export function showEffect(text, color = '#FF1744') {
  const el = document.getElementById('attack-effect');
  const textEl = document.getElementById('effect-text');
  textEl.textContent = text;
  textEl.style.color = color;
  el.classList.remove('hidden');
  const clone = textEl.cloneNode(true);
  textEl.parentNode.replaceChild(clone, textEl);
  clone.id = 'effect-text';
  setTimeout(() => el.classList.add('hidden'), 800);
}

export function updateSuperBar(pct) {
  document.getElementById('super-fill').style.width = Math.min(100, pct) + '%';
}

export function updatePowerUp(type) {
  const el = document.getElementById('powerup-indicator');
  if (!type) { el.classList.add('hidden'); return; }
  const names = { shield: 'מגן', crystal: 'קריסטל', double_damage: 'נזק כפול' };
  const icons = { shield: '🛡️', crystal: '💎', double_damage: '💪' };
  document.getElementById('powerup-icon').textContent = icons[type] || '🎁';
  document.getElementById('powerup-name').textContent = names[type] || type;
  el.classList.remove('hidden');
}

export function showPowerUpSpawned(type) {
  const names = { shield: '🛡️ מגן!', crystal: '💎 קריסטל!', double_damage: '💪 נזק כפול!' };
  showNotification('🎁 ' + (names[type] || type));
}

export function showPowerUpActivated(type) {
  const names = { shield: '🛡️ בולם התקפה!', crystal: '💎 +50% אולטי!', double_damage: '💪 נזק כפול!' };
  showNotification((names[type] || '') + ' ⚡');
}

export function showResults(won, trophies, accuracy, damage, tip) {
  showScreen('results-screen');
  const icon = document.getElementById('results-icon');
  const title = document.getElementById('results-title');

  if (won) {
    icon.textContent = '🏆';
    title.textContent = '🎉 ניצחון!';
    title.className = 'results-title win';
    document.getElementById('btn-next').style.display = 'block';
  } else {
    icon.textContent = '💔';
    title.textContent = 'הפסדת...';
    title.className = 'results-title lose';
    document.getElementById('btn-next').style.display = 'none';
  }

  document.getElementById('results-trophies').textContent = '+' + trophies + ' 🏆';
  document.getElementById('results-accuracy').textContent = Math.round(accuracy) + '%';
  document.getElementById('results-damage-dealt').textContent = Math.round(damage);
  document.getElementById('results-tip').textContent = tip || (won ? '💪 המשך כך!' : lossTips[Math.floor(Math.random() * lossTips.length)]);
}

export function lightningFlash() {
  const el = document.createElement('div');
  el.className = 'lightning';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

export function spinBrawlerHero() {
  const hero = document.getElementById('brawler-hero');
  if (!hero) return;
  hero.style.animation = 'none';
  void hero.offsetWidth;
  hero.style.animation = 'spin-360 0.6s ease-in-out, float-bob 4s ease-in-out infinite';
}

export function rainbowBrawlerCard(brawlerId) {
  const cards = document.querySelectorAll('.brawler-card');
  cards.forEach(card => {
    if (card.dataset.id === brawlerId) {
      card.classList.add('rainbow-border', 'rainbow-glow');
    }
  });
}

// ===== AMMO & RELOAD =====
export function updateAmmoBar(ammo, max) {
  const el = document.getElementById('ammo-display');
  if (el) el.textContent = '🔫 ' + ammo + '/' + max;
}

export function showReloadOverlay(questions, onAnswer) {
  const overlay = document.getElementById('reload-overlay');
  overlay.classList.remove('hidden');
  window._reloadOnAnswer = onAnswer;
  window._reloadQuestions = questions;
  window._reloadIdx = 0;
  showReloadCurrentQuestion(questions[0]);
  updateReloadProgress(1, questions.length);
}

export function updateReloadProgress(current, total) {
  const el = document.getElementById('reload-progress');
  if (el) el.textContent = 'שאלה ' + current + ' / ' + total;
}

export function showReloadCurrentQuestion(q) {
  if (!q) return;
  const topic = document.getElementById('reload-topic');
  const question = document.getElementById('reload-question');
  const answers = document.getElementById('reload-answers');
  const feedback = document.getElementById('reload-feedback');
  const worldIdx = getSelectedWorldIndex();
  topic.textContent = (worlds[worldIdx]?.emoji || '') + ' ' + (worlds[worldIdx]?.topic || '');
  question.textContent = q.q;
  feedback.classList.add('hidden');
  answers.innerHTML = '';

  q.a.forEach((answer, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const isCorrect = i === q.c;
      answers.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        answers.querySelectorAll('.answer-btn')[q.c].classList.add('correct');
      }
      feedback.classList.remove('hidden');
      feedback.className = 'reload-feedback ' + (isCorrect ? 'success' : 'fail');
      feedback.textContent = isCorrect ? '✅ נכון!' : '❌ ' + q.a[q.c];
      setTimeout(() => {
        if (window._reloadOnAnswer) window._reloadOnAnswer(isCorrect);
      }, 600);
    });
    answers.appendChild(btn);
  });
}

export function hideReloadOverlay() {
  document.getElementById('reload-overlay').classList.add('hidden');
}

export function showNotification(msg) {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); el.classList.add('hidden'); }, 2500);
}

// ===== SAVE SYSTEM =====
export function getSelectedWorldIndex() {
  const active = document.querySelector('.world-card.active');
  if (!active) return 0;
  return worlds.findIndex(w => w.id === active.dataset.id);
}

function getRawData() {
  try {
    const raw = JSON.parse(localStorage.getItem('brawlPercentsData'));
    if (!raw) return getDefaultData();
    if (!raw.totalTrophies && raw.trophies !== undefined) {
      raw.totalTrophies = raw.trophies;
    }
    if (!raw.unlockedBrawlers) {
      raw.unlockedBrawlers = ['ariel'];
    }
    if (!raw.brawlerData) {
      raw.brawlerData = { 'ariel': { trophies: raw.totalTrophies || 0, xp: 0, level: 1 } };
    }
    if (raw.selectedBrawler === undefined || !raw.unlockedBrawlers.includes(brawlers[raw.selectedBrawler]?.id)) {
      raw.selectedBrawler = 0;
    }
    if (raw.selectedWorld === undefined) raw.selectedWorld = 0;
    if (raw.worldProgress === undefined) raw.worldProgress = [0, 0, 0, 0];
    if (raw.level === undefined) raw.level = 1;
    if (raw.xp === undefined) raw.xp = 0;
    if (raw.ownedItems === undefined) raw.ownedItems = [];
    return raw;
  } catch {
    return getDefaultData();
  }
}

function getDefaultData() {
  return {
    totalTrophies: 0,
    xp: 0,
    level: 1,
    worldProgress: [0, 0, 0, 0],
    selectedBrawler: 0,
    selectedWorld: 0,
    unlockedBrawlers: ['ariel'],
    brawlerData: {
      'ariel': { trophies: 0, xp: 0, level: 1 }
    },
    ownedItems: []
  };
}

function saveData(data) {
  localStorage.setItem('brawlPercentsData', JSON.stringify(data));
}

export function getSaveData() {
  return getRawData();
}

export function saveGameData(data) {
  saveData(data);
}

function loadSaveData() {
  const data = getRawData();
  updatePlayerInfo('שחקן ו\'', data.totalTrophies, data.level, data.xp, data.level * 100);
  const selBrawler = brawlers[data.selectedBrawler] || brawlers[0];
  const bd = data.brawlerData[selBrawler.id] || { trophies: 0, xp: 0, level: 1 };
  updateLobbyBrawler(selBrawler, bd.trophies);
  updateBrawlersPanel(data.selectedBrawler, data.brawlerData, data.unlockedBrawlers);
  updateWorldSelection(data.selectedWorld || 0);
  worlds.forEach((w, i) => updateWorldProgress(i, data.worldProgress[i] || 0));
  enableBattle(data.unlockedBrawlers.includes(selBrawler.id));
}
