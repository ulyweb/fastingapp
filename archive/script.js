let startTime = null;
let timerInterval = null;
let fastingPlan = 16; // Default to 16:8
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const planSelect = document.getElementById('plan');
const achievementsList = document.getElementById('achievements-list');
const historyChartCtx = document.getElementById('history-chart').getContext('2d');

// Load history from localStorage
let fastingHistory = JSON.parse(localStorage.getItem('fastingHistory')) || [];
renderHistory();
updateAchievements();

planSelect.addEventListener('change', () => {
  fastingPlan = parseInt(planSelect.value);
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
  timerDisplay.textContent = formatTime(elapsed);
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
  timerDisplay.textContent = '00:00:00';
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
