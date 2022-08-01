import { useAppContext } from '../AppContext';
import { UserStatus } from '../client/gui';
import { RegistrationForm } from '../login/RegistrationForm';
import { RegistrationSubmitted } from '../login/RegistrationSubmitted';

const RegistrationMain = () => {
  const { state } = useAppContext();
  
  return (state.currentUser.status !== UserStatus.ApplicationSubmitted
    ? <RegistrationForm />
    : <RegistrationSubmitted />);
}

export { RegistrationMain };
