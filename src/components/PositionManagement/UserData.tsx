import React, { useState } from 'react';
import BigNumber from 'bignumber.js'

import { Tabs } from '@aragon/ui'
import Positions from './MyPositions'
import Balances from './Balances'

import { Comment } from '../common'

import { eth_calls, eth_puts } from '../../constants/options'

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

  const [selectedTab, setSelectedTab] = useState(0)

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
