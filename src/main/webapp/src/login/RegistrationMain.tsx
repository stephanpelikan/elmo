import { Box } from 'grommet';
import { useAppContext } from '../AppContext';
import { UserStatus } from '../client/gui';
import { RegistrationForm } from '../login/RegistrationForm';

const RegistrationMain = () => {
  const { state } = useAppContext();
  
  return (state.currentUser.roles.length === 0
    ? <RegistrationForm />
    : state.currentUser.status === UserStatus.ApplicationSubmitted
    ? <Box>Submitted</Box>
    : <Box>Wait to be activated</Box>);
}

export { RegistrationMain };
