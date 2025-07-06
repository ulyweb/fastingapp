let fastingHours = 16;
let startTime = null;
let timerInterval = null;
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const achievementsList = document.getElementById('achievements-list');

let fastingHistory = JSON.parse(localStorage.getItem('fastingHistory')) || [];
updateAchievements();

// Plan selection logic
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    fastingHours = parseInt(card.dataset.hours);
    startBtn.innerText = `⚡ Start ${fastingHours}-Hour Fast`;
  });
});

startBtn.addEventListener('click', () => {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  fastingHistory.push({ start: startTime.toISOString(), end: endTime.toISOString(), duration });
  localStorage.setItem('fastingHistory', JSON.stringify(fastingHistory));
  updateAchievements();
  timerEl.innerText = '00:00:00';
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function updateTimer() {
  const elapsed = Math.floor((new Date() - startTime) / 1000);
  const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  timerEl.innerText = `${hrs}:${mins}:${secs}`;
}

function updateAchievements() {
  achievementsList.innerHTML = '';
  const totalHours = fastingHistory.reduce((sum, s) => sum + s.duration, 0) / 3600;
  const longest = Math.max(...fastingHistory.map(s => s.duration), 0) / 3600;

  const unlocks = [];
  if (totalHours >= 24) unlocks.push('🎉 24 Hours Fasted!');
  if (totalHours >= 100) unlocks.push('🏅 100 Total Hours Fasted!');
  if (longest >= 36) unlocks.push('🔥 36-Hour Fast Completed!');
  if (fastingHistory.length >= 5) unlocks.push('📆 5 Fasts Logged!');

  unlocks.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    achievementsList.appendChild(li);
  });
}
