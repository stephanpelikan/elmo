import React from 'react';
import User from './User';
import { useAppContext } from '../../AppContext';
import { Anchor, Grid, Text } from 'grommet';
import { Logout, UserAdmin, UserSettings } from 'grommet-icons';
import { MenuItem } from './MenuItem';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Role } from '../../client/gui';
import { useNavigate } from 'react-router-dom';

i18n.addResources('en', 'menu', {
      "logout": "Logout",
      "user profile": "User profile",
      "administration": "Administration",
    });
i18n.addResources('de', 'menu', {
      "logout": "Abmelden",
      "user profile": "Benutzerprofil",
      "administration": "Verwaltung",
    });

const Menu = () => {
  const { state, showMenu } = useAppContext();

  const hideMenu = () => showMenu(false);

  const navigate = useNavigate();
  
  const { t } = useTranslation('menu');
  const { t: tApp } = useTranslation('app');

  return <Grid pad="small" gap="small">
      {
        state.currentUser === null ? '' :
        <>
          <User
              user={ state.currentUser } />
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
    </Grid>;
}

export { Menu };
