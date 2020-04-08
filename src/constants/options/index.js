import { eth_calls, mock_eth_calls } from './calls';
import { eth_puts, mock_eth_puts } from './puts';
import { insurances } from './insurances';


export const eth_options = eth_calls.concat(eth_puts);
export const allOptions = insurances.concat(eth_calls).concat(eth_puts);
export {
  eth_calls, eth_puts, insurances, mock_eth_calls, mock_eth_puts,
};
