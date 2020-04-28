import React from 'react';
import { useTheme } from '@aragon/ui';

function WarningText({ text }:{text:string}) {
  const theme = useTheme();
  return (
    <div style={{ color: theme.warning, fontSize: 12, padding: '3px' }}>
      {text}
    </div>
  );
}


export default WarningText;
