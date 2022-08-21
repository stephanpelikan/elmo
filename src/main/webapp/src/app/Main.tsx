import { Box } from 'grommet';
import { useLayoutEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Role } from '../client/gui';
import { Main as PassangerMain } from '../passanger/Main';
import { RegistrationMain } from '../login/RegistrationMain';

const Main = () => {

  const { state, setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('app');
  }, [ setAppHeaderTitle ]);
  
  return (state.currentUser?.roles.length === 0
    ? <RegistrationMain />
    : state.currentUser?.roles.indexOf(Role.Passanger) !== -1
    ? <PassangerMain />
    : <Box>You are not a passanger!</Box>);
}

export { Main };
