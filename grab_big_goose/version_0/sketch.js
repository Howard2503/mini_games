// Game state variables
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'win'
let items = [];
let collectedItems = [];
const maxCollectedItems = 12;
let itemTypes = [
  '1_wan', '2_wan', '3_wan', '4_wan', '5_wan', '6_wan', '7_wan', '8_wan', '9_wan',
  '1_tong', '2_tong', '3_tong', '4_tong', '5_tong', '6_tong', '7_tong', '8_tong', '9_tong',
  '1_tiao', '2_tiao', '3_tiao', '4_tiao', '5_tiao', '6_tiao', '7_tiao', '8_tiao', '9_tiao'
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
    itemImages[type] = loadImage('mahjong/' + type + '.png');
  }
}

function setup() {
  // Check if device is mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Set canvas size based on device
  if (isMobile) {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    itemSize = Math.min(canvasWidth, canvasHeight) * 0.12; // 12% of smaller screen dimension
  } else {
    canvasWidth = 800;
    canvasHeight = 600;
    itemSize = 50;
  }
  
  createCanvas(canvasWidth, canvasHeight);
  
  // Update game areas
  gameArea = {
    x: canvasWidth * 0.05,
    y: canvasHeight * 0.1,
    w: canvasWidth * 0.9,
    h: canvasHeight * 0.6
  };
  
  collectionBar = {
    x: canvasWidth * 0.05,
    y: canvasHeight * 0.75,
    w: canvasWidth * 0.9,
    h: canvasHeight * 0.15
  };
  
  // Create and position restart button
  restartButton = createButton('重新开始 (Restart)');
  if (isMobile) {
    restartButton.style('font-size', '16px');
    restartButton.style('padding', '10px 20px');
  }
  positionRestartButton();
  
  // Add touch event listeners for mobile
  if (isMobile) {
    canvas.touchStarted(touchStarted);
  }
  
  resetGame();
}

function positionRestartButton() {
  let buttonX = canvasWidth / 2 - restartButton.width / 2;
  let buttonY = collectionBar.y + collectionBar.h + 20;
  restartButton.position(buttonX, buttonY);
}

function windowResized() {
  if (isMobile) {
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    resizeCanvas(canvasWidth, canvasHeight);
    
    // Update sizes
    itemSize = Math.min(canvasWidth, canvasHeight) * 0.12;
    
    // Update game areas
    gameArea = {
      x: canvasWidth * 0.05,
      y: canvasHeight * 0.1,
      w: canvasWidth * 0.9,
      h: canvasHeight * 0.6
    };
    
    collectionBar = {
      x: canvasWidth * 0.05,
      y: canvasHeight * 0.75,
      w: canvasWidth * 0.9,
      h: canvasHeight * 0.15
    };
    
    positionRestartButton();
    
    // Redraw the game
    if (gameState === 'playing') {
      stackItems();
      updateClickableItems();
    }
  }
}

function touchStarted(event) {
  if (gameState === 'playing') {
    // Convert touch coordinates to canvas coordinates
    let touchX = event.touches[0].clientX - canvas.elt.getBoundingClientRect().left;
    let touchY = event.touches[0].clientY - canvas.elt.getBoundingClientRect().top;
    
    // Check if an item is clicked
    for (let i = items.length - 1; i >= 0; i--) {
      let item = items[i];
      if (item.isClickable && dist(touchX, touchY, item.x, item.y) < item.size / 2) {
        if (collectedItems.length < maxCollectedItems) {
          collectItem(item, i);
          break;
        }
      }
    }
  }
  return false; // Prevent default touch behavior
}

function draw() {
  background(220);

  if (gameState === 'playing') {
    drawGameArea();
    drawItems();
    drawCollectionBar();
    checkWinCondition();
    checkLoseCondition();
  } else if (gameState === 'gameOver') {
    drawGameOverScreen();
  } else if (gameState === 'win') {
    drawWinScreen();
  } else if (gameState === 'start') {
    // For now, start directly into 'playing'
    // Later, can add a start screen
    gameState = 'playing';
  }
}

function drawGameArea() {
  fill(200);
  rect(gameArea.x, gameArea.y, gameArea.w, gameArea.h);
  fill(0);
  textAlign(CENTER, CENTER);
  // text("物品堆叠区 (Item Stacking Area)", gameArea.x + gameArea.w / 2, gameArea.y - 20);
}

function drawItems() {
  for (let item of items) {
    item.display();
  }
}

function drawCollectionBar() {
  fill(180);
  rect(collectionBar.x, collectionBar.y, collectionBar.w, collectionBar.h);
  fill(0);

  // Draw collected items
  for (let i = 0; i < collectedItems.length; i++) {
    let item = collectedItems[i];
    let img = itemImages[item.type];
    let displayWidth = itemSize;
    let displayHeight = (img.height * itemSize) / img.width;
    
    imageMode(CENTER);
    image(img, 
          collectionBar.x + 10 + i * (itemSize + 5) + itemSize/2, 
          collectionBar.y + collectionBar.h/2, 
          displayWidth, displayHeight);
    imageMode(CORNER);
  }
  // Draw empty slots
  for (let i = collectedItems.length; i < maxCollectedItems; i++) {
    fill(200);
    rect(collectionBar.x + 10 + i * (itemSize + 5), collectionBar.y + (collectionBar.h - itemSize) / 2, itemSize, itemSize);
  }
}

function initializeItems() {
  items = [];
  let totalItemsPerType = 15; // Must be a multiple of 3
  let idCounter = 0;

  for (let type of itemTypes) {
    for (let i = 0; i < totalItemsPerType; i++) {
      items.push(new Item(0, 0, type, idCounter++)); // Position will be set by stacking logic
    }
  }
  shuffleArray(items); // Shuffle for random stacking order
  stackItems();
  updateClickableItems();
}

function stackItems() {
  // Calculate the number of items per layer
  let itemsPerLayer = Math.floor(gameArea.w / (itemSize * 0.8));
  let currentLayer = 0;
  let itemsInLayer = 0;
  let layerHeight = itemSize * 0.6; // Height of each layer

  // First pass: assign layers and positions
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let col = itemsInLayer % itemsPerLayer;
    let row = Math.floor(itemsInLayer / itemsPerLayer);

    // Base position
    item.x = gameArea.x + (itemSize * 0.8) / 2 + col * (itemSize * 0.8);
    item.y = gameArea.y + layerHeight / 2 + row * layerHeight;

    // Add random offsets
    item.offsetX = random(-5, 5);
    item.offsetY = random(-5, 5);
    item.rotation = random(-0.1, 0.1); // Small random rotation
    item.x += item.offsetX;
    item.y += item.offsetY;

    // Assign layer
    item.layer = currentLayer;
    itemsInLayer++;

    // Start new layer if current layer is full
    if (itemsInLayer >= itemsPerLayer * 2) {
      currentLayer++;
      itemsInLayer = 0;
    }
  }

  // Second pass: adjust positions to create a more natural pile
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    // Add some vertical offset based on layer
    item.y += item.layer * 2;
    // Add some horizontal offset based on layer
    item.x += (item.layer % 2 === 0) ? 5 : -5;
  }
}

function updateClickableItems() {
  // Reset all items to not clickable
  for (let item of items) {
    item.isClickable = false;
  }

  // Sort items by layer (highest layer first)
  let sortedItems = [...items].sort((a, b) => b.layer - a.layer);

  // Check each item from top to bottom
  for (let i = 0; i < sortedItems.length; i++) {
    let itemA = sortedItems[i];
    let isBlocked = false;

    // Check if this item is blocked by any item above it
    for (let j = 0; j < i; j++) {
      let itemB = sortedItems[j];
      if (itemB.isClickable) {
        // Calculate distance between items
        let dx = itemA.x - itemB.x;
        let dy = itemA.y - itemB.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // If items are close enough, consider them overlapping
        if (distance < itemSize * 0.7) {
          isBlocked = true;
          break;
        }
      }
    }

    // If not blocked by any item above, make it clickable
    if (!isBlocked) {
      itemA.isClickable = true;
    }
  }
}

function collectItem(item, index) {
  collectedItems.push(item);
  items.splice(index, 1); // Remove from game area
  checkMatches();
  updateClickableItems(); // Re-evaluate which items are clickable
}

function checkMatches() {
  if (collectedItems.length < 3) return;

  let counts = {};
  for (let item of collectedItems) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  for (let type in counts) {
    if (counts[type] >= 3) {
      // Remove 3 items of this type from collectedItems
      let removedCount = 0;
      for (let i = collectedItems.length - 1; i >= 0; i--) {
        if (collectedItems[i].type === type && removedCount < 3) {
          collectedItems.splice(i, 1);
          removedCount++;
        }
      }
      // Recursively check for more matches if items were removed
      if (removedCount > 0) checkMatches(); 
      break; // Process one match group at a time
    }
  }
}

function checkWinCondition() {
  if (items.length === 0 && collectedItems.length === 0) {
    gameState = 'win';
  }
}

function checkLoseCondition() {
  if (collectedItems.length >= maxCollectedItems) {
    // Check if any further moves are possible (this is complex for a stacking game)
    // Simplified: if bar is full and no immediate match, it's a loss.
    // A more robust check would see if any 3 items of the same type exist among visible items + collection bar.
    let canMakeMove = false;
    let tempCollected = [...collectedItems]; // Simulate adding one more item
    
    // Check if any existing item in collection bar can form a set of 3 if one more is added
    let collectionCounts = {};
    for(let item of collectedItems) {
        collectionCounts[item.type] = (collectionCounts[item.type] || 0) + 1;
    }
    for(let type in collectionCounts) {
        if(collectionCounts[type] >= 2) { // If we have 2, adding one more of this type makes a match
            // Now check if such an item is available on the board
            for(let boardItem of items) {
                if(boardItem.type === type && boardItem.isClickable) {
                    canMakeMove = true;
                    break;
                }
            }
        }
        if(canMakeMove) break;
    }

    // If bar is full and no obvious next move leads to a clear, it's a loss.
    if (!canMakeMove) {
         // A more sophisticated check: are there 3 of any kind available on the board that could clear space?
        let boardCounts = {};
        let clickableBoardItems = items.filter(item => item.isClickable);
        for(let item of clickableBoardItems) {
            boardCounts[item.type] = (boardCounts[item.type] || 0) + 1;
        }
        let potentialBoardMatch = false;
        for(let type in boardCounts) {
            if(boardCounts[type] >=3) {
                potentialBoardMatch = true;
                break;
            }
        }
        if(!potentialBoardMatch && collectedItems.length === maxCollectedItems) {
             // If no 3 same items on board AND collection bar is full with no matches, then it's a loss.
            let hasMatchInBar = false;
            for(let type in collectionCounts) {
                if(collectionCounts[type] >=3) {
                    hasMatchInBar = true;
                    break;
                }
            }
            if(!hasMatchInBar) {
                gameState = 'gameOver';
            }
        }
    }
  }
}

function drawWinScreen() {
  fill(0, 150, 0, 200); // Semi-transparent green
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("恭喜！你抓完了所有大鹅！\nCongratulations! You caught all the geese!", width / 2, height / 2);
  restartButton.show();
}

function drawGameOverScreen() {
  fill(150, 0, 0, 200); // Semi-transparent red
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("游戏结束！收集栏满了！\nGame Over! Collection bar is full!", width / 2, height / 2);
  restartButton.show();
}

function resetGame() {
  collectedItems = [];
  initializeItems();
  gameState = 'playing';
  restartButton.hide(); // Hide button during play
}

// Item class
class Item {
  constructor(x, y, type, id) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = itemSize;
    this.isClickable = true;
    this.layer = 0;
    this.rotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.shadowOffset = 2;
  }

  display() {
    let img = itemImages[this.type];
    let displayWidth = this.size;
    let displayHeight = (img.height * this.size) / img.width;
    
    // Draw shadow
    push();
    imageMode(CENTER);
    tint(0, 50); // Semi-transparent black
    image(img, 
          this.x + this.shadowOffset, 
          this.y + this.shadowOffset, 
          displayWidth, displayHeight);
    pop();
    
    // Draw the actual image
    push();
    imageMode(CENTER);
    translate(this.x, this.y);
    rotate(this.rotation);
    if (!this.isClickable) {
      tint(128); // Darken if not clickable
    } else {
      noTint();
    }
    image(img, 0, 0, displayWidth, displayHeight);
    pop();
  }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Basic CSS can be added to style.css if needed for the button or page background

