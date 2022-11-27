import { Configuration as AdminstrationConfiguration, OnboardingApi, CarApi, MemberApi } from './administration';
import { Dispatch } from '../AppContext';
import { buildFetchApi } from '../utils/fetchApi';
import { WakeupSseCallback } from 'components/SseProvider';

const getCarAdministrationApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): CarApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  
  return new CarApi(config);
};

const getOnboardingAdministrationApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): OnboardingApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  
  return new OnboardingApi(config);
};

const getMemberAdministrationApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): MemberApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  
  return new MemberApi(config);
};

export {
    getCarAdministrationApi,
    getOnboardingAdministrationApi,
    getMemberAdministrationApi,
  };
