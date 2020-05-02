import styled from 'styled-components'

export const GroupButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  color: ${(props: { theme: { content: any; }; }) => props.theme.content};
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: center;
  border-radius: 5px;
`;
export const GroupButton = styled.div`
  height: 40px;
  width: 50%;
  border: 1px solid ${(props: { theme: { border: any; }; }) => props.theme.border};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top-left-radius: ${(props: { index: number; }) => (props.index === 0 ? '5px' : '0px')};
  border-bottom-left-radius: ${(props: { index: number; }) => (props.index === 0 ? '5px' : '0px')};
  border-top-right-radius: ${(props: { index: number; }) => (props.index === 1 ? '5px' : '0px')};
  border-bottom-right-radius: ${(props: { index: number; }) => (props.index === 1 ? '5px' : '0px')};
  background: ${(props: { disabled: any; theme: { surface: any; surfaceHighlight: any; }; isActive: boolean; }) => (props.disabled ? props.theme.surface
    : props.isActive ? props.theme.surfaceHighlight : props.theme.surface)} ;
  :active {
    transform: translateY(1px)
  }
`;