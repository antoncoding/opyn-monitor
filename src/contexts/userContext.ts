import { createContext } from 'react';
 
export interface UserContext {
  user: string,
  setUser: (user: string) => void;
}

export const USER_DEFAULT = {
  user: '',
  setUser: (user: string):void => {}
}

export const userContext = createContext(USER_DEFAULT);
