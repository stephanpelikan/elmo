import React, { useState } from 'react';
import { Box,Grommet, ThemeType } from 'grommet';
import { AppContextProvider } from './AppContext';
import { AppHeader } from './menu/AppHeader';
import { ResponsiveMenu } from './menu/ResponsiveMenu';
import { Main } from './Main';

const theme: ThemeType = {
  global: {
    colors: {
      brand: '#e0a244',
      'accent-1': '#e2e2e2',
      'accent-2': '#333333',
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

type AppProps = {};
const App: React.FC<AppProps> = (props: AppProps): JSX.Element => {

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <AppContextProvider>
      <Grommet
          theme={theme}
          full>
        <Box fill>
          <AppHeader toggleShowBar={ () => setShowSidebar(!showSidebar) } />
          <Box
              direction='row'
              flex
              overflow={{ horizontal: 'hidden' }}>
            <Box
                flex
                align='center'
                justify='center'>
              <Main />
            </Box>
            <ResponsiveMenu
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar} />
          </Box>
        </Box>
      </Grommet>
    </AppContextProvider>
  );
};


export default App;
