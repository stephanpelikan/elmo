import React from 'react';
import { ResponsiveContext, Layer, Collapsible, Box, Button } from 'grommet';
import { Menu } from './Menu';
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
            <Layer responsive={true} modal={true}>
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
              <Box
                fill
                pad="small"
                background='light-2'
              >
                <Menu />
              </Box>
            </Layer>
          )
        )
      }
    </ResponsiveContext.Consumer>
  );
}

export { ResponsiveMenu };
