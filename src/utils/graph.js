const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn'

export async function getAllVaultOwners(){
  const query = `{
    vaultOpenedActions(first: 100, ) {
      owner
    }
  }`
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