import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import ItemsCarousel from 'react-items-carousel';
import FieldCard from './FieldCard'
import ConfirmBox from './ConfirmETHOptionBox'
import {
  IconArrowRight,
  IconArrowLeft,
  Button,
  ProgressBar,
  DateRangePicker,
  TextInput,
  useTheme
} from '@aragon/ui'
import { GroupButton, GroupButtonWrapper } from './GroupButton'


type CreateOETHProps = {
  user: string,
  today: Date,
  tomorrow: Date,
  localOffset: number
}

function CreateOETH({ user, today, tomorrow, localOffset }: CreateOETHProps) {

  const theme = useTheme()
  // put or call
  const [putOrCall, setPutOrCall] = useState<0|1>(0)
  const [americanOrEuropean, setAmOrEuro] = useState<0|1>(0)
  // strike price
  const [strikePriceForoETH, setStrikePriceForOETH] = useState<number>(200)
  const strikePriceIsValid = new BigNumber(strikePriceForoETH).mod(10).eq(0)

  const [expiration, setExpiration] = useState<Date>(tomorrow)

  // index of ItemsCarousel
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const onChangeDatePicker = ({ end }: { end: Date }) => {
    const endUTCs = end.getTime() + 1 + localOffset
    const endUTC = new Date(endUTCs)
    setExpiration(endUTC)
  }

  return (
    <>
      <ItemsCarousel
        requestToChangeActive={setStep}
        activeItemIndex={step}
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
            <div style={{ width: '100%' }} >
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
            <div style={{ width: '100%' }} >
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
            <div style={{ width: '100%' }}>
              <TextInput
                adornmentPosition="end"
                adornment="USDC"
                type="number"
                value={strikePriceForoETH}
                onChange={(e) => setStrikePriceForOETH(e.target.value)} />
              {
                strikePriceIsValid
                  ? <></>
                  : <div style={{ fontSize: 14, color: theme.warning }}> Strike price must be dividable by 10 </div>
              }
            </div>
          }
        />
        <FieldCard
          title={'Expiration'}
          description="Choose end date to expiration date"
          child={
            <div style={{ width: '80%' }}>
              <DateRangePicker
                onChange={onChangeDatePicker}
                startDate={today}
                endDate={expiration} />
            </div>
          } />
        <ConfirmBox
          user={user}
          putOrCall={putOrCall}
          americanOrEuropean={americanOrEuropean}
          strikePrice={strikePriceForoETH}
          strikePriceIsValid={strikePriceIsValid}
          expiration={expiration}
          setProgress={setProgress}
        />

      </ItemsCarousel>
      <ProgressBar value={progress ? progress : step / 5} />
    </>
  )

}

export default CreateOETH