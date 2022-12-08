import React from 'react';
import User from './User';
import { useAppContext } from '../../AppContext';
import { Anchor, Box, Grid, Text } from 'grommet';
import { Logout, Stakeholder, UserAdmin, UserFemale, User as UserMale, UserSettings } from 'grommet-icons';
import { MenuItem } from './MenuItem';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Role, Sex } from '../../client/gui';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserRoles } from '../../utils/roleUtils';
import { doLogout } from '../../client/guiClient';

i18n.addResources('en', 'menu', {
      "logout": "Logout",
      "user profile": "User profile",
      "administration": "Administration",
      "driver": "Driver",
      "PASSANGER": "Passanger",
      "DRIVER": "Driver",
      "MANAGER": "Manager",
      "ADMIN": "Administrator",
    });
i18n.addResources('de', 'menu', {
      "logout": "Abmelden",
      "user profile": "Benutzerprofil",
      "administration": "Verwaltung",
      "driver": "Fahrer",
      "PASSANGER": "Passagier",
      "DRIVER": "FahrerIn",
      "MANAGER": "ManagerIn",
      "ADMIN": "AdministratorIn",
    });

const Menu = () => {
  
  const { state, showMenu } = useAppContext();
  const { isPassangerOnly, isInRegistration } = useCurrentUserRoles();
  const navigate = useNavigate();
  const { t } = useTranslation('menu');
  const { t: tApp } = useTranslation('app');
  
  const hideMenu = () => showMenu(false);
  
  return (
      <Grid
          pad="small"
          gap="small">
        {
          !Boolean(state.currentUser) ? '' :
          <>
            <User
                user={ state.currentUser! } />
            {
              !isPassangerOnly && !isInRegistration
                  ? <Box
                        align="center"
                        gap='small'
                        direction='row'>
                      <Stakeholder />
                      <Box>{
                        state.currentUser!.roles!.map(role => t(role)).join(', ')
                      }</Box>
                    </Box>
                  : <></>
            }
            <MenuItem
                roles={ null }
                onClick={ doLogout }>
              <Logout />
              <Text>{t('logout')}</Text>
            </MenuItem>
            <MenuItem
                onClick={() => {
                  hideMenu();
                  navigate(tApp('url-user-profile') as string);
                }}>
              <UserSettings />
              <Text>{t('user profile')}</Text>
            </MenuItem>
            <MenuItem
                roles={[ Role.Driver ]}
                onClick={() => {
                  hideMenu();
                  navigate(tApp('url-driver') as string);
                }}>
              {
                state.currentUser!.sex === Sex.Female
                    ? <UserFemale />
                    : <UserMale />
              }
              <Text>{t('driver')}</Text>
            </MenuItem>
            <MenuItem
                roles={[ Role.Admin ]}
                background='accent-3'
                onClick={() => {
                  hideMenu();
                  navigate(tApp('url-administration') as string);
                }}>
              <UserAdmin />
              <Text>{t('administration')}</Text>
            </MenuItem>
          </>
        }
        <Text margin={ { top: 'medium' } }>{tApp('title.long')}</Text>
        <Anchor target='_blank' href={ state.appInformation?.homepageUrl }>{ state.appInformation?.homepageUrl }</Anchor>
        <Text margin={ { top: 'medium' } }>Version { state.appInformation!.version }</Text>
      </Grid>);
    
}

export { Menu };
