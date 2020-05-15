import React, { useEffect, useState } from 'react';
import { DataView, IdentityBadge, Box } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import * as types from '../../types'
import { toTokenUnitsBN } from '../../utils/number';

type MyPositionsProps = {
  balances: {
    oToken: string,
    balance: BigNumber
  }[]
  tokenPrices: {
    oToken: string,
    price: BigNumber
  }[]
  allOptions: types.ETHOption[]
}

type optionBalance = {
  option: types.ETHOption
  price: BigNumber
  amount: BigNumber
  value: BigNumber
}

function Balances({ tokenPrices, balances, allOptions }: MyPositionsProps) {
  
  const [rows, setRows] = useState<optionBalance[]>([])
  const [totalValueUSD, setTotalValue] = useState(new BigNumber(0))

  useEffect(()=>{
    const entries = balances
      .filter(balanceObj => balanceObj.balance.gt(0))
      .map(({balance, oToken}) => {
        const option = allOptions.find(option => option.addr === oToken) as types.ETHOption
        const amount = toTokenUnitsBN(balance, option.decimals)
          .div(option.type === 'call' ? new BigNumber(option.strikePriceInUSD) : new BigNumber(1))
        const price = tokenPrices.find(priceInfo => priceInfo.oToken === oToken)?.price || new BigNumber(0)
        const value = price?.times(amount)
        return {
          amount, price, value, option
        }
      })
    
    const totalInUSD = entries.map(b => b.value).reduce((prev, cur)=> prev.plus(cur), new BigNumber(0))
    setRows(entries)
    setTotalValue(totalInUSD)
  }, [balances, allOptions, tokenPrices])
  

  return (
    <>
      <Box heading="Total USD Value" > {totalValueUSD.toFixed(2)} USD </Box>
      <DataView
        fields={['Token', 'Balance','Price', 'Total value']}
        entries={rows}
        entriesPerPage={8}
        tableRowHeight={45}
        renderEntry={({ option, amount, price, value }: optionBalance) => [
          <IdentityBadge label={option.title} entity={option.addr} />,
          amount.toFixed(3) + (option.type === 'call' ? '*' : ''),
          price?.toFixed(2),
          value.toFixed(3) + ' USD'
        ]}
      />
    </>
  );
}

export default Balances;
