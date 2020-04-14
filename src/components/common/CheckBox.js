import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, useTheme } from '@aragon/ui';
import styled from 'styled-components';

function MyCheckBox({ text, checked, onCheck }) {
  const theme = useTheme();
  return (
    <CheckBoxWrapper theme={theme}>
      <Checkbox
        checked={checked}
        onChange={onCheck}
      />
      <span style={{ paddingBottom: '5px' }}>
        {text}
      </span>
      <br />
    </CheckBoxWrapper>
  );
}

MyCheckBox.propTypes = {
  text: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onCheck: PropTypes.func.isRequired,
};

export default MyCheckBox;

const CheckBoxWrapper = styled.div`{
  padding: 5px;
  font-size: 14px;
  color: ${(props) => props.theme.surfaceContentSecondary}
}`;
