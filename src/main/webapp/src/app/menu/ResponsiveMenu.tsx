import React from 'react';
import { ResponsiveContext, Layer, Collapsible, Box, Button } from 'grommet';
import { Menu } from './Menu';
import { FormClose } from 'grommet-icons';
import { useAppContext, setShowMenu } from '../../AppContext';

const ResponsiveMenu = () => {
  const { state, dispatch } = useAppContext();

  const hideMenu = () => {
    setShowMenu(dispatch, false);
  };
  
  return (
    <ResponsiveContext.Consumer>
      {
        size => (
          (!state.showMenu || size !== 'small') ? (
            <Collapsible direction="horizontal" open={state.showMenu}>
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
                pad='small'
              >
                <Button
                  plain
                  focusIndicator={false}
                  icon={<FormClose />}
                  onClick={hideMenu}
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
