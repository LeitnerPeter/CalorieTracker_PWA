export function navigateTo(renderFunction) {
  history.pushState({}, "", "");
  renderFunction();
}

// Back Button global
window.onpopstate = () => {
  location.reload(); // einfacher erster Router
};