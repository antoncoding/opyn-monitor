import React from 'react'

import { Link } from '@aragon/ui'

var style = {
  backgroundColor: "#F8F8F8",
  borderTop: "1px solid #E7E7E7",
  textAlign: "center",
  padding: "20px",
  position: "fixed",
  left: "0",
  bottom: "0",
  height: "60px",
  width: "100%",
  fontSize: "13px"
}

function Footer() {
  return (  
    <div style={style}>
      Powered By {' '}
      <Link  external={true} href="https://opyn.co/#/">Opyn</Link>{', '} 
      <Link  external={true} href="https://ui.aragon.org/">Aragon UI</Link>{', '}  
      <Link  external={true} href="https://www.blocknative.com/">Blocknative</Link>{'. '}  
      Hosted on <Link  external={true} href="https://github.com/antoncoding/opyn-liquidator">GitHub</Link>.
    </div>
  )
}

export default Footer