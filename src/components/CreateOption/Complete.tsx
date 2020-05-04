import React from 'react'
import { Header, IdentityBadge, IconCircleCheck } from '@aragon/ui'

import { Comment } from '../common'

type CompleteCreate = {
  address: string,
  setDetailComplete: boolean,
}

function ComplateCreate({ address, setDetailComplete }: CompleteCreate) {
  return (
    <div style={{ height: 300, paddingTop: 40 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        <Header primary="Option Created!" />
        <div style={{padding: 24}}><IconCircleCheck size="large" /></div>
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
      <IdentityBadge entity={address} shorten={false} />
      </div>
      <br></br>
      {!setDetailComplete
        ? <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        <Comment text="Remeber to set the token name and symbol!" />
        </div>
        : <></>}
    </div>
  )

}

export default ComplateCreate