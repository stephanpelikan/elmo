import { Anchor, Box, Grid, Heading, Paragraph } from "grommet";
import { Google, Amazon } from "grommet-icons";
import { useEffect } from "react";
import { useAppContext } from '../AppContext';
import TextHeading from '../components/TextHeading';
import { LinkedBox } from './LinkedBox';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

i18n.addResources('en', 'login', {
      "climate-friendly": "The climate-friendly transport service",
      "already a part of?": "You are already member of this association?",
      "login to book a ride": "Use one of the provided social logins to get to the booking form:",
      "wanna be a part of?": "You want to become a member of this association?",
      "login to become a member": "Go ahead and use one of the provided social logins. "
                                  + "After logging in you will be guided through the process of registration.",
      "visit the homepage": "For details information about the association visit our homepage:",
      "login with": "Login with"
    });
i18n.addResources('de', 'login', {
      "climate-friendly": "Der klimafreundliche Fahrtendienst",
      "already a part of?": "Du bist bereits Mitglied in unserem Verein?",
      "login to book a ride": "Melde dich zum Buchen von Fahrten mit einer der verfügbaren Anmeldemöglichkeiten an:",
      "wanna be a part of?": "Du möchtest Mitglied in unserem Verein werden?",
      "login to become a member": "Melde dich dafür mit einem der oben verfügbaren Anmeldemöglichkeiten an. "
                                  + "Nach der Anmeldung wirst du durch den Registrierungsprozess geführt.",
      "visit the homepage": "Besuche für nähere Informationen zu unserem Verein unsere Vereinshomepage:",
      "login with": "Anmelden mit"
    });

const icons = {
  google: Google,
  amazon: Amazon
};

const Login = () => {
  const { t } = useTranslation('login');
  
  const { state, fetchOauth2Clients } = useAppContext();
  
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
      {
        state.oauth2Clients === null ? '' : Object.keys(icons).map(clientId => {
          const oauth2Client = state.oauth2Clients.find(client => client.id === clientId);
          if (oauth2Client === undefined) return '';
          const Icon = icons[clientId];
          return (
            <LinkedBox
                href={ oauth2Client.url }
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
        <Anchor target='_blank' href='https://www.elektromobil-gf.at'>https://www.elektromobil-gf.at</Anchor>
      </Box>
    </Box>
    </Grid>);
}

export { Login };
