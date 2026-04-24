// const user = {
//     id: 1,
//     dark_theme: true,
//     name: "Mats"
// }

// localStorage.setItem("user", JSON.stringify(user));

// JSON.parse(localStorage.getItem("user"));

// @ts-nocheck

// const savedData = JSON.parse(localStorage.getItem("count")) ?? { counter: 0 };
// console.log(savedData);

// let value = savedData.counter;
// const counter = document.getElementById("counter");
// const button = document.getElementById("add");
// counter.textContent = value;

// button.addEventListener("click", () => {
//     value = value + 1;
//     counter.textContent = value;
//     const data = {
//         counter: value,
//     };
//     console.log(data);

//     // De counter opslaan
//     localStorage.setItem("count", JSON.stringify(data));
// });

// Bronnen:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// En workshop Jad

// Haalt opgeslagen planeetposities op uit browser
export function loadPlanetAngles() {
  return JSON.parse(localStorage.getItem("planetAngles") || "{}"); // Fallback voor als er nog niks opgeslagen is
}

// BRON: workshop Jad
// Slaat huidige hoeken op van alle planeten in localStorage
export function savePlanetAngles(planets) {
  // leeg object maken
  const anglesToSave = {};

  // loop door alle planeten heen en maak object
  planets.forEach((planet) => {
    // opslaan per planeet
    anglesToSave[planet.name] = planet.angle;
  });

  // Zet object om naar string, want localStorage slaat alleen strings op 
  localStorage.setItem("planetAngles", JSON.stringify(anglesToSave));
}
