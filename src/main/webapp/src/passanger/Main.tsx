import { Accordion, AccordionPanel, Box, Heading, Page, PageContent, ResponsiveContext, Text } from "grommet";
import { Add } from "grommet-icons";
import { useContext } from "react";
import { CircleButton } from '../components/CircleButton';

const Main = () => {
  const size = useContext(ResponsiveContext);
  
  return (
    <>
      <Page
          kind='wide'>
        <PageContent
            pad='none'>
          <Heading
              level='4'
              color='accent-3'
              margin={ {
                  top: size === 'small' ? 'medium' : 'small',
                  bottom: 'small',
                  horizontal: size === 'small' ? '0.5rem' : undefined
                } }>
            Meine Fahrten:
          </Heading>
          <Box
              background='light-2'
              pad={ { horizontal: '0.5rem', bottom: size === 'small' ? 'medium' : 'small' } }>
            <Heading
                level='4'
                margin={ { vertical: '0.5rem' } }>
              Keine Fahrten geplant!
            </Heading>
            <Text>
              Verwende den blauen "Plus"-Knopf rechts unten, um eine Fahrt zu planen.
            </Text>
          </Box>
          <Heading
              level='4'
              color='accent-3'
              margin={ {
                  top: size === 'small' ? 'medium' : 'small',
                  bottom: 'small',
                  horizontal: size === 'small' ? '0.5rem' : undefined
                } }>
            Meine Freunde:
          </Heading>
          <Accordion
              background='light-2'>
            <AccordionPanel
                label='Fahrt 1'>
              <Box background="light-2">
                <Text>One</Text>
              </Box>
            </AccordionPanel>
            <AccordionPanel
                label="Retourfahrt">
              <Box background="light-2">
                <Text>Two</Text>
              </Box>
            </AccordionPanel>
          </Accordion>
        </PageContent>
      </Page>
      <CircleButton
          style={ { position: 'absolute', right: '0', bottom: '1px' } }
          color='accent-3'
          icon={<Add color='white' />}
          onClick={() => {}} />
    </>);
}

export { Main };
