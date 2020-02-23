// const prefix = 'https://cors-anywhere-anton.herokuapp.com/';
const opynGraphEndpoint = 'https://api.thegraph.com/subgraphs/name/aparnakr/opyn'

/**
 * @return {Promise<Array<string>>}
 */
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
  return [...new Set(owners)]

  // return ["0xfb338c5fe584c026270e5ded1c2e0aca786a22fe" ,"0x7e5ce10826ee167de897d262fcc9976f609ecd2b" ,"0xabc04058e20c9cba4f360244648fedf30cebc3b4" ,"0x97c7c0c55a4ae424e9164bbc5cf8aa139cae5eec" ,"0x78353498a7c2741d52de5ef45e58bd17148a6297" ,"0x81bb32e4a7e4d0500d11a52f3a5f60c9a6ef126c" ,"0xd4c80637f45a55b5e1afa9cd0c935395063d4523" ,"0x855328ee5e94924cb83b267f25a513c2a2fc3e5e"]
}