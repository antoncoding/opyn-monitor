import React, { useState } from 'react';
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
  tracker.pageview('/trade/');
  const goToTrade = (addr) => {
    history.push(`/trade/${addr}`);
  };

  const [showExpired, setShowExpired] = useState(getPreference('showExpired', '0') === '1');

  return (
    <>
      <Header primary="Trade" />
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
          <Button onClick={() => goToTrade(addr)}> Start Trading </Button>,
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
          <Button onClick={() => goToTrade(addr)}> Start Trading </Button>,
        ]}
      />
    </>
  );
}

export default TradeLanding;
