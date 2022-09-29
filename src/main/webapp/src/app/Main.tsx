import { useEffect, useLayoutEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Main as PassangerMain } from '../passanger/Main';
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
      navigate(t('url-administration'));
    } else if (isDriverOnly) {
      navigate(t('url-driver'));
    }
  }, [ isAdminOnly, isDriverOnly, navigate, t ]);
  
  return isInRegistration
      ? <RegistrationMain />
      : <PassangerMain />;

}

export { Main };
