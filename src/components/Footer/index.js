import React from 'react'

import { Link } from '@aragon/ui'

function Footer({theme}) {
  var style = {
    backgroundColor: theme === 'light' ? "#F8F8F8" : '#35425e' ,
    textAlign: "center",
    padding: "17px",
    position: "fixed",
    left: "0",
    bottom: "0",
    height: "50px",
    width: "100%",
    fontSize: "12px"
  }

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