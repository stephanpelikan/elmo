import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { TaskCards } from './TaskCards';
import { Main as CarSharing } from './carsharing/Main';
import i18n from '../i18n';

i18n.addResources('en', 'driver', {
      "title.long": 'Driver',
      "title.short": 'Driver',
      "url-carsharing": "/car-sharing",
      "card-carsharing": "Car-Sharing",
    });
i18n.addResources('de', 'driver', {
      "title.long": 'Fahrer',
      "title.short": 'Fahrer',
      "url-carsharing": "/car-sharing",
      "card-carsharing": "Car-Sharing",
    });

const Main = () => {

  const { t } = useTranslation('driver');

  return (
    <Routes>
      <Route path={t('url-carsharing') + '/*'} element={<CarSharing />} />
      <Route path='/' element={<TaskCards />} />
    </Routes>);
}

export default Main;
