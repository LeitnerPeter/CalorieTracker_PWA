let chartInstance = null;

export function renderChart(data) {
  if (!data || data.length === 0) return;

  const grouped = {};
  data.forEach(e => {
    grouped[e.date] = (grouped[e.date] || 0) + e.calories;
  });

  const labels = Object.keys(grouped).sort();
  const values = labels.map(d => grouped[d]);

  const ctx = document.getElementById("weeklyChart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: { labels, datasets: [{ data: values }] },
    options: { plugins: { legend: { display:false } } }
  });
}