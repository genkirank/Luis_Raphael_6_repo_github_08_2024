const api = "http://localhost:5678/api";
const token = localStorage.getItem("authToken");

// Fonction pour charger et afficher les photos supprimées
const loadDeletedPhotos = async () => {
    // Implémentez la logique pour récupérer les photos supprimées
    const deletedPhotoIds = await fetchDeletedPhotoIds(); // Fonction à implémenter pour obtenir les IDs

    if (deletedPhotoIds.length > 0) {
        restoreDeletedPhotos(deletedPhotoIds, api, token);
    } else {
        console.log("Aucune photo supprimée à afficher.");
    }
};

// Fonction pour récupérer les IDs des photos supprimées
const fetchDeletedPhotoIds = async () => {
    // Implémentez la logique pour récupérer les IDs des photos supprimées
    return [1]; // Retournez un tableau avec les IDs
};

// Fonction pour restaurer les photos supprimées
const restoreDeletedPhotos = async (deletedPhotoIds, api, token) => {
    for (const photoId of deletedPhotoIds) {
        try {
            const response = await fetch(api + "/works/" + photoId, {
                method: "POST", // Utilisez POST ou PUT selon votre API
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    // Données nécessaires pour restaurer
                })
            });

            if (response.ok) {
                console.log(`Photo avec ID ${photoId} restaurée avec succès.`);
                // Logique pour afficher à nouveau la photo dans l'interface utilisateur
            } else {
                console.error(`Erreur lors de la restauration de la photo avec ID ${photoId}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Erreur lors de la tentative de restauration :", error.message);
        }
    }
};

// Charger les photos supprimées au démarrage de la page
document.addEventListener("DOMContentLoaded", loadDeletedPhotos);