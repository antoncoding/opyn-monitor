import React, { ReactChild } from 'react'
import { Box } from '@aragon/ui'

import { SectionTitle, Comment } from '../common'

type FieldCardProps = {
  title:string,
  description:string, 
  child: ReactChild
}

function FiledCard({title, description, child}:FieldCardProps){
  
  return (
    <Box>
      <div style={{display:'flex', padding:100}}>
        <div style={{width:'40%'}}>
        <SectionTitle title={title}/>
        <div style={{paddingLeft:5}}><Comment text={description} /></div>
        </div>
        <div style={{width:'60%', padding:30}}>
          {child}
        </div>
      </div>
    </Box>
  )
  
}

export default FiledCard