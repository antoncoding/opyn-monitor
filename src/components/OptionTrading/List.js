import React, { useState } from 'react';

import { Checkbox, DataView } from '@aragon/ui';
import styled from 'styled-components';

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
      'Δ|Delta',
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
        vol2_calls: '-',
        delta_calls: '1.00',
        strike: 4250,
        last_puts: '0.3600',
        size_puts: '1.6',
        iv_puts: '0.0%',
        bid_puts: '0.0045 $29.99',
        ask_puts: '-',
        iv2_puts: '-',
        size2_puts: '-',
        vol2_puts: '-',
        delta_puts: '1.00',
      },
      {
        last_calls: '0.2890',
        size_calls: '1.6',
        iv_calls: '0.0%',
        bid_calls: '0.2250 $29.99',
        ask_calls: '0.4265',
        iv2_calls: '-',
        size2_calls: '-',
        vol2_calls: '-',
        delta_calls: '1.00',
        strike: 4250,
        last_puts: '0.3600',
        size_puts: '1.6',
        iv_puts: '0.0%',
        bid_puts: '0.0045 $29.99',
        ask_puts: '-',
        iv2_puts: '-',
        size2_puts: '-',
        vol2_puts: '-',
        delta_puts: '1.00',
      },
    ],
  },
];

function List() {
  const [ivChecked, setIVChecked] = useState(true);
  const [lastChecked, setLastChecked] = useState(true);

  return (
    <div>
      <div>
        <Label>
          <Checkbox checked={lastChecked} onChange={setLastChecked} />
          Last
        </Label>
        <Label>
          <Checkbox checked={ivChecked} onChange={setIVChecked} />
          Implied Volatility
        </Label>
      </div>
      <DataView
        heading="3 Apr 2020"
        fields={data[0].title}
        entries={[
          data[0].content[0],
          data[0].content[1],
          // [ '123', '456', '789' ]
        ]}
        renderEntry={({
          // last_calls,
          size_calls,
          iv_calls,
          bid_calls,
          ask_calls,
          iv2_calls,
          size2_calls,
          vol2_calls,
          delta_calls,
          strike,
          last_puts,
          size_puts,
          iv_puts,
          bid_puts,
          ask_puts,
          iv2_puts,
          size2_puts,
          vol2_puts,
          delta_puts,
        }) => [
          // <IdentityBadge entity={account} />,
          // <GreenStyle>{last_calls}</GreenStyle>,
          <GreenStyle>{size_calls}</GreenStyle>,
          <GreenStyle>{iv_calls}</GreenStyle>,
          <GreenStyle>{bid_calls}</GreenStyle>,
          <GreenStyle>{ask_calls}</GreenStyle>,
          <GreenStyle>{iv2_calls}</GreenStyle>,
          <GreenStyle>{size2_calls}</GreenStyle>,
          <GreenStyle>{vol2_calls}</GreenStyle>,
          <GreenStyle>{delta_calls}</GreenStyle>,
          <GrayStyle>{strike}</GrayStyle>,
          <div>{last_puts}</div>,
          <div>{size_puts}</div>,
          <div>{iv_puts}</div>,
          <div>{bid_puts}</div>,
          <div>{ask_puts}</div>,
          <div>{iv2_puts}</div>,
          <div>{size2_puts}</div>,
          <div>{vol2_puts}</div>,
          <div>{delta_puts}</div>,
        ]}
      />
    </div>
  );
}

export default List;

const Label = styled.div`
  height: 16px;
  font-size: 14px;
  color: #ffffff;
  margin: 20px 0 15px 0;
`;

const GrayStyle = styled.div`
  background: gray;
`;
const GreenStyle = styled.div`
  background: rgba(13, 243, 11, 0.05);
`;
