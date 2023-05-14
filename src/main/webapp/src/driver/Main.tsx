import React from 'react';
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { Dashboard } from './Dashboard';
import { Planner } from './planner/Main';
import { Main as History } from './history/Main';
import i18n from '../i18n';

i18n.addResources('en', 'driver', {
      "title.long": 'Driver',
      "title.short": 'Driver',
      "url-planner": "/planner",
      "url-history": "/history",
    });
i18n.addResources('de', 'driver', {
      "title.long": 'Fahrer',
      "title.short": 'Fahrer',
      "url-planner": "/planer",
      "url-history": "/historie",
    });

const Main = () => {

  const { t } = useTranslation('driver');

  return (
    <Routes>
      <Route
          path={t('url-planner') + '/*'}
          element={<Planner />} />
      <Route
          path={t('url-history')}
          element={<History />} />
      <Route
          path='/'
          element={<Dashboard />} />
    </Routes>);
}

export default Main;
