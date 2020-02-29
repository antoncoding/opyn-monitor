import React from 'react';
import { useHistory } from 'react-router-dom';
import { options } from '../../constants/options';

import { Header, DataView, IdentityBadge, Button } from '@aragon/ui';

function DashBoard() {
  const history = useHistory();
  const goToToken = (addr) => {
    history.push(`/token/${addr}`);
  };
  return (
    <>
      <Header primary='Welcome to Opyn Position Monitor' />
      <div style={{padding: 5, opacity:0.5}}> Choose a option contract to start </div>
      <DataView
        fields={['Name', 'Contract', '']}
        entries={options}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => {
          return [
            <>{title}</>,
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> Let's Go </Button>,
          ];
        }}
      />
    </>
  );
}

export default DashBoard;
