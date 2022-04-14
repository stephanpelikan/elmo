import React, { PropsWithChildren } from 'react';
import { AnchorExtendedProps, Box, BoxProps } from 'grommet';
import { Role } from '../../client/gui';
import { useAppContext } from '../../AppContext';

interface MenuItemProps extends PropsWithChildren<BoxProps> {
  href?: string;
  roles?: Array<Role>;
};

const MenuItem = ({
  children,
  href,
  roles,
  ...props
}: MenuItemProps) => {
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

  if (!hasOneOfRequestRoles()) {
    return <></>;
  }
  
  (props as AnchorExtendedProps).href = href;
  return (
  <Box
      {...props}
      round
      hoverIndicator='brand'
      direction='row'
      background='light-4'
      pad={{ top: 'small', bottom: 'small', left: 'medium' }}
      gap='small'
      margin={{ top: 'medium' }}
      style={{ textDecoration: 'none' }}
      as={ href !== undefined ? 'a' : undefined }>{ children }</Box>
)};

export { MenuItem };
