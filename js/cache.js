const KEY = "weeklyCaloriesCache";

export function getCache() {
  const cache = localStorage.getItem(KEY);
  if (!cache) return null;

  const parsed = JSON.parse(cache);
  if (Date.now() - parsed.timestamp > 5 * 60 * 1000) return null;

  return parsed.data;
}

export function setCache(data) {
  localStorage.setItem(KEY, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
}

export function clearCache() {
  localStorage.removeItem(KEY);
}