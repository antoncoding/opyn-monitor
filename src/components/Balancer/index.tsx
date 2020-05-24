import React, { useState, useMemo } from 'react'
import { TextInput, Header, Box, Button, Timer, IdentityBadge } from '@aragon/ui'
import { BalanceBlock } from '../common'
import BigNumber from 'bignumber.js'
import * as infura from './infura';
import * as web3 from './web3'

import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number'

const usdcDecimals = 6;
const oTokenDecimals = 7;

const oToken = '0x6d2e52cac19d85fa1f8002c2b054502d962305e8';
const usdc = '0x6de3919ad3e78a848a169c282d959de9a20267db';

const poolAddr = '0x126679b2b632f643d00773b205e5a6b0559be282';

const expiration = new Date(1591344000000)

function BalancerDemo() {

  const [spotPrice, setSpotPrice] = useState(new BigNumber(0));

  const [iv, setIV] = useState(0.5);

  const [poolOTokenAmount, setPoolOTokenAmt] = useState(new BigNumber(0))
  const [poolUSDCAmount, setPoolUSDCAmt] = useState(new BigNumber(0))

  const [poolOtokenWeight, setOTokenWeight] = useState(new BigNumber(50))
  const [poolUSDCWeight, setUSDCWeight] = useState(new BigNumber(50))

  const [ethPrice, setEthPrice] = useState(new BigNumber(0))

  useMemo(async () => {
    const usdcWeight = await infura.getWeight(usdc)
    const _usdcWeight = toTokenUnitsBN(usdcWeight, 17)
    const _tokenWeight = new BigNumber(100).minus(_usdcWeight)
    setOTokenWeight(_tokenWeight)
    setUSDCWeight(_usdcWeight)

    const iv = await infura.getIV()
    const _iv = toTokenUnitsBN(iv, 10);
    setIV(_iv.toNumber())

    const poolUSDC = await infura.getTokenBalance(usdc, poolAddr)
    const poolOToken = await infura.getTokenBalance(oToken, poolAddr)
    setPoolOTokenAmt(toTokenUnitsBN(poolOToken, oTokenDecimals))
    setPoolUSDCAmt(toTokenUnitsBN(poolUSDC, usdcDecimals))

    const spotPrice = await infura.getSpotPRice();
    setSpotPrice(toTokenUnitsBN(spotPrice, 18 - oTokenDecimals + usdcDecimals)) // 18 - 7 + 6

    const usdcPrice = await infura.getUSDC()
    setEthPrice(new BigNumber(10).exponentiatedBy(18).div(usdcPrice))

  }, [])

  const [inputUSDCAmount, setInputUSDCAmount] = useState(new BigNumber(0))
  const [inputOTokenAmount, setInputOTokenAmount] = useState(new BigNumber(0))

  const onClickBuy = async () => {
    await web3.swapInUSDC(toBaseUnitBN(inputUSDCAmount, usdcDecimals).toString());
  }

  const onClickSell = async () => {
    await web3.swapInOETH(toBaseUnitBN(inputOTokenAmount, oTokenDecimals).toString());
  }

  return (
    <>
      <Header primary="Balancer (Kovan)" secondary={'ETH price: ' + ethPrice.toFixed(2) + ' USD'} />
      <Box heading="Controller">
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <Box heading="Implied Volatility">
              <BalanceBlock asset="" balance={iv * 100} />
            </Box>
          </div>
          <div style={{ width: '50%' }}>
            <Box heading="Expiration" padding={36}>
              <Timer end={expiration} />
            </Box>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <Box heading="Buy">
              <TextInput
                // disabled={isLocked}
                value={inputUSDCAmount.toNumber()}
                onChange={(e) => setInputUSDCAmount(new BigNumber(e.target.value))}
                adornment="USDC"
                adornmentPosition="end"
              />
              <Button label="Buy oToken" onClick={onClickBuy} />
            </Box>
          </div>
          <div style={{ width: '50%' }}>
            <Box heading="Sell">
              <TextInput
                // disabled={isLocked}
                value={inputOTokenAmount.toNumber()}
                onChange={(e) => setInputOTokenAmount(new BigNumber(e.target.value))}
                adornment="oETH"
                adornmentPosition="end"
              />
              <Button label="Sell oToken" onClick={onClickSell} />
            </Box>
          </div>
        </div>

      </Box>
      <Box heading="Pool">
        <div style={{ display: 'flex' }}>
          <div style={{ width: '50%' }}>
            <Box heading="Spot Price">
              <BalanceBlock asset="USDC" balance={spotPrice} />
            </Box>
          </div>
          <div style={{ width: '50%' }}>
            <Box heading="Pool Addresses" padding={46}>
              <IdentityBadge entity={poolAddr} label="Balancer Pool" shorten={true} /> {' '}
              <IdentityBadge entity={oToken} label="oETH" shorten={false} /> {' '}
              <IdentityBadge entity={usdc} label="USDC" shorten={false} />
            </Box>
          </div>
        </div>
        <br /><br />
        <div style={{ display: 'flex' }}>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="oETH" balance={poolOTokenAmount} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="oETH Weight" balance={poolOtokenWeight.toFixed(4)} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}></div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="USDC" balance={poolUSDCAmount} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="USDC Weight" balance={poolUSDCWeight.toFixed(4)} ></BalanceBlock>
          </div>
        </div>
      </Box>

    </>
  )
}

export default BalancerDemo