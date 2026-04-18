// einfacher Kamera-Barcode Scanner (QuaggaJS per CDN)
import { addEntry } from "/services/entryService.js";
import { renderDashboard } from "/screens/dashboard.js";

export function startScanner() {
  document.body.innerHTML = `
    <div class="screen">
      <h1>Barcode scannen</h1>
      <button id="backBtn">← Zurück</button>

      <div id="scanner" style="width:100%; max-width:400px; margin:auto;"></div>
      <p id="scanStatus">Kamera wird gestartet…</p>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => history.back();

  // Quagga kommt aus CDN (index.html)
  const Quagga = window.Quagga;

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector("#scanner"),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "ean_8_reader"]
    }
  }, err => {
    if (err) {
      document.getElementById("scanStatus").innerText =
        "Kamera konnte nicht gestartet werden";
      console.error(err);
      return;
    }

    Quagga.start();
    document.getElementById("scanStatus").innerText =
      "Barcode scannen…";
  });

  Quagga.onDetected(async result => {
    const code = result.codeResult.code;
    Quagga.stop();

    document.getElementById("scanStatus").innerText =
      "Barcode erkannt: " + code;

    // Dummy Food (API kommt später)
    await addEntry({
      food_name: "Barcode Produkt " + code,
      grams: 100,
      kcal: 250
    });

    setTimeout(() => {
      renderDashboard();
    }, 800);
  });
}