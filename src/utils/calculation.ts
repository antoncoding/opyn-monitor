import BigNumber from 'bignumber.js';
import { getPrice } from './infura';
import { toBaseUnitBN } from './number';

/**
 * Get strike value in collateral for ratio calculation.
 * @param {string} collateral address
 * @param {string} strike address
 * @param {string} oracle address
 * @param {number} collateralDecimals
 * @return {Promise<BigNumber>}
 */
export const calculateStrikeValueInCollateral = async (
  collateral:string,
  strike:string,
  oracle:string,
  collateralDecimals: number,
): Promise<BigNumber> => {
  const ETH_Address = '0x0000000000000000000000000000000000000000';
  let strikeValueInCollateral: BigNumber;
  if (collateral === ETH_Address) {
    const strikeValueInWei = await getPrice(oracle, strike);
    strikeValueInCollateral = new BigNumber(strikeValueInWei);
  } else if (collateral === strike) {
    // No collateral, like ETH option
    strikeValueInCollateral = new BigNumber(10).pow(new BigNumber(collateralDecimals));
  } else {
    const strikeValueInWei = await getPrice(oracle, strike);
    const collateralValueInWei = await getPrice(oracle, collateral);
    strikeValueInCollateral = toBaseUnitBN(
      parseInt(strikeValueInWei, 10) / parseInt(collateralValueInWei, 10),
      collateralDecimals,
    );
  }
  return strikeValueInCollateral;
};

/**
 * Calculate collateral ratio
 */
export const calculateRatio = (
  collateral: string|number|BigNumber,
  tokenIssued: string|number|BigNumber,
  strikePrice: string|number|BigNumber,
  strikeValueInCollateral: BigNumber): number => {
  if (tokenIssued === '0') return Infinity;
  const colalteralBN = new BigNumber(collateral);
  const tokenIssuedBN = new BigNumber(tokenIssued);
  const strikePriceBN = new BigNumber(strikePrice);
  
  const result = colalteralBN.div(tokenIssuedBN).div(strikePriceBN).div(strikeValueInCollateral);
  return result.toNumber();
};
