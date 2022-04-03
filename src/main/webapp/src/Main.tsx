import { Box } from 'grommet';
import { useEffect, useState } from 'react';
import { useAppContext, fetchCurrentUser } from './AppContext';
import { Login } from './login/Login';

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
    : <Box>{ state.currentUser.email }</Box>);
}

export { Main };
