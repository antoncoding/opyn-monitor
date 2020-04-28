import React from 'react';
import { Tag } from '@aragon/ui';

type RatioTagProps = {
  isSafe: boolean,
  ratio: number,
  useCollateral? : boolean,
}
function RatioTag({ isSafe, ratio, useCollateral = true }:RatioTagProps) {
  return !useCollateral ? (
    <Tag color="#78827a" background="#c0c2c0">
      Cool
    </Tag>
  ) : isSafe ? (
    ratio < 1.6 ? (
      <Tag background="#FFEBAD" color="#FEC100">
        {' '}
        Danger
        {' '}
      </Tag>
    ) : (
      <Tag mode="new"> safe </Tag>
    )
  ) : (
    <Tag color="#E34343" background="#FFC6C6">
      Unsafe!
    </Tag>
  );
}


export default RatioTag;
