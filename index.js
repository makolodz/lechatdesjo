// État du jeu (Score et suivi des anneaux)
let score = 0;
let anneauxGagnes = [];

const themesParCouleur = {
    "blue": "Histoire des Jeux Olympiques",
    "green": "Disciplines et Épreuves",
    "red": "Athlètes Légendaires",
    "pink": "Impact Social et Culturel",
    "cyan": "Défis technologiques et controverses"
};

// UI

function afficherQuestion(data) {
    const questionDiv = document.getElementById('question-div');
    const questionP = questionDiv.querySelector('p');
    const boutons = questionDiv.querySelectorAll('button');

    // Affiche la question
    questionP.innerText = data.question;

    // Configure chaque bouton avec une option de réponse
    data.options.forEach((option, index) => {
        if (boutons[index]) {
            boutons[index].innerText = option;
            boutons[index].style.display = "block"; // Assure qu'ils sont visibles

            // vérifie la réponse au clic
            boutons[index].onclick = () => {
                verifierReponse(option, data.answer);
            };
        }
    });
}

function verifierReponse(choix, bonneReponse) {
    const questionP = document.getElementById('question-div').querySelector('p');
    const boutons = document.getElementById('question-div').querySelectorAll('button');

    // Vérifie si le choix commence par la bonne lettre (ex: "B" ou "B. Athènes")
    if (choix.trim().startsWith(bonneReponse)) {
        alert("Bonne réponse !");
        score++;
        // Mise à jour de l'affichage du score (ex: 1/5)
        document.querySelector('#aside div span').innerText = `${score}/5`;

        if (score >= 5) {
            alert("Félicitations ! Vous avez collecté les 5 anneaux olympiques !");
        }
    } else {
        alert("Dommage ! La réponse était : " + bonneReponse);
    }

    // Réinitialise l'affichage pour le prochain tour
    questionP.innerText = "Lancez les dés pour une nouvelle question";
    boutons.forEach(btn => {
        btn.innerText = "...";
        btn.onclick = null;
    });

    // Save la progression
    sauvegarderPartie();
}

// Local storage

function sauvegarderPartie() {
    // Vérifie si playerPosition est accessible
    const pos = (typeof playerPosition !== 'undefined') ? playerPosition : 0;
    const etatJeu = {
        position: pos, // Variable venant de canvas.js
        score: score
    };
    localStorage.setItem('sauvegardeJO', JSON.stringify(etatJeu));
}

function chargerPartie() {
    const sauvegarde = localStorage.getItem('sauvegardeJO');
    if (sauvegarde) {
        const etat = JSON.parse(sauvegarde);
        if (typeof playerPosition !== 'undefined') playerPosition = etat.position;
        score = etat.score;

        // Mise à jour visuelle
        document.querySelector('#aside div span').innerText = `${score}/5`;
        if (typeof redrawAll === "function") redrawAll();
        console.log("Partie chargée !");
    }
}

// QUESTION API

async function gererArriveeSurCase(couleurCase) {
    const themeChoisi = themesParCouleur[couleurCase];

    if (!themeChoisi) {
        console.error("Couleur inconnue par le jeu :", couleurCase);
        return;
    }

    document.getElementById('question-div').querySelector('p').innerText = "Chargement...";

    try {
        const questionRecue = await fetchQuestion(themeChoisi);
        // Affiche la question
        if (questionRecue) afficherQuestion(questionRecue);
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
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
                    content: `Génère une question de quiz sur les JO d'hiver pour la thématique : ${thematique}. 
                              Donne 4 options de réponse et précise la bonne (juste la lettre A, B, C ou D). 
                              Réponds uniquement au format JSON : 
                              {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "..."}`
                }
            ]
        })
    });

    if (!response.ok) throw new Error("Erreur HTTP: " + response.status);

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Eviter les '''json
    const firstBracket = content.indexOf('{');
    const lastBracket = content.lastIndexOf('}');
    content = content.substring(firstBracket, lastBracket + 1);

    return JSON.parse(content);
}

function init() {
    console.log("Système de quiz initialisé.");
    chargerPartie(); // Tente de charger une ancienne partie au démarrage
}

document.addEventListener("DOMContentLoaded", init);

// API : Sécurité anti-crash