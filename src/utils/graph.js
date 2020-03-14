// const prefix = 'https://cors-anywhere-anton.herokuapp.com/';
const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn'

/**
 * @return {Promise<Array<{colalteral: string, oTokensIssued: string, owner: string}>>}
 */
export async function getAllVaultsForOption(optionAddress){
  const query = `
  {
    vaults(where: {
      optionsContract: "${optionAddress}"
    }) {
      owner
      oTokensIssued,
      collateral,
    }
  }`
  const response = await postQuery(query)
  const vaults = response.data.vaults
  return vaults
}

export async function getAllVaultsForUser(owner){
  const query = `{
    vaults (where: {owner: "${owner}"}) {
      optionsContract {
        address
      }
      oTokensIssued,
      collateral,
    }
  }`
  const response = await postQuery(query)
  const actions = response.data.vaults
  return actions
}

export async function getLiquidationHistory(owner) {
  const query = liquidationActionsQuery(owner);
  const response = await postQuery(query)
  return response.data.liquidateActions
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

`


const postQuery = async (query) => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }
  const res = await fetch(opynGraphEndpoint,  options)
  return await res.json()
}