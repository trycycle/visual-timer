const visualTimer = {
  // --- Configuration ---
  DEFAULT_MINUTES: 3,
  MAX_MINUTES: 999,
  ACTIVE_TILE_CLASS: 'lime',

  // --- State ---
  totalSeconds: 0,
  timeLeft: 0,
  timerId: null,

  // --- Cached DOM Elements ---
  elements: {
    timer: document.getElementById('timer'),
    tilesContainer: document.getElementById('tiles-container'),
    uiContainer: document.querySelector('.ui-container'),
    startButton: document.getElementById('start'),
    stopButton: document.getElementById('stop'),
    resetButton: document.getElementById('reset'),
    minutesInput: document.getElementById('minutes-input'),
    setTimeButton: document.getElementById('set-time'),
    toggleButton: document.getElementById('toggle-button'),
    menu: document.getElementById('menu'),
  },

  // --- Core Functions ---
  init() {
    this.totalSeconds = this.DEFAULT_MINUTES * 60;
    this.elements.minutesInput.value = this.DEFAULT_MINUTES;
    this.addEventListeners();
    this.createTiles();
    this.resetTimer();
  },

  getFactors(num) {
    const factors = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push({ w: num / i, h: i });
        if (i * i !== num) {
          factors.push({ w: i, h: num / i });
        }
      }
    }
    return factors;
  },

  calculateLayout() {
    const factors = this.getFactors(this.totalSeconds);
    if (factors.length === 0) return { w: this.totalSeconds, h: 1 };

    const windowRatio = window.innerWidth / window.innerHeight;
    let bestLayout = factors[0];
    let minRatioDiff = Math.abs(bestLayout.w / bestLayout.h - windowRatio);

    for (let i = 1; i < factors.length; i++) {
      const ratioDiff = Math.abs(factors[i].w / factors[i].h - windowRatio);
      if (ratioDiff < minRatioDiff) {
        minRatioDiff = ratioDiff;
        bestLayout = factors[i];
      }
    }
    return bestLayout;
  },

  resizeAndLayout() {
    if (this.totalSeconds === 0) return;

    const vh = window.innerHeight;
    this.elements.tilesContainer.style.height = `${vh}px`;
    this.elements.uiContainer.style.height = `${vh}px`;

    const layout = this.calculateLayout();
    this.elements.tilesContainer.style.gridTemplateColumns = `repeat(${layout.w}, 1fr)`;
    this.elements.tilesContainer.style.gridTemplateRows = `repeat(${layout.h}, 1fr)`;
  },

  createTiles() {
    const container = this.elements.tilesContainer;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < this.totalSeconds; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      fragment.appendChild(tile);
    }
    container.appendChild(fragment);
  },

  // --- UI Update Functions ---
  updateDigitalClock() {
    const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
    const seconds = (this.timeLeft % 60).toString().padStart(2, '0');
    this.elements.timer.textContent = `${minutes}:${seconds}`;
  },

  updateTiles() {
    const tiles = this.elements.tilesContainer.children;
    if (this.timeLeft < this.totalSeconds) {
      if (tiles[this.timeLeft]) {
        tiles[this.timeLeft].classList.remove(this.ACTIVE_TILE_CLASS);
      }
    } else if (this.timeLeft === this.totalSeconds) {
      for (const tile of tiles) {
        tile.classList.add(this.ACTIVE_TILE_CLASS);
      }
    }
  },

  // --- Timer Control Functions ---
  startTimer() {
    if (this.timeLeft <= 0) return;
    this.elements.menu.classList.remove('show');
    this.setControlsState(false);

    this.timerId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDigitalClock();
        this.updateTiles();
      }
      if (this.timeLeft === 0) {
        clearInterval(this.timerId);
        alert('Time is up!!');
        this.resetTimer(false);
      }
    }, 1000);
  },

  stopTimer() {
    clearInterval(this.timerId);
    this.setControlsState(true);
  },

  resetTimer(enableControls = true) {
    clearInterval(this.timerId);
    this.timeLeft = this.totalSeconds;
    this.updateDigitalClock();
    this.updateTiles();
    this.resizeAndLayout();
    if (enableControls) {
      this.setControlsState(true);
    }
  },

  setNewTime() {
    const minutes = parseInt(this.elements.minutesInput.value, 10);
    if (this.elements.minutesInput.value && minutes > 0 && minutes <= this.MAX_MINUTES) {
      this.totalSeconds = minutes * 60;
      this.createTiles();
      this.resetTimer();
    } else if (!this.elements.minutesInput.value) {
      // Do nothing
    } else {
      alert(`1から${this.MAX_MINUTES}までの分数を入力してください。`);
      this.elements.minutesInput.value = this.totalSeconds / 60;
    }
  },
  
  setControlsState(enabled) {
      this.elements.startButton.disabled = !enabled;
      this.elements.stopButton.disabled = enabled;
      this.elements.minutesInput.disabled = !enabled;
      this.elements.setTimeButton.disabled = !enabled;
  },

  // --- Event Listeners ---
  addEventListeners() {
    window.addEventListener('resize', () => this.resizeAndLayout());
    this.elements.startButton.addEventListener('click', () => this.startTimer());
    this.elements.stopButton.addEventListener('click', () => this.stopTimer());
    this.elements.resetButton.addEventListener('click', () => this.resetTimer());
    this.elements.setTimeButton.addEventListener('click', () => this.setNewTime());
    this.elements.toggleButton.addEventListener('click', () => {
      this.elements.menu.classList.toggle('show');
    });
  },
};

// --- App Initialization ---
visualTimer.init();