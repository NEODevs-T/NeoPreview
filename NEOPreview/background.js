let selectedTabs = []; // Para almacenar los IDs de las pestañas seleccionadas
let currentTabIndex = 0; // Controlador de la pestaña actual
let captureInProgress = false; // Control para evitar capturas simultáneas

// Captura de la pestaña seleccionada
function captureTab(tabId) {
  if (captureInProgress) return; // Evitar capturas simultáneas
  captureInProgress = true; // Marcar que se está tomando una captura

  chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
    if (chrome.runtime.lastError || !imageUri) {
      console.error('Error al capturar la pestaña:', chrome.runtime.lastError?.message || 'Imagen no disponible');
      captureInProgress = false; // Liberar el bloqueo
      return;
    }

    // Guardar la captura en el almacenamiento local (opcional)
    chrome.storage.local.set({ currentCapture: imageUri }, () => {
      console.log("Captura almacenada en chrome.storage.local");
    });

    // Guardar localmente la captura con un nombre fijo
    const filename = `powerbi.png`; // Nombre fijo para todas las capturas
    chrome.downloads.download({
      url: imageUri,
      filename: filename,
      conflictAction: 'overwrite', // Sobrescribir el archivo existente
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Error al descargar la imagen:', chrome.runtime.lastError.message);
      } else {
        console.log(`Imagen guardada como ${filename}`);
      }
      captureInProgress = false; // Liberar el bloqueo
    });
  });
}

// Cambiar de pestaña automáticamente y tomar captura
function switchTabAndCapture() {
  if (selectedTabs.length > 0) { // Asegurarse de que hay pestañas seleccionadas
    chrome.tabs.update(selectedTabs[currentTabIndex], { active: true }, () => {
      captureTab(selectedTabs[currentTabIndex]);
    });

    // Alternar entre las pestañas seleccionadas
    currentTabIndex = (currentTabIndex + 1) % selectedTabs.length;
  }
}

// Escuchar el mensaje para añadir una nueva pestaña a capturar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (selectedTabs.length < 4) { // Permitir hasta 4 pestañas
        const tabId = tabs[0].id;
        if (!selectedTabs.includes(tabId)) {
          selectedTabs.push(tabId);
          chrome.storage.local.set({ selectedTabs: selectedTabs });
          sendResponse({ status: 'added' });
        } else {
          sendResponse({ status: 'already_added' });
        }
      } else {
        sendResponse({ status: 'limit_reached' });
      }
    });
    return true; // Respuesta asíncrona
  }
});

// Captura periódica cada 30 segundos
setInterval(switchTabAndCapture, 30000);
