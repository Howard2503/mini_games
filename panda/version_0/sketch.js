let pandaX = 150;
let facing = 1;
let isWalking = false;
let walkFrame = 0;
let lastWalkSwitch = 0;
let stepInterval = 200;

let isAttacking = false;
let attackFrames = [0, 1, 2]; // combo 动画帧编号
let currentAttackFrame = 0;
let attackFrameStartTime = 0;
let attackFrameDuration = 150; // 每帧攻击时长

function setup() {
  createCanvas(400, 300);
  frameRate(60);
  noSmooth();
}

function draw() {
  background(220);

  if (isAttacking) {
    drawPixelPanda(pandaX, 180, "attack", attackFrames[currentAttackFrame]);

    if (millis() - attackFrameStartTime > attackFrameDuration) {
      currentAttackFrame++;
      if (currentAttackFrame >= attackFrames.length) {
        isAttacking = false;
        currentAttackFrame = 0;
      } else {
        attackFrameStartTime = millis();
      }
    }
  } else {
    drawPixelPanda(pandaX, 180, isWalking ? "walk" : "idle", walkFrame);
    handleWalkingAnimation();
  }

  handleMovement();
}

function drawPixelPanda(x, y, state, frame) {
  push();
  translate(x, y);
  scale(facing, 1);
  stroke(0);
  strokeWeight(3);
  noSmooth();

  // 身体
  fill(255);
  rect(-16, 0, 32, 32);

  // 腿
  fill(0);
  if (state === "walk" && frame === 1) {
    rect(-16, 34, 8, 12);
    rect(10, 30, 8, 12);
  } else {
    rect(-16, 32, 8, 12);
    rect(8, 32, 8, 12);
  }

  // 手臂和竹棍 - 按攻击帧变化
  if (state === "attack") {
    stroke(0);
    strokeWeight(3);
    fill(0);

    if (frame === 0) {
      // wind-up 准备动作
      rect(20, 0, 16, 8);  // 右臂后拉
      rect(-36, 0, 20, 8); // 左臂
      stroke(40, 180, 60);
      strokeWeight(6);
      line(0, -10, -40, -30); // 竹棍蓄力位置
    } else if (frame === 1) {
      // swing 正挥棍
      rect(20, -10, 30, 10); // 右臂挥出
      rect(-36, 0, 20, 8);
      stroke(40, 180, 60);
      strokeWeight(8);
      line(45, -10, 75, -30); // 竹棍挥动中
    } else if (frame === 2) {
      // recover 收势
      rect(10, 5, 20, 8);  // 手臂收回
      rect(-36, 0, 20, 8);
      stroke(40, 180, 60);
      strokeWeight(6);
      line(-30, 0, -60, 10); // 竹棍收起
    }

    stroke(0);
    strokeWeight(3);
  } else {
    // 默认手臂和竹棍
    fill(0);
    rect(20, 0, 16, 8);
    rect(-36, 0, 20, 8);
    stroke(40, 180, 60);
    strokeWeight(6);
    line(-40, 0, -70, -20);
    stroke(0);
    strokeWeight(3);
  }

  // 头
  fill(255);
  rect(-20, -36, 40, 40);
  fill(0);
  rect(-24, -48, 10, 10);
  rect(14, -48, 10, 10);
  rect(-10, -24, 12, 16);
  rect(4, -24, 12, 16);
  fill(255);
  rect(-6, -20, 4, 4);
  rect(8, -20, 4, 4);

  // 腰带
  fill(40, 180, 60);
  rect(-16, 24, 32, 6);
  rect(-4, 30, 8, 12);

  pop();
}

function handleMovement() {
  isWalking = false;
  if (!isAttacking) {
    if (keyIsDown(LEFT_ARROW)) {
      pandaX -= 2;
      facing = -1;
      isWalking = true;
    } else if (keyIsDown(RIGHT_ARROW)) {
      pandaX += 2;
      facing = 1;
      isWalking = true;
    }
  }
}

function handleWalkingAnimation() {
  if (isWalking && millis() - lastWalkSwitch > stepInterval) {
    walkFrame = (walkFrame + 1) % 2;
    lastWalkSwitch = millis();
  }
}

function keyPressed() {
  if (key === ' ' && !isAttacking) {
    isAttacking = true;
    currentAttackFrame = 0;
    attackFrameStartTime = millis();
  }
}
