function updateCapture() {
  chrome.storage.local.get(['currentCapture'], (items) => {
    const captureContainer = document.getElementById('captureContainer');
    if (items.currentCapture) {
      captureContainer.innerHTML = `<img src="${items.currentCapture}" alt="Captura Actual">`;
    } else {
      captureContainer.innerHTML = `<p>No hay captura disponible.</p>`;
    }
  });
}

// Actualizar la vista de captura cada 30 segundos
setInterval(updateCapture, 30000);
document.addEventListener('DOMContentLoaded', updateCapture);
