import React from 'react';
import { Checkbox, useTheme } from '@aragon/ui';
import styled from 'styled-components';

type checkBoxProps = {
  text: string,
  checked: boolean,
  onCheck: Function
}

function MyCheckBox({ text, checked, onCheck }: checkBoxProps) {
  const theme = useTheme();
  return (
    <CheckBoxWrapper theme={theme}>
      <Checkbox
        checked={checked}
        onChange={onCheck}
      />
      <span style={{ margin: '4px' }}>
        {text}
      </span>
      <br />
    </CheckBoxWrapper>
  );
}

export default MyCheckBox;

const CheckBoxWrapper = styled.div`{
  display: flex;
  font-size: 14px;
  color: ${(props) => props.theme.surfaceContentSecondary}
}`;
