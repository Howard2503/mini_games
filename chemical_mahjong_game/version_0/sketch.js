// Global variables for game elements and state
let deck = [];
let playerHand = [];
let aiHand = [];
let discardPile = [];

// Game state object
let gameState = {
    currentPlayer: "player", // player or ai
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    playerFormedCompounds: [], 
    aiFormedCompounds: [],
    playerScores: [], // To store score for each compound
    aiScores: [],     // To store score for each compound
    playerTotalScore: 0,
    aiTotalScore: 0,
    message: "游戏加载中...",
    isGameOver: false,
    winner: null,
    actionPrompt: null, // e.g., {type: "form_compound_with_discard", tile: discardedTile, recipe: recipe}
    turnPhase: "player_draw_or_discard", // player_draw_or_discard, player_action, ai_turn
    animationQueue: [], // For managing sequential animations
    highlightedPlayerTiles: [], // { cardIds: [], recipeName: "" }
    selectedCompoundGroup: null, // { cardIds: [], recipeName: "", recipe: {} }
    lastActionTime: 0, // For AI turn delay
};

// UI Elements from HTML
let formCompoundButton, declareVictoryButton, skipButton, gameMessageElement, sortHandButton, discardActionButton, autoSortButton;

// Dimensions and Layout (mostly unchanged, might need minor adjustments for new buttons/info)
const TILE_WIDTH = 45;
const TILE_HEIGHT = 65;
const TILE_MARGIN = 6;
const SELECTED_TILE_Y_OFFSET = -15; 
const SELECTED_TILE_SCALE = 1.15; 
const HIGHLIGHT_SCALE = 1.05;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 750; // Increased height for more UI space if needed

const PLAYER_HAND_AREA_X = 10;
const PLAYER_HAND_AREA_Y = CANVAS_HEIGHT - TILE_HEIGHT - TILE_MARGIN * 5; 
const PLAYER_HAND_AREA_WIDTH = CANVAS_WIDTH - 20;
const PLAYER_HAND_AREA_HEIGHT = TILE_HEIGHT + 2 * TILE_MARGIN;

const AI_HAND_AREA_X = 10;
const AI_HAND_AREA_Y = TILE_MARGIN * 3 + 40; 
const AI_HAND_AREA_WIDTH = CANVAS_WIDTH - 20;
const AI_HAND_AREA_HEIGHT = TILE_HEIGHT + 2 * TILE_MARGIN;

const DISCARD_AREA_X_START = 150;
const DISCARD_AREA_Y_START = AI_HAND_AREA_Y + AI_HAND_AREA_HEIGHT + TILE_MARGIN * 4 + 40;
const DISCARD_GRID_COLS = 8;
const DISCARD_GRID_ROWS = 3;
const DISCARD_AREA_WIDTH = DISCARD_GRID_COLS * (TILE_WIDTH + TILE_MARGIN) + TILE_MARGIN;
const DISCARD_AREA_HEIGHT = DISCARD_GRID_ROWS * (TILE_HEIGHT + TILE_MARGIN) + TILE_MARGIN;

const FORMED_COMPOUNDS_AREA_Y_PLAYER = PLAYER_HAND_AREA_Y - TILE_HEIGHT - TILE_MARGIN * 6;
const FORMED_COMPOUNDS_AREA_Y_AI = AI_HAND_AREA_Y + AI_HAND_AREA_HEIGHT + TILE_MARGIN * 3;
const FORMED_COMPOUNDS_AREA_X_PLAYER = 10;
const FORMED_COMPOUNDS_AREA_X_AI = 10;
const FORMED_COMPOUND_DISPLAY_WIDTH = 70;
const FORMED_COMPOUND_DISPLAY_HEIGHT = 35;

const DECK_X = 30;
const DECK_Y = DISCARD_AREA_Y_START + TILE_HEIGHT / 2;

// Interaction state
let currentlySelectedTileInfo = null; // { tile: object, index: number, isPlayer: boolean }
let isDraggingForReorder = false; 
let dragOffsetX, dragOffsetY;
let isDraggingToDiscard = false;

// Animation constants
const ANIMATION_SPEED = 500; // ms for a card to travel

const chemicalTileData = [
    // Only ions and elements as per new rules
    { type: "element", value: "H", displayText: "H", count: 12, sortOrder: 301 },
    { type: "element", value: "O", displayText: "O", count: 10, sortOrder: 302 },
    { type: "element", value: "Na", displayText: "Na", count: 6, sortOrder: 303 },
    { type: "element", value: "Cl", displayText: "Cl", count: 6, sortOrder: 304 },
    { type: "element", value: "C", displayText: "C", count: 6, sortOrder: 305 },
    { type: "element", value: "S", displayText: "S", count: 4, sortOrder: 306 },
    { type: "element", value: "N", displayText: "N", count: 4, sortOrder: 307 },
    { type: "element", value: "Fe", displayText: "Fe", count: 4, sortOrder: 308 },
    { type: "element", value: "Cu", displayText: "Cu", count: 4, sortOrder: 309 },
    { type: "element", value: "Al", displayText: "Al", count: 4, sortOrder: 310 },
    { type: "element", value: "Mg", displayText: "Mg", count: 4, sortOrder: 311 },
    { type: "ion", value: "H+", displayText: "H⁺", count: 6, charge: 1, sortOrder: 101 },
    { type: "ion", value: "Na+", displayText: "Na⁺", count: 4, charge: 1, sortOrder: 102 },
    { type: "ion", value: "Ag+", displayText: "Ag⁺", count: 2, charge: 1, sortOrder: 103 },
    { type: "ion", value: "Ba2+", displayText: "Ba²⁺", count: 2, charge: 2, sortOrder: 104 },
    { type: "ion", value: "Ca2+", displayText: "Ca²⁺", count: 2, charge: 2, sortOrder: 105 },
    { type: "ion", value: "Cu2+", displayText: "Cu²⁺", count: 2, charge: 2, sortOrder: 106 },
    { type: "ion", value: "Fe2+", displayText: "Fe²⁺", count: 2, charge: 2, sortOrder: 107 },
    { type: "ion", value: "Fe3+", displayText: "Fe³⁺", count: 2, charge: 3, sortOrder: 108 },
    { type: "ion", value: "Al3+", displayText: "Al³⁺", count: 2, charge: 3, sortOrder: 109 },
    { type: "ion", value: "Mg2+", displayText: "Mg²⁺", count: 2, charge: 2, sortOrder: 110 },
    { type: "ion", value: "NH4+", displayText: "NH₄⁺", count: 2, charge: 1, sortOrder: 111 },
    { type: "ion", value: "OH-", displayText: "OH⁻", count: 6, charge: -1, sortOrder: 201 },
    { type: "ion", value: "Cl-", displayText: "Cl⁻", count: 4, charge: -1, sortOrder: 202 },
    { type: "ion", value: "SO4^2-", displayText: "SO₄²⁻", count: 2, charge: -2, sortOrder: 203 },
    { type: "ion", value: "CO3^2-", displayText: "CO₃²⁻", count: 2, charge: -2, sortOrder: 204 },
];

const compoundRecipes = [
    // N=2, Score=2
    { name: "NaCl", product: "NaCl", reactants: [{ value: "Na+", count: 1 }, { value: "Cl-", count: 1 }], score: 2 },
    { name: "AgCl", product: "AgCl", reactants: [{ value: "Ag+", count: 1 }, { value: "Cl-", count: 1 }], score: 2 },
    { name: "CuS", product: "CuS", reactants: [{ value: "Cu2+", count: 1 }, { value: "S", count: 1 }], score: 2 }, // Assuming S is element for simplicity here
    // N=3, Score=4
    { name: "H2O_ion", product: "H₂O", reactants: [{ value: "H+", count: 1 }, { value: "OH-", count: 1 }], score: 2 }, // This is N=2 actually
    { name: "H2O_elem", product: "H₂O", reactants: [{ value: "H", count: 2 }, { value: "O", count: 1 }], score: 4 },
    { name: "BaSO4", product: "BaSO₄", reactants: [{ value: "Ba2+", count: 1 }, { value: "SO4^2-", count: 1 }], score: 2 }, // N=2
    { name: "CaCO3", product: "CaCO₃", reactants: [{ value: "Ca2+", count: 1 }, { value: "CO3^2-", count: 1 }], score: 2 }, // N=2
    { name: "NH3", product: "NH₃", reactants: [{ value: "N", count: 1 }, { value: "H", count: 3 }], score: 8 }, // N=4
    { name: "HCl_elem", product: "HCl", reactants: [{ value: "H", count: 1 }, { value: "Cl", count: 1 }], score: 2 }, // N=2
    { name: "CO2", product: "CO₂", reactants: [{ value: "C", count: 1 }, { value: "O", count: 2 }], score: 4 }, // N=3
    // N=4, Score=8
    { name: "Al(OH)3", product: "Al(OH)₃", reactants: [{ value: "Al3+", count: 1 }, { value: "OH-", count: 3 }], score: 8 },
    { name: "Fe(OH)2", product: "Fe(OH)₂", reactants: [{ value: "Fe2+", count: 1 }, { value: "OH-", count: 2 }], score: 4 }, // N=3
    { name: "Fe(OH)3", product: "Fe(OH)₃", reactants: [{ value: "Fe3+", count: 1 }, { value: "OH-", count: 3 }], score: 8 }, // N=4
    // Add more recipes. Ensure `score` is 2^(N-1) where N is sum of reactant counts.
    // Correcting scores based on N for above:
    // H2O_ion: N=2, score=2
    // H2O_elem: N=3, score=4
    // BaSO4: N=2, score=2
    // CaCO3: N=2, score=2
    // NH3: N=4, score=8
    // HCl_elem: N=2, score=2
    // CO2: N=3, score=4
    // Al(OH)3: N=4, score=8
    // Fe(OH)2: N=3, score=4
    // Fe(OH)3: N=4, score=8
];
// Recalculate scores for recipes
compoundRecipes.forEach(recipe => {
    let n = 0;
    recipe.reactants.forEach(r => n += r.count);
    recipe.score = Math.pow(2, n - 1);
});


function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent(document.querySelector("main"));
    textAlign(CENTER, CENTER); textSize(16);
    
    formCompoundButton = select("#formCompoundButtonV3"); 
    declareVictoryButton = select("#declareVictoryButtonV3"); 
    autoSortButton = select("#autoSortButtonV3");
    discardActionButton = select("#discardActionButtonV3");
    gameMessageElement = select("#gameMessageV3");

    if (formCompoundButton) formCompoundButton.mousePressed(handleFormCompoundAction);
    if (declareVictoryButton) declareVictoryButton.mousePressed(handleDeclareVictoryAction);
    if (autoSortButton) autoSortButton.mousePressed(sortPlayerHand);
    if (discardActionButton) discardActionButton.mousePressed(handleDiscardSelectedTileAction);
    
    initializeGame();
}

function draw() {
    background(220, 230, 210);
    processAnimationQueue();
    drawGameAreas();
    drawPlayerHand();
    drawAIHand();
    drawDiscardPile();
    drawFormedCompounds();
    drawDeck();
    if ((isDraggingForReorder || isDraggingToDiscard) && currentlySelectedTileInfo && currentlySelectedTileInfo.tile) {
        const { tile } = currentlySelectedTileInfo;
        drawTile(tile, mouseX - dragOffsetX, mouseY - dragOffsetY, -1, true, true, SELECTED_TILE_SCALE, false);
    }
    updateGameMessagesAndButtons();

    if (gameState.currentPlayer === "ai" && 
        gameState.turnPhase === "ai_turn" && 
        gameState.animationQueue.length === 0 && 
        !gameState.isGameOver && 
        millis() - gameState.lastActionTime > 1000) {
        aiTurn(); // gameState.lastActionTime is now set inside aiTurn
    }
}

function initializeGame() {
    gameState.deck = []; 
    gameState.playerHand = []; 
    gameState.aiHand = []; 
    gameState.discardPile = [];
    gameState.playerFormedCompounds = []; 
    gameState.aiFormedCompounds = [];
    gameState.playerScores = [];
    gameState.aiScores = [];
    gameState.playerTotalScore = 0;
    gameState.aiTotalScore = 0;
    gameState.animationQueue = [];
    gameState.highlightedPlayerTiles = [];
    gameState.selectedCompoundGroup = null;

    createFullDeck(); 
    shuffleDeck(gameState.deck);
    
    // Initial deal with animation
    let delay = 0;
    for (let i = 0; i < 13; i++) { 
        addDealAnimation(gameState.deck, gameState.playerHand, true, delay + i * 2 * (ANIMATION_SPEED / 4));
        addDealAnimation(gameState.deck, gameState.aiHand, false, delay + (i * 2 + 1) * (ANIMATION_SPEED / 4));
    }
    addDealAnimation(gameState.deck, gameState.playerHand, true, delay + 13 * 2 * (ANIMATION_SPEED / 4)); // Player gets 14th card
    
    gameState.currentPlayer = "player";
    gameState.turnPhase = "player_action"; // Player starts with 14 cards, needs to discard or form
    gameState.message = "游戏开始，请玩家操作";
    gameState.isGameOver = false;
    gameState.winner = null;
    currentlySelectedTileInfo = null;
    isDraggingForReorder = false; 
    isDraggingToDiscard = false;
    hideAllActionButtons();
    // Initial check for compounds after dealing
    // Need to ensure animations complete before this check, or check in animation callback
    // For now, will check after a delay or assume player action triggers first real check
    setTimeout(() => {
        detectAndHighlightPlayerCompounds();
    }, (13 * 2 + 1) * (ANIMATION_SPEED / 4) + ANIMATION_SPEED + 500); 
}

// --- Animation System ---
function addDealAnimation(sourceDeck, targetHand, isPlayer, delay) {
    if (sourceDeck.length === 0) return;
    const card = sourceDeck.pop(); // Remove card from logical deck immediately
    if (!card) return;

    const targetX = isPlayer ? PLAYER_HAND_AREA_X + targetHand.length * (TILE_WIDTH + TILE_MARGIN) + 200 : AI_HAND_AREA_X + targetHand.length * (TILE_WIDTH + TILE_MARGIN) + 200; // Approximate target
    const targetY = isPlayer ? PLAYER_HAND_AREA_Y + TILE_HEIGHT / 2 : AI_HAND_AREA_Y + TILE_HEIGHT / 2;

    gameState.animationQueue.push({
        type: "deal", card: card, isPlayerCard: isPlayer,
        startX: DECK_X + TILE_WIDTH / 2, startY: DECK_Y + TILE_HEIGHT / 2,
        targetX: targetX, targetY: targetY, // Placeholder, will be refined
        startTime: millis() + delay,
        duration: ANIMATION_SPEED,
        progress: 0,
        isFlipping: false, flipProgress: 0,
        onComplete: () => {
            card.isRevealed = isPlayer; // AI cards aren't revealed in hand
            targetHand.push(card);
            if (isPlayer) {
                sortPlayerHand(); // Sort after each card for consistent placement if needed, or at end
                detectAndHighlightPlayerCompounds();
            }
        }
    });
}

function addDrawAnimation(sourceDeck, targetHand, isPlayer) {
    if (sourceDeck.length === 0) {
        endGame("draw_stalemate");
        return null;
    }
    const card = sourceDeck.pop();
    if (!card) return null;

    // Directly add card to hand and update state, bypassing animation queue for draws
    card.isRevealed = isPlayer;
    targetHand.push(card);
    if (isPlayer) {
        sortPlayerHand();
        detectAndHighlightPlayerCompounds();
        gameState.turnPhase = "player_action";
        gameState.message = "您摸了一张牌，请操作";
        updateGameMessagesAndButtons(); // Ensure UI updates after direct draw
    } else {
        // If AI draws, and its logic depends on the card, it should be handled here or in aiTurn
        // For now, just add to hand. AI logic will pick it up.
        // sortAiHand(); // If AI hand needs sorting and it's visible or affects logic
    }
    return card; 
}

function addDiscardAnimation(card, sourceHand, isPlayerSource, onCompleteCallback = null) {
    // Directly add card to discard pile and execute callback, bypassing animation queue
    gameState.discardPile.push(card);
    if (isPlayerSource) {
        // Remove card from player's hand if it's still there (it should have been removed by click logic)
        const playerHandIndex = gameState.playerHand.findIndex(c => c.id === card.id);
        if (playerHandIndex > -1) {
            gameState.playerHand.splice(playerHandIndex, 1);
            sortPlayerHand(); // Re-sort and update display positions
        }
    } else {
        // Remove card from AI's hand
        const aiHandIndex = gameState.aiHand.findIndex(c => c.id === card.id);
        if (aiHandIndex > -1) {
            gameState.aiHand.splice(aiHandIndex, 1);
            // sortAiHand(); // If AI hand needs sorting and it's visible or affects logic
        }
    }

    if (onCompleteCallback) {
        onCompleteCallback();
    }
    // No return value needed as it's not used like addDrawAnimation was for AI
}

function addFormCompoundAnimation(cardsToForm, targetPlayerState, compoundProduct) {
    cardsToForm.forEach((card, index) => {
        const targetX = (targetPlayerState === gameState.playerFormedCompounds ? FORMED_COMPOUNDS_AREA_X_PLAYER : FORMED_COMPOUNDS_AREA_X_AI) + 
                        targetPlayerState.length * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN) + FORMED_COMPOUND_DISPLAY_WIDTH / 2;
        const targetY = (targetPlayerState === gameState.playerFormedCompounds ? FORMED_COMPOUNDS_AREA_Y_PLAYER : FORMED_COMPOUNDS_AREA_Y_AI) + 
                        FORMED_COMPOUND_DISPLAY_HEIGHT / 2;
        
        let startX = card.displayX ? card.displayX + TILE_WIDTH/2 : PLAYER_HAND_AREA_X + PLAYER_HAND_AREA_WIDTH/2; // Approx
        let startY = card.displayY ? card.displayY + TILE_HEIGHT/2 : PLAYER_HAND_AREA_Y + TILE_HEIGHT/2; // Approx

        gameState.animationQueue.push({
            type: "form_compound_card_move", card: card,
            startX: startX, startY: startY,
            targetX: targetX, targetY: targetY,
            startTime: millis() + index * 50, // Stagger a bit
            duration: ANIMATION_SPEED,
            progress: 0,
            onComplete: () => {
                // Card visually disappears, compound appears
                if (index === cardsToForm.length - 1) { // Last card animation completes
                    // The actual addition to formedCompounds array happens in handleFormCompoundAction
                }
            }
        });
    });
}

function processAnimationQueue() {
    for (let i = gameState.animationQueue.length - 1; i >= 0; i--) {
        const anim = gameState.animationQueue[i];
        const currentTime = millis();
        if (currentTime < anim.startTime) continue; // Animation hasn't started yet

        anim.progress = (currentTime - anim.startTime) / anim.duration;
        if (anim.progress >= 1) {
            anim.progress = 1;
            // Draw one last time at target, then remove
            drawAnimatedTile(anim, true); 
            try {
                if (anim.onComplete) anim.onComplete();
            } catch (e) {
                console.error("Error in animation onComplete callback:", e, "Animation:", anim);
            } finally {
                gameState.animationQueue.splice(i, 1);
            }
        } else {
            drawAnimatedTile(anim, false);
        }
    }
}

function drawAnimatedTile(anim, isFinalFrame) {
    const card = anim.card;
    let currentX, currentY;
    if (isFinalFrame) {
        currentX = anim.targetX - TILE_WIDTH / 2;
        currentY = anim.targetY - TILE_HEIGHT / 2;
    } else {
        currentX = lerp(anim.startX, anim.targetX, anim.progress) - TILE_WIDTH / 2;
        currentY = lerp(anim.startY, anim.targetY, anim.progress) - TILE_HEIGHT / 2;
    }

    let displayCard = { ...card }; // Clone for animation display
    displayCard.isRevealed = (anim.type === "deal" || anim.type === "draw") ? anim.isPlayerCard : true;

    if ((anim.type === "deal" || anim.type === "draw") && anim.isPlayerCard) {
        // Flipping logic for player's dealt/drawn cards
        if (anim.progress > 0.5 && !anim.isFlipping) { // Start flipping past midpoint
            anim.isFlipping = true;
        }
        if (anim.isFlipping) {
            anim.flipProgress = (anim.progress - 0.5) * 2; // 0 to 1 over the second half
            anim.flipProgress = constrain(anim.flipProgress, 0, 1);
        }
    }

    push();
    translate(currentX + TILE_WIDTH / 2, currentY + TILE_HEIGHT / 2);
    
    if (anim.isFlipping) {
        // Calculate scale factor for flip effect
        let scaleFactor;
        if (anim.flipProgress > 0.5) {
            displayCard.isRevealed = true; // Show front
            scaleFactor = 1 - (anim.flipProgress - 0.5) * 2; // Scale from 1 to 0
        } else {
            displayCard.isRevealed = false; // Show back
            scaleFactor = anim.flipProgress * 2; // Scale from 0 to 1
        }
        // Apply scale transformation
        scale(scaleFactor, 1);
    }
    
    if (displayCard.isRevealed) {
        fill(245, 245, 220); stroke(150, 120, 90);
        rect(-TILE_WIDTH / 2, -TILE_HEIGHT / 2, TILE_WIDTH, TILE_HEIGHT, 8);
        fill(20); noStroke(); textSize(displayCard.displayText.length > 2 ? 12 : 16);
        text(displayCard.displayText, 0, 0);
    } else { // Draw card back
        fill(60, 80, 100); stroke(30, 40, 50);
        rect(-TILE_WIDTH / 2, -TILE_HEIGHT / 2, TILE_WIDTH, TILE_HEIGHT, 8);
    }
    pop();
}

// --- End Animation System ---

function createFullDeck() {
    let idCounter = 0;
    gameState.deck = [];
    chemicalTileData.forEach(tileInfo => {
        for (let i = 0; i < tileInfo.count; i++) {
            gameState.deck.push({
                id: `tile_${idCounter++}`,
                type: tileInfo.type, 
                value: tileInfo.value, 
                displayText: tileInfo.displayText, 
                charge: tileInfo.charge || 0,
                sortOrder: tileInfo.sortOrder,
                isRevealed: false, // Cards in deck are not revealed
                isSelected: false,
                isHighlighted: false, // For compound formation highlight
                x: 0, y: 0, // For display in hand
                displayX: 0, displayY: 0 // For precise animation start
            });
        }
    });
}

function shuffleDeck(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }

function drawGameAreas() {
    stroke(100, 120, 80); noFill();
    rect(PLAYER_HAND_AREA_X, PLAYER_HAND_AREA_Y, PLAYER_HAND_AREA_WIDTH, PLAYER_HAND_AREA_HEIGHT, 5);
    rect(AI_HAND_AREA_X, AI_HAND_AREA_Y, AI_HAND_AREA_WIDTH, AI_HAND_AREA_HEIGHT, 5);
    if (isDraggingToDiscard) { fill(180, 200, 170, 150); } else { noFill(); }
    rect(DISCARD_AREA_X_START - TILE_MARGIN, DISCARD_AREA_Y_START - TILE_MARGIN, DISCARD_AREA_WIDTH, DISCARD_AREA_HEIGHT, 5);
    noFill(); 
    rect(DECK_X, DECK_Y, TILE_WIDTH + 20, TILE_HEIGHT + 20, 5);
    fill(50, 60, 40); noStroke(); textSize(14);
    text("玩家手牌", PLAYER_HAND_AREA_X + PLAYER_HAND_AREA_WIDTH / 2, PLAYER_HAND_AREA_Y - 20);
    text("AI手牌", AI_HAND_AREA_X + AI_HAND_AREA_WIDTH / 2, AI_HAND_AREA_Y - 20); 
    text("弃牌堆", DISCARD_AREA_X_START + DISCARD_AREA_WIDTH / 2 - TILE_MARGIN, DISCARD_AREA_Y_START - TILE_MARGIN - 20); 
    text("牌堆", DECK_X + (TILE_WIDTH + 20) / 2, DECK_Y - TILE_HEIGHT/2 - 20 ); 
    text("玩家化合物: " + gameState.playerFormedCompounds.length + "/7 (得分: " + gameState.playerTotalScore + ")", FORMED_COMPOUNDS_AREA_X_PLAYER + 150, FORMED_COMPOUNDS_AREA_Y_PLAYER - 20);
    text("AI化合物: " + gameState.aiFormedCompounds.length + "/7 (得分: " + gameState.aiTotalScore + ")", FORMED_COMPOUNDS_AREA_X_AI + 150, FORMED_COMPOUNDS_AREA_Y_AI - 20);
    textSize(16);
}

function drawPlayerHand() {
    let handDisplayWidth = 0;
    gameState.playerHand.forEach(tile => {
        let scale = 1;
        if (currentlySelectedTileInfo && currentlySelectedTileInfo.tile && currentlySelectedTileInfo.tile.id === tile.id && !gameState.selectedCompoundGroup) {
            scale = SELECTED_TILE_SCALE;
        } else if (gameState.selectedCompoundGroup && gameState.selectedCompoundGroup.cardIds.includes(tile.id)) {
            scale = SELECTED_TILE_SCALE; // Highlight for compound group
        } else if (tile.isHighlighted) {
            scale = HIGHLIGHT_SCALE;
        }
        handDisplayWidth += (TILE_WIDTH * scale) + TILE_MARGIN;
    });
    handDisplayWidth -= TILE_MARGIN; 
    let currentX = PLAYER_HAND_AREA_X + (PLAYER_HAND_AREA_WIDTH - handDisplayWidth) / 2;
    
    for (let i = 0; i < gameState.playerHand.length; i++) {
        let tile = gameState.playerHand[i];
        let scale = 1;
        let yOffset = 0;
        let isActuallySelected = (currentlySelectedTileInfo && currentlySelectedTileInfo.tile && currentlySelectedTileInfo.tile.id === tile.id && !gameState.selectedCompoundGroup) || 
                               (gameState.selectedCompoundGroup && gameState.selectedCompoundGroup.cardIds.includes(tile.id));

        if (isActuallySelected) {
            scale = SELECTED_TILE_SCALE;
            yOffset = SELECTED_TILE_Y_OFFSET;
        } else if (tile.isHighlighted) {
            scale = HIGHLIGHT_SCALE;
            // Optional: slight y-offset for just highlighted cards if different from selected
        }

        let displayWidth = TILE_WIDTH * scale;
        let displayHeight = TILE_HEIGHT * scale;
        let tileY = PLAYER_HAND_AREA_Y + (PLAYER_HAND_AREA_HEIGHT - TILE_HEIGHT) / 2; // Base Y
        let yPos = tileY + yOffset - (displayHeight - TILE_HEIGHT)/2; // Adjust for scale and offset

        if (!((isDraggingForReorder || isDraggingToDiscard) && currentlySelectedTileInfo && currentlySelectedTileInfo.tile === tile)) {
             drawTile(tile, currentX, yPos, i, true, isActuallySelected, scale, tile.isHighlighted && !isActuallySelected);
        }
        tile.displayX = currentX; tile.displayY = yPos; // Store actual draw position
        currentX += displayWidth + TILE_MARGIN;
    }
}

function drawAIHand() {
    let handWidth = gameState.aiHand.length * (TILE_WIDTH + TILE_MARGIN) - TILE_MARGIN;
    let startX = AI_HAND_AREA_X + (AI_HAND_AREA_WIDTH - handWidth) / 2;
    let tileY = AI_HAND_AREA_Y + (AI_HAND_AREA_HEIGHT - TILE_HEIGHT) / 2;
    for (let i = 0; i < gameState.aiHand.length; i++) {
        fill(60, 80, 100); stroke(30, 40, 50);
        rect(startX + i * (TILE_WIDTH + TILE_MARGIN), tileY, TILE_WIDTH, TILE_HEIGHT, 8);
    }
}

function drawDiscardPile() {
    for (let i = 0; i < gameState.discardPile.length; i++) {
        const row = Math.floor(i / DISCARD_GRID_COLS); const col = i % DISCARD_GRID_COLS;
        if (row < DISCARD_GRID_ROWS) {
            drawTile(gameState.discardPile[i], DISCARD_AREA_X_START + col * (TILE_WIDTH + TILE_MARGIN), DISCARD_AREA_Y_START + row * (TILE_HEIGHT + TILE_MARGIN), -1, true, false, 1, false);
        }
    }
}

function drawDeck() {
    if (gameState.deck.length > 0) {
        fill(80, 120, 80); stroke(40, 60, 40);
        rect(DECK_X + 10, DECK_Y + 10, TILE_WIDTH, TILE_HEIGHT, 8);
        fill(255); noStroke(); textSize(18); text(gameState.deck.length, DECK_X + 10 + TILE_WIDTH / 2, DECK_Y + 10 + TILE_HEIGHT / 2); textSize(16);
    }
}

function drawTile(tile, x, y, indexInHand = -1, isPlayerTile = false, isSelected = false, scaleFactor = 1, isGeneralHighlight = false) {
    if (!tile) return;
    push(); 
    translate(x, y);
    
    if (isSelected) { 
        fill(255, 255, 150); // Stronger yellow for selected (part of group or single)
    } else if (isGeneralHighlight) {
        fill(220, 255, 220); // Light green for general highlight (reflection effect)
    } else {
        fill(245, 245, 220); 
    }
    stroke(150, 120, 90);
    if (isGeneralHighlight || isSelected) {
        strokeWeight(2.5);
        stroke(100,180,100); // Reflection effect border
    }

    rect(0, 0, TILE_WIDTH * scaleFactor, TILE_HEIGHT * scaleFactor, 8 * scaleFactor);
    strokeWeight(1); // Reset stroke weight

    fill(20, 20, 20); noStroke();
    let txtSize = 16 * scaleFactor; 
    if (tile.displayText.length > 5) txtSize = 10 * scaleFactor; 
    else if (tile.displayText.length > 2) txtSize = 12 * scaleFactor; 
    textSize(txtSize); text(tile.displayText, (TILE_WIDTH * scaleFactor) / 2, (TILE_HEIGHT * scaleFactor) / 2); textSize(16);
    pop();
}

function drawFormedCompounds() {
    // Player
    let yPlayer = FORMED_COMPOUNDS_AREA_Y_PLAYER;
    gameState.playerFormedCompounds.forEach((compound, index) => {
        let xPos = FORMED_COMPOUNDS_AREA_X_PLAYER + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN);
        fill(200, 220, 200); stroke(100,120,80);
        rect(xPos, yPlayer, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT, 5);
        fill(0); noStroke(); textSize(10);
        text(compound.product, xPos + FORMED_COMPOUND_DISPLAY_WIDTH/2, yPlayer + FORMED_COMPOUND_DISPLAY_HEIGHT/2 - 5);
        textSize(8);
        text(compound.score + "分", xPos + FORMED_COMPOUND_DISPLAY_WIDTH/2, yPlayer + FORMED_COMPOUND_DISPLAY_HEIGHT/2 + 8);
    });

    // AI
    let yAI = FORMED_COMPOUNDS_AREA_Y_AI;
    gameState.aiFormedCompounds.forEach((compound, index) => {
        let xPos = FORMED_COMPOUNDS_AREA_X_AI + index * (FORMED_COMPOUND_DISPLAY_WIDTH + TILE_MARGIN);
        fill(200, 200, 220); stroke(100,100,120);
        rect(xPos, yAI, FORMED_COMPOUND_DISPLAY_WIDTH, FORMED_COMPOUND_DISPLAY_HEIGHT, 5);
        fill(0); noStroke(); textSize(10);
        text(compound.product, xPos + FORMED_COMPOUND_DISPLAY_WIDTH/2, yAI + FORMED_COMPOUND_DISPLAY_HEIGHT/2 - 5);
        textSize(8);
        text(compound.score + "分", xPos + FORMED_COMPOUND_DISPLAY_WIDTH/2, yAI + FORMED_COMPOUND_DISPLAY_HEIGHT/2 + 8);
    });
    textSize(16);
}

function updateGameMessagesAndButtons() {
    if (gameMessageElement) gameMessageElement.html(gameState.message);
    hideAllActionButtons(); // Hide all first, then show relevant ones

    if (gameState.isGameOver) {
        // Handle game over display, maybe show a restart button
        return;
    }

    if (gameState.currentPlayer === "player" && gameState.turnPhase === "player_action") {
        if (gameState.selectedCompoundGroup) {
            if (formCompoundButton) formCompoundButton.show();
            if (discardActionButton && currentlySelectedTileInfo) discardActionButton.show(); // Can still discard the primary selected tile
        } else if (currentlySelectedTileInfo) {
            if (discardActionButton) discardActionButton.show();
        }
        // Declare Victory button
        if (gameState.playerFormedCompounds.length >= 7 && declareVictoryButton) {
            declareVictoryButton.show();
        }
    }
    // Add logic for AI's turn prompts if any (e.g. if AI can use player's discard)
}

function hideAllActionButtons() {
    if (formCompoundButton) formCompoundButton.hide();
    if (declareVictoryButton) declareVictoryButton.hide();
    if (discardActionButton) discardActionButton.hide();
    // Skip button was removed as player always has an action (discard/form/declare)
}

// --- Compound Detection & Highlighting ---
function detectAndHighlightPlayerCompounds() {
    gameState.playerHand.forEach(tile => tile.isHighlighted = false);
    gameState.highlightedPlayerTiles = [];
    if (gameState.playerHand.length === 0) return;

    for (const recipe of compoundRecipes) {
        const result = canRecipeBeFormedWithSpecificCards(gameState.playerHand, recipe.reactants);
        if (result.canForm) {
            gameState.highlightedPlayerTiles.push({ 
                cardIds: result.usedCardIds, 
                recipeName: recipe.name,
                recipe: recipe // Store the full recipe for later use
            });
            result.usedCardIds.forEach(id => {
                const tile = gameState.playerHand.find(t => t.id === id);
                if (tile) tile.isHighlighted = true;
            });
        }
    }
}

function canRecipeBeFormedWithSpecificCards(availableTiles, recipeReactants) {
    let tempHand = availableTiles.map(t => ({...t, used: false})); // Mark tiles as unused initially
    let usedCardIds = [];
    let canForm = true;

    for (const reactant of recipeReactants) {
        let foundCount = 0;
        for (let i = 0; i < tempHand.length; i++) {
            if (!tempHand[i].used && tempHand[i].value === reactant.value) {
                tempHand[i].used = true;
                usedCardIds.push(tempHand[i].id);
                foundCount++;
                if (foundCount === reactant.count) break;
            }
        }
        if (foundCount < reactant.count) {
            canForm = false;
            break;
        }
    }
    return { canForm, usedCardIds };
}

// --- Player Actions ---
function mousePressed() {
    if (gameState.isGameOver || gameState.animationQueue.length > 0) return;
    if (gameState.currentPlayer !== "player" || gameState.turnPhase !== "player_action") return;

    // Check if clicked on a player hand tile
    for (let i = gameState.playerHand.length - 1; i >= 0; i--) {
        const tile = gameState.playerHand[i];
        const tileX = tile.displayX; // Use stored displayX
        const tileY = tile.displayY; // Use stored displayY
        let tileScaledWidth = TILE_WIDTH;
        let tileScaledHeight = TILE_HEIGHT;

        if ((currentlySelectedTileInfo && currentlySelectedTileInfo.tile && currentlySelectedTileInfo.tile.id === tile.id && !gameState.selectedCompoundGroup) || 
            (gameState.selectedCompoundGroup && gameState.selectedCompoundGroup.cardIds.includes(tile.id))) {
            tileScaledWidth *= SELECTED_TILE_SCALE;
            tileScaledHeight *= SELECTED_TILE_SCALE;
        } else if (tile.isHighlighted) {
            tileScaledWidth *= HIGHLIGHT_SCALE;
            tileScaledHeight *= HIGHLIGHT_SCALE;
        }

        if (mouseX > tileX && mouseX < tileX + tileScaledWidth && mouseY > tileY && mouseY < tileY + tileScaledHeight) {
            handlePlayerTileClick(tile, i);
            return;
        }
    }

    // Clicked outside hand, deselect if something was selected
    if (currentlySelectedTileInfo || gameState.selectedCompoundGroup) {
        deselectAllPlayerTiles();
    }
}

function handlePlayerTileClick(tile, index) {
    if (gameState.selectedCompoundGroup && gameState.selectedCompoundGroup.cardIds.includes(tile.id)) {
        // Clicking a tile already part of a selected compound group - no change, wait for button press
        // Or, if we want to allow deselecting the group by clicking one of its cards again:
        // deselectAllPlayerTiles(); 
        return;
    }

    deselectAllPlayerTiles(); // Deselect previous single or group selection
    currentlySelectedTileInfo = { tile, index, isPlayer: true };
    tile.isSelected = true; // Visual cue for single selection

    // Check if this selected tile is part of any new compound group
    const participatingGroups = gameState.highlightedPlayerTiles.filter(group => group.cardIds.includes(tile.id));

    if (participatingGroups.length > 0) {
        // For simplicity, pick the first group it participates in. 
        // TODO: If a card can be in multiple groups, need UI to choose.
        const chosenGroup = participatingGroups[0]; 
        gameState.selectedCompoundGroup = chosenGroup;
        chosenGroup.cardIds.forEach(id => {
            const t = gameState.playerHand.find(card => card.id === id);
            if (t) t.isSelected = true; // Mark all in group as selected
        });
        gameState.message = `选中化合物 ${chosenGroup.recipe.product} 的材料，点击"化合"或"出牌"`;
    } else {
        // Just a single tile selected, not part of a currently formable group (or highlighting is off)
        gameState.message = `选中 ${tile.displayText}，点击"出牌"或拖拽到弃牌区`;
    }
    updateGameMessagesAndButtons();
}

function mouseDragged() {
    if (gameState.isGameOver || gameState.animationQueue.length > 0) return;
    if (!currentlySelectedTileInfo || gameState.selectedCompoundGroup) return; // No dragging if a compound group is selected

    if (!isDraggingForReorder && !isDraggingToDiscard) {
        isDraggingForReorder = true; // Default to reorder drag
        dragOffsetX = mouseX - currentlySelectedTileInfo.tile.displayX;
        dragOffsetY = mouseY - currentlySelectedTileInfo.tile.displayY;
    }

    // Check if dragging over discard area
    if (mouseX > DISCARD_AREA_X_START - TILE_MARGIN && mouseX < DISCARD_AREA_X_START - TILE_MARGIN + DISCARD_AREA_WIDTH &&
        mouseY > DISCARD_AREA_Y_START - TILE_MARGIN && mouseY < DISCARD_AREA_Y_START - TILE_MARGIN + DISCARD_AREA_HEIGHT) {
        isDraggingToDiscard = true;
        isDraggingForReorder = false;
    } else {
        isDraggingToDiscard = false;
        // If not over discard, and was dragging for reorder, continue reorder logic (or implement it)
        // For now, reordering by drag is simplified: it's either discard or nothing happens on release unless over hand slot
    }
}

function mouseReleased() {
    if (gameState.isGameOver || gameState.animationQueue.length > 0) return;
    if (isDraggingToDiscard && currentlySelectedTileInfo && !gameState.selectedCompoundGroup) {
        playerDiscardTile(currentlySelectedTileInfo.tile, currentlySelectedTileInfo.index);
    } else if (isDraggingForReorder && currentlySelectedTileInfo && !gameState.selectedCompoundGroup) {
        // Implement reordering logic here if desired: find new position in hand
        // For now, just reset drag state
        const releaseIndex = getPlayerHandDropIndex(mouseX);
        if (releaseIndex !== -1 && releaseIndex !== currentlySelectedTileInfo.index) {
            const tileToMove = gameState.playerHand.splice(currentlySelectedTileInfo.index, 1)[0];
            gameState.playerHand.splice(releaseIndex, 0, tileToMove);
            sortPlayerHand(); // Or just redraw, then sort if auto-sort is off
            detectAndHighlightPlayerCompounds();
        }
    }
    isDraggingForReorder = false;
    isDraggingToDiscard = false;
    // Don't deselect here, selection is handled by clicks or actions
}

function getPlayerHandDropIndex(mx) {
    let handDisplayWidth = 0;
    gameState.playerHand.forEach(tile => {
        let scale = (currentlySelectedTileInfo && currentlySelectedTileInfo.tile && currentlySelectedTileInfo.tile.id === tile.id) ? SELECTED_TILE_SCALE : (tile.isHighlighted ? HIGHLIGHT_SCALE : 1);
        handDisplayWidth += (TILE_WIDTH * scale) + TILE_MARGIN;
    });
    handDisplayWidth -= TILE_MARGIN; 
    let currentX = PLAYER_HAND_AREA_X + (PLAYER_HAND_AREA_WIDTH - handDisplayWidth) / 2;

    for (let i = 0; i < gameState.playerHand.length; i++) {
        const tile = gameState.playerHand[i];
        let scale = (currentlySelectedTileInfo && currentlySelectedTileInfo.tile && currentlySelectedTileInfo.tile.id === tile.id) ? SELECTED_TILE_SCALE : (tile.isHighlighted ? HIGHLIGHT_SCALE : 1);
        const tileSlotWidth = (TILE_WIDTH * scale) + TILE_MARGIN;
        // Check midpoint of the slot
        if (mx < currentX + tileSlotWidth / 2) return i;
        currentX += tileSlotWidth;
    }
    return gameState.playerHand.length; // Drop at the end
}

function deselectAllPlayerTiles() {
    if (currentlySelectedTileInfo && currentlySelectedTileInfo.tile) {
        currentlySelectedTileInfo.tile.isSelected = false;
    }
    if (gameState.selectedCompoundGroup) {
        gameState.selectedCompoundGroup.cardIds.forEach(id => {
            const t = gameState.playerHand.find(card => card.id === id);
            if (t) t.isSelected = false;
        });
    }
    currentlySelectedTileInfo = null;
    gameState.selectedCompoundGroup = null;
    hideAllActionButtons();
    gameState.message = "请选择手牌操作";
}

function handleDiscardSelectedTileAction() {
    if (currentlySelectedTileInfo && !gameState.selectedCompoundGroup) { // Only if a single tile is selected
        playerDiscardTile(currentlySelectedTileInfo.tile, currentlySelectedTileInfo.index);
    }
}

function playerDiscardTile(tileToDiscard, indexInHand) {
    if (gameState.currentPlayer !== "player" || gameState.turnPhase !== "player_action") return;
    if (!tileToDiscard) return;

    gameState.playerHand.splice(indexInHand, 1);
    addDiscardAnimation(tileToDiscard, gameState.playerHand, true);
    
    deselectAllPlayerTiles();
    detectAndHighlightPlayerCompounds(); // Recheck after discard
    gameState.message = `玩家打出 ${tileToDiscard.displayText}`;
    endPlayerTurn(tileToDiscard);
}

function handleFormCompoundAction() {
    if (gameState.currentPlayer !== "player" || !gameState.selectedCompoundGroup) return;

    const { cardIds, recipe } = gameState.selectedCompoundGroup;
    let cardsToRemove = [];
    cardIds.forEach(id => {
        const cardIndex = gameState.playerHand.findIndex(t => t.id === id);
        if (cardIndex !== -1) {
            cardsToRemove.push(gameState.playerHand.splice(cardIndex, 1)[0]);
        }
    });

    if (cardsToRemove.length === recipe.reactants.reduce((sum, r) => sum + r.count, 0)) {
        addFormCompoundAnimation(cardsToRemove, gameState.playerFormedCompounds, recipe.product);
        const formedCompoundEntry = { product: recipe.product, score: recipe.score, cardsUsedCount: cardsToRemove.length };
        gameState.playerFormedCompounds.push(formedCompoundEntry);
        gameState.playerTotalScore += recipe.score;
        gameState.message = `玩家合成了 ${recipe.product}!`;

        // Replenishment logic
        const numToReplenish = Math.max(0, cardsToRemove.length - 2);
        for (let i = 0; i < numToReplenish; i++) {
            if (gameState.deck.length > 0) {
                addDrawAnimation(gameState.deck, gameState.playerHand, true); // Animates and adds to hand
            } else {
                gameState.message += " (牌堆已空，无法补牌)";
                break;
            }
        }
        if (gameState.playerFormedCompounds.length >= 7) {
            // Player can now declare victory
            gameState.message += " 已达成7个化合物，可以宣告胜利！";
        } else if (numToReplenish === 0) {
             // If no replenishment, player's turn might effectively end here, or they might need to discard if hand is full
             // For now, forming a compound and not replenishing means turn ends.
             // The logic for turn progression needs to be clear: forming compound is an action, then AI turn.
        }

    } else {
        // Should not happen if selection is correct, put cards back or error
        gameState.playerHand.push(...cardsToRemove); // Put back if failed
        gameState.message = "合成失败，请重试";
    }
    
    deselectAllPlayerTiles();
    detectAndHighlightPlayerCompounds();
    // Forming a compound is an action, then it's AI's turn (after animations)
    // No discard needed after forming compound
    setTimeout(() => { // Ensure animations have a chance to start
        endPlayerTurn(null); // No discard from player, AI's turn
    }, ANIMATION_SPEED + 100); 
}

function handleDeclareVictoryAction() {
    if (gameState.playerFormedCompounds.length >= 7) {
        endGame("player_victory");
    }
}

function sortPlayerHand() {
    gameState.playerHand.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
        }
        return a.displayText.localeCompare(b.displayText);
    });
    deselectAllPlayerTiles();
    detectAndHighlightPlayerCompounds();
}

function endPlayerTurn(discardedTile) {
    gameState.currentPlayer = "ai";
    gameState.turnPhase = "ai_turn";
    gameState.message = "轮到AI行动...";
    gameState.lastActionTime = millis();
    deselectAllPlayerTiles();
    // AI turn logic will be called from draw() after a delay
}

// --- AI Logic (Placeholder) ---
function aiTurn() {
    if (gameState.isGameOver || gameState.animationQueue.length > 0 || gameState.turnPhase !== "ai_turn") return; // Added turnPhase check for re-entrancy
    gameState.lastActionTime = millis(); // Set lastActionTime at the beginning of AI's actual turn processing
    gameState.turnPhase = "ai_processing"; // Mark AI as processing to prevent re-entry from draw()

    gameState.message = "AI 思考中...";

    // 1. AI draws a card
    let drawnCard = null;
    if (gameState.deck.length > 0) {
        drawnCard = gameState.deck.pop();
        if (drawnCard) gameState.aiHand.push(drawnCard);
        // gameState.message = "AI 摸了一张牌"; // Message updated later or in animation
    } else {
        endGame("draw_stalemate");
        return;
    }

    // Simple AI: Check for compounds first, then discard if no compounds can be formed
    setTimeout(() => {
        if (gameState.isGameOver) return; // Check game over again, as timeout might fire late

        if (gameState.aiHand.length > 0) {
            // TODO: Add compound formation logic for AI
            // For now, just discard the first card
            const cardToDiscard = gameState.aiHand.splice(0, 1)[0];
            addDiscardAnimation(cardToDiscard, gameState.aiHand, false, () => {
                // This callback ensures turn switches only after discard animation is complete
                if (gameState.isGameOver) return;
                switchToPlayerTurnClean();
            });
            gameState.message = `AI 打出了 ${cardToDiscard.displayText}`;
        } else {
            // AI has no cards to discard, should not happen if drawing correctly
            // but if it does, switch back to player.
            switchToPlayerTurnClean();
        }
    }, 1000); // AI thinking delay
}

function endGame(reason) {
    gameState.isGameOver = true;
    hideAllActionButtons();
    switch (reason) {
        case "player_victory":
            gameState.winner = "player";
            gameState.message = `恭喜玩家胜利！最终得分: ${gameState.playerTotalScore}`;
            break;
        case "ai_victory":
            gameState.winner = "ai";
            gameState.message = `AI 胜利！最终得分: ${gameState.aiTotalScore}`;
            break;
        case "draw_stalemate":
            gameState.message = "牌堆已空，流局！";
            // Implement流局胜负判定
            if (gameState.playerFormedCompounds.length > gameState.aiFormedCompounds.length) gameState.winner = "player";
            else if (gameState.aiFormedCompounds.length > gameState.playerFormedCompounds.length) gameState.winner = "ai";
            else { // Same number of compounds, compare scores
                if (gameState.playerTotalScore > gameState.aiTotalScore) gameState.winner = "player";
                else if (gameState.aiTotalScore > gameState.playerTotalScore) gameState.winner = "ai";
                else gameState.winner = "draw";
            }
            if(gameState.winner === "player") gameState.message += ` 玩家以 ${gameState.playerTotalScore} 分险胜!`;
            else if(gameState.winner === "ai") gameState.message += ` AI以 ${gameState.aiTotalScore} 分险胜!`;
            else gameState.message += ` 双方平局! 玩家: ${gameState.playerTotalScore}, AI: ${gameState.aiTotalScore}`;
            break;
    }
    console.log("Game Over: ", gameState.message);
}

// Ensure p5.js uses instance mode if this were part of a larger app, but for standalone it's fine.




function switchToPlayerTurnClean() {
    try {
        if (gameState.isGameOver) return;
        // console.log("Switching to player turn. Animation queue length:", gameState.animationQueue.length); // For debugging

        gameState.currentPlayer = "player";
        gameState.turnPhase = "player_draw_or_discard"; 
        gameState.message = "轮到玩家，请摸牌或操作";
        
        detectAndHighlightPlayerCompounds();
        updateGameMessagesAndButtons(); 

        // console.log("Player turn set. Animation queue length after switch:", gameState.animationQueue.length); // For debugging
    } catch (e) {
        console.error("Error during switchToPlayerTurnClean:", e);
        gameState.message = "切换回合时发生错误，请尝试操作或刷新。";
        // Attempt to restore a safe state
        gameState.currentPlayer = "player";
        gameState.turnPhase = "player_draw_or_discard"; 
        if (gameState.animationQueue.length > 0) {
            console.warn("Clearing animation queue due to error in switchToPlayerTurnClean.");
            gameState.animationQueue = []; // Clear queue as a last resort if it might be stuck
        }
        updateGameMessagesAndButtons(); // Try to update UI even after error
    }
}
