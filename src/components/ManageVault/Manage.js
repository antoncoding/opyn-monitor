import React, { Component } from 'react';

import {
  getVaults,
  getVaultsWithLiquidatable,
  getTokenBalance,
  getBalance,
  getOptionContractDetail,
  getPrice,
} from '../../utils/infura';

import { Split, IconCirclePlus, IconCircleMinus, Button, TextInput, Header, Box } from '@aragon/ui';

import { addETHCollateral, removeETHCollateral, burnOToken, issueOToken } from '../../utils/web3';

import { formatDigits } from '../../utils/common'
import { createTag } from '../TokenView/common'
class ManageVault extends Component {
  state = {
    isLoading: true,
    vault: {},
    tokenDecimal: 0,
    tokenSymbol: 'oToken',
    strikePrice: 0,
    strike: '',
    oracle: '',
    ratio: 0,
    minRatio: 1.6,

    tokenBalance: 0,
    ethBalance: 0,

    collateralAmt: 0, // input
    issueOrBurnAmt: 0, //
  };

  intervalID;

  componentDidMount() {
    this.updateInfo();
  }

  componentWillUnmount() {
    clearTimeout(this.intervalID);
  }

  updateInfo = async () => {
    const token = this.props.token;
    const owner = this.props.owner;

    const vaults = await getVaults([owner], token);
    const vault = (await getVaultsWithLiquidatable(vaults))[0];
    const [ownerBalance, optionInfo, ethBalance] = await Promise.all([
      getTokenBalance(token, owner),
      getOptionContractDetail(token),
      getBalance(owner),
    ]);

    const { decimals, symbol, strikePrice, strike, oracle, minRatio } = optionInfo;

    const tokenBalance = ownerBalance / 10 ** optionInfo.decimals;
    const ethValueInStrike = 1 / (await getPrice(oracle, strike));
    const valueProtectingInEth = parseFloat(strikePrice) * vault.oTokensIssued;
    const ratio = formatDigits((parseFloat(vault.collateral) * ethValueInStrike) / valueProtectingInEth, 5);

    this.setState({
      vault,
      tokenBalance,
      ethBalance,
      tokenDecimal: decimals,
      tokenSymbol: symbol,
      strikePrice,
      strike,
      oracle,
      minRatio,
      ratio
    });

    this.intervalID = setTimeout(this.updateInfo.bind(this), 15000);
  };

  render() {
    const isOwner = this.props.user === this.props.owner;

    return (
      <>
        <Header primary={isOwner ? 'Manage Your Vault' : 'Vault Detail'} />

        <div style={{ padding: '2%', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30%' }}>
            {balanceBlock('Owner ETH Balance', this.state.ethBalance)}
          </div>
          <div style={{ width: '50%' }}>
            {balanceBlock(`${this.state.tokenSymbol} Balance`, this.state.tokenBalance)}
          </div>
          <div style={{ width: '20%', }}>
            <>
              <div style={{ fontSize: 14, padding: 3 }}> 
                Current Ratio {
                  this.state.ratio > 0 ?
                  createTag(this.state.ratio >= this.state.minRatio, this.state.ratio) : ''
                } 
              </div>
              <div style={{ fontSize: 24, padding: 3 }}>
                <span style={{ fontSize: 24 }}>{this.state.ratio.toString().split('.')[0]}</span>.
                <span style={{ fontSize: 18 }}>{this.state.ratio.toString().split('.')[1]} </span>
                { this.state.minRatio > 0 ? <span style={{ fontSize: 16 }}> / {this.state.minRatio} </span> : '' }
                
                {/* {balance} */}
              </div>
            </>
          </div>
        </div>
        {/* </Box> */}

        <Box heading={'Collateral'}>
          <Split
            primary={
              <div style={{ paddingTop: '3%' }}>
                <Split
                  primary={
                    <TextInput
                      type='number'
                      wide={true}
                      value={this.state.collateralAmt}
                      onChange={(event) => {
                        this.setState({ collateralAmt: event.target.value });
                      }}
                    />
                  }
                  secondary={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        wide={true}
                        icon={<IconCirclePlus />}
                        label='Add'
                        onClick={() => {
                          addETHCollateral(
                            this.props.token,
                            this.props.owner,
                            this.state.collateralAmt
                          );
                        }}
                      />
                      <Button
                        wide={true}
                        icon={<IconCircleMinus />}
                        label='Remove'
                        disabled={!isOwner}
                        onClick={() => {
                          removeETHCollateral(this.props.token, this.state.collateralAmt);
                        }}
                      />
                    </div>
                  }
                />
              </div>
            }
            secondary={balanceBlock('ETH', this.state.vault.collateral)}
            invert='horizontal'
          />
        </Box>

        <Box heading={'Issued'}>
          <Split
            primary={
              <div style={{ paddingTop: '3%' }}>
                <Split
                  primary={
                    <TextInput
                      type='number'
                      wide={true}
                      value={this.state.issueOrBurnAmt}
                      onChange={(event) => {
                        this.setState({ issueOrBurnAmt: event.target.value });
                      }}
                    />
                  }
                  secondary={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        wide={true}
                        icon={<IconCirclePlus />}
                        label='Issue'
                        disabled={!isOwner}
                        onClick={() => {
                          issueOToken(
                            this.props.token,
                            handleDecimals(this.state.issueOrBurnAmt, this.state.tokenDecimal)
                          );
                        }}
                      />
                      <Button
                        wide={true}
                        icon={<IconCircleMinus />}
                        disabled={!isOwner}
                        label='Burn'
                        onClick={() => {
                          burnOToken(
                            this.props.token,
                            handleDecimals(this.state.issueOrBurnAmt, this.state.tokenDecimal)
                          );
                        }}
                      />
                    </div>
                  }
                />
              </div>
            }
            secondary={balanceBlock(
              this.state.tokenSymbol,
              this.state.vault.oTokensIssued
                ? this.state.vault.oTokensIssued / 10 ** this.state.tokenDecimal
                : 0
            )}
            invert='horizontal'
          />
        </Box>
        <Box heading={'Exchange'}></Box>
      </>
    );
  }
}

const handleDecimals = (rawAmt, decimal) => {
  return parseInt(rawAmt) * 10 ** decimal;
};

const balanceBlock = (asset, balance) => {
  let integer = '0',
    digits = '0';
  if (balance > 0) {
    const str = balance.toString();
    const split = str.split('.');
    integer = split[0];
    digits = split.length > 1 ? str.split('.')[1] : '0';
  }

  return (
    <>
      <div style={{ fontSize: 14, padding: 3 }}> {asset} </div>
      <div style={{ padding: 3 }}>
        <span style={{ fontSize: 24 }}>{integer}</span>.
        <span style={{ fontSize: 18 }}> {digits} </span>
        {/* {balance} */}
      </div>
    </>
  );
};

export default ManageVault;
