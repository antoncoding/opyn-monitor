import React from 'react';

import { CompoundProtocol, AaveProtocol } from '../../imgs'

type commentProps = {
  protocol: string | undefined
}

function ProtocolIcon({ protocol }: commentProps) {
  const src = protocol === 'Aave' ? AaveProtocol : CompoundProtocol
  return <> <img src={src} height={28} alt={protocol} /> <span style={{padding: 4}}> {protocol} </span> </> 
  
}

export default ProtocolIcon;
