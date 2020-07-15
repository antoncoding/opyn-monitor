import React from 'react';
import { useHistory } from 'react-router-dom';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import UniswapLogo from '../../imgs/uniswap.png'

import {
  Header, Box, LinkBase, Tag,
} from '@aragon/ui';

function HomePage() {
  const history = useHistory();

  return (
    <>
      <Container fluid='md'>
      <Header primary="Welcome to Opyn Monitor" />
      <div style={{ padding: 5, opacity: 0.5 }}> Tools for DeFi Risk Management. </div>
      
        <Row>
          <Col md={6} lg={4}>
            <MainButton
              title="My Vaults"
              description="Manage collateral, Mint/Burn oTokens"
              iconUrl="https://opyn.co/static/media/1.68813886.svg"
              onClick={() => {
                history.push('/myvaults');
              }}
            />
          </Col>

          <Col md={6} lg={4}>
            <MainButton
              title="All Contracts"
              description=" Monitor and liquidate vaults."
              iconUrl="https://opyn.co/static/media/2.18d22be0.svg"
              onClick={() => {
                history.push('/options/');
              }}
            />
          </Col>
          {/* <Col md={6} lg={4}>
            <div>
            </div>
            <MainButton
              title="Exchanges"
              description="View all open markets"
              iconUrl="https://opyn.co/static/media/3.4da8b24d.svg"
              onClick={() => {
                history.push('/uniswap/');
              }}
            />
          </Col> */}
          <Col md={6} lg={4}>
            <MainButton
              title="Trade"
              description="Trade ETH Options on Uniswap."
              iconUrl={UniswapLogo}
              onClick={() => {
                history.push('/trade/uniswap/');
              }}
            />
          </Col>
          <Col md={6} lg={4}>
            <MainButton
              title="Trade"
              description="Trade ETH Options on 0x"
              iconUrl="https://cdn.worldvectorlogo.com/logos/0x-virtual-money-.svg"
              onClick={() => {
                history.push('/trade/0x');
              }}
            />
          </Col>


        </Row>
      </Container>
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
