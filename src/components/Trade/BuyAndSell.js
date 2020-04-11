import React, { Component } from 'react';
import { Button } from '@aragon/ui';
import styled from 'styled-components';

const BACKGROUND_COLOR = '#28334c';

export default class BuyAndSell extends Component {
	state = {
		activeTab: 'Buy',
		buy: 'ZRX',
		sell: 'ETH'
	};
	render() {
		const { buy, sell } = this.state;
		return (
			<BuyAndSellBlock>
				<Header>
					<Wrapper>Wallet Balance</Wrapper>
				</Header>
				<Wrapper>
					<TopPart>
						{[
							{
								name: 'ZRX',
								price: '10'
							},
							{
								name: 'ETH',
								price: '233'
							},
							{
								name: 'Collateral',
								price: '123'
							}
						].map((x) => (
							<FlexWrapper key={x.name}>
								<div>{x.name}</div>
								<TopPartText>{x.price}</TopPartText>
							</FlexWrapper>
						))}
					</TopPart>
				</Wrapper>
				<TabWrapper>
					{[ 'Buy', 'Sell' ].map((x) => (
						<Tab onClick={() => this.setState({ activeTab: x })} active={this.state.activeTab === x}>
							{x}
						</Tab>
					))}
				</TabWrapper>
				<Wrapper>
					<LowerPart>
						<Label>Amount</Label>
						<Input />
						<Label>Price per token</Label>
						<Input />
						{[
							{
								label: 'Order Details',
								content: 'USD'
							},
							{
								label: 'Fee',
								content: '$1.05'
							},
							{
								label: 'Total Cost',
								content: '$590.63'
							}
						].map((x) => (
							<BottomTextWrapper>
								<BottomText>{x.label}</BottomText>
								<BottomText>{x.content}</BottomText>
							</BottomTextWrapper>
						))}
					</LowerPart>
				</Wrapper>
				<Wrapper>
					<Button label={`Buy ${buy}`} wide />
				</Wrapper>
			</BuyAndSellBlock>
		);
	}
}

const FlexWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 18px 0;
`;
const BuyAndSellBlock = styled.div`
	width: 310px;
	min-height: 509px;
	display: flex;
	flex-direction: column;
	align-items: center;
	border: 1px solid #1f273b;
	padding-bottom: 10px;
	border-radius: 5px;
	background-color: ${BACKGROUND_COLOR};
`;
const Header = styled.div`
	width: 100%;
	height: 35px;
	border-bottom: solid 1px #1f273b;
	background-color: ${BACKGROUND_COLOR};
	display: flex;
	align-items: center;
	padding: 10px 0;
	justify-content: center;
	font-weight: bold;
`;
const TopPart = styled.div`
	margin: 10px 0;
	background-color: ${BACKGROUND_COLOR};
	min-height: 50px;
`;
const TopPartText = styled.div``;
const LowerPart = styled.div`background-color: ${BACKGROUND_COLOR};`;
const Tab = styled.div`
	width: 50%;
	height: 53px;
	border: solid 1px #1f273b;
	background-color: ${(props) => (props.active ? BACKGROUND_COLOR : '#22293b')};
	color: ${(props) => (props.active ? 'white' : '#4f5e84')};
	justify-content: center;
	display: flex;
	align-items: center;
	border-bottom: ${(props) => (props.active ? `1px solid ${BACKGROUND_COLOR}` : '')};
	cursor: pointer;
`;
const Label = styled.div`
	height: 16px;
	font-size: 14px;
	color: #ffffff;
	margin: 20px 0 15px 0;
`;
const Input = styled.input`
	width: 100%;
	height: 36px;
	border-radius: 5px;
	border: solid 1px #1f273b;
	background-color: #22293b;
	padding: 10px;
`;
const Text = styled.div`
	width: 73px;
	height: 14px;
	font-size: 12px;
	color: ${(props) => (props.active ? 'white' : '#4f5e84')};
`;
const BottomText = styled.div`height: 20px;`;
const Wrapper = styled.div`
	width: 90%;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
const TabWrapper = styled.div`
	width: 100%;
	display: flex;
	background-color: #1f273b;
	padding-top: 11px;
`;
const BottomTextWrapper = styled(FlexWrapper)`
	height: 27px;
	border-bottom: solid 1px #979797;
	border-bottom-style: dotted;
`;
