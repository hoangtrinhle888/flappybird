/* ===================================================
   PLANTS VS ZOMBIES - Full Game Engine
   =================================================== */

const COLS = 9;
const ROWS = 5;
let CELL_W, CELL_H, GRID_TOP, GRID_LEFT;

/* ---------- PLANT DEFINITIONS ---------- */
const PLANT_DATA = {
    sunflower: {
        name: 'Hoa Hướng Dương', cost: 50, hp: 300,
        sunInterval: 7000, sunAmount: 25,
        cooldown: 7500, sprite: 'sunflower'
    },
    peashooter: {
        name: 'Đậu Bắn', cost: 100, hp: 300,
        damage: 20, shootInterval: 1500,
        cooldown: 7500, sprite: 'peashooter'
    },
    wallnut: {
        name: 'Quả Hồ Đào', cost: 50, hp: 4000,
        cooldown: 30000, sprite: 'wallnut'
    },
    snowpea: {
        name: 'Đậu Tuyết', cost: 175, hp: 300,
        damage: 20, shootInterval: 1500,
        freeze: true, cooldown: 7500, sprite: 'snowpea'
    },
    cherrybomb: {
        name: 'Bom Anh Đào', cost: 150, hp: 999,
        damage: 1800, aoeRadius: 1, delay: 1500,
        cooldown: 50000, sprite: 'cherrybomb', oneTime: true
    },
    repeater: {
        name: 'Đậu Đôi', cost: 200, hp: 300,
        damage: 20, shootInterval: 1500, shots: 2,
        cooldown: 7500, sprite: 'repeater'
    },
    potatomine: {
        name: 'Mìn Khoai Tây', cost: 25, hp: 100,
        damage: 1800, aoeRadius: 0, delay: 14000,
        cooldown: 30000, sprite: 'potatomine', oneTime: true
    }
};

/* ---------- ZOMBIE DEFINITIONS ---------- */
const ZOMBIE_TYPES = {
    basic:    { name: 'Zombie', hp: 270,    speed: 0.5,  damage: 20, points: 100, sprite: 'basic' },
    cone:     { name: 'Zombie Mũ Chóp', hp: 640, speed: 0.5, damage: 20, points: 200, sprite: 'cone' },
    bucket:   { name: 'Zombie Xô', hp: 1100, speed: 0.5,  damage: 20, points: 300, sprite: 'bucket' },
    flag:     { name: 'Zombie Cờ', hp: 270,   speed: 0.7,  damage: 20, points: 100, sprite: 'flag', wave: true },
    football: { name: 'Zombie Bóng Đá', hp: 1600, speed: 0.9, damage: 30, points: 500, sprite: 'football' }
};

/* ---------- WAVE DEFINITIONS ---------- */
const WAVES = [
    // Level 1
    [
        { type: 'basic', delay: 5000 },
        { type: 'basic', delay: 8000 },
        { type: 'basic', delay: 11000 }
    ],
    // Level 2
    [
        { type: 'basic', delay: 3000 },
        { type: 'basic', delay: 5000 },
        { type: 'cone',  delay: 7000 },
        { type: 'basic', delay: 9000 },
        { type: 'flag',  delay: 1000 },
        { type: 'cone',  delay: 12000 },
        { type: 'basic', delay: 14000 }
    ],
    // Level 3
    [
        { type: 'flag',     delay: 2000 },
        { type: 'basic',    delay: 3000 },
        { type: 'cone',     delay: 4000 },
        { type: 'bucket',   delay: 6000 },
        { type: 'basic',    delay: 8000 },
        { type: 'cone',     delay: 9000 },
        { type: 'flag',     delay: 1000 },
        { type: 'football', delay: 12000 },
        { type: 'bucket',   delay: 14000 },
        { type: 'basic',    delay: 15000 }
    ],
    // Level 4 - Huge wave
    [
        { type: 'flag',     delay: 1000 },
        { type: 'football', delay: 2000 },
        { type: 'bucket',   delay: 3000 },
        { type: 'cone',     delay: 4000 },
        { type: 'basic',    delay: 5000 },
        { type: 'football', delay: 6000 },
        { type: 'flag',     delay: 1000 },
        { type: 'bucket',   delay: 8000 },
        { type: 'cone',     delay: 9000 },
        { type: 'basic',    delay: 10000 },
        { type: 'football', delay: 12000 },
        { type: 'bucket',   delay: 13000 }
    ],
    // Level 5 - Final boss wave
    [
        { type: 'flag',     delay: 1000 },
        { type: 'football', delay: 2000 },
        { type: 'football', delay: 3000 },
        { type: 'bucket',   delay: 4000 },
        { type: 'bucket',   delay: 5000 },
        { type: 'cone',     delay: 6000 },
        { type: 'flag',     delay: 1000 },
        { type: 'football', delay: 8000 },
        { type: 'bucket',   delay: 9000 },
        { type: 'cone',     delay: 10000 },
        { type: 'basic',    delay: 11000 },
        { type: 'football', delay: 12000 },
        { type: 'flag',     delay: 1000 },
        { type: 'football', delay: 14000 },
        { type: 'bucket',   delay: 15000 }
    ]
];

/* ========== STATE ========== */
let state = {
    running: false,
    paused: false,
    sun: 150,
    currentWave: 0,
    score: 0,
    selectedPlant: null,
    shovelMode: false,
    grid: [],           // grid[row][col] = plant object or null
    zombies: [],
    projectiles: [],
    suns: [],
    timers: [],
    cooldowns: {},      // plantType -> timeRemaining
    lastTime: 0,
    waveTimer: 0,
    waveZombieIndex: 0,
    waveComplete: false,
    totalZombiesInWave: 0,
    zombiesSpawned: 0,
    zombiesKilled: 0,
    sunDropTimer: 3000,
    gameOver: false,
    gameWon: false
};

/* ========== DOM REFS ========== */
const $ = id => document.getElementById(id);
const screens = {
    start:   $('startScreen'),
    instruct: $('instructScreen'),
    game:    $('gameScreen'),
    pause:   $('pauseScreen'),
    win:     $('winScreen'),
    lose:    $('loseScreen')
};

/* ========== SCREEN MANAGEMENT ========== */
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

/* ========== INIT UI ========== */
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start');
    setupButtons();
    preloadImages();
});

function setupButtons() {
    $('startBtn').onclick = startGame;
    $('instructBtn').onclick = () => showScreen('instruct');
    $('backBtn').onclick = () => showScreen('start');
    $('pauseBtn').onclick = togglePause;
    $('resumeBtn').onclick = togglePause;
    $('menuBtn').onclick = () => { stopGame(); showScreen('start'); };
    $('retryBtn').onclick = () => { stopGame(); startGame(); };
    $('nextLevelBtn').onclick = () => { stopGame(); startGame(); };
    $('winMenuBtn').onclick = () => { stopGame(); showScreen('start'); };
    $('loseMenuBtn').onclick = () => { stopGame(); showScreen('start'); };
    $('shovelBtn').onclick = toggleShovel;

    document.querySelectorAll('.card[data-plant]').forEach(card => {
        card.onclick = () => selectPlant(card.dataset.plant);
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && state.running) togglePause();
        if (e.key === 's' || e.key === 'S') toggleShovel();
    });
}

/* ========== PRELOAD IMAGES ========== */
function preloadImages() {
    const images = [
        'assets/sunflower.png', 'assets/peashooter.png', 'assets/wallnut.png',
        'assets/snowpea.png', 'assets/cherrybomb.png', 'assets/repeater.png',
        'assets/potatomine.png', 'assets/zombie_basic.png', 'assets/zombie_cone.png',
        'assets/zombie_bucket.png', 'assets/zombie_flag.png', 'assets/zombie_football.png'
    ];
    images.forEach(src => { const img = new Image(); img.src = src; });
}

/* ========== START GAME ========== */
function startGame() {
    resetState();
    buildGrid();
    showScreen('game');
    state.running = true;
    requestAnimationFrame(gameLoop);
    setupSkyDrop();
}

function resetState() {
    state = {
        ...state,
        running: false,
        paused: false,
        sun: 150,
        currentWave: 0,
        score: 0,
        selectedPlant: null,
        shovelMode: false,
        grid: [],
        zombies: [],
        projectiles: [],
        suns: [],
        timers: [],
        cooldowns: {},
        lastTime: 0,
        waveTimer: 0,
        waveZombieIndex: 0,
        waveComplete: false,
        totalZombiesInWave: 0,
        zombiesSpawned: 0,
        zombiesKilled: 0,
        sunDropTimer: 3000,
        gameOver: false,
        gameWon: false
    };

    // Clear DOM layers
    $('lawn').innerHTML = '';
    $('zombiesLayer').innerHTML = '';
    $('projectilesLayer').innerHTML = '';
    $('sunsLayer').innerHTML = '';
    $('effectsLayer').innerHTML = '';

    updateSunDisplay();
    deselectPlant();
    updateWaveDisplay();
}

/* ========== GRID ========== */
function buildGrid() {
    const lawn = $('lawn');
    const worldH = lawn.parentElement.clientHeight;
    const worldW = lawn.parentElement.clientWidth;

    const gridAreaW = worldW - 60; // leave space left for danger zone
    CELL_W = Math.floor(gridAreaW / COLS);
    CELL_H = Math.floor(worldH / ROWS);
    GRID_LEFT = 60;
    GRID_TOP = 0;

    lawn.innerHTML = '';
    state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    for (let r = 0; r < ROWS; r++) {
        const lane = document.createElement('div');
        lane.className = 'lane';
        lane.style.top = (GRID_TOP + r * CELL_H) + 'px';
        lane.style.height = CELL_H + 'px';
        lane.style.left = GRID_LEFT + 'px';
        lane.style.width = (COLS * CELL_W) + 'px';

        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = CELL_W + 'px';
            cell.style.height = CELL_H + 'px';

            // Alternating shading
            if ((r + c) % 2 === 0) {
                cell.style.background = 'rgba(0, 60, 0, 0.08)';
            } else {
                cell.style.background = 'rgba(0, 80, 0, 0.04)';
            }

            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = () => onCellClick(r, c);
            lane.appendChild(cell);
        }
        lawn.appendChild(lane);
    }
}

function getCellDOM(r, c) {
    return document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

/* ========== PLANT MANAGEMENT ========== */
function selectPlant(type) {
    if (state.cooldowns[type] > 0) return;
    if (state.shovelMode) { state.shovelMode = false; $('shovelBtn').classList.remove('selected'); }
    state.selectedPlant = type;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.card[data-plant="${type}"]`)?.classList.add('selected');
    updateCursorForPlant(type);
}

function deselectPlant() {
    state.selectedPlant = null;
    state.shovelMode = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    $('shovelBtn').classList.remove('selected');
    hideCursor();
}

function toggleShovel() {
    state.shovelMode = !state.shovelMode;
    state.selectedPlant = null;
    document.querySelectorAll('.card[data-plant]').forEach(c => c.classList.remove('selected'));
    if (state.shovelMode) {
        $('shovelBtn').classList.add('selected');
        document.body.style.cursor = 'none';
        $('shovelCursor').classList.remove('hidden');
        $('plantCursor').classList.add('hidden');
    } else {
        $('shovelBtn').classList.remove('selected');
        hideCursor();
    }
}

function hideCursor() {
    document.body.style.cursor = '';
    $('shovelCursor').classList.add('hidden');
    $('plantCursor').classList.add('hidden');
}

function updateCursorForPlant(type) {
    const cursor = $('plantCursor');
    cursor.className = `plant-sprite ${type}`;
    cursor.classList.remove('hidden');
    document.body.style.cursor = 'none';
    $('shovelCursor').classList.add('hidden');
}

function onMouseMove(e) {
    if (state.shovelMode) {
        $('shovelCursor').style.left = e.clientX + 'px';
        $('shovelCursor').style.top = e.clientY + 'px';
    }
    if (state.selectedPlant) {
        $('plantCursor').style.left = e.clientX + 'px';
        $('plantCursor').style.top = e.clientY + 'px';
    }
}

function onCellClick(r, c) {
    if (!state.running || state.paused || state.gameOver || state.gameWon) return;

    if (state.shovelMode) {
        if (state.grid[r][c]) removePlant(r, c);
        return;
    }

    if (!state.selectedPlant) return;

    const type = state.selectedPlant;
    const data = PLANT_DATA[type];

    if (state.sun < data.cost) {
        showNotEnoughSun();
        return;
    }
    if (state.grid[r][c]) return; // occupied
    if (state.cooldowns[type] > 0) return;

    placePlant(r, c, type);
    spendSun(data.cost);
    startCooldown(type);
    deselectPlant();
}

function placePlant(r, c, type) {
    const data = PLANT_DATA[type];
    const cell = getCellDOM(r, c);

    const plant = {
        type, r, c,
        hp: data.hp, maxHp: data.hp,
        timer: 0,
        primed: type === 'cherrybomb' || type === 'potatomine',
        primeTimer: data.delay || 0,
        el: null
    };

    // Create DOM element
    const container = document.createElement('div');
    container.className = 'plant-container';
    const sprite = document.createElement('div');
    sprite.className = `plant-sprite ${type}`;
    const healthBar = document.createElement('div');
    healthBar.className = 'plant-health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'plant-health-fill';
    healthBar.appendChild(healthFill);
    container.appendChild(sprite);
    container.appendChild(healthBar);
    cell.appendChild(container);

    plant.el = container;
    plant.healthFill = healthFill;
    plant.sprite = sprite;

    state.grid[r][c] = plant;
}

function removePlant(r, c) {
    const plant = state.grid[r][c];
    if (!plant) return;
    plant.el?.remove();
    state.grid[r][c] = null;
}

function damagePlant(r, c, dmg) {
    const plant = state.grid[r][c];
    if (!plant) return;
    plant.hp -= dmg;
    const pct = Math.max(0, plant.hp / plant.maxHp * 100);
    plant.healthFill.style.width = pct + '%';
    if (pct < 50) plant.healthFill.style.background = '#ffaa00';
    if (pct < 25) plant.healthFill.style.background = '#ff4444';
    if (plant.hp <= 0) removePlant(r, c);
}

function updatePlant(plant, dt) {
    const data = PLANT_DATA[plant.type];
    plant.timer += dt;

    if (plant.type === 'sunflower') {
        if (plant.timer >= data.sunInterval) {
            plant.timer = 0;
            spawnSunFromPlant(plant);
        }
    }

    if (plant.type === 'peashooter' || plant.type === 'snowpea' || plant.type === 'repeater') {
        if (plant.timer >= data.shootInterval) {
            // Check if any zombie in lane
            if (hasZombieInLane(plant.r, plant.c)) {
                plant.timer = 0;
                const shots = data.shots || 1;
                for (let s = 0; s < shots; s++) {
                    setTimeout(() => fireProjectile(plant), s * 200);
                }
            }
        }
    }

    if ((plant.type === 'cherrybomb' || plant.type === 'potatomine') && plant.primed) {
        if (plant.type === 'potatomine') {
            // Mine activates when zombie enters cell
            const zombiesNearby = state.zombies.filter(z =>
                z.row === plant.r &&
                getZombieCol(z) <= plant.c &&
                getZombieCol(z) >= plant.c - 1
            );
            if (zombiesNearby.length > 0 && plant.primeTimer <= 0) {
                triggerExplosion(plant);
            }
            if (plant.primeTimer > 0) {
                plant.primeTimer -= dt;
                // Visual: show primed state
                if (plant.primeTimer <= 0) {
                    plant.sprite.style.filter = 'brightness(1.5)';
                }
            }
        } else { // cherrybomb
            plant.primeTimer -= dt;
            if (plant.primeTimer <= 0) {
                triggerExplosion(plant);
            }
        }
    }
}

function hasZombieInLane(row, col) {
    return state.zombies.some(z => z.row === row && getZombieCol(z) >= col);
}

function getZombieCol(z) {
    return Math.floor((z.x - GRID_LEFT) / CELL_W);
}

function fireProjectile(plant) {
    const data = PLANT_DATA[plant.type];
    const startX = GRID_LEFT + (plant.c + 1) * CELL_W;
    const startY = GRID_TOP + plant.r * CELL_H + CELL_H * 0.4;

    const proj = {
        x: startX, y: startY,
        speed: 350,
        damage: data.damage,
        row: plant.r,
        frozen: plant.type === 'snowpea',
        el: null,
        id: Date.now() + Math.random()
    };

    const el = document.createElement('div');
    el.className = 'projectile pea' + (plant.type === 'snowpea' ? ' frozen' : '');
    el.style.left = proj.x + 'px';
    el.style.top = proj.y + 'px';
    $('projectilesLayer').appendChild(el);
    proj.el = el;
    state.projectiles.push(proj);
}

function triggerExplosion(plant) {
    const cx = GRID_LEFT + plant.c * CELL_W + CELL_W / 2;
    const cy = GRID_TOP + plant.r * CELL_H + CELL_H / 2;
    const data = PLANT_DATA[plant.type];
    const radius = data.aoeRadius;

    // Visual explosion
    createExplosion(cx, cy, 200);

    // Damage zombies in radius
    state.zombies.forEach(z => {
        const zr = z.row;
        const zc = getZombieCol(z);
        if (Math.abs(zr - plant.r) <= radius && Math.abs(zc - plant.c) <= radius) {
            damageZombie(z, data.damage);
        }
    });

    // Damage plants in radius (cherry bomb destroys nearby plants too)
    if (plant.type === 'cherrybomb') {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const nr = plant.r + dr;
                const nc = plant.c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    if (state.grid[nr][nc] && !(nr === plant.r && nc === plant.c)) {
                        removePlant(nr, nc);
                    }
                }
            }
        }
    }

    removePlant(plant.r, plant.c);
}

/* ========== COOLDOWNS ========== */
function startCooldown(type) {
    const data = PLANT_DATA[type];
    state.cooldowns[type] = data.cooldown;
}

function updateCooldowns(dt) {
    document.querySelectorAll('.card[data-plant]').forEach(card => {
        const type = card.dataset.plant;
        const data = PLANT_DATA[type];
        const cooldown = state.cooldowns[type] || 0;

        if (cooldown > 0) {
            state.cooldowns[type] = Math.max(0, cooldown - dt);
            const pct = (state.cooldowns[type] / data.cooldown) * 100;
            card.querySelector('.card-cooldown').style.height = pct + '%';
            card.classList.add('on-cooldown');
        } else {
            card.querySelector('.card-cooldown').style.height = '0%';
            card.classList.remove('on-cooldown');
        }

        // Disable if not enough sun
        if (state.sun < data.cost || cooldown > 0) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    });
}

/* ========== SUN ========== */
function spendSun(amount) {
    state.sun -= amount;
    updateSunDisplay();
}

function addSun(amount) {
    state.sun += amount;
    updateSunDisplay();
}

function updateSunDisplay() {
    $('sunCount').textContent = state.sun;
}

function spawnSkyDrop() {
    const x = 80 + Math.random() * (window.innerWidth - 200);
    const targetY = 100 + Math.random() * (window.innerHeight * 0.5);
    const sun = createSunElement(x, 0, targetY);
    sun.style.top = '0px';
    sun.classList.add('falling');
    sun.style.setProperty('--target-y', targetY + 'px');
}

function spawnSunFromPlant(plant) {
    const cx = GRID_LEFT + plant.c * CELL_W + CELL_W / 2;
    const cy = GRID_TOP + plant.r * CELL_H + CELL_H * 0.3;
    const targetY = cy + 30 + Math.random() * 50;
    createSunElement(cx, cy, targetY);
}

function createSunElement(x, startY, targetY) {
    const el = document.createElement('div');
    el.className = 'sun';
    el.style.left = (x - 22) + 'px';
    el.style.top = startY + 'px';
    $('sunsLayer').appendChild(el);

    const sunObj = { el, x, y: startY, targetY, falling: true, timer: 7000 };
    state.suns.push(sunObj);

    const animDuration = 1200;
    el.style.transition = `top ${animDuration}ms ease-out`;
    requestAnimationFrame(() => {
        el.style.top = targetY + 'px';
    });

    el.addEventListener('click', () => collectSun(sunObj));
    return el;
}

function collectSun(sunObj) {
    if (!sunObj.el.parentNode) return;
    addSun(25);
    sunObj.el.classList.add('sun-collect');
    setTimeout(() => sunObj.el?.remove(), 300);
    const i = state.suns.indexOf(sunObj);
    if (i !== -1) state.suns.splice(i, 1);

    // Visual feedback
    showSunCollectText(parseInt(sunObj.el.style.left), parseInt(sunObj.el.style.top));
}

function showSunCollectText(x, y) {
    const el = document.createElement('div');
    el.className = 'damage-text';
    el.style.color = '#ffdd00';
    el.textContent = '+25☀';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function updateSuns(dt) {
    state.suns.forEach(s => {
        s.timer -= dt;
        if (s.timer <= 2000) {
            // Blink warning
            s.el.style.opacity = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        }
        if (s.timer <= 0) {
            s.el?.remove();
            const i = state.suns.indexOf(s);
            if (i !== -1) state.suns.splice(i, 1);
        }
    });
}

function setupSkyDrop() {
    // Handled in updateSkyDrop in game loop
}

let skyDropTimer = 5000;
function updateSkyDrop(dt) {
    skyDropTimer -= dt;
    if (skyDropTimer <= 0) {
        spawnSkyDrop();
        skyDropTimer = 7000 + Math.random() * 5000;
    }
}

/* ========== ZOMBIES ========== */
function spawnZombie(type, row) {
    const data = ZOMBIE_TYPES[type];
    const x = window.innerWidth + 10;
    const y = GRID_TOP + row * CELL_H + CELL_H * 0.1;

    const el = document.createElement('div');
    el.className = 'zombie';

    const sprite = document.createElement('div');
    sprite.className = `zombie-sprite ${data.sprite}`;
    const healthBar = document.createElement('div');
    healthBar.className = 'zombie-health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'zombie-health-fill';
    healthBar.appendChild(healthFill);
    el.appendChild(healthBar);
    el.appendChild(sprite);

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    $('zombiesLayer').appendChild(el);

    const zombie = {
        type, row,
        hp: data.hp, maxHp: data.hp,
        speed: data.speed,
        damage: data.damage,
        x, y,
        el, sprite, healthFill,
        frozen: false, frozenTimer: 0,
        eating: false, eatTimer: 0,
        dead: false,
        id: Date.now() + Math.random()
    };

    state.zombies.push(zombie);
    state.totalZombiesInWave++;
    state.zombiesSpawned++;
}

function updateZombie(z, dt) {
    if (z.dead) return;

    // Unfreeze
    if (z.frozen) {
        z.frozenTimer -= dt;
        if (z.frozenTimer <= 0) {
            z.frozen = false;
            z.el.classList.remove('frozen');
        }
    }

    const speedMult = z.frozen ? 0.35 : 1;
    const effectiveSpeed = z.speed * speedMult;

    // Find the target col for this zombie
    const zc = getZombieCol(z);

    // Check if zombie is eating a plant
    let targetPlant = null;
    if (zc >= 0 && zc < COLS && z.row >= 0 && z.row < ROWS) {
        if (state.grid[z.row][zc]) {
            targetPlant = state.grid[z.row][zc];
        }
    }

    if (targetPlant) {
        z.eating = true;
        z.el.classList.add('eating');
        z.eatTimer += dt;
        if (z.eatTimer >= 1000) {
            z.eatTimer = 0;
            damagePlant(targetPlant.r, targetPlant.c, z.damage);
        }
    } else {
        z.eating = false;
        z.el.classList.remove('eating');
        // Move left
        z.x -= effectiveSpeed * (dt / 16);
        z.el.style.left = z.x + 'px';

        // Potato mine check
        if (zc >= 0 && zc < COLS && state.grid[z.row] && state.grid[z.row][zc]) {
            const p = state.grid[z.row][zc];
            if (p && p.type === 'potatomine' && p.primeTimer <= 0) {
                triggerExplosion(p);
            }
        }
    }

    // Check if zombie reached danger zone
    if (z.x < 20) {
        state.gameOver = true;
    }

    // Update health bar
    const pct = Math.max(0, z.hp / z.maxHp * 100);
    z.healthFill.style.width = pct + '%';
}

function damageZombie(z, dmg, frozen = false) {
    if (z.dead) return;
    z.hp -= dmg;

    // Freeze effect
    if (frozen && !z.frozen) {
        z.frozen = true;
        z.frozenTimer = 2000;
        z.el.classList.add('frozen');
        createFreezeEffect(z.x, z.y);
    }

    // Damage text
    const el = document.createElement('div');
    el.className = 'damage-text';
    el.textContent = '-' + dmg;
    el.style.left = z.x + 'px';
    el.style.top = (z.y - 10) + 'px';
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 800);

    if (z.hp <= 0) {
        killZombie(z);
    }
}

function killZombie(z) {
    if (z.dead) return;
    z.dead = true;

    // Death animation
    z.el.style.animation = 'deathFade 0.8s ease-out forwards';
    setTimeout(() => z.el?.remove(), 800);

    state.score += ZOMBIE_TYPES[z.type].points;
    state.zombiesKilled++;

    const i = state.zombies.indexOf(z);
    if (i !== -1) state.zombies.splice(i, 1);

    // Death effect
    createExplosion(z.x + 30, z.y + 50, 60);
}

function createFreezeEffect(x, y) {
    const el = document.createElement('div');
    el.className = 'freeze-effect';
    el.style.width = '80px'; el.style.height = '80px';
    el.style.left = (x - 20) + 'px';
    el.style.top = (y + 10) + 'px';
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 600);
}

/* ========== PROJECTILES ========== */
function updateProjectile(proj, dt) {
    proj.x += proj.speed * (dt / 1000);
    proj.el.style.left = proj.x + 'px';

    // Check collision with zombies in same row
    const hit = state.zombies.find(z =>
        !z.dead &&
        z.row === proj.row &&
        Math.abs(z.x - proj.x) < 40
    );

    if (hit) {
        damageZombie(hit, proj.damage, proj.frozen);
        proj.el?.remove();
        return true; // mark for removal
    }

    // Off screen
    if (proj.x > window.innerWidth + 50) {
        proj.el?.remove();
        return true;
    }

    return false;
}

/* ========== WAVES ========== */
function updateWave(dt) {
    const wave = WAVES[state.currentWave];
    if (!wave) return;

    state.waveTimer += dt;

    // Spawn zombies
    while (state.waveZombieIndex < wave.length) {
        const entry = wave[state.waveZombieIndex];
        if (state.waveTimer >= entry.delay) {
            const row = Math.floor(Math.random() * ROWS);
            spawnZombie(entry.type, row);
            state.waveZombieIndex++;
        } else break;
    }

    // Wave complete?
    if (state.waveZombieIndex >= wave.length && state.zombies.length === 0) {
        state.waveComplete = true;
        if (state.currentWave < WAVES.length - 1) {
            state.currentWave++;
            state.waveZombieIndex = 0;
            state.waveTimer = 0;
            state.waveComplete = false;
            state.zombiesSpawned = 0;
            state.zombiesKilled = 0;
            showWaveMessage(state.currentWave + 1);
        } else {
            // All waves cleared!
            state.gameWon = true;
        }
    }

    // Update progress
    updateWaveDisplay();
}

function updateWaveDisplay() {
    $('waveText').textContent = `Làn ${state.currentWave + 1} / ${WAVES.length}`;
    const wave = WAVES[state.currentWave];
    const total = wave ? wave.length : 1;
    const spawned = Math.min(state.waveZombieIndex, total);
    const killed = state.zombiesKilled;
    const pct = wave ? ((spawned - state.zombies.length) / total * 100) : 100;
    $('progressFill').style.width = Math.min(100, Math.max(0, pct)) + '%';
}

function showWaveMessage(waveNum) {
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.fontSize = '40px';
    el.style.color = '#ffdd00';
    el.style.textShadow = '3px 3px 6px black';
    el.textContent = `🌊 LÀNSÓNG ${waveNum} BẮT ĐẦU! 🌊`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

/* ========== EFFECTS ========== */
function createExplosion(x, y, size) {
    const el = document.createElement('div');
    el.className = 'explosion';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = (x - size / 2) + 'px';
    el.style.top = (y - size / 2) + 'px';
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function showNotEnoughSun() {
    const counter = $('sunCounter');
    counter.style.animation = 'none';
    counter.style.border = '2px solid red';
    setTimeout(() => { counter.style.border = '2px solid #ffaa00'; }, 500);
}

/* ========== PAUSE ========== */
function togglePause() {
    state.paused = !state.paused;
    if (state.paused) {
        $('pauseScreen').classList.add('active');
        $('pauseBtn').textContent = '▶';
    } else {
        $('pauseScreen').classList.remove('active');
        $('pauseBtn').textContent = '⏸';
        state.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function stopGame() {
    state.running = false;
    state.paused = false;
    $('pauseScreen').classList.remove('active');
    $('winScreen').classList.remove('active');
    $('loseScreen').classList.remove('active');
    hideCursor();
}

/* ========== MAIN GAME LOOP ========== */
function gameLoop(timestamp) {
    if (!state.running || state.paused) return;

    if (state.lastTime === 0) state.lastTime = timestamp;
    const dt = Math.min(timestamp - state.lastTime, 100); // cap at 100ms
    state.lastTime = timestamp;

    // Update sky drops
    updateSkyDrop(dt);

    // Update suns
    updateSuns(dt);

    // Update cooldowns
    updateCooldowns(dt);

    // Update plants
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (state.grid[r][c]) updatePlant(state.grid[r][c], dt);
        }
    }

    // Update projectiles
    state.projectiles = state.projectiles.filter(p => !updateProjectile(p, dt));

    // Update zombies
    state.zombies.filter(z => !z.dead).forEach(z => updateZombie(z, dt));
    state.zombies = state.zombies.filter(z => !z.dead || z.el?.parentNode);

    // Update waves
    updateWave(dt);

    // Check game over
    if (state.gameOver) {
        triggerGameOver();
        return;
    }
    if (state.gameWon) {
        triggerGameWin();
        return;
    }

    requestAnimationFrame(gameLoop);
}

function triggerGameOver() {
    state.running = false;
    // Animate zombies reaching home
    setTimeout(() => {
        $('loseScreen').classList.add('active');
    }, 800);
}

function triggerGameWin() {
    state.running = false;
    setTimeout(() => {
        $('winScreen').classList.add('active');
    }, 500);
}

/* ========== WINDOW RESIZE ========== */
window.addEventListener('resize', () => {
    if (state.running) {
        // Rebuild grid maintaining plants
        const savedGrid = state.grid.map(row => row.map(p => p ? p.type : null));
        $('lawn').innerHTML = '';
        buildGrid();
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (savedGrid[r]?.[c]) {
                    placePlant(r, c, savedGrid[r][c]);
                }
            }
        }
    }
});
