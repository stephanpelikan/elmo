import { Configuration as GuiConfiguration, CarSharingApi, DriverApi } from './gui';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';
import { RefreshAwareMiddleware } from './guiClient';

const getCarSharingGuiApi = (dispatch: Dispatch): CarSharingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new CarSharingApi(config);
};

const getDriverGuiApi = (dispatch: Dispatch): DriverApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
    middleware: [ RefreshAwareMiddleware ],
  });
  return new DriverApi(config);
};

export {
    getCarSharingGuiApi,
    getDriverGuiApi,
  };
