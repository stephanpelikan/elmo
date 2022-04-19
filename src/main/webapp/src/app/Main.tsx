import { Box } from 'grommet';
import { useLayoutEffect } from 'react';
import { updateTitle, useAppContext } from '../AppContext';
import { RegistrationMain } from '../login/RegistrationMain';

const Main = () => {

  const { state, dispatch } = useAppContext();
  
  useLayoutEffect(() => {
    updateTitle(dispatch, 'app');
  }, [ dispatch ]);
  
  return (state.currentUser?.roles.length === 0
    ? <RegistrationMain />
    : <Box>{ state.currentUser?.email }</Box>);
}

export { Main };
