import React from 'react';
import User from './User';
import { useAppContext } from '../../AppContext';
import { Anchor, Box, Grid, Text } from 'grommet';
import { Logout, Stakeholder, UserAdmin, UserSettings } from 'grommet-icons';
import { MenuItem } from './MenuItem';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Role } from '../../client/gui';
import { useNavigate } from 'react-router-dom';

i18n.addResources('en', 'menu', {
      "logout": "Logout",
      "user profile": "User profile",
      "administration": "Administration",
      "PASSANGER": "Passanger",
      "DRIVER": "Driver",
      "MANAGER": "Manager",
      "ADMIN": "Administrator",
    });
i18n.addResources('de', 'menu', {
      "logout": "Abmelden",
      "user profile": "Benutzerprofil",
      "administration": "Verwaltung",
      "PASSANGER": "Passagier",
      "DRIVER": "FahrerIn",
      "MANAGER": "ManagerIn",
      "ADMIN": "AdministratorIn",
    });

const Menu = () => {
  
  const { state, showMenu } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation('menu');
  const { t: tApp } = useTranslation('app');
  
  const hideMenu = () => showMenu(false);
  
  const isNotOnlyPassanger =
      state.currentUser.roles.length > 1
      || !state.currentUser.roles.includes(Role.Passanger);

  return (
    <Grid
        pad="small"
        gap="small">
      {
        state.currentUser === null ? '' :
        <>
          <User
              user={ state.currentUser } />
          {
            isNotOnlyPassanger
                ? <Box
                      align="center"
                      gap='small'
                      direction='row'>
                    <Stakeholder />
                    <Box>{
                      state.currentUser.roles.map(role => t(role)).join(', ')
                    }</Box>
                  </Box>
                : <></>
          }
          <MenuItem
              roles={null}
              onClick={() => document.location.href = '/logout'}>
            <Logout />
            <Text>{t('logout')}</Text>
          </MenuItem>
          <MenuItem
              onClick={() => {
                hideMenu();
                navigate(tApp('url-user-profile'));
              }}>
            <UserSettings />
            <Text>{t('user profile')}</Text>
          </MenuItem>
          <MenuItem
              roles={[ Role.Admin ]}
              background='accent-3'
              onClick={() => {
                hideMenu();
                navigate(tApp('url-administration'));
              }}>
            <UserAdmin />
            <Text>{t('administration')}</Text>
          </MenuItem>
        </>
      }
      <Text margin={ { top: 'medium' } }>{tApp('title.long')}</Text>
      <Anchor target='_blank' href={ state.appInformation?.homepageUrl }>{ state.appInformation?.homepageUrl }</Anchor>
      <Text margin={ { top: 'medium' } }>Version { state.appInformation.version }</Text>
    </Grid>);
    
}

export { Menu };
