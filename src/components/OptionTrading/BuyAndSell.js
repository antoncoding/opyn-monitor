import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button, useTheme, TextInput, Help, useToast,
} from '@aragon/ui';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import {
  createOrder, broadcastOrders, getOrdersTotalFillables, getGasPrice, getFillAmountsOfOrders,
} from '../../utils/0x';
import { signOrder, fillOrders } from '../../utils/web3';
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

  ethBalance, // in ETH (0.5)
  baseAssetBalance,
  quoteAssetBalance,

  baseAssetDecimals,
  quoteAssetDecimals,
  collateralDecimals,
}) {
  const theme = useTheme();
  const toast = useToast();

  const [quoteAssetAmount, setQuoteAssetAmount] = useState(new BigNumber(0));
  const [fillingtakerAmounts, setFillingTakerAmounts] = useState([]);

  // these two add up to total oToken displayed on the Amount section
  const [baseAmountToFill, setBaseAmountToFill] = useState(new BigNumber(0));
  const [baseAmountToCreate, setBaseAmountToCreate] = useState(new BigNumber(0));


  const [rate, setRate] = useState(new BigNumber(0));

  // gasPrice is needed to calculate 0x fee
  const [fastGasPrice, setFastGasPrice] = useState(new BigNumber(5)); //  in GWei

  // const quoteAssetAmount = price.times(baseAssetAmount);
  const expiry = parseInt(Date.now() / 1000 + 86400, 10);

  const [selectedOrderFillables, setSelectedOrdersFillable] = useState({
    totalFillableMakerAmount: new BigNumber(0),
    totalFillableTakerAmount: new BigNumber(0),
  });

  const [isFillingAndCreating, setIsFillingAndCreating] = useState(false);

  const hasSelectedOrders = selectedOrders.length > 0;
  const feeInETH = hasSelectedOrders
    ? fastGasPrice.times(new BigNumber(selectedOrders.length)).times(new BigNumber(0.00015))
    : new BigNumber(0);

  // update gasPrice
  useEffect(() => {
    let isCanceled = false;
    async function fetchGasPrice() {
      const { fast } = await getGasPrice();
      if (!isCanceled) setFastGasPrice(new BigNumber(fast).div(new BigNumber(10)));
    }
    fetchGasPrice();
    const id = setInterval(fetchGasPrice, 30000);

    return () => {
      isCanceled = true;
      clearInterval(id);
    };
  }, []);

  // when selected orders changed
  useEffect(() => {
    // This update only take effect when user has selected orders
    if (selectedOrders.length === 0) {
      setBaseAmountToFill(new BigNumber(0));
      return;
    }
    setIsFillingAndCreating(false);

    const selectedFillables = getOrdersTotalFillables(selectedOrders);
    setFillingTakerAmounts(selectedFillables.fillableTakerAmounts);

    let baseMaxFillingAmount = new BigNumber(0);
    let quoteMaxFillingAmount = new BigNumber(0);
    // Step 1. set oToken and WETH amount to order total
    if (tradeType === 'buy') {
      // ask: takerAsset: weth, makerAsset: oToken
      baseMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableMakerAmount, baseAssetDecimals);
      quoteMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableTakerAmount, quoteAssetDecimals);
    } else {
      // comming bids: takerAsset: oToken, makerAsset: weth
      baseMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableTakerAmount, baseAssetDecimals);
      quoteMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableMakerAmount, quoteAssetDecimals);
    }
    setBaseAmountToFill(baseMaxFillingAmount);
    setBaseAmountToCreate(new BigNumber(0));
    // setBaseAssetAmount(baseMaxFillingAmount);
    setQuoteAssetAmount(quoteMaxFillingAmount);
    setSelectedOrdersFillable(selectedFillables);

    // Change Price according to total base / quote
    const aggregateRate = quoteMaxFillingAmount.div(baseMaxFillingAmount);
    setRate(aggregateRate);
  }, [selectedOrders, baseAssetDecimals, tradeType, quoteAssetDecimals]);


  const onChangeBaseAmount = (amount) => {
    // 1. Update amount field
    if (!amount) {
      setBaseAmountToFill(new BigNumber(0));
      setBaseAmountToCreate(new BigNumber(0));
      return;
    }
    const amountBN = new BigNumber(amount);
    if (amountBN.lte(0)) {
      setBaseAmountToFill(new BigNumber(0));
      setBaseAmountToCreate(new BigNumber(0));
      return;
    }

    // If is filling Mode
    if (hasSelectedOrders) {
      const totalOtokenInSelectedOrders = tradeType === 'buy'
        ? toTokenUnitsBN(selectedOrderFillables.totalFillableMakerAmount, baseAssetDecimals) // oToken is the maker asset of ask orders
        : toTokenUnitsBN(selectedOrderFillables.totalFillableTakerAmount, baseAssetDecimals);

      // user is filling lower than all orders combined
      if (totalOtokenInSelectedOrders.gte(amountBN)) {
        // [FILLING MODE]
        console.log('FILLING MODE');
        setIsFillingAndCreating(false);
        setBaseAmountToFill(amountBN);
        setBaseAmountToCreate(new BigNumber(0));

        // 1. Change selected orders
        // ## Disabled now because updating selectedOrders will trigger another useEffect, update amount again
        // const newSelectedOrders = findMinOrdersForAmount(selectedOrders, target,
        //   tradeType === 'buy' ? 'maker' : 'taker');
        // if (newSelectedOrders.length !== selectedOrders.length) {
        //   // setSelectedOrders(newSelectedOrders);
        // }

        // 2. Update Rates
        const baseAmountTotal = toBaseUnitBN(amountBN, baseAssetDecimals);

        let quoteAmountTotal;
        if (tradeType === 'buy') {
          const fillingAmounts = getFillAmountsOfOrders(selectedOrders, undefined, baseAmountTotal);
          quoteAmountTotal = fillingAmounts.sumTakerAmount;
          setFillingTakerAmounts(fillingAmounts.takerAmountArray);
        } else {
          const fillingAmounts = getFillAmountsOfOrders(selectedOrders, baseAmountTotal, undefined);
          quoteAmountTotal = fillingAmounts.sumMakerAmount;
          setFillingTakerAmounts(fillingAmounts.takerAmountArray); // only need to record taker amount array
        }

        const quoteAmountTk = toTokenUnitsBN(quoteAmountTotal, quoteAssetDecimals);
        setRate(quoteAmountTk.div(amountBN));
        setQuoteAssetAmount(quoteAmountTk);
      } else {
        // [CREATING AND FILLING MODE]
        console.log('CREATING + FILLING');
        setIsFillingAndCreating(true);

        setBaseAmountToFill(totalOtokenInSelectedOrders);
        setBaseAmountToCreate(amountBN.minus(totalOtokenInSelectedOrders));

        // Fix rate at current, dont have to change.
        const quoteAmount = rate.times(amountBN);
        setQuoteAssetAmount(quoteAmount);
      }
    } else {
      // [CREATING MODE]
      console.log('CREATING');
      setBaseAmountToFill(new BigNumber(0));
      setBaseAmountToCreate(amountBN);

      // create mode wont change rate when put in amount
      const quoteAmount = rate.times(amountBN);
      setQuoteAssetAmount(quoteAmount);
    }
  };

  const onChangeRate = (newrate) => {
    if (!newrate) {
      setRate(new BigNumber(0));
      return;
    }
    const rateBN = new BigNumber(newrate);
    setRate(rateBN);

    // adjusting rate will not be filling orders anymore
    if (hasSelectedOrders) {
      setSelectedOrders([]);
    }

    // enter create mode.
    const quoteAmount = rateBN.times((baseAmountToCreate));
    setQuoteAssetAmount(quoteAmount);
  };

  const clickCreateOrder = async () => {
    let order;
    if (tradeType === 'buy') {
      order = createOrder(
        user,
        quoteAsset,
        baseAsset,
        toBaseUnitBN(baseAmountToCreate.times(rate), quoteAssetDecimals),
        toBaseUnitBN(baseAmountToCreate, baseAssetDecimals),
        expiry,
      );
    } else {
      order = createOrder(
        user,
        baseAsset,
        quoteAsset,
        toBaseUnitBN(baseAmountToCreate, baseAssetDecimals),
        toBaseUnitBN(baseAmountToCreate.times(rate), quoteAssetDecimals),
        expiry,
      );
    }
    const signedOrder = await signOrder(order);
    try {
      await broadcastOrders([signedOrder]);
    } catch (error) {
      toast(error);
    }
  };

  const clickFillOrders = async () => {
    await fillOrders(
      selectedOrders.map((o) => o.order),
      fillingtakerAmounts,
      selectedOrders.map((o) => o.order.signature),
      toBaseUnitBN(feeInETH, 18).toString(),
      fastGasPrice.toString(),
    );
  };

  const clickFillAndCreate = async () => {
    await clickCreateOrder();
    await clickFillOrders();
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
            <div>ETH</div>
            <TopPartText>{ethBalance.toFormat(4)}</TopPartText>
          </FlexWrapper>
          <FlexWrapper>
            <div>
              <Flex>
                <p style={{ paddingRight: '5px' }}>{quoteAssetSymbol}</p>
                <Help hint="What is WETH?">
                  WETH is Wraped ETH.
                  <br />
                  You need to convert your ETH to WETH if you want to create a buy order.
                </Help>
              </Flex>
            </div>
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
            active={tradeType === 'buy'}
            onClick={() => {
              setSelectedOrders([]);
              setTradeType('buy');
            }}
            theme={theme}
          >
            Buy
          </Tab>
          <Tab
            active={tradeType === 'sell'}
            onClick={() => {
              setSelectedOrders([]);
              setTradeType('sell');
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
            value={baseAmountToCreate.plus(baseAmountToFill).toNumber()}
          />

          <Label>Price per token</Label>
          <TextInput
            wide
            type="number"
            onChange={(e) => onChangeRate(e.target.value)}
            value={rate.toNumber()}
          />

          <BottomTextWrapper>
            <BottomText>{tradeType === 'buy' ? 'Cost' : 'Earn'}</BottomText>
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
            <BottomText>{`${feeInETH} ETH` }</BottomText>
            {/* </div> */}
          </BottomTextWrapper>
          {/* <BottomTextWrapper>
            <BottomText>Total Cost</BottomText>
            <BottomText>$429</BottomText>
          </BottomTextWrapper> */}
        </LowerPart>
      </Wrapper>
      <Flex>
        { hasSelectedOrders // is filling orders
          ? isFillingAndCreating
            ? (
              <Button
                onClick={clickFillAndCreate}
                label="Fill And Create"
                wide
              />
            )
            : (
              <Button
                onClick={clickFillOrders}
                label="Fill Orders"
                wide
              />
            )
          : (
            <Button
              onClick={clickCreateOrder}
              label={tradeType === 'buy' ? 'Buy' : 'Sell'}
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

  ethBalance: PropTypes.instanceOf(BigNumber).isRequired,
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
