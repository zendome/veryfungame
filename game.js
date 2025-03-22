const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fill window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player setup
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'blue',
  speed: 5,
};

// Bullet setup
const bullets = [];
const bulletSpeed = 10;

// Enemy setup
const enemies = [];
const enemyRadius = 20;
let enemySpeed = 2;
let enemySpawnRate = 0.02;  // Enemies spawn slowly at the start

// Player controls setup
let keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// Track keyboard inputs for player movement
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
  if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
  if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
  if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

// Track mouse position for shooting
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Shoot bullets on mouse click
window.addEventListener('click', () => {
  shootBullet();
});

// Function to shoot a bullet
function shootBullet() {
  const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
  const bullet = {
    x: player.x,
    y: player.y,
    angle: angle,
    speed: bulletSpeed,
  };
  bullets.push(bullet);
}

// Timing variables for difficulty progression
let startTime = Date.now();  // Track time since the game started

// Update game state
function update() {
  movePlayer();
  moveBullets();
  moveEnemies();
  checkCollisions();
  spawnEnemies();
  increaseDifficulty();
  draw();
}

// Draw game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();

  // Draw bullets
  bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  });

  // Draw enemies
  enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemyRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'green';
    ctx.fill();
  });
}

// Move player based on keyboard input
function movePlayer() {
  if (keys.up) player.y -= player.speed;
  if (keys.down) player.y += player.speed;
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
}

// Move bullets
function moveBullets() {
  bullets.forEach(bullet => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
  });
}

// Move enemies toward the player
function moveEnemies() {
  enemies.forEach(enemy => {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemySpeed;
    enemy.y += Math.sin(angle) * enemySpeed;
  });
}

// Spawn enemies randomly around the player, but slower at first
function spawnEnemies() {
  if (Math.random() < enemySpawnRate) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 200 + 100;
    const enemy = {
      x: player.x + Math.cos(angle) * distance,
      y: player.y + Math.sin(angle) * distance,
    };
    enemies.push(enemy);
  }
}

// Increase difficulty over time (spawn rate, enemy speed)
function increaseDifficulty() {
  // Get the elapsed time in minutes
  let elapsedTime = (Date.now() - startTime) / 60000; // Time in minutes

  // The time threshold for difficulty progression is 10 minutes
  // Increase spawn rate slowly
  if (elapsedTime > 1) {  // After 1 minute
    enemySpawnRate += 0.00001 * elapsedTime;  // Increase rate slowly over time
  }

  // Increase enemy speed slowly after a significant amount of time
  if (elapsedTime > 3) {  // After 3 minutes
    enemySpeed = 2 + 0.05 * (elapsedTime - 3);  // Increase speed gradually
  }

  // Cap the difficulty at a maximum value after 10 minutes
  if (elapsedTime > 10) {
    enemySpawnRate = 0.1;  // Max spawn rate after 10 minutes
    enemySpeed = 5;  // Max speed after 10 minutes
  }
}

// Check for collisions between bullets and enemies
function checkCollisions() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Collision detection (bullet hits enemy)
      if (distance < enemyRadius) {
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
      }
    });
  });

  // Check if an enemy hits the player
  enemies.forEach((enemy, eIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If enemy touches player, game over
    if (distance < player.radius + enemyRadius) {
      alert('Game Over!');
      enemies.length = 0; // Reset enemies
      bullets.length = 0;  // Reset bullets
      player.x = canvas.width / 2;  // Reset player position
      player.y = canvas.height / 2;
      startTime = Date.now();  // Reset timer on game over
    }
  });
}

// Start the game loop
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

gameLoop();
