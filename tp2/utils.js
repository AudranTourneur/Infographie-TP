// https://dirask.com/posts/JavaScript-UUID-function-in-Vanilla-JS-1X9kgD
export function uuid() {
    return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// https://stackoverflow.com/a/56416622
export function clickEventToWorldCoords(e, canvas, camera) {
    console.log(e)
    // get x,y coords into canvas where click occurred
    const rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    // convert x,y to clip space; coords from top left, clockwise:
    // (-1,1), (1,1), (-1,-1), (1, -1)
    const mouse = new THREE.Vector3();
    mouse.x = ((x / canvas.clientWidth) * 2) - 1;
    mouse.y = (-(y / canvas.clientHeight) * 2) + 1;
    mouse.z = 0.5; // set to z position of mesh objects
    // reverse projection from 3D to screen
    mouse.unproject(camera);
    // convert from point to a direction
    mouse.sub(camera.position).normalize();
    // scale the projected ray
    const distance = -camera.position.z / mouse.z,
        scaled = mouse.multiplyScalar(distance),
        coords = camera.position.clone().add(scaled);
    console.log('coords', coords)
    return coords;
}

export function drawAxisGraduation() {
    let axisGroup= new THREE.Group();
    const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const gradSize = 0.15;     //Half of the size of a graduation
    axisMaterial.opacity=0.35;
    axisMaterial.transparent=true;

    const Xpoints = [];
    const Ypoints = [];

    Xpoints.push(new THREE.Vector3(-window.innerWidth, 0, 0));
    Xpoints.push(new THREE.Vector3(window.innerWidth, 0, 0));
    Ypoints.push(new THREE.Vector3(0, -window.innerHeight, 0));
    Ypoints.push(new THREE.Vector3(0, window.innerHeight, 0));

    const Xgeometry = new THREE.BufferGeometry().setFromPoints(Xpoints);
    const Ygeometry = new THREE.BufferGeometry().setFromPoints(Ypoints);

    const Xline = new THREE.Line(Xgeometry, axisMaterial);
    const Yline = new THREE.Line(Ygeometry, axisMaterial);

    axisGroup.add(Xline);
    axisGroup.add(Yline);


    for (let i = 0; i < window.innerWidth; i++) {
        let gradX = [];
        let gradXNeg = [];

        gradX.push(new THREE.Vector3(i, gradSize, 0));
        gradX.push(new THREE.Vector3(i, -gradSize, 0));
        gradXNeg.push(new THREE.Vector3(-i, gradSize, 0));
        gradXNeg.push(new THREE.Vector3(-i, -gradSize, 0));

        let gradXNegGeo = new THREE.BufferGeometry().setFromPoints(gradXNeg);
        let gradXNegLine = new THREE.Line(gradXNegGeo, axisMaterial);
        let gradXGeo = new THREE.BufferGeometry().setFromPoints(gradX);
        let gradXLine = new THREE.Line(gradXGeo, axisMaterial);


        axisGroup.add(gradXNegLine);
        axisGroup.add(gradXLine);
    }

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


export function disposeNode(child) {
    if (child.geometry)
        child.geometry.dispose()
    if (child.material)
        child.material.dispose()
    if (child.children) {
        for (const subchild of child.children) {
            disposeNode(subchild)
        }
    }
}

// Renvoie k parmi n
export function choose(n, k) {
    if (k === 0) return 1;
    return (n * choose(n - 1, k - 1)) / k;
}

export function round2(num) {
    return Math.round(num * 100) / 100
}