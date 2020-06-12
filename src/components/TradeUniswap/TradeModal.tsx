import React, { useState } from 'react'
import BigNumber from 'bignumber.js'

import { Modal, Button, Header } from '@aragon/ui'

import UniswapBuySell from '../UniswapExchange/UniswapBuySell'

import * as types from '../../types'
import { toTokenUnitsBN } from '../../utils/number'

type TradeModalProps = {
  spotPrice: BigNumber
  balance: BigNumber
  oToken: types.ETHOption
}

function TradeModal({ oToken, spotPrice, balance }: TradeModalProps) {

  const [opened, setOpened] = useState(false)
  const multiplier = new BigNumber(1) // oToken.type === 'call' 
    // ? new BigNumber(oToken.strikePriceInUSD) 
    // : new BigNumber(1)

  return (
    <>
      <Button onClick={() => setOpened(true)} size="small">Trade</Button>
      <Modal 
        padding={50}
        width={(viewport)=>{Math.min(viewport.width, 800)}} 
        visible={opened} 
        onClose={() => setOpened(false)} >
        <Header primary={`Buy / Sell ${oToken.title} `} />
        <br/>
        <UniswapBuySell
          option={oToken}
          multiplier={multiplier}
          spotPrice={spotPrice}
          tokenBalance={toTokenUnitsBN(balance, oToken.decimals)}
        />
      </Modal>
    </>
  )
}

export default TradeModal