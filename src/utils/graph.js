// const prefix = 'https://cors-anywhere-anton.herokuapp.com/';
const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn'

/**
 * @return {Promise<Array<string>>}
 */
export async function getAllVaultOwners(optionAddress){
  const query = allVaultQuery(optionAddress)
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }
  const res = await fetch(opynGraphEndpoint,  options)
  const actions = (await res.json()).data.vaultOpenedActions
  const owners = actions.map(action => action.owner)
  return owners

}

const allVaultQuery = (option_contract) =>  `
{
  vaultOpenedActions(where: {
    optionsContract: "${option_contract}"
  }) {
    owner
  }
}`