import { Box } from 'grommet';
import { useEffect, useLayoutEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Role } from '../client/gui';
import { Main as PassangerMain } from '../passanger/Main';
import { RegistrationMain } from '../login/RegistrationMain';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Main = () => {

  const { state, setAppHeaderTitle } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation('app');

  useLayoutEffect(() => {
    setAppHeaderTitle('app');
  }, [ setAppHeaderTitle ]);
  
  const hasNoRoles = state.currentUser?.roles.length === 0;
  const isPassanger = state.currentUser?.roles.indexOf(Role.Passanger) !== -1;

  useEffect(() => {
    if (!hasNoRoles
        && !isPassanger) {
      navigate(t('url-administration'));
    }
  }, [ hasNoRoles, isPassanger ]);
  
  return hasNoRoles
    ? <RegistrationMain />
    : <PassangerMain />;

}

export { Main };
