import { useAppContext } from '../AppContext';
import { UserStatus } from '../client/gui';
import { RegistrationForm } from '../login/RegistrationForm';
import { RegistrationSubmitted } from '../login/RegistrationSubmitted';

const RegistrationMain = () => {
  const { state } = useAppContext();
  
  return ((state.currentUser.status === UserStatus.New)
      || (state.currentUser.status === UserStatus.DataInvalid)
    ? <RegistrationForm />
    : <RegistrationSubmitted />);
}

export { RegistrationMain };
