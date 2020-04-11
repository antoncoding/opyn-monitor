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

export const order = PropTypes.shape({
  order: PropTypes.shape({
    signature: PropTypes.string.isRequired,
    senderAddress: PropTypes.string.isRequired,
    makerAddress: PropTypes.string.isRequired,
    takerAddress: PropTypes.string.isRequired,
    makerFee: PropTypes.string.isRequired,
    takerFee: PropTypes.string.isRequired,
    makerAssetAmount: PropTypes.string.isRequired,
    takerAssetAmount: PropTypes.string.isRequired,
    makerAssetData: PropTypes.string.isRequired,
    takerAssetData: PropTypes.string.isRequired,
    salt: PropTypes.string.isRequired,
    exchangeAddress: PropTypes.string.isRequired,
    feeRecipientAddress: PropTypes.string.isRequired,
    expirationTimeSeconds: PropTypes.string.isRequired,
    makerFeeAssetData: PropTypes.string.isRequired,
    chainId: PropTypes.number.isRequired,
    takerFeeAssetData: PropTypes.string.isRequired,
  }),
  metaData: PropTypes.shape({
    orderHash: PropTypes.string.isRequired,
    remainingFillableTakerAssetAmount: PropTypes.string.isRequired,
  }),
});
