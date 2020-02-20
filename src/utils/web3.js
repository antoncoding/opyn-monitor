import Web3 from 'web3'
import { oToken as OTOKEN_ABI } from '../constants/abi'
import { notify } from './blockNative'
import { mainnet } from '../constants/addresses'
export const liquidate = async(owner, maxLiquidatable) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const ocDAIToken = new web3.eth.Contract(OTOKEN_ABI, mainnet.ocDAI)
  const userbalance = await ocDAIToken.methods.balanceOf(accounts[0]).call()
  const maxToSend = Math.min(
      parseInt(userbalance, 10), 
      parseInt(maxLiquidatable, 10)
  ).toString();
  await ocDAIToken.methods.liquidate(owner, maxToSend).send({from: accounts[0]})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}