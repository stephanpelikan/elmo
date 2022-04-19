import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { TaskCards } from './TaskCards';
import { ListOfOnboardings } from './onboarding/List';
import i18n from '../i18n';

i18n.addResources('en', 'administration', {
      "title.long": 'Administration',
      "title.short": 'Administration',
      "url-list-onboardings": "/onboarding",
    });
i18n.addResources('de', 'administration', {
      "title.long": 'Verwaltung',
      "title.short": 'Verwaltung',
      "url-list-onboardings": "/anmeldung",
    });

const Main = () => {

  const { t } = useTranslation('administration');

  return (
    <Routes>
      <Route path={t('url-list-onboardings')} element={<ListOfOnboardings />} />
      <Route path='/' element={<TaskCards />} />
    </Routes>);
}

export default Main;
