import React from 'react';

import {
  Button,
} from '@aragon/ui';


import MesaLogo from '../../imgs/gnosis.png'
import UniswapLogo from '../../imgs/uniswap.png'
import BalancerLogo from '../../imgs/balancer.png'
import tracker from '../../utils/tracker';

export function GoToUniswapButton({ token }: { token: string }) {
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

export function GoToMesaButton({ token }: { token: string }) {
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

export function GoToBalancerButton({ token }: { token: string }) {
  return (
    <Button onClick={() => {
      tracker.event({
        category: 'link',
        action: 'balancer',
      })
      window.open(
        `https://balancer.exchange/#/swap/${token}`,
        '_blank',
      )
    }
    }
    >
      <img alt="balancer" src={BalancerLogo} style={{ padding: 2, height: 32, width: 29 }} />
    </Button>
  );
}