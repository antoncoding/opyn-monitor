import styled from 'styled-components';

// For option board

export const BidText = styled.div`{
  color: #7aae1a;
  font-size: 17px;
}`;

export const AskText = styled.div`{
  color: #da5750;
  font-size: 17px;
}`;


// For buy and sell part
export const FlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 18px 0;
`;
export const BuyAndSellBlock = styled.div`  
  width: 100%;
  min-height: 509px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid ${(props) => props.theme.border};
  padding-bottom: 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.surface};
`;
export const Header = styled.div`
  width: 100%;
  height: 35px;
  font-size: 13px;
  font-family: aragon-ui;
  border-bottom: 1px solid ${(props) => props.theme.border};
  background-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.contentSecondary};
  display: flex;
  align-items: center;
  padding: 10px 0;
  justify-content: center;
  // font-weight: bold;
`;
export const BuySellTopPart = styled.div`
  margin: 10px 0;
  background-color: ${(props) => props.theme.surface};
  min-height: 50px;
`;
export const BuySellTopPartText = styled.div``;
export const BuySellLowerPart = styled.div`
  background-color: ${(props) => props.theme.background};
`;
export const Tab = styled.div`
  width: 50%;
  height: 50px;
  color: ${(props) => (props.active ? props.theme.content : props.theme.surfaceContentSecondary)};
  justify-content: center;
  display: flex;
  align-items: center;
  border-bottom: ${(props) => (props.active ? `2px solid ${props.theme.selected}` : `1px solid ${props.theme.border}`)};
  cursor: pointer;
`;

export const Label = styled.div`
  height: 14px;
  font-size: 14px;
  color: ${(props) => props.theme.content};
  margin: 20px 0 15px 0;
`;

export const BottomText = styled.div`
  height: 20px;
`;
export const Wrapper = styled.div`
  width: 90%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const Flex = styled.div`
  display:flex;
  width: 90%;
`;
export const TabWrapper = styled.div`
  width: 100%;
  display: flex;
  background-color: ${(props) => props.theme.surface};
  padding-top: 10px;
  border: ${(props) => props.theme.border}
`;
export const BottomTextWrapper = styled(FlexWrapper)`
  height: 27px;
  border-bottom: solid 1px #979797;
  border-bottom-style: dotted;
`;
export const GroupButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  color: ${(props) => props.theme.content};
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: center;
  border-radius: 5px;
`;
export const GroupButton = styled.div`
  height: 40px;
  width: 33%;
  border: 1px solid ${(props) => props.theme.border};
  border-width: ${(props) => (props.index === 1 ? '1px 0px' : '1px')};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top-left-radius: ${(props) => (props.index === 0 ? '5px' : '0px')};
  border-bottom-left-radius: ${(props) => (props.index === 0 ? '5px' : '0px')};
  border-top-right-radius: ${(props) => (props.index === 2 ? '5px' : '0px')};
  border-bottom-right-radius: ${(props) => (props.index === 2 ? '5px' : '0px')};
  background: ${(props) => (props.disabled ? props.theme.surface
    : props.isActive ? props.theme.surfaceHighlight : props.theme.surface)} ;
  :active {
    transform: translateY(1px)
  }
`;
