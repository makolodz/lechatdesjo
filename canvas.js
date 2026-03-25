let button;
let canvas;
let ctx;
let w;
let h;
let radius;
let straight;
let centerY;
let left;
let right;
const laneGap = 30;
const nbCercles = 16;
const circleRadius = 20;
let innerRadius;
let straightLength;
let arcLength;
let totalLength;
let questions = [];
let avancements = [];
let step;
let totalSteps = 100;
let img = new Image();

let playerPositions = [0, 0, 0, 0];
const playerColors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF"];

function generateQuestions() {
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const available = ["red", "green", "blue", "yellow", "black"];

    for (let i = 0; i < nbCercles; i++) {
        if (casesAnneaux && casesAnneaux[i]) {
            questions[i] = casesAnneaux[i];
        } else {
            questions[i] = getRandomElement(available);
        }
    }
}

function updateGeometry() {
    w = canvas.width;
    h = canvas.height;
    radius = h * 0.25;
    straight = w * 0.5;
    centerY = h / 2;
    left = (w - straight) / 2;
    right = left + straight;
    innerRadius = radius;
    straightLength = right - left;
    arcLength = Math.PI * innerRadius;
    totalLength = 2 * straightLength + 2 * arcLength;
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    updateGeometry();
}

function drawLane(offset, color, width) {
    ctx.beginPath();
    ctx.moveTo(left, centerY - radius - offset);
    ctx.lineTo(right, centerY - radius - offset);
    ctx.arc(right, centerY, radius + offset, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(left, centerY + radius + offset);
    ctx.arc(left, centerY, radius + offset, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawIceRink() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e6f7ff";
    ctx.fillRect(0, 0, w, h);
    drawLane(laneGap * 3, "white", 6);
    drawLane(0, "white", 6);
}

function getPointOnTrack(t) {
    let d = t % totalLength;
    const TRACK_MIDDLE_OFFSET = laneGap * 1.5;
    const yTop = centerY - radius - TRACK_MIDDLE_OFFSET;
    const yBottom = centerY + radius + TRACK_MIDDLE_OFFSET;
    const arcRadius = radius + TRACK_MIDDLE_OFFSET;
    if (d <= straightLength) {
        const x = left + d;
        const y = yTop;
        return { x, y };
    }
    d -= straightLength;
    if (d <= arcLength) {
        const angle = -Math.PI / 2 + (d / arcLength) * Math.PI;
        const x = right + arcRadius * Math.cos(angle);
        const y = centerY + arcRadius * Math.sin(angle);
        return { x, y };
    }
    d = (t % totalLength) - straightLength - arcLength;
    if (d <= straightLength) {
        const x = right - d;
        const y = yBottom;
        return { x, y };
    }
    d = (t % totalLength) - (2 * straightLength + arcLength);
    const angle = Math.PI / 2 + (d / arcLength) * Math.PI;
    const x = left + arcRadius * Math.cos(angle);
    const y = centerY + arcRadius * Math.sin(angle);
    return { x, y };
}

function drawCircles() {
    for (let i = 0; i < nbCercles; i++) {
        const t = (i / nbCercles) * totalLength;
        const { x, y } = getPointOnTrack(t);
        avancements[i] = [x, y];

        ctx.beginPath();
        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = questions[i];
        ctx.stroke();
    }
}

function drawPawn() {
    for (let i = 0; i < nbPlayers; i++) {
        let pos = playerPositions[i];
        if (avancements[pos]) {
            let offsetX = (i % 2 === 0) ? -10 : 10;
            let offsetY = (i < 2) ? -10 : 10;
            let px = avancements[pos][0] + offsetX;
            let py = avancements[pos][1] + offsetY;

            // Dessin du pion
            ctx.drawImage(img, px - 25, py - 25, 50, 50);

            // Texte P1, P2... au dessus des pions
            ctx.fillStyle = "black";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText("P" + (i + 1), px, py - 20);
        }
    }
}

// draw olympic rings => 5 anneaux grisés + couleurs de l'anneau quand obtenu.

function drawOlympicLogo() {
    objet = {
        red: true,
        green: true,
        blue : false,
        yellow: false,
        black: true,
    }

    if (objet.red) {
        ctx.strokeStyle = "red";
    } else {
        ctx.strokeStyle = "grey";
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2+100, canvas.height/2-25, circleRadius+10, 0, 2 * Math.PI);
    ctx.stroke();

    if (objet.green) {
        ctx.strokeStyle = "green";
    } else {
        ctx.strokeStyle = "grey";
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2-100, canvas.height/2-25, circleRadius+10, 0, 2 * Math.PI);
    ctx.stroke();
    
    if (objet.blue) {
        ctx.strokeStyle = "blue";
    } else {
        ctx.strokeStyle = "grey";
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2-50, canvas.height/2+25, circleRadius+10, 0, 2 * Math.PI);
    ctx.stroke();    
    
    if (objet.yellow) {
        ctx.strokeStyle = "yellow";
    } else {
        ctx.strokeStyle = "grey";
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2+50, canvas.height/2+25, circleRadius+10, 0, 2 * Math.PI);
    ctx.stroke();    
    
    if (objet.black) {
        ctx.strokeStyle = "black";
    } else {
        ctx.strokeStyle = "grey";
    }

    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2-25, circleRadius+10, 0, 2 * Math.PI);
    ctx.stroke();
}

function redrawAll() {
    drawIceRink();
    drawCircles();
    drawPawn();
    drawOlympicLogo();
}

function initCanvas() {
    img.src = "./pawn.png";
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    resizeCanvas();
    img.onload = () => {
        redrawAll();
    };
    const diceBtn = document.getElementById('dice-roll');
    diceBtn.addEventListener('click', () => {
        const de = Math.floor(Math.random() * 6) + 1;
        alert("Joueur " + (currentPlayer + 1) + " a fait un " + de + " !");
        playerPositions[currentPlayer] = (playerPositions[currentPlayer] + de) % nbCercles;
        redrawAll();
        const couleurCase = questions[playerPositions[currentPlayer]];
        gererArriveeSurCase(couleurCase);
    });
    window.addEventListener("resize", () => {
        resizeCanvas();
        redrawAll();
    });
}

document.addEventListener("DOMContentLoaded", initCanvas);