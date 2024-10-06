const api = "http://localhost:5678/api";

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

const loadGallery = async () => {
  const gallery = await fetchData("/works");
  displayGallery(gallery);
};

const displayGallery = (gallery) => {
  const galleryContainer = document.querySelector(".gallery");
  if (!galleryContainer) return;

  galleryContainer.innerHTML = "";
  gallery.forEach((element) => {
    // Créer les éléments
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    // Ajouter les attributs et le contenu
    img.src = element.imageUrl;
    img.alt = element.title;
    figcaption.textContent = element.title;

    // Ajouter l'image à la figure et la figure au conteneur
    figure.appendChild(img);
    figure.appendChild(figcaption);
    galleryContainer.appendChild(figure);
  });
};

fetchData("/works").then(displayGallery);

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
        const filteredGallery = gallery.filter((elementWorks) => element.id === elementWorks.categoryId);
        displayGallery(filteredGallery);
      });
    };
    categoryContainer.appendChild(button);
  });

  // Ajouter le bouton "Tous"
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

const resetButtonBackgrounds = () => {
  document.querySelectorAll(".button-category").forEach((btn) => {
    btn.style.backgroundColor = "white";
    btn.style.color = "#1D6154";
  });
};

// Modal
let modal = null;

const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector("#modal1");

  target.style.display = "block";
  target.removeAttribute("aria-hidden");
  target.setAttribute("aria-modal", "true");

  modal = target;
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-close-modal").addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);

  // Charger les photos dans la modale
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
  e.stopPropagation()
}

document.querySelectorAll(".Js-modal").forEach((button) => {
  button.addEventListener("click", openModal);
});

window.addEventListener('keydown', function (e) {
  console.log(e.key)
  if (e.key === "Escape" || e.key == 'Esc') {
    closeModal(e)
  }
});

//charge les photos de la modal 
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
    const trash = document.createElement("div");
    trash.style.width = "5px";
    trash.textContent = "trash";
    img.src = photo.imageUrl;
    img.alt = photo.title || "";
    img.style.width = "77px";
    img.style.height = "108px";
    img.style.flexShrink = "0";
    img.style.objectFit = "cover";
    img.style.margin = "4px";

    deletePhotoContainer.style.display = "flex";
    deletePhotoContainer.style.flexWrap = "wrap";
    deletePhotoContainer.style.justifyContent = "center";
    deletePhotoContainer.style.gap = "15px";
    figure.appendChild(trash);
    figure.appendChild(img);
    deletePhotoContainer.appendChild(figure);
    trash.addEventListener('click', () => {
      console.log(photo.id)
      fetch(api + "/works/" + photo.id)

    });
  });

};

// Charger la galerie une fois que le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  loadGallery(); // Appelle loadGallery pour démarrer le chargement des photos
});