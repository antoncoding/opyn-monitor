import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Box, Header, Button, useTheme, useToast, LoadingRing } from '@aragon/ui'

import { SectionTitle, Comment } from '../common'

import CompleteCreate from './Complete'

import { deployOTokenContract, setDetail } from '../../utils/web3'

import * as types from '../../types'

type ConfirmOptionProps = {
  symbol: string,
  name: string,
  decimals: number,
  underlying: types.token,
  strike: types.token,
  collateral: types.token,
  user: string,
  americanOrEuropean: 0 | 1; // 'american' | 'european',
  strikePrice: BigNumber,
  expiration: Date,
  setProgress: Function
}

function ConfirmCustomOption(
  {
    decimals,
    symbol,
    name,
    underlying,
    strike,
    collateral,
    user,
    americanOrEuropean,
    strikePrice,
    expiration,
    setProgress
  }: ConfirmOptionProps) {
  const toast = useToast()

  const [isCreating, setIsCreating] = useState(false)
  const [isAllComplete, setAllComplete] = useState(false)
  const [isSettingDetail, setIsSettingDetail] = useState(false)

  const expiry = new BigNumber(expiration.getTime()).div(1000).toNumber()
  const window = americanOrEuropean === 0
    ? expiry
    : new BigNumber(expiry).minus(86400).toNumber()

  const [newTokenAddr, setNewTokenAddr] = useState('')


  // Create option -> Check user permission -> Set detail
  const onClickCreate = async () => {
    if (!user) {
      toast("Please connect wallet")
      return
    }
    let newTokenAddr = ''
    setIsCreating(true)
    try {
      const oToken = await deployOTokenContract(
        collateral.addr, // collateral
        -1 * collateral.decimals,
        underlying.addr, // underlying
        -1 * underlying.decimals,
        -1 * decimals, // decimals
        strikePrice.c ? strikePrice.c[0] : 1, //strike price
        strikePrice.e ? -1 * strikePrice.e : -1, // strikePrice exp
        strike.addr,
        expiry,
        window
      )
      newTokenAddr = oToken
    } catch (error) {
      setIsCreating(false)
      return
    }

    setIsCreating(false)
    setNewTokenAddr(newTokenAddr)    
    setIsSettingDetail(true)
    setProgress(0.9)
    try {
      await setDetail(newTokenAddr, symbol, name)
      setAllComplete(true)
    } catch (error) {
      console.log(error)
    }
    setIsSettingDetail(false)
    setProgress(1)
  }

  return (
    <Box>
      {
        // not created
        newTokenAddr === '' ?
          isCreating
            ? <ProcessingBox text="Creating Option..." />
            // Wait for confirm
            : <ConfirmDiv
              americanOrEuropean={americanOrEuropean}
              name={name}
              symbol={symbol}
              onClickCreate={onClickCreate}
              collateral={collateral}
              underlying={underlying}
              strike={strike}
              strikePrice={strikePrice}
            />

          // Already created
          : isSettingDetail
              ? <ProcessingBox text="Setting Detail..." />
              : <CompleteCreate address={newTokenAddr} setDetailComplete={isAllComplete} />
      }
    </Box>
  )

}

export default ConfirmCustomOption

type ConfirmDivProps = {
  collateral: types.token,
  underlying: types.token,
  strike: types.token,
  strikePrice: BigNumber,
  americanOrEuropean: 0 | 1,
  name: string,
  symbol: string
  onClickCreate: Function
}
function ConfirmDiv({ americanOrEuropean, name, symbol, onClickCreate, collateral, underlying, strike, strikePrice }: ConfirmDivProps) {
  const theme = useTheme()
  return (
    <div style={{ display: 'flex', height: 300 }}>
      <div style={{ width: '40%', paddingTop: 100, paddingLeft: 100 }}>
        <SectionTitle title="Almost done!" />
        <div style={{ paddingLeft: 5 }}><Comment text="Confirm Detail" /></div>
      </div>
      <div style={{ width: '15%', paddingTop: 60, color: theme.surfaceContentSecondary }}>
        <div>Type</div>
        <div>Name</div>
        <div>Symbol</div>
        <div>Underlying</div>
        <div>Strike</div>
        <div>Collateral</div>
      </div>
      <div style={{ width: '30%', paddingTop: 60 }}>
        <div>{americanOrEuropean ? 'European Option' : 'American Option'}</div>
        <div>{name}</div>
        <div>{symbol}</div>
        <div>{underlying.symbol}</div>
        <div>{strike.symbol}</div>
        <div>{collateral.symbol}</div>
      </div>
      <div style={{ width: '10%', paddingTop: 130 }}>
        <Button label="Create" onClick={onClickCreate}></Button>
      </div>
    </div>
  )
}

function ProcessingBox({ text }: { text: string }) {
  return (
    <div style={{ height: 300, paddingTop: 40 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        <Header primary={text} />
        <div style={{ padding: 25 }}><LoadingRing mode="half-circle" /></div>
      </div>
    </div>
  )
}