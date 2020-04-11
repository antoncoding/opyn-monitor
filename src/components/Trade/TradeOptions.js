import React, { Component } from 'react';
import { DataView, IdentityBadge, Checkbox, Button } from '@aragon/ui';
import styled from 'styled-components';

//dark
const deepBlue = 'rgb(40, 51, 76)';
const lightBlue = 'rgb(124, 153, 214)';

const data = [
	{
		title: [
			// 'Last',
			'Size',
			'IV',
			'Bid',
			'Ask',
			'IV',
			'Size',
			'Vol',
			'Δ|Delta',
			'Strike',
			'Last',
			'Size',
			'IV',
			'Bid',
			'Ask',
			'IV',
			'Size',
			'Vol',
			'Δ|Delta'
		],
		content: [
			{
				last_calls: '0.3600',
				size_calls: '1.6',
				iv_calls: '0.0%',
				bid_calls: '0.0045 $29.99',
				ask_calls: '-',
				iv2_calls: '-',
				size2_calls: '-',
				vol2_calls: '-	-',
				delta_calls: '1.00',
				strike: 4250,
				last_puts: '0.3600',
				size_puts: '1.6',
				iv_puts: '0.0%',
				bid_puts: '0.0045 $29.99',
				ask_puts: '-',
				iv2_puts: '-',
				size2_puts: '-',
				vol2_puts: '-	-',
				delta_puts: '1.00'
			},
			{
				last_calls: '0.2890',
				size_calls: '1.6',
				iv_calls: '0.0%',
				bid_calls: '0.2250 $29.99',
				ask_calls: '0.4265',
				iv2_calls: '-',
				size2_calls: '-',
				vol2_calls: '-	-',
				delta_calls: '1.00',
				strike: 4250,
				last_puts: '0.3600',
				size_puts: '1.6',
				iv_puts: '0.0%',
				bid_puts: '0.0045 $29.99',
				ask_puts: '-',
				iv2_puts: '-',
				size2_puts: '-',
				vol2_puts: '-	-',
				delta_puts: '1.00'
			}
		]
	}
];

export default class TradeOptions extends Component {
	state = {
		last: true,
		impliedVolatility: true,
		volume: true,
		openInterest: false,
		delta: true,
		positions: false,
		markPrice: false,
		data: [],
		activeTab: 'Buy',
		buy: 'ZRX',
		sell: 'ETH'
	};
	componentDidMount = () => {
		this.setState({ data });
	};
	render() {
		const { buy } = this.state;
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
			// <div>
			// 	<div>
			// 		<label>
			// 			<Checkbox checked={this.state.last} onChange={(checked) => this.setState({ last: checked })} />
			// 			Last
			// 		</label>
			// 		<label>
			// 			<Checkbox
			// 				checked={this.state.impliedVolatility}
			// 				onChange={(checked) => this.setState({ impliedVolatility: checked })}
			// 			/>
			// 			Implied Volatility
			// 		</label>
			// 	</div>
			// 	<DataView
			// 		heading={'3 Apr 2020'}
			// 		fields={data[0].title}
			// 		entries={[
			// 			data[0].content[0],
			// 			data[0].content[1]
			// 			// [ '123', '456', '789' ]
			// 		]}
			// 		renderEntry={({
			// 			last_calls,
			// 			size_calls,
			// 			iv_calls,
			// 			bid_calls,
			// 			ask_calls,
			// 			iv2_calls,
			// 			size2_calls,
			// 			vol2_calls,
			// 			delta_calls,
			// 			strike,
			// 			last_puts,
			// 			size_puts,
			// 			iv_puts,
			// 			bid_puts,
			// 			ask_puts,
			// 			iv2_puts,
			// 			size2_puts,
			// 			vol2_puts,
			// 			delta_puts
			// 		}) => {
			// 			return [
			// 				// <IdentityBadge entity={account} />,
			// 				// <GreenStyle>{last_calls}</GreenStyle>,
			// 				<GreenStyle>{size_calls}</GreenStyle>,
			// 				<GreenStyle>{iv_calls}</GreenStyle>,
			// 				<GreenStyle>{bid_calls}</GreenStyle>,
			// 				<GreenStyle>{ask_calls}</GreenStyle>,
			// 				<GreenStyle>{iv2_calls}</GreenStyle>,
			// 				<GreenStyle>{size2_calls}</GreenStyle>,
			// 				<GreenStyle>{vol2_calls}</GreenStyle>,
			// 				<GreenStyle>{delta_calls}</GreenStyle>,
			// 				<GrayStyle>{strike}</GrayStyle>,
			// 				<div>{last_puts}</div>,
			// 				<div>{size_puts}</div>,
			// 				<div>{iv_puts}</div>,
			// 				<div>{bid_puts}</div>,
			// 				<div>{ask_puts}</div>,
			// 				<div>{iv2_puts}</div>,
			// 				<div>{size2_puts}</div>,
			// 				<div>{vol2_puts}</div>,
			// 				<div>{delta_puts}</div>
			// 			];
			// 		}}
			// 	/>
			// </div>
		);
	}
}

const GrayStyle = styled.div`background: gray;`;
const GreenStyle = styled.div`background: rgba(13, 243, 11, 0.05);`;

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
`;
const Header = styled.div`
	width: 100%;
	height: 35px;
	border-bottom: solid 1px #1f273b;
	background-color: #28334c;
	display: flex;
	align-items: center;
	padding: 10px 0;
	justify-content: center;
	font-weight: bold;
`;
const TopPart = styled.div`
	margin: 10px 0;
	background-color: #28334c;
	min-height: 50px;
`;
const TopPartText = styled.div``;
const LowerPart = styled.div`background-color: #28334c;`;
const Tab = styled.div`
	width: 50%;
	height: 53px;
	border: solid 1px #1f273b;
	background-color: ${(props) => (props.active ? '#28334c' : '#22293b')};
	color: ${(props) => (props.active ? 'white' : '#4f5e84')};
	justify-content: center;
	display: flex;
	align-items: center;
	border-bottom: ${(props) => (props.active ? '1px solid #28334c' : '')};
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
