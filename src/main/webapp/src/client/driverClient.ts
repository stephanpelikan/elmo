import { Configuration as GuiConfiguration, CarSharingApi, PlannerApi, BlockingApi } from './gui';
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

const getBlockingGuiApi = (
    dispatch: Dispatch,
    wakeupSseCallback?: WakeupSseCallback
): BlockingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new BlockingApi(config);
};

const getPlannerGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): PlannerApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new PlannerApi(config);
};

export {
    getCarSharingGuiApi,
    getBlockingGuiApi,
    getPlannerGuiApi,
  };
