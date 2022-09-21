import { Configuration as AdminstrationConfiguration, AdministrationApi, CarsApi } from './administration';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { RefreshAwareMiddleware } from './guiClient';

const getAdministrationApi = (dispatch: Dispatch, token?: string): AdministrationApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  
  return new AdministrationApi(config);
};

const getCarAdministrationApi = (dispatch: Dispatch): CarsApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  
  return new CarsApi(config);
};

export { getAdministrationApi, getCarAdministrationApi };
