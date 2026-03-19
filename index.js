// Liaison thèmes par couleur : 

const themesParCouleur = {
    "blue": "Histoire des Jeux Olympiques",
    "green": "Disciplines et Épreuves",
    "red": "Athlètes Légendaires",
    "pink": "Impact Social et Culturel",
    "cyan": "Défis technologiques et controverses"
};

// Liaison couleur case et API

async function gererArriveeSurCase(couleurCase) {
    const themeChoisi = themesParCouleur[couleurCase];

    if (!themeChoisi) {
        console.error("Couleur inconnue par le jeu :", couleurCase);
        return;
    }

    console.log("Thème envoyé à l'IA:", themeChoisi);

    // Appel de la fonction fetchQuestion avec thème

    try {
        const questionRecue = await fetchQuestion(themeChoisi);
        console.log("Question reçue :", questionRecue)
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
    }
}

/* API Mistral Questions */

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
                              Donne 4 options de réponse et précise la bonne. 
                              Réponds uniquement au format JSON : 
                              {"question": "...", "options": ["A", "B", "C", "D"], "answer": "..."}`
                }
            ]
        })
    });
    const data = await response.json();
    let content = data.choices[0].message.content;

    return JSON.parse(content)
}

function init() {
    console.log("Système de quiz initialisé.");

}

document.addEventListener("DOMContentLoaded", init)

// API : 



