import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, DataView, IdentityBadge, Button,
} from '@aragon/ui';
import { useOptions } from '../../hooks'

import { Comment, CheckBox, GoToUniswapButton, GoToBalancerButton } from '../common';
import { storePreference, getPreference } from '../../utils/storage';

import tracker from '../../utils/tracker';

function TradeLanding() {
  const history = useHistory();

  const { isInitializing, insurances, ethCalls, ethPuts, otherPuts } = useOptions()

  useEffect(() => {
    tracker.pageview('/uniswap/');
  }, []);

  const goToTrade = useCallback((addr: string) => {
    history.push(`/uniswap/${addr}`);
  }, [history]);

  const [insurancePage, setIPages] = useState(0)
  const [optionPage, setOptionPage] = useState(0)

  const [showExpired, setShowExpired] = useState(getPreference('showExpired', '0') === '1');

  return (
    <>
      <Header primary="Exchanges" />
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
        status={ isInitializing ? 'loading' : 'default' }
        entries={insurances.filter((option) => showExpired || option.expiry * 1000 > Date.now())}
        entriesPerPage={6}
        page={insurancePage}
        onPageChange={setIPages}
        renderEntry={({ addr, title, underlying }) => {
          const isAvve = underlying.protocol === 'Aave'
          const button  = isAvve ? <GoToBalancerButton token={addr} /> : <GoToUniswapButton token={addr} />
          return [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button disabled={isAvve} onClick={() => goToTrade(addr)}> Start Trading </Button>
            {button}
          </div>,
        ]}}
      />
      <br />
      <Comment text="Trade Options" />
      <DataView
        fields={['Name', 'Contract', '']}
        status={ isInitializing ? 'loading' : 'default' }
        page={optionPage}
        onPageChange={setOptionPage}
        entries={otherPuts.concat(ethCalls).concat(ethPuts).filter((option) => showExpired || option.expiry * 1000 > Date.now())}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>
            <GoToUniswapButton token={addr} />
          </div>,

        ]}
      />
    </>
  );
}



export default TradeLanding;
