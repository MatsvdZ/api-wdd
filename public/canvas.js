// @ts-nocheck
import { loadPlanetAngles, savePlanetAngles } from "./localstorage.js";

console.log(window.moons);

// Canvas element ophalen uit index.astro
const canvas = document.getElementById("solar-system");
// 2D contect maken
const ctx = canvas.getContext("2d");

// Data komt uit Astro via window.planets en window.moons
// Zet server-side API-data om naar client-side data
const planets = window.planets || [];
const moons = window.moons || [];

// Object waar alle planeettextures worden opgeslagen
// Images hoeven dus niet elk frame opnieuw geladen te worden
const textures = {};

// Zon texture nu apart laden, zon is geen onderdeel van de planets array
const sunTexture = new Image();
sunTexture.src = "/images/planets/sun.png";

// Camera parameters
// Geen gigantisch canvas, maar camera om te bewegen
let cameraX = 0;
let cameraY = 0;
let zoom = 1;

// De waarde die wordt aangepast met de speed slider
let timeScale = 0.1;

// Middelpunt van het canvas, waar de zon is
// Alle banen worden relatief rondom dit punt getekend
const worldCenterX = window.innerWidth / 2;
const worldCenterY = window.innerHeight / 2;

// Muispositie op het scherm
let mouseX = 0;
let mouseY = 0;

// Hier wordt bewaard welke planeet gehovered wordt
// Hierdoor simpel klikken op planeet zonder opnieuw alles te berekenen
let hoveredPlanet = null;

// Zonradius, staat niet in planet array, dus losse waarde
const sunRadius = 696340; // km

// Afstanden voor radii uit API halen
const distances = planets.map((p) => p.distance);
const radii = planets.map((p) => p.radius);

// Deze arrays gebruik ik om min/max waarden te berekenen voor scaling
const minDistance = Math.min(...distances);
const maxDistance = Math.max(...distances);

// Zon is veel groter dan planeten, dus moet mee in maxRadius
// Hierdoor werkt de schaal ook op de zon
const allRadii = [...radii, sunRadius];
const minRadius = Math.min(...radii);
const maxRadius = Math.max(...allRadii);

// Eerder opgeslagen planeethoeken uit localStorage laden
// Hierdoor blijven posities na refresh op dezelfde plek
const savedAngles = loadPlanetAngles();

// Rotatiehoek van de zontexture
let sunAngle = 0;

// Nieuwe array op basis van planeten
// Elke planeet kijgt extra properties die voor animatie nodig zijn
const animatedPlanets = planets.map((planet, index) => ({
  ...planet,
  // Als er een opgeslagen hoek is, gebruik die, anders verdelen over de cirkel op basis van hun index
  angle: savedAngles[planet.name] ?? (index / planets.length) * Math.PI * 2,
  // Hoek voor rotatie om eigen as
  rotationAngle: 0,
}));

// Manen krijgen een eigen hoek
// Math.max voorkomt delen door 0 als er geen manen zijn
const animatedMoons = moons.map((moon, index) => ({
  ...moon,
  angle: (index / Math.max(moons.length, 1)) * Math.PI * 2,
}));

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  // Canvas heeft een CSS grootte en een pixelgrootte
  // Door devicePixelRatio te gebruiken blijft het canvas scherp op retina schermen
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

// Camera wordt zo geplaatst dat de zon in het midden van het scherm komt
function centerOnSun() {
  cameraX = worldCenterX - window.innerWidth / 2;
  cameraY = worldCenterY - window.innerHeight / 2;
}

// Logaritmische afstandsschaal
function scaleDistance(distance) {
  const minOrbit = 120;
  const maxOrbit = 2200;

  // BRON: Schaal idee / uitwerking van ChatGPT
  // De echte afstanden tussen planeten zijn groot, dus linear schalen zorgt dat binnenste planeten op elkaar zitten
  // Dus ik gebruik een logaritmische schaal:
  // Grote verschillen blijven zichtbaar, maar blijft bruikbaar op een scherm
  const t =
    (Math.log(distance) - Math.log(minDistance)) /
    (Math.log(maxDistance) - Math.log(minDistance));

  return minOrbit + t * (maxOrbit - minOrbit);
}

function scaleRadius(radius) {
  const minPlanetPx = 3;
  const maxPlanetPx = 30;

  // Schaal idee / uitwerking van ChatGPT
  // planeetgroottes verschillen ook veel, bij lineare schaal is Mercury bijna onzichtbaar of Jupiter te groot
  // Wortelschaal geeft betere visuele balans
  const t =
    (Math.sqrt(radius) - Math.sqrt(minRadius)) /
    (Math.sqrt(maxRadius) - Math.sqrt(minRadius));

  return minPlanetPx + t * (maxPlanetPx - minPlanetPx);
}

// Achtergrond tekenen
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function loadTextures(planetsToLoad) {
  planetsToLoad.forEach((planet) => {
    if (!planet.texture) return;

    const img = new Image();
    img.src = planet.texture;

    // Zodra afbeelding geladen is, opnieuw tekenen
    // Anders kan het dat alleen fallback cirkels zichtbaar zijn
    img.onload = () => {
      draw();
    };

    textures[planet.name] = img;
  });
}

function drawPlanetTexture(img, x, y, radius, rotation = 0) {
  ctx.save();

  // Verplaats tekenpunt naar midden van de planeet
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Texture is rechthoekig en een planeet is natuurlijk rond
  // met Clip() teken ik dus toch een cirkel
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);

  // Restore() zet de canvas state terug, zodat volgende objecten niet ook gedraaid of geclipt worden
  ctx.restore();
}

function addPlanetShading(x, y, radius) {
  // Een texture kan plat lijken, dus ik voeg een lichte kant en donkere rand toe (met gradient) voor een meer 3D effect
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

// Slider ophalen uit Controls.astro
// Slider verandert de timeScale, om draai animatie sneller/langzamer te laten gaan
const slider = document.getElementById("speed-slider");

if (slider) {
  slider.addEventListener("input", (event) => {
    timeScale = Number(event.target.value);
  });
}

function updatePlanets() {
  animatedPlanets.forEach((planet) => {
    // Snelheid van de baan is gebaseerd op OrbitTime
    // Dus kleinere orbitTime is sneller draaien
    const orbitSpeed = 0.1 / planet.orbitTime;
    planet.angle += orbitSpeed * timeScale;

    // Rotatie om eigen as
    // sideralRotation kan ook negatief zijn, dat is dan een retrograde rotatie
    if (planet.sideralRotation) {
      const rotationSpeed = 1 / Math.abs(planet.sideralRotation);
      const direction = planet.sideralRotation < 0 ? -1 : 1;

      planet.rotationAngle += rotationSpeed * direction * timeScale * 0.5;
    }
  });

  // Ook hier orbitTime om manen hun baansnelheid te bepalen
  animatedMoons.forEach((moon) => {
    const speed = 0.2 / moon.orbitTime;
    moon.angle += speed * timeScale;
  });
}

function draw() {
  const dpr = window.devicePixelRatio || 1;

  // Bron: ChatGPT
  // Eerst resetten naar schermcoördinaten
  // Belangrijk, omdat canvas transforms anders blijven opstapelen
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  // Omzetten naar wereldcoördinaten
  // Formule: screen = (world - camera) * zoom
  // Hierdoor kan ik pannen en zoomen
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

  // Zontexture tekenen
  // Zon wordt geclipt naar circkel en langzaam geroteerd met sunAngle
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

  // Glow rond de zon
  // Dit wordt na de texture getekend
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

  // Muispositie omzetten naar wereldcoördinaten
  // Dit moet omdat planeten in de wereld getekend worden
  // Muispositie komt uit het scherm
  const worldMouseX = cameraX + mouseX / zoom;
  const worldMouseY = cameraY + mouseY / zoom;

  hoveredPlanet = null;

  // Earth-positie bewaren zodat maan rond aarde getekend kan worden
  // Teken maan na planeten, want positie van earth moet eerst bekend zijn
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

    // BRON: Berekend met ChatGPT
    // Planeetpositie bepalen met sinus en cosinus
    // Angle bepaalt waar op de cirkel de planeet staat
    const planetWorldX = worldCenterX + Math.cos(planet.angle) * orbitRadius;
    const planetWorldY = worldCenterY + Math.sin(planet.angle) * orbitRadius;

    // Aarde onthouden voor maan
    if (planet.name === "Earth") {
      earthX = planetWorldX;
      earthY = planetWorldY;
      earthRadius = planetRadius;
    }

    // Hover detectie
    // Afstand tussen muis en planeet middelpunt berekenen
    // Als die kleiner is dan de radius, staat muis op de planeet
    const dx = worldMouseX - planetWorldX;
    const dy = worldMouseY - planetWorldY;
    const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
    const isHovered = distanceToMouse < planetRadius;

    if (isHovered) {
      hoveredPlanet = planet;
    }

    // Planeet tekenen met texture wanneer deze geladen is
    // Als afbeelding nog niet klaar is, tijdelijk witte cirkel tekenen
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

  // maan tekenen rond aarde
  // Buiten de planeet loop omdat earth positie eerst bekend moet zijn
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

      // hover label voor maan
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

  // Transform resetten na het tekenen van de wereld
  // 
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Muispositie bijhouden voor hover detectie
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
// Snelheid wordt gedeeld door zoom zodat bewegen natuurlijk aanvoelt
document.addEventListener("keydown", (event) => {
  const speed = 60 / zoom;

  if (event.key === "ArrowRight") cameraX += speed;
  if (event.key === "ArrowLeft") cameraX -= speed;
  if (event.key === "ArrowDown") cameraY += speed;
  if (event.key === "ArrowUp") cameraY -= speed;
});

// Zoomen op muispositie
// Zoomt dus in op de plek waar je muis zit
canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = event.clientX - rect.left;
    const mouseCanvasY = event.clientY - rect.top;

    // Wereld positie onder de muis voor het zoomen
    const worldXBeforeZoom = cameraX + mouseCanvasX / zoom;
    const worldYBeforeZoom = cameraY + mouseCanvasY / zoom;

    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    const newZoom = Math.max(0.2, Math.min(zoom * zoomFactor, 5));

    zoom = newZoom;

    // Camera aanpassen zodat hetzelfde wereldpunt onder de muis blijft
    cameraX = worldXBeforeZoom - mouseCanvasX / zoom;
    cameraY = worldYBeforeZoom - mouseCanvasY / zoom;
  },
  { passive: false },
);

// Planeet posities opslaan wanneer je de pagina verlaat
window.addEventListener("beforeunload", () => {
  savePlanetAngles(animatedPlanets);
});

// Ook periodiek opslaan, extra hulpje
setInterval(() => {
  savePlanetAngles(animatedPlanets);
}, 5000);

// Bij resize wordt canvas resolutie opnieuw gezet
// Daarna centreren op de zon
window.addEventListener("resize", () => {
  resizeCanvas();
  centerOnSun();
  draw();
});

function animate() {
  updatePlanets();
  
  // Zon langzaam laten roteren
  sunAngle += 0.0002;

  draw();

  // RequestAnimationFrame maakt vloeiende animatielus
  // Loopt synchroon met refresh rate van het scherm
  requestAnimationFrame(animate);
}

// Initialisatie
// textures laden
loadTextures(animatedPlanets);

// canvas goed schalen
resizeCanvas();

// Camera centreren op zon
centerOnSun();

// animatieloop starten
animate();
