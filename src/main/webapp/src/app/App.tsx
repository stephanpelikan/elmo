import React, { lazy, Suspense, useEffect } from 'react';
import { Box, Grommet, Heading, Text, ThemeType } from 'grommet';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { AppHeader } from './menu/AppHeader';
import { Main } from './Main';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import '../i18n';
import { ProtectedRoute } from './ProtectedRoute';
import { CurrentUser } from './CurrentUser';
import { Role } from '../client/gui';
import { GuiSseProvider } from '../client/guiClient';
import { Login } from '../login/Login';
import { css } from 'styled-components';
import { MessageToast } from '../components/Toast';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useKeepNowUpToDate } from '../utils/now-hook';

export const theme: ThemeType = {
  global: {
    colors: {
      brand: '#e0a244',
      'accent-1': '#e2e2e2',
      'accent-2': '#333333',
      'accent-3': '#348eda',
      'placeholder': '#bbbbbb',
      'light-5': '#c7c7c7',
      'light-6': '#b4b4b4',
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
  table: {
    header: {
      border: undefined,
    },
    body: {
      extend: css`
        overflow: visible;
      `
    },
  },
  heading: {
    color: '#444444',
    extend: css`
      margin-top: 0;
    `
  },
  formField: {
    label: {
      requiredIndicator: true,
    }
  },
  textArea: {
    extend: css`
      font-weight: normal;
      ::placeholder {
        font-weight: normal;
        color: ${props => props.theme.global.colors.placeholder};
      }
    `,
  },
  maskedInput: {
    extend: css`
      ::placeholder {
        font-weight: normal;
        color: ${props => props.theme.global.colors.placeholder};
      }
    `,
  },
  textInput: {
    extend: css`
      ::placeholder {
        font-weight: normal;
        color: ${props => props.theme.global.colors.placeholder};
      }
    `,
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
    },
    disabled: {
      opacity: 1,
      color: '#eeeeee',
      background: '#cccccc',
      border: { color: '#bbbbbb' }
    }
  },
  accordion: {
    heading: {
      margin: 'small'
    },
    icons: {
      color: 'accent-3'
    }
  },
  dataTable: {
    pinned: {
      header: {
        background: {
          color: 'accent-2',
          opacity: 'strong'
        },
        extend: css`
          z-index: 3;
        `
      },
    }
  },
  page: {
    wide: {
      width: {
        min: 'small',
        max: 'xlarge'
      }
    }
  },
  paragraph: {
    extend: css`
      margin-top: 0;
    `
  },
};

const appNs = 'app';

i18n.addResources('en', appNs, {
      "title.long": 'ElectroMobile',
      "title.short": 'Elmo',
      "error": "Error",
      "unexpected": "An unexpected event occured. Please try again later.",
      "validation": "You have enter data we could not process. Please fix them and try again.",
      "forbidden": "This action is forbidden. If you think this is an error then please retry but logout and login before. If the error still persists then get in contact with the management board.",
      "not-found": "The requested page is unknown!",
      "not-found hint": "Maybe use used a link in a mail which is already expired.",
      "url-administration": "/administration",
      "url-driver": "/driver",
      "url-user-profile": "/user-profile",
    });
i18n.addResources('de', appNs, {
      "title.long": 'ElektroMobil',
      "title.short": 'Elmo',
      "error": "Fehler",
      "unexpected": "Ein unerwartetes Ereignis ist aufgetreten. Bitte versuche es später nochmals.",
      "validation": "Du hast Daten angegeben, die wir nicht verarbeiten konnten. Bitte korrigiere sie und versuche es nochmal.",
      "forbidden": "Diese Aktion ist verboten. Wenn du denkst, dass es sich um einen Fehler handelt, dann versuche es nochmals und melde dich davor ab und wieder an. Besteht das Problem weiterhin, dann kontaktiere bitte den Vereinsvorstand.",
      "not-found": "Die angeforderte Seite ist unbekannt!",
      "not-found hint": "Eventuell hast du einen Link aus einer Mail verwendet, der bereits veraltet ist.",
      "url-administration": "/verwaltung",
      "url-driver": "/fahrer",
      "url-user-profile": "/benutzerprofil",
    });

const Administration = lazy(() => import('../administration/Main'));
const UserProfile = lazy(() => import('./Profile'));
const Driver = lazy(() => import('../driver/Main'));

type AppProps = {};

const App: React.FC<AppProps> = (_props: AppProps): JSX.Element => {

  const { state, fetchAppInformation, dispatch } = useAppContext();
  
  useKeepNowUpToDate();

  useEffect(() => {
    fetchAppInformation();
  }, [ fetchAppInformation ]);
  
  const { t, i18n } = useTranslation('app');
  if (state!.appInformation !== null) {
    ['en', 'de']
        .forEach(lng => {
          i18n.addResource(lng, appNs, 'title.long', state.appInformation!.titleLong!);
          i18n.addResource(lng, appNs, 'title.short', state.appInformation!.titleShort!);
          i18n.addResource(lng, appNs, 'homepage', state.appInformation!.homepageUrl!);
        });
  }

  return (
    <Grommet
        options={{ box: { cssGap: true } }}
        theme={theme}
        full>
      {state.toast && (
        <MessageToast dispatch={dispatch} msg={state.toast} />
      )}
      <GuiSseProvider>
        <Router>
          <Box
              fill>
            <AppHeader />
            <Box
                direction='row'
                style={ { display: 'unset' } } /* to avoid removing bottom margin of inner boxes */
                overflow={ { horizontal: 'hidden' } }>
              <Suspense fallback={<LoadingIndicator />}>
                <CurrentUser>
                  <Routes>
                    <Route element={<ProtectedRoute roles={[ Role.Admin ]} />}>
                      <Route path={t('url-administration') + '/*'} element={<Administration />} />
                    </Route>
                    <Route element={<ProtectedRoute roles={[ Role.Driver ]} />}>
                      <Route path={t('url-driver') + '/*'} element={<Driver />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                      <Route path={t('url-user-profile') + '/*'} element={<UserProfile />} />
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
                  {
                    state.loadingIndicator
                        ? <LoadingIndicator />
                        : <></>
                  }
                </CurrentUser>
              </Suspense>
            </Box>
          </Box>
        </Router>
      </GuiSseProvider>
    </Grommet>
  );
};


export default App;
