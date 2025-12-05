// Variables du jeu
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
let attackCount = 0; // Compteur d'attaques

// Cooldowns des cartes
let cardCooldowns = {
    'potion': false,
    'reemploi': false,
    'double': false,
    'bouclier': false
};

// Éléments DOM
const livesDisplay = document.getElementById('lives');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const enemiesZone = document.getElementById('enemies-zone');
const gameOverScreen = document.getElementById('game-over');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.getElementById('restart-btn');
const cards = document.querySelectorAll('.card');

// Initialisation du jeu
function initGame() {
    lives = 3;
    score = 0;
    enemiesKilled = 0;
    selectedCard = null;
    isShieldActive = false;
    gameRunning = true;
    enemies = [];
    enemySpeed = 2;
    attackCount = 0;
    cardCooldowns = {
        'potion': false,
        'reemploi': false,
        'double': false,
        'bouclier': false
    };
    
    updateDisplay();
    messageDisplay.textContent = "Cliquez sur une carte, puis sur un ennemi !";
    gameOverScreen.classList.add('hidden');
    enemiesZone.innerHTML = '';
    
    // Retirer la sélection des cartes
    cards.forEach(card => card.classList.remove('selected', 'disabled', 'cooldown'));
    
    // Démarrer le spawn des ennemis
    startSpawning();
}

// Mettre à jour l'affichage
function updateDisplay() {
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    livesDisplay.textContent = hearts;
    scoreDisplay.textContent = `${enemiesKilled}/10`;
}

// Gestion des clics sur les cartes
cards.forEach(card => {
    card.addEventListener('click', () => {
        if (!gameRunning) return;
        
        const cardType = card.dataset.type;
        
        // Vérifier si la carte est en cooldown
        if (cardCooldowns[cardType]) {
            messageDisplay.textContent = "⏳ Cette carte est en rechargement !";
            messageDisplay.style.color = "#e74c3c";
            setTimeout(() => {
                messageDisplay.style.color = "white";
            }, 1000);
            return;
        }
        
        // Désélectionner les autres cartes
        cards.forEach(c => c.classList.remove('selected'));
        
        // Sélectionner cette carte
        card.classList.add('selected');
        selectedCard = cardType;
        
        messageDisplay.textContent = "Maintenant, cliquez sur un ennemi !";
        messageDisplay.style.color = "white";
    });
});

// Créer un ennemi
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
    
    // Déplacement de l'ennemi
    moveEnemy(enemy);
    
    // Clic sur l'ennemi
    enemy.addEventListener('click', () => attackEnemy(enemy));
}

// Déplacer un ennemi
function moveEnemy(enemy) {
    const moveInterval = setInterval(() => {
        if (!gameRunning || !enemy.parentElement) {
            clearInterval(moveInterval);
            return;
        }
        
        if (isShieldActive) {
            return; // Ne pas bouger pendant le bouclier
        }
        
        let currentRight = parseInt(enemy.style.right) || 0;
        currentRight += enemySpeed-0.2;
        enemy.style.right = currentRight + 'px';
        
        // Si l'ennemi atteint le village
        if (currentRight >= enemiesZone.offsetWidth - 100) {
            clearInterval(moveInterval);
            enemyReachesVillage(enemy);
        }
    }, 30);
}

// Ennemi atteint le village
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

// Attaquer un ennemi
function attackEnemy(enemy) {
    if (!selectedCard || !gameRunning) return;
    
    if (selectedCard === 'bouclier') {
        activateShield();
        return;
    }
    
    // Vérifier si la carte est en cooldown
    if (cardCooldowns[selectedCard]) {
        return;
    }
    
    // Déterminer les dégâts selon la carte
    let damage = 1;
    let cooldownTime = 1000;
    
    if (selectedCard === 'double') {
        damage = 2;
        cooldownTime = 3000;
    }
    
    // Réduire les HP de l'ennemi
    let currentHp = parseInt(enemy.dataset.hp);
    currentHp -= damage;
    enemy.dataset.hp = currentHp;
    
    // Mettre à jour l'affichage des HP
    const hpDisplay = enemy.querySelector('.enemy-hp');
    if (currentHp > 0) {
        hpDisplay.textContent = currentHp;
    }
    
    // Effet visuel d'attaque
    enemy.style.transform = 'scale(0.9)';
    setTimeout(() => {
        if (enemy.parentElement) {
            enemy.style.transform = 'scale(1)';
        }
    }, 100);
    
    // Si l'ennemi est mort
    if (currentHp <= 0) {
        enemy.classList.add('dead');
        setTimeout(() => {
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
        }, 300);
        
        enemiesKilled++;
        updateDisplay();
        messageDisplay.textContent = `✅ Ennemi éliminé ! (${enemiesKilled}/10)`;
        
        // Vérifier la victoire
        if (enemiesKilled >= 10) {
            endGame(true);
        }
    }
    
    // Augmenter la vitesse progressivement
    attackCount++;
    enemySpeed = 2 + (attackCount * 0.2);
    
    // Activer le cooldown de la carte
    activateCooldown(selectedCard, cooldownTime);
}

// Activer le bouclier
function activateShield() {
    if (isShieldActive) return;
    
    // Vérifier si le bouclier est en cooldown
    if (cardCooldowns['bouclier']) {
        return;
    }
    
    isShieldActive = true;
    messageDisplay.textContent = "🛡️ Bouclier activé ! Les ennemis sont bloqués !";
    messageDisplay.style.color = "#3498db";
    
    // Désélectionner la carte bouclier
    const shieldCard = document.querySelector('[data-type="bouclier"]');
    shieldCard.classList.remove('selected');
    selectedCard = null;
    
    // Effet visuel sur les ennemis
    enemies.forEach(enemy => {
        enemy.style.filter = 'brightness(0.5)';
    });
    
    setTimeout(() => {
        isShieldActive = false;
        messageDisplay.textContent = "Bouclier désactivé ! Cliquez sur une carte !";
        messageDisplay.style.color = "white";
        
        // Retirer l'effet visuel
        enemies.forEach(enemy => {
            if (enemy.parentElement) {
                enemy.style.filter = 'brightness(1)';
            }
        });
    }, 3000);
    
    // Activer le cooldown du bouclier (3 secondes)
    activateCooldown('bouclier', 3000);
}

// Fonction pour activer le cooldown d'une carte
function activateCooldown(cardType, duration) {
    cardCooldowns[cardType] = true;
    
    const card = document.querySelector(`[data-type="${cardType}"]`);
    card.classList.add('cooldown');
    
    // Créer un overlay de cooldown
    let cooldownOverlay = card.querySelector('.cooldown-overlay');
    if (!cooldownOverlay) {
        cooldownOverlay = document.createElement('div');
        cooldownOverlay.classList.add('cooldown-overlay');
        card.appendChild(cooldownOverlay);
    }
    
    // Animation du cooldown avec transition CSS
    cooldownOverlay.style.display = 'block';
    cooldownOverlay.style.height = '100%';
    cooldownOverlay.style.transition = 'none';
    
    // Forcer le reflow pour que la transition fonctionne
    cooldownOverlay.offsetHeight;
    
    cooldownOverlay.style.transition = `height ${duration}ms linear`;
    cooldownOverlay.style.height = '0%';
    
    setTimeout(() => {
        cardCooldowns[cardType] = false;
        card.classList.remove('cooldown');
        if (cooldownOverlay) {
            cooldownOverlay.style.display = 'none';
        }
    }, duration);
}

// Démarrer le spawn des ennemis
function startSpawning() {
    // Premier ennemi immédiat
    createEnemy();
    
    // Puis spawn régulier
    spawnTimer = setInterval(() => {
        if (gameRunning) {
            createEnemy();
        }
    }, enemySpawnInterval);
}

// Fin du jeu
function endGame(victory) {
    gameRunning = false;
    clearInterval(spawnTimer);
    
    // Retirer tous les ennemis
    enemies.forEach(enemy => {
        if (enemy.parentElement) {
            enemy.remove();
        }
    });
    enemies = [];
    
    // Afficher l'écran de fin
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

// Bouton rejouer
restartBtn.addEventListener('click', () => {
    initGame();
});

// Démarrer le jeu au chargement
window.addEventListener('load', () => {
    initGame();
});
