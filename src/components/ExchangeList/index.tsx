import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button,
} from '@aragon/ui';
import { insurances, eth_options } from '../../constants/options';

import { Comment, CheckBox } from '../common';
import { storePreference, getPreference } from '../../utils/storage';
import tracker from '../../utils/tracker';

function TradeLanding() {
  const history = useHistory();

  useEffect(() => {
    tracker.pageview('/uniswap/');
  }, []);

  const goToTrade = (addr: string) => {
    history.push(`/uniswap/${addr}`);
  };

  const [showExpired, setShowExpired] = useState(getPreference('showExpired', '0') === '1');

  return (
    <>
      <Header primary="Uniswap Exchanges" />
      <div style={{ display: 'flex' }}>
        <Comment text="Buy or Sell DeFi Insurance" />
        <div style={{ marginLeft: 'auto' }}>
          <CheckBox
            text="Expired"
            checked={showExpired}
            onCheck={(checked) => {
              storePreference('showExpired', checked ? '1' : '0');
              setShowExpired(checked);
            }}
          />
        </div>
      </div>
      <DataView
        fields={['Name', 'Contract', '']}
        entries={insurances.filter((option) => showExpired || option.expiry * 1000 > Date.now())}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>
            <GoToUniswapFunction token={addr} />
          </div>,
        ]}
      />
      <br />
      <Comment text="Trade Options" />
      <DataView
        fields={['Name', 'Contract', '']}
        entries={eth_options.filter((option) => showExpired || option.expiry * 1000 > Date.now())}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>
            <GoToUniswapFunction token={addr} />
          </div>,

        ]}
      />
    </>
  );
}



function GoToUniswapFunction({ token }: { token: string }) {
  return (
    <Button onClick={() => {
      tracker.event({
        category: 'link',
        action: 'uniswap',
      })
      window.open(
        `https://uniswap.exchange/swap?inputCurrency=${token}`,
        '_blank',
      )
    }
    }
    >
      <img alt="uniswap" src="https://i.imgur.com/4eX8GlY.png" style={{ padding: 2, height: 25, width: 23 }} />
    </Button>
  );
}


export default TradeLanding;
