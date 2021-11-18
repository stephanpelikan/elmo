import React from 'react';
import { ResponsiveContext, Layer, Collapsible, Box, Button } from 'grommet';
import Menu from './Menu';
import { FormClose } from 'grommet-icons';

type ResponsiveMenuProps = {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
};

const ResponsiveMenu: React.FC<ResponsiveMenuProps> = ({
  showSidebar,
  setShowSidebar
}): JSX.Element => {
  return (
    <ResponsiveContext.Consumer>
      {
        size => (
          (!showSidebar || size !== 'small') ? (
            <Collapsible direction="horizontal" open={showSidebar}>
              <Box
                flex
                basis='medium'
                width='medium'
                background='light-2'
                elevation='small'
              >
                <Menu />
              </Box>
            </Collapsible>
          ) : (
            <Layer>
              <Box
                fill
                background='light-2'
              >
                <Box
                  background='light-2'
                  tag='header'
                  justify='end'
                  align='center'
                  direction='row'
                >
                  <Button
                    icon={<FormClose />}
                    onClick={() => setShowSidebar(false)}
                  />
                </Box>
                <Menu />
              </Box>
            </Layer>
          )
        )
      }
    </ResponsiveContext.Consumer>
  );
}

export default ResponsiveMenu;
