import { Configuration as GuiConfiguration, CarSharingApi } from './gui';
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

export {
    getCarSharingGuiApi
  };
