import { useState, useEffect } from 'react'
import { initOnboard } from '../utils/web3'

export const useConnectedUser = () => {
  const [user, setUser] = useState<string>('')
  useEffect(() => {
    initOnboard((address: string | undefined)=>{
      if(!address) {
        setUser('')
      } else {
        setUser(address)
      }
    })
  }, 
  []);
  
  return { user, setUser }

}