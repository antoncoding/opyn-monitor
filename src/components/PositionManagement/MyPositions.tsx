import React, { useState, useMemo, useEffect } from 'react';
import { Header, DataView } from '@aragon/ui'
import BigNumber from 'bignumber.js'

import * as types from '../../types'
import { getAllVaultsForUser } from '../../utils/graph'
import { getTokenBalance } from '../../utils/infura'

import { eth_puts, eth_calls } from '../../constants/options';
import { toTokenUnitsBN } from '../../utils/number';
import { getGreeks } from './utils'

const allOptions = eth_puts.concat(eth_calls).filter((o) => o.expiry > Date.now() / 1000)

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
          // has balance: short position
          size = toTokenUnitsBN(rawBalance, option.decimals)
          type = 'Short'
        } else if (vault && rawBalance.isZero()) {
          size = toTokenUnitsBN(vault.oTokensIssued, option.decimals)
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
            name: option.title,
            optionPrice: price,
            expiration: option.expiry,
            type,
            PNL: new BigNumber(0),
            size,
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
      <DataView
        fields={['','Type','Price', 'Size', 'Delta', 'Gamma', 'Vega', 'Theta']}
        entries={positions}
        entriesPerPage={5}
        renderEntry={(p: position) => [
          p.name,
          p.type,
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

type position = {
  name: string,
  optionPrice: BigNumber,
  expiration: number,
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