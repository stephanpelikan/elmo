import { Anchor, Box, Button, Collapsible, Grid, Heading, Paragraph, Text } from "grommet";
import { Google, Amazon, CaretDown, CaretUp, Compliance } from "grommet-icons";
import React, { useEffect, useState } from "react";
import { useAppContext } from '../AppContext';
import TextHeading from '../components/TextHeading';
import { LinkedBox } from './LinkedBox';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useCookies } from "react-cookie";

i18n.addResources('en', 'login', {
      "climate-friendly": "The climate-friendly transport service",
      "already a part of?": "You are already member of this association?",
      "login to book a ride": "Use one of the provided social logins to get to the booking form:",
      "security hints": "Security hints:",
      "security hints details": "The provided social logins are services of the respective company and not of {{ name }}."
            + "For the login you will be forwarded to their Website und they will you Cookies."
            + "Using the online services of {{ name }}. without social login or without Cookies is not possible.",
      "wanna be a part of?": "You want to become a member of this association?",
      "login to become a member": "Go ahead and use one of the provided social logins. "
                                  + "After logging in you will be guided through the process of registration.",
      "visit the homepage": "For details information about the association visit our homepage:",
      "login with": "Login with",
      "native_login_error": "Login error",
      "native_login_error_message": "Login could not be completed (Error: ${error ? error : 'unknown'})!",
    });
i18n.addResources('de', 'login', {
      "climate-friendly": "Der klimafreundliche Fahrtendienst",
      "already a part of?": "Du bist bereits Mitglied in unserem Verein?",
      "login to book a ride": "Melde dich zum Buchen von Fahrten mit einer der verfügbaren Anmeldemöglichkeiten an:",
      "security hints": "Sicherheitsinweise:",
      "security hints details": "Die Anmeldemöglichkeiten sind Dienste des jeweils anzeigten Unternehmens und nicht von {{ name }}. "
            + "Du wirst für die Anmeldung auf deren Website weitergeleitet und es werden Cookies verwendet. "
            + "Eine Nutzung der Online-Dienste von {{ name }} ohne einer dieser Anmeldungen oder "
            + "ohne der Verwendung von Cookies ist nicht möglich.",
      "wanna be a part of?": "Du möchtest Mitglied in unserem Verein werden?",
      "login to become a member": "Melde dich dafür mit einem der oben verfügbaren Anmeldemöglichkeiten an. "
                                  + "Nach der Anmeldung wirst du durch den Registrierungsprozess geführt.",
      "visit the homepage": "Besuche für nähere Informationen zu unserem Verein unsere Vereinshomepage:",
      "login with": "Anmelden mit",
      "native_login_error": "Anmeldefehler",
      "native_login_error_message": "Die Anmeldung konnte nicht durchgeführt werden (Fehler: ${error ? error : 'unbekannt'})!",
    });

const icons = {
  google: Google,
  amazon: Amazon
};

const CookieConfirmationName = 'elmo-cookie';

// @ts-ignore
const loginCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const Login = () => {
  const { t } = useTranslation('login');
  
  const { state, fetchOauth2Clients, toast, guiApi, fetchCurrentUser } = useAppContext();

  const [ cookies, setCookie ] = useCookies([]);
  const [ showHint, setShowHint ] = useState(!cookies[CookieConfirmationName]);
  
  const confirmCookies = () => {
    setCookie(
        CookieConfirmationName,
        new Date().toISOString(), {
          expires: new Date(2050, 0, 1)
        }
      );
    setShowHint(false);
  };
  
  const doNativeLogin = clientId => {
    if (!loginCommunicator) {
      console.warn("No native message channel available for native Login");
      return;
    }
    window['nativeLoginResult'] = async (oauth2Id: string, accessToken: string, error?: string) => {
      if (!Boolean(accessToken) || error) {
        toast({
            namespace: 'login',
            title: t('native_login_error'),
            message: t('native_login_error_message', { error }),
            status: 'critical'
          });
      } else {
        await guiApi.nativeAppLogin({
            nativeLogin: {
              clientId,
              oauth2Id,
              accessToken
            }
          });
        await new Promise((resolve, reject) => {
            fetchCurrentUser(resolve, reject, true);
          });
      }
      window['nativeLoginResult'] = undefined;
    };
    loginCommunicator.postMessage(JSON.stringify([
        {
          "type": "Login",
        }
      ]));
  };
    
  useEffect(() => {
    fetchOauth2Clients();
  }, [ fetchOauth2Clients ]);
  
  return (
    <Grid>
    <Box
        direction='column'
        fill='horizontal'
        flex='shrink'
        align='center'
        gap='medium'
        pad='medium'
        width='medium'>
      <Box>
        <Heading size='small' level='2'>{t('climate-friendly')}</Heading>
        <TextHeading>{t('already a part of?')}</TextHeading>
        <Paragraph>{t('login to book a ride')}</Paragraph>
      </Box>
      <Box width={{ max: 'medium' }}>
        <Text size='small' textAlign="center">
          <i>{ t('security hints') }</i> {
              showHint
                  ? <CaretUp size="small" onClick={ () => setShowHint(false) } cursor='pointer' />
                  : <CaretDown size="small" onClick={ () => setShowHint(true) } cursor='pointer' />
          }
        </Text>
        <Collapsible open={ showHint }>
          <Text size='small'>{ t('security hints details', { name: state.appInformation?.titleLong }) }</Text>
          <Button secondary label='Verstanden' icon={<Compliance />} onClick={ () => confirmCookies() } />
        </Collapsible>
      </Box>
      {
        state.oauth2Clients === null ? '' : Object.keys(icons).map(clientId => {
          const oauth2Client = state.oauth2Clients.find(client => client.id === clientId);
          if (oauth2Client === undefined) return '';
          const Icon = icons[clientId];
          return (
            <LinkedBox
                href={ oauth2Client.url === 'native' ? undefined : oauth2Client.url }
                onClick={ oauth2Client.url === 'native' ? () => doNativeLogin(oauth2Client.id) : undefined }
                key={ oauth2Client.id }
                height={{ max: 'xsmall' }}
                width={{ max: 'medium' }}
                fill='horizontal'
                direction='row'
                align='center'
                flex='grow'
                gap='small'
                background='light-1'
                pad='small'
                border='all'>
                <Icon
                  color='plain'
                  size='large' />
              <Heading
                  level='3'>{t('login with')} { oauth2Client.name }</Heading>
            </LinkedBox>);
        })
      }
      <Box>
        <TextHeading>{t('wanna be a part of?')}</TextHeading>
        <Paragraph>{t('login to become a member')}</Paragraph>
        <Paragraph>{t('visit the homepage')}</Paragraph>
        <Anchor target='_blank' href={ state.appInformation?.homepageUrl }>{ state.appInformation?.homepageUrl }</Anchor>
      </Box>
    </Box>
    </Grid>);
}

export { Login };
