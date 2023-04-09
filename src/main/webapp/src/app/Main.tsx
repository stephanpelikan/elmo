import React, { useEffect, useLayoutEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Main as PassengerMain } from '../passenger/Main';
import { RegistrationMain } from '../login/RegistrationMain';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrentUserRoles } from '../utils/roleUtils';

const Main = () => {

  const { setAppHeaderTitle } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation('app');
  const { isAdminOnly, isDriverOnly, isInRegistration } = useCurrentUserRoles();

  useLayoutEffect(() => {
    setAppHeaderTitle('app');
  }, [ setAppHeaderTitle ]);
  
  useEffect(() => {
    if (isAdminOnly) {
      navigate(t('url-administration') as string);
    } else if (isDriverOnly) {
      navigate(t('url-driver') as string);
    }
  }, [ isAdminOnly, isDriverOnly, navigate, t ]);
  
  return isInRegistration
      ? <RegistrationMain />
      : <PassengerMain />;

}

export { Main };
