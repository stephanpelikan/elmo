import { Configuration as AdminstrationConfiguration, AdministrationApi } from './administration';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { RefreshAwareMiddleware } from './guiClient';

const getAdministrationApi = (dispatch: Dispatch): AdministrationApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  
  return new AdministrationApi(config);
};

export default getAdministrationApi;
