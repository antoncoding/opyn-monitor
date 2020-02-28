import React, { Component } from 'react';

import {
  getVaults,
  getVaultsWithLiquidatable,
  getTokenBalance,
  getBalance,
  getERC20Info,
} from '../../utils/infura';

import { Split, IconCirclePlus, IconCircleMinus, Button, TextInput, Header, Box } from '@aragon/ui';

import { addETHCollateral, removeETHCollateral, burnOToken, issueOToken } from '../../utils/web3';

class ManageVault extends Component {
  state = {
    isLoading: true,
    vault: {},
    tokenDecimal: 0,
    tokenSymbol: 'oToken',

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
    const [ownerBalance, tokenInfo, ethBalance] = await Promise.all([
      getTokenBalance(token, owner),
      getERC20Info(token),
      getBalance(owner),
    ]);
    const tokenBalance = ownerBalance / 10 ** tokenInfo.decimals;
    this.setState({ 
      vault, 
      tokenBalance, 
      ethBalance, 
      tokenDecimal: tokenInfo.decimals, 
      tokenSymbol: tokenInfo.symbol
    });

    this.intervalID = setTimeout(this.updateInfo.bind(this), 15000);
  };

  render() {
    const isOwner = this.props.user === this.props.owner

    return (
      <>
        <Header primary={
           isOwner ? 'Manage Your Vault' : 'Vault Detail'
        } />
        <Box heading={'Balance'}>
          <Split
            primary={balanceBlock('ETH', this.state.ethBalance)}
            secondary={balanceBlock(this.state.tokenSymbol, this.state.tokenBalance)}
          />
        </Box>

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
                        removeETHCollateral(
                          this.props.token,
                          this.state.collateralAmt
                        );
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
  return (
    <>
      <div style={{ fontSize: 14, padding: 3 }}> {asset} </div>
      <div style={{ fontSize: 24, padding: 3 }}>{balance}</div>
    </>
  );
};

export default ManageVault;
