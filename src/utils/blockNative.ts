import Notify from 'bnc-notify';

const BLOCKNATIVE_KEY = process.env.REACT_APP_BLOCKNATIVE_KEY;

// eslint-disable-next-line import/prefer-default-export
export const notify = Notify({
  dappId: BLOCKNATIVE_KEY,
  networkId: 1,
});
