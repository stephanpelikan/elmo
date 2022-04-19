import React from 'react';
import User from './User';
import { useAppContext, setShowMenu } from '../../AppContext';
import { Grid, Text } from 'grommet';
import { Logout, UserAdmin } from 'grommet-icons';
import { MenuItem } from './MenuItem';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { Role } from '../../client/gui';
import { useNavigate } from 'react-router-dom';

i18n.addResources('en', 'menu', {
      "logout": "Logout",
      "administration": "Administration",
    });
i18n.addResources('de', 'menu', {
      "logout": "Abmelden",
      "administration": "Verwaltung",
    });

const Menu = () => {
  const { state, dispatch } = useAppContext();

  const hideMenu = () => {
    setShowMenu(dispatch, false);
  };

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
              onClick={() => document.location.href = '/logout'}>
            <Logout />
            <Text>{t('logout')}</Text>
          </MenuItem>
          <MenuItem
              roles={[ Role.Admin ]}
              onClick={() => {
                hideMenu();
                navigate(tApp('url-administration'));
              }}>
            <UserAdmin />
            <Text>{t('administration')}</Text>
          </MenuItem>
        </>
      }
    </Grid>;
}

export { Menu };