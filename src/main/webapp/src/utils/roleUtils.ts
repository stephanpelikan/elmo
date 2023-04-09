import { Role, User } from 'client/gui';
import { useAppContext } from '../AppContext';

interface CurrentUserRoles {
  isAdminOnly: boolean;
  isDriverOnly: boolean;
  isInRegistration: boolean;
  isPassengerOnly: boolean;
  currentUser: User | null | undefined;
  hasOneOfRoles: (roles: Array<Role> | null) => boolean;
}

const useCurrentUserRoles = (): CurrentUserRoles => {
  
  const { state } = useAppContext();
  
  if (!state
      || !state.currentUser
      || !state.currentUser.roles) {
    return {
        isAdminOnly: false,
        isDriverOnly: false,
        isInRegistration: true,
        isPassengerOnly: false,
        currentUser: state?.currentUser,
        hasOneOfRoles: _roles => false
      };
  }
  
  return {
    isInRegistration: !state.currentUser.roles || (state.currentUser.roles.length === 0),
    isAdminOnly: (state.currentUser.roles.length === 1) && (state.currentUser.roles.at(0) === Role.Admin),
    isDriverOnly: (state.currentUser.roles.length === 1) && (state.currentUser.roles.at(0) === Role.Driver),
    isPassengerOnly: (state.currentUser.roles.length === 1) && (state.currentUser.roles.at(0) === Role.Passenger),
    currentUser: state.currentUser,
    hasOneOfRoles: (roles: Array<Role> | null): boolean => {
          return (roles === null) || (roles === undefined)
              ? true
              : roles.length === 0
              // @ts-ignore
              ? state.currentUser.roles.length > 0
              // @ts-ignore
              : roles.reduce((result: boolean, role: Role) => result || state.currentUser.roles.includes(role), false);
      }
  };
  
}

export { useCurrentUserRoles };
