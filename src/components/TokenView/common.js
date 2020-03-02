import React from 'react';

import { Tag, IdentityBadge } from '@aragon/ui';

import VaultModal from './VaultModal';

export const renderListEntry = ({ owner, collateral, oTokensIssued, ratio, isSafe, oToken }) => {
  return [
    <IdentityBadge entity={owner} shorten={true} />,
    collateral,
    oTokensIssued,
    ratio,
    createTag(isSafe, ratio),
    <VaultModal
      oToken={oToken}
      owner={owner}
      collateral={collateral}
      isSafe={isSafe}
      oTokensIssued={oTokensIssued}
      ratio={ratio}
    />,
  ];
};

export const createTag = (isSafe, ratio) => {
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

export function SectionTitle({ title }) {
  return <div style={{ padding: 10, fontSize: 20 }}>{title}</div>;
}
