/* ===================================================
   PLANTS VS ZOMBIES - Fixed Game Engine
   =================================================== */

const COLS = 9;
const ROWS = 5;
let CELL_W, CELL_H, GRID_TOP, GRID_LEFT;

const PLANT_DATA = {
    sunflower:  { name: 'Hoa Hướng Dương', cost: 50,  hp: 300,  sunInterval: 7000, cooldown: 7500,  sprite: 'sunflower' },
    peashooter: { name: 'Đậu Bắn',         cost: 100, hp: 300,  damage: 20, shootInterval: 1500, cooldown: 7500,  sprite: 'peashooter' },
    wallnut:    { name: 'Quả Hồ Đào',      cost: 50,  hp: 4000, cooldown: 30000, sprite: 'wallnut' },
    snowpea:    { name: 'Đậu Tuyết',        cost: 175, hp: 300,  damage: 20, shootInterval: 1500, freeze: true, cooldown: 7500, sprite: 'snowpea' },
    cherrybomb: { name: 'Bom Anh Đào',      cost: 150, hp: 999,  damage: 1800, aoeRadius: 1, delay: 1500, cooldown: 50000, sprite: 'cherrybomb', oneTime: true },
    repeater:   { name: 'Đậu Đôi',         cost: 200, hp: 300,  damage: 20, shootInterval: 1500, shots: 2, cooldown: 7500, sprite: 'repeater' },
    potatomine: { name: 'Mìn Khoai Tây',   cost: 25,  hp: 100,  damage: 1800, delay: 14000, cooldown: 30000, sprite: 'potatomine', oneTime: true }
};

const ZOMBIE_TYPES = {
    basic:    { name: 'Zombie',           hp: 270,  speed: 28, damage: 20, points: 100, sprite: 'basic',    w: 55, h: 85 },
    cone:     { name: 'Zombie Mũ Chóp',  hp: 640,  speed: 28, damage: 20, points: 200, sprite: 'cone',     w: 55, h: 95 },
    bucket:   { name: 'Zombie Xô',       hp: 1100, speed: 28, damage: 20, points: 300, sprite: 'bucket',   w: 60, h: 100 },
    flag:     { name: 'Zombie Cờ',       hp: 270,  speed: 40, damage: 20, points: 100, sprite: 'flag',     w: 65, h: 90 },
    football: { name: 'Zombie Bóng Đá',  hp: 1600, speed: 50, damage: 30, points: 500, sprite: 'football', w: 70, h: 95 }
};

const WAVES = [
    [{ type:'basic',delay:5000 },{ type:'basic',delay:9000 },{ type:'basic',delay:13000 }],
    [{ type:'basic',delay:3000 },{ type:'cone',delay:6000 },{ type:'basic',delay:9000 },{ type:'flag',delay:1000 },{ type:'cone',delay:13000 },{ type:'basic',delay:16000 }],
    [{ type:'flag',delay:2000 },{ type:'cone',delay:4000 },{ type:'bucket',delay:7000 },{ type:'basic',delay:9000 },{ type:'flag',delay:1000 },{ type:'football',delay:13000 },{ type:'bucket',delay:16000 },{ type:'basic',delay:18000 }],
    [{ type:'flag',delay:1000 },{ type:'football',delay:3000 },{ type:'bucket',delay:5000 },{ type:'cone',delay:7000 },{ type:'football',delay:9000 },{ type:'flag',delay:1000 },{ type:'bucket',delay:12000 },{ type:'football',delay:15000 }],
    [{ type:'flag',delay:1000 },{ type:'football',delay:2000 },{ type:'football',delay:4000 },{ type:'bucket',delay:5000 },{ type:'bucket',delay:7000 },{ type:'flag',delay:1000 },{ type:'football',delay:9000 },{ type:'bucket',delay:11000 },{ type:'football',delay:13000 },{ type:'flag',delay:1000 },{ type:'football',delay:15000 },{ type:'bucket',delay:17000 }]
];

// ========== STATE ==========
let state = {
    running: false, paused: false, sun: 150, currentWave: 0, score: 0,
    selectedPlant: null, shovelMode: false,
    grid: [], zombies: [], projectiles: [], suns: [],
    cooldowns: {}, lastTime: 0,
    waveTimer: 0, waveZombieIndex: 0,
    zombiesKilled: 0,
    sunDropTimer: 5000,
    gameOver: false, gameWon: false
};

const $ = id => document.getElementById(id);

// ========== SCREEN ==========
const SCREENS = ['startScreen','instructScreen','gameScreen','pauseScreen','winScreen','loseScreen'];
function showScreen(id) {
    SCREENS.forEach(s => {
        const el = $(s);
        if (s === id) { el.style.display = 'flex'; el.classList.add('active'); }
        else { el.style.display = 'none'; el.classList.remove('active'); }
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    showScreen('startScreen');
    $('startBtn').onclick  = startGame;
    $('instructBtn').onclick = () => showScreen('instructScreen');
    $('backBtn').onclick   = () => showScreen('startScreen');
    $('pauseBtn').onclick  = togglePause;
    $('resumeBtn').onclick = togglePause;
    $('menuBtn').onclick   = () => { stopGame(); showScreen('startScreen'); };
    $('retryBtn').onclick  = () => { stopGame(); startGame(); };
    $('nextLevelBtn').onclick = () => { stopGame(); startGame(); };
    $('winMenuBtn').onclick  = () => { stopGame(); showScreen('startScreen'); };
    $('loseMenuBtn').onclick = () => { stopGame(); showScreen('startScreen'); };
    $('shovelBtn').onclick = toggleShovel;

    document.querySelectorAll('.card[data-plant]').forEach(card => {
        card.onclick = () => selectPlant(card.dataset.plant);
    });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && state.running) togglePause();
        if ((e.key === 's' || e.key === 'S') && state.running) toggleShovel();
    });
});

// ========== START GAME ==========
function startGame() {
    resetState();
    showScreen('gameScreen');

    // CRITICAL FIX: Wait for DOM to render before building grid
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            buildGrid();
            state.running = true;
            state.lastTime = 0;
            skyDropTimer = 5000;
            requestAnimationFrame(gameLoop);
        });
    });
}

function resetState() {
    state = {
        running: false, paused: false, sun: 150, currentWave: 0, score: 0,
        selectedPlant: null, shovelMode: false,
        grid: [], zombies: [], projectiles: [], suns: [],
        cooldowns: {}, lastTime: 0,
        waveTimer: 0, waveZombieIndex: 0,
        zombiesKilled: 0,
        sunDropTimer: 5000,
        gameOver: false, gameWon: false
    };
    $('lawn').innerHTML = '';
    $('zombiesLayer').innerHTML = '';
    $('projectilesLayer').innerHTML = '';
    $('sunsLayer').innerHTML = '';
    $('effectsLayer').innerHTML = '';
    updateSunDisplay();
    deselectAll();
    $('waveText').textContent = 'Làn 1 / 5';
    $('progressFill').style.width = '0%';
}

// ========== GRID ==========
function buildGrid() {
    const world = $('gameWorld');
    let worldH = world.clientHeight;
    let worldW = world.clientWidth;

    // Fallback if DOM hasn't rendered yet
    if (!worldH || worldH < 100) worldH = window.innerHeight - 115;
    if (!worldW || worldW < 100) worldW = window.innerWidth;

    GRID_LEFT = 85;   // left strip for home/danger indicator
    GRID_TOP  = 0;
    CELL_W = Math.floor((worldW - GRID_LEFT - 5) / COLS);
    CELL_H = Math.floor(worldH / ROWS);

    const lawn = $('lawn');
    lawn.innerHTML = '';
    state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    for (let r = 0; r < ROWS; r++) {
        // Left label strip
        const lbl = document.createElement('div');
        lbl.className = 'lane-label';
        lbl.style.cssText = `top:${r * CELL_H}px; height:${CELL_H}px; width:${GRID_LEFT}px;`;
        lbl.innerHTML = `<span>🏠</span>`;
        lawn.appendChild(lbl);

        // Lane row
        const lane = document.createElement('div');
        lane.className = 'lane' + (r % 2 === 0 ? ' lane-even' : ' lane-odd');
        lane.style.cssText = `top:${r * CELL_H}px; left:${GRID_LEFT}px; height:${CELL_H}px; width:${COLS * CELL_W}px;`;

        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width  = CELL_W + 'px';
            cell.style.height = CELL_H + 'px';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.title = `Hàng ${r+1} - Cột ${c+1}`;
            cell.addEventListener('click', () => onCellClick(r, c));
            lane.appendChild(cell);
        }
        lawn.appendChild(lane);
    }
}

function getCellDOM(r, c) {
    return $('lawn').querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

// ========== PLANT SELECTION ==========
function selectPlant(type) {
    if (!state.running || state.paused) return;
    const cd = state.cooldowns[type] || 0;
    if (cd > 0) return;
    if (state.sun < PLANT_DATA[type].cost) { flashNoSun(); return; }

    state.shovelMode = false;
    state.selectedPlant = type;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.card[data-plant="${type}"]`)?.classList.add('selected');
    $('shovelBtn').classList.remove('selected');

    const cur = $('plantCursor');
    cur.className = `plant-sprite ${type}`;
    cur.style.display = 'block';
    document.body.style.cursor = 'none';
}

function toggleShovel() {
    if (!state.running || state.paused) return;
    state.shovelMode = !state.shovelMode;
    state.selectedPlant = null;
    document.querySelectorAll('.card[data-plant]').forEach(c => c.classList.remove('selected'));
    if (state.shovelMode) {
        $('shovelBtn').classList.add('selected');
        $('shovelCursor').style.display = 'block';
        $('plantCursor').style.display = 'none';
        document.body.style.cursor = 'none';
    } else {
        deselectAll();
    }
}

function deselectAll() {
    state.selectedPlant = null;
    state.shovelMode = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    $('shovelCursor').style.display = 'none';
    $('plantCursor').style.display = 'none';
    document.body.style.cursor = '';
}

function onMouseMove(e) {
    if (state.shovelMode) {
        const s = $('shovelCursor');
        s.style.left = (e.clientX - 14) + 'px';
        s.style.top  = (e.clientY - 14) + 'px';
    }
    if (state.selectedPlant) {
        const p = $('plantCursor');
        p.style.left = (e.clientX - CELL_W/2) + 'px';
        p.style.top  = (e.clientY - CELL_H/2) + 'px';
    }
}

// ========== CELL CLICK ==========
function onCellClick(r, c) {
    if (!state.running || state.paused || state.gameOver || state.gameWon) return;

    if (state.shovelMode) {
        if (state.grid[r][c]) { removePlant(r, c); }
        return;
    }
    if (!state.selectedPlant) return;

    const type = state.selectedPlant;
    const data = PLANT_DATA[type];

    if (state.sun < data.cost) { flashNoSun(); return; }
    if (state.grid[r][c]) { showFloatingText('Ô đã có cây!', r, c); return; }
    if ((state.cooldowns[type] || 0) > 0) return;

    placePlant(r, c, type);
    spendSun(data.cost);
    state.cooldowns[type] = data.cooldown;
    deselectAll();
}

// ========== PLANT ==========
function placePlant(r, c, type) {
    const data = PLANT_DATA[type];
    const cell = getCellDOM(r, c);
    if (!cell) return;

    const wrap = document.createElement('div');
    wrap.className = 'plant-container';

    const sprite = document.createElement('div');
    sprite.className = `plant-sprite ${type}`;

    const hpBar = document.createElement('div');
    hpBar.className = 'plant-health-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'plant-health-fill';
    hpBar.appendChild(hpFill);

    wrap.appendChild(sprite);
    wrap.appendChild(hpBar);
    cell.appendChild(wrap);

    const plant = {
        type, r, c, hp: data.hp, maxHp: data.hp,
        timer: 0, primed: data.oneTime || false,
        primeTimer: data.delay || 0,
        el: wrap, sprite, hpFill
    };
    state.grid[r][c] = plant;
}

function removePlant(r, c) {
    const p = state.grid[r][c];
    if (!p) return;
    p.el.remove();
    state.grid[r][c] = null;
}

function damagePlant(r, c, dmg) {
    const p = state.grid[r][c];
    if (!p) return;
    p.hp -= dmg;
    const pct = Math.max(0, p.hp / p.maxHp * 100);
    p.hpFill.style.width = pct + '%';
    p.hpFill.style.background = pct > 50 ? '#00cc00' : pct > 25 ? '#ffaa00' : '#ff3300';
    if (p.hp <= 0) removePlant(r, c);
}

function updatePlant(plant, dt) {
    const data = PLANT_DATA[plant.type];
    plant.timer += dt;

    if (plant.type === 'sunflower') {
        if (plant.timer >= data.sunInterval) {
            plant.timer = 0;
            spawnSunAt(
                GRID_LEFT + plant.c * CELL_W + CELL_W / 2,
                GRID_TOP  + plant.r * CELL_H + CELL_H * 0.3
            );
        }
    }

    if (plant.type === 'peashooter' || plant.type === 'snowpea' || plant.type === 'repeater') {
        if (plant.timer >= data.shootInterval) {
            if (hasZombieInLane(plant.r, plant.c)) {
                plant.timer = 0;
                const shots = data.shots || 1;
                for (let s = 0; s < shots; s++) {
                    setTimeout(() => { if (state.grid[plant.r] && state.grid[plant.r][plant.c]) fireProjectile(plant); }, s * 180);
                }
            }
        }
    }

    if (plant.primed) {
        if (plant.type === 'cherrybomb') {
            plant.primeTimer -= dt;
            if (plant.primeTimer <= 0) triggerExplosion(plant);
        }
        if (plant.type === 'potatomine') {
            if (plant.primeTimer > 0) {
                plant.primeTimer -= dt;
                if (plant.primeTimer <= 0) plant.sprite.style.filter = 'brightness(2) sepia(1)';
            } else {
                const stomped = state.zombies.find(z =>
                    !z.dead && z.row === plant.r &&
                    Math.abs(zombieCenterX(z) - (GRID_LEFT + plant.c * CELL_W + CELL_W/2)) < CELL_W * 0.8
                );
                if (stomped) triggerExplosion(plant);
            }
        }
    }
}

function hasZombieInLane(row, plantCol) {
    return state.zombies.some(z => {
        if (z.dead || z.row !== row) return false;
        const zc = getZombieGridCol(z);
        return zc >= plantCol;
    });
}

function fireProjectile(plant) {
    const data = PLANT_DATA[plant.type];
    const px = GRID_LEFT + plant.c * CELL_W + CELL_W;
    const py = GRID_TOP  + plant.r * CELL_H + CELL_H * 0.38;

    const el = document.createElement('div');
    el.className = 'projectile pea' + (plant.type === 'snowpea' ? ' frozen' : '');
    el.style.cssText = `left:${px}px; top:${py}px;`;
    $('projectilesLayer').appendChild(el);

    state.projectiles.push({
        x: px, y: py, row: plant.r,
        speed: 380, damage: data.damage,
        frozen: plant.type === 'snowpea',
        el
    });
}

function triggerExplosion(plant) {
    const cx = GRID_LEFT + plant.c * CELL_W + CELL_W / 2;
    const cy = GRID_TOP  + plant.r * CELL_H + CELL_H / 2;
    const data = PLANT_DATA[plant.type];
    const radius = data.aoeRadius || 0;

    createExplosionFX(cx, cy, 180);

    state.zombies.forEach(z => {
        if (z.dead) return;
        const zc = getZombieGridCol(z);
        if (Math.abs(z.row - plant.r) <= radius && Math.abs(zc - plant.c) <= radius + 1) {
            damageZombie(z, data.damage);
        }
    });

    if (plant.type === 'cherrybomb') {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const nr = plant.r + dr, nc = plant.c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !(nr === plant.r && nc === plant.c)) {
                    removePlant(nr, nc);
                }
            }
        }
    }
    removePlant(plant.r, plant.c);
}

// ========== COOLDOWNS ==========
function updateCooldowns(dt) {
    document.querySelectorAll('.card[data-plant]').forEach(card => {
        const type = card.dataset.plant;
        const data = PLANT_DATA[type];
        let cd = state.cooldowns[type] || 0;
        if (cd > 0) {
            cd = Math.max(0, cd - dt);
            state.cooldowns[type] = cd;
            card.querySelector('.card-cooldown').style.height = (cd / data.cooldown * 100) + '%';
        } else {
            card.querySelector('.card-cooldown').style.height = '0';
        }
        if (state.sun < data.cost || cd > 0) card.classList.add('disabled');
        else card.classList.remove('disabled');
    });
}

// ========== SUN ==========
function spendSun(n) { state.sun -= n; updateSunDisplay(); }
function addSun(n)   { state.sun += n; updateSunDisplay(); }
function updateSunDisplay() { $('sunCount').textContent = state.sun; }
function flashNoSun() {
    const el = $('sunCounter');
    el.style.borderColor = '#ff0000';
    el.style.transform = 'scale(1.1)';
    setTimeout(() => { el.style.borderColor = '#ffaa00'; el.style.transform = ''; }, 400);
}

let skyDropTimer = 5000;
function updateSkyDrop(dt) {
    skyDropTimer -= dt;
    if (skyDropTimer <= 0) {
        const x = 90 + Math.random() * (window.innerWidth - 200);
        spawnSunAt(x, -44, true);
        skyDropTimer = 6000 + Math.random() * 5000;
    }
}

function spawnSunAt(x, y, falling = false) {
    const el = document.createElement('div');
    el.className = 'sun';
    el.style.left = (x - 22) + 'px';
    el.style.top  = (falling ? -44 : y) + 'px';
    $('sunsLayer').appendChild(el);

    const target = falling ? (80 + Math.random() * (window.innerHeight * 0.45)) : y + 30;
    const sunObj = { el, timer: 8000 };
    state.suns.push(sunObj);

    el.style.transition = `top ${falling ? 1400 : 600}ms ease-out`;
    requestAnimationFrame(() => { el.style.top = target + 'px'; });
    el.addEventListener('click', () => collectSun(sunObj));
}

function collectSun(s) {
    if (!s.el.parentNode) return;
    addSun(25);
    s.el.style.animation = 'sunCollect 0.25s ease-in forwards';
    setTimeout(() => s.el.remove(), 260);
    const i = state.suns.indexOf(s);
    if (i !== -1) state.suns.splice(i, 1);
}

function updateSuns(dt) {
    for (let i = state.suns.length - 1; i >= 0; i--) {
        const s = state.suns[i];
        s.timer -= dt;
        if (s.timer < 2000) s.el.style.opacity = (Math.sin(Date.now() / 120) * 0.4 + 0.6).toString();
        if (s.timer <= 0) { s.el.remove(); state.suns.splice(i, 1); }
    }
}

// ========== ZOMBIES ==========
function spawnZombie(type, row) {
    const data = ZOMBIE_TYPES[type];
    const startX = window.innerWidth + 20;
    const centY  = GRID_TOP + row * CELL_H + CELL_H / 2;
    const spriteY = centY - data.h / 2;

    const el = document.createElement('div');
    el.className = 'zombie';
    el.style.cssText = `left:${startX}px; top:${spriteY}px;`;

    const hpBar = document.createElement('div');
    hpBar.className = 'zombie-health-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'zombie-health-fill';
    hpBar.appendChild(hpFill);

    const sprite = document.createElement('div');
    sprite.className = `zombie-sprite ${data.sprite}`;
    sprite.style.width  = data.w + 'px';
    sprite.style.height = data.h + 'px';

    el.appendChild(hpBar);
    el.appendChild(sprite);
    $('zombiesLayer').appendChild(el);

    const zombie = {
        type, row, hp: data.hp, maxHp: data.hp,
        speed: data.speed,   // pixels per second
        damage: data.damage,
        x: startX, y: spriteY,
        w: data.w, h: data.h,
        el, sprite, hpFill,
        frozen: false, frozenTimer: 0,
        eating: false, eatTimer: 0,
        dead: false
    };
    state.zombies.push(zombie);
}

function zombieCenterX(z) { return z.x + z.w / 2; }

function getZombieGridCol(z) {
    const cx = zombieCenterX(z);
    if (cx < GRID_LEFT) return -1;
    return Math.floor((cx - GRID_LEFT) / CELL_W);
}

function updateZombie(z, dt) {
    if (z.dead) return;

    // Unfreeze
    if (z.frozen) {
        z.frozenTimer -= dt;
        if (z.frozenTimer <= 0) { z.frozen = false; z.el.classList.remove('frozen'); }
    }

    const speed = z.speed * (z.frozen ? 0.3 : 1) * (dt / 1000);

    // Determine which cell zombie center is in
    const zc = getZombieGridCol(z);

    // Check if there's a plant to eat in this column
    let eating = false;
    if (zc >= 0 && zc < COLS && state.grid[z.row] && state.grid[z.row][zc]) {
        eating = true;
        z.eating = true;
        z.eatTimer += dt;
        if (z.eatTimer >= 1000) {
            z.eatTimer = 0;
            damagePlant(z.row, zc, z.damage);
        }
        z.el.classList.add('eating');
    } else {
        // Check next col to the left too (zombie might be mid-transition)
        const zcLeft = zc - 1;
        if (zcLeft >= 0 && zc < COLS && state.grid[z.row] && state.grid[z.row][zc < 0 ? 0 : zc]) {
            // noop
        }
        z.eating = false;
        z.eatTimer = 0;
        z.el.classList.remove('eating');

        // Move left
        z.x -= speed;
        z.el.style.left = z.x + 'px';

        // Potato mine check
        if (zc >= 0 && zc < COLS && state.grid[z.row] && state.grid[z.row][zc]) {
            const p = state.grid[z.row][zc];
            if (p && p.type === 'potatomine' && p.primeTimer <= 0) triggerExplosion(p);
        }
    }

    // Game over if zombie crosses house
    if (z.x + z.w < GRID_LEFT - 10) {
        state.gameOver = true;
    }

    // HP bar
    z.hpFill.style.width = Math.max(0, z.hp / z.maxHp * 100) + '%';
}

function damageZombie(z, dmg, freeze = false) {
    if (z.dead) return;
    z.hp -= dmg;
    if (freeze && !z.frozen) {
        z.frozen = true;
        z.frozenTimer = 2500;
        z.el.classList.add('frozen');
        createFreezeFX(z.x + z.w/2, z.y + z.h/2);
    }
    // Floating damage number
    const fx = document.createElement('div');
    fx.className = 'damage-text';
    fx.textContent = '-' + dmg;
    fx.style.cssText = `left:${z.x + z.w/2}px; top:${z.y}px;`;
    $('effectsLayer').appendChild(fx);
    setTimeout(() => fx.remove(), 700);

    if (z.hp <= 0) killZombie(z);
}

function killZombie(z) {
    if (z.dead) return;
    z.dead = true;
    z.el.style.animation = 'zombieDeath 0.7s ease-out forwards';
    setTimeout(() => z.el.remove(), 700);
    state.score += ZOMBIE_TYPES[z.type].points;
    state.zombiesKilled++;
    const i = state.zombies.indexOf(z);
    if (i !== -1) state.zombies.splice(i, 1);
    createExplosionFX(z.x + z.w/2, z.y + z.h/2, 55);
}

// ========== PROJECTILES ==========
function updateProjectile(proj, dt) {
    proj.x += proj.speed * (dt / 1000);
    proj.el.style.left = proj.x + 'px';

    // Hit detection: projectile hits zombie if their x-ranges overlap
    const hit = state.zombies.find(z =>
        !z.dead && z.row === proj.row &&
        proj.x + 10 >= z.x &&
        proj.x <= z.x + z.w
    );
    if (hit) {
        damageZombie(hit, proj.damage, proj.frozen);
        proj.el.remove();
        return true;
    }
    if (proj.x > window.innerWidth + 60) { proj.el.remove(); return true; }
    return false;
}

// ========== WAVES ==========
function updateWave(dt) {
    const wave = WAVES[state.currentWave];
    if (!wave) return;

    state.waveTimer += dt;

    while (state.waveZombieIndex < wave.length) {
        const entry = wave[state.waveZombieIndex];
        if (state.waveTimer >= entry.delay) {
            const row = Math.floor(Math.random() * ROWS);
            spawnZombie(entry.type, row);
            state.waveZombieIndex++;
        } else break;
    }

    // Wave done?
    if (state.waveZombieIndex >= wave.length && state.zombies.length === 0) {
        if (state.currentWave < WAVES.length - 1) {
            state.currentWave++;
            state.waveTimer = 0;
            state.waveZombieIndex = 0;
            state.zombiesKilled = 0;
            showWaveBanner(state.currentWave + 1);
        } else {
            state.gameWon = true;
        }
    }

    // Progress bar
    const total = wave.length;
    const done  = Math.min(state.waveZombieIndex, total);
    const pct   = total > 0 ? (done / total * 100) : 100;
    $('progressFill').style.width = Math.min(100, pct) + '%';
    $('waveText').textContent = `Làn ${state.currentWave + 1} / ${WAVES.length}`;
}

function showWaveBanner(n) {
    const el = document.createElement('div');
    el.style.cssText = `
        position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
        font-size:42px; font-weight:900; color:#ffdd00;
        text-shadow:3px 3px 8px black, 0 0 30px orange;
        animation:waveBanner 2.5s ease-out forwards;
        pointer-events:none; z-index:9999;
    `;
    el.textContent = `🌊 LÀNSÓNG ${n} BẮT ĐẦU! 🌊`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
}

function showFloatingText(text, r, c) {
    const el = document.createElement('div');
    el.className = 'damage-text';
    el.style.color = '#ffdd00';
    el.style.fontSize = '16px';
    el.textContent = text;
    const x = GRID_LEFT + c * CELL_W + CELL_W / 2;
    const y = GRID_TOP  + r * CELL_H;
    el.style.cssText = `left:${x}px; top:${y}px; position:absolute; z-index:200;`;
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// ========== EFFECTS ==========
function createExplosionFX(x, y, size) {
    const el = document.createElement('div');
    el.className = 'explosion';
    el.style.cssText = `width:${size}px; height:${size}px; left:${x - size/2}px; top:${y - size/2}px;`;
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 550);
}

function createFreezeFX(x, y) {
    const el = document.createElement('div');
    el.className = 'freeze-effect';
    el.style.cssText = `width:80px; height:80px; left:${x-40}px; top:${y-40}px;`;
    $('effectsLayer').appendChild(el);
    setTimeout(() => el.remove(), 500);
}

// ========== PAUSE ==========
function togglePause() {
    state.paused = !state.paused;
    if (state.paused) {
        $('pauseScreen').style.display = 'flex';
        $('pauseBtn').textContent = '▶';
    } else {
        $('pauseScreen').style.display = 'none';
        $('pauseBtn').textContent = '⏸';
        state.lastTime = 0;
        requestAnimationFrame(gameLoop);
    }
}

function stopGame() {
    state.running = false;
    state.paused = false;
    ['pauseScreen','winScreen','loseScreen'].forEach(id => $(id).style.display = 'none');
    deselectAll();
}

// ========== GAME LOOP ==========
function gameLoop(ts) {
    if (!state.running || state.paused) return;
    if (!state.lastTime) state.lastTime = ts;
    const dt = Math.min(ts - state.lastTime, 80);
    state.lastTime = ts;

    updateSkyDrop(dt);
    updateSuns(dt);
    updateCooldowns(dt);

    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
            if (state.grid[r] && state.grid[r][c]) updatePlant(state.grid[r][c], dt);

    state.projectiles = state.projectiles.filter(p => !updateProjectile(p, dt));

    [...state.zombies].filter(z => !z.dead).forEach(z => updateZombie(z, dt));
    state.zombies = state.zombies.filter(z => !z.dead);

    updateWave(dt);

    if (state.gameOver)  { triggerLose(); return; }
    if (state.gameWon)   { triggerWin();  return; }

    requestAnimationFrame(gameLoop);
}

function triggerLose() {
    state.running = false;
    setTimeout(() => { $('loseScreen').style.display = 'flex'; }, 600);
}
function triggerWin() {
    state.running = false;
    setTimeout(() => { $('winScreen').style.display = 'flex'; }, 400);
}

window.addEventListener('resize', () => {
    if (state.running && !state.paused) {
        const saved = state.grid.map(row => row.map(p => p ? p.type : null));
        $('lawn').innerHTML = '';
        buildGrid();
        saved.forEach((row, r) => row.forEach((type, c) => { if (type) placePlant(r, c, type); }));
    }
});
