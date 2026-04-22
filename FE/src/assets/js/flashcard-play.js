let isFlipped = false;
let currentCardIndex = 0;
let learningCount = 0;
let knownCount = 0;

const flashcards = [
  {
    front: 'What is a noun?',
    back: 'A noun is a word that represents a person, place, thing, or idea.',
    example: 'Examples: cat, city, love.',
  },
  {
    front: 'What is a verb?',
    back: 'A verb is a word that describes an action, occurrence, or state of being.',
    example: 'Examples: run, is, think.',
  },
  {
    front: 'What is an adjective?',
    back: 'A word that describes or modifies a noun or pronoun.',
    example: 'Examples: beautiful, tall, red.',
  },
  {
    front: 'What is an adverb?',
    back: 'A word that modifies a verb, an adjective, or another adverb.',
    example: 'Examples: extremely, quickly, today.',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const innerCard = document.getElementById('flashcardInner');
  const revealActions = document.getElementById('revealActions');

  function flipCard() {
    if (!isFlipped) {
      innerCard.classList.add('rotate-y-180');
      isFlipped = true;
      setTimeout(() => revealActions.classList.remove('hidden'), 400);
    } else {
      innerCard.classList.remove('rotate-y-180');
      isFlipped = false;
      setTimeout(() => revealActions.classList.add('hidden'), 200);
    }
  }

  function nextCard(status) {
    if (status === 'learning') {
      learningCount++;
      document.getElementById('learningBadge').textContent = learningCount;
    } else if (status === 'know') {
      knownCount++;
      document.getElementById('knownBadge').textContent = knownCount;
    }

    if (currentCardIndex < flashcards.length - 1) {
      revealActions.classList.add('hidden');
      innerCard.classList.remove('rotate-y-180');
      isFlipped = false;
      setTimeout(() => {
        currentCardIndex++;
        updateCardUI();
      }, 300);
    } else {
      alert('Chúc mừng! Bạn đã hoàn thành bộ Flashcard.');
      window.location.href = 'flashcard-detail.html';
    }
  }

  function updateCardUI() {
    const cardData = flashcards[currentCardIndex];
    document.querySelector('#flashcardInner .absolute.inset-0:not(.rotate-y-180) h2').textContent = cardData.front;
    document.querySelector('#backText').textContent = cardData.back;
    document.querySelector('.bg-teal-50 p').innerHTML = `<span class="font-bold text-teal-600">Examples:</span> ${cardData.example.replace('Examples: ', '')}`;
    document.getElementById('cardCounter').textContent = `${currentCardIndex + 1} / ${flashcards.length} Flashcards`;
    const percent = (currentCardIndex / flashcards.length) * 100;
    document.getElementById('progressFill').style.width = Math.max(percent, 5) + '%';
    document.querySelector('.text-xs.font-bold.text-white').textContent = Math.round(percent) + '%';
  }

  document.getElementById('flashcardArea').addEventListener('click', flipCard);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); flipCard(); }
    else if (isFlipped && e.key === '1') nextCard('learning');
    else if (isFlipped && e.key === '2') nextCard('know');
  });

  window.nextCard = nextCard;

  updateCardUI();
});
