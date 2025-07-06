let startTime = null;
let timerInterval = null;
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const historyList = document.getElementById('history-list');

// Load history from localStorage
let fastingHistory = JSON.parse(localStorage.getItem('fastingHistory')) || [];
renderHistory();

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
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  fastingHistory.push({
    start: startTime.toLocaleString(),
    end: endTime.toLocaleString(),
    duration: formatTime(duration)
  });
  localStorage.setItem('fastingHistory', JSON.stringify(fastingHistory));
  renderHistory();
  timerDisplay.textContent = '00:00:00';
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function renderHistory() {
  historyList.innerHTML = '';
  fastingHistory.forEach((session, index) => {
    const li = document.createElement('li');
    li.textContent = `Session ${index + 1}: ${session.start} - ${session.end} | Duration: ${session.duration}`;
    historyList.appendChild(li);
  });
}
