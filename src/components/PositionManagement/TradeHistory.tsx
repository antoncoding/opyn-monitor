import React, { useMemo, useState } from 'react';
import { DataView, TransactionBadge, Timer } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import * as types from '../../types'
import { toTokenUnitsBN } from '../../utils/number';

import { getUserUniswapBuys } from '../../utils/graph'
import { ETHOption } from '../../types';

type MyPositionsProps = {
  user: string
  allOptions: types.ETHOption[]
}

type historyEntry = {
  type: 'Buy' | 'Sell'
  amount: BigNumber,
  price: BigNumber,
  timestamp: number,
  txHash: string
} 

function TradeHistory({ user, allOptions }: MyPositionsProps) {
  
  const [rows, setRows] = useState<historyEntry[]>([])

  

  useMemo(async()=>{
    if (!user) return

    function filterOptionsOnly (entry: {token: {address: string}}) {
      return allOptions.map(o => o.addr).includes(entry.token.address)
    } 

    const buys = (await getUserUniswapBuys(user)).filter(filterOptionsOnly)
    const buyEntries: historyEntry[]  = buys.map(buy => {
      const option = allOptions.find(o => o.addr === buy.token.address) as ETHOption
      const amount = toTokenUnitsBN(buy.oTokensToBuy, option.decimals)
      return {
        type: 'Buy',
        amount,
        price: (new BigNumber(buy.premiumPaid).div(new BigNumber(buy.usdcPrice))).div(amount),
        timestamp: parseInt(buy.timestamp),
        txHash: buy.transactionHash
      }
    })
    // const sells = (await getUserUniswapSells(user)).filter(filterOptionsOnly)
    setRows(buyEntries)
  }, [allOptions, user])

  return (
    <>
      <DataView
        fields={['Type', 'Amount', 'Price', 'Time', 'Total']}
        entries={rows}
        entriesPerPage={8}
        tableRowHeight={45}
        renderEntry={({ type, price, amount, timestamp, txHash }:historyEntry) => [
          type,
          amount?.toFixed(2),
          price.toNumber(),
          <Timer start={new Date(timestamp*1000)}/>,
          <TransactionBadge transaction={txHash} />
        ]}
      />
    </>
  );
}

export default TradeHistory;

