import { getTodayEntries } from "services/entryService.js";

export function drawProgressRing(percent) {
  const canvas = document.getElementById("progressRing");
  const ctx = canvas.getContext("2d");

  const center = 100;
  const radius = 80;

  ctx.clearRect(0, 0, 200, 200);

  // Hintergrund Kreis
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#eee";
  ctx.stroke();

  // Fortschritt
  const endAngle = (percent / 100) * 2 * Math.PI;

  ctx.beginPath();
  ctx.arc(center, center, radius, -Math.PI / 2, endAngle - Math.PI / 2);
  ctx.strokeStyle = "#4caf50";
  ctx.stroke();
}

const entries = await getTodayEntries();
renderMealList(entries);

function renderMealList(entries) {
  const container = document.getElementById("mealList");
  container.innerHTML = "<h3>Heute gegessen</h3>";

  if (entries.length === 0) {
    container.innerHTML += "<p>Noch nichts eingetragen</p>";
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "meal-entry";
    div.innerHTML = `
      ${entry.grams}g • ${entry.kcal} kcal
    `;
    container.appendChild(div);
  });
}