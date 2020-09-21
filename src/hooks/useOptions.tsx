import { useState, useEffect } from 'react'
import useAsyncMemo from './useAsyncMemo'

import BigNumber from 'bignumber.js';

import * as types from '../types';
import { getAllOptions, getUniswapExchanges, optionTheGraph } from '../utils/graph';
import { getUniswapExchangeAddress, getERC20Symbol, getERC20Name } from '../utils/infura';
import { knownTokens, COMP, BAL, USDC, OPYN_ETH, WETH, YFI, CRV, UNI } from '../constants/tokens';
import { blackList } from '../constants/options'
import { EMPTY_EXCHANGE } from '../constants/contracts';

import { getPreference, storePreference } from '../utils/storage';

import Promise from 'bluebird';

// const tokens = [USDC, OPYN_ETH, cDAI, cUSDC, CurveFi, WETH, DAI, yDAI, aUSDC, COMP];
const ERC20InfoAndExchangeKey = 'ERC20InfoAndExchanges';

// Only accept comp or bal options to show in "Other options"
export const isValidAsset = (token) => 
  token === COMP || 
  token === BAL || 
  token === YFI || 
  token === CRV || 
  token === UNI;

type storedERC20Info = {
  address: string;
  name: string;
  symbol: string;
  uniswapExchange: string;
};

export const useOptions = () => {

  const [isInitializing, setInitializing] = useState(true)
  const [options, setOptions] = useState<types.optionWithStat[]>([])
  const [insurances, setInsurances] = useState<types.optionWithStat[]>([])
  const [ethPuts, setEthPuts] = useState<types.ethOptionWithStat[]>([])
  const [ethCalls, setEthCalls] = useState<types.ethOptionWithStat[]>([])
  const [otherPuts, setOtherPuts] = useState<types.ethOptionWithStat[]>([])
  const [otherCalls, setOtherCalls] = useState<types.ethOptionWithStat[]>([])

  const InitData =  useAsyncMemo <{
    insurances: types.optionWithStat[];
    ethPuts: types.ethOptionWithStat[];
    ethCalls: types.ethOptionWithStat[];
    otherPuts: types.ethOptionWithStat[];
    otherCalls: types.ethOptionWithStat[];
  } | null > (
    async() => {
      return await initOptions()
    }, 
    null, [])

  useEffect(() => {
    let isCancelled = false

    if (!isCancelled && InitData){ 
      setOptions(InitData.insurances.concat(InitData.ethCalls).concat(InitData.ethPuts).concat(InitData.otherPuts).concat(InitData.otherCalls))
      setInsurances(InitData.insurances)
      setEthCalls(InitData.ethCalls)
      setEthPuts(InitData.ethPuts)
      setOtherPuts(InitData.otherPuts)
      setOtherCalls(InitData.otherCalls)
      setInitializing(false)
    }

    return () => {
      isCancelled = true
    }
  }, [InitData])

  return {options, insurances, ethPuts, ethCalls, otherPuts, otherCalls, isInitializing}
}

/**
 * Called once when website is loaded.
 */
const initOptions = async (): Promise<{
  insurances: types.optionWithStat[];
  ethPuts: types.optionWithStat[];
  ethCalls: types.optionWithStat[];
  otherPuts: types.optionWithStat[];
}> => {
  const storedErc20InfoAndExchanges: storedERC20Info[] = JSON.parse(
    getPreference(ERC20InfoAndExchangeKey, '[]')
  );

  // get options from the graph
  const alloptions = formatOptionsFromTheGraph(await getAllOptions());

  // get all uniswap exchanges from the graph
  const addrs = alloptions.map((o) => o.addr);
  const exchanges = await getUniswapExchanges(addrs);

  const options = await Promise.map(alloptions, async (option: basicOptionInfo) => {

    if (blackList.includes(option.addr)) return;

    const collateralToken = knownTokens.find((token) => token.addr === option.collateral);
    const strikeToken = knownTokens.find((token) => token.addr === option.strike);
    const underlyingToken = knownTokens.find((token) => token.addr === option.underlying);

    if (!collateralToken || !strikeToken || !underlyingToken) {
      return;
    }

    let _exchange = exchanges.find((exchange) => exchange.tokenAddress === option.addr);

    if (option.addr === '0xddac4aed7c8f73032b388efe2c778fc194bc81ed' && _exchange) {
      _exchange.tokenName = 'Opyn cDai Insurance (Old)';
    }

    // The graph doesn't have exchagne record.  (probabaly because it's newly created).
    // Check Local storage or query Infura instead.
    if (_exchange === undefined) {
      const storedInfo = storedErc20InfoAndExchanges.find((entry) => entry.address === option.addr);
      if (option.addr === '0xbaf6cfa199fbbe8a9e5198f2af20040c5e7b0333' && storedInfo) {
        storedInfo.name = 'Opyn ETH Call 1/250th share 06/26/20'
      }
      if (storedInfo !== undefined) {
        _exchange = {
          id: storedInfo.uniswapExchange,
          tokenAddress: option.addr,
          tokenName: storedInfo.name,
          tokenSymbol: storedInfo.symbol,
        };
      } else {
        // Query Infura
        const uniswapExchange = await getUniswapExchangeAddress(option.addr);
        // no exchange: ignore.
        if (uniswapExchange === EMPTY_EXCHANGE) {
          return;
        }

        const name = await getERC20Name(option.addr);
        const symbol = await getERC20Symbol(option.addr);

        storedErc20InfoAndExchanges.push({
          address: option.addr,
          name,
          symbol,
          uniswapExchange,
        });

        _exchange = {
          id: uniswapExchange,
          tokenAddress: option.addr,
          tokenName: name,
          tokenSymbol: symbol,
        };
      }
    }

    return {
      ...option,
      title: _exchange?.tokenName,
      symbol: _exchange?.tokenSymbol,
      name: _exchange?.tokenName,
      uniswapExchange: _exchange?.id,

      type: 'insurance',

      collateral: collateralToken,
      underlying: underlyingToken,
      strike: strikeToken,
    };
  }).filter((o) => o);

  storePreference(ERC20InfoAndExchangeKey, JSON.stringify(storedErc20InfoAndExchanges));

  return categorizeOptions(options);
};

/**
 * Convert options into insurnace, puts, and calls
 * @param options
 */
const categorizeOptions = (
  options: types.optionWithStat[]
): {
  insurances: types.optionWithStat[];
  ethPuts: types.ethOptionWithStat[];
  ethCalls: types.ethOptionWithStat[];
  otherPuts: types.ethOptionWithStat[];
  otherCalls: types.ethOptionWithStat[];
} => {
  const insurances: types.optionWithStat[] = [];
  const ethPuts: types.ethOptionWithStat[] = [];
  const ethCalls: types.ethOptionWithStat[] = [];
  const otherPuts: types.ethOptionWithStat[] = [];
  const otherCalls: types.ethOptionWithStat[] = [];

  options.forEach((option) => {
    if (option.name === '') return;
    if (option.collateral === USDC && option.strike === USDC && option.underlying === WETH) {
      const strikePriceInUSD = parseStrikePriceUSDCFromName(option, 'put')
      const put = {
        ...option,
        type: 'put' as 'put',
        strikePriceInUSD,
      };
      ethPuts.push(put);
    } else if (
      option.collateral === OPYN_ETH &&
      option.strike === OPYN_ETH &&
      option.underlying === USDC
    ) {
      const strikePriceInUSD = parseStrikePriceUSDCFromName(option, 'call')
      const call = {
        ...option,
        type: 'call' as 'call',
        strikePriceInUSD,
      };
      ethCalls.push(call);
    }  else if (option.collateral === USDC && option.strike === USDC && isValidAsset(option.underlying)) {
      const strikePriceInUSD = parseStrikePriceUSDCFromName(option, 'put')
      const put = {
        ...option,
        type: 'put' as 'put',
        strikePriceInUSD,
      };
      otherPuts.push(put);
    } else if (isValidAsset(option.collateral) && isValidAsset(option.strike) && option.underlying === USDC) {
      const strikePriceInUSD = parseStrikePriceUSDCFromName(option, 'call')
      const call = {
        ...option,
        type: 'call' as 'call',
        strikePriceInUSD
      }
      otherCalls.push(call)
    } else {
      if (option.underlying !== OPYN_ETH) insurances.push(option);
    }
  });

  return { insurances, ethPuts, ethCalls, otherPuts, otherCalls };
};

const parseStrikePriceUSDCFromName = (option: types.optionWithStat, type: 'call'|'put') => {
  let strikePriceInUSD = 0;
  try {
    strikePriceInUSD = parseFloat(option.name.split('$')[1].split(' ')[0]);
  } catch {
    if(type === 'call') {
      strikePriceInUSD = new BigNumber(10)
        .exponentiatedBy(option.decimals + option.underlying.decimals - option.strike.decimals )
        .div(option.strikePrice)
        .integerValue()
        .toNumber()
    } else {
      strikePriceInUSD = new BigNumber(option.strikePrice)
        .times(new BigNumber(10)
        .exponentiatedBy(option.decimals))
        .integerValue()
        .toNumber()
    }
  } finally {
    return strikePriceInUSD
  }
}

export type basicOptionInfo = {
  addr: string;
  strike: string;
  underlying: string;
  collateral: string;
  oracle: string;
  exchange: string;
  minRatio: number;
  decimals: number;
  strikePrice: number;
  expiry: number;
  totalCollateral: BigNumber;
  totalExercised: BigNumber;
  totalSupply: BigNumber;
};

const formatOptionsFromTheGraph = (data: optionTheGraph[]): basicOptionInfo[] => {
  const result = data.map((entry) => {
    return {
      addr: entry.address,
      strike: entry.strike,
      underlying: entry.underlying,
      collateral: entry.collateral,
      expiry: parseInt(entry.expiry),
      oracle: entry.oracleAddress as string,
      exchange: entry.optionsExchangeAddress as string,
      minRatio: new BigNumber(entry.minCollateralizationRatioValue)
        .times(new BigNumber(10).exponentiatedBy(new BigNumber(entry.minCollateralizationRatioExp)))
        .toNumber(),
      decimals: -1 * parseInt(entry.oTokenExchangeRateExp),

      strikePrice: new BigNumber(entry.strikePriceValue)
        .times(new BigNumber(10).exponentiatedBy(new BigNumber(entry.strikePriceExp)))
        .toNumber(),
      totalCollateral: new BigNumber(entry.totalCollateral),
      totalExercised: new BigNumber(entry.totalExercised),
      totalSupply: new BigNumber(entry.totalSupply),
    };
  });
  return result;
};
