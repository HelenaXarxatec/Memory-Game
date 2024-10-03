// Sounds//
let winAudio = new Audio('./sounds/win.wav');
let loseAudio = new Audio('./sounds/lose.wav');  // este sonido no se usará en este juego//
let clickAudio = new Audio('./sounds/click.wav');
let rightAudio = new Audio('./sounds/rigth.wav');
let wrongAudio = new Audio('./sounds/wrong.wav');

// Images array for the cards (16 different images)//
const images = [...Array(16).keys()].map(i => i + 1);

// Function to shuffle the image array//
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Variables//
let playerScore = 0;
let cpuScore = 0;
let playerMoves = 0;
let cpuMoves = 0;
let currentPlayer = null;
let isProcessingCPU = false;
let firstCardCPU = null;
let revealedCards = []; // Array para almacenar las cartas reveladas

// Function to start CPU game//
function initCPUGame() {
    const shuffledImages = shuffle([...images, ...images]);  // Shuffle images//
    const gameBoard = document.getElementById('cpu-game-board');
    gameBoard.innerHTML = '';  // Clean the board before adding the cards//

    // Prepare cards for the game//
    shuffledImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;  // Keep the memory of the image//
        card.id = `card-${index}`;  // Give a different id to each card//

        card.innerHTML = `
            <div class="card-front">
                <img src='images/${image}.png' alt='Image ${image}'>
            </div>
            <div class="card-back"></div>
        `;

        // Add click event to each card//
        card.addEventListener('click', () => handleCardClickCPU(card));
        gameBoard.appendChild(card);  // Añadir la carta al tablero
    });
}

// Function for the click event in the players cards//
function handleCardClickCPU(card) {
    if (isProcessingCPU || currentPlayer !== 'player' || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    clickAudio.play();  // sonido click//
    flipCardCPU(card);

    // Keep cards in memory//
    rememberCard(card);

    if (!firstCardCPU) {
        firstCardCPU = card;  
    } else {
        checkMatchCPU(firstCardCPU, card);  
        playerMoves++; 
        updateMoves();  
    }
}

// Function to flip cards//
function flipCardCPU(card) {
    if (!card) return;
    card.classList.add('flipped');
}

// Function to check if both cards are the same//
function checkMatchCPU(card1, card2) {
    isProcessingCPU = true;  // Block new actions while checking cards//
    setTimeout(() => {
        if (card1.dataset.image === card2.dataset.image) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            revealedCards.forEach(card => {
                if (card.image === card1.dataset.image || card.image === card2.dataset.image) {
                    card.matched = true;  
                }
            });

            rightAudio.play();
            updateScoreCPU(currentPlayer);
        } else {
            wrongAudio.play();
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            switchPlayer();  
        }
        resetTurnCPU();
        isProcessingCPU = false;

        if (isGameOverCPU()) {
            endGameCPU();  // End game if all cards are matched//
        } else if (currentPlayer === 'cpu') {
            setTimeout(playCpuTurn, 1000);
        }
    }, 1000);
}

// Refresh points//
function updateScoreCPU(player) {
    if (player === 'player') {
        playerScore++;
        document.getElementById('points-player').textContent = `🏅 Aciertos: ${playerScore}`;
    } else {
        cpuScore++;
        document.getElementById('points-computer').textContent = `🏅 Aciertos: ${cpuScore}`;
    }
}

function resetTurnCPU() {
    firstCardCPU = null;
    isProcessingCPU = false;
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'player' ? 'cpu' : 'player';
}

//Function to keep the revealed cards in the CPU memory//
function rememberCard(card) {
    const cardInMemory = revealedCards.find(c => c.id === card.id);
    if (!cardInMemory) {
        revealedCards.push({
            id: card.id,
            image: card.dataset.image,
            matched: card.classList.contains('matched')
        });
    }
}

function playCpuTurn() {
    if (isGameOverCPU()) return;
    cpuMoves++;
    updateMoves();
    
    const unmatchedCards = revealedCards.filter(c => !c.matched);
    const cardPairs = {};

    unmatchedCards.forEach(c => {
        if (!cardPairs[c.image]) {
            cardPairs[c.image] = [c];
        } else {
            cardPairs[c.image].push(c);
        }
    });

    // Look for a match in CPU's memory//
    const match = Object.values(cardPairs).find(pair => pair.length === 2);

    let card1;
    let card2;

    if (match) {
        card1 = document.getElementById(match[0].id);
        card2 = document.getElementById(match[1].id);
        
        if (!card1 || !card2 || card1.dataset.image !== card2.dataset.image) {
            console.error('Cartas no coinciden o no se encuentran en el DOM.');
            return;
        }

        setTimeout(() => {
            clickAudio.play(); 
            flipCardCPU(card1);
            setTimeout(() => {
                clickAudio.play();
                flipCardCPU(card2);
                checkMatchCPU(card1, card2);
            }, 1000);
        }, 1000);
    } else {
        const availableCards = document.querySelectorAll('#cpu-game-board .card:not(.flipped):not(.matched)');
        card1 = availableCards[Math.floor(Math.random() * availableCards.length)];

        clickAudio.play(); 
        flipCardCPU(card1);
        rememberCard(card1);
        setTimeout(() => {
            const remainingCards = document.querySelectorAll('#cpu-game-board .card:not(.flipped):not(.matched)');
            card2 = remainingCards[Math.floor(Math.random() * remainingCards.length)];
            
            clickAudio.play(); 
            flipCardCPU(card2);
            rememberCard(card2);  // Guardar la segunda carta//
            checkMatchCPU(card1, card2);
        }, 1000);
    }
}

function isGameOverCPU() {
    return document.querySelectorAll('.card.matched').length === 32;
}

function endGameCPU() {
    winAudio.play();  
    setTimeout(() => {
        if (playerScore > cpuScore) {
        window.alert(`¡Fin del juego! El ganador 🏆 es:  Jugador 🎉🎉🎉 con ${playerScore} pares.`);
        } else if (cpuScore > playerScore) {
            window.alert(`¡Fin del juego! El ganador 🏆 es:  CPU 🎉🎉🎉 con ${cpuScore} pares.`);
        } else {
            window.alert('¡Empate!');
        }
        showEndGamePanel();
    }, 1000);
}

function updateMoves() {
    document.getElementById('moves-player').textContent = `Movimientos: ${playerMoves}`;
    document.getElementById('moves-computer').textContent = `Movimientos: ${cpuMoves}`;

    document.getElementById('points-player').textContent = `🏅 Aciertos: ${playerScore}`;
    document.getElementById('points-computer').textContent = `🏅 Aciertos: ${cpuScore}`;
}

// Decide who starts the game//
document.getElementById('roll-dice').addEventListener('click', () => {
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const cpuRoll = Math.floor(Math.random() * 6) + 1;

    document.getElementById('player-dice-img').src = `dados/dado${playerRoll}.png`;
    document.getElementById('cpu-dice-img').src = `dados/dado${cpuRoll}.png`;

    if (playerRoll === cpuRoll) {
        alert('Empate en los dados. ¡Vuelve a tirar!');
        document.getElementById('roll-dice').disabled = false; // Dejar el botón habilitado para volver a tirar//
    } else {
        currentPlayer = playerRoll >= cpuRoll ? 'player' : 'cpu';
        document.getElementById('roll-dice').disabled = true; // Deshabilitar el botón después de la tirada//

            setTimeout(() => {
            alert(`Jugador: ${playerRoll}, CPU: ${cpuRoll}. Empieza ${currentPlayer === 'player' ? 'Jugador' : 'CPU'}`);
            if (currentPlayer === 'cpu') {
                playCpuTurn();  // Iniciar turno de la CPU si gana el dado
            }
        }, 800);
    }
});
initCPUGame();
resetTurnCPU();

// Show endGame panel and make it disappear after making a choice//
function showEndGamePanel() {
    document.getElementById('endGamePanel').style.display = 'flex';
  }
  
  function hideEndGamePanel() {
    document.getElementById('endGamePanel').style.display = 'none';
  }
  
  function returnToMenu() {
    window.location.href = 'index.html';
  }
  
  function startNewGame() {
    hideEndGamePanel();
    resetGame();
  }
  
  function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    playerMoves = 0;
    cpuMoves = 0;
    matchedPairs = 0;
    playerMatches = 0;
    cpuMatches = 0;
    flippedCards = [];
    revealedCards = [];
    firstCardCPU = null;
    
    document.getElementById('points-player').textContent = `🏅 Aciertos: ${playerScore}`;
    document.getElementById('points-computer').textContent = `🏅 Aciertos: ${cpuScore}`;
    document.getElementById('moves-player').textContent = `Movimientos: ${playerMoves}`;
    document.getElementById('moves-computer').textContent = `Movimientos: ${cpuMoves}`;
    document.getElementById('roll-dice').disabled = false;
    
    initCPUGame ();
  }
  
  document.getElementById('returnToMenu').addEventListener('click', returnToMenu);
  document.getElementById('startNewGame').addEventListener('click', startNewGame);
    
  const originalEndGameCPU = endGameCPU;
  endGameCPU = function() {
    originalEndGameCPU();
    setTimeout(showEndGamePanel, 100);
  };
  
function rollDice() {
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const cpuRoll = Math.floor(Math.random() * 6) + 1;
    
    document.getElementById('player-dice').textContent = playerRoll;
    document.getElementById('cpu-dice').textContent = cpuRoll;
    
    if (playerRoll > cpuRoll) {
        currentPlayer = 'player';
    } else if (cpuRoll > playerRoll) {
        currentPlayer = 'cpu';
    } else {
        // En caso de empate, volver a tirar//
        return rollDice();
    }
    
    updateTurnDisplay(currentPlayer);
    document.getElementById('roll-dice').disabled = true;
    
    if (currentPlayer === 'cpu') {
        setTimeout(cpuTurn, 1000);
    }
}
    
function updateMovesAndMatches() {
    document.getElementById('playerMoves').textContent = `Moves: ${playerMoves}`;
    document.getElementById('cpuMoves').textContent = `Moves: ${cpuMoves}`;
    document.getElementById('playerMatches').textContent = `Matches: ${playerMatches}`;
    document.getElementById('cpuMatches').textContent = `Matches: ${cpuMatches}`;
}
