import { Configuration as AdminstrationConfiguration, OnboardingApi, CarApi, MemberApi } from './administration';
import { Dispatch } from '../AppContext';
import { buildFetchApi } from './fetchApi';

const getCarAdministrationApi = (dispatch: Dispatch): CarApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new CarApi(config);
};

const getOnboardingAdministrationApi = (dispatch: Dispatch): OnboardingApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new OnboardingApi(config);
};

const getMemberAdministrationApi = (dispatch: Dispatch): MemberApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  
  return new MemberApi(config);
};

export {
    getCarAdministrationApi,
    getOnboardingAdministrationApi,
    getMemberAdministrationApi,
  };
