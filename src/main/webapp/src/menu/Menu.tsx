import React from 'react';
import CurrentUser from './CurrentUser';
import AppContext from '../AppContext';

type MenuProps = {};

const Menu: React.FC<MenuProps> = (): JSX.Element => {
  return (
    <AppContext.Consumer>
      {
        ({ currentUser }) => (
          <>
            {
              currentUser
                ? <CurrentUser user={currentUser} />
                : <></>
            }
          </>
        )
      }
    </AppContext.Consumer>
  );
}

export default Menu;
