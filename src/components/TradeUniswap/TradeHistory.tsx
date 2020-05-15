import React, { useMemo, useState } from 'react';
import { DataView, TransactionBadge, IdentityBadge } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import { Green, Red } from './MyPositions'
import * as types from '../../types'
import { toTokenUnitsBN } from '../../utils/number';
import { timeSince } from '../../utils/number'
import { getUserUniswapBuys, getUserUniswapSells } from '../../utils/graph'
import { ETHOption } from '../../types';

type MyPositionsProps = {
  user: string
  allOptions: types.ETHOption[]
}

type historyEntry = {
  option: ETHOption
  type: 'Buy' | 'Sell'
  amount: BigNumber,
  premium: BigNumber,
  price: BigNumber,
  timestamp: number,
  txHash: string
} 

function TradeHistory({ user, allOptions }: MyPositionsProps) {
  
  const [rows, setRows] = useState<historyEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useMemo(async()=>{
    if (!user) return

    function filterOptionsOnly (entry: {token: {address: string}}) {
      return allOptions.map(o => o.addr).includes(entry.token.address)
    } 

    const buys = (await getUserUniswapBuys(user)).filter(filterOptionsOnly)
    const buyEntries: historyEntry[]  = buys.map(buy => {
      const option = allOptions.find(o => o.addr === buy.token.address) as ETHOption
      const amount = toTokenUnitsBN(buy.oTokensToBuy, option.decimals)
        .div(option.type === 'call' 
        ? new BigNumber(option.strikePriceInUSD) 
        : new BigNumber(1)
      )
      const price = (new BigNumber(buy.premiumPaid).div(new BigNumber(buy.usdcPrice))).div(amount)
      return {
        option,
        type: 'Buy',
        amount,
        price,
        premium: toTokenUnitsBN(buy.premiumPaid, 18),
        timestamp: parseInt(buy.timestamp),
        txHash: buy.transactionHash
      }
    })
    
    const sells = (await getUserUniswapSells(user)).filter(filterOptionsOnly)
    const sellEntries: historyEntry[]  = sells.map(sell => {
      const option = allOptions.find(o => o.addr === sell.token.address) as ETHOption
      const amount = toTokenUnitsBN(sell.oTokensToSell, option.decimals)
        .div(option.type === 'call' 
          ? new BigNumber(option.strikePriceInUSD) 
          : new BigNumber(1)
        )
      const price = (new BigNumber(sell.payoutTokensReceived).div(new BigNumber(sell.usdcPrice))).div(amount)
      return {
        option,
        type: 'Sell',
        amount,
        premium: toTokenUnitsBN(sell.payoutTokensReceived, 18),
        price,
        timestamp: parseInt(sell.timestamp),
        txHash: sell.transactionHash
      }
    })

    const allEntris = sellEntries.concat(buyEntries).sort((a, b)=> a.timestamp > b.timestamp ? -1 : 1 )
    setRows(allEntris)
    setIsLoading(false)
  }, [allOptions, user])

  return (
    <>
      <DataView
        status={ isLoading ? "loading" : "default" }
        fields={['option', 'Type', 'Size', 'Price', 'total Premium','Time', 'tx']}
        entries={rows}
        entriesPerPage={8}
        tableRowHeight={45}
        renderEntry={({ type, price, amount, timestamp, txHash, option, premium }:historyEntry) => [
          <IdentityBadge label={option.title} entity={option.addr} />,
          <TradeType type={type}/>,
          amount?.toFixed(3) + (option.type === 'call' ? '*' : ''),
          price.toFixed(3) + ' USD',
          premium.toFixed(3) + ' ETH',
          timeSince(timestamp*1000),
          <TransactionBadge transaction={txHash} />
        ]}
      />
    </>
  );
}

export default TradeHistory;

function TradeType({ type }: { type: 'Buy' | 'Sell' }) {
  return (
    type === 'Buy' ? <Green> {type} </Green> : <Red> {type} </Red>
  )
}