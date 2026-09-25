// -------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------
// Set his birthday start time (Year, Month [0-11], Day, Hour, Min)
// Note: November is Month 10 in JS (0 = Jan, 10 = Nov)
const START_DATE = new Date(2026, 10, 25, 0, 0, 0); // Nov 25, 12:00 AM

const TOTAL_GIFTS = 24;

// 24 Gifts Setup
const gifts = Array.from({ length: TOTAL_GIFTS }, (_, i) => ({
  id: i + 1,
  title: `Surprise #${i + 1}`,
  content: `This is your special message/gift for surprise #${i + 1}!`
}));

// -------------------------------------------------------------
// STATE MANAGEMENT
// -------------------------------------------------------------
function getOpenedGifts() {
  return JSON.parse(localStorage.getItem('openedGifts')) || [];
}

// Calculates how many total gifts he is allowed to open right now
function getEarnedCredits() {
  const now = new Date();
  
  // If birthday hasn't started yet
  if (now < START_DATE) return 0;

  // Calculate elapsed hours since 12:00 AM Nov 25
  const diffInMs = now - START_DATE;
  const elapsedHours = Math.floor(diffInMs / (1000 * 60 * 60)) + 1; // +1 for hour 0

  // Cap the earned credits at max gifts (24)
  return Math.min(elapsedHours, TOTAL_GIFTS);
}

// -------------------------------------------------------------
// UI RENDERING
// -------------------------------------------------------------
function initGrid() {
  const grid = document.getElementById('gift-grid');
  grid.innerHTML = '';
  
  const opened = getOpenedGifts();
  const earnedCredits = getEarnedCredits();
  const availableToOpen = earnedCredits - opened.length;

  // Update status header
  updateStatusHeader(availableToOpen);

  gifts.forEach(gift => {
    const card = document.createElement('div');
    const isOpened = opened.includes(gift.id);

    card.className = `card ${isOpened ? 'opened' : ''}`;
    card.innerText = isOpened ? `🎁 #${gift.id} (Opened)` : `🎁 Gift #${gift.id}`;
    
    card.onclick = () => handleGiftClick(gift, availableToOpen);
    grid.appendChild(card);
  });
}

function handleGiftClick(gift, availableToOpen) {
  const opened = getOpenedGifts();

  // 1. If already opened, just let him re-read it anytime
  if (opened.includes(gift.id)) {
    showModal(gift.title, gift.content);
    return;
  }

  // 2. If no available credits left, block him
  if (availableToOpen <= 0) {
    const now = new Date();
    if (now < START_DATE) {
      alert("⏳ Patience! Your birthday gifts unlock starting November 25th at 12:00 AM.");
    } else {
      alert("⏳ You have used all your available gift unlocks! Wait for the next hour to unlock another one.");
    }
    return;
  }

  // 3. Open gift & save state
  opened.push(gift.id);
  localStorage.setItem('openedGifts', JSON.stringify(opened));

  showModal(gift.title, gift.content);
  initGrid(); // Refresh UI to update remaining credits
}

function updateStatusHeader(availableToOpen) {
  const banner = document.getElementById('cooldown-banner');
  const openedCount = getOpenedGifts().length;

  if (openedCount === TOTAL_GIFTS) {
    banner.innerText = "🎉 You've opened all 24 gifts! Happy Birthday!";
    banner.classList.remove('hidden');
    return;
  }

  if (availableToOpen > 0) {
    banner.innerText = `🔓 You have ${availableToOpen} gift unlock(s) ready right now! Pick any box.`;
    banner.classList.remove('hidden');
  } else {
    // Calculate time remaining until next hourly unlock
    const now = new Date();
    if (now < START_DATE) {
      banner.innerText = "🔒 Site locked until Nov 25!";
    } else {
      const nextUnlockMinutes = 60 - now.getMinutes();
      banner.innerText = `⏳ Next gift credit unlocks in ~${nextUnlockMinutes} minute(s).`;
    }
    banner.classList.remove('hidden');
  }
}

function showModal(title, content) {
  document.getElementById('gift-title').innerText = title;
  document.getElementById('gift-body').innerText = content;
  document.getElementById('gift-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('gift-modal').classList.add('hidden');
}

// Refresh status automatically every minute
setInterval(initGrid, 60000);

// Initialize page load
initGrid();