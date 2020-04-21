import { eth_calls } from './calls';
import { eth_puts } from './puts';
import { insurances } from './insurances';


export const eth_options = eth_puts; // eth_calls.concat(eth_puts);
export const allOptions = insurances.concat(eth_calls).concat(eth_puts);
export {
  eth_calls, eth_puts, insurances,
};
