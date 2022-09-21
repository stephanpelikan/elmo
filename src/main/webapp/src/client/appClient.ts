import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { REFRESH_TOKEN_HEADER } from './guiClient';
import { FLUTTER_AUTH_TOKEN, FLUTTER_REFRESH_TOKEN } from '../app/FlutterSupport';
import { AppApi, Configuration, FetchParams, Middleware, RequestContext, ResponseContext } from './app';

const ELMO_USER_AGENT = 'Elmo-App';

const AppMiddleware: Middleware = {
  
  pre(context: RequestContext): Promise<FetchParams | void> {
    
    const authToken = window.localStorage.getItem(FLUTTER_AUTH_TOKEN);
    let init = {
        ...context.init,
      };
    if (authToken) {
      init.headers = {
          ...init.headers,
          'User-Agent': ELMO_USER_AGENT,
          'Authorization': `Bearer token=${authToken}`,
        };
    }
    
    return new Promise((resolve, reject) => resolve({ url: context.url, init }));
    
  },
  
  post(context: ResponseContext): Promise<Response | void> {

    if (context.response.status === 401) {
      
      const headers: Headers = new Headers(context.init.headers);
      const storedRefreshToken = window.localStorage.getItem(FLUTTER_REFRESH_TOKEN);

      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {

        window.localStorage.removeItem(FLUTTER_REFRESH_TOKEN);
        
        const init = {
          ...context.init,
          headers: {
            ...context.init.headers,
            'UserAgent': ELMO_USER_AGENT,
            [REFRESH_TOKEN_HEADER]: storedRefreshToken
          }
        }
        return context.fetch(new Request(context.url, init));
        
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
