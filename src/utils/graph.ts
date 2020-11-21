const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn';
const uniswapEndpoint = 'https://api.thegraph.com/subgraphs/name/graphprotocol/uniswap';
/**
 * Get vaults for one option
 */
export async function getAllVaultsForOption(
  optionAddress: string
): Promise<
  {
    collateral: string;
    oTokensIssued: string;
    owner: string;
  }[]
> {
  const query = `
  {
    vaults(where: {
      optionsContract: "${optionAddress}"
    }) {
      owner
      oTokensIssued,
      collateral,
    }
  }`;
  const response = await postQuery(query);
  const vaults = response.data.vaults;
  return vaults;
}

/**
 * Get all vaults for a user
 */
export async function getAllVaultsForUser(
  owner: string
): Promise<
  {
    optionsContract: {
      address: string;
    };
    oTokensIssued: string;
    collateral: string;
    underlying: string;
  }[]
> {
  const query = `{
    vaults (where: {owner: "${owner}"}) {
      optionsContract {
        address
      }
      oTokensIssued,
      collateral,
      underlying
    }
  }`;
  const response = await postQuery(query);
  const vaults = response.data.vaults;
  return vaults;
}

/**
 * Return target vault or null
 */
export async function getVault(
  owner: string,
  option: string
): Promise<{ underlying: string; collateral: string; oTokensIssued: string; owner: string }> {
  const query = `{
    vault(
     id: "${option.toLowerCase()}-${owner.toLowerCase()}"
    ) {
      owner
      underlying
      collateral
      oTokensIssued
    }
  }`;
  const response = await postQuery(query);
  const vault = response.data.vault;
  return vault;
}

export async function getLiquidationHistory(
  owner: string
): Promise<
  {
    vault: {
      owner: string;
      optionsContract: {
        address: string;
      };
    };
    liquidator: string;
    collateralToPay: string;
    timestamp: string;
    transactionHash: string;
  }[]
> {
  const query = `{
    liquidateActions(where: {
      vault_contains: "${owner}"
    }) {
      vault {
        owner,
        optionsContract {
          address
        }
      },
      liquidator,
      collateralToPay,
      timestamp
      transactionHash
    }
  }`;
  const response = await postQuery(query);
  return response.data.liquidateActions;
}

export async function getTotalExercised(oToken: string): Promise<string> {
  const query = `{
    optionsContract(id: "${oToken}") {
      totalExercised
    }
  }`;
  const response = await postQuery(query);
  return response.data.optionsContract.totalExercised;
}

/**
 * Get all exercise actions for 1 oToken
 */
export async function getExerciseForOption(
  oToken: string
): Promise<
  {
    amtCollateralToPay: string;
    exerciser: string;
    vault: {
      owner: string;
    };
  }[]
> {
  const query = `{
    exerciseActions (where: {
     optionsContract_contains :"${oToken}"
   }) {
     exerciser
     vault {
       owner
     }
     amtCollateralToPay
   }
 }`;
  const response = await postQuery(query);
  return response.data.exerciseActions;
}

/**
 * Get all exercise history for one user
 */
export async function getExerciseHistory(
  owner: string,
  option: string
): Promise<
  {
    amtCollateralToPay: string;
    exerciser: string;
    oTokensToExercise: string;
    timestamp: string;
    transactionHash: string;
  }[]
> {
  const query = `{
    exerciseActions (where: {
      vault_contains: "${owner}"
      optionsContract_contains: "${option}"
    }) {
      exerciser
      oTokensToExercise
      amtCollateralToPay
      transactionHash
      timestamp
    }
  }`;

  const response = await postQuery(query);
  return response.data.exerciseActions;
}

/**
 * get RemoveUnderlying Event history
 */
export async function getRemoveUnderlyingHistory(
  owner: string,
  option: string
): Promise<
  {
    amount: string;
    timestamp: string;
    transactionHash: string;
  }[]
> {
  const query = `{
    removeUnderlyingActions(
      where: {
        vault_contains: "${option}"
        owner: "${owner}"   
      }
    ) {
      timestamp
      transactionHash
      amount
    }
  }`;
  const response = await postQuery(query);
  return response.data.removeUnderlyingActions;
}

export const getTotalSupplys = async (): Promise<{ address: string; totalSupply: string }[]> => {
  const query = `{
    optionsContracts {
      address
      totalSupply
    }
  }`;
  const response = await postQuery(query);
  return response.data.optionsContracts;
};

export const getUserOptionBalances = async (
  address: string
): Promise<{ oToken: string; balance: string }[]> => {
  const query = `{
    accountBalances (where: {
      account: "${address}"
    }) {
      token {
        address
      }
      amount
    }
  }
  `;
  const response = await postQuery(query);
  return response.data.accountBalances.map(
    (obj: { amount: string; token: { address: string } }) => {
      return {
        oToken: obj.token.address,
        balance: obj.amount,
      };
    }
  );
};

export const getUserUniswapSells = async (
  address: string
): Promise<
  {
    token: { address: string };
    payoutTokensReceived: string;
    oTokensToSell: string;
    payoutTokenAddress: string;
    payoutTokenPrice: string;
    usdcPrice: string;
    timestamp: string;
    transactionHash: string;
  }[]
> => {
  const query = `{ 
    sellOTokensActions(where: {
      transactionFrom: "${address}"
    }) {
      token {
        address
      }
      oTokensToSell
      payoutTokenAddress
      payoutTokenPrice
      payoutTokensReceived
      usdcPrice
      timestamp
      transactionHash
    }
  }
  `;
  const response = await postQuery(query);
  return response.data.sellOTokensActions;
};

export const getUserUniswapBuys = async (
  address: string
): Promise<
  {
    token: { address: string };
    premiumPaid: string;
    oTokensToBuy: string;
    paymentTokenAddress: string;
    paymentTokenPrice: string;
    usdcPrice: string;
    timestamp: string;
    transactionHash: string;
  }[]
> => {
  const query = `{
    buyOTokensActions(where: {
      buyer: "${address}"
    }) {
      token {
        address
      }
      oTokensToBuy
      paymentTokenAddress
      paymentTokenPrice
      usdcPrice
      premiumPaid
      timestamp
      transactionHash
    }
  }
  `;
  const response = await postQuery(query);
  return response.data.buyOTokensActions;
};

export type optionTheGraph = {
  address: string;
  strike: string;
  underlying: string;
  collateral: string;
  oracleAddress: string;
  optionsExchangeAddress: string;
  minCollateralizationRatioValue: string;
  minCollateralizationRatioExp: string;
  oTokenExchangeRateExp: string;

  strikePriceExp: string;
  strikePriceValue: string;

  expiry: string;
  totalCollateral: string;
  totalExercised: string;
  totalSupply: string;
};

export const getAllOptions = async (): Promise<optionTheGraph[]> => {
  const query = `{
    optionsContracts (first: 1000) {
      address
      oracleAddress
      optionsExchangeAddress
      minCollateralizationRatioValue
      minCollateralizationRatioExp
      
      oTokenExchangeRateExp
      
      strikePriceExp
      strikePriceValue
      
      expiry
      collateral
      underlying
      strike
      
      totalSupply
      totalExercised
      totalCollateral
    }
  }
  `;
  const response = await postQuery(query);
  return response.data.optionsContracts;

  // return result;
};

export const getUniswapExchanges = async (
  addresses: string[]
): Promise<{ id: string; tokenAddress: string; tokenName: string; tokenSymbol: string }[]> => {
  const query = `{
    exchanges 
    (where: {
      tokenAddress_in: ${JSON.stringify(addresses)}
    }) 
    {
      id
      tokenAddress
      tokenSymbol
      tokenName
    }
  }`;
  const response = await postQuery(query, uniswapEndpoint);

  return response.data.exchanges;
};

const postQuery = async (query: string, endpoint?: string) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  };
  const url = endpoint || opynGraphEndpoint;
  const res = await fetch(url, options);
  return res.json();
};
