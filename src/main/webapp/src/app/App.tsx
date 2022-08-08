import React, { lazy, Suspense } from 'react';
import { Box, Grommet, Heading, Text, ThemeType } from 'grommet';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppContextProvider } from '../AppContext';
import { AppHeader } from './menu/AppHeader';
import { ResponsiveMenu } from './menu/ResponsiveMenu';
import { Main } from './Main';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import '../i18n';
import { ProtectedRoute } from './ProtectedRoute';
import { CurrentUser } from './CurrentUser';
import { Role } from '../client/gui';
import { Login } from '../login/Login';
import { css } from 'styled-components';

export const theme: ThemeType = {
  global: {
    colors: {
      brand: '#e0a244',
      'accent-1': '#e2e2e2',
      'accent-2': '#333333',
      'accent-3': '#348eda',
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
    focus: {
      border:  {
        color: '#e0a244',
      },
      outline: {
        color: '#e0a244',
      }
    }
  },
  formField: {
    label: {
      requiredIndicator: true,
    }
  },
  textInput: {
    placeholder: {
      extend: css`
          font-weight: normal;
          color: ${props => props.theme.global.colors.placeholder};
        `
    }
  },
  button: {
    default: {
      background: '#ffffff',
      border: { color: '#e2e2e2', width: '3px' },
    },
    primary: {
      background: '#348eda',
      border: { color: '#e0a244', width: '3px' },
    },
    secondary: {
      background: '#333333',
      border: { color: '#e0a244', width: '3px' },
    },
    hover: {
      default: {
        background: '#e2e2e2',
        color: '#333333',
      },
      secondary: {
        background: '#e0a244',
        color: '#333333',
      }
    }
  }
};

i18n.addResources('en', 'app', {
      "title.long": 'ElectroMobile Gänserndorf',
      "title.short": 'Elmo GF',
      "error": "Error",
      "unexpected": "An unexpected event occured. Please try again later.",
      "validation": "You have enter data we could not process. Please fix them and try again.",
      "forbidden": "This action is forbidden. If you think this is an error then please retry but logout and login before. If the error still persists then get in contact with the management board.",
      "not-found": "The requested page is unknown!",
      "not-found hint": "Maybe use used a link in a mail which is already expired.",
      "url-administration": "/administration",
    });
i18n.addResources('de', 'app', {
      "title.long": 'ElektroMobil Gänserndorf',
      "title.short": 'Elmo GF',
      "error": "Fehler",
      "unexpected": "Ein unerwartetes Ereignis ist aufgetreten. Bitte versuche es später nochmals.",
      "validation": "Du hast Daten angegeben, die wir nicht verarbeiten konnte. Bitte korrigiere sie und versuche es nochmal.",
      "forbidden": "Diese Aktion ist verboten. Wenn du denkst, dass es sich um einen Fehler handelt, dann versuche es nochmals und melde dich davor ab und wieder an. Besteht das Problem weiterhin, dann kontaktiere bitte den Vereinsvorstand.",
      "not-found": "Die angeforderte Seite ist unbekannt!",
      "not-found hint": "Eventuell hast du einen Link aus einer Mail verwendet, der bereits veraltet ist.",
      "url-administration": "/verwaltung",
    });

const Administration = lazy(() => import('../administration/Main'));

type AppProps = {};
const App: React.FC<AppProps> = (props: AppProps): JSX.Element => {

  const { t } = useTranslation('app');

  return (
    <Grommet
        theme={theme}
        full>
      <AppContextProvider>
        <Router>
          <Box fill>
            <AppHeader />
            <Box
                direction='row'
                flex
                overflow={{ horizontal: 'hidden' }}>
              <Box flex>
                <Suspense fallback={<Box>Loading...</Box>}>
                  <CurrentUser>
                    <Routes>
                      <Route element={<ProtectedRoute roles={[ Role.Admin ]} />}>
                        <Route path={t('url-administration') + '/*'} element={<Administration />} />
                      </Route>
                      <Route path='/login' element={<Login />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path='/' element={<Main />} />
                      </Route>
                      <Route path='*' element={
                        <Box
                            direction='column'
                            fill='horizontal'
                            flex='shrink'
                            align='center'
                            gap='medium'
                            pad='medium'
                            width='medium'>
                          <Heading level='3'>{t('not-found')}</Heading>
                          <Text>{t('not-found hint')}</Text>
                        </Box>
                      } />
                    </Routes>
                  </CurrentUser>
                </Suspense>
              </Box>
              <ResponsiveMenu />
            </Box>
          </Box>
        </Router>
      </AppContextProvider>
    </Grommet>
  );
};


export default App;
