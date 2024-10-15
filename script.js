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

// ------------------------ Charger les catégories ------------------------
const loadCategories = async () => {
  const categories = await fetchData("/categories");
  if (categories) {
    const categorySelect = document.getElementById("categoryId");
    if (categorySelect) {
      categorySelect.innerHTML = ""; // Réinitialiser le contenu

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id; // ID de la catégorie
        option.textContent = category.name; // Nom de la catégorie
        categorySelect.appendChild(option);
      });
    }
  }
};

// ------------------------ Charger la galerie ------------------------
const loadGallery = async () => {
  const gallery = await fetchData("/works");
  if (gallery) {
    displayGallery(gallery);
  }
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
  if (categories) {
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
  }
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
    if (logoutLink && loginLink) {
      logoutLink.style.display = "block";
      loginLink.style.display = "none";
      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.reload();
      });
    }
  } else {
    if (logoutLink && loginLink) {
      logoutLink.style.display = "none";
      loginLink.style.display = "block";
    }
  }
}
loginLogout();

// ------------------------ Gestion de la modale ------------------------
let modal = null;

const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector("#modal1");
  const addPhotoContent = document.querySelector("#ajoutPhotoContent");
  if (!target) return;
  //afichage de la modal
  console.log("Ouverture de la modale");
  const modalContent = document.querySelector(".modal-content")
  const modalWrapper = document.querySelector(".modal-wrapper");
  modalContent.style.display = "block";
  modalWrapper.style.display = "block";
  target.style.display = "block";
  addPhotoContent.style.display = "none";
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");
  //fermeture 
  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
  if (loadPhoto) {
    fetchData("/works").then(loadPhoto);
  }
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
//déclenchement de la modal au click
document.querySelectorAll(".js-modal").forEach((button) => {
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
  let deletePhotoContainer = document.querySelector(".delete-photo");

  if (deletePhotoContainer) {
    deletePhotoContainer.innerHTML = "";
  } else {
    deletePhotoContainer = document.createElement("div");
    deletePhotoContainer.classList.add("delete-photo");
    document.querySelector(".modal-wrapper").appendChild(deletePhotoContainer);
  }

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

if (editionElement && modifierElement && catégorieElement) {
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
const addPhotoButton = document.querySelector(".ajout-photo");
const imgPreview = document.getElementById("imagePreview");
const modalWrapper = document.querySelector(".modal-wrapper");
const target = document.querySelector("#ajoutPhotoContent");
const modalContent = document.querySelector(".modal-content")

const openAddPhotoModal = function (e) {
  e.preventDefault();
  console.log("Ouvrir la modale d'ajout de photo");
  // Sélectionne l'élément à ajouter
  if (!target) return;
  // Insère le contenu d'ajout de photo dans le wrapper si nécessaire
  if (!modalWrapper.contains(target)) {
    modalWrapper.appendChild(target);
  }
  // Affiche la modale et le contenu
  modalWrapper.style.display = "block";
  target.style.display = "block";
  modalContent.style.display = "none";
  // Charger les catégories
  loadCategories();
  // Réinitialiser le formulaire
  document.getElementById("photoForm").reset();
  const uploadIcon = document.getElementById("uploadIcon");
  const adbText = document.getElementById("adb");
  if (uploadIcon) uploadIcon.style.display = "block";
  if (adbText) adbText.style.display = "block";
};
//----------------fermer la modal 
function closeModal2(e) {
  e.preventDefault();
  const modalWrapper = document.querySelector(".modal");
  if (modalWrapper) {
    modalWrapper.style.display = "none"; // Masquer la modale
  }
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".js-close-modal2").addEventListener("click", closeModal2);
});
//------------------------------------------
// Ouvrir la modale sur clic du bouton
addPhotoButton.addEventListener("click", openAddPhotoModal);
//Fleche pour retournet en arriere ------------------------------
const arrowButton = document.querySelector("#arrow-button");
let arrowChange = () => {
  arrowButton.addEventListener("click", openModal)
}
// ---------------------------------Gestion du téléchargement de l'image dans le formulaire d'ajout
document.getElementById("image").addEventListener("change", function (event) {
  const file = event.target.files[0];

  // Sélection des éléments HTML
  const uploadIcon = document.getElementById("uploadIcon");
  const adbText = document.getElementById("adb");
  const imgPreview = document.getElementById("imagePreview");

  if (file && file.type.match("image.*")) { // Vérifie si un fichier image est sélectionné
    const reader = new FileReader();

    reader.onload = function (e) {
      // Cache l'icône et le texte "Ajouter photo"
      if (uploadIcon) uploadIcon.style.display = "none";
      if (adbText) adbText.style.display = "none";

      // Affiche l'aperçu de l'image
      if (imgPreview) {
        imgPreview.src = e.target.result; // Source de l'image
        imgPreview.style.display = "block"; // Rends visible l'aperçu
      }
    };

    reader.readAsDataURL(file); // Convertit l'image en URL
  } else {
    console.error("Veuillez sélectionner une image valide."); // Message d'erreur
  }
});

//----------------------------------------------- Fonction pour envoyer les nouvelles photos à l'API
const submitPhotoForm = async (event) => {
  event.preventDefault();

  const formData = new FormData(document.getElementById("photoForm"));
  const file = formData.get("image");
  const title = formData.get("title");
  const category = formData.get("categoryId"); // Assure-toi d'utiliser le bon nom

  console.log('Données envoyées :', {
    file: file,
    title: title,
    category: category,
  });

  // Vérifie si le fichier est valide
  if (!(file instanceof Blob)) {
    console.error('Le fichier n\'est pas valide.');
    alert("Veuillez sélectionner une image valide.");
    return;
  }

  // Vérifie si tous les champs sont remplis
  if (!file || !title || !category) {
    alert("Veuillez remplir tous les champs du formulaire.");
    return;
  }

  // Log des données du formulaire
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await fetch(api + "/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        // 'Content-Type': 'multipart/form-data' // Ne pas ajouter ici, le navigateur s'en occupe
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de l'envoi : ", errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const newPhoto = await response.json();
    console.log("Réponse réussie", newPhoto);
    alert("Photo ajoutée avec succès !");
    loadGallery();
    closeModal();
    document.getElementById("photoForm").reset();
    imgPreview.style.display = "none";
  } catch (error) {
    console.error("Erreur lors de l'envoi des données : ", error);
    alert("Erreur lors de l'ajout de la photo : " + error.message);
  }
};

// Gère la soumission du formulaire
document.getElementById("photoForm").addEventListener("submit", submitPhotoForm);