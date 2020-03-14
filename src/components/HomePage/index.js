import React from 'react';
import { useHistory } from 'react-router-dom';
import { Header, Box, LinkBase } from '@aragon/ui';

function HomePage() {
  const history = useHistory();

  return (
    <>
      <Header primary='Welcome to Opyn Dashboard' />
      <div style={{ padding: 5, opacity: 0.5 }}> Leverage your risk in DeFi. </div>
      <div style={{ padding: '1%', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '30%', marginRight: '3%' }}>
          <MainButton title='My Vaults' description='Manage collateral, Mint/Burn oTokens' onClick={()=>{
            history.push('/myvaults')
          }} />
        </div>

        <div style={{ width: '30%' }}>
          <MainButton title='All Contracts' description=' Monitor and liquidate vaults.' onClick={()=>{
            history.push('/options/')
          }} />
        </div>

        <div style={{ width: '30%', marginLeft: '3%' }}>
          <MainButton title='Trade' description='Buy, Sell or Provided Liquidity.' onClick={()=>{
            history.push('./trade')
          }} />
        </div>
      </div>
    </>
  );
}

function MainButton({ title, description, onClick }) {
  return (
    <LinkBase onClick={onClick} style={{ width: '100%' }}>
      <Box>
        <div style={{ fontSize: 18 }}>{title}</div>
        <div style={{ paddingTop: 5, opacity: 0.5 }}> {description} </div>
      </Box>
    </LinkBase>
  );
}

export default HomePage;
