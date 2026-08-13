const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");
const bestScore = document.getElementById("bestScore");
const deathMessage = document.getElementById("deathMessage");


// ============================================
// CANVAS
// ============================================

function resizeCanvas() {
    canvas.width = 450;
    canvas.height = 800;
}

resizeCanvas();


// ============================================
// RAVI KISHAN IMAGE
// ============================================

const raviImage = new Image();

raviImage.src = "assets/ravi.png";


// ============================================
// GAME VARIABLES
// ============================================

let gameRunning = false;

let score = 0;

let highScore = Number(localStorage.getItem("raviHighScore")) || 0;

let frame = 0;

let pipes = [];


// ============================================
// BIRD
// ============================================

const bird = {

    x: 100,
    y: 350,

    width: 55,
    height: 55,

    velocity: 0,

    gravity: 0.45,

    flapPower: -8,

    rotation: 0,

    reset() {

        this.x = 100;
        this.y = 350;

        this.velocity = 0;

        this.rotation = 0;
    },

    flap() {

        if (!gameRunning) return;

        this.velocity = this.flapPower;
    },

    update() {

        this.velocity += this.gravity;

        this.y += this.velocity;

        this.rotation = Math.min(
            Math.max(this.velocity * 0.05, -0.5),
            1
        );
    },

    draw() {

        ctx.save();

        ctx.translate(
            this.x + this.width / 2,
            this.y + this.height / 2
        );

        ctx.rotate(this.rotation);

        if (raviImage.complete && raviImage.naturalWidth > 0) {

            ctx.drawImage(
                raviImage,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );

        } else {

            // Fallback if image hasn't loaded yet
            ctx.fillStyle = "#ffcc00";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                this.width / 2,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle = "#000";

            ctx.font = "12px Arial";

            ctx.textAlign = "center";

            ctx.fillText(
                "RAVI",
                0,
                4
            );
        }

        ctx.restore();
    }
};


// ============================================
// BACKGROUND
// ============================================

function drawBackground() {

    // Sky
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#42c8ff");
    gradient.addColorStop(1, "#b9f3ff");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Clouds

    ctx.fillStyle = "rgba(255,255,255,0.8)";

    drawCloud(80, 130, 45);
    drawCloud(330, 220, 55);
    drawCloud(180, 80, 35);


    // Ground

    ctx.fillStyle = "#d9b45b";

    ctx.fillRect(
        0,
        canvas.height - 70,
        canvas.width,
        70
    );

    ctx.fillStyle = "#7fcf3c";

    ctx.fillRect(
        0,
        canvas.height - 80,
        canvas.width,
        15
    );
}


function drawCloud(x, y, size) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        size * 0.5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + size * 0.5,
        y - size * 0.2,
        size * 0.4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + size,
        y,
        size * 0.45,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ============================================
// PIPES
// ============================================

const pipeWidth = 75;

const pipeGap = 190;

const pipeSpeed = 3;


function createPipe() {

    const minTop = 100;

    const maxTop =
        canvas.height -
        pipeGap -
        150;

    const topHeight =
        Math.random() *
        (maxTop - minTop) +
        minTop;

    pipes.push({

        x: canvas.width,

        top: topHeight,

        bottom: topHeight + pipeGap,

        counted: false
    });
}


function drawPipe(pipe) {

    // Top pipe

    ctx.fillStyle = "#35b52c";

    ctx.fillRect(
        pipe.x,
        0,
        pipeWidth,
        pipe.top
    );

    // Top pipe cap

    ctx.fillStyle = "#279522";

    ctx.fillRect(
        pipe.x - 5,
        pipe.top - 25,
        pipeWidth + 10,
        25
    );


    // Bottom pipe

    ctx.fillStyle = "#35b52c";

    ctx.fillRect(
        pipe.x,
        pipe.bottom,
        pipeWidth,
        canvas.height - pipe.bottom - 70
    );

    // Bottom cap

    ctx.fillStyle = "#279522";

    ctx.fillRect(
        pipe.x - 5,
        pipe.bottom,
        pipeWidth + 10,
        25
    );
}


function updatePipes() {

    for (let i = pipes.length - 1; i >= 0; i--) {

        const pipe = pipes[i];

        pipe.x -= pipeSpeed;

        drawPipe(pipe);


        // Score

        if (
            !pipe.counted &&
            pipe.x + pipeWidth < bird.x
        ) {

            pipe.counted = true;

            score++;

            scoreDisplay.textContent = score;
        }


        // Remove pipe

        if (pipe.x + pipeWidth < 0) {

            pipes.splice(i, 1);
        }


        // Collision

        if (checkCollision(pipe)) {

            gameOver();
        }
    }


    // Create new pipes

    if (
        frame % 100 === 0
    ) {

        createPipe();
    }
}


// ============================================
// COLLISION
// ============================================

function checkCollision(pipe) {

    const padding = 8;

    const birdLeft =
        bird.x + padding;

    const birdRight =
        bird.x + bird.width - padding;

    const birdTop =
        bird.y + padding;

    const birdBottom =
        bird.y + bird.height - padding;


    const hitsPipe =
        birdRight > pipe.x &&
        birdLeft < pipe.x + pipeWidth &&
        (
            birdTop < pipe.top ||
            birdBottom > pipe.bottom
        );


    const hitsGround =
        birdBottom >= canvas.height - 70;


    const hitsSky =
        birdTop <= 0;


    return (
        hitsPipe ||
        hitsGround ||
        hitsSky
    );
}


// ============================================
// GAME START
// ============================================

function startGame() {

    score = 0;

    frame = 0;

    pipes = [];

    bird.reset();

    scoreDisplay.textContent = "0";

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    gameRunning = true;

    createPipe();

    gameLoop();
}


// ============================================
// GAME OVER
// ============================================

function gameOver() {

    if (!gameRunning) return;

    gameRunning = false;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "raviHighScore",
            highScore
        );
    }


    finalScore.textContent =
        "Score: " + score;

    bestScore.textContent =
        "Best: " + highScore;


    const messages = [

        "Arey bhai sahab 😭",

        "Ka ho Ravi ji 💀",

        "Ee ka kar diye?! 😂",

        "Bahut bura haal ho gaya!",

        "Ravi ji, pipe se bachna tha 😭",

        "Game over, babu bhaiya."

    ];


    deathMessage.textContent =
        messages[
            Math.floor(
                Math.random() * messages.length
            )
        ];


    gameOverScreen.classList.remove("hidden");
}


// ============================================
// INPUT
// ============================================

function flap() {

    if (gameRunning) {

        bird.flap();

    } else {

        startGame();
    }
}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            flap();
        }
    }
);


canvas.addEventListener(
    "mousedown",
    function() {

        flap();
    }
);


canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        flap();

    },
    {
        passive: false
    }
);


startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// ============================================
// GAME LOOP
// ============================================

function gameLoop() {

    if (!gameRunning) {

        drawBackground();

        bird.draw();

        return;
    }


    frame++;


    drawBackground();

    updatePipes();

    bird.update();

    bird.draw();


    requestAnimationFrame(gameLoop);
}


// ============================================
// INITIAL SCREEN
// ============================================

drawBackground();

bird.reset();

bird.draw();
