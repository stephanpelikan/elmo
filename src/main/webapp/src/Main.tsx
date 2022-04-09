import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useAppContext, fetchCurrentUser } from './AppContext';
import { UserStatus } from './client/gui';
import { Login } from './login/Login';
import { RegistrationForm } from './login/RegistrationForm';

const Main = () => {
  const { state, dispatch } = useAppContext();
  const [loadingUser, setLoadingUser] = useState(true);
  
  useEffect(() => {
    fetchCurrentUser(state, dispatch).then(user => {
      setLoadingUser(false);
    });
  }, [state, dispatch]);
  
  return (loadingUser
    ? <Box>Loading</Box>
    : state.currentUser === null
    ? <Login />
    : ((state.currentUser.status === UserStatus.New) || (state.currentUser.status === UserStatus.EmailVerified))
    ? <RegistrationForm />
    : state.currentUser.status === UserStatus.ApplicationSubmitted
    ? <Box>Submitted</Box>
    : <Box>{ state.currentUser.email }</Box>);
}

export { Main };
