let timeout = null;

export function debounceSearch(callback) {
  return (value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(value), 300);
  };
}