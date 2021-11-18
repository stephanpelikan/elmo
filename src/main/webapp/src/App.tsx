import React, { useState } from 'react';
import { Box, Button, Heading, Grommet, ThemeType } from 'grommet';
import { Menu as MenuIcon } from 'grommet-icons';
import AppContext, {  } from './AppContext';
import ResponsiveMenu from './menu/ResponsiveMenu';

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

const AppBar = (props) => (
  <Box
    tag='header'
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation='medium'
    style={{ zIndex: '1' }}
    {...props}
  />
);

type AppProps = {};
const App: React.FC<AppProps> = (props: AppProps): JSX.Element => {
  const [showSidebar, setShowSidebar] = useState(false);
  return (
    <AppContext.Provider value={{ currentUser: { active: true, name: 'Stephan', surname: 'Pelikan', email: 'stephan.pelikan@phactum.at', female: false, hasAvatar: false, memberId: 47 } }}>
      <Grommet theme={theme} full>
        <Box fill>
          <AppBar>
            <Heading level='3' margin='none'>Elmo</Heading>
            <Button icon={<MenuIcon />}
              onClick={() => setShowSidebar(!showSidebar)} />
          </AppBar>
          <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
            <Box flex align='center' justify='center'>
              body
            </Box>
            <ResponsiveMenu showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          </Box>
        </Box>
      </Grommet>
    </AppContext.Provider>
  );
};


export default App;
