import React, { useState } from 'react';

import {
  DataView, IdentityBadge, Button, Timer, IconProhibited
} from '@aragon/ui';

import { GoToUniswapButton, TokenIcon } from '../common';
import { noPoolList } from '../../constants/options'
import * as types from '../../types'


export function OtherOptionList({ isInitializing, entries, showExpired, goToToken }: { isInitializing:Boolean, entries: types.ETHOption[], showExpired: boolean, goToToken: Function }) {
  const [page, setPage] = useState(0)
  return (
    <DataView
      status={isInitializing?'loading':'default'}
      statusEmpty={<div>No Options Available</div>}
      fields={['Contract','Underlying', 'Strike Price', 'Expires in', '']}
      entries={entries
        .filter((option) => showExpired || option.expiry * 1000 > Date.now())
        .sort((oa, ob) =>  oa.type === ob.type 
          ? oa.expiry > ob.expiry 
            ? -1 : 1 
          : oa.type === 'call' 
            ? -1 : 1)
      }
      page={page}
      onPageChange={setPage}
      entriesPerPage={6}
      renderEntry={(option: types.ETHOption) => {
        const excahnge = noPoolList.includes(option.addr) 
          ? <div style={{width: 77}}><Button wide diabled icon={<IconProhibited/>}/> </div> 
          : <GoToUniswapButton token={option.addr} />
        return [
          <IdentityBadge label={option.title} entity={option.addr} shorten={false} />,
          option.type === 'put' ? <TokenIcon token={option.underlying}/> : <TokenIcon token={option.strike}/>,
          <>{option.strikePriceInUSD + ' USD'}</>,
          <Timer end={new Date(option.expiry * 1000)} format='dhm' />,
        <><Button onClick={() => goToToken(option.addr)}> View Vaults </Button>{excahnge}</>,
        ]}}
    />
  )
}