let casesAnneaux = {};
let score = 0;
let anneauxGagnes = [];

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

function afficherQuestion(data, couleurCase) {
    const questionDiv = document.getElementById('question-div');
    const questionP = questionDiv.querySelector('p');
    const boutons = questionDiv.querySelectorAll('button');

    questionP.innerText = data.question;

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

    const lettreChoisie = choix.charAt(0);

    if (lettreChoisie === bonneReponse) {
        if (!anneauxGagnes.includes(couleurCase)) {
            anneauxGagnes.push(couleurCase);
            score = anneauxGagnes.length;
            alert(`Bonne réponse ! Tu obtiens l'anneau ${couleurCase}`);
        } else {
            alert("Bonne réponse ! Anneau déjà collecté");
        }

        document.querySelector('#aside div span').innerText = `${score}/5`;

        if (score >= 5) {
            alert("Félicitations ! Vous avez collecté les 5 anneaux olympiques !");
        }
    } else {
        alert("Dommage ! La réponse était : " + bonneReponse);
    }

    questionP.innerText = "Lancez les dés pour une nouvelle question";
    boutons.forEach(btn => {
        btn.style.display = "none";
    });

    sauvegarderPartie();
}

function sauvegarderPartie() {
    const etatJeu = {
        position: playerPosition,
        score: score,
        anneauxGagnes: anneauxGagnes,
        casesAnneaux: casesAnneaux
    };
    localStorage.setItem('sauvegardeJO', JSON.stringify(etatJeu));
}

function chargerPartie() {
    const sauvegarde = localStorage.getItem('sauvegardeJO');
    if (sauvegarde) {
        const etat = JSON.parse(sauvegarde);
        playerPosition = etat.position;
        score = etat.score;
        anneauxGagnes = etat.anneauxGagnes || [];
        casesAnneaux = etat.casesAnneaux || {};

        document.querySelector('#aside div span').innerText = `${score}/5`;
        if (typeof redrawAll === "function") redrawAll();
    }
}

async function gererArriveeSurCase(couleurCase) {
    const themeChoisi = themesParCouleur[couleurCase];

    if (!themeChoisi) return;

    document.getElementById('question-div').querySelector('p').innerText = "Chargement...";

    try {
        const questionRecue = await fetchQuestion(themeChoisi);
        afficherQuestion(questionRecue, couleurCase);
    } catch (error) {
        document.getElementById('question-div').querySelector('p').innerText = "Erreur de connexion à l'IA.";
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
            "temperature": 0.7,
            messages: [
                {
                    role: "user",
                    content: `Génère une question de quiz sur les JO pour la thématique : ${thematique}. 
                              Donne 4 options de réponse et précise la bonne (juste la lettre A, B, C ou D). 
                              Réponds uniquement au format JSON : 
                              {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "..."}`
                }
            ]
        })
    });

    const data = await response.json();
    let content = data.choices[0].message.content;
    const firstBracket = content.indexOf('{');
    const lastBracket = content.lastIndexOf('}');
    content = content.substring(firstBracket, lastBracket + 1);

    return JSON.parse(content);
}

function initGame() {
    const boutons = document.getElementById('question-div').querySelectorAll('button');
    boutons.forEach(btn => btn.style.display = "none");
    document.getElementById('question-div').querySelector('p').innerText = "Lancez les dés pour commencer";

    const sauvegarde = localStorage.getItem('sauvegardeJO');
    if (sauvegarde) {
        chargerPartie();
    } else {
        genererCasesAnneaux(16);
    }
}

document.addEventListener("DOMContentLoaded", initGame);