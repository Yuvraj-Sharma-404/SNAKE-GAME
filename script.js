const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");
const blockHeight = 20;
const blockWidth = 20;
let canChangeDirection = true;
let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;
let gameSpeed = 200;
const eatSound = document.querySelector("#eat-sound");
const gameOverSound = document.querySelector("#gameover-sound");
const backgroundSong = document.querySelector("#song");
highScoreElement.innerText = highScore;
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let intervalId = null;
let timerIntervalId = null;
let snake = [
  { x: rows - 4, y: Math.floor(cols / 2) },
  { x: rows - 3, y: Math.floor(cols / 2) },
  { x: rows - 2, y: Math.floor(cols / 2) },
  { x: rows - 1, y: Math.floor(cols / 2) },
];
do {
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
} while (snake.some((segment) => segment.x === food.x && segment.y === food.y));

const blocks = [];
let direction = "up";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function updatespeed() {
  const newSpeed = Math.max(60, 200 - Math.floor(score / 20) * 10);

  if (newSpeed !== gameSpeed) {
    gameSpeed = newSpeed;

    clearInterval(intervalId);

    intervalId = setInterval(() => {
      render();
    }, gameSpeed);
  }
}

function render() {
  let head = null;
  // FOOD
  blocks[`${food.x}-${food.y}`].classList.add("food");

  // NEW HEAD POSITION
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  // WALL COLLISION
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    backgroundSong.pause();
    backgroundSong.currentTime = 0;
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    gameOverAnimation();
    return;
  }

  // SELF COLLISION
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    backgroundSong.pause();
    backgroundSong.currentTime = 0;
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    gameOverAnimation();
    return;
  }

  // REMOVE OLD SNAKE
  snake.forEach((segment) => {
    const block = blocks[`${segment.x}-${segment.y}`];

    block.classList.remove("fill");
    block.classList.remove("head");
    block.style.transform = "";
  });

  // FOOD EAT
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score % 100 === 0) {
      scoreElement.classList.add("blink");

      setTimeout(() => {
        scoreElement.classList.remove("blink");
      }, 1000);
    }
    eatSound.currentTime = 0;
    eatSound.play();
    scoreElement.innerText = score;
    updatespeed();

    snake.unshift(head);

    blocks[`${food.x}-${food.y}`].classList.remove("food");

    do {
      food = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols),
      };
    } while (
      snake.some((segment) => segment.x === food.x && segment.y === food.y)
    );
    blocks[`${food.x}-${food.y}`].classList.add("food");
  } else {
    snake.unshift(head);
    snake.pop();
  }

  // DRAW NEW SNAKE
  snake.forEach((segment, index) => {
    const block = blocks[`${segment.x}-${segment.y}`];

    if (index === 0) {
      block.classList.add("head");

      if (direction === "up") {
        block.style.transform = "rotate(0deg)";
      } else if (direction === "right") {
        block.style.transform = "rotate(90deg)";
      } else if (direction === "down") {
        block.style.transform = "rotate(180deg)";
      } else if (direction === "left") {
        block.style.transform = "rotate(270deg)";
      }
    } else {
      block.classList.add("fill");
    }
  });
  canChangeDirection = true;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreElement.innerText = highScore;
  }
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  backgroundMusicPlayer();
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);
  timerIntervalId = setInterval(() => {
    const currentTime = time.split("-");
    let minutes = parseInt(currentTime[0]);
    let seconds = parseInt(currentTime[1]);
    seconds += 1;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    time = `${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  snake.forEach((segment) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    block.classList.remove("head");
    block.classList.remove("fill");
    block.style.transform = "";
  });
  gameSpeed = 200;
  score = 0;
  time = `00-00`;
  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;
  modal.style.display = "none";
  backgroundMusicPlayer();
  direction = "up";
  snake = [
    { x: rows - 4, y: Math.floor(cols / 2) },
    { x: rows - 3, y: Math.floor(cols / 2) },
    { x: rows - 2, y: Math.floor(cols / 2) },
    { x: rows - 1, y: Math.floor(cols / 2) },
  ];
  do {
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
  } while (
    snake.some((segment) => segment.x === food.x && segment.y === food.y)
  );
  intervalId = setInterval(() => {
    render();
  }, gameSpeed);
  timerIntervalId = setInterval(() => {
    const currentTime = time.split("-");
    let minutes = parseInt(currentTime[0]);
    let seconds = parseInt(currentTime[1]);
    seconds += 1;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    time = `${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
}

addEventListener("keydown", (event) => {
  if (!canChangeDirection) return;

  if (event.key == "ArrowUp" && direction !== "down") {
    direction = "up";
    canChangeDirection = false;
  } else if (event.key == "ArrowRight" && direction !== "left") {
    direction = "right";
    canChangeDirection = false;
  } else if (event.key == "ArrowLeft" && direction !== "right") {
    direction = "left";
    canChangeDirection = false;
  } else if (event.key == "ArrowDown" && direction !== "up") {
    direction = "down";
    canChangeDirection = false;
  }
});

function gameOverAnimation() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  let blinkCount = 0;

  const blinkInterval = setInterval(() => {
    snake.forEach((segment, index) => {
      const block = blocks[`${segment.x}-${segment.y}`];

      if (blinkCount % 2 === 0) {
        block.classList.remove("fill");
        block.classList.remove("head");
      } else {
        if (index === 0) {
          block.classList.add("head");
        } else {
          block.classList.add("fill");
        }
      }
    });

    blinkCount++;

    if (blinkCount === 6) {
      clearInterval(blinkInterval);

      modal.style.display = "flex";
      startGameModal.style.display = "none";
      gameOverModal.style.display = "flex";
      backgroundMusicPlayer();
    }
  }, 150);
}

function backgroundMusicPlayer() {
  if (modal.style.display === "none") {
    backgroundSong.play();
    backgroundSong.currentTime = 0;
  } else {
    backgroundSong.currentTime = 0;
    backgroundSong.pause();
  }
}
