document.getElementById('addTabButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'addTab' }, (response) => {
    if (response.status === 'added') {
      updateTabCount();
    } else if (response.status === 'limit_reached') {
      alert('Ya has seleccionado 2 pestañas.');
    }
  });
});

// Abrir la página de capturas
document.getElementById('viewCaptures').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') });
});

// Actualizar el contador al cargar el popup
function updateTabCount() {
  chrome.storage.local.get(['selectedTabs'], (result) => {
    const count = result.selectedTabs ? result.selectedTabs.length : 0;
    document.getElementById('tabCount').innerText = `Pestañas seleccionadas: ${count}`;
  });
}

document.addEventListener('DOMContentLoaded', updateTabCount);
