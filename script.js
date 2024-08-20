const api = "http://localhost:5678/api";

const fetchData = (endpoint, options = {}) => {
  return fetch(api + endpoint, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Problème : ' + response.statusText);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données :', error);
    });
};

const displayGallery = (gallery) => {
  const galleryContainer = document.querySelector('.gallery');
  galleryContainer.innerHTML = ''; 

  gallery.forEach(element => {
    // Créer les éléments
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const figcaption = document.createElement('figcaption');

    // Ajouter les attributs et le contenu
    img.src = element.imageUrl;
    img.alt = element.title; 
    figcaption.textContent = element.title;

    
    figure.appendChild(img);
    figure.appendChild(figcaption);
    galleryContainer.appendChild(figure);
  });
};

// Fetch and display all works initially
fetchData("/works").then(displayGallery);

fetchData("/categories").then(categories => {
  const categoryContainer = document.querySelector('.catégorie');
  
  categories.forEach(element => {
    const button = document.createElement('button');
    button.textContent = element.name;
    button.className = "button-category";
    button.onclick = () => {
      resetButtonBackgrounds();
      button.style.backgroundColor = '#1D6154';
      button.style.color = '#FFF';

      fetchData("/works").then(gallery => {
        const filteredGallery = gallery.filter(elementWorks => element.id === elementWorks.categoryId);
        displayGallery(filteredGallery);
      });
    };
    categoryContainer.appendChild(button);
  });

  // Ajouter le bouton "Tous"
  const allButton = document.createElement('button');
  allButton.textContent = "Tous";
  allButton.className = "button-category";
  allButton.onclick = () => {
    resetButtonBackgrounds();
    allButton.style.backgroundColor = '#1D6154';
    allButton.style.color = '#FFF';

    fetchData("/works").then(displayGallery);
  };
  categoryContainer.insertBefore(allButton, categoryContainer.firstChild); // Ajouter le bouton "Tous" au début
});

// Fonction pour réinitialiser le background et la couleur du texte de tous les boutons
const resetButtonBackgrounds = () => {
  document.querySelectorAll('.button-category').forEach(btn => {
    btn.style.backgroundColor = 'white';
    btn.style.color = '#1D6154'; // Réinitialiser la couleur du texte
  });
};
