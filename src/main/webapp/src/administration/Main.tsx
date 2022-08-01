import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { TaskCards } from './TaskCards';
import { Main as Onboardings } from './onboarding/Main';
import i18n from '../i18n';

i18n.addResources('en', 'administration', {
      "title.long": 'Administration',
      "title.short": 'Administration',
      "url-onboardings": "/onboardings",
    });
i18n.addResources('de', 'administration', {
      "title.long": 'Verwaltung',
      "title.short": 'Verwaltung',
      "url-onboardings": "/anmeldungen",
    });

const Main = () => {

  const { t } = useTranslation('administration');

  return (
    <Routes>
      <Route path={t('url-onboardings') + '/*'} element={<Onboardings />} />
      <Route path='/' element={<TaskCards />} />
    </Routes>);
}

export default Main;
