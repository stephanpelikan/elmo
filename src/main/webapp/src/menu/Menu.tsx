import React from 'react';
import User from './User';
import { useAppContext } from '../AppContext';
import { Grid, Text } from 'grommet';
import { Logout } from 'grommet-icons';
import { LinkedBox } from '../login/LinkedBox';

const Menu = () => {
  const { state } = useAppContext();
  
  return <Grid pad="small" gap="small">
      {
        state.currentUser === null ? '' :
        <>
          <User
              user={ state.currentUser } />
          <LinkedBox
              href='/logout'
              direction='row'
              background='light-4'
              pad='small'
              gap='small'
              margin={{ top: 'small' }}>
            <Logout />
            <Text>Abmelden </Text>
          </LinkedBox>
        </>
      }
    </Grid>;
}

export { Menu };
