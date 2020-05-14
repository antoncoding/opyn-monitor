import React, { useState, useMemo } from 'react';
import BigNumber from 'bignumber.js';

import { useHistory } from 'react-router-dom'
import {
  DataView, DropDown, Header, Tabs, LinkBase
} from '@aragon/ui';

import TradeModal from './TradeModal'
import { eth_puts, eth_calls } from '../../constants/options';
import { ETHOption } from '../../types';

import { getGreeks } from './utils'
import { getTotalSupplys } from '../../utils/graph'
import { toTokenUnitsBN } from '../../utils/number';

const allOptions = eth_puts.concat(eth_calls).filter((option) => option.expiry > Date.now() / 1000).sort((a, b) => a > b ? 1 : -1);
const distinctExpirys = [...new Set(allOptions.map((option) => option.expiry))].sort((a, b) => a > b ? 1 : -1);

type OptionBoardProps = {
  optionPrices: {
    oToken: string,
    price: BigNumber
  }[]
  spotPrice: BigNumber,
  balances: {
    oToken: string,
    balance: BigNumber
  }[]
  ,
};

function Options({ optionPrices, spotPrice, balances }: OptionBoardProps) {
  const history = useHistory()

  const [selectedExpiryIdx, setExpiryIdx] = useState(0);
  const [selectedType, setSelectedType] = useState(0)

  const [openInterests, setOIs] = useState<{ oToken: string, totalSupply: string }[]>([])
  const [displayedOptions, setDisplayOptions] = useState<ETHOption[]>([])

  // get Open Interest (totalSupply)
  useMemo(async () => {
    const ivs = (await getTotalSupplys()).map(({ address, totalSupply }) => {
      return {
        oToken: address,
        totalSupply
      }
    });
    setOIs(ivs)
  }, [])

  // Update displayed options
  useMemo(() => {
    const displayOptions = allOptions
      .filter((option) => {
        return selectedExpiryIdx === 0 ? true : option.expiry === distinctExpirys[selectedExpiryIdx - 1]
      })
      .filter((option) => (option.type === 'call') === Boolean(selectedType))
      .sort((a, b) => a.strikePriceInUSD > b.strikePriceInUSD ? 1 : -1)
    setDisplayOptions(displayOptions)
  }, [selectedExpiryIdx, selectedType])

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Header primary="ETH Options" />
        <div style={{ paddingTop: '36px', paddingLeft: '36px' }}>
          Spot Price: {spotPrice.toFixed(2)} USD
        </div>
        <div style={{ paddingTop: '28px', paddingLeft: '36px' }}>
          <DropDown
            items={['All Dates']
              .concat(distinctExpirys.map(timestamp => new Date(timestamp * 1000).toLocaleDateString("en-US", { timeZone: "UTC" })))
            }
            selected={selectedExpiryIdx}
            onChange={setExpiryIdx}
          />
        </div>
      </div>
      <div style={{display: 'flex', alignContent: 'left'}}> 
        <div style={{marginLeft: 'auto', opacity: 0.5, fontSize: 14}}>
          Not satisfied with the price? Make your own order with <LinkBase onClick={()=>history.push('/trade/0x')} style={{color: 'white'}}> 0x Trade </LinkBase> 
        </div>
      </div>
      <Tabs
        items={['Puts', 'Calls']}
        selected={selectedType}
        onChange={setSelectedType}
      />
      <DataView
        tableRowHeight={40}
        statusEmpty={<div> {`No ${selectedType === 0 ? 'Put' : 'Call'} for this expiration date`} </div>}
        mode="table"
        fields={[
          { label: 'strike Price', align: 'start' },
          { label: 'expiry', align: 'start' },
          { label: 'price', align: 'start' },
          { label: 'Open Interest', align: 'start' },
          { label: 'IV', align: 'start' },
          { label: 'Delta', align: 'start' },
          { label: 'Gamma', align: 'start' },
          { label: 'Vega', align: 'start' },
          { label: 'Theta', align: 'start' },
          { label: ' ', align: 'end' }
        ]}
        entries={displayedOptions}
        renderEntry={(option: ETHOption) => {

          const priceInUSD = optionPrices.find(o => o.oToken === option.addr)?.price || new BigNumber(0);
          const greeks = getGreeks(option, priceInUSD, spotPrice)
          const balance = balances.find(b => b.oToken === option.addr)?.balance || new BigNumber(0)
          return [
            option.strikePriceInUSD,
            new Date(option.expiry * 1000).toLocaleDateString("en-US", { timeZone: "UTC" }),
            `${priceInUSD.toFixed(5)} USD`,
            toTokenUnitsBN(openInterests
              .find(open => open.oToken === option.addr)?.totalSupply || 0, option.decimals)
              .div(option.type === 'call' ? option.strikePriceInUSD : 1)
              .toFixed(1),
            `${(greeks.iv * 100).toFixed(2)} %`,
            greeks.Delta,
            greeks.Gamma,
            greeks.Vega,
            greeks.Theta,
            <TradeModal oToken={option} spotPrice={spotPrice} balance={balance} />
          ];
        }}
      />
    </div>
  );
}



export default Options;
