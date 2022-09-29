import { Box, Button, Header, Heading, Image } from "grommet";
import { Menu as MenuIcon } from 'grommet-icons';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../../AppContext';
import useResponsiveScreen from '../../utils/responsiveUtils';

const AppHeader = () => {
  
  const { isPhone } = useResponsiveScreen();
  const { state, showMenu } = useAppContext();
  const { t } = useTranslation(state.title);
  const navigate = useNavigate();

  const toogleMenu = () => showMenu(!state.showMenu);
  
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
                  margin='small'
                  level='2'>{t('title.short')}</Heading>
            ) : (
              <Heading
                  margin='small'
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
                    onClick={toogleMenu} />
              </Box>
            : <></>
      }
    </Header>
  );
        
}

export { AppHeader };
