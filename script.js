const api = "http://localhost:5678/api";

// Fonction de récupération des données
const fetchData = async (endpoint) => {
  try {
    const response = await fetch(api + endpoint);
    if (!response.ok) {
      throw new Error("Problème : " + response.statusText);
    }
    const data = await response.json();
    console.log("Données récupérées pour", endpoint, ":", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
};

// Charger la galerie
const loadGallery = async () => {
  const gallery = await fetchData("/works");
  displayGallery(gallery);
};

// Afficher la galerie //vas chercher le conteneur html et creé les elements (photos) puis les creé et affiche 

const displayGallery = (gallery) => {
  const galleryContainer = document.querySelector(".gallery");
  if (!galleryContainer) return;

  galleryContainer.innerHTML = "";
  gallery.forEach((element) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = element.imageUrl;
    img.alt = element.title;
    figcaption.textContent = element.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    galleryContainer.appendChild(figure);
  });
};

// Charger la galerie initiale
loadGallery();

// ------------------------CGestion des Boutons de Catégories-------------------------------------------------

fetchData("/categories").then((categories) => {
  const categoryContainer = document.querySelector(".catégorie");
  //Création des Boutons pour Chaque Catégorie
  categories.forEach((element) => {
    const button = document.createElement("button");
    button.textContent = element.name;
    button.className = "button-category";

    //Ajout d’un Gestionnaire d’Événements onclick à Chaque Bouton
    button.onclick = () => {
      resetButtonBackgrounds();
      button.style.backgroundColor = "#1D6154";
      button.style.color = "#FFF";
      // filtre les oeuvres et renvois les renvois que celle demander 
      fetchData("/works").then((gallery) => {
        const filteredGallery = gallery.filter(
          (elementWorks) => element.id === elementWorks.categoryId
        );
        displayGallery(filteredGallery);
      });
    };
    categoryContainer.appendChild(button);
  });
  // Création d’un Bouton Supplémentaire “Tous”
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.className = "button-category";
  allButton.onclick = () => {
    resetButtonBackgrounds();
    allButton.style.backgroundColor = "#1D6154";
    allButton.style.color = "#FFF";

    fetchData("/works").then(displayGallery);
  };
  categoryContainer.insertBefore(allButton, categoryContainer.firstChild);
});

// Réinitialiser les styles des boutons de catégorie
const resetButtonBackgrounds = () => {
  document.querySelectorAll(".button-category").forEach((btn) => {
    btn.style.backgroundColor = "white";
    btn.style.color = "#1D6154";
  });
};
//------------------------gestion logint logout ------------------------------------------------------------//
function loginLogout() {
  const token = localStorage.getItem('authToken')
  const logoutLink = document.getElementById('logoutLink')
  const loginLink = document.getElementById('loginLink')

  if (token) {
    logoutLink.style.display = 'block'
    loginLink.style.display = 'none'
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('authToken')
      window.location.reload()
    })
  } else {
    logoutLink.style.display = 'none'
    loginLink.style.display = 'block'
  }
}
loginLogout(); //apelle de la fonction 
const modifPortfolio = document.getElementById('modif-portfolio')

// --------------------Gestion de la modale----------------------------------------------------------
let modal = null;
//Ouverture de la Modal
const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector("#modal1");
  if (!target) return;

  target.style.display = "block";
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");

  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

  fetchData("/works").then(loadPhoto);
};
//-------------------------Fermeture de la Modale-------------------
const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("aria-modal", "false");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);

  modal = null;
};
//Gestion des Événements(permet de sortir de la moldal en utlisant ta touche echape )
const stopPropagation = function (e) {
  e.stopPropagation();
};

document.querySelectorAll(".Js-modal").forEach((button) => {
  button.addEventListener("click", openModal);
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key == "Esc") {
    closeModal(e);
  }
});

// Charger les photos dans la modale
const loadPhoto = (photos) => {
  //Sélection du Conteneur
  const deletePhotoContainer = document.querySelector(".Delete-photo");
  if (!deletePhotoContainer) {
    console.error("Conteneur '.Delete-photo' introuvable");
    return;
  }
  // vide le conteneur et évite d'avoir des doulons
  deletePhotoContainer.innerHTML = "";

  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    //cree des iconne trash 
    const trashIcon = document.createElement("img");
    trashIcon.src = "assets/icons/trashlogo.png";
    trashIcon.alt = "Delete Icon";
    trashIcon.classList.add("trash-icon");
    //-------------cree les img----------
    const img = document.createElement("img");
    img.classList.add("img-style");
    img.src = photo.imageUrl;
    img.alt = photo.title || "Photo";
    // --------------------Gestionnaire d’Événement pour la Suppression----------
    trashIcon.addEventListener("click", async () => {
      try {
        const response = await fetch(api + "/works/" + photo.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la suppression : " + response.statusText);
        }
        figure.remove();
      } catch (error) {
        console.error("Erreur :", error.message);
      }
    });

    figure.appendChild(trashIcon);
    figure.appendChild(img);
    deletePhotoContainer.appendChild(figure);
  });
};

// ----------------------Gestion du bouton édition et affichage selon connexion--------------------------------
const token = localStorage.getItem("authToken");
const editionElement = document.querySelector(".edition");
const modifierElement = document.querySelector(".modifier");
const catégorieElement = document.querySelector(".catégorie");


if (editionElement) {
  if (token) {
    catégorieElement.style.display = "none";
    modifierElement.style.display = "";
    editionElement.style.display = ""; // Affiche le bouton d'édition si l'utilisateur est connecté
  } else {
    modifierElement.style.display = "none";
    editionElement.style.display = "none";
    catégorieElement.style.display = "";
  }
}
//-----------------------ajouter image ----------------------------
const addPhotoButton = document.querySelector(".Ajout-photo"); // Sélectionne le bouton
const ajoutPhotoContent = document.querySelector("#ajoutPhotoContent"); // recupére le html de <dialog> 
const addmodal = document.querySelector(".modal-wrapper")
const changeToAddPictureModal = () => {
  // Assure-toi que la modale est bien ouverte avant de changer le contenu
  if (!modal) return;

  // Copier le contenu du dialog dans la modale existante
  addmodal.innerHTML = ajoutPhotoContent.innerHTML;

  // Ajouter des gestionnaires d'événements pour fermer la nouvelle modale
  const closeModalBtn = addmodal.querySelector(".js-close-modal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  addmodal.style.display = "block"; // Affiche la modale mise à jour
};

// Ajoute l'événement pour changer le contenu lorsque le bouton est cliqué
addPhotoButton.addEventListener("click", changeToAddPictureModal);