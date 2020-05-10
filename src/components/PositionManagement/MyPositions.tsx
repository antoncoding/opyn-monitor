import React, { useState, useMemo, useEffect } from 'react';
import { Header, DataView, IdentityBadge } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import * as types from '../../types'
import { getAllVaultsForUser } from '../../utils/graph'
import { getTokenBalance } from '../../utils/infura'

import { eth_puts, eth_calls } from '../../constants/options';
import { toTokenUnitsBN } from '../../utils/number';
import { getGreeks } from './utils'

const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000).sort((a,b)=> a.expiry > b.expiry ? 1 : -1)

const Promise = require('bluebird')

type MyPositionsProps = {
  user: string, 
  spotPrice: BigNumber
  tokenPrices: {
    oToken: string,
    price: BigNumber
  }[]
}

function MyPositions({ user, spotPrice, tokenPrices }: MyPositionsProps) {

  const [vaults, setVaults] = useState<vault[]>([])
  const [balances, setBalances] = useState<balance[]>([])
  const [positions, setPositions] = useState<position[]>([])

  // Get vaults
  useMemo(async () => {
    const userVaults = await getAllVaultsForUser(user);
    const openedVaults: vault[] = [];
    allOptions.forEach((option: types.option) => {
      const entry = userVaults.find((vault) => vault.optionsContract.address === option.addr);
      if (entry !== undefined) {
        openedVaults.push({
          oToken: option.addr,
          oTokenName: option.title,
          collateral: entry.collateral,
          collateralDecimals: option.collateral.decimals,
          oTokensIssued: entry.oTokensIssued,
          expiry: option.expiry,
        });
      }
    });

    setVaults(openedVaults)
  }, [user]);

  // update token balances for all options
  useMemo(async () => {
    if (!user) return
    const balances = await Promise.map(allOptions, async (option: types.option) => {
      const tokenBalance = await getTokenBalance(option.addr, user)
      return { oToken: option.addr, balance: new BigNumber(tokenBalance) }
    });

    setBalances(balances)
  }, [user]);

  // Update positions when balance or vault change
  useEffect(() => {
    if (balances.length <= 0) return
    let userPositions: position[] = []
    allOptions.forEach((option) => {
      const rawBalance = balances.find(b => b.oToken === option.addr)?.balance || new BigNumber(0)
      const vault = vaults
        .filter(v => !new BigNumber(v.oTokensIssued).isZero())
        .find(v => v.oToken === option.addr)
      const price = tokenPrices.find(entry => entry.oToken === option.addr)?.price || new BigNumber(0)
      const greeks = getGreeks(option, price, spotPrice)
      if (vault || rawBalance.gt(0)) {
        let size = new BigNumber(0)
        let type: "Long" | "Short" = "Long"
        if (!vault && !rawBalance.isZero()) {
          // has balance: Long Position
          size = toTokenUnitsBN(rawBalance, option.decimals)
          type = 'Long'
        } else if (vault && rawBalance.isZero()) {
          size = toTokenUnitsBN(vault.oTokensIssued, option.decimals)
          type = "Short"
        } else {
          const bought = toTokenUnitsBN(rawBalance, option.decimals)
          const sold = toTokenUnitsBN((vault as vault).oTokensIssued, option.decimals)
          if (bought.gt(sold)) {
            type = "Long"
            size = bought.minus(sold)
          } else{
            type = "Short"
            size = sold.minus(bought)
          }
        }
        if (!size.eq(0)) {
          userPositions.push({
            option: option,
            optionPrice: price,
            type,
            PNL: new BigNumber(0),
            size: option.type === 'call' ? size.div(option.strikePriceInUSD) : size ,
            ...greeks
          })
        }
        
      }
      setPositions(userPositions)
    })
  }, [vaults, balances, spotPrice, tokenPrices])

  return (
    <>
      <Header primary="My Positions" />
      {/* <Accordion 
      items={[
        ['Row content', 'Expandable content'],
        [<div>2</div>, <div>Detail</div>],
      ]}/> */}
      <DataView
        fields={['','Type','Price', 'Size', 'Delta', 'Gamma', 'Vega', 'Theta']}
        entries={positions}
        entriesPerPage={5}
        tableRowHeight={50}
        renderEntry={(p: position) => [
          <IdentityBadge
            entity={p.option.addr} label={p.option.title} /> ,
          <PositionType type={p.type}/>,
          `${p.optionPrice.toFixed(5)} USD`,
          p.size.toFixed(3),
          p.Delta,
          p.Gamma,
          p.Vega,
          p.Theta
        ]}
      />

    </>
  );
}

export default MyPositions;

function PositionType({type}:{type: 'Long'|'Short'}) {
  return (
    type === 'Long' ? <Green> {type} </Green> : <Red> {type} </Red> 
  )
}

export const Green = styled.div`{
  color: #7aae1a;
}`;

export const Red = styled.div`{
  color: #da5750;
}`;

type position = {
  option: types.ETHOption,
  // name: string,
  optionPrice: BigNumber,
  // expiration: number,
  type: 'Long' | 'Short',
  size: BigNumber,
  PNL: BigNumber
} & types.greeks

type vault = {
  oToken: string,
  collateral: string,
  oTokenName: string
  collateralDecimals: number,
  oTokensIssued: string,
  expiry: number
}

type balance = {
  oToken: string,
  balance: BigNumber
}