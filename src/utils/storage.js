
/**
 * Get value by key
 * @param {string} key
 * @param {string} defaultValue
 */
export function getPreference(key, defaultValue) {
  return localStorage.getItem(key) || defaultValue;
}

/**
 * store value to storage
 * @param {string} key
 * @param {string} value
 */
export function storePreference(key, value) {
  localStorage.setItem(key, value);
}
