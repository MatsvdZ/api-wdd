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
export function loadPlanetAngles() {
  try {
    return JSON.parse(localStorage.getItem("planetAngles") || "{}");
  } catch {
    return {};
  }
}

// BRON: workshop Jad
export function savePlanetAngles(planets) {
  const anglesToSave = {};

  planets.forEach((planet) => {
    anglesToSave[planet.name] = planet.angle;
  });

  localStorage.setItem("planetAngles", JSON.stringify(anglesToSave));
}