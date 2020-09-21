import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Header, Tabs
} from '@aragon/ui';

import { Comment, CheckBox } from '../common';
import { getPreference, storePreference } from '../../utils/storage';
import { useOptions } from '../../hooks'
import { EthOptionList } from './EthOptionList'
import { InsuranceList } from './InsuranceList'
import { OtherOptionList } from './OtherOptionList'
import tracker from '../../utils/tracker';

function AllContracts() {
  useEffect(() => {
    tracker.pageview('/options/');
  }, []);

  const { isInitializing,
    insurances,
    ethCalls,
    ethPuts,
    otherPuts,
    otherCalls
  } = useOptions()

  const storedOptionTab = getPreference('optionTab', '0');
  const storedShowExpired = getPreference('showExpired', '0');

  const [tabSelected, setTabSelected] = useState(parseInt(storedOptionTab, 10));
  const [showExpired, setShowExpired] = useState(storedShowExpired === '1'); // whether to show expired options
  // const [insurancePage, setInsurancePage] = useState(0)

  const history = useHistory();
  const goToToken = useCallback((addr: string) => {
    history.push(`/option/${addr}`);
  }, [history]);

  return (
    <>
      <Header primary="All Contracts" />
      <div style={{ display: 'flex' }}>
        <Comment text="Choose an option contract to proceed." />
        <div style={{ marginLeft: 'auto' }}>
          <CheckBox
            text="Expired"
            onCheck={(checked) => {
              storePreference('showExpired', checked ? '1' : '0');
              setShowExpired(checked);
            }}
            checked={showExpired}
          />
        </div>
      </div>
      <Tabs
        items={['DeFi Insurance', 'ETH Options', 'Other Options']}
        selected={tabSelected}
        onChange={(choice: number) => {
          setTabSelected(choice);
          storePreference('optionTab', choice.toString());
        }}
      />

      {tabSelected === 0 &&
        <InsuranceList 
          isInitializing={isInitializing}
          insurances={insurances}
          showExpired={showExpired}
          goToToken={goToToken}
        />
      }
      {tabSelected === 1 &&
        <EthOptionList
          isInitializing={isInitializing}
          entries={ethCalls.concat(ethPuts)}
          showExpired={showExpired}
          goToToken={goToToken}
        />}
      {tabSelected === 2 &&
        <OtherOptionList
          isInitializing={isInitializing}
          entries={otherCalls.concat(otherPuts)}
          showExpired={showExpired}
          goToToken={goToToken}
        />
      }

    </>
  );
}

export default AllContracts;
