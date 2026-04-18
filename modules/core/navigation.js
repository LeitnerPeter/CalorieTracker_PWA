export function navigateTo(renderFunction) {
  // sagt dem Browser: neue Seite wurde geöffnet
  history.pushState({}, "", "");

  // rendert den neuen Screen
  renderFunction();
}

// Wenn User zurück geht (Browser Back / Swipe iPhone)
window.onpopstate = () => {
  location.reload();
};