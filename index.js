


function init() {

}

document.addEventListener("DOMContentLoaded", init())


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
    return JSON.parse(data.choices[0].message.content);
}

// API : Partie sécurité anti crash



