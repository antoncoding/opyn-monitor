import React, { useState } from 'react'

import {
  Header,
  Tabs
} from '@aragon/ui'

import CreateETHOption from './CreateETHOption'

const today = new Date(new Date().toDateString())
const localOffset = today.getTimezoneOffset() * 60000; // in millisecond
const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000) + localOffset);

function CreateOption({ user }: { user: string }) {

  const [selectedTab, setSelectedTab] = useState(0)


  return (
    <>
      <Header primary="Create new option" />
      <Tabs
        items={[
          'ETH Option Series',
          // 'Custom Option'
        ]}
        selected={selectedTab}
        onChange={setSelectedTab}
      />
      <CreateETHOption user={user} localOffset={localOffset} today={today} tomorrow={tomorrow} /> 
    </>
  )
}


export default CreateOption