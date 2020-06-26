import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import MesaLogo from '../../imgs/gnosis.png'
import UniswapLogo from '../../imgs/uniswap.png'
import {
  Header, DataView, IdentityBadge, Button,
} from '@aragon/ui';
import { useOptions } from '../../hooks'

import { Comment, CheckBox } from '../common';
import { storePreference, getPreference } from '../../utils/storage';
import tracker from '../../utils/tracker';

function TradeLanding() {
  const history = useHistory();

  const { isInitializing, insurances, ethCalls, ethPuts, compPuts } = useOptions()

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
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>
            <GoToUniswapFunction token={addr} />
            <GoToMesa token={addr} />
          </div>,
        ]}
      />
      <br />
      <Comment text="Trade Options" />
      <DataView
        fields={['Name', 'Contract', '']}
        status={ isInitializing ? 'loading' : 'default' }
        page={optionPage}
        onPageChange={setOptionPage}
        entries={compPuts.concat(ethCalls).concat(ethPuts).filter((option) => showExpired || option.expiry * 1000 > Date.now())}
        entriesPerPage={6}
        renderEntry={({ addr, title }) => [
          <>{title}</>,
          <IdentityBadge entity={addr} shorten={false} />,
          <div style={{ display: 'flex' }}>
            <Button onClick={() => goToTrade(addr)}> Start Trading </Button>
            <GoToUniswapFunction token={addr} />
            <GoToMesa token={addr} />
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
        `https://v1.uniswap.exchange/swap?inputCurrency=${token}`,
        '_blank',
      )
    }
    }
    >
      <img alt="uniswap" src={UniswapLogo} style={{ padding: 2, height: 32, width: 29 }} />
    </Button>
  );
}

function GoToMesa({ token }: { token: string }) {
  return (
    <Button onClick={() => {
      tracker.event({
        category: 'link',
        action: 'mesa',
      })
      window.open(
        `https://mesadev.eth.link/#/trade/DAI-${token}`,
        '_blank',
      )
    }
    }
    >
      <img alt="mesa" src={MesaLogo} style={{ padding: 2, height: 32, width: 32 }} />
    </Button>
  );
}




export default TradeLanding;
