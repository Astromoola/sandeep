// ============================================================
// Cosmos — layered starfield, planets in depth, mouse parallax,
// scroll-aware camera. Twilight/aurora cinematic background.
// ============================================================

const canvas = document.getElementById('cosmos');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07071a, 0.012);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
);
camera.position.set(0, 0, 42);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ------------------------------------------------------------
// Lighting — the sun is the source. Everything else is lit by it.
// ------------------------------------------------------------
const ambient = new THREE.AmbientLight(0xb8b3e6, 0.25);
scene.add(ambient);

// The sun-light follows the sun's position each frame
const sunLight = new THREE.PointLight(0xfff4d6, 2.2, 200, 1.4);
scene.add(sunLight);

// ------------------------------------------------------------
// Texture loading
// ------------------------------------------------------------
const tex = new THREE.TextureLoader();
const earthTex   = tex.load('renders/earth_texture_map_1000px.jpg');
const moonTex    = tex.load('renders/moonmap2k.jpg');
const jupiterTex = tex.load('renders/jupiter2_1k.jpg');
const saturnTex  = tex.load('renders/2k_saturn.jpg');
const marsTex    = tex.load('renders/2k_mars.jpg');
const mercuryTex = tex.load('renders/mercurybump.jpg');
const venusTex   = tex.load('renders/venusbump.jpg');
const sunTex     = tex.load('renders/sunmap.jpg');
const ringTex    = tex.load('renders/saturnringpattern.jpg');
const glowTex    = tex.load('renders/sp2.png');

// ------------------------------------------------------------
// Planet factory
// ------------------------------------------------------------
function makePlanet({ size, map, emissive = 0x000000, emissiveIntensity = 0, roughness = 0.85 }) {
    const geom = new THREE.SphereGeometry(size, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
        map,
        roughness,
        metalness: 0.05,
        emissive,
        emissiveIntensity
    });
    return new THREE.Mesh(geom, mat);
}

// ------------------------------------------------------------
// Build the cosmos — earth-centred, sun is the only luminous body
// ------------------------------------------------------------
const cosmos = new THREE.Group();
// Tilt the orbital plane toward the viewer (orrery-style) and drop it
// below the headline so the system isn't pasted across the title.
cosmos.rotation.x = -0.45;
cosmos.rotation.z = 0.06;
cosmos.position.y = -12;
scene.add(cosmos);

// Earth sits at the centre (Vedic geocentric). Everything else orbits.
const earth = makePlanet({ size: 1.1, map: earthTex });
earth.position.set(0, 0, 0);
cosmos.add(earth);

// Sun — the only luminous body. Use the texture itself as the emission
// source so the sunmap render is visible while the sphere glows.
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 64, 64),
    new THREE.MeshBasicMaterial({ map: sunTex })
);
cosmos.add(sun);

// Inner bodies (mercury, venus) librate around the sun's angle.
// Mars stays within ~90° of sun. Jupiter and Saturn move freely.
// All orbits live in the XZ plane around earth.
const moon    = makePlanet({ size: 0.34, map: moonTex });
const mercury = makePlanet({ size: 0.42, map: mercuryTex });
const venus   = makePlanet({ size: 0.55, map: venusTex });
const mars    = makePlanet({ size: 0.50, map: marsTex });
const jupiter = makePlanet({ size: 1.20, map: jupiterTex });
const saturn  = makePlanet({ size: 1.00, map: saturnTex });
[moon, mercury, venus, mars, jupiter, saturn].forEach(p => cosmos.add(p));

// Saturn's ring
const ringGeom = new THREE.RingGeometry(1.35, 2.2, 96);
const ringPos = ringGeom.attributes.position;
const ringUV = ringGeom.attributes.uv;
for (let i = 0; i < ringPos.count; i++) {
    const x = ringPos.getX(i);
    const y = ringPos.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    ringUV.setXY(i, (dist - 1.35) / (2.2 - 1.35), 0.5);
}
const ringMat = new THREE.MeshBasicMaterial({
    map: ringTex,
    color: 0xe5d5a8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
});
const ring = new THREE.Mesh(ringGeom, ringMat);
ring.rotation.x = Math.PI / 2.3;
saturn.add(ring);

// Orbit radii (around earth at origin)
const orbit = {
    moon:    4.5,
    mercury: 7.5,
    venus:   9.5,
    sun:     13,
    mars:    16,
    jupiter: 22,
    saturn:  30
};

// Inclination for the moon's orbit
const moonInclination = Math.PI / 8;

// ------------------------------------------------------------
// Layered starfields — depth via separate groups with parallax
// ------------------------------------------------------------
function buildStarLayer({ count, range, size, color, opacity }) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = range * (0.5 + Math.random() * 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi) - range * 0.2;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color,
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        map: glowTex
    });
    const points = new THREE.Points(geom, mat);
    return points;
}

const starFar  = buildStarLayer({ count: 2200, range: 900, size: 1.8, color: 0xe8e6ff, opacity: 0.85 });
const starMid  = buildStarLayer({ count: 900,  range: 500, size: 2.4, color: 0xc4b8ff, opacity: 0.9 });
const starNear = buildStarLayer({ count: 280,  range: 250, size: 3.2, color: 0xfde68a, opacity: 0.95 });
scene.add(starFar, starMid, starNear);

// ------------------------------------------------------------
// Mouse parallax + scroll-aware camera
// ------------------------------------------------------------
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollY = 0;
let scrollTarget = 0;
window.addEventListener('scroll', () => {
    scrollTarget = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
}, { passive: true });

// ------------------------------------------------------------
// Animation loop
// ------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    // smooth pointer
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // smooth scroll progress 0..1
    scrollY += (scrollTarget - scrollY) * 0.06;

    // ----- Geocentric orbits (Vedic style) — circles around earth at origin
    // base angular velocity
    const omega = t * 0.06;

    // Sun — anchor for the inner planets
    const sunAngle = omega;
    sun.position.set(Math.cos(sunAngle) * orbit.sun, 0, Math.sin(sunAngle) * orbit.sun);
    sun.rotation.y += 0.004;

    // Mercury librates ±28° around the sun's direction
    const mercuryAngle = sunAngle + Math.sin(t * 0.4) * (28 * Math.PI / 180);
    mercury.position.set(Math.cos(mercuryAngle) * orbit.mercury, 0, Math.sin(mercuryAngle) * orbit.mercury);
    mercury.rotation.y += 0.003;

    // Venus librates ±47° around the sun's direction
    const venusAngle = sunAngle + Math.sin(t * 0.25) * (47 * Math.PI / 180);
    venus.position.set(Math.cos(venusAngle) * orbit.venus, 0, Math.sin(venusAngle) * orbit.venus);
    venus.rotation.y += 0.003;

    // Mars wanders, biased toward the sun's hemisphere
    const marsAngle = sunAngle * 0.55 + Math.sin(t * 0.15) * 0.9;
    mars.position.set(Math.cos(marsAngle) * orbit.mars, 0, Math.sin(marsAngle) * orbit.mars);
    mars.rotation.y += 0.0035;

    // Jupiter and Saturn — independent, slow orbits
    const jupiterAngle = omega * 0.45 + 1.7;
    jupiter.position.set(Math.cos(jupiterAngle) * orbit.jupiter, 0, Math.sin(jupiterAngle) * orbit.jupiter);
    jupiter.rotation.y += 0.0025;

    const saturnAngle = omega * 0.22 + 3.9;
    saturn.position.set(Math.cos(saturnAngle) * orbit.saturn, 0, Math.sin(saturnAngle) * orbit.saturn);
    saturn.rotation.y += 0.002;

    // Moon — inclined orbit close to earth (origin), faster
    const moonAngle = omega * 4.2;
    moon.position.set(
        Math.cos(moonAngle) * orbit.moon,
        Math.sin(moonAngle) * orbit.moon * Math.sin(moonInclination),
        Math.sin(moonAngle) * orbit.moon * Math.cos(moonInclination)
    );
    moon.rotation.y += 0.005;

    // Earth slow spin
    earth.rotation.y += 0.0025;

    // Move the sun light with the sun
    sunLight.position.copy(sun.position);

    // Gentle ring breathing
    if (ring) ring.rotation.z += 0.0008;

    // starfield slow drift + parallax
    starFar.rotation.y  += 0.00008;
    starMid.rotation.y  += 0.00018;
    starNear.rotation.y += 0.00038;

    starFar.position.x  = pointer.x * 4;
    starFar.position.y  = -pointer.y * 4;
    starMid.position.x  = pointer.x * 10;
    starMid.position.y  = -pointer.y * 10;
    starNear.position.x = pointer.x * 18;
    starNear.position.y = -pointer.y * 18;

    // camera drift on mouse, and pulls in slightly on scroll
    const targetX = pointer.x * 3.5;
    const targetY = -pointer.y * 2.5 + scrollY * 8;
    const targetZ = 42 - scrollY * 6;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(0, -8 + scrollY * 4, 0);

    // fade cosmos as we scroll past the hero
    canvas.style.opacity = String(Math.max(0.35, 1 - scrollY * 0.85));

    renderer.render(scene, camera);
}
animate();

// ============================================================
// Live cosmic ticker — weekday ruler + moon phase
// (poetic, accurate-ish: weekday ruler is exact, phase is a
// simple synodic approximation. Good enough for a sky line.)
// ============================================================
(function () {
    const tickerText = document.getElementById('ticker-text');
    if (!tickerText) return;

    const dayRulers = [
        { day: 'sunday',    ruler: 'the sun',    glyph: '☉' },
        { day: 'monday',    ruler: 'the moon',   glyph: '☾' },
        { day: 'tuesday',   ruler: 'mars',       glyph: '♂' },
        { day: 'wednesday', ruler: 'mercury',    glyph: '☿' },
        { day: 'thursday',  ruler: 'jupiter',    glyph: '♃' },
        { day: 'friday',    ruler: 'venus',      glyph: '♀' },
        { day: 'saturday',  ruler: 'saturn',     glyph: '♄' }
    ];

    function moonPhase(date) {
        // reference new moon: 2000-01-06 18:14 UTC
        const ref = Date.UTC(2000, 0, 6, 18, 14, 0);
        const synodic = 29.530588853;
        const diff = (date.getTime() - ref) / 86400000;
        const phase = ((diff % synodic) + synodic) % synodic / synodic;
        if (phase < 0.03 || phase > 0.97) return { name: 'new moon',         glyph: '●' };
        if (phase < 0.22)                  return { name: 'waxing crescent', glyph: '☽' };
        if (phase < 0.28)                  return { name: 'first quarter',   glyph: '◐' };
        if (phase < 0.47)                  return { name: 'waxing gibbous',  glyph: '◑' };
        if (phase < 0.53)                  return { name: 'full moon',       glyph: '○' };
        if (phase < 0.72)                  return { name: 'waning gibbous',  glyph: '◒' };
        if (phase < 0.78)                  return { name: 'last quarter',    glyph: '◑' };
        return { name: 'waning crescent', glyph: '☾' };
    }

    function render() {
        const now = new Date();
        const d = dayRulers[now.getDay()];
        const m = moonPhase(now);
        const lines = [
            `${d.glyph} ${d.day} belongs to ${d.ruler}`,
            `${m.glyph} ${m.name}`,
            `${d.glyph} hora of ${d.ruler}`
        ];
        let i = 0;
        tickerText.textContent = lines[i];
        return setInterval(() => {
            i = (i + 1) % lines.length;
            tickerText.style.opacity = '0';
            setTimeout(() => {
                tickerText.textContent = lines[i];
                tickerText.style.opacity = '1';
            }, 300);
        }, 4200);
    }

    tickerText.style.transition = 'opacity 0.3s ease';
    render();
})();

// ============================================================
// Card 3D tilt on pointer
// ============================================================
(function () {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
        let raf = null;
        let rect = null;

        const update = (e) => {
            if (!rect) rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotX = (0.5 - y) * 6;
            const rotY = (x - 0.5) * 6;
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                card.style.transform = `translateY(-4px) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            });
        };

        const reset = () => {
            rect = null;
            if (raf) cancelAnimationFrame(raf);
            card.style.transform = '';
        };

        card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
        card.addEventListener('pointermove', update);
        card.addEventListener('pointerleave', reset);
    });
})();

// ============================================================
// Reveal on scroll
// ============================================================
(function () {
    const targets = document.querySelectorAll('.card, .section-head, .social-link');
    targets.forEach((el) => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('in'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach((el) => io.observe(el));
})();
