import React, { useState } from 'react'
import BigNumber from 'bignumber.js'

import { Modal, Button, Header } from '@aragon/ui'

import UniswapBuySell from '../UniswapExchange/UniswapBuySell'

import * as types from '../../types'
import { toTokenUnitsBN } from '../../utils/number'
// import { SectionTitle } from '../common'

type TradeModalProps = {
  spotPrice: BigNumber
  balance: BigNumber
  oToken: types.ETHOption
}

function TradeModal({ oToken, spotPrice, balance }: TradeModalProps) {

  const [opened, setOpened] = useState(false)

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
          spotPrice={spotPrice}
          strikePriceInUSD={oToken.strikePriceInUSD}
          symbol={oToken.symbol}
          tokenBalance={toTokenUnitsBN(balance, oToken.decimals)}
          token={oToken.addr}
          exchange={oToken.exchange}
          decimals={oToken.decimals}
        />
      </Modal>
    </>
  )
}

export default TradeModal