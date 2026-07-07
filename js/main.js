import * as game from './game.js';
import * as ui from './ui.js';

function init() {
  ui.initUI({
    onBrawlerSelect,
    onWorldSelect,
    onStartBattle,
    onBack,
    onNext,
    onRetry,
    onLobby
  });

  game.initGame();
  ui.showScreen('lobby-screen');
}

function onBrawlerSelect(index) {
  game.setSelectedBrawler(index);
  ui.updateBrawlerSelection(index);
}

function onWorldSelect(index) {
  game.setSelectedWorld(index);
  ui.updateWorldSelection(index);
}

function onStartBattle() {
  game.startGame();
}

function onBack() {
  game.goBack();
}

function onNext() {
  game.nextLevel();
}

function onRetry() {
  game.retryLevel();
}

function onLobby() {
  game.resetToLobby();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
