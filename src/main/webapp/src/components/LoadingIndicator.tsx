import { Box, Layer, ThemeType, ThemeContext } from "grommet";
import { Cycle } from "grommet-icons";
import { theme as appTheme } from '../app/App';
import { deepMerge } from 'grommet/utils';

const LoadingIndicator = () => {
  const theme: ThemeType = deepMerge(appTheme, {
    layer: {
      overlay: {
        background: 'rgba(0, 0, 0, 0)',
      },
    },
  });
  
  return (
      <ThemeContext.Extend value={ theme }>
        <Layer
            background={ { color: 'rgba(0, 0, 0, 0.3)' } }
            responsive={true}
            modal={true}>
          <Box
              round='large'
              animation="rotateRight"
              pad='medium'>
            <Cycle
                color="white"
                size="large" />
          </Box>
        </Layer>
      </ThemeContext.Extend>);
};

export { LoadingIndicator };
