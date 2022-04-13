import { Outlet } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Role } from '../client/gui';
import { Login } from '../login/Login';

interface ProtectedRouteProps {
  roles?: Array<Role>;
};

const ProtectedRoute = ({
  roles = undefined,
}: ProtectedRouteProps) => {
  const { state } = useAppContext();
  
  const hasOneOfRequestRoles = () => {
    if ((state.currentUser === null)
        || (state.currentUser === undefined)) {
      return false;
    }
    const result = roles === undefined
        ? true
        : roles.reduce((result, role) => result || state.currentUser.roles.includes(role), false);
    if (!result) {
      console.error(`Try to fetch route protected by ${roles ? roles : 'any role'} but user has ${state.currentUser.roles.length === 0 ? 'none' : state.currentUser.roles}!`);
    }
    return result;
  };

  return hasOneOfRequestRoles()
      ? <Outlet />
      : <Login />;
};

export { ProtectedRoute };
