import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button, useTheme, TextInput, Help,
} from '@aragon/ui';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import {
  createOrder, broadcastOrders, getAskPrice, getOrdersTotalFillables,
} from '../../utils/0x';
import { signOrder, fillOrder } from '../../utils/web3';
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import { vault as VaultType, order as OrderType } from '../types';
// import { eth_calls } from '../../constants/options';

function BuyAndSell({
  user,
  tradeType, // ask || bid
  selectedOrders, //
  setTradeType,
  setSelectedOrders,

  vault,
  baseAsset,
  quoteAsset,

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
  const theme = useTheme();

  // const [quoteAssetAmount, setQuoteAssetAmount] = useState(new BigNumber(0));
  const [baseAssetAmount, setBaseAssetAmount] = useState(new BigNumber(0));
  const [price, setPrice] = useState(new BigNumber(0));

  const quoteAssetAmount = price.times(baseAssetAmount);
  const expiry = parseInt(Date.now() / 1000 + 86400, 10);

  const isFillingOrders = selectedOrders.length > 0;

  // selected orders
  const selectedFillables = getOrdersTotalFillables(selectedOrders);


  // when selected orders changed
  useEffect(() => {
    if (tradeType === 'bid') {
      // ask: takerAsset: weth, makerAsset: oToken

      // update amounot oToken to total order amount
      const baseAmountTotal = toTokenUnitsBN(selectedFillables.totalFillableMakerAmount, baseAssetDecimals);
      setBaseAssetAmount(baseAmountTotal);
    } else {
      // comming bids: takerAsset: oToken, makerAsset: weth

      // set oToken Amount to tatal
      const baseAmountTotal = toTokenUnitsBN(selectedFillables.totalFillableTakerAmount, baseAssetDecimals);
      setBaseAssetAmount(baseAmountTotal);
    }

    // return () => {
    //   console.log('clean up');
    // };
  }, [selectedOrders]);

  const onChangeBaseAmount = (amount) => {
    if (!amount) {
      setBaseAssetAmount(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(amount);
    setBaseAssetAmount(amountBN);

    // calculate quote asset
    // price 0.0001 WETH, amount 10 => need 0.001 weth
    // const quoteAmount = price.times(amountBN);
    // setQuoteAssetAmount(quoteAmount);
  };

  const onChangeRate = (rate) => {
    if (!rate) {
      setPrice(new BigNumber(0));
      return;
    }
    const rateBN = new BigNumber(rate);
    setPrice(rateBN);

    // const quoteAmount = rateBN.times(baseAssetAmount);
    // setQuoteAssetAmount(quoteAmount);
  };

  const createBidOrder = async () => {
    let order;
    if (tradeType === 'bid') {
      order = createOrder(
        user,
        quoteAsset,
        baseAsset,
        toBaseUnitBN(quoteAssetAmount, quoteAssetDecimals),
        toBaseUnitBN(baseAssetAmount, baseAssetDecimals),
        expiry,
      );
    } else {
      order = createOrder(
        user,
        baseAsset,
        quoteAsset,
        toBaseUnitBN(baseAssetAmount, baseAssetDecimals),
        toBaseUnitBN(quoteAssetAmount, quoteAssetDecimals),
        expiry,
      );
    }
    const signedOrder = await signOrder(order);
    await broadcastOrders([signedOrder]);
  };

  const fillOrders = async () => {
    const orderToFill = selectedOrders[0];
    let takeAmount;
    if (tradeType === 'bid') {
      // filling an ask order:
      const orderPrice = getAskPrice(selectedOrders[0], baseAssetDecimals, quoteAssetDecimals);
      const takeAmountInToken = orderPrice.times(baseAssetAmount);
      takeAmount = toBaseUnitBN(takeAmountInToken, baseAssetDecimals);
    } else {
      takeAmount = toBaseUnitBN(baseAssetAmount, baseAssetDecimals);
    }

    await fillOrder(orderToFill.order, takeAmount.toString(), orderToFill.order.signature);
  };

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
            onChange={(e) => onChangeBaseAmount(e.target.value)}
            value={baseAssetAmount.toNumber()}
          />

          <Label>Price per token</Label>
          <TextInput
            wide
            type="number"
            onChange={(e) => onChangeRate(e.target.value)}
            value={price.toNumber()}
            // disabled={isFillingOrders}
          />

          <BottomTextWrapper>
            <BottomText>{tradeType === 'bid' ? 'Cost' : 'Earn'}</BottomText>
            <BottomText>{`${quoteAssetAmount.toFixed(4)} WETH`}</BottomText>
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
            <BottomText>0 WETH</BottomText>
            {/* </div> */}
          </BottomTextWrapper>
          <BottomTextWrapper>
            <BottomText>Total Cost</BottomText>
            <BottomText>$429</BottomText>
          </BottomTextWrapper>
        </LowerPart>
      </Wrapper>
      <Flex>
        { isFillingOrders
          ? (
            <Button
              onClick={fillOrders}
              label="Fill Orders"
              wide
            />
          )
          : (
            <Button
              onClick={createBidOrder}
              label={tradeType === 'bid' ? 'Buy' : 'Sell'}
              wide
            />
          )}

      </Flex>
    </BuyAndSellBlock>
  );
}

BuyAndSell.propTypes = {
  user: PropTypes.string.isRequired,
  baseAsset: PropTypes.string.isRequired,
  quoteAsset: PropTypes.string.isRequired,
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
