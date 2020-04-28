import { eth_calls } from './calls';
import { eth_puts } from './puts';
import { insurances } from './insurances';


export const eth_options = eth_puts.concat(eth_calls);
export const allOptions = insurances.concat(eth_options);
export {
  eth_calls, eth_puts, insurances,
};
