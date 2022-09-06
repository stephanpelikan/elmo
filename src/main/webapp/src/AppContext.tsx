import React, { useCallback, useMemo } from 'react';
import { User, Oauth2Client, UserStatus, GuiApi, AppInformation } from './client/gui';
import getGuiApi from './client/guiClient';
import { StatusType } from 'grommet';

type Action =
    | { type: 'updateOauth2Clients', oauth2Clients: Array<Oauth2Client> }
    | { type: 'updateAppInformation', appInformation: AppInformation }
    | { type: 'updateCurrentUser', user: User | null }
    | { type: 'memberApplicationFormSubmitted' }
    | { type: 'memberApplicationFormRevoked' }
    | { type: 'showMenu', visibility: boolean }
    | { type: 'toast', toast: Toast | undefined }
    | { type: 'updateTitle', title: string, intern?: boolean };
export type Dispatch = (action: Action) => void;
export type Toast = {
  namespace: string;
  title: string | undefined;
  message: string;
  status?: StatusType;
};
type State = {
  oauth2Clients: Array<Oauth2Client> | null;
  appInformation: AppInformation | null;
  currentUser: User | null | undefined;
  showMenu: boolean;
  title: string;
  intern: boolean;
  toast: Toast | undefined;
};

const AppContext = React.createContext<{
  state: State;
  dispatch: Dispatch;
  guiApi: GuiApi;
  toast: (toast: Toast) => void;
  fetchOauth2Clients: () => void;
  fetchAppInformation: () => void;
  fetchCurrentUser: (resolve: (value: User | null) => void, reject: (error: any) => void, forceUpdate?: boolean) => void;
  showMenu: (visibility: boolean) => void;
  setAppHeaderTitle: (title: string, intern?: boolean) => void;
  memberApplicationFormSubmitted: () => void;
  memberApplicationFormRevoked: () => void;
} | undefined>(undefined);

const appContextReducer: React.Reducer<State, Action> = (state, action) => {
  let newState: State;
  switch (action.type) {
  case 'updateCurrentUser':
    newState = {
      ...state,
      currentUser: action.user,
    };
    break;
  case 'memberApplicationFormRevoked':
    newState = {
      ...state,
      currentUser: {
        ...state.currentUser,
        status: UserStatus.DataInvalid,
      }
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
      oauth2Clients: action.oauth2Clients,
    };
    break;
  case 'updateAppInformation':
    newState = {
      ...state,
      appInformation: action.appInformation,
    };
    break;
  case 'showMenu': {
    newState = {
      ...state,
      showMenu: action.visibility,
    };
    break;
  }
  case 'toast': {
    newState = {
      ...state,
      toast: action.toast,
    };
    break;
  }
  case 'updateTitle': {
    newState = {
      ...state,
      title: action.title,
      intern: action.intern ? true : false,
    };
    break;
  }
  default: throw new Error(`Unhandled app-context action-type: ${action}`);
	}
	return newState;
};

type AppContextProviderProps = {
	children?: React.ReactNode;
};

const AppContextProvider = ({ children }: AppContextProviderProps) => {
	const [state, dispatch] = React.useReducer(appContextReducer, {
    currentUser: undefined,
    oauth2Clients: null,
    appInformation: null,
    showMenu: false,
    title: 'app',
    toast: undefined,
    intern: false,
  });

  const guiApi = useMemo(() => getGuiApi(dispatch), [ dispatch ]);
  
  const fetchOauth2Clients = useCallback(() => fetchOauth2ClientsFromGuiApi(state, dispatch, guiApi),
      [ guiApi, state ]);
  const fetchAppInformation = useCallback(() => fetchAppInformationFromGuiApi(state, dispatch, guiApi),
      [ guiApi, state ]);
  const fetchCurrentUser = useCallback((resolve: (value: User | null) => void, reject: (error: any) => void, forceUpdate?: boolean) => fetchCurrentUserFromGui(state, dispatch, guiApi, resolve, reject, forceUpdate),
      [ guiApi, state ]);
  const showMenu = useCallback((visibility: boolean) => setShowMenu(dispatch, visibility),
      [ dispatch ]);
  const setAppHeaderTitle = useCallback((title: string, intern?: boolean) => updateTitle(dispatch, title, intern),
      [ dispatch ]); 
  const memberApplicationFormSubmitted = useCallback(() => doMemberApplicationFormSubmitted(dispatch),
      [ dispatch ]);
  const memberApplicationFormRevoked = useCallback(() => doMemberApplicationFormRevoked(dispatch),
      [ dispatch ]);
	const value = {
    state,
    dispatch,
    guiApi,
    toast: (t: Toast) => dispatch({ type: 'toast', toast: t }),
    fetchOauth2Clients,
    fetchAppInformation,
    fetchCurrentUser,
    showMenu,
    setAppHeaderTitle,
    memberApplicationFormSubmitted,
    memberApplicationFormRevoked,
  };
  
	return (<AppContext.Provider value={value}>
	   {children}
   </AppContext.Provider>);
};

const fetchOauth2ClientsFromGuiApi = async (appContextState: State, dispatch: Dispatch, guiApi: GuiApi) => {
  if (appContextState.oauth2Clients != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.oauth2Clients as Oauth2Client[]);
    });
  }
  try {
    const oauth2Clients = await guiApi.oauth2Clients();
    dispatch({ type: 'updateOauth2Clients', oauth2Clients });
  } catch (error) {
    console.error(error);
  }
}

const fetchAppInformationFromGuiApi = async (appContextState: State, dispatch: Dispatch, guiApi: GuiApi) => {
  if (appContextState.appInformation != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.appInformation as AppInformation);
    });
  }
  try {
    const appInformation = await guiApi.appInformation();
    dispatch({ type: 'updateAppInformation', appInformation });
  } catch (error) {
    console.error(error);
  }
}

const fetchCurrentUserFromGui = async (appContextState: State,
    dispatch: Dispatch,
    guiApi: GuiApi,
    resolve: (value: User | null) => void,
    reject: (error: any) => void,
    forceUpdate?: boolean) => {
  if (!forceUpdate && appContextState.currentUser != null) {
    resolve(appContextState.currentUser);
    return;
  }
  try {
    const user = await guiApi.currentUser();
    dispatch({ type: 'updateCurrentUser', user });
    resolve(user);
  } catch (error: any) {
    if (error['status'] !== 404) {
      reject(error);
    }
    dispatch({ type: 'updateCurrentUser', user: null });
    resolve(null);
  }
}

const doMemberApplicationFormSubmitted = (dispatch: Dispatch) => {
  dispatch({ type: 'memberApplicationFormSubmitted' });
}

const doMemberApplicationFormRevoked = (dispatch: Dispatch) => {
  dispatch({ type: 'memberApplicationFormRevoked' });
}

const setShowMenu = (dispatch: Dispatch, visibility: boolean) => {
  dispatch({ type: 'showMenu', visibility });
}

const updateTitle = (dispatch: Dispatch, title: string, intern?: boolean) => {
  dispatch({ type: 'updateTitle', title, intern });
}

const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a <AppContext>...</AppContext>');
  }
  return context;
}

// see https://blog.logrocket.com/react-suspense-data-fetching/
const supportSuspense = <T extends any>(promise: Promise<T>) => {
  
  let status = 'pending';
  let response: T;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      response = res;
    },
    (err) => {
      status = 'error';
      response = err;
    },
  );
  
  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  }

  // eslint-disable-next-line
  return useCallback(read, [ ]);

}
  
export {
  AppContextProvider,
  useAppContext,
  supportSuspense,
}
