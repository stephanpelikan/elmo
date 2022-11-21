import { Configuration as GuiConfiguration, CarSharingApi, DriverApi } from './gui';
import { Dispatch } from '../AppContext';
import { buildFetchApi } from './fetchApi';

const getCarSharingGuiApi = (dispatch: Dispatch): CarSharingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new CarSharingApi(config);
};

const getDriverGuiApi = (dispatch: Dispatch): DriverApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new DriverApi(config);
};

export {
    getCarSharingGuiApi,
    getDriverGuiApi,
  };
