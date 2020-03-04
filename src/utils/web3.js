import Web3 from 'web3'
import { notify } from './blockNative'
import { getAllowance } from './infura'
const oTokenABI = require('../constants/abi/OptionContract.json')
const exchangeABI = require('../constants/abi/OptionExchange.json')

export const getAccounts = async() => {
  const accounts = await window.ethereum.enable();
  return accounts
}

export const liquidate = async(oTokenAddr, owner, liquidateAmt) => {

  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  
  await oToken.methods.liquidate(owner, liquidateAmt).send({from: accounts[0]})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}

export const burnOToken = async(oTokenAddr, burnAmt) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  await oToken.methods.burnOTokens(burnAmt).send({from: accounts[0]})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}

export const issueOToken = async(oTokenAddr, issueAmt) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  
  await oToken.methods.issueOTokens(issueAmt, accounts[0]).send({from: accounts[0]})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}

export const addETHCollateral = async (oTokenAddr, owner, ethAmount) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  await oToken.methods.addETHCollateral(owner).send({from: accounts[0], value: web3.utils.toWei(ethAmount.toString())})
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}

export const removeETHCollateral = async (oTokenAddr, ethAmount) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  await oToken.methods.removeCollateral(web3.utils.toWei(ethAmount.toString())).send({from: accounts[0] })
    .on('transactionHash', (hash)=>{
      notify.hash(hash)
    })
}

export const approve = async(oTokenAddr, spender, amt) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  await oToken.methods.approve(spender, amt).send({from: accounts[0]})
  .on('transactionHash', (hash)=>{
    notify.hash(hash)
  })
}

export const openVault = async(oTokenAddr) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const oToken = new web3.eth.Contract(oTokenABI, oTokenAddr)
  await oToken.methods.openVault().send({from: accounts[0]})
  .on('transactionHash', (hash)=>{
    notify.hash(hash)
  })
}

// Option Exchange


export const buyOTokensFromExchange = async(oTokenAddr, exchangeAddr, buyAmt, ethAmt) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  

  const exchange = new web3.eth.Contract(exchangeABI, exchangeAddr)
  await exchange.methods.buyOTokens(
    accounts[0],
    oTokenAddr,
    '0x0000000000000000000000000000000000000000', // payment
    buyAmt,
  ).send({from: accounts[0], value: web3.utils.toWei(ethAmt.toString())})
  .on('transactionHash', (hash)=>{
    notify.hash(hash)
  })
}

export const sellOTokensFromExchange = async(oTokenAddr, exchangeAddr, sellAmt) => {
  const accounts = await window.ethereum.enable();
  const web3 = new Web3(window.ethereum);
  const allowance = await getAllowance(oTokenAddr, accounts[0], exchangeAddr)
  if (allowance < sellAmt) {
    await approve(oTokenAddr, exchangeAddr, sellAmt)
  }
  const exchange = new web3.eth.Contract(exchangeABI, exchangeAddr)
  await exchange.methods.sellOTokens(
    accounts[0],
    oTokenAddr,
    '0x0000000000000000000000000000000000000000', // payment
    sellAmt,
  ).send({from: accounts[0]})
  .on('transactionHash', (hash)=>{
    notify.hash(hash)
  })
}