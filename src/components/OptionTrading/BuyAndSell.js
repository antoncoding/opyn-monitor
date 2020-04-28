import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button, useTheme, TextInput, Help, useToast, LinkBase,
} from '@aragon/ui';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { WarningText } from '../common';
import {
  createOrder, broadcastOrders, getOrdersTotalFillables, getGasPrice, getFillAmountsOfOrders,
} from '../../utils/0x.ts';
import { signOrder, fillOrders, approve } from '../../utils/web3';
import { toTokenUnitsBN, toBaseUnitBN } from '../../utils/number';
import WrapETHPanel from './WrapETHSidePanel';

import {
  // vault as VaultType,
  order as OrderType,
  token as TokenType,
} from '../types';
import { getAllowance } from '../../utils/infura';
import { ZeroX_ERC20Proxy } from '../../constants/contracts';

import { WETH } from '../../constants/tokens';

/**
 *
 * @param {{
 * baseAsset: {addr:string, decimals: number, symbol:string}
 * quoteAsset: {addr:string, decimals: number, symbol:string}
 * collateral: {addr:string, decimals: number, symbol:string}
 * }} param0
 */
function BuyAndSell({
  user,
  tradeType, // ask || bid
  selectedOrders, //
  setTradeType,
  setSelectedOrders,

  // vault,
  baseAsset,
  quoteAsset,
  // collateral,

  // ethBalance, // in ETH (0.5)
  baseAssetBalance, // in base uinit
  quoteAssetBalance, // in base Unit
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

  const [selectedOrderFillables, setSelectedOrdersFillable] = useState({
    totalFillableMakerAmount: new BigNumber(0),
    totalFillableTakerAmount: new BigNumber(0),
  });

  const [isFillingAndCreating, setIsFillingAndCreating] = useState(false);

  const hasSelectedOrders = selectedOrders.length > 0;
  const feeInETH = hasSelectedOrders
    ? fastGasPrice.times(new BigNumber(selectedOrders.length)).times(new BigNumber(0.00015))
    : new BigNumber(0);

  // for weth side panel
  const [panelOpend, setPanelOpended] = useState(false);
  const [wethPanelHelperText, setPanelHelperText] = useState('');

  // expiry button
  const [activeButton, setActiveButton] = useState(0);
  const expirySeconds = activeButton === 0
    ? 3600 : (activeButton === 1 ? 86400 : 604800);
  const expiry = parseInt(Date.now() / 1000 + expirySeconds, 10);


  // update gasPrice
  useEffect(() => {
    let isCanceled = false;
    async function fetchGasPrice() {
      const { fast } = await getGasPrice();
      if (!isCanceled) setFastGasPrice(new BigNumber(fast).div(new BigNumber(10)));
    }
    fetchGasPrice();
    const id = setInterval(fetchGasPrice, 10000);

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
      baseMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableMakerAmount, baseAsset.decimals);
      quoteMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableTakerAmount, quoteAsset.decimals);
    } else {
      // comming bids: takerAsset: oToken, makerAsset: weth
      baseMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableTakerAmount, baseAsset.decimals);
      quoteMaxFillingAmount = toTokenUnitsBN(selectedFillables.totalFillableMakerAmount, quoteAsset.decimals);
    }
    setBaseAmountToFill(baseMaxFillingAmount);
    setBaseAmountToCreate(new BigNumber(0));
    // setBaseAssetAmount(baseMaxFillingAmount);
    setQuoteAssetAmount(quoteMaxFillingAmount);
    setSelectedOrdersFillable(selectedFillables);

    // Change Price according to total base / quote
    const aggregateRate = quoteMaxFillingAmount.div(baseMaxFillingAmount);
    setRate(aggregateRate);
  }, [selectedOrders, baseAsset, tradeType, quoteAsset]);


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
        ? toTokenUnitsBN(selectedOrderFillables.totalFillableMakerAmount, baseAsset.decimals) // oToken is the maker asset of ask orders
        : toTokenUnitsBN(selectedOrderFillables.totalFillableTakerAmount, baseAsset.decimals);

      // user is filling lower than all orders combined
      if (totalOtokenInSelectedOrders.gte(amountBN)) {
        // [FILLING MODE]
        console.log('FILLING MODE');
        setIsFillingAndCreating(false);
        setBaseAmountToFill(amountBN);
        setBaseAmountToCreate(new BigNumber(0));

        // Update Rates
        const baseAmountTotal = toBaseUnitBN(amountBN, baseAsset.decimals);

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

        const quoteAmountTk = toTokenUnitsBN(quoteAmountTotal, quoteAsset.decimals);
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
    const rateBN = new BigNumber(new BigNumber(newrate).toFixed(4));
    setRate(rateBN);

    // adjusting rate will not be filling orders anymore
    if (hasSelectedOrders) {
      setSelectedOrders([]);
    }

    // enter create mode.
    const quoteAmount = rateBN.times((baseAmountToCreate));
    setQuoteAssetAmount(quoteAmount);
  };

  const checkAndAllowQuoteAsset = async (quoteAssetAmountInBase) => {
    const quoteAllowance = new BigNumber(await getAllowance(quoteAsset.addr, user, ZeroX_ERC20Proxy));
    if (quoteAllowance.lt(quoteAssetAmountInBase)) {
      toast(`Please approve 0x to spend your oToken ${quoteAsset.symbol}`);
      await approve(quoteAsset.addr, ZeroX_ERC20Proxy);
    }
  };

  const checkQuoteAssetBalance = (quoteAssetAmountInBase) => {
    if (quoteAssetAmountInBase.gt(quoteAssetBalance)) {
      if (quoteAsset.addr === WETH.addr) {
        setPanelHelperText('You dont have enough WETH to make this order, you may need to wrap some ETH into WETH.');
        setPanelOpended(true);
        return false;
      }
      toast(`Insufficient ${quoteAsset.symbol}`);
      return false;
    }
    return true;
  };

  const checkBaseAssetBalance = (baseAssetAmountInBase) => {
    if (baseAssetAmountInBase.gt(baseAssetBalance)) {
      toast(`Insufficient ${baseAsset.symbol}`);
      return false;
    }
    return true;
  };

  const checkAndAllowBaseAsset = async (baseAssetAmountBase) => {
    const tokenAllowance = new BigNumber(await getAllowance(baseAsset.addr, user, ZeroX_ERC20Proxy));
    if (tokenAllowance.lt(baseAssetAmountBase)) {
      toast(`Please approve 0x to spend your oToken ${baseAsset.symbol}`);
      await approve(baseAsset.addr, ZeroX_ERC20Proxy);
    }
  };

  const clickCreateOrder = async () => {
    if (user === '') {
      toast('Please connect wallet first');
      return;
    }
    let order;
    if (tradeType === 'buy') {
      const quoteAssetInBaseUnit = toBaseUnitBN(baseAmountToCreate.times(rate), quoteAsset.decimals);

      // check quote asset balance
      if (!checkQuoteAssetBalance(quoteAssetInBaseUnit)) return;

      // check quote asset allowance
      await checkAndAllowQuoteAsset(quoteAssetInBaseUnit);

      // create order
      order = createOrder(
        user,
        quoteAsset.addr,
        baseAsset.addr,
        quoteAssetInBaseUnit,
        toBaseUnitBN(baseAmountToCreate, baseAsset.decimals),
        expiry,
      );
    } else {
      const baseAssetInBaseUnit = toBaseUnitBN(baseAmountToCreate, baseAsset.decimals);

      if (!checkBaseAssetBalance(baseAssetInBaseUnit)) return;

      await checkAndAllowBaseAsset(baseAssetInBaseUnit);

      order = createOrder(
        user,
        baseAsset.addr,
        quoteAsset.addr,
        baseAssetInBaseUnit,
        toBaseUnitBN(baseAmountToCreate.times(rate), quoteAsset.decimals),
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
    const takerAmountBase = fillingtakerAmounts.reduce((prev, cur) => prev.plus(new BigNumber(cur)), new BigNumber(0));
    if (tradeType === 'buy') {
      if (!checkQuoteAssetBalance(takerAmountBase)) return;
      await checkAndAllowQuoteAsset(takerAmountBase);
    } else {
      if (!checkBaseAssetBalance(takerAmountBase)) return;
      await checkAndAllowBaseAsset(takerAmountBase);
    }
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
    <>
      <BuyAndSellBlock theme={theme}>
        <Header theme={theme}>
          <Wrapper>Balance</Wrapper>
        </Header>
        <Wrapper>
          <TopPart theme={theme}>
            <FlexWrapper>
              <div>{baseAsset.symbol}</div>
              <TopPartText>{toTokenUnitsBN(baseAssetBalance, baseAsset.decimals).toFormat(4)}</TopPartText>
            </FlexWrapper>
            <FlexWrapper>
              <div>
                <Flex>
                  <p style={{ paddingRight: '5px' }}>
                    <LinkBase onClick={() => setPanelOpended(true)}>
                      {quoteAsset.symbol}
                    </LinkBase>
                  </p>
                  { quoteAsset.symbol === WETH.addr ? (
                    <Help hint="What is WETH?">
                      WETH is Wraped ETH, the erc20 version of ETH. You must have WETH to create and fill orders on 0x.
                      {' '}
                      <LinkBase onClick={() => setPanelOpended(true)}>Click here to wrap your ETH now!</LinkBase>
                    </Help>
                  ) : <></> }
                </Flex>
              </div>
              <TopPartText>{toTokenUnitsBN(quoteAssetBalance, quoteAsset.decimals).toFormat(4)}</TopPartText>
            </FlexWrapper>
          </TopPart>
          {/* <FlexWrapper>
            <div>
              Collateral (
              {collateral.symbol}
              )
            </div>
            <TopPartText>
              { vault
                ? toTokenUnitsBN(vault.collateral, collateral.decimals).toFormat(4)
                : Number(0).toFixed(4)}
            </TopPartText>
          </FlexWrapper> */}
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
            { baseAsset.symbol.toLowerCase().includes('call')
              ? <WarningText text={`Buy ${baseAsset.strikePriceInUSD} ${baseAsset.symbol} to hedge 1 ETH.`} />
              : <></> }
            <TextInput
              wide
              type="number"
              onChange={(e) => onChangeBaseAmount(e.target.value)}
              value={baseAmountToCreate.plus(baseAmountToFill).toNumber()}
              adornmentPosition="end"
              adornment={baseAsset.symbol}
            />

            <Label>Price Per Token</Label>
            <TextInput
              wide
              type="number"
              onChange={(e) => onChangeRate(e.target.value)}
              value={rate.toNumber()}
              adornmentPosition="end"
              adornment={quoteAsset.symbol}
            />

            <Label>Expires After</Label>
            <GroupButtonWrapper>
              {['1 Hour', '1 Day', '1 Week'].map((x, i) => (
                <GroupButton
                  disabled={hasSelectedOrders && !isFillingAndCreating}
                  theme={theme}
                  onClick={() => setActiveButton(i)}
                  key={x}
                  index={i}
                  isActive={activeButton === i}
                >
                  {x}
                </GroupButton>
              ))}
            </GroupButtonWrapper>

            <BottomTextWrapper>
              <BottomText>{tradeType === 'buy' ? 'Cost' : 'Premium'}</BottomText>
              <BottomText>{`${quoteAssetAmount.toFixed(4)} ${quoteAsset.symbol}`}</BottomText>
            </BottomTextWrapper>
            <BottomTextWrapper>
              <BottomText>
                <Flex>
                  <p style={{ paddingRight: '5px' }}>Fee</p>
                  <Help hint="Why am I paying?">
                    This is the protocol fee charged by 0x.
                    In addition to this, you still need to pay for gas if you are taking orders.
                  </Help>
                </Flex>
              </BottomText>
              <BottomText>{`${feeInETH} ETH` }</BottomText>
            </BottomTextWrapper>
          </LowerPart>
        </Wrapper>
        <Flex>
          { hasSelectedOrders // is filling orders
            ? isFillingAndCreating
              ? (
                <Button
                  onClick={clickFillAndCreate}
                  label="Create And Fill"
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
                label={tradeType === 'buy' ? 'Create Buy Order' : 'Create Sell Order'}
                wide
              />
            )}

        </Flex>
      </BuyAndSellBlock>
      <WrapETHPanel
        user={user}
        opened={panelOpend}
        setOpen={setPanelOpended}
        wethBalance={quoteAssetBalance}
        helperText={wethPanelHelperText}
        setHelperText={setPanelHelperText}
      />
    </>
  );
}

BuyAndSell.propTypes = {
  user: PropTypes.string.isRequired,

  // three types of tokens
  quoteAsset: TokenType.isRequired,
  baseAsset: TokenType.isRequired,
  // collateral: TokenType.isRequired,


  // ethBalance: PropTypes.instanceOf(BigNumber).isRequired,
  baseAssetBalance: PropTypes.instanceOf(BigNumber).isRequired,
  quoteAssetBalance: PropTypes.instanceOf(BigNumber).isRequired,

  // vault: VaultType,

  tradeType: PropTypes.string.isRequired,
  setTradeType: PropTypes.func.isRequired,

  selectedOrders: PropTypes.arrayOf(OrderType).isRequired,
  setSelectedOrders: PropTypes.func.isRequired,
};

// BuyAndSell.defaultProps = {
//   vault: {
//     owner: '',
//     oTokensIssued: '0',
//     collateral: '0',
//     underlying: '0',
//   },
// };

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
const GroupButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  color: ${(props) => props.theme.content};
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: center;
  border-radius: 5px;
`;
const GroupButton = styled.div`
  height: 40px;
  width: 33%;
  border: 1px solid ${(props) => props.theme.border};
  border-width: ${(props) => (props.index === 1 ? '1px 0px' : '1px')};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top-left-radius: ${(props) => (props.index === 0 ? '5px' : '0px')};
  border-bottom-left-radius: ${(props) => (props.index === 0 ? '5px' : '0px')};
  border-top-right-radius: ${(props) => (props.index === 2 ? '5px' : '0px')};
  border-bottom-right-radius: ${(props) => (props.index === 2 ? '5px' : '0px')};
  background: ${(props) => (props.disabled ? props.theme.surface
    : props.isActive ? props.theme.surfaceHighlight : props.theme.surface)} ;
  :active {
    transform: translateY(1px)
  }
`;
