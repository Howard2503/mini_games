// Game state variables
let gameState = "start"; // "start", "playing", "gameOver", "win"
let items = [];
let collectedItems = [];
const maxCollectedItems = 12; // User"s version had 12
let itemTypes = [
  "1_wan", "2_wan", "3_wan", "4_wan", "5_wan", "6_wan", "7_wan", "8_wan", "9_wan",
  "1_tong", "2_tong", "3_tong", "4_tong", "5_tong", "6_tong", "7_tong", "8_tong", "9_tong",
  "1_tiao", "2_tiao", "3_tiao", "4_tiao", "5_tiao", "6_tiao", "7_tiao", "8_tiao", "9_tiao"
];
let itemImages = {}; // To store loaded images
let itemSize;
let canvasWidth;
let canvasHeight;
let gameArea;
let collectionBar;
let restartButton;
let isMobile = false;

// Preload images
function preload() {
  for (let type of itemTypes) {
    itemImages[type] = loadImage("mahjong/" + type + ".png");
  }
}

function setup() {
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
  } else {
    canvasWidth = 800;
    canvasHeight = 600;
  }
  
  let cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('canvas-container');
  cnv.elt.style.touchAction = "none"; 

  calculateLayout(); 
  
  // Get the restart button from HTML
  restartButton = select('#restart-button');
  restartButton.mousePressed(resetGame);

  resetGame();
}

function calculateLayout() {
  let availableHeight = canvasHeight;
  let topMargin = availableHeight * 0.08;
  let bottomUIMargin = availableHeight * 0.03;

  if (isMobile) {
    itemSize = Math.max(30, Math.min(windowWidth, windowHeight) * 0.11);
    gameArea = {
        x: canvasWidth * 0.05,
        y: topMargin,
        w: canvasWidth * 0.9,
        h: availableHeight * 0.50
    };
    collectionBar = {
        x: canvasWidth * 0.05,
        y: gameArea.y + gameArea.h + availableHeight * 0.03,
        w: canvasWidth * 0.9,
        h: itemSize * 1.5
    };
  } else { // Desktop
    itemSize = 50;
    let collectionBarHeight = itemSize * 1.5;
    
    // Calculate game area height (now we have more space since button is outside)
    let gameAreaHeight = availableHeight - topMargin - bottomUIMargin - collectionBarHeight - (availableHeight * 0.03);
    
    gameArea = {
        x: canvasWidth * 0.05,
        y: topMargin,
        w: canvasWidth * 0.9,
        h: gameAreaHeight
    };
    
    collectionBar = {
        x: canvasWidth * 0.05,
        y: gameArea.y + gameArea.h + (availableHeight * 0.03),
        w: canvasWidth * 0.9,
        h: collectionBarHeight
    };
  }
}

function windowResized() {
  if (isMobile) {
    let newWidth = windowWidth;
    let newHeight = windowHeight;
    if (canvasWidth !== newWidth || canvasHeight !== newHeight) {
        canvasWidth = newWidth;
        canvasHeight = newHeight;
        resizeCanvas(canvasWidth, canvasHeight);
        calculateLayout(); // Recalculate all layout dimensions
        positionRestartButton(); // Reposition button based on new layout
        
        if (gameState === "playing") {
            stackItems(); 
            updateClickableItems();
        }
        redraw(); 
    }
  } 
  // No resize handling for fixed-size desktop canvas
}

function touchStarted(event) {
  if (gameState === "playing") {
    if (touches.length > 0) {
        let touchX = touches[0].x;
        let touchY = touches[0].y;
        for (let i = items.length - 1; i >= 0; i--) { 
          let item = items[i];
          if (item.isClickable && 
              touchX > item.x - item.size / 2 && touchX < item.x + item.size / 2 &&
              touchY > item.y - item.size / 2 && touchY < item.y + item.size / 2) {
            if (collectedItems.length < maxCollectedItems) {
              collectItem(item, i);
              return false; 
            }
          }
        }
    }
  }
  return true; 
}

function mousePressed() {
  if (isMobile && touches.length > 0) return;

  if (gameState === "playing") {
    for (let i = items.length - 1; i >= 0; i--) {
      let item = items[i];
      if (item.isClickable && dist(mouseX, mouseY, item.x, item.y) < item.size / 2) {
        if (collectedItems.length < maxCollectedItems) {
          collectItem(item, i);
          return; 
        }
      }
    }
  }
}

function draw() {
  background(220);

  if (gameState === "playing") {
    drawGameArea();
    drawItems(); 
    drawCollectionBar(); 
    checkWinCondition();
    checkLoseCondition();
    restartButton.show(); 
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
    restartButton.show();
  } else if (gameState === "win") {
    drawWinScreen();
    restartButton.show();
  } else if (gameState === "start") {
     gameState = "playing"; 
  }
}

function drawGameArea() {
  fill(200, 220, 200); 
  noStroke();
  rect(gameArea.x, gameArea.y, gameArea.w, gameArea.h, 10); 
}

function drawItems() {
  let sortedForDisplay = [...items].sort((a, b) => a.layer - b.layer);
  for (let item of sortedForDisplay) {
    item.display();
  }
}

function drawCollectionBar() {
  fill(180, 200, 180); 
  noStroke();
  rect(collectionBar.x, collectionBar.y, collectionBar.w, collectionBar.h, 10);

  let collectedItemSize = itemSize * 0.85; 
  let spacing = (collectionBar.w - (maxCollectedItems * collectedItemSize)) / (maxCollectedItems + 1);
  if (spacing < 5) spacing = 5; 

  for (let i = 0; i < collectedItems.length; i++) {
    let item = collectedItems[i];
    let img = itemImages[item.type];
    let displayX = collectionBar.x + spacing + i * (collectedItemSize + spacing) + collectedItemSize / 2;
    let displayY = collectionBar.y + collectionBar.h / 2;
    
    imageMode(CENTER);
    if (img) {
        image(img, displayX, displayY, collectedItemSize, (img.height * collectedItemSize) / img.width);
    } else { 
        fill(100);
        rect(displayX - collectedItemSize/2, displayY - collectedItemSize/2, collectedItemSize, collectedItemSize);
    }
  }
   imageMode(CORNER); 
   for (let i = collectedItems.length; i < maxCollectedItems; i++) {
    fill(200, 210, 200, 150); 
    stroke(170, 190, 170);
    rect(collectionBar.x + spacing + i * (collectedItemSize + spacing), 
         collectionBar.y + (collectionBar.h - collectedItemSize) / 2, 
         collectedItemSize, collectedItemSize, 5);
  }
  noStroke();
}

function initializeItems() {
  items = [];
  let itemsPerTypeCount = Math.floor( (isMobile ? 21 : 30) / itemTypes.length) * 3; 
  if (itemsPerTypeCount === 0) itemsPerTypeCount = 3; 
  
  let idCounter = 0;
  for (let type of itemTypes) {
    for (let i = 0; i < itemsPerTypeCount; i++) {
      items.push(new Item(0, 0, type, idCounter++));
    }
  }
  shuffleArray(items);
  stackItems();
  updateClickableItems();
}

function stackItems() {
  let numLayers = isMobile ? 3 : 4; 
  let itemsPerApproxLayer = Math.ceil(items.length / numLayers);
  
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    item.layer = Math.floor(i / itemsPerApproxLayer);
    let paddingX = itemSize * 0.5;
    let paddingY = itemSize * 0.5;
    // Ensure items are within the gameArea bounds after random placement
    item.x = constrain(random(gameArea.x + paddingX, gameArea.x + gameArea.w - paddingX), gameArea.x + paddingX, gameArea.x + gameArea.w - paddingX);
    item.y = constrain(random(gameArea.y + paddingY, gameArea.y + gameArea.h - paddingY - (item.layer * itemSize * 0.05)), gameArea.y + paddingY, gameArea.y + gameArea.h - paddingY);
    item.rotation = random(-PI / 16, PI / 16); 
  }
}

function updateClickableItems() {
  for (let i = 0; i < items.length; i++) {
    let itemA = items[i];
    itemA.isClickable = true; 
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      let itemB = items[j];
      if (itemB.layer > itemA.layer) {
        let d = dist(itemA.x, itemA.y, itemB.x, itemB.y);
        if (d < itemSize * 0.6) { 
          itemA.isClickable = false;
          break; 
        }
      }
    }
  }
}

function collectItem(item, index) {
  collectedItems.push(item);
  items.splice(index, 1); 
  checkMatches();
  updateClickableItems(); 
}

function checkMatches() {
  if (collectedItems.length < 3) return;
  let counts = {};
  for (let item of collectedItems) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  for (let type in counts) {
    if (counts[type] >= 3) {
      let removedCount = 0;
      for (let i = collectedItems.length - 1; i >= 0; i--) {
        if (collectedItems[i].type === type && removedCount < 3) {
          collectedItems.splice(i, 1);
          removedCount++;
        }
      }
      if (removedCount > 0) checkMatches(); 
      break; 
    }
  }
}

function checkWinCondition() {
  if (items.length === 0 && collectedItems.length === 0) {
    gameState = "win";
  }
}

function checkLoseCondition() {
  if (collectedItems.length >= maxCollectedItems) {
    let canMakeMove = false;
    let collectionCounts = {};
    for(let item of collectedItems) {
        collectionCounts[item.type] = (collectionCounts[item.type] || 0) + 1;
    }
    for (let boardItem of items) {
        if (boardItem.isClickable) {
            if (collectionCounts[boardItem.type] && collectionCounts[boardItem.type] >= 2) {
                canMakeMove = true;
                break;
            }
        }
    }
    if (!canMakeMove) {
        let boardCounts = {};
        let clickableBoardItems = items.filter(item => item.isClickable);
        for(let item of clickableBoardItems) {
            boardCounts[item.type] = (boardCounts[item.type] || 0) + 1;
        }
        for(let type in boardCounts) {
            if(boardCounts[type] >=3) {
                canMakeMove = true;
                break;
            }
        }
    }
    if (!canMakeMove) {
        gameState = "gameOver";
    }
  }
}

function drawEndScreenText(message) {
  fill(0, 0, 0, 180);
  rect(0, 0, canvasWidth, canvasHeight);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 22 : 32);
  text(message, canvasWidth / 2, canvasHeight / 2 - (isMobile ? 30 : 50));
}

function drawWinScreen() {
  drawEndScreenText("恭喜！全部抓完啦！\nCongratulations! You got them all!");
}

function drawGameOverScreen() {
  drawEndScreenText("游戏结束！收集栏满了！\nGame Over! Collection bar is full!");
}

function resetGame() {
  collectedItems = [];
  initializeItems(); 
  gameState = "playing";
}

class Item {
  constructor(x, y, type, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = itemSize; 
    this.isClickable = false; 
    this.layer = 0; 
    this.rotation = 0;
    this.shadowOffset = isMobile ? 3 : 5;
  }

  display() {
    let img = itemImages[this.type];
    if (!img) return; 

    let displayWidth = this.size;
    let displayHeight = (img.height * this.size) / img.width;
    
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    imageMode(CENTER);

    tint(0, 50); 
    image(img, this.shadowOffset, this.shadowOffset, displayWidth, displayHeight);
    
    if (!this.isClickable) {
      tint(150, 150, 150, 200); 
    } else {
      noTint(); 
    }
    image(img, 0, 0, displayWidth, displayHeight);
    pop();
    noTint(); 
  }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

