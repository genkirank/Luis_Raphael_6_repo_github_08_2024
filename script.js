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
      logoutLink.style.display = "block"; // Afficher le lien de déconnexion
      loginLink.style.display = "none"; // Cacher le lien de connexion
      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("authToken"); // Retirer le token d'authentification
        window.location.reload(); // Recharger la page
      });
    }
  } else {
    if (logoutLink && loginLink) {
      logoutLink.style.display = "none"; // Cacher le lien de déconnexion
      loginLink.style.display = "block"; // Afficher le lien de connexion
    }
  }
}
loginLogout(); // Initialiser la fonction de connexion/déconnexion

// ------------------------ Gestion de la modale ------------------------
let modal = null;

const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector("#modal1");
  const addPhotoContent = document.querySelector("#ajoutPhotoContent");
  if (!target) return;

  console.log("Ouverture de la modale");
  const modalContent = document.querySelector(".modal-content");
  const modalWrapper = document.querySelector(".modal-wrapper");
  modalContent.style.display = "block";
  modalWrapper.style.display = "block";
  target.style.display = "block";
  addPhotoContent.style.display = "none";
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");

  // Fermeture de la modale
  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

  if (loadPhoto) {
    fetchData("/works").then(loadPhoto); // Charger les photos si la fonction est définie
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

  modal = null; // Réinitialiser la variable de modal
};

const stopPropagation = function (e) {
  e.stopPropagation(); // Empêcher la propagation de l'événement
};

// Déclenchement de la modale au clic
document.querySelectorAll(".js-modal").forEach((button) => {
  button.addEventListener("click", openModal);
});

// Gestion de la fermeture de la modale avec la touche Échap
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e); // Fermer la modale si Échap est pressé
  }
});

// Charger les photos dans la modale
const loadPhoto = (photos) => {
  let deletePhotoContainer = document.querySelector(".delete-photo");

  if (!deletePhotoContainer) {
    deletePhotoContainer = document.createElement("div");
    deletePhotoContainer.classList.add("delete-photo");
    document.querySelector(".modal-wrapper").appendChild(deletePhotoContainer);
  } else {
    deletePhotoContainer.innerHTML = ""; // Réinitialiser le conteneur de suppression
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
      const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
      if (!confirmation) return; // Sortir si l'utilisateur annule

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

        alert("Photo supprimée avec succès !");

        // Supprime l'élément figure de la modale immédiatement
        figure.remove();

        // Rechargez les photos après la suppression
        loadGallery(); // Rechargement des photos pour mettre à jour l'affichage global
      } catch (error) {
        console.error("Erreur :", error.message);
        alert("Erreur lors de la suppression : " + error.message); // Alerte utilisateur
      }
    });

    figure.appendChild(trashIcon); // Ajouter l'icône de suppression
    figure.appendChild(img); // Ajouter l'image
    deletePhotoContainer.appendChild(figure); // Ajouter le figure au conteneur
  });
};

// Exemple de fonction loadGallery
const loadGallery2 = async () => {
  try {
    const response = await fetch(api + "/works");
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des photos : " + response.statusText);
    }
    const photos = await response.json();
    loadPhoto(photos); // Recharge les photos dans la modal
  } catch (error) {
    console.error("Erreur :", error.message);
  }
};

// ------------------------ Gestion du bouton édition et affichage selon connexion ------------------------
const token = localStorage.getItem("authToken"); // Récupère le token d'authentification
const editionElement = document.querySelector(".edition");
const modifierElement = document.querySelector(".modifier");
const catégorieElement = document.querySelector(".catégorie");
const projetdiv = document.querySelector(".projet");

if (editionElement && modifierElement && catégorieElement) {
  if (token) {
    catégorieElement.style.display = "none";
    modifierElement.style.display = "";
    editionElement.style.display = "";
    projetdiv.style.marginBottom = "128px";
  } else {
    modifierElement.style.display = "none";
    editionElement.style.display = "none";
    catégorieElement.style.display = "";
    projetdiv.style.marginBottom = "";
  }
}

// ------------------------ Variables et Sélecteurs ------------------------
const addPhotoButton = document.querySelector(".ajout-photo");
const imgPreview = document.getElementById("imagePreview");
const modalWrapper = document.querySelector(".modal-wrapper");
const target = document.querySelector("#ajoutPhotoContent");
const modalContent = document.querySelector(".modal-content");
const imageInput = document.getElementById("image");
const uploadIcon = document.getElementById("uploadIcon");
const adbText = document.getElementById("adb");
const photoForm = document.getElementById("photoForm");
const submitButton = document.getElementById("submitButton");
const categorySelect = document.getElementById("category");
const titleInput = document.getElementById("title");

// ------------------------ Ouvrir la modale d'ajout de photo ------------------------
const openAddPhotoModal = function (e) {
  e.preventDefault();
  console.log("Ouvrir la modale d'ajout de photo");

  if (!target) return;

  if (!modalWrapper.contains(target)) {
    modalWrapper.appendChild(target);
  }

  modalWrapper.style.display = "block";
  target.style.display = "block";
  modalContent.style.display = "none";

  loadCategories(); // Charge les catégories
  photoForm.reset(); // Réinitialise le formulaire

  // Afficher les éléments d'upload
  if (uploadIcon) uploadIcon.style.display = "block";
  if (adbText) adbText.style.display = "block";
};

// ------------------------ Fermer la modale ------------------------
const closeModal2 = function (e) {
  e.preventDefault();
  const modalWrapper = document.querySelector(".modal");
  if (modalWrapper) {
    modalWrapper.style.display = "none";
  }
};

// ------------------------ Écouteur d'événement DOMContentLoaded ------------------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".js-close-modal2").addEventListener("click", closeModal2);
});

// ------------------------ Ouvrir la modale sur clic du bouton ------------------------
addPhotoButton.addEventListener("click", openAddPhotoModal);

// ------------------------ Flèche pour retourner en arrière ------------------------
document.addEventListener("DOMContentLoaded", () => {
  const arrowButton = document.querySelector("#arrow-button");
  arrowButton.addEventListener("click", openModal);
});

// ------------------------ Gestion du téléchargement de l'image dans le formulaire d'ajout ------------------------
if (imageInput) {
  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file && file.type.match("image.*")) { // Vérifie si un fichier image est sélectionné
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadIcon.style.display = "none"; // Cacher l'icône d'upload
        adbText.style.display = "none"; // Cacher le texte d'instructions
        imgPreview.src = e.target.result; // Afficher l'image prévisualisée
        imgPreview.style.display = "block"; // Afficher l'élément img
      };
      reader.readAsDataURL(file); // Convertit l'image en URL
    } else {
      console.error("Veuillez sélectionner une image valide.");
    }
  });
}

// ------------------------ Fonction pour envoyer les nouvelles photos à l'API ------------------------
const submitPhotoForm = async (event) => {
  event.preventDefault();

  const formData = new FormData(photoForm);
  const file = formData.get("image");
  const title = formData.get("title");
  const category = formData.get("category");

  // Vérifiez que le fichier est valide
  if (!(file instanceof Blob)) {
    console.error('Le fichier n\'est pas valide.');
    alert("Veuillez sélectionner une image valide.");
    return;
  }

  if (!file || !title || !category) { // Si des champs sont manquants
    alert("Veuillez remplir tous les champs du formulaire.");
    submitButton.classList.remove("submitButton");
    return;
  }

  try {
    const response = await fetch(api + "/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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
    loadGallery(); // Recharge la galerie pour afficher la nouvelle photo
    photoForm.reset(); // Réinitialise le formulaire
    imgPreview.style.display = "none"; // Cache la prévisualisation
    submitButton.classList.remove("submitButton");
  } catch (error) {
    console.error("Erreur lors de l'envoi des données : ", error);
    alert("Erreur lors de l'ajout de la photo : " + error.message);
  }
  closeModal3(); // Ferme la modale après l'envoi
};

// Écouteurs d'événements pour la soumission du formulaire
photoForm.addEventListener("submit", submitPhotoForm);

// ------------------------ Fermeture du formulaire ------------------------
const closeModal3 = function (e) {
  if (e) {
    e.preventDefault();
  }

  console.log("Fermeture de la modale");
  if (modal === null) return;

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("aria-modal", "false");
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);

  modal = null; // Réinitialiser la variable modal
};