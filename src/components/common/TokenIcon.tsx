import React from 'react';
import { IdentityBadge } from '@aragon/ui';

import { token } from '../../types/option'

type commentProps = {
  token: token
}

function TokenIcon({ token }: commentProps) {
  return token.img 
    ? <> <img src={token.img} height={28} alt={token.symbol} /> <span style={{padding: 4}}> {token.symbol} </span> </> 
    : <IdentityBadge label={token.symbol} entity={token.addr} />
  
}

export default TokenIcon;
