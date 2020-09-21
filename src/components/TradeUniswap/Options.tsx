import React, {useState, useMemo} from 'react';
import BigNumber from 'bignumber.js';

import { useHistory } from 'react-router-dom'
import {
  DataView, Tabs, LinkBase
} from '@aragon/ui';

import TradeModal from './TradeModal'

import { ethOptionWithStat } from '../../types';
import { getGreeks } from './utils'
import { toTokenUnitsBN } from '../../utils/number';

type OptionBoardProps = {
  filteredOptions: ethOptionWithStat[]
  optionPrices: {
    oToken: string,
    price: BigNumber
  }[]
  underlyingSpotPrice: BigNumber,
  ethSpotPrice: BigNumber,
  balances: {
    oToken: string,
    balance: BigNumber
  }[]
};

function Options({ optionPrices, ethSpotPrice, underlyingSpotPrice, balances, filteredOptions }: OptionBoardProps) {
  const history = useHistory()

  const [selectedType, setSelectedType] = useState(0)

  const displayOptions = useMemo(()=>{
    return filteredOptions.filter((option) => (option.type === 'call') === Boolean(selectedType))
  }, [selectedType, filteredOptions]) 

  return (
    <div>
      <div style={{ display: 'flex', alignContent: 'left' }}>
        <div style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 14 }}>
          Not satisfied with the price? Create custom orders with <LinkBase onClick={() => history.push('/trade/0x')} style={{ color: 'white' }}> 0x Trade </LinkBase>
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
        entries={displayOptions}
        renderEntry={(option: ethOptionWithStat) => {

          const priceInUSD = optionPrices.find(o => o.oToken === option.addr)?.price || new BigNumber(0);
          const greeks = getGreeks(option, priceInUSD, underlyingSpotPrice)
          const balance = balances.find(b => b.oToken === option.addr)?.balance || new BigNumber(0)
          return [
            option.strikePriceInUSD,
            new Date(option.expiry * 1000).toLocaleDateString("en-US", { timeZone: "UTC" }),
            `${priceInUSD.toFixed(5)} USD`,
            toTokenUnitsBN(option.totalSupply, option.decimals)
              .div(option.type === 'call' ? option.strikePriceInUSD : 1)
              .toFixed(1),
            `${(greeks.iv * 100).toFixed(2)} %`,
            greeks.Delta,
            greeks.Gamma,
            greeks.Vega,
            greeks.Theta,
            <TradeModal oToken={option} spotPrice={ethSpotPrice} balance={balance} />
          ];
        }}
      />
    </div>
  );
}



export default Options;
