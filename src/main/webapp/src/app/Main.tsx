import { Box } from 'grommet';
import { useLayoutEffect } from 'react';
import { useAppContext } from '../AppContext';
import { RegistrationMain } from '../login/RegistrationMain';

const Main = () => {

  const { state, setAppHeaderTitle } = useAppContext();
  
  useLayoutEffect(() => {
    setAppHeaderTitle('app');
  }, [ setAppHeaderTitle ]);
  
  return (state.currentUser?.roles.length === 0
    ? <RegistrationMain />
    : <Box>{ state.currentUser?.email }</Box>);
}

export { Main };
