import React from 'react';
import User from './User';
import { useAppContext } from '../../AppContext';
import { Grid, Text } from 'grommet';
import { Logout, UserAdmin } from 'grommet-icons';
import { MenuItem } from './MenuItem';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

i18n.addResources('en', 'menu', {
      "logout": "Logout",
      "administration": "Administration",
    });
i18n.addResources('de', 'menu', {
      "logout": "Abmelden",
      "administration": "Verwaltung",
    });

const Menu = () => {
  const { state } = useAppContext();
  
  const { t } = useTranslation('menu');

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
          <MenuItem onClick={() => console.log('JUHU')}>
            <UserAdmin />
            <Text>{t('administration')}</Text>
          </MenuItem>
        </>
      }
    </Grid>;
}

export { Menu };
