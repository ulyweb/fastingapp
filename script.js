let fastingHours = 16;
let startTime = null;
let timerInterval = null;
let isAnalog = false;
let fastingHistory = JSON.parse(localStorage.getItem('fastingHistory')) || [];

const digitalTimer = document.getElementById('digital-timer');
const analogTimer = document.getElementById('analog-timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const planCards = document.querySelectorAll('.plan-card');
const achievementsList = document.getElementById('achievements-list');
const historyChartCtx = document.getElementById('history-chart').getContext('2d');
const themeToggle = document.getElementById('theme-toggle');
const timerTypeSelect = document.getElementById('timer-type');

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Timer type toggle
timerTypeSelect.addEventListener('change', () => {
  isAnalog = timerTypeSelect.value === 'analog';
  digitalTimer.style.display = isAnalog ? 'none' : 'block';
  analogTimer.style.display = isAnalog ? 'block' : 'none';
});

// Plan card selection
planCards.forEach(card => {
  card.addEventListener('click', () => {
    planCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    fastingHours = parseInt(card.dataset.hours);
    startBtn.textContent = `Start ${fastingHours}-Hour Fast`;
  });
});

// Start fasting
startBtn.addEventListener('click', () => {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
  startBtn.disabled = true;
  stopBtn.disabled = false;
  scheduleNotification('Fasting Started', 'Your fasting has begun.');
  scheduleNotification('Fasting Complete', 'Time to break your fast!', fastingHours * 3600000);
});

// Stop fasting
stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  fastingHistory.push({
    start: startTime.toLocaleString(),
    end: endTime.toLocaleString(),
    duration
  });
  localStorage.setItem('fastingHistory', JSON.stringify(fastingHistory));
  renderHistory();
  updateAchievements();
  digitalTimer.textContent = '00:00:00';
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// Timer update
function updateTimer() {
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000);
  isAnalog ? drawAnalogTimer(elapsed) : digitalTimer.textContent = formatTime(elapsed);
}

// Format seconds into HH:MM:SS
function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

// Draw analog timer circle
function drawAnalogTimer(elapsed) {
  const ctx = analogTimer.getContext('2d');
  const radius = analogTimer.width / 2;
  const progress = elapsed / (fastingHours * 3600);
  ctx.clearRect(0, 0, analogTimer.width, analogTimer.height);

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, -Math.PI / 2, (2 * Math.PI * progress) - Math.PI / 2);
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 8;
  ctx.stroke();
}

// Render chart
function renderHistory() {
  const labels = fastingHistory.map((_, i) => `Session ${i + 1}`);
  const durations = fastingHistory.map(s => +(s.duration / 3600).toFixed(2));

  new Chart(historyChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Hours Fasted',
        data: durations,
        backgroundColor: 'rgba(88, 166, 255, 0.6)',
        borderColor: '#58a6ff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Show achievements
function updateAchievements() {
  achievementsList.innerHTML = '';
  const totalHours = fastingHistory.reduce((sum, s) => sum + s.duration, 0) / 3600;
  const longest = Math.max(...fastingHistory.map(s => s.duration), 0) / 3600;

  const achievements = [];
  if (fastingHistory.length >= 5) achievements.push("🎯 Completed 5 Fasts");
  if (totalHours >= 50) achievements.push("🏆 50 Total Hours Fasted");
  if (longest >= 24) achievements.push("🔥 Longest Fast: 24+ hours");
  if (fastingHistory.length >= 10) achievements.push("🥇 10 Fasts Completed");

  achievements.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    achievementsList.appendChild(li);
  });
}

// Notifications
function scheduleNotification(title, body, delay = 0) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    setTimeout(() => new Notification(title, { body }), delay);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        setTimeout(() => new Notification(title, { body }), delay);
      }
    });
  }
}

// Init
renderHistory();
updateAchievements();

// PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker Registered'))
    .catch(err => console.error('SW Error:', err));
}
