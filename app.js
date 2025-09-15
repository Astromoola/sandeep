// ---------------------------
// Scene Setup and Initialization
// ---------------------------

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 15;

// ---------------------------
// Lighting
// ---------------------------

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.6);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
pointLight2.position.set(-10, -10, -10);
scene.add(pointLight2);

// ---------------------------
// Texture Loader and Planet Textures
// ---------------------------

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("renders/earth_texture_map_1000px.jpg");
const earthBumpMap = textureLoader.load("renders/earth_texture_map_1000px.jpg");
const moonTexture = textureLoader.load("renders/moonmap2k.jpg");
const moonBumpMap = textureLoader.load("renders/moonmap2k.jpg");
const jupiterTexture = textureLoader.load("renders/jupiter2_1k.jpg");
const saturnTexture = textureLoader.load("renders/2k_saturn.jpg");
const marsBumpMap = textureLoader.load("renders/2k_mars.jpg");
const mercuryBumpMap = textureLoader.load("renders/mercurybump.jpg");
const venusBumpMap = textureLoader.load("renders/venusbump.jpg");
const sunBumpMap = textureLoader.load("renders/sunmap.jpg");
const saturnBumpMap = textureLoader.load('renders/2k_saturn.jpg');

// ---------------------------
// Planet Colors and Creation Function
// ---------------------------

const planetColors = {
    sun: 0xffa500,
    moon: 0xffffff,
    mercury: 0x66ff66,
    venus: 0xff99ff,
    mars: 0xff3333,
    jupiter: 0xffcc00,
    saturn: 0x9999ff,
    rahu: 0x000000,
    ketu: 0x000000
};

function createPlanet(size, color, texture = null, bumpMap = null) {
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const materialOptions = { color, roughness: 0.7, metalness: 0.1 };

    if (texture) materialOptions.map = texture;
    if (bumpMap) materialOptions.bumpMap = bumpMap, materialOptions.bumpScale = 0.002;

    const material = new THREE.MeshStandardMaterial(materialOptions);
    return new THREE.Mesh(geometry, material);
}

// ---------------------------
// Planet Creation and Glow Function
// ---------------------------

function createGlow(planet, glowColor, sizeMultiplier) {
    const glowTexture = textureLoader.load("renders/sp2.png");
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: glowColor,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(sizeMultiplier, sizeMultiplier, 1);
    planet.add(glow);
}

// ---------------------------
// Creating Planets and Adding them to the Scene
// ---------------------------

const sun = createPlanet(0.7, planetColors.sun, sunBumpMap);
const earth = createPlanet(1, planetColors.earth, earthTexture, earthBumpMap);
const moon = createPlanet(0.3, planetColors.moon, moonTexture, moonBumpMap);
const mercury = createPlanet(0.3, planetColors.mercury, mercuryBumpMap);
const venus = createPlanet(0.35, planetColors.venus, venusBumpMap);
const mars = createPlanet(0.4, planetColors.mars, marsBumpMap);
const jupiter = createPlanet(0.7, planetColors.jupiter, jupiterTexture);
const saturn = createPlanet(0.6, planetColors.saturn, saturnTexture, saturnBumpMap);
const rahu = createPlanet(0.3, planetColors.rahu);
const ketu = createPlanet(0.3, planetColors.ketu);

scene.add(sun, earth, moon, mercury, venus, mars, jupiter, saturn, rahu, ketu);

// ---------------------------
// Saturn's Ring
// ---------------------------

const saturnRingGeometry = new THREE.RingGeometry(0.8, 1.5, 64);
const saturnRingMap = textureLoader.load("renders/saturnringpattern.jpg");
const saturnRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xe5e4e2,
    side: THREE.DoubleSide,
    transparent: true,
    bumpMap: saturnRingMap,
    opacity: 0.7
});
const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRing.rotation.x = Math.PI / 3;
saturnRing.position.y = 0.04;
saturn.add(saturnRing);

// ---------------------------
// Orbit Positions
// ---------------------------

const orbits = {
    sun: 7,
    mercury: 4,
    venus: 5.2,
    moon: 1.5,
    mars: 8.5,
    jupiter: 9.5,
    saturn: 14.1,
    rahu: 0.6,
    ketu: 0.6
};

// ---------------------------
// Star Creation and Glow Effect
// ---------------------------

function createStarWithGlow(starRadius) {
    const starGeometry = new THREE.SphereGeometry(starRadius, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    const glowTexture = textureLoader.load("renders/sp2.png");
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(starRadius * 10, starRadius * 10, 1);
    star.add(glowSprite);
    return star;
}

function addStarsWithGlow() {
    const starGroup = new THREE.Group();
    for (let i = 0; i < 800; i++) {
        const star = createStarWithGlow(0.3);
        star.position.set(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );
        starGroup.add(star);
    }
    scene.add(starGroup);
}
addStarsWithGlow();

// ---------------------------
// Planet Labels
// ---------------------------

function createTextLabel(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "30px Arial";
    context.fillStyle = "white";
    context.fillText(text, 0, 30);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.75, 1);
    return sprite;
}

const planetLabels = {
    sun: createTextLabel("Sun"),
    earth: createTextLabel("Earth"),
    moon: createTextLabel("Moon"),
    mercury: createTextLabel("Mercury"),
    venus: createTextLabel("Venus"),
    mars: createTextLabel("Mars"),
    jupiter: createTextLabel("Jupiter"),
    saturn: createTextLabel("Saturn"),
    rahu: createTextLabel("Rahu"),
    ketu: createTextLabel("Ketu")
};

sun.add(planetLabels.sun);
earth.add(planetLabels.earth);
moon.add(planetLabels.moon);
mercury.add(planetLabels.mercury);
venus.add(planetLabels.venus);
mars.add(planetLabels.mars);
jupiter.add(planetLabels.jupiter);
saturn.add(planetLabels.saturn);
rahu.add(planetLabels.rahu);
ketu.add(planetLabels.ketu);

// Initially hide labels
Object.values(planetLabels).forEach(label => label.visible = false);

// ---------------------------
// Toggle Planet Names
// ---------------------------

const toggleNamesCheckbox = document.getElementById("toggle-names");
toggleNamesCheckbox.addEventListener("change", () => {
    const showNames = toggleNamesCheckbox.checked;
    Object.values(planetLabels).forEach(label => label.visible = showNames);
});

// ---------------------------
// Carousel and Slide Navigation
// ---------------------------

const slides = document.querySelectorAll(".carousel-item");
const dotsContainer = document.getElementById("carousel-dots");
let currentSlide = 0;

slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.classList.add("dot");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

function updateCarousel() {
    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentSlide);
    });
    const dots = document.querySelectorAll("#carousel-dots button");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

updateCarousel();

// ---------------------------
// Animation Loop for Planet Orbits
// ---------------------------

let angle = 0;
let sunAngle = 0;
let moonAngle = 0;
let nodeAngle = 0;


let mercuryOffset = 0;
let venusOffset = 0;
let marsOffset = 0;



 // Define an inclination for Rahu and Ketu's orbits
 const rahuInclination = Math.PI / 6; // 30 degrees inclination (adjust as necessary)
 const ketuInclination = Math.PI / 6; // 30 degrees inclination (adjust as necessary)
 // Define inclination for the Moon's orbit and Rahu/Ketu's orbit
 const moonInclination = Math.PI / 6; // 30 degrees inclination for the Moon
 const nodeInclination = Math.PI / 6; // 30 degrees inclination for Rahu/Ketu


 // Orbit distances
const moonOrbitRadius = orbits.moon;
const nodeOrbitRadius = moonOrbitRadius; // Rahu/Ketu orbit same radius as Moon
function animate() {
    requestAnimationFrame(animate);

    angle += 0.01;
    sunAngle += 0.01;
    moonAngle -= 0.03;
    nodeAngle += 0.007;

    earth.rotation.y += 0.01;

    sun.position.set(Math.cos(sunAngle) * orbits.sun * -1, 0, Math.sin(sunAngle) * orbits.sun);
    // Mercury stays within 28 degrees of Sun
    mercuryOffset = Math.sin(sunAngle) * 0.5; // Keep Mercury close to Sun
    mercury.position.set(Math.cos(sunAngle + mercuryOffset) * orbits.mercury * -1, 0, Math.sin(sunAngle + mercuryOffset) * orbits.mercury);

    // Venus stays within 47 degrees of Sun
    venusOffset = Math.sin(sunAngle) * 0.8;
    venus.position.set(Math.cos(sunAngle + venusOffset) * orbits.venus * -1, 0, Math.sin(sunAngle + venusOffset) * orbits.venus);

    // Mars stays within 90 degrees of Sun
    marsOffset = Math.sin(sunAngle) * 1.5;
    mars.position.set(Math.cos(sunAngle + marsOffset) * orbits.mars * -1, 0, Math.sin(sunAngle + marsOffset) * orbits.mars);

    // Jupiter and Saturn orbit freely
    jupiter.position.set(Math.cos(angle * 0.8) * orbits.jupiter * -1, 0, Math.sin(angle * 0.8) * orbits.jupiter);
    saturn.position.set(Math.cos(angle * 0.4) * orbits.saturn * -1, 0, Math.sin(angle * 0.4) * orbits.saturn);
    saturn.rotation.y += 0.01

    // Rahu's position (revolving along y-axis)
const rahuX = Math.cos(nodeAngle) * nodeOrbitRadius; // Horizontal movement (x-axis)
const rahuY = 0; // Fixed along y-axis (no vertical movement)
const rahuZ = Math.sin(nodeAngle) * nodeOrbitRadius; // Horizontal movement (z-axis)

// Ketu's position (180 degrees apart from Rahu, revolving along the y-axis)
const ketuX = Math.cos(nodeAngle + Math.PI) * nodeOrbitRadius; // Opposite horizontal movement (x-axis)
const ketuY = 0; // Fixed along y-axis (same height as Rahu)
const ketuZ = Math.sin(nodeAngle + Math.PI) * nodeOrbitRadius; // Opposite horizontal movement (z-axis)

// Update Rahu and Ketu positions
rahu.position.set(rahuX, rahuY, rahuZ);
ketu.position.set(ketuX, ketuY, ketuZ);


    // Moon orbit: Should cross Rahu and Ketu at certain points (nodes)
    moonAngle += 0.008; // Adjust speed for the Moon's orbit

    const moonX = Math.cos(moonAngle) * moonOrbitRadius;
    const moonY = Math.sin(moonInclination) * Math.sin(moonAngle) * moonOrbitRadius;
    const moonZ = Math.sin(moonAngle) * moonOrbitRadius;

    // Update Moon position
    moon.position.set(moonX, moonY, moonZ);


        renderer.render(scene, camera);
}


animate();

document.querySelectorAll('.project-card').forEach(card => {

    const buttons = card.querySelector('.button-container');

    // Initially hide the buttons
   // buttons.style.display = 'none';

    // Handle card expansion on click
    card.addEventListener('click', () => {
        if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
            buttons.style.display = 'flex';

            // Show buttons after 500 ms
            setTimeout(() => {
                
                buttons.style.pointerEvents = 'auto'; // Activate the buttons
            }, 100);
        }
    });

    // Handle mobile touch
    card.addEventListener('touchend', () => {
        if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
            buttons.style.display = 'flex';

            // Show buttons after 500 ms
            setTimeout(() => {
                
                buttons.style.pointerEvents = 'auto'; // Activate the buttons
            }, 100);
        }
    });

    // Make buttons visible on hover for web
    card.addEventListener('mouseover', () => {
        if (!card.classList.contains('expanded')) {
            buttons.style.display = 'flex';
        }
    });

    // Hide buttons when hover is off
    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('expanded')) {
            buttons.style.display = 'none';
        }
    });

    // Handle clicks on the buttons
    buttons.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent propagation to the card itself
    });

    buttons.addEventListener('touchend', (e) => {
        e.stopPropagation(); // Prevent propagation to the card itself
    });

    // Collapse the card on clicking outside
    document.addEventListener('click', (e) => {
        if (!card.contains(e.target) && card.classList.contains('expanded')) {
            card.classList.remove('expanded');
           

            // Hide buttons immediately
            buttons.style.display = 'none';
            buttons.style.pointerEvents = 'none';
        }
    });

    // Collapse the card on touch outside
    document.addEventListener('touchend', (e) => {
        if (!card.contains(e.target) && card.classList.contains('expanded')) {
            card.classList.remove('expanded');
            

            // Hide buttons immediately
            buttons.style.display = 'none';
            buttons.style.pointerEvents = 'none';
        }
    });
});

