import React, { PropsWithChildren } from 'react';
import { AnchorExtendedProps, Box, BoxProps } from 'grommet';
import { Role } from '../../client/gui';
import { useAppContext } from '../../AppContext';
import { BackgroundType } from 'grommet/utils';

interface MenuItemProps extends PropsWithChildren<BoxProps> {
  href?: string;
  roles?: Array<Role>;
  background?: BackgroundType;
};

const MenuItem = ({
  children,
  href,
  background = 'light-4',
  roles = [],
  ...props
}: MenuItemProps) => {
  const { state } = useAppContext();

  const hasOneOfRequestRoles = () => {
    if ((state.currentUser === null)
        || (state.currentUser === undefined)) {
      return false;
    }
    const result = roles === null
        ? true
        : roles.length === 0
        ? (state.currentUser.roles.length > 0)
        : roles.reduce((result, role) => result || state.currentUser.roles.includes(role), false);
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
      background={ background }
      pad={{ top: 'small', bottom: 'small', left: 'medium' }}
      gap='small'
      margin={{ top: 'medium' }}
      style={{ textDecoration: 'none' }}
      as={ href !== undefined ? 'a' : undefined }>{ children }</Box>
)};

export { MenuItem };
