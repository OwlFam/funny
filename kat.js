// 
// KAT AND RINA'S AWESOME ADVENTURE
// 

// GLOBAL VARIABLES - Assets
let assets = {
  kat: null,
  rina: null,
  soraKat: null,
  confettiKat: null,
  baldKat: null,
  cat: null,
  font: null
};

// Color Palette (Pastel Theme)
const colors = {
  darkBlue: '#2c3e7f',
  pink: '#ff6b9d',
  red: '#ff6b5b',
  yellow: '#ffd93d',
  white: '#ffffff',
  lightBg: '#f0e6ff'
};

// GAME STATE
let gameState = {
  currentScreen: 'menu', // Start at menu (intro is now separate HTML page)
  score: 0, // 0-4000
  playerHealth: 100,
  codeEntered: false,
  activeBosses: [1], // Which bosses are currently active
  cheatProgress: '', // For Ctrl+H+I cheat code
  finalPhaseStarted: false // Track if final 3-boss phase has been initiated
};

// INTRO STATE
let introState = {
  dialogueIndex: 0,
  showSkipButton: true,
  textDisplay: '',
  textSpeed: 0.05,
  currentTextIndex: 0,
  rinalounceY: 0,
  bounceDirection: 1
};

// DIALOGUE LINES (Rina explaining the game)
const introDialogue = [
  "Woof! Hey there! I'm Rina, a husky!",
  "I need your help... Kat has three evil alter egos wreaking havoc on Big Deal Street!",
  "You'll have to battle Sora Kat, Confetti Kat, and Bald Kat to save the day!",
  "Use your skills to damage each boss and defeat them!",
  "Good luck, Kat! You've got this! Woof woof!"
];

// MENU STATE
let menuState = {
  hoveredButton: null,
  codeInputActive: false,
  codeInput: '',
  correctCode: 'KATSAVES2026' // Code displayed after beating all bosses
};

// BATTLE STATE
let battleState = {
  // Arena dimensions (Undertale-style)
  arenaX: 150,
  arenaY: 100,
  arenaWidth: 700,
  arenaHeight: 500,
  
  // Rina companion
  rinaX: 900,
  rinaY: 350,
  rinaDialogueTimer: 0,
  rinaDialogue: 'Press SPACE to launch my Bark Bullets!',
  finalBossBarkDialogueTimer: 0,
  
  // Player position
  playerX: 0,
  playerY: 0,
  playerSpeed: 5,
  playerSize: 30,
  
  // Bosses (positioned above arena)
  bosses: {
    1: { 
      x: 250, y: 50, health: 100, attackTimer: 0, visible: false,
      moveSpeed: 3, moveDirection: 1, movePattern: 'normal',
      rotation: 0  // For Bald Kat spinning
    },
    2: { 
      x: 500, y: 50, health: 100, attackTimer: 0, visible: false,
      moveSpeed: 5, moveDirection: 1, movePattern: 'erratic',
      baseX: 500, baseY: 50
    },
    3: { 
      x: 750, y: 50, health: 100, attackTimer: 0, visible: false,
      moveSpeed: 8, moveDirection: 1, movePattern: 'teleport',
      rotation: 0, teleportCooldown: 0, beamWarning: false
    }
  },
  
  // Projectiles (enemy attacks)
  projectiles: [],
  
  // Healing pellets
  healingPellets: [],
  lastHealSpawnTime: 0,
  
  // Player bullets
  playerBullets: [],
  bulletSpeed: 10,
  shootCooldown: 0,
  
  // Combat mechanics
  playerShield: false,
  shieldDuration: 0,
  messageDisplay: '',
  messageTimer: 0,
  invulnerabilityFrames: 0
};

// 
// PRELOAD - Load Assets
// 
function preload() {
  // Load images
  assets.kat = loadImage('assets/kat.png');
  assets.rina = loadImage('assets/rina.jpg');
  assets.soraKat = loadImage('assets/soraKat.png');
  assets.confettiKat = loadImage('assets/confettiKat.png');
  assets.baldKat = loadImage('assets/baldKat.png');
  assets.cat = loadImage('assets/cat.png');
}

// 
// SETUP
// 
function setup() {
  createCanvas(1000, 700);
  
  // Initialize game state
  gameState.playerHealth = 100;
  
  // Initialize all bosses with full health on first load
  for (let i = 1; i <= 3; i++) {
    battleState.bosses[i].health = 100;
    battleState.bosses[i].attackTimer = 0;
  }
  
  // Initialize battle state with proper arena
  resetBattleState();
}

//
// MAIN DRAW LOOP
// 
function draw() {
  background(240, 230, 255); // Light pastel background
  
  // Route to correct screen
  switch(gameState.currentScreen) {
    case 'menu':
      drawMenu();
      break;
    case 'battle':
      drawBattle();
      break;
    case 'victory':
      drawVictory();
      break;
    case 'codeDisplay':
      drawCodeDisplay();
      break;
  }
}


//
// MENU SCREEN
// 
function drawMenu() {
  // Dark purple background to match winner screen
  background(44, 27, 51);
  noStroke();
  
  // Title
  fill(255, 138, 192); // Pink accent
  textSize(60);
  textAlign(CENTER);
  textFont('Arial');
  textStyle(BOLD);
  text("Kat and Rina's", width / 2, 80);
  text("Awesome Adventure!", width / 2, 150);
  
  // Menu buttons
  drawButton(width / 2 - 100, 280, 200, 60, 'INTRO', menuState.hoveredButton === 'intro');
  drawButton(width / 2 - 100, 370, 200, 60, 'PLAY', menuState.hoveredButton === 'play');
  drawButton(width / 2 - 100, 460, 200, 60, 'GALLERY', menuState.hoveredButton === 'gallery');
  
  // Code input - always visible
  textSize(16);
  textAlign(CENTER);
  fill(0);
  text('Enter Code:', width / 2, 600);
  
  // Code input box
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(width / 2 - 150, 620, 300, 40);
  
  fill(0);
  noStroke();
  textAlign(LEFT);
  text(menuState.codeInput, width / 2 - 140, 635);
}

//
// BATTLE SCREEN
//
function drawBattle() {
  // Dynamic background based on active bosses
  drawBattleBackground(gameState.activeBosses);
  
  // Draw arena border (Undertale-style)
  stroke(255, 138, 192);
  strokeWeight(3);
  noFill();
  rect(battleState.arenaX, battleState.arenaY, battleState.arenaWidth, battleState.arenaHeight);
  
  // Update boss movement
  updateBossMovement();
  
  // Display active bosses (above arena)
  displayActiveBosses();
  
  // Handle keyboard input
  handleBattleInput();
  
  // Update shoot cooldown
  if (battleState.shootCooldown > 0) {
    battleState.shootCooldown--;
  }
  
  // Draw and update player bullets
  drawPlayerBullets();
  
  // Draw projectiles (enemy attacks)
  drawProjectiles();
  
  // Spawn healing pellets every 4 seconds (240 frames) - ONLY during final 3 boss phase
  // Only spawn if all 3 bosses are present AND bark bandages dialogue has finished
  if (gameState.activeBosses.length === 3 && battleState.finalBossBarkDialogueTimer <= 0) {
    if (frameCount - battleState.lastHealSpawnTime > 240) {
      spawnHealingPellet();
      battleState.lastHealSpawnTime = frameCount;
    }
  }
  
  // Draw and update healing pellets
  drawHealingPellets();
  
  // Handle boss attacks
  handleBossAttacks();
  
  // Update active bosses based on score
  updateActiveBosses();
  
  // Display player (Kat) - with image or fallback
  displayPlayer();
  
  // Display Rina companion on the right
  displayRinaCompanion();
  
  // Update Rina dialogue timer
  if (battleState.rinaDialogueTimer > 0) {
    battleState.rinaDialogueTimer--;
  }
  
  // Update final boss "Bark bandages!" dialogue timer
  if (battleState.finalBossBarkDialogueTimer > 0) {
    battleState.finalBossBarkDialogueTimer--;
  }
  
  // Shield effect (if active)
  if (battleState.playerShield) {
    noFill();
    stroke(255, 138, 192); // Pink accent
    strokeWeight(4);
    circle(battleState.playerX, battleState.playerY, 80);
    battleState.shieldDuration--;
    if (battleState.shieldDuration <= 0) {
      battleState.playerShield = false;
    }
  }
  
  // Draw UI
  drawBattleUI();
  
  // Messages
  if (battleState.messageTimer > 0) {
    fill(255);
    textSize(20);
    textAlign(CENTER);
    textStyle(BOLD);
    text(battleState.messageDisplay, width / 2, 70);
    battleState.messageTimer--;
  }
  
  // Invulnerability cooldown
  if (battleState.invulnerabilityFrames > 0) {
    battleState.invulnerabilityFrames--;
  }
  
  // Check win/lose conditions
  if (gameState.playerHealth <= 0) {
    gameState.currentScreen = 'menu';
    gameState.playerHealth = 100;
    gameState.score = 0;
    gameState.activeBosses = [1];
    resetBattleState();
  }
  
  if (gameState.score >= 4800) {
    gameState.currentScreen = 'victory';
  }
}

// 
// VICTORY SCREEN
// 
function drawVictory() {
  fill(58, 27, 61);
  rect(0, 0, width, height);
  
  fill(255, 138, 192);
  textSize(72);
  textAlign(CENTER);
  textFont('Arial');
  textStyle(BOLD);
  text('VICTORY!', width / 2, 200);
  
  // Show final score
  fill(255);
  textSize(36);
  text(`Final Score: ${gameState.score}`, width / 2, 300);
  
  fill(200);
  textSize(20);
  text('You defeated all 3 evil Kat versions!', width / 2, 370);
  
  // See Code button
  drawButton(width / 2 - 100, 480, 200, 60, 'See Code >', menuState.hoveredButton === 'seeCode');
  
  // Back to Menu button
  drawButton(width / 2 - 100, 580, 200, 60, 'Main Menu', menuState.hoveredButton === 'mainMenu');
}

// 
// CODE DISPLAY SCREEN
// 
function drawCodeDisplay() {
  fill(58, 27, 61);
  rect(0, 0, width, height);
  
  fill(255, 138, 192);
  textSize(72);
  textAlign(CENTER);
  textFont('Arial');
  textStyle(BOLD);
  text('YOUR CODE', width / 2, 150);
  
  fill(255);
  textSize(18);
  text('Copy this code to claim your prize!', width / 2, 220);
  
  // Code display box
  fill(255);
  stroke(255, 138, 192);
  strokeWeight(3);
  rect(width / 2 - 200, 280, 400, 80, 10);
  
  fill(0);
  noStroke();
  textSize(36);
  textStyle(BOLD);  
  text(menuState.correctCode, width / 2, 330);
  
  // Copy button
  drawButton(width / 2 - 100, 420, 200, 60, 'Copy Code', menuState.hoveredButton === 'copy');
  
  // Main menu button
  drawButton(width / 2 - 100, 520, 200, 60, 'Main Menu', menuState.hoveredButton === 'mainMenu');
}

// 
// HELPER FUNCTIONS
// 

function drawButton(x, y, w, h, label, isHovered) {
  let bgColor = isHovered ? color(255, 138, 192) : color(110, 78, 122);
  fill(bgColor);
  stroke(255, 138, 192);
  strokeWeight(3);
  rect(x, y, w, h, 8);
  
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  textStyle(BOLD);
  text(label, x + w / 2, y + h / 2);
}

function drawBattleBackground(activeBosses) {
  // Restore original boss backgrounds
  let bgColor = [100, 100, 100]; // Default gray
  
  if (activeBosses.includes(1) && !activeBosses.includes(2) && !activeBosses.includes(3)) {
    // Boss 1 phase - dark, mystical
    bgColor = [60, 40, 100];
  } else if (activeBosses.includes(2) && !activeBosses.includes(3)) {
    // Boss 2 phase - festive, colorful
    bgColor = [200, 100, 150];
  } else if (activeBosses.includes(3) && activeBosses.length === 1) {
    // Boss 3 phase - edgy, plaid-inspired
    bgColor = [100, 100, 100];
  } else if (activeBosses.includes(1) && activeBosses.includes(2) && activeBosses.includes(3)) {
    // Match the main menu background exactly
    bgColor = [44, 27, 51];
  }
  
  fill(...bgColor);
  rect(0, 0, width, height);
}

function displayPlayer() {
  // Flash effect when hit
  if (battleState.invulnerabilityFrames > 0 && battleState.invulnerabilityFrames % 10 < 5) {
    return; // Flash off
  }
  
  // Draw player image or fallback
  if (assets.kat) {
    image(assets.kat, battleState.playerX - battleState.playerSize/2, 
          battleState.playerY - battleState.playerSize/2, 
          battleState.playerSize, battleState.playerSize);
  } else {
    // Fallback red circle
    fill(255, 100, 100);
    circle(battleState.playerX, battleState.playerY, battleState.playerSize);
  }
}

function displayRinaCompanion() {
  // Draw Rina on the right side of the screen
  if (assets.rina) {
    image(assets.rina, battleState.rinaX - 40, battleState.rinaY - 40, 80, 80);
  } else {
    // Fallback
    fill(200, 150, 255);
    circle(battleState.rinaX, battleState.rinaY, 80);
  }
  
  // Draw dialogue if timer is active
  if (battleState.rinaDialogueTimer > 0) {
    // Dialogue bubble - positioned to hang left into arena
    fill(255, 138, 192);
    stroke(110, 78, 122);
    strokeWeight(2);
    // Position: hangs from right side, extends left into arena
    rect(battleState.rinaX - 280, battleState.rinaY - 100, 280, 60, 0);
    
    // Text
    fill(44, 27, 51);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(battleState.rinaDialogue, battleState.rinaX - 280, battleState.rinaY - 100, 280, 60);
  }
}

function updateBossMovement() {
  for (let bossNum of gameState.activeBosses) {
    let boss = battleState.bosses[bossNum];
    
    if (bossNum === 1) {
      // Sora Kat - smooth left-right movement across FULL arena
      boss.x += boss.moveSpeed * boss.moveDirection;
      // Full range: arena left (150) to right (850)
      if (boss.x <= battleState.arenaX || boss.x >= battleState.arenaX + battleState.arenaWidth) {
        boss.moveDirection *= -1;
      }
      // Keep in bounds
      boss.x = constrain(boss.x, battleState.arenaX, battleState.arenaX + battleState.arenaWidth);
    } else if (bossNum === 2) {
      // Confetti Kat - erratic random movement across FULL arena
      if (frameCount % 30 === 0) {
        boss.moveDirection = random(-1, 1);
      }
      boss.x += boss.moveSpeed * boss.moveDirection;
      // Occasionally jump
      if (frameCount % 90 === 0) {
        boss.y = 30 + random(-20, 20);
      } else {
        boss.y = lerp(boss.y, 50, 0.05);
      }
      // Keep in full arena bounds
      boss.x = constrain(boss.x, battleState.arenaX, battleState.arenaX + battleState.arenaWidth);
    } else if (bossNum === 3) {
      // Bald Kat - fast movement with teleports across FULL arena
      boss.rotation += 5; // Constant spinning
      
      // Fast linear movement
      boss.x += boss.moveSpeed * boss.moveDirection;
      // Full range: arena left to right
      if (boss.x <= battleState.arenaX || boss.x >= battleState.arenaX + battleState.arenaWidth) {
        boss.moveDirection *= -1;
      }
      
      // Random teleport
      boss.teleportCooldown--;
      if (boss.teleportCooldown <= 0 && random() < 0.02) {
        boss.x = random(battleState.arenaX, battleState.arenaX + battleState.arenaWidth);
        boss.y = random(30, 70);
        boss.teleportCooldown = 60;
      }
      
      // Keep in bounds
      boss.x = constrain(boss.x, battleState.arenaX, battleState.arenaX + battleState.arenaWidth);
    }
  }
}

function displayActiveBosses() {
  for (let bossNum of gameState.activeBosses) {
    let boss = battleState.bosses[bossNum];
    
    // Draw boss image or placeholder
    push();
    translate(boss.x, boss.y);
    
    if (bossNum === 3) {
      rotate(radians(boss.rotation)); // Spin for Bald Kat
    }
    
    if (bossNum === 1 && assets.soraKat) {
      image(assets.soraKat, -50, -50, 100, 100);
    } else if (bossNum === 2 && assets.confettiKat) {
      image(assets.confettiKat, -50, -50, 100, 100);
    } else if (bossNum === 3 && assets.baldKat) {
      image(assets.baldKat, -50, -50, 100, 100);
    } else {
      // Fallback placeholder
      fill(200, 100, 100);
      rect(-50, -50, 100, 100, 5);
      fill(255);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(`Boss ${bossNum}`, 0, 0);
    }
    
    pop();
    
    // Boss health bar (with name displayed above it)
    drawBossHealthBar(boss, bossNum);
  }
}

function drawBossHealthBar(boss, bossNum) {
  let barWidth = 120;
  let barHeight = 15;
  let barX = boss.x - barWidth / 2;
  let barY = boss.y + 70;
  
  // Boss name above health bar
  fill(255);
  textSize(14);
  textAlign(CENTER);
  textStyle(BOLD);
  if (bossNum === 1) {
    text('Sora Kat', boss.x, barY - 15);
  } else if (bossNum === 2) {
    text('Confetti Kat', boss.x, barY - 15);
  } else if (bossNum === 3) {
    text('Bald Kat', boss.x, barY - 15);
  }
  
  // Background bar
  fill(100);
  rect(barX, barY, barWidth, barHeight);
  
  // Health fill
  fill(100, 200, 100);
  rect(barX, barY, barWidth * (boss.health / 100), barHeight);
  
  // Health text
  fill(255);
  textSize(12);
  textAlign(CENTER);
  text(`${boss.health}/100`, boss.x, barY + 12);
}

function drawProjectiles() {
  for (let i = battleState.projectiles.length - 1; i >= 0; i--) {
    let p = battleState.projectiles[i];
    
    // Draw projectile based on boss type
    if (p.bossType === 1) {
      // Sora Kat - orange cat projectiles
      fill(255, 150, 100);
      stroke(255, 100, 50);
      strokeWeight(2);
      if (assets.cat) {
        noStroke();
        image(assets.cat, p.x - 10, p.y - 10, 20, 20);
      } else {
        circle(p.x, p.y, 12);
      }
    } else if (p.bossType === 2) {
      // Confetti Kat - colorful confetti
      fill(255, random(100, 255), random(100, 200));
      noStroke();
      rect(p.x - 8, p.y - 8, 16, 16);
    } else if (p.bossType === 3) {
      // Bald Kat - gray projectiles
      fill(150, 150, 150);
      stroke(100);
      strokeWeight(2);
      circle(p.x, p.y, 10);
    }
    
    noStroke();
    
    // Move projectile with velocity
    p.x += p.vx;
    p.y += p.vy;
    
    // Collision with player (SMALLER HITBOX - changed from 40 to 25)
    if (dist(p.x, p.y, battleState.playerX, battleState.playerY) < 25) {
      if (battleState.playerShield) {
        battleState.projectiles.splice(i, 1);
      } else if (battleState.invulnerabilityFrames <= 0) {
        gameState.playerHealth -= 10;
        battleState.invulnerabilityFrames = 30; // 30 frames of invulnerability
        battleState.projectiles.splice(i, 1);
        showMessage('Hit! -10 HP', 30);
      }
    }
    
    // Remove if off screen/arena
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      battleState.projectiles.splice(i, 1);
    }
  }
}

function spawnHealingPellet() {
  // Spawn a random healing pellet in the arena
  let randomX = random(battleState.arenaX + 50, battleState.arenaX + battleState.arenaWidth - 50);
  let randomY = random(battleState.arenaY + 50, battleState.arenaY + battleState.arenaHeight - 50);
  
  battleState.healingPellets.push({
    x: randomX,
    y: randomY,
    healAmount: 10
  });
}

function drawHealingPellets() {
  for (let i = battleState.healingPellets.length - 1; i >= 0; i--) {
    let pellet = battleState.healingPellets[i];
    
    // Draw healing pellet (green circle)
    fill(100, 255, 100);
    stroke(0, 200, 0);
    strokeWeight(2);
    circle(pellet.x, pellet.y, 15);
    
    // Check collision with player
    if (dist(pellet.x, pellet.y, battleState.playerX, battleState.playerY) < 40) {
      // Heal player
      gameState.playerHealth = min(100, gameState.playerHealth + pellet.healAmount);
      showMessage('+10 HP', 30);
      battleState.healingPellets.splice(i, 1);
    }
  }
}

function handleBattleInput() {
  // WASD movement (classic Undertale style)
  if (keyIsDown(65) || keyIsDown(97)) { // A key
    battleState.playerX -= battleState.playerSpeed;
  }
  if (keyIsDown(68) || keyIsDown(100)) { // D key
    battleState.playerX += battleState.playerSpeed;
  }
  if (keyIsDown(87) || keyIsDown(119)) { // W key
    battleState.playerY -= battleState.playerSpeed;
  }
  if (keyIsDown(83) || keyIsDown(115)) { // S key
    battleState.playerY += battleState.playerSpeed;
  }
  
  // Keep player in arena bounds
  battleState.playerX = constrain(
    battleState.playerX,
    battleState.arenaX + 20,
    battleState.arenaX + battleState.arenaWidth - 20
  );
  battleState.playerY = constrain(
    battleState.playerY,
    battleState.arenaY + 20,
    battleState.arenaY + battleState.arenaHeight - 20
  );
}

function drawPlayerBullets() {
  for (let i = battleState.playerBullets.length - 1; i >= 0; i--) {
    let bullet = battleState.playerBullets[i];
    
    // Draw bullet
    fill(255, 217, 61); // Yellow
    circle(bullet.x, bullet.y, 8);
    
    // Move bullet
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Check collision with bosses
    let hit = false;
    for (let bossNum of gameState.activeBosses) {
      let boss = battleState.bosses[bossNum];
      if (dist(bullet.x, bullet.y, boss.x, boss.y) < 60) {
        boss.health -= 10;
        gameState.score += 80;
        showMessage(`${getBossName(bossNum)} hit! +80 points`, 30);
        battleState.playerBullets.splice(i, 1);
        hit = true;
        break;
      }
    }
    
    // Remove if off screen
    if (!hit && (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height)) {
      battleState.playerBullets.splice(i, 1);
    }
  }
}

function shootBullet() {
  // Shoot upward by default
  battleState.playerBullets.push({
    x: battleState.playerX,
    y: battleState.playerY - 20,
    vx: 0,
    vy: -battleState.bulletSpeed
  });
}

function handleBossAttacks() {
  for (let bossNum of gameState.activeBosses) {
    let boss = battleState.bosses[bossNum];
    boss.attackTimer++;
    
    if (bossNum === 1) {
      // Sora Kat - varied flower-like patterns
      if (boss.attackTimer > 70) {
        let patternType = (frameCount / 210) % 3; // Cycle through 3 patterns every 210 frames
        
        if (patternType < 1) {
          // 5-petal flower
          for (let i = 0; i < 5; i++) {
            let angle = (PI / 4) * i - PI / 4;
            spawnProjectileAngle(boss.x, boss.y, angle, 4, 1);
          }
        } else if (patternType < 2) {
          // 7-petal flower
          for (let i = 0; i < 7; i++) {
            let angle = (TWO_PI / 7) * i;
            spawnProjectileAngle(boss.x, boss.y, angle, 4, 1);
          }
        } else {
          // Tighter spiral pattern
          for (let i = 0; i < 6; i++) {
            let angle = (TWO_PI / 6) * i + (frameCount * 0.02);
            spawnProjectileAngle(boss.x, boss.y, angle, 5, 1);
          }
        }
        boss.attackTimer = 0;
      }
    } else if (bossNum === 2) {
      // Confetti Kat - walls from different directions
      if (boss.attackTimer > 80) {
        let wallDirection = floor((frameCount / 240) % 4); // Cycle every 240 frames
        
        if (wallDirection === 0) {
          // Wall from top
          for (let i = 0; i < 7; i++) {
            spawnProjectile(boss.x + (i - 3) * 60, boss.y + 80, 5, 2);
          }
        } else if (wallDirection === 1) {
          // Wall from bottom
          for (let i = 0; i < 7; i++) {
            spawnProjectile(boss.x + (i - 3) * 60, boss.y - 80, -5, 2);
          }
        } else if (wallDirection === 2) {
          // Wall from LEFT EDGE of arena, moving right
          for (let i = 0; i < 5; i++) {
            spawnProjectileAngle(battleState.arenaX, battleState.arenaY + 100 + (i - 2) * 80, 0, 5, 2);
          }
        } else {
          // Wall from RIGHT EDGE of arena, moving left
          for (let i = 0; i < 5; i++) {
            spawnProjectileAngle(battleState.arenaX + battleState.arenaWidth, battleState.arenaY + 100 + (i - 2) * 80, PI, 5, 2);
          }
        }
        boss.attackTimer = 0;
      }
    } else if (bossNum === 3) {
      // Bald Kat - rapid circular bursts + tracking beam
      if (boss.attackTimer > 50) {
        // Circular burst
        for (let i = 0; i < 8; i++) {
          let angle = (TWO_PI / 8) * i;
          spawnProjectileAngle(boss.x, boss.y, angle, 5, 3);
        }
        boss.attackTimer = 0;
      }
      
      // Tracking beam warning every 180 frames
      if (frameCount % 180 === 0) {
        boss.beamWarning = true;
      }
      
      // Fire tracking beam after warning
      if (boss.beamWarning && boss.attackTimer === 40) {
        let angleToPlayer = atan2(battleState.playerY - boss.y, battleState.playerX - boss.x);
        for (let i = 0; i < 5; i++) {
          spawnProjectileAngle(boss.x, boss.y, angleToPlayer, 6, 3);
        }
        boss.beamWarning = false;
      }
    }
  }
}

function spawnProjectileAngle(x, y, angle, speed, bossType) {
  battleState.projectiles.push({
    x: x,
    y: y,
    vx: cos(angle) * speed,
    vy: sin(angle) * speed,
    bossType: bossType,
    speed: speed
  });
}

function spawnProjectile(x, y, speed, bossType) {
  // Spawn projectile moving downward (classic falling pattern)
  battleState.projectiles.push({
    x: x,
    y: y,
    vx: 0,
    vy: speed,
    bossType: bossType,
    speed: speed
  });
}

function getBossName(bossNum) {
  switch (bossNum) {
    case 1:
      return 'Sora Kat';
    case 2:
      return 'Confetti Kat';
    case 3:
      return 'Bald Kat';
    default:
      return `Boss ${bossNum}`;
  }
}

function drawBattleUI() {
  // Player health bar with pink border
  stroke(255, 138, 192);
  strokeWeight(3);
  fill(44, 27, 51);
  rect(20, 20, 200, 30, 8);
  noStroke();
  fill(255, 138, 192);
  rect(23, 23, 194 * (gameState.playerHealth / 100), 24, 6);
  fill(255);
  textSize(14);
  textAlign(LEFT);
  textStyle(BOLD);
  text(`Kat: ${gameState.playerHealth}/100`, 30, 38);
  
  // Score display (just the number, no max)
  fill(255);
  textSize(28);
  textAlign(RIGHT);
  textStyle(BOLD);
  text(`Score: ${gameState.score}`, width - 30, 58);
  
  // Boss count indicator
  fill(255);
  textSize(14);
  textAlign(CENTER);
  let bossCount = gameState.activeBosses.length;
  text(`${bossCount} boss${bossCount > 1 ? 'es' : ''} remaining`, width / 2, 30);
}

function updateActiveBosses() {
  // Determine which bosses should be active based on score
  // Each boss: 100 HP / 10 damage = 10 hits per boss
  // 10 hits * 80 points = 800 points per boss
  // Score thresholds: 800, 1600, 2400, 4800
  // BUT: if a boss is dead (health <= 0), it stays dead - don't respawn
  
  let possibleBosses = [];
  
  if (gameState.score < 800) {
    possibleBosses = [1];
  } else if (gameState.score < 1600) {
    possibleBosses = [2];
  } else if (gameState.score < 2400) {
    possibleBosses = [3];
  } else if (gameState.score < 4800) {
    // All three bosses attack together
    possibleBosses = [1, 2, 3];
    // If this is the first time entering final phase, trigger dialogue and reset health
    if (!gameState.finalPhaseStarted) {
      gameState.finalPhaseStarted = true;
      battleState.finalBossBarkDialogueTimer = 240; // 4 seconds (240 frames at 60 FPS)
      battleState.rinaDialogue = 'Collect Bark Bandages to heal!';
      battleState.rinaDialogueTimer = 240;
      
      // Reset health of all bosses for the final phase (only once)
      for (let i = 1; i <= 3; i++) {
        battleState.bosses[i].health = 100;
        battleState.bosses[i].attackTimer = 0;
      }
    }
  }
  
  // Only include bosses that are alive
  let newActiveBosses = [];
  for (let bossNum of possibleBosses) {
    if (battleState.bosses[bossNum].health > 0) {
      newActiveBosses.push(bossNum);
    }
  }
  
  gameState.activeBosses = newActiveBosses;
}

function resetBattleState() {
  // Center player in arena
  battleState.playerX = battleState.arenaX + battleState.arenaWidth / 2;
  battleState.playerY = battleState.arenaY + battleState.arenaHeight - 80;
  
  battleState.projectiles = [];
  battleState.playerBullets = [];
  battleState.healingPellets = [];
  battleState.lastHealSpawnTime = frameCount;
  battleState.playerShield = false;
  battleState.shieldDuration = 0;
  battleState.invulnerabilityFrames = 0;
  battleState.shootCooldown = 0;
  
  // Initialize Rina's dialogue (8 seconds = 480 frames at 60 FPS)
  battleState.rinaDialogueTimer = 480;
  battleState.rinaDialogue = 'Press SPACE to launch my bark bullets!';
  
  // Only reset boss health if they haven't been defeated yet
  for (let i = 1; i <= 3; i++) {
    if (battleState.bosses[i].health > 0) {
      battleState.bosses[i].attackTimer = 0;
    }
  }
}

function showMessage(msg, duration) {
  battleState.messageDisplay = msg;
  battleState.messageTimer = duration;
}

// 
// INPUT HANDLING
// 

function mouseMoved() {
  // Check button hover states
  let buttons = [
    { name: 'intro', x: width / 2 - 100, y: 280, w: 200, h: 60 },
    { name: 'play', x: width / 2 - 100, y: 370, w: 200, h: 60 },
    { name: 'gallery',  x: width / 2 - 100, y: 460, w: 200, h: 60 },
    { name: 'seeCode', x: width / 2 - 100, y: 480, w: 200, h: 60 },
    { name: 'copy', x: width / 2 - 100, y: 420, w: 200, h: 60 },
    { name: 'mainMenu', x: width / 2 - 100, y: 580, w: 200, h: 60 }
  ];
  
  menuState.hoveredButton = null;
  
  for (let btn of buttons) {
    if (mouseX > btn.x && mouseX < btn.x + btn.w &&
        mouseY > btn.y && mouseY < btn.y + btn.h) {
      menuState.hoveredButton = btn.name;
      break;
    }
  }
}

function mousePressed() {
  // Intro screen
  if (gameState.currentScreen === 'intro') {
    if (menuState.hoveredButton === 'skip') {
      gameState.currentScreen = 'menu';
    } else if (menuState.hoveredButton === 'next') {
      introState.currentTextIndex = 0;
      introState.dialogueIndex++;
      if (introState.dialogueIndex >= introDialogue.length) {
        gameState.currentScreen = 'menu';
      }
    }
  }
  
  // Menu screen
  if (gameState.currentScreen === 'menu') {
    if (menuState.hoveredButton === 'intro') {
      window.location.href = 'intro.html';
    } else if (menuState.hoveredButton === 'play') {
      gameState.currentScreen = 'battle';
      gameState.playerHealth = 100;
      gameState.score = 0;
      gameState.activeBosses = [1];
      gameState.finalPhaseStarted = false; // Reset final phase flag
      // Reset all bosses to full health for new game
      for (let i = 1; i <= 3; i++) {
        battleState.bosses[i].health = 100;
        battleState.bosses[i].attackTimer = 0;
      }
      resetBattleState();
    } else if (menuState.hoveredButton === 'gallery') {
      window.location.href = 'gallery.html';
    }
  }
  
  // Victory screen
  if (gameState.currentScreen === 'victory') {
    if (menuState.hoveredButton === 'seeCode') {
      // Go to winner.html with the code
      window.location.href = 'winner.html?code=' + menuState.correctCode;
    } else if (menuState.hoveredButton === 'mainMenu') {
      gameState.currentScreen = 'menu';
      menuState.codeInput = '';
      gameState.score = 0;
    }
  }
  
  // Code display screen
  if (gameState.currentScreen === 'codeDisplay') {
    if (menuState.hoveredButton === 'copy') {
      // Copy to clipboard functionality
      navigator.clipboard.writeText(menuState.correctCode);
      showMessage('Code copied!', 60);
    } else if (menuState.hoveredButton === 'mainMenu') {
      gameState.currentScreen = 'menu';
      menuState.codeInput = '';
    }
  }
  
  // Battle screen - player attack
  if (gameState.currentScreen === 'battle') {
    // Attack any active boss
    for (let bossNum of gameState.activeBosses) {
      let boss = battleState.bosses[bossNum];
      if (dist(mouseX, mouseY, boss.x, boss.y) < 80) {
        boss.health -= 10;
        gameState.score += 80;
        showMessage(`${getBossName(bossNum)} hit! +80 points`, 30);
        break;
      }
    }
  }
}

function keyPressed() {
  // Cheat code detection: Ctrl+H+I to skip a boss
  if (keyIsDown(17)) { // Ctrl held
    gameState.cheatProgress += key.toLowerCase();
    if (gameState.cheatProgress.includes('hi')) {
      if (gameState.currentScreen === 'battle') {
        // Skip the first active boss
        let bossToSkip = gameState.activeBosses[0];
        if (bossToSkip) {
          gameState.score += 800;
          showMessage(`Skipped ${getBossName(bossToSkip)}! +800 points`, 60);
          gameState.cheatProgress = '';
        }
      }
    }
    // Reset after a few keys to avoid spam
    if (gameState.cheatProgress.length > 3) {
      gameState.cheatProgress = gameState.cheatProgress.slice(-2);
    }
  }
  
  // Battle screen - shooting
  if (gameState.currentScreen === 'battle') {
    if (key === ' ') {
      // Space to shoot
      if (battleState.shootCooldown <= 0) {
        shootBullet();
        battleState.shootCooldown = 15; // Cooldown between shots
      }
    }
  }
  
  // Menu code input
  if (gameState.currentScreen === 'menu') {
    if (key === 'Backspace') {
      menuState.codeInput = menuState.codeInput.slice(0, -1);
    } else if (key === 'Enter') {
      if (menuState.codeInput === menuState.correctCode) {
        // Go to code success page
        window.location.href = 'code-success.html';
      } else {
        alert('Incorrect code. Try again!');
        menuState.codeInput = '';
      }
    } else if (key.length === 1) {
      menuState.codeInput += key.toUpperCase();
    }
  }
}