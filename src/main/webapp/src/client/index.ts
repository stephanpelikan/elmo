import { Configuration as GuiConfiguration, GuiApi } from './gui';
import { Configuration as AdminstrationConfiguration, FetchAPI, AdministrationApi } from './administration';
import { Dispatch } from '../AppContext';

const getGuiApi = (dispatch: Dispatch): GuiApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new GuiApi(config);
};

const buildFetchApi = (dispatch: Dispatch): FetchAPI => {
  
  return (input, init): Promise<Response> => {
    const response = fetch(input, init);
    return new Promise((resolve, reject) => {
        response.then(r => {
          if (r.redirected) {
            document.location.href = r.url;
            return;
          }
          if (r.status === 500) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'unexpected'
              }});
          } else if (r.status === 400) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'validation'
              }});
          } else if (r.status === 403) {
            dispatch({ type: 'toast', toast: {
                namespace: 'app',
                title: 'error',
                message: 'forbidden'
              }});
          }
          resolve(response);
        }).catch(error => {
          dispatch({ type: 'toast', toast: {
              namespace: 'app',
              title: 'error',
              message: 'unexpected'
            }});
          resolve(error);
        });
      });
  };

};

const getAdministrationApi = (dispatch: Dispatch): AdministrationApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new AdministrationApi(config);
};

export { getGuiApi, getAdministrationApi };
