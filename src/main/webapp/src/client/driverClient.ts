import { Configuration as GuiConfiguration, CarSharingApi, DriverApi } from './gui';
import { Dispatch } from '../AppContext';
import { buildFetchApi } from '../utils/fetchApi';
import { WakeupSseCallback } from '../components/SseProvider';

const getCarSharingGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): CarSharingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new CarSharingApi(config);
};

const getDriverGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): DriverApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new DriverApi(config);
};

export {
    getCarSharingGuiApi,
    getDriverGuiApi,
  };
