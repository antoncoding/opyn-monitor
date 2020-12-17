import React from 'react';
import { useHistory } from 'react-router-dom';

import UniswapLogo from '../../imgs/uniswap.png'

import { Header, Box, LinkBase, Tag,  } from '@aragon/ui';

function HomePage() {
  const history = useHistory();

  return (
    <>
      <Header primary="Welcome to Opyn Monitor" />
      <div style={{ padding: 5, opacity: 0.5 }}> Manage you assets on Opyn V1. </div>
      <div style={{ padding: 5, opacity: 0.5 }}> 
      <LinkBase external href="https://opynv2-portal.netlify.app/#/">
      <span role="img" aria-label="celebrate"> 🎉 </span> Try out Opyn V2 on Testnet! <span role="img" aria-label="celebrate">🎉 </span>
      </LinkBase> </div>

      <div style={{ paddingTop: '1%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '30%', marginRight: '3%' }}>

          <MainButton
            title="My Vaults"
            description="Manage collateral, Mint/Burn oTokens"
            iconUrl="https://opyn.co/static/media/1.68813886.svg"
            onClick={() => {
              history.push('/myvaults');
            }}
          />
        </div>

        <div style={{ width: '30%' }}>
          <MainButton
            title="All Contracts"
            description="Liquidate vaults, Exercise oTokens"
            iconUrl="https://opyn.co/static/media/2.18d22be0.svg"
            onClick={() => {
              history.push('/options/');
            }}
          />
        </div>
        <div style={{ width: '30%', marginLeft: '3%', marginRight: '2%' }}>
          <MainButton
            title="Trade"
            description="Trade Options on Uniswap."
            iconUrl={UniswapLogo}
            onClick={() => {
              history.push('/trade/uniswap/');
            }}
          />
        </div>
      </div>
      <div style={{ padding: '1%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '30%', marginLeft: '33%', marginRight: '35%' }}>
          <MainButton
            title="Trade"
            description="Trade ETH Options on 0x"
            iconUrl="https://cdn.worldvectorlogo.com/logos/0x-virtual-money-.svg"
            onClick={() => {
              history.push('/trade/0x');
            }}
          />
        </div>


      </div>
    </>
  );
}

type MainButtonPropx = {
  title: string,
  description: string,
  iconUrl: any,
  secondImg?: any,
  onClick: Function,
  tag?: string
}

function MainButton({
  title, description, iconUrl, secondImg, onClick, tag,
}: MainButtonPropx) {
  return (
    <LinkBase onClick={onClick} style={{ width: '100%', paddingBottom: 20 }}>
      <Box>
        <div style={{ padding: 10, fontSize: 18 }}>
          {title}
          {tag ? <Tag>{tag}</Tag> : <></>}
        </div>
        <img alt="icon" style={{ padding: 10, height: 64 }} src={iconUrl} />
        {secondImg && <img alt="icon" style={{ padding: 10, height: 64 }} src={secondImg} />}
        <div style={{ paddingTop: 5, opacity: 0.5 }}>
          {' '}
          {description}
          {' '}
        </div>

      </Box>
    </LinkBase>
  );
}

export default HomePage;
