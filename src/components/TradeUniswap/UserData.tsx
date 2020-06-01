import React, { useState } from 'react';
import BigNumber from 'bignumber.js'

import { Tabs, Help } from '@aragon/ui'

import Positions from './MyPositions'
import Balances from './Balances'
import History from './TradeHistory'

import { Comment } from '../common'

import * as types from '../../types'
import { getPreference, storePreference } from '../../utils/storage'

type UserDataProps = {
  user: string,
  allOptions: types.ethOptionWithStat[]
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

function UserData({ user, spotPrice, tokenPrices, balances, allOptions }: UserDataProps) {

  const [selectedTab, setSelectedTab] = useState(parseInt(getPreference('greekboardtab', '0')))
  
  return (
    <>
      <div style={{display: 'flex', alignContent: 'left'}}> 
        <div style={{ display:'flex', marginLeft: 'auto', opacity: 0.5, fontSize: 14}}>
          *Call option amounts already devided by strike price. <Help hint="why?">
            With Opyn v1, call options have the same units as USDC: you need 250 oETH call tokens + 250 USDC to get back 1 ETH. 
            To maker it clearer, all data on this page has been converted so that 1 call represent the right to buy 1 ETH.
            But notice that the amount unit in trade modal has not been updated! 
          </Help>
        </div>
      </div>
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
            allOptions={allOptions}
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
