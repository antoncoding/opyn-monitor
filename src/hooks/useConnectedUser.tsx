import { useState, useCallback } from 'react'
// import { isCompositeComponent } from 'react-dom/test-utils'

export const useConnectedUser = () => {
  const [user, updateUser] = useState<string>('')

  const setUser = useCallback((user: string): void => {
    updateUser(user)
  }, [])
 
  return { user, setUser }

}