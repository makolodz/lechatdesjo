let casesAnneaux = {};
let nbPlayers = 1;
let currentPlayer = 0;
let playersData = [];

const themesParCouleur = {
    "blue": "Histoire des Jeux Olympiques",
    "green": "Disciplines et Épreuves",
    "red": "Athlètes Légendaires",
    "pink": "Impact Social et Culturel",
    "cyan": "Défis technologiques et controverses"
};

function genererCasesAnneaux(nombreTotalCases) {
    casesAnneaux = {};
    const couleurs = Object.keys(themesParCouleur);
    const indicesDisponibles = Array.from({ length: nombreTotalCases }, (_, i) => i);
    couleurs.forEach(couleur => {
        const rand = Math.floor(Math.random() * indicesDisponibles.length);
        const indexCase = indicesDisponibles.splice(rand, 1)[0];
        casesAnneaux[indexCase] = couleur;
    });
}

function mettreAJourUI() {
    const scoresDiv = document.getElementById('scores-list');
    scoresDiv.innerHTML = "";
    playersData.forEach((p, i) => {
        const pEl = document.createElement('div');
        pEl.style.padding = "5px";
        pEl.style.borderRadius = "5px";
        if (i === currentPlayer) {
            pEl.style.backgroundColor = "#e0f0ff";
            pEl.style.border = "2px solid #007bff";
            pEl.innerHTML = `<strong>> Joueur ${i + 1}: ${p.anneaux.length}/5</strong>`;
        } else {
            pEl.innerHTML = `Joueur ${i + 1}: ${p.anneaux.length}/5`;
        }
        scoresDiv.appendChild(pEl);
    });
}

function afficherQuestion(data, couleurCase) {
    const questionDiv = document.getElementById('question-div');
    const questionP = questionDiv.querySelector('p');
    const boutons = questionDiv.querySelectorAll('button');
    questionP.innerText = `[J${currentPlayer + 1}] ` + data.question;
    data.options.forEach((option, index) => {
        boutons[index].innerText = option;
        boutons[index].style.display = "block";
        boutons[index].onclick = () => {
            verifierReponse(option, data.answer, couleurCase);
        };
    });
}

function verifierReponse(choix, bonneReponse, couleurCase) {
    const questionP = document.getElementById('question-div').querySelector('p');
    const boutons = document.getElementById('question-div').querySelectorAll('button');
    const diceBtn = document.getElementById('dice-roll');
    const lettreChoisie = choix.charAt(0);

    if (lettreChoisie === bonneReponse) {
        if (casesAnneaux[playerPositions[currentPlayer]]) {
            if (!playersData[currentPlayer].anneaux.includes(couleurCase)) {
                playersData[currentPlayer].anneaux.push(couleurCase);
                alert(`Bravo Joueur ${currentPlayer + 1} ! Tu gagnes l'anneau ${couleurCase}`);
            } else {
                alert("Bonne réponse ! Anneau déjà possédé.");
            }
        } else {
            alert("Bonne réponse !");
        }

        if (playersData[currentPlayer].anneaux.length >= 5) {
            alert(`VICTOIRE ! Le Joueur ${currentPlayer + 1} a gagné les 5 anneaux !`);
            diceBtn.disabled = true;
            questionP.innerText = `PARTIE TERMINÉE : Victoire du Joueur ${currentPlayer + 1}`;
            boutons.forEach(btn => btn.style.display = "none");
            sauvegarderPartie();
            return;
        }
    } else {
        alert("Faux ! La réponse était : " + bonneReponse);
    }

    currentPlayer = (currentPlayer + 1) % nbPlayers;
    mettreAJourUI();

    questionP.innerText = `Tour du Joueur ${currentPlayer + 1}. Lancez les dés !`;
    boutons.forEach(btn => btn.style.display = "none");
    diceBtn.disabled = false;
    sauvegarderPartie();
}

function sauvegarderPartie() {
    const etatJeu = {
        nbPlayers: nbPlayers,
        currentPlayer: currentPlayer,
        playerPositions: playerPositions,
        playersData: playersData,
        casesAnneaux: casesAnneaux
    };
    localStorage.setItem('sauvegardeJO_Multi', JSON.stringify(etatJeu));
}

function chargerPartie() {
    const sauvegarde = localStorage.getItem('sauvegardeJO_Multi');
    if (sauvegarde) {
        const etat = JSON.parse(sauvegarde);
        nbPlayers = etat.nbPlayers;
        currentPlayer = etat.currentPlayer;
        playerPositions = etat.playerPositions;
        playersData = etat.playersData;
        casesAnneaux = etat.casesAnneaux;
        mettreAJourUI();
        generateQuestions();
        if (playersData[currentPlayer].anneaux.length >= 5) {
            document.getElementById('dice-roll').disabled = true;
        }
        if (typeof redrawAll === "function") redrawAll();
    }
}

function nouvellePartie() {
    let rep = prompt("Combien de joueurs ? (1-4)", "1");
    let n = parseInt(rep);
    if (isNaN(n) || n < 1 || n > 4) return;

    localStorage.removeItem('sauvegardeJO_Multi');
    nbPlayers = n;
    currentPlayer = 0;
    playerPositions = [0, 0, 0, 0];
    playersData = Array.from({ length: n }, () => ({ anneaux: [] }));

    document.getElementById('dice-roll').disabled = false;
    genererCasesAnneaux(16);
    generateQuestions();
    mettreAJourUI();
    document.getElementById('question-div').querySelector('p').innerText = "Joueur 1, commencez !";
    const boutons = document.getElementById('question-div').querySelectorAll('button');
    boutons.forEach(btn => btn.style.display = "none");
    if (typeof redrawAll === "function") redrawAll();
}

async function gererArriveeSurCase(couleurCase) {
    const themeChoisi = themesParCouleur[couleurCase];
    const diceBtn = document.getElementById('dice-roll');
    if (!themeChoisi) return;
    diceBtn.disabled = true;
    document.getElementById('question-div').querySelector('p').innerText = "Chargement...";
    try {
        const questionRecue = await fetchQuestion(themeChoisi);
        afficherQuestion(questionRecue, couleurCase);
    } catch (error) {
        document.getElementById('question-div').querySelector('p').innerText = "Erreur API.";
        diceBtn.disabled = false;
    }
}

async function fetchQuestion(thematique) {
    const apiKey = "bi0q8Sg1uTbNVtbn6zrKjCLcf63Bl1G1";
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "mistral-tiny",
            messages: [{ role: "user", content: `Question quiz JO Hiver Thème: ${thematique}. Format JSON: {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "..."}` }]
        })
    });
    const data = await response.json();
    let content = data.choices[0].message.content;
    const firstBracket = content.indexOf('{');
    const lastBracket = content.lastIndexOf('}');
    return JSON.parse(content.substring(firstBracket, lastBracket + 1));
}

function initGame() {
    const boutons = document.getElementById('question-div').querySelectorAll('button');
    boutons.forEach(btn => btn.style.display = "none");
    const btnNewGame = document.getElementById('new-game');
    if (btnNewGame) btnNewGame.addEventListener('click', nouvellePartie);

    const sauvegarde = localStorage.getItem('sauvegardeJO_Multi');
    if (sauvegarde) {
        chargerPartie();
    } else {
        nouvellePartie();
    }
}

document.addEventListener("DOMContentLoaded", initGame);