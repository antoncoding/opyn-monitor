import React, { Component } from 'react'
import { LoadingRing, 
  DataView,
  Button,
  IdentityBadge,
} from '@aragon/ui'
import { getAllVaultOwners } from '../utils/graph'
import { getVaults } from '../utils/infura'
import { liquidate } from '../utils/web3'
class VaultOwnerList extends Component {

  state = {
    isLoading: true,
    vaults: [] // { account, maxLiquidatable } []
  }

  componentDidMount = async() => {
    const ownerAddrs = await getAllVaultOwners()
    const vaults = await getVaults(ownerAddrs)
    this.setState({
      vaults,
      isLoading: false
    })
  }

  render() {
    return (
      this.state.isLoading?  <LoadingRing/> : 
      <DataView
      fields={['Owner', 'Status']}
      entries={ this.state.vaults }
      renderEntry={({ owner, maxLiquidatable }) => {
        return [
        <IdentityBadge entity={owner} shorten={false} />, 
        maxLiquidatable > 0 ?
        <Button onClick={ ()=> liquidate(owner, maxLiquidatable)} >
          Can Liquidate {maxLiquidatable}
        </Button> :
        <div> safe </div>
      ]
      }}
      />
    
    )
  }
}

export default VaultOwnerList
