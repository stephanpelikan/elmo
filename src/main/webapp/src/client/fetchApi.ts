import { FetchAPI } from './gui';
import { Dispatch } from '../AppContext';

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
          resolve(r);
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

export default buildFetchApi;
