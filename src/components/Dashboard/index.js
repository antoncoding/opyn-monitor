import React from 'react';
import { useHistory } from 'react-router-dom';
import { supportedList } from '../../constants/addresses';

import { Header, DataView, IdentityBadge, Button } from '@aragon/ui';

function DashBoard() {
  const history = useHistory();
  const goToToken = (addr) => {
    history.push(`/token/${addr}`);
  };
  return (
    <>
      <Header primary='All Insurances' />
      <DataView
        fields={['Name', 'Contract', '']}
        entries={supportedList}
        entriesPerPage={6}
        renderEntry={({ addr, name }) => {
          return [
            <>{name}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> Access </Button>,
          ];
        }}
      />
    </>
  );
}

export default DashBoard;
