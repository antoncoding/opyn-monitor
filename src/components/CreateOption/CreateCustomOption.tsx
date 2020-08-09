import React from 'react'; //, { useState } from 'react'
// import BigNumber from 'bignumber.js'
// // import ItemsCarousel from 'react-items-carousel';
// import FieldCard from './FieldCard'

// import {
//   DropDown,
//   Box,
//   IconArrowRight,
//   IconArrowLeft,
//   Button,
//   ProgressBar,
//   DateRangePicker,
//   TextInput,
//   useTheme
// } from '@aragon/ui'
// import { SectionTitle, Comment } from '../common'
// import { GroupButton, GroupButtonWrapper } from './GroupButton'
// import ConfirmDetail from './ConfirmCustomOption'

// // import * as types from '../../types'
// import * as tokens from '../../constants/tokens'


// type CreateCustomOption = {
//   user: string,
//   today: Date,
//   tomorrow: Date,
//   localOffset: number
// }


function CreateCustomOption(
  // { user, today, tomorrow, localOffset }: CreateCustomOption
  ) {

  // const theme = useTheme()

  // const tokensAvailable = [tokens.OPYN_ETH, tokens.USDC, tokens.WETH, tokens.cDAI, tokens.cUSDC]

  // const [name, setName] = useState('')
  // const [symbol, setSymbol] = useState('')
  // const [decimals, setDecimals] = useState(0)

  // const [collateralIdx, setCollateralIdx] = useState<number>(0)
  // const [underlyingIdx, setUnderlyingIdx] = useState<number>(3)
  // const [strikeIdx, setStrikeIdx] = useState<number>(1)

  // const [americanOrEuropean, setAmOrEuro] = useState<0 | 1>(0)
  // // strike price
  // const [strikePrice, setStrikePrice] = useState<BigNumber>(new BigNumber(0))

  // const [expiration, setExpiration] = useState<Date>(tomorrow)

  // // index of ItemsCarousel
  // const [step, setStep] = useState(0)
  // const [progress, setProgress] = useState(0)

  // const onChangeDatePicker = ({ end }: { end: Date }) => {
  //   const endUTCs = end.getTime() + 1 + localOffset
  //   const endUTC = new Date(endUTCs)
  //   setExpiration(endUTC)
  // }

  // return (
  //   <>
  //     <ItemsCarousel
  //       requestToChangeActive={setStep}
  //       activeItemIndex={step}
  //       numberOfCards={1}
  //       rightChevron={<div style={{ margin: '20px' }}><Button label="next" icon={<IconArrowRight />} display="icon" /></div>}
  //       leftChevron={<Button label="prev" icon={<IconArrowLeft />} display="icon" />}
  //       outsideChevron={false}
  //       chevronWidth={40}
  //     >
  //       {/* Basic Info */}
  //       <Box>
  //         <div style={{ display: 'flex', padding: 100, height: 300 }}>
  //           <div style={{ width: '40%' }}>
  //             <SectionTitle title="Create New Option" />
  //             <div style={{ paddingLeft: 5 }}><Comment text="Basic Token info" /></div>
  //           </div>
  //           <div style={{ width: '60%', padding: 0, display:'flex' }}>
              
  //             <div style={{width: '100%'}}> 
  //               <div><TextInput type='text' placeholder="Token Name" value={name} onChange={(event) => setName(event.target.value)} /></div>
  //               <div><TextInput type='text' placeholder="Symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)} /></div>
  //               <div><TextInput type='number' placeholder="Decimals" value={decimals ? decimals : undefined} onChange={(event) => setDecimals(event.target.value)} /></div>
  //             </div>
              
  //           </div>
  //         </div>
  //       </Box>

  //       {/* Option Type */}
  //       <FieldCard
  //         title={'Option Type'}
  //         description="American or European?"
  //         child={
  //           <div style={{ width: '100%' }} >
  //             <GroupButtonWrapper>
  //               {['American', 'European',].map((x, i) => (
  //                 <GroupButton theme={theme} key={x}
  //                   onClick={() => setAmOrEuro(i as 0 | 1)}
  //                   isActive={americanOrEuropean === i}>
  //                   {x}
  //                 </GroupButton>
  //               ))}
  //             </GroupButtonWrapper>
  //           </div>}
  //       />
  //       {/* Underlying */}
  //       <FieldCard
  //         title={'Underlying Asset'}
  //         description="Protected asset"
  //         child={
  //           <div style={{ width: '100%' }} >
  //             <DropDown 
  //               items={tokensAvailable.map(o => o.symbol)} 
  //               selected={underlyingIdx}
  //               onChange={(idx) => setUnderlyingIdx(idx)}/>
  //           </div>}
  //       />
  //       {/* Underlying */}
  //       <FieldCard
  //         title={'Strike Asset'}
  //         description="The asset use as protection"
  //         child={
  //           <div style={{ width: '100%' }} >
  //             <DropDown items={tokensAvailable.map(o => o.symbol)}
  //             selected={strikeIdx}
  //             onChange={(idx) => setStrikeIdx(idx)}/>
  //           </div>}
  //       />

  //       {/* StrikePrice */}
  //       <FieldCard
  //         title={'Strike Price'}
  //         description="Enter Strike Price"
  //         child={
  //           <div style={{ width: '100%' }}>
  //             <TextInput
  //               adornmentPosition="end"
  //               type="number"
  //               value={strikePrice.toNumber()}
  //               onChange={(e) => setStrikePrice(e.target.value)} />
  //           </div>
  //         }
  //       />
  //       {/* Collateral */}
  //       <FieldCard
  //         title={'Collateral'}
  //         description="Set Collateral asset"
  //         child={
  //           <div style={{ width: '100%' }} >
  //             <DropDown items={tokensAvailable.map(o => o.symbol)}
  //             selected={collateralIdx}
  //             onChange={(idx) => setCollateralIdx(idx)}/>
  //           </div>}
  //       />
  //       <FieldCard
  //         title={'Expiration'}
  //         description="Choose end date to expiration date"
  //         child={
  //           <div style={{ width: '80%' }}>
  //             <DateRangePicker
  //               onChange={onChangeDatePicker}
  //               startDate={today}
  //               endDate={expiration} />
  //           </div>
  //         } />
  //       <ConfirmDetail
  //         user={user}
  //         name={name}
  //         symbol={symbol}
  //         decimals={decimals}
  //         collateral={tokensAvailable[collateralIdx]}
  //         strike={tokensAvailable[strikeIdx]}
  //         underlying={tokensAvailable[underlyingIdx]}
  //         americanOrEuropean={americanOrEuropean}
  //         strikePrice={strikePrice}
  //         expiration={expiration}
  //         setProgress={setProgress}
  //       />

  //     </ItemsCarousel>
  //     <ProgressBar value={progress ? progress : step / 7} />
  //   </>
  // )
  return (<> </>)

}

export default CreateCustomOption