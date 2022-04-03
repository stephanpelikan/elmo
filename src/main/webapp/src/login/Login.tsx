import { Anchor, Box, Heading, Paragraph } from "grommet";
import { Google } from "grommet-icons";
import { useEffect } from "react";
import { useAppContext, fetchOauth2Clients } from '../AppContext';
import TextHeading from '../components/TextHeading';
import { LinkedBox } from './LinkedBox';

const icons = {
  Google
};

const Login = () => {
  const { state, dispatch } = useAppContext();
  
  useEffect(() => {
    fetchOauth2Clients(state, dispatch);
  }, [state, dispatch]);
  
  return (
    <Box
        direction='column'
        fill='horizontal'
        flex='shrink'
        align='center'
        gap='medium'
        pad='medium'
        margin={{ bottom: 'large' }}
        width='medium'>
      <Box>
        <TextHeading>Du bist bereits Mitglied in unserem Verein?</TextHeading>
        <Paragraph>
          Melde dich zum Buchen von Fahrten mit einer der verfügbaren Anmeldemöglichkeiten an:
        </Paragraph>
      </Box>
      {
        state.oauth2Clients === null ? '' : state.oauth2Clients.map(oauth2Client => {
          const Icon = icons[oauth2Client.name];
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
                  level='3'>{ oauth2Client.name }</Heading>
            </LinkedBox>);
        })
      }
      <Box
          margin={{ top: 'large' } }>
        <TextHeading>Du möchtest Mitglied in unserem Verein werden?</TextHeading>
        <Paragraph>
          Melde dich dafür mit einem der oben verfügbaren Anmeldemöglichkeiten an.
          Nach der Anmeldung wirst du durch den Registrierungsprozess geführt.
        </Paragraph>
        <Paragraph>
          Besuche für nähere Informationen zu unserem Verein unsere Vereinshomepage:
        </Paragraph>
        <Anchor target='_blank' href='https://www.elektromobil-gf.at'>https://www.elektromobil-gf.at</Anchor>
      </Box>
    </Box>);
}

export { Login };
