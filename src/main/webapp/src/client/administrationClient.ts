import { Configuration as AdminstrationConfiguration, AdministrationApi } from './administration';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';

const getAdministrationApi = (dispatch: Dispatch): AdministrationApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new AdministrationApi(config);
};

export default getAdministrationApi;
