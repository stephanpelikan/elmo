import React from 'react';
import { User, Oauth2Client, MemberApplicationForm, UserStatus } from './client/gui';
import { guiApi } from './client';

type Action =
    | { type: 'updateOauth2Clients', oauth2Clients: Array<Oauth2Client> }
    | { type: 'updateCurrentUser', user: User }
    | { type: 'memberApplicationFormSubmitted' };
type Dispatch = (action: Action) => void;
type State = {
  oauth2Clients: Array<Oauth2Client> | null,
  currentUser: User | null;
};

const AppContext = React.createContext<
  {state: State; dispatch: Dispatch} | undefined
>(undefined);

const appContextReducer: React.Reducer<State, Action> = (state, action) => {
  let newState: State;
  switch (action.type) {
  case 'updateCurrentUser':
    newState = {
      ...state,
      currentUser: action.user,
    };
    break;
  case 'memberApplicationFormSubmitted':
    newState = {
      ...state,
      currentUser: {
        ...state.currentUser,
        status: UserStatus.ApplicationSubmitted,
      }
    };
    break;
  case 'updateOauth2Clients':
    newState = {
      ...state,
      oauth2Clients: action.oauth2Clients
    };
    break;
  default: throw new Error(`Unhandled app-context action-type: ${action}`);
	}
	return newState;
};

type AppContextProviderProps = {
	children?: React.ReactNode;
};

const AppContextProvider = ({ children }: AppContextProviderProps) => {
	const [state, dispatch] = React.useReducer(appContextReducer, { currentUser: null, oauth2Clients: null });
	const value = { state, dispatch };
	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const fetchOauth2Clients = async (appContextState: State, dispatch: Dispatch): Promise<Array<Oauth2Client>> => {
  if (appContextState.oauth2Clients != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.oauth2Clients);
    });
  }
  try {
    const oauth2Clients = await guiApi.oauth2Clients();
    dispatch({ type: 'updateOauth2Clients', oauth2Clients });
  } catch (error) {
    console.error(error);
  }
}

const fetchCurrentUser = async (appContextState: State, dispatch: Dispatch): Promise<User> => {
  if (appContextState.currentUser != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.currentUser);
    });
  }
  try {
    const user = await guiApi.currentUser();
    dispatch({ type: 'updateCurrentUser', user });
  } catch (error) {
    console.error(error);
  }
}

const memberApplicationFormSubmitted = (appContextState: State, dispatch: Dispatch) => {
  dispatch({ type: 'memberApplicationFormSubmitted' });
}

function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a <AppContext>...</AppContext>');
  }
  return context;
}

export { AppContextProvider, useAppContext, fetchOauth2Clients, fetchCurrentUser, memberApplicationFormSubmitted }
