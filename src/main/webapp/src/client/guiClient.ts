import { Configuration as GuiConfiguration, GuiApi } from './gui';
import { Dispatch } from '../AppContext';
import buildFetchApi from './fetchApi';

const getGuiApi = (dispatch: Dispatch): GuiApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch),
  });
  return new GuiApi(config);
};

export default getGuiApi;
