const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
const rows = canvas.width / box;
const cols = canvas.height / box;
let snake, direction, food, score, gameOver, interval;
let speed = parseInt(document.getElementById('difficulty').value, 10);

function init() {
    snake = [{x: 9, y: 9}];
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
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols)
    };
    // 食物不能出现在蛇身上
    while (snake.some(s => s.x === food.x && s.y === food.y)) {
        food.x = Math.floor(Math.random() * rows);
        food.y = Math.floor(Math.random() * cols);
    }
}

function draw() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 画蛇
    for (let i = 0; i < snake.length; i++) {
        let x = snake[i].x * box + box / 2;
        let y = snake[i].y * box + box / 2;
        // 蛇头
        if (i === 0) {
            // 渐变圆头
            let grad = ctx.createRadialGradient(x, y, box/6, x, y, box/2);
            grad.addColorStop(0, '#a8ff78');
            grad.addColorStop(1, '#4caf50');
            ctx.beginPath();
            ctx.arc(x, y, box/2-2, 0, Math.PI*2);
            ctx.fillStyle = grad;
            ctx.fill();
            // 眼睛
            ctx.beginPath();
            let eyeOffset = box/5;
            ctx.arc(x-eyeOffset, y-eyeOffset, box/10, 0, Math.PI*2);
            ctx.arc(x+eyeOffset, y-eyeOffset, box/10, 0, Math.PI*2);
            ctx.fillStyle = '#222';
            ctx.fill();
        } else {
            // 身体圆角方块+渐变
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

    // 画食物（果冻圆+高光）
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
    // 高光
    ctx.beginPath();
    ctx.arc(fx-box/6, fy-box/6, box/8, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    // 移动蛇
    let head = {x: snake[0].x, y: snake[0].y};
    if (direction === 'LEFT') head.x--;
    if (direction === 'RIGHT') head.x++;
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;

    // 撞墙或撞自己
    if (
        head.x < 0 || head.x >= rows ||
        head.y < 0 || head.y >= cols ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        clearInterval(interval);
        gameOver = true;
        document.getElementById('restart').style.display = 'inline-block';
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('游戏结束', 100, 200);
        return;
    }

    snake.unshift(head);

    // 吃到食物
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
    speed = parseInt(document.getElementById('difficulty').value, 10);
    init();
};

document.getElementById('difficulty').onchange = function() {
    speed = parseInt(this.value, 10);
    init();
};

init();
