import React from "react";
import { Box, Layer, ThemeContext, ThemeType } from "grommet";
import { theme as appTheme } from '../app/App';
import { deepMerge } from 'grommet/utils';
import { Cycle } from "grommet-icons";
import styled from "styled-components";

// Grommet includes a hidden a-tag to modal layers setting the focus on
// if the modal content does not catch the focus. This brings a focus indicator
// at least to Firefox browsers which has to be disabled.
const NoFocusIndicatorLayer = styled(Layer)`
  a:focus {
    outline: none;
  }
`;

const LoadingIndicator = () => {
  const theme: ThemeType = deepMerge(appTheme, {
    layer: {
      overlay: {
        background: 'rgba(0, 0, 0, 0)',
      },
    },
  });
  
  return (
      <NoFocusIndicatorLayer
          plain
          animate={false}
          responsive={false}
          modal={true}>
        <ThemeContext.Extend value={ theme }>
          <Box
              round='medium'
              background={ { color: 'rgba(0, 0, 0, 0.3)' } }>
            <Box
                animation="rotateRight"
                pad='medium'>
              <Cycle
                  style={ { marginTop: '3px' } }
                  color="white"
                  size="large" />
            </Box>
          </Box>
        </ThemeContext.Extend>
      </NoFocusIndicatorLayer>);
};

export { LoadingIndicator };
