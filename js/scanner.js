let stream = null;
let scanning = false;

export function startScanner(onFoodScanned) {
  if ("BarcodeDetector" in window) {
    startNativeScanner(onFoodScanned);
  } else {
    startQuaggaScanner(onFoodScanned);
  }
}

export function stopScanner() {
  scanning = false;

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }

  document.getElementById("scanner-container").style.display = "none";

  if (window.Quagga) {
    Quagga.stop();
  }
}

async function startNativeScanner(onFoodScanned) {
  const container = document.getElementById("scanner-container");
  const video = document.getElementById("scanner-video");

  container.style.display = "block";

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  video.srcObject = stream;
  video.play();

  const detector = new BarcodeDetector({
    formats: ["ean_13", "ean_8"]
  });

  scanning = true;

  while (scanning) {
    const barcodes = await detector.detect(video);

    if (barcodes.length > 0) {
      const code = barcodes[0].rawValue;
      stopScanner();
      fetchFood(code, onFoodScanned);
      return;
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

function startQuaggaScanner(onFoodScanned) {
  const container = document.getElementById("scanner-container");
  container.style.display = "block";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector("#scanner-video"),
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader"] }
  }, err => {
    if (err) {
      alert("Kamera konnte nicht gestartet werden");
      return;
    }

    Quagga.start();
  });

  Quagga.onDetected(result => {
    const code = result.codeResult.code;
    stopScanner();
    fetchFood(code, onFoodScanned);
  });
}

async function fetchFood(barcode, callback) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const json = await res.json();

    if (json.status !== 1) {
      alert("Produkt nicht gefunden 😕");
      return;
    }

    const product = json.product;

    const food = {
      name: product.product_name || "Unknown product",
      calories: product.nutriments["energy-kcal_100g"] || 0
    };

    callback(food);

  } catch (err) {
    console.error(err);
    alert("Scanner Fehler");
  }
}