const api = "http://localhost:5678/api";

const login = async (Data) => {
    try {
        const response = await fetch(api + "/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Data)
        });

        if (!response.ok) {
            if (response.status === 401, 404) {
                throw new Error("Identifiants incorrects");
            } else {
                throw new Error("Problème : " + response.statusText);
            }
        }

        const token = await response.json();
        const tokenString = JSON.stringify(token);
        window.localStorage.setItem("loginData", tokenString);

        window.location.href = "index.html";

    } catch (error) {
        displayErrorMessage(error.message);
    }
};

const displayErrorMessage = (message) => {
    const errorMessageElement = document.querySelector(".error-message");
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = "block";
};



const myForm = document.querySelector("#login");
myForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;

    const Data = {
        email: form.querySelector("#email").value,
        password: form.querySelector("#pass").value,
    };



    login(Data);
});