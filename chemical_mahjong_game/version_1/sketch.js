// Global variables for game elements and state
let deck = [];
let playerHand = [];
let aiHand = [];
let discardPile = [];

// Game state object
let gameState = {
    currentPlayer: "player",
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    playerFormedCompounds: [], 
    aiFormedCompounds: [],   
    playerFormedCompoundsCount: 0,
    aiFormedCompoundsCount: 0,
    lastDiscardedTile: null,
    canPlayerFormCompoundWithDiscard: false, 
    formableCompoundInfo: null, 
    canPlayerDeclareCompound: false, 
    isGameOver: false,
    winner: null,
    message: "游戏加载中...",
};

// UI Elements from HTML
let formCompoundButton, declareCompoundButton, skipButton, gameMessageElement, sortHandButton, discardButton;

// Dimensions and Layout
const TILE_WIDTH = 45;
const TILE_HEIGHT = 65;
const TILE_MARGIN = 6;
const SELECTED_TILE_Y_OFFSET = -10; 
const SELECTED_TILE_SCALE = 1.1; 

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 700; 

const PLAYER_HAND_AREA_X = 10;
const PLAYER_HAND_AREA_Y = CANVAS_HEIGHT - TILE_HEIGHT - TILE_MARGIN * 4; 
const PLAYER_HAND_AREA_WIDTH = CANVAS_WIDTH - 20;
const PLAYER_HAND_AREA_HEIGHT = TILE_HEIGHT + 2 * TILE_MARGIN;

const AI_HAND_AREA_X = 10;
const AI_HAND_AREA_Y = TILE_MARGIN * 3 + 30; 
const AI_HAND_AREA_WIDTH = CANVAS_WIDTH - 20;
const AI_HAND_AREA_HEIGHT = TILE_HEIGHT + 2 * TILE_MARGIN;

const DISCARD_AREA_X_START = 150;
const DISCARD_AREA_Y_START = AI_HAND_AREA_Y + AI_HAND_AREA_HEIGHT + TILE_MARGIN * 3 + 30;
const DISCARD_GRID_COLS = 8;
const DISCARD_GRID_ROWS = 3;
const DISCARD_AREA_WIDTH = DISCARD_GRID_COLS * (TILE_WIDTH + TILE_MARGIN) + TILE_MARGIN;
const DISCARD_AREA_HEIGHT = DISCARD_GRID_ROWS * (TILE_HEIGHT + TILE_MARGIN) + TILE_MARGIN;

const FORMED_COMPOUNDS_AREA_Y_PLAYER = PLAYER_HAND_AREA_Y - TILE_HEIGHT - TILE_MARGIN * 5;
const FORMED_COMPOUNDS_AREA_Y_AI = AI_HAND_AREA_Y + AI_HAND_AREA_HEIGHT + TILE_MARGIN * 2;
const FORMED_COMPOUNDS_AREA_X = CANVAS_WIDTH - 350; 
const FORMED_COMPOUND_DISPLAY_WIDTH = 60;
const FORMED_COMPOUND_DISPLAY_HEIGHT = 30;

const DECK_X = 30;
const DECK_Y = DISCARD_AREA_Y_START + TILE_HEIGHT / 2;

// Interaction state
let currentlySelectedTile = null; 
let currentlySelectedTileIndex = -1; 
let isDraggingForReorder = false; 
let dragOffsetX, dragOffsetY;
let isDraggingToDiscard = false;

const chemicalTileData = [
    { type: "element", value: "H", displayText: "H", count: 10 },
    { type: "element", value: "O", displayText: "O", count: 10 },
    { type: "element", value: "Na", displayText: "Na", count: 6 },
    { type: "element", value: "Cl", displayText: "Cl", count: 6 },
    { type: "element", value: "C", displayText: "C", count: 6 },
    { type: "element", value: "S", displayText: "S", count: 4 },
    { type: "element", value: "N", displayText: "N", count: 4 },
    { type: "element", value: "Fe", displayText: "Fe", count: 4 },
    { type: "element", value: "Cu", displayText: "Cu", count: 4 },
    { type: "element", value: "Al", displayText: "Al", count: 4 },
    { type: "element", value: "Mg", displayText: "Mg", count: 4 },
    { type: "element", value: "Zn", displayText: "Zn", count: 2 },
    { type: "ion", value: "H+", displayText: "H⁺", count: 6, charge: 1 },
    { type: "ion", value: "OH-", displayText: "OH⁻", count: 6, charge: -1 },
    { type: "ion", value: "Na+", displayText: "Na⁺", count: 4, charge: 1 },
    { type: "ion", value: "Cl-", displayText: "Cl⁻", count: 4, charge: -1 },
    { type: "ion", value: "Ag+", displayText: "Ag⁺", count: 2, charge: 1 },
    { type: "ion", value: "Ba2+", displayText: "Ba²⁺", count: 2, charge: 2 },
    { type: "ion", value: "SO4^2-", displayText: "SO₄²⁻", count: 2, charge: -2 },
    { type: "ion", value: "Ca2+", displayText: "Ca²⁺", count: 2, charge: 2 },
    { type: "ion", value: "CO3^2-", displayText: "CO₃²⁻", count: 2, charge: -2 },
    { type: "ion", value: "Cu2+", displayText: "Cu²⁺", count: 2, charge: 2 },
    { type: "ion", value: "Fe2+", displayText: "Fe²⁺", count: 2, charge: 2 },
    { type: "ion", value: "Fe3+", displayText: "Fe³⁺", count: 2, charge: 3 },
    { type: "ion", value: "Al3+", displayText: "Al³⁺", count: 2, charge: 3 },
    { type: "ion", value: "Mg2+", displayText: "Mg²⁺", count: 2, charge: 2 },
    { type: "ion", value: "NH4+", displayText: "NH₄⁺", count: 2, charge: 1 },
];

const compoundRecipes = {
    "H2O": [
        { reactants: [{ type: "element", value: "H", count: 2 }, { type: "element", value: "O", count: 1 }], product: "H₂O" },
        { reactants: [{ type: "ion", value: "H+", count: 1 }, { type: "ion", value: "OH-", count: 1 }], product: "H₂O" }
    ],
    "NaCl": [
        { reactants: [{ type: "element", value: "Na", count: 1 }, { type: "element", value: "Cl", count: 1 }], product: "NaCl" },
        { reactants: [{ type: "ion", value: "Na+", count: 1 }, { type: "ion", value: "Cl-", count: 1 }], product: "NaCl" }
    ],
    "HCl": [
        { reactants: [{ type: "element", value: "H", count: 1 }, { type: "element", value: "Cl", count: 1 }], product: "HCl" }
    ],
    "CuO": [
        { reactants: [{ type: "element", value: "Cu", count: 1 }, { type: "element", value: "O", count: 1 }], product: "CuO" }
    ],
    "CO2": [
        { reactants: [{ type: "element", value: "C", count: 1 }, { type: "element", value: "O", count: 2 }], product: "CO₂" }
    ],
    "NH3": [
        { reactants: [{ type: "element", value: "N", count: 1 }, { type: "element", value: "H", count: 3 }], product: "NH₃" }
    ],
    "AgCl": [
        { reactants: [{ type: "ion", value: "Ag+", count: 1 }, { type: "ion", value: "Cl-", count: 1 }], product: "AgCl" }
    ],
    "BaSO4": [
        { reactants: [{ type: "ion", value: "Ba2+", count: 1 }, { type: "ion", value: "SO4^2-", count: 1 }], product: "BaSO₄" }
    ],
};

function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(document.querySelector("main"));
    textAlign(CENTER, CENTER); textSize(16);
    formCompoundButton = select("#formCompoundButton"); 
    declareCompoundButton = select("#declareCompoundButton"); 
    skipButton = select("#skipButton");
    sortHandButton = select("#sortHandButton");
    discardButton = select("#discardButton");
    gameMessageElement = select("#gameMessage");

    if (formCompoundButton) formCompoundButton.mousePressed(handleFormCompoundWithDiscardAction);
    if (declareCompoundButton) declareCompoundButton.mousePressed(handleDeclareCompoundAction);
    if (skipButton) skipButton.mousePressed(handleSkipAction);
    if (sortHandButton) sortHandButton.mousePressed(sortPlayerHand);
    if (discardButton) discardButton.mousePressed(handleDiscardButtonAction);
    
    initializeGame();
}

function draw() {
    background(220, 230, 210);
    drawGameAreas();
    drawPlayerHand();
    drawAIHand();
    drawDiscardPile();
    drawFormedCompounds();
    drawDeck();
    if ((isDraggingForReorder || isDraggingToDiscard) && currentlySelectedTile) {
        drawTile(currentlySelectedTile, mouseX - dragOffsetX, mouseY - dragOffsetY, -1, true, true, SELECTED_TILE_SCALE);
    }
    updateGameMessagesAndButtons();
}

function initializeGame() {
    deck = []; playerHand = []; aiHand = []; discardPile = [];
    gameState.playerFormedCompounds = []; gameState.aiFormedCompounds = [];
    gameState.playerFormedCompoundsCount = 0; gameState.aiFormedCompoundsCount = 0;

    createFullDeck(); 
    shuffleDeck(deck);
    
    for (let i = 0; i < 13; i++) { 
        let pCard = dealCard(deck); if (pCard) playerHand.push(pCard);
        let aiCard = dealCard(deck); if (aiCard) aiHand.push(aiCard);
    }
    let firstDraw = dealCard(deck); if (firstDraw) playerHand.push(firstDraw);

    Object.assign(gameState, {
        deck,
        playerHand,
        aiHand,
        discardPile,
        currentPlayer: "player",
        message: "游戏开始，请玩家出牌",
        lastDiscardedTile: null,
        canPlayerFormCompoundWithDiscard: false,
        formableCompoundInfo: null,
        canPlayerDeclareCompound: false,
        isGameOver: false,
        winner: null
    });
    currentlySelectedTile = null; currentlySelectedTileIndex = -1; 
    isDraggingForReorder = false; isDraggingToDiscard = false;
    hideActionButtons();
    console.log("Game Initialized with new rules and sort/discard features");
    checkPlayerCanDeclareCompound(); 
}

function createFullDeck() {
    let idCounter = 0;
    deck = [];
    chemicalTileData.forEach(tileInfo => {
        for (let i = 0; i < tileInfo.count; i++) {
            deck.push({
                id: `tile_${idCounter++}`,
                type: tileInfo.type, 
                value: tileInfo.value, 
                displayText: tileInfo.displayText, 
                charge: tileInfo.charge, // Add charge for sorting
                x: 0, y: 0, isSelected: false
            });
        }
    });
}

function shuffleDeck(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
function dealCard(currentDeck) { if (currentDeck.length > 0) { return currentDeck.pop(); } return null; }

function drawGameAreas() {
    stroke(100, 120, 80); noFill();
    rect(PLAYER_HAND_AREA_X, PLAYER_HAND_AREA_Y, PLAYER_HAND_AREA_WIDTH, PLAYER_HAND_AREA_HEIGHT, 5);
    rect(AI_HAND_AREA_X, AI_HAND_AREA_Y, AI_HAND_AREA_WIDTH, AI_HAND_AREA_HEIGHT, 5);
    // Discard Area Visual Cue (when dragging)
    if (isDraggingToDiscard) {
        fill(180, 200, 170, 150); // Semi-transparent highlight
    } else {
        noFill();
    }
    rect(DISCARD_AREA_X_START - TILE_MARGIN, DISCARD_AREA_Y_START - TILE_MARGIN, DISCARD_AREA_WIDTH, DISCARD_AREA_HEIGHT, 5);
    noFill(); // Reset fill
    rect(DECK_X, DECK_Y, TILE_WIDTH + 20, TILE_HEIGHT + 20, 5);
    fill(50, 60, 40); noStroke(); textSize(14);
    text("玩家手牌", PLAYER_HAND_AREA_X + PLAYER_HAND_AREA_WIDTH / 2, PLAYER_HAND_AREA_Y - 15);
    text("AI手牌", AI_HAND_AREA_X + AI_HAND_AREA_WIDTH / 2, AI_HAND_AREA_Y - 15); 
    text("弃牌堆", DISCARD_AREA_X_START + DISCARD_AREA_WIDTH / 2 - TILE_MARGIN, DISCARD_AREA_Y_START - TILE_MARGIN - 15); 
    text("牌堆", DECK_X + (TILE_WIDTH + 20) / 2, DECK_Y - TILE_HEIGHT/2 - 15 ); 
    text("玩家形成化合物: " + gameState.playerFormedCompoundsCount + "/7", FORMED_COMPOUNDS_AREA_X + 100, FORMED_COMPOUNDS_AREA_Y_PLAYER - 15);
    text("AI形成化合物: " + gameState.aiFormedCompoundsCount + "/7", FORMED_COMPOUNDS_AREA_X + 100, FORMED_COMPOUNDS_AREA_Y_AI - 15);
    textSize(16);
}

function drawPlayerHand() {
    let handDisplayWidth = 0;
    playerHand.forEach(tile => {
        handDisplayWidth += (tile.isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH) + TILE_MARGIN;
    });
    handDisplayWidth -= TILE_MARGIN; 
    let currentX = PLAYER_HAND_AREA_X + (PLAYER_HAND_AREA_WIDTH - handDisplayWidth) / 2;
    let tileY = PLAYER_HAND_AREA_Y + (PLAYER_HAND_AREA_HEIGHT - TILE_HEIGHT) / 2;
    for (let i = 0; i < playerHand.length; i++) {
        let tile = playerHand[i];
        let displayWidth = tile.isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH;
        let displayHeight = tile.isSelected ? TILE_HEIGHT * SELECTED_TILE_SCALE : TILE_HEIGHT;
        let yPos = tile.isSelected ? tileY + SELECTED_TILE_Y_OFFSET - (displayHeight - TILE_HEIGHT)/2 : tileY;
        if (!((isDraggingForReorder || isDraggingToDiscard) && tile === currentlySelectedTile)) {
             drawTile(tile, currentX, yPos, i, true, tile.isSelected, tile.isSelected ? SELECTED_TILE_SCALE : 1);
        }
        tile.x = currentX; tile.y = yPos; 
        currentX += displayWidth + TILE_MARGIN;
    }
}

function drawAIHand() {
    let handWidth = aiHand.length * (TILE_WIDTH + TILE_MARGIN) - TILE_MARGIN;
    let startX = AI_HAND_AREA_X + (AI_HAND_AREA_WIDTH - handWidth) / 2;
    let tileY = AI_HAND_AREA_Y + (AI_HAND_AREA_HEIGHT - TILE_HEIGHT) / 2;
    for (let i = 0; i < aiHand.length; i++) {
        fill(60, 80, 100); stroke(30, 40, 50);
        rect(startX + i * (TILE_WIDTH + TILE_MARGIN), tileY, TILE_WIDTH, TILE_HEIGHT, 8);
    }
}

function drawDiscardPile() {
    for (let i = 0; i < discardPile.length; i++) {
        const row = Math.floor(i / DISCARD_GRID_COLS); const col = i % DISCARD_GRID_COLS;
        if (row < DISCARD_GRID_ROWS) {
            drawTile(discardPile[i], DISCARD_AREA_X_START + col * (TILE_WIDTH + TILE_MARGIN), DISCARD_AREA_Y_START + row * (TILE_HEIGHT + TILE_MARGIN), -1, false);
        }
    }
}

function drawDeck() {
    if (deck.length > 0) {
        fill(80, 120, 80); stroke(40, 60, 40);
        rect(DECK_X + 10, DECK_Y + 10, TILE_WIDTH, TILE_HEIGHT, 8);
        fill(255); noStroke(); textSize(18); text(deck.length, DECK_X + 10 + TILE_WIDTH / 2, DECK_Y + 10 + TILE_HEIGHT / 2); textSize(16);
    }
}

function drawTile(tile, x, y, indexInHand = -1, isPlayerTile = false, isSelected = false, scaleFactor = 1) {
    if (!tile) return;
    push(); translate(x, y);
    if (isSelected && isPlayerTile) { fill(255, 255, 180); } else { fill(245, 245, 220); }
    stroke(150, 120, 90);
    rect(0, 0, TILE_WIDTH * scaleFactor, TILE_HEIGHT * scaleFactor, 8 * scaleFactor);
    fill(20, 20, 20); noStroke();
    let txtSize = 16 * scaleFactor; 
    if (tile.displayText.length > 5) txtSize = 10 * scaleFactor; 
    else if (tile.displayText.length > 2) txtSize = 12 * scaleFactor; 
    textSize(txtSize); text(tile.displayText, (TILE_WIDTH * scaleFactor) / 2, (TILE_HEIGHT * scaleFactor) / 2); textSize(16);
    pop();
}

function drawFormedCompounds() {
    let xPlayer = FORMED_COMPOUNDS_AREA_X;
    let yPlayer = FORMED_COMPOUNDS_AREA_Y_PLAYER;
    gameState.playerFormedCompounds.forEach((compound, index) => {
        fill(200, 220, 200); stroke(100,120,80);
        rect(xPlayer + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN), yPlayer, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT, 5);
        fill(0); noStroke(); textSize(12);
        text(compound.product, xPlayer + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN) + FORMED_COMPOUND_DISPLAY_WIDTH/2, yPlayer + FORMED_COMPOUND_DISPLAY_HEIGHT/2);
    });

    let xAI = FORMED_COMPOUNDS_AREA_X;
    let yAI = FORMED_COMPOUNDS_AREA_Y_AI;
    gameState.aiFormedCompounds.forEach((compound, index) => {
        fill(200, 200, 220); stroke(100,100,120);
        rect(xAI + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN), yAI, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT, 5);
        fill(0); noStroke(); textSize(12);
        text(compound.product, xAI + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN) + FORMED_COMPOUND_DISPLAY_WIDTH/2, yAI + FORMED_COMPOUND_DISPLAY_HEIGHT/2);
    });
    textSize(16);
}

function updateGameMessagesAndButtons() {
    if (gameMessageElement) gameMessageElement.html(gameState.message);
    if (gameState.canPlayerFormCompoundWithDiscard && formCompoundButton && skipButton) {
        formCompoundButton.show(); skipButton.show();
    } else if (formCompoundButton && skipButton) {
        formCompoundButton.hide(); skipButton.hide();
    }
    if (gameState.canPlayerDeclareCompound && declareCompoundButton) {
        declareCompoundButton.show();
    } else if (declareCompoundButton) {
        declareCompoundButton.hide();
    }
    if (currentlySelectedTile && gameState.currentPlayer === 'player' && !gameState.canPlayerFormCompoundWithDiscard && discardButton) {
        discardButton.show();
    } else if (discardButton) {
        discardButton.hide();
    }
}

function hideActionButtons() {
    if (formCompoundButton) formCompoundButton.hide();
    if (declareCompoundButton) declareCompoundButton.hide();
    if (skipButton) skipButton.hide();
    if (discardButton) discardButton.hide();
}

function canRecipeBeFormed(availableTiles, recipeReactants) {
    const tempAvailableTiles = availableTiles.map(tile => ({ ...tile }));
    let usedTilesForRecipe = [];
    for (const reactant of recipeReactants) {
        let foundCount = 0;
        for (let i = 0; i < reactant.count; i++) {
            const tileIndex = tempAvailableTiles.findIndex(t => t.type === reactant.type && t.value === reactant.value);
            if (tileIndex !== -1) {
                usedTilesForRecipe.push(tempAvailableTiles[tileIndex]);
                tempAvailableTiles.splice(tileIndex, 1);
                foundCount++;
            } else {
                return null; 
            }
        }
        if (foundCount < reactant.count) {
            return null; 
        }
    }
    return usedTilesForRecipe; 
}

function checkFormableCompounds(tilesToCheck) {
    for (const compoundName in compoundRecipes) {
        for (const recipe of compoundRecipes[compoundName]) {
            const usedTiles = canRecipeBeFormed(tilesToCheck, recipe.reactants);
            if (usedTiles) {
                return { product: recipe.product, reactants: recipe.reactants, usedTiles: usedTiles };
            }
        }
    }
    return null;
}

function checkPlayerCanFormCompoundWithDiscard() {
    if (!gameState.lastDiscardedTile) return false;
    const potentialHand = [...playerHand, gameState.lastDiscardedTile];
    const formable = checkFormableCompounds(potentialHand);
    if (formable) {
        gameState.canPlayerFormCompoundWithDiscard = true;
        gameState.formableCompoundInfo = formable;
        gameState.message = `你可以用 ${gameState.lastDiscardedTile.displayText} 组成 ${formable.product}！`;
        return true;
    }
    gameState.canPlayerFormCompoundWithDiscard = false;
    gameState.formableCompoundInfo = null;
    return false;
}

function checkPlayerCanDeclareCompound() {
    if (gameState.currentPlayer !== 'player') return false;
    const formable = checkFormableCompounds(playerHand);
    if (formable) {
        gameState.canPlayerDeclareCompound = true;
        gameState.formableCompoundInfo = formable; 
        return true;
    }
    gameState.canPlayerDeclareCompound = false;
    return false;
}

function handleFormCompoundWithDiscardAction() {
    if (!gameState.canPlayerFormCompoundWithDiscard || !gameState.formableCompoundInfo) return;
    const { product, usedTiles } = gameState.formableCompoundInfo;
    let discardUsed = false;
    for (const usedTile of usedTiles) {
        if (usedTile.id === gameState.lastDiscardedTile.id) {
            discardUsed = true;
        } else {
            const handIndex = playerHand.findIndex(t => t.id === usedTile.id);
            if (handIndex !== -1) playerHand.splice(handIndex, 1);
        }
    }
    if (discardUsed) {
        gameState.lastDiscardedTile = null; 
    } else {
        if(gameState.lastDiscardedTile) discardPile.push(gameState.lastDiscardedTile);
        gameState.lastDiscardedTile = null;
    }
    gameState.playerFormedCompounds.push({ product: product, recipe: gameState.formableCompoundInfo.reactants });
    gameState.playerFormedCompoundsCount++;
    gameState.message = `玩家组成了 ${product}!`;
    console.log(`Player formed ${product} using AI's discard.`);
    hideActionButtons();
    gameState.canPlayerFormCompoundWithDiscard = false;
    gameState.formableCompoundInfo = null;
    if (checkWinCondition("player")) return;
    gameState.currentPlayer = "player"; 
    gameState.message += " 请出牌。";
    currentlySelectedTile = null; 
    checkPlayerCanDeclareCompound(); 
}

function handleDeclareCompoundAction() {
    if (!gameState.canPlayerDeclareCompound || !gameState.formableCompoundInfo) return;
    const { product, usedTiles } = gameState.formableCompoundInfo;
    for (const usedTile of usedTiles) {
        const handIndex = playerHand.findIndex(t => t.id === usedTile.id);
        if (handIndex !== -1) playerHand.splice(handIndex, 1);
    }
    gameState.playerFormedCompounds.push({ product: product, recipe: gameState.formableCompoundInfo.reactants });
    gameState.playerFormedCompoundsCount++;
    gameState.message = `玩家从手牌中组成了 ${product}!`;
    console.log(`Player declared ${product} from hand.`);
    hideActionButtons();
    gameState.canPlayerDeclareCompound = false;
    gameState.formableCompoundInfo = null;
    if (checkWinCondition("player")) return;
    gameState.message += " 请出牌。";
    currentlySelectedTile = null; 
    checkPlayerCanDeclareCompound(); 
}

function handleSkipAction() {
    if (gameState.lastDiscardedTile) {
        discardPile.push(gameState.lastDiscardedTile);
        gameState.lastDiscardedTile = null;
    }
    gameState.canPlayerFormCompoundWithDiscard = false;
    gameState.formableCompoundInfo = null;
    hideActionButtons();
    gameState.message = "玩家跳过。AI回合摸牌...";
    gameState.currentPlayer = "ai";
    setTimeout(aiTurn, 1000);
}

function handleDiscardButtonAction() {
    if (currentlySelectedTile && currentlySelectedTileIndex !== -1) {
        playerDiscardTile(currentlySelectedTileIndex);
    }
}

function playerDiscardTile(tileIndex) {
    if (gameState.currentPlayer !== 'player' || gameState.isGameOver || tileIndex < 0 || tileIndex >= playerHand.length) return;
    const tileToDiscard = playerHand.splice(tileIndex, 1)[0];
    discardPile.push(tileToDiscard);
    gameState.lastDiscardedTile = tileToDiscard;
    tileToDiscard.isSelected = false;
    currentlySelectedTile = null;
    currentlySelectedTileIndex = -1;
    console.log("Player discarded:", tileToDiscard.displayText);
    gameState.message = `玩家打出了 ${tileToDiscard.displayText}. AI回合.`;
    hideActionButtons();
    gameState.canPlayerDeclareCompound = false; 
    gameState.currentPlayer = "ai";
    setTimeout(aiTurn, 1500); 
}

function mousePressed() {
    if (gameState.isGameOver || gameState.currentPlayer !== "player") return;
    if (gameState.canPlayerFormCompoundWithDiscard) return; 

    for (let i = 0; i < playerHand.length; i++) {
        let tile = playerHand[i];
        let tileDisplayWidth = tile.isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH;
        let tileDisplayHeight = tile.isSelected ? TILE_HEIGHT * SELECTED_TILE_SCALE : TILE_HEIGHT;
        if (mouseX > tile.x && mouseX < tile.x + tileDisplayWidth && mouseY > tile.y && mouseY < tile.y + tileDisplayHeight) {
            // DO NOT discard on second click of selected tile
            // if (currentlySelectedTile === tile) { 
            //     playerDiscardTile(i);
            //     return;
            // }
            if (currentlySelectedTile) { currentlySelectedTile.isSelected = false; }
            tile.isSelected = true; currentlySelectedTile = tile; currentlySelectedTileIndex = i;
            isDraggingForReorder = true; 
            isDraggingToDiscard = true; // Enable dragging to discard area
            dragOffsetX = mouseX - tile.x; dragOffsetY = mouseY - tile.y;
            return;
        }
    }
    if (currentlySelectedTile) {
        let handDisplayWidth = 0;
        playerHand.forEach(t => { handDisplayWidth += (t.isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH) + TILE_MARGIN; });
        handDisplayWidth -= TILE_MARGIN;
        let currentX = PLAYER_HAND_AREA_X + (PLAYER_HAND_AREA_WIDTH - handDisplayWidth) / 2;
        let tileYPos = PLAYER_HAND_AREA_Y + (PLAYER_HAND_AREA_HEIGHT - TILE_HEIGHT) / 2;
        for (let i = 0; i <= playerHand.length; i++) {
            let gapXStart, gapXEnd;
            let tileToCheck = playerHand[i-1];
            let prevTileWidth = (i > 0 && tileToCheck && tileToCheck.isSelected) ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH;
            if (i === 0) { 
                gapXStart = currentX - TILE_MARGIN / 2;
                gapXEnd = currentX + (playerHand[0].isSelected ? TILE_WIDTH*SELECTED_TILE_SCALE : TILE_WIDTH)/2 - TILE_MARGIN/2;
            } else if (i === playerHand.length) { 
                gapXStart = currentX - (prevTileWidth/2) - TILE_MARGIN/2; 
                gapXEnd = currentX + TILE_MARGIN / 2;
            } else { 
                gapXStart = currentX - (prevTileWidth/2) - TILE_MARGIN/2;
                gapXEnd = currentX + (playerHand[i].isSelected ? TILE_WIDTH*SELECTED_TILE_SCALE : TILE_WIDTH)/2 - TILE_MARGIN/2;
            }
            if (mouseX > gapXStart && mouseX < gapXEnd && mouseY > tileYPos && mouseY < tileYPos + TILE_HEIGHT) {
                let tileToMove = currentlySelectedTile;
                let originalIndex = playerHand.indexOf(tileToMove);
                if (originalIndex !== -1) playerHand.splice(originalIndex, 1);
                playerHand.splice(i, 0, tileToMove);
                isDraggingForReorder = false; 
                isDraggingToDiscard = false;
                return;
            }
            if (i < playerHand.length) {
                 currentX += (playerHand[i].isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH) + TILE_MARGIN;
            }
        }
    }
    if (currentlySelectedTile) { currentlySelectedTile.isSelected = false; currentlySelectedTile = null; currentlySelectedTileIndex = -1; }
    isDraggingForReorder = false; isDraggingToDiscard = false;
}

function mouseDragged() { 
    if (!isDraggingToDiscard && !isDraggingForReorder) return;
    // Visual feedback for dragging towards discard pile
    if (isDraggingToDiscard && currentlySelectedTile) {
        if (mouseX > DISCARD_AREA_X_START - TILE_MARGIN && mouseX < DISCARD_AREA_X_START - TILE_MARGIN + DISCARD_AREA_WIDTH &&
            mouseY > DISCARD_AREA_Y_START - TILE_MARGIN && mouseY < DISCARD_AREA_Y_START - TILE_MARGIN + DISCARD_AREA_HEIGHT) {
            // Highlight discard area or show some cue
        } else {
            // Remove highlight if mouse moves out
        }
    }
}

function mouseReleased() {
    if (isDraggingToDiscard && currentlySelectedTile) {
        if (mouseX > DISCARD_AREA_X_START - TILE_MARGIN && mouseX < DISCARD_AREA_X_START - TILE_MARGIN + DISCARD_AREA_WIDTH &&
            mouseY > DISCARD_AREA_Y_START - TILE_MARGIN && mouseY < DISCARD_AREA_Y_START - TILE_MARGIN + DISCARD_AREA_HEIGHT) {
            if (currentlySelectedTileIndex !== -1) {
                playerDiscardTile(currentlySelectedTileIndex);
            }
        } else {
            // If not dropped on discard pile, and was dragging for discard, deselect or snap back
            // For now, just deselect if not a reorder drag
            if (!isDraggingForReorder && currentlySelectedTile) {
                // currentlySelectedTile.isSelected = false; // Keep selected for discard button
                // currentlySelectedTile = null;
                // currentlySelectedTileIndex = -1;
            }
        }
    }
    isDraggingForReorder = false; 
    isDraggingToDiscard = false;
}

function sortPlayerHand() {
    playerHand.sort((a, b) => {
        // Priority: Cations, Anions, Elements
        const typeOrder = (tile) => {
            if (tile.type === 'ion' && tile.charge > 0) return 1; // Cation
            if (tile.type === 'ion' && tile.charge < 0) return 2; // Anion
            if (tile.type === 'element') return 3; // Element
            return 4; // Should not happen
        };
        const orderA = typeOrder(a);
        const orderB = typeOrder(b);
        if (orderA !== orderB) return orderA - orderB;
        // Within the same type, sort by displayText alphabetically
        return a.displayText.localeCompare(b.displayText);
    });
    if (currentlySelectedTile) { // Re-find index of selected tile if hand was sorted
        currentlySelectedTileIndex = playerHand.indexOf(currentlySelectedTile);
    }
    console.log("Player hand sorted.");
}

function aiTurn() {
    if (gameState.isGameOver || gameState.currentPlayer !== 'ai') return;
    hideActionButtons();
    if (gameState.lastDiscardedTile) {
        const potentialAIHand = [...aiHand, gameState.lastDiscardedTile];
        const formableWithDiscard = checkFormableCompounds(potentialAIHand);
        if (formableWithDiscard) {
            console.log("AI can form compound with discard: ", formableWithDiscard.product);
            let discardUsed = false;
            for (const usedTile of formableWithDiscard.usedTiles) {
                if (usedTile.id === gameState.lastDiscardedTile.id) {
                    discardUsed = true;
                } else {
                    const handIndex = aiHand.findIndex(t => t.id === usedTile.id);
                    if (handIndex !== -1) aiHand.splice(handIndex, 1);
                }
            }
            if (discardUsed) gameState.lastDiscardedTile = null;
            else if(gameState.lastDiscardedTile) discardPile.push(gameState.lastDiscardedTile); 
            gameState.aiFormedCompounds.push({ product: formableWithDiscard.product, recipe: formableWithDiscard.reactants });
            gameState.aiFormedCompoundsCount++;
            gameState.message = `AI 使用 ${formableWithDiscard.usedTiles.find(t=>t.id === gameState.lastDiscardedTile?.id)?.displayText || "弃牌"} 组成了 ${formableWithDiscard.product}!`;
            console.log(`AI formed ${formableWithDiscard.product}`);
            if (checkWinCondition("ai")) return;
            if (aiHand.length > 0) {
                const aiDiscard = aiHand.pop(); 
                discardPile.push(aiDiscard);
                gameState.lastDiscardedTile = aiDiscard;
                gameState.message += ` AI 打出了 ${aiDiscard.displayText}.`;
                console.log("AI discarded after forming compound: ", aiDiscard.displayText);
            } else {
                 gameState.message += " AI 无牌可打.";
            }
            gameState.currentPlayer = "player";
            playerTurnDraw();
            return;
        }
    }
    if (gameState.lastDiscardedTile) {
        discardPile.push(gameState.lastDiscardedTile);
        gameState.lastDiscardedTile = null;
    }
    gameState.message = "AI 正在摸牌...";
    const drawnCard = dealCard(deck);
    if (drawnCard) {
        aiHand.push(drawnCard);
        console.log("AI drew a card."); 
    } else {
        gameState.message = "牌堆已空，AI无法摸牌.";
        if (aiHand.length === 0 && deck.length === 0) { checkWinCondition(null); return; } 
    }
    const formableFromHand = checkFormableCompounds(aiHand);
    if (formableFromHand) {
        console.log("AI can declare compound from hand: ", formableFromHand.product);
        for (const usedTile of formableFromHand.usedTiles) {
            const handIndex = aiHand.findIndex(t => t.id === usedTile.id);
            if (handIndex !== -1) aiHand.splice(handIndex, 1);
        }
        gameState.aiFormedCompounds.push({ product: formableFromHand.product, recipe: formableFromHand.reactants });
        gameState.aiFormedCompoundsCount++;
        gameState.message = `AI 从手牌中组成了 ${formableFromHand.product}!`;
        console.log(`AI declared ${formableFromHand.product} from hand.`);
        if (checkWinCondition("ai")) return;
    }
    if (aiHand.length > 0) {
        let tileToDiscardAI;
        if (drawnCard && aiHand.includes(drawnCard)) { 
             const idx = aiHand.indexOf(drawnCard);
             tileToDiscardAI = aiHand.splice(idx, 1)[0];
        } else {
            tileToDiscardAI = aiHand.pop(); 
        }
        discardPile.push(tileToDiscardAI);
        gameState.lastDiscardedTile = tileToDiscardAI;
        gameState.message = `AI 打出了 ${tileToDiscardAI.displayText}. 轮到玩家.`;
        console.log("AI discarded: ", tileToDiscardAI.displayText);
    } else {
        gameState.message = "AI 无牌可打. 轮到玩家.";
        console.log("AI has no cards to discard.");
    }
    gameState.currentPlayer = "player";
    playerTurnDraw();
}

function playerTurnDraw() {
    if (gameState.isGameOver || gameState.currentPlayer !== 'player') return;
    hideActionButtons();
    gameState.message = "轮到玩家，请摸牌..."; 
    const drawnCard = dealCard(deck);
    if (drawnCard) {
        playerHand.push(drawnCard);
        gameState.message = `你摸到了 ${drawnCard.displayText}. 请出牌或组成化合物.`;
        console.log("Player drew: ", drawnCard.displayText);
    } else {
        gameState.message = "牌堆已空，无法摸牌. 请出牌或组成化合物.";
        if (playerHand.length === 0 && deck.length === 0) { checkWinCondition(null); return; } 
    }
    checkPlayerCanDeclareCompound();
}

function checkWinCondition(playerType) { 
    let targetCompounds = 7;
    if (playerType === "player" && gameState.playerFormedCompoundsCount >= targetCompounds) {
        gameState.isGameOver = true;
        gameState.winner = "player";
        gameState.message = "恭喜你！你组成了7个化合物，获得了胜利！";
        hideActionButtons();
        return true;
    } else if (playerType === "ai" && gameState.aiFormedCompoundsCount >= targetCompounds) {
        gameState.isGameOver = true;
        gameState.winner = "ai";
        gameState.message = "AI 组成了7个化合物，获得了胜利！";
        hideActionButtons();
        return true;
    }
    if (deck.length === 0 && !canAnyoneMakeProgress()) {
        gameState.isGameOver = true;
        gameState.winner = "stalemate";
        gameState.message = "牌堆已空，无人能组成更多化合物。平局！";
        hideActionButtons();
        return true;
    }
    return false;
}

function canAnyoneMakeProgress() {
    if (checkFormableCompounds(playerHand)) return true;
    if (checkFormableCompounds(aiHand)) return true;
    return false;
}

console.log("Sketch.js loaded with new sort and discard interaction features.");

