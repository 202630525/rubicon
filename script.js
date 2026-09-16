const canvas = document.getElementById("aquarium");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const hungerEl = document.getElementById("hunger");

let score = 0;
let hunger = 100;
let foods = [];

// Fish Properties
const fish = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  speed: 2.5,
  dx: 0,
  dy: 0,
  facingLeft: false
};

// Spawn food when clicked inside canvas
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  foods.push({ x, y, radius: 5, speed: 1.2 });
});

// Hunger Timer (decreases every 2 seconds)
setInterval(() => {
  if (hunger > 0) {
    hunger = Math.max(0, hunger - 5);
    hungerEl.textContent = `${hunger}%`;
  }
}, 2000);

// Find nearest food
function getNearestFood() {
  if (foods.length === 0) return null;
  return foods.reduce((nearest, food) => {
    const distCurrent = Math.hypot(food.x - fish.x, food.y - fish.y);
    const distNearest = Math.hypot(nearest.x - fish.x, nearest.y - fish.y);
    return distCurrent < distNearest ? food : nearest;
  });
}

function update() {
  // Food falling animation
  foods.forEach((food, index) => {
    food.y += food.speed;
    // Remove food if it hits the bottom
    if (food.y > canvas.height) {
      foods.splice(index, 1);
    }
  });

  // Fish Movement Logic
  const target = getNearestFood();
  if (target) {
    const angle = Math.atan2(target.y - fish.y, target.x - fish.x);
    fish.dx = Math.cos(angle) * fish.speed;
    fish.dy = Math.sin(angle) * fish.speed;
    fish.facingLeft = target.x < fish.x;

    // Check collision with food
    const distance = Math.hypot(target.x - fish.x, target.y - fish.y);
    if (distance < fish.radius + target.radius) {
      foods.splice(foods.indexOf(target), 1);
      score += 10;
      hunger = Math.min(100, hunger + 15);
      scoreEl.textContent = score;
      hungerEl.textContent = `${hunger}%`;
    }
  } else {
    // Idle gentle movement
    fish.dx *= 0.95;
    fish.dy *= 0.95;
  }

  fish.x += fish.dx;
  fish.y += fish.dy;
}

function drawFish() {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  if (fish.facingLeft) ctx.scale(-1, 1);

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, fish.radius + 6, fish.radius - 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ff6b6b";
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-fish.radius, 0);
  ctx.lineTo(-fish.radius - 12, -10);
  ctx.lineTo(-fish.radius - 12, 10);
  ctx.closePath();
  ctx.fillStyle = "#ff8e8e";
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(8, -4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(9, -4, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  ctx.restore();
}

function drawFood() {
  foods.forEach((food) => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd166";
    ctx.fill();
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawFood();
  drawFish();
  requestAnimationFrame(gameLoop);
}

gameLoop();
