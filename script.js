let selected = [];
let matched = [];
let level = 'easy';
let startTime, timerInterval, mistakes = 0;
let correctCount = 0;

function initGame() {
  const board = document.getElementById('game-board');
  const levelSelect = document.getElementById('level');
  level = levelSelect.value;

  const data = [...words[level]];
  const cards = [];

  selected = [];
  matched = [];
  mistakes = 0;
  correctCount = 0;

  clearInterval(timerInterval);
  document.getElementById('mistakes').innerText = '0';
  document.getElementById('correct-count').innerText = '0';
  document.getElementById('total-count').innerText = data.length.toString();
  document.getElementById('result').style.display = 'none';

  data.forEach((pair, i) => {
    cards.push({ value: pair.en, match: pair.ko, type: 'en' });
    cards.push({ value: pair.ko, match: pair.en, type: 'ko' });
  });

  cards.sort(() => 0.5 - Math.random());

  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)`;

  cards.forEach((cardObj, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerText = cardObj.value;
    card.dataset.value = cardObj.value;
    card.dataset.match = cardObj.match;
    card.dataset.index = index;
    card.onclick = () => flipCard(card);
    board.appendChild(card);
  });

  startTime = Date.now();
  timerInterval = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').innerText = time;
  }, 1000);
}

function flipCard(card) {
  if (selected.length >= 2 || card.classList.contains('matched')) return;
  selected.push(card);

  if (selected.length === 2) {
    const [a, b] = selected;
    if (a.dataset.value === b.dataset.match && b.dataset.value === a.dataset.match) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched.push(a.dataset.value);
      matched.push(b.dataset.value);
      correctCount++;
      document.getElementById('correct-count').innerText = correctCount;
      selected = [];
      if (matched.length === words[level].length * 2) endGame();
    } else {
      mistakes++;
      document.getElementById('mistakes').innerText = mistakes;
      setTimeout(() => {
        selected = [];
      }, 800);
    }
  }
}

function endGame() {
  clearInterval(timerInterval);
  const time = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);
  document.getElementById('final-time').innerText = time;
  document.getElementById('final-mistakes').innerText = mistakes;
  document.getElementById('final-score').innerText = score;
  document.getElementById('score').innerText = score;
  const shareURL = new URL(window.location.href);
  shareURL.searchParams.set('score', score);
  document.getElementById('share-link').value = shareURL.toString();
  document.getElementById('result').style.display = 'block';
}

window.onload = initGame;
