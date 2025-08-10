document.getElementById('toggleSubscribeBtn').addEventListener('click', async () => {
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
      // Guardar estado en storage
      chrome.storage.sync.set({ subscribeHidden: injectionResults[0].result });
    }
  });
});
