import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button, Tabs,
} from '@aragon/ui';

import { insurances, eth_options } from '../../constants/options';
import { Comment } from '../common';
import { getPreference, storePreference } from '../../utils/storage';

function AllContracts() {
  const storedOptionTab = getPreference('optionTab', '0');
  const [tabSelected, setTabSelected] = useState(parseInt(storedOptionTab, 10));

  const history = useHistory();
  const goToToken = (addr) => {
    history.push(`/option/${addr}`);
  };
  return (
    <>
      <Header primary="All Contracts" />
      <Comment text="Choose an option contract to proceed." />
      <Tabs
        items={['DeFi Insurance', 'ETH Options']}
        selected={tabSelected}
        onChange={(choice) => {
          setTabSelected(choice);
          storePreference('optionTab', choice.toString());
        }}
      />

      {tabSelected === 0 ? (
        <DataView
          fields={['Name', 'Contract', '']}
          entries={insurances}
          entriesPerPage={6}
          renderEntry={({ addr, title }) => [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> View Vault </Button>,
          ]}
        />
      ) : (
        <DataView
          header="Options"
          fields={['Name', 'Contract', 'Expiry', '']}
          entries={eth_options}
          entriesPerPage={6}
          renderEntry={({ addr, title, expiry }) => [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            new Date(parseInt(expiry * 1000, 10)).toDateString(),
            <Button onClick={() => goToToken(addr)}> View Vault </Button>,
          ]}
        />
      )}
    </>
  );
}

export default AllContracts;
