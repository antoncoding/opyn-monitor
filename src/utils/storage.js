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

export function checkAddressAndAddToStorage(address) {
  const watch_addrs = getPreference('watch_addresses', '[]');
  const usedAddresses = JSON.parse(watch_addrs);
  if (!usedAddresses.includes(address.toLowerCase()) && !usedAddresses.includes(address)) {
    usedAddresses.push(address);
    storePreference('watch_addresses', JSON.stringify(usedAddresses));
  }
}
