// Lấy canvas và ngữ cảnh vẽ
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Định nghĩa hằng số
const CANVAS_WIDTH = canvas.width = 400;
const CANVAS_HEIGHT = canvas.height = 600;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const GRAVITY = 0.1; // Giảm từ 0.5 xuống 0.3 để chim rơi chậm hơn
const FLAP = -3;
const PIPE_SPEED = 3;

// Tải hình ảnh
const birdImg = new Image();
birdImg.src = 'bird.png';
const topPipeImg = new Image();
topPipeImg.src = 'toppipe.png';
const botPipeImg = new Image();
botPipeImg.src = 'botpipe.png';
const baseImg = new Image();
baseImg.src = 'base.png';
const backgroundImg = new Image();
backgroundImg.src = 'background.png';

// Khởi tạo biến trò chơi
let bird = {
    x: 50,
    y: 150,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0
};
let pipes = [];
let score = 0;
let gameState = 'start';

// Thêm sự kiện lắng nghe
document.addEventListener('keydown', handleInput);
document.addEventListener('click', handleInput);

// Hàm xử lý đầu vào
function handleInput(event) {
    if (event.code === 'Space' || event.type === 'click') {
        if (gameState === 'start') {
            gameState = 'play';
        } else if (gameState === 'play') {
            bird.velocity = FLAP; // Chim bay lên
        } else if (gameState === 'end') {
            resetGame();
            gameState = 'play';
        }
    }
}

// Vòng lặp trò chơi
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// Hàm cập nhật logic
function update() {
    if (gameState === 'play') {
        // Cập nhật vị trí chim
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;

        // Di chuyển ống
        pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
        });

        // Tạo ống mới (khoảng cách xa hơn: từ 200 thành 300)
        if (pipes.length === 0 || pipes[pipes.length - 1].x < CANVAS_WIDTH - 300) {
            let topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
            pipes.push({
                x: CANVAS_WIDTH,
                topHeight: topHeight,
                bottomHeight: CANVAS_HEIGHT - topHeight - PIPE_GAP,
                scored: false
            });
        }

        // Xóa ống ra khỏi màn hình
        if (pipes[0] && pipes[0].x + PIPE_WIDTH < 0) {
            pipes.shift();
        }

        // Kiểm tra va chạm
        pipes.forEach(pipe => {
            if (
                bird.x + bird.width > pipe.x &&
                bird.x < pipe.x + PIPE_WIDTH &&
                (bird.y < pipe.topHeight || bird.y + bird.height > CANVAS_HEIGHT - pipe.bottomHeight)
            ) {
                gameState = 'end';
            }
        });
        if (bird.y + bird.height > CANVAS_HEIGHT) {
            gameState = 'end';
        }

        // Ghi điểm
        pipes.forEach(pipe => {
            if (!pipe.scored && bird.x > pipe.x + PIPE_WIDTH) {
                score++;
                pipe.scored = true;
            }
        });
    }
}

// Hàm vẽ giao diện
function draw() {
    // Xóa màn hình
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(backgroundImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState === 'play') {
        // Vẽ ống
        pipes.forEach(pipe => {
            ctx.drawImage(topPipeImg, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.drawImage(botPipeImg, pipe.x, CANVAS_HEIGHT - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
        });

        // Vẽ chim
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        // Vẽ điểm số
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
    } else if (gameState === 'start') {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Press Space or Click to Start', 50, 300);
    } else if (gameState === 'end') {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Game Over', 150, 250);
        ctx.fillText(`Score: ${score}`, 150, 300);
        ctx.fillText('Press Space or Click to Restart', 50, 350);
    }

    // Vẽ nền đất
    ctx.drawImage(baseImg, 0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);
}

// Hàm khởi động lại trò chơi
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
}