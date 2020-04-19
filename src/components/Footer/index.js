import React from 'react';

import { Link } from '@aragon/ui';
import PropTypes from 'prop-types';

function Footer({ theme }) {
  const style = {
    backgroundColor: theme === 'light' ? '#F8F8F8' : '#35425e',
    textAlign: 'center',
    padding: '17px',
    position: 'fixed',
    left: '0',
    bottom: '0',
    height: '50px',
    width: '100%',
    fontSize: '14px',
  };

  return (
    <div style={style}>
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
      {'. '}
      <Link external href="https://www.kollateral.co/">
        Kollateral
      </Link>
      {'. '}
      Hosted on GitHub:
      {/* </div> */}
      <iframe
        title="star"
        src="https://ghbtns.com/github-btn.html?user=antoncoding&repo=opyn-liquidator&type=star&count=true"
        frameBorder="0"
        scrolling="0"
        width="160px"
        height="18px"
      />
    </div>
  );
}

Footer.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default Footer;
