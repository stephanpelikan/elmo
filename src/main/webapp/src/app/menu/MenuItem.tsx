import React, { PropsWithChildren } from 'react';
import { AnchorExtendedProps, Box, BoxProps } from 'grommet';

interface MenuItemProps extends PropsWithChildren<BoxProps> {
  href?: string,
};

const MenuItem = ({
  children,
  href,
  ...props
}: MenuItemProps) => {
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
