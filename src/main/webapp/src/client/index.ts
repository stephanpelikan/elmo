import { Configuration, GuiApi } from './gui';

const buildGuiApi = (): GuiApi => {
  const config = new Configuration({
    basePath: '/api/v1.0'
  });
  return new GuiApi(config);
};

const guiApi = buildGuiApi();

export { guiApi };
