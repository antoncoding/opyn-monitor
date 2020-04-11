import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@aragon/ui';
import styled from 'styled-components';

const BACKGROUND_COLOR = '#28334c';

function BuyAndSell({
  // theme, // string
  baseAssetSymbol, // "oETH"
  quoteAssetSymbol, // "WETH"
  collateralSymbol, // // USDC
  // baseAssetBalance, // :BigNumber,
  // quoteAssetBalance, // :BigNumber,
  // collateralBalance, // :BigNumber,
  // orders,
}) {
  const [selectedTab, setSelectedTab] = useState('Buy');

  return (
    <BuyAndSellBlock>
      <Header>
        <Wrapper>Wallet Balance</Wrapper>
      </Header>
      <Wrapper>
        <TopPart>
          <FlexWrapper>
            <div>{baseAssetSymbol}</div>
            <TopPartText>0</TopPartText>
          </FlexWrapper>
          <FlexWrapper>
            <div>{quoteAssetSymbol}</div>
            <TopPartText>0</TopPartText>
          </FlexWrapper>
        </TopPart>
      </Wrapper>
      <Header>
        <Wrapper>Collateral</Wrapper>
      </Header>
      <Wrapper>
        <FlexWrapper>
          <div>{collateralSymbol}</div>
          <TopPartText>0</TopPartText>
        </FlexWrapper>
      </Wrapper>
      <TabWrapper>
        {['Buy', 'Sell'].map((x) => (
          <Tab key={x} onClick={() => setSelectedTab(x)} active={selectedTab === x}>
            {x}
          </Tab>
        ))}
      </TabWrapper>
      <Wrapper>
        <LowerPart>
          <Label>Amount</Label>
          <Input />
          <Label>Price per token</Label>
          <Input />
          {[
            {
              label: 'Order Details',
              content: 'USD',
            },
            {
              label: 'Fee',
              content: '$1.05',
            },
            {
              label: 'Total Cost',
              content: '$590.63',
            },
          ].map((x) => (
            <BottomTextWrapper key={x.label}>
              <BottomText>{x.label}</BottomText>
              <BottomText>{x.content}</BottomText>
            </BottomTextWrapper>
          ))}
        </LowerPart>
      </Wrapper>
      <Wrapper>
        <Button label={`${selectedTab} ${baseAssetSymbol}`} wide />
      </Wrapper>
    </BuyAndSellBlock>
  );
}

BuyAndSell.propTypes = {
  // theme: PropTypes.string.isRequired,
  baseAssetSymbol: PropTypes.string.isRequired,
  quoteAssetSymbol: PropTypes.string.isRequired,
  collateralSymbol: PropTypes.string.isRequired,
};

export default BuyAndSell;

const FlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 18px 0;
`;
const BuyAndSellBlock = styled.div`
  width: 100%;
  min-height: 509px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #1f273b;
  padding-bottom: 10px;
  border-radius: 5px;
  background-color: ${BACKGROUND_COLOR};
`;
const Header = styled.div`
  width: 100%;
  height: 35px;
  border-bottom: solid 1px #1f273b;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  align-items: center;
  padding: 10px 0;
  justify-content: center;
  font-weight: bold;
`;
const TopPart = styled.div`
  margin: 10px 0;
  background-color: ${BACKGROUND_COLOR};
  min-height: 50px;
`;
const TopPartText = styled.div``;
const LowerPart = styled.div`
  background-color: ${BACKGROUND_COLOR};
`;
const Tab = styled.div`
  width: 50%;
  height: 53px;
  border: solid 1px #1f273b;
  background-color: ${(props) => (props.active ? BACKGROUND_COLOR : '#22293b')};
  color: ${(props) => (props.active ? 'white' : '#4f5e84')};
  justify-content: center;
  display: flex;
  align-items: center;
  border-bottom: ${(props) => (props.active ? `1px solid ${BACKGROUND_COLOR}` : '')};
  cursor: pointer;
`;
const Label = styled.div`
  height: 14px;
  font-size: 14px;
  color: #ffffff;
  margin: 20px 0 15px 0;
`;
const Input = styled.input`
  width: 100%;
  height: 36px;
  border-radius: 5px;
  border: solid 1px #1f273b;
  background-color: #22293b;
  padding: 10px;
`;
// const Text = styled.div`
//   width: 73px;
//   height: 14px;
//   font-size: 12px;
//   color: ${(props) => (props.active ? 'white' : '#4f5e84')};
// `;
const BottomText = styled.div`
  height: 20px;
`;
const Wrapper = styled.div`
  width: 90%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const TabWrapper = styled.div`
  width: 100%;
  display: flex;
  background-color: #1f273b;
  padding-top: 10px;
`;
const BottomTextWrapper = styled(FlexWrapper)`
  height: 27px;
  border-bottom: solid 1px #979797;
  border-bottom-style: dotted;
`;
