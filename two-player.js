// Cargar los sonidos//
let winAudio = new Audio('./sounds/win.wav');
let loseAudio = new Audio('./sounds/lose.wav');  // este sonido no se usará en este juego//
let clickAudio = new Audio('./sounds/click.wav');
let rightAudio = new Audio('./sounds/rigth.wav');
let wrongAudio = new Audio('./sounds/wrong.wav');

// Array de imágenes para las cartas (16 imágenes diferentes, duplicadas para 16 pares)//
const images = [...Array(16).keys()].map(i => i + 1);

// Función para mezclar el array de imágenes//
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

// Función para inicializar el juego de la CPU//
function initCPUGame() {
    const shuffledImages = shuffle([...images, ...images]);  // Mezclar imágenes (2 de cada una)//
    const gameBoard = document.getElementById('cpu-game-board');
    gameBoard.innerHTML = '';  // Limpiar el tablero antes de agregar las cartas//

    // Crear cartas para el juego//
    shuffledImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;  // Guardar el valor de la imagen en un atributo de datos//
        card.id = `card-${index}`;  // Asignar un id único a cada carta//

        card.innerHTML = `
            <div class="card-front">
                <img src='images/${image}.png' alt='Image ${image}'>
            </div>
            <div class="card-back"></div>
        `;

        // Añadir el evento de clic a cada carta//
        card.addEventListener('click', () => handleCardClickCPU(card));
        gameBoard.appendChild(card);  // Añadir la carta al tablero
    });
}

// Función que maneja el clic en las cartas del jugador//
function handleCardClickCPU(card) {
    if (isProcessingCPU || currentPlayer !== 'player' || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    clickAudio.play();  // sonido click//
    flipCardCPU(card);

    // Guardar la carta en la memoria//
    rememberCard(card);

    if (!firstCardCPU) {
        firstCardCPU = card;  
    } else {
        checkMatchCPU(firstCardCPU, card);  
        playerMoves++; 
        updateMoves();  
    }
}

// Función que voltea la carta//
function flipCardCPU(card) {
    if (!card) return;  // Verificar si la carta existe//
    card.classList.add('flipped');  // Añadir clase 'flipped' para mostrar la carta//
}

// Función que comprueba si dos cartas coinciden//
function checkMatchCPU(card1, card2) {
    isProcessingCPU = true;  // Bloquear nuevas acciones mientras se verifica la coincidencia//
    setTimeout(() => {
        if (card1.dataset.image === card2.dataset.image) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            // Actualizar el estado de las cartas en el array//
            revealedCards.forEach(card => {
                if (card.image === card1.dataset.image || card.image === card2.dataset.image) {
                    card.matched = true;  
                }
            });

            rightAudio.play();  // Sonido de acierto//
            updateScoreCPU(currentPlayer);
        } else {
            wrongAudio.play();  // Sonido de error//
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            switchPlayer();  // Cambiar el turno
        }
        resetTurnCPU();  // Reiniciar el turno//
        isProcessingCPU = false;  // Permitir nuevas acciones//


        if (isGameOverCPU()) {
            endGameCPU();  // Terminar el juego si todas las cartas coinciden//
        } else if (currentPlayer === 'cpu') {
            // Añadir un retraso de 1 segundo antes de que la CPU juegue su turno//
            setTimeout(playCpuTurn, 1000);  // Esperar 1 segundo//
        }
    }, 1000);  // Esperar 1 segundo antes de mostrar el resultado//
}

// Actualiza puntajes//
function updateScoreCPU(player) {
    if (player === 'player') {
        playerScore++;
        document.getElementById('points-player').textContent = `🏅 Aciertos: ${playerScore}`;
    } else {
        cpuScore++;
        document.getElementById('points-computer').textContent = `🏅 Aciertos: ${cpuScore}`;
    }
}

// Reiniciar las cartas seleccionadas después de un turno//
function resetTurnCPU() {
    firstCardCPU = null;
    isProcessingCPU = false;
}

// Cambiar turno entre jugador y CPU//
function switchPlayer() {
    currentPlayer = currentPlayer === 'player' ? 'cpu' : 'player';
}


// Función para almacenar las cartas reveladas//
function rememberCard(card) {
    // Revisar si ya existe en la memoria//
    const cardInMemory = revealedCards.find(c => c.id === card.id);
    if (!cardInMemory) {
        revealedCards.push({
            id: card.id,
            image: card.dataset.image,
            matched: card.classList.contains('matched')
        });
    }


}

// Jugada de la CPU//
function playCpuTurn() {
    if (isGameOverCPU()) return;

    cpuMoves++;  // Incrementar los movimientos de la CPU//
    updateMoves();  // Actualizar el contador de movimientos//

    // Revisar la memoria de la CPU para ver si tiene una pareja no emparejada//
    const unmatchedCards = revealedCards.filter(c => !c.matched);  // Filtrar cartas no emparejadas//
    const cardPairs = {};

    unmatchedCards.forEach(c => {
        if (!cardPairs[c.image]) {
            cardPairs[c.image] = [c];
        } else {
            cardPairs[c.image].push(c);
        }
    });

    // Buscar una pareja en la memoria de la CPU//
    const match = Object.values(cardPairs).find(pair => pair.length === 2);

    let card1;
    let card2;

    if (match) {
        // Si encontramos una pareja, seleccionarla//
        card1 = document.getElementById(match[0].id);
        card2 = document.getElementById(match[1].id);

        // Verificar que ambas cartas existen antes de intentar voltearlas y que las imágenes coinciden//
        if (!card1 || !card2 || card1.dataset.image !== card2.dataset.image) {
            console.error('Cartas no coinciden o no se encuentran en el DOM.');
            return;
        }

        // Reproducir sonido de clic al voltear ambas cartas
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
        // Si no hay pareja en la memoria, elegir dos cartas al azar//
        const availableCards = document.querySelectorAll('#cpu-game-board .card:not(.flipped):not(.matched)');
        card1 = availableCards[Math.floor(Math.random() * availableCards.length)];

        
        clickAudio.play(); 
        flipCardCPU(card1);

        // Guardar la carta en la memoria//
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


// Verificar si el juego ha terminado//
function isGameOverCPU() {
    return document.querySelectorAll('.card.matched').length === 32;  // 32 cartas (16 pares)
}

// Terminar el juego//
function endGameCPU() {
    winAudio.play();  // sonido de victoria//
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

// Actualizar el contador de movimientos//
function updateMoves() {
    document.getElementById('moves-player').textContent = `Movimientos: ${playerMoves}`;
    document.getElementById('moves-computer').textContent = `Movimientos: ${cpuMoves}`;

    // Actualizar aciertos por separado en sus propios elementos
    document.getElementById('points-player').textContent = `🏅 Aciertos: ${playerScore}`;
    document.getElementById('points-computer').textContent = `🏅 Aciertos: ${cpuScore}`;
}

// decide quien inicia la partida//
document.getElementById('roll-dice').addEventListener('click', () => {
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const cpuRoll = Math.floor(Math.random() * 6) + 1;

    // Actualizar imágenes de los dados//
    document.getElementById('player-dice-img').src = `dados/dado${playerRoll}.png`;
    document.getElementById('cpu-dice-img').src = `dados/dado${cpuRoll}.png`;

    // Verificar si hay empate//
    if (playerRoll === cpuRoll) {
        alert('Empate en los dados. ¡Vuelve a tirar!');
        document.getElementById('roll-dice').disabled = false; // Dejar el botón habilitado para volver a tirar//
    } else {
        currentPlayer = playerRoll >= cpuRoll ? 'player' : 'cpu';
        document.getElementById('roll-dice').disabled = true; // Deshabilitar el botón después de la tirada//

        // Mostrar quién comienza y proceder al turno correspondiente//
        setTimeout(() => {
            alert(`Jugador: ${playerRoll}, CPU: ${cpuRoll}. Empieza ${currentPlayer === 'player' ? 'Jugador' : 'CPU'}`);
            if (currentPlayer === 'cpu') {
                playCpuTurn();  // Iniciar turno de la CPU si gana el dado
            }
        }, 800);
    }
});
// Iniciar el juego al cargar la página//
initCPUGame();
resetTurnCPU();

// aparece panel del juego, se decide volver a inicio o iniciar una nueva partida, desaparece despues de escoger//
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