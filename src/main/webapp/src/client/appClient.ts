import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { REFRESH_TOKEN_HEADER } from './guiClient';
import { FLUTTER_AUTH_TOKEN, FLUTTER_REFRESH_TOKEN } from '../app/FlutterSupport';
import { AppApi, Configuration, FetchParams, Middleware, RequestContext, ResponseContext } from './app';

const AppMiddleware: Middleware = {
  
  pre(context: RequestContext): Promise<FetchParams | void> {
    
    const authToken = window.localStorage.getItem(FLUTTER_AUTH_TOKEN);
    let init = {
        ...context.init,
      };
    if (authToken) {
      
      init.headers = {
          ...init.headers,
          'Authorization': `Bearer ${authToken}`,
        };
        
    } else {
      
      const headers: Headers = new Headers(context.init?.headers);
      const storedRefreshToken = window.localStorage.getItem(FLUTTER_REFRESH_TOKEN);

      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {

        init.headers = {
            ...context.init?.headers,
            'Authorization': `RefreshToken ${storedRefreshToken}`,
          };
        
      }
      
    }
    
    return new Promise((resolve, reject) => resolve({ url: context.url, init }));
    
  },
  
  post(context: ResponseContext): Promise<Response | void> {

    if (context.response.status === 401) {

      const headers: Headers = new Headers(context.init.headers);
      
      window.localStorage.removeItem(FLUTTER_AUTH_TOKEN);
      if (headers.get('Authorization')?.startsWith('RefreshToken ')) {
        window.localStorage.removeItem(FLUTTER_REFRESH_TOKEN);
      }

      const storedRefreshToken = window.localStorage.getItem(FLUTTER_REFRESH_TOKEN);
      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {

        return new Promise((resolve, reject) => {
            context
                .fetch(new Request(context.url, context.init))
                .then(result => {
                    window.localStorage.removeItem(FLUTTER_REFRESH_TOKEN);
                    resolve(result);
                  })
                .catch(error => {
                  if (error.response) { // server denied access
                    window.localStorage.removeItem(FLUTTER_REFRESH_TOKEN);
                  }
                  reject(error);
                });
          });
        
      }
      
    }
    
    const refreshToken = context.response.headers.get(REFRESH_TOKEN_HEADER);
    if (refreshToken) {
      
      window.localStorage.setItem(FLUTTER_REFRESH_TOKEN, refreshToken);
      
      const authToken = context.response.headers.get('Authorization');
      if (authToken) {
        window.localStorage.setItem(FLUTTER_AUTH_TOKEN, authToken);
      } else {
        window.localStorage.removeItem(FLUTTER_AUTH_TOKEN);
      }
    }
    
    return new Promise((resolve, reject) => resolve(context.response));
    
  }
  
};

const getAppApi = (dispatch: Dispatch, token?: string): AppApi => {
  const config = new Configuration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ AppMiddleware ],
  });
  
  return new AppApi(config);
};

export { getAppApi };
