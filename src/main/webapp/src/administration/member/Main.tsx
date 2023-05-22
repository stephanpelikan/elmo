import { Route, Routes } from "react-router-dom";
import { ListOfMembers } from './List';
import { EditMember } from './Edit';
import i18n from '../../i18n';
import React, { useLayoutEffect } from "react";
import { useAppContext } from "../../AppContext";
import { useTranslation } from "react-i18next";
import { Main as History } from "../../driver/history/Main";

i18n.addResources('en', 'administration/member', {
      "title.long": 'Members',
      "title.short": 'Members',
      "url-history": "/history/",
    });
i18n.addResources('de', 'administration/member', {
      "title.long": 'Mitglieder',
      "title.short": 'Mitglieder',
      "url-history": "/historie/",
    });

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  const { t } = useTranslation('administration/member');
  
  useLayoutEffect(() => {
    setAppHeaderTitle('administration/member', true);
  }, [ setAppHeaderTitle ]);

  return (
    <Routes>
      <Route path='/' element={<ListOfMembers />} />
      <Route path={ `${ t('url-history') }:memberId` } element={<History />} />
      <Route path=':memberId' element={<EditMember />} />
    </Routes>);
}

export { Main };
