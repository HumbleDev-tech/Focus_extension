const btn = document.getElementById('toggleSubscribeBtn');

// Al cargar el popup, recupera el estado guardado y actualiza el botón
chrome.storage.sync.get('subscribeHidden', (data) => {
  if (data.subscribeHidden) {
    btn.classList.add('active');
    btn.textContent = 'Mostrar botón Suscribirse';
  } else {
    btn.classList.remove('active');
    btn.textContent = 'Ocultar botón Suscribirse';
  }
});

btn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const subscribeBtn = document.querySelector('ytd-subscribe-button-renderer');
      if (subscribeBtn) {
        if (subscribeBtn.style.display === 'none') {
          subscribeBtn.style.display = '';
          return false; // Visible
        } else {
          subscribeBtn.style.display = 'none';
          return true; // Oculto
        }
      }
      return null; // No encontró botón
    },
  }, (injectionResults) => {
    if (injectionResults && injectionResults[0].result !== null) {
      const hidden = injectionResults[0].result;

      // Guarda el estado
      chrome.storage.sync.set({ subscribeHidden: hidden });

      // Actualiza texto y estilo según estado
      if (hidden) {
        btn.classList.add('active');
        btn.textContent = 'Mostrar botón Suscribirse';
      } else {
        btn.classList.remove('active');
        btn.textContent = 'Ocultar botón Suscribirse';
      }
    } else {
      // No encontró el botón en la página, puedes manejar error si quieres
      alert('No se encontró el botón Suscribirse en esta página.');
    }
  });
});
