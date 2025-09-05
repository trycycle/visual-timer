let TOTAL_SECONDS = 180;
let timerId;
let timeLeft = TOTAL_SECONDS;

const timerElement = document.getElementById('timer');
const tilesContainer = document.getElementById('tiles-container');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const minutesInput = document.getElementById('minutes-input');
const setTimeButton = document.getElementById('set-time');
const toggleButton = document.getElementById('toggle-button');
const menu = document.getElementById('menu');

function getFactors(num) {
    const factors = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            factors.push({w: num / i, h: i});
            if (i * i !== num) {
                factors.push({w: i, h: num / i});
            }
        }
    }
    return factors;
}

function calculateLayout() {
    const factors = getFactors(TOTAL_SECONDS);
    if (factors.length === 0) return {w: TOTAL_SECONDS, h: 1}; // Fallback for prime numbers

    const windowRatio = window.innerWidth / window.innerHeight;
    let bestLayout = factors[0];
    let minRatioDiff = Math.abs((bestLayout.w / bestLayout.h) - windowRatio);

    for (let i = 1; i < factors.length; i++) {
        const ratioDiff = Math.abs((factors[i].w / factors[i].h) - windowRatio);
        if (ratioDiff < minRatioDiff) {
            minRatioDiff = ratioDiff;
            bestLayout = factors[i];
        }
    }
    return bestLayout;
}

function resizeTiles() {
    if (TOTAL_SECONDS === 0) return;

    const vh = window.innerHeight;
    tilesContainer.style.height = `${vh}px`;
    document.querySelector('.ui-container').style.height = `${vh}px`;

    const layout = calculateLayout();
    tilesContainer.style.gridTemplateColumns = `repeat(${layout.w}, 1fr)`;
    tilesContainer.style.gridTemplateRows = `repeat(${layout.h}, 1fr)`;

    // Remove individual tile styling
    const tiles = tilesContainer.children;
    for (const tile of tiles) {
        tile.style.width = '';
        tile.style.height = '';
    }
}

function createTiles() {
    tilesContainer.innerHTML = '';
    for (let i = 0; i < TOTAL_SECONDS; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tilesContainer.appendChild(tile);
    }
}

function updateDigitalClock() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  timerElement.textContent = `${minutes}:${seconds}`;
}

function updateTiles() {
    const tiles = tilesContainer.children;
    if (timeLeft < TOTAL_SECONDS) {
        if(tiles[timeLeft]) tiles[timeLeft].classList.remove('lime');
    }
    if (timeLeft === TOTAL_SECONDS) {
         for (const tile of tiles) {
            tile.classList.add('lime');
        }
    }
}

function startTimer() {
  if(timeLeft <= 0) return;
  menu.classList.remove('show');
  startButton.disabled = true;
  stopButton.disabled = false;
  minutesInput.disabled = true;
  setTimeButton.disabled = true;
  timerId = setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        updateDigitalClock();
        updateTiles();
    }
    if (timeLeft === 0) {
      clearInterval(timerId);
      alert('Time is up!!');
      resetTimer(false); // Keep disabled state
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  startButton.disabled = false;
  minutesInput.disabled = false;
  setTimeButton.disabled = false;
}

function resetTimer(enableControls = true) {
  clearInterval(timerId);
  timeLeft = TOTAL_SECONDS;
  updateDigitalClock();
  updateTiles();
  resizeTiles();
  if (enableControls) {
    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
    setTimeButton.disabled = false;
  }
}

function setNewTime() {
    const minutes = parseInt(minutesInput.value, 10);
    if (minutesInput.value && minutes > 0 && minutes <= 999) { // Add a reasonable limit
        TOTAL_SECONDS = minutes * 60;
        createTiles();
        resetTimer();
        //menu.classList.remove('show');
    } else if (!minutesInput.value) {
        // Do nothing if input is empty
    } else {
        alert("1から999までの分数を入力してください。");
        minutesInput.value = TOTAL_SECONDS / 60;
    }
}

// Initial setup
createTiles();
resetTimer();
resizeTiles();

window.addEventListener('resize', resizeTiles);
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', () => resetTimer());
setTimeButton.addEventListener('click', setNewTime);

toggleButton.addEventListener('click', () => {
    menu.classList.toggle('show');
});
