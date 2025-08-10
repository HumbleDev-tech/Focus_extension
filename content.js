function hideSubscribe() {
  const subscribeBtn = document.querySelector('ytd-subscribe-button-renderer');
  if (subscribeBtn) {
    subscribeBtn.style.display = 'none';
  }
}

function observeSubscribeButton() {
  chrome.storage.sync.get('subscribeHidden', ({ subscribeHidden }) => {
    if (!subscribeHidden) return;

    // Intentar ocultar inmediatamente
    hideSubscribe();

    // Crear un observer para cambios en el body, porque YouTube cambia el DOM dinámicamente
    const targetNode = document.body;

    const config = { childList: true, subtree: true };

    const callback = function(mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          hideSubscribe();
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  });
}

observeSubscribeButton();
