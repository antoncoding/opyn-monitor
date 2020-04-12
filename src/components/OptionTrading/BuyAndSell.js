import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button, useTheme, TextInput, Help,
} from '@aragon/ui';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import { toTokenUnitsBN } from '../../utils/number';
import { vault as VaultType, order as OrderType } from '../types';

function BuyAndSell({

  tradeType, // ask || bid
  selectedOrders, //
  setTradeType,
  setSelectedOrders,

  vault,
  baseAssetSymbol, // "oETH"
  quoteAssetSymbol, // "WETH"
  collateralSymbol, // // USDC

  baseAssetBalance,
  quoteAssetBalance,

  baseAssetDecimals,
  quoteAssetDecimals,
  collateralDecimals,
  // quoteAssetBalance, // :BigNumber,
  // collateralBalance, // :BigNumber,
  // orders,
}) {
  // const [selectedTab, setSelectedTab] = useState('bid'); // 0: sell, 1: buy
  const theme = useTheme();
  // console.log(tradeType);

  const [baseAssetAmount, setBaseAssetAmount] = useState(new BigNumber(0));
  const [price, setPrice] = useState(new BigNumber(0));

  const onChangeAmount = (amount) => {
    if (!amount) {
      setBaseAssetAmount(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(amount);
    setBaseAssetAmount(amountBN);
    // updateNewRatio(new BigNumber(vault.oTokensIssued).plus(toBaseUnitBN(amountBN, decimals)));
  };

  const onChangeRate = (rate) => {
    if (!rate) {
      setPrice(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(rate);
    setPrice(amountBN);
  };

  // const [mode, setMode] = useState('create');

  return (
    <BuyAndSellBlock theme={theme}>
      <Header theme={theme}>
        <Wrapper>Balance</Wrapper>
      </Header>
      <Wrapper>
        <TopPart theme={theme}>
          <FlexWrapper>
            <div>{baseAssetSymbol}</div>
            <TopPartText>{toTokenUnitsBN(baseAssetBalance, baseAssetDecimals).toFormat(4)}</TopPartText>
          </FlexWrapper>
          <FlexWrapper>
            <div>{quoteAssetSymbol}</div>
            <TopPartText>{toTokenUnitsBN(quoteAssetBalance, quoteAssetDecimals).toFormat(4)}</TopPartText>
          </FlexWrapper>
        </TopPart>
        <FlexWrapper>
          <div>
            Collateral (
            {collateralSymbol}
            )
          </div>
          <TopPartText>
            { vault
              ? toTokenUnitsBN(vault.collateral, collateralDecimals).toFormat(4)
              : Number(0).toFixed(4)}
          </TopPartText>
        </FlexWrapper>
      </Wrapper>
      <Wrapper>
        <TabWrapper theme={theme}>
          <Tab
            active={tradeType === 'bid'}
            onClick={() => {
              setSelectedOrders([]);
              setTradeType('bid');
            }}
            theme={theme}
          >
            Buy
          </Tab>
          <Tab
            active={tradeType === 'ask'}
            onClick={() => {
              setSelectedOrders([]);
              setTradeType('ask');
            }}
            theme={theme}
          >
            Sell

          </Tab>
        </TabWrapper>
        <LowerPart>
          <Label>Amount</Label>
          <TextInput
            wide
            type="number"
            onChange={(e) => onChangeAmount(e.target.value)}
            value={baseAssetAmount}
          />

          <Label>Price per token</Label>
          <TextInput
            wide
            type="number"
            onChange={(e) => onChangeRate(e.target.value)}
            value={price}
          />

          <BottomTextWrapper>
            <BottomText>Order Cost</BottomText>
            <BottomText>0</BottomText>
          </BottomTextWrapper>
          <BottomTextWrapper>
            <BottomText>
              <Flex>
                <p style={{ paddingRight: '5px' }}>Fee</p>
                <Help hint="Why am I paying?">
                  The fee is charged by 0x.
                  The higher your gasPirce is, the higher you will be charged for.
                </Help>
              </Flex>
            </BottomText>
            {/* <div style={{ paddingLeft: '5px' }} />
            <div style={{ marginLeft: 'auto', right: 0 }}> */}
            <BottomText>$0.123</BottomText>
            {/* </div> */}
          </BottomTextWrapper>
          <BottomTextWrapper>
            <BottomText>Total cost</BottomText>
            <BottomText>$429</BottomText>
          </BottomTextWrapper>
        </LowerPart>
      </Wrapper>
      <Flex>
        <Button label={tradeType === 0 ? 'Buy' : 'Sell'} wide />
        {/* <Half><Button label="Sell" wide /></Half> */}
      </Flex>
    </BuyAndSellBlock>
  );
}

BuyAndSell.propTypes = {
  // theme: PropTypes.string.isRequired,
  baseAssetSymbol: PropTypes.string.isRequired,
  quoteAssetSymbol: PropTypes.string.isRequired,
  collateralSymbol: PropTypes.string.isRequired,

  baseAssetBalance: PropTypes.instanceOf(BigNumber).isRequired,
  quoteAssetBalance: PropTypes.instanceOf(BigNumber).isRequired,

  baseAssetDecimals: PropTypes.number.isRequired,
  quoteAssetDecimals: PropTypes.number.isRequired,
  collateralDecimals: PropTypes.number.isRequired,

  vault: VaultType,

  tradeType: PropTypes.string.isRequired,
  setTradeType: PropTypes.func.isRequired,

  selectedOrders: PropTypes.arrayOf(OrderType).isRequired,
  setSelectedOrders: PropTypes.func.isRequired,
};

BuyAndSell.defaultProps = {
  vault: {
    owner: '',
    oTokensIssued: '0',
    collateral: '0',
    underlying: '0',
  },
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
  border: 1px solid ${(props) => props.theme.border};
  padding-bottom: 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.surface};
`;
const Header = styled.div`
  width: 100%;
  height: 35px;
  font-size: 13px;
  font-family: aragon-ui;
  border-bottom: 1px solid ${(props) => props.theme.border};
  background-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.contentSecondary};
  display: flex;
  align-items: center;
  padding: 10px 0;
  justify-content: center;
  // font-weight: bold;
`;
const TopPart = styled.div`
  margin: 10px 0;
  background-color: ${(props) => props.theme.surface};
  min-height: 50px;
`;
const TopPartText = styled.div``;
const LowerPart = styled.div`
  background-color: ${(props) => props.theme.background};
`;
const Tab = styled.div`
  width: 50%;
  height: 50px;
  color: ${(props) => (props.active ? props.theme.content : props.theme.surfaceContentSecondary)};
  justify-content: center;
  display: flex;
  align-items: center;
  border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.selected}` : `1px solid ${props.theme.border}`)};
  cursor: pointer;
`;
const Label = styled.div`
  height: 14px;
  font-size: 14px;
  color: ${(props) => props.theme.content};
  margin: 20px 0 15px 0;
`;
// const Input = styled.input`
//   width: 100%;
//   height: 36px;
//   border-radius: 5px;
//   border: solid 0.5px ${(props) => props.theme.contolBorder};
//   background-color: ${(props) => props.theme.background};
//   padding: 10px;
// `;
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
const Flex = styled.div`
  display:flex;
  width: 90%;
`;
// const Half = styled.div`
//   width: 50%;
// `;
const TabWrapper = styled.div`
  width: 100%;
  display: flex;
  background-color: ${(props) => props.theme.surface};
  padding-top: 10px;
  border: ${(props) => props.theme.border}
`;
const BottomTextWrapper = styled(FlexWrapper)`
  height: 27px;
  border-bottom: solid 1px #979797;
  border-bottom-style: dotted;
`;
