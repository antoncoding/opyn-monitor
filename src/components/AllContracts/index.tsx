import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button, Tabs,
} from '@aragon/ui';

import { insurances, eth_calls, eth_puts } from '../../constants/options';
import { Comment, CheckBox } from '../common';
import { getPreference, storePreference } from '../../utils/storage';

import tracker from '../../utils/tracker';

function AllContracts() {
  useEffect(() => {
    tracker.pageview('/options/');
  }, []);

  const storedOptionTab = getPreference('optionTab', '0');
  const storedShowExpired = getPreference('showExpired', '0');

  const [tabSelected, setTabSelected] = useState(parseInt(storedOptionTab, 10));
  const [showExpired, setShowExpired] = useState(storedShowExpired === '1'); // whether to show expired options

  const history = useHistory();
  const goToToken = (addr:string) => {
    history.push(`/option/${addr}`);
  };
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
        items={['DeFi Insurance', 'Put Options', 'Call Options']}
        selected={tabSelected}
        onChange={(choice:number) => {
          setTabSelected(choice);
          storePreference('optionTab', choice.toString());
        }}
      />

      {tabSelected === 0 ? (
        <DataView
          fields={['Name', 'Contract', '']}
          entries={insurances.filter((option) => showExpired || option.expiry * 1000 > Date.now())}
          entriesPerPage={6}
          renderEntry={({ addr, title }) => [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> View Vaults </Button>,
          ]}
        />
      ) : tabSelected === 1 ? (
        <DataView
          // header="Options"
          fields={['Name', 'Contract', 'Expiry', '']}
          entries={eth_puts
            .filter((option) => showExpired || option.expiry * 1000 > Date.now())
            .sort((oa, ob) =>  oa.expiry > ob.expiry ? 1 : -1 )
          }
          entriesPerPage={6}
          renderEntry={({ addr, title, expiry }: {addr:string, title:string, expiry:number}) => [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            new Date(expiry * 1000).toDateString(),
            <Button onClick={() => goToToken(addr)}> View Vaults </Button>,
          ]}
        />
      ) : ( // calls
        <DataView
          // header="Options"
          fields={['Name', 'Contract', 'Expiry', '']}
          entries={eth_calls
            .filter((option) => showExpired || option.expiry * 1000 > Date.now())
            .sort((oa, ob) =>  oa.expiry > ob.expiry ? 1 : -1 )
          }
          entriesPerPage={6}
          renderEntry={({ addr, title, expiry }: {addr:string, title:string, expiry:number}) => [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            new Date(expiry * 1000).toDateString(),
            <Button onClick={() => goToToken(addr)}> View Vaults </Button>,
          ]}
        />
      ) }
      
    </>
  );
}

export default AllContracts;
