// const prefix = 'https://cors-anywhere-anton.herokuapp.com/';
const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn'

/**
 * @return {Promise<Array<string>>}
 */
export async function getAllVaultOwners(optionAddress){
  const query = allVaultQuery(optionAddress)
  const response = await postQuery(query)
  const actions = response.data.vaultOpenedActions
  const owners = actions.map(action => action.owner)
  return owners
}

const allVaultQuery = (option_contract) => `
{
  vaultOpenedActions(where: {
    optionsContract: "${option_contract}"
  }) {
    owner
  }
}`

/**
 * 
 * @param {string} optionAddress 
 * @param {Array<string>} owners 
 * @return {Promise<Array<{oTokenIssued: string, collateral: string, owner: string}>>}
 */
export async function getVaultsDetails(optionAddress, owners) {
  const concatedOwners =  owners.join(`","`);
  const query = vaultDetailsQuery(optionAddress, concatedOwners)
  const response = await postQuery(query)
  const vaults = response.data.vaults
  return vaults
}

const vaultDetailsQuery = (optionAddress, owners) => `{
  vaults (where: {
    owner_in: ["${owners}"]
    optionsContract: "${optionAddress}"
  } ) {
    oTokensIssued,
    collateral,
    owner
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