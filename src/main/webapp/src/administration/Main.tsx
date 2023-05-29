import React from 'react';
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import { TaskCards } from './TaskCards';
import { Main as Onboardings } from './onboarding/Main';
import { Main as Members } from './member/Main';
import { Main as Cars } from './car/Main';
import i18n from '../i18n';
import { Planner } from '../driver/planner/Main';

i18n.addResources('en', 'administration', {
      "title.long": 'Administration',
      "title.short": 'Administration',
      "url-onboardings": "/onboardings",
      "url-members": "/members",
      "url-cars": "/cars",
      "url-planner": "/planner",
      "card-onboarding": "Onboarding",
      "card-members": "Members",
      "card-cars": "Cars",
      "card-planner": "Planner",
    });
i18n.addResources('de', 'administration', {
      "title.long": 'Verwaltung',
      "title.short": 'Verwaltung',
      "url-onboardings": "/anmeldungen",
      "url-members": "/mitglieder",
      "url-cars": "/fahrzeuge",
      "url-planner": "/planer",
      "card-onboarding": "Anmeldungen",
      "card-members": "Mitglieder",
      "card-cars": "Fahrzeuge",
      "card-planner": "Planer",
    });

const Main = () => {

  const { t } = useTranslation('administration');

  return (
    <Routes>
      <Route
          path={t('url-onboardings') + '/*'}
          element={<Onboardings />} />
      <Route
          path={t('url-members') + '/*'}
          element={<Members />} />
      <Route
          path={t('url-cars') + '/*'}
          element={<Cars />} />
      <Route
          path={t('url-planner') + '/*'}
          element={<Planner />} />
      <Route
          path='/'
          element={<TaskCards />} />
    </Routes>);
}

export default Main;
