import { Box, Button, Header, Heading, Image, ResponsiveContext } from "grommet";
import { Menu as MenuIcon } from 'grommet-icons';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from '../../AppContext';

const AppHeader = () => {
  
  const { state, showMenu } = useAppContext();

  const { t, i18n } = useTranslation(state.title);
  
  const navigate = useNavigate();
  
  // see https://github.com/i18next/react-i18next/issues/1064
  useEffect(() => {
    //Manually emitting a languageChanged-Event would work around this problem
    i18n.emit("languageChanged");
  }, [ state.title, i18n ]);
  
  const toogleMenu = () => showMenu(!state.showMenu);
  
  return (
    <Header
        tag='header'
        background='brand'
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
        <ResponsiveContext.Consumer>
        {
          size => (
            size === 'small' ? (
              <Heading
                  margin='small'
                  level='2'>{t('title.short')}</Heading>
            ) : (
              <Heading
                  margin='small'
                  level='3'>{t('title.long')}</Heading>
            )
          )
        }
        </ResponsiveContext.Consumer>
      </Box>
      <Box>
        <Button
            plain
            focusIndicator={false}
            margin='small'
            icon={<MenuIcon />}
            onClick={toogleMenu} />
      </Box>
    </Header>
  );
        
}

export { AppHeader };
