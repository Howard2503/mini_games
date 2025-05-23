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
    message: "游戏加载中...", // Corrected potential encoding issue for this example
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
    textAlign(CENTER, CENTER);
    textSize(16);

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
    deck = [];
    playerHand = [];
    aiHand = [];
    discardPile = [];
    gameState.playerFormedCompounds = [];
    gameState.aiFormedCompounds = [];
    gameState.playerFormedCompoundsCount = 0;
    gameState.aiFormedCompoundsCount = 0;

    createFullDeck();
    shuffleDeck(deck);

    for (let i = 0; i < 13; i++) {
        let pCard = dealCard(deck);
        if (pCard) playerHand.push(pCard);
        let aiCard = dealCard(deck);
        if (aiCard) aiHand.push(aiCard);
    }
    let firstDraw = dealCard(deck);
    if (firstDraw) playerHand.push(firstDraw);

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

    currentlySelectedTile = null;
    currentlySelectedTileIndex = -1;
    isDraggingForReorder = false;
    isDraggingToDiscard = false;
    hideActionButtons();
    console.log("Game initialized. Player starts.");
    updateGameMessagesAndButtons(); 
    checkPlayerCanDeclareCompound();
}

function createFullDeck() {
    deck = [];
    chemicalTileData.forEach(tileInfo => {
        for (let i = 0; i < tileInfo.count; i++) {
            deck.push({ 
                id: tileInfo.value + "_" + i, 
                type: tileInfo.type, 
                value: tileInfo.value, 
                displayText: tileInfo.displayText,
                charge: tileInfo.charge || 0,
                isSelected: false,
                displayX: 0, 
                displayY: 0,
                isBeingDragged: false
            });
        }
    });
}

function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCard(sourceDeck) {
    if (sourceDeck.length > 0) {
        return sourceDeck.pop();
    }
    return null;
}

function drawGameAreas() {
    stroke(150);
    fill(240, 245, 235);
    rect(PLAYER_HAND_AREA_X, PLAYER_HAND_AREA_Y, PLAYER_HAND_AREA_WIDTH, PLAYER_HAND_AREA_HEIGHT);
    rect(AI_HAND_AREA_X, AI_HAND_AREA_Y, AI_HAND_AREA_WIDTH, AI_HAND_AREA_HEIGHT);
    rect(DISCARD_AREA_X_START, DISCARD_AREA_Y_START, DISCARD_AREA_WIDTH, DISCARD_AREA_HEIGHT);
    fill(0);
    noStroke();
    text("玩家手牌", PLAYER_HAND_AREA_X + PLAYER_HAND_AREA_WIDTH / 2, PLAYER_HAND_AREA_Y - 15);
    text("AI手牌", AI_HAND_AREA_X + AI_HAND_AREA_WIDTH / 2, AI_HAND_AREA_Y - 15);
    text("弃牌堆", DISCARD_AREA_X_START + DISCARD_AREA_WIDTH / 2, DISCARD_AREA_Y_START - 15);
    text(`玩家化合物: ${gameState.playerFormedCompoundsCount}/7`, FORMED_COMPOUNDS_AREA_X + 100, FORMED_COMPOUNDS_AREA_Y_PLAYER - 20);
    text(`AI化合物: ${gameState.aiFormedCompoundsCount}/7`, FORMED_COMPOUNDS_AREA_X + 100, FORMED_COMPOUNDS_AREA_Y_AI - 20);
}

function drawPlayerHand() {
    for (let i = 0; i < playerHand.length; i++) {
        let tile = playerHand[i];
        if (!tile.isBeingDragged) {
            let x = PLAYER_HAND_AREA_X + TILE_MARGIN + i * (TILE_WIDTH + TILE_MARGIN);
            let y = PLAYER_HAND_AREA_Y + TILE_MARGIN;
            if (tile.isSelected) {
                y += SELECTED_TILE_Y_OFFSET;
            }
            tile.displayX = x;
            tile.displayY = y;
            drawTile(tile, x, y, i, tile.isSelected, false, tile.isSelected ? SELECTED_TILE_SCALE : 1);
        }
    }
}

function drawAIHand() {
    for (let i = 0; i < aiHand.length; i++) {
        let x = AI_HAND_AREA_X + TILE_MARGIN + i * (TILE_WIDTH + TILE_MARGIN);
        let y = AI_HAND_AREA_Y + TILE_MARGIN;
        drawTile(aiHand[i], x, y, -1, false, true); 
    }
}

function drawDiscardPile() {
    let hoveredTileSource = null;
    let hoveredTileX = 0;
    let hoveredTileY = 0;
    // let hoveredTileDisplayText = ""; // Commented out, not needed for now

    for (let i = 0; i < discardPile.length; i++) {
        const tile = discardPile[i];
        const row = Math.floor(i / DISCARD_GRID_COLS);
        const col = i % DISCARD_GRID_COLS;
        const x = DISCARD_AREA_X_START + TILE_MARGIN + col * (TILE_WIDTH + TILE_MARGIN);
        const y = DISCARD_AREA_Y_START + TILE_MARGIN + row * (TILE_HEIGHT + TILE_MARGIN);
        
        drawTile(tile, x, y, -1, false, false);

        if (mouseX >= x && mouseX <= x + TILE_WIDTH && 
            mouseY >= y && mouseY <= y + TILE_HEIGHT) {
            hoveredTileSource = tile.source;
            hoveredTileX = x;
            hoveredTileY = y;
        }
    }

    if (hoveredTileSource) {
        push();
        fill(0); 
        textSize(10); 
        textAlign(CENTER, BOTTOM);
        let sourceText = "来源未知"; 
        if (hoveredTileSource === "player") {
            sourceText = "来自: 玩家";
        } else if (hoveredTileSource === "ai") {
            sourceText = "来自: AI";
        }
        text(sourceText, hoveredTileX + TILE_WIDTH / 2, hoveredTileY - 3); 
        pop();
    }
}

function drawFormedCompounds() {
    gameState.playerFormedCompounds.forEach((compound, index) => {
        const x = FORMED_COMPOUNDS_AREA_X + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN);
        const y = FORMED_COMPOUNDS_AREA_Y_PLAYER;
        fill(200, 200, 255);
        rect(x, y, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT);
        fill(0);
        text(compound.product, x + FORMED_COMPOUND_DISPLAY_WIDTH / 2, y + FORMED_COMPOUND_DISPLAY_HEIGHT / 2);
    });
    gameState.aiFormedCompounds.forEach((compound, index) => {
        const x = FORMED_COMPOUNDS_AREA_X + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN);
        const y = FORMED_COMPOUNDS_AREA_Y_AI;
        fill(255, 200, 200);
        rect(x, y, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT);
        fill(0);
        text(compound.product, x + FORMED_COMPOUND_DISPLAY_WIDTH / 2, y + FORMED_COMPOUND_DISPLAY_HEIGHT / 2);
    });
}

function drawDeck() {
    if (deck.length > 0) {
        fill(100, 100, 150);
        rect(DECK_X, DECK_Y, TILE_WIDTH, TILE_HEIGHT);
        fill(255);
        text(deck.length, DECK_X + TILE_WIDTH / 2, DECK_Y + TILE_HEIGHT / 2);
    }
    if (gameState.lastDiscardedTile && !gameState.canPlayerFormCompoundWithDiscard) {
        const x = DECK_X + TILE_WIDTH + TILE_MARGIN * 2;
        const y = DECK_Y;
        drawTile(gameState.lastDiscardedTile, x, y, -1, false, false);
        fill(0);
        text("弃", x + TILE_WIDTH/2, y - 10);
    }
}

function drawTile(tile, x, y, index, isSelected, isHidden, tileScale = 1) {
    push();
    translate(x + TILE_WIDTH / 2 * (1-tileScale), y + TILE_HEIGHT / 2 * (1-tileScale));
    scale(tileScale);

    stroke(0);
    strokeWeight(1);
    fill(isSelected ? [200, 220, 255] : [230, 230, 240]);
    rect(0, 0, TILE_WIDTH, TILE_HEIGHT, 5);

    if (!isHidden) {
        fill(0);
        noStroke();
        textSize(TILE_HEIGHT * 0.4);
        text(tile.displayText, TILE_WIDTH / 2, TILE_HEIGHT / 2);
    } else {
        fill(50, 50, 100); 
        rect(TILE_MARGIN/2, TILE_MARGIN/2, TILE_WIDTH - TILE_MARGIN, TILE_HEIGHT - TILE_MARGIN, 3);
    }
    pop();
}

function mousePressed() {
    if (gameState.isGameOver) return;

    if (gameState.currentPlayer === "player") {
        let clickedOnPlayerHandTile = false;
        for (let i = playerHand.length - 1; i >= 0; i--) {
            let tile = playerHand[i];
            let tileX = tile.displayX;
            let tileY = tile.isSelected ? tile.displayY - SELECTED_TILE_Y_OFFSET : tile.displayY;
            let tileScaledWidth = tile.isSelected ? TILE_WIDTH * SELECTED_TILE_SCALE : TILE_WIDTH;
            let tileScaledHeight = tile.isSelected ? TILE_HEIGHT * SELECTED_TILE_SCALE : TILE_HEIGHT;
            
            if (mouseX > tileX && mouseX < tileX + tileScaledWidth && mouseY > tileY && mouseY < tileY + tileScaledHeight) {
                if (currentlySelectedTile === tile) { 
                    // Double click or click selected tile again - attempt to discard
                    handleDiscardFromHand(i);
                    clickedOnPlayerHandTile = true;
                    break;
                } else {
                    if (currentlySelectedTile) currentlySelectedTile.isSelected = false;
                    tile.isSelected = true;
                    currentlySelectedTile = tile;
                    currentlySelectedTileIndex = i;
                    isDraggingForReorder = true;
                    isDraggingToDiscard = true; 
                    dragOffsetX = mouseX - tile.displayX;
                    dragOffsetY = mouseY - tile.displayY;
                    gameState.message = `选中: ${tile.displayText}. 拖动排序或弃牌.`;
                }
                clickedOnPlayerHandTile = true;
                break;
            }
        }

        if (!clickedOnPlayerHandTile) {
            if (currentlySelectedTile) {
                currentlySelectedTile.isSelected = false;
                currentlySelectedTile = null;
                currentlySelectedTileIndex = -1;
            }
            isDraggingForReorder = false;
            isDraggingToDiscard = false;
            if (mouseX > DECK_X && mouseX < DECK_X + TILE_WIDTH && mouseY > DECK_Y && mouseY < DECK_Y + TILE_HEIGHT) {
                playerDrawCardFromDeck();
            }
        }
    }
    updateGameMessagesAndButtons();
}

function mouseDragged() {
    if (gameState.isGameOver || !isDraggingForReorder || !currentlySelectedTile) return;
    currentlySelectedTile.isBeingDragged = true;
    currentlySelectedTile.displayX = mouseX - dragOffsetX;
    currentlySelectedTile.displayY = mouseY - dragOffsetY;

    if (isDraggingForReorder) {
        let hoverIndex = -1;
        for (let i = 0; i < playerHand.length; i++) {
            if (i === currentlySelectedTileIndex) continue;
            let otherTile = playerHand[i];
            let areaX = PLAYER_HAND_AREA_X + TILE_MARGIN + i * (TILE_WIDTH + TILE_MARGIN);
            if (mouseX > areaX && mouseX < areaX + TILE_WIDTH / 2) {
                hoverIndex = i;
                break;
            } else if (mouseX > areaX + TILE_WIDTH/2 && mouseX < areaX + TILE_WIDTH && i === playerHand.length -1 ){
                hoverIndex = i + 1;
                break;
            }
        }
        if (hoverIndex !== -1 && hoverIndex !== currentlySelectedTileIndex) {
            playerHand.splice(currentlySelectedTileIndex, 1);
            playerHand.splice(hoverIndex, 0, currentlySelectedTile);
            currentlySelectedTileIndex = hoverIndex;
        }
    }
}

function mouseReleased() {
    if (gameState.isGameOver) return;
    if (currentlySelectedTile) {
        currentlySelectedTile.isBeingDragged = false;
    }

    if (isDraggingToDiscard && currentlySelectedTile) {
        const discardAreaMinY = DISCARD_AREA_Y_START - TILE_HEIGHT; 
        if (mouseY < discardAreaMinY && mouseY < PLAYER_HAND_AREA_Y - TILE_HEIGHT * 1.5) { 
             handleDiscardFromHand(currentlySelectedTileIndex);
        } else {
            sortPlayerHand(); 
        }
    }
    isDraggingForReorder = false;
    isDraggingToDiscard = false;
    if (currentlySelectedTile && !currentlySelectedTile.isSelected) { 
        currentlySelectedTile = null;
        currentlySelectedTileIndex = -1;
    }
    updateGameMessagesAndButtons();
}

function handleDiscardFromHand(tileIndex) {
    if (tileIndex < 0 || tileIndex >= playerHand.length) return;
    if (gameState.currentPlayer !== "player" || playerHand.length <= 13) { // Cannot discard if hand is 13 or less unless it's the drawn card
        if (!(playerHand.length === 14 && playerHand[tileIndex] === playerHand[playerHand.length-1])){
             gameState.message = "手牌数量不足或未到出牌阶段，不能弃牌";
             if (currentlySelectedTile) currentlySelectedTile.isSelected = false;
             currentlySelectedTile = null;
             currentlySelectedTileIndex = -1;
             sortPlayerHand();
             return;
        }
    }

    const discardedTile = playerHand.splice(tileIndex, 1)[0];
    discardedTile.isSelected = false;
    discardedTile.source = "player";
    discardPile.push(discardedTile);
    gameState.lastDiscardedTile = discardedTile;
    currentlySelectedTile = null;
    currentlySelectedTileIndex = -1;
    sortPlayerHand(); 
    gameState.message = `你打出了 ${discardedTile.displayText}.`;
    console.log("Player discarded: ", discardedTile.displayText);
    endPlayerTurn();
}

function playerDrawCardFromDeck(){
    if (gameState.currentPlayer !== "player" || playerHand.length >= 14) {
        gameState.message = "现在不能摸牌";
        return;
    }
    if (deck.length > 0) {
        const drawnCard = dealCard(deck);
        playerHand.push(drawnCard);
        sortPlayerHand();
        gameState.message = `你摸到了 ${drawnCard.displayText}. 请出牌.`;
        console.log("Player drew: ", drawnCard.displayText);
        checkPlayerCanDeclareCompound();
    } else {
        gameState.message = "牌堆已空，无法摸牌.";
    }
    updateGameMessagesAndButtons();
}

function sortPlayerHand() {
    playerHand.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.value.localeCompare(b.value);
    });
    if (currentlySelectedTile) {
        currentlySelectedTileIndex = playerHand.indexOf(currentlySelectedTile);
    }
}

function endPlayerTurn() {
    gameState.currentPlayer = "ai";
    hideActionButtons();
    gameState.message = "轮到AI行动...";
    console.log("Switching to AI turn");
    setTimeout(aiTurn, 1000); 
}

function hideActionButtons(){
    if(formCompoundButton) formCompoundButton.hide();
    if(declareCompoundButton) declareCompoundButton.hide();
    if(skipButton) skipButton.hide();
    if(discardButton) discardButton.hide();
}

function updateGameMessagesAndButtons() {
    if (gameMessageElement) gameMessageElement.html(gameState.message);

    if (gameState.currentPlayer === "player" && !gameState.isGameOver) {
        if (sortHandButton) sortHandButton.show();
        if (gameState.canPlayerFormCompoundWithDiscard && formCompoundButton) {
            formCompoundButton.show();
        } else {
            if(formCompoundButton) formCompoundButton.hide();
        }
        if (gameState.canPlayerDeclareCompound && declareCompoundButton) {
            declareCompoundButton.show();
        } else {
            if(declareCompoundButton) declareCompoundButton.hide();
        }
        if (playerHand.length === 14 && discardButton) { 
            discardButton.show();
        } else {
            if(discardButton) discardButton.hide();
        }
        if (skipButton && (gameState.canPlayerFormCompoundWithDiscard || gameState.canPlayerDeclareCompound || playerHand.length === 14)) {
            skipButton.show();
        } else {
            if(skipButton) skipButton.hide();
        }
    } else {
        hideActionButtons();
        if(sortHandButton) sortHandButton.hide();
    }
}

function handleFormCompoundWithDiscardAction(){
    if (!gameState.canPlayerFormCompoundWithDiscard || !gameState.formableCompoundInfo) return;
    const { product, usedTiles, recipe } = gameState.formableCompoundInfo;
    console.log(`Player forming ${product} with discard.`);
    for (const tile of usedTiles) {
        if (tile.id !== gameState.lastDiscardedTile.id) {
            const handIndex = playerHand.findIndex(t => t.id === tile.id);
            if (handIndex !== -1) playerHand.splice(handIndex, 1);
        }
    }
    gameState.playerFormedCompounds.push({ product, recipe });
    gameState.playerFormedCompoundsCount++;
    gameState.message = `你使用弃牌 ${gameState.lastDiscardedTile.displayText} 组成了 ${product}! 请出牌.`;
    gameState.lastDiscardedTile = null; 
    gameState.canPlayerFormCompoundWithDiscard = false;
    gameState.formableCompoundInfo = null;
    sortPlayerHand();
    checkPlayerCanDeclareCompound();
    if (checkWinCondition("player")) return;
    updateGameMessagesAndButtons();
}

function handleDeclareCompoundAction(){
    if (!gameState.canPlayerDeclareCompound) return;
    const formable = checkFormableCompounds(playerHand, true); 
    if (formable) {
        console.log(`Player declaring ${formable.product} from hand.`);
        for (const tile of formable.usedTiles) {
            const handIndex = playerHand.findIndex(t => t.id === tile.id);
            if (handIndex !== -1) playerHand.splice(handIndex, 1);
        }
        gameState.playerFormedCompounds.push({ product: formable.product, recipe: formable.reactants });
        gameState.playerFormedCompoundsCount++;
        gameState.message = `你从手牌中组成了 ${formable.product}!`;
        sortPlayerHand();
        checkPlayerCanDeclareCompound(); 
        if (checkWinCondition("player")) return;
        if (playerHand.length < 14) { 
            playerDrawCardFromDeck(); 
        } else {
            gameState.message += " 请出牌.";
        }
    } else {
        gameState.message = "当前手牌无法宣告组成化合物.";
    }
    updateGameMessagesAndButtons();
}

function handleSkipAction(){
    gameState.canPlayerFormCompoundWithDiscard = false;
    gameState.formableCompoundInfo = null;
    if (gameState.lastDiscardedTile) {
         discardPile.push(gameState.lastDiscardedTile);
         gameState.lastDiscardedTile = null;
    }
    if (playerHand.length === 14) {
        gameState.message = "你跳过了操作，请出牌.";
    } else if (playerHand.length < 14 && deck.length > 0) {
        playerDrawCardFromDeck();
    } else {
        gameState.message = "你跳过了操作.";
        endPlayerTurn(); 
    }
    updateGameMessagesAndButtons();
}

function handleDiscardButtonAction(){
    if (currentlySelectedTile && playerHand.includes(currentlySelectedTile) && playerHand.length === 14) {
        handleDiscardFromHand(playerHand.indexOf(currentlySelectedTile));
    } else {
        gameState.message = "请先从14张手牌中选择一张牌来打出。";
    }
}

function checkPlayerCanDeclareCompound(){
    const formable = checkFormableCompounds(playerHand, true);
    gameState.canPlayerDeclareCompound = !!formable;
    if (formable) {
        console.log("Player can declare compound: ", formable.product);
    }
    return gameState.canPlayerDeclareCompound;
}

function checkFormableCompounds(hand, checkOnlyBest = false) {
    let bestFormable = null;
    for (const compoundName in compoundRecipes) {
        for (const recipe of compoundRecipes[compoundName]) {
            let tempHand = [...hand];
            let usedTiles = [];
            let possible = true;
            for (const reactant of recipe.reactants) {
                let foundCount = 0;
                for (let i = 0; i < reactant.count; i++) {
                    const tileIndex = tempHand.findIndex(t => t.type === reactant.type && t.value === reactant.value);
                    if (tileIndex !== -1) {
                        usedTiles.push(tempHand[tileIndex]);
                        tempHand.splice(tileIndex, 1);
                        foundCount++;
                    } else {
                        possible = false;
                        break;
                    }
                }
                if (!possible) break;
            }
            if (possible) {
                const currentFormable = { product: compoundName, reactants: recipe.reactants, usedTiles };
                if (checkOnlyBest) {
                    if (!bestFormable || usedTiles.length > bestFormable.usedTiles.length) { 
                        bestFormable = currentFormable;
                    }
                } else {
                    return currentFormable; 
                }
            }
        }
    }
    return bestFormable; 
}

function aiTurn() {
    console.log("AI turn starts.");
    if (gameState.isGameOver) return;

    if (gameState.lastDiscardedTile) {
        const formableWithDiscard = checkFormableCompounds([...aiHand, gameState.lastDiscardedTile]);
        if (formableWithDiscard && formableWithDiscard.usedTiles.some(t => t.id === gameState.lastDiscardedTile.id)) {
            console.log(`AI can form ${formableWithDiscard.product} with discarded tile ${gameState.lastDiscardedTile.displayText}`);
            for (const usedTile of formableWithDiscard.usedTiles) {
                if (usedTile.id !== gameState.lastDiscardedTile.id) {
                    const handIndex = aiHand.findIndex(t => t.id === usedTile.id);
                    if (handIndex !== -1) aiHand.splice(handIndex, 1);
                }
            }
            // gameState.discardPile.push(gameState.lastDiscardedTile); 
            gameState.aiFormedCompounds.push({ product: formableWithDiscard.product, recipe: formableWithDiscard.reactants });
            gameState.aiFormedCompoundsCount++;
            gameState.message = `AI 使用 ${formableWithDiscard.usedTiles.find(t=>t.id === gameState.lastDiscardedTile?.id)?.displayText || "弃牌"} 组成了 ${formableWithDiscard.product}!`;
            console.log(`AI formed ${formableWithDiscard.product}`);
            if (checkWinCondition("ai")) return;
            if (aiHand.length > 0) {
                const aiDiscard = aiHand.pop(); 
                aiDiscard.source = "ai";
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
        tileToDiscardAI.source = "ai"; // Added source for AI discard
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

