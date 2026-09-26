import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// ─── SCENE ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x0a0a1a, 2.5);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xfff4e0, 10, 0, 0.06);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x2244aa, 0.5);
rimLight.position.set(-300, 150, -200);
scene.add(rimLight);

// ─── CAMERA ───────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 5000);
camera.position.set(0, 120, 220);

// ─── RENDERER ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.getElementById('app')?.appendChild(renderer.domElement);

// ─── CONTROLS ─────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.maxDistance = 2000;
controls.minDistance = 2;
controls.enableZoom = false; // We handle zoom manually for smooth momentum

// ─── MOMENTUM ZOOM ────────────────────────────────────────────────────────────
let zoomVelocity = 0;          // current zoom speed
const ZOOM_FRICTION = 0.92;    // how quickly momentum decays (lower = longer glide)
const ZOOM_SENSITIVITY = 0.05; // reduced — slow, controlled zoom
const ZOOM_MIN = 2;
const ZOOM_MAX = 2000;

window.addEventListener('wheel', (e: WheelEvent) => {
  e.preventDefault();
  // Normalise delta across browsers / trackpads
  const delta = e.deltaY !== 0 ? e.deltaY : -e.deltaX;
  zoomVelocity += delta * ZOOM_SENSITIVITY;
}, { passive: false });

// ─── DATA TYPES ───────────────────────────────────────────────────────────────
interface MoonData {
  name: string;
  size: number;
  orbit: number;
  speed: number;
  color: number;
  glowColor: number;
  fact: string;
  description: string;
}

interface PlanetData {
  name: string;
  size: number;
  distance: number;
  speed: number;
  tilt: number;
  color: number;
  glowColor: number;
  type: string;
  moonCount: number;
  distanceFromSun: string;
  fact: string;
  description: string;
  moonData?: MoonData[];
}

// ─── PLANET + MOON DATA ───────────────────────────────────────────────────────
const planetsData: PlanetData[] = [
  {
    name: 'Sun', size: 18, distance: 0, speed: 0, tilt: 0,
    color: 0xff9500, glowColor: 0xff6600,
    type: 'Star ☀️', moonCount: 0, distanceFromSun: '0 km',
    fact: '99.86% of the solar system\'s mass lives here',
    description: 'A colossal nuclear furnace 1.4 million km wide. Every second, the Sun converts 600 million tons of hydrogen into helium. Its surface sits at 5,500°C while its corona mysteriously reaches 2,000,000°C — a puzzle scientists are still trying to solve.'
  },
  {
    name: 'Mercury', size: 2.2, distance: 32, speed: 0.047, tilt: 0.03,
    color: 0x9a9a9a, glowColor: 0x555555,
    type: 'Planet 🪨', moonCount: 0, distanceFromSun: '57.9M km',
    fact: 'A Mercurian day lasts longer than its year',
    description: 'The smallest, most cratered, most extreme planet. Temperature swings of 600°C between day and night. Mercury\'s iron core makes up 85% of its radius — if you stood on its surface, the Sun would appear 3x larger than from Earth.'
  },
  {
    name: 'Venus', size: 4, distance: 50, speed: 0.018, tilt: 177,
    color: 0xf5c97a, glowColor: 0xe8a020,
    type: 'Planet 🌋', moonCount: 0, distanceFromSun: '108.2M km',
    fact: 'The Sun rises in the west on Venus',
    description: 'Earth\'s evil twin — a hellish world of crushing pressure and sulphuric acid clouds. The runaway greenhouse effect bakes the surface at 465°C constantly. Venus has more volcanoes than any other planet, and some may still be active today.'
  },
  {
    name: 'Earth', size: 4.5, distance: 70, speed: 0.01, tilt: 23.5,
    color: 0x1a6bd1, glowColor: 0x00aaff,
    type: 'Planet 🌍', moonCount: 1, distanceFromSun: '149.6M km',
    fact: 'The only known harbor of life in the universe',
    description: 'Our pale blue dot. Vast oceans cover 71% of the surface, a magnetic field shields all life from solar radiation, and the Moon stabilizes our axial tilt — giving us stable seasons. Earth has been home to billions of species over 3.8 billion years.',
    moonData: [
      {
        name: 'Moon', size: 1.1, orbit: 8, speed: 0.04,
        color: 0xccccbb, glowColor: 0x888877,
        fact: 'The Moon is slowly drifting away from Earth at 3.8 cm/year',
        description: 'Earth\'s only natural satellite. The Moon stabilizes our axial tilt, drives ocean tides, and was the first world beyond Earth visited by humans. Its far side is never visible from Earth — forever hidden.'
      }
    ]
  },
  {
    name: 'Mars', size: 3, distance: 95, speed: 0.008, tilt: 25,
    color: 0xc1440e, glowColor: 0x8b2500,
    type: 'Planet 🔴', moonCount: 2, distanceFromSun: '227.9M km',
    fact: 'Home to Olympus Mons — 3x the height of Everest',
    description: 'The Red Planet — a cold, ancient, rust-coloured desert world. Mars once had rivers, lakes, and a thick atmosphere. Now six rovers and landers explore its dusty plains, searching for signs of past microbial life. Humanity\'s next great destination.',
    moonData: [
      {
        name: 'Phobos', size: 0.55, orbit: 5.5, speed: 0.09,
        color: 0x887766, glowColor: 0x554433,
        fact: 'Phobos will collide with Mars or shatter into rings in ~50 million years',
        description: 'Mars\'s largest moon, Phobos is a dark, potato-shaped captured asteroid just 27 km across. It orbits so close that it rises and sets twice per Martian day, and tidal forces are slowly tearing it apart.'
      },
      {
        name: 'Deimos', size: 0.35, orbit: 9, speed: 0.05,
        color: 0x998877, glowColor: 0x665544,
        fact: 'Deimos takes 30 hours to orbit Mars — longer than a Martian day',
        description: 'The smaller of Mars\'s two moons, Deimos is just 15 km wide. It\'s so small and distant that from the Martian surface it appears as little more than a bright star, nearly indistinguishable from the night sky.'
      }
    ]
  },
  {
    name: 'Jupiter', size: 11, distance: 130, speed: 0.0022, tilt: 3.1,
    color: 0xc88b3a, glowColor: 0x9a6020,
    type: 'Gas Giant 🌀', moonCount: 95, distanceFromSun: '778.5M km',
    fact: 'The Great Red Spot has raged for over 350 years',
    description: 'The king of planets. So massive it could swallow all others combined — twice. Its iconic bands are supersonic jet streams at 650 km/h. Jupiter acts as a cosmic shield, its gravity deflecting asteroids and comets that would otherwise threaten the inner solar system.',
    moonData: [
      {
        name: 'Io', size: 1.2, orbit: 17, speed: 0.06,
        color: 0xffdd44, glowColor: 0xee8800,
        fact: 'The most volcanically active body in the solar system',
        description: 'Io is a hellscape of fire and sulfur. Jupiter\'s immense gravity relentlessly squeezes it, generating enough heat to sustain hundreds of active volcanoes. Plumes of sulfur shoot 500 km into space, painting the surface in vivid yellows, reds, and blacks.'
      },
      {
        name: 'Europa', size: 1.1, orbit: 22, speed: 0.04,
        color: 0xddeeff, glowColor: 0x88aacc,
        fact: 'Europa may hold more liquid water than all of Earth\'s oceans',
        description: 'Beneath Europa\'s smooth, cracked icy shell lies a vast saltwater ocean that may harbor life. The Hubble telescope has spotted plumes of water vapor erupting from its surface. NASA\'s Europa Clipper mission will investigate its habitability.'
      },
      {
        name: 'Ganymede', size: 1.4, orbit: 28, speed: 0.025,
        color: 0xaabb99, glowColor: 0x667755,
        fact: 'Ganymede is larger than the planet Mercury',
        description: 'The largest moon in the solar system — larger than Mercury and Pluto. Ganymede is the only moon with its own magnetic field, which creates auroras at its poles. It too likely harbors a subsurface ocean beneath its icy crust.'
      },
      {
        name: 'Callisto', size: 1.25, orbit: 35, speed: 0.015,
        color: 0x998888, glowColor: 0x665555,
        fact: 'Callisto\'s surface is the oldest in the solar system',
        description: 'Callisto is a battered, ancient world — the most heavily cratered object in the solar system. Its surface preserves a pristine record of impacts from 4 billion years ago. Unlike the other Galilean moons, tidal heating barely affects it.'
      }
    ]
  },
  {
    name: 'Saturn', size: 9, distance: 170, speed: 0.0009, tilt: 26.7,
    color: 0xe8d5a3, glowColor: 0xc8a84b,
    type: 'Gas Giant 💍', moonCount: 146, distanceFromSun: '1.43B km',
    fact: 'Saturn is so light it would float on water',
    description: 'The crown jewel of the solar system. Saturn\'s rings span 282,000 km yet are only 10-100 meters thick. With 146 moons, it is the most moon-rich planet. Titan has lakes of liquid methane, and Enceladus shoots water geysers into space — potential homes for life.',
    moonData: [
      {
        name: 'Titan', size: 1.5, orbit: 20, speed: 0.028,
        color: 0xddaa55, glowColor: 0xaa7722,
        fact: 'Titan is the only moon with a dense atmosphere and surface liquid',
        description: 'Saturn\'s largest moon is a world of extraordinary complexity. Titan has a thick nitrogen atmosphere, clouds of methane, lakes of liquid methane, and an orange haze. The Huygens probe landed there in 2005 — the farthest surface landing ever achieved.'
      },
      {
        name: 'Enceladus', size: 0.7, orbit: 14, speed: 0.06,
        color: 0xeef6ff, glowColor: 0xaaccee,
        fact: 'Enceladus shoots water geysers 500 km into space',
        description: 'Tiny Enceladus punches far above its weight. It has an active global ocean beneath its ice, and tiger-stripe geysers at its south pole spray water ice and organic molecules into space — feeding Saturn\'s E-ring. It is one of the most compelling candidates for extraterrestrial life.'
      },
      {
        name: 'Mimas', size: 0.6, orbit: 10, speed: 0.09,
        color: 0xcccccc, glowColor: 0x999999,
        fact: '"The Death Star Moon" — its giant crater is 1/3 of its diameter',
        description: 'Mimas bears the massive Herschel crater, giving it an uncanny resemblance to the Death Star from Star Wars. Despite appearing frozen solid, Mimas may harbor a global ocean — its wobbling orbit suggests something liquid lurks inside.'
      }
    ]
  },
  {
    name: 'Uranus', size: 6, distance: 210, speed: 0.00038, tilt: 97.8,
    color: 0x7de8e8, glowColor: 0x00bbbb,
    type: 'Ice Giant 🔵', moonCount: 27, distanceFromSun: '2.87B km',
    fact: 'Uranus rotates on its side — possibly from a giant ancient collision',
    description: 'The sideways planet. Knocked over billions of years ago, Uranus rolls through space tilted at 98°. The coldest planetary atmosphere at −224°C. Its moons are named after Shakespeare and Alexander Pope characters — Miranda has cliffs 20 km tall.',
    moonData: [
      {
        name: 'Miranda', size: 0.65, orbit: 10, speed: 0.07,
        color: 0xbbccdd, glowColor: 0x7799aa,
        fact: 'Miranda has cliffs 20 km tall — 10x the height of the Grand Canyon',
        description: 'The most geologically bizarre moon in the solar system. Miranda\'s surface is a patchwork of radically different terrains — ancient cratered plains alongside young, chaotic canyons and ridges. It may have been shattered and reassembled by an ancient impact.'
      },
      {
        name: 'Titania', size: 0.85, orbit: 17, speed: 0.04,
        color: 0xaabbcc, glowColor: 0x667788,
        fact: 'Titania is Uranus\'s largest moon — named after the Fairy Queen',
        description: 'Uranus\'s largest moon is scarred by massive fault canyons up to 1,500 km long and 75 km wide. Named after the Queen of the Fairies in A Midsummer Night\'s Dream, Titania may have a liquid water layer beneath its icy crust.'
      }
    ]
  },
  {
    name: 'Neptune', size: 5.5, distance: 250, speed: 0.00009, tilt: 28.3,
    color: 0x3f54ba, glowColor: 0x1a237e,
    type: 'Ice Giant 🌊', moonCount: 16, distanceFromSun: '4.5B km',
    fact: 'Neptune\'s winds reach 2,100 km/h — the fastest in the solar system',
    description: 'The dark, stormy edge of our solar system. Neptune receives 900x less sunlight than Earth yet generates the most powerful winds of any planet. Its largest moon Triton is a captured Kuiper Belt object orbiting backwards, doomed to eventually break apart into a spectacular ring system.',
    moonData: [
      {
        name: 'Triton', size: 1.1, orbit: 14, speed: 0.05,
        color: 0xbbddee, glowColor: 0x6699aa,
        fact: 'Triton orbits Neptune backwards — the only large moon to do so',
        description: 'Triton is Neptune\'s great cosmic prisoner — a captured Kuiper Belt Object forced into a retrograde orbit. It is geologically active, with nitrogen geysers erupting from its southern polar cap. Triton is slowly spiraling inward and will be torn apart by Neptune\'s gravity in ~3.6 billion years.'
      }
    ]
  },
];

// ─── NAMED BACKGROUND STARS ───────────────────────────────────────────────────
const namedStars = [
  { name: 'Proxima Centauri', color: 0xff6644, size: 6, position: new THREE.Vector3(800, 120, -600), fact: 'Closest star to our Sun at 4.24 light-years', description: 'A red dwarf star and part of the Alpha Centauri system. It hosts Proxima Centauri b — a planet in the habitable zone, and our best current candidate for a nearby Earth-like world.' },
  { name: 'Sirius', color: 0xaaddff, size: 10, position: new THREE.Vector3(-900, 200, 400), fact: 'The brightest star in Earth\'s night sky', description: 'A blazing white star 8.6 light-years away, twice the mass of the Sun and 25x more luminous. Sirius has a white dwarf companion — Sirius B — packed with the mass of the Sun in a sphere the size of Earth.' },
  { name: 'Betelgeuse', color: 0xff4400, size: 14, position: new THREE.Vector3(600, -100, 900), fact: 'It will explode as a supernova — visible in daylight', description: 'A red supergiant 700x larger than the Sun. If placed at the center of our solar system, Betelgeuse would engulf Jupiter. It is nearing the end of its life and will one day produce a supernova visible in daytime from Earth.' },
  { name: 'Vega', color: 0xeef0ff, size: 8, position: new THREE.Vector3(-400, 500, -900), fact: 'Vega was Earth\'s North Star 12,000 years ago', description: 'A brilliant white star 25 light-years away, spinning so fast its equator bulges outward. Vega was humanity\'s North Star 12,000 years ago due to Earth\'s axial wobble, and will be again in 14,000 years.' },
  { name: 'Rigel', color: 0xbbccff, size: 12, position: new THREE.Vector3(1100, 300, -200), fact: 'Rigel is 100,000x more luminous than our Sun', description: 'A blue supergiant and one of the most luminous stars known — so powerful that if it replaced our Sun, it would cast shadows at night from 100 light-years away. It anchors the lower-right corner of the Orion constellation.' },
  { name: 'Alpha Centauri A', color: 0xffeecc, size: 9, position: new THREE.Vector3(820, 80, -580), fact: 'Part of the nearest star system to Earth', description: 'The more massive of the Alpha Centauri binary pair, very similar to our Sun. Together with Proxima Centauri, this system is our closest stellar neighbor. Future interstellar missions will almost certainly head here first.' },
  { name: 'Polaris', color: 0xfff8ee, size: 7, position: new THREE.Vector3(0, 900, -500), fact: 'Earth\'s current North Star — a Cepheid variable', description: 'The North Star — almost perfectly aligned with Earth\'s rotational axis. Polaris is actually a triple star system. It is a Cepheid variable, pulsating in brightness every 4 days, and has been humanity\'s navigation guide for millennia.' },
  { name: 'Antares', color: 0xff3300, size: 13, position: new THREE.Vector3(-700, -200, 700), fact: 'Antares means "rival of Mars" in Greek', description: 'A red supergiant so vast that 700 million Suns could fit inside it. Antares is the brightest star in Scorpius and one of the largest stars visible to the naked eye. Like Betelgeuse, it is destined for a spectacular supernova death.' },
];

// ─── BUILD PLANETS ────────────────────────────────────────────────────────────
interface LivePlanet { mesh: THREE.Mesh; orbitGroup: THREE.Group; data: PlanetData; moons: LiveMoon[]; label: THREE.Sprite }
interface LiveMoon { mesh: THREE.Mesh; pivotGroup: THREE.Group; data: MoonData; speed: number; label: THREE.Sprite }
type ClickTarget = { type: 'planet'; data: PlanetData } | { type: 'moon'; data: MoonData } | { type: 'star'; data: typeof namedStars[0] };

const livePlanets: LivePlanet[] = [];
const allClickableMeshes: { mesh: THREE.Mesh; info: ClickTarget }[] = [];

// ─── LABEL FACTORY ────────────────────────────────────────────────────────────
function makeLabel(
  text: string,
  color: number,
  worldWidth: number,   // visual size in scene units
  yOffset: number       // how far above the object center
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Glow backing
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  ctx.font = 'bold 38px "Outfit", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
  ctx.shadowBlur = 18;
  ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
  ctx.fillText(text, 256, 48);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0,              // start invisible; shown on hover
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(worldWidth, worldWidth * 0.19, 1);
  sprite.position.y = yOffset;
  sprite.userData.baseOpacity = 0.95;
  return sprite;
}

planetsData.forEach((data) => {
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const isSun = data.name === 'Sun';
  const geo = new THREE.SphereGeometry(data.size, 72, 72);
  const mat = new THREE.MeshStandardMaterial({
    color: data.color,
    emissive: isSun ? data.color : data.glowColor,
    emissiveIntensity: isSun ? 2.5 : 0.55,
    roughness: isSun ? 0.3 : 0.78,
    metalness: isSun ? 0 : 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.x = data.distance;
  mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
  mesh.userData = { type: 'planet', ...data };
  orbitGroup.add(mesh);

  allClickableMeshes.push({ mesh, info: { type: 'planet', data } });

  // Floating planet label (attached to the orbitGroup so it orbits with the planet)
  const planetLabel = makeLabel(data.name, data.color, data.size * 5, data.size * 1.8);
  mesh.add(planetLabel);

  // Atmosphere layers
  if (!isSun) {
    const makeAtmo = (scale: number, opacity: number, side: THREE.Side) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(data.size * scale, 48, 48),
        new THREE.MeshBasicMaterial({ color: data.glowColor, transparent: true, opacity, blending: THREE.AdditiveBlending, side, depthWrite: false })
      );
      mesh.add(m);
    };
    makeAtmo(1.06, 0.22, THREE.FrontSide);
    makeAtmo(1.25, 0.07, THREE.BackSide);
  }

  // Sun corona layers
  if (isSun) {
    [[1.3, 0xff8800, 0.18], [1.65, 0xff5500, 0.08], [2.1, 0xff2200, 0.03]].forEach(([scale, col, op]) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(data.size * (scale as number), 32, 32),
        new THREE.MeshBasicMaterial({ color: col as number, transparent: true, opacity: op as number, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false })
      );
      mesh.add(m);
    });
  }

  // Orbit trail
  if (data.distance > 0) {
    const pts: number[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(Math.cos(a) * data.distance, 0, Math.sin(a) * data.distance);
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending })));
  }

  // Saturn rings
  if (data.name === 'Saturn') {
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(data.size * 1.45, data.size * 2.55, 128),
      new THREE.MeshBasicMaterial({ color: 0xddcc88, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
    );
    ringMesh.rotation.x = Math.PI / 2;
    mesh.add(ringMesh);
  }

  // Uranus rings (thin, tilted)
  if (data.name === 'Uranus') {
    const urRing = new THREE.Mesh(
      new THREE.RingGeometry(data.size * 1.3, data.size * 1.8, 64),
      new THREE.MeshBasicMaterial({ color: 0x44bbbb, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
    );
    urRing.rotation.y = Math.PI / 2;
    mesh.add(urRing);
  }

  // ── MOONS ────────────────────────────────────────────────────────────────
  const liveMoons: LiveMoon[] = [];
  if (data.moonData) {
    data.moonData.forEach((md, idx) => {
      const pivotGroup = new THREE.Group();
      // Stagger initial orbit angle so moons don't stack
      pivotGroup.rotation.y = (idx / data.moonData!.length) * Math.PI * 2;
      mesh.add(pivotGroup);

      const moonGeo = new THREE.SphereGeometry(md.size, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        color: md.color,
        emissive: md.glowColor,
        emissiveIntensity: 0.4,
        roughness: 0.85,
        metalness: 0.0,
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.x = md.orbit;
      moonMesh.userData = { type: 'moon', ...md };
      pivotGroup.add(moonMesh);

      // Moon atmosphere (tiny glow)
      const mgeo = new THREE.SphereGeometry(md.size * 1.18, 24, 24);
      const mmat = new THREE.MeshBasicMaterial({ color: md.glowColor, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false });
      moonMesh.add(new THREE.Mesh(mgeo, mmat));

      // Moon orbit ring (local to planet)
      const mOrbitPts: number[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        mOrbitPts.push(Math.cos(a) * md.orbit, 0, Math.sin(a) * md.orbit);
      }
      const mOrbitGeo = new THREE.BufferGeometry();
      mOrbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(mOrbitPts, 3));
      mesh.add(new THREE.Line(mOrbitGeo, new THREE.LineBasicMaterial({ color: md.color, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending })));

      allClickableMeshes.push({ mesh: moonMesh, info: { type: 'moon', data: md } });

      // Floating moon label
      const moonLabel = makeLabel(md.name, md.color, md.size * 9, md.size * 2.2);
      moonMesh.add(moonLabel);

      liveMoons.push({ mesh: moonMesh, pivotGroup, data: md, speed: md.speed, label: moonLabel });
    });
  }

  livePlanets.push({ mesh, orbitGroup, data, moons: liveMoons, label: planetLabel });
});

// ─── NAMED STARS ──────────────────────────────────────────────────────────────
namedStars.forEach((star) => {
  // Star sphere
  const sGeo = new THREE.SphereGeometry(star.size, 24, 24);
  const sMat = new THREE.MeshBasicMaterial({ color: star.color });
  const sMesh = new THREE.Mesh(sGeo, sMat);
  sMesh.position.copy(star.position);
  sMesh.userData = { type: 'star', ...star };
  scene.add(sMesh);

  // Star glow halos
  [[2.5, 0.12], [5, 0.04], [10, 0.015]].forEach(([scale, op]) => {
    const g = new THREE.Mesh(
      new THREE.SphereGeometry(star.size * scale, 16, 16),
      new THREE.MeshBasicMaterial({ color: star.color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false })
    );
    sMesh.add(g);
  });

  allClickableMeshes.push({ mesh: sMesh, info: { type: 'star', data: star } });

  // Floating label sprite
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 80;
  const ctx = canvas.getContext('2d')!;
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillStyle = `rgba(${((star.color >> 16) & 255)}, ${((star.color >> 8) & 255)}, ${(star.color & 255)}, 0.9)`;
  ctx.textAlign = 'center';
  ctx.fillText(star.name, 256, 52);
  const spriteMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.copy(star.position);
  sprite.position.y += star.size * 3.5;
  sprite.scale.set(80, 20, 1);
  scene.add(sprite);
});

// ─── ASTEROID BELT ────────────────────────────────────────────────────────────
{
  const asteroidPositions: number[] = [];
  const asteroidColors: number[] = [];
  const beltInner = 100, beltOuter = 125;
  for (let i = 0; i < 4000; i++) {
    const r = beltInner + Math.random() * (beltOuter - beltInner);
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 4;
    asteroidPositions.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    const c = new THREE.Color().setHSL(0.07 + Math.random() * 0.05, 0.3, 0.35 + Math.random() * 0.25);
    asteroidColors.push(c.r, c.g, c.b);
  }
  const aGeo = new THREE.BufferGeometry();
  aGeo.setAttribute('position', new THREE.Float32BufferAttribute(asteroidPositions, 3));
  aGeo.setAttribute('color', new THREE.Float32BufferAttribute(asteroidColors, 3));
  scene.add(new THREE.Points(aGeo, new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true })));
}

// ─── KUIPER BELT ──────────────────────────────────────────────────────────────
{
  const kPositions: number[] = [];
  const kColors: number[] = [];
  for (let i = 0; i < 3000; i++) {
    const r = 265 + Math.random() * 60;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 12;
    kPositions.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.4, 0.35 + Math.random() * 0.2);
    kColors.push(c.r, c.g, c.b);
  }
  const kGeo = new THREE.BufferGeometry();
  kGeo.setAttribute('position', new THREE.Float32BufferAttribute(kPositions, 3));
  kGeo.setAttribute('color', new THREE.Float32BufferAttribute(kColors, 3));
  scene.add(new THREE.Points(kGeo, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.5, sizeAttenuation: true })));
}

// ─── MILKY WAY STARFIELD ─────────────────────────────────────────────────────
{
  const positions: number[] = [];
  const colors: number[] = [];
  const palette = [0xffffff, 0xfff8e7, 0xe8f0ff, 0xffd8a0, 0xccddff, 0xffccaa, 0xaaddff];
  for (let i = 0; i < 15000; i++) {
    const r = 600 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    // Flatten slightly for Milky Way disk shape
    const diskFactor = Math.random() < 0.6 ? 0.15 : 1;
    const phi = Math.acos(2 * Math.random() - 1);
    const y = r * Math.cos(phi) * diskFactor;
    positions.push(r * Math.sin(phi) * Math.cos(theta), y, r * Math.sin(phi) * Math.sin(theta));
    const c = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
    colors.push(c.r, c.g, c.b);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  sGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 1.4, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true })));
}

// ─── NEBULA CLOUDS ────────────────────────────────────────────────────────────
{
  const nebulaClouds = [
    { pos: new THREE.Vector3(400, 80, -700), color: 0x440066, size: 160 },
    { pos: new THREE.Vector3(-600, -100, 500), color: 0x002244, size: 200 },
    { pos: new THREE.Vector3(200, 200, 800), color: 0x1a0033, size: 140 },
    { pos: new THREE.Vector3(-800, 50, -300), color: 0x003322, size: 180 },
  ];
  nebulaClouds.forEach(({ pos, color, size }) => {
    const nGeo = new THREE.SphereGeometry(size, 12, 12);
    const nMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false });
    const nMesh = new THREE.Mesh(nGeo, nMat);
    nMesh.position.copy(pos);
    scene.add(nMesh);
  });
}

// ─── RAYCASTER / INTERACTION ──────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let activeTarget: ClickTarget | null = null;
let activeMesh: THREE.Mesh | null = null;
let isAnimating = false;

function getHitInfo(event: MouseEvent): { mesh: THREE.Mesh; info: ClickTarget } | null {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const meshes = allClickableMeshes.map(c => c.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return null;
  const hit = hits[0].object as THREE.Mesh;
  return allClickableMeshes.find(c => c.mesh === hit) || null;
}

window.addEventListener('click', (event) => {
  if (isAnimating) return;
  const result = getHitInfo(event);
  if (result) {
    zoomTo(result.mesh, result.info);
  } else {
    resetCamera();
  }
});

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(allClickableMeshes.map(c => c.mesh), false);
  document.body.style.cursor = hits.length > 0 ? 'pointer' : 'default';
});

// ─── PANEL UPDATE ─────────────────────────────────────────────────────────────
function updatePanel(info: ClickTarget) {
  const panel = document.getElementById('info-panel')!;
  panel.classList.remove('visible');

  setTimeout(() => {
    if (info.type === 'planet') {
      const d = info.data;
      document.getElementById('info-title')!.innerText = d.name;
      document.getElementById('info-type')!.innerText = d.type;
      document.getElementById('info-desc')!.innerText = d.description;
      document.getElementById('info-fact')!.innerText = `⚡ ${d.fact}`;
      document.getElementById('info-moons')!.innerText = d.moonCount.toString();
      document.getElementById('info-dist')!.innerText = d.distanceFromSun;
    } else if (info.type === 'moon') {
      const d = info.data;
      document.getElementById('info-title')!.innerText = d.name;
      document.getElementById('info-type')!.innerText = 'Moon 🌙';
      document.getElementById('info-desc')!.innerText = d.description;
      document.getElementById('info-fact')!.innerText = `⚡ ${d.fact}`;
      document.getElementById('info-moons')!.innerText = '—';
      document.getElementById('info-dist')!.innerText = 'Moon orbit';
    } else {
      const d = info.data;
      document.getElementById('info-title')!.innerText = d.name;
      document.getElementById('info-type')!.innerText = 'Star ✨';
      document.getElementById('info-desc')!.innerText = d.description;
      document.getElementById('info-fact')!.innerText = `⚡ ${d.fact}`;
      document.getElementById('info-moons')!.innerText = '—';
      document.getElementById('info-dist')!.innerText = 'Background star';
    }
    panel.classList.add('visible');
  }, 300);
}

// ─── ZOOM TO ──────────────────────────────────────────────────────────────────
function zoomTo(mesh: THREE.Mesh, info: ClickTarget) {
  isAnimating = true;
  activeTarget = info;
  activeMesh = mesh;

  updatePanel(info);

  const targetPos = new THREE.Vector3();
  mesh.getWorldPosition(targetPos);

  let size = 10;
  if (info.type === 'planet') size = info.data.size;
  else if (info.type === 'moon') size = info.data.size;
  else size = info.data.size;

  const offset = size * 6;
  const camTarget = new THREE.Vector3(targetPos.x + offset * 0.8, targetPos.y + offset * 0.4, targetPos.z + offset);

  gsap.to(camera.position, {
    x: camTarget.x, y: camTarget.y, z: camTarget.z,
    duration: 2,
    ease: 'power3.inOut',
    onUpdate: () => controls.target.lerp(targetPos, 0.12),
    onComplete: () => { controls.target.copy(targetPos); isAnimating = false; }
  });
}

// ─── RESET ────────────────────────────────────────────────────────────────────
function resetCamera() {
  if (!activeMesh && !activeTarget) return;
  isAnimating = true;
  activeMesh = null;
  activeTarget = null;
  document.getElementById('info-panel')?.classList.remove('visible');
  gsap.to(camera.position, {
    x: 0, y: 120, z: 220,
    duration: 2,
    ease: 'power3.inOut',
    onUpdate: () => controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1),
    onComplete: () => { controls.target.set(0, 0, 0); isAnimating = false; }
  });
}

// ─── CLOSE BUTTON ─────────────────────────────────────────────────────────────
document.getElementById('close-info')?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!isAnimating) resetCamera();
});

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function applyMomentumZoom() {
  if (Math.abs(zoomVelocity) < 0.001) { zoomVelocity = 0; return; }

  // Direction: zoom toward the controls target, not just along camera Z
  const direction = new THREE.Vector3();
  direction.subVectors(camera.position, controls.target).normalize();

  const currentDist = camera.position.distanceTo(controls.target);
  // Scale speed proportionally to distance for natural feel
  const scaledStep = zoomVelocity * currentDist * 0.004; // reduced multiplier for slower zoom

  const newDist = THREE.MathUtils.clamp(currentDist + scaledStep, ZOOM_MIN, ZOOM_MAX);
  camera.position.copy(controls.target).addScaledVector(direction, newDist);

  zoomVelocity *= ZOOM_FRICTION; // apply friction each frame
}

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  livePlanets.forEach((p) => {
    p.mesh.rotation.y += 0.003;
    if (p.data.distance > 0 && !activeMesh) {
      p.orbitGroup.rotation.y += p.data.speed;
    }
    // Track locked target
    if (activeMesh === p.mesh && !isAnimating) {
      const wp = new THREE.Vector3();
      p.mesh.getWorldPosition(wp);
      controls.target.copy(wp);
    }
    // Animate moons
    p.moons.forEach((m) => {
      m.pivotGroup.rotation.y += m.speed * 0.016;
      m.mesh.rotation.y += 0.01;
      if (activeMesh === m.mesh && !isAnimating) {
        const wp = new THREE.Vector3();
        m.mesh.getWorldPosition(wp);
        controls.target.copy(wp);
      }
    });
  });

  // Pulse named stars
  namedStars.forEach((star, i) => {
    const starMesh = allClickableMeshes.find(c => c.info.type === 'star' && (c.info.data as any).name === star.name)?.mesh;
    if (starMesh) {
      const mat = starMesh.material as THREE.MeshBasicMaterial;
      const pulse = 0.85 + Math.sin(time * 1.5 + i * 1.2) * 0.15;
      mat.opacity = pulse;
    }
  });

  // Breathe the sun's emissive
  const sunMat = livePlanets[0].mesh.material as THREE.MeshStandardMaterial;
  sunMat.emissiveIntensity = 2.3 + Math.sin(time * 1.8) * 0.35;

  applyMomentumZoom();
  controls.update();
  renderer.render(scene, camera);
}

// ─── INTRO ────────────────────────────────────────────────────────────────────
gsap.timeline()
  .from(camera.position, { y: 700, z: 800, duration: 3.5, ease: 'power4.out', onComplete: animate })
  .from('.header', { opacity: 0, y: -40, duration: 1 }, 0.8)
  .from('.controls-panel', { opacity: 0, x: -60, duration: 1 }, 1.2)
  .from('.hint', { opacity: 0, y: 20, duration: 1 }, 1.5);

// ─── RESIZE ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.render(scene, camera);
