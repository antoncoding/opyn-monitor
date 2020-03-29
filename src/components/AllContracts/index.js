import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button,
} from '@aragon/ui';
import { options } from '../../constants/contracts';

import { Comment } from '../common';

function AllContracts() {
  const history = useHistory();
  const goToToken = (addr) => {
    history.push(`/option/${addr}`);
  };
  return (
    <>
      <Header primary="All Contracts" />
      <Comment text="Choose an option contract to proceed." />
      <DataView
        fields={['Name', 'Contract', '']}
        entries={options}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <Button onClick={() => goToToken(addr)}> View Vaults </Button>,
        ]}
      />
    </>
  );
}

export default AllContracts;
