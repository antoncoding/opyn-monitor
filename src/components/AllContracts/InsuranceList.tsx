import React, { useState } from 'react';
import { GoToBalancerButton, GoToUniswapButton, TokenIcon, ProtocolIcon } from '../common';

import {
  DataView, IdentityBadge, Button, Timer
} from '@aragon/ui';

import * as types from '../../types'


export function InsuranceList({ isInitializing, insurances, showExpired, goToToken }: { isInitializing:Boolean, insurances: types.option[], showExpired: boolean, goToToken: Function }) {
  const [insurancePage, setInsurancePage] = useState(0)
  return (
    <DataView
          status={isInitializing ? 'loading' : 'default'}
          fields={['Contract', 'Protocol', 'Underlying', 'Collateral', 'Expires in', '']}
          page={insurancePage}
          onPageChange={setInsurancePage}
          entries={insurances
            .filter((option) => showExpired || option.expiry * 1000 > Date.now())
            .sort((oa, ob) => oa.expiry > ob.expiry ? -1 : 1)
          }
          entriesPerPage={6}
          renderEntry={(option: types.option) => {
            const isAvve = option.underlying.protocol === 'Aave'
            const Exchange  = isAvve ? <GoToBalancerButton token={option.addr} /> : <GoToUniswapButton token={option.addr} />
            return [
            <IdentityBadge label={option.title} entity={option.addr} />,
            <ProtocolIcon protocol={option.underlying.protocol}/>,
            <TokenIcon token={option.underlying}/>,
            <TokenIcon token={option.collateral}/>,
            <Timer end={new Date(option.expiry * 1000)} format='Mdh' />,
            <><Button onClick={() => goToToken(option.addr)}> View Vaults </Button>
            {Exchange}
            </>
          ]}}
        />
  )
}