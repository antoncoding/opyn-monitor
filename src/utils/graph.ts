const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn';

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
  return vaults
}

/**
 * Return target vault or null
 */
export async function getVault(
  owner: string,
  option: string
): Promise<{ underlying: string; collateral: string; oTokensIssued: string, owner: string }> {
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
  return vault
  
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

export const getTotalSupplys = async (): Promise<{address:string, totalSupply: string}[]> => {
  const query = `{
    optionsContracts {
      address
      totalSupply
    }
  }`
  const response = await postQuery(query);
  return response.data.optionsContracts;
}

export const getUserOptionBalances = async(address: string) : Promise<{oToken: string, balance: string}[]> => {
  const query= `{
    accountBalances (where: {
      account: "${address}"
    }) {
      token {
        address
      }
      amount
    }
  }
  `
  const response = await postQuery(query);
  return response.data.accountBalances.map((obj: {amount: string, token: {address: string}}) => {
    return {
      oToken: obj.token.address,
      balance: obj.amount
    }});
}

export const getUserUniswapSells = async(address: string) : Promise<{ token : {address: string}, payoutTokensReceived: string, oTokensToSell: string,   payoutTokenAddress: string,   payoutTokenPrice: string,   usdcPrice: string,   timestamp: string,   transactionHash: string} []> => {
  const query= `sellOTokensActions(where: {
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
  `
  const response = await postQuery(query);
  return response.data.sellOTokensActions
}
 
export const getUserUniswapBuys = async(address: string) : Promise<{ token : {address: string }, premiumPaid: string, oTokensToBuy: string, paymentTokenAddress: string, paymentTokenPrice: string, usdcPrice: string, timestamp: string, transactionHash: string } []> => {
  const query= `{
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
  `
  const response = await postQuery(query);
  return response.data.buyOTokensActions
}


const postQuery = async (query: string) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  };
  const res = await fetch(opynGraphEndpoint, options);
  return res.json();
};
