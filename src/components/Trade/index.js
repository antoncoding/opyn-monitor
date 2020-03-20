import React from 'react';
import { useHistory } from 'react-router-dom';
import { options } from '../../constants/options';

import { Header, DataView, IdentityBadge, Button } from '@aragon/ui';

function AllContracts() {
  const history = useHistory();
  const goToTrade = (addr) => {
    history.push(`/trade/${addr}`);
  };
  return (
    <>
      <Header primary='Trade' />
      <div style={{padding: 5, opacity:0.5}}> Choose an option contract to proceed </div>
      <DataView
        fields={['Name', 'Contract', '']}
        entries={options}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => {
          return [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>,
          ];
        }}
      />
    </>
  );
}

export default AllContracts;
