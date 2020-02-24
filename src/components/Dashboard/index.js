import React from 'react';
import { useHistory } from 'react-router-dom'
import { supportedList } from '../../constants/addresses'

import { Header, DataView, IdentityBadge, Button } from '@aragon/ui'

function DashBoard() {
    const history = useHistory();
    const goToToken = (addr) =>{
      history.push(`/token/${addr}`)
    }
    return (
      <>
        <Header primary='All Opyn Options' />
        <DataView
        fields={['Contract', 'Detail']}
        entries={supportedList}
        entriesPerPage={6}
        renderEntry={( addr ) => {
          return [
            <IdentityBadge entity={addr} shorten={false} />,
            <Button onClick={() => goToToken(addr)}> Manage </Button>
          ];
        }}
        />
      </>
    );
  
}

export default DashBoard;