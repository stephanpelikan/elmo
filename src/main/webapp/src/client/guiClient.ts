import { Configuration as GuiConfiguration, GuiApi, Middleware, ResponseContext } from './gui';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';

const REFRESH_TOKEN_HEADER = "X-Refresh-Token";

const RefreshAwareMiddleware: Middleware = {
  
  post(context: ResponseContext): Promise<Response | void> {

    if (context.response.status === 401) {
      
      const headers: Headers = new Headers(context.init.headers);
      const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_HEADER);
      console.log(storedRefreshToken, !!storedRefreshToken);
      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {

        window.localStorage.removeItem(REFRESH_TOKEN_HEADER);
        
        const init = {
          ...context.init,
          headers: {
            ...context.init.headers,
            [REFRESH_TOKEN_HEADER]: storedRefreshToken
          }
        }
        return context.fetch(new Request(context.url, init));
        
      }
      
    }
    
    const refreshToken = context.response.headers.get(REFRESH_TOKEN_HEADER);
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_HEADER, refreshToken);
    }
    
    return new Promise((resolve, reject) => resolve(context.response));
    
  }
  
};

const getGuiApi = (dispatch: Dispatch): GuiApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new GuiApi(config);
};

export { RefreshAwareMiddleware};

export default getGuiApi;
