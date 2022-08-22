import { Route, Routes } from "react-router-dom";
import { ListOfMembers } from './List';
import i18n from '../../i18n';
import { useLayoutEffect } from "react";
import { useAppContext } from "../../AppContext";
import { Box } from "grommet";

i18n.addResources('en', 'administration/member', {
      "title.long": 'Members',
      "title.short": 'Members',
    });
i18n.addResources('de', 'administration/member', {
      "title.long": 'Mitglieder',
      "title.short": 'Mitglieder',
    });

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('administration/member', true);
  }, [ setAppHeaderTitle ]);

  return (
    <Routes>
      <Route path='/' element={<ListOfMembers />} />
      <Route path=':memberId' element={<Box />} />
    </Routes>);
}

export { Main };
