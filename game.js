const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust canvas size for desktop
canvas.width = 800;
canvas.height = 600;

// Game Variables
const player = { x: 50, y: 50, size: 32, image: new Image(), flipped: false };
let hikers = [
  {
    x: -96, // Start off-screen
    y: 150,
    size: 96, // Scaled to 300% (32 * 3)
    image: new Image(),
    direction: 1,
    speed: (Math.random() * 1), // Set random speed at 1
  },
];
let gameStarted = false;
let gameEnded = false;
let score = 0;
let timer = 60; // 60 seconds timer
let globalSpeedMultiplier = 1.0; // Double the overall speed dynamically

// Load Images
player.image.src = "mosquito.png"; // Mosquito image
hikers[0].image.src = "hiking.png"; // Hiker image
const background = new Image();
background.src = "bg.png"; // Background image

// Ensure images are loaded before starting the game
let imagesLoaded = 0;
const totalImages = 3;

player.image.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawStartScreen();
  }
};

hikers[0].image.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawStartScreen();
  }
};

background.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    drawStartScreen();
  }
};

const keys = {};

// Event listener for keydown
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " && !gameStarted) {
    startGame();
  }
  if (e.key === " ") {
    biteHiker();
  }
});

// Event listener for keyup
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function biteHiker() {
  hikers.forEach((hiker, index) => {
    if (
      player.x < hiker.x + hiker.size &&
      player.x + player.size > hiker.x &&
      player.y < hiker.y + hiker.size &&
      player.y + player.size > hiker.y
    ) {
      score++; // Increment score
      console.log(`Score: ${score}`); // Debugging

      // Play collision sound
      hikerHitSound.play().catch((error) => console.error("Error playing hiker hit sound:", error));

      // Reset hiker position
      hiker.direction = Math.random() < 0.5 ? 1 : -1; // Randomize direction
      hiker.x = hiker.direction === 1 ? -hiker.size : canvas.width; // Start from left or right
      hiker.y = Math.random() * (canvas.height * 0.8 - hiker.size) + canvas.height * 0.2; // Avoid top 20%
      hiker.speed = (Math.random() * 1.5 + 0.5); // Double the random speed between 1 and 4
    }
  });
}

function startGame() {
  console.log("Game started");
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameStarted) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.drawImage(player.image, player.x, player.y, player.size, player.size);

  // Draw hikers
  hikers.forEach((hiker) => {
    ctx.drawImage(hiker.image, hiker.x, hiker.y, hiker.size, hiker.size);
  });

  // Update game state
  update();

  // Request next frame
  requestAnimationFrame(gameLoop);
}

function update() {
  let isMoving = false;

  // Move the mosquito
  if (keys["ArrowUp"] && player.y > 0) {
    player.y -= 5; // Double the speed of the mosquito moving up
    isMoving = true;
  }
  if (keys["ArrowDown"] && player.y < canvas.height - player.size) {
    player.y += 5; // Double the speed of the mosquito moving down
    isMoving = true;
  }
  if (keys["ArrowLeft"] && player.x > 0) {
    player.x -= 5; // Double the speed of the mosquito moving left
    player.flipped = false;
    isMoving = true;
  }
  if (keys["ArrowRight"] && player.x < canvas.width - player.size) {
    player.x += 5; // Double the speed of the mosquito moving right
    player.flipped = true;
    isMoving = true;
  }

  // Play or pause mosquito sound
  if (isMoving) {
    if (mosquitoSound.paused) mosquitoSound.play();
  } else {
    mosquitoSound.pause();
  }

  // Update hikers' movement and check for collisions
  hikers.forEach((hiker, index) => {
    hiker.x += hiker.direction * hiker.speed * globalSpeedMultiplier;

    // Reset hiker if off-screen or after collision
    if (hiker.x > canvas.width || hiker.x < -hiker.size) {
      hiker.direction = Math.random() < 0.5 ? 1 : -1; // Randomize direction
      hiker.x = hiker.direction === 1 ? -hiker.size : canvas.width; // Start from left or right
      hiker.y = Math.random() * (canvas.height * 0.8 - hiker.size) + canvas.height * 0.2; // Avoid top 20%
      hiker.speed = (Math.random() * 1.5 + 0.5); // Double the random speed between 1 and 4
    }
  });

  // Add a new hiker every 10 points
  if (score > 0 && score % 10 === 0 && hikers.length < Math.floor(score / 10) + 1) {
    const newHiker = {
      x: Math.random() < 0.5 ? -96 : canvas.width, // Random starting side
      y: Math.random() * (canvas.height * 0.8 - 96) + canvas.height * 0.2, // Avoid top 20%
      size: 96,
      image: new Image(),
      direction: Math.random() < 0.5 ? 1 : -1,
      speed: (Math.random() * 1.5 + 0.5), // Double the random speed between 1 and 4
    };
    newHiker.image.src = "hiking.png";
    hikers.push(newHiker);

    // Optional: Increase global speed multiplier to make the game harder
    globalSpeedMultiplier *= 1.01; // Increase more aggressively
  }
}

// Load Sounds
const mosquitoSound = new Audio("buzz.mp3");
mosquitoSound.loop = true; // Loop the mosquito sound

const hikerHitSound = new Audio("ow.mp3"); // Sound when a hiker is "bit"

// Event Listeners for Keyboard Controls
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " && !gameStarted) {
    startGame();
}
  if (e.key === "r" && gameEnded) { // Change key to 'R' for restart
    startGame();
  }
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Adjust drawStartScreen for Desktop
function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Display Instructions
  ctx.fillStyle = "white";
  ctx.font = "20px Courier New";
  ctx.textAlign = "center";

  const textYStart = canvas.height / 2 + 50; // Starting Y position for the text
  ctx.fillText("Move the mosquito with the arrow keys.", canvas.width / 2, textYStart);
  ctx.fillText('Press the spacebar to bite the hikers.', canvas.width / 2, textYStart + 30);
  ctx.fillText('Try to "bite" as many hikers as you can in 60 seconds.', canvas.width / 2, textYStart + 60);
  ctx.fillText("Good luck and happy hunting!", canvas.width / 2, textYStart + 90);

  // Display Start Message
  ctx.font = "30px Arial";
  ctx.fillText("Press Spacebar to Start", canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Draw Player (Mosquito)
  ctx.save();
  if (player.flipped) {
    ctx.translate(player.x + player.size, player.y);
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(player.image, 0, 0, player.size, player.size);
  } else {
    ctx.drawImage(player.image, player.x, player.y, player.size, player.size);
  }
  ctx.restore();

  // Draw Hikers
  hikers.forEach((hiker) => {
    ctx.save();
    if (hiker.direction === -1) {
      ctx.translate(hiker.x + hiker.size, hiker.y);
      ctx.scale(-1, 1); // Flip horizontally if moving left
      ctx.drawImage(hiker.image, 0, 0, hiker.size, hiker.size);
    } else {
      ctx.drawImage(hiker.image, hiker.x, hiker.y, hiker.size, hiker.size);
    }
    ctx.restore();
  });

  // Draw Timer and Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Time: ${timer}`, canvas.width - 100, 20);
}

function drawEndScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Display Final Score
  ctx.fillStyle = "white";
  ctx.font = "60px Courier New"; // Large font for the score
  ctx.textAlign = "center";
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);

  // Display Restart Message
  ctx.font = "20px Courier New"; // Smaller font for the restart message
  ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 50); // Updated message
}


// Start/Restart Game Logic
function startGame() {
  gameStarted = true;
  gameEnded = false;
  timer = 60;
  score = 0;

  // Reset player position
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height / 2 - player.size / 2;

  // Reset hikers
  hikers = [
    {
      x: -96,
      y: Math.random() * (canvas.height - 96),
      size: 96,
      image: new Image(),
      direction: 1,
      speed: (Math.random() * 1.5 + 0.5), // Double the random speed between 1 and 4
    },
  ];
  hikers[0].image.src = "hiking.png";
  globalSpeedMultiplier = 2.0; // Double the overall speed dynamically

  mosquitoSound.play().catch((error) => console.error("Error playing buzz sound:", error));
  startTimer();
}

// Game Loop
function gameLoop() {
  if (gameStarted) {
    if (!gameEnded) {
      update();
      draw();
    } else {
      drawEndScreen();
    }
  } else {
    drawStartScreen();
  }
  requestAnimationFrame(gameLoop);
}

// Game Timer Logic
function startTimer() {
  const timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
    } else {
      clearInterval(timerInterval);
      gameEnded = true; // End the game when the timer reaches 0
      mosquitoSound.pause(); // Stop mosquito sound
    }
  }, 1000);
}

gameLoop();
