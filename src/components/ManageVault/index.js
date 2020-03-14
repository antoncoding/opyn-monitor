import React from 'react';

import { 
  useParams, 
  // useHistory 
} from 'react-router-dom';

import ManageMyVault from './Manage'
// import { Button } from '@aragon/ui';

function ManageVault({user}) {
  let { token, owner } = useParams();
  // const history = useHistory()
  return (
    <>
      <ManageMyVault owner={owner} user={user} token={token}/>
      {/* <div style={{ padding: 60, textAlign: 'center' }}>
        <h4 style={{padding: '1%'}}> Buy, Sell or Invest your oToken?</h4>
        {<Button 
          label={'Exchange'}
          onClick={()=>{
            history.push(`/exchange/${token}`)
          }}
        />}
      </div> */}
    </>
  );
}

export default ManageVault;
