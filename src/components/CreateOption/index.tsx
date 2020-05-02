import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import ItemsCarousel from 'react-items-carousel';
import FieldCard from './FieldCard'
import ConfirmBox from './ConfirmETHOptionBox'
import {
  Header,
  Tabs,
  IconArrowRight,
  IconArrowLeft,
  Button,
  ProgressBar,
  DateRangePicker,
  TextInput,
  useTheme
} from '@aragon/ui'
import { GroupButton, GroupButtonWrapper } from './GroupButton'
// import { Comment, SectionTitle } from '../common'

const today = new Date(new Date().toDateString())
const localOffset = today.getTimezoneOffset() * 60000; // in millisecond
const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000) + localOffset);

function CreateOption() {
  const theme = useTheme()

  // create eth series or custom option
  const [selectedTab, setSelectedTab] = useState(0)

  // put or call
  const [putOrCall, setPutOrCall] = useState<0|1>(0)
  const [americanOrEuropean, setAmOrEuro] = useState<0|1>(0)
  // strike price
  const [strikePriceForoETH, setStrikePriceForOETH] = useState<number>(200)
  const strikePriceIsValid = new BigNumber(strikePriceForoETH).mod(10).eq(0)

  const [expiration, setExpiration] = useState<Date>(tomorrow)

  const onChangeDatePicker = ({ end }: { end: Date }) => {
    const endUTCs = end.getTime() + 1 + localOffset
    const endUTC = new Date(endUTCs)
    setExpiration(endUTC)
  }

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  return (
    <>
      <Header primary="Create new option" />
      <Tabs
        items={['ETH Option Series', 'Custom Option']}
        selected={selectedTab}
        onChange={setSelectedTab}
      />
      <div
      // style={{ paddingLeft: '40px', paddingRight: '40px' }}
      >
        <ItemsCarousel
          requestToChangeActive={setActiveItemIndex}
          activeItemIndex={activeItemIndex}
          numberOfCards={1}
          rightChevron={<div style={{ margin: '20px' }}><Button label="next" icon={<IconArrowRight />} display="icon" /></div>}
          leftChevron={<Button label="prev" icon={<IconArrowLeft />} display="icon" />}
          outsideChevron={false}
          chevronWidth={40}
        >
          {/* Option Type */}
          <FieldCard
            title={'Option Type'}
            description="American or European?"
            child={
              <div style={{ width: '60%' }} >
                <GroupButtonWrapper>
                  {['American', 'European',].map((x, i) => (
                    <GroupButton theme={theme} key={x}
                      onClick={() => setAmOrEuro(i as 0 | 1)}
                      isActive={americanOrEuropean === i}>
                      {x}
                    </GroupButton>
                  ))}
                </GroupButtonWrapper>
              </div>}
          />
          {/* Call or Put */}
          <FieldCard
            title={'Option Type'}
            description="Put or Call?"
            child={
              <div style={{ width: '60%' }} >
                <GroupButtonWrapper>
                  {['Put', 'Call',].map((x, i) => (
                    <GroupButton theme={theme} key={x}
                      onClick={() => setPutOrCall(i as 0 | 1)}
                      isActive={putOrCall === i}>
                      {x}
                    </GroupButton>
                  ))}
                </GroupButtonWrapper>
              </div>}
          />
          {/* StrikePrice */}
          <FieldCard
            title={'Strike Price'}
            description="Enter Strike Price"
            child={
              <div style={{ width: '50%' }}>
                <TextInput
                  adornmentPosition="end"
                  adornment="USDC"
                  type="number"
                  value={strikePriceForoETH}
                  onChange={(e) => setStrikePriceForOETH(e.target.value)}/>
                 {
                  strikePriceIsValid
                    ? <></> 
                    : <div style={{ fontSize: 14, color: theme.warning}}> Strike price must be dividable by 10 </div>
                  } 
              </div>
            }
          />
          <FieldCard
            title={'Expiration'}
            description="Select Expiration"
            child={
              <div style={{ width: '80%' }}>
                <DateRangePicker
                  onChange={onChangeDatePicker}
                  startDate={today}
                  endDate={expiration} />
              </div>
            } />
          <ConfirmBox 
            putOrCall={putOrCall} 
            americanOrEuropean={americanOrEuropean} 
            strikePrice={strikePriceForoETH}
            strikePriceIsValid={strikePriceIsValid}
            expiration={expiration}
            />
        </ItemsCarousel>
        <ProgressBar value={(activeItemIndex) / 5} />
      </div>
    </>
  )
}


export default CreateOption