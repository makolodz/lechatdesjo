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
let playerPosition = 0;
const pionRadius = 15;

function generateQuestions() {
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const available = ["red", "green", "blue", "pink", "cyan"];

    for (let i = 0; i < nbCercles; i++) {
        questions[i] = getRandomElement(available);
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
        ctx.fillStyle = questions[i];
        ctx.fill();
    }
}

function drawPawn() {
    if (avancements[playerPosition]) {
        ctx.drawImage(img, avancements[playerPosition][0] - 45, avancements[playerPosition][1] - 45, 90, 90);
    }
}

function redrawAll() {
    drawIceRink();
    drawCircles();
    drawPawn();
}

function init() {
    img.src = "./pawn.png"; 

    generateQuestions();
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    resizeCanvas();
    
    img.onload = () => {
        redrawAll();
    };

    const diceBtn = document.getElementById('dice-roll');

    diceBtn.addEventListener('click', () => {
        const de = Math.floor(Math.random() * 6) + 1;
        alert("Tu as fait un " + de + " !");
        
        playerPosition = (playerPosition + de) % nbCercles;
        
        redrawAll();
        
        const couleurCase = questions[playerPosition];
        gererArriveeSurCase(couleurCase);
    });

    window.addEventListener("resize", () => {
        resizeCanvas();
        redrawAll();
    });
}

document.addEventListener("DOMContentLoaded", init);