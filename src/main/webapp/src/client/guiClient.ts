import { Configuration as GuiConfiguration, FetchParams, LoginApi, MemberApi, Middleware, OnboardingApi, RequestContext, ResponseContext } from './gui';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { Cookies } from "react-cookie";

const REFRESH_TOKEN_HEADER = "X-Refresh-Token";

const RefreshAwareMiddleware: Middleware = {
  
  pre(context: RequestContext): Promise<FetchParams | void> {

    let init = {
        ...context.init,
      };
    
    const cookies = new Cookies();
    if (!cookies.get("hasToken")) {
      
      const headers: Headers = new Headers(context.init?.headers);
      const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_HEADER);
      
      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {
            
        init = {
          ...context.init,
          headers: {
            ...context.init?.headers,
            [REFRESH_TOKEN_HEADER]: storedRefreshToken
          }
        }
        
      }

    }
    
    return new Promise((resolve, reject) => resolve({ url: context.url, init }));
    
  },
  
  post(context: ResponseContext): Promise<Response | void> {

    if (context.response.status === 401) {
      
      const headers: Headers = new Headers(context.init?.headers);
      const storedRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_HEADER);

      if (!Boolean(headers.get(REFRESH_TOKEN_HEADER))
          && storedRefreshToken) {

        const init = {
          ...context.init,
          headers: {
            ...context.init?.headers,
            [REFRESH_TOKEN_HEADER]: storedRefreshToken
          }
        }
        
        return new Promise((resolve, reject) => {
            context
                .fetch(new Request(context.url, init))
                .then(result => {
                    window.localStorage.removeItem(REFRESH_TOKEN_HEADER);
                    resolve(result);
                  })
                .catch(error => {
                  if (error.response) { // server denied access
                    window.localStorage.removeItem(REFRESH_TOKEN_HEADER);
                  }
                  reject(error);
                });
          });
        
      }
      
    }
    
    const refreshToken = context.response.headers.get(REFRESH_TOKEN_HEADER);
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_HEADER, refreshToken);
    }
    
    return new Promise((resolve, reject) => resolve(context.response));
    
  }
  
};

const getLoginGuiApi = (dispatch: Dispatch): LoginApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new LoginApi(config);
};

const getOnboardingGuiApi = (dispatch: Dispatch): OnboardingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new OnboardingApi(config);
};

const getMemberGuiApi = (dispatch: Dispatch): MemberApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new MemberApi(config);
};

export { RefreshAwareMiddleware, REFRESH_TOKEN_HEADER };

export {
    getLoginGuiApi,
    getOnboardingGuiApi,
    getMemberGuiApi,
  };

