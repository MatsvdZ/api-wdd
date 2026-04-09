// @ts-nocheck
import { loadPlanetAngles, savePlanetAngles } from "./localstorage.js";

const canvas = document.getElementById("solar-system");
const ctx = canvas.getContext("2d");

// Planeten data, van de server-side variabele die ik in index.astro heb gezet
const planets = window.planets || [];

// Camera parameters
// Bron: camera movement via https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations#moving-the-canvas-camera
let cameraX = 0;
let cameraY = 0;
let zoom = 1;

const worldCenterX = window.innerWidth / 2;
const worldCenterY = window.innerHeight / 2;

const distances = planets.map((p) => p.distance);
const radii = planets.map((p) => p.radius);
// Voor nu even een vaste waarde voor de zon voor een referentie. In de toekomst deze ook uit de API halen.
const sunRadius = 696340; // km

// Bron: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
const minDistance = Math.min(...distances);
const maxDistance = Math.max(...distances);
const allRadii = [...radii, sunRadius];
const minRadius = Math.min(...radii);
const maxRadius = Math.max(...allRadii);

// Opgeslagen hoeken laden, of default hoeken berekenen op basis van de index
const savedAngles = loadPlanetAngles();

const animatedPlanets = planets.map((planet, index) => ({
  ...planet,
  angle:
    savedAngles[planet.name] ?? (index / planets.length) * Math.PI * 2,
}));

// Canvas op volledige schermgrootte zetten
function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

// Camera centreren op de zon
function centerOnSun() {
  cameraX = worldCenterX - window.innerWidth / 2;
  cameraY = worldCenterY - window.innerHeight / 2;
}

// Logaritmische schaal voor afstanden, zodat Mercurius en Neptunus iets beter zichtbaar zijn
function scaleDistance(distance) {
  const minOrbit = 120;
  const maxOrbit = 2200;

  const t =
    (Math.log(distance) - Math.log(minDistance)) /
    (Math.log(maxDistance) - Math.log(minDistance));

  return minOrbit + t * (maxOrbit - minOrbit);
}

// Logaritmische schaal voor planeten, zodat ook kleine planeten zichtbaar zijn
function scaleRadius(radius) {
  const minPlanetPx = 3;
  const maxPlanetPx = 30;

  const t =
    (Math.sqrt(radius) - Math.sqrt(minRadius)) /
    (Math.sqrt(maxRadius) - Math.sqrt(minRadius));

  return minPlanetPx + t * (maxPlanetPx - minPlanetPx);
}

// Zwarte achtergrond tekenen
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

// Alle planeten tekenen
function draw() {
  const dpr = window.devicePixelRatio || 1;

  // reset
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  // juiste world transform:
  // screen = (world - camera) * zoom
  ctx.setTransform(
    dpr * zoom,
    0,
    0,
    dpr * zoom,
    -cameraX * dpr * zoom,
    -cameraY * dpr * zoom
  );

  // Zon tekenen
 const sunRadiusScaled = scaleRadius(696340);

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(worldCenterX, worldCenterY, sunRadiusScaled, 0, Math.PI * 2);
  ctx.fill();

  animatedPlanets.forEach((planet) => {
  const orbitRadius = scaleDistance(planet.distance);
  const planetRadius = scaleRadius(planet.radius);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1 / zoom;
  ctx.beginPath();
  ctx.arc(worldCenterX, worldCenterY, orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  const planetWorldX = worldCenterX + Math.cos(planet.angle) * orbitRadius;
  const planetWorldY = worldCenterY + Math.sin(planet.angle) * orbitRadius;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(planetWorldX, planetWorldY, planetRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `${16 / zoom}px Arial`;
  ctx.fillText(
    planet.name,
    planetWorldX + 10 / zoom,
    planetWorldY + 4 / zoom
  );
  });

  // Resetten na tekenen, zodat UI elementen niet meebewegen of meezoomen
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Hoeken van planeten updaten op basis van hun baansnelheid
function updatePlanets() {
  animatedPlanets.forEach((planet) => {
    const speed = 1 / planet.orbitTime;
    planet.angle += speed * 0.1;
  });
}

// Pijltjestoetsen voor camera beweging
// Bron: https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
document.addEventListener("keydown", (event) => {
  const speed = 60 / zoom;

  if (event.key === "ArrowRight") cameraX += speed;
  if (event.key === "ArrowLeft") cameraX -= speed;
  if (event.key === "ArrowDown") cameraY += speed;
  if (event.key === "ArrowUp") cameraY -= speed;

  draw();
});

// Muiswiel voor zoomen
// Bron: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // wereldpositie onder de muis vóór het zoomen
    const worldX = cameraX + mouseX / zoom;
    const worldY = cameraY + mouseY / zoom;

    // subtielere zoom
    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    const newZoom = Math.max(0.2, Math.min(zoom * zoomFactor, 5));

    zoom = newZoom;

    // camera zo aanpassen dat hetzelfde wereldpunt onder de muis blijft
    cameraX = worldX - mouseX / zoom;
    cameraY = worldY - mouseY / zoom;

    draw();
  },
  { passive: false }
);

// Voordat de pagina wordt gesloten, de huidige hoeken van de planeten opslaan
window.addEventListener("beforeunload", () => {
  savePlanetAngles(animatedPlanets);
});

// Wanneer het venster wordt aangepast, canvas opnieuw schalen en centreren
window.addEventListener("resize", () => {
  resizeCanvas();
  centerOnSun();
  draw();
});

// Hoeken van planeten updaten, tekenen, en dit continu herhalen
function animate() {
  updatePlanets();
  draw();
  // Bron: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
  requestAnimationFrame(animate);
}

// Initialisatie
resizeCanvas();
centerOnSun();
animate()
draw();