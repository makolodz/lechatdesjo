let canvas;
let ctx;

let w;
let h;

// Ces variables seront calculées après le resize
let radius;
let straight;
let centerY;
let left;
let right;
const laneGap = 30; // largeur entre lignes (modifiable)
const nbCercles = 16; // nombre de cerles (modifiable)
const circleRadius = 20; // radius des cercles (modifiables)

let innerRadius;
let straightLength;
let arcLength;
let totalLength;

let questions = [];

function generateQuestions() {

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const available = ["red", "green", "blue", "pink", "cyan"];

    for (let i = 0; i < nbCercles; i++) {
        questions[i] = getRandomElement(available);
        console.log(questions);
    }
}

function updateGeometry() {
    w = canvas.width;
    h = canvas.height;

    radius   = h * 0.25;      // rayon des virages
    straight = w * 0.5;       // longueur lignes droites
    centerY  = h / 2;
    left     = (w - straight) / 2;
    right    = left + straight;

    innerRadius   = radius;                 // bord intérieur
    straightLength = right - left;
    arcLength      = Math.PI * innerRadius; // demi-cercle
    totalLength    = 2 * straightLength + 2 * arcLength;
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    updateGeometry();
}

function drawLane(offset, color, width) {
    ctx.beginPath();

    // Ligne du haut
    ctx.moveTo(left, centerY - radius - offset);
    ctx.lineTo(right, centerY - radius - offset);

    // Virage droite
    ctx.arc(right, centerY, radius + offset, -Math.PI / 2, Math.PI / 2);

    // Ligne du bas
    ctx.lineTo(left, centerY + radius + offset);

    // Virage gauche
    ctx.arc(left, centerY, radius + offset, Math.PI / 2, -Math.PI / 2);

    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawIceRink() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond glace
    ctx.fillStyle = "#e6f7ff";
    ctx.fillRect(0, 0, w, h);

    // Bord extérieur (large)
    drawLane(laneGap * 3, "white", 6);

    // Bord intérieur
    drawLane(0, "white", 6);

    // Couloirs si besoin
    // drawLane(laneGap * 1, "blue", 2);
    // drawLane(laneGap * 2, "blue", 2);
}

function getPointOnTrack(t) {

    let d = t % totalLength;
    const TRACK_MIDDLE_OFFSET = laneGap * 1.5;

    const yTop = centerY - radius - TRACK_MIDDLE_OFFSET;
    const yBottom = centerY + radius + TRACK_MIDDLE_OFFSET;
    const arcRadius = radius + TRACK_MIDDLE_OFFSET;

    // 1) Segment horizontal haut (gauche -> droite)
    if (d <= straightLength) {
        const x = left + d;
        const y = yTop;
        return { x, y };
    }
    d -= straightLength;

    // 2) Arc droit (haut -> bas)
    if (d <= arcLength) {
        const angle = -Math.PI / 2 + (d / arcLength) * Math.PI; // de -π/2 à π/2
        const x = right + arcRadius * Math.cos(angle);
        const y = centerY + arcRadius * Math.sin(angle);
        return { x, y };
    }
    d -= arcLength;

    // 3) Segment horizontal bas (droite -> gauche)
    if (d <= straightLength) {
        const x = right - d;
        const y = yBottom;
        return { x, y };
    }
    d -= straightLength;

    // 4) Arc gauche (bas -> haut)
    const angle = Math.PI / 2 + (d / arcLength) * Math.PI; // de π/2 à 3π/2
    const x = left + arcRadius * Math.cos(angle);
    const y = centerY + arcRadius * Math.sin(angle);
    return { x, y };
}

function drawCircles() {
    for (let i = 0; i < nbCercles; i++) {

        const t = (i / nbCercles) * totalLength; // distance le long de la piste
        const { x, y } = getPointOnTrack(t);

        ctx.beginPath();
        ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = questions[i];
        ctx.fill();
    }
}

function canvaDraw() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    resizeCanvas(); // calcule aussi la géométrie

    ctx.fillStyle = "#F0F8FF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function redrawAll() {
    drawIceRink();
    drawCircles();
}

function init() {

    generateQuestions();

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    resizeCanvas();
    redrawAll();

    // Responsive si la fenêtre change
    window.addEventListener("resize", () => {
        resizeCanvas();
        redrawAll();
    });
}

document.addEventListener("DOMContentLoaded", init);
