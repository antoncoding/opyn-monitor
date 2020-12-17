import React from 'react';
import { useHistory } from 'react-router-dom';
import { Link, useTheme, IdentityBadge } from '@aragon/ui';

function Footer({ theme }: { theme: string }) {
  const history = useHistory();
  const themeObj = useTheme();
  return (
    history.location.pathname.includes('/trade/')
      ? <></>
      : (
        <div style={{
          backgroundColor: themeObj.surface,
          textAlign: 'center',
          padding: '12px',
          position: 'fixed',
          left: '0',
          bottom: '0',
          height: '50px',
          width: '100%',
          fontSize: '15px'
        }}>
          Powered By
          {' '}
          <Link external href="https://opyn.co/#/">
            Opyn
          </Link>
          {', '}
          <Link external href="https://ui.aragon.org/">
            Aragon UI
          </Link>
          {', '}
          <Link external href="https://www.blocknative.com/">
            Blocknative
          </Link>
          {', '}
          <Link external href="https://www.kollateral.co/">
            Kollateral
          </Link>
          {'. Code open sourced on '}
          <Link external href="https://github.com/antoncoding/opyn-monitor/">
            GitHub
          </Link>
          <span style={{paddingLeft: '10px'}}>
          <IdentityBadge  customLabel="Donations are welcome" icon={'❤️'} entity={"0xD325E15A52B780698C45CA3BdB6c49444fe5B588"} />
          </span>
        </div>
      )
  );
}

export default Footer;
