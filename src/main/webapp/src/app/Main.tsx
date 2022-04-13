import { Box } from 'grommet';
import { useAppContext } from '../AppContext';
import { RegistrationMain } from '../login/RegistrationMain';

const Main = () => {
  const { state } = useAppContext();
  return (state.currentUser?.roles.length === 0
    ? <RegistrationMain />
    : <Box>{ state.currentUser?.email }</Box>);
}

export { Main };
