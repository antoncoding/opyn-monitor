import React, { useState } from 'react';
import BigNumber from 'bignumber.js'

import { Tabs } from '@aragon/ui'

import Positions from './MyPositions'
import Balances from './Balances'
import History from './TradeHistory'

import { Comment } from '../common'

import { eth_calls, eth_puts } from '../../constants/options'
import { getPreference, storePreference } from '../../utils/storage'
const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)

type UserDataProps = {
  user: string,
  spotPrice: BigNumber
  tokenPrices: {
    oToken: string,
    price: BigNumber
  }[]
  balances: {
    oToken: string,
    balance: BigNumber
  }[]
}

function UserData({ user, spotPrice, tokenPrices, balances }: UserDataProps) {

  const [selectedTab, setSelectedTab] = useState(parseInt(getPreference('greekboardtab', '0')))
  
  return (
    <>
      <Tabs
        items={['Positions', 'Balances', 'History']}
        selected={selectedTab}
        onChange={(idx:number) => {
          setSelectedTab(idx)
          storePreference('greekboardtab', idx.toString())
        }}
      />
      {
        user === ''
          ? <Comment text="Connect wallet to see more detail"></Comment>
          : (selectedTab === 0 ? <Positions
            user={user}
            spotPrice={spotPrice}
            tokenPrices={tokenPrices}
            balances={balances}
          /> : selectedTab === 1 ? <Balances 
            balances={balances}
            tokenPrices={tokenPrices}
            allOptions={allOptions}
          /> : <History user={user} allOptions={allOptions} />
          )
      }
    </>
  );
}

export default UserData;


type balance = {
  oToken: string,
  balance: BigNumber
}