import React from 'react';
import { User } from 'client/gui';

export type AppContextProps = {
  currentUser: User | null;
};

const AppContext = React.createContext<AppContextProps>({
  currentUser: null
});

export default AppContext;
