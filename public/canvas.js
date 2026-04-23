// @ts-nocheck
import { loadPlanetAngles, savePlanetAngles } from "./localstorage.js";

console.log(window.moons);

const canvas = document.getElementById("solar-system");
const ctx = canvas.getContext("2d");

// Planeten en manen data uit Astro
const planets = window.planets || [];
const moons = window.moons || [];

// Textures
const textures = {};
const sunTexture = new Image();
sunTexture.src = "/images/planets/sun.png";

// Camera parameters
let cameraX = 0;
let cameraY = 0;
let zoom = 1;

let timeScale = 0.1;

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

let sunAngle = 0;

// Planeten uitbreiden met beginhoek + eigen rotatiehoek
const animatedPlanets = planets.map((planet, index) => ({
  ...planet,
  angle: savedAngles[planet.name] ?? (index / planets.length) * Math.PI * 2,
  rotationAngle: 0,
}));

// Manen een angle geven
const animatedMoons = moons.map((moon, index) => ({
  ...moon,
  angle: (index / Math.max(moons.length, 1)) * Math.PI * 2,
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

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

function drawPlanetTexture(img, x, y, radius, rotation = 0) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);

  ctx.restore();
}

function addPlanetShading(x, y, radius) {
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.2,
    x,
    y,
    radius,
  );

  gradient.addColorStop(0, "rgba(255,255,255,0.2)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.4)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

const slider = document.getElementById("speed-slider");

if (slider) {
  slider.addEventListener("input", (event) => {
    timeScale = Number(event.target.value);
  });
}

function updatePlanets() {
  animatedPlanets.forEach((planet) => {
    // Orbit rond de zon
    const orbitSpeed = 0.1 / planet.orbitTime;
    planet.angle += orbitSpeed * timeScale;

    // Rotatie om eigen as
    if (planet.sideralRotation) {
      const rotationSpeed = 1 / Math.abs(planet.sideralRotation);
      const direction = planet.sideralRotation < 0 ? -1 : 1;

      planet.rotationAngle += rotationSpeed * direction * timeScale * 0.5;
    }
  });

  animatedMoons.forEach((moon) => {
    const speed = 0.2 / moon.orbitTime;
    moon.angle += speed * timeScale;
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
    -cameraY * dpr * zoom,
  );

  // Zon tekenen
  const sunRadiusScaled = Math.min(scaleRadius(sunRadius), 70);

  ctx.save();
  ctx.beginPath();
  ctx.arc(worldCenterX, worldCenterY, sunRadiusScaled, 0, Math.PI * 2);
  ctx.clip();

  ctx.translate(worldCenterX, worldCenterY);
  ctx.rotate(sunAngle);

  ctx.beginPath();
  ctx.arc(0, 0, sunRadiusScaled, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    sunTexture,
    -sunRadiusScaled,
    -sunRadiusScaled,
    sunRadiusScaled * 2,
    sunRadiusScaled * 2,
  );
  ctx.restore();

  const glow = ctx.createRadialGradient(
    worldCenterX,
    worldCenterY,
    0,
    worldCenterX,
    worldCenterY,
    sunRadiusScaled * 2,
  );

  glow.addColorStop(0, "rgba(255,200,0,0.6)");
  glow.addColorStop(1, "rgba(255,200,0,0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(worldCenterX, worldCenterY, sunRadiusScaled * 2, 0, Math.PI * 2);
  ctx.fill();

  // Muispositie omzetten naar wereldpositie
  const worldMouseX = cameraX + mouseX / zoom;
  const worldMouseY = cameraY + mouseY / zoom;

  hoveredPlanet = null;

  let earthX = null;
  let earthY = null;
  let earthRadius = null;

  // Eerst alle planeten tekenen
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

    // Aarde onthouden voor maan
    if (planet.name === "Earth") {
      earthX = planetWorldX;
      earthY = planetWorldY;
      earthRadius = planetRadius;
    }

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
      drawPlanetTexture(
        img,
        planetWorldX,
        planetWorldY,
        planetRadius,
        planet.rotationAngle,
      );
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
        planetWorldY + 4 / zoom,
      );
    }
  });

  // maan tekenen
  if (earthX !== null && earthY !== null) {
    animatedMoons.forEach((moon, index) => {
      const moonOrbitRadius = earthRadius + 25 + index * 12;
      const moonRadius = Math.max(2, scaleRadius(moon.radius) * 0.3);

      // baan van de maan
      ctx.strokeStyle = "rgba(200,200,200,0.15)";
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(earthX, earthY, moonOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      const moonX = earthX + Math.cos(moon.angle) * moonOrbitRadius;
      const moonY = earthY + Math.sin(moon.angle) * moonOrbitRadius;

      const dx = worldMouseX - moonX;
      const dy = worldMouseY - moonY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < moonRadius) {
        ctx.fillStyle = "white";
        ctx.font = `${14 / zoom}px Arial`;
        ctx.fillText(moon.name, moonX + 8 / zoom, moonY + 4 / zoom);
      }

      ctx.fillStyle = "#cfcfcf";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

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
  { passive: false },
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
  sunAngle += 0.0002;
  draw();
  requestAnimationFrame(animate);
}

// Initialisatie
loadTextures(animatedPlanets);
resizeCanvas();
centerOnSun();
animate();
