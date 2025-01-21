function saveGame() {
  localStorage.setItem('swordForgeSave', JSON.stringify(gameState));
}

function loadGame() {
  const save = localStorage.getItem('swordForgeSave');
  if (save) gameState = JSON.parse(save);
}