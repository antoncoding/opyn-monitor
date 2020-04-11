import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, TextInput, Button, IconCirclePlus, IconCircleMinus,
} from '@aragon/ui';
import BigNumber from 'bignumber.js';
import { buyOTokensFromExchange, sellOTokensFromExchange } from '../../utils/web3';

import { getPremiumToPay, getPremiumReceived } from '../../utils/infura';

import { BalanceBlock, MaxButton, PriceSection } from '../common';
import { toBaseUnitBN, fromWei } from '../../utils/number';

/**
 *
 * @param {{
 *  decimals: number
 *  tokenBalance: BigNumber
 * }} param0
 */
function OptionExchange({
  symbol, tokenBalance, token, exchange, decimals,
}) {
  const [buyAmt, setBuyAmt] = useState(new BigNumber(0));
  const [sellAmt, setSellAmt] = useState(new BigNumber(0));
  const [premiumToPay, setPremiumToPay] = useState(new BigNumber(0));
  const [premiumReceived, setPremiumReceived] = useState(new BigNumber(0));

  const updatePremiumToPay = async (amt) => {
    const butAmountBN = new BigNumber(amt);
    if (butAmountBN.lte(new BigNumber(0))) {
      setPremiumToPay(new BigNumber(0));
      return;
    }
    const amount = toBaseUnitBN(butAmountBN, decimals).toString();
    const premium = await getPremiumToPay(exchange, token, amount);
    setPremiumToPay(new BigNumber(fromWei(premium)));
  };

  const updatePremiumReceived = async (amt) => {
    const sellAmountBN = new BigNumber(amt);
    if (sellAmountBN.lte(new BigNumber(0))) {
      setPremiumReceived(new BigNumber(0));
      return;
    }
    const amount = toBaseUnitBN(sellAmountBN, decimals).toString();
    const premium = await getPremiumReceived(exchange, token, amount);
    setPremiumReceived(new BigNumber(premium));
  };

  return (
    <Box heading="Exchange">
      <div style={{ display: 'flex' }}>
        {/* total Issued */}
        <div style={{ width: '30%' }}>
          <BalanceBlock asset={`${symbol} Balance`} balance={tokenBalance} />
        </div>
        {/* Buy Token from Uniswap */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={buyAmt}
                  onChange={(event) => {
                    if (event.target.value) {
                      setBuyAmt(event.target.value);
                      updatePremiumToPay(event.target.value);
                    } else {
                      setBuyAmt(new BigNumber(0));
                      updatePremiumToPay(new BigNumber(0));
                    }
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                wide
                icon={<IconCirclePlus />}
                label="Buy"
                onClick={() => {
                  buyOTokensFromExchange(
                    token,
                    exchange,
                    toBaseUnitBN(buyAmt, decimals).toString(),
                    toBaseUnitBN(premiumToPay, 18).toString(),
                  );
                }}
              />
            </div>
          </div>
          <PriceSection label="Cost:" amt={premiumToPay} symbol="" />
        </div>
        <div style={{ width: '6%' }} />
        {/* Remove collateral */}
        <div style={{ width: '32%', paddingTop: '2%' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '60%' }}>
              <>
                <TextInput
                  type="number"
                  wide
                  value={sellAmt}
                  onChange={(event) => {
                    if (event.target.value) {
                      setSellAmt(event.target.value);
                      updatePremiumReceived(event.target.value);
                    } else {
                      setSellAmt(new BigNumber(0));
                      updatePremiumReceived(new BigNumber(0));
                    }
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setSellAmt(tokenBalance);
                    updatePremiumReceived(tokenBalance);
                  }}
                />
              </>
            </div>
            <div style={{ width: '40%' }}>
              <Button
                wide
                icon={<IconCircleMinus />}
                label="Sell"
                onClick={() => {
                  sellOTokensFromExchange(
                    token,
                    exchange,
                    toBaseUnitBN(sellAmt, decimals).toString(),
                  );
                }}
              />
            </div>
          </div>
          <PriceSection label="Premium" amt={premiumReceived} />
        </div>
      </div>
    </Box>
  );
}

OptionExchange.propTypes = {
  symbol: PropTypes.string.isRequired,
  tokenBalance: PropTypes.instanceOf(BigNumber).isRequired,
  token: PropTypes.string.isRequired,
  exchange: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
};

export default OptionExchange;
