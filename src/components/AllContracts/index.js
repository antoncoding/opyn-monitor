import React from 'react';
import { useHistory } from 'react-router-dom';
import { options } from '../../constants/options';

import { Header, DataView, IdentityBadge, Button } from '@aragon/ui';

function AllContracts() {
  const history = useHistory();
  const goToToken = (addr) => {
    history.push(`/token/${addr}`);
  };
  return (
    <>
      <Header primary='All Contracts' />
      <div style={{padding: 5, opacity:0.5}}> Choose an option contract to proceed </div>
      <DataView
        fields={['Name', 'Contract', '']}
        entries={options}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => {
          return [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> View Vaults </Button>,
          ];
        }}
      />
    </>
  );
}

export default AllContracts;
