import React, { useState } from 'react'

import { TextInput, Header, Box, Button } from '@aragon/ui'
import DateTimePicker from 'react-widgets/lib/DateTimePicker'
import { BalanceBlock } from '../common'
import BigNumber from 'bignumber.js'

import {
  getApprxATMIV,
  // getIVCorrandoMiller, 
  getApprxIV,
  getApprxATMPrice, 
  // getApprxATMPrice2,
  updateWight, 
  calculateOutGivenIn,
} from './utils'

function BalancerDemo({ ethPrice }: { ethPrice: BigNumber }) {

  const [smartContractCalls, setSmartContactCalled] = useState(0)

  const [today, setToday] = useState(new Date())
  const [expiration, setExpiration] = useState(new Date(today.getTime() + (120 * 60 * 60 * 1000)))

  // option info
  const [strikePrice, setStrikePrice] = useState(200)


  // const [isLocked, setIsLocked] = useState(false)

  const [poolOTokenAmount, setPoolOTokenAmt] = useState(new BigNumber(0))
  const [poolUSDCAmount, setPoolETHAmt] = useState(new BigNumber(0))

  const [poolOtokenWeight, setOTokenWeight] = useState(new BigNumber(0.5))
  const [poolUSDCWeight, setUSDCWeight] = useState(new BigNumber(0.5))

  // Input values
  const [addOTokenAmount, setAddOTokenAmount] = useState(new BigNumber(0))
  const [addUSDCAmount, setAddUSDCAmount] = useState(new BigNumber(0))

  const [inputUSDCAmount, setInputUSDCAmount] = useState(new BigNumber(0))

  const spotPrice = (poolUSDCAmount.div(poolUSDCWeight)).div(poolOTokenAmount.div(poolOtokenWeight))

  // Mock smart contract calls
  const preAction = () => {
    // adjust price (weight) with new spot price, timestamp and OLD IV
    const newprice = getApprxATMPrice(ethPrice, lastIV, today, expiration)
    // const newprice = getApprxATMPrice2(new BigNumber(strikePrice), ethPrice, lastIV, today, expiration)

    if (poolUSDCAmount.gt(0) && poolOTokenAmount.gt(0)) {
      // const priceInETH = newprice.div(ethPrice)
      const newWeights = updateWight(newprice, poolUSDCAmount, poolOTokenAmount)
      setUSDCWeight(newWeights.w1)
      setOTokenWeight(newWeights.w2)
      console.log(`[pre] weight ${newWeights.w1.toNumber()} - ${newWeights.w2.toNumber()}`)
      return newWeights
    }
    return { w1: poolUSDCWeight, w2: poolOtokenWeight }

  }

  const postAction = (poolUSDCAmount: BigNumber, poolOTokenAmount: BigNumber, usdcWeight, tokenWeight) => {
    // calculate iv from current spot price
    console.log(`[post] weight ${usdcWeight.toNumber()} - ${tokenWeight.toNumber()}`)
    const spotPrice = (poolUSDCAmount.div(usdcWeight)).div(poolOTokenAmount.div(tokenWeight))
    const iv = getApprxATMIV(
      spotPrice,
      ethPrice,
      today,
      expiration
    ).toNumber()
    const iv2 = getApprxIV(
      spotPrice,
      ethPrice,
      new BigNumber(strikePrice),
      today,
      expiration
    ).toNumber()
    // const iv2 = getIVCorrandoMiller(spotPrice, new BigNumber(strikePrice), ethPrice, today, expiration)
    console.log(`iv2`, iv2)
    setLastIV(iv)

  }

  const onClickAddLiquidity = () => {
    const weights = preAction()

    setPoolOTokenAmt(poolOTokenAmount.plus(addOTokenAmount))
    setPoolETHAmt(poolUSDCAmount.plus(addUSDCAmount))

    setAddUSDCAmount(new BigNumber(0))
    setAddOTokenAmount(new BigNumber(0))
    setSmartContactCalled(smartContractCalls + 1)

    postAction(poolUSDCAmount.plus(addUSDCAmount), poolOTokenAmount.plus(addOTokenAmount), weights.w1, weights.w2)
  }

  const onClickInputUSDC = () => {
    const weights = preAction()

    const outAmount = calculateOutGivenIn(inputUSDCAmount, poolUSDCAmount, poolOTokenAmount, poolUSDCWeight, poolOtokenWeight)
    setPoolOTokenAmt(poolOTokenAmount.minus(outAmount))
    setPoolETHAmt(poolUSDCAmount.plus(inputUSDCAmount))

    postAction(poolUSDCAmount.plus(inputUSDCAmount), poolOTokenAmount.minus(outAmount), weights.w1, weights.w2)

  }

  const [lastIV, setLastIV] = useState(0.5)

  return (
    <>
      <Header primary="Balancer" secondary={'ETH price: ' + ethPrice.toFixed(2) + ' USD'} />
      <Box heading="Option">
        Today | Expiration
        <div style={{ display: 'flex' }}>

          <DateTimePicker
            defaultValue={today}
            onChange={setToday}
          />
          <DateTimePicker
            defaultValue={expiration}
            onChange={setExpiration}
          />
        </div>
        <br />
        Strike Price
        <TextInput
          value={strikePrice}
          onChange={(e) => setStrikePrice(e.target.value)} />
      </Box>
      <Box heading="Controller">
        <div>
          Last IV:  {lastIV ? lastIV.toFixed(5) : '-'}
        </div>
        <Box heading="Add Asset">
          <TextInput
            // disabled={isLocked}
            value={addUSDCAmount.toNumber()}
            onChange={(e) => setAddUSDCAmount(new BigNumber(e.target.value))}
            adornment="USDC"
            adornmentPosition="end"
          />
          <TextInput
            // disabled={isLocked}
            value={addOTokenAmount.toNumber()}
            onChange={(e) => setAddOTokenAmount(new BigNumber(e.target.value))}
            adornment="oToken"
            adornmentPosition="end"
          />
          <Button label="Add Liquidity" onClick={onClickAddLiquidity} />
        </Box>
        <Box heading="Buy">
          <TextInput
            // disabled={isLocked}
            value={inputUSDCAmount.toNumber()}
            onChange={(e) => setInputUSDCAmount(new BigNumber(e.target.value))}
            adornment="USDC"
            adornmentPosition="end"
          />
          <Button label="Buy oToken" onClick={onClickInputUSDC} />
          {/* <TextInput
            // disabled={isLocked}
            value={addOTokenAmount.toNumber()}
            onChange={(e) => setAddOTokenAmount(new BigNumber(e.target.value))}
            adornment="oToken"
            adornmentPosition="end"
          /> */}

        </Box>
      </Box>
      <Box heading="Pool">
        <div>
          Spot Price {spotPrice ? spotPrice.toFixed(5) : '-'} ({spotPrice.toFixed(2)} USDC)
        </div>
        <br /><br />
        <div style={{ display: 'flex' }}>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="oToken" balance={poolOTokenAmount} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="oToken Weight" balance={poolOtokenWeight.toFixed(4)} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}></div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="USDC" balance={poolUSDCAmount} ></BalanceBlock>
          </div>
          <div style={{ width: '20%' }}>
            <BalanceBlock asset="ETH Weight" balance={poolUSDCWeight.toFixed(4)} ></BalanceBlock>
          </div>
        </div>
      </Box>

    </>
  )
}

export default BalancerDemo