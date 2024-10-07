const api = "http://localhost:5678/api";
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4";
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
    // Créer les éléments figure, img et div (pour l'icône "trash")
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const trashIcon = document.createElement("img");


    trashIcon.src = "assets/icons/trashlogo.png";
    trashIcon.alt = "Delete Icon";
    trashIcon.classList.add("trash-icon");

    img.classList.add("img-style");
    img.src = photo.imageUrl;
    img.alt = photo.title || "Photo";

    // Ajouter l'événement de suppression de la photo
    trashIcon.addEventListener('click', async () => {
      try {
        console.log(photo.id);
        const response = await fetch(api + "/works/" + photo.id, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la suppression : " + response.statusText);
        }
        console.log("Photo supprimée avec succès.");
        figure.remove(); // Supprime la figure de la page
      } catch (error) {
        console.error("Erreur :", error.message);
      }
    });

    // Ajouter les éléments à la figure et au conteneur de suppression de photos
    figure.appendChild(trashIcon);
    figure.appendChild(img);
    deletePhotoContainer.appendChild(figure);
  });
};

//---------test--------//`