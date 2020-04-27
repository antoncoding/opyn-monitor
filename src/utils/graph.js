// const prefix = 'https://cors-anywhere-anton.herokuapp.com/';
const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn';

/**
 * @return {Promise<Array<{colalteral: string, oTokensIssued: string, owner: string}>>}
 */
export async function getAllVaultsForOption(optionAddress) {
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

export async function getAllVaultsForUser(owner) {
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
  const actions = response.data.vaults;
  return actions;
}

/**
 * Return target vault or null
 * @param {string} owner
 * @param {string} option
 * @return {Promise<{underlying:string, colalteral:string, oTokensIssued:string}>}
 */
export async function getVault(owner, option) {
  const query = `{
    vault(
     id: "${option.toLowerCase()}-${owner.toLowerCase()}"
    ) {
      underlying
      collateral
      oTokensIssued
    }
  }`;
  const response = await postQuery(query);
  return response.data.vault;
}

export async function getLiquidationHistory(owner) {
  const query = liquidationActionsQuery(owner);
  const response = await postQuery(query);
  return response.data.liquidateActions;
}

const liquidationActionsQuery = (owner) => `{
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
}

`;

/**
 * Get all exercise history for one user
 * @param {string} owner vault owner
 * @param {string} option contract address
 * @return {Promise<{
 * amtCollateralToPay: string,
 * exerciser:string,
 * oTokensToExercise:string,
 * timestamp:string,
 * transactionHash: string}[]>}
 */
export async function getExerciseHistory(owner, option) {
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
 * @param {string} owner
 * @param {string} option
 * @return {Promise<{
 * amount:string, timestamp:string, transactionHash:string
 * }[]>}
 */
export async function getRemoveUnderlyingHistory(owner, option) {
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

const postQuery = async (query) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  };
  const res = await fetch(opynGraphEndpoint, options);
  return res.json();
};
