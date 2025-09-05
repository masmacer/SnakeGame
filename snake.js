
// 先获取 canvas 和 ctx
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
// 全局变量
let box = 20, rows = 20, cols = 20;
let snake, direction, food, score, gameOver, interval, speed;

// 触摸滑动手势支持（移动端方向控制）
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}, {passive: true});
canvas.addEventListener('touchend', function(e) {
    if (gameOver) return;
    if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
            if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
            if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
        } else if (Math.abs(dy) > 20) {
            if (dy > 0 && direction !== 'UP') direction = 'DOWN';
            if (dy < 0 && direction !== 'DOWN') direction = 'UP';
        }
    }
}, {passive: true});

function updateGrid() {
    box = Math.floor(Math.min(canvas.width, canvas.height) / 20);
    cols = Math.floor(canvas.width / box);
    rows = Math.floor(canvas.height / box);
}

function init() {
    speed = parseInt(document.getElementById('difficulty').value, 10);
    updateGrid();
    snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    direction = 'RIGHT';
    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = '分数：' + score;
    document.getElementById('restart').style.display = 'none';
    placeFood();
    clearInterval(interval);
    interval = setInterval(draw, speed);
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
    };
    while (snake.some(s => s.x === food.x && s.y === food.y)) {
        food.x = Math.floor(Math.random() * cols);
        food.y = Math.floor(Math.random() * rows);
    }
}

function draw() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        let x = snake[i].x * box + box / 2;
        let y = snake[i].y * box + box / 2;
        if (i === 0) {
            let grad = ctx.createRadialGradient(x, y, box/6, x, y, box/2);
            grad.addColorStop(0, '#a8ff78');
            grad.addColorStop(1, '#4caf50');
            ctx.beginPath();
            ctx.arc(x, y, box/2-2, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.beginPath();
            let eyeOffset = box/5;
            ctx.arc(x-eyeOffset, y-eyeOffset, box/10, 0, Math.PI*2);
            ctx.arc(x+eyeOffset, y-eyeOffset, box/10, 0, Math.PI*2);
            ctx.fillStyle = '#222';
            ctx.fill();
        } else {
            let grad = ctx.createLinearGradient(x-box/2, y-box/2, x+box/2, y+box/2);
            grad.addColorStop(0, '#8bc34a');
            grad.addColorStop(1, '#388e3c');
            ctx.beginPath();
            ctx.moveTo(x-box/2+4, y-box/2);
            ctx.lineTo(x+box/2-4, y-box/2);
            ctx.quadraticCurveTo(x+box/2, y-box/2, x+box/2, y-box/2+4);
            ctx.lineTo(x+box/2, y+box/2-4);
            ctx.quadraticCurveTo(x+box/2, y+box/2, x+box/2-4, y+box/2);
            ctx.lineTo(x-box/2+4, y+box/2);
            ctx.quadraticCurveTo(x-box/2, y+box/2, x-box/2, y+box/2-4);
            ctx.lineTo(x-box/2, y-box/2+4);
            ctx.quadraticCurveTo(x-box/2, y-box/2, x-box/2+4, y-box/2);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }
    let fx = food.x * box + box / 2;
    let fy = food.y * box + box / 2;
    let foodGrad = ctx.createRadialGradient(fx, fy, box/8, fx, fy, box/2);
    foodGrad.addColorStop(0, '#fff3e0');
    foodGrad.addColorStop(0.5, '#ff9800');
    foodGrad.addColorStop(1, '#ff5722');
    ctx.beginPath();
    ctx.arc(fx, fy, box/2-2, 0, Math.PI*2);
    ctx.fillStyle = foodGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx-box/6, fy-box/6, box/8, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    let head = {x: snake[0].x, y: snake[0].y};
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;
    if (
        head.x < 0 || head.x >= cols ||
        head.y < 0 || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        clearInterval(interval);
        gameOver = true;
        document.getElementById('restart').style.display = 'inline-block';
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('游戏结束', canvas.width/2-80, canvas.height/2);
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = '分数：' + score;
        placeFood();
    } else {
        snake.pop();
    }
}

document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

document.getElementById('restart').onclick = function() {
    init();
};

document.getElementById('difficulty').onchange = function() {
    init();
};

window.addEventListener('resize', function() {
    setTimeout(init, 100);
});

init();
