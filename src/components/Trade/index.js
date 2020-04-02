import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button,
} from '@aragon/ui';
import { insurances, eth_options } from '../../constants/contracts';

import { Comment } from '../common';

function AllContracts() {
  const history = useHistory();
  const goToTrade = (addr) => {
    history.push(`/trade/${addr}`);
  };
  return (
    <>
      <Header primary="Trade" />
      <Comment text="Buy or Sell DeFi Insurance" />
      <DataView
        fields={['Name', 'Contract', '']}
        entries={insurances}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <Button onClick={() => goToTrade(addr)}> Start Trading </Button>,
        ]}
      />
      <br />
      <Comment text="Trade Options" />
      <DataView
        fields={['Name', 'Contract', '']}
        entries={eth_options}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <Button onClick={() => goToTrade(addr)}> Start Trading </Button>,
        ]}
      />
    </>
  );
}

export default AllContracts;
