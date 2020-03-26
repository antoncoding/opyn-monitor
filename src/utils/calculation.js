import BigNumber from 'bignumber.js';
import { getPrice, getDecimals } from './infura';
import { toBaseUnitBN } from './number';

/**
 * Get strike value in collateral for ratio calculation.
 * @param {string} collateral address
 * @param {string} strike address
 * @param {string} oracle address
 * @param {number?} collateralDecimals if provided, wont get again if needed
 * @return {Promise<BigNumber>}
 */
export const calculateStrikeValueInCollateral = async (
  collateral,
  strike,
  oracle,
  collateralDecimals = undefined
) => {
  const ETH_Address = '0x0000000000000000000000000000000000000000';
  let strikeValueInCollateral;
  if (collateral === ETH_Address) {
    const strikeValueInWei = await getPrice(oracle, strike);
    strikeValueInCollateral = new BigNumber(strikeValueInWei);
  } else if (collateral === strike) {
    // No collateral, like ETH option
    if (collateralDecimals === undefined) collateralDecimals = await getDecimals(collateral);
    strikeValueInCollateral = new BigNumber(10).pow(new BigNumber(collateralDecimals));
  } else {
    // Use other ERC20 as collateral : Untested
    if (collateralDecimals === undefined) collateralDecimals = await getDecimals(collateral);
    const strikeValueInWei = await getPrice(oracle, strike);
    const collateralValueInWei = await getPrice(oracle, collateral);
    strikeValueInCollateral = toBaseUnitBN(
      parseInt(strikeValueInWei) / parseInt(collateralValueInWei),
      collateralDecimals
    );
  }
  return strikeValueInCollateral;
};

/**
 *
 * @param {string|number|BigNumber} collateral number of collateral in base unit
 * @param {string|number|BigNumber} tokenIssued number of token in base unit
 * @param {string|number|BigNumber} strikePrice
 * @param {BigNumber} strikeValueInCollateral
 * @return {number}
 */
export const calculateRatio = (collateral, tokenIssued, strikePrice, strikeValueInCollateral) => {
  if (tokenIssued === '0') return Infinity;
  const colalteralBN = new BigNumber(collateral);
  const tokenIssuedBN = new BigNumber(tokenIssued);
  const strikePriceBN = new BigNumber(strikePrice);
  // const strikeValueInCollateralBN = new BigNumber(strikeValueInCollateral.toString())
  const result = colalteralBN
    .div(tokenIssuedBN)
    .div(strikePriceBN)
    .div(strikeValueInCollateral);
  return result.toNumber();
};
