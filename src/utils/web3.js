import Web3 from 'web3'
import { oToken as OTOKEN_ABI } from '../constants/abi'
import { notify } from './blockNative'

export const liquidate = async(oTokenAddr, owner, maxLiquidatable) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(OTOKEN_ABI, oTokenAddr)
  const userbalance = await oToken.methods.balanceOf(accounts[0]).call()
  const maxToSend = Math.min(
      parseInt(userbalance, 10), 
      parseInt(maxLiquidatable, 10)
  ).toString();
  
  await oToken.methods.liquidate(owner, maxToSend).send({from: accounts[0]})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}