const api = "http://localhost:5678/api";

// ------------------------ Fonction de récupération des données ------------------------
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

// ------------------------ Charger la galerie ------------------------
const loadGallery = async () => {
  const gallery = await fetchData("/works");
  displayGallery(gallery);
};

// ------------------------ Afficher la galerie ------------------------
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

// ------------------------ Gestion des Boutons de Catégories ------------------------
fetchData("/categories").then((categories) => {
  const categoryContainer = document.querySelector(".catégorie");

  // Création des Boutons pour Chaque Catégorie
  categories.forEach((element) => {
    const button = document.createElement("button");
    button.textContent = element.name;
    button.className = "button-category";

    // Ajout d’un Gestionnaire d’Événements onclick à Chaque Bouton
    button.onclick = () => {
      resetButtonBackgrounds();
      button.style.backgroundColor = "#1D6154";
      button.style.color = "#FFF";

      // Filtrer les œuvres selon la catégorie
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

// ------------------------ Gestion de la connexion/déconnexion ------------------------
function loginLogout() {
  const token = localStorage.getItem("authToken");
  const logoutLink = document.getElementById("logoutLink");
  const loginLink = document.getElementById("loginLink");

  if (token) {
    logoutLink.style.display = "block";
    loginLink.style.display = "none";
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.reload();
    });
  } else {
    logoutLink.style.display = "none";
    loginLink.style.display = "block";
  }
}
loginLogout();

// ------------------------ Gestion de la modale ------------------------
const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector("#modal1");
  if (!target) return;

  console.log("Ouverture de la modale");

  target.style.display = "block";
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");

  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

  fetchData("/works").then(loadPhoto);
};

const closeModal = function (e) {
  console.log("Fermeture de la modale");
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

const stopPropagation = function (e) {
  e.stopPropagation();
};

document.querySelectorAll(".Js-modal").forEach((button) => {
  button.addEventListener("click", openModal);
});

// Gestion de la fermeture de la modale avec la touche Échap
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
});

// Charger les photos dans la modale
const loadPhoto = (photos) => {
  const deletePhotoContainer = document.querySelector(".Delete-photo");
  if (!deletePhotoContainer) {
    console.error("Conteneur '.Delete-photo' introuvable");
    return;
  }

  deletePhotoContainer.innerHTML = "";

  // Création des éléments pour chaque photo
  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    const trashIcon = document.createElement("img");
    trashIcon.src = "assets/icons/trashlogo.png";
    trashIcon.alt = "Delete Icon";
    trashIcon.classList.add("trash-icon");

    // Création de l'élément photo
    const img = document.createElement("img");
    img.classList.add("img-style");
    img.src = photo.imageUrl;
    img.alt = photo.title || "Photo";

    // Suppression au clic
    trashIcon.addEventListener("click", async () => {
      try {
        const response = await fetch(api + "/works/" + photo.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la suppression : " + response.statusText);
        }
        figure.remove(); // Supprime dans le HTML pour le rendre plus visible
      } catch (error) {
        console.error("Erreur :", error.message);
      }
    });

    figure.appendChild(trashIcon);
    figure.appendChild(img);
    deletePhotoContainer.appendChild(figure);
  });
};

// ------------------------ Gestion du bouton édition et affichage selon connexion ------------------------
const token = localStorage.getItem("authToken");
const editionElement = document.querySelector(".edition");
const modifierElement = document.querySelector(".modifier");
const catégorieElement = document.querySelector(".catégorie");

if (editionElement) {
  if (token) {
    catégorieElement.style.display = "none";
    modifierElement.style.display = "";
    editionElement.style.display = "";
  } else {
    modifierElement.style.display = "none";
    editionElement.style.display = "none";
    catégorieElement.style.display = "";
  }
}

// ------------------------ Ajout de nouvelle image ------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("Avant d'accéder à arrowButton");
  const arrowButton = document.getElementById("arrow-button");
  const addPhotoButton = document.querySelector(".Ajout-photo");
  const ajoutPhotoContent = document.querySelector("#ajoutPhotoContent");
  const addmodal = document.querySelector(".modal-wrapper");
  const closeModalBtn = addmodal.querySelector(".js-close-modal");

  // Affichage de la nouvelle modal
  const changeToAddPictureModal = () => {
    if (!modal) return; // Vérifie que modal est dans le DOM sinon arrête la fonction
    addmodal.innerHTML = ajoutPhotoContent.innerHTML;
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }
    addmodal.style.display = "block";
  };

  addPhotoButton.addEventListener("click", changeToAddPictureModal);

  // Retour en arrière
  const arrowBack = () => {
    console.log("Bouton de retour cliqué");
    if (!modal) return;

    ajoutPhotoContent.innerHTML = addmodal.innerHTML;
    console.log("Contenu de ajoutPhotoContent mis à jour.");
  };

  if (arrowButton) {
    arrowButton.addEventListener("click", arrowBack);
    console.log("Écouteur d'événements ajouté à arrowButton.");
  } else {
    console.error("L'élément arrowButton n'a pas été trouvé dans le DOM.");
  }
});
// ----------------------------Ajout des categories en dynamique -------------------------------------
const loadCategories = async () => {
  try {
    // Récupérer les catégories depuis l'API
    const categories = await fetchData("/categories");
    const selectElement = document.getElementById("photoCategory");

    if (selectElement) {
      // Ajouter dynamiquement les options dans le select
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        selectElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
  }
};

document.addEventListener("DOMContentLoaded", loadCategories);
const labelPreview = document.getElementById("labelPreview");
//----------------------------------------------------------------------------------------
document.getElementById("photoUpload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const uploadIcon = document.getElementById("uploadIcon");
  const adbText = document.getElementById("adb");
  const imgPreview = document.getElementById("imagePreview");

  if (file && file.type.match("image.*")) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Masquer le SVG et le texte "+ Ajouter photo"
      uploadIcon.style.display = "none";
      adbText.style.display = "none";

      // Afficher l'image prévisualisée
      imgPreview.src = e.target.result;
      imgPreview.style.display = "block";
    };

    reader.readAsDataURL(file); // Lire le fichier comme une URL de données
  }
});