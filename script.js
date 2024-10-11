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

// Afficher la galerie
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

// -------------------- Gestion de la modale ------------------------

let modal = null;
const backButton = document.querySelector("#arrow-left");
const defaultGalleryContent = document.querySelector(".edition");

const changeToGalleryModal = () => {
  if (!modal) return;
  addmodal.innerHTML = defaultGalleryContent.innerHTML;

  const closeModalBtn = addmodal.querySelector(".js-close-modal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }
  addmodal.style.display = "block";
};

backButton.addEventListener("click", changeToGalleryModal);

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

  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    const trashIcon = document.createElement("img");
    trashIcon.src = "assets/icons/trashlogo.png";
    trashIcon.alt = "Delete Icon";
    trashIcon.classList.add("trash-icon");

    const img = document.createElement("img");
    img.classList.add("img-style");
    img.src = photo.imageUrl;
    img.alt = photo.title || "Photo";

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

// ---------------------- Gestion du bouton édition et affichage selon connexion ------------------------

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

// ----------------------- Ajout de nouvelle image ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const addPhotoButton = document.querySelector(".Ajout-photo");
  const ajoutPhotoContent = document.querySelector("#ajoutPhotoContent");
  const addmodal = document.querySelector(".modal-wrapper");

  const changeToAddPictureModal = () => {
    if (!modal) return;
    addmodal.innerHTML = ajoutPhotoContent.innerHTML;

    const closeModalBtn = addmodal.querySelector(".js-close-modal");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeModal);
    }

    addmodal.style.display = "block";
  };

  addPhotoButton.addEventListener("click", changeToAddPictureModal);

  const categorySelection = document.getElementById("photoCategory");

  // Ouvrir la modale pour ajouter un projet
  // Fonction pour ouvrir le formulaire d'ajout de photo
  function openAddProjectModal() {
    const addProjectModal = document.getElementById("ajoutPhotoContent");

    if (addProjectModal && !addProjectModal.hasAttribute("open")) {
      addProjectModal.showModal();

      // Charger les catégories dynamiquement
      fetch("http://localhost:5678/api/categories")
        .then((response) => response.json())
        .then((categories) => {
          const categorySelection = document.getElementById("photoCategory");
          categorySelection.innerHTML = ""; // Vider les options précédentes

          categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelection.appendChild(option);
          });
        });

      // Sélectionner et attacher l'événement au formulaire
      const addProjectForm = document.getElementById("photoForm");
      const pictureTitleInput = document.getElementById("photoTitle");
      const categorySelection = document.getElementById("photoCategory");
      const imageInput = document.getElementById("photoUpload");

      addProjectForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", pictureTitleInput.value);
        formData.append("category", categorySelection.value);
        formData.append("image", imageInput.files[0]);

        try {
          const response = await fetch(api + "/works", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Erreur lors de l'ajout de l'image : " + response.statusText);
          }

          // Fermer la modale et recharger la galerie après l'ajout réussi
          loadGallery();
          addProjectModal.close();
        } catch (error) {
          console.error("Erreur lors de l'ajout de l'image :", error.message);
        }
      });
    }
  }

  // Ouvrir la modale d'ajout de photo quand le bouton est cliqué
  document.querySelector(".addPictures").addEventListener("click", openAddProjectModal);

  // Gestion de l'aperçu de l'image à télécharger
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    const preview = document.querySelector(".img-preview");

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = "block";
        addPictureButton.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  })
});