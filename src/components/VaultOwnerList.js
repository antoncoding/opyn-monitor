import React, { Component } from 'react'
import { LoadingRing, 
  DataView,
  IdentityBadge,
} from '@aragon/ui'
import { getAllVaultOwners } from '../utils/graph'
import { getLiquidationInfo } from '../utils/infura'
class VaultOwnerList extends Component {

  state = {
    isLoading: true,
    owners: []
  }

  componentDidMount = async() => {
    const ownerAddrs = await getAllVaultOwners()
    const owners = await getLiquidationInfo(ownerAddrs)
    this.setState({
      owners,
      isLoading: false
    })

  }

  render() {
    return (
      this.state.isLoading?  <LoadingRing/> : 
      <DataView
      fields={['Owner', 'Max oToken Liquidatable']}
      entries={ this.state.owners }
      renderEntry={({ account, maxLiquidatable }) => {
        return [<IdentityBadge entity={account} shorten={false} />, <div>{maxLiquidatable}</div>]
      }}
      />
    
    )
  }
}

export default VaultOwnerList
