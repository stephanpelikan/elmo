import { Dispatch } from '../AppContext';
import { FLUTTER_AUTH_TOKEN, FLUTTER_REFRESH_TOKEN } from '../app/FlutterSupport';
import { AppApi, Configuration, FetchAPI } from './app';
import { REFRESH_TOKEN_HEADER } from './fetchApi';

const doRequest = (
    dispatch: Dispatch,
    resolve: (response: Response) => void,
    reject: (error: any) => void,
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    refreshToken?: string | null,
  ) => {

  navigator.locks.request(
      'elmo-webapp',
      {
        mode: Boolean(refreshToken) ? 'exclusive' : 'shared'
      },
      async _lock => {

        try {

          const storedAuthToken = window.localStorage.getItem(FLUTTER_AUTH_TOKEN);
          const storedRefreshToken = window.localStorage.getItem(FLUTTER_REFRESH_TOKEN);
          const isRefresh = Boolean(storedRefreshToken) && storedRefreshToken === refreshToken;
          const initWithToken = {
              ...init,
              headers: {
                ...init?.headers,
                'Authorization': isRefresh
                    ? `RefreshToken ${storedRefreshToken}`
                    : Boolean(storedAuthToken)
                    ? `Bearer ${storedAuthToken}`
                    : undefined
              }
            };
          
          // @ts-ignore
          const response = await fetch(input, initWithToken);
          
          // save new refresh-token and auth-token regardless the response code
          // because if it's given, it is valid
          const responseRefreshToken = response.headers.get(REFRESH_TOKEN_HEADER);
          if (responseRefreshToken) {
            window.localStorage.setItem(FLUTTER_REFRESH_TOKEN, responseRefreshToken);
            const responseAuthToken = response.headers.get('authorization');
            if (responseAuthToken) {
              window.localStorage.setItem(FLUTTER_AUTH_TOKEN, responseAuthToken);
            } else {
              window.localStorage.removeItem(FLUTTER_AUTH_TOKEN);
            }
          }
                    
          // if an API sends a redirect, then apply it
          if (response.redirected) {
            document.location.href = response.url;
            return;
          }
          
          if (response.status === 401) {
            window.localStorage.removeItem(FLUTTER_AUTH_TOKEN);
            // if authentication is not accepted although refresh-token was
            // sent, then clean up that outdated refresh-token
            if (isRefresh && !Boolean(responseRefreshToken)) {
              window.localStorage.removeItem(FLUTTER_REFRESH_TOKEN);
            }
            // if authentication is not accepted an refresh-token is available
            // then retry using the refresh-token 
            else if (Boolean(storedRefreshToken)) {
              doRequest(dispatch, resolve, reject, input, init, storedRefreshToken);
              return;
            }
          } else if (response.status === 500) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'unexpected'
              }});
          } else if (response.status === 400) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'validation'
              }});
          } else if (response.status === 403) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'forbidden'
              }});
          }
          
          resolve(response);
          
        } catch (error: any) {
          
          dispatch({ type: 'toast', toast: {
              namespace: 'app',
              title: 'error',
              message: 'unexpected'
            }});
          reject(error);
          
        }
        
      }
    );
  
};

const buildFetchApi = (dispatch: Dispatch): FetchAPI => {
  
  return (input, init): Promise<Response> => {
      return new Promise((resolve, reject) => {
          doRequest(dispatch, resolve, reject, input, init);
        });
    };

};

const getAppApi = (dispatch: Dispatch): AppApi => {
  const config = new Configuration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new AppApi(config);
};

export { getAppApi };
