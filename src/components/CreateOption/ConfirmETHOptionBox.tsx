import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Box, Header, Button, useTheme, useToast, LoadingRing } from '@aragon/ui'

import { SectionTitle, Comment } from '../common'

import CompleteCreate from './Complete'

import { USDC, OPYN_ETH } from '../../constants/tokens'

import { setDetail, deployOTokenContract } from '../../utils/web3'

type ConfirmOptionProps = {
  user: string,
  putOrCall: 0 | 1; //'Put' | 'Call',
  americanOrEuropean: 0 | 1; // 'american' | 'european',
  strikePrice: number,
  expiration: Date,
  strikePriceIsValid: Boolean,
  setProgress: Function
}

function ConfirmETHOption(
  {
    user,
    putOrCall,
    americanOrEuropean,
    strikePrice,
    expiration,
    strikePriceIsValid,
    setProgress
  }: ConfirmOptionProps) {
  const toast = useToast()

  const [isCreating, setIsCreating] = useState(false)
  const [isSettingDetail, setIsSettingDetail] = useState(false)
  const [allComplete , setAllComplete] = useState(false)

  const type = putOrCall === 0 ? 'Put' : 'Call'
  const expiry = new BigNumber(expiration.getTime()).div(1000).toNumber()
  const window = americanOrEuropean === 0
    ? expiry
    : new BigNumber(expiry).minus(86400).toNumber()
  const name = `Opyn ETH ${type} $${strikePrice} ${FormatDate(expiration)}`
  const symbol = `oETH $${strikePrice} ${type} ${FormatDate(expiration)}`

  const [newTokenAddr, setNewTokenAddr] = useState('')


  // Create option -> Check user permission -> Set detail
  const onClickCreate = async () => {
    if (!user) {
      toast("Please connect wallet")
      return
    }
    if (!strikePriceIsValid) {
      toast("Invalid strike price.")
      return
    }
    let newTokenAddr = ''
    setIsCreating(true)
    try {
      if (type === 'Put') {
        const oToken = await deployOTokenContract(
          USDC.addr, // collateral
          -1 * USDC.decimals,
          OPYN_ETH.addr, // underlying
          -1 * OPYN_ETH.decimals,
          -7, // decimals
          new BigNumber(strikePrice).div(10).integerValue().toNumber(), //strike price
          -6, // strikePrice exp
          USDC.addr,
          expiry,
          window
        )

        newTokenAddr = oToken
      } else { // Create a eth call
        const strikePriceNum = new BigNumber(10000000).div(strikePrice).integerValue().toNumber()
        const oToken = await deployOTokenContract(
          OPYN_ETH.addr, // collateral
          -1 * OPYN_ETH.decimals,
          USDC.addr, // underlying
          -1 * USDC.decimals,
          -7, // decimals
          strikePriceNum, //strike price
          -14, // strikePrice exp
          OPYN_ETH.addr,
          expiry,
          window
        )

        newTokenAddr = oToken
      }
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
            />

          : isSettingDetail
            ? <ProcessingBox text="Setting Detail..." />
            : <CompleteCreate address={newTokenAddr} setDetailComplete={allComplete} />
      }
    </Box>
  )

}

export default ConfirmETHOption

type ConfirmDivProps = {
  americanOrEuropean: 0 | 1,
  name: string,
  symbol: string
  onClickCreate: Function
}
function ConfirmDiv({ americanOrEuropean, name, symbol, onClickCreate }: ConfirmDivProps) {
  const theme = useTheme()
  return (
    <div style={{ display: 'flex', height: 300 }}>
      <div style={{ width: '40%', paddingTop: 100, paddingLeft: 100 }}>
        <SectionTitle title="Almost done!" />
        <div style={{ paddingLeft: 5 }}><Comment text="Confirm Detail" /></div>
      </div>
      <div style={{ width: '15%', paddingTop: 100, color: theme.surfaceContentSecondary }}>
        <div>Type</div>
        <div>Name</div>
        <div>Symbol</div>
      </div>
      <div style={{ width: '30%', paddingTop: 100 }}>
        <div>{americanOrEuropean ? 'European Option' : 'American Option'}</div>
        <div>{name}</div>
        <div>{symbol}</div>
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


/**
 * Format datetime to dd/mm/yy
 * @param date 
 */
function FormatDate(date: Date) {
  var dd = date.getDate().toString();
  var mm = (date.getMonth() + 1).toString();
  var yy = date.getFullYear().toString().substr(-2);

  if (parseInt(dd) < 10) {
    dd = '0' + dd
  }
  if (parseInt(mm) < 10) {
    mm = '0' + mm
  }

  return dd + '/' + mm + '/' + yy;
}