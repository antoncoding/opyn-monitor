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

export const token = PropTypes.shape({
  addr: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
});

export const option = PropTypes.shape({
  addr: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  oracle: PropTypes.string.isRequired,
  collateral: token.isRequired,
  underlying: token.isRequired,
  strike: token.isRequired,
  strikePrice: PropTypes.number.isRequired,
  minRatio: PropTypes.number.isRequired,
  exchange: PropTypes.string.isRequired,
  uniswapExchange: PropTypes.string.isRequired,
  expiry: PropTypes.number.isRequired,
});
