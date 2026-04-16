// @ts-nocheck// @ts-nocheck
import { loadPlanetAngles, savePlanetAngles } from "./localstorage.js";

const canvas = document.getElementById("solar-system");
const ctx = canvas.getContext("2d");

// Planeten data uit Astro
const planets = window.planets || [];

// Textures
const textures = {};

// Camera parameters
let cameraX = 0;
let cameraY = 0;
let zoom = 1;

// Wereldcentrum
const worldCenterX = window.innerWidth / 2;
const worldCenterY = window.innerHeight / 2;

// Muispositie
let mouseX = 0;
let mouseY = 0;

// Hovered planeet
let hoveredPlanet = null;

// Zonradius
const sunRadius = 696340; // km

// Data voor scaling
const distances = planets.map((p) => p.distance);
const radii = planets.map((p) => p.radius);

const minDistance = Math.min(...distances);
const maxDistance = Math.max(...distances);

const allRadii = [...radii, sunRadius];
const minRadius = Math.min(...radii);
const maxRadius = Math.max(...allRadii);

// Opgeslagen hoeken laden
const savedAngles = loadPlanetAngles();

// Planeten uitbreiden met beginhoek
const animatedPlanets = planets.map((planet, index) => ({
  ...planet,
  angle: savedAngles[planet.name] ?? (index / planets.length) * Math.PI * 2,
}));

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function centerOnSun() {
  cameraX = worldCenterX - window.innerWidth / 2;
  cameraY = worldCenterY - window.innerHeight / 2;
}

// Logaritmische afstandsschaal
function scaleDistance(distance) {
  const minOrbit = 120;
  const maxOrbit = 2200;

  const t =
    (Math.log(distance) - Math.log(minDistance)) /
    (Math.log(maxDistance) - Math.log(minDistance));

  return minOrbit + t * (maxOrbit - minOrbit);
}

// Wortelschaal voor groottes
function scaleRadius(radius) {
  const minPlanetPx = 3;
  const maxPlanetPx = 30;

  const t =
    (Math.sqrt(radius) - Math.sqrt(minRadius)) /
    (Math.sqrt(maxRadius) - Math.sqrt(minRadius));

  return minPlanetPx + t * (maxPlanetPx - minPlanetPx);
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function loadTextures(planetsToLoad) {
  planetsToLoad.forEach((planet) => {
    if (!planet.texture) return;

    const img = new Image();
    img.src = planet.texture;

    img.onload = () => {
      draw();
    };

    textures[planet.name] = img;
  });
}

function drawPlanetTexture(img, x, y, radius) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);

  ctx.restore();
}

function addPlanetShading(x, y, radius) {
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.2,
    x,
    y,
    radius
  );

  gradient.addColorStop(0, "rgba(255,255,255,0.2)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.4)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function updatePlanets() {
  animatedPlanets.forEach((planet) => {
    const speed = 1 / planet.orbitTime;
    planet.angle += speed * 0.1;
  });
}

function draw() {
  const dpr = window.devicePixelRatio || 1;

  // Reset en achtergrond tekenen
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  // Wereldtransformatie
  ctx.setTransform(
    dpr * zoom,
    0,
    0,
    dpr * zoom,
    -cameraX * dpr * zoom,
    -cameraY * dpr * zoom
  );

  // Zon tekenen
  const sunRadiusScaled = Math.min(scaleRadius(sunRadius), 70);

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(worldCenterX, worldCenterY, sunRadiusScaled, 0, Math.PI * 2);
  ctx.fill();

  // Muispositie omzetten naar wereldpositie
  const worldMouseX = cameraX + mouseX / zoom;
  const worldMouseY = cameraY + mouseY / zoom;

  hoveredPlanet = null;

  animatedPlanets.forEach((planet) => {
    const orbitRadius = scaleDistance(planet.distance);
    const planetRadius = scaleRadius(planet.radius);

    // Orbit tekenen
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.arc(worldCenterX, worldCenterY, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Planeetpositie
    const planetWorldX = worldCenterX + Math.cos(planet.angle) * orbitRadius;
    const planetWorldY = worldCenterY + Math.sin(planet.angle) * orbitRadius;

    // Hover detectie
    const dx = worldMouseX - planetWorldX;
    const dy = worldMouseY - planetWorldY;
    const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
    const isHovered = distanceToMouse < planetRadius;

    if (isHovered) {
      hoveredPlanet = planet;
    }

    // Texture of fallback cirkel tekenen
    const img = textures[planet.name];

    if (img && img.complete) {
      drawPlanetTexture(img, planetWorldX, planetWorldY, planetRadius);
      addPlanetShading(planetWorldX, planetWorldY, planetRadius);
    } else {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(planetWorldX, planetWorldY, planetRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Alleen naam tonen bij hover
    if (isHovered) {
      ctx.fillStyle = "white";
      ctx.font = `${16 / zoom}px Arial`;
      ctx.fillText(
        planet.name,
        planetWorldX + 10 / zoom,
        planetWorldY + 4 / zoom
      );
    }
  });

  canvas.style.cursor = hoveredPlanet ? "pointer" : "default";

  // Reset transform na tekenen
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Muispositie bijhouden
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
});

// Simpele klik: gebruik huidige hoveredPlaneet
canvas.addEventListener("click", () => {
  if (hoveredPlanet) {
    window.location.href = `/planet/${hoveredPlanet.slug}`;
  }
});

// Camera bewegen met pijltjestoetsen
document.addEventListener("keydown", (event) => {
  const speed = 60 / zoom;

  if (event.key === "ArrowRight") cameraX += speed;
  if (event.key === "ArrowLeft") cameraX -= speed;
  if (event.key === "ArrowDown") cameraY += speed;
  if (event.key === "ArrowUp") cameraY -= speed;
});

// Zoomen op muispositie
canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = event.clientX - rect.left;
    const mouseCanvasY = event.clientY - rect.top;

    const worldXBeforeZoom = cameraX + mouseCanvasX / zoom;
    const worldYBeforeZoom = cameraY + mouseCanvasY / zoom;

    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    const newZoom = Math.max(0.2, Math.min(zoom * zoomFactor, 5));

    zoom = newZoom;

    cameraX = worldXBeforeZoom - mouseCanvasX / zoom;
    cameraY = worldYBeforeZoom - mouseCanvasY / zoom;
  },
  { passive: false }
);

// Hoeken opslaan bij verlaten
window.addEventListener("beforeunload", () => {
  savePlanetAngles(animatedPlanets);
});

// Periodiek opslaan
setInterval(() => {
  savePlanetAngles(animatedPlanets);
}, 5000);

// Resize
window.addEventListener("resize", () => {
  resizeCanvas();
  centerOnSun();
  draw();
});

function animate() {
  updatePlanets();
  draw();
  requestAnimationFrame(animate);
}

// Initialisatie
loadTextures(animatedPlanets);
resizeCanvas();
centerOnSun();
animate();