import { loadPlanetAngles, savePlanetAngles } from "./localstorage.js";

// BRON: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
// Canvas element ophalen uit index.astro
const canvas = document.getElementById("solar-system");
// 2D context maken
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

// BRON: ChatGPT die uitleg gaf over camera en wereldcoördinaten
// Camera parameters
// Geen gigantisch canvas, maar camera om te bewegen
let cameraX = 0;
let cameraY = 0;
let zoom = 1;

// De waarde die wordt aangepast met de speed slider
let timeScale = 0.1;

// BRON: https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
// https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight
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

// Zonradius, staat niet in planet array, dus losse vaste waarde
const sunRadius = 696340; // km

// Afstanden voor radius uit API halen
// Maak array voor afstanden en raduis van planeten
const distances = planets.map((p) => p.distance);
const radii = planets.map((p) => p.radius);

// BRON: Idee van ChatGPT om min/max waarden te berekenen voor schaal functies
// Deze arrays gebruik ik om min/max waarden te berekenen voor scaling
const minDistance = Math.min(...distances);
const maxDistance = Math.max(...distances);

// Zon is veel groter dan planeten, dus moet mee in maxRadius
// Hierdoor werkt de schaal ook op de zon
// BRON: Idee + uitwerking van ChatGPT
const allRadii = [...radii, sunRadius];
const minRadius = Math.min(...allRadii);
const maxRadius = Math.max(...allRadii);

// Eerder opgeslagen planeethoeken uit localStorage laden
// Hierdoor blijven posities na refresh op dezelfde plek
const savedAngles = loadPlanetAngles();

// Rotatiehoek van de zontexture
let sunAngle = 0;

// BRON: Hulp van ChatGPT
// Nieuwe array op basis van planeten
// Elke planeet kijgt extra properties die voor animatie nodig zijn
const animatedPlanets = planets.map((planet, index) => ({
  // Spread operator, kopieert alle properties van de originele planeet in het nieuwe object
  ...planet,
  // Angle bepaalt waar op de baan de planeet staat
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
  // Canvas heeft een CSS grootte en een pixelgrootte
  // Door devicePixelRatio te gebruiken blijft het canvas scherp op retina schermen
  // BRON: https://gist.github.com/callumlocke/cc258a193839691f60dd

  // Kijkt hoeveel fysieke pixels er zijn per CSS pixel, op standaard scherm is dat 1, op retina scherm 2 of meer
  const ratio = window.devicePixelRatio || 1;

  // Canvas pixelgrootte aanpassen aan schermgrootte en ratio
  // eigenlijk interne pixelresolutie van het canvas
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  // Zetten de visuele grootte van het canvas via CSS, zodat het nog steeds de hele schermgrootte beslaat
  // Visuele grootte op het scherm
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

// Camera wordt zo geplaatst dat de zon in het midden van het scherm komt
// Soort reset functie, handig bij resize of als er iets misgaat met de camera
function centerOnSun() {
  cameraX = 0;
  cameraY = 0;
}

// Logaritmische afstandsschaal
function scaleDistance(distance) {
  const minOrbit = 120;
  const maxOrbit = 2200;

  // BRON: Schaal uitwerking van ChatGPT
  // De echte afstanden tussen planeten zijn groot, dus linear schalen zorgt dat binnenste planeten op elkaar zitten
  // Dus ik gebruik een logaritmische schaal:
  // Grote verschillen blijven zichtbaar, maar blijft bruikbaar op een scherm
  const t =
    // maakt grote getalen relatief kleiner en kleine getalen relatief groter, hierdoor zijn binnenste planeten beter zichtbaar
    // en buitenste planeten passen nog steeds op het scherm
    (Math.log(distance) - Math.log(minDistance)) /
    (Math.log(maxDistance) - Math.log(minDistance));

  // Schaal naar schermgrootte met min/max orbit radius, hierdoor blijven banen mooi verdeeld ondanks logaritmische schaal (Linear interpolation)
  return minOrbit + t * (maxOrbit - minOrbit);
}

function scaleRadius(radius) {
  const minPlanetPx = 3;
  const maxPlanetPx = 40;

  // Schaal idee / uitwerking van ChatGPT
  // planeetgroottes verschillen ook veel, bij lineare schaal is Mercury bijna onzichtbaar of Jupiter te groot
  // Wortelschaal geeft betere visuele balans
  const t =
    (Math.sqrt(radius) - Math.sqrt(minRadius)) /
    (Math.sqrt(maxRadius) - Math.sqrt(minRadius));

  // Schaal naar schermgrootte
  return minPlanetPx + t * (maxPlanetPx - minPlanetPx);
}

// BRON: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
// Achtergrond tekenen
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

// Zorgt dat afbeeldingen beschikbaar worden in het geheugen en niet elke keer opnieuw geladen hoeven te worden tijdens het animeren
function loadTextures(planetsToLoad) {
  planetsToLoad.forEach((planet) => {
    if (!planet.texture) return;

    // Maakt image object aan en zet source naar de texture URL van de planeet
    const img = new Image();
    img.src = planet.texture;

    // Zodra afbeelding geladen is, opnieuw tekenen
    // Anders kan het dat alleen fallback cirkels zichtbaar zijn
    img.onload = () => {
      draw();
    };

    // Textures opslaan in object, zodat ze later gebruikt kunnen worden bij het tekenen van planeten
    textures[planet.name] = img;
  });
}

// BRON: Hulp van ChatGPT bij het tekenen van een planeet met texture en rotatie
// Gebruikt geladen texture, positie, radius en rotatiehoek om de planeet te tekenen
function drawPlanetTexture(img, x, y, radius, rotation = 0) {
  // canvas onthoudt de huidige staat
  ctx.save();

  // Verplaats tekenpunt naar midden van de planeet, want planeet draait om zijn eigen as
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Texture is rechthoekig en een planeet is natuurlijk rond
  // maakt een cirkelvormig pad en clip daarnaar, zodat alleen het ronde deel van de texture zichtbaar is
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();

  // Tekent de texture, gecentreerd op het nieuwe tekenpunt (dat nu in het midden van de planeet zit)
  ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);

  // Restore() zet de canvas state terug, zodat volgende objecten niet ook gedraaid of geclipt worden
  ctx.restore();
}

function addPlanetShading(x, y, radius) {
  // Een texture lijkt plat, dus ik voeg een lichte kant en donkere rand toe voor 3D effect
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
    // De waarde van de slider is een string, dus omzetten naar number
    timeScale = Number(event.target.value);
  });
}

function updatePlanets() {
  animatedPlanets.forEach((planet) => {
    // Snelheid van de baan is gebaseerd op OrbitTime
    // Dus kleinere orbitTime is sneller draaien
    const orbitSpeed = 0.1 / planet.orbitTime;
    // Verhoog de hoek van de planeet op basis van de snelheid en timeScale, hierdoor bewegen planeten op hun baan
    planet.angle += orbitSpeed * timeScale;

    // BRON: hulp van ChatGPT bij direction uitwerken
    // Rotatie om eigen as
    // sideralRotation kan ook negatief zijn, dat is dan een retrograde rotatie
    if (planet.sideralRotation) {
      // Math.abs zorgt dat ik altijd een positieve waarde krijg voor de snelheid, direction bepaalt of het positief of negatief is
      const rotationSpeed = 1 / Math.abs(planet.sideralRotation);
      // direction is -1 voor retrograde rotatie, 1 voor normale rotatie
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
  // Device pixel ratio, belangrijk voor scherpte op verschillende schermen, vooral retina
  const dpr = window.devicePixelRatio || 1;

  // Bron: ChatGPT
  // Eerst resetten, reset alle eerdere transforms, anders stapelen ze op en worden dingen steeds groter/kleiner of verder weg
  // Dus geen camera, geen zoom, alleen de basis schaal voor scherpte
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Canvas leegmaken voor nieuwe frame, anders blijven oude frames zichtbaar
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawBackground();

  // Zet camera en zoom aan
  ctx.setTransform(
    // Hoe groot alles wordt
    dpr * zoom,
    0,
    0,
    dpr * zoom,
    // Camera positie, negatief omdat we de wereld bewegen, niet de camera
    // Dit is hoe bijna alle 2D canvas werken
    -cameraX * dpr * zoom,
    -cameraY * dpr * zoom,
  );

  // Zon tekenen
  // Zon is veel groter dan planeten, dus ik schaal hem ook met een aparte max waarde, anders zou hij bijna het hele scherm vullen
  const sunRadiusScaled = Math.min(scaleRadius(sunRadius), 70);

  // Zon wordt geclipt naar circkel en langzaam geroteerd met sunAngle
  
  // onthoudt huidige canvas staat
  ctx.save();
  ctx.beginPath();
  // Maak een cirkel
  ctx.arc(worldCenterX, worldCenterY, sunRadiusScaled, 0, Math.PI * 2);
  ctx.clip();

  // Verplaats tekenpunt naar midden van de zon, want zon draait om zijn eigen as
  ctx.translate(worldCenterX, worldCenterY);
  // Rotate de zon voor animatie
  ctx.rotate(sunAngle);

  // Tekent de zon texture gecentreerd op het nieuwe tekenpunt (midden van de zon)
  ctx.drawImage(
    sunTexture,
    // Negatieve radius omdat de texture gecentreerd getekend wordt
    -sunRadiusScaled,
    -sunRadiusScaled,
    // Diameter van de zon op het scherm
    sunRadiusScaled * 2,
    sunRadiusScaled * 2,
  );
  // Restore canvas staat, zodat volgende tekeningen niet ook geroteerd of geclipt worden
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
  // camera verschuift de wereld, dus camera-offset erbij optellen, en zoom schaalt de wereld, dus muispositie delen door zoom
  const worldMouseX = cameraX + mouseX / zoom;
  const worldMouseY = cameraY + mouseY / zoom;

  // null want er is geen planeet gehovered bij start, en dat is ook de waarde als er geen planeet gehovered wordt
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
    // Planeetpositie bepalen met sinus en cosinus, standaard manier om cirkels te tekenen
    // Angle bepaalt waar op de cirkel de planeet staat
    const planetWorldX = worldCenterX + Math.cos(planet.angle) * orbitRadius;
    const planetWorldY = worldCenterY + Math.sin(planet.angle) * orbitRadius;

    // Aarde onthouden voor maan
    if (planet.name === "Earth") {
      earthX = planetWorldX;
      earthY = planetWorldY;
      earthRadius = planetRadius;
    }

    // BRON: Hulp van ChatGPT bij hover detectie
    // Hover detectie
  
    // Bereken afstand tussen muis en planeet
    const dx = worldMouseX - planetWorldX;
    const dy = worldMouseY - planetWorldY;

    // Hulp van ChatGPT: Pythagoras gebruiken om afstand te berekenen, als de afstand kleiner is dan de straal van de planeet, 
    // dan is de muis eroverheen
    const distanceToMouse = Math.sqrt(dx * dx + dy * dy); // (√(x² + y²))
    const isHovered = distanceToMouse < planetRadius;

    // Als gehovered, sla deze planeet op in hoveredPlanet, zodat ik die kan gebruiken bij click
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
  // BRON: Hulp van ChatGPT bij tekenen van objecten rond een andere bewegende object, in dit geval manen rond aarde
  // Is positie van de aarde bekend? 
  if (earthX !== null && earthY !== null) {
    // Loop door alle manen heen, positie van maan wordt bepaald door positie van aarde + eigen baan
    animatedMoons.forEach((moon, index) => {
      // bepaalt baan en grootte van maan, schaal kleiner
      const moonOrbitRadius = earthRadius + 25 + index * 12;
      // Maangrootte ook geschaald 
      const moonRadius = Math.max(2, scaleRadius(moon.radius) * 0.3);

      // baan van de maan
      ctx.strokeStyle = "rgba(200,200,200,0.15)";
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(earthX, earthY, moonOrbitRadius, 0, Math.PI * 2);
      ctx.stroke();

      // positie van de maan, gebaseerd op positie van aarde + eigen baan
      const moonX = earthX + Math.cos(moon.angle) * moonOrbitRadius;
      const moonY = earthY + Math.sin(moon.angle) * moonOrbitRadius;

      // hover label voor maan
      const dx = worldMouseX - moonX;
      const dy = worldMouseY - moonY;
      // Pythagoras om afstand te berekenen, zelfde als bij planeten
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

  // Cursor veranderen als er een planeet gehovered wordt, zodat het duidelijk is dat je kunt klikken
  canvas.style.cursor = hoveredPlanet ? "pointer" : "default";

  // Transform resetten na het tekenen van de wereld
  // Dit is belangrijk, anders worden UI elementen zoals hover labels ook beïnvloed door de camera en zoom, en dat zou niet goed werken
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

// BRON: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
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
  // BRON: https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
  // Hulp van ChatGPT bij zoomen op muispositie, dit is een veelgebruikte techniek in kaartapplicaties en andere canvas animaties
  "wheel",
  (event) => {
    // Voorkomt dat de pagina zelf ook scrolt bij het zoomen
    event.preventDefault();

    // canvas positie ophalen
    const rect = canvas.getBoundingClientRect();
    // Muispositie binnen het canvas
    const mouseCanvasX = event.clientX - rect.left;
    const mouseCanvasY = event.clientY - rect.top;

    // Wereld positie onder de muis voor het zoomen
    // gedeeld door zoom omdat schermpixels niet gelijk zijn aan wereldpixels bij zoom
    const worldXBeforeZoom = cameraX + mouseCanvasX / zoom;
    const worldYBeforeZoom = cameraY + mouseCanvasY / zoom;

    // Zoomfactor bepalen, bij scrollen omhoog (deltaY < 0) zoom in, bij scrollen omlaag zoom uit
    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95;
    // Nieuwe zoom berekenen, met min/max waarden om te voorkomen dat je te ver inzoomt of uitzoomt
    const newZoom = Math.max(0.2, Math.min(zoom * zoomFactor, 5));

    zoom = newZoom;

    // Camera aanpassen zodat hetzelfde wereldpunt onder de muis blijft
    cameraX = worldXBeforeZoom - mouseCanvasX / zoom;
    cameraY = worldYBeforeZoom - mouseCanvasY / zoom;
  },
  { passive: false },
);

// Planeet posities opslaan wanneer pagina verlaten wordt
window.addEventListener("beforeunload", () => {
  savePlanetAngles(animatedPlanets);
});

// Ook periodiek opslaan, extra hulpje
// BRON: Idee van ChatGPT, zodat posities ook regelmatig opgeslagen worden tijdens het bekijken, niet alleen bij verlaten pagina + https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations#moving-the-canvas-camera
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
  // BRON: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame + uitleg ChatGPT
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
