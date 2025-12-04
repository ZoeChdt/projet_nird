const gameArea = document.getElementById("game-area");
const pieces = document.querySelectorAll(".piece");
const message = document.getElementById("message");

const correctPositions = {
    'p1': { x: 410, y: 360, tolerance: 75 },
    'p2': { x: 410, y: 310, tolerance: 75 },
    'p3': { x: 435, y: 257, tolerance: 75 },
    'p4': { x: 360, y: 260, tolerance: 75 }
};

let placedCount = 0;

pieces.forEach(piece => {
    piece.addEventListener("mousedown", startDrag);
    piece.addEventListener("touchstart", startDrag, { passive: false });
});

function startDrag(e) {
    e.preventDefault();
    
    const piece = e.target;
    
    // Si la pièce était déjà placée, on la retire du compteur
    if (piece.classList.contains('placed')) {
        piece.classList.remove('placed');
        piece.style.opacity = "1";
        placedCount--;
        updateMessage();
    }
    
    const containerRect = gameArea.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    
    const shiftX = clientX - pieceRect.left;
    const shiftY = clientY - pieceRect.top;

    piece.style.position = "absolute";
    piece.style.zIndex = 1000;

    function moveAt(eMove) {
        const moveClientX = eMove.type === "touchmove" ? eMove.touches[0].clientX : eMove.clientX;
        const moveClientY = eMove.type === "touchmove" ? eMove.touches[0].clientY : eMove.clientY;
        
        let newLeft = moveClientX - containerRect.left - shiftX;
        let newTop = moveClientY - containerRect.top - shiftY;
        
        newLeft = Math.max(0, Math.min(newLeft, containerRect.width - piece.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, containerRect.height - piece.offsetHeight));
        
        piece.style.left = newLeft + "px";
        piece.style.top = newTop + "px";
    }

    function onMove(eMove) {
        moveAt(eMove);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: false });

    function onEnd() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchend", onEnd);
        
        piece.style.zIndex = 1;
        checkPlacement(piece);
    }

    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
}

function updateMessage() {
    if (placedCount === 0) {
        message.textContent = "Glissez les pièces pour les placer";
        message.style.color = "white";
        message.style.fontSize = "18px";
    } else if (placedCount < pieces.length) {
        message.textContent = `✅ Bien ! ${placedCount}/${pieces.length} pièces placées`;
        message.style.color = "#27ae60";
        message.style.fontSize = "18px";
    } else {
        message.textContent = "🎉 Bravo ! PC réparé !";
        message.style.color = "#2ecc71";
        message.style.fontSize = "24px";
    }
}

function checkPlacement(piece) {
    const pieceId = piece.id;
    const correctPos = correctPositions[pieceId];
    
    const currentLeft = parseInt(piece.style.left) || 0;
    const currentTop = parseInt(piece.style.top) || 0;
    
    const pieceWidth = piece.offsetWidth;
    const pieceHeight = piece.offsetHeight;
    const centerX = currentLeft + pieceWidth / 2;
    const centerY = currentTop + pieceHeight / 2;
    
    const distanceX = Math.abs(centerX - correctPos.x);
    const distanceY = Math.abs(centerY - correctPos.y);
    
    if (distanceX <= correctPos.tolerance && distanceY <= correctPos.tolerance) {
        // Pièce bien placée
        if (!piece.classList.contains('placed')) {
            piece.classList.add('placed');
            piece.style.opacity = "0.7";
            
            piece.style.left = (correctPos.x - pieceWidth / 2) + "px";
            piece.style.top = (correctPos.y - pieceHeight / 2) + "px";
            
            placedCount++;
            updateMessage();
        }
    } else {
        // Pièce mal placée
        if (!piece.classList.contains('placed')) {
            message.textContent = "❌ Pas tout à fait... Essayez encore !";
            message.style.color = "#e74c3c";
            message.style.fontSize = "18px";
            
            setTimeout(() => {
                updateMessage();
            }, 2000);
        }
    }
}
