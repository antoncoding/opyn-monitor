import React, { useState, useMemo, useEffect } from 'react';
import { DataView, IdentityBadge } from '@aragon/ui'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import * as types from '../../types'
import { getAllVaultsForUser } from '../../utils/graph'

import { toTokenUnitsBN } from '../../utils/number';
import { getGreeks } from './utils'

type MyPositionsProps = {
  user: string,
  spotPrice: BigNumber,
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

const defaultPostitionGreeks = {Delta: 0, Gamma: 0, Theta: 0, Rho: 0, Vega:0, totalSize: 0}

function MyPositions({ user, spotPrice, tokenPrices, balances, allOptions }: MyPositionsProps) {

  const [vaults, setVaults] = useState<vault[]>([])
  const [positions, setPositions] = useState<position[]>([])
  const [aggregatedPositionGreeks, setPositionGreeks] = useState<PositionGreekType>(defaultPostitionGreeks)
  const [positionsPage, setPPage] = useState(0)
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
  }, [user, allOptions]);

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
        const bought = toTokenUnitsBN(rawBalance, option.decimals)
        const sold = toTokenUnitsBN(vault ? vault.oTokensIssued : 0, option.decimals)
        const type: "Long" | "Short" = bought.gt(sold) ? "Long" : "Short";
        const size = bought.minus(sold).abs()
        if (!size.eq(0)) {
          userPositions.push({
            option: option,
            optionPrice: price,
            type,
            PNL: new BigNumber(0),
            size: option.type === 'call' ? size.div(option.strikePriceInUSD) : size,
            ...greeks
          })
        }

      }
      setPositions(userPositions)
    })
  }, [vaults, spotPrice, tokenPrices, balances, allOptions])

  // update aggregated position greeks
  useEffect(() => {
    const positionGreeks = positions.reduce((prev, current) => {
      return {
        Delta: (prev.Delta) + current.size.times(current.Delta).toNumber(),
        Gamma: (prev.Gamma) + current.size.times(current.Gamma).toNumber(),
        Vega: (prev.Vega) + current.size.times(current.Vega).toNumber(),
        Theta: (prev.Theta) + current.size.times(current.Theta).toNumber(),
        Rho: (prev.Rho) + current.size.times(current.Rho).toNumber(),
        totalSize: (prev.totalSize) + current.size.toNumber()
      }
    }, defaultPostitionGreeks)
    setPositionGreeks(positionGreeks)
  }, [positions])

  return (
    <>
      <DataView 
        fields={['Delta', 'Gamma', 'Vega', 'Theta', 'Rho']}
        entries={[aggregatedPositionGreeks]}
        entriesPerPage={5}
        tableRowHeight={45}
        renderEntry={(p: PositionGreekType) => [
          (p.Delta / (p.totalSize)).toFixed(3),
          (p.Gamma/ (p.totalSize)).toFixed(3),
          (p.Vega/ (p.totalSize)).toFixed(3),
          (p.Theta/ (p.totalSize)).toFixed(3),
          (p.Rho/ (p.totalSize)).toFixed(3),
        ]}
      />
      <DataView
        fields={['', 'Type', 'Price', 'Size', 'Delta', 'Gamma', 'Vega', 'Theta']}
        entries={positions}
        entriesPerPage={8}
        tableRowHeight={45}
        page={positionsPage}
        onPageChange={setPPage}
        renderEntry={(p: position) => [
          <IdentityBadge
            entity={p.option.addr} label={p.option.title} />,
          <PositionType type={p.type} />,
          `${p.optionPrice.toFixed(5)} USD`,
          p.size.toFixed(3) + (p.option.type === 'call' ? '*' : ''),
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

function PositionType({ type }: { type: 'Long' | 'Short' }) {
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

type PositionGreekType = {
  Delta: number
  Gamma: number,
  Rho: number,
  Vega: number,
  Theta: number,
  totalSize: number
}