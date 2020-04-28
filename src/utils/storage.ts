/**
 * Get value by key
 * @param {string} key
 * @param {string} defaultValue
 */
export function getPreference(key:string, defaultValue:string): string {
  return localStorage.getItem(key) || defaultValue;
}

/**
 * store value to storage
 * @param {string} key
 * @param {string} value
 */
export function storePreference(key:string, value:string):void {
  localStorage.setItem(key, value);
}

export function checkAddressAndAddToStorage(address:string):void {
  const watch_addrs = getPreference('watch_addresses', '[]');
  const usedAddresses = JSON.parse(watch_addrs);
  if (!usedAddresses.includes(address.toLowerCase()) && !usedAddresses.includes(address)) {
    usedAddresses.push(address);
    storePreference('watch_addresses', JSON.stringify(usedAddresses));
  }
}
