let startTime = null;
let timerInterval = null;
let fastingPlan = 16; // Default to 16:8
let isAnalog = false;
const digitalTimer = document.getElementById('digital-timer');
const analogTimer = document.getElementById('analog-timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const planSelect = document.getElementById('plan');
const achievementsList = document.getElementById('achievements-list');
const historyChartCtx = document.getElementById('history-chart').getContext('2d');
const themeToggle = document.getElementById('theme-toggle');
const timerTypeSelect = document.getElementById('timer-type');

let fastingHistory = JSON.parse(localStorage.getItem('fastingHistory')) || [];
renderHistory();
updateAchievements();

planSelect.addEventListener('change', () => {
  fastingPlan = parseInt(planSelect.value);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

timerTypeSelect.addEventListener('change', () => {
  isAnalog = timerTypeSelect.value === 'analog';
  digitalTimer.style.display = isAnalog ? 'none' : 'block';
  analogTimer.style.display = isAnalog ? 'block' : 'none';
});

function formatTime(duration) {
  const hrs = Math.floor(duration / 3600).toString().padStart(2, '0');
  const mins = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(duration % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateTimer() {
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000);
  if (isAnalog) {
    drawAnalogTimer(elapsed);
  } else {
    digitalTimer.textContent = formatTime(elapsed);
  }
}

function drawAnalogTimer(elapsed) {
  const ctx = analogTimer.getContext('2d');
  const radius = analogTimer.height / 2;
  ctx.clearRect(0, 0, analogTimer.width, analogTimer.height);
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 10;
  ctx.stroke();

  const endAngle = (elapsed / (fastingPlan * 3600)) * 2 * Math.PI;
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, -Math.PI / 2, endAngle - Math.PI / 2);
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 10;
  ctx.stroke();
}

startBtn.addEventListener('click', () => {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
  startBtn.disabled = true;
  stopBtn.disabled = false;
  scheduleNotification('Fasting Started', 'Your fasting period has begun.');
  scheduleNotification('Fasting Complete', 'Your fasting period has ended.', fastingPlan * 60 * 60 * 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  fastingHistory.push({
    start: startTime.toLocaleString(),
    end: endTime.toLocaleString(),
    duration: duration
  });
  localStorage.setItem('fastingHistory', JSON.stringify(fastingHistory));
  renderHistory();
  updateAchievements();
  digitalTimer.textContent = '00:00:00';
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function renderHistory() {
  const labels = fastingHistory.map((session, index) => `Session ${index + 1}`);
  const data = fastingHistory.map(session => session.duration / 3600); // Convert to hours

  new Chart(historyChartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Fasting Duration (hrs)',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function updateAchievements() {
  achievementsList.innerHTML = '';
  const totalHours = fastingHistory.reduce((sum, session) => sum + session.duration, 0) / 3600;
  const longestFast = Math.max(...fastingHistory.map(session => session.duration), 0) / 3600;

  const achievements = [];

  if (totalHours >= 50) achievements.push('🏆 Total Fasting Time: 50+ hours');
  if (longestFast >= 24) achievements.push('🥇 Longest Fast: 24+ hours');
  if (fastingHistory.length >= 10) achievements.push('🎯 Completed 10 Fasts');

  achievements.forEach(achievement => {
    const li = document.createElement('li');
    li.textContent = achievement;
    achievementsList.appendChild(li);
  });
}

function scheduleNotification(title, body, delay = 0) {
  if (Notification.permission === 'granted') {
    setTimeout(() => {
      new Notification(title, { body });
    }, delay);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        setTimeout(() => {
          new Notification(title, { body });
        }, delay);
      }
    });
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
``
::contentReference[oaicite:15]{index=15}
 
