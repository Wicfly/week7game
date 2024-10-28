let leftPlayer, rightPlayer;
let leftWaves = []; // 用于存储左玩家的光波
let rightWaves = []; // 用于存储右玩家的光波
let leftDefending = false;
let rightDefending = false;
let gameOver = false;
let winner = "";

// 动图变量
let leftImg, rightImg, leftWaveImg, rightWaveImg;
let leftAttackImg, rightAttackImg;
let leftDefendImg, rightDefendImg;
let leftPressTime = 0; // 左边按键按下的时间
let rightPressTime = 0; // 右边按键按下的时间
const ATTACK_DURATION = 500; // 攻击动画显示时长（毫秒）
const DEFENSE_THRESHOLD = 200; // 长按防御的阈值（毫秒）

// 能量槽变量
let leftEnergy = 100;
let rightEnergy = 100;
const ENERGY_BAR_WIDTH = 100;
const ENERGY_CONSUMPTION_ATTACK = 10;
const ENERGY_CONSUMPTION_DEFENSE = 20; // 每秒钟的防御消耗
const ENERGY_RECOVERY_RATE = 100 / 3; // 3秒恢复到满

function preload() {
  // 预加载动图
  leftImg = loadImage("left.GIF");
  rightImg = loadImage("right.GIF");
  leftWaveImg = loadImage("wavel.GIF"); // 左光波动图
  rightWaveImg = loadImage("waver.GIF"); // 右光波动图
  leftAttackImg = loadImage("leftat.GIF");
  rightAttackImg = loadImage("rightat.GIF");
  leftDefendImg = loadImage("leftdf.GIF");
  rightDefendImg = loadImage("rightdf.GIF");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER); // 设置图片模式为中心
  resetGame();
}

function draw() {
  background(255);

  // 检查是否进入防守状态
  keyIsDownHandler();

  if (!gameOver) {
    // 玩家和光波的显示
    leftPlayer.show();
    rightPlayer.show();

    // 显示能量槽
    drawEnergyBar(leftPlayer.x, leftPlayer.y - 100, leftEnergy);
    drawEnergyBar(rightPlayer.x, rightPlayer.y - 100, rightEnergy);

    // 控制左边光波发射
    for (let i = leftWaves.length - 1; i >= 0; i--) {
      let wave = leftWaves[i];
      wave.move();
      wave.show();
      if (wave.hits(rightPlayer)) {
        if (!rightDefending) {
          gameOver = true;
          winner = "Left player win！";
        }
        leftWaves.splice(i, 1); // 移除击中右玩家的光波
      } else if (wave.x > width) {
        leftWaves.splice(i, 1); // 移除超出屏幕的光波
      }
    }

    // 控制右边光波发射
    for (let i = rightWaves.length - 1; i >= 0; i--) {
      let wave = rightWaves[i];
      wave.move();
      wave.show();
      if (wave.hits(leftPlayer)) {
        if (!leftDefending) {
          gameOver = true;
          winner = "Right player win！";
        }
        rightWaves.splice(i, 1); // 移除击中左玩家的光波
      } else if (wave.x < 0) {
        rightWaves.splice(i, 1); // 移除超出屏幕的光波
      }
    }

    // 能量恢复
    if (!leftDefending && leftEnergy < 100) {
      leftEnergy = min(100, leftEnergy + (ENERGY_RECOVERY_RATE * deltaTime) / 1000);
    }
    if (!rightDefending && rightEnergy < 100) {
      rightEnergy = min(100, rightEnergy + (ENERGY_RECOVERY_RATE * deltaTime) / 1000);
    }
  } else {
    // 显示赢家
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text(winner, width / 2, height / 2);

    // 检查是否同时按下空格和鼠标左键以重置游戏
    if (keyIsDown(32) && mouseIsPressed) {
      resetGame();
    }
  }
}

// 绘制能量槽
function drawEnergyBar(x, y, energy) {
  stroke(0);
  fill(255, 0, 0);
  rect(x - ENERGY_BAR_WIDTH / 2, y, ENERGY_BAR_WIDTH, 10);
  fill(0, 255, 0);
  rect(x - ENERGY_BAR_WIDTH / 2, y, (ENERGY_BAR_WIDTH * energy) / 100, 10);
}

// 重置游戏状态
function resetGame() {
  leftPlayer = new Player(300, height / 2, "left");
  rightPlayer = new Player(width - 300, height / 2, "right");
  leftWaves = [];
  rightWaves = [];
  leftDefending = false;
  rightDefending = false;
  gameOver = false;
  winner = "";
  leftPressTime = 0;
  rightPressTime = 0;
  leftEnergy = 100;
  rightEnergy = 100;
}

// 玩家类
class Player {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  }

  show() {
    let imgToShow = leftImg; // 默认图片

    if (this.side === "left") {
      if (leftDefending) {
        imgToShow = leftDefendImg;
      } else if (millis() - leftPressTime < ATTACK_DURATION) {
        imgToShow = leftAttackImg;
      } else {
        imgToShow = leftImg;
      }
    } else if (this.side === "right") {
      if (rightDefending) {
        imgToShow = rightDefendImg;
      } else if (millis() - rightPressTime < ATTACK_DURATION) {
        imgToShow = rightAttackImg;
      } else {
        imgToShow = rightImg;
      }
    }

    const width = 400;
    const height = (imgToShow.height / imgToShow.width) * width;
    image(imgToShow, this.x, this.y, width, height);
  }
}

// 光波类
class Wave {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = 10;
    this.img = direction === 1 ? leftWaveImg : rightWaveImg; // 根据方向选择图像
  }

  move() {
    this.x += this.speed * this.direction;
  }

  show() {
    const waveWidth = 200;
    const waveHeight = (this.img.height / this.img.width) * waveWidth;
    image(this.img, this.x, this.y, waveWidth, waveHeight);
  }

  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < 50;
  }
}

function keyPressed() {
  if (!gameOver && key === ' ') {
    leftPressTime = millis();
    if (!leftDefending && millis() - leftPressTime < DEFENSE_THRESHOLD && leftEnergy >= ENERGY_CONSUMPTION_ATTACK) {
      leftWaves.push(new Wave(leftPlayer.x + 50, leftPlayer.y, 1));
      leftEnergy -= ENERGY_CONSUMPTION_ATTACK;
    }
  }
}

function keyReleased() {
  if (key === ' ') {
    if (millis() - leftPressTime >= DEFENSE_THRESHOLD) {
      leftDefending = false;
    }
    leftPressTime = 0;
  }
}

function mousePressed() {
  if (!gameOver && mouseButton === LEFT) {
    rightPressTime = millis();
    if (!rightDefending && millis() - rightPressTime < DEFENSE_THRESHOLD && rightEnergy >= ENERGY_CONSUMPTION_ATTACK) {
      rightWaves.push(new Wave(rightPlayer.x - 50, rightPlayer.y, -1));
      rightEnergy -= ENERGY_CONSUMPTION_ATTACK;
    }
  }
}

function mouseReleased() {
  if (mouseButton === LEFT) {
    if (millis() - rightPressTime >= DEFENSE_THRESHOLD) {
      rightDefending = false;
    }
    rightPressTime = 0;
  }
}

// 处理持续按键事件
function keyIsDownHandler() {
  if (keyIsDown(32) && millis() - leftPressTime > DEFENSE_THRESHOLD && leftEnergy >= ENERGY_CONSUMPTION_DEFENSE * deltaTime / 1000) {
    leftDefending = true;
    leftEnergy -= ENERGY_CONSUMPTION_DEFENSE * deltaTime / 1000;
  }
  if (mouseIsPressed && millis() - rightPressTime > DEFENSE_THRESHOLD && rightEnergy >= ENERGY_CONSUMPTION_DEFENSE * deltaTime / 1000) {
    rightDefending = true;
    rightEnergy -= ENERGY_CONSUMPTION_DEFENSE * deltaTime / 1000;
  }
}
