// Variables//
let uncoveredCards = 0;
let card1 = null;
let card2 = null; 
let firstResult = null;
let secondResult = null;
let moves = 0;
let points = 0; 
let timerStarted = false;
let time = 30;
let countdown = null;

// Links to HTML//
let showTime = document.getElementById('t-left');
let showPoints = document.getElementById('points');
let showMoves = document.getElementById('moves');

// Sounds//
let winAudio = new Audio('./sounds/win.wav');
let loseAudio = new Audio('./sounds/lose.wav');
let clickAudio = new Audio('./sounds/click.wav');
let rightAudio = new Audio('./sounds/rigth.wav');
let wrongAudio = new Audio('./sounds/wrong.wav');

// Aleatory numbers//
let numbers = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
shuffleArray(numbers);


// Functions//

// Shuffle function for the cards//
function shuffleArray(array) {
    array.sort(() => Math.random() - 0.5);
}

// Function to start the timer//
function startTimer() {
    countdown = setInterval(() => {
        time--;
        showTime.innerHTML = `⏳ Tiempo: ${time} segundos`;
        if (time === 0) {
            clearInterval(countdown);
            endGame(false);
        }
    }, 1000); // Count for second//
}

// Function to block all cards (called when the time is up)//
function blockCards() {
    for (let i = 0; i < numbers.length; i++) {  
        let blockedCard = document.getElementById(i);
        blockedCard.innerHTML = `<img src="./images/${numbers[i]}.png" alt="">`;
        blockedCard.disabled = true;
    }
}

// Function to handle the end of the game//
function endGame(won) {
    blockCards();
    if (won) {
        winAudio.play();
        setTimeout(() => {
            window.alert('🎊🎊¡Enhorabuena, has ganado!🎊🎊');
            resetGame();
        }, 500);
    } else {
        loseAudio.play();
        setTimeout(() => {
            window.alert('Lo siento, has perdido 😞');
            resetGame();
        }, 500);
    }
}

// Function to reset the game//
function resetGame() {
    time = 30;
    moves = 0;
    points = 0;
    uncoveredCards = 0;
    timerStarted = false;
    showTime.innerHTML = `⏳ Tiempo: 30 segundos`;
    showPoints.innerHTML = `🏅 Aciertos: 0`;
    showMoves.innerHTML = `Movimientos: 0`;
    // Shuffle the cards for the new game//
    shuffleArray(numbers); 
    for (let i = 0; i < numbers.length; i++) {  
        let card = document.getElementById(i);
        card.innerHTML = '?';
        card.disabled = false;
    }
}

// Main function to uncover cards//
function uncover(id) {
    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    uncoveredCards++;
    if (uncoveredCards === 1) {
        // Show first card
        card1 = document.getElementById(id);
        firstResult = numbers[id];
        card1.innerHTML = `<img src="./images/${firstResult}.png" alt="">`;
        clickAudio.play();
        card1.disabled = true;
    } else if (uncoveredCards === 2) {
        //Show second card and compare//
        card2 = document.getElementById(id);
        secondResult = numbers[id];
        card2.innerHTML = `<img src="./images/${secondResult}.png" alt="">`;
        card2.disabled = true;
        moves++;
        showMoves.innerHTML = `Movimientos: ${moves}`;

        if (firstResult === secondResult) {
            uncoveredCards = 0;
            points++;
            showPoints.innerHTML = `🏅 Aciertos: ${points}`;
            rightAudio.play();
            if (points === 8) {
                clearInterval(countdown);
                endGame(true);
            }
        } else {
            //Fail, cards are covered again//
            wrongAudio.play();
            setTimeout(() => {
                card1.innerHTML = '';
                card2.innerHTML = '';
                card1.disabled = false;
                card2.disabled = false;
                uncoveredCards = 0;
            }, 800);
        }
    }
}

// Add event listener to the return button//
const returnButton = document.getElementById('returnButton');
returnButton.addEventListener('click', returnToMenu);

// Function to return to the menu//
function returnToMenu() {
    window.location.href = 'index.html';
}