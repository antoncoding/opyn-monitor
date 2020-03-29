import PropTypes from 'prop-types';

export const vault = PropTypes.shape({
  owner: PropTypes.string,
  oTokensIssued: PropTypes.string,
  collateral: PropTypes.string,
});

// export const detailVault = PropTypes.shape({
//   oTokensIssued: PropTypes.string,
//   collateral: PropTypes.string,
// });

export const option = PropTypes.shape({
  addr: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  oracle: PropTypes.string.isRequired,
  collateral: PropTypes.string.isRequired,
  underlying: PropTypes.string.isRequired,
  strike: PropTypes.string.isRequired,
  strikePrice: PropTypes.number.isRequired,
  minRatio: PropTypes.number.isRequired,
  exchange: PropTypes.string.isRequired,
  uniswapExchange: PropTypes.string.isRequired,
  expiry: PropTypes.number.isRequired,
});
