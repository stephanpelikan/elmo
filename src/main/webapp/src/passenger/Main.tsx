import { Accordion, AccordionPanel, Box, Heading, Text } from "grommet";
import { Add, Group, User, UserFemale } from "grommet-icons";
import { CircleButton } from '../components/CircleButton';
import { useAppContext } from '../AppContext';
import { Sex } from "../client/gui";
import React from 'react';
import { MainLayout, SubHeading, Content } from '../components/MainLayout';
import { MemberIdAvatar } from '../components/MemberIdAvatar';

const Main = () => {

  const { state } = useAppContext();
  
  return (
    <>
      <MainLayout
          pad='none'>
        <SubHeading>
          <Box
              gap="xsmall"
              direction='row'>
            { state.currentUser!.sex === Sex.Female
                ? <UserFemale color="accent-3" size='medium' />
                : <User color="accent-3" size='medium' /> }
            <Box justify='center'>Meine Fahrten:</Box>
          </Box>
        </SubHeading>
        <Content
            background='light-2'>
          <Heading
              level='4'
              margin={ { vertical: '0.5rem' } }>
            Aktuell keine Fahrten geplant!
          </Heading>
          <Text>
            Verwende den blauen "Plus"-Knopf rechts unten, um eine Fahrt zu planen.
          </Text>
        </Content>
        <SubHeading>
          <Box
              gap="xsmall"
              direction='row'>
            <Group color="accent-3" size='medium' />
            <Box justify='center'>Meine Freunde:</Box>
          </Box>
        </SubHeading>
        <Box pad="small" direction="row" gap="medium">
          <MemberIdAvatar memberId={46} sex={Sex.Female} />
          <MemberIdAvatar memberId={48} sex={Sex.Male} />
        </Box>
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
      </MainLayout>
      <CircleButton
          style={ { position: 'absolute', right: '0', bottom: '1px' } }
          color='accent-3'
          icon={<Add color='white' />}
          onClick={() => {}} />
    </>);
}

export { Main };
