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

// Charger les catégories
fetchData("/categories").then((categories) => {
  const categoryContainer = document.querySelector(".catégorie");

  categories.forEach((element) => {
    const button = document.createElement("button");
    button.textContent = element.name;
    button.className = "button-category";
    button.onclick = () => {
      resetButtonBackgrounds();
      button.style.backgroundColor = "#1D6154";
      button.style.color = "#FFF";

      fetchData("/works").then((gallery) => {
        const filteredGallery = gallery.filter(
          (elementWorks) => element.id === elementWorks.categoryId
        );
        displayGallery(filteredGallery);
      });
    };
    categoryContainer.appendChild(button);
  });

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

// Gestion de la modale
let modal = null;

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
  const deletePhotoContainer = document.querySelector(".Delete-photo");
  if (!deletePhotoContainer) {
    console.error("Conteneur '.Delete-photo' introuvable");
    return;
  }

  deletePhotoContainer.innerHTML = "";

  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const trashIcon = document.createElement("img");

    trashIcon.src = "assets/icons/trashlogo.png";
    trashIcon.alt = "Delete Icon";
    trashIcon.classList.add("trash-icon");

    img.classList.add("img-style");
    img.src = photo.imageUrl;
    img.alt = photo.title || "Photo";

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

// Gestion du bouton édition et affichage selon connexion
const token = localStorage.getItem("authToken");
const editionElement = document.querySelector(".edition");
const modalElement = document.querySelector(".Js-modal");

if (editionElement) {
  if (token) {
    editionElement.style.display = "block"; // Affiche le bouton d'édition si l'utilisateur est connecté
  } else {
    editionElement.style.display = "none"; // Cache le bouton d'édition si l'utilisateur n'est pas connecté
  }
}

// Optionnel : gérer l'affichage du modal
if (modalElement) {
  modalElement.style.display = token ? "block" : "none"; // Affiche ou cache le modal selon l'état de connexion
}