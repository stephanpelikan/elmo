import { Box, Button, Header, Heading, Image } from "grommet";
import { Menu as MenuIcon } from 'grommet-icons';
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../../AppContext';
import useResponsiveScreen from '../../utils/responsiveUtils';
import { ResponsiveMenu } from "./ResponsiveMenu";

const AppHeader = () => {
  
  const { isPhone } = useResponsiveScreen();
  const { state, showMenu } = useAppContext();
  const { t } = useTranslation(state.title);
  const navigate = useNavigate();

  const stateShowMenuRef = useRef(state.showMenu);
  stateShowMenuRef.current = state.showMenu;

  const toggleMenu = () => {
      if (stateShowMenuRef.current) return;
      showMenu(!state.showMenu);
    };
  
  return (
    <Header
        tag='header'
        background={ state.intern ? 'accent-3' : 'brand' }
        elevation='medium'
        height='xxsmall'
        pad='xxsmall'
        style={{ zIndex: '1' }}>
      <Box
          onClick={() => navigate('/')}
          focusIndicator={false}
          direction='row'
          fill='vertical'
          align='center'>
        <Box
            fill='vertical'
            width={{ max: '3.5rem' }}>
          <Image
              src='/assets/logo192.png'
              fit='contain' />
        </Box>
        {
          isPhone ? (
              <Heading
                  margin={ { horizontal: 'small', vertical: 'none' } }
                  level='2'>{t('title.short')}</Heading>
            ) : (
              <Heading
                  margin={ { horizontal: 'small', vertical: 'none' } }
                  level='3'>{t('title.long')}</Heading>
            )
        }
      </Box>
      {
        state.currentUser
            ? <Box>
                <Button
                    plain
                    focusIndicator={false}
                    margin='small'
                    icon={<MenuIcon />}
                    onMouseDown={toggleMenu}
                    style={ { position: 'relative' } } />
                <ResponsiveMenu />
              </Box>
            : <></>
      }
    </Header>
  );
        
}

export { AppHeader };
