let selected = [];
let matched = [];
let level = 'easy';
let startTime, timerInterval, mistakes = 0;
let correctCount = 0;

function initGame() {
  const boardLeft = document.getElementById('english-cards');
  const boardRight = document.getElementById('meaning-cards');
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
  document.getElementById('score').innerText = '0';
  document.getElementById('result').style.display = 'none';

  data.forEach((pair) => {
    cards.push({ value: pair.en, match: pair.ko, type: 'en' });
    cards.push({ value: pair.ko, match: pair.en, type: 'ko' });
  });

  cards.sort(() => 0.5 - Math.random());

  boardLeft.innerHTML = '';
  boardRight.innerHTML = '';

  cards.forEach((cardObj, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerText = cardObj.value;
    card.dataset.value = cardObj.value;
    card.dataset.match = cardObj.match;
    card.dataset.index = index;
    card.onclick = () => flipCard(card);

    if (cardObj.type === 'en') {
      boardLeft.appendChild(card);
    } else {
      boardRight.appendChild(card);
    }
  });

  startTime = Date.now();
  timerInterval = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').innerText = time;
  }, 1000);
}

function flipCard(card) {
  if (selected.length >= 2 || card.classList.contains('matched')) return;
  card.classList.add('selected');
  selected.push(card);

  if (selected.length === 2) {
    const [a, b] = selected;
    const isMatch = a.dataset.value === b.dataset.match && b.dataset.value === a.dataset.match;

    if (isMatch) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched.push(a.dataset.value, b.dataset.value);
      correctCount++;
      document.getElementById('correct-count').innerText = correctCount;
      updateScore();
      selected.forEach(c => c.classList.remove('selected'));
      selected = [];

      if (matched.length === words[level].length * 2) {
        endGame();
      }
    } else {
      mistakes++;
      document.getElementById('mistakes').innerText = mistakes;
      setTimeout(() => {
        selected.forEach(c => c.classList.remove('selected'));
        selected = [];
      }, 800);
    }
  }
}

function updateScore() {
  const time = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);
  document.getElementById('score').innerText = score;
}

function endGame() {
  clearInterval(timerInterval);
  const time = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);

  document.getElementById('final-time').innerText = time;
  document.getElementById('final-mistakes').innerText = mistakes;
  document.getElementById('final-score').innerText = score;
  document.getElementById('score').innerText = score;

  const quote = getScoreQuote(score);
  document.getElementById('fun-quote').innerText = quote;

  const shareURL = new URL(window.location.href);
  shareURL.searchParams.set('score', score);
  document.getElementById('share-link').value = shareURL.toString();

  document.getElementById('result').style.display = 'block';

  // 웹 공유 버튼 텍스트 생성
  if (navigator.share) {
    const shareBtn = document.getElementById('web-share-btn');
    shareBtn.style.display = 'inline-block';

    shareBtn.addEventListener('click', () => {
      navigator.share({
        title: '영어 단어 게임 결과',
        text: `내 점수는 ${score}점! "${quote}"\n너도 테스트해봐 👉`,
        url: shareURL.toString()
      }).catch((err) => {
        console.warn('공유 실패:', err);
      });
    });
  }
}

function getScoreQuote(score) {
  if (score >= 900) return "천재인가요!? 🎓";
  if (score >= 700) return "우와! 정말 잘했어요 💯";
  if (score >= 500) return "꽤 괜찮았어요! 👏";
  if (score >= 300) return "조금만 더 집중해봐요 😊";
  return "괜찮아요, 연습이 완벽을 만듭니다! 💪";
}

window.onload = () => {
  initGame();

  document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('result').style.display = 'none';
    initGame();
  });

  document.getElementById('copy-btn').addEventListener('click', () => {
    const link = document.getElementById('share-link');
    link.select();
    document.execCommand('copy');
    alert('링크가 복사되었어요!');
  });
};
