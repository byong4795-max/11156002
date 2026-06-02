let monsters = [];
let talismans = [];

let score = 0;
let timeLeft = 60;
let gameState = 0; // 0: 故事/封面, 1: 遊戲中, 2: 結局

let targetMonsterCount = 40;

let weaponMode = 0;

let storyText = "這是一個關於實習驅魔人『阿強』的故事。\n\n因為積欠了三個月的房租，阿強在電線桿上翻到一張\n超廉價除靈委託：「只要解決後山的妖怪，就付五百塊。」\n\n阿強拿起他在夜市買的「發光狐火」、紀念品「桃木劍」，\n還有網路下載、反應慢半拍的「延遲白符」，\n準備去後山大幹一場（賺房租）！";
let currentEnding = "";

const weaponNames = [
  "🔥 狐火",
  "🗡️ 桃木劍",
  "📜 白符"
];

// ===== 白符系統 =====

let talismanSpawnX;
let talismanSpawnY;

let dragging = false;

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );
  
  resetGameData();

  // 統一計時器邏輯，並修正原本 gameOver 變數未定義的問題
  setInterval(() => {
    if (gameState === 1) {
      timeLeft--;
      if (timeLeft > 0 && timeLeft % 10 === 0) {
        targetMonsterCount += 10;
      }
      if (timeLeft <= 0) {
        gameState = 2; // 時間到，切換至結局狀態
        // 根據分數判定結局文字
        if (score >= 500) {
          currentEnding = "【結局：除靈大師】\n阿強大顯神威，村長感激地奉上委託費，\n阿強不但付了房租，還加點了一份大份鹹酥雞。";
        } else {
          currentEnding = "【結局：被狗趕走】\n阿強連個影子都沒抓到，被村長的吉娃娃一路追下山。\n沒拿到半毛錢，還被房東太太反鎖在門外。";
        }
      }
    }
  }, 1000);
}

function resetGameData() {
  score = 0;
  timeLeft = 60;
  monsters = [];
  talismans = [];
  targetMonsterCount = 40;
  
  spawnNewTalismanPoint(); // 初始化白符位置

  for (let i = 0; i < targetMonsterCount; i++) {
    monsters.push(new Monster());
  }
}

function draw() {

  background(
    10,
    15,
    35
  );

  if (gameState === 0) {
    cursor(ARROW); // 封面故事狀態：顯示標準滑鼠
    drawStoryScreen();
  } else if (gameState === 1) {
    noCursor();    // 戰鬥狀態：隱藏系統滑鼠，使用遊戲內的準心與武器
    drawStars();
    while (
      monsters.length <
      targetMonsterCount
    ) {
      monsters.push(
        new Monster()
      );
    }

    // ===== 白符飛行 =====

    for (
      let i = talismans.length - 1;
      i >= 0;
      i--
    ) {

      talismans[i].update();
      talismans[i].display();

      if (
        talismans[i].dead
      ) {
        talismans.splice(i, 1);
      }
    }

    // ===== 妖怪 =====

    for (
      let i = monsters.length - 1;
      i >= 0;
      i--
    ) {

      monsters[i].update();
      monsters[i].display();

      if (
        monsters[i].isKilled()
      ) {

        score +=
          monsters[i].points;

        monsters.splice(
          i,
          1
        );

        monsters.push(
          new Monster()
        );
      }
    }

    if (
      weaponMode === 0
    ) {
      drawFoxFire();
    }
    else if (
      weaponMode === 1
    ) {
      drawSword();
    }
    else {
      drawTalismanLauncher();
    }
    drawUI();
  } else if (gameState === 2) {
    cursor(ARROW); // 結局狀態：顯示標準滑鼠以便點擊按鈕
    drawEndingScreen();
  }
}

function drawStoryScreen() {
  drawStars();
  fill(0, 150);
  rect(width / 2 - 300, height / 2 - 200, 600, 450, 20);
  
  fill(255);
  textAlign(CENTER, TOP);
  textSize(32);
  text("👻 驅魔人阿強的房租危機", width / 2, height / 2 - 170);
  
  textSize(18);
  textAlign(LEFT, TOP);
  text(storyText, width / 2 - 250, height / 2 - 100);
  
  // 按鈕
  drawButton("開始除靈 (賺錢!)", width / 2, height / 2 + 180, 200, 50);
  
  // 裝飾
  drawFoxFireAt(width / 2 - 240, height / 2 + 180);
}

function drawEndingScreen() {
  drawStars();
  fill(0, 200);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);
  text(score >= 500 ? "MISSION COMPLETE!" : "MISSION FAILED...", width / 2, height / 2 - 150);
  
  textSize(24);
  text("最終得分 : " + score, width / 2, height / 2 - 80);
  
  fill(255, 220, 100);
  textSize(20);
  text(currentEnding, width / 2, height / 2 + 10);
  
  // 選項
  let btn1Label = score >= 500 ? "蕭貪 (再來一局)" : "雪恥 (重新開始)";
  let btn2Label = score >= 500 ? "滿意寶寶 (結束)" : "窩囊離開 (回標題)";

  drawButton(btn1Label, width / 2 - 120, height / 2 + 150, 180, 50);
  drawButton(btn2Label, width / 2 + 120, height / 2 + 150, 180, 50);
}

function drawButton(label, x, y, w, h) {
  push();
  rectMode(CENTER);
  let isHover = abs(mouseX - x) < w / 2 && abs(mouseY - y) < h / 2;
  fill(isHover ? 100 : 50, 50, 150, 200);
  stroke(255);
  strokeWeight(2);
  rect(x, y, w, h, 10);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text(label, x, y);
  pop();
}

function drawFoxFireAt(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(100, 180, 255, 150);
  ellipse(0, 0, 40);
  fill(255);
  ellipse(0, 0, 10);
  pop();
}

function drawStars() {

  stroke(
    255,
    50
  );

  for (
    let i = 0;
    i < 100;
    i++
  ) {

    point(
      (i * 131) %
      width,
      (i * 71) %
      height
    );
  }
}

function drawUI() {

  fill(255);

  textAlign(
    LEFT,
    TOP
  );

  textSize(28);

  text(
    "Score : " +
    score,
    20,
    20
  );

  textSize(22);

  text(
    "Weapon : " +
    weaponNames[
      weaponMode
    ],
    20,
    60
  );

  textAlign(
    CENTER,
    TOP
  );

  textSize(34);

  text(
    "⏳ " +
    timeLeft,
    width / 2,
    10
  );
}
function drawFoxFire() {

  push();

  translate(
    mouseX,
    mouseY
  );

  noStroke();

  fill(
    100,
    180,
    255,
    40
  );

  ellipse(
    0,
    0,
    80
  );

  fill(
    120,
    220,
    255,
    100
  );

  ellipse(
    0,
    0,
    50
  );

  fill(255);

  ellipse(
    0,
    0,
    18
  );

  pop();
}

function drawSword() {

  push();

  translate(
    mouseX,
    mouseY
  );

  rotate(
    sin(
      frameCount * 0.35
    )
  );

  stroke(
    120,
    70,
    20
  );

  strokeWeight(10);

  line(
    0,
    20,
    0,
    -60
  );

  stroke(
    255,
    220,
    100
  );

  strokeWeight(14);

  line(
    0,
    -60,
    0,
    -10
  );

  pop();
}

// ===== 白符發射器 =====

function drawTalismanLauncher() {

  push();

  rectMode(CENTER);

  translate(
    talismanSpawnX,
    talismanSpawnY
  );

  fill(
    255,
    250,
    180
  );

  stroke(
    200,
    0,
    0
  );

  rect(
    0,
    0,
    18,
    36,
    3
  );

  line(
    -20,
    0,
    20,
    0
  );

  line(
    0,
    -20,
    0,
    20
  );

  pop();

  // ===== 瞄準圖示 (Crosshair) =====
  push();
  translate(mouseX, mouseY);
  stroke(255, 255, 255, 200);
  strokeWeight(2);
  noFill();
  // 繪製圓圈與十字
  ellipse(0, 0, 20);
  line(-15, 0, 15, 0);
  line(0, -15, 0, 15);
  pop();

  if (
    dragging
  ) {
    push();
    
    // 設定虛線樣式 [實線長度, 間隔長度]
    drawingContext.setLineDash([10, 10]);

    stroke(
      255, 220, 100, 150
    );

    strokeWeight(2);

    line(
      talismanSpawnX,
      talismanSpawnY,
      mouseX,
      mouseY
    );

    // 重置虛線設定，避免影響其他繪圖
    drawingContext.setLineDash([]);
    pop();

    noStroke();

    fill(
      255,
      220,
      100,
      80
    );

    ellipse(
      mouseX,
      mouseY,
      20
    );
  }
}

function spawnNewTalismanPoint() {

  talismanSpawnX =
    random(
      100,
      width - 100
    );

  talismanSpawnY =
    random(
      100,
      height - 100
    );
}

// ===== 飛行白符 =====

class TalismanProjectile {

  constructor(
    x,
    y,
    vx,
    vy
  ) {

    this.x = x;
    this.y = y;

    this.vx = vx;
    this.vy = vy;

    this.dead = false;
  }

  update() {

    this.x += this.vx;
    this.y += this.vy;

    if (
      this.x < -50 ||
      this.x > width + 50 ||
      this.y < -50 ||
      this.y > height + 50
    ) {
      this.dead = true;
      return;
    }

    for (
      let monster of monsters
    ) {

      if (
        monster.marked
      ) {
        continue;
      }

      let d = dist(
        this.x,
        this.y,
        monster.x,
        monster.y
      );

      if (
        d <
        monster.size / 2 + 12
      ) {

        monster.marked = true;

        monster.markTime =
          millis();

        this.dead = true;

        break;
      }
    }
  }

  display() {

    push();

    translate(
      this.x,
      this.y
    );

    rotate(
      atan2(
        this.vy,
        this.vx
      )
    );

    rectMode(CENTER);

    fill(
      255,
      250,
      180
    );

    stroke(
      200,
      0,
      0
    );

    rect(
      0,
      0,
      18,
      36,
      3
    );

    line(
      -20,
      0,
      20,
      0
    );

    line(
      0,
      -20,
      0,
      20
    );

    pop();
  }
}
class Monster {

  constructor() {

    this.x =
      random(width);

    this.y =
      random(height);

    let r = random();

    if (
      r < 0.5
    ) {

      this.size = 28;

      this.points = 1;

      this.color =
        color(
          120,
          255,
          120
        );
    }
    else if (
      r < 0.85
    ) {

      this.size = 42;

      this.points = 5;

      this.color =
        color(
          255,
          220,
          100
        );
    }
    else {

      this.size = 60;

      this.points = 10;

      this.color =
        color(
          255,
          120,
          120
        );
    }

    this.vx =
      random(
        -2,
        2
      );

    this.vy =
      random(
        -2,
        2
      );

    this.scared =
      false;

    // ===== 白符 =====

    this.marked =
      false;

    this.markTime =
      0;

    this.readyToDie =
      false;
  }

  update() {

    // ===== 被白符擊中 =====

    if (
      this.marked
    ) {

      let passed =
        millis() -
        this.markTime;

      // 前兩秒完全正常

      if (
        passed < 2000
      ) {

        this.scared =
          false;
      }

      // 兩秒後才發現

      else {

        this.scared =
          true;

        this.readyToDie =
          true;
      }
    }

    let d = dist(
      mouseX,
      mouseY,
      this.x,
      this.y
    );

    // ===== 狐火桃木劍 =====

    if (
      (
        weaponMode === 0 ||
        weaponMode === 1
      ) &&
      d < 180
    ) {

      this.scared =
        true;

      let angle =
        atan2(
          this.y -
          mouseY,
          this.x -
          mouseX
        );

      this.vx +=
        cos(angle) *
        0.6;

      this.vy +=
        sin(angle) *
        0.6;
    }

    this.vx +=
      random(
        -0.05,
        0.05
      );

    this.vy +=
      random(
        -0.05,
        0.05
      );

    this.vx =
      constrain(
        this.vx,
        -6,
        6
      );

    this.vy =
      constrain(
        this.vy,
        -6,
        6
      );

    this.x +=
      this.vx;

    this.y +=
      this.vy;

    if (
      this.x < 0 ||
      this.x > width
    ) {

      this.vx *= -1;
    }

    if (
      this.y < 0 ||
      this.y > height
    ) {

      this.vy *= -1;
    }
  }

  display() {

    push();

    translate(
      this.x,
      this.y
    );

    noStroke();

    fill(
      this.color
    );

    ellipse(
      0,
      0,
      this.size
    );

    fill(255);

    // ===== 白符貼在頭上 =====

    if (
      this.marked
    ) {

      push();

      translate(
        0,
        -this.size * 0.8
      );

      rectMode(
        CENTER
      );

      fill(
        255,
        250,
        180
      );

      stroke(
        200,
        0,
        0
      );

      rect(
        0,
        0,
        10,
        20,
        2
      );

      pop();
    }

    // ===== 驚慌表情 =====

    if (
      this.scared
    ) {

      ellipse(
        -this.size * 0.18,
        -this.size * 0.1,
        this.size * 0.2,
        this.size * 0.3
      );

      ellipse(
        this.size * 0.18,
        -this.size * 0.1,
        this.size * 0.2,
        this.size * 0.3
      );

      fill(0);

      ellipse(
        -this.size * 0.18,
        -this.size * 0.08,
        3
      );

      ellipse(
        this.size * 0.18,
        -this.size * 0.08,
        3
      );

      noFill();

      stroke(0);

      ellipse(
        0,
        this.size * 0.2,
        this.size * 0.2,
        this.size * 0.15
      );
    }

    // ===== 普通表情 =====

    else {

      ellipse(
        -this.size * 0.18,
        -this.size * 0.1,
        this.size * 0.22
      );

      ellipse(
        this.size * 0.18,
        -this.size * 0.1,
        this.size * 0.22
      );

      fill(0);

      ellipse(
        -this.size * 0.18,
        -this.size * 0.1,
        4
      );

      ellipse(
        this.size * 0.18,
        -this.size * 0.1,
        4
      );

      noFill();

      stroke(0);

      arc(
        0,
        this.size * 0.15,
        this.size * 0.35,
        this.size * 0.2,
        0,
        PI
      );
    }

    pop();
  }

  isKilled() {

    let d = dist(
      mouseX,
      mouseY,
      this.x,
      this.y
    );

    // 狐火

    if (
      weaponMode === 0
    ) {

      return (
        d <
        this.size / 2 + 12
      );
    }

    // 桃木劍

    if (
      weaponMode === 1
    ) {

      return (
        d <
        this.size / 2 + 50
      );
    }

    // 白符

    if (
      this.readyToDie
    ) {

      return true;
    }

    return false;
  }
}
function mousePressed() {

  // ===== 狀態控制邏輯 =====
  if (gameState === 0) {
    // 故事畫面：按下開始
    if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height / 2 + 180)) < 25) {
      gameState = 1;
      resetGameData();
    }
    return;
  }
  
  if (gameState === 2) {
    // 結局畫面：雪恥
    if (abs(mouseX - (width / 2 - 120)) < 90 && abs(mouseY - (height / 2 + 150)) < 25) {
      gameState = 1;
      resetGameData();
    }
    // 結局畫面：窩囊離開
    if (abs(mouseX - (width / 2 + 120)) < 90 && abs(mouseY - (height / 2 + 150)) < 25) {
      gameState = 0;
    }
    return;
  }

  // ===== 右鍵切換武器 =====
  if (mouseButton === RIGHT) {
    weaponMode++;
    if (weaponMode > 2) {
      weaponMode = 0;
    }
    return false;
  }

  // ===== 白符模式：開始拖曳 =====
  if (gameState === 1 && weaponMode === 2) {
    dragging = true;
    return false;
  }
}

function mouseReleased() {

  // ===== 白符發射 =====
  if (
    weaponMode === 2 &&
    dragging
  ) {

    dragging = false;

    let dx =
      mouseX -
      talismanSpawnX;

    let dy =
      mouseY -
      talismanSpawnY;

    let mag =
      sqrt(dx * dx + dy * dy);

    if (mag > 5) {

      let speed =
        10;

      let vx =
        (dx / mag) *
        speed;

      let vy =
        (dy / mag) *
        speed;

      talismans.push(
        new TalismanProjectile(
          talismanSpawnX,
          talismanSpawnY,
          vx,
          vy
        )
      );

      // 發射後重新隨機生成白符位置
      spawnNewTalismanPoint();
    }

    return false;
  }
}

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}

document.oncontextmenu =
  () => false;