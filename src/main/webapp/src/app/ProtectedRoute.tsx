import { Outlet } from 'react-router-dom';
import { Role } from '../client/gui';
import { Login } from '../login/Login';
import { useCurrentUserRoles } from '../utils/roleUtils';

interface ProtectedRouteProps {
  roles?: Array<Role>;
};

const ProtectedRoute = ({
  roles = undefined,
}: ProtectedRouteProps) => {

  const { hasOneOfRoles, currentUser } = useCurrentUserRoles();
  
  const hasOneOfRequestRoles = hasOneOfRoles(roles);
  if (currentUser && !hasOneOfRequestRoles) {
    console.error(`Try to fetch route protected by ${roles ? roles : 'any role'} but user has ${currentUser?.roles?.length === 0 ? 'none' : currentUser.roles}!`);
  }

  return hasOneOfRequestRoles
      ? <Outlet />
      : <Login />;
};

export { ProtectedRoute };
