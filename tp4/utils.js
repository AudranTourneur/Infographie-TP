/*
  Ce fichier contient des fonctions utilitaires utilisés par le reste du projet
*/

// Dessine les axes du plan (repère)
export function drawAxisGraduation() {
    // Création d'un groupe three.js pour grouper nos objets relatif aux axes
    let axisGroup = new THREE.Group();
    // Création du matériau et des constantes numériques
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const gradSize = 0.15;
    axisMaterial.opacity = 0.35;
    axisMaterial.transparent = true;

    // Contiendra les points respectivement X et Y de l'axe
    const Xpoints = [];
    const Ypoints = [];

    // Bords du plan (à gauche, à droite, en haut, en bas)
    Xpoints.push(new THREE.Vector3(-window.innerWidth, 0, 0));
    Xpoints.push(new THREE.Vector3(window.innerWidth, 0, 0));
    Ypoints.push(new THREE.Vector3(0, -window.innerHeight, 0));
    Ypoints.push(new THREE.Vector3(0, window.innerHeight, 0));

    // Objets géométriques formant les segments
    const Xgeometry = new THREE.BufferGeometry().setFromPoints(Xpoints);
    const Ygeometry = new THREE.BufferGeometry().setFromPoints(Ypoints);

    // Les objets three.js concrets qui formeront l'axe
    const Xline = new THREE.Line(Xgeometry, axisMaterial);
    const Yline = new THREE.Line(Ygeometry, axisMaterial);

    axisGroup.add(Xline);
    axisGroup.add(Yline);

    // Pour chaque pixel du plan selon l'axe X :
    for (let i = 0; i < window.innerWidth; i++) {
        // Tableau contenant les graduations dans le sens positif
        let gradX = [];
        // Idem pour le sens négatif
        let gradXNeg = [];

        // Création des graduations
        // Graduations positives 
        gradX.push(new THREE.Vector3(i, gradSize, 0));
        gradX.push(new THREE.Vector3(i, -gradSize, 0));
        // Graduations négatives
        gradXNeg.push(new THREE.Vector3(-i, gradSize, 0));
        gradXNeg.push(new THREE.Vector3(-i, -gradSize, 0));

        // Objets géométriques des graduations
        let gradXNegGeo = new THREE.BufferGeometry().setFromPoints(gradXNeg);
        let gradXNegLine = new THREE.Line(gradXNegGeo, axisMaterial);
        let gradXGeo = new THREE.BufferGeometry().setFromPoints(gradX);
        let gradXLine = new THREE.Line(gradXGeo, axisMaterial);


        axisGroup.add(gradXNegLine);
        axisGroup.add(gradXLine);
    }

    // Logique identique que précédement mais pour l'axe Y
    for (let i = 0; i < window.innerHeight; i++) {
        let gradY = [];
        let gradYNeg = [];

        gradY.push(new THREE.Vector3(gradSize, i, 0));
        gradY.push(new THREE.Vector3(-gradSize, i, 0));
        gradYNeg.push(new THREE.Vector3(gradSize, -i, 0));
        gradYNeg.push(new THREE.Vector3(-gradSize, -i, 0));

        let gradYNegGeo = new THREE.BufferGeometry().setFromPoints(gradYNeg);
        let gradYNegLine = new THREE.Line(gradYNegGeo, axisMaterial);
        let gradYGeo = new THREE.BufferGeometry().setFromPoints(gradY);
        let gradYLine = new THREE.Line(gradYGeo, axisMaterial);

        axisGroup.add(gradYNegLine);
        axisGroup.add(gradYLine);
    }

    return axisGroup;
}


// Supprime un noeud et tous ses enfants (pour éviter les fuites de mémoire)
export function disposeNode(child) {
    if (child.geometry) // Si le noeud a une géométrie, on le supprime
        child.geometry.dispose()
    if (child.material) // Pareil si le noeud a un matériau
        child.material.dispose()
    if (child.children) { // Appel récursif sur tous les enfants
        for (const subchild of child.children) {
            disposeNode(subchild)
        }
    }
}