import React, { useState, useEffect } from 'react';
import {
  Header,
  Button,
  Modal,
  Box,
  Split,
  TextInput,
  IconEthereum,
  IconConnect,
  DataView,
  useToast,
  Tag,
} from '@aragon/ui';

import { RatioTag, Comment, CustomIdentityBadge } from '../common';

import {
  liquidate,
  addERC20Collateral,
  addETHCollateral,
  kollateralLiquidate,
} from '../../utils/web3';
import { getMaxLiquidatable } from '../../utils/infura';
import { toTokenUnitsBN, toBaseUnitBN, formatDigits } from '../../utils/number';
import { KETH, DAI, USDC } from '../../constants/contracts';
import * as types from '../../types'

type VaultModalProps = {
  option: types.option,
  vault: types.vaultWithRatio,
  collateralIsETH: boolean
}

function VaultModal({
  option,
  vault,
  collateralIsETH
}: VaultModalProps) {
  const toast = useToast();
  const [opened, setOpened] = useState(false);
  const [addValue, setAddValue] = useState(0);
  const [liquidateAmt, setLiquidateAmt] = useState(0);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  useEffect(() => {
    let isCancelled = false;
    async function getData() {
      if (!opened) return;
      if (!vault.useCollateral) return;
      const maxLiquidatable = await getMaxLiquidatable(option.addr, vault.owner);
      if (!isCancelled) {
        setLiquidateAmt(toTokenUnitsBN(maxLiquidatable, option.decimals).toNumber());
      }
    }
    getData();

    return () => {
      isCancelled = true;
    };
  }, [option, opened, vault.owner, vault.useCollateral]);

  return (
    <>
      <Button onClick={open} label="More" />
      <Modal width={900} padding={50} visible={opened} onClose={close}>
        <Header primary="Access Position" />

        <DataView
          fields={['Owner', 'Collateral', 'Issued', 'ratio', 'Status']}
          entries={[vault]}
          entriesPerPage={1}
          renderEntry={(vault: types.vaultWithRatio) => [
            <CustomIdentityBadge entity={vault.owner} shorten />,
            formatDigits(toTokenUnitsBN(vault.collateral, option.collateral.decimals), 5),
            formatDigits(toTokenUnitsBN(vault.oTokensIssued, option.decimals), 5),
            formatDigits(vault.ratio, 4),
            <RatioTag isSafe={vault.isSafe} ratio={vault.ratio} useCollateral={vault.useCollateral} />
          ]}
        />

        <br />
        <Box heading="Add Collateral">
          <Split
            primary={(
              <TextInput
                type="number"
                wide
                adornment={<IconEthereum />}
                adornmentPosition="end"
                value={addValue}
                onChange={(event) => {
                  setAddValue(event.target.value);
                }}
              />
            )}
            secondary={(
              <Button
                label="Add Collateral"
                wide
                onClick={() => {
                  if (collateralIsETH) {
                    addETHCollateral(option.addr, vault.owner, addValue);
                  } else {
                    addERC20Collateral(
                      option.collateral.addr,
                      option.addr,
                      vault.owner,
                      toBaseUnitBN(addValue, option.collateral.decimals).toString(),
                    );
                  }
                }}
              />
            )}
          />
        </Box>

        {vault.useCollateral ? (
          <Box heading="Liquidate">
            <Comment text={`Liquidate with your ${option.symbol}`} />
            <Split
              primary={(
                <>
                  <TextInput
                    wide
                    type="number"
                    value={liquidateAmt}
                    onChange={(event) => {
                      setLiquidateAmt(event.target.value);
                    }}
                  />
                </>
              )}
              secondary={(
                <>
                  <Button
                    wide
                    disabled={vault.isSafe}
                    label="Liquidate"
                    onClick={() => {
                      liquidate(option.addr, vault.owner, toBaseUnitBN(liquidateAmt, option.decimals)).catch(
                        (error) => {
                          toast(error.toString());
                        },
                      );
                    }}
                  />
                </>
              )}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Comment text=" Or " />
            </div>
            <Comment text={(
              <>
                <Tag> beta </Tag>
                Liquidate with Kollateral Flashloan
              </>
              )}
            />

            <div style={{ display: 'flex' }}>
              <Button
                icon={<IconConnect />}
                label="DAI"
                disabled={vault.isSafe}
                onClick={() => {
                  kollateralLiquidate(option.addr, option.exchange, vault.owner, DAI).catch((error) => {
                    toast(error.toString());
                  });
                }}
                wide
                selected
              />
              <Button
                icon={<IconConnect />}
                label="USDC"
                disabled={vault.isSafe}
                onClick={() => {
                  kollateralLiquidate(option.addr, option.exchange, vault.owner, USDC).catch((error) => {
                    toast(error.toString());
                  });
                }}
                wide
              />
              <Button
                icon={<IconConnect />}
                label="ETH"
                disabled={vault.isSafe}
                onClick={() => {
                  kollateralLiquidate(option.addr, option.exchange, vault.owner, KETH).catch((error) => {
                    toast(error.toString());
                  });
                }}
                wide
              />
            </div>
          </Box>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
}


export default VaultModal;
