const api = "http://localhost:5678/api";

//Fonction login pour la Connexion d’un Utilisateur
const login = async (data) => {
    try {
        //Requête fetch à l’API pour se connecter
        const response = await fetch(api + "/users/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });
        //Vérification de la Réponse de l’API 
        if (!response.ok) {
            if (response.status === 401 || response.status === 404) {
                throw new Error("Identifiants incorrects");
            } else {
                throw new Error("Problème : " + response.statusText);
            }
            //Traitement de la Réponse si Connexion Réussie 
        } else {
            const Data = await response.json();
            const token = Data.token
            localStorage.setItem("authToken", token)
            window.location.href = "index.html";
        }
        //Gestion des Erreur
    } catch (error) {
        displayErrorMessage(error.message);
    }
};
//Fonction displayErrorMessage pour Afficher les Erreurs à l’Utilisateur
const displayErrorMessage = (message) => {
    const errorMessageElement = document.querySelector(".error-message");
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = "block";
    } else {
        console.error("Element for displaying error message not found.");
    }
};
//Gestion du Soumission du Formulaire
const myForm = document.querySelector("#login");
myForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;

    const data = {
        email: form.querySelector("#email").value,
        password: form.querySelector("#pass").value,
    };

    login(data); // Appelle de fonction connexion avec les données du formulaire
});