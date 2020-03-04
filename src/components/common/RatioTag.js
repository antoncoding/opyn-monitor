import React from 'react'

import { Tag } from '@aragon/ui';

function RatioTag ({isSafe, ratio}) {
  return isSafe ? (
    ratio < 1.6 ? (
      <Tag background='#FFEBAD' color='#FEC100'>
        {' '}
        Danger{' '}
      </Tag>
    ) : (
      <Tag mode='new'> safe </Tag>
    )
  ) : (
    <Tag color='#E34343' background='#FFC6C6'>
      Unsafe!
    </Tag>
  );
};

export default RatioTag