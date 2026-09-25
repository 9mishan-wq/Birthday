// -------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------
// SET DATE FOR TESTING RIGHT NOW: (Year, Month [0-11], Day, Hour, Min)
// Month is 0-indexed: 8 = September, 10 = November
const START_DATE = new Date(2026, 8, 25, 0, 0, 0); // Active for test right now

const TOTAL_GIFTS = 24;

// 24 Custom Gifts Setup
const gifts = Array.from({ length: TOTAL_GIFTS }, (_, i) => ({
  id: i + 1,
  title: `Surprise #${i + 1}`,
  content: `🎉 Happy Birthday! This is your special message for gift #${i + 1}!`
}));

// -------------------------------------------------------------
// STATE MANAGEMENT & AUTO-RESET FIX
// -------------------------------------------------------------
function getOpenedGifts() {
  const savedDate = localStorage.getItem('startDateUsed');
  
  // Auto-reset saved local data if you change the START_DATE in code
  if (savedDate !== START_DATE.toISOString()) {
    localStorage.removeItem('openedGifts');
    localStorage.setItem('startDateUsed', START_DATE.toISOString());
    return [];
  }
  
  return JSON.parse(localStorage.getItem('openedGifts')) || [];
}

function getEarnedCredits() {
  const now = new Date();
  
  // If date hasn't arrived yet
  if (now < START_DATE) return 0;

  // Calculate elapsed hours since START_DATE
  const diffInMs = now - START_DATE;
  const elapsedHours = Math.floor(diffInMs / (1000 * 60 * 60)) + 1;

  return Math.min(elapsedHours, TOTAL_GIFTS);
}

// -------------------------------------------------------------
// UI RENDERING
// -------------------------------------------------------------
function initGrid() {
  const grid = document.getElementById('gift-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const opened = getOpenedGifts();
  const earnedCredits = getEarnedCredits();
  const availableToOpen = earnedCredits - opened.length;

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

  // 1. If already opened, view anytime
  if (opened.includes(gift.id)) {
    showModal(gift.title, gift.content);
    return;
  }

  // 2. Block if no credits available
  if (availableToOpen <= 0) {
    const now = new Date();
    if (now < START_DATE) {
      alert("⏳ Patience! Your birthday gifts unlock starting November 25th.");
    } else {
      alert("⏳ You have used all available gift unlocks for this hour! Wait for the next hour to unlock another.");
    }
    return;
  }

  // 3. Open gift & save
  opened.push(gift.id);
  localStorage.setItem('openedGifts', JSON.stringify(opened));

  showModal(gift.title, gift.content);
  initGrid();
}

function updateStatusHeader(availableToOpen) {
  const banner = document.getElementById('cooldown-banner');
  if (!banner) return;
  
  const openedCount = getOpenedGifts().length;

  if (openedCount === TOTAL_GIFTS) {
    banner.innerText = "🎉 You've opened all 24 gifts! Happy Birthday!";
    banner.classList.remove('hidden');
    return;
  }

  if (availableToOpen > 0) {
    banner.innerText = `🔓 You have ${availableToOpen} gift unlock(s) available right now! Pick any box.`;
    banner.classList.remove('hidden');
  } else {
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

// Refresh status automatically
setInterval(initGrid, 30000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGrid);
