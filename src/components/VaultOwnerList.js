import React, { Component } from 'react'
import { LoadingRing, 
  DataView,
  IdentityBadge,
} from '@aragon/ui'
import { getAllVaultOwners } from '../utils/graph'

class VaultOwnerList extends Component {

  state = {
    isLoading: true,
    owners: []
  }

  componentDidMount = async() => {
    const owners = await getAllVaultOwners()
    this.setState({
      owners,
      isLoading: false
    })

  }

  render() {
    return (
      this.state.isLoading?  <LoadingRing/> : 
      <DataView
      fields={['Owner', 'Status']}
      entries={
        this.state.owners.map(owner => { return {
          account: owner, status: "Safe"
        } })
    }
      renderEntry={({ account, status }) => {
        return [<IdentityBadge entity={account} />, <div>{status}</div>]
      }}
      />
    
    )
  }
}

export default VaultOwnerList
