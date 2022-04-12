import { Configuration as GuiConfiguration, GuiApi } from './gui';
import { Configuration as AdminstrationConfiguration, AdministrationApi } from './administration';

const buildGuiApi = (): GuiApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1'
  });
  return new GuiApi(config);
};

const guiApi = buildGuiApi();

const buildAdminstrationApi = (): AdministrationApi => {
  const config = new AdminstrationConfiguration({
    basePath: '/api/v1'
  });
  return new AdministrationApi(config);
};

const administrationApi = buildAdminstrationApi();

export { guiApi, administrationApi };
