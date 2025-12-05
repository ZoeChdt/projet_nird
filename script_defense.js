let lives = 3;
let score = 0;
let enemiesKilled = 0;
let selectedCard = null;
let isShieldActive = false;
let enemySpeed = 2;
let enemySpawnInterval = 3000;
let gameRunning = false;
let spawnTimer = null;
let enemies = [];

const livesDisplay = document.getElementById('lives');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const enemiesZone = document.getElementById('enemies-zone');
const gameOverScreen = document.getElementById('game-over');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.getElementById('restart-btn');
const cards = document.querySelectorAll('.card');

function initGame() {
    lives = 3;
    score = 0;
    enemiesKilled = 0;
    selectedCard = null;
    isShieldActive = false;
    gameRunning = true;
    enemies = [];
    
    updateDisplay();
    messageDisplay.textContent = "Cliquez sur une carte, puis sur un ennemi !";
    gameOverScreen.classList.add('hidden');
    enemiesZone.innerHTML = '';
    
    cards.forEach(card => card.classList.remove('selected', 'disabled'));
    
    startSpawning();
}

function updateDisplay() {
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    livesDisplay.textContent = hearts;
    scoreDisplay.textContent = `${enemiesKilled}/10`;
}

cards.forEach(card => {
    card.addEventListener('click', () => {
        if (!gameRunning) return;
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedCard = card.dataset.type;
        
        messageDisplay.textContent = "Maintenant, cliquez sur un ennemi !";
    });
});

function createEnemy() {
    if (!gameRunning) return;
    
    const enemy = document.createElement('div');
    const enemyType = Math.random() > 0.5 ? 'licence' : 'cloud';
    
    enemy.classList.add('enemy', enemyType);
    
    if (enemyType === 'licence') {
        enemy.innerHTML = '<span class="enemy-icon">💰</span><div class="enemy-hp">1</div>';
        enemy.dataset.hp = 1;
        enemy.dataset.maxHp = 1;
    } else {
        enemy.innerHTML = '<span class="enemy-icon">☁️</span><div class="enemy-hp">2</div>';
        enemy.dataset.hp = 2;
        enemy.dataset.maxHp = 2;
    }
    
    enemy.dataset.type = enemyType;
    enemy.style.right = '-100px';
    enemy.style.top = Math.random() * (enemiesZone.offsetHeight - 80) + 'px';
    
    enemiesZone.appendChild(enemy);
    enemies.push(enemy);
    moveEnemy(enemy);
    enemy.addEventListener('click', () => attackEnemy(enemy));
}

function moveEnemy(enemy) {
    const moveInterval = setInterval(() => {
        if (!gameRunning || !enemy.parentElement) {
            clearInterval(moveInterval);
            return;
        }
        
        if (isShieldActive) {
            return;
        }
        let currentRight = parseInt(enemy.style.right) || 0;
        currentRight += enemySpeed;
        enemy.style.right = currentRight + 'px';
        
        if (currentRight >= enemiesZone.offsetWidth - 100) {
            clearInterval(moveInterval);
            enemyReachesVillage(enemy);
        }
    }, 30);
}

function enemyReachesVillage(enemy) {
    if (!enemy.parentElement) return;
    
    enemy.remove();
    enemies = enemies.filter(e => e !== enemy);
    
    lives--;
    updateDisplay();
    
    if (lives <= 0) {
        endGame(false);
    }
}

function attackEnemy(enemy) {
    if (!selectedCard || !gameRunning) return;
    
    if (selectedCard === 'bouclier') {
        activateShield();
        return;
    }
    
    let currentHp = parseInt(enemy.dataset.hp);
    currentHp--;
    enemy.dataset.hp = currentHp;
    
    const hpDisplay = enemy.querySelector('.enemy-hp');
    hpDisplay.textContent = currentHp;
    
    enemy.style.transform = 'scale(0.9)';
    setTimeout(() => {
        if (enemy.parentElement) {
            enemy.style.transform = 'scale(1)';
        }
    }, 100);
    
    if (currentHp <= 0) {
        enemy.classList.add('dead');
        setTimeout(() => {
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
        }, 300);
        
        enemiesKilled++;
        updateDisplay();
        messageDisplay.textContent = `✅ Ennemi éliminé ! (${enemiesKilled}/10)`;
        
        if (enemiesKilled >= 10) {
            endGame(true);
        }
    }
}

function activateShield() {
    if (isShieldActive) return;
    
    isShieldActive = true;
    messageDisplay.textContent = "🛡️ Bouclier activé ! Les ennemis sont bloqués !";
    messageDisplay.style.color = "#3498db";
    
    const shieldCard = document.querySelector('[data-type="bouclier"]');
    shieldCard.classList.add('disabled');
    shieldCard.classList.remove('selected');
    selectedCard = null;
    
    enemies.forEach(enemy => {
        enemy.style.filter = 'brightness(0.5)';
    });
    
    setTimeout(() => {
        isShieldActive = false;
        messageDisplay.textContent = "Bouclier désactivé ! Cliquez sur une carte !";
        messageDisplay.style.color = "white";
        shieldCard.classList.remove('disabled');
        
        enemies.forEach(enemy => {
            if (enemy.parentElement) {
                enemy.style.filter = 'brightness(1)';
            }
        });
    }, 3000);
}

function startSpawning() {
    createEnemy();
    
    spawnTimer = setInterval(() => {
        if (gameRunning) {
            createEnemy();
        }
    }, enemySpawnInterval);
}

function endGame(victory) {
    gameRunning = false;
    clearInterval(spawnTimer);
    
    enemies.forEach(enemy => {
        if (enemy.parentElement) {
            enemy.remove();
        }
    });
    enemies = [];
    
    gameOverScreen.classList.remove('hidden');
    
    if (victory) {
        resultTitle.textContent = "🎉 Victoire !";
        resultMessage.textContent = "Le village NIRD résiste ! Grâce au logiciel libre et au réemploi, l'empire Big Tech bat en retraite !";
        gameOverScreen.classList.add('victory');
        gameOverScreen.classList.remove('defeat');
    } else {
        resultTitle.textContent = "💔 Défaite...";
        resultMessage.textContent = "Le village a été submergé par Big Tech... Mais la résistance continue ! Réessayez !";
        gameOverScreen.classList.add('defeat');
        gameOverScreen.classList.remove('victory');
    }
}

restartBtn.addEventListener('click', () => {
    initGame();
});

window.addEventListener('load', () => {
    initGame();
});