import React from 'react'
import { Header, IdentityBadge, IconCircleCheck } from '@aragon/ui'

import { Comment } from '../common'

type CompleteCreate = {
  address: string,
  isFactoryOwner: boolean,
}

function ComplateCreate({ address, isFactoryOwner }: CompleteCreate) {
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
      {!isFactoryOwner
        ? <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        <Comment text="Please contact the opyn team to set detail information on your option" />
        </div>
        : <></>}
    </div>
  )

}

export default ComplateCreate