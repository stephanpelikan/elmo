import { Route, Routes } from "react-router-dom";
import { ListOfOnboardings } from './List';
import { ReviewForm } from './ReviewForm';
import i18n from '../../i18n';
import { useLayoutEffect } from "react";
import { useAppContext } from "../../AppContext";

i18n.addResources('en', 'administration/onboarding', {
      "title.long": 'Member applications',
      "title.short": 'Member applications',
    });
i18n.addResources('de', 'administration/onboarding', {
      "title.long": 'Anmeldungen',
      "title.short": 'Anmeldungen',
    });

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('administration/onboarding', true);
  }, [ setAppHeaderTitle ]);

  return (
    <Routes>
      <Route path='/' element={<ListOfOnboardings />} />
      <Route path=':applicationId' element={<ReviewForm />} />
    </Routes>);
}

export { Main };
