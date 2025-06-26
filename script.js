// 게임용 단어 데이터 words는 words.js에 있음

let selected = [];
let matched = [];
let level = 'easy';
let startTime, timerInterval, mistakes = 0;
let correctCount = 0;

const gameBoard = document.getElementById('game-board');
const correctCountEl = document.getElementById('correct-count');
const totalCountEl = document.getElementById('total-count');
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const scoreEl = document.getElementById('score');
const resultPanel = document.getElementById('result');
const finalTimeEl = document.getElementById('final-time');
const finalMistakesEl = document.getElementById('final-mistakes');
const finalScoreEl = document.getElementById('final-score');
const shareLinkInput = document.getElementById('share-link');
const funQuoteEl = document.getElementById('fun-quote');
const copyBtn = document.getElementById('copy-btn');
const webShareBtn = document.getElementById('web-share-btn');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
  level = document.getElementById('level').value;
  const data = [...words[level]];
  const cards = [];

  selected = [];
  matched = [];
  mistakes = 0;
  correctCount = 0;

  clearInterval(timerInterval);
  mistakesEl.innerText = '0';
  correctCountEl.innerText = '0';
  totalCountEl.innerText = data.length.toString();
  timerEl.innerText = '0';
  scoreEl.innerText = '0';
  funQuoteEl.innerText = '';
  resultPanel.style.display = 'none';
  gameBoard.style.display = 'grid';

  // 카드 배열 생성 (영어/한국어 쌍)
  data.forEach((pair) => {
    cards.push({ value: pair.en, match: pair.ko, type: 'en' });
    cards.push({ value: pair.ko, match: pair.en, type: 'ko' });
  });

  // 카드 섞기
  cards.sort(() => 0.5 - Math.random());

  // 게임 보드 스타일 - 카드 갯수에 맞게 컬럼 수 조절
  const colCount = Math.ceil(Math.sqrt(cards.length));
  gameBoard.style.gridTemplateColumns = `repeat(${colCount}, minmax(60px, 1fr))`;

  gameBoard.innerHTML = '';

  cards.forEach((cardObj, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerText = cardObj.value;
    card.dataset.value = cardObj.value;
    card.dataset.match = cardObj.match;
    card.dataset.index = index;
    card.onclick = () => flipCard(card);
    gameBoard.appendChild(card);
  });

  startTime = Date.now();
  timerInterval = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    timerEl.innerText = time;
    updateScore(time, mistakes);
  }, 1000);
}

function flipCard(card) {
  if (selected.length >= 2 || card.classList.contains('matched') || card.classList.contains('selected')) return;

  card.classList.add('selected');
  selected.push(card);

  if (selected.length === 2) {
    const [a, b] = selected;
    if (a.dataset.value === b.dataset.match && b.dataset.value === a.dataset.match) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched.push(a.dataset.value);
      matched.push(b.dataset.value);
      correctCount++;
      correctCountEl.innerText = correctCount;
      clearSelected();
      if (matched.length === words[level].length * 2) {
        endGame();
      }
    } else {
      mistakes++;
      mistakesEl.innerText = mistakes;
      setTimeout(() => {
        clearSelected();
      }, 800);
    }
  }
}

function clearSelected() {
  selected.forEach(c => c.classList.remove('selected'));
  selected = [];
}

function updateScore(time, mistakes) {
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);
  scoreEl.innerText = score;
}

function getFunQuote(score) {
  if (score >= 900) return "🌟 초능력자 탄생! 넌 진짜 천재야!";
  if (score >= 700) return "👍 잘했어! 거의 프로 수준이야!";
  if (score >= 500) return "🙂 괜찮은데? 조금만 더 집중해봐!";
  if (score >= 300) return "😅 조금 힘들었지? 다시 도전해보자!";
  return "😂 도전 정신 최고! 다음엔 꼭 성공할 거야!";
}

function endGame() {
  clearInterval(timerInterval);
  const time = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);

  finalTimeEl.innerText = time;
  finalMistakesEl.innerText = mistakes;
  finalScoreEl.innerText = score;
  funQuoteEl.innerText = getFunQuote(score);

  // 공유 링크 생성
  const shareURL = new URL(window.location.href);
  shareURL.searchParams.set('score', score);
  shareLinkInput.value = shareURL.toString();

  resultPanel.style.display = 'block';
  gameBoard.style.display = 'none';

  // 공유 버튼 표시 여부 결정
  if (navigator.share) {
    webShareBtn.style.display = 'inline-block';
  } else {
    webShareBtn.style.display = 'none';
  }
}

copyBtn.onclick = () => {
  shareLinkInput.select();
  navigator.clipboard.writeText(shareLinkInput.value)
    .then(() => {
      alert('링크가 복사되었습니다!');
    })
    .catch(() => {
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    });
};

webShareBtn.onclick = () => {
  if (!navigator.share) {
    alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    return;
  }
  navigator.share({
    title: '영어 단어 카드 게임 점수',
    text: `내 점수는 ${finalScoreEl.innerText}점이야! 너도 도전해봐!`,
    url: shareLinkInput.value,
  });
};

restartBtn.onclick = () => {
  initGame();
};

window.onload = initGame;
