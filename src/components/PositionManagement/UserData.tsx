import React, { useState, useMemo } from 'react';
import BigNumber from 'bignumber.js'

import { Tabs } from '@aragon/ui'
import Positions from './MyPositions'
import Balances from './Balances'

import { Comment } from '../common'
import { getTokenBalance } from '../../utils/infura'

import { eth_calls, eth_puts } from '../../constants/options'
import * as types from '../../types'

const Promise = require('bluebird')
const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)

type UserDataProps = {
  user: string,
  spotPrice: BigNumber
  tokenPrices: {
    oToken: string,
    price: BigNumber
  }[]
}

function UserData({ user, spotPrice, tokenPrices }: UserDataProps) {

  const [selectedTab, setSelectedTab] = useState(0)
  const [balances, setBalances] = useState<balance[]>([])

  // update token balances for all options
  useMemo(async () => {
    if (!user) return
    const balances = await Promise.map(allOptions, async (option: types.option) => {
      const tokenBalance = await getTokenBalance(option.addr, user)
      return { oToken: option.addr, balance: new BigNumber(tokenBalance) }
    });

    setBalances(balances)
  }, [user]);

  return (
    <>
      <Tabs
        items={['Balances', 'Positions']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />
      {
        user === ''
          ? <Comment text="Connect wallet to see more detail"></Comment>
          : (selectedTab === 1 ? <Positions
            user={user}
            spotPrice={spotPrice}
            tokenPrices={tokenPrices}
            balances={balances}
          /> : <Balances 
            balances={balances}
            tokenPrices={tokenPrices}
            allOptions={allOptions}
          /> 
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