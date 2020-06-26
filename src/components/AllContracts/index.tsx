import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button, Tabs, Timer, Tag
} from '@aragon/ui';

import { Comment, CheckBox } from '../common';
import { getPreference, storePreference } from '../../utils/storage';
import { useOptions } from '../../hooks'

import * as types from '../../types'

import tracker from '../../utils/tracker';

function AllContracts() {
  useEffect(() => {
    tracker.pageview('/options/');
  }, []);

  const { isInitializing,
    insurances,
    ethCalls,
    ethPuts,
    compPuts
  } = useOptions()

  const storedOptionTab = getPreference('optionTab', '0');
  const storedShowExpired = getPreference('showExpired', '0');

  const [tabSelected, setTabSelected] = useState(parseInt(storedOptionTab, 10));
  const [showExpired, setShowExpired] = useState(storedShowExpired === '1'); // whether to show expired options
  const [insurancePage, setInsurancePage] = useState(0)

  const history = useHistory();
  const goToToken = useCallback((addr: string) => {
    history.push(`/option/${addr}`);
  }, [history]);

  return (
    <>
      <Header primary="All Contracts" />
      <div style={{ display: 'flex' }}>
        <Comment text="Choose an option contract to proceed." />
        <div style={{ marginLeft: 'auto' }}>
          <CheckBox
            text="Expired"
            onCheck={(checked) => {
              storePreference('showExpired', checked ? '1' : '0');
              setShowExpired(checked);
            }}
            checked={showExpired}
          />
        </div>
      </div>
      <Tabs
        items={['DeFi Insurance', 'ETH Options', <> Other Options <Tag> NEW </Tag> </>]}
        selected={tabSelected}
        onChange={(choice: number) => {
          setTabSelected(choice);
          storePreference('optionTab', choice.toString());
        }}
      />

      {tabSelected === 0 &&
        <DataView
          status={isInitializing ? 'loading' : 'default'}
          fields={['Contract', 'Underlying', 'Strike', 'Collateral', 'Expires in', '']}
          page={insurancePage}
          onPageChange={setInsurancePage}
          entries={insurances
            .filter((option) => showExpired || option.expiry * 1000 > Date.now())
            .sort((oa, ob) => oa.expiry > ob.expiry ? -1 : 1)
          }
          entriesPerPage={6}
          renderEntry={(option: types.option) => [
            <IdentityBadge label={option.title} entity={option.addr} />,
            <IdentityBadge label={option.underlying.symbol} entity={option.underlying.addr} />,
            <IdentityBadge label={option.strike.symbol} entity={option.strike.addr} />,
            <IdentityBadge label={option.collateral.symbol} entity={option.collateral.addr} />,
            <Timer end={new Date(option.expiry * 1000)} format='Mdh' />,
            <Button onClick={() => goToToken(option.addr)}> View Vaults </Button>,
          ]}
        />}
      {tabSelected === 1 &&
        <OptionList
        isInitializing={isInitializing}
          typeText="ETH Options"
          entries={ethCalls.concat(ethPuts)}
          showExpired={showExpired}
          goToToken={goToToken}
        />}
      {tabSelected === 2 &&
        <OptionList
          isInitializing={isInitializing}
          typeText="Other Options"
          entries={compPuts}
          showExpired={showExpired}
          goToToken={goToToken}
        />
      }

    </>
  );
}

export default AllContracts;

function OptionList({ isInitializing, entries, showExpired, goToToken, typeText }: { isInitializing:Boolean, typeText: string, entries: types.ETHOption[], showExpired: boolean, goToToken: Function }) {
  const [page, setPage] = useState(0)
  return (
    <DataView
      status={isInitializing?'loading':'default'}
      statusEmpty={<div>No {typeText} Available</div>}
      fields={['Contract', 'Strike Price', 'Expiration', 'Expires in', '']}
      entries={entries
        .filter((option) => showExpired || option.expiry * 1000 > Date.now())
        .sort((oa, ob) =>  oa.type === ob.type 
          ? oa.expiry > ob.expiry 
            ? -1 : 1 
          : oa.type === 'call' 
            ? -1 : 1)
      }
      page={page}
      onPageChange={setPage}
      entriesPerPage={6}
      renderEntry={(option: types.ETHOption) => [
        <IdentityBadge label={option.title} entity={option.addr} shorten={false} />,
        <>{option.strikePriceInUSD + ' USD'}</>,
        new Date(option.expiry * 1000).toLocaleDateString("en-US", { timeZone: "UTC" }),
        <Timer end={new Date(option.expiry * 1000)} format='dhm' />,
        <Button onClick={() => goToToken(option.addr)}> View Vaults </Button>,
      ]}
    />
  )
}