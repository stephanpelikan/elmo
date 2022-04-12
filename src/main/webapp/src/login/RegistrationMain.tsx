import { Box } from 'grommet';
import { useAppContext } from '../AppContext';
import { UserStatus } from '../client/gui';
import { RegistrationForm } from '../login/RegistrationForm';

const RegistrationMain = () => {
  const { state } = useAppContext();
  
  return (state.currentUser.status !== UserStatus.ApplicationSubmitted
    ? <RegistrationForm />
    : <Box>Submitted</Box>);
}

export { RegistrationMain };
