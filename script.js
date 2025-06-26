let selectedEnglish = null;
let selectedMeaning = null;
let matched = [];
let level = 'easy';
let startTime, timerInterval, mistakes = 0;
let correctCount = 0;

const englishContainer = document.getElementById('english-cards');
const meaningContainer = document.getElementById('meaning-cards');
const correctCountEl = document.getElementById('correct-count');
const totalCountEl = document.getElementById('total-count');
const timerEl = document.getElementById('timer');
const mistakesEl = document.getElementById('mistakes');
const scoreEl = document.getElementById('score');
const resultPanel = document.getElementById('result');
const finalTimeEl = document.getElementById('final-time');
const finalMistakesEl = document.getElementById('final-mistakes');
const finalScoreEl = document.getElementById('final-score');
const funQuoteEl = document.getElementById('fun-quote');
const shareLinkInput = document.getElementById('share-link');
const copyBtn = document.getElementById('copy-btn');
const webShareBtn = document.getElementById('web-share-btn');
const restartBtn = document.getElementById('restart-btn');

// 쿼리스트링에서 level과 score 읽기
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get('level'),
    score: params.get('score'),
  };
}

// 게임 초기화
function initGame() {
  const query = getQueryParams();

  // 쿼리스트링에 level이 있으면 선택하고, 없으면 select 박스 값 사용
  if (query.level && ['easy','medium','hard'].includes(query.level)) {
    level = query.level;
    document.getElementById('level').value = level;
  } else {
    level = document.getElementById('level').value;
  }

  matched = [];
  mistakes = 0;
  correctCount = 0;

  selectedEnglish = null;
  selectedMeaning = null;

  clearInterval(timerInterval);
  timerEl.innerText = '0';
  mistakesEl.innerText = '0';
  correctCountEl.innerText = '0';
  scoreEl.innerText = '0';
  totalCountEl.innerText = words[level].length;

  resultPanel.style.display = 'none';
  englishContainer.style.display = 'grid';
  meaningContainer.style.display = 'grid';

  // 카드 초기화
  englishContainer.innerHTML = '';
  meaningContainer.innerHTML = '';

  // 카드 배열 복사
  const wordPairs = [...words[level]];
  // 영어 단어 카드, 뜻 카드 분리
  const englishCards = wordPairs.map((w, i) => ({ value: w.en, match: w.ko, index: i }));
  const meaningCards = wordPairs.map((w, i) => ({ value: w.ko, match: w.en, index: i }));

  // 카드 섞기
  shuffleArray(englishCards);
  shuffleArray(meaningCards);

  // 영어 카드 생성
  englishCards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerText = card.value;
    div.dataset.value = card.value;
    div.dataset.match = card.match;
    div.dataset.index = card.index;
    div.dataset.type = 'en';
    div.onclick = () => selectCard(div);
    englishContainer.appendChild(div);
  });

  // 뜻 카드 생성
  meaningCards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerText = card.value;
    div.dataset.value = card.value;
    div.dataset.match = card.match;
    div.dataset.index = card.index;
    div.dataset.type = 'ko';
    div.onclick = () => selectCard(div);
    meaningContainer.appendChild(div);
  });

  startTime = Date.now();
  timerInterval = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    timerEl.innerText = time;
    updateScore(time, mistakes);
  }, 1000);

  // 쿼리스트링에 score가 있으면 결과창 표시 (게임 클리어 후 공유 링크로 진입 시)
  if (query.score) {
    showResultPanel(parseInt(query.score, 10), 0, 0);
  }
}

// 카드 선택 처리
function selectCard(card) {
  if (card.classList.contains('matched')) return;

  if (card.dataset.type === 'en') {
    if (selectedEnglish) selectedEnglish.classList.remove('selected');
    selectedEnglish = card;
    card.classList.add('selected');
  } else {
    if (selectedMeaning) selectedMeaning.classList.remove('selected');
    selectedMeaning = card;
    card.classList.add('selected');
  }

  if (selectedEnglish && selectedMeaning) {
    if (selectedEnglish.dataset.match === selectedMeaning.dataset.value) {
      // 매칭 성공
      selectedEnglish.classList.add('matched');
      selectedMeaning.classList.add('matched');
      matched.push(selectedEnglish.dataset.value);
      matched.push(selectedMeaning.dataset.value);
      correctCount++;
      correctCountEl.innerText = correctCount;
      updateScore(Math.floor((Date.now() - startTime) / 1000), mistakes);
      selectedEnglish.classList.remove('selected');
      selectedMeaning.classList.remove('selected');
      selectedEnglish = null;
      selectedMeaning = null;

      if (matched.length === words[level].length * 2) {
        endGame();
      }
    } else {
      // 매칭 실패
      mistakes++;
      mistakesEl.innerText = mistakes;
      setTimeout(() => {
        selectedEnglish.classList.remove('selected');
        selectedMeaning.classList.remove('selected');
        selectedEnglish = null;
        selectedMeaning = null;
      }, 800);
    }
  }
}

// 점수 업데이트
function updateScore(time, mistakes) {
  const baseScore = 1000 - (time * 5 + mistakes * 20);
  scoreEl.innerText = baseScore > 0 ? baseScore : 0;
}

// 결과 멘트
function getFunQuote(score) {
  if (score >= 900) return "🌟 초능력자 탄생! 넌 진짜 천재야!";
  if (score >= 700) return "👍 잘했어! 거의 프로 수준이야!";
  if (score >= 500) return "🙂 괜찮은데? 조금만 더 집중해봐!";
  if (score >= 300) return "😅 조금 힘들었지? 다시 도전해보자!";
  return "😂 도전 정신 최고! 다음엔 꼭 성공할 거야!";
}

// 결과 패널 표시 함수
function showResultPanel(score, time = 0, mistakesCount = 0) {
  clearInterval(timerInterval);

  finalTimeEl.innerText = time;
  finalMistakesEl.innerText = mistakesCount;
  finalScoreEl.innerText = score;
  funQuoteEl.innerText = getFunQuote(score);

  resultPanel.style.display = 'block';
  englishContainer.style.display = 'none';
  meaningContainer.style.display = 'none';

  if (navigator.share) {
    webShareBtn.style.display = 'inline-block';
  } else {
    webShareBtn.style.display = 'none';
  }
}

// 게임 종료 처리
function endGame() {
  const time = Math.floor((Date.now() - startTime) / 1000);
  const score = Math.max(1000 - (time * 5 + mistakes * 20), 0);

  showResultPanel(score, time, mistakes);

  // URL에 점수와 난이도 반영
  const url = new URL(window.location.href);
  url.searchParams.set('score', score);
  url.searchParams.set('level', level);
  window.history.replaceState(null, '', url.toString());

  // 공유 링크 입력창에 반영
  shareLinkInput.value = url.toString();
}

// 복사 버튼 이벤트
copyBtn.onclick = () => {
  shareLinkInput.select();
  navigator.clipboard.writeText(shareLinkInput.value)
    .then(() => alert('링크가 복사되었습니다!'))
    .catch(() => alert('복사에 실패했습니다. 수동으로 복사해주세요.'));
};

// 웹 공유 버튼 이벤트
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

// 다시 시작 버튼 이벤트
restartBtn.onclick = initGame;

// 페이지 로드 시 초기화
window.onload = initGame;

// 배열 셔플 함수
function shuffleArray(arr) {
  for (let i = arr.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
