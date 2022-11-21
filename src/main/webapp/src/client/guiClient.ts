import { Configuration as GuiConfiguration, LoginApi, MemberApi, OnboardingApi } from './gui';
import { Dispatch } from '../AppContext';
import { buildFetchApi, doLogout } from './fetchApi';

const SSE_UPDATE_URL = "/api/v1/gui/updates";

const getLoginGuiApi = (dispatch: Dispatch): LoginApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new LoginApi(config);
};

const getOnboardingGuiApi = (dispatch: Dispatch): OnboardingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new OnboardingApi(config);
};

const getMemberGuiApi = (dispatch: Dispatch): MemberApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new MemberApi(config);
};

export {
    SSE_UPDATE_URL,
    getLoginGuiApi,
    getOnboardingGuiApi,
    getMemberGuiApi,
    doLogout,
  };

