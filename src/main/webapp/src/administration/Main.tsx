import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { TaskCards } from './TaskCards';
import { Main as Onboardings } from './onboarding/Main';
import { Main as Members } from './member/Main';
import i18n from '../i18n';

i18n.addResources('en', 'administration', {
      "title.long": 'Administration',
      "title.short": 'Administration',
      "url-onboardings": "/onboardings",
      "url-members": "/members",
    });
i18n.addResources('de', 'administration', {
      "title.long": 'Verwaltung',
      "title.short": 'Verwaltung',
      "url-onboardings": "/anmeldungen",
      "url-members": "/mitglieder",
    });

const Main = () => {

  const { t } = useTranslation('administration');

  return (
    <Routes>
      <Route path={t('url-onboardings') + '/*'} element={<Onboardings />} />
      <Route path={t('url-members') + '/*'} element={<Members />} />
      <Route path='/' element={<TaskCards />} />
    </Routes>);
}

export default Main;
