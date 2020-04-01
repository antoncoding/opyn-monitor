import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button, Tabs,
} from '@aragon/ui';
import { eth_options, insurances } from '../../constants/contracts';
// import { timeSince } from '../../utils/number';
import { Comment } from '../common';

function AllContracts() {
  const [tabSelected, setTabSelected] = useState(0);

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
        onChange={setTabSelected}
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
