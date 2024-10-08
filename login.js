const api = "http://localhost:5678/api";

const login = async (data) => {
    try {
        const response = await fetch(api + "/users/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 404) {
                throw new Error("Identifiants incorrects");
            } else {
                throw new Error("Problème : " + response.statusText);
            }
        } else {
            const Data = await response.json
            const token = Data.token
            localStorage.setItem("authToken", token)
            window.location.href = "index.html";
        }

    } catch (error) {
        displayErrorMessage(error.message);
    }
};

const displayErrorMessage = (message) => {
    const errorMessageElement = document.querySelector(".error-message");
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = "block";
    } else {
        console.error("Element for displaying error message not found.");
    }
};

const myForm = document.querySelector("#login");
myForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;

    const data = {
        email: form.querySelector("#email").value,
        password: form.querySelector("#pass").value,
    };

    login(data); // Appelle la fonction de connexion avec les données du formulaire
});