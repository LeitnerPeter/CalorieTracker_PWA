export function drawProgressRing(percent) {
  const canvas = document.getElementById("progressRing");
  if (!canvas) return; // Safety guard

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