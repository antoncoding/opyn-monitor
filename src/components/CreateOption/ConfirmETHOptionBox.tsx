import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Box, Button, useTheme, useToast } from '@aragon/ui'

import { SectionTitle, Comment } from '../common'

import { USDC, OPYN_ETH } from '../../constants/tokens'

import { getOwner } from '../../utils/infura'
import { createOption, setDetail } from '../../utils/web3'

type ConfirmOptionProps = {
  putOrCall: 0 | 1; //'Put' | 'Call',
  americanOrEuropean: 0 | 1; // 'american' | 'european',
  strikePrice: number,
  expiration: Date,
  strikePriceIsValid: Boolean,
}

function ConfirmETHOption(
  {
    putOrCall,
    americanOrEuropean,
    strikePrice,
    expiration,
    strikePriceIsValid
  }: ConfirmOptionProps) {
  const theme = useTheme()
  const toast = useToast()

  const type = putOrCall === 0 ? 'Put' : 'Call'
  const expiry = new BigNumber(expiration.getTime()).div(1000).toNumber()
  const window = americanOrEuropean === 0
    ? expiry
    : new BigNumber(expiry).minus(86400).toNumber()
  const name = `Opyn ETH ${type} $${strikePrice} ${FormatDate(expiration)}`
  const symbol = `oETH $${strikePrice} ${type} ${FormatDate(expiration)}`

  const [newTokenAddr, setNewTokenAddr] = useState('')

  // Create option -> Check user permission -> Set detail
  const onClickCreate = async() => {
    if (!strikePriceIsValid) {
      toast("Invalid strike price.")
      return
    }
    let newTokenAddr = ''
    let account = ''
    
    if (type === 'Put') {
      const { oToken, user } = await createOption(
        USDC.symbol, // collateral
        -1* USDC.decimals,
        OPYN_ETH.symbol, // underlying
        -1 * OPYN_ETH.decimals,
        -7, // decimals
        new BigNumber(strikePrice).div(10).integerValue().toNumber(), //strike price
        -6, // strikePrice exp
        USDC.symbol,
        expiry,
        window
      )
      
      newTokenAddr = oToken
      account = user as string
    } else { // Create a eth call
      const strikePriceNum = new BigNumber(10000000).div(strikePrice).integerValue().toNumber()
      const { oToken, user } = await createOption(
        OPYN_ETH.symbol, // collateral
        -1* OPYN_ETH.decimals,
        USDC.symbol, // underlying
        -1 * USDC.decimals,
        -7, // decimals
        strikePriceNum, //strike price
        -14, // strikePrice exp
        OPYN_ETH.symbol,
        expiry,
        window
      )
      
      newTokenAddr = oToken
      account = user as string
    }
    setNewTokenAddr(newTokenAddr)
    const owner = await getOwner(newTokenAddr)
    
    if (owner === account) {
      await setDetail(newTokenAddr, symbol, name)
    } else {
      toast("Successfully create option")
      console.log(newTokenAddr)
    }
  }

  return (
    <Box>
      <div style={{ display: 'flex', height: 300 }}>
        <div style={{ width: '40%', paddingTop: 100, paddingLeft:100}}>
          <SectionTitle title="Almost done!" />
          <div style={{ paddingLeft: 5 }}><Comment text="Confirm option detail" /></div>
        </div>
        <div style={{ width: '15%', paddingTop: 60, color: theme.info }}>
          <div>Type</div>
          <div>Name</div>
          <div>Symbol</div>
          <br></br>
          <div>Strike</div>
          <div>Underlying</div>
        </div>
        <div style={{ width: '30%', paddingTop: 60 }}>
          <div>{americanOrEuropean ? 'European' : 'American'}</div>
          <div>{name}</div>
          <div>{symbol}</div>
          <br></br>
          <div>{putOrCall === 0 ? USDC.symbol : OPYN_ETH.symbol}</div>
          <div>{putOrCall === 0 ? OPYN_ETH.symbol : USDC.symbol}</div>
        </div>
        <div style={{ width: '10%', paddingTop: 130 }}>
        <Button label="Create" onClick={onClickCreate}></Button>  
        </div>
        
      </div>
    </Box>
  )

}

export default ConfirmETHOption

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